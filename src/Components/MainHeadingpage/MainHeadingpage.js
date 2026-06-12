import React from 'react';
import '../Heading.css';
import './MainHeadingpage.css';

export const ModuleHeadingWrapper = ({ children, className = '' }) => (
    <div className={`bg-[#FAF6ED]${className ? ` ${className}` : ''}`}>
        {children}
    </div>
);

export const ModuleHeadingBar = ({ children, className = '' }) => (
    <div
        className={`main-heading-page-tabs cursor-pointer topbar-title expense-entry-tabs w-full max-w-full overflow-x-auto no-scrollbar${className ? ` ${className}` : ''}`}
    >
        {children}
    </div>
);

export const ModuleHeadingTab = ({ active = false, onClick, children, className = '' }) => (
    <h2
        className={`link whitespace-nowrap${active ? ' active' : ''}${className ? ` ${className}` : ''}`}
        onClick={onClick}
    >
        {children}
    </h2>
);

export default ModuleHeadingWrapper;
