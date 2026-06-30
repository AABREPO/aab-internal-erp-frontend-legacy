import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Navbar from './Components/Bars/Navbar';
import { SidebarProvider } from './context/SidebarContext';
import Home from './Components/Home/HomePage';
import Heading from './Components/Heading';
import DHeading from './Components/TileCalculation/DHeading';
import InHeading from './Components/Invoice/InHeading';
import PHeading from './Components/PaintCalculation/PHeading';
import RcHeading from './Components/RccCalculation/RcHeading';
import BHeading from './Components/Bathfixing/BHeading';
import SHeading from './Components/SwitchMatrix/SHeading';
import WeeklyPaymentHeading from './Components/Cash Register/WeeklyPaymentHeading';
import RHeading from './Components/RentManagement/RHeading';
import MHeading from './Components/MasonaryCalculater/MHeading';
import CHeading from './Components/CarpentryCalculation/CHeading';
import LoginPage from './LoginPages/Login';
import BillHeading from './Components/BillChecklist/BillHeading';
import PurchaseHeading from './Components/Purchase/PurchaseHeading';
import TestPurchaseOrder from './Components/Purchase/TestPurchaseOrder';
import ManageHeading from './Components/ManageUsers/ManageHeading';
import Attendancelog from './Components/Attendances/Attendancelog';
import InventoryHeading from './Components/Inventory/InventoryHeading';
import AdvanceHeading from './Components/Advance Portal/AdvanceHeading';
import ClaimPaymentHeading from './Components/ClaimPayments/ClaimPaymentHeading';
import StaffHeading from './Components/StaffAdvance/StaffHeading';
import LoanPoratlHeading from './Components/LoanPortal/LoanPoratlHeading';
import BillPaymentsTrackerHeading from './Components/BillPaymentsTracker/BillPaymentsTrackerHeading';
import MasterData from './Components/MasterData/MasterData';
import BankReconciliation from './Components/Bank Reconciliation/BankReconciliation .js';
import UtilityHeading from './Components/UtilityHub/UtilityHeading';
import BankRegisterHeading from './Components/Bank Register/BankRegisterHeading';
import OrbitBillPaymentShell from './Components/OrbitERP/OrbitBillPaymentShell';
import OrbitAppChrome from './Components/OrbitERP/OrbitAppChrome';
import QuotationHeading from './Components/Quotation/QuotationHeading';
import DirectoryHeading from './Components/Directory/DirectoryHeading';
import ToolsTrackerHeading from './Components/ToolsTracker/ToolsTrackerHeading';
import TestToolsTrackerHeading from './Components/TestToolsTracker/TestToolsTrackerHeading';
import MobileRFQLogin from './componentsMobile/RequestForQuotation/LoginPage';
import MobileRFQ from './componentsMobile/RequestForQuotation/RequestForQuotation';
import GoodsRecievedNotesCreate from './componentsMobile/Goods Recieved Notes/Create';
import GoodsRecievedNotesVerify from './componentsMobile/Goods Recieved Notes/Verify';
import MobileMasterData from './componentsMobile/MasterData/MasterData';

function MainContentWithSidebarMargin({ children }) {
  /** Sidebar is fixed + translated (see Sidebar.js); do not shift layout — matches Orbit ERP drawer over content. */
  return <div className="min-h-screen">{children}</div>;
}

