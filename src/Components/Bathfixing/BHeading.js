import React, { useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import BathFixtur from './BathFixtur';
import BathFixingInputData from './BathFixingInputData';
import BathFixtureHistory from './BathHistory';
const BHeading = () => {
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
                    className={`link ${activeLink === '/bath/BathFixtures Matrix' ? 'active' : ''}`}
                    to="/bath/BathFixtures Matrix"
                    onClick={() => handleLinkClick('/bath/BathFixtures Matrix')}
                >
                    Bath Fixtures Matrix
                </Link>
            </h2>
            <h2>
                <Link
                    className={`link ${activeLink === '/bath/BathFixtureHistory' ? 'active' : ''}`}
                    to="/bath/BathFixtureHistory"
                    onClick={() => handleLinkClick('/bath/BathFixtureHistory')}
                > 
                History
                </Link>
            </h2>
            <h2>
                <Link
                    className={`link ${activeLink === '/bath/Addinput' ? 'active' : ''}`}
                    to="/bath/Addinput"
                    onClick={() => handleLinkClick('/bath/Addinput')}
                >
                    Add Input
                </Link>
            </h2>
        </div>
        <Routes>
            <Route path="BathFixtures Matrix" element={<BathFixtur/>} />
            <Route path='BathFixtureHistory' element={<BathFixtureHistory/>}/>
            <Route path='Addinput' element={<BathFixingInputData/>}/>
        </Routes>
    </div>
    )
}

export default BHeading
