import React, { useState, useEffect, useRef } from 'react';
import remove from '../Images/Delete.svg';
import axios from 'axios';
import FileUpload from '../Images/file.png';
const Tenant = () => {
  const [fullAgreementData, setFullAgreementData] = useState([]);
  const [message, setMessage] = useState('');
  const [tenantList, setTenantList] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgreementFile, setSelectedAgreementFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTenantName, setSelectedTenantName] = useState("");
  const [selectedPropertyName, setSelectedPropertyName] = useState("");
  const [selectedDoorNo, setSelectedDoorNo] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [tenantSearchTerm, setTenantSearchTerm] = useState('');
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  const sortedData = [...fullAgreementData].sort((a, b) => {
    const getValue = (obj) => {
      switch (sortConfig.key) {
        case 'shopNos':
          return obj.propertyTypeDetails.map(p => p.shopNos).join(', ');
        case 'propertyName':
          return obj.propertyName;
        case 'doorNo':
          return obj.propertyTypeDetails.map(p => p.doorNo).join(', ');
        case 'tenantName':
          return obj.agreementTenantNames?.[0]?.tenantName || '';
        case 'agreementDate':
          return obj.timestamp || '';
        default:
          return '';
      }
    };
    const aValue = getValue(a).toString().toLowerCase();
    const bValue = getValue(b).toString().toLowerCase();
    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });
  const filteredAgreements = sortedData.filter((agreement) => {
    if (!tenantSearchTerm.trim()) return true;
    const tenantName = agreement.agreementTenantNames?.[0]?.tenantName || '';
    return tenantName.toLowerCase().includes(tenantSearchTerm.trim().toLowerCase());
  });
  console.log(message);
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
    fetchAgreements();
  }, []);
  const fetchAgreements = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/agreements/all');
      if (response.ok) {
        const data = await response.json();
        setFullAgreementData(data);
      } else {
        setMessage('Error fetching agreements.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching agreements.');
    }
  };
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await axios.get('https://backendaab.in/aabuildersDash/api/tenant-groups/all');
        const updatedTenants = response.data.map((tenant) => {
          if (tenant.aadhaarFile) {
            return {
              ...tenant,
              aadhaarImageUrl: `data:image/jpeg;base64,${tenant.aadhaarFile}`,
            };
          }
          return tenant;
        });
        setTenantList(updatedTenants);
      } catch (error) {
        console.error('Error fetching tenants:', error);
      }
    };
    fetchTenants();
  }, []);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAgreementFile(file);
    }
    e.target.value = '';
  };
  const handleTenantClick = (aadhaarFile) => {
    const blob = new Blob([Uint8Array.from(atob(aadhaarFile), c => c.charCodeAt(0))], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);
    setSelectedPdf(pdfUrl);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPdf(null);
  };
  const openUploadModal = (id, propertyName, tenantName, doorNo) => {
    setSelectedId(id);
    setSelectedDoorNo(doorNo);
    setSelectedPropertyName(propertyName);
    setSelectedTenantName(tenantName);
    setShowModal(true);
  };
  const closeModals = () => {
    setShowModal(false);
    setSelectedAgreementFile(null);
    setSelectedDoorNo('');
    setSelectedPropertyName('');
    setSelectedTenantName('');
  };
  const handleUpdate = async () => {
    let confirmedAgreementUrl = "";
    const filename = `${selectedPropertyName}_${selectedDoorNo}_${selectedTenantName}`;
    const formData = new FormData();
    formData.append("file", selectedAgreementFile);
    formData.append("file_name", filename);
    const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/agreement/googleUploader/uploadToGoogleDrive", {
      method: "POST",
      body: formData,
    });
    if (!uploadResponse.ok) throw new Error("PDF upload failed");
    const uploadResult = await uploadResponse.json();
    confirmedAgreementUrl = uploadResult.url;
    try {
      const res = await fetch(`https://backendaab.in/aabuildersDash/api/agreements/updateConfirmedUrl/${selectedId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmedAgreementUrl: confirmedAgreementUrl }),
      });
      if (!res.ok) {
        throw new Error("Failed to update URL");
      }
      window.location.reload();
    } catch (err) {
      console.error(err.message);
    }
  };
  const deleteAgreement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agreement?")) {
      return;
    }
    try {
      await axios.delete(`https://backendaab.in/aabuildersDash/api/agreements/delete/${id}`);
      alert("Agreement deleted successfully!");
      fetchAgreements();
    } catch (error) {
      console.error("Error deleting agreement:", error);
      alert("Failed to delete agreement");
    }
  };
  const formatDateOnly = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  return (
    <div className="px-4 py-6 md:px-6 md:py-6 bg-white h-[750px] md:ml-6 lg:ml-6 md:mr-6 lg:mr-12">
      <div className="p-0 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-4">
          <div className="text-lg font-semibold text-gray-800">Tenant Agreements</div>
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search......"
              value={tenantSearchTerm}
              onChange={(e) => setTenantSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2 border rounded-full shadow-md focus:outline-none w-full text-sm"
            />
            <span className="absolute right-3 top-2.5 text-gray-500"></span>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] max-h-[600px] overflow-x-auto select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <table className="hidden md:table w-full table-auto">
            <thead>
              <tr className="bg-[#FAF6ED] text-left text-sm">
                <th className="px-2 py-2 font-bold">S.No</th>
                <th onClick={() => handleSort('agreementDate')} className="px-2 py-2 font-bold cursor-pointer">
                  Agreement Date
                  {sortConfig.key === 'agreementDate' && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th className="px-2 py-2 font-bold cursor-pointer" onClick={() => handleSort('shopNos')}>
                  Shop No
                  {sortConfig.key === 'shopNos' && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('propertyName')} className="px-2 py-2 font-bold cursor-pointer">
                  Shop Name
                  {sortConfig.key === 'propertyName' && (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                </th>
                <th onClick={() => handleSort('doorNo')} className="px-2 py-2 font-bold cursor-pointer">
                  Door No
                  {sortConfig.key === 'doorNo' && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('tenantName')} className="px-2 py-2 font-bold cursor-pointer">
                  Tenant Name
                  {sortConfig.key === 'tenantName' && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th className="px-2 py-2 font-bold">Advance</th>
                <th className="px-2 py-2 font-bold">Rent</th>
                <th className="px-2 py-2 font-bold">Agreement</th>
                <th className="px-2 py-2 font-bold">Aadhaar File</th>
                <th className="px-2 py-2 font-bold">Delete</th>
                <th className="px-2 py-2 font-bold">Upload</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgreements.map((agreement, index) => {
                const tenantName = agreement.agreementTenantNames?.[0]?.tenantName || '—';
                const matchedGroup = tenantList.find(group => group.tenantName === tenantName);
                const aadhaarFile = matchedGroup?.tenantDetailsList?.[0]?.aadhaarFile;
                const shopNos = agreement.propertyTypeDetails.map((p) => p.shopNos);
                const doorNos = agreement.propertyTypeDetails.map((p) => p.doorNo);
                const totalAdvance = agreement.propertyTypeDetails.reduce((sum, p) => sum + parseFloat(p.advance || 0), 0);
                const totalRent = agreement.propertyTypeDetails.reduce((sum, p) => sum + parseFloat(p.rent || 0), 0);
                return (
                  <tr key={agreement.id} className="odd:bg-white even:bg-[#FAF6ED] text-sm">
                    <td className="py-2 px-2 font-semibold text-center">{index + 1}</td>
                    <td className='text-left'>{formatDate(agreement.timestamp)}</td>
                    <td className="py-2 px-2 text-sm font-semibold text-left">[{shopNos.join(', ')}]</td>
                    <td className="py-2 px-2 text-sm font-semibold text-left">{agreement.propertyName}</td>
                    <td className="py-2 px-2 text-sm font-semibold text-left">[{doorNos.join(', ')}]</td>
                    <td className="py-2 px-2 text-sm font-semibold text-left">{tenantName}</td>
                    <td className="py-2 px-2 text-sm font-semibold text-left">₹{totalAdvance.toLocaleString()}</td>
                    <td className="py-2 px-2 text-sm font-semibold text-left">₹{totalRent.toLocaleString()}</td>
                    <td className="py-2 pr-2 text-center">
                      {agreement.agreementUrl ? (
                        <a
                          href={agreement.agreementUrl}
                          className="text-red-500 underline font-semibold "
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-2 text-center">
                      {aadhaarFile ? (
                        <button
                          onClick={() => handleTenantClick(aadhaarFile)}
                          className="text-blue-500 underline text-sm font-medium hover:text-blue-700"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      <button>
                        <img
                          src={remove}
                          onClick={() => deleteAgreement(agreement.id)}
                          alt="delete"
                          className="w-4 h-4 transform hover:scale-110 hover:brightness-110 transition duration-200"
                        />
                      </button>
                    </td>
                    <td className="py-2 px-2 text-center flex gap-4">
                      <button onClick={() => openUploadModal(agreement.id, agreement.propertyName, tenantName, doorNos)}>
                        <img
                          src={FileUpload}
                          alt="upload"
                          className="w-4 h-4 transform hover:scale-110 hover:brightness-110 transition duration-200"
                        />
                      </button>
                      {agreement.confirmedAgreementUrl ? (
                        <a
                          href={agreement.confirmedAgreementUrl}
                          className="text-red-500 underline font-semibold"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="md:hidden flex flex-col gap-4">
            {filteredAgreements.map((agreement, index) => {
              const tenantName = agreement.agreementTenantNames?.[0]?.tenantName || '—';
              const matchedGroup = tenantList.find(group => group.tenantName === tenantName);
              const aadhaarFile = matchedGroup?.tenantDetailsList?.[0]?.aadhaarFile;
              const shopNos = agreement.propertyTypeDetails.map((p) => p.shopNos);
              const doorNos = agreement.propertyTypeDetails.map((p) => p.doorNo);
              const totalAdvance = agreement.propertyTypeDetails.reduce((sum, p) => sum + parseFloat(p.advance || 0), 0);
              const totalRent = agreement.propertyTypeDetails.reduce((sum, p) => sum + parseFloat(p.rent || 0), 0);
              return (
                <div key={agreement.id} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>#{index + 1}</span>
                    <span>{formatDate(agreement.timestamp)}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800 mb-1">{agreement.propertyName}</div>
                  <div className="text-xs text-gray-600 mb-3">{tenantName}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mb-3">
                    <div>
                      <span className="font-semibold">Shop:</span> [{shopNos.join(', ')}]
                    </div>
                    <div>
                      <span className="font-semibold">Door:</span> [{doorNos.join(', ')}]
                    </div>
                    <div>
                      <span className="font-semibold">Advance:</span> ₹{totalAdvance.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-semibold">Rent:</span> ₹{totalRent.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {agreement.agreementUrl ? (
                      <a href={agreement.agreementUrl} target="_blank" rel="noopener noreferrer" className="text-red-500 underline font-medium">
                        Agreement
                      </a>
                    ) : (
                      <span className="text-gray-400">Agreement —</span>
                    )}
                    {aadhaarFile ? (
                      <button onClick={() => handleTenantClick(aadhaarFile)} className="text-blue-500 underline font-medium">
                        Aadhaar
                      </button>
                    ) : (
                      <span className="text-gray-400">Aadhaar N/A</span>
                    )}
                    <button onClick={() => deleteAgreement(agreement.id)} className="text-red-600 font-medium">
                      Delete
                    </button>
                    <button onClick={() => openUploadModal(agreement.id, agreement.propertyName, tenantName, doorNos)} className="text-[#BF9853] font-medium flex items-center gap-1">
                      <img src={FileUpload} alt="upload" className="w-4 h-4" />
                      Upload
                    </button>
                    {agreement.confirmedAgreementUrl ? (
                      <a href={agreement.confirmedAgreementUrl} target="_blank" rel="noopener noreferrer" className="text-red-500 underline font-medium">
                        Confirmed
                      </a>
                    ) : (
                      <span className="text-gray-400">Confirmed —</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Modal for PDF */}
          {isModalOpen && selectedPdf && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}>
              <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '10px',
                width: '80%',
                height: '80%',
                position: 'relative'
              }}>
                <button onClick={closeModal} style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  fontSize: '18px'
                }}>X</button>
                <iframe
                  src={selectedPdf}
                  title="Aadhaar PDF"
                  width="100%"
                  height="100%"
                ></iframe>
              </div>
            </div>
          )}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white p-6 rounded-lg shadow-md w-[550px]">
                <h2 className="text-lg font-semibold mb-4">Upload Confirmed Agreement File</h2>
                <div className='text-left p-6'>
                  <label className="cursor-pointer text-red-500 pl-6">
                    Choose file
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {selectedAgreementFile && <span className="text-gray-500 pl-3">{selectedAgreementFile.name}</span>}
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={handleUpdate} className="bg-[#BF9853] text-white px-4 py-1 rounded hover:bg-[#BF9853]" >
                    Submit
                  </button>
                  <button onClick={closeModals} className=" text-black px-4 py-1 rounded hover:bg-gray-50" >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Tenant
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