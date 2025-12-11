import React, { useState, useEffect } from 'react';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import cross from '../Images/cross.png';
import edit from '../Images/Edit.svg';
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
                window.location.reload();
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
                window.location.reload();
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
                window.location.reload();
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

    return (
        <div className="p-4 bg-white ml-10 mr-10 max-w-[95vw] h-[780px]">
            <div className="lg:flex space-x-[2%] lg:w-full md:w-[32rem] w-[17rem] overflow-x-auto px-1">
                <div>
                    <div className="flex items-center mb-2 lg:mt-0 mt-3 ">
                        <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                            placeholder="Search Purpose.."
                            value={loanTypeSearch}
                            onChange={(e) => setLoanTypeSearch(e.target.value)}
                        />
                        <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                            <img src={search} alt='search' className=' w-5 h-5' />
                        </button>
                        <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                            onClick={openLoanTypes}>
                            + Add
                        </button>
                    </div>
                    <button className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
                    <button onClick={handleDeleteAllLoanTypes}>
                        <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[15rem]' />
                    </button>
                    <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                        <div className="bg-[#FAF6ED]">
                            <table className="table-auto lg:w-72 ">
                                <thead className='bg-[#FAF6ED]'>
                                    <tr className="border-b">
                                        <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                                        <th className="p-2 text-left lg:w-72 text-xl font-bold">Purpose</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <table className="table-auto lg:w-72 w-full">
                                <tbody>
                                    {filteredLoanTypes.map((item, index) => (
                                        <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                                            <td className="p-2 text-left font-semibold">{(loanTypes.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                                            <td className="p-2 text-left group flex font-semibold">
                                                <div className="flex flex-grow">
                                                    {item.purpose}
                                                </div>
                                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                                                    <button type="button" >
                                                        <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditLoanTypePopup(item)} />
                                                    </button>
                                                    <button >
                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleLoanTypeDelete(item.id)} />
                                                    </button>
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

            {/* Add Staff Type Modal */}
            {isLoanTypeOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
                    <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeLoanTypes}>
                                <img src={cross} alt='cross' className='w-5 h-5' />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitLoanTypes}>
                            <div className="mb-4">
                                <label className="block text-lg font-medium mb-2 -ml-60">Purpose</label>
                                <input
                                    type="text"
                                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                                    placeholder="Enter Purpose"
                                    onChange={(e) => setLoanType(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex space-x-2 mt-4 ml-12">
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
            {/* Edit Staff Type Modal */}
            {isEditLoanTypeOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
                    <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeEditLoanTypePopup}>
                                <img src={cross} alt='close' className='w-5 h-5' />
                            </button>
                        </div>
                        <form onSubmit={handleEditLoanTypes}>
                            <div className="mb-4">
                                <label className="block text-lg font-medium mb-2 -ml-[15rem]">Purpose</label>
                                <input
                                    type="text"
                                    value={editLoanType}
                                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                                    placeholder="Enter Purpose"
                                    onChange={(e) => setEditLoanType(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex space-x-2 mt-8 ml-12">
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
