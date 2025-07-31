import React, { useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import SwitchMatrix from './SwitchMatrix';


const SHeading = () => {
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
                    className={`link ${activeLink === '/switch/SwitchMatrix' ? 'active' : ''}`}
                    to="/switch/SwitchMatrix"
                    onClick={() => handleLinkClick('/switch/SwitchMatrix')}
                >
                    Switch Matrix
                </Link>
            </h2>
            <h2>
                <Link
                    className={`link ${activeLink === '/switch/' ? 'active' : ''}`}
                    to="/switch/"
                    onClick={() => handleLinkClick('/switch/')}
                > 
                History
                </Link>
            </h2>
            <h2>
                <Link
                    className={`link ${activeLink === '/switch/' ? 'active' : ''}`}
                    to="/switch/"
                    onClick={() => handleLinkClick('/switch/')}
                >
                    Add Input
                </Link>
            </h2>
        </div>
        <Routes>
            <Route path="SwitchMatrix" element={<SwitchMatrix/>} />
            <Route path='history' element={""}/>
            <Route path='addinput' element={""}/>
        </Routes>
    </div>
    )
}

export default SHeading
