import React, { useState, useEffect } from "react";
import MobileRequestForQuotation from "../../componentsMobile/RequestForQuotation/RequestForQuotation";

const RequestForQuotationHeading = ({ username, userRoles = [] }) => {

    const [isMobile, setIsMobile] = useState(() => {
        return window.innerWidth <= 768;
    });

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (isMobile) {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : { username, userRoles };
        return (
            <div style={{textAlign: 'left'}}>
                <MobileRequestForQuotation user={user} onLogout={() => { }} />;
            </div>
        );
    }
    
    // For desktop, also use mobile component for now (can be updated later if needed)
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : { username, userRoles };
    return (
        <div style={{textAlign: 'left'}}>
            <MobileRequestForQuotation user={user} onLogout={() => { }} />;
        </div>
    );
}

export default RequestForQuotationHeading;
