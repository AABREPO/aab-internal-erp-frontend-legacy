import React, { useState } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar } from '../MainHeadingpage/MainHeadingpage';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import WeeklyPayment from './WeeklyPayment';
import History from './WeeklyPaymentHistory';
const WHeading = () => {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);
    const handleLinkClick = (path) => {
        setActiveLink(path);
    }
    return (
        <ModuleHeadingWrapper>
        <ModuleHeadingBar>
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
                    className={`link ${activeLink === '/weekly-payment/History' ? 'active' : ''}`}
                    to="/weekly-payment/History"
                    onClick={() => handleLinkClick('/weekly-payment/History')}
                > 
                History
                </Link>
            </h2>
        </ModuleHeadingBar>
        <Routes>
            <Route path="weeklypayment" element={<WeeklyPayment/>} />
            <Route path='history' element={<History/>}/>
        </Routes>
    </ModuleHeadingWrapper>
    )
}

export default WHeading
