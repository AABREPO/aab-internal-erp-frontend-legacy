import React, { useState } from 'react';
import { ModuleHeadingWrapper, ModuleHeadingBar } from '../MainHeadingpage/MainHeadingpage';
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
        <ModuleHeadingWrapper>
        <ModuleHeadingBar>
            <h2 className={`link whitespace-nowrap${activeLink === '/bath/BathFixtures Matrix' ? ' active' : ''}`}>
                <Link
                    to="/bath/BathFixtures Matrix"
                    onClick={() => handleLinkClick('/bath/BathFixtures Matrix')}
                    style={{ color: 'inherit', textDecoration: 'none', display: 'block', font: 'inherit', fontWeight: 'inherit', fontSize: 'inherit' }}
                >
                    Bath Fixtures Matrix
                </Link>
            </h2>
            <h2 className={`link whitespace-nowrap${activeLink === '/bath/BathFixtureHistory' ? ' active' : ''}`}>
                <Link
                    to="/bath/BathFixtureHistory"
                    onClick={() => handleLinkClick('/bath/BathFixtureHistory')}
                    style={{ color: 'inherit', textDecoration: 'none', display: 'block', font: 'inherit', fontWeight: 'inherit', fontSize: 'inherit' }}
                >
                History
                </Link>
            </h2>
            <h2 className={`link whitespace-nowrap${activeLink === '/bath/Addinput' ? ' active' : ''}`}>
                <Link
                    to="/bath/Addinput"
                    onClick={() => handleLinkClick('/bath/Addinput')}
                    style={{ color: 'inherit', textDecoration: 'none', display: 'block', font: 'inherit', fontWeight: 'inherit', fontSize: 'inherit' }}
                >
                    Add Input
                </Link>
            </h2>
        </ModuleHeadingBar>
        <Routes>
            <Route path="BathFixtures Matrix" element={<BathFixtur/>} />
            <Route path='BathFixtureHistory' element={<BathFixtureHistory/>}/>
            <Route path='Addinput' element={<BathFixingInputData/>}/>
        </Routes>
    </ModuleHeadingWrapper>
    )
}

export default BHeading
