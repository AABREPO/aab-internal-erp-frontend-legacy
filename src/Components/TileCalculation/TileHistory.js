import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import deleteIcon from '../Images/Delete.svg';
import edit from '../Images/Edit.svg';
import Modal from 'react-modal';
Modal.setAppElement('#root');
const Popup = ({ isOpen, onClose, tileDetails, clientName }) => {
  if (!isOpen) return null;

  const totalNoOfBoxes = parseFloat(
    tileDetails.reduce((total, tile) => total + (parseFloat(tile.noOfBoxes) || 0), 0)
  ).toFixed(2);

  const totalArea = parseFloat(
    tileDetails.reduce((total, tile) => total + (parseFloat(tile.totalOrderedTile) || 0), 0)
  ).toFixed(2);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg max-w-3xl lg:w-full max-h-[80vh] overflow-hidden">
        <button
          onClick={onClose}
          className="flex lg:ml-[96%] md:ml-[97%] ml-[98%] text-[#E4572E] font-bold text-2xl md:-mt-4 lg:mt-0 -mt-6"
        >
          x
        </button>
        <div className="flex">
          <h2 className="text-xl font-bold mb-2 text-[#E4572E] ml-0 lg:ml-60 md:-mt-5 mt-1">
            Mr. {clientName}
          </h2>
        </div>
        <div className="overflow-x-hidden overflow-y-auto max-h-[60vh]">
          <table className="lg:min-w-full md:min-w-[520px]">
            <thead>
              <tr className="bg-[#FAF6ED]">
                <th className="py-2 px-4 text-left">Tile Name</th>
                <th className="py-2 px-4 ">No of Boxes</th>
                <th className="py-2 px-4 ">Total Area</th>
              </tr>
            </thead>
            <tbody>
              {tileDetails.length > 0 ? (
                tileDetails.map((tile, index) => (
                  <tr key={index} className="bg-white">
                    <td className="py-2 px-4 text-left">
                      {tile.tileName || "N/A"}
                    </td>
                    <td className="py-2 px-4 ">
                      {tile.noOfBoxes ? parseFloat(tile.noOfBoxes).toFixed(2) : "N/A"}
                    </td>
                    <td className="py-2 px-4 ">
                      {tile.totalOrderedTile ? parseFloat(tile.totalOrderedTile).toFixed(2) : "N/A"}
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
              {tileDetails.length > 0 && (
                <tr className="text-[#E4572E] text-xl font-semibold">
                  <td className="py-2 px-2 text-end">Total</td>
                  <td className="py-2 px-2 ">{totalNoOfBoxes}</td>
                  <td className="py-2 px-2 ">{totalArea}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const History = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [filteredEnoOptions, setFilteredEnoOptions] = useState([]);
  const [filteredFileNameOptions, setFilteredFileNameOptions] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [clientName, setClientName] = useState(null);
  const [siteOptions, setSiteOptions] = useState([]);
  const [fileNameOptions, setFileNameOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tileDetails, setTileDetails] = useState([]);
  const [enoOptions, setEnoOptions] = useState([]);
  const [selectedEno, setSelectedEno] = useState(null);
  const [calculations, setCalculations] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [clientSNo, setClientSNo] = useState("");
  const [popupClientName, setPopupClientName] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    date: '',
    fileName: '',
  });
  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this calculation?");
    if (confirmDelete) {
      deleteCalculation(id);
    }
  };
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
  }, []);
  const deleteCalculation = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/delete/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("Calculation deleted successfully");
        window.location.reload();
        setCalculations(calculations.filter(calculation => calculation.id !== id));
      } else {
        const error = await response.text();
        alert(error);
      }
    } catch (error) {
      console.error('Error deleting calculation:', error);
      alert("An error occurred while deleting the calculation.");
    }
  };
  const fetchCalculations = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/tile/all');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const enos = Array.from(new Set(data.map(row => row.eno).filter(Boolean)));
      const enoOptions = enos.map(eno => ({ value: eno, label: eno }));
      let tileDetails = [];
      let clientNames = new Set();
      let dates = new Set();
      let fileNames = new Set();
      data.forEach(item => {
        let totalNoOfBoxes = 0;
        let totalAreaInSqft = 0;
        if (item.clientName) clientNames.add(item.clientName);
        if (item.date) dates.add(item.date);
        if (item.fileName) fileNames.add(item.fileName);
        item.calculations.forEach(calculation => {
          calculation.tiles.forEach(tile => {
            const roundedNoOfBoxes = (parseFloat(tile.noOfBoxes) || 0).toFixed(2);
            const roundedTotalOrderedTile = (parseFloat(tile.totalOrderedTile) || 0).toFixed(2);
            tileDetails.push({
              tileName: tile.tileName,
              noOfBoxes: roundedNoOfBoxes,
              totalOrderedTile: roundedTotalOrderedTile,
            });
            totalNoOfBoxes += parseFloat(roundedNoOfBoxes) || 0;
            totalAreaInSqft += parseFloat(roundedTotalOrderedTile) || 0;
          });
        });
        item.totalNoOfBoxes = totalNoOfBoxes.toFixed(2);
        item.totalAreaInSqft = totalAreaInSqft.toFixed(2);
      });
      const fileNameOptions = Array.from(fileNames).map(name => ({
        value: name,
        label: name,
      }));
      setEnoOptions(enoOptions);
      setFileNameOptions(fileNameOptions);
      setTileDetails(tileDetails);
      setFullData(data);
    } catch (error) {
      console.error('Error fetching calculations:', error);
    }
  };
  useEffect(() => {
    fetchCalculations();
  }, []);
  const viewClosePopup = () => {
    setIsPopupOpen(false)
  }
  const handleViewClick = (row) => {
    const details = fetchTileDetails(row);
    setTileDetails(details);
    setPopupClientName(row.clientName);
    setIsPopupOpen(true);
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
  const fetchTileDetails = (row) => {
    return row.calculations.reduce((acc, calculation) => {
      return acc.concat(calculation.tiles.map(tile => ({
        tileName: tile.tileName,
        noOfBoxes: tile.noOfBoxes,
        totalOrderedTile: tile.totalOrderedTile,
      })));
    }, []);
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
  const handleSave = async () => {
    console.log('Form Data before Save:', formData);
    const formattedDate = formatDates(formData.date);
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/update/${formData.id}`, {
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
      fetchCalculations();
    } catch (error) {
      console.error('Error updating data:', error);
      alert(`Error updating data: ${error.message}`);
    }
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
    return enoMatches && clientNameMatches && fileMatches && dateMatches;
  });
  const sortedSiteOptions = siteOptions.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  return (
    <body>
      <div>
        <div className=" mx-auto p-6 border-collapse bg-[#FFFFFF] ml-6 mr-6">
          <div className=" lg:flex ">
            <div className=" flex">
              <div className="w-full -mt-8 mb-4 -ml-5 md:ml-0 text-left">
                <h4 className=" mt-10 font-bold mb-2">Project Name </h4>
                <Select
                  value={clientName}
                  onChange={handleSiteChange}
                  options={sortedSiteOptions}
                  placeholder="Select Site Name..."
                  className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg w-[17.5rem] md:w-[34rem] lg:w-80 h-12 text-left"
                  styles={customSelectStyles}
                  isClearable
                />
              </div>
              <div className=" text-left lg:ml-0 md:-ml-[110px]">
                <h4 className=" font-bold -mb-8 mt-2">P.ID</h4>
                <input
                  type="text"
                  value={clientSNo}
                  readOnly
                  className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg h-12 w-14 lg:w-16 mt-10 ml-1 bg-transparent text-center"
                />
              </div>
            </div>
            <div className="md:grid md:grid-cols-3 md:gap-2 grid grid-cols-2 md:-mt-4 lg:mt-0">
              <div className="-ml-5 md:ml-2 md:mt-2 -mt-2 text-left">
                <h4 className=" font-bold mb-2 ">Date </h4>
                <input
                  type="date"
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] w-44 rounded-lg px-4 py-2 h-12"
                />
              </div>
              <div className="text-left ml-4 lg:ml-0 [@media(min-width:450px)]:-ml-4 md:-ml-10 md:mt-0 -mt-3.5">
                <h4 className="mt-1.5 font-bold "> E No</h4>
                <Select
                  className="w-36 mt-2 border border-[#FAF6ED] text-left border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg h-12"
                  options={filteredEnoOptions}
                  value={selectedEno}
                  onChange={setSelectedEno}
                  styles={customSelectStyles}
                  isClearable
                />
              </div>
              <div className="text-left lg:-ml-10 md:-ml-20 -ml-5">
                <h4 className="mt-1.5 font-bold mb-2 ">Revision</h4>
                <Select
                  placeholder="Select the file..."
                  className="border border-[#FAF6ED] text-left border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg w-72 md:w-60 h-12"
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
        </div>
        <div className={`p-6 bg-[#FFFFFF] mt-6 ml-6 mr-6 `} >
          <div
            ref={scrollRef}
            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[620px] overflow-scroll select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}>
            <table className="table-auto min-w-[1765px] w-screen">
              <thead>
                <tr className="bg-[#FAF6ED]">
                  <th className="py-2 px-4 font-bold text-left">Sl.No</th>
                  <th className="py-2 px-4 font-bold text-left">Date</th>
                  <th className="py-2 px-4 font-bold text-left">Site Name</th>
                  <th className="py-2 px-4 font-bold text-left">E.No</th>
                  <th className="py-2 px-4 font-bold text-left">TMS Variant</th>
                  <th className="py-2 px-4 font-bold text-left">No of Boxes</th>
                  <th className="py-2 px-4 font-bold text-left">Total Sqft</th>
                  <th className="py-2 px-4 font-bold text-left">File</th>
                  <th className="py-2 px-4 font-bold text-left">Activity</th>
                </tr>
              </thead>
              <tbody>
                {filteredData
                  .slice()
                  .reverse()
                  .map((row, index) => (
                    <tr key={row.id} className="odd:bg-white even:bg-[#FAF6ED]">
                      <td className="py-2 px-4 font-semibold text-left">{index + 1}</td>
                      <td className="py-2 px-4 font-semibold text-left">{row.date}</td>
                      <td className="py-2 px-4 font-semibold text-left">{row.clientName}</td>
                      <td className="py-2 px-4 font-semibold text-left">{row.eno}</td>
                      <td className="py-2 px-4 font-semibold text-left">{row.fileName}</td>
                      <td className="py-2 px-4 font-semibold text-left">{row.totalNoOfBoxes}</td>
                      <td className="py-2 px-4 font-semibold text-left">{row.totalAreaInSqft}</td>
                      <td className="py-2 px-4 font-semibold text-left">
                        <button
                          className="text-[#E4572E] py-1 px-2 rounded transition duration-200 underline font-semibold text-left -ml-2"
                          onClick={() => handleViewClick(row)}
                        >
                          View
                        </button>
                      </td>
                      <td className="py-2 px-4 font-semibold text-left">
                        <button>
                          <img
                            src={edit}
                            alt="edit"
                            className="w-5 h-5"
                            onClick={() => handleEditClick(row)}
                          />
                        </button>
                        <button onClick={() => handleDelete(row.id)}>
                          <img src={deleteIcon} alt="delete" className="ml-8 w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <Popup
              isOpen={isPopupOpen}
              onClose={viewClosePopup}
              tileDetails={tileDetails}
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
                      onClick={handleSave}
                      className="bg-[#BF9853] text-white px-8 py-2 rounded-lg font-semibold"
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
    </body>
  );
};
export default History