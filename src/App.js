import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Components/Bars/Sidebar';
import Navbar from './Components/Bars/Navbar';
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
import QuotationHeading from './Components/Quotation/QuotationHeading';
import DirectoryHeading from './Components/Directory/DirectoryHeading';
import ToolsTrackerHeading from './Components/ToolsTracker/ToolsTrackerHeading';
import TestToolsTrackerHeading from './Components/TestToolsTracker/TestToolsTrackerHeading';

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

  const isMobileRoute = location.pathname.startsWith('/purchaseorder') || location.pathname.startsWith('/inventory');
  const shouldHideDesktopBars = isMobile && isMobileRoute;

  return (

    <div>
      {!shouldHideDesktopBars && (
        <>
          <Navbar username={user.username} userImage={user.userImage} position={user.position} email={user.email} userRoles={user?.userRoles || []} onLogout={handleLogout} />
          <Sidebar userRoles={user?.userRoles || []} />
        </>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/expense-entry/*" element={<Heading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/designtool/*" element={<DHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/invoice-bill/*" element={<InHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/paints/*" element={<PHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/rccal/*" element={<RcHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/bath/*" element={<BHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/switch/*" element={<SHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/weekly-payment/*" element={<WeeklyPaymentHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/rent/*" element={<RHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/masonary/*" element={<MHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/carpentry/*" element={<CHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/entrychecklist/*" element={<BillHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path='/purchaseorder/*' element={<PurchaseHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path='/inventory/*' element={<InventoryHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path='/testpurchaseorder' element={<TestPurchaseOrder />} />
        <Route path='/user_manage/*' element={<ManageHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path='/attendance' element={<Attendancelog username={user.username} />} />
        <Route path='/portal/*' element={<AdvanceHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path='/Claim/*' element={<ClaimPaymentHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path='/staffadvance/*' element={<StaffHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path='/loan/*' element={<LoanPoratlHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path='/tracker/*' element={<BillPaymentsTrackerHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path='/master-data' element={<MasterData username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/bankreconciliation" element={<BankReconciliation username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/utility/*" element={<UtilityHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/bank-register" element={<BankRegisterHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/quotation/*" element={<QuotationHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/directory/*" element={<DirectoryHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/toolsTracker/*" element={<ToolsTrackerHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="/testtoolsTracker/*" element={<TestToolsTrackerHeading username={user.username} userRoles={user?.userRoles || []} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(userData));
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
