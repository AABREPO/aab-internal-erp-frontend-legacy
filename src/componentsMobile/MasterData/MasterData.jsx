import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import MasterDataHeader from './MasterDataHeader';
import Sidebar from '../Bars/Sidebar';
import editblack from '../Images/Vector.svg';
import Save from '../Images/Save.svg';
import BottomNav from '../ProjectAdvance/BottomNav';
import editIcon from '../Images/Edit.svg';
import editIconHistory from '../Images/edit1.png';
import deleteIcon from '../Images/delete.png';
import AccountQrCodeImage from '../../Components/Images/AAB_QR_CODE.jpeg';
import MasterDataCopyButton from '../../Components/MasterData/MasterDataCopyButton';
import UpDownFilter from '../Images/FilterDown.svg'
import FilterUp from '../Images/FilterUp.svg'
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import SideArrow from '../Images/chevron-down (1).svg'
import Share from '../Images/Mask group.svg'
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const masterDataItems = [
  'Project Name',
  'Vendor Name',
  'Contractor Name',
  'Categories',
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

const PROJECT_TYPE_OPTIONS = ['Home', 'Shop', 'Office', 'Other'];
const FLOOR_NAME_OPTIONS = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor', 'Other'];
const EB_PHASE_OPTIONS = ['1 Phase', '3 Phase'];
const BRANCH_OPTIONS = ['Madurai', 'Srivilliputtur'];
const EMPTY_PROJECT_PROPERTY = {
  projectType: '',
  floorName: '',
  shopNo: '',
  doorNo: '',
  area: '',
  ebNo: '',
  ebNoPhase: '1 Phase',
  propertyTaxNo: '',
  waterTaxNo: ''
};

const MasterData = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const canEditMasterData = useMemo(() => {
    const roles = Array.isArray(user?.userRoles) ? user.userRoles : [];
    const candidateStrings = [
      ...roles.map((r) => {
        if (typeof r === 'string') return r;
        if (r && typeof r === 'object') {
          return (
            r?.roleName ||
            r?.role_name ||
            r?.name ||
            r?.role ||
            r?.userRole ||
            r?.user_role ||
            r?.role?.roleName ||
            r?.role?.name ||
            JSON.stringify(r)
          );
        }
        return String(r ?? '');
      }),
      user?.roleName,
      user?.role_name,
      user?.role,
      user?.userRole,
      user?.user_role
    ].filter(Boolean);

    const normalized = candidateStrings.map((s) => String(s).toLowerCase().replace(/[^a-z]/g, ''));
    return normalized.some((s) => s === 'superadmin' || s.includes('superadmin') || s === 'admin' || (s.includes('admin') && !s.includes('subadmin')));
  }, [user]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('master-data');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectNameCategoryFilter, setProjectNameCategoryFilter] = useState('All');
  const [employeeIdToNameMap, setEmployeeIdToNameMap] = useState({});
  const [listData, setListData] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [itemSearch, setItemSearch] = useState('');
  const [masterTableSortReversed, setMasterTableSortReversed] = useState(false);
  const [uploadFileRowShowsSaveIcon, setUploadFileRowShowsSaveIcon] = useState(false);
  const [hasFormChanges, setHasFormChanges] = useState(false);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);
  const listDataCacheRef = useRef({});
  const [swipedProjectId, setSwipedProjectId] = useState(null);
  const [expandedBankDetailsSection, setExpandedBankDetailsSection] = useState('bank-name');
  const [expandedBankFormSection, setExpandedBankFormSection] = useState('bank-form-image');
  const [bankDetailsSortReversed, setBankDetailsSortReversed] = useState(false);
  const [bankAccountTypes, setBankAccountTypes] = useState([]);
  const [isBankTypesLoading, setIsBankTypesLoading] = useState(false);
  const [isBankNameFormOpen, setIsBankNameFormOpen] = useState(false);
  const [bankNameFormMode, setBankNameFormMode] = useState('new');
  const [bankNameForm, setBankNameForm] = useState({ bankName: '' });
  const [isBankTypeFormOpen, setIsBankTypeFormOpen] = useState(false);
  const [bankTypeFormMode, setBankTypeFormMode] = useState('new');
  const [bankTypeForm, setBankTypeForm] = useState({ accountType: '' });

  useEffect(() => {
    // Used to resolve IDs like `siteEngineerId` -> employee name in Project Name view.
    const fetchEmployeeIdToName = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/employee_details/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = response.ok ? await response.json() : [];
        const rows = Array.isArray(data) ? data : [];
        const map = {};
        rows.forEach((emp) => {
          const id = emp?.id ?? emp?.employeeId ?? emp?.employee_id;
          const name = emp?.employee_name ?? emp?.employeeName ?? emp?.name;
          if (id == null) return;
          const key = String(id);
          if (String(name || '').trim()) map[key] = String(name).trim();
        });
        setEmployeeIdToNameMap(map);
      } catch (err) {
        console.error('Error fetching employee details for ID mapping:', err);
        setEmployeeIdToNameMap({});
      }
    };
    fetchEmployeeIdToName();
  }, []);
  const [isBankLocationFormOpen, setIsBankLocationFormOpen] = useState(false);
  const [bankLocationFormMode, setBankLocationFormMode] = useState('new');
  const [bankLocationForm, setBankLocationForm] = useState({ branchName: '' });

  const dataUrlToBlob = (dataUrl) => {
    if (!dataUrl || typeof dataUrl !== 'string') return null;
    const s = dataUrl.trim();
    if (!s.startsWith('data:')) return null;
    const commaIdx = s.indexOf(',');
    if (commaIdx < 0) return null;
    const meta = s.slice(0, commaIdx);
    const base64 = s.slice(commaIdx + 1);
    const match = meta.match(/^data:([^;]+);base64$/i);
    const mime = match?.[1] || 'application/octet-stream';
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    } catch {
      return null;
    }
  };

  const submitVendorToBackend = async () => {
    let qrCodeUrl = '';
    if (vendorQrFile) {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-');
      const safeVendorName = String(vendorForm.vendorName || 'Vendor').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'Vendor';
      const finalName = `${timestamp}_${safeVendorName}_Vendor_QR`;
      qrCodeUrl = await uploadMasterDataFileAndGetUrl(vendorQrFile, finalName);
      setVendorForm((s) => ({ ...s, qrCode: qrCodeUrl }));
      setVendorQrPreview(qrCodeUrl);
    } else if (typeof vendorForm.qrCode === 'string' && vendorForm.qrCode.startsWith('http')) {
      qrCodeUrl = vendorForm.qrCode;
    }

    let vendorProfileUrl = '';
    if (vendorPictureFile) {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-');
      const safeVendorName = String(vendorForm.vendorName || 'Vendor').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'Vendor';
      const finalName = `${timestamp}_${safeVendorName}_Vendor_Profile`;
      vendorProfileUrl = await uploadMasterDataFileAndGetUrl(vendorPictureFile, finalName);
      setVendorForm((s) => ({ ...s, vendorPicture: vendorProfileUrl }));
    } else if (typeof vendorForm.vendorPicture === 'string' && vendorForm.vendorPicture.startsWith('http')) {
      vendorProfileUrl = vendorForm.vendorPicture;
    }

    const vendorData = {
      vendorName: vendorForm.vendorName,
      account_holder_name: vendorForm.accountHolderName || '',
      account_number: vendorForm.accountNumber || '',
      bank_name: vendorForm.bankName || '',
      ifsc_code: vendorForm.ifscCode || '',
      branch: vendorForm.branch || '',
      gpay_number: vendorForm.upiPhoneNumber || '',
      upi_id: vendorForm.upiId || '',
      contact_number: vendorForm.contactNumber || '',
      contact_email: vendorForm.emailId || '',
      category: vendorForm.vendorCategory || '',
      reference_name: vendorForm.referenceName || '',
      vendor_address: vendorForm.vendorAddress || '',
      location: vendorForm.latitudeLongitude || vendorForm.location || '',
      vendor_branch: vendorForm.location || vendorForm.branch || '',
      upi_qr_image: null,
      upi_qr_image_url: qrCodeUrl || '',
      vendor_profile_url: vendorProfileUrl || ''
    };

    const formData = new FormData();
    formData.append('vendor', new Blob([JSON.stringify(vendorData)], { type: 'application/json' }));

    const isEdit = vendorFormMode === 'edit' && String(vendorForm.vendorId || '').trim() !== '';
    const url = isEdit
      ? `https://backendaab.in/demoAabuilderDash/api/vendor_Names/edit/${vendorForm.vendorId}`
      : 'https://backendaab.in/demoAabuilderDash/api/vendor_Names/save';

    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      credentials: 'include',
      body: formData
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(msg || `Request failed (${res.status})`);
    }
  };

  const submitContractorToBackend = async () => {
    let qrCodeUrl = '';
    if (contractorQrFile) {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-');
      const safeContractorName = String(contractorForm.contractorName || 'Contractor').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'Contractor';
      const finalName = `${timestamp}_${safeContractorName}_Contractor_QR`;
      qrCodeUrl = await uploadMasterDataFileAndGetUrl(contractorQrFile, finalName);
      setContractorForm((s) => ({ ...s, qrCode: qrCodeUrl }));
      setContractorQrPreview(qrCodeUrl);
    } else if (typeof contractorForm.qrCode === 'string' && contractorForm.qrCode.startsWith('http')) {
      qrCodeUrl = contractorForm.qrCode;
    }

    let contractorProfileUrl = '';
    if (contractorPictureFile) {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-');
      const safeContractorName = String(contractorForm.contractorName || 'Contractor').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'Contractor';
      const finalName = `${timestamp}_${safeContractorName}_Contractor_Profile`;
      contractorProfileUrl = await uploadMasterDataFileAndGetUrl(contractorPictureFile, finalName);
      setContractorForm((s) => ({ ...s, contractorProfileUrl }));
    } else if (typeof contractorForm.contractorProfileUrl === 'string' && contractorForm.contractorProfileUrl.startsWith('http')) {
      contractorProfileUrl = contractorForm.contractorProfileUrl;
    }

    const contractorData = {
      contractorName: contractorForm.contractorName,
      account_holder_name: contractorForm.accountHolderName || '',
      account_number: contractorForm.accountNumber || '',
      bank_name: contractorForm.bankName || '',
      branch: contractorForm.branch || '',
      ifsc_code: contractorForm.ifscCode || '',
      gpay_number: contractorForm.upiPhoneNumber || '',
      upi_id: contractorForm.upiId || '',
      contact_number: contractorForm.contractorNumber || contractorForm.contactNumber || '',
      contact_email: contractorForm.emailId || '',
      category: contractorForm.contractorCategory || '',
      reference_name: contractorForm.referenceName || '',
      contractor_address: contractorForm.contractorAddress || '',
      location: contractorForm.location || '',
      contractor_branch: contractorForm.branch || '',
      upi_qr_image: null,
      upi_qr_image_url: qrCodeUrl || '',
      contractor_profile_url: contractorProfileUrl || ''
    };

    const formData = new FormData();
    formData.append('contractor', new Blob([JSON.stringify(contractorData)], { type: 'application/json' }));

    const isEdit = contractorFormMode === 'edit' && String(contractorForm.contractorId || '').trim() !== '';
    const url = isEdit
      ? `https://backendaab.in/demoAabuilderDash/api/contractor_Names/edit/${contractorForm.contractorId}`
      : 'https://backendaab.in/demoAabuilderDash/api/contractor_Names/save';

    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      credentials: 'include',
      body: formData
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(msg || `Request failed (${res.status})`);
    }
  };

  const submitCategoryToBackend = async () => {
    const isEdit = categoryFormMode === 'edit' && String(categoryForm.categoryId || '').trim() !== '';
    const url = isEdit
      ? `https://backendaab.in/demoAabuilderDash/api/expenses_categories/update/${categoryForm.categoryId}`
      : 'https://backendaab.in/demoAabuilderDash/api/expenses_categories/save';

    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: categoryForm.categoryName || '' })
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(msg || `Request failed (${res.status})`);
    }
  };

  const submitMachineToBackend = async () => {
    const isEdit = machineFormMode === 'edit' && String(machineForm.machineId || '').trim() !== '';
    const url = isEdit
      ? `https://backendaab.in/demoAabuilderDash/api/machine_tools/update/${machineForm.machineId}`
      : 'https://backendaab.in/demoAabuilderDash/api/machine_tools/save';

    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ machineTool: machineForm.machineName || '' })
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(msg || `Request failed (${res.status})`);
    }
  };

  const submitEmployeeToBackend = async () => {
    let employeeProfileUrl = '';
    if (typeof employeeImage === 'string' && employeeImage.startsWith('data:')) {
      const profileBlob = dataUrlToBlob(employeeImage);
      if (profileBlob) {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const safeEmployeeName = String(employeeForm.employeeName || 'Employee').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'Employee';
        const finalName = `${timestamp}_${safeEmployeeName}_Employee_Profile`;

        employeeProfileUrl = await uploadMasterDataFileAndGetUrl(profileBlob, finalName);
      }
    } else if (typeof employeeImage === 'string' && employeeImage.startsWith('http')) {
      employeeProfileUrl = employeeImage;
    }

    let upiQrImageUrl = '';
    if (typeof employeeForm.qrCode === 'string' && employeeForm.qrCode.startsWith('data:')) {
      const qrBlob = dataUrlToBlob(employeeForm.qrCode);
      if (qrBlob) {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const safeEmployeeName = String(employeeForm.employeeName || 'Employee').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'Employee';
        const finalName = `${timestamp}_${safeEmployeeName}_Employee_QR`;
        upiQrImageUrl = await uploadMasterDataFileAndGetUrl(qrBlob, finalName);
      }
    } else if (typeof employeeForm.qrCode === 'string' && employeeForm.qrCode.startsWith('http')) {
      upiQrImageUrl = employeeForm.qrCode;
    }

    let aadhaarImageUrl = employeeForm.aadhaarImageUrl || '';
    if (employeeAadhaarFile) {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-');
      const safeEmployeeName = String(employeeForm.employeeName || 'Employee').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'Employee';
      const finalName = `${timestamp}_${safeEmployeeName}_Aadhaar`;
      aadhaarImageUrl = await uploadMasterDataFileAndGetUrl(employeeAadhaarFile, finalName);
    }

    const employeeDetails = {
      employee_name: employeeForm.employeeName || '',
      employee_id: employeeForm.employeeId || '',
      employee_mobile_number: employeeForm.mobileNumber || '',
      role_of_employee: employeeForm.designation || '',
      account_holder_name: employeeForm.accountHolderName || '',
      account_number: employeeForm.accountNumber || '',
      bank_name: employeeForm.bankName || '',
      ifsc_code: employeeForm.ifscCode || '',
      branch: employeeForm.branch || '',
      upi_id: employeeForm.upiId || '',
      gpay_number: employeeForm.upiPhoneNumber || '',
      contact_email: employeeForm.emailId || '',
      aadhaar_image_url: aadhaarImageUrl || '',
      is_site_engineer: String(employeeForm.designation || '').trim().toLowerCase() === 'site engineer',
      user_name: employeeForm.userName || '',
      employeeProfileUrl: employeeProfileUrl || '',
      employeeAddress: employeeForm.employeeAddress || '',
      location: employeeForm.location || '',
      upiQrImageUrl: upiQrImageUrl || ''
    };

    const formData = new FormData();
    formData.append('employeeDetails', new Blob([JSON.stringify(employeeDetails)], { type: 'application/json' }));

    const isEdit = employeeFormMode === 'edit' && String(employeeForm.employeeDbId || '').trim() !== '';
    const url = isEdit
      ? `https://backendaab.in/demoAabuildersDash/api/employee_details/edit/${employeeForm.employeeDbId}`
      : 'https://backendaab.in/demoAabuildersDash/api/employee_details/save';

    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      credentials: 'include',
      body: formData
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(msg || `Request failed (${res.status})`);
    }
  };

  const uploadMasterDataFileAndGetUrl = async (selectedFile, finalName) => {
    const formData = new FormData();

    let fileToSend = selectedFile;

    // ✅ FIX STARTS HERE
    const extension = selectedFile.type?.split("/")[1] || "jpg";

    // remove dots from filename
    const safeFinalName = finalName.replace(/\./g, "_");

    // convert Blob → File with proper name
    if (!(selectedFile instanceof File)) {
      fileToSend = new File(
        [selectedFile],
        `${safeFinalName}.${extension}`,
        { type: selectedFile.type || "image/jpeg" }
      );
    } else {
      // even if it's already a File, clean the name
      fileToSend = new File(
        [selectedFile],
        `${safeFinalName}.${extension}`,
        { type: selectedFile.type }
      );
    }
    // ✅ FIX ENDS HERE

    formData.append("files", fileToSend);  // 👈 USE UPDATED FILE
    formData.append("folder", "FileUpload/Master_Data_Files");
    formData.append("fileName", safeFinalName);

    const uploadResponse = await fetch("https://backendaab.in/demoAabuildersDash/api/files/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error("File upload failed");
    }

    const result = await uploadResponse.json();
    const uploadedUrl = Array.isArray(result?.urls) ? result.urls[0] : '';

    if (!uploadedUrl) {
      throw new Error("File upload URL missing");
    }

    return uploadedUrl;
  };

  const buildProjectPayload = (qrCodeUrlOverride) => {
    const owner = {
      clientName: projectForm.clientName || '',
      fatherName: projectForm.fatherName || '',
      mobile: projectForm.mobileNumber || '',
      age: projectForm.age || '',
      emailId: projectForm.emailId || '',
      clientAddress: projectForm.clientAddress || ''
    };

    const rawPropertyDetails = Array.isArray(projectPropertyDetails) && projectPropertyDetails.length > 0
      ? projectPropertyDetails
      : [addOnBillForm];
    const propertyDetailsPayload = rawPropertyDetails.map((detail) => ({
      projectType: detail?.projectType || '',
      floorName: detail?.floorName || '',
      shopNo: detail?.shopNo || '',
      doorNo: detail?.doorNo || '',
      area: detail?.area || '',
      ebNo: detail?.ebNo || '',
      ebNoPhase: detail?.ebNoPhase || '1 Phase',
      ebNoFrequency: '',
      propertyTaxNo: detail?.propertyTaxNo || '',
      propertyTaxFrequency: '',
      waterTaxNo: detail?.waterTaxNo || '',
      waterTaxFrequency: ''
    })).filter((detail) =>
      Boolean(
        detail.projectType ||
        detail.floorName ||
        detail.shopNo ||
        detail.doorNo ||
        detail.area ||
        detail.ebNo ||
        detail.propertyTaxNo ||
        detail.waterTaxNo
      )
    );

    const account = {
      accountHolderName: projectForm.accountHolderName || '',
      accountNumber: projectForm.accountNumber || '',
      nameOfTheBank: projectForm.bankName || '',
      branchOfTheBank: projectForm.accountBranch || '',
      ifscCode: projectForm.ifscCode || '',
      upiPhoneNumber: projectForm.upiPhoneNumber || '',
      upiId: projectForm.upiId || '',
      qrCodeUrl: (qrCodeUrlOverride ?? projectForm.qrCode) || ''
    };

    return {
      projectName: projectForm.projectName || '',
      projectAddress: projectForm.projectAddress || '',
      projectId: projectForm.projectId || '',
      projectCategory: projectForm.projectCategory || '',
      projectReferenceName: projectForm.referenceName || '',
      branch: projectForm.branch || '',
      location: projectForm.latitudeLongitude || '',
      isHide: false,
      ownerDetails: [owner],
      propertyDetails: propertyDetailsPayload,
      accountDetails: [account]
    };
  };

  const syncProjectNameMasterApi = async ({ projectName, projectId, branch, projectDbId }) => {
    const siteNamePayload = {
      siteName: projectName || '',
      siteNo: projectId || '',
      branch: branch || ''
    };

    const projectNamesRes = await fetch('https://backendaab.in/demoAabuilderDash/api/project_Names/getAll', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    const projectNames = projectNamesRes.ok ? await projectNamesRes.json() : [];
    const normalizedList = Array.isArray(projectNames) ? projectNames : [];
    const existingBySiteNo = normalizedList.find(
      (site) => String(site?.siteNo ?? '') === String(projectId ?? '')
    );
    const existingById = normalizedList.find(
      (site) => String(site?.id ?? '') === String(projectDbId ?? '')
    );
    const existingSiteName = existingById || existingBySiteNo;

    if (existingSiteName?.id) {
      const editRes = await fetch(`https://backendaab.in/demoAabuilderDash/api/project_Names/edit/${existingSiteName.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteNamePayload),
      });
      if (!editRes.ok) {
        const editMsg = await editRes.text().catch(() => '');
        throw new Error(editMsg || `project_Names edit failed (${editRes.status})`);
      }
      return;
    }

    const saveRes = await fetch('https://backendaab.in/demoAabuilderDash/api/project_Names/save', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteNamePayload),
    });
    if (!saveRes.ok) {
      const saveMsg = await saveRes.text().catch(() => '');
      throw new Error(saveMsg || `project_Names save failed (${saveRes.status})`);
    }
  };

  const submitProjectToBackend = async () => {
    let qrCodeUrl = projectForm.qrCode || '';
    const isDataUrl = typeof qrCodeUrl === 'string' && qrCodeUrl.startsWith('data:');
    if (isDataUrl) {
      const qrBlob = dataUrlToBlob(qrCodeUrl);
      if (qrBlob) {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const safeProjectName = String(projectForm.projectName || 'Project').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'Project';
        const finalName = `${timestamp}_${safeProjectName}_QR`;
        qrCodeUrl = await uploadMasterDataFileAndGetUrl(qrBlob, finalName);
        setProjectForm((s) => ({ ...s, qrCode: qrCodeUrl }));
        setProjectQrPreview(qrCodeUrl);
      }
    }

    const isEdit = projectFormMode === 'edit' && String(projectForm.projectDbId || '').trim() !== '';
    const url = isEdit
      ? `https://backendaab.in/demoAabuilderDash/api/projects/edit/${projectForm.projectDbId}`
      : 'https://backendaab.in/demoAabuilderDash/api/projects/save';

    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildProjectPayload(qrCodeUrl))
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(msg || `Request failed (${res.status})`);
    }

    try {
      await syncProjectNameMasterApi({
        projectName: projectForm.projectName,
        projectId: projectForm.projectId,
        branch: projectForm.branch,
        projectDbId: projectForm.projectDbId
      });
    } catch (syncError) {
      console.error('Error syncing with Project Names:', syncError);
    }
  };

  const fetchProjectsData = async () => {
    const response = await fetch('https://backendaab.in/demoAabuilderDash/api/projects/getAll', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    const data = await response.json();
    setProjects(Array.isArray(data) ? data : []);
  };

  const handleHeaderSubmit = async () => {
    try {
      if (selectedItem === 'Project Name' && isAddProjectViewOpen && projectFormMode === 'edit' && isProjectViewOnly) return;
      if (selectedItem === 'Vendor Name' && isAddVendorViewOpen && vendorFormMode === 'edit' && isVendorViewOnly) return;
      if (
        (selectedItem === 'Contractor Name' || selectedItem === 'Support Associate Name') &&
        isAddContractorViewOpen &&
        contractorFormMode === 'edit' &&
        isContractorViewOnly
      ) return;
      if (selectedItem === 'Categories' && isAddCategoryViewOpen && categoryFormMode === 'edit' && isCategoryViewOnly) return;
      if (selectedItem === 'Machine tools' && isAddMachineViewOpen && machineFormMode === 'edit' && isMachineViewOnly) return;
      if (isHeaderActionDisabled) return;

      const validationMessage = getActiveFormValidationMessage();
      if (validationMessage) {
        alert(validationMessage);
        return;
      }

      if (selectedItem === 'Project Name' && isAddProjectViewOpen) {
        await submitProjectToBackend();
        await fetchProjectsData();
        setUploadFileRowShowsSaveIcon(false);
        setIsProjectViewOnly(true);
        setIsAddProjectViewOpen(false);
        setSelectedItem(null);
        return;
      }
      if (selectedItem === 'Vendor Name' && isAddVendorViewOpen) {
        await submitVendorToBackend();
        setUploadFileRowShowsSaveIcon(false);
        setVendorQrFile(null);
        setVendorPictureFile(null);
        setIsVendorViewOnly(true);
        setIsAddVendorViewOpen(false);
        setSelectedItem(null);
        return;
      }
      if ((selectedItem === 'Contractor Name' || selectedItem === 'Support Associate Name') && isAddContractorViewOpen) {
        await submitContractorToBackend();
        setUploadFileRowShowsSaveIcon(false);
        setContractorQrFile(null);
        setContractorPictureFile(null);
        setIsContractorViewOnly(true);
        setIsAddContractorViewOpen(false);
        setSelectedItem(null);
        return;
      }
      if (selectedItem === 'Categories' && isAddCategoryViewOpen) {
        await submitCategoryToBackend();
        setUploadFileRowShowsSaveIcon(false);
        setIsCategoryViewOnly(true);
        setIsAddCategoryViewOpen(false);
        setSelectedItem(null);
        return;
      }
      if (selectedItem === 'Machine tools' && isAddMachineViewOpen) {
        await submitMachineToBackend();
        setUploadFileRowShowsSaveIcon(false);
        setIsMachineViewOnly(true);
        setIsAddMachineViewOpen(false);
        setSelectedItem(null);
        return;
      }
      if (selectedItem === 'Employee Details' && isAddEmployeeViewOpen) {
        await submitEmployeeToBackend();
        setUploadFileRowShowsSaveIcon(false);
        setIsEmployeeViewOnly(true);
        setIsAddEmployeeViewOpen(false);
        setSelectedItem(null);
        return;
      }
    } catch (e) {
      alert(e?.message || 'Failed to save');
    }
  };

  const getListApiUrl = (item) => {
    switch (item) {
      case 'Vendor Name':
        return 'https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll';
      case 'Contractor Name':
        return 'https://backendaab.in/demoAabuilderDash/api/contractor_Names/getAll';
      case 'Categories':
        return 'https://backendaab.in/demoAabuilderDash/api/expenses_categories/getAll';
      case 'Machine tools':
        return 'https://backendaab.in/demoAabuilderDash/api/machine_tools/getAll';
      case 'Employee Details':
        return 'https://backendaab.in/demoAabuildersDash/api/employee_details/getAll';
      case 'Company Labour':
        return 'https://backendaab.in/demoAabuildersDash/api/labours-details/getAll';
      case 'Account Details':
      case 'Bank Details':
        return 'https://backendaab.in/demoAabuildersDash/api/account-details/getAll';
      case 'Support Associate Name':
        return 'https://backendaab.in/demoAabuildersDash/api/support_staff/getAll';
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
        return item.account_number || item.accountNumber || '';
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
  const [isProjectViewOnly, setIsProjectViewOnly] = useState(false);
  const [expandedProjectSection, setExpandedProjectSection] = useState('project-details');
  const [projectFormMode, setProjectFormMode] = useState('new');
  const [isProjectPictureModalOpen, setIsProjectPictureModalOpen] = useState(false);
  const [isProjectLocationSheetOpen, setIsProjectLocationSheetOpen] = useState(false);
  const [isProjectQrModalOpen, setIsProjectQrModalOpen] = useState(false);
  const [isProjectCategoryModalOpen, setIsProjectCategoryModalOpen] = useState(false);
  const [isProjectBranchModalOpen, setIsProjectBranchModalOpen] = useState(false);
  const [isProjectTypeModalOpen, setIsProjectTypeModalOpen] = useState(false);
  const [isProjectFloorNameModalOpen, setIsProjectFloorNameModalOpen] = useState(false);
  const [isProjectEbPhaseModalOpen, setIsProjectEbPhaseModalOpen] = useState(false);
  const [isProjectNameCategoryFilterModalOpen, setIsProjectNameCategoryFilterModalOpen] = useState(false);
  const [projectQrPreview, setProjectQrPreview] = useState('');
  const [projectPictureDraft, setProjectPictureDraft] = useState('');
  const [projectInformationSearch, setProjectInformationSearch] = useState('');
  const [addOnBillForm, setAddOnBillForm] = useState({ ...EMPTY_PROJECT_PROPERTY });
  const [projectPropertyDetails, setProjectPropertyDetails] = useState([]);
  const [projectInformationDeleteConfirmIndex, setProjectInformationDeleteConfirmIndex] = useState(null);
  const [editingProjectPropertyIndex, setEditingProjectPropertyIndex] = useState(null);
  const [projectForm, setProjectForm] = useState({
    projectDbId: '',
    projectName: '',
    projectId: '',
    projectCategory: '',
    referenceName: '',
    branch: '',
    projectAddress: '',
    latitudeLongitude: '',
    siteEngineerName: '',
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
    upiId: '',
    projectPicture: ''
  });
  const [isProjectSiteEngineerModalOpen, setIsProjectSiteEngineerModalOpen] = useState(false);
  const [projectSiteEngineerOptions, setProjectSiteEngineerOptions] = useState([]);
  const projectSiteEngineerSelectRef = useRef(null);
  const [isAddOnSheetOpen, setIsAddOnSheetOpen] = useState(false);
  const [isAddVendorViewOpen, setIsAddVendorViewOpen] = useState(false);
  const [isVendorViewOnly, setIsVendorViewOnly] = useState(false);
  const [expandedVendorSection, setExpandedVendorSection] = useState('vendor-details');
  const [isVendorQrModalOpen, setIsVendorQrModalOpen] = useState(false);
  const [isVendorCategoryModalOpen, setIsVendorCategoryModalOpen] = useState(false);
  const [isVendorLocationSheetOpen, setIsVendorLocationSheetOpen] = useState(false);
  const [isVendorPictureModalOpen, setIsVendorPictureModalOpen] = useState(false);
  const [vendorPictureDraft, setVendorPictureDraft] = useState('');
  const [vendorQrPreview, setVendorQrPreview] = useState('');
  const [vendorQrFile, setVendorQrFile] = useState(null);
  const [vendorPictureFile, setVendorPictureFile] = useState(null);
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
    latitudeLongitude: '',
    location: '',
    accountHolderName: '',
    qrCode: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    upiPhoneNumber: '',
    upiId: '',
    vendorPicture: ''
  });
  const [isAddContractorViewOpen, setIsAddContractorViewOpen] = useState(false);
  const [isContractorViewOnly, setIsContractorViewOnly] = useState(false);
  const [expandedContractorSection, setExpandedContractorSection] = useState('contractor-details');
  const [isContractorQrModalOpen, setIsContractorQrModalOpen] = useState(false);
  const [isContractorCategoryModalOpen, setIsContractorCategoryModalOpen] = useState(false);
  const [isContractorPictureModalOpen, setIsContractorPictureModalOpen] = useState(false);
  const [contractorPictureDraft, setContractorPictureDraft] = useState('');
  const [contractorQrPreview, setContractorQrPreview] = useState('');
  const [contractorQrFile, setContractorQrFile] = useState(null);
  const [contractorPictureFile, setContractorPictureFile] = useState(null);
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
    upiId: '',
    contractorProfileUrl: ''
  });
  const [isAddCategoryViewOpen, setIsAddCategoryViewOpen] = useState(false);
  const [isCategoryViewOnly, setIsCategoryViewOnly] = useState(false);
  const [expandedCategorySection, setExpandedCategorySection] = useState('category-details');
  const [categoryFormMode, setCategoryFormMode] = useState('new');
  const [categoryForm, setCategoryForm] = useState({ categoryId: '', categoryName: '' });
  const [isAddMachineViewOpen, setIsAddMachineViewOpen] = useState(false);
  const [isMachineViewOnly, setIsMachineViewOnly] = useState(false);
  const [expandedMachineSection, setExpandedMachineSection] = useState('machine-details');
  const [machineFormMode, setMachineFormMode] = useState('new');
  const [machineForm, setMachineForm] = useState({ machineId: '', machineName: '' });
  const [isAddEmployeeViewOpen, setIsAddEmployeeViewOpen] = useState(false);
  const [isEmployeeViewOnly, setIsEmployeeViewOnly] = useState(false);
  const [expandedEmployeeSection, setExpandedEmployeeSection] = useState('employee-details');
  const [isEmployeeQrModalOpen, setIsEmployeeQrModalOpen] = useState(false);
  const [employeeQrPreview, setEmployeeQrPreview] = useState('');
  const [isEmployeeAadhaarModalOpen, setIsEmployeeAadhaarModalOpen] = useState(false);
  const [employeeAadhaarFile, setEmployeeAadhaarFile] = useState(null);
  const [employeeFormMode, setEmployeeFormMode] = useState('new');
  const [employeeForm, setEmployeeForm] = useState({
    employeeDbId: '',
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
    upiId: '',
    aadhaarImageUrl: ''
  });
  const [isAddLabourViewOpen, setIsAddLabourViewOpen] = useState(false);
  const [isLabourViewOnly, setIsLabourViewOnly] = useState(false);
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
  const [isAccountViewOnly, setIsAccountViewOnly] = useState(false);
  const [expandedAccountSection, setExpandedAccountSection] = useState('account-details');
  const [isAccountQrModalOpen, setIsAccountQrModalOpen] = useState(false);
  const [accountQrPreview, setAccountQrPreview] = useState('');
  const [isAccountDetailsPreviewOpen, setIsAccountDetailsPreviewOpen] = useState(false);
  const [accountDetailsPreview, setAccountDetailsPreview] = useState(null);
  const [isAccountBankNameModalOpen, setIsAccountBankNameModalOpen] = useState(false);
  const [isAccountDetailsBranchModalOpen, setIsAccountDetailsBranchModalOpen] = useState(false);
  const accountDetailsBranchModalRef = useRef({ setForm: null, branchKey: 'branch', selectionReadOnly: false });
  const [accountDetailsBranchModalSelected, setAccountDetailsBranchModalSelected] = useState('');
  const [accountBankNameOptions, setAccountBankNameOptions] = useState([]);
  const accountBankNameSelectRef = useRef(null);
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
  const [bankNameImage, setBankNameImage] = useState('');
  const [bankTypeImage, setBankTypeImage] = useState('');
  const [bankLocationImage, setBankLocationImage] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [machineImage, setMachineImage] = useState('');
  const [employeeImage, setEmployeeImage] = useState('');
  const [labourImage, setLabourImage] = useState('');
  const [accountImage, setAccountImage] = useState('');

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return masterDataItems;
    return masterDataItems.filter((item) => item.toLowerCase().includes(query));
  }, [search]);

  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();
    const base = query
      ? projects.filter((project) =>
        (project.projectName || '').toLowerCase().includes(query) ||
        (project.projectAddress || '').toLowerCase().includes(query) ||
        (project.projectId || '').toLowerCase().includes(query)
      )
      : projects;

    const selectedFilter = String(projectNameCategoryFilter || 'All').trim();
    if (!selectedFilter || selectedFilter === 'All') return base;

    const normalizeCategory = (raw) => String(raw || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const desired =
      selectedFilter === 'Client'
        ? 'client'
        : selectedFilter === 'Owen'
          ? 'own'
          : normalizeCategory(selectedFilter);

    return base.filter((project) => {
      const raw = project?.projectCategory ?? project?.project_category ?? '';
      const normalized = normalizeCategory(raw);
      if (desired === 'client') return normalized.includes('client');
      if (desired === 'own') return normalized.includes('own');
      return normalized.includes(desired);
    });
  }, [projectSearch, projects, projectNameCategoryFilter]);

  const filteredList = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    if (!query) return listData;

    return listData.filter((item) => {
      const primary = getItemPrimaryText(item, selectedItem).toLowerCase();
      const secondary = getItemSecondaryText(item, selectedItem).toLowerCase();
      return primary.includes(query) || secondary.includes(query);
    });
  }, [itemSearch, listData, selectedItem]);

  const displayedProjects = useMemo(() => {
    if (!masterTableSortReversed) return filteredProjects;
    return [...filteredProjects].reverse();
  }, [filteredProjects, masterTableSortReversed]);

  const displayedList = useMemo(() => {
    if (!masterTableSortReversed) return filteredList;
    return [...filteredList].reverse();
  }, [filteredList, masterTableSortReversed]);

  const listSerialNumberByRowId = useMemo(() => {
    const map = new Map();
    filteredList.forEach((row, idx) => {
      map.set(getListRowId(row, idx), idx + 1);
    });
    return map;
  }, [filteredList]);

  const uniqueStringOptions = useCallback((values) => {
    const arr = Array.isArray(values) ? values : [];
    return Array.from(
      new Set(
        arr
          .map((v) => (typeof v === 'string' ? v.trim() : String(v ?? '').trim()))
          .filter(Boolean)
      )
    );
  }, []);

  const getBankNameFromRow = useCallback((row) => row?.bank_name || row?.bankName || '', []);

  const extractBankNameOptions = useCallback(
    (rows) => uniqueStringOptions((Array.isArray(rows) ? rows : []).map((row) => getBankNameFromRow(row))),
    [getBankNameFromRow, uniqueStringOptions]
  );

  const openAccountBankNameModal = useCallback(
    async (onSelect) => {
      accountBankNameSelectRef.current = onSelect;
      const localOptions = extractBankNameOptions(
        Array.isArray(listDataCacheRef.current?.['Bank Details']) ? listDataCacheRef.current['Bank Details'] : []
      );

      if (localOptions.length > 0) {
        setAccountBankNameOptions(localOptions);
        setIsAccountBankNameModalOpen(true);
        return;
      }

      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/account-details/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch bank names');
        }
        const data = await response.json();
        const rows = Array.isArray(data) ? data : [];
        listDataCacheRef.current['Bank Details'] = rows;
        setAccountBankNameOptions(extractBankNameOptions(rows));
      } catch (error) {
        console.error('Error fetching bank name options:', error);
        setAccountBankNameOptions([]);
      } finally {
        setIsAccountBankNameModalOpen(true);
      }
    },
    [extractBankNameOptions]
  );

  const openAccountDetailsBranchModal = useCallback((setForm, branchKey, currentValue, selectionReadOnly) => {
    if (Boolean(selectionReadOnly)) return;
    accountDetailsBranchModalRef.current = { setForm, branchKey, selectionReadOnly: Boolean(selectionReadOnly) };
    setAccountDetailsBranchModalSelected(String(currentValue ?? '').trim());
    setIsAccountDetailsBranchModalOpen(true);
  }, []);

  const vendorNameOptions = useMemo(() => {
    if (selectedItem !== 'Vendor Name') return [];
    return uniqueStringOptions((Array.isArray(listData) ? listData : []).map((row) => getItemPrimaryText(row, 'Vendor Name')));
  }, [listData, selectedItem, uniqueStringOptions]);

  const vendorCategoryOptions = useMemo(() => {
    if (selectedItem !== 'Vendor Name') return [];
    return uniqueStringOptions(
      (Array.isArray(expenseCategories) ? expenseCategories : []).map(
        (row) => row?.category || row?.categoryName || row?.category_name || ''
      )
    );
  }, [expenseCategories, selectedItem, uniqueStringOptions]);

  const contractorNameOptions = useMemo(() => {
    if (selectedItem !== 'Contractor Name' && selectedItem !== 'Support Associate Name') return [];
    return uniqueStringOptions(
      (Array.isArray(listData) ? listData : []).map((row) => getItemPrimaryText(row, selectedItem))
    );
  }, [listData, selectedItem, uniqueStringOptions]);

  const contractorCategoryOptions = useMemo(() => {
    if (selectedItem !== 'Contractor Name' && selectedItem !== 'Support Associate Name') return [];
    return uniqueStringOptions(
      (Array.isArray(expenseCategories) ? expenseCategories : []).map(
        (row) => row?.category || row?.categoryName || row?.category_name || ''
      )
    );
  }, [expenseCategories, selectedItem, uniqueStringOptions]);

  const commonBranchOptions = useMemo(() => {
    const fromProjects = (Array.isArray(projects) ? projects : []).map((p) => p?.branch || p?.branch_name || '');
    const fromList = (Array.isArray(listData) ? listData : []).map((row) => row?.branch || row?.branch_name || '');
    return uniqueStringOptions([...fromProjects, ...fromList]);
  }, [projects, listData, uniqueStringOptions]);

  const employeeNameOptions = useMemo(() => {
    if (selectedItem !== 'Employee Details') return [];
    return uniqueStringOptions((Array.isArray(listData) ? listData : []).map((row) => getItemPrimaryText(row, 'Employee Details')));
  }, [listData, selectedItem, uniqueStringOptions]);

  const employeeDesignationOptions = useMemo(() => {
    if (selectedItem !== 'Employee Details') return [];
    return uniqueStringOptions(
      (Array.isArray(listData) ? listData : []).map((row) => row?.designation || row?.roleOfEmployee || row?.role_of_employee || row?.role || '')
    );
  }, [listData, selectedItem, uniqueStringOptions]);

  const employeeMobileOptions = useMemo(() => {
    if (selectedItem !== 'Employee Details') return [];
    return uniqueStringOptions(
      (Array.isArray(listData) ? listData : []).map((row) => row?.mobileNumber || row?.mobile_number || row?.contactNumber || row?.contact_number || '')
    );
  }, [listData, selectedItem, uniqueStringOptions]);

  const labourNameOptions = useMemo(() => {
    if (selectedItem !== 'Company Labour') return [];
    return uniqueStringOptions((Array.isArray(listData) ? listData : []).map((row) => getItemPrimaryText(row, 'Company Labour')));
  }, [listData, selectedItem, uniqueStringOptions]);

  const labourCategoryOptions = useMemo(() => {
    if (selectedItem !== 'Company Labour') return [];
    return uniqueStringOptions(
      (Array.isArray(listData) ? listData : []).map((row) => row?.labourCategory || row?.labour_category || row?.category || '')
    );
  }, [listData, selectedItem, uniqueStringOptions]);

  const hasProjectInformationData = useMemo(
    () => Array.isArray(projectPropertyDetails) && projectPropertyDetails.length > 0,
    [projectPropertyDetails]
  );

  const projectInformationPreview = useMemo(() => {
    const clean = (v) => String(v ?? '').trim();
    return (Array.isArray(projectPropertyDetails) ? projectPropertyDetails : []).map((detail, index) => {
      const shopNo = clean(detail?.shopNo);
      const doorNo = clean(detail?.doorNo);
      const area = clean(detail?.area);
      const projectType = clean(detail?.projectType);
      const floorName = clean(detail?.floorName);
      const ebNo = clean(detail?.ebNo);
      const ebNoPhase = clean(detail?.ebNoPhase);
      const propertyTaxNo = clean(detail?.propertyTaxNo);
      const waterTaxNo = clean(detail?.waterTaxNo);
      const serial = String(index + 1).padStart(2, '0');
      const searchText = [
        serial,
        doorNo,
        area,
        projectType,
        shopNo,
        floorName,
        propertyTaxNo,
        ebNo,
        ebNoPhase,
        waterTaxNo
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return {
        sourceIndex: index,
        searchText,
        row1Left: `SL - ${serial} - ${doorNo || '-'}`,
        row1Right: area ? `${area} Sqft` : '-',
        row2Left: projectType || '-',
        row2Right: shopNo ? `Sh.No ${shopNo}` : '-',
        row3Left: floorName || '-',
        row3Right: propertyTaxNo ? `PT ${propertyTaxNo}` : '-',
        row4Left: [ebNo, ebNoPhase].filter(Boolean).join(', ') || '-',
        row4Right: waterTaxNo ? `WT ${waterTaxNo}` : '-'
      };
    });
  }, [projectPropertyDetails]);

  const filteredProjectInformationPreview = useMemo(() => {
    const query = String(projectInformationSearch || '').trim().toLowerCase();
    if (!query) return projectInformationPreview;
    return projectInformationPreview.filter((preview) => String(preview?.searchText || '').includes(query));
  }, [projectInformationPreview, projectInformationSearch]);

  useEffect(() => {
    setMasterTableSortReversed(false);
  }, [selectedItem]);

  useEffect(() => {
    setUploadFileRowShowsSaveIcon(false);
  }, [
    selectedItem,
    isBankNameFormOpen,
    isBankTypeFormOpen,
    isBankLocationFormOpen,
    isAddProjectViewOpen,
    isAddVendorViewOpen,
    isAddAccountViewOpen,
    bankNameFormMode,
    bankTypeFormMode,
    bankLocationFormMode,
    projectFormMode,
    vendorFormMode,
    contractorFormMode,
    categoryFormMode,
    machineFormMode,
    employeeFormMode,
    labourFormMode,
    accountFormMode
  ]);

  useEffect(() => {
    const shouldEnableDirectEdit =
      (isBankNameFormOpen && bankNameFormMode === 'edit') ||
      (isBankTypeFormOpen && bankTypeFormMode === 'edit') ||
      (isBankLocationFormOpen && bankLocationFormMode === 'edit') ||
      (isAddProjectViewOpen && projectFormMode === 'edit' && !isProjectViewOnly) ||
      (isAddVendorViewOpen && vendorFormMode === 'edit' && !isVendorViewOnly) ||
      (isAddContractorViewOpen && contractorFormMode === 'edit' && !isContractorViewOnly) ||
      (isAddCategoryViewOpen && categoryFormMode === 'edit' && !isCategoryViewOnly) ||
      (isAddMachineViewOpen && machineFormMode === 'edit' && !isMachineViewOnly) ||
      (isAddEmployeeViewOpen && employeeFormMode === 'edit' && !isEmployeeViewOnly) ||
      (isAddAccountViewOpen && accountFormMode === 'edit' && !isAccountViewOnly) ||
      (isAddLabourViewOpen && labourFormMode === 'edit' && !isLabourViewOnly);

    if (shouldEnableDirectEdit && !uploadFileRowShowsSaveIcon) {
      setUploadFileRowShowsSaveIcon(true);
    }
  }, [
    isBankNameFormOpen,
    bankNameFormMode,
    isBankTypeFormOpen,
    bankTypeFormMode,
    isBankLocationFormOpen,
    bankLocationFormMode,
    isAddProjectViewOpen,
    projectFormMode,
    isProjectViewOnly,
    isAddVendorViewOpen,
    vendorFormMode,
    isVendorViewOnly,
    isAddContractorViewOpen,
    contractorFormMode,
    isContractorViewOnly,
    isAddCategoryViewOpen,
    categoryFormMode,
    isCategoryViewOnly,
    isAddMachineViewOpen,
    machineFormMode,
    isMachineViewOnly,
    isAddEmployeeViewOpen,
    employeeFormMode,
    isEmployeeViewOnly,
    isAddAccountViewOpen,
    accountFormMode,
    isAccountViewOnly,
    isAddLabourViewOpen,
    labourFormMode,
    isLabourViewOnly,
    uploadFileRowShowsSaveIcon
  ]);

  useEffect(() => {
    if (projectFormMode === 'new') setExpandedProjectSection('project-image');
    if (vendorFormMode === 'new') setExpandedVendorSection('vendor-image');
    if (contractorFormMode === 'new') setExpandedContractorSection('contractor-image');
    if (categoryFormMode === 'new') setExpandedCategorySection('category-image');
    if (machineFormMode === 'new') setExpandedMachineSection('machine-image');
    if (employeeFormMode === 'new') setExpandedEmployeeSection('employee-image');
    if (accountFormMode === 'new') setExpandedAccountSection('account-image');
    if (labourFormMode === 'new') setExpandedLabourSection('labour-image');
  }, [
    projectFormMode,
    vendorFormMode,
    contractorFormMode,
    categoryFormMode,
    machineFormMode,
    employeeFormMode,
    accountFormMode,
    labourFormMode
  ]);

  useEffect(() => {
    if (selectedItem !== 'Project Name' || !isAddProjectViewOpen) {
      setIsProjectViewOnly(false);
    }
  }, [selectedItem, isAddProjectViewOpen]);

  useEffect(() => {
    if (selectedItem !== 'Vendor Name' || !isAddVendorViewOpen) setIsVendorViewOnly(false);
    if ((selectedItem !== 'Contractor Name' && selectedItem !== 'Support Associate Name') || !isAddContractorViewOpen)
      setIsContractorViewOnly(false);
    if (selectedItem !== 'Categories' || !isAddCategoryViewOpen) setIsCategoryViewOnly(false);
    if (selectedItem !== 'Machine tools' || !isAddMachineViewOpen) setIsMachineViewOnly(false);
    if (selectedItem !== 'Employee Details' || !isAddEmployeeViewOpen) setIsEmployeeViewOnly(false);
    if (selectedItem !== 'Company Labour' || !isAddLabourViewOpen) setIsLabourViewOnly(false);
    if (selectedItem !== 'Account Details' || !isAddAccountViewOpen) setIsAccountViewOnly(false);
  }, [
    selectedItem,
    isAddVendorViewOpen,
    isAddContractorViewOpen,
    isAddCategoryViewOpen,
    isAddMachineViewOpen,
    isAddEmployeeViewOpen,
    isAddLabourViewOpen,
    isAddAccountViewOpen
  ]);

  useEffect(() => {
    if (!isAccountDetailsPreviewOpen) {
      setAccountDetailsPreview(null);
    }
  }, [isAccountDetailsPreviewOpen]);

  useEffect(() => {
    setBankDetailsSortReversed(false);
  }, [expandedBankDetailsSection, selectedItem]);

  useEffect(() => {
    if (isBankNameFormOpen || isBankTypeFormOpen || isBankLocationFormOpen) {
      setExpandedBankFormSection('bank-form-image');
    }
  }, [isBankNameFormOpen, isBankTypeFormOpen, isBankLocationFormOpen]);

  useEffect(() => {
    if (selectedItem !== 'Project Name') {
      return;
    }

    let isMounted = true;

    const fetchProjects = async () => {
      setIsProjectsLoading(true);

      try {
        const response = await fetch('https://backendaab.in/demoAabuilderDash/api/projects/getAll');
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
    let isMounted = true;
    const fetchExpenseCategories = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuilderDash/api/expenses_categories/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch expense categories');
        }
        const data = await response.json();
        if (isMounted) {
          setExpenseCategories(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching expense categories:', error);
        if (isMounted) {
          setExpenseCategories([]);
        }
      }
    };

    fetchExpenseCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedItem || selectedItem === 'Project Name') {
      return;
    }

    const apiUrl = getListApiUrl(selectedItem);
    if (!apiUrl) {
      setListData([]);
      return;
    }

    const cached = listDataCacheRef.current?.[selectedItem];
    if (Array.isArray(cached) && cached.length > 0) {
      setListData(cached);
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
          const next = Array.isArray(data) ? data : [];
          listDataCacheRef.current[selectedItem] = next;
          setListData(next);
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
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/bank_type/getAll');
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

  useEffect(() => {
    setSwipedProjectId(null);
  }, [
    currentPage,
    selectedItem,
    isAddProjectViewOpen,
    isAddVendorViewOpen,
    isAddContractorViewOpen,
    isAddCategoryViewOpen,
    isAddMachineViewOpen,
    isAddEmployeeViewOpen,
    isAddAccountViewOpen,
    isAddLabourViewOpen,
    isBankNameFormOpen,
    isBankTypeFormOpen,
    isBankLocationFormOpen
  ]);

  useEffect(() => {
    setHasFormChanges(false);
  }, [
    selectedItem,
    isAddProjectViewOpen,
    isAddVendorViewOpen,
    isAddContractorViewOpen,
    isAddCategoryViewOpen,
    isAddMachineViewOpen,
    isAddEmployeeViewOpen,
    isAddAccountViewOpen,
    isAddLabourViewOpen,
    isBankNameFormOpen,
    isBankTypeFormOpen,
    isBankLocationFormOpen,
    projectFormMode,
    vendorFormMode,
    contractorFormMode,
    categoryFormMode,
    machineFormMode,
    employeeFormMode,
    accountFormMode,
    labourFormMode,
    isProjectViewOnly,
    isVendorViewOnly,
    isContractorViewOnly,
    isCategoryViewOnly,
    isMachineViewOnly,
    isEmployeeViewOnly,
    isAccountViewOnly,
    isLabourViewOnly
  ]);

  const normalizeProjectForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';
    const owner = Array.isArray(item?.ownerDetails) ? item.ownerDetails[0] || {} : {};
    const property = Array.isArray(item?.propertyDetails) ? item.propertyDetails[0] || {} : {};
    const account = Array.isArray(item?.accountDetails) ? item.accountDetails[0] || {} : {};

    const resolveEngineerLabel = (value) => {
      const raw = String(value ?? '').trim();
      if (!raw) return '';
      if (/^\d+$/.test(raw)) {
        return employeeIdToNameMap[raw] || raw;
      }
      return raw;
    };

    return {
      projectDbId: valueOr(item?.id, item?.projectDbId),
      projectName: valueOr(item?.projectName, item?.project_name, item?.name),
      projectId: valueOr(item?.projectId, item?.project_id),
      projectCategory: valueOr(item?.projectCategory, item?.project_category),
      referenceName: valueOr(item?.projectReferenceName, item?.project_reference_name, item?.referenceName, item?.reference_name),
      branch: valueOr(item?.branch, item?.branch_name),
      projectAddress: valueOr(item?.projectAddress, item?.project_address, item?.address),
      latitudeLongitude: valueOr(item?.location, item?.latitudeLongitude, item?.latitude_longitude, item?.latLong, item?.lat_long),
      siteEngineerName: resolveEngineerLabel(
        valueOr(
          item?.siteEngineerName,
          item?.site_engineer_name,
          item?.siteEngineer,
          item?.site_engineer,
          item?.siteEngineerId,
          item?.site_engineer_id
        )
      ),
      clientName: valueOr(owner?.clientName, owner?.client_name, item?.clientName, item?.client_name),
      fatherName: valueOr(owner?.fatherName, owner?.father_name, item?.fatherName, item?.father_name),
      mobileNumber: valueOr(owner?.mobile, owner?.mobileNumber, owner?.mobile_number, item?.mobileNumber, item?.mobile_number),
      age: valueOr(owner?.age, item?.age),
      emailId: valueOr(owner?.emailId, owner?.email_id, item?.emailId, item?.email_id),
      clientAddress: valueOr(owner?.clientAddress, owner?.client_address, item?.clientAddress, item?.client_address),
      accountHolderName: valueOr(account?.accountHolderName, account?.account_holder_name, item?.accountHolderName, item?.account_holder_name),
      qrCode: valueOr(account?.qrCodeUrl, account?.qr_code_url, item?.qrCode, item?.qr_code, item?.qrImagePreview, item?.qr_image_preview),
      accountNumber: valueOr(account?.accountNumber, account?.account_number, item?.accountNumber, item?.account_number),
      bankName: valueOr(account?.nameOfTheBank, account?.name_of_the_bank, account?.bankName, account?.bank_name, item?.bankName, item?.bank_name),
      ifscCode: valueOr(account?.ifscCode, account?.ifsc_code, item?.ifscCode, item?.ifsc_code),
      accountBranch: valueOr(account?.branchOfTheBank, account?.branch_of_the_bank, account?.accountBranch, account?.account_branch, item?.accountBranch, item?.account_branch, item?.branch),
      upiPhoneNumber: valueOr(account?.upiPhoneNumber, account?.upi_phone_number, item?.upiPhoneNumber, item?.upi_phone_number, item?.gpayNumber, item?.gpay_number),
      upiId: valueOr(account?.upiId, account?.upi_id, item?.upiId, item?.upi_id),
      projectPicture: valueOr(item?.projectPicture, item?.project_picture, item?.projectImage, item?.project_image)
    };
  };

  const openProjectSiteEngineerModal = useCallback(
    async (onSelect) => {
      projectSiteEngineerSelectRef.current = typeof onSelect === 'function' ? onSelect : null;
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/employee_details/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = response.ok ? await response.json() : [];
        const rows = Array.isArray(data) ? data : [];
        const options = rows
          .filter((emp) => {
            const byFlag = emp?.is_site_engineer === true || emp?.isSiteEngineer === true;
            const designation = String(emp?.designation || emp?.roleOfEmployee || emp?.role_of_employee || '').trim().toLowerCase();
            return byFlag || designation === 'site engineer';
          })
          .map((emp) => {
            const label = emp?.employee_name ?? emp?.employeeName ?? emp?.name ?? '';
            return String(label || '').trim();
          })
          .filter(Boolean);
        setProjectSiteEngineerOptions(Array.from(new Set(options)).sort((a, b) => a.localeCompare(b)));
      } catch (error) {
        console.error('Error fetching site engineer options:', error);
        setProjectSiteEngineerOptions([]);
      } finally {
        setIsProjectSiteEngineerModalOpen(true);
      }
    },
    []
  );

  const normalizeProjectPropertyForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';
    const details = Array.isArray(item?.propertyDetails) ? item.propertyDetails : [];
    const normalized = details.map((property) => ({
      projectType: valueOr(property?.projectType, property?.project_type),
      floorName: valueOr(property?.floorName, property?.floor_name),
      shopNo: valueOr(property?.shopNo, property?.shop_no),
      doorNo: valueOr(property?.doorNo, property?.door_no),
      area: valueOr(property?.area),
      ebNo: valueOr(property?.ebNo, property?.eb_no),
      ebNoPhase: valueOr(property?.ebNoPhase, property?.eb_no_phase, '1 Phase'),
      propertyTaxNo: valueOr(property?.propertyTaxNo, property?.property_tax_no),
      waterTaxNo: valueOr(property?.waterTaxNo, property?.water_tax_no)
    }));
    return normalized;
  };

  const openProjectInformationAddSheet = () => {
    if (!isProjectOptionSelectionEnabled) return;
    setEditingProjectPropertyIndex(null);
    setAddOnBillForm({ ...EMPTY_PROJECT_PROPERTY });
    setIsAddOnSheetOpen(true);
  };

  const openProjectInformationEditSheet = (index) => {
    if (!canEditMasterData) return;
    const current = Array.isArray(projectPropertyDetails) ? projectPropertyDetails[index] : null;
    if (!current) return;
    if (isProjectViewOnly) {
      setIsProjectViewOnly(false);
      setUploadFileRowShowsSaveIcon(true);
    }
    setEditingProjectPropertyIndex(index);
    setAddOnBillForm({
      ...EMPTY_PROJECT_PROPERTY,
      ...current
    });
    setIsAddOnSheetOpen(true);
    setSwipedProjectId(null);
  };

  const handleProjectInformationDelete = (index) => {
    if (!isProjectOptionSelectionEnabled) return;
    setProjectPropertyDetails((prev) => prev.filter((_, idx) => idx !== index));
    setHasFormChanges(true);
    setSwipedProjectId(null);
  };

  const handleProjectInformationSubmit = () => {
    if (!isProjectOptionSelectionEnabled) return;
    const clean = (v) => String(v ?? '').trim();
    const normalized = {
      projectType: clean(addOnBillForm.projectType),
      floorName: clean(addOnBillForm.floorName),
      shopNo: clean(addOnBillForm.shopNo),
      doorNo: clean(addOnBillForm.doorNo),
      area: clean(addOnBillForm.area),
      ebNo: clean(addOnBillForm.ebNo),
      ebNoPhase: clean(addOnBillForm.ebNoPhase) || '1 Phase',
      propertyTaxNo: clean(addOnBillForm.propertyTaxNo),
      waterTaxNo: clean(addOnBillForm.waterTaxNo)
    };
    const hasAnyValue = Object.entries(normalized).some(([key, value]) => key === 'ebNoPhase' ? false : Boolean(value));
    if (!hasAnyValue) {
      setIsAddOnSheetOpen(false);
      return;
    }
    setProjectPropertyDetails((prev) => {
      if (editingProjectPropertyIndex === null || editingProjectPropertyIndex === undefined) {
        return [...prev, normalized];
      }
      return prev.map((item, idx) => (idx === editingProjectPropertyIndex ? normalized : item));
    });
    setHasFormChanges(true);
    setEditingProjectPropertyIndex(null);
    setAddOnBillForm({ ...EMPTY_PROJECT_PROPERTY });
    setIsAddOnSheetOpen(false);
  };

  useEffect(() => {
    setIsAddVendorViewOpen(false);
    setExpandedVendorSection('vendor-image');
    setIsVendorQrModalOpen(false);
    setVendorQrPreview('');
    setVendorQrFile(null);
    setVendorPictureFile(null);
    setVendorFormMode('new');
    setIsAddContractorViewOpen(false);
    setExpandedContractorSection('contractor-image');
    setIsContractorQrModalOpen(false);
    setIsContractorPictureModalOpen(false);
    setContractorPictureDraft('');
    setContractorQrPreview('');
    setContractorQrFile(null);
    setContractorPictureFile(null);
    setContractorFormMode('new');
    setIsAddCategoryViewOpen(false);
    setExpandedCategorySection('category-image');
    setCategoryFormMode('new');
    setCategoryForm({ categoryId: '', categoryName: '' });
    setIsAddMachineViewOpen(false);
    setExpandedMachineSection('machine-image');
    setMachineFormMode('new');
    setMachineForm({ machineId: '', machineName: '' });
    setIsAddEmployeeViewOpen(false);
    setExpandedEmployeeSection('employee-image');
    setIsEmployeeQrModalOpen(false);
    setEmployeeQrPreview('');
    setIsEmployeeAadhaarModalOpen(false);
    setEmployeeAadhaarFile(null);
    setEmployeeFormMode('new');
    setEmployeeForm({
      employeeDbId: '',
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
      upiId: '',
      aadhaarImageUrl: ''
    });
    setIsAddLabourViewOpen(false);
    setExpandedLabourSection('labour-image');
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
    setExpandedAccountSection('account-image');
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
    setBankNameImage('');
    setBankTypeImage('');
    setBankLocationImage('');
    setCategoryImage('');
    setMachineImage('');
    setEmployeeImage('');
    setLabourImage('');
    setAccountImage('');
  }, [selectedItem]);

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${Math.max(1, Math.round(kb))} KB`;
  };

  const generateNextProjectId = () => {
    if (!Array.isArray(projects) || projects.length === 0) return '1';
    const projectIds = projects
      .map((project) => project?.projectId)
      .filter((projectId) => projectId && projectId.toString().trim() !== '')
      .map((projectId) => {
        const numericMatch = projectId.toString().match(/\d+/);
        return numericMatch ? parseInt(numericMatch[0], 10) : null;
      })
      .filter((num) => num !== null && !Number.isNaN(num));
    if (projectIds.length === 0) return '1';
    return String(Math.max(...projectIds) + 1);
  };

  const normalizeVendorForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';

    const qrCode = valueOr(
      item?.upiQrImageUrl,
      item?.upi_qr_image_url,
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
      latitudeLongitude: valueOr(
        item?.latitudeLongitude,
        item?.latitude_longitude,
        item?.latLong,
        item?.lat_long
      ),
      location: valueOr(item?.location, item?.branchLocation, item?.branch_location),
      accountHolderName: valueOr(item?.accountHolderName, item?.account_holder_name, item?.vendorAccountHolderName, item?.vendor_account_holder_name),
      qrCode,
      accountNumber: valueOr(item?.accountNumber, item?.account_number, item?.vendorAccountNumber, item?.vendor_account_number),
      bankName: valueOr(item?.bankName, item?.bank_name, item?.vendorBankName, item?.vendor_bank_name),
      ifscCode: valueOr(item?.ifscCode, item?.ifsc_code, item?.vendorIfscCode, item?.vendor_ifsc_code),
      upiPhoneNumber: valueOr(item?.upiPhoneNumber, item?.upi_phone_number, item?.gpayNumber, item?.gpay_number, item?.vendorGpayNumber, item?.vendor_gpay_number),
      upiId: valueOr(item?.upiId, item?.upi_id, item?.vendorUpiId, item?.vendor_upi_id),
      vendorPicture: valueOr(
        item?.vendorProfileUrl,
        item?.vendor_profile_url,
        item?.vendorPicture,
        item?.vendor_picture,
        item?.vendorImage,
        item?.vendor_image,
        item?.picture,
        item?.photo
      )
    };
  };

  const normalizeContractorForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';

    const qrCode = valueOr(
      item?.upiQrImageUrl,
      item?.upi_qr_image_url,
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
      upiId: valueOr(item?.upiId, item?.upi_id, item?.contractorUpiId, item?.contractor_upi_id),
      contractorProfileUrl: valueOr(item?.contractorProfileUrl, item?.contractor_profile_url)
    };
  };

  const normalizeCategoryForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';
    return {
      categoryId: valueOr(item?.id, item?._id, item?.categoryId, item?.category_id),
      categoryName: valueOr(item?.category, item?.categoryName, item?.category_name, item?.expensesCategory, item?.name, item?.value)
    };
  };

  const normalizeMachineForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';
    return {
      machineId: valueOr(item?.id, item?._id, item?.machineId, item?.machine_id),
      machineName: valueOr(item?.machineTool, item?.machine_tool, item?.tool_name, item?.name, item?.value)
    };
  };

  const normalizeEmployeeForForm = (item) => {
    const valueOr = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') || '';

    const qrCode = valueOr(
      item?.qrCode,
      item?.qr_code,
      item?.upiQrImageUrl,
      item?.upi_qr_image_url,
      item?.qrImagePreview,
      item?.qr_image_preview,
      item?.empUpiQRImagePreview,
      item?.emp_upi_qr_image_preview,
      item?.employeeQrImagePreview,
      item?.employee_qr_image_preview
    );

    return {
      employeeDbId: valueOr(item?.id, item?._id),
      employeeName: valueOr(item?.employeeName, item?.employee_name, item?.name),
      employeeId: valueOr(item?.employeeId, item?.employee_id, item?.id),
      designation: valueOr(item?.designation, item?.roleOfEmployee, item?.role_of_employee),
      userName: valueOr(item?.userName, item?.user_name, item?.username),
      mobileNumber: valueOr(item?.mobileNumber, item?.mobile_number, item?.employeeMobileNumber, item?.employee_mobile_number, item?.contactNumber, item?.contact_number),
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
      upiId: valueOr(item?.upiId, item?.upi_id, item?.empUpiId, item?.emp_upi_id),
      aadhaarImageUrl: valueOr(item?.aadhaarImageUrl, item?.aadhaar_image_url)
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

  const pickImageValue = (...vals) => vals.find((v) => typeof v === 'string' && v.trim() !== '') || '';

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
    setListData(listDataCacheRef.current?.[item] || []);
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

  const isFormInteractionEnabled = (formMode, isViewOnly) =>
    formMode !== 'edit' || (!isViewOnly && canEditMasterData && uploadFileRowShowsSaveIcon);

  const isVendorOptionSelectionEnabled = isFormInteractionEnabled(vendorFormMode, isVendorViewOnly);
  const isContractorOptionSelectionEnabled = isFormInteractionEnabled(contractorFormMode, isContractorViewOnly);
  const isProjectOptionSelectionEnabled = isFormInteractionEnabled(projectFormMode, isProjectViewOnly);

  const isFieldMandatory = useCallback((label, required) => {
    if (!required) return false;

    if (selectedItem === 'Project Name' && isAddProjectViewOpen) {
      return label === 'Project Name' || label === 'Project Category';
    }

    if (selectedItem === 'Vendor Name' && isAddVendorViewOpen) {
      return label === 'Vendor Name';
    }

    if ((selectedItem === 'Contractor Name' || selectedItem === 'Support Associate Name') && isAddContractorViewOpen) {
      return label === 'Contractor Name' || label === 'Associate Name';
    }

    if (selectedItem === 'Categories' && isAddCategoryViewOpen) {
      return label === 'Category Name';
    }

    if (selectedItem === 'Machine tools' && isAddMachineViewOpen) {
      return label === 'Machine Name';
    }

    if (selectedItem === 'Employee Details' && isAddEmployeeViewOpen) {
      return label === 'Employee Name';
    }

    if (selectedItem === 'Company Labour' && isAddLabourViewOpen) {
      return label === 'Labour Name';
    }

    if (selectedItem === 'Account Details' && isAddAccountViewOpen) {
      return label === 'Account Holder Name';
    }

    if (selectedItem === 'Bank Details' && isBankNameFormOpen) {
      return label === 'Bank Name';
    }

    if (selectedItem === 'Bank Details' && isBankTypeFormOpen) {
      return label === 'Account Type';
    }

    if (selectedItem === 'Bank Details' && isBankLocationFormOpen) {
      return label === 'Branch Name';
    }

    return required;
  }, [
    selectedItem,
    isAddProjectViewOpen,
    isAddVendorViewOpen,
    isAddContractorViewOpen,
    isAddCategoryViewOpen,
    isAddMachineViewOpen,
    isAddEmployeeViewOpen,
    isAddLabourViewOpen,
    isAddAccountViewOpen,
    isBankNameFormOpen,
    isBankTypeFormOpen,
    isBankLocationFormOpen
  ]);

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
    rightIconInteractive = false,
    copyButtonId,
    copyFieldName,
    copyButtonClassName,
    labelRight,
    listId,
    datalistOptions,
    asSelect = false,
    selectOptions,
    onClick,
    numericOnly = false
  }) => {
    const showRequired = isFieldMandatory(label, required);

    return (
      <div className="w-full">
        {labelRight ? (
          <div className="flex w-full items-center justify-between">
            <label className="block text-left text-[12px] font-medium text-black">
              {label}
              {showRequired && <span className="text-[#E26D47]">*</span>}
            </label>
            {labelRight}
          </div>
        ) : (
          <label className="block text-left text-[12px] font-medium text-black">
            {label}
            {showRequired && <span className="text-[#E26D47]">*</span>}
          </label>
        )}
        <div className="relative">
          {asSelect ? (
            <select
              value={value || ''}
              disabled={readOnly}
              onChange={(e) => {
                if (!onChange) return;
                setHasFormChanges(true);
                onChange(e);
              }}
              className={`h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0] ${copyButtonId || rightIcon ? 'pr-12' : ''
                }`}
            >
              <option value="">{placeholder || 'Select'}</option>
              {(Array.isArray(selectOptions) ? selectOptions : []).map((opt) => (
                <option key={String(opt)} value={String(opt)}>
                  {String(opt)}
                </option>
              ))}
            </select>
          ) : multiline ? (
            <textarea
              value={value || ''}
              readOnly={readOnly}
              onChange={(e) => {
                if (!onChange) return;
                setHasFormChanges(true);
                onChange(e);
              }}
              placeholder={placeholder}
              rows={3}
              className="w-full resize-none rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] py-[10px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
            />
          ) : (
            <input
              value={value || ''}
              readOnly={readOnly}
              onChange={(e) => {
                if (!onChange) return;
                setHasFormChanges(true);
                if (!numericOnly) {
                  onChange(e);
                  return;
                }
                const numericValue = String(e.target.value || '').replace(/\D+/g, '');
                onChange({
                  ...e,
                  target: { ...e.target, value: numericValue }
                });
              }}
              onClick={onClick}
              list={listId || undefined}
              inputMode={numericOnly ? 'numeric' : undefined}
              pattern={numericOnly ? '[0-9]*' : undefined}
              placeholder={placeholder}
              className={`h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0] ${copyButtonId || rightIcon ? 'pr-12' : ''
                } ${onClick ? 'cursor-pointer' : ''}`}
            />
          )}
          {!asSelect && listId && Array.isArray(datalistOptions) && datalistOptions.length > 0 && (
            <datalist id={listId}>
              {Array.from(new Set(datalistOptions.filter(Boolean))).map((opt) => (
                <option key={String(opt)} value={String(opt)} />
              ))}
            </datalist>
          )}
          {copyButtonId && (
            <MasterDataCopyButton text={value} fieldName={copyFieldName} buttonId={copyButtonId} className={copyButtonClassName} />
          )}
          {rightIcon && !copyButtonId &&
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
  };

  const renderAccountDetailsSection = ({
    form,
    formMode,
    isViewOnly,
    setForm,
    onOpenQr,
    qrButtonClassName = 'text-[12px] font-medium text-[#4B4B4B]',
    accountHolderPlaceholder = '',
    accountNumberPlaceholder = '',
    bankNameText,
    ifscPlaceholder = '',
    branchPlaceholder = '',
    upiPhonePlaceholder = '',
    upiIdPlaceholder = '',
    branchKey = 'branch',
    includeAccountType = false,
    accountTypePlaceholder = '',
    accountTypeKey = 'accountType',
    fieldReadOnly = false,
    copyPrefix,
    onOpenBankNamePicker,
    onOpenBranchModal
  }) => {
    const shouldShowCopy =
      formMode === 'edit' && (isViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon);
    const hasFieldValue = (value) => String(value ?? '').trim() !== '';
    const canOpenBranchModal = !fieldReadOnly && isFormInteractionEnabled(formMode, isViewOnly);
    const canOpenBankNameModal = !fieldReadOnly && isFormInteractionEnabled(formMode, isViewOnly);
    const isAccountHolderMandatory = isFieldMandatory('Account Holder Name', true);
    const isAccountNumberMandatory = isFieldMandatory('Account Number', true);

    return (
      <div className="space-y-[6px]">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <label className="block text-left text-[12px] font-medium text-black">
              Account Holder Name{isAccountHolderMandatory ? <span className="text-[#E26D47]">*</span> : null}
            </label>
            <button type="button" onClick={onOpenQr} className={qrButtonClassName}>
              QR Code
            </button>
          </div>
          <div className="relative">
            <input
              value={form.accountHolderName || ''}
              onChange={(e) => {
                setHasFormChanges(true);
                setForm((s) => ({ ...s, accountHolderName: e.target.value }));
              }}
              placeholder='Enter Name'
              readOnly={fieldReadOnly}
              className="h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] pr-12 text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
            />
            {shouldShowCopy && hasFieldValue(form.accountHolderName) ? (
              <MasterDataCopyButton
                text={form.accountHolderName}
                fieldName="Account Holder Name"
                buttonId={`${copyPrefix}-account-holder`}
                className="right-[4px]"
              />
            ) : null}
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between">
            <label className="block text-left text-[12px] font-medium text-black">
              Account Number{isAccountNumberMandatory ? <span className="text-[#E26D47]">*</span> : null}
            </label>
            <button
              type="button"
              onClick={() => {
                if (!canOpenBankNameModal) return;
                if (typeof onOpenBankNamePicker === 'function') {
                  onOpenBankNamePicker((value) => {
                    setHasFormChanges(true);
                    setForm((s) => ({ ...s, bankName: value || '' }));
                  });
                }
              }}
              disabled={fieldReadOnly || !canOpenBankNameModal}
              className="text-[12px] font-medium text-black disabled:opacity-100"
            >
              {form.bankName || bankNameText || 'Bank Name'}
            </button>
          </div>
          <div className="relative">
            <input
              value={form.accountNumber || ''}
              onChange={(e) => {
                setHasFormChanges(true);
                setForm((s) => ({ ...s, accountNumber: String(e.target.value || '').replace(/\D+/g, '') }));
              }}
              placeholder='Enter Number'
              readOnly={fieldReadOnly}
              inputMode="numeric"
              pattern="[0-9]*"
              className="h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] pr-12 text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
            />
            {shouldShowCopy && hasFieldValue(form.accountNumber) ? (
              <MasterDataCopyButton
                text={form.accountNumber}
                fieldName="Account Number"
                buttonId={`${copyPrefix}-account-number`}
                className="right-[4px]"
              />
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[12px]">
          {renderInput({
            label: 'IFSC Code',
            required: true,
            placeholder: 'Enter IFSC Code',
            value: form.ifscCode,
            readOnly: fieldReadOnly,
            onChange: (e) => setForm((s) => ({ ...s, ifscCode: e.target.value })),
            copyButtonId: shouldShowCopy && hasFieldValue(form.ifscCode) ? `${copyPrefix}-ifsc` : undefined,
            copyFieldName: 'IFSC Code',
            copyButtonClassName: 'right-[4px]'
          })}
          {typeof onOpenBranchModal === 'function'
            ? (
              renderInput({
                label: 'Branch',
                required: true,
                placeholder: 'Select',
                value: form[branchKey],
                readOnly: true,
                onClick: canOpenBranchModal ? () => onOpenBranchModal() : undefined,
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                rightIconInteractive: canOpenBranchModal,
                onRightIconClick: canOpenBranchModal ? () => onOpenBranchModal() : undefined,
                copyButtonId: shouldShowCopy && hasFieldValue(form[branchKey]) ? `${copyPrefix}-branch` : undefined,
                copyFieldName: 'Branch',
                copyButtonClassName: 'right-[4px]'
              })
            )
            : renderInput({
              label: 'Branch',
              required: true,
              placeholder: branchPlaceholder,
              value: form[branchKey],
              asSelect: true,
              selectOptions: ['Srivilliputhur', 'Madurai'],
              readOnly: fieldReadOnly,
              onChange: (e) => setForm((s) => ({ ...s, [branchKey]: e.target.value })),
              copyButtonId: shouldShowCopy && hasFieldValue(form[branchKey]) ? `${copyPrefix}-branch` : undefined,
              copyFieldName: 'Branch',
              copyButtonClassName: 'right-[4px]'
            })}
        </div>

        {includeAccountType
          ? renderInput({
            label: 'Account Type',
            required: true,
            placeholder: 'Select Account Type',
            value: form[accountTypeKey],
            readOnly: fieldReadOnly,
            onChange: (e) => setForm((s) => ({ ...s, [accountTypeKey]: e.target.value })),
            copyButtonId: shouldShowCopy && hasFieldValue(form[accountTypeKey]) ? `${copyPrefix}-type` : undefined,
            copyFieldName: 'Account Type',
            copyButtonClassName: 'right-[4px]'
          })
          : null}

        <div className="grid grid-cols-2 gap-[12px]">
          {renderInput({
            label: 'UPI Phone Number',
            required: true,
            placeholder: 'Enter Number',
            value: form.upiPhoneNumber,
            readOnly: fieldReadOnly,
            onChange: (e) => setForm((s) => ({ ...s, upiPhoneNumber: e.target.value })),
            numericOnly: true,
            copyButtonId: shouldShowCopy && hasFieldValue(form.upiPhoneNumber) ? `${copyPrefix}-upi-phone` : undefined,
            copyFieldName: 'UPI Phone Number',
            copyButtonClassName: 'right-[4px]'
          })}
          {renderInput({
            label: 'UPI ID',
            required: true,
            placeholder: 'Enter UPI ID',
            value: form.upiId,
            readOnly: fieldReadOnly,
            onChange: (e) => setForm((s) => ({ ...s, upiId: e.target.value })),
            copyButtonId: shouldShowCopy && hasFieldValue(form.upiId) ? `${copyPrefix}-upi-id` : undefined,
            copyFieldName: 'UPI ID',
            copyButtonClassName: 'right-[4px]'
          })}
        </div>
      </div>
    );
  };

  const renderProjectAccordion = (sectionId, title, content) => {
    const isExpanded = expandedProjectSection === sectionId;

    return (
      <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => toggleProjectSection(sectionId)}
          className={`flex h-[40px] w-full items-center justify-between px-[14px] text-left ${isExpanded ? 'bg-[#EDEDED]' : 'bg-white'}`}
        >
          <span className="text-[12px] font-medium text-black">{title}</span>
          <span className="flex items-center gap-[8px] text-[#2B2B2B]">
            {projectFormMode === 'edit' ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Share project details"
                className="inline-flex h-[16px] w-[16px] cursor-pointer items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProjectShare(sectionId, title);
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  e.stopPropagation();
                  handleProjectShare(sectionId, title);
                }}
              >
                <img src={Share} alt="Share" className="h-[12px] w-[12px]" />
              </span>
            ) : null}
            {renderChevron(isExpanded)}
          </span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[8px]">{content}</div>}
      </div>
    );
  };

  const getPdfValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    const text = String(value).trim();
    return text || 'N/A';
  };

  const normalizeQrForPdf = (value) => {
    if (!value || typeof value !== 'string') return '';
    const qrImageData = value.trim().replace(/\s/g, '');
    if (!qrImageData) return '';
    if (qrImageData.startsWith('data:')) return qrImageData;
    if (qrImageData.startsWith('/9j/') || qrImageData.startsWith('/9j4')) return `data:image/jpeg;base64,${qrImageData}`;
    if (qrImageData.startsWith('iVBORw0KGgo')) return `data:image/png;base64,${qrImageData}`;
    return '';
  };

  const downloadDetailsPdf = ({ title, sectionTitle, rows, fileName, qrImage }) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(191, 152, 83);
    doc.text(title, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(sectionTitle, 14, 30);
    doc.setFont('helvetica', 'normal');
    doc.autoTable({
      startY: 35,
      body: rows,
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

    const normalizedQrImage = normalizeQrForPdf(qrImage);
    if (normalizedQrImage) {
      try {
        doc.addImage(normalizedQrImage, 'JPEG', 80, doc.lastAutoTable.finalY + 20, 50, 50);
        doc.setFontSize(10);
        doc.text('Scan to Pay', 105, doc.lastAutoTable.finalY + 75, { align: 'center' });
      } catch (error) {
        console.error('Failed to add QR image to PDF:', error);
      }
    }

    doc.save(fileName);
  };

  const makePdfFileName = (entity, name, sectionId) => {
    const safeEntity = String(entity || 'Details').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Details';
    const safeName = getPdfValue(name).replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Record';
    const safeSection = String(sectionId || 'details').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'details';
    return `${safeEntity}_${safeName}_${safeSection}.pdf`;
  };

  const fallbackPdfRows = (rows) => (Array.isArray(rows) && rows.length ? rows : [['Details', 'N/A']]);

  const handleProjectShare = (sectionId, sectionTitle) => {
    let rows = [];
    let qrImage = '';

    if (sectionId === 'project-image') {
      rows = [
        ['Project Name', getPdfValue(projectForm.projectName)],
        ['Image Uploaded', projectForm.projectPicture ? 'Yes' : 'No']
      ];
    } else if (sectionId === 'project-details') {
      rows = [
        ['Project Name', getPdfValue(projectForm.projectName)],
        ['Project ID', getPdfValue(projectForm.projectId)],
        ['Project Category', getPdfValue(projectForm.projectCategory)],
        ['Reference Name', getPdfValue(projectForm.referenceName)],
        ['Branch', getPdfValue(projectForm.branch)],
        ['Project Address', getPdfValue(projectForm.projectAddress)],
        ['Latitude & Longitude', getPdfValue(projectForm.latitudeLongitude)]
      ];
    } else if (sectionId === 'client-details') {
      rows = [
        ['Client Name', getPdfValue(projectForm.clientName)],
        ['Father Name', getPdfValue(projectForm.fatherName)],
        ['Mobile Number', getPdfValue(projectForm.mobileNumber)],
        ['Age', getPdfValue(projectForm.age)],
        ['Email ID', getPdfValue(projectForm.emailId)],
        ['Client Address', getPdfValue(projectForm.clientAddress)]
      ];
    } else if (sectionId === 'account-details') {
      rows = [
        ['Account Holder Name', getPdfValue(projectForm.accountHolderName)],
        ['Account Number', getPdfValue(projectForm.accountNumber)],
        ['Bank Name', getPdfValue(projectForm.bankName)],
        ['IFSC Code', getPdfValue(projectForm.ifscCode)],
        ['Bank Branch', getPdfValue(projectForm.accountBranch)],
        ['UPI Phone Number', getPdfValue(projectForm.upiPhoneNumber)],
        ['UPI ID', getPdfValue(projectForm.upiId)]
      ];
      qrImage = projectForm.qrCode || projectQrPreview;
    } else if (sectionId === 'project-information') {
      rows = [];
      projectPropertyDetails.forEach((item, index) => {
        const n = index + 1;
        rows.push([`Entry ${n} - Project Type`, getPdfValue(item?.projectType)]);
        rows.push([`Entry ${n} - Floor Name`, getPdfValue(item?.floorName)]);
        rows.push([`Entry ${n} - Shop No`, getPdfValue(item?.shopNo)]);
        rows.push([`Entry ${n} - Door No`, getPdfValue(item?.doorNo)]);
        rows.push([`Entry ${n} - Area`, getPdfValue(item?.area)]);
        rows.push([`Entry ${n} - EB No`, getPdfValue(item?.ebNo)]);
        rows.push([`Entry ${n} - EB Phase`, getPdfValue(item?.ebNoPhase)]);
        rows.push([`Entry ${n} - Property Tax No`, getPdfValue(item?.propertyTaxNo)]);
        rows.push([`Entry ${n} - Water Tax No`, getPdfValue(item?.waterTaxNo)]);
      });
    }

    const projectPdfTitle =
      sectionId === 'project-details'
        ? 'Project Information'
        : (getPdfValue(projectForm.projectName) === 'N/A' ? 'Project Information' : getPdfValue(projectForm.projectName));

    downloadDetailsPdf({
      title: projectPdfTitle,
      sectionTitle: 'Project Details',
      rows: fallbackPdfRows(rows),
      fileName: makePdfFileName('Project', projectForm.projectName, sectionId),
      qrImage
    });
  };

  const handleVendorShare = (sectionId, sectionTitle) => {
    let rows = [];
    let qrImage = '';

    if (sectionId === 'vendor-image') {
      rows = [
        ['Vendor Name', getPdfValue(vendorForm.vendorName)],
        ['Image Uploaded', vendorForm.vendorPicture ? 'Yes' : 'No']
      ];
    } else if (sectionId === 'vendor-details') {
      rows = [
        ['Vendor Name', getPdfValue(vendorForm.vendorName)],
        ['Vendor Category', getPdfValue(vendorForm.vendorCategory)],
        ['Vendor ID', getPdfValue(vendorForm.vendorId)],
        ['Contact Number', getPdfValue(vendorForm.contactNumber)],
        ['Reference Name', getPdfValue(vendorForm.referenceName)],
        ['Branch', getPdfValue(vendorForm.branch)],
        ['Email ID', getPdfValue(vendorForm.emailId)],
        ['Vendor Address', getPdfValue(vendorForm.vendorAddress)],
        ['Latitude & Longitude', getPdfValue(vendorForm.latitudeLongitude)]
      ];
    } else if (sectionId === 'account-details') {
      rows = [
        ['Account Holder Name', getPdfValue(vendorForm.accountHolderName)],
        ['Account Number', getPdfValue(vendorForm.accountNumber)],
        ['Bank Name', getPdfValue(vendorForm.bankName)],
        ['IFSC Code', getPdfValue(vendorForm.ifscCode)],
        ['Branch', getPdfValue(vendorForm.location)],
        ['UPI Phone Number', getPdfValue(vendorForm.upiPhoneNumber)],
        ['UPI ID', getPdfValue(vendorForm.upiId)]
      ];
      qrImage = vendorForm.qrCode || vendorQrPreview;
    }

    downloadDetailsPdf({
      title: 'Vendor Information',
      sectionTitle: sectionTitle || 'Vendor Details',
      rows: fallbackPdfRows(rows),
      fileName: makePdfFileName('Vendor', vendorForm.vendorName, sectionId),
      qrImage
    });
  };

  const handleContractorShare = (sectionId, sectionTitle) => {
    let rows = [];
    let qrImage = '';

    if (sectionId === 'contractor-image') {
      rows = [
        ['Contractor Name', getPdfValue(contractorForm.contractorName)],
        ['Image Uploaded', contractorForm.contractorProfileUrl ? 'Yes' : 'No']
      ];
    } else if (sectionId === 'contractor-details') {
      rows = [
        ['Contractor Name', getPdfValue(contractorForm.contractorName)],
        ['Contractor Category', getPdfValue(contractorForm.contractorCategory)],
        ['Contractor ID', getPdfValue(contractorForm.contractorId)],
        ['Contractor Number', getPdfValue(contractorForm.contractorNumber)],
        ['Reference Name', getPdfValue(contractorForm.referenceName)],
        ['Branch', getPdfValue(contractorForm.branch)],
        ['Email ID', getPdfValue(contractorForm.emailId)],
        ['Contractor Address', getPdfValue(contractorForm.contractorAddress)]
      ];
    } else if (sectionId === 'account-details') {
      rows = [
        ['Account Holder Name', getPdfValue(contractorForm.accountHolderName)],
        ['Account Number', getPdfValue(contractorForm.accountNumber)],
        ['Bank Name', getPdfValue(contractorForm.bankName)],
        ['IFSC Code', getPdfValue(contractorForm.ifscCode)],
        ['Branch', getPdfValue(contractorForm.location)],
        ['UPI Phone Number', getPdfValue(contractorForm.upiPhoneNumber)],
        ['UPI ID', getPdfValue(contractorForm.upiId)]
      ];
      qrImage = contractorForm.qrCode || contractorQrPreview;
    }

    downloadDetailsPdf({
      title: 'Contractor Information',
      sectionTitle: sectionTitle || 'Contractor Details',
      rows: fallbackPdfRows(rows),
      fileName: makePdfFileName('Contractor', contractorForm.contractorName, sectionId),
      qrImage
    });
  };

  const handleEmployeeShare = (sectionId, sectionTitle) => {
    let rows = [];
    let qrImage = '';

    if (sectionId === 'employee-image') {
      rows = [
        ['Employee Name', getPdfValue(employeeForm.employeeName)],
        ['Image Uploaded', employeeImage ? 'Yes' : 'No']
      ];
    } else if (sectionId === 'employee-details') {
      rows = [
        ['Employee Name', getPdfValue(employeeForm.employeeName)],
        ['Employee ID', getPdfValue(employeeForm.employeeId)],
        ['Designation', getPdfValue(employeeForm.designation)],
        ['User Name', getPdfValue(employeeForm.userName)],
        ['Mobile Number', getPdfValue(employeeForm.mobileNumber)],
        ['Email ID', getPdfValue(employeeForm.emailId)],
        ['Employee Address', getPdfValue(employeeForm.employeeAddress)]
      ];
    } else if (sectionId === 'account-details') {
      rows = [
        ['Account Holder Name', getPdfValue(employeeForm.accountHolderName)],
        ['Account Number', getPdfValue(employeeForm.accountNumber)],
        ['Bank Name', getPdfValue(employeeForm.bankName)],
        ['IFSC Code', getPdfValue(employeeForm.ifscCode)],
        ['Branch', getPdfValue(employeeForm.branch)],
        ['UPI Phone Number', getPdfValue(employeeForm.upiPhoneNumber)],
        ['UPI ID', getPdfValue(employeeForm.upiId)]
      ];
      qrImage = employeeForm.qrCode || employeeQrPreview;
    }

    downloadDetailsPdf({
      title: 'Employee Information',
      sectionTitle: sectionTitle || 'Employee Details',
      rows: fallbackPdfRows(rows),
      fileName: makePdfFileName('Employee', employeeForm.employeeName, sectionId),
      qrImage
    });
  };

  const handleAccountShare = (sectionId, sectionTitle) => {
    let rows = [];
    let qrImage = '';

    if (sectionId === 'account-image') {
      rows = [
        ['Account Holder Name', getPdfValue(accountForm.accountHolderName)],
        ['Image Uploaded', accountImage ? 'Yes' : 'No']
      ];
    } else if (sectionId === 'account-details') {
      rows = [
        ['Account Holder Name', getPdfValue(accountForm.accountHolderName)],
        ['Account Number', getPdfValue(accountForm.accountNumber)],
        ['Bank Name', getPdfValue(accountForm.bankName)],
        ['IFSC Code', getPdfValue(accountForm.ifscCode)],
        ['Branch', getPdfValue(accountForm.branch)],
        ['UPI Phone Number', getPdfValue(accountForm.upiPhoneNumber)],
        ['UPI ID', getPdfValue(accountForm.upiId)],
        ['Account Type', getPdfValue(accountForm.accountType)]
      ];
      qrImage = accountForm.qrCode || accountQrPreview;
    }

    downloadDetailsPdf({
      title: 'Account Information',
      sectionTitle: sectionTitle || 'Account Details',
      rows: fallbackPdfRows(rows),
      fileName: makePdfFileName('Account', accountForm.accountHolderName, sectionId),
      qrImage
    });
  };

  const handleLabourShare = (sectionId, sectionTitle) => {
    let rows = [];
    let qrImage = '';

    if (sectionId === 'labour-image') {
      rows = [
        ['Labour Name', getPdfValue(labourForm.labourName)],
        ['Image Uploaded', labourImage ? 'Yes' : 'No']
      ];
    } else if (sectionId === 'labour-details') {
      rows = [
        ['Labour Name', getPdfValue(labourForm.labourName)],
        ['Labour Category', getPdfValue(labourForm.labourCategory)],
        ['Labour ID', getPdfValue(labourForm.labourId)],
        ['Labour Number', getPdfValue(labourForm.labourNumber)],
        ['Reference Name', getPdfValue(labourForm.referenceName)],
        ['Branch', getPdfValue(labourForm.branch)],
        ['Labour Address', getPdfValue(labourForm.labourAddress)]
      ];
    } else if (sectionId === 'wage-details') {
      rows = [
        ['Wage Type', getPdfValue(labourForm.wageType)],
        ['Salary', getPdfValue(labourForm.labourSalary)]
      ];
    } else if (sectionId === 'account-details') {
      rows = [
        ['Account Holder Name', getPdfValue(labourForm.accountHolderName)],
        ['Account Number', getPdfValue(labourForm.accountNumber)],
        ['Bank Name', getPdfValue(labourForm.bankName)],
        ['IFSC Code', getPdfValue(labourForm.ifscCode)],
        ['Branch', getPdfValue(labourForm.accountBranch)],
        ['UPI Phone Number', getPdfValue(labourForm.upiPhoneNumber)],
        ['UPI ID', getPdfValue(labourForm.upiId)]
      ];
      qrImage = labourForm.qrCode || labourQrPreview;
    }

    downloadDetailsPdf({
      title: 'Labour Information',
      sectionTitle: sectionTitle || 'Labour Details',
      rows: fallbackPdfRows(rows),
      fileName: makePdfFileName('Labour', labourForm.labourName, sectionId),
      qrImage
    });
  };

  const downloadLabourListTablePdf = (bodyRows) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(191, 152, 83);
    doc.text('Company Labour', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Labour Name, Wage Type & Wage', 14, 30);
    doc.setFont('helvetica', 'normal');
    doc.autoTable({
      startY: 35,
      head: [['Labour Name', 'Wage Type', 'Wage']],
      body: bodyRows.length ? bodyRows : [['N/A', 'N/A', 'N/A']],
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: { fillColor: [191, 152, 83], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 11 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [0, 0, 0], fontSize: 11 },
        1: { textColor: [50, 50, 50] },
        2: { textColor: [50, 50, 50] }
      }
    });
    const stamp = new Date().toISOString().slice(0, 10);
    doc.save(`Company_Labour_List_${stamp}.pdf`);
  };

  const handleCompanyLabourListShare = () => {
    const source = Array.isArray(displayedList) ? displayedList : [];
    const bodyRows = source.map((item) => {
      const n = normalizeLabourForForm(item);
      return [getPdfValue(n.labourName), getPdfValue(n.wageType), getPdfValue(n.labourSalary)];
    });
    downloadLabourListTablePdf(bodyRows);
  };

  const toggleBankDetailsSection = (sectionId) => {
    setExpandedBankDetailsSection((current) => (current === sectionId ? null : sectionId));
  };

  const renderBankDetailsAccordion = (sectionId, title, content) => {
    const isExpanded = expandedBankDetailsSection === sectionId;

    return (
      <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
        <div
          className={`flex h-[40px] w-full items-center justify-between px-[14px] text-left ${isExpanded ? 'border-b border-[#EFEFEF] bg-[#EDEDED]' : 'bg-white'}`}
        >
          <button type="button" onClick={() => toggleBankDetailsSection(sectionId)} className="flex min-w-0 flex-1 items-center gap-[6px]">
            <span className="truncate text-[14px] font-medium text-black">{title}</span>
            {isExpanded && (
              <button
                type="button"
                aria-label="Toggle list order"
                className="flex h-[24px] w-[24px] shrink-0 items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setBankDetailsSortReversed((s) => !s);
                }}
              >
                <img src={bankDetailsSortReversed ? UpDownFilter : FilterUp} alt="" className="h-[14px] w-[14px]" />
              </button>
            )}
          </button>
          <button type="button" onClick={() => toggleBankDetailsSection(sectionId)} className="shrink-0 text-[#2B2B2B]">
            {renderChevron(isExpanded)}
          </button>
        </div>
        {isExpanded && <div>{content}</div>}
      </div>
    );
  };

  const renderStaticBankDetailsCard = (title, content) => (
    <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex h-[40px] w-full items-center justify-between bg-[#EDEDED] px-[14px] text-left">
        <span className="text-[12px] font-medium text-black">{title}</span>
        <span className="text-[#2B2B2B]">{renderChevron(true)}</span>
      </div>
      <div className="border-t border-[#F2F2F2]">{content}</div>
    </div>
  );

  const toggleBankFormSection = (sectionId) => {
    setExpandedBankFormSection((current) => (current === sectionId ? null : sectionId));
  };

  const renderBankFormAccordion = (sectionId, title, content) => {
    const isExpanded = expandedBankFormSection === sectionId;

    return (
      <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => toggleBankFormSection(sectionId)}
          className={`flex h-[40px] w-full items-center justify-between px-[14px] text-left ${isExpanded ? 'bg-[#EDEDED]' : 'bg-white'}`}
        >
          <span className="text-[12px] font-medium text-black">{title}</span>
          <span className="text-[#2B2B2B]">{renderChevron(isExpanded)}</span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2]">{content}</div>}
      </div>
    );
  };

  const hasImageFile = (value) => typeof value === 'string' && value.trim() !== '';

  const renderImageUploadContent = ({ formMode, isViewOnly = false, nameText, imageValue, inputId, onImageChange }) => (
    <div className="">
      {formMode === 'edit' ? (
        <div className="mb-[8px] flex items-center justify-between">
          <span className="truncate pr-[8px] text-[12px] font-medium text-black">{nameText || 'Name'}</span>
          {hasImageFile(imageValue) && (
            <button
              type="button"
              className="inline-flex items-center justify-center p-[4px]"
              aria-label="Edit image"
              onClick={() => {
                if (!canEditMasterData || !isViewOnly) return;
                document.getElementById(inputId)?.click();
              }}
            >
              <img src={editblack} alt="" className="h-[14px] w-[14px] object-contain" />
            </button>
          )}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => {
          const canUploadInNewMode = formMode === 'new';
          const canUploadInEditMode = formMode === 'edit' && !isViewOnly && canEditMasterData;
          if (!canUploadInNewMode && !canUploadInEditMode) return;
          document.getElementById(inputId)?.click();
        }}
        className={`block w-full ${imageValue ? 'rounded-[10px] border border-[#DEDEDE] bg-[#FAFAFA] p-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]' : ''}`}
      >
        <div className={`${imageValue ? 'relative flex h-[196px] w-full flex-col items-center justify-center gap-[4px] overflow-hidden rounded-[8px] border-[2px] border-[#CFCFCF] bg-[#E8E8E8] shadow-[inset_0_3px_10px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.65)]' : 'relative flex h-[196px] w-full items-center justify-center'}`}>
          {imageValue ? (
            <img src={imageValue} alt="" className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-transparent transition-colors">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="#E4572E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 16.5V18C5 19.1 5.9 20 7 20H17C18.1 20 19 19.1 19 18V16.5" stroke="#E4572E" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <p className="mt-[4px] text-[14px] font-medium text-[#E4572E]">Click to Upload</p>
            </div>
          )}
        </div>
      </button>
      <input
        type="file"
        accept="image/*"
        id={inputId}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            setHasFormChanges(true);
            onImageChange(result);
          };
          reader.readAsDataURL(file);
          e.target.value = '';
        }}
      />
    </div>
  );

  const renderBankNameFormView = () => (
    <>
      <div className="bg-white">
        <div className="text-right" />
      </div>

      <div
        className={`w-full px-0 pt-0 pb-[18px] mt-[8] ${bankNameFormMode === 'edit' && !uploadFileRowShowsSaveIcon
          ? '[&_input]:bg-[#EDEDED] [&_select]:bg-[#EDEDED] [&_textarea]:bg-[#EDEDED] [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none'
          : ''
          }`}
      >
        <div className="space-y-[2px]">
          {renderBankFormAccordion(
            'bank-form-image',
            'Image',
            <div className="px-[14px] py-[12px]">
              {renderImageUploadContent({
                formMode: bankNameFormMode,
                isViewOnly: bankNameFormMode === 'edit',
                nameText: bankNameForm.bankName || 'Bank Name',
                imageValue: bankNameImage,
                inputId: 'bankNameImageInput',
                onImageChange: (value) => setBankNameImage(value)
              })}
            </div>
          )}

          {renderBankFormAccordion(
            'bank-form-details',
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
      <div className="bg-white">
        <div className="text-right" />
      </div>

      <div
        className={`w-full px-0 pt-0 pb-[18px] mt-[8px] ${bankTypeFormMode === 'edit' && !uploadFileRowShowsSaveIcon
          ? '[&_input]:bg-[#EDEDED] [&_select]:bg-[#EDEDED] [&_textarea]:bg-[#EDEDED] [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none'
          : ''
          }`}
      >
        <div className="space-y-[2px]">
          {renderBankFormAccordion(
            'bank-form-image',
            'Image',
            <div className="px-[14px] py-[12px]">
              {renderImageUploadContent({
                formMode: bankTypeFormMode,
                isViewOnly: bankTypeFormMode === 'edit',
                nameText: bankTypeForm.accountType || 'Account Type',
                imageValue: bankTypeImage,
                inputId: 'bankTypeImageInput',
                onImageChange: (value) => setBankTypeImage(value)
              })}
            </div>
          )}

          {renderBankFormAccordion(
            'bank-form-details',
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
      <div className="bg-white">
        <div className="text-right" />
      </div>

      <div
        className={`w-full px-0 pt-0 pb-[18px] mt-[8px] ${bankLocationFormMode === 'edit' && !uploadFileRowShowsSaveIcon
          ? '[&_input]:bg-[#EDEDED] [&_select]:bg-[#EDEDED] [&_textarea]:bg-[#EDEDED] [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none'
          : ''
          }`}
      >
        <div className="space-y-[2px]">
          {renderBankFormAccordion(
            'bank-form-image',
            'Image',
            <div className="px-[14px] py-[12px]">
              {renderImageUploadContent({
                formMode: bankLocationFormMode,
                isViewOnly: bankLocationFormMode === 'edit',
                nameText: bankLocationForm.branchName || 'Branch Name',
                imageValue: bankLocationImage,
                inputId: 'bankLocationImageInput',
                onImageChange: (value) => setBankLocationImage(value)
              })}
            </div>
          )}

          {renderBankFormAccordion(
            'bank-form-details',
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
          className={`flex h-[40px] w-full items-center justify-between px-[14px] text-left ${isExpanded ? 'bg-[#EDEDED]' : 'bg-white'}`}
        >
          <span className="text-[12px] font-medium text-black">{title}</span>
          <span className="flex items-center gap-[8px] text-[#2B2B2B]">
            {vendorFormMode === 'edit' ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Share vendor details"
                className="inline-flex h-[16px] w-[16px] cursor-pointer items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVendorShare(sectionId, title);
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  e.stopPropagation();
                  handleVendorShare(sectionId, title);
                }}
              >
                <img src={Share} alt="Share" className="h-[12px] w-[12px]" />
              </span>
            ) : null}
            {renderChevron(isExpanded)}
          </span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[8px]">{content}</div>}
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
          className={`flex h-[40px] w-full items-center justify-between px-[14px] text-left ${isExpanded ? 'bg-[#EDEDED]' : 'bg-white'}`}
        >
          <span className="text-[12px] font-medium text-black">{title}</span>
          <span className="flex items-center gap-[8px] text-[#2B2B2B]">
            {contractorFormMode === 'edit' ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Share contractor details"
                className="inline-flex h-[16px] w-[16px] cursor-pointer items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleContractorShare(sectionId, title);
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  e.stopPropagation();
                  handleContractorShare(sectionId, title);
                }}
              >
                <img src={Share} alt="Share" className="h-[12px] w-[12px]" />
              </span>
            ) : null}
            {renderChevron(isExpanded)}
          </span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[8px]">{content}</div>}
      </div>
    );
  };

  const renderAddContractorView = () => (
    <>
      <div className="bg-white">
        <div className="text-right" />
      </div>

      <div
        className={`w-full px-0 pt-0 pb-[18px] mt-[8px] ${contractorFormMode === 'edit' && (isContractorViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon)
          ? '[&_input]:bg-[#EDEDED] [&_select]:bg-[#EDEDED] [&_textarea]:bg-[#EDEDED] [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none'
          : ''
          }`}
      >
        <div className="space-y-[2px]">
          {renderContractorAccordion(
            'contractor-image',
            'Image',
            renderImageUploadContent({
              formMode: contractorFormMode,
              isViewOnly: isContractorViewOnly,
              nameText: contractorForm.contractorName || 'Contractor Name',
              imageValue: contractorForm.contractorProfileUrl,
              inputId: 'contractorNewPictureInput',
              onImageChange: (value) => {
                setContractorPictureDraft(value);
                setContractorForm((s) => ({ ...s, contractorProfileUrl: value }));
              }
            })
          )}

          {renderContractorAccordion(
            'contractor-details',
            'Contractor Details',
            <div className="space-y-[6px]">
              {renderInput({
                label: selectedItem === 'Support Associate Name' ? 'Associate Name' : 'Contractor Name',
                required: true,
                placeholder: 'Enter Name',
                value: contractorForm.contractorName,
                readOnly: false,
                onChange: (e) => setContractorForm((s) => ({ ...s, contractorName: e.target.value }))
              })}

              {renderInput({
                label: 'Contractor Category',
                required: true,
                placeholder: 'Select Category',
                value: contractorForm.contractorCategory,
                readOnly: true,
                onClick: () => {
                  if (isContractorOptionSelectionEnabled) setIsContractorCategoryModalOpen(true);
                },
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                rightIconInteractive: true,
                onRightIconClick: () => {
                  if (isContractorOptionSelectionEnabled) setIsContractorCategoryModalOpen(true);
                }
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
                  onChange: (e) => setContractorForm((s) => ({ ...s, contractorNumber: e.target.value })),
                  numericOnly: true
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
                  placeholder: 'Enter Branch',
                  value: contractorForm.branch,
                  readOnly: false,
                  onChange: (e) => setContractorForm((s) => ({ ...s, branch: e.target.value }))
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
            renderAccountDetailsSection({
              form: contractorForm,
              formMode: contractorFormMode,
              isViewOnly: isContractorViewOnly,
              setForm: setContractorForm,
              onOpenQr: () => setIsContractorQrModalOpen(true),
              onOpenBankNamePicker: openAccountBankNameModal,
              branchKey: 'location',
              onOpenBranchModal: () =>
                openAccountDetailsBranchModal(setContractorForm, 'location', contractorForm.location, isContractorViewOnly),
              copyPrefix: 'm-contractor'
            })
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
                  <span className="text-[12px] font-medium text-[#9A9A9A]">No QR image</span>
                )}
              </div>

              <input
                value={contractorForm.upiId || ''}
                onChange={(e) => setContractorForm((s) => ({ ...s, upiId: e.target.value }))}
                readOnly={
                  contractorFormMode === 'edit'
                    ? isContractorViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false
                }
                placeholder=""
                className="mb-[10px] h-[34px] w-full rounded-[6px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none"
              />

              <input
                type="file"
                accept="image/*"
                id="contractorQrUpload"
                className="hidden"
                disabled={
                  contractorFormMode === 'edit'
                    ? isContractorViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false
                }
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setContractorQrFile(file);
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === 'string' ? reader.result : '';
                    setContractorQrPreview(result);
                    setContractorForm((s) => ({ ...s, qrCode: result }));
                  };
                  reader.readAsDataURL(file);
                }}
              />

              {!(contractorFormMode === 'edit'
                ? isContractorViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                : false) && (
                <>
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
                </>
              )}
            </div>
          </div>
        </>
      )}

      {isContractorPictureModalOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsContractorPictureModalOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/60"
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-[16px]">
            <div
              className="w-full max-w-[330px] rounded-[14px] bg-white px-[18px] pt-[16px] pb-[18px] shadow-[0px_10px_30px_rgba(0,0,0,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-[12px] text-center">
                <div className="text-[16px] font-semibold text-black">Contractor Picture</div>
                <div className="mt-[2px] text-[11px] text-black">Uploaded Photo</div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setIsContractorPictureModalOpen(false)}
                  className="absolute right-0 top-0 text-[#F26B3A]"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 5L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="mx-auto mb-[12px] w-full max-w-[220px] rounded-[12px] border border-[#DEDEDE] bg-[#FAFAFA] p-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[8px] border-[3px] border-[#CFCFCF] bg-[#E8E8E8] shadow-[inset_0_3px_10px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.65)]">
                  {contractorPictureDraft ? (
                    <img src={contractorPictureDraft} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <svg className="h-[56px] w-[56px] text-[#B5B5B5]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <rect x="6" y="10" width="52" height="44" rx="4" stroke="currentColor" strokeWidth="1.75" />
                      <circle cx="44" cy="22" r="5" fill="currentColor" fillOpacity="0.4" />
                      <path d="M8 48 L24 24 L36 40 L48 28 L56 36 V52 H8 Z" fill="currentColor" fillOpacity="0.32" />
                    </svg>
                  )}
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                id="contractorPictureFileInput"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setContractorPictureFile(file);
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === 'string' ? reader.result : '';
                    setContractorPictureDraft(result);
                  };
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
              />

              <button
                type="button"
                onClick={() => document.getElementById('contractorPictureFileInput')?.click()}
                className="mb-[12px] h-[40px] w-full rounded-[8px] border border-[#D9D9D9] bg-white text-[14px] font-medium text-black"
              >
                Update Photo
              </button>

              <button
                type="button"
                onClick={() => {
                  setContractorForm((s) => ({ ...s, contractorProfileUrl: contractorPictureDraft }));
                  setIsContractorPictureModalOpen(false);
                }}
                className="h-[44px] w-full rounded-[8px] bg-black text-[14px] font-semibold text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </>
      )}

      <SelectVendorModal
        isOpen={isContractorCategoryModalOpen}
        onClose={() => setIsContractorCategoryModalOpen(false)}
        onSelect={(value) => setContractorForm((s) => ({ ...s, contractorCategory: value || '' }))}
        selectedValue={contractorForm.contractorCategory || ''}
        options={Array.from(new Set((contractorCategoryOptions || []).filter(Boolean)))}
        fieldName="Category"
        showStarIcon={false}
      />
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
          className={`flex h-[40px] w-full items-center justify-between px-[14px] text-left ${isExpanded ? 'bg-[#EDEDED]' : 'bg-white'}`}
        >
          <span className="text-[12px] font-medium text-black">{title}</span>
          <span className="text-[#2B2B2B]">{renderChevron(isExpanded)}</span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[12px]">{content}</div>}
      </div>
    );
  };

  const renderAddCategoryView = () => (
    <>
      <div className="bg-white">
        <div className="text-right" />
      </div>

      <div
        className={`w-full px-0 pt-0 pb-[18px] mt-[8px] ${categoryFormMode === 'edit' && (isCategoryViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon)
          ? '[&_input]:bg-[#EDEDED] [&_select]:bg-[#EDEDED] [&_textarea]:bg-[#EDEDED] [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none'
          : ''
          }`}
      >
        <div className="space-y-[2px]">
          {renderCategoryAccordion(
            'category-image',
            'Image',
            renderImageUploadContent({
              formMode: categoryFormMode,
              isViewOnly: isCategoryViewOnly,
              nameText: categoryForm.categoryName || 'Category Name',
              imageValue: categoryImage,
              inputId: 'categoryImageInput',
              onImageChange: (value) => setCategoryImage(value)
            })
          )}

          {renderCategoryAccordion(
            'category-details',
            'Category Details',
            <div className="space-y-[6px]">
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
          className={`flex h-[40px] w-full items-center justify-between px-[14px] text-left ${isExpanded ? 'bg-[#EDEDED]' : 'bg-white'}`}
        >
          <span className="text-[12px] font-medium text-black">{title}</span>
          <span className="text-[#2B2B2B]">{renderChevron(isExpanded)}</span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[12px]">{content}</div>}
      </div>
    );
  };

  const renderAddMachineView = () => (
    <>
      <div className="bg-white">
        <div className="text-right" />
      </div>

      <div
        className={`w-full px-0 pt-0 pb-[18px] mt-[8px] ${machineFormMode === 'edit' && (isMachineViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon)
          ? '[&_input]:bg-[#EDEDED] [&_select]:bg-[#EDEDED] [&_textarea]:bg-[#EDEDED] [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none'
          : ''
          }`}
      >
        <div className="space-y-[2px]">
          {renderMachineAccordion(
            'machine-image',
            'Image',
            renderImageUploadContent({
              formMode: machineFormMode,
              isViewOnly: isMachineViewOnly,
              nameText: machineForm.machineName || 'Machine Name',
              imageValue: machineImage,
              inputId: 'machineImageInput',
              onImageChange: (value) => setMachineImage(value)
            })
          )}

          {renderMachineAccordion(
            'machine-details',
            'Machine Details',
            <div className="space-y-[6px]">
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
          className={`flex h-[40px] w-full items-center justify-between px-[14px] text-left ${isExpanded ? 'bg-[#EDEDED]' : 'bg-white'}`}
        >
          <span className="text-[12px] font-medium text-black">{title}</span>
          <span className="flex items-center gap-[8px] text-[#2B2B2B]">
            {employeeFormMode === 'edit' ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Share employee details"
                className="inline-flex h-[16px] w-[16px] cursor-pointer items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEmployeeShare(sectionId, title);
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  e.stopPropagation();
                  handleEmployeeShare(sectionId, title);
                }}
              >
                <img src={Share} alt="Share" className="h-[12px] w-[12px]" />
              </span>
            ) : null}
            {renderChevron(isExpanded)}
          </span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[8px]">{content}</div>}
      </div>
    );
  };

  const renderAddEmployeeView = () => (
    <>
      <div className="bg-white  mt-[8px]">
        <div className="flex items-center justify-between text-[12px] font-medium text-black">
          <button type="button" onClick={() => setIsEmployeeAadhaarModalOpen(true)}>
            Aadhaar Upload
          </button>
          <span />
        </div>
      </div>

      <div
        className={`w-full px-0 pt-0 pb-[18px] ${employeeFormMode === 'edit' && (isEmployeeViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon)
          ? '[&_input]:bg-[#EDEDED] [&_select]:bg-[#EDEDED] [&_textarea]:bg-[#EDEDED] [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none'
          : ''
          }`}
      >
        <div className="space-y-[2px]">
          {renderEmployeeAccordion(
            'employee-image',
            'Image',
            renderImageUploadContent({
              formMode: employeeFormMode,
              isViewOnly: isEmployeeViewOnly,
              nameText: employeeForm.employeeName || 'Employee Name',
              imageValue: employeeImage,
              inputId: 'employeeImageInput',
              onImageChange: (value) => setEmployeeImage(value)
            })
          )}

          {renderEmployeeAccordion(
            'employee-details',
            'Employee Details',
            <div className="space-y-[6px]">
              {employeeFormMode === 'edit'
                ? renderInput({
                  label: 'Employee Name',
                  required: true,
                  placeholder: 'Enter Name',
                  value: employeeForm.employeeName,
                  readOnly: false,
                  onChange: (e) => setEmployeeForm((s) => ({ ...s, employeeName: e.target.value })),
                  listId: 'm-employee-name-options',
                  datalistOptions: employeeNameOptions,
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })
                : renderInput({
                  label: 'Employee Name',
                  required: true,
                  placeholder: 'Enter Name',
                  value: employeeForm.employeeName,
                  readOnly: false,
                  onChange: (e) => setEmployeeForm((s) => ({ ...s, employeeName: e.target.value }))
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
                  placeholder: employeeFormMode === 'edit' ? 'Select' : 'Enter Designation',
                  value: employeeForm.designation,
                  readOnly: false,
                  onChange: (e) => setEmployeeForm((s) => ({ ...s, designation: e.target.value })),
                  ...(employeeFormMode === 'edit'
                    ? {
                      listId: 'm-employee-designation-options',
                      datalistOptions: employeeDesignationOptions,
                      rightIcon: (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )
                    }
                    : {})
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
                  placeholder: employeeFormMode === 'edit' ? 'Select' : 'Enter Number',
                  value: employeeForm.mobileNumber,
                  readOnly: false,
                  onChange: (e) => setEmployeeForm((s) => ({ ...s, mobileNumber: e.target.value })),
                  numericOnly: true,
                  ...(employeeFormMode === 'edit'
                    ? {
                      listId: 'm-employee-mobile-options',
                      datalistOptions: employeeMobileOptions,
                    }
                    : {})
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
            renderAccountDetailsSection({
              form: employeeForm,
              formMode: employeeFormMode,
              isViewOnly: isEmployeeViewOnly,
              setForm: setEmployeeForm,
              onOpenQr: () => setIsEmployeeQrModalOpen(true),
              onOpenBankNamePicker: openAccountBankNameModal,
              accountHolderPlaceholder: 'Enter Name',
              accountNumberPlaceholder: 'Enter Account Number',
              bankNameText: 'Bank Name',
              ifscPlaceholder: 'Enter IFSC Code',
              branchPlaceholder: 'Select Branch',
              upiPhonePlaceholder: 'Enter Number',
              upiIdPlaceholder: 'Enter UPI ID',
              onOpenBranchModal: () =>
                openAccountDetailsBranchModal(setEmployeeForm, 'branch', employeeForm.branch, isEmployeeViewOnly),
              copyPrefix: 'm-employee'
            })
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
                readOnly={
                  employeeFormMode === 'edit'
                    ? isEmployeeViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false
                }
                placeholder=""
                className="mb-[10px] h-[34px] w-full rounded-[6px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none"
              />

              <input
                type="file"
                accept="image/*"
                id="employeeQrUpload"
                className="hidden"
                disabled={
                  employeeFormMode === 'edit'
                    ? isEmployeeViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false
                }
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === 'string' ? reader.result : '';
                    setHasFormChanges(true);
                    setEmployeeQrPreview(result);
                    setEmployeeForm((s) => ({ ...s, qrCode: result }));
                  };
                  reader.readAsDataURL(file);
                }}
              />

              {!(employeeFormMode === 'edit'
                ? isEmployeeViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                : false) && (
                <>
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
                </>
              )}
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
                  if (file) setHasFormChanges(true);
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
          className={`flex h-[40px] w-full items-center justify-between px-[14px] text-left ${isExpanded ? 'bg-[#EDEDED]' : 'bg-white'}`}
        >
          <span className="text-[12px] font-medium text-black">{title}</span>
          <span className="flex items-center gap-[8px] text-[#2B2B2B]">
            {accountFormMode === 'edit' ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Share account details"
                className="inline-flex h-[16px] w-[16px] cursor-pointer items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccountShare(sectionId, title);
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  e.stopPropagation();
                  handleAccountShare(sectionId, title);
                }}
              >
                <img src={Share} alt="Share" className="h-[12px] w-[12px]" />
              </span>
            ) : null}
            {renderChevron(isExpanded)}
          </span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[8px]">{content}</div>}
      </div>
    );
  };

  const renderAddAccountView = () => (
    <>
      <div className="bg-white">
        <div className="pt-0 pb-[2px] text-right" />
      </div>

      <div
        className={`w-full px-0 pt-0 pb-[18px] mt-[8px] ${accountFormMode === 'edit' && (isAccountViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon)
          ? '[&_input]:bg-[#EDEDED] [&_select]:bg-[#EDEDED] [&_textarea]:bg-[#EDEDED] [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none'
          : ''
          }`}
      >
        <div className="space-y-[2px]">
          {renderAccountAccordion(
            'account-image',
            'Image',
            renderImageUploadContent({
              formMode: accountFormMode,
              isViewOnly: isAccountViewOnly,
              nameText: accountForm.accountHolderName || 'Account Holder Name',
              imageValue: accountImage,
              inputId: 'accountImageInput',
              onImageChange: (value) => setAccountImage(value)
            })
          )}

          {renderAccountAccordion(
            'account-details',
            'Account Details',
            renderAccountDetailsSection({
              form: accountForm,
              formMode: accountFormMode,
              isViewOnly: isAccountViewOnly,
              setForm: setAccountForm,
              onOpenQr: () => setIsAccountQrModalOpen(true),
              onOpenBankNamePicker: openAccountBankNameModal,
              onOpenBranchModal: () =>
                openAccountDetailsBranchModal(setAccountForm, 'branch', accountForm.branch, isAccountViewOnly),
              includeAccountType: true,
              copyPrefix: 'm-account'
            })
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
                readOnly={
                  accountFormMode === 'edit'
                    ? isAccountViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false
                }
                placeholder=""
                className="mb-[10px] h-[34px] w-full rounded-[6px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none"
              />

              <input
                type="file"
                accept="image/*"
                id="accountQrUpload"
                className="hidden"
                disabled={
                  accountFormMode === 'edit'
                    ? isAccountViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false
                }
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

              {!(accountFormMode === 'edit'
                ? isAccountViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                : false) && (
                <>
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
                </>
              )}
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
          className={`flex h-[40px] w-full items-center justify-between px-[14px] text-left ${isExpanded ? 'bg-[#FAFAFA]' : 'bg-white'}`}
        >
          <span className="text-[12px] font-medium text-black">{title}</span>
          <span className="flex items-center gap-[8px] text-[#2B2B2B]">
            {labourFormMode === 'edit' ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Share labour details"
                className="inline-flex h-[16px] w-[16px] cursor-pointer items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLabourShare(sectionId, title);
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  e.stopPropagation();
                  handleLabourShare(sectionId, title);
                }}
              >
                <img src={Share} alt="Share" className="h-[12px] w-[12px]" />
              </span>
            ) : null}
            {renderChevron(isExpanded)}
          </span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[8px]">{content}</div>}
      </div>
    );
  };

  const renderAddLabourView = () => (
    <>
      <div className="bg-white">
        <div className="flex items-center justify-between pt-0 pb-[2px] text-[12px] font-medium text-black">
          <span />
          <span />
        </div>
      </div>

      <div
        className={`w-full px-0 pt-0 pb-[18px] mt-[8px] ${labourFormMode === 'edit' && (isLabourViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon)
          ? '[&_input]:bg-[#EDEDED] [&_select]:bg-[#EDEDED] [&_textarea]:bg-[#EDEDED] [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none'
          : ''
          }`}
      >
        <div className="space-y-[2px]">
          {renderLabourAccordion(
            'labour-image',
            'Image',
            renderImageUploadContent({
              formMode: labourFormMode,
              isViewOnly: isLabourViewOnly,
              nameText: labourForm.labourName || 'Labour Name',
              imageValue: labourImage,
              inputId: 'labourImageInput',
              onImageChange: (value) => setLabourImage(value)
            })
          )}

          {renderLabourAccordion(
            'labour-details',
            'Labour Details',
            <div className="space-y-[6px]">
              {labourFormMode === 'edit'
                ? renderInput({
                  label: 'Labour Name',
                  required: true,
                  placeholder: '',
                  value: labourForm.labourName,
                  readOnly: false,
                  onChange: (e) => setLabourForm((s) => ({ ...s, labourName: e.target.value })),
                  listId: 'm-labour-name-options',
                  datalistOptions: labourNameOptions,
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })
                : renderInput({
                  label: 'Labour Name',
                  required: true,
                  placeholder: 'Enter Name',
                  value: labourForm.labourName,
                  readOnly: false,
                  onChange: (e) => setLabourForm((s) => ({ ...s, labourName: e.target.value }))
                })}

              {labourFormMode === 'edit'
                ? renderInput({
                  label: 'Labour Category',
                  required: true,
                  placeholder: '',
                  value: labourForm.labourCategory,
                  readOnly: false,
                  onChange: (e) => setLabourForm((s) => ({ ...s, labourCategory: e.target.value })),
                  listId: 'm-labour-category-options',
                  datalistOptions: labourCategoryOptions,
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })
                : renderInput({
                  label: 'Labour Category',
                  required: true,
                  placeholder: 'Enter Category',
                  value: labourForm.labourCategory,
                  readOnly: false,
                  onChange: (e) => setLabourForm((s) => ({ ...s, labourCategory: e.target.value }))
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
                  onChange: (e) => setLabourForm((s) => ({ ...s, labourNumber: e.target.value })),
                  numericOnly: true
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
                  ...(labourFormMode === 'edit'
                    ? {
                      placeholder: 'Select',
                      listId: 'm-labour-branch-options',
                      datalistOptions: commonBranchOptions,
                      rightIcon: (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )
                    }
                    : { placeholder: 'Enter Branch' })
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
            <div className="space-y-[6px]">
              <div className="w-full">
                <label className="block text-left text-[12px] font-medium text-black">
                  Wage Type{isFieldMandatory('Wage Type', true) ? <span className="text-[#E26D47]">*</span> : null}
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
                label: 'Wage',
                required: true,
                placeholder: '',
                value: labourForm.labourSalary,
                readOnly: false,
                onChange: (e) => setLabourForm((s) => ({ ...s, labourSalary: e.target.value })),
                numericOnly: true
              })}
            </div>
          )}

          {renderLabourAccordion(
            'account-details',
            'Account Details',
            renderAccountDetailsSection({
              form: labourForm,
              formMode: labourFormMode,
              isViewOnly: isLabourViewOnly,
              setForm: setLabourForm,
              onOpenQr: () => setIsLabourQrModalOpen(true),
              onOpenBankNamePicker: openAccountBankNameModal,
              accountHolderPlaceholder: 'Enter Name',
              accountNumberPlaceholder: 'Enter Account Number',
              bankNameText: 'Bank Name',
              ifscPlaceholder: 'Enter IFSC Code',
              branchPlaceholder: 'Select Branch',
              upiPhonePlaceholder: 'Enter Number',
              upiIdPlaceholder: 'Enter UPI ID',
              branchKey: 'accountBranch',
              onOpenBranchModal: () =>
                openAccountDetailsBranchModal(
                  setLabourForm,
                  'accountBranch',
                  labourForm.accountBranch,
                  isLabourViewOnly
                ),
              copyPrefix: 'm-labour'
            })
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
                readOnly={
                  labourFormMode === 'edit'
                    ? isLabourViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false
                }
                placeholder=""
                className="mb-[10px] h-[34px] w-full rounded-[6px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none"
              />

              <input
                type="file"
                accept="image/*"
                id="labourQrUpload"
                className="hidden"
                disabled={
                  labourFormMode === 'edit'
                    ? isLabourViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false
                }
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

              {!(labourFormMode === 'edit'
                ? isLabourViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                : false) && (
                <>
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
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderAddVendorView = () => (
    <>
      <div className="bg-white">
        <div className="pt-0 pb-[2px] text-right" />
      </div>

      <div
        className={`w-full px-0 pt-0 pb-[18px] mt-[8px] ${vendorFormMode === 'edit' && (isVendorViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon)
          ? '[&_input]:bg-[#EDEDED] [&_select]:bg-[#EDEDED] [&_textarea]:bg-[#EDEDED] [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none'
          : ''
          }`}
      >
        <div className="space-y-[2px]">
          {renderVendorAccordion(
            'vendor-image',
            'Image',
            renderImageUploadContent({
              formMode: vendorFormMode,
              isViewOnly: isVendorViewOnly,
              nameText: vendorForm.vendorName || 'Vendor Name',
              imageValue: vendorForm.vendorPicture,
              inputId: 'vendorNewPictureInput',
              onImageChange: (value) => {
                setVendorPictureDraft(value);
                setVendorForm((s) => ({ ...s, vendorPicture: value }));
              }
            })
          )}

          {renderVendorAccordion(
            'vendor-details',
            'Vendor Details',
            <div className="space-y-[6px]">
              {renderInput({
                label: 'Vendor Name',
                required: true,
                placeholder: 'Enter Vendor Name',
                value: vendorForm.vendorName,
                readOnly: false,
                onChange: (e) => setVendorForm((s) => ({ ...s, vendorName: e.target.value }))
              })}

              {renderInput({
                label: 'Vendor Category',
                required: true,
                placeholder: 'Select Category',
                value: vendorForm.vendorCategory,
                readOnly: true,
                onClick: () => {
                  if (isVendorOptionSelectionEnabled) setIsVendorCategoryModalOpen(true);
                },
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                rightIconInteractive: true,
                onRightIconClick: () => {
                  if (isVendorOptionSelectionEnabled) setIsVendorCategoryModalOpen(true);
                }
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
                  onChange: (e) => setVendorForm((s) => ({ ...s, contactNumber: e.target.value })),
                  numericOnly: true
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
                  placeholder: 'Enter Branch',
                  value: vendorForm.branch,
                  readOnly: false,
                  onChange: (e) => setVendorForm((s) => ({ ...s, branch: e.target.value }))
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
                multiline: true,
                labelRight: (
                  <button
                    type="button"
                    className="shrink-0 text-[12px] font-medium text-black"
                    onClick={() => {
                      if (isVendorOptionSelectionEnabled) setIsVendorLocationSheetOpen(true);
                    }}
                  >
                    Location
                  </button>
                )
              })}
            </div>
          )}

          {renderVendorAccordion(
            'account-details',
            'Account Details',
            renderAccountDetailsSection({
              form: vendorForm,
              formMode: vendorFormMode,
              isViewOnly: isVendorViewOnly,
              setForm: setVendorForm,
              onOpenQr: () => setIsVendorQrModalOpen(true),
              onOpenBankNamePicker: openAccountBankNameModal,
              branchKey: 'location',
              onOpenBranchModal: () =>
                openAccountDetailsBranchModal(setVendorForm, 'location', vendorForm.location, isVendorViewOnly),
              copyPrefix: 'm-vendor'
            })
          )}
        </div>
      </div>

      {isVendorLocationSheetOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsVendorLocationSheetOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/50"
          />

          <div className="fixed inset-x-0 bottom-0 z-[10000] mx-auto w-full rounded-t-[18px] bg-white px-[16px] pb-[16px] pt-[18px] shadow-[0px_-4px_20px_rgba(0,0,0,0.12)]">
            <div className="mb-[14px] flex items-start justify-between">
              <div className="text-[15px] font-semibold text-black">Location Details</div>
              <button
                type="button"
                onClick={() => setIsVendorLocationSheetOpen(false)}
                className="text-[28px] leading-none text-[#F26B3A]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div
              className={
                vendorFormMode === 'edit' &&
                  (isVendorViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon)
                  ? '[&_input]:bg-[#EDEDED]'
                  : ''
              }
            >
              {renderInput({
                label: 'Latitude & Longitude',
                required: true,
                placeholder: 'Example: 9°31\'53.5"N 77°38\'01.9"E',
                value: vendorForm.latitudeLongitude,
                readOnly:
                  vendorFormMode === 'edit'
                    ? isVendorViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false,
                onChange: (e) => setVendorForm((s) => ({ ...s, latitudeLongitude: e.target.value }))
              })}
            </div>

            <div className="mt-[16px] grid grid-cols-2 gap-[14px]">
              <button
                type="button"
                onClick={() => setIsVendorLocationSheetOpen(false)}
                className="h-[38px] rounded-[8px] border border-[#BEBEBE] bg-white text-[14px] font-medium text-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsVendorLocationSheetOpen(false)}
                className="h-[38px] rounded-[8px] bg-black text-[14px] font-medium text-white"
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}

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
                  <span className="text-[12px] font-medium text-[#9A9A9A]">No QR image</span>
                )}
              </div>

              <input
                value={vendorForm.upiId || ''}
                onChange={(e) => setVendorForm((s) => ({ ...s, upiId: e.target.value }))}
                readOnly={
                  vendorFormMode === 'edit'
                    ? isVendorViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false
                }
                placeholder=""
                className="mb-[10px] h-[34px] w-full rounded-[6px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none"
              />

              <input
                type="file"
                accept="image/*"
                id="vendorQrUpload"
                className="hidden"
                disabled={
                  vendorFormMode === 'edit'
                    ? isVendorViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false
                }
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setVendorQrFile(file);
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === 'string' ? reader.result : '';
                    setVendorQrPreview(result);
                    setVendorForm((s) => ({ ...s, qrCode: result }));
                  };
                  reader.readAsDataURL(file);
                }}
              />

              {!(vendorFormMode === 'edit'
                ? isVendorViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                : false) && (
                <>
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
                </>
              )}
            </div>
          </div>
        </>
      )}

      {isVendorPictureModalOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsVendorPictureModalOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/60"
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-[16px]">
            <div
              className="w-full max-w-[330px] rounded-[14px] bg-white px-[18px] pt-[16px] pb-[18px] shadow-[0px_10px_30px_rgba(0,0,0,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-[12px] text-center">
                <div className="text-[16px] font-semibold text-black">Vendor Picture</div>
                <div className="mt-[2px] text-[11px] text-black">Uploaded Photo</div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setIsVendorPictureModalOpen(false)}
                  className="absolute right-0 top-0 text-[#F26B3A]"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 5L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="mx-auto mb-[12px] w-full max-w-[220px] rounded-[12px] border border-[#DEDEDE] bg-[#FAFAFA] p-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[8px] border-[3px] border-[#CFCFCF] bg-[#E8E8E8] shadow-[inset_0_3px_10px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.65)]">
                  {vendorPictureDraft ? (
                    <img src={vendorPictureDraft} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <svg className="h-[56px] w-[56px] text-[#B5B5B5]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <rect x="6" y="10" width="52" height="44" rx="4" stroke="currentColor" strokeWidth="1.75" />
                      <circle cx="44" cy="22" r="5" fill="currentColor" fillOpacity="0.4" />
                      <path d="M8 48 L24 24 L36 40 L48 28 L56 36 V52 H8 Z" fill="currentColor" fillOpacity="0.32" />
                    </svg>
                  )}
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                id="vendorPictureFileInput"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setVendorPictureFile(file);
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === 'string' ? reader.result : '';
                    setVendorPictureDraft(result);
                  };
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
              />

              <button
                type="button"
                onClick={() => document.getElementById('vendorPictureFileInput')?.click()}
                className="mb-[12px] h-[40px] w-full rounded-[8px] border border-[#D9D9D9] bg-white text-[14px] font-medium text-black"
              >
                Update Photo
              </button>

              <button
                type="button"
                onClick={() => {
                  setVendorForm((s) => ({ ...s, vendorPicture: vendorPictureDraft }));
                  setIsVendorPictureModalOpen(false);
                }}
                className="h-[44px] w-full rounded-[8px] bg-black text-[14px] font-semibold text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </>
      )}

      <SelectVendorModal
        isOpen={isVendorCategoryModalOpen}
        onClose={() => setIsVendorCategoryModalOpen(false)}
        onSelect={(value) => setVendorForm((s) => ({ ...s, vendorCategory: value || '' }))}
        selectedValue={vendorForm.vendorCategory || ''}
        options={Array.from(new Set((vendorCategoryOptions || []).filter(Boolean)))}
        fieldName="Category"
        showStarIcon={false}
      />
    </>
  );

  const renderAddProjectView = () => (
    <>
      <div className="bg-white">
        <div className=" text-right">
          {projectFormMode === 'edit' ? (
            isProjectViewOnly ? (
              null
            ) : null
          ) : (
            null
          )}
        </div>
      </div>

      <div
        className={`w-full px-0 pt-0 mt-[8px] ${projectFormMode === 'edit' && (isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon)
          ? '[&_input]:bg-[#EDEDED] [&_select]:bg-[#EDEDED] [&_textarea]:bg-[#EDEDED] [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none'
          : ''
          }`}
      >
        <div className="space-y-[2px]">
          {(projectFormMode === 'new' || projectFormMode === 'edit')
            ? renderProjectAccordion(
              'project-image',
              'Image',
              <div className="">
                {projectFormMode === 'edit' ? (
                  <div className="mb-[8px] flex items-center justify-between">
                    <span className="truncate pr-[8px] text-[12px] font-medium text-black">{projectForm.projectName || 'Project Name'}</span>
                    {hasImageFile(projectForm.projectPicture) && (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center p-[4px]"
                        aria-label="Edit image"
                        onClick={() => {
                          if (!canEditMasterData || !isProjectViewOnly) return;
                          document.getElementById('projectNewPictureInput')?.click();
                        }}
                      >
                        <img src={editblack} alt="" className="h-[14px] w-[14px] object-contain" />
                      </button>
                    )}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    const canUploadInNewMode = projectFormMode === 'new';
                    const canUploadInEditMode =
                      projectFormMode === 'edit' &&
                      !isProjectViewOnly &&
                      canEditMasterData;
                    if (!canUploadInNewMode && !canUploadInEditMode) return;
                    document.getElementById('projectNewPictureInput')?.click();
                  }}
                  className={`block w-full ${projectForm.projectPicture ? 'rounded-[10px] border border-[#DEDEDE] bg-[#FAFAFA] p-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]' : ''}`}
                >
                  <div className={`${projectForm.projectPicture ? 'relative flex h-[196px] w-full flex-col items-center justify-center gap-[4px] overflow-hidden rounded-[8px] border-[2px] border-[#CFCFCF] bg-[#E8E8E8] shadow-[inset_0_3px_10px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.65)]' : 'relative flex h-[196px] w-full items-center justify-center'}`}>
                    {projectForm.projectPicture ? (
                      <img src={projectForm.projectPicture} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-transparent transition-colors">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="#E4572E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M5 16.5V18C5 19.1 5.9 20 7 20H17C18.1 20 19 19.1 19 18V16.5" stroke="#E4572E" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <p className="mt-[4px] text-[14px] font-medium text-[#E4572E]">Click to Upload</p>
                      </div>
                    )}
                  </div>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  id="projectNewPictureInput"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = typeof reader.result === 'string' ? reader.result : '';
                      setProjectPictureDraft(result);
                      setProjectForm((s) => ({ ...s, projectPicture: result }));
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />
              </div>
            )
            : null}

          {renderProjectAccordion(
            'project-details',
            'Project Details',
            <div className="space-y-[6px]">
              <div className="relative">
                {renderInput({
                  label: 'Project Name',
                  required: true,
                  placeholder: 'Enter Name',
                  value: projectForm.projectName,
                  readOnly:
                    projectFormMode === 'edit'
                      ? isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                      : false,
                  onChange: (e) => setProjectForm((s) => ({ ...s, projectName: e.target.value })),
                  labelRight: (
                    <span className="shrink-0 inline-flex items-center gap-[8px]">
                      <button
                        type="button"
                        className="text-[12px] font-medium text-black"
                        onClick={() => {
                          if (!isProjectOptionSelectionEnabled) return;
                          openProjectSiteEngineerModal((value) => {
                            setHasFormChanges(true);
                            setProjectForm((s) => ({ ...s, siteEngineerName: value || '' }));
                          });
                        }}
                      >
                        {projectForm.siteEngineerName || 'Project Incharge'}
                      </button>
                      {projectForm.siteEngineerName && isProjectOptionSelectionEnabled ? (
                        <button
                          type="button"
                          aria-label="Clear Project Incharge"
                          className="inline-flex h-[18px] w-[18px] items-center justify-center text-[16px] leading-none text-[#7A7A7A]"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setHasFormChanges(true);
                            setProjectForm((s) => ({ ...s, siteEngineerName: '' }));
                          }}
                        >
                          ×
                        </button>
                      ) : null}
                    </span>
                  )
                })}
                {projectFormMode === 'edit' && !isProjectViewOnly && !uploadFileRowShowsSaveIcon && (
                  <button
                    type="button"
                    aria-label="Open project list"
                    className="absolute inset-0 z-[5]"
                    style={{ background: 'transparent' }}
                    onClick={() => {
                      setUploadFileRowShowsSaveIcon(false);
                      setIsAddProjectViewOpen(false);
                    }}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                <div className="[&_input]:bg-[#EDEDED]">
                  {renderInput({
                    label: 'Project ID',
                    required: true,
                    placeholder: 'Enter ID',
                    value: projectForm.projectId,
                    readOnly: true,
                    onChange: (e) => setProjectForm((s) => ({ ...s, projectId: e.target.value }))
                  })}
                </div>
                {renderInput({
                  label: 'Project Category',
                  required: true,
                  placeholder: 'Select',
                  value: projectForm.projectCategory,
                  readOnly: true,
                  onClick: () => {
                    if (isProjectOptionSelectionEnabled) setIsProjectCategoryModalOpen(true);
                  },
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  rightIconInteractive: true,
                  onRightIconClick: () => {
                    if (isProjectOptionSelectionEnabled) setIsProjectCategoryModalOpen(true);
                  }
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Reference Name',
                  required: true,
                  placeholder: 'Enter Name',
                  value: projectForm.referenceName,
                  readOnly:
                    projectFormMode === 'edit'
                      ? isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                      : false,
                  onChange: (e) => setProjectForm((s) => ({ ...s, referenceName: e.target.value }))
                })}
                {renderInput({
                  label: 'Branch',
                  required: true,
                  placeholder: 'Select',
                  value: projectForm.branch,
                  readOnly: true,
                  onClick: () => {
                    if (isProjectOptionSelectionEnabled) setIsProjectBranchModalOpen(true);
                  },
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  rightIconInteractive: true,
                  onRightIconClick: () => {
                    if (isProjectOptionSelectionEnabled) setIsProjectBranchModalOpen(true);
                  }
                })}
              </div>

              {renderInput({
                label: 'Project Address',
                required: true,
                placeholder: 'Enter Address',
                value: projectForm.projectAddress,
                readOnly:
                  projectFormMode === 'edit'
                    ? isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false,
                onChange: (e) => setProjectForm((s) => ({ ...s, projectAddress: e.target.value })),
                multiline: true,
                labelRight: (
                  <button
                    type="button"
                    className="shrink-0 text-[12px] font-medium text-black"
                    onClick={() => {
                      if (isProjectOptionSelectionEnabled) setIsProjectLocationSheetOpen(true);
                    }}
                  >
                    Location
                  </button>
                )
              })}
            </div>
          )}

          {renderProjectAccordion(
            'client-details',
            'Client Details',
            <div className="space-y-[6px]">
              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Client Name',
                  required: true,
                  placeholder: 'Enter Name',
                  value: projectForm.clientName,
                  readOnly:
                    projectFormMode === 'edit'
                      ? isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                      : false,
                  onChange: (e) => setProjectForm((s) => ({ ...s, clientName: e.target.value }))
                })}
                {renderInput({
                  label: 'Father Name',
                  required: true,
                  placeholder: 'Enter Name',
                  value: projectForm.fatherName,
                  readOnly:
                    projectFormMode === 'edit'
                      ? isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                      : false,
                  onChange: (e) => setProjectForm((s) => ({ ...s, fatherName: e.target.value }))
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Mobile Number',
                  required: true,
                  placeholder: 'Enter Number',
                  value: projectForm.mobileNumber,
                  readOnly:
                    projectFormMode === 'edit'
                      ? isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                      : false,
                  onChange: (e) => setProjectForm((s) => ({ ...s, mobileNumber: e.target.value })),
                  numericOnly: true
                })}
                {renderInput({
                  label: 'Age',
                  required: true,
                  placeholder: 'Enter Age',
                  value: projectForm.age,
                  readOnly:
                    projectFormMode === 'edit'
                      ? isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                      : false,
                  onChange: (e) => setProjectForm((s) => ({ ...s, age: e.target.value })),
                  numericOnly: true
                })}
              </div>

              {renderInput({
                label: 'Email ID',
                placeholder: '',
                value: projectForm.emailId,
                readOnly:
                  projectFormMode === 'edit'
                    ? isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false,
                onChange: (e) => setProjectForm((s) => ({ ...s, emailId: e.target.value }))
              })}

              {renderInput({
                label: 'Client Address',
                required: true,
                placeholder: 'Enter Address',
                value: projectForm.clientAddress,
                readOnly:
                  projectFormMode === 'edit'
                    ? isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false,
                onChange: (e) => setProjectForm((s) => ({ ...s, clientAddress: e.target.value })),
                multiline: true
              })}
            </div>
          )}

          {renderProjectAccordion(
            'account-details',
            'Account Details',
            renderAccountDetailsSection({
              form: projectForm,
              formMode: projectFormMode,
              isViewOnly: isProjectViewOnly,
              setForm: setProjectForm,
              onOpenQr: () => setIsProjectQrModalOpen(true),
              onOpenBankNamePicker: openAccountBankNameModal,
              qrButtonClassName: 'text-[12px] font-medium text-black',
              branchKey: 'accountBranch',
              fieldReadOnly:
                projectFormMode === 'edit'
                  ? isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                  : false,
              onOpenBranchModal: () =>
                openAccountDetailsBranchModal(
                  setProjectForm,
                  'accountBranch',
                  projectForm.accountBranch,
                  isProjectViewOnly
                ),
              copyPrefix: 'm-project'
            })
          )}

          {renderProjectAccordion(
            'project-information',
            'Project Information',
            <div className="space-y-[6px] ">
              <div className=" flex items-center gap-[10px]">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12.5 12.5L15.75 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={projectInformationSearch}
                    onChange={(event) => setProjectInformationSearch(event.target.value)}
                    placeholder="Search"
                    className="h-[36px] w-full rounded-full border border-[#D2D2D2] bg-white pl-[38px] pr-[14px] text-[14px] text-black outline-none placeholder:text-[#8F8F8F]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    openProjectInformationAddSheet();
                  }}
                  disabled={!isProjectOptionSelectionEnabled}
                  className="flex h-[33px] w-[33px] items-center justify-center rounded-full bg-black text-white disabled:opacity-60"
                  aria-label="Add"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M3 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {hasProjectInformationData ? (
                <div className="max-h-[260px] space-y-[8px] overflow-y-auto scrollbar-none no-scrollbar pr-[2px]">
                  {filteredProjectInformationPreview.map((preview) => {
                    const sourceIndex = Number(preview?.sourceIndex);
                    const cardId = `project-information-card-${sourceIndex}`;
                    const canSwipeProjectInfoCard = !isProjectViewOnly && canEditMasterData && uploadFileRowShowsSaveIcon;
                    return (
                      <div
                        key={cardId}
                        className="relative w-full overflow-hidden rounded-[12px] border border-[#E8E8E8] bg-[#F8F8F8] shadow-[0px_1px_4px_rgba(0,0,0,0.06)] select-none"
                        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
                        onTouchStart={canSwipeProjectInfoCard ? handleProjectTouchStart : undefined}
                        onTouchEnd={canSwipeProjectInfoCard ? (event) => handleProjectTouchEnd(event, cardId) : undefined}
                        onMouseDown={canSwipeProjectInfoCard ? handleProjectMouseDown : undefined}
                        onMouseUp={canSwipeProjectInfoCard ? (event) => handleProjectMouseUp(event, cardId) : undefined}
                        onMouseLeave={canSwipeProjectInfoCard ? (event) => handleProjectMouseUp(event, cardId) : undefined}
                      >
                        <div className="absolute right-[3px] top-[4px] bottom-[4px] z-0 flex gap-[8px]">
                          {!isProjectViewOnly && (
                            <button
                              type="button"
                              className="flex w-[48px] shrink-0 self-stretch items-center justify-center rounded-[6px] bg-[#007233] text-white shadow-sm transition-colors hover:bg-[#22a882]"
                              aria-label="Edit"
                              onClick={() => openProjectInformationEditSheet(sourceIndex)}
                            >
                              <img src={editIconHistory} alt="Edit" className="w-[18px] h-[18px]" />
                            </button>
                          )}
                          {!isProjectViewOnly && (
                            <button
                              type="button"
                              className="flex w-[48px] shrink-0 self-stretch items-center justify-center rounded-[6px] bg-[#E4572E] text-white shadow-sm transition-colors hover:bg-[#cc4d26]"
                              aria-label="Delete"
                              onClick={() => setProjectInformationDeleteConfirmIndex(sourceIndex)}
                            >
                              <img src={deleteIcon} alt="Delete" className="w-[18px] h-[18px]" />
                            </button>
                          )}
                        </div>

                        <div
                          className={`relative z-[1] rounded-[12px] border border-[#E8E8E8] bg-white px-[16px] pr-[20px] py-[10px] transition-transform duration-200 ${canSwipeProjectInfoCard && swipedProjectId === cardId ? '-translate-x-[110px]' : 'translate-x-0'
                            }`}
                        >
                          <div className="space-y-[2px] text-[11px] font-semibold leading-[1.35] text-[#111111]">
                            <div className="flex items-center justify-between gap-[10px]">
                              <span className="">{preview.row1Left}</span>
                              <span className="">{preview.row1Right}</span>
                            </div>
                            <div className="flex items-center justify-between gap-[10px]">
                              <span>{preview.row2Left}</span>
                              <span>{preview.row2Right}</span>
                            </div>
                            <div className="flex items-center justify-between gap-[10px]">
                              <span>{preview.row3Left}</span>
                              <span className="text-[#C79B53]">{preview.row3Right}</span>
                            </div>
                            <div className="flex items-center justify-between gap-[10px]">
                              <span>{preview.row4Left}</span>
                              <span className="text-[#C79B53]">{preview.row4Right}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

            </div>
          )}
        </div>
      </div>

      {typeof document !== 'undefined' &&
        projectInformationDeleteConfirmIndex !== null &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Close overlay"
              onClick={() => setProjectInformationDeleteConfirmIndex(null)}
              className="fixed inset-0 z-[20000] bg-black/60"
            />
            <div className="fixed inset-0 z-[20001] flex items-center justify-center px-[16px] pointer-events-none">
              <div
                className="pointer-events-auto w-full max-w-[330px] rounded-[14px] bg-white px-[18px] pt-[16px] pb-[18px] shadow-[0px_10px_30px_rgba(0,0,0,0.22)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-[10px] text-center text-[16px] font-semibold text-black">Delete this card?</div>
                <div className="mb-[16px] text-center text-[13px] text-[#444444]">
                  This project information entry will be removed from the list.
                </div>
                <div className="grid grid-cols-2 gap-[12px]">
                  <button
                    type="button"
                    onClick={() => setProjectInformationDeleteConfirmIndex(null)}
                    className="h-[44px] rounded-[8px] border border-[#BEBEBE] bg-white text-[14px] font-medium text-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const idx = projectInformationDeleteConfirmIndex;
                      setProjectInformationDeleteConfirmIndex(null);
                      if (idx !== null && idx !== undefined) handleProjectInformationDelete(idx);
                    }}
                    className="h-[44px] rounded-[8px] bg-[#E4572E] text-[14px] font-semibold text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}

      {isProjectPictureModalOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsProjectPictureModalOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/60"
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-[16px]">
            <div
              className="w-full max-w-[330px] rounded-[14px] bg-white px-[18px] pt-[16px] pb-[18px] shadow-[0px_10px_30px_rgba(0,0,0,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-[12px] text-center">
                <div className="text-[16px] font-semibold text-black">Project Picture</div>
                <div className="mt-[2px] text-[11px] text-black">Uploaded Photo</div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setIsProjectPictureModalOpen(false)}
                  className="absolute right-0 top-0 text-[#F26B3A]"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 5L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="mx-auto mb-[12px] w-full max-w-[220px] rounded-[12px] border border-[#DEDEDE] bg-[#FAFAFA] p-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[8px] border-[3px] border-[#CFCFCF] bg-[#E8E8E8] shadow-[inset_0_3px_10px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.65)]">
                  {projectPictureDraft ? (
                    <img src={projectPictureDraft} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <svg className="h-[56px] w-[56px] text-[#B5B5B5]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <rect x="6" y="10" width="52" height="44" rx="4" stroke="currentColor" strokeWidth="1.75" />
                      <circle cx="44" cy="22" r="5" fill="currentColor" fillOpacity="0.4" />
                      <path
                        d="M8 48 L24 24 L36 40 L48 28 L56 36 V52 H8 Z"
                        fill="currentColor"
                        fillOpacity="0.32"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                id="projectPictureFileInput"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === 'string' ? reader.result : '';
                    setProjectPictureDraft(result);
                  };
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
              />

              <button
                type="button"
                onClick={() => document.getElementById('projectPictureFileInput')?.click()}
                className="mb-[12px] h-[40px] w-full rounded-[8px] border border-[#D9D9D9] bg-white text-[14px] font-medium text-black"
              >
                Upload Photo
              </button>

              <button
                type="button"
                onClick={() => {
                  setProjectForm((s) => ({ ...s, projectPicture: projectPictureDraft }));
                  setIsProjectPictureModalOpen(false);
                }}
                className="h-[44px] w-full rounded-[8px] bg-black text-[14px] font-semibold text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </>
      )}

      {isProjectLocationSheetOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsProjectLocationSheetOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/50"
          />

          <div className="fixed inset-x-0 bottom-0 z-[10000] mx-auto w-full rounded-t-[18px] bg-white px-[16px] pb-[16px] pt-[18px] shadow-[0px_-4px_20px_rgba(0,0,0,0.12)]">
            <div className="mb-[14px] flex items-start justify-between">
              <div className="text-[15px] font-semibold text-black">Location Details</div>
              <button
                type="button"
                onClick={() => setIsProjectLocationSheetOpen(false)}
                className="text-[28px] leading-none text-[#F26B3A]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div
              className={
                projectFormMode === 'edit' &&
                  (isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon)
                  ? '[&_input]:bg-[#EDEDED]'
                  : ''
              }
            >
              {renderInput({
                label: 'Latitude & Longitude',
                required: true,
                placeholder: 'Example: 9°31\'53.5"N 77°38\'01.9"E',
                value: projectForm.latitudeLongitude,
                readOnly:
                  projectFormMode === 'edit'
                    ? isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false,
                onChange: (e) => setProjectForm((s) => ({ ...s, latitudeLongitude: e.target.value }))
              })}
            </div>

            <div className="mt-[16px] grid grid-cols-2 gap-[14px]">
              <button
                type="button"
                onClick={() => setIsProjectLocationSheetOpen(false)}
                className="h-[38px] rounded-[8px] border border-[#BEBEBE] bg-white text-[14px] font-medium text-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsProjectLocationSheetOpen(false)}
                className="h-[38px] rounded-[8px] bg-black text-[14px] font-medium text-white"
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}

      {isProjectQrModalOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsProjectQrModalOpen(false)}
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
                  onClick={() => setIsProjectQrModalOpen(false)}
                  className="absolute right-0 top-0 text-[#F26B3A]"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 5L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="mx-auto mb-[12px] flex h-[160px] w-[200px] items-center justify-center rounded-[10px] border border-[#E6E6E6] bg-white">
                {projectQrPreview || projectForm.qrCode ? (
                  <img
                    src={projectQrPreview || projectForm.qrCode}
                    alt="QR Code"
                    className="h-[140px] w-[140px] object-contain"
                  />
                ) : (
                  <img src={AccountQrCodeImage} alt="QR Code" className="h-[140px] w-[140px] object-contain" />
                )}
              </div>

              <input
                value={projectForm.upiId || ''}
                onChange={(e) => setProjectForm((s) => ({ ...s, upiId: e.target.value }))}
                readOnly={
                  projectFormMode === 'edit'
                    ? isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false
                }
                placeholder="9876543210@Axis"
                className="mb-[10px] h-[34px] w-full rounded-[6px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
              />

              <input
                type="file"
                accept="image/*"
                id="projectAccountQrUpload"
                className="hidden"
                disabled={
                  projectFormMode === 'edit'
                    ? isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                    : false
                }
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === 'string' ? reader.result : '';
                    setProjectQrPreview(result);
                    setProjectForm((s) => ({ ...s, qrCode: result }));
                  };
                  reader.readAsDataURL(file);
                }}
              />

              {!(projectFormMode === 'edit'
                ? isProjectViewOnly || !canEditMasterData || !uploadFileRowShowsSaveIcon
                : false) && (
                <>
                  <button
                    type="button"
                    onClick={() => document.getElementById('projectAccountQrUpload')?.click()}
                    className="mb-[12px] h-[36px] w-full rounded-[6px] border border-[#D9D9D9] bg-white text-[13px] font-medium text-black"
                  >
                    Update QR Code
                  </button>

                  <button type="button" className="h-[44px] w-full rounded-[8px] bg-black text-[14px] font-semibold text-white">
                    Update
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {isAddOnSheetOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => {
              setIsAddOnSheetOpen(false);
              setEditingProjectPropertyIndex(null);
              setAddOnBillForm({ ...EMPTY_PROJECT_PROPERTY });
            }}
            className="fixed inset-0 z-[9999] bg-black/50"
          />

          <div className="fixed inset-x-0 bottom-0 z-[10000] mx-auto w-full rounded-t-[18px] bg-white px-[16px] pb-[16px] pt-[18px] shadow-[0px_-4px_20px_rgba(0,0,0,0.12)]">
            <div className="mb-[10px] flex items-start justify-between">
              <div className="text-[15px] font-semibold text-black">Enter Project Information</div>
              <button
                type="button"
                onClick={() => {
                  setIsAddOnSheetOpen(false);
                  setEditingProjectPropertyIndex(null);
                  setAddOnBillForm({ ...EMPTY_PROJECT_PROPERTY });
                }}
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
                  value: addOnBillForm.projectType,
                  readOnly: true,
                  onClick: () => {
                    if (isProjectOptionSelectionEnabled) setIsProjectTypeModalOpen(true);
                  },
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  rightIconInteractive: true,
                  onRightIconClick: () => {
                    if (isProjectOptionSelectionEnabled) setIsProjectTypeModalOpen(true);
                  }
                })}
                {renderInput({
                  label: 'Floor Name',
                  required: true,
                  placeholder: 'Select',
                  value: addOnBillForm.floorName,
                  readOnly: true,
                  onClick: () => {
                    if (isProjectOptionSelectionEnabled) setIsProjectFloorNameModalOpen(true);
                  },
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  rightIconInteractive: true,
                  onRightIconClick: () => {
                    if (isProjectOptionSelectionEnabled) setIsProjectFloorNameModalOpen(true);
                  }
                })}
              </div>

              <div className="grid min-w-0 grid-cols-2 gap-[12px] [&>div]:min-w-0">
                <div className="grid min-w-0 grid-cols-[minmax(72px,96px)_minmax(0,1fr)] gap-[8px] [&>div]:min-w-0">
                  {renderInput({
                    label: 'Shop No',
                    required: true,
                    placeholder: 'Enter',
                    value: addOnBillForm.shopNo,
                    readOnly: false,
                    onChange: (e) => setAddOnBillForm((s) => ({ ...s, shopNo: e.target.value })),
                    numericOnly: true
                  })}
                  {renderInput({
                    label: 'Door No',
                    required: true,
                    placeholder: 'Enter',
                    value: addOnBillForm.doorNo,
                    readOnly: false,
                    onChange: (e) => setAddOnBillForm((s) => ({ ...s, doorNo: e.target.value })),
                    numericOnly: true
                  })}
                </div>
                <div className="min-w-0">
                  {renderInput({
                    label: 'Area (Sqft)',
                    required: true,
                    placeholder: 'Enter Area',
                    value: addOnBillForm.area,
                    readOnly: false,
                    onChange: (e) => setAddOnBillForm((s) => ({ ...s, area: e.target.value })),
                    numericOnly: true
                  })}
                </div>
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[8px]">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <label className="block text-left text-[12px] font-medium text-black">
                      EB.No
                      <span className="text-[#E26D47]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (isProjectOptionSelectionEnabled) setIsProjectEbPhaseModalOpen(true);
                      }}
                      className="text-[12px] font-medium text-black"
                    >
                      {addOnBillForm.ebNoPhase || '1 Phase'}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter Number"
                    className=" h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none"
                    value={addOnBillForm.ebNo}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) =>
                      setAddOnBillForm((s) => ({ ...s, ebNo: String(e.target.value || '').replace(/\D+/g, '') }))
                    }
                  />
                </div>
                {renderInput({
                  label: 'Property Tax No',
                  required: true,
                  placeholder: 'Enter Number',
                  value: addOnBillForm.propertyTaxNo,
                  readOnly: false,
                  onChange: (e) => setAddOnBillForm((s) => ({ ...s, propertyTaxNo: e.target.value })),
                  numericOnly: true
                })}
              </div>

              {renderInput({
                label: 'Water Tax No',
                required: true,
                placeholder: 'Enter Number',
                value: addOnBillForm.waterTaxNo,
                readOnly: false,
                onChange: (e) => setAddOnBillForm((s) => ({ ...s, waterTaxNo: e.target.value })),
                numericOnly: true
              })}
            </div>

            <div className="mt-[16px] mb-[10px] grid grid-cols-2 gap-[14px]">
              <button
                type="button"
                onClick={() => {
                  setIsAddOnSheetOpen(false);
                  setEditingProjectPropertyIndex(null);
                  setAddOnBillForm({ ...EMPTY_PROJECT_PROPERTY });
                }}
                className="h-[38px] rounded-[8px] border border-[#BEBEBE] bg-white text-[14px] font-medium text-[#3A3A3A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProjectInformationSubmit}
                className="h-[38px] rounded-[8px] bg-black text-[14px] font-medium text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </>
      )}

      <SelectVendorModal
        isOpen={isProjectCategoryModalOpen}
        onClose={() => setIsProjectCategoryModalOpen(false)}
        onSelect={(value) => setProjectForm((s) => ({ ...s, projectCategory: value || '' }))}
        selectedValue={projectForm.projectCategory || ''}
        options={['Client Project', 'Own Project']}
        fieldName="Project Category"
        showStarIcon={false}
      />

      <SelectVendorModal
        isOpen={isProjectBranchModalOpen}
        onClose={() => setIsProjectBranchModalOpen(false)}
        onSelect={(value) => setProjectForm((s) => ({ ...s, branch: value || '' }))}
        selectedValue={projectForm.branch || ''}
        options={BRANCH_OPTIONS}
        fieldName="Branch"
        showStarIcon={false}
      />

      <SelectVendorModal
        isOpen={isProjectTypeModalOpen}
        onClose={() => setIsProjectTypeModalOpen(false)}
        onSelect={(value) => setAddOnBillForm((s) => ({ ...s, projectType: value || '' }))}
        selectedValue={addOnBillForm.projectType || ''}
        options={PROJECT_TYPE_OPTIONS}
        fieldName="Project Type"
        showStarIcon={false}
      />

      <SelectVendorModal
        isOpen={isProjectFloorNameModalOpen}
        onClose={() => setIsProjectFloorNameModalOpen(false)}
        onSelect={(value) => setAddOnBillForm((s) => ({ ...s, floorName: value || '' }))}
        selectedValue={addOnBillForm.floorName || ''}
        options={FLOOR_NAME_OPTIONS}
        fieldName="Floor Name"
        showStarIcon={false}
        preserveOrder
      />

      <SelectVendorModal
        isOpen={isProjectEbPhaseModalOpen}
        onClose={() => setIsProjectEbPhaseModalOpen(false)}
        onSelect={(value) => setAddOnBillForm((s) => ({ ...s, ebNoPhase: value || '1 Phase' }))}
        selectedValue={addOnBillForm.ebNoPhase || '1 Phase'}
        options={EB_PHASE_OPTIONS}
        fieldName="Phase"
        showStarIcon={false}
      />

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
        const ordered = bankDetailsSortReversed ? [...filtered].reverse() : filtered;
        return (
          <div className="bg-white">
            {ordered.map((value, index) => (
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
                  className={`grid grid-cols-[28px_minmax(0,1fr)] items-center bg-white px-[14px] py-[10px] transition-transform duration-200 ${swipedProjectId === `${sectionKey}-${value}-${index}` ? '-translate-x-[70px]' : 'translate-x-0'
                    }`}
                >
                  <span className="text-[13px] font-medium text-black text-left">{index + 1}</span>
                  <span className="text-[13px] font-medium text-black text-left">{value}</span>
                </div>
              </div>
            ))}
            {ordered.length === 0 && (
              <div className="px-[16px] py-[18px] text-center text-[13px] text-[#7A7A7A]">No data found</div>
            )}
          </div>
        );
      };

      return (
        <>
          <div className="px-[2px] mt-[8px]">
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
                className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-black text-white"
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

          <div className="px-[2px] mt-[8px]">
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
      <div
        className="flex flex-col overflow-hidden"
        style={{ height: 'calc(100vh - 126px - 60px - 18px - env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="shrink-0 px-[2px] mt-[8px]">
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
              className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-black text-white"
              aria-label="Add"
              onClick={() => {
                if (selectedItem === 'Vendor Name') {
                  setVendorFormMode('new');
                  setIsVendorViewOnly(false);
                  setIsAddVendorViewOpen(true);
                  setExpandedVendorSection('vendor-image');
                  setVendorQrPreview('');
                  setVendorQrFile(null);
                  setVendorPictureFile(null);
                  setVendorForm({
                    vendorName: '',
                    vendorCategory: '',
                    vendorId: '',
                    contactNumber: '',
                    referenceName: '',
                    branch: '',
                    emailId: '',
                    vendorAddress: '',
                    latitudeLongitude: '',
                    location: '',
                    accountHolderName: '',
                    qrCode: '',
                    accountNumber: '',
                    bankName: '',
                    ifscCode: '',
                    upiPhoneNumber: '',
                    upiId: '',
                    vendorPicture: ''
                  });
                } else if (selectedItem === 'Contractor Name' || selectedItem === 'Support Associate Name') {
                  setContractorFormMode('new');
                  setIsContractorViewOnly(false);
                  setIsAddContractorViewOpen(true);
                  setExpandedContractorSection('contractor-image');
                  setContractorQrPreview('');
                  setContractorQrFile(null);
                  setContractorPictureDraft('');
                  setContractorPictureFile(null);
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
                    upiId: '',
                    contractorProfileUrl: ''
                  });
                } else if (selectedItem === 'Categories') {
                  setCategoryFormMode('new');
                  setIsCategoryViewOnly(false);
                  setIsAddCategoryViewOpen(true);
                  setExpandedCategorySection('category-image');
                  setCategoryForm({ categoryName: '' });
                } else if (selectedItem === 'Machine tools') {
                  setMachineFormMode('new');
                  setIsMachineViewOnly(false);
                  setIsAddMachineViewOpen(true);
                  setExpandedMachineSection('machine-image');
                  setMachineForm({ machineName: '' });
                } else if (selectedItem === 'Employee Details') {
                  setEmployeeFormMode('new');
                  setIsEmployeeViewOnly(false);
                  setIsAddEmployeeViewOpen(true);
                  setExpandedEmployeeSection('employee-image');
                  setIsEmployeeQrModalOpen(false);
                  setEmployeeQrPreview('');
                  setIsEmployeeAadhaarModalOpen(false);
                  setEmployeeAadhaarFile(null);
                  setEmployeeImage('');
                  setEmployeeForm({
                    employeeDbId: '',
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
                    upiId: '',
                    aadhaarImageUrl: ''
                  });
                } else if (selectedItem === 'Account Details') {
                  setAccountFormMode('new');
                  setIsAccountViewOnly(false);
                  setIsAddAccountViewOpen(true);
                  setExpandedAccountSection('account-image');
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
                  setIsLabourViewOnly(false);
                  setIsAddLabourViewOpen(true);
                  setExpandedLabourSection('labour-image');
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

        <div className="flex min-h-0 flex-1 items-start px-[2px] pt-[12px] pb-[4px]">
          <div className="flex max-h-full w-full flex-col overflow-hidden rounded-[14px] bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
            <div className="h-[32px] border-b border-[#EFEFEF] bg-[#F8F8F8] px-[14px]">
              <div className="flex w-full min-w-0 items-center justify-between gap-[8px]">
                <div className="flex min-w-0 items-center">
                  <span className="w-[28px] shrink-0" />
                  <div className="flex min-w-0 items-center gap-[6px]">
                    <span className="truncate text-[14px] font-semibold text-black">{selectedItem}</span>
                    <button
                      type="button"
                      aria-label="Toggle list order"
                      className="flex h-[28px] w-[28px] shrink-0 items-center justify-center p-0"
                      onClick={() => setMasterTableSortReversed((prev) => !prev)}
                    >
                      <img src={masterTableSortReversed ? UpDownFilter : FilterUp} alt="" className="h-[16px] w-[16px]" />
                    </button>
                  </div>
                </div>
                {selectedItem === 'Company Labour' ? (
                  <button
                    type="button"
                    aria-label="Share labour list as PDF"
                    className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[6px]"
                    onClick={handleCompanyLabourListShare}
                  >
                    <img src={Share} alt="Share" className="h-[12px] w-[12px]" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none no-scrollbar">
              {isListLoading ? (
                <div className="px-[16px] py-[24px] text-center text-[13px] text-[#7A7A7A]">
                  Loading...
                </div>
              ) : filteredList.length === 0 ? (
                <div className="px-[16px] py-[24px] text-center text-[13px] text-[#7A7A7A]">
                  No data found
                </div>
              ) : (
                displayedList.map((item, index) => {
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
                              setIsVendorViewOnly(false);
                              setVendorForm(next);
                              setVendorQrPreview(next.qrCode || '');
                              setVendorQrFile(null);
                              setVendorPictureFile(null);
                              setExpandedVendorSection(hasImageFile(next.vendorPicture) ? 'vendor-image' : 'vendor-details');
                              setIsAddVendorViewOpen(true);
                              return;
                            }

                            if (selectedItem === 'Contractor Name' || selectedItem === 'Support Associate Name') {
                              const next = normalizeContractorForForm(item);
                              setContractorFormMode('edit');
                              setIsContractorViewOnly(false);
                              setContractorForm(next);
                              setContractorQrPreview(next.qrCode || '');
                              setContractorQrFile(null);
                              setContractorPictureDraft(next.contractorProfileUrl || '');
                              setContractorPictureFile(null);
                              setExpandedContractorSection(hasImageFile(next.contractorProfileUrl) ? 'contractor-image' : 'contractor-details');
                              setIsAddContractorViewOpen(true);
                              return;
                            }

                            if (selectedItem === 'Categories') {
                              const next = normalizeCategoryForForm(item);
                              const nextCategoryImage = pickImageValue(
                                item?.categoryImage,
                                item?.category_image,
                                item?.image,
                                item?.imageUrl,
                                item?.image_url,
                                item?.categoryProfileUrl,
                                item?.category_profile_url
                              );
                              setCategoryFormMode('edit');
                              setIsCategoryViewOnly(false);
                              setCategoryForm(next);
                              setCategoryImage(nextCategoryImage);
                              setExpandedCategorySection(hasImageFile(nextCategoryImage) ? 'category-image' : 'category-details');
                              setIsAddCategoryViewOpen(true);
                              return;
                            }

                            if (selectedItem === 'Machine tools') {
                              const next = normalizeMachineForForm(item);
                              const nextMachineImage = pickImageValue(
                                item?.machineImage,
                                item?.machine_image,
                                item?.image,
                                item?.imageUrl,
                                item?.image_url,
                                item?.machineProfileUrl,
                                item?.machine_profile_url
                              );
                              setMachineFormMode('edit');
                              setIsMachineViewOnly(false);
                              setMachineForm(next);
                              setMachineImage(nextMachineImage);
                              setExpandedMachineSection(hasImageFile(nextMachineImage) ? 'machine-image' : 'machine-details');
                              setIsAddMachineViewOpen(true);
                              return;
                            }

                            if (selectedItem === 'Employee Details') {
                              const next = normalizeEmployeeForForm(item);
                              const nextEmployeeImage = pickImageValue(
                                item?.employeeImage,
                                item?.employee_image,
                                item?.employeeProfileUrl,
                                item?.employee_profile_url,
                                item?.profileUrl,
                                item?.profile_url,
                                item?.image,
                                item?.imageUrl,
                                item?.image_url
                              );
                              setEmployeeFormMode('edit');
                              setIsEmployeeViewOnly(false);
                              setEmployeeForm(next);
                              setEmployeeQrPreview(next.qrCode || '');
                              setIsEmployeeAadhaarModalOpen(false);
                              setEmployeeAadhaarFile(null);
                              setEmployeeImage(nextEmployeeImage);
                              setExpandedEmployeeSection(hasImageFile(nextEmployeeImage) ? 'employee-image' : 'employee-details');
                              setIsAddEmployeeViewOpen(true);
                              return;
                            }

                            if (selectedItem === 'Account Details') {
                              const next = normalizeAccountForForm(item);
                              const nextAccountImage = pickImageValue(
                                item?.accountImage,
                                item?.account_image,
                                item?.accountProfileUrl,
                                item?.account_profile_url,
                                item?.profileUrl,
                                item?.profile_url,
                                item?.image,
                                item?.imageUrl,
                                item?.image_url
                              );
                              setAccountFormMode('edit');
                              setIsAccountViewOnly(false);
                              setAccountForm(next);
                              setAccountQrPreview(next.qrCode || '');
                              setAccountImage(nextAccountImage);
                              setExpandedAccountSection(hasImageFile(nextAccountImage) ? 'account-image' : 'account-details');
                              setIsAddAccountViewOpen(true);
                              return;
                            }

                            if (selectedItem === 'Company Labour') {
                              const next = normalizeLabourForForm(item);
                              const nextLabourImage = pickImageValue(
                                item?.labourImage,
                                item?.labour_image,
                                item?.labourProfileUrl,
                                item?.labour_profile_url,
                                item?.profileUrl,
                                item?.profile_url,
                                item?.image,
                                item?.imageUrl,
                                item?.image_url
                              );
                              setLabourFormMode('edit');
                              setIsLabourViewOnly(false);
                              setLabourForm(next);
                              setLabourQrPreview(next.qrCode || '');
                              setLabourImage(nextLabourImage);
                              setExpandedLabourSection(hasImageFile(nextLabourImage) ? 'labour-image' : 'labour-details');
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
                        className={`grid grid-cols-[28px_minmax(0,1fr)_auto] items-center bg-white px-[14px] py-[10px] transition-transform duration-200 ${isSwiped ? '-translate-x-[70px]' : 'translate-x-0'
                          }`}
                      >
                        <span className="text-[13px] font-medium text-black text-left">
                          {listSerialNumberByRowId.get(getListRowId(item, index)) ?? index + 1}
                        </span>
                        <span className="pr-[8px] text-[13px] font-medium text-black text-left">
                          <button
                            type="button"
                            className="cursor-pointer text-left"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedItem === 'Vendor Name') {
                                const next = normalizeVendorForForm(item);
                                setVendorFormMode('edit');
                                setIsVendorViewOnly(true);
                                setVendorForm(next);
                                setVendorQrPreview(next.qrCode || '');
                                setVendorQrFile(null);
                                setVendorPictureFile(null);
                                setExpandedVendorSection(hasImageFile(next.vendorPicture) ? 'vendor-image' : 'vendor-details');
                                setIsAddVendorViewOpen(true);
                                return;
                              }
                              if (selectedItem === 'Contractor Name' || selectedItem === 'Support Associate Name') {
                                const next = normalizeContractorForForm(item);
                                setContractorFormMode('edit');
                                setIsContractorViewOnly(true);
                                setContractorForm(next);
                                setContractorQrPreview(next.qrCode || '');
                                setContractorQrFile(null);
                                setContractorPictureDraft(next.contractorProfileUrl || '');
                                setContractorPictureFile(null);
                                setExpandedContractorSection(hasImageFile(next.contractorProfileUrl) ? 'contractor-image' : 'contractor-details');
                                setIsAddContractorViewOpen(true);
                                return;
                              }
                              if (selectedItem === 'Categories') {
                                const next = normalizeCategoryForForm(item);
                                const nextCategoryImage = pickImageValue(
                                  item?.categoryImage,
                                  item?.category_image,
                                  item?.image,
                                  item?.imageUrl,
                                  item?.image_url,
                                  item?.categoryProfileUrl,
                                  item?.category_profile_url
                                );
                                setCategoryFormMode('edit');
                                setIsCategoryViewOnly(true);
                                setCategoryForm(next);
                                setCategoryImage(nextCategoryImage);
                                setExpandedCategorySection(hasImageFile(nextCategoryImage) ? 'category-image' : 'category-details');
                                setIsAddCategoryViewOpen(true);
                                return;
                              }
                              if (selectedItem === 'Machine tools') {
                                const next = normalizeMachineForForm(item);
                                const nextMachineImage = pickImageValue(
                                  item?.machineImage,
                                  item?.machine_image,
                                  item?.image,
                                  item?.imageUrl,
                                  item?.image_url,
                                  item?.machineProfileUrl,
                                  item?.machine_profile_url
                                );
                                setMachineFormMode('edit');
                                setIsMachineViewOnly(true);
                                setMachineForm(next);
                                setMachineImage(nextMachineImage);
                                setExpandedMachineSection(hasImageFile(nextMachineImage) ? 'machine-image' : 'machine-details');
                                setIsAddMachineViewOpen(true);
                                return;
                              }
                              if (selectedItem === 'Employee Details') {
                                const next = normalizeEmployeeForForm(item);
                                const nextEmployeeImage = pickImageValue(
                                  item?.employeeImage,
                                  item?.employee_image,
                                  item?.employeeProfileUrl,
                                  item?.employee_profile_url,
                                  item?.profileUrl,
                                  item?.profile_url,
                                  item?.image,
                                  item?.imageUrl,
                                  item?.image_url
                                );
                                setEmployeeFormMode('edit');
                                setIsEmployeeViewOnly(true);
                                setEmployeeForm(next);
                                setEmployeeQrPreview(next.qrCode || '');
                                setIsEmployeeAadhaarModalOpen(false);
                                setEmployeeAadhaarFile(null);
                                setEmployeeImage(nextEmployeeImage);
                                setExpandedEmployeeSection(hasImageFile(nextEmployeeImage) ? 'employee-image' : 'employee-details');
                                setIsAddEmployeeViewOpen(true);
                                return;
                              }
                              if (selectedItem === 'Account Details') {
                                const next = normalizeAccountForForm(item);
                                const nextAccountImage = pickImageValue(
                                  item?.accountImage,
                                  item?.account_image,
                                  item?.accountProfileUrl,
                                  item?.account_profile_url,
                                  item?.profileUrl,
                                  item?.profile_url,
                                  item?.image,
                                  item?.imageUrl,
                                  item?.image_url
                                );
                                setAccountFormMode('edit');
                                setIsAccountViewOnly(true);
                                setAccountForm(next);
                                setAccountQrPreview(next.qrCode || '');
                                setAccountImage(nextAccountImage);
                                setExpandedAccountSection(hasImageFile(nextAccountImage) ? 'account-image' : 'account-details');
                                setIsAddAccountViewOpen(true);
                                return;
                              }
                              if (selectedItem === 'Company Labour') {
                                const next = normalizeLabourForForm(item);
                                const nextLabourImage = pickImageValue(
                                  item?.labourImage,
                                  item?.labour_image,
                                  item?.labourProfileUrl,
                                  item?.labour_profile_url,
                                  item?.profileUrl,
                                  item?.profile_url,
                                  item?.image,
                                  item?.imageUrl,
                                  item?.image_url
                                );
                                setLabourFormMode('edit');
                                setIsLabourViewOnly(true);
                                setLabourForm(next);
                                setLabourQrPreview(next.qrCode || '');
                                setLabourImage(nextLabourImage);
                                setExpandedLabourSection(hasImageFile(nextLabourImage) ? 'labour-image' : 'labour-details');
                                setIsAddLabourViewOpen(true);
                              }
                            }}
                          >
                            {getItemPrimaryText(item, selectedItem)}
                          </button>
                        </span>
                        {selectedItem === 'Account Details' ? (
                          <button
                            type="button"
                            className="max-w-[120px] truncate text-[12px] font-medium text-[#2B2B2B]  underline-offset-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              const next = normalizeAccountForForm(item);
                              setAccountDetailsPreview({
                                accountHolderName: next.accountHolderName || '',
                                bankName: next.bankName || '',
                                accountNumber: next.accountNumber || '',
                                ifscCode: next.ifscCode || '',
                                branchName: next.branch || next.accountBranch || '',
                                contactNumber:
                                  item?.contactNumber ||
                                  item?.contact_number ||
                                  item?.mobileNumber ||
                                  item?.mobile_number ||
                                  '',
                                contactEmail: item?.emailId || item?.email || item?.email_id || ''
                              });
                              setIsAccountDetailsPreviewOpen(true);
                            }}
                          >
                            {item?.accountNumber || item?.account_number || '-'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProjectNameView = () => (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 126px - 60px - 18px - env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="shrink-0 px-[2px] mt-[8px]">
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
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-black text-white"
            aria-label="Add"
            onClick={() => {
              setProjectFormMode('new');
              setProjectQrPreview('');
              setIsProjectQrModalOpen(false);
              setProjectPropertyDetails([]);
              setEditingProjectPropertyIndex(null);
              setAddOnBillForm({ ...EMPTY_PROJECT_PROPERTY });
              setProjectForm({
                projectDbId: '',
                projectName: '',
                projectId: generateNextProjectId(),
                projectCategory: '',
                referenceName: '',
                branch: '',
                projectAddress: '',
                latitudeLongitude: '',
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
                upiId: '',
                projectPicture: ''
              });
              setIsAddProjectViewOpen(true);
              setExpandedProjectSection('project-image');
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M3 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-start px-[2px] mt-[8px] pb-[4px]">
        <div className="flex max-h-full w-full flex-col overflow-hidden rounded-[10px] bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
          <div className="h-[32px] border-b border-[#EFEFEF] bg-[#F8F8F8] px-[14px]">
            <div className="flex items-center">
              <span className="w-[28px]" />
              <div className="flex items-center gap-[6px]">
                <span className="text-[14px] font-semibold text-black">Project Name</span>
                <button
                  type="button"
                  aria-label="Toggle list order"
                  className="flex h-[28px] w-[28px] shrink-0 items-center justify-center p-0"
                  onClick={() => setMasterTableSortReversed((prev) => !prev)}
                >
                  <img src={masterTableSortReversed ? UpDownFilter : FilterUp} alt="" className="h-[16px] w-[16px]" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectNameCategoryFilterModalOpen(true)}
                className="ml-auto text-[12px] font-medium text-black bg-transparent"
                aria-label="Project category filter"
              >
                {projectNameCategoryFilter}
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none no-scrollbar">
            {isProjectsLoading ? (
              <div className="px-[16px] py-[24px] text-center text-[13px] text-[#7A7A7A]">
                Loading...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="px-[16px] py-[24px] text-center text-[13px] text-[#7A7A7A]">
                No projects found
              </div>
            ) : (
              displayedProjects.map((item, index) => {
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
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = normalizeProjectForForm(item);
                          const propertyNext = normalizeProjectPropertyForForm(item);
                          setProjectFormMode('edit');
                          setProjectForm(next);
                          setProjectPropertyDetails(propertyNext);
                          setEditingProjectPropertyIndex(null);
                          setAddOnBillForm(propertyNext[0] || { ...EMPTY_PROJECT_PROPERTY });
                          setProjectQrPreview(next.qrCode || '');
                          setIsProjectViewOnly(false);
                          setIsAddProjectViewOpen(true);
                          setExpandedProjectSection(hasImageFile(next.projectPicture) ? 'project-image' : 'project-details');
                        }}
                      >
                        <img src={editIcon} alt="Edit" className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        type="button"
                        className="flex h-[36px] w-[30px] items-center justify-center rounded-[2px] bg-[#F26B3A] text-white"
                        aria-label="Delete"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img src={deleteIcon} alt="Delete" className="w-[18px] h-[18px]" />
                      </button>
                    </div>

                    <div
                      className={`grid grid-cols-[28px_minmax(0,1fr)_auto] items-center bg-white px-[14px] py-[10px] transition-transform duration-200 ${isSwiped ? '-translate-x-[70px]' : 'translate-x-0'
                        }`}
                    >
                      <span className="text-[13px] font-medium text-black text-left">
                        {getProjectSerialNumber(item, index)}
                      </span>
                      <span className="pr-[8px] text-[13px] font-medium text-black text-left">
                        <button
                          type="button"
                          className="cursor-pointer text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = normalizeProjectForForm(item);
                            const propertyNext = normalizeProjectPropertyForForm(item);
                            setProjectFormMode('edit');
                            setProjectForm(next);
                            setProjectPropertyDetails(propertyNext);
                            setEditingProjectPropertyIndex(null);
                            setAddOnBillForm(propertyNext[0] || { ...EMPTY_PROJECT_PROPERTY });
                            setProjectQrPreview(next.qrCode || '');
                            setUploadFileRowShowsSaveIcon(false);
                            setIsProjectViewOnly(true);
                            setIsAddProjectViewOpen(true);
                            setExpandedProjectSection(hasImageFile(next.projectPicture) ? 'project-image' : 'project-details');
                          }}
                        >
                          {item.projectName || ''}
                        </button>
                      </span>
                      <span
                        className={`text-[12px] font-medium text-left ${item.projectCategory === 'Client Project'
                          ? 'text-[#C79B53]'
                          : item.projectCategory === 'Own Project'
                            ? 'text-[#7A7A7A]'
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
    </div>
  );

  const updateActionTextClass = hasFormChanges ? 'text-black' : 'text-[#9A9A9A]';
  const isHeaderActionDisabled = !hasFormChanges;
  const getHeaderActionClass = (enabledClass = 'text-black', disabledClass = 'text-[#9A9A9A]') =>
    hasFormChanges ? enabledClass : disabledClass;

  const getActiveFormValidationMessage = () => {
    const clean = (value) => String(value ?? '').trim();

    if (selectedItem === 'Project Name' && isAddProjectViewOpen) {
      if (!clean(projectForm.projectName)) return 'Project Name is mandatory.';
      if (!clean(projectForm.projectCategory)) return 'Project Category is mandatory.';
      return '';
    }

    if (selectedItem === 'Vendor Name' && isAddVendorViewOpen) {
      return clean(vendorForm.vendorName) ? '' : 'Vendor Name is mandatory.';
    }

    if ((selectedItem === 'Contractor Name' || selectedItem === 'Support Associate Name') && isAddContractorViewOpen) {
      return clean(contractorForm.contractorName)
        ? ''
        : `${selectedItem === 'Support Associate Name' ? 'Associate Name' : 'Contractor Name'} is mandatory.`;
    }

    if (selectedItem === 'Categories' && isAddCategoryViewOpen) {
      return clean(categoryForm.categoryName) ? '' : 'Category Name is mandatory.';
    }

    if (selectedItem === 'Machine tools' && isAddMachineViewOpen) {
      return clean(machineForm.machineName) ? '' : 'Machine Name is mandatory.';
    }

    if (selectedItem === 'Employee Details' && isAddEmployeeViewOpen) {
      return clean(employeeForm.employeeName) ? '' : 'Employee Name is mandatory.';
    }

    if (selectedItem === 'Company Labour' && isAddLabourViewOpen) {
      return clean(labourForm.labourName) ? '' : 'Labour Name is mandatory.';
    }

    if (selectedItem === 'Account Details' && isAddAccountViewOpen) {
      return clean(accountForm.accountHolderName) ? '' : 'Account Holder Name is mandatory.';
    }

    if (selectedItem === 'Bank Details' && isBankNameFormOpen) {
      return clean(bankNameForm.bankName) ? '' : 'Bank Name is mandatory.';
    }

    if (selectedItem === 'Bank Details' && isBankTypeFormOpen) {
      return clean(bankTypeForm.accountType) ? '' : 'Account Type is mandatory.';
    }

    if (selectedItem === 'Bank Details' && isBankLocationFormOpen) {
      return clean(bankLocationForm.branchName) ? '' : 'Branch Name is mandatory.';
    }

    return '';
  };

  const addEditFormHeaderSubRow =
    selectedItem === 'Bank Details' && isBankNameFormOpen ? (
      <>
        <div className="flex min-w-0 flex-1 items-center truncate text-[11px] text-[#A4A4A4]">
          <button
            type="button"
            onClick={() => {
              setIsBankNameFormOpen(false);
              setSelectedItem(null);
            }}
            className="truncate text-[11px] text-[#A4A4A4]"
          >
            Master Table
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <button
            type="button"
            onClick={() => setIsBankNameFormOpen(false)}
            className="truncate text-[11px] text-[#A4A4A4]"
          >
            Bank Name
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <span className="shrink-0 font-medium text-black">{bankNameFormMode === 'edit' ? 'Edit' : 'New'}</span>
        </div>
        <button
          type="button"
          onClick={handleHeaderSubmit}
          disabled={isHeaderActionDisabled}
          className={`shrink-0 text-[12px] font-medium ${bankNameFormMode === 'edit' ? updateActionTextClass : getHeaderActionClass()}`}
        >
          {bankNameFormMode === 'edit' ? 'Update' : 'Submit'}
        </button>
      </>
    ) : selectedItem === 'Bank Details' && isBankTypeFormOpen ? (
      <>
        <div className="flex min-w-0 flex-1 items-center truncate text-[11px] text-[#A4A4A4]">
          <button
            type="button"
            onClick={() => {
              setIsBankTypeFormOpen(false);
              setSelectedItem(null);
            }}
            className="truncate text-[11px] text-[#A4A4A4]"
          >
            Master Table
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <button
            type="button"
            onClick={() => setIsBankTypeFormOpen(false)}
            className="truncate text-[11px] text-[#A4A4A4]"
          >
            Account Type
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <span className="shrink-0 font-medium text-black">{bankTypeFormMode === 'edit' ? 'Edit' : 'New'}</span>
        </div>
        <button
          type="button"
          onClick={handleHeaderSubmit}
          disabled={isHeaderActionDisabled}
          className={`shrink-0 text-[12px] font-medium ${bankTypeFormMode === 'edit' ? updateActionTextClass : getHeaderActionClass()}`}
        >
          {bankTypeFormMode === 'edit' ? 'Update' : 'Submit'}
        </button>
      </>
    ) : selectedItem === 'Bank Details' && isBankLocationFormOpen ? (
      <>
        <div className="flex min-w-0 flex-1 items-center truncate text-[11px] text-[#A4A4A4]">
          <button
            type="button"
            onClick={() => {
              setIsBankLocationFormOpen(false);
              setSelectedItem(null);
            }}
            className="truncate text-[11px] text-[#A4A4A4]"
          >
            Master Table
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <button
            type="button"
            onClick={() => setIsBankLocationFormOpen(false)}
            className="truncate text-[11px] text-[#A4A4A4]"
          >
            Branch Name
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <span className="shrink-0 font-medium text-black">{bankLocationFormMode === 'edit' ? 'Edit' : 'New'}</span>
        </div>
        <button
          type="button"
          onClick={handleHeaderSubmit}
          disabled={isHeaderActionDisabled}
          className={`shrink-0 text-[12px] font-medium ${bankLocationFormMode === 'edit' ? updateActionTextClass : getHeaderActionClass()}`}
        >
          {bankLocationFormMode === 'edit' ? 'Update' : 'Submit'}
        </button>
      </>
    ) : selectedItem === 'Project Name' && isAddProjectViewOpen ? (
      <>
        <div className="flex min-w-0 flex-1 items-center truncate text-[11px] text-[#A4A4A4]">
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
          <span className="px-[4px] shrink-0">&gt;</span>
          <button
            type="button"
            onClick={() => setIsAddProjectViewOpen(false)}
            className="truncate text-[11px] text-[#A4A4A4]"
          >
            Project Name
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <span className="shrink-0 font-medium text-black">
            {projectFormMode === 'edit' ? (isProjectViewOnly ? 'View' : 'Edit') : 'New'}
          </span>
        </div>
        {projectFormMode === 'edit' && isProjectViewOnly ? (
          <div className="shrink-0 inline-flex items-center gap-[8px]">
            <button
              type="button"
              onClick={handleHeaderSubmit}
              className={`text-[12px] font-semibold ${updateActionTextClass}`}
            >
              Update
            </button>
            {canEditMasterData && (
              <button
                type="button"
                aria-label="Edit"
                className="inline-flex items-center justify-center p-[2px]"
                onClick={() => setIsProjectViewOnly(false)}
              >
                <img src={editblack} alt="" className="h-[14px] w-[14px] object-contain" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleHeaderSubmit}
            disabled={isHeaderActionDisabled}
            className={`shrink-0 text-[12px] font-medium ${projectFormMode === 'edit' ? updateActionTextClass : getHeaderActionClass()}`}
          >
            {projectFormMode === 'edit' ? 'Update' : 'Submit'}
          </button>
        )}
      </>
    ) : selectedItem === 'Vendor Name' && isAddVendorViewOpen ? (
      <>
        <div className="flex min-w-0 flex-1 items-center truncate text-[11px] text-[#A4A4A4]">
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
          <span className="px-[4px] shrink-0">&gt;</span>
          <button
            type="button"
            onClick={() => setIsAddVendorViewOpen(false)}
            className="truncate text-[11px] text-[#A4A4A4]"
          >
            Vendor Name
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <span className="shrink-0 font-medium text-black">
            {vendorFormMode === 'edit' ? (isVendorViewOnly ? 'View' : 'Edit') : 'NEW'}
          </span>
        </div>
        {vendorFormMode === 'edit' && isVendorViewOnly ? (
          <div className="shrink-0 inline-flex items-center gap-[8px]">
            <button type="button" onClick={handleHeaderSubmit} className={`text-[12px] font-medium ${updateActionTextClass}`}>
              Update
            </button>
            {canEditMasterData && (
              <button type="button" aria-label="Edit" className="inline-flex items-center justify-center p-[2px]" onClick={() => setIsVendorViewOnly(false)}>
                <img src={editblack} alt="" className="h-[14px] w-[14px] object-contain" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleHeaderSubmit}
            disabled={isHeaderActionDisabled}
            className={`shrink-0 text-[12px] font-medium ${vendorFormMode === 'edit' ? updateActionTextClass : getHeaderActionClass()}`}
          >
            {vendorFormMode === 'edit' ? 'Update' : 'Submit'}
          </button>
        )}
      </>
    ) : (selectedItem === 'Contractor Name' || selectedItem === 'Support Associate Name') && isAddContractorViewOpen ? (
      <>
        <div className="flex min-w-0 flex-1 items-center truncate text-[11px] text-[#A4A4A4]">
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
          <span className="px-[4px] shrink-0">&gt;</span>
          <button
            type="button"
            onClick={() => setIsAddContractorViewOpen(false)}
            className="truncate text-[11px] text-[#A4A4A4]"
          >
            {selectedItem === 'Support Associate Name' ? 'Support Associate Name' : 'Contractor Name'}
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <span className="shrink-0 font-medium text-black">
            {contractorFormMode === 'edit' ? (isContractorViewOnly ? 'View' : 'Edit') : 'NEW'}
          </span>
        </div>
        {contractorFormMode === 'edit' && isContractorViewOnly ? (
          <div className="shrink-0 inline-flex items-center gap-[8px]">
            <button type="button" onClick={handleHeaderSubmit} className={`text-[12px] font-medium ${updateActionTextClass}`}>
              Update
            </button>
            {canEditMasterData && (
              <button type="button" aria-label="Edit" className="inline-flex items-center justify-center p-[2px]" onClick={() => setIsContractorViewOnly(false)}>
                <img src={editblack} alt="" className="h-[14px] w-[14px] object-contain" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleHeaderSubmit}
            disabled={isHeaderActionDisabled}
            className={`shrink-0 text-[12px] font-medium ${contractorFormMode === 'edit' ? updateActionTextClass : getHeaderActionClass()}`}
          >
            {contractorFormMode === 'edit' ? 'Update' : 'Submit'}
          </button>
        )}
      </>
    ) : selectedItem === 'Categories' && isAddCategoryViewOpen ? (
      <>
        <div className="flex min-w-0 flex-1 items-center truncate text-[11px] text-[#A4A4A4]">
          <button
            type="button"
            onClick={() => {
              setIsAddCategoryViewOpen(false);
              setSelectedItem(null);
            }}
            className="truncate text-[11px] text-[#A4A4A4]"
          >
            Master Table
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <button type="button" onClick={() => setIsAddCategoryViewOpen(false)} className="truncate text-[11px] text-[#A4A4A4]">
            Categories
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <span className="shrink-0 font-medium text-black">
            {categoryFormMode === 'edit' ? (isCategoryViewOnly ? 'View' : 'Edit') : 'New'}
          </span>
        </div>
        {categoryFormMode === 'edit' && isCategoryViewOnly ? (
          <div className="shrink-0 inline-flex items-center gap-[8px]">
            <button type="button" onClick={handleHeaderSubmit} className={`text-[12px] font-medium ${updateActionTextClass}`}>
              Update
            </button>
            {canEditMasterData && (
              <button type="button" aria-label="Edit" className="inline-flex items-center justify-center p-[2px]" onClick={() => setIsCategoryViewOnly(false)}>
                <img src={editblack} alt="" className="h-[14px] w-[14px] object-contain" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleHeaderSubmit}
            disabled={isHeaderActionDisabled}
            className={`shrink-0 text-[12px] font-medium ${categoryFormMode === 'edit' ? updateActionTextClass : getHeaderActionClass()}`}
          >
            {categoryFormMode === 'edit' ? 'Update' : 'Submit'}
          </button>
        )}
      </>
    ) : selectedItem === 'Machine tools' && isAddMachineViewOpen ? (
      <>
        <div className="flex min-w-0 flex-1 items-center truncate text-[11px] text-[#A4A4A4]">
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
          <span className="px-[4px] shrink-0">&gt;</span>
          <button
            type="button"
            onClick={() => setIsAddMachineViewOpen(false)}
            className="truncate text-[11px] text-[#A4A4A4]"
          >
            Machine tools
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <span className="shrink-0 font-medium text-black">
            {machineFormMode === 'edit' ? (isMachineViewOnly ? 'View' : 'Edit') : 'New'}
          </span>
        </div>
        {machineFormMode === 'edit' && isMachineViewOnly ? (
          <div className="shrink-0 inline-flex items-center gap-[8px]">
            <button type="button" onClick={handleHeaderSubmit} className={`text-[12px] font-medium ${updateActionTextClass}`}>
              Update
            </button>
            {canEditMasterData && (
              <button type="button" aria-label="Edit" className="inline-flex items-center justify-center p-[2px]" onClick={() => setIsMachineViewOnly(false)}>
                <img src={editblack} alt="" className="h-[14px] w-[14px] object-contain" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleHeaderSubmit}
            disabled={isHeaderActionDisabled}
            className={`shrink-0 text-[12px] font-medium ${updateActionTextClass}`}
          >
            Update
          </button>
        )}
      </>
    ) : selectedItem === 'Employee Details' && isAddEmployeeViewOpen ? (
      <>
        <div className="flex min-w-0 flex-1 items-center truncate text-[11px] text-[#A4A4A4]">
          <button
            type="button"
            onClick={() => {
              setIsAddEmployeeViewOpen(false);
              setSelectedItem(null);
            }}
            className="truncate text-[11px] text-[#A4A4A4]"
          >
            Master Table
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <button type="button" onClick={() => setIsAddEmployeeViewOpen(false)} className="truncate text-[11px] text-[#A4A4A4]">
            Employee Details
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <span className="shrink-0 font-medium text-black">
            {employeeFormMode === 'edit' ? (isEmployeeViewOnly ? 'View' : 'Edit') : 'New'}
          </span>
        </div>
        {employeeFormMode === 'edit' && isEmployeeViewOnly ? (
          <div className="shrink-0 inline-flex items-center gap-[8px]">
            <button type="button" onClick={handleHeaderSubmit} className={`text-[12px] font-medium ${updateActionTextClass}`}>Update</button>
            {canEditMasterData && (
              <button type="button" aria-label="Edit" className="inline-flex items-center justify-center p-[2px]" onClick={() => setIsEmployeeViewOnly(false)}>
                <img src={editblack} alt="" className="h-[14px] w-[14px] object-contain" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleHeaderSubmit}
            disabled={isHeaderActionDisabled}
            className={`shrink-0 text-[12px] font-medium ${employeeFormMode === 'edit' ? updateActionTextClass : getHeaderActionClass()}`}
          >
            {employeeFormMode === 'edit' ? 'Update' : 'Submit'}
          </button>
        )}
      </>
    ) : selectedItem === 'Account Details' && isAddAccountViewOpen ? (
      <>
        <div className="flex min-w-0 flex-1 items-center truncate text-[11px] text-[#A4A4A4]">
          <button
            type="button"
            onClick={() => {
              setIsAddAccountViewOpen(false);
              setSelectedItem(null);
            }}
            className="truncate text-[11px] text-[#A4A4A4]"
          >
            Master Table
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <button type="button" onClick={() => setIsAddAccountViewOpen(false)} className="truncate text-[11px] text-[#A4A4A4]">
            Account Details
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <span className="shrink-0 font-medium text-black">
            {accountFormMode === 'edit' ? (isAccountViewOnly ? 'View' : 'Edit') : 'New'}
          </span>
        </div>
        {accountFormMode === 'edit' && isAccountViewOnly ? (
          <div className="shrink-0 inline-flex items-center gap-[8px]">
            <button type="button" className={`text-[12px] font-medium ${updateActionTextClass}`}>Update</button>
            {canEditMasterData && (
              <button type="button" aria-label="Edit" className="inline-flex items-center justify-center p-[2px]" onClick={() => setIsAccountViewOnly(false)}>
                <img src={editblack} alt="" className="h-[14px] w-[14px] object-contain" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            disabled={isHeaderActionDisabled}
            className={`shrink-0 text-[12px] font-medium ${accountFormMode === 'edit' ? updateActionTextClass : getHeaderActionClass()}`}
          >
            {accountFormMode === 'edit' ? 'Update' : 'Submit'}
          </button>
        )}
      </>
    ) : selectedItem === 'Company Labour' && isAddLabourViewOpen ? (
      <>
        <div className="flex min-w-0 flex-1 items-center truncate text-[11px] text-[#A4A4A4]">
          <button
            type="button"
            onClick={() => {
              setIsAddLabourViewOpen(false);
              setSelectedItem(null);
            }}
            className="truncate text-[11px] text-[#A4A4A4]"
          >
            Master Table
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <button type="button" onClick={() => setIsAddLabourViewOpen(false)} className="truncate text-[11px] text-[#A4A4A4]">
            Company Labour
          </button>
          <span className="px-[4px] shrink-0">&gt;</span>
          <span className="shrink-0 font-medium text-black">
            {labourFormMode === 'edit' ? (isLabourViewOnly ? 'View' : 'Edit') : 'New'}
          </span>
        </div>
        {labourFormMode === 'edit' && isLabourViewOnly ? (
          <div className="shrink-0 inline-flex items-center gap-[8px]">
            <button
              type="button"
              className={`text-[12px] font-medium ${updateActionTextClass}`}
              aria-label="Update labour"
            >
              Update
            </button>
            {canEditMasterData && (
              <button type="button" aria-label="Edit" className="inline-flex items-center justify-center p-[2px]" onClick={() => setIsLabourViewOnly(false)}>
                <img src={editblack} alt="" className="h-[14px] w-[14px] object-contain" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            disabled={isHeaderActionDisabled}
            className={`shrink-0 text-[12px] font-medium ${labourFormMode === 'edit' ? updateActionTextClass : getHeaderActionClass('text-[#F26B3A]')}`}
            aria-label={labourFormMode === 'edit' ? 'Update labour' : 'Submit labour'}
          >
            {labourFormMode === 'edit' ? 'Update' : 'Submit'}
          </button>
        )}
      </>
    ) : null;

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

      <MasterDataHeader
        user={user}
        onLogout={onLogout}
        onMenuClick={() => setSidebarOpen(true)}
        showSubHeader
        customSubHeaderRow={addEditFormHeaderSubRow}
        showDrillBackDownload={
          Boolean(selectedItem) &&
          !(selectedItem === 'Project Name' && isAddProjectViewOpen) &&
          !(selectedItem === 'Vendor Name' && isAddVendorViewOpen) &&
          !(
            (selectedItem === 'Contractor Name' || selectedItem === 'Support Associate Name') &&
            isAddContractorViewOpen
          ) &&
          !(selectedItem === 'Categories' && isAddCategoryViewOpen) &&
          !(selectedItem === 'Machine tools' && isAddMachineViewOpen) &&
          !(selectedItem === 'Employee Details' && isAddEmployeeViewOpen) &&
          !(selectedItem === 'Account Details' && isAddAccountViewOpen) &&
          !(selectedItem === 'Company Labour' && isAddLabourViewOpen) &&
          !(
            selectedItem === 'Bank Details' &&
            (isBankNameFormOpen || isBankTypeFormOpen || isBankLocationFormOpen)
          )
        }
        onDrillBack={() => {
          setIsAddProjectViewOpen(false);
          setIsAddVendorViewOpen(false);
          setIsAddContractorViewOpen(false);
          setIsAddCategoryViewOpen(false);
          setIsAddMachineViewOpen(false);
          setIsAddEmployeeViewOpen(false);
          setIsAddAccountViewOpen(false);
          setIsAddLabourViewOpen(false);
          setIsBankNameFormOpen(false);
          setIsBankTypeFormOpen(false);
          setIsBankLocationFormOpen(false);
          setSelectedItem(null);
        }}
      />

      <div
        className="bg-white"
        style={{
          minHeight: '100vh',
          paddingTop: '126px',
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
          <div
            className="flex flex-col"
            style={{
              minHeight: 'calc(100vh - 126px - 60px - 18px - env(safe-area-inset-bottom, 0px))'
            }}
          >
            <div className=" shrink-0 mt-[8px]">
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

            <div className="flex min-h-0 flex-1 flex-col items-center justify-start overflow-y-auto pt-2">
              <div className="w-full rounded-[14px] bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
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
                      <img src={SideArrow}
                        alt="Chevron Down"
                        className="w-[12px] h-[12px]"
                      />
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
          </div>
        )}
      </div>

      <SelectVendorModal
        isOpen={isAccountBankNameModalOpen}
        onClose={() => setIsAccountBankNameModalOpen(false)}
        onSelect={(value) => {
          if (typeof accountBankNameSelectRef.current === 'function') {
            accountBankNameSelectRef.current(value || '');
          }
          setIsAccountBankNameModalOpen(false);
        }}
        selectedValue=""
        options={accountBankNameOptions}
        fieldName="Bank Name"
        showStarIcon={false}
      />

      <SelectVendorModal
        isOpen={isAccountDetailsBranchModalOpen}
        onClose={() => setIsAccountDetailsBranchModalOpen(false)}
        onSelect={(value) => {
          const { setForm, branchKey, selectionReadOnly } = accountDetailsBranchModalRef.current;
          if (typeof setForm === 'function' && !selectionReadOnly) {
            setHasFormChanges(true);
            setForm((s) => ({ ...s, [branchKey]: value || '' }));
          }
          setIsAccountDetailsBranchModalOpen(false);
        }}
        selectedValue={accountDetailsBranchModalSelected}
        options={BRANCH_OPTIONS}
        fieldName="Branch"
        showStarIcon={false}
      />

      <SelectVendorModal
        isOpen={isProjectSiteEngineerModalOpen}
        onClose={() => setIsProjectSiteEngineerModalOpen(false)}
        onSelect={(value) => {
          if (typeof projectSiteEngineerSelectRef.current === 'function') {
            projectSiteEngineerSelectRef.current(value || '');
          }
          setIsProjectSiteEngineerModalOpen(false);
        }}
        selectedValue={projectForm.siteEngineerName || ''}
        options={projectSiteEngineerOptions}
        fieldName="Project Incharge"
        showStarIcon={false}
      />

      <SelectVendorModal
        isOpen={isProjectNameCategoryFilterModalOpen}
        onClose={() => setIsProjectNameCategoryFilterModalOpen(false)}
        onSelect={(value) => {
          const next = value || 'All';
          setProjectNameCategoryFilter(next);
          setIsProjectNameCategoryFilterModalOpen(false);
        }}
        selectedValue={projectNameCategoryFilter}
        options={['All', 'Own', 'Client']}
        fieldName="Project Category"
        showStarIcon={false}
      />

      {isAccountDetailsPreviewOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsAccountDetailsPreviewOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/60"
          />
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-[16px]">
            <div
              className="w-full max-w-[340px] rounded-[14px] bg-white px-[16px] pt-[14px] pb-[14px] shadow-[0px_10px_30px_rgba(0,0,0,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-[10px]">
                <div className="text-[16px] font-semibold text-black">Bank Details</div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setIsAccountDetailsPreviewOpen(false)}
                  className="absolute right-0 top-0 text-[#F26B3A]"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 5L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 5L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="rounded-[10px] border border-[#E6E6E6] bg-white px-[10px] py-[10px] text-left">
                {[
                  {
                    label: 'Account Holder Name',
                    value: accountDetailsPreview?.accountHolderName || '',
                    id: 'm-preview-account-holder',
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    )
                  },
                  {
                    label: 'Bank Name',
                    value: accountDetailsPreview?.bankName || '',
                    id: 'm-preview-bank-name',
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 10.5 12 5l9 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M5 10.5V19h14v-8.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M8 19V12m4 7V12m4 7V12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    )
                  },
                  {
                    label: 'Account Number',
                    value: accountDetailsPreview?.accountNumber || '',
                    id: 'm-preview-account-number',
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M6.5 10h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    )
                  },
                  {
                    label: 'IFSC Code',
                    value: accountDetailsPreview?.ifscCode || '',
                    id: 'm-preview-ifsc',
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3h10v6H7z" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M8 21h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        <path d="M12 9v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    )
                  },
                  {
                    label: 'Branch Name',
                    value: accountDetailsPreview?.branchName || '',
                    id: 'm-preview-branch-name',
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M12 11.5a2.2 2.2 0 1 0-2.2-2.2 2.2 2.2 0 0 0 2.2 2.2Z" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    )
                  },
                  {
                    label: 'Contact Number',
                    value: accountDetailsPreview?.contactNumber || '',
                    id: 'm-preview-contact-number',
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M6.5 3.8 9 3.2c.6-.1 1.1.2 1.3.7l1 2.6c.2.5 0 1.1-.4 1.4L9.6 9.2c.9 1.9 2.3 3.4 4.2 4.2l1.3-1.3c.4-.4.9-.5 1.4-.4l2.6 1c.5.2.8.7.7 1.3l-.6 2.5c-.1.5-.5.9-1.1 1-7 .9-13-5-12.1-12.1.1-.5.5-.9 1-1.1Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )
                  },
                  {
                    label: 'Contact Email',
                    value: accountDetailsPreview?.contactEmail || '-',
                    id: 'm-preview-contact-email',
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.6" />
                        <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      </svg>
                    )
                  }
                ].map((row, idx, arr) => (
                  <div key={row.id} className={idx === 0 ? '' : 'pt-[10px]'}>
                    <div className="relative pr-[44px]">
                      <div className="flex min-w-0 items-center gap-[8px] text-[11px] font-medium text-[#6B6B6B]">
                        <span className="shrink-0 text-[#7A7A7A]">{row.icon}</span>
                        <span className="truncate">{row.label}</span>
                      </div>
                      <MasterDataCopyButton text={row.value} fieldName={row.label} buttonId={row.id} />
                    </div>
                    <div className="mt-[4px] text-left text-[12px] font-semibold text-black break-words">{row.value || '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav activeTab="home" />
    </div>
  );
};

export default MasterData;
