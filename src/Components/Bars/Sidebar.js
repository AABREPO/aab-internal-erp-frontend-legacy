import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import home from '../Images/dashboard.svg';
import homeWhite from '../Images/dashboard1.svg';
import billing from '../Images/Billing.svg';
import billingWhite from '../Images/Billing1.svg';
import crm from '../Images/CRM 1.1 B.svg';
import crmWhite from '../Images/CRM 1.1 W.svg';
import account from '../Images/Accounts.svg';
import accountWhite from '../Images/Accounts1.svg';
import procurement from '../Images/Procurement.svg'
import procurementWhite from '../Images/Procurement1.svg';
import designtools from '../Images/Design Tools.svg';
import designtoolsWhite from '../Images/Design Tools1.svg';
import hr from '../Images/HR.svg';
import hrWhite from '../Images/HR1.svg';
import sidesaving from '../Images/Master Data Black.svg'
import sidesetting from '../Images/Utility Hub Black.svg'
import sideMasterData from '../Images/Master Data White.svg'
import sideUtilityHub from '../Images/Utility Hub White.svg'
function Sidebar({ isVisible, sidebarRef, userRoles = [], onCloseSidebar }) {
  const [activeMenu, setActiveMenu] = useState('');
  const [activeSubmenuItem, setActiveSubmenuItem] = useState('');
  const [roleModels, setRoleModels] = useState([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const response = await axios.get("https://backendaab.in/demoAabuilderDash/api/user_roles/all");
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

  // Effect to set active menu and submenu based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    // Allow a Link to force which sidebar section stays open.
    // Used when multiple menu items intentionally navigate to the same route.
    const forcedMenu = location.state?.sidebarMenu;
    const forcedSubmenu = location.state?.sidebarSubmenu;
    if (forcedMenu) {
      setActiveMenu(forcedMenu);
      setActiveSubmenuItem(forcedSubmenu || '');
      return;
    }

    // Define route mappings
    const routeMappings = {
      // Billing routes
      '/tracker/pendingbill': { menu: 'billing', submenu: 'Bill Payments Tracker' },
      '/entrychecklist': { menu: 'billing', submenu: 'Bill Entry Checklist' },
      '/invoice-bill/invoice': { menu: 'billing', submenu: 'Invoice' },
      '/quotation': { menu: 'billing', submenu: 'Quotation' },
      '/changeOrder': { menu: 'billing', submenu: 'Change Order' },

      // CRM routes
      '/enquiry': { menu: 'crm', submenu: 'Enquiry' },
      '/projects': { menu: 'crm', submenu: 'Projects' },

      // Account routes
      '/vendorPaymentsTracker': { menu: 'account', submenu: 'Vendor Payments Tracker' },
      '/portal/advancePortal': { menu: 'account', submenu: 'Advance Portal' },
      '/loan/loanportal': { menu: 'account', submenu: 'Loan Portal' },
      '/paymentReceipt': { menu: 'account', submenu: 'Payment Receipt' },
      '/rent/Form': { menu: 'account', submenu: 'Rent Management' },
      '/Claim/claimpaymentsummary': { menu: 'account', submenu: 'Claim Payments' },
      '/weekly-payment/WeeklyPayment': { menu: 'account', submenu: 'Weekly Payment Register' },
      '/bank-register': { menu: 'account', submenu: 'Bank Register' },
      '/expense-entry': { menu: 'account', submenu: 'Expense Entry' },
      '/expense-dashboard': { menu: 'account', submenu: 'Expense Dashboard' },
      '/bankreconciliation': { menu: 'account', submenu: 'Bank Reconciliation' },
      '/orbit-erp/bill-payment': { menu: 'account', submenu: 'Orbit ERP' },

      // Procurement routes
      '/purchaseorder': { menu: 'procurement', submenu: 'Purchase Order' },
      '/inventory': { menu: 'procurement', submenu: 'Inventory' },
      '/toolsTracker': { menu: 'procurement', submenu: 'Tools Tracker' },

      // Design Tools routes
      '/designtool/tileCalculate': { menu: 'designtools', submenu: 'Tile Calculator' },
      '/paints/paintCalculation': { menu: 'designtools', submenu: 'Paint Calculator' },
      '/bath/BathFixtures Matrix': { menu: 'designtools', submenu: 'Bath Fixtures Matrix' },
      '/rccal/RCCCalculation': { menu: 'designtools', submenu: 'RCC Calculation' },
      '/switch/SwitchMatrix': { menu: 'designtools', submenu: 'Switch Matrix' },
      '/masonary/masonarycalculater': { menu: 'designtools', submenu: 'Masonary Calculator' },
      '/carpentry/carpentrycalculator': { menu: 'designtools', submenu: 'Carpentry Calculator' },

      // HR routes
      '/billView': { menu: 'hr', submenu: 'onboarding' },
      '/attendance': { menu: 'hr', submenu: 'Attendance' },
      '/staffadvance/staffAdvance': { menu: 'hr', submenu: 'Staff Advance' },
      '/user_manage': { menu: 'hr', submenu: 'Manage User' },

      // Master Data routes
      '/master-data': { menu: 'masterdata', submenu: 'Master Data' },

      // Utility Hub routes
      '/utility/dashboard': { menu: 'utility', submenu: 'Dashboard' },
      '/directory': { menu: 'utility', submenu: 'Directory' }
    };

    // Find matching route
    const routeMapping = routeMappings[currentPath];
    if (routeMapping) {
      setActiveMenu(routeMapping.menu);
      setActiveSubmenuItem(routeMapping.submenu);
    } else {
      // Check for home route or default
      if (currentPath === '/' || currentPath === '/dashboard') {
        setActiveMenu('home');
        setActiveSubmenuItem('');
      } else {
        // Reset if no match found
        setActiveMenu('');
        setActiveSubmenuItem('');
      }
    }
  }, [location.pathname]);
  useEffect(() => {
    // Collapse expanded sidebar after route navigation.
    setIsSidebarExpanded(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!isSidebarExpanded) return;
      if (sidebarRef?.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSidebarExpanded, sidebarRef]);
  const handleMenuClick = (menu) => {
    if (!isSidebarExpanded) {
      setIsSidebarExpanded(true);
      setActiveMenu(menu);
      return;
    }
    setActiveMenu(menu === activeMenu ? '' : menu);
  };
  const handleSubmenuItemClick = (itemName) => {
    setActiveSubmenuItem(itemName === activeSubmenuItem ? '' : itemName);
  };
  const buildTime = process.env.REACT_APP_BUILD_TIME;
  // Utility to check if user has access to a model
  const hasAccessToModel = (modelName) => {
    return roleModels.some(model => model.models === modelName);
  };
  return (
    <>
      <style>{`
        @keyframes erp-orbit-drawer-bg-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .erp-orbit-drawer-bg {
          animation: erp-orbit-drawer-bg-fade-in 0.15s ease;
          background: rgba(33, 33, 33, 0.45);
          backdrop-filter: blur(2px);
        }
        .erp-orbit-drawer {
          transition: transform 0.10s cubic-bezier(0.2, 0.8, 0.2, 1), width 0.04s ease;
          box-shadow: none;
          border-right: 1px solid #f1e8d9;
        }
        .erp-orbit-drawer .sidebar-primary-item {
          border-radius: 10px;
          min-height: 40px;
          height: 40px;
          margin: 8px 8px !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          transition: background-color 0.1s ease, color 0.1s ease, margin 0.04s ease, padding 0.08s ease, width 0.04s ease;
        }
        .erp-orbit-drawer .sidebar-primary-label,
        .erp-orbit-drawer .sidebar-submenu,
        .erp-orbit-drawer .sidebar-brand-copy,
        .erp-orbit-drawer .sidebar-build-info {
          transition: opacity 0.04s ease, max-height 0.04s ease;
        }
        .erp-orbit-drawer .sidebar-submenu {
          margin-left: 0 !important;
          padding-left: 39px;
        }
        .erp-orbit-drawer .sidebar-submenu .submenu-link li {
          list-style-position: inside;
          margin-left: 0;
          padding-left: 0;
        }
        #root {
          padding-left: 62px;
        }
        .erp-orbit-drawer.sidebar-collapsed .sidebar-primary-item {
          width: 40px;
          height: 40px;
          min-height: 40px !important;
          margin: 8px auto;
          justify-content: center;
          gap: 0 !important;
          padding: 0 !important;
          border-radius: 9999px;
        }
        .erp-orbit-drawer.sidebar-collapsed .sidebar-primary-item img {
          margin: 0 auto;
          display: block;
        }
        .erp-orbit-drawer.sidebar-collapsed .sidebar-primary-label {
          width: 0 !important;
          min-width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .erp-orbit-drawer.sidebar-collapsed .sidebar-primary-item.text-white {
          background: #BF9853 !important;
          border-radius: 9999px !important;
        }
        .erp-orbit-drawer.sidebar-collapsed .sidebar-primary-label,
        .erp-orbit-drawer.sidebar-collapsed .sidebar-submenu,
        .erp-orbit-drawer.sidebar-collapsed .sidebar-brand-copy,
        .erp-orbit-drawer.sidebar-collapsed .sidebar-build-info {
          opacity: 0;
          max-height: 0;
          overflow: hidden;
          pointer-events: none;
        }
        @media (min-width: 1024px) {
          #root {
            padding-left: 62px;
          }
          .navbar {
            left: 56px !important;
            width: calc(100% - 56px) !important;
          }
          .erp-orbit-drawer.sidebar-collapsed .sidebar-header-row {
            justify-content: center;
            padding-left: 0;
            padding-right: 0;
          }
          .erp-orbit-drawer.sidebar-collapsed .sidebar-primary-item {
            width: 40px;
            height: 40px;
            min-height: 40px !important;
            margin: 8px auto;
            justify-content: center;
            gap: 0 !important;
            padding: 0 !important;
            border-radius: 9999px;
          }
          .erp-orbit-drawer.sidebar-collapsed .sidebar-primary-item img {
            margin: 0 auto;
            display: block;
          }
          .erp-orbit-drawer.sidebar-collapsed .sidebar-primary-label {
            width: 0 !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .erp-orbit-drawer.sidebar-collapsed .sidebar-primary-item.text-white {
            background: #BF9853 !important;
            border-radius: 9999px !important;
          }
          .erp-orbit-drawer.sidebar-collapsed .sidebar-primary-label,
          .erp-orbit-drawer.sidebar-collapsed .sidebar-submenu,
          .erp-orbit-drawer.sidebar-collapsed .sidebar-brand-copy,
          .erp-orbit-drawer.sidebar-collapsed .sidebar-build-info {
            opacity: 0;
            max-height: 0;
            overflow: hidden;
            pointer-events: none;
          }
        }
      `}</style>
      {isVisible && (
        <div
          className="erp-orbit-drawer-bg fixed left-0 right-0 bottom-0 top-[55px] z-[259] lg:hidden"
          onClick={() => onCloseSidebar && onCloseSidebar()}
          role="presentation"
          aria-hidden="true"
        />
      )}
      <aside
        ref={sidebarRef}
        className={`erp-orbit-drawer fixed left-0 bottom-0 top-[65px] z-[260] flex ${isSidebarExpanded ? "w-[280px] sidebar-expanded" : "w-[62px] sidebar-collapsed"} flex-col overflow-hidden bg-[#FFFFFF] translate-x-0`}
      >
        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar scrollbar-none pt-[6px]">
        <Link
          to="/"
          title="Home"
          className={`sidebar-primary-item flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'home' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={(e) => {
            if (!isSidebarExpanded) {
              e.preventDefault();
              handleMenuClick('home');
              return;
            }
            handleMenuClick('home');
            if (onCloseSidebar) onCloseSidebar();
          }}>
          <img src={activeMenu === 'home' ? homeWhite : home}
            alt="home" className="h-[20px] w-[20px]" />
          <p className="sidebar-primary-label text-[12px] leading-[15px] font-medium text-base">Home</p>
        </Link>
        <div title="Billing" className={`sidebar-primary-item flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'billing' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('billing')} >
          <img src={activeMenu === 'billing' ? billingWhite : billing}
            alt="billing" className="h-[20px] w-[20px]" />
          <p className="sidebar-primary-label text-[12px] leading-[15px] font-medium text-base">Billing</p>
        </div>
        {activeMenu === 'billing' && (
          <div className="sidebar-submenu ml-6">
            <Link
              to={hasAccessToModel('Bill Payments Tracker') ? '/tracker/pendingbill' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Bill Payments Tracker' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Bill Payments Tracker')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Bill Payments Tracker');
                if (onCloseSidebar) onCloseSidebar();
              }}
            >
              <p className="text-sm cursor-pointer"><li>Bill Payments Tracker</li></p>
            </Link>
            <Link
              to={hasAccessToModel('Bill Entry Checklist') ? '/entrychecklist' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Bill Entry Checklist' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Bill Entry Checklist')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Bill Entry Checklist');
                if (onCloseSidebar) onCloseSidebar();
              }}
            >
              <p className="text-sm cursor-pointer"><li>Bill Entry Checklist</li></p>
            </Link>
            <Link to={hasAccessToModel('Invoice') ? '/invoice-bill/invoice' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Invoice' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Invoice')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Invoice');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Invoice</li></p>
            </Link>
            <Link to={hasAccessToModel('Quotation') ? '/quotation' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Quotation' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Quotation')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Quotation');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Quotation</li></p>
            </Link>
            <Link to={hasAccessToModel('Change Order') ? '/changeOrder' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Change Order' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Change Order')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Change Order');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Change Order</li></p>
            </Link>
          </div>
        )}
        <div
          title="CRM"
          className={`sidebar-primary-item flex items-center gap-[11px] py-[15px] px-[16px] cursor-pointer ${activeMenu === 'crm' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('crm')}
        >
          <img src={activeMenu === 'crm' ? crmWhite : crm} alt="crm" className="h-[20px] w-[20px]" />
          <p className="sidebar-primary-label text-[12px] leading-[15px] font-medium text-base ">CRM</p>
        </div>
        {activeMenu === 'crm' && (
          <div className="sidebar-submenu ml-6">
            <Link to={hasAccessToModel('Enquiry') ? '/enquiry' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Enquiry' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Enquiry')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Enquiry');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Enquiry</li></p>
            </Link>
            <Link to={hasAccessToModel('Projects') ? '/projects' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Projects' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Projects')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Projects');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Projects</li></p>
            </Link>
          </div>
        )}
        <div title="Account" className={`sidebar-primary-item flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'account' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('account')}
        >
          <img src={activeMenu === 'account' ? accountWhite : account} alt="account" className="h-[20px] w-[20px]" />
          <p className="sidebar-primary-label text-[12px] leading-[15px] font-medium text-base">Account</p>
        </div>
        {activeMenu === 'account' && (
          <div className="sidebar-submenu ml-6">
            <Link
              to={hasAccessToModel('Vendor Payments Tracker') ? '/tracker/pendingbill' : '#'}
              state={{ sidebarMenu: 'account', sidebarSubmenu: 'Vendor Payments Tracker' }}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Vendor Payments Tracker' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Vendor Payments Tracker')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Vendor Payments Tracker');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Vendor Payments Tracker</li></p>
            </Link>
            <Link to={hasAccessToModel('Advance Portal') ? '/portal/advancePortal' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Advance Portal' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Advance Portal')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Advance Portal');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Advance Portal</li></p>
            </Link>
            <Link to={hasAccessToModel('Loan Portal') ? '/loan/loanportal' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Loan Portal' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Loan Portal')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Loan Portal');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Loan Portal</li></p>
            </Link>
            <Link to={hasAccessToModel('Payment Receipt') ? '/paymentReceipt' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Payment Receipt' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Payment Receipt')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Payment Receipt');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Payment Receipt</li></p>
            </Link>
            <Link to={hasAccessToModel('Rent Management') ? '/rent/Form' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Rent Management' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Rent Management')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Rent Management');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Rent Management</li></p>
            </Link>
            <Link to={hasAccessToModel('Claim Payments') ? '/Claim/claimpaymentsummary' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Claim Payments' ? 'text-red-500' : ''
                }`} onClick={(e) => {
                  if (!hasAccessToModel('Claim Payments')) {
                    e.preventDefault();
                    alert("No permissions for this page");
                    return;
                  }
                  handleSubmenuItemClick('Claim Payments');
                  if (onCloseSidebar) onCloseSidebar();
                }}>
              <p className="text-sm cursor-pointer"><li>Claim Payments</li></p>
            </Link>
            <Link to={hasAccessToModel('Weekly Payment Register') ? '/weekly-payment/WeeklyPayment' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Weekly Payment Register' ? 'text-red-500' : ''
                }`}
              onClick={(e) => {
                if (!hasAccessToModel('Weekly Payment Register')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Weekly Payment Register');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Cash Register</li></p>
            </Link>
            <Link to={hasAccessToModel('Bank Register') ? '/bank-register' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Bank Register' ? 'text-red-500' : ''
                }`}
              onClick={(e) => {
                if (!hasAccessToModel('Bank Register')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Bank Register');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Bank Register</li></p>
            </Link>
            <Link
              to={hasAccessToModel('Expense Entry') ? '/expense-entry' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Expense Entry' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Expense Entry')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Expense Entry');
                if (onCloseSidebar) onCloseSidebar();
              }}
            >
              <p className="text-sm cursor-pointer"><li>Expense Entry</li></p>
            </Link>
            <Link to={hasAccessToModel('Expense Dashboard') ? '/expense-dashboard' : '#'} className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Expense Dashboard' ? 'text-red-500' : ''
              }`}
              onClick={(e) => {
                if (!hasAccessToModel('Expense Dashboard')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Expense Dashboard');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Expense Dashboard</li></p>
            </Link>
            <Link
              to={hasAccessToModel('Bank Reconciliation') ? '/bankreconciliation' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Bank Reconciliation' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Bank Reconciliation')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Bank Reconciliation');
                if (onCloseSidebar) onCloseSidebar();
              }}
            >
              <p className="text-sm cursor-pointer"><li>Bank Reconciliation</li></p>
            </Link>
            <Link
              to={hasAccessToModel('Bank Register') ? '/orbit-erp/bill-payment' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Orbit ERP' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Bank Register')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Orbit ERP');
                if (onCloseSidebar) onCloseSidebar();
              }}
            >
              <p className="text-sm cursor-pointer"><li>Testing</li></p>
            </Link>
          </div>
        )}
        <div
          title="Procurement"
          className={`sidebar-primary-item flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'procurement' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('procurement')}
        >
          <img src={activeMenu === 'procurement' ? procurementWhite : procurement} alt="procurement" className="h-[20px] w-[20px]" />
          <p className="sidebar-primary-label text-[12px] leading-[15px] font-medium text-base">Procurement</p>
        </div>
        {activeMenu === 'procurement' && (
          <div className="sidebar-submenu ml-6">
            <Link to={hasAccessToModel('Purchase Order') ? '/purchaseorder' : '#'} className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Purchase Order' ? 'text-red-500' : ''
              }`}
              onClick={(e) => {
                if (!hasAccessToModel('Purchase Order')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Purchase Order');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Purchase Order</li></p>
            </Link>
            <Link to={hasAccessToModel('Inventory') ? '/inventory' : '#'} className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Inventory' ? 'text-red-500' : ''
              }`} onClick={(e) => {
                if (!hasAccessToModel('Inventory')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Inventory');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Inventory</li></p>
            </Link>
            <Link to={hasAccessToModel('Tools Tracker') ? '/toolsTracker' : '#'} className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Tools Tracker' ? 'text-red-500' : ''
              }`} onClick={(e) => {
                if (!hasAccessToModel('Tools Tracker')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Tools Tracker');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Tools Tracker</li></p>
            </Link>
          </div>
        )}
        <div
          title="Design Tools"
          className={`sidebar-primary-item flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'designtools' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('designtools')}
        >
          <img src={activeMenu === 'designtools' ? designtoolsWhite : designtools} alt="designtools" className="h-[20px] w-[20px]" />
          <p className="sidebar-primary-label text-[12px] leading-[15px] font-medium text-base">Design Tools</p>
        </div>
        {activeMenu === 'designtools' && (
          <div className="sidebar-submenu ml-6">
            <Link to={hasAccessToModel('Tile Calculator') ? '/designtool/tileCalculate' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Tile Calculator' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Tile Calculator')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Tile Calculator');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Tile Calculator</li></p>
            </Link>
            <Link to={hasAccessToModel('Paint Calculator') ? '/paints/paintCalculation' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Paint Calculator' ? 'text-red-500' : ''
                }`} onClick={(e) => {
                  if (!hasAccessToModel('Paint Calculator')) {
                    e.preventDefault();
                    alert("No permissions for this page");
                    return;
                  }
                  handleSubmenuItemClick('Paint Calculator');
                  if (onCloseSidebar) onCloseSidebar();
                }}>
              <p className="text-sm cursor-pointer"><li>Paint Calculator</li></p>
            </Link>
            <Link to={hasAccessToModel('Bath Fixtures Matrix') ? '/bath/BathFixtures Matrix' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Bath Fixtures Matrix' ? 'text-red-500' : ''
                }`} onClick={(e) => {
                  if (!hasAccessToModel('Bath Fixtures Matrix')) {
                    e.preventDefault();
                    alert("No permissions for this page");
                    return;
                  }
                  handleSubmenuItemClick('Bath Fixtures Matrix');
                  if (onCloseSidebar) onCloseSidebar();
                }}>
              <p className="text-sm cursor-pointer"><li>Bath Fixtures Matrix</li></p>
            </Link>
            <Link to={hasAccessToModel('RCC Calculation') ? 'rccal/RCCCalculation' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'RCC Calculation' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('RCC Calculation')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('RCC Calculation');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className=" text-sm cursor-pointer"><li>RCC Calculation</li></p>
            </Link>
            <Link to={hasAccessToModel('Switch Matrix') ? '/switch/SwitchMatrix' : '#'} className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Switch Matrix' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Switch Matrix')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Switch Matrix');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className=" text-sm cursor-pointer"><li>Switch Matrix</li></p>
            </Link>
            <Link to={hasAccessToModel('Masonary Calculator') ? '/masonary/masonarycalculater' : '#'} className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Masonary Calculator' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Masonary Calculator')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Masonary Calculator');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className=" text-sm cursor-pointer"><li>Masonary Calculator</li></p>
            </Link>
            <Link to={hasAccessToModel('Carpentry Calculator') ? '/carpentry/carpentrycalculator' : '#'} className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Carpentry Calculator' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Carpentry Calculator')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Carpentry Calculator');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className=" text-sm cursor-pointer"><li>Carpentry Calculator</li></p>
            </Link>
          </div>
        )}
        <div title="HRM" className={`sidebar-primary-item flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'hr' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('hr')}
        >
          <img src={activeMenu === 'hr' ? hrWhite : hr} alt="hr" className="h-[20px] w-[20px]" />
          <p className="sidebar-primary-label text-[12px] leading-[15px] font-medium text-base">HRM</p>
        </div>
        {activeMenu === 'hr' && (
          <div className="sidebar-submenu ml-6">
            <Link to={hasAccessToModel('Onboarding') ? 'billView' : '#'} className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'onboarding' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Onboarding')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('onboarding');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Onboarding</li></p>
            </Link>
            <Link to={hasAccessToModel('Attendance') ? '/attendance' : '#'} className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Attendance' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Attendance')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Attendance');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Attendance</li></p>
            </Link>
            <Link to={hasAccessToModel('Staff Advance') ? '/staffadvance/staffAdvance' : '#'} className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Staff Advance' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Staff Advance')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Staff Advance');
                if (onCloseSidebar) onCloseSidebar();
              }}
            >
              <p className="text-sm cursor-pointer"><li>Staff Advance</li></p>
            </Link>
            <Link to={hasAccessToModel('Manage User') ? 'user_manage' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Manage User' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Manage User')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Manage User');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Manage User</li></p>
            </Link>
          </div>
        )}
        <div title="Utility Hub" className={`sidebar-primary-item flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'utility' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('utility')}
        >
          <img src={activeMenu === 'utility' ? sideUtilityHub : sidesetting} alt="utility" className="h-[20px] w-[20px]" />
          <p className="sidebar-primary-label text-[12px] leading-[15px] font-medium text-base">Utility Hub</p>
        </div>
        {activeMenu === 'utility' && (
          <div className="sidebar-submenu ml-6">
            <Link
              to={hasAccessToModel('Dashboard') ? 'utility/dashboard' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Dashboard' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Dashboard')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Dashboard');
                if (onCloseSidebar) onCloseSidebar();
              }}
            >
              <p className="text-sm cursor-pointer"><li>Dashboard</li></p>
            </Link>
            <Link
              to={hasAccessToModel('Directory') ? '/directory' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Directory' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Directory')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Directory');
                if (onCloseSidebar) onCloseSidebar();
              }}
            >
              <p className="text-sm cursor-pointer"><li>Directory</li></p>
            </Link>
          </div>
        )}
        <div title="Master Data" className={`sidebar-primary-item flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'masterdata' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('masterdata')}
        >
          <img src={activeMenu === 'masterdata' ? sideMasterData : sidesaving} alt="masterdata" className="h-[20px] w-[20px]" />
          <p className="sidebar-primary-label text-[12px] leading-[15px] font-medium text-base">Master Data</p>
        </div>
        {activeMenu === 'masterdata' && (
          <div className="sidebar-submenu ml-6">
            <Link
              to={hasAccessToModel('Master Data') ? '/master-data' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Master Data' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Master Data')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Master Data');
                if (onCloseSidebar) onCloseSidebar();
              }}
            >
              <p className="text-sm cursor-pointer"><li>Master Data</li></p>
            </Link>
          </div>
        )}
        <div className="sidebar-build-info mt-[6rem] ml-4 w-44">
          <p style={{ fontSize: '16px', marginTop: '1rem' }}>
            <span className="font-semibold">Last Updated:</span>{' '}
            <span className="font-light">{buildTime || 'Not available'}</span>
          </p>
        </div>
      </nav>
    </aside>
    </>
  );
}
export default Sidebar;