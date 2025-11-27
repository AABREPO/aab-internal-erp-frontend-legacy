import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import home from '../Images/dashboard.svg';
import homeWhite from '../Images/dashboard1.svg';
import billing from '../Images/Billing.svg';
import billingWhite from '../Images/Billing1.svg';
import crm from '../Images/CRM.svg';
import crmWhite from '../Images/CRM1.svg';
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
  const location = useLocation();
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

  // Effect to set active menu and submenu based on current route
  useEffect(() => {
    const currentPath = location.pathname;

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

      // Procurement routes
      '/purchaseorder': { menu: 'procurement', submenu: 'Purchase Order' },
      '/inventory': { menu: 'procurement', submenu: 'Inventory' },
      '/toolsTracker': { menu: 'procurement', submenu: 'Tools Tracker' },
      '/testpurchaseorder': { menu: 'procurement', submenu: 'Test PurchaseOrder' },

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
  const handleMenuClick = (menu) => {
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
    <aside ref={sidebarRef}
      className={`fixed  h-screen w-[250px] bg-[#FFFFFF] mt-14 z-20 overflow-y-auto transition-transform duration-1000 ease-in-out transform ${isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}>
      <nav className="h-full flex flex-col">
        <Link
          to="/"
          className={`flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'home' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => {
            handleMenuClick('home');
            if (onCloseSidebar) onCloseSidebar();
          }}>
          <img src={activeMenu === 'home' ? homeWhite : home}
            alt="home" className="h-4 w-4" />
          <p className="text-[12px] leading-[15px] font-medium text-base">Home</p>
        </Link>
        <div className={`flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'billing' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('billing')} >
          <img src={activeMenu === 'billing' ? billingWhite : billing}
            alt="billing" className="h-4 w-4" />
          <p className="text-[12px] leading-[15px] font-medium text-base">Billing</p>
        </div>
        {activeMenu === 'billing' && (
          <div className="ml-6">
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
          className={`flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'crm' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('crm')}
        >
          <img src={activeMenu === 'crm' ? crmWhite : crm} alt="crm" className="h-4 w-4" />
          <p className="text-[12px] leading-[15px] font-medium text-base ">CRM</p>
        </div>
        {activeMenu === 'crm' && (
          <div className="ml-6">
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
        <div className={`flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'account' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('account')}
        >
          <img src={activeMenu === 'account' ? accountWhite : account} alt="account" className="h-4 w-4" />
          <p className="text-[12px] leading-[15px] font-medium text-base">Account</p>
        </div>
        {activeMenu === 'account' && (
          <div className="ml-6">
            <Link to={hasAccessToModel('Vendor Payments Tracker') ? '/vendorPaymentsTracker' : '#'}
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
            <Link to={hasAccessToModel('Advance Portal') ? 'portal/advancePortal' : '#'}
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
            <Link to={hasAccessToModel('Loan Portal') ? 'loan/loanportal' : '#'}
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
              to="/bankreconciliation"
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Bank Reconciliation' ? 'text-red-500' : ''}`}
              onClick={() => {
                handleSubmenuItemClick('Bank Reconciliation');
                if (onCloseSidebar) onCloseSidebar();
              }}
            >
              <p className="text-sm cursor-pointer"><li>Bank Reconciliation</li></p>
            </Link>
          </div>
        )}
        <div
          className={`flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'procurement' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('procurement')}
        >
          <img src={activeMenu === 'procurement' ? procurementWhite : procurement} alt="procurement" className="h-4 w-4" />
          <p className="text-[12px] leading-[15px] font-medium text-base">Procurement</p>
        </div>
        {activeMenu === 'procurement' && (
          <div className="ml-6">
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
            <Link to="/testtoolsTracker" className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Test Tools Tracker' ? 'text-red-500' : ''
              }`} onClick={() => handleSubmenuItemClick('Test Tools Tracker')}>
              <p className="text-sm cursor-pointer"><li>Test Tools Tracker</li></p>
            </Link>
            <Link to="/testpurchaseorder" className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Test PurchaseOrder' ? 'text-red-500' : ''
              }`} onClick={() => handleSubmenuItemClick('Test PurchaseOrder')}>
              <p className="text-sm cursor-pointer"><li>Test PurchaseOrder</li></p>
            </Link>
          </div>
        )}
        <div
          className={`flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'designtools' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('designtools')}
        >
          <img src={activeMenu === 'designtools' ? designtoolsWhite : designtools} alt="designtools" className="h-4 w-4" />
          <p className="text-[12px] leading-[15px] font-medium text-base">Design Tools</p>
        </div>
        {activeMenu === 'designtools' && (
          <div className="ml-6">
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
        <div className={`flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'hr' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('hr')}
        >
          <img src={activeMenu === 'hr' ? hrWhite : hr} alt="hr" className="h-4 w-4" />
          <p className="text-[12px] leading-[15px] font-medium text-base">HRM</p>
        </div>
        {activeMenu === 'hr' && (
          <div className="ml-6">
            <Link to="billView" className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'onboarding' ? 'text-red-500' : ''}`}
              onClick={() => {
                handleSubmenuItemClick('onboarding');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Onboarding</li></p>
            </Link>
            <Link to="/attendance" className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Attendance' ? 'text-red-500' : ''}`}
              onClick={() => {
                handleSubmenuItemClick('Attendance');
                if (onCloseSidebar) onCloseSidebar();
              }}>
              <p className="text-sm cursor-pointer"><li>Attendance</li></p>
            </Link>
            <Link to="/staffadvance/staffAdvance" className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Staff Advance' ? 'text-red-500' : ''}`}
              onClick={() => { handleSubmenuItemClick('Staff Advance'); if (onCloseSidebar) onCloseSidebar(); }}
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
        <div className={`flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'utility' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('utility')}
        >
          <img src={activeMenu === 'utility' ? sideUtilityHub : sidesetting} alt="utility" className="h-4 w-4" />
          <p className="text-[12px] leading-[15px] font-medium text-base">Utility Hub</p>
        </div>
        {activeMenu === 'utility' && (
          <div className="ml-6">
            <Link
              to="utility/dashboard"
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Dashboard' ? 'text-red-500' : ''}`}
              onClick={() => {
                handleSubmenuItemClick('Dashboard');
                if (onCloseSidebar) onCloseSidebar();
              }}
            >
              <p className="text-sm cursor-pointer"><li>Dashboard</li></p>
            </Link>
            <Link
              to="/directory"
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Directory' ? 'text-red-500' : ''}`}
              onClick={() => {
                handleSubmenuItemClick('Directory');
                if (onCloseSidebar) onCloseSidebar();
              }}
            >
              <p className="text-sm cursor-pointer"><li>Directory</li></p>
            </Link>
          </div>
        )}
        <div className={`flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'masterdata' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('masterdata')}
        >
          <img src={activeMenu === 'masterdata' ? sideMasterData : sidesaving} alt="masterdata" className="h-4 w-4" />
          <p className="text-[12px] leading-[15px] font-medium text-base">Master Data</p>
        </div>
        {activeMenu === 'masterdata' && (
          <div className="ml-6">
            <Link
              to="/master-data"
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Master Data' ? 'text-red-500' : ''}`}
              onClick={() => {
                handleSubmenuItemClick('Master Data');
                if (onCloseSidebar) onCloseSidebar();
              }}
            >
              <p className="text-sm cursor-pointer"><li>Master Data</li></p>
            </Link>
          </div>
        )}
        <div className="mt-[6rem] ml-4 w-44">
          <p style={{ fontSize: '16px', marginTop: '1rem' }}>
            <span className="font-semibold">Last Updated:</span>{' '}
            <span className="font-light">{buildTime || 'Not available'}</span>
          </p>
        </div>
      </nav>
    </aside>
  );
}
export default Sidebar;