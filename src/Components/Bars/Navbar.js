import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import * as XLSX from 'xlsx';
import logo from '../Images/aablogo.png';
import Sidebar from './Sidebar';
import Logout from '../Images/Logout.png'
import DownloadIcon from '../Images/download.png';
import EditIcon from '../Images/Edit.svg';
const Navbar = ({ username, userImage, position, email, onLogout, userRoles = [] }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditRequestsDropdownOpen, setIsEditRequestsDropdownOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRequestRecord, setSelectedRequestRecord] = useState(null);
  const [requestRecordLoading, setRequestRecordLoading] = useState(false);
  const [requestRecordError, setRequestRecordError] = useState('');
  const [vendorLookup, setVendorLookup] = useState({});
  const [contractorLookup, setContractorLookup] = useState({});
  const [employeeLookup, setEmployeeLookup] = useState({});
  const [labourLookup, setLabourLookup] = useState({});
  const [siteLookup, setSiteLookup] = useState({});
  const [editRequests, setEditRequests] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);
  const [roleModels, setRoleModels] = useState([]);
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
        setRoleModels(models);
      } catch (error) {
        console.error("Error fetching user roles:", error);
      }
    };
    if (userRoles.length > 0) {
      fetchUserRoles();
    }
  }, [userRoles]);
  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };
  const normalizedUsername = username?.trim().toLowerCase();
  const canDownloadExpenses = normalizedUsername === 'admin' || normalizedUsername === 'mahalingam m';
  const canViewEditRequests = normalizedUsername === 'admin' || normalizedUsername === 'mahalingam m';
  const handleDownloadExpenses = async () => {
    if (isDownloading || !canDownloadExpenses) return;
    setIsDownloading(true);
    try {
      const [
        expensesResponse,
        projectsResponse,
        vendorsResponse,
        contractorsResponse,
        advanceResponse,
        loanResponse,
        loanPurposesResponse,
        projectClientsResponse,
        rentResponse,
        tenantLinkResponse,
        // MasterData API calls
        categoriesResponse,
        machineToolsResponse,
        employeeDetailsResponse,
        laboursListResponse,
        accountDetailsResponse,
        bankAccountTypesResponse,
        ebServiceLinksResponse,
        staffAdvanceResponse,
        purposesResponse,
        vendorPaymentsTrackerResponse
      ] = await Promise.all([
        axios.get("https://backendaab.in/aabuilderDash/expenses_form/get_form"),
        axios.get("https://backendaab.in/aabuilderDash/api/project_Names/getAll", { withCredentials: true }),
        axios.get("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", { withCredentials: true }),
        axios.get("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", { withCredentials: true }),
        axios.get("https://backendaab.in/aabuildersDash/api/advance_portal/getAll"),
        axios.get("https://backendaab.in/aabuildersDash/api/loans/all"),
        axios.get("https://backendaab.in/aabuildersDash/api/loan-purposes/getAll", { withCredentials: true }),
        axios.get("https://backendaab.in/aabuilderDash/api/projects/getAll", { withCredentials: true }),
        axios.get("https://backendaab.in/aabuildersDash/api/rental_forms/getAll"),
        axios.get("https://backendaab.in/aabuildersDash/api/tenant_link_shop/getAll"),
        // MasterData API calls
        axios.get("https://backendaab.in/aabuilderDash/api/expenses_categories/getAll"),
        axios.get("https://backendaab.in/aabuilderDash/api/machine_tools/getAll"),
        axios.get("https://backendaab.in/aabuildersDash/api/employee_details/getAll", { withCredentials: true }),
        axios.get("https://backendaab.in/aabuildersDash/api/labours-details/getAll", { withCredentials: true }),
        axios.get("https://backendaab.in/aabuildersDash/api/account-details/getAll"),
        axios.get("https://backendaab.in/aabuildersDash/api/bank_type/getAll"),
        axios.get("https://backendaab.in/aabuildersDash/api/eb-service-no/getAll"),
        axios.get("https://backendaab.in/aabuildersDash/api/staff-advance/all"),
        axios.get("https://backendaab.in/aabuildersDash/api/purposes/getAll"),
        axios.get("https://backendaab.in/aabuildersDash/api/vendor-payments/trackers", { withCredentials: true })
      ]);
      const buildLookup = (items = [], idKey, labelKey) => {
        if (!Array.isArray(items)) return {};
        return items.reduce((acc, item) => {
          const key = item?.[idKey];
          if (key !== undefined && key !== null) {
            acc[key] = item?.[labelKey] || '';
          }
          return acc;
        }, {});
      };
      const projectLookup = buildLookup(projectsResponse.data, 'id', 'siteName');
      const vendorLookup = buildLookup(vendorsResponse.data, 'id', 'vendorName');
      const contractorLookup = buildLookup(contractorsResponse.data, 'id', 'contractorName');
      const expensesData = Array.isArray(expensesResponse.data) ? expensesResponse.data : [];
      const formatDate = (value, options) => {
        if (!value) return '';
        try {
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return value;
          return date.toLocaleString('en-IN', options);
        } catch {
          return value;
        }
      };
      const formatDateOnly = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          if (Number.isNaN(date.getTime())) return dateString;
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        } catch {
          return dateString;
        }
      };
      const formatTimestamp = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          if (Number.isNaN(date.getTime())) return dateString;
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          let hours = date.getHours();
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? String(hours).padStart(2, '0') : '12';
          return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
        } catch {
          return dateString;
        }
      };
      const predefinedSites = [
        { id: 1, siteName: "Mason Advance" },
        { id: 2, siteName: "Material Advance" },
        { id: 3, siteName: "Weekly Advance" },
        { id: 4, siteName: "Excess Advance" },
        { id: 5, siteName: "Material Rent" },
        { id: 6, siteName: "Subhash Kumar - Kunnur" },
        { id: 7, siteName: "Summary Bill" },
        { id: 8, siteName: "Daily Wage" },
        { id: 9, siteName: "Rent Management Portal" },
        { id: 10, siteName: "Multi-Project Batch" },
        { id: 11, siteName: "Loan Portal" }
      ];
      const allSites = [...predefinedSites, ...(Array.isArray(projectsResponse.data) ? projectsResponse.data : [])];
      const advanceSiteLookup = buildLookup(allSites, 'id', 'siteName');
      const getVendorName = (id) => vendorLookup[id] || '';
      const getContractorName = (id) => contractorLookup[id] || '';
      const getSiteName = (id) => {
        if (!id && id !== 0) return '';
        return advanceSiteLookup[id] || '';
      };
      const loanPurposeLookup = buildLookup(loanPurposesResponse.data, 'id', 'purpose');
      const employeeLookup = buildLookup(employeeDetailsResponse.data, 'id', 'employee_name');
      const labourLookup = buildLookup(laboursListResponse.data, 'id', 'labour_name');
      const purposeLookup = buildLookup(purposesResponse.data, 'id', 'purpose');
      const buildProjectClientMaps = (projects = []) => {
        const idMap = {};
        const nameMap = {};
        projects.forEach(project => {
          const projectId = project?.id ?? project?.projectId;
          const projectName = (project?.projectName || project?.projectReferenceName || project?.siteName || '').trim();
          const owners = Array.isArray(project?.ownerDetailsList)
            ? project.ownerDetailsList
            : Array.isArray(project?.ownerDetails)
              ? project.ownerDetails
              : [];
          const ownerNames = owners
            .map(owner => owner?.clientName?.trim())
            .filter(Boolean);
          const displayName = ownerNames.join(", ") || project?.clientName || project?.ownerName || '';
          if (displayName) {
            if (projectId !== undefined && projectId !== null) {
              idMap[String(projectId)] = displayName;
            }
            if (projectName) {
              nameMap[projectName.toLowerCase()] = displayName;
            }
          }
        });
        return { idMap, nameMap };
      };
      const projectClientMaps = buildProjectClientMaps(projectClientsResponse.data);
      const getAssociateName = (entry) => {
        const byId = projectClientMaps.idMap[String(entry.project_id)];
        if (byId) return byId;
        const fromSite = projectLookup[entry.project_id];
        if (fromSite) {
          const byName = projectClientMaps.nameMap[fromSite.trim().toLowerCase()];
          if (byName) return byName;
        }
        if (entry.vendor_id && getVendorName(entry.vendor_id)) return getVendorName(entry.vendor_id);
        if (entry.contractor_id && getContractorName(entry.contractor_id)) return getContractorName(entry.contractor_id);
        return '';
      };
      const worksheetData = expensesData.map((expense, index) => {
        const projectName = projectLookup[expense.projectId] || expense.siteName || '';
        const vendorName = vendorLookup[expense.vendorId] || expense.vendor || expense.otherVendorName || '';
        const contractorName = contractorLookup[expense.contractorId] || expense.contractor || expense.otherContractorName || '';
        return {
          'S.No': index + 1,
          'Entry No': expense.eno || '',
          Date: formatDate(expense.date, { year: 'numeric', month: '2-digit', day: '2-digit' }),
          'Project Name': projectName,
          'Vendor Name': vendorName,
          'Contractor Name': contractorName,
          Category: expense.category || '',
          'Machine Tools': expense.machineTools || '',
          'Account Type': expense.accountType || '',
          Amount: expense.amount ?? '',
          'Payment Mode': expense.paymentMode || '',
          Remarks: expense.remarks || '',
          'Created By': expense.username || '',
          Timestamp: formatDate(expense.timestamp, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
          'Project ID': expense.projectId ?? '',
          'Vendor ID': expense.vendorId ?? '',
          'Contractor ID': expense.contractorId ?? ''
        };
      });
      const advanceData = Array.isArray(advanceResponse.data) ? advanceResponse.data : [];
      const advanceWorksheetData = advanceData.map((entry, index) => {
        const contractorOrVendor = entry.vendor_id
          ? getVendorName(entry.vendor_id)
          : getContractorName(entry.contractor_id);
        const advanceAmount = entry.amount != null && entry.amount !== ""
          ? Number(entry.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })
          : "";
        const billAmount = entry.bill_amount != null && entry.bill_amount !== ""
          ? Number(entry.bill_amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })
          : "";
        const refundAmount = entry.refund_amount != null && entry.refund_amount !== ""
          ? Number(entry.refund_amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })
          : "";
        return {
          'S.No': index + 1,
          'Time Stamp': formatTimestamp(entry.timestamp),
          'Date': formatDateOnly(entry.date),
          'Contractor/Vendor': contractorOrVendor,
          'Project Name': getSiteName(entry.project_id),
          'Transfer Site': getSiteName(entry.transfer_site_id),
          'Advance': advanceAmount,
          'Bill Payment': billAmount,
          'Refund': refundAmount,
          'Type': entry.type || '',
          'Description': entry.description || '',
          'Mode': entry.payment_mode || '',
          'Attached file': entry.file_url || '',
          'E.No': entry.entry_no || '',
          'Project ID': entry.project_id ?? '',
          'Transfer Site ID': entry.transfer_site_id ?? '',
          'Vendor ID': entry.vendor_id ?? '',
          'Contractor ID': entry.contractor_id ?? ''
        };
      });
      const buildShopNoMap = (projects = []) => {
        return projects.reduce((acc, project) => {
          const propertyDetails = Array.isArray(project?.propertyDetails)
            ? project.propertyDetails
            : Array.from(project?.propertyDetails || []);
          propertyDetails.forEach(detail => {
            const detailId = detail?.id ?? detail?.shopNoId;
            if (detailId !== undefined && detail?.shopNo) {
              acc[detailId] = detail.shopNo;
            }
          });
          return acc;
        }, {});
      };
      const buildTenantNameMap = (tenants = []) => {
        return tenants.reduce((acc, tenant) => {
          if (tenant?.id !== undefined && tenant?.tenantName) {
            acc[tenant.id] = tenant.tenantName;
          }
          return acc;
        }, {});
      };
      const shopNoIdLookup = buildShopNoMap(projectClientsResponse.data);
      const tenantNameLookup = buildTenantNameMap(tenantLinkResponse.data);
      const formatTimestampDetailed = (value) => {
        if (!value) return '';
        try {
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return value;
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          let hours = date.getHours();
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? String(hours).padStart(2, '0') : '12';
          return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
        } catch {
          return value;
        }
      };
      const formatMonthLabel = (value) => {
        if (!value) return '';
        const [year, month] = String(value).split('-');
        if (!year || !month) return value;
        const date = new Date(`${year}-${month}-01T00:00:00Z`);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
      };
      const formatRentAmount = (primaryValue, secondaryValue) => {
        const hasPrimary = primaryValue !== undefined && primaryValue !== null && primaryValue !== '';
        const raw = hasPrimary ? primaryValue : secondaryValue;
        if (raw === undefined || raw === null || raw === '') return '';
        const num = Number(raw);
        if (Number.isNaN(num)) return raw;
        return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      };
      const rentData = Array.isArray(rentResponse.data) ? rentResponse.data : [];
      const rentWorksheetData = rentData.map((entry, index) => {
        const shopNo = (entry.shopNoId && shopNoIdLookup[entry.shopNoId]) || entry.shopNo || '';
        const tenantName = (entry.tenantNameId && tenantNameLookup[entry.tenantNameId]) || entry.tenantName || '';
        return {
          'S.No': index + 1,
          'Timestamp': formatTimestampDetailed(entry.timestamp),
          'Shop No': shopNo,
          'Tenant Name': tenantName,
          'Amount': formatRentAmount(entry.refundAmount, entry.amount),
          'Paid On': formatDateOnly(entry.paidOnDate),
          'E No': entry.eno || '',
          'For the Month Of': formatMonthLabel(entry.forTheMonthOf),
          'Payment Mode': entry.paymentMode || '',
          'Type': entry.formType || '',
          'Shop No ID': entry.shopNoId ?? '',
          'Tenant Name ID': entry.tenantNameId ?? ''
        };
      });
      const formatLoanAmount = (value) => {
        if (value === undefined || value === null || value === '') return '';
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) return value;
        return numberValue.toLocaleString("en-IN", { maximumFractionDigits: 0 });
      };
      const loanData = Array.isArray(loanResponse.data) ? loanResponse.data : [];
      const loanWorksheetData = loanData.map((entry, index) => {
        const associate = getAssociateName(entry);
        const purpose =
          getSiteName(entry.project_id) ||
          loanPurposeLookup[entry.from_purpose_id] ||
          entry.from_purpose_id ||
          '';
        const transferTo = entry.type === 'Transfer'
          ? (loanPurposeLookup[entry.to_purpose_id] ||
            getSiteName(entry.transfer_Project_id) ||
            entry.to_purpose_id ||
            '')
          : '';
        const loanAmount = (entry.type === 'Loan' || entry.type === 'Transfer')
          ? formatLoanAmount(entry.amount)
          : '';
        const refundAmount = entry.type === 'Refund'
          ? formatLoanAmount(entry.loan_refund_amount)
          : '';
        return {
          'S.No': index + 1,
          'Time Stamp': formatTimestamp(entry.timestamp),
          'Date': formatDateOnly(entry.date),
          'Associate': associate,
          'Purpose': purpose,
          'Transfer To': transferTo,
          'Loan Amount': loanAmount,
          'Refund Amount': refundAmount,
          'Type': entry.type || '',
          'Description': entry.description || '',
          'Mode': entry.loan_payment_mode || '',
          'E.No': entry.entry_no || '',
          'Project ID': entry.project_id ?? '',
          'Transfer Project ID': entry.transfer_Project_id ?? '',
          'Vendor ID': entry.vendor_id ?? '',
          'Contractor ID': entry.contractor_id ?? '',
          'From Purpose ID': entry.from_purpose_id ?? '',
          'To Purpose ID': entry.to_purpose_id ?? ''
        };
      });
      // Helper function to truncate cell values to Excel's maximum length (32767 characters)
      const truncateCellValue = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        const maxLength = 32767;
        if (str.length > maxLength) {
          return str.substring(0, maxLength - 3) + '...';
        }
        return str;
      };

      // Helper function to safely process worksheet data and truncate long values
      const processWorksheetData = (data) => {
        return data.map(row => {
          const processedRow = {};
          for (const key in row) {
            processedRow[key] = truncateCellValue(row[key]);
          }
          return processedRow;
        });
      };

      // Process MasterData tables
      // Process Project Names (already fetched as projectsResponse)
      const projectNamesData = Array.isArray(projectsResponse.data) ? projectsResponse.data : [];
      const projectNamesWorksheetData = projectNamesData.map((item, index) => ({
        'S.No': index + 1,
        'ID': item.id || '',
        'Site Name': item.siteName || '',
        'Site No': item.siteNo || ''
      }));

      // Process Vendor Names (already fetched as vendorsResponse)
      const vendorNamesData = Array.isArray(vendorsResponse.data) ? vendorsResponse.data : [];
      const vendorNamesWorksheetData = vendorNamesData.map((item, index) => ({
        'S.No': index + 1,
        'ID': item.id || '',
        'Vendor Name': item.vendorName || '',
        'Account Holder Name': item.account_holder_name || '',
        'Account Number': item.account_number || '',
        'Bank Name': item.bank_name || '',
        'Branch': item.branch || '',
        'IFSC Code': item.ifsc_code || '',
        'GPay Number': item.gpay_number || '',
        'UPI ID': item.upi_id || '',
        'Contact Number': item.contact_number || '',
        'Contact Email': item.contact_email || '',
        'QR Image': item.upi_qr_image || ''
      }));

      // Process Contractor Names (already fetched as contractorsResponse)
      const contractorNamesData = Array.isArray(contractorsResponse.data) ? contractorsResponse.data : [];
      const contractorNamesWorksheetData = contractorNamesData.map((item, index) => ({
        'S.No': index + 1,
        'ID': item.id || '',
        'Contractor Name': item.contractorName || '',
        'Account Holder Name': item.account_holder_name || '',
        'Account Number': item.account_number || '',
        'Bank Name': item.bank_name || '',
        'Branch': item.branch || '',
        'IFSC Code': item.ifsc_code || '',
        'GPay Number': item.gpay_number || '',
        'UPI ID': item.upi_id || '',
        'Contact Number': item.contact_number || '',
        'Contact Email': item.contact_email || '',
        'QR Image': item.upi_qr_image || ''
      }));

      // Process Categories
      const categoriesData = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
      const categoriesWorksheetData = categoriesData.map((item, index) => ({
        'S.No': index + 1,
        'ID': item.id || '',
        'Category': item.category || ''
      }));

      // Process Machine Tools
      const machineToolsData = Array.isArray(machineToolsResponse.data) ? machineToolsResponse.data : [];
      const machineToolsWorksheetData = machineToolsData.map((item, index) => ({
        'S.No': index + 1,
        'ID': item.id || '',
        'Machine Tool': item.machineTool || ''
      }));

      // Process Employee Details
      const employeeDetailsData = Array.isArray(employeeDetailsResponse.data) ? employeeDetailsResponse.data : [];
      const employeeDetailsWorksheetData = employeeDetailsData.map((item, index) => ({
        'S.No': index + 1,
        'ID': item.id || '',
        'Employee Name': item.employee_name || '',
        'Mobile Number': item.employee_mobile_number || '',
        'Role': item.role_of_employee || '',
        'Account Holder Name': item.account_holder_name || '',
        'Account Number': item.account_number || '',
        'Bank Name': item.bank_name || '',
        'IFSC Code': item.ifsc_code || '',
        'Branch': item.branch || '',
        'UPI ID': item.upi_id || '',
        'GPay Number': item.gpay_number || '',
        'Contact Email': item.contact_email || '',
        'Employee ID': item.employee_id || '',
        'Aadhaar PDF': item.aadhaar_pdf || ''
      }));

      // Process Labours List
      const laboursListData = Array.isArray(laboursListResponse.data) ? laboursListResponse.data : [];
      const laboursListWorksheetData = laboursListData.map((item, index) => ({
        'S.No': index + 1,
        'ID': item.id || '',
        'Labour Name': item.labour_name || '',
        'Salary': item.labourSalary || ''
      }));

      // Process Account Details
      const accountDetailsData = Array.isArray(accountDetailsResponse.data) ? accountDetailsResponse.data : [];
      const accountDetailsWorksheetData = accountDetailsData.map((item, index) => ({
        'S.No': index + 1,
        'ID': item.id || '',
        'Account Holder Name': item.account_holder_name || '',
        'Account Number': item.account_number || '',
        'Bank Name': item.bank_name || '',
        'Branch': item.branch || '',
        'IFSC Code': item.ifsc_code || '',
        'UPI ID': item.upi_id || '',
        'GPay Number': item.gpay_number || '',
        'Account Type': item.account_type || '',
        'QR Image': item.upi_qr_image || ''
      }));

      // Process Bank Account Types
      const bankAccountTypesData = Array.isArray(bankAccountTypesResponse.data) ? bankAccountTypesResponse.data : [];
      const bankAccountTypesWorksheetData = bankAccountTypesData.map((item, index) => ({
        'S.No': index + 1,
        'ID': item.id || '',
        'Bank Account Type': item.bank_account_type || ''
      }));

      // Process EB Service Links
      const ebServiceLinksData = Array.isArray(ebServiceLinksResponse.data) ? ebServiceLinksResponse.data : [];
      const ebServiceLinksWorksheetData = ebServiceLinksData.map((item, index) => ({
        'S.No': index + 1,
        'ID': item.id || '',
        'Project ID': item.project_id || '',
        'Door No': item.door_no || '',
        'EB Service No': item.eb_service_no || ''
      }));

      // Process Projects (Project Management) - already fetched as projectClientsResponse
      const projectsManagementData = Array.isArray(projectClientsResponse.data) ? projectClientsResponse.data : [];
      const projectsManagementWorksheetData = projectsManagementData.map((project, index) => {
        const ownerDetails = Array.isArray(project.ownerDetailsList) ? project.ownerDetailsList : [];
        const propertyDetails = Array.isArray(project.propertyDetailsList) ? project.propertyDetailsList : [];
        
        // Flatten owner details
        const ownerNames = ownerDetails.map(o => o.clientName).filter(Boolean).join('; ');
        const ownerMobiles = ownerDetails.map(o => o.mobile).filter(Boolean).join('; ');
        
        // Flatten property details
        const shopNos = propertyDetails.map(p => p.shopNo).filter(Boolean).join('; ');
        const doorNos = propertyDetails.map(p => p.doorNo).filter(Boolean).join('; ');
        const ebNos = propertyDetails.map(p => p.ebNo).filter(Boolean).join('; ');
        
        return {
          'S.No': index + 1,
          'ID': project.id || '',
          'Project Name': project.projectName || '',
          'Project Address': project.projectAddress || '',
          'Project ID': project.projectId || '',
          'Project Category': project.projectCategory || '',
          'Project Reference Name': project.projectReferenceName || '',
          'Owner Names': ownerNames,
          'Owner Mobiles': ownerMobiles,
          'Shop Nos': shopNos,
          'Door Nos': doorNos,
          'EB Nos': ebNos,
          'Owner Details': truncateCellValue(JSON.stringify(ownerDetails)),
          'Property Details': truncateCellValue(JSON.stringify(propertyDetails))
        };
      });

      // Process Staff Advance
      const staffAdvanceData = Array.isArray(staffAdvanceResponse.data) ? staffAdvanceResponse.data : [];
      const getEmployeeOrLabourName = (entry) => {
        if (entry.employee_id && entry.employee_id !== 0) {
          return employeeLookup[entry.employee_id] || '';
        }
        if (entry.labour_id && entry.labour_id !== 0) {
          return labourLookup[entry.labour_id] || '';
        }
        return '';
      };
      const staffAdvanceWorksheetData = staffAdvanceData.map((entry, index) => {
        const employeeOrLabourName = getEmployeeOrLabourName(entry);
        const fromPurposeName = purposeLookup[entry.from_purpose_id] || '';
        const toPurposeName = entry.to_purpose_id ? (purposeLookup[entry.to_purpose_id] || '') : '';
        const advanceAmount = entry.amount != null && entry.amount !== ""
          ? Number(entry.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })
          : "";
        const refundAmount = entry.staff_refund_amount != null && entry.staff_refund_amount !== ""
          ? Number(entry.staff_refund_amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })
          : "";
        return {
          'S.No': index + 1,
          'Time Stamp': formatTimestamp(entry.timestamp),
          'Date': formatDateOnly(entry.date),
          'Employee/Labour Name': employeeOrLabourName,
          'Purpose From': fromPurposeName,
          'Purpose To': toPurposeName,
          'Advance Amount': advanceAmount,
          'Refund Amount': refundAmount,
          'Type': entry.type || '',
          'Payment Mode': entry.staff_payment_mode || '',
          'Description': entry.description || '',
          'File URL': entry.file_url || '',
          'Entry No': entry.entry_no || '',
          'Week No': entry.week_no || '',
          'Staff Advance Portal ID': entry.staffAdvancePortalId || '',
          'Employee ID': entry.employee_id ?? '',
          'Labour ID': entry.labour_id ?? '',
          'From Purpose ID': entry.from_purpose_id ?? '',
          'To Purpose ID': entry.to_purpose_id ?? '',
          'Loan Portal ID': entry.loan_portal_id ?? '',
          'Allow To Edit': entry.allow_to_edit ? 'Yes' : 'No'
        };
      });

      // Create worksheets with truncated data to prevent Excel cell length errors
      const expensesWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(worksheetData));
      const advanceWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(advanceWorksheetData));
      const loanWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(loanWorksheetData));
      const rentWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(rentWorksheetData));
      const projectNamesWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(projectNamesWorksheetData));
      const vendorNamesWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(vendorNamesWorksheetData));
      const contractorNamesWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(contractorNamesWorksheetData));
      const categoriesWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(categoriesWorksheetData));
      const machineToolsWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(machineToolsWorksheetData));
      const employeeDetailsWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(employeeDetailsWorksheetData));
      const laboursListWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(laboursListWorksheetData));
      const accountDetailsWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(accountDetailsWorksheetData));
      const bankAccountTypesWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(bankAccountTypesWorksheetData));
      const ebServiceLinksWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(ebServiceLinksWorksheetData));
      const projectsManagementWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(projectsManagementWorksheetData));
      const staffAdvanceWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(staffAdvanceWorksheetData));

      // Create workbook and add all sheets
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, expensesWorksheet, 'Expenses');
      XLSX.utils.book_append_sheet(workbook, advanceWorksheet, 'Advance Portal');
      XLSX.utils.book_append_sheet(workbook, loanWorksheet, 'Loan Portal');
      XLSX.utils.book_append_sheet(workbook, rentWorksheet, 'Rent Management');
      XLSX.utils.book_append_sheet(workbook, staffAdvanceWorksheet, 'Staff Advance');
      // MasterData sheets
      XLSX.utils.book_append_sheet(workbook, projectNamesWorksheet, 'Project Names');
      XLSX.utils.book_append_sheet(workbook, vendorNamesWorksheet, 'Vendor Names');
      XLSX.utils.book_append_sheet(workbook, contractorNamesWorksheet, 'Contractor Names');
      XLSX.utils.book_append_sheet(workbook, categoriesWorksheet, 'Categories');
      XLSX.utils.book_append_sheet(workbook, machineToolsWorksheet, 'Machine Tools');
      XLSX.utils.book_append_sheet(workbook, employeeDetailsWorksheet, 'Employee Details');
      XLSX.utils.book_append_sheet(workbook, laboursListWorksheet, 'Labours List');
      XLSX.utils.book_append_sheet(workbook, accountDetailsWorksheet, 'Account Details');
      XLSX.utils.book_append_sheet(workbook, bankAccountTypesWorksheet, 'Bank Account Types');
      XLSX.utils.book_append_sheet(workbook, ebServiceLinksWorksheet, 'EB Service Links');
      XLSX.utils.book_append_sheet(workbook, projectsManagementWorksheet, 'Project Management');
      
      const dateStamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `Expenses_${dateStamp}.xlsx`);

      // Process and download VendorPayments Tracker data as separate file
      const vendorPaymentsTrackerData = Array.isArray(vendorPaymentsTrackerResponse.data) ? vendorPaymentsTrackerResponse.data : [];
      const formatTimestampForTracker = (dateString) => {
        if (!dateString) return '-';
        try {
          const date = new Date(dateString);
          if (Number.isNaN(date.getTime())) return dateString;
          return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        } catch {
          return dateString;
        }
      };

      // Fetch all bill entries and payment details for all trackers
      const fetchBillEntriesForAllTrackers = async () => {
        const allBillEntries = [];
        for (const tracker of vendorPaymentsTrackerData) {
          try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/bill-entry/get/${tracker.id}`, {
              method: "GET",
              credentials: "include",
              headers: { "Content-Type": "application/json" }
            });
            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                allBillEntries.push(...data.map(entry => ({
                  ...entry,
                  vendor_payments_tracker_id: tracker.id
                })));
              }
            }
          } catch (error) {
            console.error(`Error fetching bill entries for tracker ${tracker.id}:`, error);
          }
        }
        return allBillEntries;
      };

      const fetchPaymentDetailsForAllTrackers = async () => {
        const allPaymentDetails = [];
        for (const tracker of vendorPaymentsTrackerData) {
          try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/vendor-bill-tracker/get/${tracker.id}`, {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                allPaymentDetails.push(...data.map(payment => ({
                  ...payment,
                  vendor_payments_tracker_id: tracker.id
                })));
              }
            }
          } catch (error) {
            console.error(`Error fetching payment details for tracker ${tracker.id}:`, error);
          }
        }
        return allPaymentDetails;
      };

      // Fetch related data
      const [allBillEntries, allPaymentDetails] = await Promise.all([
        fetchBillEntriesForAllTrackers(),
        fetchPaymentDetailsForAllTrackers()
      ]);

      // Process VendorPayments Tracker main sheet
      const vendorPaymentsTrackerWorksheetData = vendorPaymentsTrackerData.map((item, index) => {
        return {
          'S.No': index + 1,
          'ID': item.id || '-',
          'Time Stamp': formatTimestampForTracker(item.created_at || item.createdAt || item.timestamp),
          'Bill Arrival Date': item.bill_arrival_date ? formatDateOnly(item.bill_arrival_date) : '-',
          'Vendor ID': item.vendor_id || item.vendorId || '-',
          'No of Bills': item.no_of_bills || item.noOfBills || '-',
          'Total Amount': item.total_amount ? Number(item.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '-',
          'Adjustment Amount': item.adjustment_amount || item.adjustmentAmount || 0,
          'Entry Status': item.entry_status || '-',
          'Over All Payment PDF URL': item.over_all_payment_pdf_url || item.overAllPaymentPdfUrl || '-',
          'Created At': item.created_at || item.createdAt || item.timestamp || '-',
          'Updated At': item.updated_at || item.updatedAt || '-'
        };
      });

      // Process Bill Entries sheet
      const billEntriesWorksheetData = allBillEntries.map((entry, index) => {
        return {
          'S.No': index + 1,
          'Bill Entry ID': entry.id || '-',
          'Vendor Payments Tracker ID': entry.vendor_payments_tracker_id || '-',
          'Entered By': entry.entered_by || '-',
          'Entered Date': entry.entered_date ? formatDateOnly(entry.entered_date) : '-',
          'Created At': entry.created_at || entry.createdAt || entry.timestamp || '-',
          'Updated At': entry.updated_at || entry.updatedAt || '-'
        };
      });

      // Process Payment Details sheet
      const paymentDetailsWorksheetData = allPaymentDetails.map((payment, index) => {
        return {
          'S.No': index + 1,
          'Payment ID': payment.id || '-',
          'Vendor Payments Tracker ID': payment.vendor_payments_tracker_id || payment.vendor_payments_tracker_id || '-',
          'Date': payment.date ? formatDateOnly(payment.date) : '-',
          'Amount': payment.amount ? Number(payment.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '-',
          'Actual Amount': payment.actual_amount ? Number(payment.actual_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '-',
          'Discount Amount': payment.discount_amount ? Number(payment.discount_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '-',
          'Carry Forward Amount': payment.carry_forward_amount ? Number(payment.carry_forward_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '-',
          'Payment Mode': payment.vendor_bill_payment_mode || payment.mode || '-',
          'Cheque Number': payment.cheque_number || payment.cheque_no || '-',
          'Cheque Date': payment.cheque_date ? formatDateOnly(payment.cheque_date) : '-',
          'Transaction Number': payment.transaction_number || payment.transactionNumber || '-',
          'Account Number': payment.account_number || payment.accountNumber || '-',
          'Bill URL': payment.bill_url || '-',
          'Created At': payment.created_at || payment.createdAt || payment.timestamp || '-',
          'Updated At': payment.updated_at || payment.updatedAt || '-'
        };
      });

      // Create worksheets
      const vendorPaymentsTrackerWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(vendorPaymentsTrackerWorksheetData));
      const billEntriesWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(billEntriesWorksheetData));
      const paymentDetailsWorksheet = XLSX.utils.json_to_sheet(processWorksheetData(paymentDetailsWorksheetData));
      
      // Create separate workbook for VendorPayments Tracker with multiple sheets
      const vendorPaymentsTrackerWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(vendorPaymentsTrackerWorkbook, vendorPaymentsTrackerWorksheet, 'Vendor Payments Tracker');
      XLSX.utils.book_append_sheet(vendorPaymentsTrackerWorkbook, billEntriesWorksheet, 'Bill Entries');
      XLSX.utils.book_append_sheet(vendorPaymentsTrackerWorkbook, paymentDetailsWorksheet, 'Payment Details');
      
      // Download the VendorPayments Tracker file
      XLSX.writeFile(vendorPaymentsTrackerWorkbook, `VendorPaymentsTracker_${dateStamp}.xlsx`);
    } catch (error) {
      console.error("Error generating expenses report:", error);
      alert("Unable to download expenses report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };
  const handleClickOutside = (event) => {
    if (
      sidebarRef.current && !sidebarRef.current.contains(event.target) &&
      profileRef.current && !profileRef.current.contains(event.target)
    ) {
      setIsSidebarVisible(false);
      setIsProfileDropdownVisible(false);
      setIsEditRequestsDropdownOpen(false);
    }
  };
  const closeSelectedRequestModal = () => {
    setSelectedRequest(null);
    setSelectedRequestRecord(null);
    setRequestRecordError('');
    setRequestRecordLoading(false);
  };
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    if (!canViewEditRequests) return;
    fetchEditRequests();
    const interval = setInterval(fetchEditRequests, 30000);
    const handleExternalUpdate = () => {
      fetchEditRequests();
    };
    window.addEventListener('editRequestCreated', handleExternalUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('editRequestCreated', handleExternalUpdate);
    };
  }, [canViewEditRequests]);
  useEffect(() => {
    if (!canViewEditRequests) return;
    const fetchReferenceData = async () => {
      try {
        const [vendorsRes, contractorsRes, sitesRes, employeesRes, laboursRes] = await Promise.all([
          axios.get("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", { withCredentials: true }),
          axios.get("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", { withCredentials: true }),
          axios.get("https://backendaab.in/aabuilderDash/api/project_Names/getAll", { withCredentials: true }),
          axios.get("https://backendaab.in/aabuildersDash/api/employee_details/getAll", { withCredentials: true }),
          axios.get("https://backendaab.in/aabuildersDash/api/labours-details/getAll", { withCredentials: true })
        ]);
        const buildLookup = (items = [], idKey, labelKey) =>
          items.reduce((acc, item) => {
            const id = item?.[idKey];
            if (id !== undefined && item?.[labelKey]) {
              acc[id] = item[labelKey];
            }
            return acc;
          }, {});
        setVendorLookup(buildLookup(vendorsRes.data || [], 'id', 'vendorName'));
        setContractorLookup(buildLookup(contractorsRes.data || [], 'id', 'contractorName'));
        setEmployeeLookup(buildLookup(employeesRes.data || [], 'id', 'employee_name'));
        setLabourLookup(buildLookup(laboursRes.data || [], 'id', 'labour_name'));
        const predefinedSites = [
          { id: 1, siteName: "Mason Advance" },
          { id: 2, siteName: "Material Advance" },
          { id: 3, siteName: "Weekly Advance" },
          { id: 4, siteName: "Excess Advance" },
          { id: 5, siteName: "Material Rent" },
          { id: 6, siteName: "Subhash Kumar - Kunnur" },
          { id: 7, siteName: "Summary Bill" },
          { id: 8, siteName: "Daily Wage" },
          { id: 9, siteName: "Rent Management Portal" },
          { id: 10, siteName: "Multi-Project Batch" },
          { id: 11, siteName: "Loan Portal" }
        ];
        const allSites = [...predefinedSites, ...(Array.isArray(sitesRes.data) ? sitesRes.data : [])];
        setSiteLookup(allSites.reduce((acc, site) => {
          if (site?.id !== undefined && site?.siteName) {
            acc[site.id] = site.siteName;
          }
          return acc;
        }, {}));
      } catch (error) {
        console.error('Error fetching lookup data:', error);
      }
    };
    fetchReferenceData();
  }, [canViewEditRequests]);

  const fetchEditRequests = async () => {
    try {
      const response = await axios.get('https://backendaab.in/aabuildersDash/api/edit_requests/getAll', {
        withCredentials: true
      });
      const allRequests = response.data || [];
      const pending = allRequests.filter(req => !req.request_completed);
      setEditRequests(pending);
      setPendingRequestsCount(pending.length);
    } catch (error) {
      console.error('Error fetching edit requests:', error);
    }
  };

  const loadRequestRecord = async (request) => {
    if (!request?.module_name_id) return;

    try {
      setRequestRecordLoading(true);
      setRequestRecordError('');

      let response;

      if (request.module_name === 'Advance Portal') {
        response = await axios.get(
          `https://backendaab.in/aabuildersDash/api/advance_portal/get/${request.module_name_id}`,
          { withCredentials: true }
        );
      } else if (request.module_name === 'Staff Portal') {
        response = await axios.get(
          `https://backendaab.in/aabuildersDash/api/staff-advance/${request.module_name_id}`,
          { withCredentials: true }
        );
      } else if (request.module_name === 'Loan Portal') {
        response = await axios.get(
          `https://backendaab.in/aabuildersDash/api/loans/${request.module_name_id}`,
          { withCredentials: true }
        );
      }else {
        return; // unsupported module
      }

      const record = response.data;

      if (record) {
        setSelectedRequestRecord(record);
      } else {
        setRequestRecordError('Unable to locate record details.');
      }

    } catch (error) {
      console.error('Error loading request record:', error);
      setRequestRecordError('Failed to load record details.');
    } finally {
      setRequestRecordLoading(false);
    }
  };
  const handleRequestCardClick = (request) => {
    setSelectedRequest(request);
    setSelectedRequestRecord(null);
    setRequestRecordError('');
    setIsEditRequestsDropdownOpen(false);
    loadRequestRecord(request);
  };

  const getVendorNameById = (id) => vendorLookup?.[id] || '';
  const getContractorNameById = (id) => contractorLookup?.[id] || '';
  const getEmployeeNameById = (id) => employeeLookup?.[id] || '';
  const getLabourNameById = (id) => labourLookup?.[id] || '';
  const getSiteNameById = (id) => {
    if (id === null || id === undefined) return '';
    return siteLookup?.[id] || '';
  };

  const getAssociateName = (record) => {
    if (!record) return '';
    if (record.vendor_id) return getVendorNameById(record.vendor_id);
    if (record.contractor_id) return getContractorNameById(record.contractor_id);
    if (record.employee_id) return getEmployeeNameById(record.employee_id);
    if (record.labour_id) return getLabourNameById(record.labour_id);
    return '';
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const handleApproveRequest = async (requestId, moduleName, moduleNameId) => {
    try {
      if (moduleNameId) {
        if (moduleName === 'Advance Portal') {
          await axios.put(
            `https://backendaab.in/aabuildersDash/api/advance_portal/allow/${moduleNameId}?allow=true`,
            {},
            { withCredentials: true }
          );
        } else if (moduleName === 'Staff Portal') {
          await axios.put(
            `https://backendaab.in/aabuildersDash/api/staff-advance/allow/${moduleNameId}?allow=true`,
            {},
            { withCredentials: true }
          );
        } else if (moduleName === 'Loan Portal') {
          await axios.put(
            `https://backendaab.in/aabuildersDash/api/loans/allow/${moduleNameId}?allow=true`,
            {},
            { withCredentials: true }
          );
        }
      }
      await axios.put(
        `https://backendaab.in/aabuildersDash/api/edit_requests/edit/${requestId}`,
        {
          request_approval: true,
          request_completed: true,
        },
        { withCredentials: true }
      );
      alert('Edit request approved. User can now edit the record.');
      closeSelectedRequestModal();
      setIsEditRequestsDropdownOpen(false);
      fetchEditRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(`https://backendaab.in/aabuildersDash/api/edit_requests/edit/${requestId}`, {
        request_approval: false,
        request_completed: true
      }, {
        withCredentials: true
      });
      alert('Edit request rejected.');
      closeSelectedRequestModal();
      setIsEditRequestsDropdownOpen(false);
      fetchEditRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? String(hours).padStart(2, '0') : '12';
      return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    } catch {
      return dateString;
    }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <nav className="navbar fixed w-full top-0 z-50 bg-white h-14 shadow-md">
        <div className="flex justify-between items-center h-full px-4">
          <div className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="cursor-pointer w-[42px] h-[40px] rounded-full"
              onClick={toggleSidebar}
            />
            <p className="text-[#BF9853] ml-2 font-medium text-lg">BUILDERS</p>
          </div>
          <div className="relative flex items-center space-x-4" ref={profileRef}>
            {canDownloadExpenses && (
              <button type="button" onClick={handleDownloadExpenses} disabled={isDownloading}
                className="flex items-center border border-[#BF9853] rounded-md text-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                title={isDownloading ? "Preparing download..." : "Download expenses and master data"}
              >
                <img src={DownloadIcon} alt="Download expenses" className="w-5 h-5" />
              </button>
            )}
            {canViewEditRequests && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    const willOpen = !isEditRequestsDropdownOpen;
                    setIsEditRequestsDropdownOpen(willOpen);
                    setIsProfileDropdownVisible(false);
                    if (willOpen) {
                      fetchEditRequests();
                    }
                  }}
                  className="relative flex items-center border border-[#BF9853] rounded-md text-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors duration-150 p-2"
                  title="Edit Requests"
                >
                  <img src={EditIcon} alt="Edit Requests" className="w-5 h-5" />
                  {pendingRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>
                {isEditRequestsDropdownOpen && (
                  <div className="absolute right-0 top-12 w-96 bg-white shadow-2xl rounded-2xl border border-gray-200 p-4 z-[200]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-[#BF9853]">Pending Requests</h3>
                      <span className="text-xs text-gray-500">
                        {pendingRequestsCount} pending
                      </span>
                    </div>
                    {editRequests.length === 0 ? (
                      <div className="text-center text-sm text-gray-500 py-6">
                        No pending edit requests
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                        {editRequests.map((request) => (
                          <div
                            key={request.id}
                            onClick={() => handleRequestCardClick(request)}
                            className="border border-gray-200 rounded-xl p-2 cursor-pointer hover:shadow-md transition-colors duration-200 hover:border-[#BF9853]"
                          >
                            <div className="flex justify-between gap-5 text-sm text-gray-800 font-semibold">
                              <div className="space-y-1">
                                <p>{request.module_name || '-'}</p>
                                <p className="text-[8px]">{request.request_send_by || '-'}</p>
                              </div>
                              <div className="text-right space-y-1">
                                <p>{request.module_name_eno || '-'}</p>
                                <p className="text-[8px]">{formatDate(request.timestamp)}</p>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {userImage ? (
              <img
                src={`data:image/jpeg;base64,${userImage}`}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                onClick={() => {
                  setIsProfileDropdownVisible((prev) => !prev);
                  setIsEditRequestsDropdownOpen(false);
                }}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold cursor-pointer"
                onClick={() => {
                  setIsProfileDropdownVisible((prev) => !prev);
                  setIsEditRequestsDropdownOpen(false);
                }}
              >
                {username?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-gray-700 font-medium">{username}</span>
            <img
              src={Logout}
              alt="Logout"
              onClick={onLogout}
              className="w-8 h-8 cursor-pointer"
            />
            {isProfileDropdownVisible && (
              <div className="absolute right-0 top-14 bg-white shadow-lg rounded-md p-4 w-72 z-20">
                <div className="items-center">
                  {userImage ? (
                    <img
                      src={`data:image/jpeg;base64,${userImage}`}
                      alt="Profile"
                      className="w-64 h-64 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                      {username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">{username}</p>
                    <p className="text-sm text-gray-500">{position}</p>
                  </div>
                </div>
                <p className="text-base text-gray-600 break-all">{email}</p>
              </div>
            )}
          </div>
        </div>
      </nav>
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[90%]  overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#BF9853]">Edit Request Details</h2>
              <button
                onClick={closeSelectedRequestModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-2 rounded-lg text-sm">
                <strong>Permission Request:</strong> User is requesting permission to edit this record ( Entry No: {selectedRequest.module_name_eno}).
              </div>
              <div className="space-y-2">
                {requestRecordLoading && (
                  <div className="text-sm text-gray-500">Loading record details...</div>
                )}
                {requestRecordError && (
                  <div className="text-sm text-red-500">{requestRecordError}</div>
                )}
                {!requestRecordLoading && selectedRequestRecord && (
                  <div className=" border-l-8 border-l-[#BF9853] rounded-xl overflow-auto">
                    <table className="min-w-[1000px] w-full text-sm">
                      <thead className="bg-[#FAF6ED] text-[11px] uppercase">
                        <tr>
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">Associate</th>
                          <th className="px-3 py-2 text-left">Project Name</th>
                          <th className="px-3 py-2 text-left">Transfer Site</th>
                          <th className="px-3 py-2 text-right">Advance</th>
                          <th className="px-3 py-2 text-right">Bill Payment</th>
                          <th className="px-3 py-2 text-right">Refund</th>
                          <th className="px-3 py-2 text-left">Type</th>
                          <th className="px-3 py-2 text-left">Description</th>
                          <th className="px-3 py-2 text-left">Mode</th>
                          <th className="px-3 py-2 text-left">Attached File</th>
                          <th className="px-3 py-2 text-left">E.No</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white text-left">
                          <td className="px-3 py-2 font-semibold">{formatDateOnly(selectedRequestRecord.date)}</td>
                          <td className="px-3 py-2 font-semibold">{getAssociateName(selectedRequestRecord) || '-'}</td>
                          <td className="px-3 py-2 font-semibold">{getSiteNameById(selectedRequestRecord.project_id) || '-'}</td>
                          <td className="px-3 py-2 font-semibold">{getSiteNameById(selectedRequestRecord.transfer_site_id) || '-'}</td>
                          <td className="px-3 py-2 text-right font-semibold">{formatCurrency(selectedRequestRecord.amount)}</td>
                          <td className="px-3 py-2 text-right font-semibold">{formatCurrency(selectedRequestRecord.bill_amount)}</td>
                          <td className="px-3 py-2 text-right font-semibold">{formatCurrency(selectedRequestRecord.refund_amount)}</td>
                          <td className="px-3 py-2 font-semibold">{selectedRequestRecord.type || '-'}</td>
                          <td className="px-3 py-2 font-semibold">{selectedRequestRecord.description || '-'}</td>
                          <td className="px-3 py-2 font-semibold">{selectedRequestRecord.payment_mode || '-'}</td>
                          <td className="px-3 py-2 font-semibold">
                            {selectedRequestRecord.file_url ? (
                              <a
                                href={selectedRequestRecord.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-500 underline"
                              >
                                View
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-3 py-2 font-semibold">{selectedRequestRecord.entry_no || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {!selectedRequest.request_completed && (
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => handleRejectRequest(selectedRequest.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-semibold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveRequest(selectedRequest.id,selectedRequest.module_name, selectedRequest.module_name_id)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-semibold"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Sidebar isVisible={isSidebarVisible} sidebarRef={sidebarRef} userRoles={userRoles} onCloseSidebar={() => setIsSidebarVisible(false)} />
    </>
  );
};
export default Navbar;