import React, { useState, useEffect } from 'react';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import cross from '../Images/cross.png';
import edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';

const StaffAddInput = ({ username, userRoles = [], paymentModeOptions = [] }) => {
    const [isStaffTypeOpen, setIsStaffTypeOpen] = useState(false);
    const [staffTypeSearch, setStaffTypeSearch] = useState('');
    const [staffType, setStaffType] = useState('');
    const [staffTypes, setStaffTypes] = useState([]);
    const [isEditStaffTypeOpen, setIsEditStaffTypeOpen] = useState(false);
    const [selectedStaffTypeId, setSelectedStaffTypeId] = useState(null);
    const [editStaffType, setEditStaffType] = useState('');
    const [message, setMessage] = useState('');

    const openStaffTypes = () => setIsStaffTypeOpen(true);
    const closeStaffTypes = () => setIsStaffTypeOpen(false);

    const openEditStaffTypePopup = (item) => {
        setEditStaffType(item.purpose);
        setSelectedStaffTypeId(item.id)
        setIsEditStaffTypeOpen(true);
    }

    const closeEditStaffTypePopup = () => {
        setIsEditStaffTypeOpen(false);
        setEditStaffType('');
        setSelectedStaffTypeId('');
    }

    useEffect(() => {
        fetchStaffTypes();
    }, []);

    const fetchStaffTypes = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/purposes/getAll');
            if (response.ok) {
                const data = await response.json();
                setStaffTypes(data);
            } else {
                setMessage('Error fetching staff types.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching staff types.');
        }
    };

    const handleDeleteAllStaffTypes = async () => {
        const confirmed = window.confirm("Are you sure you want to delete all Staff Types?");
        if (confirmed) {
            try {
                const response = await fetch("https://backendaab.in/aabuildersDash/api/purposes/deleteAll", {
                    method: "DELETE",
                });
                if (response.ok) {
                    setStaffTypes([]);
                    alert("All Staff Types have been deleted successfully.");
                } else {
                    console.error("Failed to delete all Staff Types. Status:", response.status);
                    alert("Error deleting the Staff Types. Please try again.");
                }
            } catch (error) {
                console.error("Error deleting all Staff Types:", error);
                alert("An error occurred while deleting all Staff Types.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };

    const handleStaffTypeDelete = async (id) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/purposes/delete/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert("Staff Type deleted successfully!!!");
                window.location.reload();
            } else {
                console.error("Failed to delete the Staff Type. Status:", response.status);
                alert("Error deleting the Staff Type. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while deleting the Staff Type.");
        }
    };

    const handleSubmitStaffTypes = async (e) => {
        e.preventDefault();
        const newStaffType = { purpose: staffType };
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/purposes/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newStaffType),
            });
            if (response.ok) {
                setMessage('Staff Type saved successfully!');
                setStaffType('');
                window.location.reload();
            } else {
                setMessage('Error saving staff type.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error saving staff type.');
        }
    };

    const handleEditStaffTypes = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/purposes/edit/${selectedStaffTypeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ purpose: editStaffType }),
            });
            if (response.ok) {
                closeEditStaffTypePopup();
                window.location.reload();
            } else {
                console.error('Failed to update staff type');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const filteredStaffTypes = staffTypes.filter((item) =>
        item.purpose.toLowerCase().includes(staffTypeSearch.toLowerCase())
    );

    return (
        <div className="p-4 bg-white ml-10 mr-5 xl:mr-10">
            <div className="xl:flex xl:w-full md:w-[32rem] w-[20rem] overflow-x-auto">
                <div>
                    <div className="flex items-center mb-2 xl:mt-0 mt-3 ">
                        <input
                            type="text"
                            className="border-2 border-[#BF9853] border-opacity-30 rounded-lg p-2 flex-1 w-44 h-[45px] focus:outline-none"
                            placeholder="Search Purpose.."
                            value={staffTypeSearch}
                            onChange={(e) => setStaffTypeSearch(e.target.value)}
                        />
                        <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                            <img src={search} alt='search' className=' w-5 h-5' />
                        </button>
                        <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                            onClick={openStaffTypes}>
                            + Add
                        </button>
                    </div>
                    <button className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
                    <button onClick={handleDeleteAllStaffTypes}>
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
                                    {filteredStaffTypes.map((item, index) => (
                                        <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                                            <td className="p-2 text-left font-semibold">{(staffTypes.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                                            <td className="p-2 text-left group flex font-semibold">
                                                <div className="flex flex-grow">
                                                    {item.purpose}
                                                </div>
                                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                                                    <button type="button" >
                                                        <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditStaffTypePopup(item)} />
                                                    </button>
                                                    <button >
                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleStaffTypeDelete(item.id)} />
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
            {isStaffTypeOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
                    <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeStaffTypes}>
                                <img src={cross} alt='cross' className='w-5 h-5' />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitStaffTypes}>
                            <div className="mb-4">
                                <label className="block text-lg font-medium mb-2 -ml-60">Purpose</label>
                                <input
                                    type="text"
                                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                                    placeholder="Enter Purpose"
                                    onChange={(e) => setStaffType(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex space-x-2 mt-4 ml-12">
                                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                                    Submit
                                </button>
                                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeStaffTypes}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Staff Type Modal */}
            {isEditStaffTypeOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
                    <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeEditStaffTypePopup}>
                                <img src={cross} alt='close' className='w-5 h-5' />
                            </button>
                        </div>
                        <form onSubmit={handleEditStaffTypes}>
                            <div className="mb-4">
                                <label className="block text-lg font-medium mb-2 -ml-[15rem]">Purpose</label>
                                <input
                                    type="text"
                                    value={editStaffType}
                                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                                    placeholder="Enter Purpose"
                                    onChange={(e) => setEditStaffType(e.target.value)}
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
                                    onClick={closeEditStaffTypePopup}>
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

export default StaffAddInput