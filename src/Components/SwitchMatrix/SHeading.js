import React, { useState } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar } from '../MainHeadingpage/MainHeadingpage';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import SwitchMatrix from './SwitchMatrix';


const SHeading = () => {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);
    const handleLinkClick = (path) => {
        setActiveLink(path);
    }
    return (
        <ModuleHeadingWrapper>
        <ModuleHeadingBar>
            <h2 className={`link whitespace-nowrap${activeLink === '/switch/SwitchMatrix' ? ' active' : ''}`}>
                <Link
                    to="/switch/SwitchMatrix"
                    onClick={() => handleLinkClick('/switch/SwitchMatrix')}
                    style={{ color: 'inherit', textDecoration: 'none', display: 'block', font: 'inherit', fontWeight: 'inherit', fontSize: 'inherit' }}
                >
                    Switch Matrix
                </Link>
            </h2>
            <h2 className={`link whitespace-nowrap${activeLink === '/switch/' ? ' active' : ''}`}>
                <Link
                    to="/switch/"
                    onClick={() => handleLinkClick('/switch/')}
                    style={{ color: 'inherit', textDecoration: 'none', display: 'block', font: 'inherit', fontWeight: 'inherit', fontSize: 'inherit' }}
                >
                History
                </Link>
            </h2>
            <h2 className={`link whitespace-nowrap${activeLink === '/switch/' ? ' active' : ''}`}>
                <Link
                    to="/switch/"
                    onClick={() => handleLinkClick('/switch/')}
                    style={{ color: 'inherit', textDecoration: 'none', display: 'block', font: 'inherit', fontWeight: 'inherit', fontSize: 'inherit' }}
                >
                    Add Input
                </Link>
            </h2>
        </ModuleHeadingBar>
        <Routes>
            <Route path="SwitchMatrix" element={<SwitchMatrix/>} />
            <Route path='history' element={""}/>
            <Route path='addinput' element={""}/>
        </Routes>
    </ModuleHeadingWrapper>
    )
}

export default SHeading
