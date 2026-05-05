import React, { useState, useEffect } from 'react';
import StaffAdvance from './StaffAdvance';
import StaffTableview from './StaffTableview';
import StaffDatabase from './StaffDatabase';
import StaffReport from './StaffReport';
import StaffSummary from './StaffSummary';
import StaffAddInput from './StaffAddInput';
import MobileStaffAdvance from '../../componentsMobile/StaffAdvance/StaffAdvance';

// Payment Mode options (fallback if backend fails)
const defaultPaymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Direct', label: 'Direct' },
];

const StaffHeading = ({ username, userRoles = [] }) => {
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

    const [paymentModeOptions, setPaymentModeOptions] = useState(defaultPaymentModeOptions);
    useEffect(() => {
        const fetchPaymentModes = async () => {
            try {
                const response = await fetch('https://backendaab.in/demoAabuildersDash/api/payment_mode/getAll');
                if (response.ok) {
                    const data = await response.json();
                    const formattedOptions = data.map((mode) => ({
                        value: mode.modeOfPayment,
                        label: mode.modeOfPayment,
                    }));
                    setPaymentModeOptions(formattedOptions);
                }
            } catch (error) {
                console.error('Error fetching payment modes:', error);
            }
        };
        fetchPaymentModes();
    }, []);

    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('activePaintTab');
        if (savedTab === 'staffDatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            return 'staffAdvance';
        }
        return savedTab || 'staffAdvance';
    });
    useEffect(() => {
        if (activeTab === 'staffDatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            setActiveTab('staffAdvance');
        } else {
            localStorage.setItem('activePaintTab', activeTab);
        }
    }, [activeTab, username]);

    if (isMobile) {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : { username, userRoles };
        return (
            <div style={{ textAlign: 'left' }}>
                <MobileStaffAdvance user={user} onLogout={() => { }} />
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'staffAdvance':
                return <StaffAdvance username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'staffTablview':
                return <StaffTableview username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'staffDatabase':
                return <StaffDatabase username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'staffInput':
                return <StaffAddInput username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'staffReport':
                return <StaffReport username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            case 'staffSummary':
                return <StaffSummary username={username} userRoles={userRoles} paymentModeOptions={paymentModeOptions} />;
            default:
                return <StaffAdvance paymentModeOptions={paymentModeOptions} />;
        }
    };
    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen overflow-auto">

            {/* Fixed border wrapper */}
            <div className="w-full xl:px-0 px-5">
                {/* Scrolling headings only */}
                <div className="w-full overflow-x-auto no-scrollbar xl:px-0">
                    <div className="topbar-title flex flex-nowrap xl:flex-wrap min-w-max xl:min-w-0">
                        <h2
                            className={`link ${activeTab === 'staffAdvance' ? 'active' : ''}`}
                            onClick={() => setActiveTab('staffAdvance')}
                        >
                            Advance
                        </h2>
                        <h2
                            className={`link ${activeTab === 'staffTablview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('staffTablview')}
                        >
                            Table View
                        </h2>
                        {(username === 'Mahalingam M' || username === 'Admin') && (
                            <h2
                                className={`link ${activeTab === 'staffDatabase' ? 'active' : ''}`}
                                onClick={() => setActiveTab('staffDatabase')}
                            >
                                Database
                            </h2>
                        )}
                        <h2
                            className={`link ${activeTab === 'staffInput' ? 'active' : ''}`}
                            onClick={() => setActiveTab('staffInput')}
                        >
                            Add Input
                        </h2>
                        <h2
                            className={`link ${activeTab === 'staffReport' ? 'active' : ''}`}
                            onClick={() => setActiveTab('staffReport')}
                        >
                            Report
                        </h2>
                        <h2
                            className={`link ${activeTab === 'staffSummary' ? 'active' : ''}`}
                            onClick={() => setActiveTab('staffSummary')}
                        >
                            Summary
                        </h2>
                    </div>
                </div>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    )
}
export default StaffHeading
