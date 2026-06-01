import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import axios from "axios";
import logo from '../Images/AALogo.svg';
import { canDownloadExpensesReport, downloadExpensesReport } from '../../utils/downloadExpensesReport';
import Sidebar from './Sidebar';
import { isOrbitAppChromeRoute } from '../OrbitERP/orbitAppChromePaths';
const Navbar = ({ username, userImage, position, email, onLogout, userRoles = [], branchId, brachId }) => {
  const location = useLocation();
  const hideMainNavForOrbitChrome = isOrbitAppChromeRoute(location.pathname);
  /** Same pattern as Orbit ERP 1.6.html: one drawerOpen at app root — here SidebarProvider owns visibility for TopBar + legacy Navbar + OrbitAppChrome. */
  const { isSidebarVisible, closeSidebar } = useSidebar();
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
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);
  const notificationScrollRef = useRef(null);
  const [roleModels, setRoleModels] = useState([]);
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const response = await axios.get("https://backendaab.in/demoAabuilderDash/api/user_roles/all");
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
  const normalizedUsername = username?.trim().toLowerCase();
  const canDownloadExpenses = canDownloadExpensesReport(username);
  const canViewEditRequests = normalizedUsername === 'admin' || normalizedUsername === 'mahalingam m';
  const canSelectBranch = normalizedUsername === 'admin' || normalizedUsername === 'mahalingam m';
  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  };
  const storedUser = getStoredUser();
  const parsedBranchId = Number(
    branchId ??
    brachId ??
    storedUser?.branchId ??
    storedUser?.branch_id ??
    storedUser?.brachId
  );
  const userBranchId = Number.isFinite(parsedBranchId) ? parsedBranchId : '';
  useEffect(() => {
    let isMounted = true;
    const fetchBranches = async () => {
      try {
        const response = await axios.get('https://backendaab.in/demoAabuildersDash/api/branch/getAll', { withCredentials: true });
        if (!isMounted) return;
        const branches = Array.isArray(response.data) ? response.data : [];
        setBranchOptions(branches);
      } catch (error) {
        console.error('Error fetching branch list:', error);
      }
    };
    fetchBranches();
    return () => {
      isMounted = false;
    };
  }, []);
  useEffect(() => {
    const savedBranchId = localStorage.getItem('selectedBranchId');
    const savedBranchIdAsNumber = Number(savedBranchId);
    const hasValidSavedBranch = Number.isFinite(savedBranchIdAsNumber) && savedBranchIdAsNumber > 0;
    if (canSelectBranch) {
      const nextBranchId = hasValidSavedBranch ? String(savedBranchIdAsNumber) : '';
      setSelectedBranchId(nextBranchId);
      if (nextBranchId) {
        localStorage.setItem('selectedBranchId', nextBranchId);
        window.dispatchEvent(new CustomEvent('branchSelectionChanged', { detail: { branchId: nextBranchId } }));
      }
      return;
    }
    if (userBranchId !== '') {
      const fixedBranchId = String(userBranchId);
      setSelectedBranchId(fixedBranchId);
      localStorage.setItem('selectedBranchId', fixedBranchId);
      window.dispatchEvent(new CustomEvent('branchSelectionChanged', { detail: { branchId: fixedBranchId } }));
    }
  }, [canSelectBranch, userBranchId]);
  useEffect(() => {
    if (!Array.isArray(branchOptions) || branchOptions.length === 0) return;
    if (canSelectBranch) {
      if (selectedBranchId) return;
      const fallbackBranchId = userBranchId || branchOptions[0]?.id;
      if (fallbackBranchId) {
        const branchIdString = String(fallbackBranchId);
        setSelectedBranchId(branchIdString);
        localStorage.setItem('selectedBranchId', branchIdString);
        window.dispatchEvent(new CustomEvent('branchSelectionChanged', { detail: { branchId: branchIdString } }));
      }
      return;
    }
    if (userBranchId !== '') {
      const fixedBranchId = String(userBranchId);
      if (selectedBranchId !== fixedBranchId) {
        setSelectedBranchId(fixedBranchId);
        localStorage.setItem('selectedBranchId', fixedBranchId);
        window.dispatchEvent(new CustomEvent('branchSelectionChanged', { detail: { branchId: fixedBranchId } }));
      }
    }
  }, [branchOptions, canSelectBranch, selectedBranchId, userBranchId]);
  const handleBranchChange = (event) => {
    const nextBranchId = event.target.value;
    setSelectedBranchId(nextBranchId);
    if (nextBranchId) {
      localStorage.setItem('selectedBranchId', nextBranchId);
      const selectedBranch = branchOptions.find((branch) => String(branch.id) === String(nextBranchId));
      if (selectedBranch?.branch) {
        localStorage.setItem('selectedBranchName', selectedBranch.branch);
      }
    }
    window.dispatchEvent(new CustomEvent('branchSelectionChanged', { detail: { branchId: nextBranchId } }));
  };
  const handleDownloadExpenses = async () => {
    if (isDownloading || !canDownloadExpenses) return;
    setIsDownloading(true);
    try {
      await downloadExpensesReport();
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
      closeSidebar();
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
          axios.get("https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll", { withCredentials: true }),
          axios.get("https://backendaab.in/demoAabuilderDash/api/contractor_Names/getAll", { withCredentials: true }),
          axios.get("https://backendaab.in/demoAabuilderDash/api/project_Names/getAll", { withCredentials: true }),
          axios.get("https://backendaab.in/demoAabuildersDash/api/employee_details/getAll", { withCredentials: true }),
          axios.get("https://backendaab.in/demoAabuildersDash/api/labours-details/getAll", { withCredentials: true })
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
      const response = await axios.get('https://backendaab.in/demoAabuildersDash/api/edit_requests/getAll', {
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
          `https://backendaab.in/demoAabuildersDash/api/advance_portal/get/${request.module_name_id}`,
          { withCredentials: true }
        );
      } else if (request.module_name === 'Staff Portal') {
        response = await axios.get(
          `https://backendaab.in/demoAabuildersDash/api/staff-advance/${request.module_name_id}`,
          { withCredentials: true }
        );
      } else if (request.module_name === 'Loan Portal') {
        response = await axios.get(
          `https://backendaab.in/demoAabuildersDash/api/loans/${request.module_name_id}`,
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
            `https://backendaab.in/demoAabuildersDash/api/advance_portal/allow/${moduleNameId}?allow=true`,
            {},
            { withCredentials: true }
          );
        } else if (moduleName === 'Staff Portal') {
          await axios.put(
            `https://backendaab.in/demoAabuildersDash/api/staff-advance/allow/${moduleNameId}?allow=true`,
            {},
            { withCredentials: true }
          );
        } else if (moduleName === 'Loan Portal') {
          await axios.put(
            `https://backendaab.in/demoAabuildersDash/api/loans/allow/${moduleNameId}?allow=true`,
            {},
            { withCredentials: true }
          );
        }
      }
      await axios.put(
        `https://backendaab.in/demoAabuildersDash/api/edit_requests/edit/${requestId}`,
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
      await axios.put(`https://backendaab.in/demoAabuildersDash/api/edit_requests/edit/${requestId}`, {
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
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      const then = new Date(dateString).getTime();
      if (Number.isNaN(then)) return formatDate(dateString);
      const sec = Math.max(0, Math.floor((Date.now() - then) / 1000));
      if (sec < 60) return `${sec || 1} sec ago`;
      const min = Math.floor(sec / 60);
      if (min < 60) return `${min} min ago`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr} hr ago`;
      const day = Math.floor(hr / 24);
      if (day < 7) return `${day} day${day === 1 ? '' : 's'} ago`;
      return formatDate(dateString);
    } catch {
      return formatDate(dateString);
    }
  };
  const getNotificationRowMeta = (request) => {
    const mod = String(request?.module_name || '').toLowerCase();
    if (mod.includes('advance')) {
      return {
        title: 'Advance recorded',
        iconBg: '#FFF4D6',
        icon: <span className="text-[13px] font-bold leading-none text-[#B8860B]">₹</span>,
      };
    }
    if (mod.includes('loan')) {
      return {
        title: 'Bill settled',
        iconBg: '#E8F5EC',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="#2f9e6e" strokeWidth="1.5" />
            <path d="M8 12l3 3 5-6" stroke="#2f9e6e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      };
    }
    if (mod.includes('staff')) {
      return {
        title: 'Receipt attached',
        iconBg: '#F5EFE3',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M8.5 12.5c2-2 5-2 7 0"
              stroke="#B8924B"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path d="M7 5h10a2 2 0 012 2v12H5V7a2 2 0 012-2z" stroke="#B8924B" strokeWidth="1.4" />
          </svg>
        ),
      };
    }
    return {
      title: 'Pending approval',
      iconBg: '#FFE7E7',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="#d23b3b" strokeWidth="1.5" />
          <path d="M12 8v5" stroke="#d23b3b" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="1" fill="#d23b3b" />
        </svg>
      ),
    };
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@700&display=swap');
        .navbar-notification-scroll::-webkit-scrollbar { width: 8px; }
        .navbar-notification-scroll::-webkit-scrollbar-track { background: #e8e4dc; border-radius: 6px; margin: 4px 0; }
        .navbar-notification-scroll::-webkit-scrollbar-thumb { background: #b8b3a8; border-radius: 6px; }
        .navbar-notification-scroll::-webkit-scrollbar-thumb:hover { background: #9c968a; }
        .navbar-notification-scroll { scrollbar-width: thin; scrollbar-color: #b8b3a8 #e8e4dc; }
        .navbar-orbit-end{
          --gold:#D6AB60; --gold-soft:#E6C68A; --gold-deep:#B8924B; --gold-darker:#9C7A3A;
          --ink:#212121; --ink-2:#3a3a3a; --muted:#8a8275; --muted-2:#a59c8a;
          --cream:#FBF7F0; --cream-2:#F5EFE3; --cream-3:#FAF4E8;
          --line:#EADFC8; --line-soft:#f0e9d8;
          --green:#2f9e6e; --green-soft:#3eb37f; --green-bg:#E0F1E5;
          --red:#d23b3b; --red-bg:#FFE7E7;
          font-family:'Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif;
          color:var(--ink);
        }
        .navbar-brand-button{
          display:flex;
          align-items:center;
          gap:9px;
          background:transparent;
          border:none;
          padding:3px 6px;
          margin-left:-14px;
          border-radius:8px;
        }
        .navbar-brand-text{
          font-family:'Outfit',sans-serif;
          font-weight:700;
          font-size:15.5px;
          color:#BF9853;
          letter-spacing:0.16em;
          line-height:1;
          white-space:nowrap;
          text-transform:uppercase;
        }
        .navbar.navbar-unified{
          position:fixed !important;
          top:0 !important;
          left:0 !important;
          width:100% !important;
          background:#fff !important;
        }
        .navbar.navbar-unified::after{
          content:"";
          position:absolute;
          left:0;
          right:0;
          bottom:-10px;
          height:10px;
          background:#fff;
          pointer-events:none;
        }
        .navbar-orbit-end .ink{color:var(--ink);}
        .navbar-orbit-end .muted{color:var(--muted);}
        .navbar-brand-button{display:flex;align-items:center;gap:9px;background:transparent;border:none;padding:3px 6px;margin-left:-14px;border-radius:8px;}
        .navbar-brand-text{font-family:'Outfit',sans-serif;font-weight:700;font-size:15.5px;color:var(--gold-deep);letter-spacing:0.16em;line-height:1;white-space:nowrap;text-transform:uppercase;}
        .navbar-orbit-end .branch-select{background:#fff;border:1px solid var(--line);border-radius:7px;padding:5px 28px 5px 10px;font-size:12.5px;font-weight:600;color:var(--ink-2);appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'><path d='M2 4l3 3 3-3' stroke='%238a8275' stroke-width='1.5' fill='none'/></svg>");background-repeat:no-repeat;background-position:right 9px center;cursor:pointer;min-width:128px;}
        .navbar-orbit-end .branch-select:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(214,171,96,0.15);}
        .navbar-orbit-end .branch-select-static{display:inline-flex;align-items:center;background:#fff;border:1px solid var(--line);border-radius:7px;padding:5px 10px;font-size:12.5px;font-weight:600;color:var(--ink-2);min-width:128px;}
        .navbar-orbit-end .icon-btn{width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:7px;background:#fff;color:var(--ink-2);cursor:pointer;transition:all .15s;position:relative;}
        .navbar-orbit-end .icon-btn:hover{background:var(--cream-2);}
        .navbar-orbit-end .icon-btn:disabled{opacity:0.5;cursor:not-allowed;}
        .navbar-orbit-end .icon-btn.gold{color:var(--gold-deep);}
        .navbar-orbit-end .icon-btn .notif-dot{position:absolute;top:-3px;right:-3px;background:var(--red);color:#fff;font-size:9px;font-weight:700;min-width:15px;height:15px;border-radius:999px;padding:0 4px;display:inline-flex;align-items:center;justify-content:center;border:1.5px solid #fff;line-height:1;}
        .navbar-orbit-end .avatar-mark{width:30px;height:30px;border-radius:50%;background:var(--cream-2);border:1.5px solid var(--gold);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;}
        .navbar-orbit-end .user-pill{display:inline-flex;align-items:center;gap:7px;padding:2px 8px 2px 2px;}
        .navbar-orbit-end .navbar-orbit-profile-hit{border-radius:8px;}
        .navbar-orbit-end .navbar-orbit-profile-hit:hover{background:var(--cream-2);}
        @media(max-width:768px){
          .navbar-brand-text{display:none;}
          .navbar-orbit-end .desktop-only{display:none;}
        }
      `}</style>
      {!hideMainNavForOrbitChrome && (
      <nav className="navbar navbar-unified fixed top-0 z-[300] flex w-full min-h-[64px] items-center border-b border-[#EADFC8] bg-white px-4 py-[5px]">
        <div className="flex w-full items-center justify-start">
          <div className="navbar-brand-button w-[147px] h-[32px]">
            <img
              src={logo}
              alt="AA Builders"
              className=" object-cover"
            />
          </div>
          <div className="navbar-orbit-end relative ml-auto flex shrink-0 flex-wrap items-center gap-2" ref={profileRef}>
            {canSelectBranch ? (
              <div className="flex items-center">
                <select
                  value={selectedBranchId}
                  onChange={handleBranchChange}
                  className="branch-select"
                  title="Select Branch"
                >
                  <option value="">Select Branch</option>
                  {branchOptions.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                      {item.branch}
                    </option>
                  ))}
                </select>
              </div>
            ) : selectedBranchId ? (
              <div className="flex items-center">
                <span className="branch-select-static">
                  {branchOptions.find((b) => String(b.id) === String(selectedBranchId))?.branch || ''}
                </span>
              </div>
            ) : null}
            {canDownloadExpenses && (
              <button
                type="button"
                onClick={handleDownloadExpenses}
                disabled={isDownloading}
                className="icon-btn desktop-only"
                title={isDownloading ? "Preparing download..." : "Download expenses and master data"}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 4v12M6 11l6 6 6-6M5 21h14" />
                </svg>
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
                  className="icon-btn gold"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                    <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10 21a2 2 0 004 0" />
                  </svg>
                  {pendingRequestsCount > 0 && (
                    <span className="notif-dot">{pendingRequestsCount > 9 ? "9+" : pendingRequestsCount}</span>
                  )}
                </button>
                {isEditRequestsDropdownOpen && (
                  <div
                    className="absolute right-0 top-12 z-[200] w-[min(100vw-24px,380px)] overflow-hidden rounded-xl border border-[#E8E4DC] shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
                    style={{ background: '#FAF9F6' }}
                  >
                    <div className="flex items-center justify-between border-b border-[#ECE8E0] px-4 py-3">
                      <h3
                        className="text-[17px] font-bold tracking-tight text-[#1a1a1a]"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                      >
                        Notifications
                      </h3>
                      <button
                        type="button"
                        className="text-[13px] font-semibold text-[#B8924B] hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditRequestsDropdownOpen(false);
                        }}
                      >
                        Mark all read
                      </button>
                    </div>
                    {editRequests.length === 0 ? (
                      <div className="px-4 py-10 text-center text-[13px] text-[#7A756C]">No notifications</div>
                    ) : (
                      <div
                        ref={notificationScrollRef}
                        className="navbar-notification-scroll max-h-[min(52vh,340px)] overflow-y-auto"
                      >
                        {editRequests.map((request) => {
                          const meta = getNotificationRowMeta(request);
                          const desc = `Edit request for ${request.module_name || 'record'} — Entry ${request.module_name_eno ?? '-'} · ${request.request_send_by || 'Unknown'}`;
                          return (
                            <button
                              key={request.id}
                              type="button"
                              onClick={() => handleRequestCardClick(request)}
                              className="flex w-full gap-3 border-b border-[#EFEDE8] px-4 py-3 text-left transition-colors hover:bg-[#F3F1EA]"
                            >
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                                style={{ backgroundColor: meta.iconBg }}
                              >
                                {meta.icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-bold text-[#1a1a1a]">{meta.title}</p>
                                <p className="mt-0.5 text-[12px] leading-snug text-[#6B6B6B]">{desc}</p>
                                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#8A8A8A]">
                                  <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                                  {formatRelativeTime(request.timestamp)}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <div className="border-t border-[#E8E4DC] bg-[#F3F0E8] px-4 py-3 text-center">
                      <button
                        type="button"
                        className="text-[13px] font-semibold text-[#B8924B] hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          const el = notificationScrollRef.current;
                          if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
                        }}
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <span className="user-pill">
              <button
                type="button"
                className="navbar-orbit-profile-hit flex items-center gap-[7px] border-0 bg-transparent p-0"
                onClick={() => {
                  setIsProfileDropdownVisible((prev) => !prev);
                  setIsEditRequestsDropdownOpen(false);
                }}
                aria-expanded={isProfileDropdownVisible}
                aria-haspopup="true"
              >
                <span className="avatar-mark">
                  {userImage ? (
                    <img
                      src={`data:image/jpeg;base64,${userImage}`}
                      alt=""
                      width={18}
                      height={18}
                      className="block rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] font-bold leading-none text-[#3a3a3a]">{username?.charAt(0).toUpperCase()}</span>
                  )}
                </span>
                <span className="hidden sm:flex flex-col leading-tight text-left">
                  <span className="text-[12px] font-semibold ink">{username}</span>
                  <span className="text-[9.5px] muted">AA Builders</span>
                </span>
              </button>
              <button type="button" className="icon-btn ml-1" title="Sign out" onClick={onLogout} aria-label="Sign out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l-5-5 5-5M5 12h11" />
                </svg>
              </button>
            </span>
            {isProfileDropdownVisible && (
              <div className="absolute right-0 top-full z-20 mt-1 w-72 rounded-md bg-white p-4 shadow-lg">
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
      )}
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
      <Sidebar isVisible={isSidebarVisible} sidebarRef={sidebarRef} userRoles={userRoles} onCloseSidebar={closeSidebar} />
    </>
  );
};
export default Navbar;