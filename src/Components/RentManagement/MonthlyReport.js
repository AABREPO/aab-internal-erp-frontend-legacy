import React, { useState, useEffect, useRef } from 'react';
import Select from "react-select";
import axios from 'axios';
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';
import fileDownload from '../Images/file_download.png'

const MonthlyReport = () => {
    const [monthlyReportUrl, setMonthlyReportUrl] = useState([]);
    const [sortedMonthlyRentReports, setSortedMonthlyRentReports] = useState([]);
    const [selectedReportNumber, setSelectedReportNumber] = useState([]);
    const [clickedReportNumber,setClickedReportNumber] = useState(null);
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });

    const handleMouseDown = (e) => {
        isDragging.current = true;
        start.current = { x: e.clientX, y: e.clientY };
        scroll.current = {
            left: scrollRef.current.scrollLeft,
            top: scrollRef.current.scrollTop,
        };
        lastMove.current = {
            time: Date.now(),
            x: e.clientX,
            y: e.clientY,
        };
        scrollRef.current.style.cursor = 'grabbing';
        scrollRef.current.style.userSelect = 'none';
        cancelMomentum();
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;

        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;

        const now = Date.now();
        const dt = now - lastMove.current.time || 16;

        velocity.current = {
            x: (e.clientX - lastMove.current.x) / dt,
            y: (e.clientY - lastMove.current.y) / dt,
        };

        scrollRef.current.scrollLeft = scroll.current.left - dx;
        scrollRef.current.scrollTop = scroll.current.top - dy;

        lastMove.current = {
            time: now,
            x: e.clientX,
            y: e.clientY,
        };
    };

    const handleMouseUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        scrollRef.current.style.cursor = '';
        scrollRef.current.style.userSelect = '';
        applyMomentum();
    };

    const cancelMomentum = () => {
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
    };
    const applyMomentum = () => {
        const friction = 0.95;
        const minVelocity = 0.1;

        const step = () => {
            const { x, y } = velocity.current;
            if (Math.abs(x) > minVelocity || Math.abs(y) > minVelocity) {
                scrollRef.current.scrollLeft -= x * 20;
                scrollRef.current.scrollTop -= y * 20;
                velocity.current.x *= friction;
                velocity.current.y *= friction;
                animationFrame.current = requestAnimationFrame(step);
            } else {
                cancelMomentum();
            }
        };

        animationFrame.current = requestAnimationFrame(step);
    };

    useEffect(() => {
        return () => cancelMomentum();
    }, []);
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    useEffect(() => {
        axios
            .get('https://backendaab.in/aabuildersDash/api/rental_forms/monthly_report')
            .then((response) => {
                const sortedRents = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                const uniqueUrls = [
                    ...new Set(
                        sortedRents.map((rent) => rent.monthlyReportUrl)
                    ),
                ];
                setSortedMonthlyRentReports(sortedRents);
                setMonthlyReportUrl(uniqueUrls);
            })
            .catch((error) => {
                console.error('Error fetching expenses:', error);
            });
    }, []);
    return (
        <div>
            <div className="flex flex-col lg:flex-row ml-9 gap-10 mt-5">
                <div className="bg-white rounded-lg shadow p-4 lg:w-[693px] h-[610px] space-y-2 overflow-auto">
                    {monthlyReportUrl.length > 0 ? (
                        <table className="table-auto w-full border-collapse">
                            <thead>
                            </thead>
                            <tbody>
                                {monthlyReportUrl.map((url, index) => {
                                    // For each URL, find the corresponding checklist number and date
                                    const MonthlyRentReportData = sortedMonthlyRentReports.find(
                                        (rent) => rent.monthlyReportUrl === url
                                    );
                                    const reportNumber = MonthlyRentReportData ? MonthlyRentReportData.reportNumber : '';
                                    const timestamp = MonthlyRentReportData ? MonthlyRentReportData.timestamp : '';
                                    // Format the timestamp to DD/MM/YYYY
                                    const formattedDate = timestamp
                                        ? new Date(timestamp).toLocaleDateString('en-GB') // 'en-GB' gives DD/MM/YYYY format
                                        : '';
                                    const serialNumber = (monthlyReportUrl.length - index).toString().padStart(2, '0');
                                    return (
                                        <tr key={index}>
                                            <td className="px-4 py-2 font-bold">{serialNumber}</td>
                                            <td>
                                                <div className='flex space-x-4'>
                                                    <img className=' w-5 h-5 font-bold' src={fileDownload} alt='' />
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();

                                                            if (MonthlyRentReportData && MonthlyRentReportData.reportNumber) {
                                                                const matchingEntries = sortedMonthlyRentReports.filter(
                                                                    (rent) => rent.reportNumber === MonthlyRentReportData.reportNumber
                                                                );

                                                                setSelectedReportNumber(matchingEntries);
                                                                setClickedReportNumber(MonthlyRentReportData.reportNumber);
                                                                const url = matchingEntries[0]?.monthlyReportUrl;
                                                                if (url) {
                                                                    window.open(url, '_blank');
                                                                }
                                                            }
                                                        }}
                                                        className="underline font-semibold"
                                                        style={{
                                                            color:
                                                                clickedReportNumber === MonthlyRentReportData.reportNumber
                                                                    ? '#ef6f47'
                                                                    : 'black',
                                                        }}
                                                    >
                                                        {reportNumber} - {formattedDate} Monthly Rent Report
                                                    </button>
                                                </div>

                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p>No checklist URLs available</p>
                    )}
                </div>
                {/* Right: Entry Detail */}
                <div className="bg-white rounded-lg shadow p-4 w-full max-w-[1066px] lg:h-[610px] ">
                    <div>
                        <h1 className="text-2xl font-bold">Monthly Rent Report</h1>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center sm:space-x-3">
                        <div className="flex justify-between items-start w-full sm:w-auto">
                            {/* Only show on mobile inline */}
                            <div className="block sm:hidden mr-5">
                                <div className="text-[#ef6f47] rounded text-sm font-bold">
                                    <input
                                        value={selectedReportNumber.length}
                                        className="bg-gray-100 w-[49px] h-[39px] rounded-md text-center block"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Only show on tablet/desktop */}
                        <div className="hidden sm:flex flex-col items-end space-y-2">
                            <div className="text-[#ef6f47] rounded mb-4 text-sm font-bold">
                                <input
                                    value={selectedReportNumber.length}
                                    className="bg-gray-100 w-[49px] h-[39px] rounded-md text-center"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Table */}
                    <div
                        ref={scrollRef}
                        className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[460px] overflow-scroll select-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <table className="table-fixed  min-w-[1065px] w-screen border-collapse">
                            <thead>
                                <tr className="bg-[#FAF6ED]">
                                    <th className='px-2 w-28 font-bold text-left'>S No</th>
                                    <th className="px-2 w-[240px] font-bold text-left">Time stamp</th>
                                    <th className="px-2 p-2 w-36 font-bold text-left">Shop No</th>
                                    <th className="px-2 w-[420px] font-bold text-left">Tenant Name</th>
                                    <th className="px-2 w-[120px] font-bold text-left">Amount</th>
                                    <th className="px-2 w-[220px] font-bold text-left">Type</th>
                                    <th className="px-2 w-[220px] font-bold text-left">Paid On</th>
                                    <th className="px-2 w-[420px] font-bold text-left">For The Month Of</th>
                                    <th className="px-2 w-[120px] font-bold text-left">Mode</th>
                                    <th className="px-3 w-[120px] font-bold text-left">Attach file</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedReportNumber.map((rent, index) => (
                                    <tr key={index}>
                                        <td className="px-2 text-left">{index + 1}</td>
                                        <td className="px-2 text-left font-semibold">{formatDate(rent.timestamp)}</td>
                                        <td className="px-2 text-left font-semibold">{rent.shopNo}</td>
                                        <td className="px-2 text-left font-semibold">{rent.tenantName}</td>
                                        <td className="text-sm text-left pl-2 font-semibold">
                                            ₹{Number(rent.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-2 text-left font-semibold">{rent.formType}</td>
                                        <td className="px-2 text-left font-semibold">{formatDateOnly(rent.paidOnDate)}</td>
                                        <td className="text-sm text-left px-4 font-semibold">
                                            {rent.forTheMonthOf
                                                ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                                                    month: 'long',
                                                    year: 'numeric',
                                                })
                                                : ''}
                                        </td>
                                        <td className="px-2 text-left font-semibold">{rent.paymentMode}</td>
                                        <td className="px-4 text-sm">
                                            {rent.monthlyReportUrl ? (
                                                <a
                                                    href={rent.monthlyReportUrl}
                                                    className="text-red-500 underline font-semibold"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View
                                                </a>
                                            ) : (
                                                <span></span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default MonthlyReport
const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes());

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';

    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};