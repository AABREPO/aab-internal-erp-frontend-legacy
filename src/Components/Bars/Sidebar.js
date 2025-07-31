import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
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
function Sidebar({ isVisible, sidebarRef, userRoles = [] }) {
  const [activeMenu, setActiveMenu] = useState('');
  const [activeSubmenuItem, setActiveSubmenuItem] = useState('');
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
        <div
          className={`flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'home' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('home')}>
          <img src={activeMenu === 'home' ? homeWhite : home}
            alt="home" className="h-4 w-4" />
          <p className="text-[12px] leading-[15px] font-medium text-base bg-brown-500 w-[190px] -ml-[33%]">Home</p>
        </div>
        <div className={`flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'billing' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('billing')} >
          <img src={activeMenu === 'billing' ? billingWhite : billing}
            alt="billing" className="h-4 w-4" />
          <p className="text-[12px] leading-[15px] font-medium text-base bg-brown-500 w-[190px] -ml-[33%]">Billing</p>
        </div>
        {activeMenu === 'billing' && (
          <div className="ml-6">
            <Link
              to={hasAccessToModel('Bill Payments Tracker') ? 'database_retrieves' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Bill Payments Tracker' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Bill Payments Tracker')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Bill Payments Tracker');
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
              }}>
              <p className="text-sm cursor-pointer"><li>Projects</li></p>
            </Link>
          </div>
        )}
        <div
          className={`flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'account' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
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
              }}>
              <p className="text-sm cursor-pointer"><li>Vendor Payments Tracker</li></p>
            </Link>
            <Link to={hasAccessToModel('Advance Portal') ? '/advancePortal' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Advance Portal' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if (!hasAccessToModel('Advance Portal')) {
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Advance Portal');
              }}>
              <p className="text-sm cursor-pointer"><li>Advance Portal</li></p>
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
              }}>
              <p className="text-sm cursor-pointer"><li>Rent Management</li></p>
            </Link>
            <Link to={hasAccessToModel('Claim Payments') ? '/claimPayments' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Claim Payments' ? 'text-red-500' : ''
                }`} onClick={(e) => {
                  if (!hasAccessToModel('Claim Payments')) {
                    e.preventDefault();
                    alert("No permissions for this page");
                    return;
                  }
                  handleSubmenuItemClick('Claim Payments');
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
              }}>
              <p className="text-sm cursor-pointer"><li>Weekly Payment Register</li></p>
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
              }}>
              <p className="text-sm cursor-pointer"><li>Expense Dashboard</li></p>
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
              }}>
              <p className="text-sm cursor-pointer"><li>Tools Tracker</li></p>
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
              }}>
              <p className=" text-sm cursor-pointer"><li>Carpentry Calculator</li></p>
            </Link>
          </div>
        )}
        <div
          className={`flex items-center gap-[11px] py-[15px] px-3 cursor-pointer ${activeMenu === 'hr' ? 'bg-[#BF9853] text-white' : 'text-black'}`}
          onClick={() => handleMenuClick('hr')}
        >
          <img src={activeMenu === 'hr' ? hrWhite : hr} alt="hr" className="h-4 w-4" />
          <p className="text-[12px] leading-[15px] font-medium text-base">HRM</p>
        </div>
        {activeMenu === 'hr' && (
          <div className="ml-6">
            <Link to="billView" className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'onboarding' ? 'text-red-500' : ''}`} 
              onClick={() => handleSubmenuItemClick('onboarding')}>
              <p className="text-sm cursor-pointer"><li>Onboarding</li></p>
            </Link>
            <Link to="/attendance" className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Attendance' ? 'text-red-500' : ''}`} 
              onClick={() => handleSubmenuItemClick('Attendance')}>
              <p className="text-sm cursor-pointer"><li>Attendance</li></p>
            </Link>
            <Link to="billview" className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Staff Advance' ? 'text-red-500' : ''}`} 
              onClick={() => handleSubmenuItemClick('Staff Advance')}>
              <p className="text-sm cursor-pointer"><li>Staff Advance</li></p>
            </Link>
            <Link to={hasAccessToModel('Manage User') ? 'user_manage' : '#'}
              className={`submenu-link flex items-center gap-[1px] p-2 ${activeSubmenuItem === 'Manage User' ? 'text-red-500' : ''}`}
              onClick={(e) => {
                if(!hasAccessToModel('Manage User')){
                  e.preventDefault();
                  alert("No permissions for this page");
                  return;
                }
                handleSubmenuItemClick('Manage User');
              }}>
              <p className="text-sm cursor-pointer"><li>Manage User</li></p>
            </Link>
          </div>
        )}
        <div className="mt-[20rem] ml-4 w-44">
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