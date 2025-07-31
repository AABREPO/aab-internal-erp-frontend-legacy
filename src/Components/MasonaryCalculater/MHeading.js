import React, { useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import MasonaryCalculater from './MasonaryCalculater';
import History from './History';
import AddInput from './AddInput';

const MHeading = () => {
    const location = useLocation();
        const [activeLink, setActiveLink] = useState(location.pathname);
        const handleLinkClick = (path) => {
            setActiveLink(path);
        }

  return (
    <div className="bg-[#FAF6ED]">
        <div className="topbar-title space-x-2">
            <h2 className="mb-0">
                <Link
                    className={`link ${activeLink === '/masonary/masonarycalculater' ? 'active' : ''}`}
                    to="/masonary/masonarycalculater"
                    onClick={() => handleLinkClick('/masonary/masonarycalculater')}
                >
                    Masonary Calculater
                </Link>
            </h2>
            <h2>
                <Link
                    className={`link ${activeLink === '/masonary/history' ? 'active' : ''}`}
                    to="/masonary/history"
                    onClick={() => handleLinkClick('/masonary/history')}
                > 
                History
                </Link>
            </h2>
            <h2>
                <Link
                    className={`link ${activeLink === '/masonary/addinput' ? 'active' : ''}`}
                    to="/masonary/addinput"
                    onClick={() => handleLinkClick('/masonary/addinput')}
                >
                    Add Input
                </Link>
            </h2>
        </div>
        <Routes>
            <Route path="masonarycalculater" element={<MasonaryCalculater/>} />
            <Route path='history' element={<History/>}/>
            <Route path='addinput' element={<AddInput/>}/>
        </Routes>
    </div>
  )
}

export default MHeading
