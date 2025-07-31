import React, { useState, useRef, useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import Sunday from '../Images/heart.jpeg';
import Seasrch from '../Images/search.png';

const Attendancelog = () => {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    });
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr) - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    const handleMouseDown = (e) => {
        if (!scrollRef.current) return;
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
        if (!isDragging.current || !scrollRef.current) return;
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
        if (!isDragging.current || !scrollRef.current) return;
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
        if (!scrollRef.current) return;
        const friction = 0.95;
        const minVelocity = 0.1;
        const step = () => {
            const { x, y } = velocity.current;
            if (!scrollRef.current) return;
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
    },[]);
    const initialEmployees = [
        { id: 'E001', name: 'Er.Pon Pandiyan' },
        { id: 'E002', name: 'Er.Ramar' },
        { id: 'E003', name: 'Er.Siva Prakasham' },
        { id: 'E004', name: 'Er.Kalimuthu' },
    ];
    const [attendance, setAttendance] = useState([]);
    useEffect(() => {
        setAttendance(prev => {
            return initialEmployees.map((emp, empIndex) => {
                const prevDays = prev[empIndex]?.days || [];
                const newDays = Array(daysInMonth).fill('absent').map((_, i) => prevDays[i] || 'absent');
                return { ...emp, days: newDays };
            });
        });
    }, [selectedMonth]);
    const toggleStatus = (empIndex, dayIndex) => {
        setAttendance(prev => {
            const updated = [...prev];
            const current = updated[empIndex].days[dayIndex];
            const next =
                current === 'present' ? 'half' : current === 'half' ? 'absent' : 'present';
            updated[empIndex].days[dayIndex] = next;
            return updated;
        });
    };
    const getAbsentCount = (days) => {
        let absent = 0;
        days.forEach((day, index) => {
            const date = new Date(year, month, index + 1);
            const isSunday = date.getDay() === 0;
            if (!isSunday) {
                if (day === 'absent') absent += 1;
                else if (day === 'half') absent += 0.5;
            }
        });
        return absent.toFixed(1);
    };
    const getPresentCount = (days) => {
        const full = days.filter(d => d === 'present').length;
        const half = days.filter(d => d === 'half').length;
        return (full + half * 0.5).toFixed(1);
    };
    return (
        <div className='bg-[#FAF6ED]'>
            <div className='mt-24 lg:w-[1824px] flex justify-between'>
                <div>
                    <h1 className='mt-5 mb-5 pl-8 font-semibold text-xl'>AAB Attendance</h1>
                </div>
                <div className='mt-5 text-sm font-semibold flex gap-8'>
                    <button className='text-[#E4572E] font-semibold'>Export PDF</button>
                    <button className='text-[#007233] font-semibold'>Export XL</button>
                    <button className='text-[#BF9853] font-semibold'>Print</button>
                </div>
            </div>
            <div className="p-4 ml-2 lg:w-[1824px] bg-white h-[860px]">
                <div className="flex">
                    <div className="relative w-[261px] h-[45px] mt-1">
                        <input
                            type="text"
                            placeholder="Search Name..."
                            className="w-full h-full pl-2 pr-10 focus:outline-none"
                        />
                        <img
                            src={Seasrch}
                            alt="Search"
                            className="w-4 h-4 absolute right-24 top-1/2 transform -translate-y-1/2 text-green-600 cursor-pointer"
                        />
                    </div>
                    <div>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-[170px] h-[45px] pl-2 pr-3 rounded-md focus:outline-none"
                        />
                    </div>
                </div>
                <div className='rounded-lg flex border-l-8 border-l-[#BF9853] overflow-auto'>
                    <div className="">
                        <table className="text-base text-center">
                            <thead className="bg-[#FAF6ED]">
                                <tr>
                                    <th className="px-2 py-1" rowSpan="2">Sl.No</th>
                                    <th className="px-2 py-1" rowSpan="2">Emp ID</th>
                                    <th className="px-3 py-1 text-left" rowSpan="2">Name</th>
                                    <th className="px-2 py-[16.8px]" rowSpan="2">Absent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((emp, empIndex) => (
                                    <tr key={emp.id} className="bg-white even:bg-[#FAF6ED]">
                                        <td className="px-2 py-1">0{empIndex + 1}</td>
                                        <td className="px-2 py-1">{emp.id}</td>
                                        <td className="px-2 py-[6px]">
                                            <input
                                                type="text"
                                                value={emp.name}
                                                readOnly
                                                className="focus:outline-none px-2 py-1 text-left text-base bg-transparent"
                                            />
                                        </td>
                                        <td className="px-2 py-1">{getAbsentCount(emp.days)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={`bg-[#FFFFFF] overflow-x-auto no-scrollbar `}
                        ref={scrollRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}>
                        <table className="text-base text-center">
                            <thead className="bg-[#FAF6ED]">
                                <tr>
                                    {[...Array(daysInMonth)].map((_, i) => {
                                        const date = new Date(year, month, i + 1);
                                        const dayIndex = date.getDay();
                                        const dayShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][dayIndex];
                                        return (
                                            <th key={`day-${i}`} className={`px-4 py-1 text-[16px] font-bold ${dayIndex === 0 ? 'text-red-500' : ''}`}>
                                                {dayShort}
                                            </th>
                                        );
                                    })}
                                    <th className="px-2 py-1" rowSpan="2">Present</th>
                                </tr>
                                <tr>
                                    {[...Array(daysInMonth)].map((_, i) => (
                                        <th key={`date-${i}`} className="px-1 text-[14px]">{i + 1}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((emp, empIndex) => (
                                    <tr key={emp.id} className="bg-white even:bg-[#FAF6ED]">
                                        {emp.days.map((status, dayIndex) => {
                                            const date = new Date(year, month, dayIndex + 1);
                                            const isSunday = date.getDay() === 0;
                                            return (
                                                <td key={dayIndex} className="px-1 py-1 cursor-pointer" onClick={() => toggleStatus(empIndex, dayIndex)}>
                                                    <div className={`w-4 h-4 mx-auto flex items-center justify-center rounded-full
                                                            ${status === 'present' ? 'bg-[#007233] text-white' :
                                                            status === 'half' ? 'bg-gray-50 text-green-600' :
                                                                isSunday ? 'text-yellow-600' : 'bg-[#E4572E] text-white'}`}>
                                                        {status === 'present' && <FaCheck className="text-[10px]" />}
                                                        {status === 'half' && <FaCheck className="text-xs" />}
                                                        {status === 'absent' && isSunday && <img src={Sunday} alt="Sunday" className="w-4 h-4" />}
                                                        {status === 'absent' && !isSunday && <FaTimes className="text-xs" />}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                        <td className="px-2 py-[10px]">{getPresentCount(emp.days)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Attendancelog;