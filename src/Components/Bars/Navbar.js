import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import * as XLSX from 'xlsx';
import logo from '../Images/aablogo.png';
import Sidebar from './Sidebar';
import Logout from '../Images/Logout.png'
import DownloadIcon from '../Images/download.png';
const Navbar = ({ username, userImage, position, email, onLogout , userRoles = []}) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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
        // Flatten all matched models
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
        tenantLinkResponse
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
        axios.get("https://backendaab.in/aabuildersDash/api/tenant_link_shop/getAll")
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

      // Build site lookup including predefined sites for advance portal
      const predefinedSites = [
        { id: 1, siteName: "Mason Advance" },
        { id: 2, siteName: "Material Advance" },
        { id: 3, siteName: "Weekly Advance" },
        { id: 4, siteName: "Excess Advance" },
        { id: 5, siteName: "Material Rent" },
        { id: 6, siteName: "Subhash Kumar - Kunnur" },
        { id: 7, siteName: "Summary Bill" },
        { id: 8, siteName: "Daily Wage" },
        { id: 9, siteName: "Rent Management Portal" }
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
          Timestamp: formatDate(expense.timestamp, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
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
          'E.No': entry.entry_no || ''
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
          'Type': entry.formType || ''
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
          'E.No': entry.entry_no || ''
        };
      });
      const expensesWorksheet = XLSX.utils.json_to_sheet(worksheetData);
      const advanceWorksheet = XLSX.utils.json_to_sheet(advanceWorksheetData);
      const loanWorksheet = XLSX.utils.json_to_sheet(loanWorksheetData);
      const rentWorksheet = XLSX.utils.json_to_sheet(rentWorksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, expensesWorksheet, 'Expenses');
      XLSX.utils.book_append_sheet(workbook, advanceWorksheet, 'Advance Portal');
      XLSX.utils.book_append_sheet(workbook, loanWorksheet, 'Loan Portal');
      XLSX.utils.book_append_sheet(workbook, rentWorksheet, 'Rent Management');
      const dateStamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `Expenses_${dateStamp}.xlsx`);
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
    }
  };
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar fixed w-full top-0 z-10 bg-white h-14 shadow-md">
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
                className="flex items-center px-3 py-1 border border-[#BF9853] rounded-md text-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                title={isDownloading ? "Preparing download..." : "Download expenses"}
              >
                <img src={DownloadIcon} alt="Download expenses" className="w-5 h-5 mr-2" />
                <span>{isDownloading ? 'Preparing...' : 'Download'}</span>
              </button>
            )}
            {userImage ? (
              <img
                src={`data:image/jpeg;base64,${userImage}`}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                onClick={() => setIsProfileDropdownVisible((prev) => !prev)}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold cursor-pointer"
                onClick={() => setIsProfileDropdownVisible((prev) => !prev)}
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
      <Sidebar isVisible={isSidebarVisible} sidebarRef={sidebarRef} userRoles={userRoles} onCloseSidebar={() => setIsSidebarVisible(false)}/>
    </>
  );
};
export default Navbar;