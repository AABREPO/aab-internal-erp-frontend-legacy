import React, { useState, useEffect } from "react";
import Select from "react-select";
import add from '../Images/adding.png';
import deleteIcon from '../Images/Delete.svg';
import edit from '../Images/Edit.svg'
import Modal from 'react-modal';
Modal.setAppElement('#root');

const Popup = ({ isOpen, onClose, paintDetails, clientName }) => {
    if (!isOpen) return null;
    const groupedPaintDetails = (paintDetails || []).reduce((acc, item) => {
        const key = `${item.paintName}-${item.colorCode}`;
        if (!acc[key]) {
            acc[key] = { ...item, orderQty: parseFloat(item.orderQty) || 0 };
        } else {
            acc[key].orderQty += parseFloat(item.orderQty) || 0;
        }
        return acc;
    }, {});

    const mergedPaintDetails = Object.values(groupedPaintDetails);

    const totalOrderQty = mergedPaintDetails.reduce(
        (total, tile) => total + (parseFloat(tile.orderQty) || 0),
        0
    ).toFixed(2);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg max-w-3xl w-full max-h-[80vh] overflow-hidden">
                <button
                    onClick={onClose}
                    className="flex ml-[96%] text-[#E4572E] font-bold text-2xl "
                >
                    x
                </button>
                <div className="flex">
                    <h2 className="text-xl font-bold mb-2 text-[#E4572E] ml-60 -mt-5">
                        Mr. {clientName}
                    </h2>
                </div>
                <div className="overflow-x-hidden overflow-y-auto max-h-[60vh]">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-[#FAF6ED]">
                                <th className="py-2 px-4 text-left">Paint Variant</th>
                                <th className="py-2 px-4 ">Color Code</th>
                                <th className="py-2 px-4 ">Liter</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mergedPaintDetails.length > 0 ? (
                                mergedPaintDetails.map((tile, index) => (
                                    <tr key={index} className="bg-white">
                                        <td className="py-2 px-4 text-left">
                                            {tile.paintName || "N/A"}
                                        </td>
                                        <td className="py-2 px-4 ">
                                            {tile.colorCode}
                                        </td>
                                        <td className="py-2 px-4 ">
                                            {tile.orderQty ? parseFloat(tile.orderQty).toFixed(2) : "N/A"}L
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="py-2 px-4 text-center">
                                        No data available
                                    </td>
                                </tr>
                            )}
                            {mergedPaintDetails.length > 0 && (
                                <tr className="text-[#E4572E] text-xl font-semibold">
                                    <td className="py-2 px-2 text-end">Total</td>
                                    <td className="py-2 px-2 "></td>
                                    <td className="py-2 px-2 ">{totalOrderQty}L</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const BathFixtureHistory = () => {
    const [paintDetails, setPaintDetails] = useState([]);
    const [paintCalculations, setPaintCalculations] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [siteOptions, setSiteOptions] = useState([]);
    const [clientName, setClientName] = useState(null);
    const [clientSNo, setClientSNo] = useState("");
    const [fullData, setFullData] = useState([]);
    const [enoOptions, setEnoOptions] = useState([]);
    const [fileNameOptions, setFileNameOptions] = useState([]);
    const [filteredEnoOptions, setFilteredEnoOptions] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEno, setSelectedEno] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filteredFileNameOptions, setFilteredFileNameOptions] = useState([]);
    const [popupClientName, setPopupClientName] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        clientName: '',
        date: '',
        fileName: '',
    });
    useEffect(() => {
        const savedClientName = localStorage.getItem("clientName");
        const savedClientSNo = localStorage.getItem("clientSNo");
        const savedSelectedDate = localStorage.getItem("selectedDate");
        const savedSelectedEno = localStorage.getItem("selectedEno");
        const savedSelectedFile = localStorage.getItem("selectedFile");
        setClientName(savedClientName ? JSON.parse(savedClientName) : null);
        setClientSNo(savedClientSNo || null);
        setSelectedDate(savedSelectedDate || null);
        setSelectedEno(savedSelectedEno ? JSON.parse(savedSelectedEno) : null);
        setSelectedFile(savedSelectedFile ? JSON.parse(savedSelectedFile) : null);
    }, []);
    useEffect(() => {
        if (clientName !== null) localStorage.setItem("clientName", JSON.stringify(clientName));
        if (clientSNo !== null) localStorage.setItem("clientSNo", clientSNo);
        if (selectedDate !== null) localStorage.setItem("selectedDate", selectedDate);
        if (selectedEno !== null) localStorage.setItem("selectedEno", JSON.stringify(selectedEno));
        if (selectedFile !== null) localStorage.setItem("selectedFile", JSON.stringify(selectedFile));
    }, [clientName, clientSNo, selectedDate, selectedEno, selectedFile]);
    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.removeItem("clientName");
            localStorage.removeItem("clientSNo");
            localStorage.removeItem("selectedDate");
            localStorage.removeItem("selectedEno");
            localStorage.removeItem("selectedFile");
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);
    const handleDelete = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this calculation?");
        if (confirmDelete) {
            deleteCalculation(id);
        }
    };
    useEffect(() => {
        fetchPaintCalculations();
    }, []);
    const fetchPaintCalculations = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/bath_fixture_calculation/all');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setFullData(data);
            console.log(data);
        } catch (error) {
            console.error('Error fetching calculations:', error);
        }
    };
    useEffect(() => {
        const fetchSites = async () => {
            try {
                const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok: " + response.statusText);
                }
                const data = await response.json();
                const formattedData = data.map(item => ({
                    value: item.siteName,
                    label: item.siteName,
                    sNo: item.siteNo
                }));
                setSiteOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchSites();
    }, []);
    const handleSiteChange = (selectedClientName) => {
        setClientName(selectedClientName);
        if (!selectedClientName) {
            setClientSNo('');
            setFilteredEnoOptions(enoOptions);
            setFilteredFileNameOptions(fileNameOptions);
            return;
        }
        const selectedSite = siteOptions.find(site => site.value === selectedClientName.value);
        if (selectedSite) {
            setClientSNo(selectedSite.sNo);
        }
        const filteredEnos = enoOptions.filter(eno =>
            fullData.some(row => row.clientName === selectedClientName.value && row.eno === eno.value)
        );
        const filteredFiles = fileNameOptions.filter(file =>
            fullData.some(row => row.clientName === selectedClientName.value && row.fileName === file.value)
        );
        setFilteredEnoOptions(filteredEnos);
        setFilteredFileNameOptions(filteredFiles);
    };
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: "transparent",
            borderColor: state.isFocused ? "#FAF6ED" : "transparent",
            "&:hover": {
                borderColor: "#FAF6ED",
            },
            boxShadow: state.isFocused ? "0 0 0 1px #FAF6ED" : "none",
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: '#000',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
    };
    const formatDates = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        setFormData({ ...formData, date: selectedDate });
    };
    const handleSelectChange = (selectedOption) => {
        setFormData(prevState => ({
            ...prevState,
            clientName: selectedOption ? selectedOption.value : ''
        }));
    };
    const viewClosePopup = () => {
        setIsPopupOpen(false)
    }
    const handleViewClick = (item) => {
        const details = fetchTileDetails(item);
        setPaintDetails(details);
        setPopupClientName(item.clientName);
        setIsPopupOpen(true);
    };
    const fetchTileDetails = (item) => {
        return item.paintCalculations.reduce((acc, paintCalculation) => {
            return acc.concat(paintCalculation.paintTiles.map(tile => ({
                paintName: tile.selectedPaint,
                colorCode: tile.selectedColorCode,
                orderQty: tile.orderQty,
            })));
        }, []);
    };
    const parseBackendDate = (date) => {
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day}`;
    };
    const filteredData = fullData.filter((row) => {
        const enoMatches = selectedEno ? row.eno === selectedEno.value : true;
        const clientNameMatches = clientName ? row.clientName === clientName.value : true;
        const fileMatches = selectedFile ? row.fileName === selectedFile.value : true;
        const dateMatches = selectedDate
            ? row.date === formatDates(selectedDate)
            : true;
        console.log(dateMatches);
        return enoMatches && clientNameMatches && fileMatches && dateMatches;
    });
    const deleteCalculation = async (id) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuilderDash/api/bath_fixture_calculation/delete/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert("Calculation deleted successfully");
                window.location.reload();
            } else {
                const error = await response.text();
                alert(error);
            }
        } catch (error) {
            console.error('Error deleting calculation:', error);
            alert("An error occurred while deleting the calculation.");
        }
    };
    const handleEditClick = (row) => {
        setFormData({
            id: row.id,
            clientName: row.clientName,
            date: parseBackendDate(row.date),
            fileName: row.fileName,
        });
        setModalIsOpen(true);
    };
    const handleSave = async () => {
        const formattedDate = formatDates(formData.date);
        try {
            const response = await fetch(`https://backendaab.in/aabuilderDash/api/bath_fixture_calculation/edit/${formData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientName: formData.clientName,
                    date: formattedDate,
                    fileName: formData.fileName,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to update data: ${errorData.message || 'Unknown error'}`);
            }
            alert('Data updated successfully');
            setModalIsOpen(false);
            fetchPaintCalculations();
        } catch (error) {
            console.error('Error updating data:', error);
            alert(`Error updating data: ${error.message}`);
        }
    };
    const sortedSiteOptions = siteOptions.sort((a, b) =>
        a.label.localeCompare(b.label)
    );
    return (
        <div>
            <div className=" mx-auto p-6 border-collapse bg-[#FFFFFF] ml-6 mr-6 rounded-md">
                <div className=" flex">
                    <div className=" flex">
                        <div className="flex">
                            <div className="w-full -mt-8 mb-4">
                                <h4 className=" mt-10 font-bold mb-2 -ml-[70%]">Project Name </h4>
                                <Select
                                    value={clientName}
                                    onChange={handleSiteChange}
                                    options={sortedSiteOptions}
                                    placeholder="Select Site Name..."
                                    className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg w-80 h-12 text-left"
                                    styles={customSelectStyles}
                                    isClearable
                                />
                            </div>
                            <div>
                                <h4 className=" font-bold -mb-8 mt-2">P.ID</h4>
                                <input
                                    type="text"
                                    value={clientSNo}
                                    readOnly
                                    className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg h-12 w-16 mt-10 ml-1 bg-transparent text-center"
                                />
                            </div>
                        </div>
                    </div>
                    <div className=" ml-6 mt-2">
                        <h4 className=" font-bold mb-2 -ml-32">Date </h4>
                        <input
                            type="date"
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] w-44 rounded-lg px-4 py-2 h-12"
                        />
                    </div>
                    <div className="ml-4">
                        <h4 className="mt-1.5 font-bold -ml-20"> E No</h4>
                        <Select
                            className="w-36 mt-2 border border-[#FAF6ED] text-left border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg h-12"
                            options={filteredEnoOptions}
                            value={selectedEno}
                            onChange={setSelectedEno}
                            styles={customSelectStyles}
                            isClearable
                        />
                    </div>
                    <div className="ml-6">
                        <h4 className="mt-1.5 font-bold mb-2 -ml-32">Revision</h4>
                        <Select
                            placeholder="Select the file..."
                            className="border border-[#FAF6ED] text-left border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg w-60 h-12"
                            styles={customSelectStyles}
                            options={filteredFileNameOptions}
                            isClearable
                            value={selectedFile}
                            onChange={setSelectedFile}
                            isDisabled={!clientName}
                        />
                    </div>
                </div>
            </div>
            <div className="mt-6 bg-[#FFFFFF] ml-6 mr-6 p-6">
                <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                    <table className="min-w-full">
                        <thead className="bg-[#FAF6ED]">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold">Sl.No</th>
                                <th className="px-4 py-2 text-left font-semibold">Date</th>
                                <th className="px-4 py-2 text-left font-semibold">Project Name</th>
                                <th className="px-4 py-2 text-left font-semibold">E. No</th>
                                <th className="px-4 py-2 text-left font-semibold">BFM Revision</th>
                                <th className="px-4 py-2 text-left font-semibold">Total Items</th>
                                <th className="px-4 py-2 text-left font-semibold">Amount</th>
                                <th className="px-4 py-2 text-left font-semibold">File</th>
                                <th className="px-4 py-2 text-left font-semibold">Print</th>
                                <th className="px-4 py-2 text-left font-semibold">Activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData
                                .slice()
                                .reverse()
                                .map((item, index) => {
                                    // Flatten all bathFixtureTables into a single array
                                    const allFixtures = item.bathFixtureCalculations?.flatMap(calc => calc.bathFixtureTables || []) || [];

                                    const totalQty = allFixtures.reduce((sum, fixture) => sum + Number(fixture.quantity || 0), 0);
                                    const totalPrice = allFixtures.reduce((sum, fixture) => sum + Number(fixture.overAllPrice || 0), 0);

                                    return (
                                        <tr key={index} className={index % 2 === 0 ? "odd:bg-white" : "even:bg-[#FAF6ED]"}>
                                            <td className="py-2 px-4 font-semibold text-left">{index + 1}</td>
                                            <td className="px-4 py-2 text-left font-semibold">{item.date}</td>
                                            <td className="px-4 py-2 text-left font-semibold">{item.clientName}</td>
                                            <td className="px-4 py-2 text-left font-semibold">{item.eno}</td>
                                            <td className="px-4 py-2 text-left font-semibold">{item.fileName}</td>
                                            <td className="px-4 py-2 text-left font-semibold">{totalQty}</td>
                                            <td className="px-4 py-2 text-left font-semibold">₹{totalPrice.toFixed(2)}</td>

                                            <td className="px-4 py-2 text-left font-semibold text-red-500 underline">
                                                <button
                                                    className="text-[#E4572E] py-1 px-2 rounded transition duration-200 underline font-semibold text-left -ml-2"
                                                    
                                                >
                                                    View
                                                </button>
                                            </td>
                                            <td className="px-4 py-2 text-left">🖨️</td>
                                            <td className="px-4 py-2 text-left flex">
                                                <button>
                                                    <img
                                                        src={edit}
                                                        alt="edit"
                                                        className="w-5 h-5"
                                                        onClick={() => handleEditClick(item)}
                                                    />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)}>
                                                    <img src={deleteIcon} alt="delete" className="ml-8 w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                    <Popup
                        isOpen={isPopupOpen}
                        onClose={viewClosePopup}
                        paintDetails={paintDetails}
                        clientName={popupClientName}
                    />
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={() => setModalIsOpen(false)}
                        contentLabel="Edit Data"
                        className="fixed inset-0 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50"
                        overlayClassName="fixed inset-0"
                    >
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-72 max-h-[70vh] overflow-y-auto sm:w-11/12 sm:max-w-xl">
                            <h2 className="text-xl font-bold mb-4">Edit Client Details</h2>
                            <form>
                                <div className="mb-4">
                                    <label htmlFor="clientName" className="block text-gray-700 -ml-[27rem]">Client Name</label>
                                    <Select
                                        name="clientName"
                                        value={siteOptions.find(option => option.value === formData.clientName)}
                                        onChange={handleSelectChange}
                                        options={siteOptions}
                                        className="mt-1 block w-96 border border-[#FAF6ED] text-left border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg"
                                        isSearchable={true}
                                        styles={customSelectStyles}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="date" className="block text-gray-700 -ml-[30rem]">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleDateChange}
                                        className="mt-1 block w-40 p-2 border border-[#FAF6ED] text-left border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="fileName" className="block text-gray-700 -ml-[28rem]">File Name</label>
                                    <input
                                        type="text"
                                        name="fileName"
                                        value={formData.fileName}
                                        onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                                        className="mt-1 block w-52 p-2 border border-[#FAF6ED] text-left border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg"
                                    />
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setModalIsOpen(false)}
                                        className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="bg-[#BF9853] text-white px-8 py-2 rounded-lg font-semibold"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Modal>
                </div>
            </div>
        </div>
    )
}
export default BathFixtureHistory;