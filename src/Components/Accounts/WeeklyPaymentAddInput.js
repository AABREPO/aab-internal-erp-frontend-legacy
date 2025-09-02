import React, { useState, useEffect } from 'react';
import axios from 'axios';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import cross from '../Images/cross.png';
import edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';
import { set } from 'date-fns';
const WeeklyPaymentAddInput = ({ username, userRoles = [] }) => {
    const [isWeeklyTypeOpen, setIsWeeklyTypeOpen] = useState(false);
    const [weeklyReceivedTypeSearch, setWeeklyReceivedTypeSearch] = useState('');
    const [weeklyReceivedType, setWeeklyReceivedType] = useState('');
    const [weeklyReceivedTypes, setWeeklyReceivedTypes] = useState([]);
    const [isEditWeeklyReceivedTypeOpen, setIsEditWeeklyReceivedTypeOpen] = useState(false);
    const [selectedWeeklyReceivedTypeId, setSelectedWeeklyReceivedTypeId] = useState(null);
    const [editWeeklyReceivedType, setEditWeeklyReceivedType] = useState('');
    const [isLaboursListDataOpen, setIsLaboursListDataOpen] = useState(false);
    const [isEmployeeDataOpen, setIsEmployeeDataOpen] = useState(false);
    const [laboursListSearch, setLaboursListSearch] = useState('');
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [labourName, setLabourName] = useState('');
    const [labourSalary, setLabourSalary] = useState('');
    const [laboursList, setLaboursList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [employeeName, setEmployeeName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [roleOfEmployee, setRoleOfEmployee] = useState('');
    const [isEditLaboursListDataOpen, setIsEditLaboursListDataOpen] = useState(false);
    const [isEditEmployeeDataOpen, setIsEditEmployeeDataOpen] = useState(false);
    const [selectedLabourDataId, setSelectedLabourDataId] = useState(null);
    const [selectedEmployeeDataId, setSelectedEmployeeDataId] = useState(null);
    const [editEmployeeName, setEditEmployeeName] = useState('');
    const [editEmployeeMobileNumber, setEditEmployeeMobileNumber] = useState('');
    const [editRoleOfEmployee, setEditRoleOfEmployee] = useState('');
    const [editLabourName, setEditLabourName] = useState('');
    const [editLabourSalary, setEditLabourSalary] = useState('');
    const [message, setMessage] = useState('');
    console.log(message);
    const [laboursListBulkUploadOpen, setLaboursListBulkUploadOpen] = useState(false);
    const openLabourBulkUploadModal = () => setLaboursListBulkUploadOpen(true);
    const closeLabourBulkUploadModal = () => setLaboursListBulkUploadOpen(false)
    const openWeeklyTypes = () => setIsWeeklyTypeOpen(true);
    const closeWeeklyTypes = () => setIsWeeklyTypeOpen(false);
    const openLabourDetails = () => setIsLaboursListDataOpen(true);
    const closeLabourDetails = () => setIsLaboursListDataOpen(false);
    const openEmployeeDetails = () => setIsEmployeeDataOpen(true);
    const closeEmployeeDetails = () => setIsEmployeeDataOpen(false);
    const [file, setFile] = useState(null);
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    const openEditWeeklyTypePopup = (item) => {
        setEditWeeklyReceivedType(item.received_type);
        setSelectedWeeklyReceivedTypeId(item.id)
        setIsEditWeeklyReceivedTypeOpen(true);
    }
    const closeEditWeeklyTypePopup = () => {
        setIsEditWeeklyReceivedTypeOpen(false);
        setEditWeeklyReceivedType('');
        setSelectedWeeklyReceivedTypeId('');
    }

    const openEditLaboursDetails = (item) => {
        setEditLabourName(item.labour_name);
        setEditLabourSalary(item.labour_salary);
        setSelectedLabourDataId(item.id);
        setIsEditLaboursListDataOpen(true);
    }
    const closeEditLaboursDetails = (item) => {
        setIsEditLaboursListDataOpen(false);
        setSelectedLabourDataId('');
        setEditLabourName('');
        setEditLabourSalary('');
    }
    const openEditEmployeeDetails = (item) => {
        setEditEmployeeName(item.employee_name);
        setEditEmployeeMobileNumber(item.employee_mobile_number);
        setEditRoleOfEmployee(item.role_of_employee);
        setSelectedEmployeeDataId(item.id);
        setIsEditEmployeeDataOpen(true);
    }
    const closeEditEmployeeDetails = (item) => {
        setIsEditEmployeeDataOpen(false);
        setSelectedEmployeeDataId('');
        setEditEmployeeName('');
        setEditEmployeeMobileNumber('');
        setEditRoleOfEmployee('');
    }

    useEffect(() => {
        fetchWeeklyType();
    }, []);
    const fetchWeeklyType = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/weekly_received_types/getAll');
            if (response.ok) {
                const data = await response.json();
                setWeeklyReceivedTypes(data);
            } else {
                setMessage('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching tile area names.');
        }
    };
    const handleDeleteAllWeeklyTypes = async () => {
        const confirmed = window.confirm("Are you sure you want to delete all Machine Tools?");
        if (confirmed) {
            try {
                const response = await fetch("https://backendaab.in/aabuildersDash/api/weekly_received_types/deleteAll", {
                    method: "DELETE",
                });
                if (response.ok) {
                    setWeeklyReceivedTypes([]);
                    alert("All Type have been deleted successfully.");
                } else {
                    console.error("Failed to delete all Types. Status:", response.status);
                    alert("Error deleting the Types. Please try again.");
                }
            } catch (error) {
                console.error("Error deleting all Types:", error);
                alert("An error occurred while deleting all Types.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };
    const handleWeeklyTypeDelete = async (id) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly_received_types/delete/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert("Weekly Type deleted successfully!!!");
                window.location.reload();
            } else {
                console.error("Failed to delete the Account Type. Status:", response.status);
                alert("Error deleting the Account Type. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while deleting the Contractor Name.");
        }
    };
    const handleSubmitWeeklyTypes = async (e) => {
        e.preventDefault();
        const newWeeklyType = { received_type: weeklyReceivedType };
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/weekly_received_types/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newWeeklyType),
            });
            if (response.ok) {
                setMessage('Weekly Type saved successfully!');
                setWeeklyReceivedType('');
                window.location.reload();
            } else {
                setMessage('Error saving area name.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error saving area name.');
        }
    };
    const handleEditWeeklyTypes = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly_received_types/edit/${selectedWeeklyReceivedTypeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ received_type: editWeeklyReceivedType }),
            });
            if (response.ok) {
                closeEditWeeklyTypePopup();
                window.location.reload();
            } else {
                console.error('Failed to update floor name');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchLaboursList();
    }, []);
    const fetchLaboursList = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/labours-details/getAll');
            if (response.ok) {
                const data = await response.json();
                setLaboursList(data);
            } else {
                setMessage('Error fetching Labour names.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching Labour names.');
        }
    };
    useEffect(() => {
        fetchEmployeeList();
    }, []);
    const fetchEmployeeList = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/getAll');
            if (response.ok) {
                const data = await response.json();
                setEmployeeList(data);
            } else {
                setMessage('Error fetching Employee names.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching Employee names.');
        }
    };
    const handleDeleteAllLaboursList = async () => {
        const confirmed = window.confirm("Are you sure you want to delete all Labours List?");
        if (confirmed) {
            try {
                const response = await fetch("https://backendaab.in/aabuildersDash/api/labours-details/deleteAll", {
                    method: "DELETE",
                });
                if (response.ok) {
                    setLaboursList([]);
                    alert("All Type have been deleted successfully.");
                } else {
                    console.error("Failed to delete all Types. Status:", response.status);
                    alert("Error deleting the Types. Please try again.");
                }
            } catch (error) {
                console.error("Error deleting all Types:", error);
                alert("An error occurred while deleting all Types.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };
    const handleDeleteAllEmployeeDetails = async () => {
        const confirmed = window.confirm("Are you sure you want to delete all Labours List?");
        if (confirmed) {
            try {
                const response = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/deleteAll", {
                    method: "DELETE",
                });
                if (response.ok) {
                    setEmployeeList([]);
                    alert("All Type have been deleted successfully.");
                } else {
                    console.error("Failed to delete all Types. Status:", response.status);
                    alert("Error deleting the Types. Please try again.");
                }
            } catch (error) {
                console.error("Error deleting all Types:", error);
                alert("An error occurred while deleting all Types.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };
    const handleLabourDataDelete = async (id) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/labours-details/delete/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert("Weekly Type deleted successfully!!!");
                window.location.reload();
            } else {
                console.error("Failed to delete the Account Type. Status:", response.status);
                alert("Error deleting the Account Type. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while deleting the Contractor Name.");
        }
    };
    const handleEmployeeDataDelete = async (id) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/employee_details/delete/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert("Employee Details deleted successfully!!!");
                window.location.reload();
            } else {
                console.error("Failed to delete the Employee Details. Status:", response.status);
                alert("Error deleting the Employee Details. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while deleting the Contractor Name.");
        }
    };
    const handleSubmitLaboursData = async (e) => {
        e.preventDefault();
        const newLaboursList = { labour_name: labourName, labour_salary: labourSalary };
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/labours-details/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newLaboursList),
            });
            if (response.ok) {
                setMessage('Labours Details saved successfully!');
                setLabourName('');
                setLabourSalary('');
                window.location.reload();
            } else {
                setMessage('Error saving area name.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error saving area name.');
        }
    };
    const handleSubmitEmployeeData = async (e) => {
        e.preventDefault();
        const newEmployeeList = { employee_name: employeeName, employee_mobile_number: mobileNumber, role_of_employee: roleOfEmployee };
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEmployeeList),
            });
            if (response.ok) {
                setMessage('Employee Details saved successfully!');
                setEmployeeName('');
                setMobileNumber('');
                setRoleOfEmployee('');
                window.location.reload();
            } else {
                setMessage('Error saving area name.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error saving area name.');
        }
    };
    const handleEditLabourData = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/labours-details/edit/${selectedLabourDataId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ labour_name: editLabourName, labour_salary: editLabourSalary }),
            });
            if (response.ok) {
                closeEditLaboursDetails();
                window.location.reload();
            } else {
                console.error('Failed to update floor name');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleEditEmployeeData = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/employee_details/edit/${selectedEmployeeDataId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ employee_name: editEmployeeName, employee_mobile_number: editEmployeeMobileNumber, role_of_employee: editRoleOfEmployee }),
            });
            if (response.ok) {
                closeEditLaboursDetails();
                window.location.reload();
            } else {
                console.error('Failed to update floor name');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleUploadLaboursList = async () => {
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        try {
            const response = await fetch("https://backendaab.in/aabuildersDash/api/labours-details/bulk_upload", {
                method: "POST",
                body: formData,
            });
            const result = await response.text();
            alert(result);
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("File upload failed!");
        }
        window.location.reload();
    };

    const filteredWeeklyReceivedType = weeklyReceivedTypes.filter((item) =>
        item.received_type.toLowerCase().includes(weeklyReceivedTypeSearch.toLowerCase())
    );
    const filteredLaboursData = laboursList.filter((item) =>
        item.labour_name.toLowerCase().includes(laboursListSearch.toLowerCase())
    );
    const filteredEmployeeData = employeeList.filter((item) =>
        item.employee_name.toLowerCase().includes(employeeSearch.toLowerCase())
    );
    return (
        <div className="p-4 bg-white ml-6 mr-8">
            <div className=" lg:flex space-x-[2%] lg:w-full md:w-[32rem] w-[20rem] overflow-x-auto">
                <div>
                    <div className="flex items-center mb-2 lg:mt-0 mt-3 ">
                        <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                            placeholder="Search Weekly type.."
                            value={weeklyReceivedTypeSearch}
                            onChange={(e) => setWeeklyReceivedTypeSearch(e.target.value)}
                        />
                        <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                            <img src={search} alt='search' className=' w-5 h-5' />
                        </button>
                        <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                            onClick={openWeeklyTypes}>
                            + Add
                        </button>
                    </div>
                    <button className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
                    <button onClick={handleDeleteAllWeeklyTypes}>
                        <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[15rem]' />
                    </button>
                    <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                        <div className="bg-[#FAF6ED]">
                            <table className="table-auto lg:w-72 ">
                                <thead className='bg-[#FAF6ED]'>
                                    <tr className="border-b">
                                        <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                                        <th className="p-2 text-left lg:w-72 text-xl font-bold">Type</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <table className="table-auto lg:w-72 w-full">
                                <tbody>
                                    {filteredWeeklyReceivedType.map((item, index) => (
                                        <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                                            <td className="p-2 text-left font-semibold">{(weeklyReceivedTypes.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                                            <td className="p-2 text-left group flex font-semibold">
                                                <div className="flex flex-grow">
                                                    {item.received_type}
                                                </div>
                                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                                                    <button type="button" >
                                                        <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditWeeklyTypePopup(item)} />
                                                    </button>
                                                    <button >
                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleWeeklyTypeDelete(item.id)} />
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
                <div>
                    <div className="flex items-center mb-2 lg:mt-0 mt-3 ">
                        <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                            placeholder="Search Weekly type.."
                            value={laboursListSearch}
                            onChange={(e) => setLaboursListSearch(e.target.value)}
                        />
                        <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                            <img src={search} alt='search' className=' w-5 h-5' />
                        </button>
                        <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                            onClick={openLabourDetails}>
                            + Add
                        </button>
                    </div>
                    <div onClick={openLabourBulkUploadModal}>
                        <button className="text-[#E4572E] -mb-4 flex cursor-pointer">
                            <img
                                src={imports}
                                alt="import"
                                className="w-6 h-5 bg-transparent pr-2 mt-1 cursor-pointer"
                            />
                            <h1 className="mt-1.5 text-sm cursor-pointer">Import file</h1>
                        </button>
                    </div>
                    <button onClick={handleDeleteAllLaboursList}>
                        <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[15rem]' />
                    </button>
                    <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                        <div className="bg-[#FAF6ED]">
                            <table className="table-auto lg:w-72 ">
                                <thead className='bg-[#FAF6ED]'>
                                    <tr className="border-b">
                                        <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                                        <th className="p-2 text-left lg:w-72 text-xl font-bold">Labour Name</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <table className="table-auto lg:w-72 w-full">
                                <tbody>
                                    {filteredLaboursData.map((item, index) => (
                                        <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                                            <td className="p-2 text-left font-semibold">{(laboursList.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                                            <td className="p-2 text-left group flex font-semibold">
                                                <div className="flex flex-grow">
                                                    {item.labour_name}
                                                </div>
                                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                                                    <button type="button" >
                                                        <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditLaboursDetails(item)} />
                                                    </button>
                                                    <button >
                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleLabourDataDelete(item.id)} />
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
                <div>
                    <div className="flex items-center mb-2 lg:mt-0 mt-3 ">
                        <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                            placeholder="Search Weekly type.."
                            value={employeeSearch}
                            onChange={(e) => setEmployeeSearch(e.target.value)}
                        />
                        <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                            <img src={search} alt='search' className=' w-5 h-5' />
                        </button>
                        <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
                            onClick={openEmployeeDetails}>
                            + Add
                        </button>
                    </div>
                    <div >
                        <button className="text-[#E4572E] -mb-4 flex cursor-pointer">
                            <img
                                src={imports}
                                alt="import"
                                className="w-6 h-5 bg-transparent pr-2 mt-1 cursor-pointer"
                            />
                            <h1 className="mt-1.5 text-sm cursor-pointer">Import file</h1>
                        </button>
                    </div>
                    <button onClick={handleDeleteAllEmployeeDetails}>
                        <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[15rem]' />
                    </button>
                    <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
                        <div className="bg-[#FAF6ED]">
                            <table className="table-auto lg:w-72 ">
                                <thead className='bg-[#FAF6ED]'>
                                    <tr className="border-b">
                                        <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                                        <th className="p-2 text-left lg:w-72 text-xl font-bold">Employee Name</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <table className="table-auto lg:w-72 w-full">
                                <tbody>
                                    {filteredEmployeeData.map((item, index) => (
                                        <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                                            <td className="p-2 text-left font-semibold">{(employeeList.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                                            <td className="p-2 text-left group flex font-semibold">
                                                <div className="flex flex-grow">
                                                    {item.employee_name}
                                                </div>
                                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                                                    <button type="button" >
                                                        <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditEmployeeDetails(item)} />
                                                    </button>
                                                    <button >
                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleEmployeeDataDelete(item.id)} />
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
            {isWeeklyTypeOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
                    <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeWeeklyTypes}>
                                <img src={cross} alt='cross' className='w-5 h-5' />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitWeeklyTypes}>
                            <div className="mb-4">
                                <label className="block text-lg font-medium mb-2 -ml-60">Type</label>
                                <input
                                    type="text"
                                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                                    placeholder="Enter Type"
                                    onChange={(e) => setWeeklyReceivedType(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex space-x-2 mt-4 ml-12">
                                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                                    Submit
                                </button>
                                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeWeeklyTypes}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isLaboursListDataOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
                    <div className="bg-white rounded-md w-[30rem] h-80 px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeLabourDetails}>
                                <img src={cross} alt='cross' className='w-5 h-5' />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitLaboursData}>
                            <div className=''>
                                <div className="mb-4">
                                    <label className="block text-lg font-medium mb-2 -ml-64">Labour Name</label>
                                    <input
                                        type="text"
                                        className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                                        placeholder="Enter Name"
                                        onChange={(e) => setLabourName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-lg font-medium mb-2 -ml-80">Salary</label>
                                    <input
                                        type="number"
                                        className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                                        placeholder="Enter Salary"
                                        onChange={(e) => setLabourSalary(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-2 mt-4 ml-12">
                                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                                    Submit
                                </button>
                                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeLabourDetails}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isEmployeeDataOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
                    <div className="bg-white rounded-md w-[30rem] px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeEmployeeDetails}>
                                <img src={cross} alt='cross' className='w-5 h-5' />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitEmployeeData}>
                            <div className=''>
                                <div className="mb-4">
                                    <label className="block text-lg font-medium mb-2 -ml-64">Employee Name</label>
                                    <input
                                        type="text"
                                        className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                                        placeholder="Enter Name"
                                        onChange={(e) => setEmployeeName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-lg font-medium mb-2 -ml-80">Mobile Number</label>
                                    <input
                                        type="text"
                                        className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                                        placeholder="Enter Mobile Number"
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-lg font-medium mb-2 -ml-80">Role</label>
                                    <input
                                        type="text"
                                        className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                                        placeholder="Enter Role"
                                        onChange={(e) => setRoleOfEmployee(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-2 mt-4 ml-12">
                                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                                    Submit
                                </button>
                                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeEmployeeDetails}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isEditWeeklyReceivedTypeOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
                    <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeEditWeeklyTypePopup}>
                                <img src={cross} alt='close' className='w-5 h-5' />
                            </button>
                        </div>
                        <form onSubmit={handleEditWeeklyTypes}>
                            <div className="mb-4">
                                <label className="block text-lg font-medium mb-2 -ml-[15rem]">Type</label>
                                <input
                                    type="text"
                                    value={editWeeklyReceivedType}
                                    className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                                    placeholder="Enter Account Type"
                                    onChange={(e) => setEditWeeklyReceivedType(e.target.value)}
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
                                    onClick={closeEditWeeklyTypePopup}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isEditLaboursListDataOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
                    <div className="bg-white rounded-md w-[30rem] h-80 px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeEditLaboursDetails}>
                                <img src={cross} alt='close' className='w-5 h-5' />
                            </button>
                        </div>
                        <form onSubmit={handleEditLabourData}>
                            <div>
                                <div>
                                    <label className="block text-lg font-medium mb-2 -ml-[15rem]">Labour Name</label>
                                    <input
                                        type="text"
                                        value={editLabourName}
                                        className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                                        placeholder="Enter Labour Name"
                                        onChange={(e) => setEditLabourName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-lg font-medium mb-2 -ml-[19rem]">Salary</label>
                                    <input
                                        type="number"
                                        value={editLabourSalary}
                                        className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                                        placeholder="Enter Salary"
                                        onChange={(e) => setEditLabourSalary(e.target.value)}
                                        required
                                    />
                                </div>
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
                                    onClick={closeEditLaboursDetails}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isEditEmployeeDataOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
                    <div className="bg-white rounded-md w-[30rem] px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeEditEmployeeDetails}>
                                <img src={cross} alt='close' className='w-5 h-5' />
                            </button>
                        </div>
                        <form onSubmit={handleEditEmployeeData}>
                            <div>
                                <div>
                                    <label className="block text-lg font-medium mb-2 -ml-[15rem]">Employee Name</label>
                                    <input
                                        type="text"
                                        value={editEmployeeName}
                                        className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                                        placeholder="Enter Employee Name"
                                        onChange={(e) => setEditEmployeeName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-lg font-medium mb-2 -ml-[19rem]">Moblie Number</label>
                                    <input
                                        type="text"
                                        value={editEmployeeMobileNumber}
                                        className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                                        placeholder="Enter Mobile Number"
                                        onChange={(e) => setEditEmployeeMobileNumber(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-lg font-medium mb-2 -ml-[19rem]">Role</label>
                                    <input
                                        type="text"
                                        value={editRoleOfEmployee}
                                        className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                                        placeholder="Enter Role"
                                        onChange={(e) => setEditRoleOfEmployee(e.target.value)}
                                        required
                                    />
                                </div>
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
                                    onClick={closeEditEmployeeDetails}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ModalLaboursList
                isOpen={laboursListBulkUploadOpen}
                onClose={closeLabourBulkUploadModal}
                onFileChange={handleFileChange}
                onUpload={handleUploadLaboursList}
            />
        </div>
    )
}
export default WeeklyPaymentAddInput
function ModalLaboursList({ isOpen, onClose, onFileChange, onUpload }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg text-center w-96 shadow-lg">
                <h2 className="mb-4 text-xl text-gray-800">Upload Bulk Data</h2>
                <div className="mb-5">
                    <input
                        type="file"
                        onChange={onFileChange}
                        accept=".csv, .sql"
                        className="w-full p-3 mb-4 border border-gray-300 rounded-md"
                    />
                    <div className="flex justify-between">
                        <button
                            onClick={onUpload}
                            className="px-8 py-2 bg-[#BF9853] text-white rounded-lg cursor-pointer  transition-colors"
                        >
                            Upload
                        </button>
                        <button
                            onClick={onClose}
                            className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853] transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}