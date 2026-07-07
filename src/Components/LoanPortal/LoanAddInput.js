import React, { useState, useEffect } from 'react';
import { notifyOrbitModuleDataChanged } from '../../utils/orbitProjectDataSync';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import FileRemover from '../Images/FileRemover.svg';
import edit from '../Images/Edit.svg';
import Add from '../Images/+Add.svg';
import deleteIcon from '../Images/Delete.svg';

const LoanAddInput = ({ username, userRoles = [] }) => {
  const [isLoanTypeOpen, setIsLoanTypeOpen] = useState(false);
    const [loanTypeSearch, setLoanTypeSearch] = useState('');
    const [loanType, setLoanType] = useState('');
    const [loanTypes, setLoanTypes] = useState([]);
    const [isEditLoanTypeOpen, setIsEditLoanTypeOpen] = useState(false);
    const [selectedLoanTypeId, setSelectedLoanTypeId] = useState(null);
    const [editLoanType, setEditLoanType] = useState('');
    const [message, setMessage] = useState('');
    const openLoanTypes = () => setIsLoanTypeOpen(true);
    const closeLoanTypes = () => setIsLoanTypeOpen(false);

    const openEditLoanTypePopup = (item) => {
        setEditLoanType(item.purpose);
        setSelectedLoanTypeId(item.id)
        setIsEditLoanTypeOpen(true);
    }

    const closeEditLoanTypePopup = () => {
        setIsEditLoanTypeOpen(false);
        setEditLoanType('');
        setSelectedLoanTypeId('');
    }

    useEffect(() => {
        fetchLoanTypes();
    }, []);

    const fetchLoanTypes = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/loan-purposes/getAll');
            if (response.ok) {
                const data = await response.json();
                setLoanTypes(data);
            } else {
                setMessage('Error fetching loan types.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching loan types.');
        }
    };

    const handleDeleteAllLoanTypes = async () => {
        const confirmed = window.confirm("Are you sure you want to delete all Loan Types?");
        if (confirmed) {
            try {
                const response = await fetch("https://backendaab.in/aabuildersDash/api/loan-purposes/deleteAll", {
                    method: "DELETE",
                });
                if (response.ok) {
                    setLoanTypes([]);
                    alert("All Loan Types have been deleted successfully.");
                } else {
                    console.error("Failed to delete all Loan Types. Status:", response.status);
                    alert("Error deleting the Loan Types. Please try again.");
                }
            } catch (error) {
                console.error("Error deleting all Loan Types:", error);
                alert("An error occurred while deleting all Loan Types.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };

    const handleLoanTypeDelete = async (id) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/loan-purposes/delete/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert("Loan Type deleted successfully!!!");
                await fetchLoanTypes();
                notifyOrbitModuleDataChanged('loan');
            } else {
                console.error("Failed to delete the Loan Type. Status:", response.status);
                alert("Error deleting the Loan Type. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while deleting the Loan Type.");
        }
    };

    const handleSubmitLoanTypes = async (e) => {
        e.preventDefault();
        const newLoanType = { purpose: loanType };
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/loan-purposes/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newLoanType),
            });
            if (response.ok) {
                setMessage('Loan Type saved successfully!');
                setLoanType('');
                await fetchLoanTypes();
                notifyOrbitModuleDataChanged('loan');
            } else {
                setMessage('Error saving loan type.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error saving loan type.');
        }
    };

    const handleEditLoanTypes = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/loan-purposes/edit/${selectedLoanTypeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ purpose: editLoanType }),
            });
            if (response.ok) {
                closeEditLoanTypePopup();
                await fetchLoanTypes();
                notifyOrbitModuleDataChanged('loan');
            } else {
                console.error('Failed to update loan type');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const filteredLoanTypes = loanTypes.filter((item) =>
        item.purpose.toLowerCase().includes(loanTypeSearch.toLowerCase())
    );

    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [expandedCells, setExpandedCells] = useState({});

    const toggleExpandedCell = (cellKey) => {
        setExpandedCells((prev) => ({
            ...prev,
            [cellKey]: !prev[cellKey],
        }));
    };

    const interactiveDragSelectors =
        'input, textarea, button, select, a, label, [role="button"], [contenteditable="true"], .prevent-drag-scroll';

    const shouldSkipDragScroll = (target) => {
        if (!target || typeof target.closest !== 'function') return false;
        return Boolean(target.closest(interactiveDragSelectors));
    };

    const handleMouseDown = (e) => {
        if (shouldSkipDragScroll(e.target)) {
            setIsDragging(false);
            return;
        }
        setIsDragging(true);
        setStartX(e.pageX - e.currentTarget.offsetLeft);
        setScrollLeft(e.currentTarget.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - e.currentTarget.offsetLeft;
        const walk = (x - startX) * 2;
        e.currentTarget.scrollLeft = scrollLeft - walk;
    };

    const handleTouchStart = (e) => {
        if (shouldSkipDragScroll(e.target)) {
            setIsDragging(false);
            return;
        }
        setIsDragging(true);
        setStartX(e.touches[0].pageX - e.currentTarget.offsetLeft);
        setScrollLeft(e.currentTarget.scrollLeft);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.touches[0].pageX - e.currentTarget.offsetLeft;
        const walk = (x - startX) * 2;
        e.currentTarget.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    return (
        <div className='flex flex-col h-[calc(100vh-104px)] px-[18px] pt-[18px] pb-[18px] overflow-hidden bg-[#FAF6ED]'>
            <div className=" flex flex-col flex-1 min-h-0 px-[18px] pt-[18px] pb-[18px] overflow-hidden bg-white">
                <div
                    className="flex-1 min-h-0 flex space-x-[18px] w-full overflow-x-auto overflow-y-hidden no-scrollbar scrollbar-none select-none"
                    style={{ cursor: isDragging ? 'grabbing' : 'default' }}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div>
                        <div className="flex items-center mb-[6px]">
                            <input
                                type="text"
                                className=" border-[#BF9853] border-2 border-opacity-25 rounded-full text-[14px] pl-[16px] flex-1 w-44 h-[40px] focus:outline-none"
                                placeholder="Purpose"
                                value={loanTypeSearch}
                                onChange={(e) => setLoanTypeSearch(e.target.value)}
                            />
                            <button className="-ml-8 mt-5 transform -translate-y-1/2 text-gray-500">
                                <img src={search} alt='search' className=' w-5 h-5' />
                            </button>
                            <button className="text-black font-bold px-1 ml-4"
                                onClick={openLoanTypes}>
                                <img src={Add} alt='add' className='w-[30px] h-[30px]' />
                            </button>
                        </div>
                        <button className="text-[#E4572E] flex mb-[8px]"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-[6px]' /><h1 className='mt-1.5 text-[14px] font-semibold'>Import file</h1></button>
                        <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                            <div className="bg-[#FAF6ED]">
                                <table className="table-auto w-[320px] ">
                                    <thead className='bg-[#FAF6ED]'>
                                        <tr className="border-b h-[40px]">
                                            <th className="pl-[12px] pr-[12px] text-left w-16 text-[16px] font-bold">S.No</th>
                                            <th className="pl-0 pr-[8px] text-left w-72 text-[16px] font-bold">
                                                <div className="flex items-center justify-between gap-[12px]">
                                                    <span>Purpose</span>
                                                    <button type="button" onClick={handleDeleteAllLoanTypes} className="inline-flex shrink-0 items-center justify-center">
                                                        <img src={deleteIcon} alt='del' className='w-4 h-4' />
                                                    </button>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                            <div className="overflow-y-auto max-h-[calc(100vh-300px)] no-scrollbar scrollbar-none scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                <table className="table-fixed w-[320px]">
                                    <tbody>
                                        {filteredLoanTypes.map((item) => (
                                            <tr key={item.id} className="border-b odd:bg-white text-[14px] even:bg-[#FAF6ED] h-[40px]">
                                                <td className="pl-[12px] pr-[12px] text-left font-semibold w-[64px]">{(loanTypes.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                                                <td className="pl-0 pr-[8px] text-left group font-semibold max-w-0">
                                                    <div className="flex items-center min-w-0">
                                                        <span
                                                            onClick={() => toggleExpandedCell(`${item.id}-purpose`)}
                                                            className={`block min-w-0 flex-1 cursor-pointer ${expandedCells[`${item.id}-purpose`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                            title={item.purpose}
                                                        >
                                                            {item.purpose}
                                                        </span>
                                                        <div className="flex shrink-0 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                                                            <button type="button" >
                                                                <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditLoanTypePopup(item)} />
                                                            </button>
                                                            <button >
                                                                <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleLoanTypeDelete(item.id)} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isLoanTypeOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999] ">
                    <div className="bg-white rounded-md p-[16px]">
                        <div className="flex justify-end">
                            <button className="" onClick={closeLoanTypes}>
                                <img src={FileRemover} alt='close' className='w-3 h-3' />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitLoanTypes}>
                            <div className="mb-[8px] text-left">
                                <label className="block text-lg font-medium mb-[8px]">Purpose</label>
                                <input
                                    type="text"
                                    className="w-[300px] border-2 border-[#BF9853] border-opacity-35 rounded pl-[8px] h-[40px] focus:outline-none"
                                    placeholder="Enter Purpose"
                                    onChange={(e) => setLoanType(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex space-x-2 mt-[16px] justify-end">
                                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                                    Submit
                                </button>
                                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeLoanTypes}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isEditLoanTypeOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]" >
                    <div className="bg-white rounded-md p-[16px]">
                        <div className="flex justify-end">
                            <button className="" onClick={closeEditLoanTypePopup}>
                                <img src={FileRemover} alt='close' className='w-3 h-3' />
                            </button>
                        </div>
                        <form onSubmit={handleEditLoanTypes}>
                            <div className="mb-[8px] text-left">
                                <label className="block text-lg font-medium mb-[8px]">Purpose</label>
                                <input
                                    type="text"
                                    value={editLoanType}
                                    className="w-[300px] border-2 border-[#BF9853] border-opacity-35 rounded pl-[8px] h-[40px] focus:outline-none"
                                    placeholder="Enter Purpose"
                                    onChange={(e) => setEditLoanType(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex space-x-2 mt-[16px] justify-end">
                                <button
                                    type="submit"
                                    className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                                    onClick={closeEditLoanTypePopup}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LoanAddInput