function AppContent({ user, handleLogout }) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(() => {
    return window.innerWidth <= 768;
  })
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobileRoute =
    location.pathname.startsWith('/purchaseorder') ||
    location.pathname.startsWith('/inventory') ||
    location.pathname.startsWith('/toolsTracker') ||
    location.pathname.startsWith('/tracker') ||
    location.pathname.startsWith('/portal') ||
    location.pathname.startsWith('/loan') ||
    location.pathname.startsWith('/staffadvance') ||
    location.pathname.startsWith('/rfq') ||
    location.pathname.startsWith('/grn') ||
    location.pathname.startsWith('/master-data');
  const shouldHideDesktopBars = isMobile && isMobileRoute;

  const wrapOrbitChrome = (node) =>
    shouldHideDesktopBars ? node : (
      <OrbitAppChrome
        username={user.username}
        onLogout={handleLogout}
        branchId={user?.branchId ?? user?.branch_id ?? user?.brachId ?? ''}
        brachId={user?.brachId ?? ''}
      >
        {node}
      </OrbitAppChrome>
    );

  return (
    <SidebarProvider>
      <div>
        {!shouldHideDesktopBars && (
          <Navbar
            username={user.username}
            userImage={user.userImage}
            position={user.position}
            email={user.email}
            userRoles={user?.userRoles || []}
            branchId={user?.branchId ?? user?.branch_id ?? user?.brachId ?? ''}
            onLogout={handleLogout}
          />
        )}
        <MainContentWithSidebarMargin>
          <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/expense-entry/*" element={wrapOrbitChrome(<Heading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/designtool/*" element={wrapOrbitChrome(<DHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/invoice-bill/*" element={wrapOrbitChrome(<InHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/paints/*" element={wrapOrbitChrome(<PHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/rccal/*" element={wrapOrbitChrome(<RcHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/bath/*" element={wrapOrbitChrome(<BHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/switch/*" element={wrapOrbitChrome(<SHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/weekly-payment/*" element={wrapOrbitChrome(<WeeklyPaymentHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/rent/*" element={wrapOrbitChrome(<RHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/masonary/*" element={wrapOrbitChrome(<MHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/carpentry/*" element={wrapOrbitChrome(<CHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/entrychecklist/*" element={wrapOrbitChrome(<BillHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path='/purchaseorder/*' element={wrapOrbitChrome(<PurchaseHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route
          path="/rfq-login"
          element={
            <MobileRFQLogin
              onLogin={(userData) => {
                // Reuse main login handling, but redirect to RFQ mobile route
                const normalizedUser = {
                  ...userData,
                  branchId: userData?.branchId ?? userData?.branch_id ?? userData?.brachId ?? ''
                };
                localStorage.setItem('user', JSON.stringify(normalizedUser));
                window.location.href = '/rfq';
              }}
              redirectPath="/rfq"
            />
          }
        />
        <Route
          path="/rfq"
          element={
            <MobileRFQ
              user={user}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/grn/create"
          element={
            <GoodsRecievedNotesCreate
              user={user}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/grn/verify"
          element={
            <GoodsRecievedNotesVerify
              user={user}
              onLogout={handleLogout}
            />
          }
        />
        <Route path='/inventory/*' element={wrapOrbitChrome(<InventoryHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path='/testpurchaseorder' element={wrapOrbitChrome(<TestPurchaseOrder />)} />
        <Route path='/user_manage/*' element={wrapOrbitChrome(<ManageHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path='/attendance' element={wrapOrbitChrome(<Attendancelog username={user.username} />)} />
        <Route path='/portal/*' element={wrapOrbitChrome(<AdvanceHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path='/Claim/*' element={wrapOrbitChrome(<ClaimPaymentHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path='/staffadvance/*' element={wrapOrbitChrome(<StaffHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path='/loan/*' element={wrapOrbitChrome(<LoanPoratlHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path='/tracker/*' element={wrapOrbitChrome(<BillPaymentsTrackerHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route
          path='/master-data'
          element={
            isMobile ? (
              <MobileMasterData user={user} onLogout={handleLogout} />
            ) : (
              wrapOrbitChrome(<MasterData username={user.username} userRoles={user?.userRoles || []} />)
            )
          }
        />
        <Route path="/bankreconciliation" element={wrapOrbitChrome(<BankReconciliation username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/orbit-erp/bill-payment" element={wrapOrbitChrome(<OrbitBillPaymentShell username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/utility/*" element={wrapOrbitChrome(<UtilityHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/bank-register" element={wrapOrbitChrome(<BankRegisterHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/quotation/*" element={wrapOrbitChrome(<QuotationHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/directory/*" element={wrapOrbitChrome(<DirectoryHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/toolsTracker/*" element={wrapOrbitChrome(<ToolsTrackerHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="/testtoolsTracker/*" element={wrapOrbitChrome(<TestToolsTrackerHeading username={user.username} userRoles={user?.userRoles || []} />)} />
        <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MainContentWithSidebarMargin>
      </div>
    </SidebarProvider>
  );
}
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const normalizedUser = {
        ...parsedUser,
        branchId: parsedUser?.branchId ?? parsedUser?.branch_id ?? parsedUser?.brachId ?? ''
      };
      setUser(normalizedUser);
      setIsLoggedIn(true);
    }
  }, []);
  const handleLogin = (userData) => {
    const normalizedUser = {
      ...userData,
      branchId: userData?.branchId ?? userData?.branch_id ?? userData?.brachId ?? ''
    };
    setUser(normalizedUser);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
  }
  return (
    <Router>
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <AppContent user={user} handleLogout={handleLogout} />
      )}
    </Router>
  );
}
export default App;
