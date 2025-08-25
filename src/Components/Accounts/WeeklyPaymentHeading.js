import React, { useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import WeeklyPayment from './WeeklyPayment';
import History from './WeeklyPaymentHistory';
import HandoverPaymentsPage from './WeeklyPaymentHandover';
import DailyPayment from './DailyPayment';
const WHeading = ({ username, userRoles = [] }) => {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);
    const handleLinkClick = (path) => {
        setActiveLink(path);
    }
    return (
        <div className="bg-[#FAF6ED]">
        <div className="topbar-title">
            <h2 className="mb-2">
                <Link
                    className={`link ${activeLink === '/weekly-payment/WeeklyPayment' ? 'active' : ''}`}
                    to="/weekly-payment/WeeklyPayment"
                    onClick={() => handleLinkClick('/weekly-payment/WeeklyPayment')}
                >
                    Weekly Payment
                </Link>
            </h2>
            <h2>
                <Link
                    className={`link ${activeLink === '/weekly-payment/dailypayment' ? 'active' : ''}`}
                    to="/weekly-payment/dailypayment"
                    onClick={() => handleLinkClick('/weekly-payment/dailypayment')}
                > 
                Daily Payment
                </Link>
            </h2>
            <h2>
                <Link
                    className={`link ${activeLink === '/weekly-payment/History' ? 'active' : ''}`}
                    to="/weekly-payment/History"
                    onClick={() => handleLinkClick('/weekly-payment/History')}
                > 
                History
                </Link>
            </h2>
            <h2>
                <Link
                    className={`link ${activeLink === '/weekly-payment/Handover' ? 'active' : ''}`}
                    to="/weekly-payment/Handover"
                    onClick={() => handleLinkClick('/weekly-payment/Handover')}
                > 
                Handover
                </Link>
            </h2>
        </div>
        <Routes>
            <Route path="weeklypayment" element={<WeeklyPayment  username={username} userRoles={userRoles}/>} />
            <Route path='history' element={<History  username={username} userRoles={userRoles}/>}/>
            <Route path='handover' element={<HandoverPaymentsPage username={username} userRoles={userRoles}/>} />
            <Route path='dailypayment' element={<DailyPayment username={username} userRoles={userRoles}/>} />
        </Routes>
    </div>
    )
}

export default WHeading
