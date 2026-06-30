import React, { useState } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar } from '../MainHeadingpage/MainHeadingpage';
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
    <ModuleHeadingWrapper>
        <ModuleHeadingBar>
            <h2 className={`link whitespace-nowrap${activeLink === '/masonary/masonarycalculater' ? ' active' : ''}`}>
                <Link
                    to="/masonary/masonarycalculater"
                    onClick={() => handleLinkClick('/masonary/masonarycalculater')}
                    style={{ color: 'inherit', textDecoration: 'none', display: 'block', font: 'inherit', fontWeight: 'inherit', fontSize: 'inherit' }}
                >
                    Masonary Calculater
                </Link>
            </h2>
            <h2 className={`link whitespace-nowrap${activeLink === '/masonary/history' ? ' active' : ''}`}>
                <Link
                    to="/masonary/history"
                    onClick={() => handleLinkClick('/masonary/history')}
                    style={{ color: 'inherit', textDecoration: 'none', display: 'block', font: 'inherit', fontWeight: 'inherit', fontSize: 'inherit' }}
                >
                History
                </Link>
            </h2>
            <h2 className={`link whitespace-nowrap${activeLink === '/masonary/addinput' ? ' active' : ''}`}>
                <Link
                    to="/masonary/addinput"
                    onClick={() => handleLinkClick('/masonary/addinput')}
                    style={{ color: 'inherit', textDecoration: 'none', display: 'block', font: 'inherit', fontWeight: 'inherit', fontSize: 'inherit' }}
                >
                    Add Input
                </Link>
            </h2>
        </ModuleHeadingBar>
        <Routes>
            <Route path="masonarycalculater" element={<MasonaryCalculater/>} />
            <Route path='history' element={<History/>}/>
            <Route path='addinput' element={<AddInput/>}/>
        </Routes>
    </ModuleHeadingWrapper>
  )
}

export default MHeading
