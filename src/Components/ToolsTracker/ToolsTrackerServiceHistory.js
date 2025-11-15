import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";
import cross from '../Images/cross.png';
import filter from '../Images/filter (3).png';

const ToolsTrackerServiceHistory = ({ username, userRoles = [] }) => {
  const [shopOptions, setShopOptions] = useState([]);
  const [selectedShop, setSelectedShop] = useState('');
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [shopFormData, setShopFormData] = useState('');

  // Sample data matching the image - replace with actual API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Replace with actual API endpoint when available
        // const response = await fetch(`https://backendaab.in/aabuilderDash/api/tools_tracker/service_history?shop=${selectedShop.value}`);
        // if (response.ok) {
        //   const data = await response.json();
        //   setTableData(data);
        // }

        // Sample data matching the image
        const sampleData = [
          {
            id: 1,
            date: '2024-04-12',
            itemName: 'Angle Grinder',
            itemId: 'AA AG 02',
            machineNumber: '22112470418',
            brand: 'Stanley',
            serviceCentre: 'Guru Electricals',
            returnDate: null,
            serviceCost: null,
            person: 'Er.Paramasivam',
            status: 'Not Working'
          },
          {
            id: 2,
            date: '2024-02-26',
            itemName: 'Drilling Machine',
            itemId: 'AA DM 04',
            machineNumber: '2267000188874',
            brand: 'Bosch',
            serviceCentre: 'Guru Electricals',
            returnDate: '2024-02-28',
            serviceCost: 150,
            person: 'Er.Thavamuni selvam',
            status: 'Machine Dead'
          },
          {
            id: 3,
            date: '2024-02-20',
            itemName: 'Drilling Machine',
            itemId: 'AA DM 01',
            machineNumber: '2214789700014',
            brand: 'Bosch',
            serviceCentre: 'Guru Electricals',
            returnDate: '2024-02-22',
            serviceCost: 500,
            person: 'Er.Paramasivam',
            status: 'Problem Solved'
          },
          {
            id: 4,
            date: '2024-02-01',
            itemName: 'Cutter machine',
            itemId: 'AA CM 01',
            machineNumber: '453466666100',
            brand: 'Stanley',
            serviceCentre: 'Guru Electricals',
            returnDate: '2024-02-05',
            serviceCost: 80,
            person: 'Er.Vasanthan',
            status: 'Problem Solved'
          }
        ];
        setTableData(sampleData);
      } catch (error) {
        console.error('Error fetching service history data:', error);
      }
    };
    fetchData();
  }, [selectedShop]);

  // Filter data by selected shop
  useEffect(() => {
    if (selectedShop) {
      const filtered = tableData.filter(item =>
        item.serviceCentre?.toLowerCase() === selectedShop.value?.toLowerCase()
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(tableData);
    }
  }, [selectedShop, tableData]);

  // Calculate total service cost
  const totalServiceCost = useMemo(() => {
    return filteredData.reduce((sum, item) => {
      return sum + (item.serviceCost || 0);
    }, 0);
  }, [filteredData]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date sorting
      if (sortConfig.key === 'date' || sortConfig.key === 'returnDate') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }

      // Handle numeric sorting
      if (sortConfig.key === 'serviceCost') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Check if row should be red (Machine Dead status)
  const isRowRed = (item) => {
    return item.status?.toLowerCase() === 'machine dead';
  };

  // Export PDF
  const exportPDF = () => {
    if (sortedData.length === 0) {
      alert("No data to export.");
      return;
    }

    const doc = new jsPDF("l", "pt", "a4");
    const headers = [
      [
        "Date",
        "Item Name",
        "Item ID",
        "Machine Number",
        "Brand",
        "Service Centre",
        "Return date",
        "Service Cost",
        "Person",
        "Status"
      ]
    ];

    const rows = sortedData.map((entry) => [
      formatDate(entry.date),
      entry.itemName,
      entry.itemId,
      entry.machineNumber,
      entry.brand,
      entry.serviceCentre,
      formatDate(entry.returnDate),
      entry.serviceCost || '-',
      entry.person,
      entry.status
    ]);

    doc.setFontSize(12);
    doc.text("Tools Tracker Service History", 40, 30);
    doc.autoTable({
      head: headers,
      body: rows,
      startY: 50,
      styles: {
        fontSize: 8,
        cellPadding: 4,
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
        fillColor: null
      },
      headStyles: {
        fillColor: null,
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineWidth: 0.5,
        lineColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: null
      }
    });
    doc.save("ToolsTrackerServiceHistory.pdf");
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      height: '45px',
      borderWidth: '2px',
      borderRadius: '8px',
      borderColor: state.isFocused
        ? 'rgba(191, 152, 83, 0.35)'
        : 'rgba(191, 152, 83, 0.35)',
      boxShadow: state.isFocused ? '0 0 0 1px #FAF6ED' : 'none',
      '&:hover': {
        borderColor: 'rgba(191, 152, 83, 0.5)',
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '35px',
      padding: '0 8px'
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '35px',
    }),
  };

  const handleEditShop = () => {
    // Load current shop data when opening modal

    setShowEditModal(true);
  };

  const handleSubmitShop = (e) => {
    e.preventDefault();
    // Update shop options with new shop name
    const updatedShop = {
      value: shopFormData.shopName,
      label: shopFormData.shopName
    };
    setSelectedShop(updatedShop);

    // Check if shop already exists in options
    const shopExists = shopOptions.find(shop => shop.value === shopFormData.shopName);
    if (!shopExists) {
      setShopOptions([...shopOptions, updatedShop]);
    }

    // TODO: Save to API
    // await fetch('https://backendaab.in/aabuilderDash/api/tools_tracker/shop', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(shopFormData)
    // });

    setShowEditModal(false);
  };

  return (
    <div className="bg-[#FAF6ED]">
      {/* Top Control Panel */}
      <div className="bg-white p-8 ml-5 mr-5 mb-4 rounded-lg shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Left Side - Shop Name and Edit Button */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-left">
              <label className="block font-semibold mb-2 text-sm">Shop Name</label>
              <div className="flex items-center gap-[16px]">
                <Select
                  value={selectedShop}
                  onChange={setSelectedShop}
                  options={shopOptions}
                  styles={customSelectStyles}
                  className="w-[249px]"
                  isSearchable
                />
                <button
                  onClick={handleEditShop}
                  className="bg-[#BF9853] w-[98px] text-white px-2 py-2 rounded-md font-semibold transition-colors"
                  style={{ height: '44px' }}
                >
                  + Edit
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Cost Display */}
          <div className="flex flex-col items-end">
            <div className="text-base">
              <span className="font-semibold">Service Cost: </span>
              <span className="font-semibold text-red-600">-</span>
            </div>
            <div className="text-base">
              <span className="font-semibold">Purchase Cost: </span>
              <span className="font-semibold">-</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white p-5 ml-5 mr-5 rounded-lg shadow-sm">
        {/* Top Right - Filter and Export */}
        <div className="flex justify-between items-center mb-4">
          {/* Filter Icon - Left */}
          <div className="flex items-center cursor-pointer shadow-md">
            <img src={filter} alt="filter" className="w-6 h-6" />
          </div>

          {/* Export PDF - Right */}
          <div>
            <span
              className="text-[#E4572E] font-semibold hover:underline cursor-pointer text-sm sm:text-base flex items-center gap-1"
              onClick={exportPDF}
            >
              Export PDF
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="w-full rounded-lg border-l-8 border-l-[#BF9853] overflow-auto">
          <table className="w-full text-left text-base table-auto min-w-[1400px]">
            <thead className="bg-[#FAF6ED] text-left">
              <tr>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('itemName')}
                >
                  <div className="flex items-center gap-1">
                    Item Name
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('itemId')}
                >
                  <div className="flex items-center gap-1">
                    Item ID
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('machineNumber')}
                >
                  <div className="flex items-center gap-1">
                    Machine Number
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('brand')}
                >
                  <div className="flex items-center gap-1">
                    Brand
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('serviceCentre')}
                >
                  <div className="flex items-center gap-1">
                    Service Centre
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('returnDate')}
                >
                  <div className="flex items-center gap-1">
                    Return date
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('serviceCost')}
                >
                  <div className="flex items-center gap-1">
                    Service Cost
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('person')}
                >
                  <div className="flex items-center gap-1">
                    Person
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
                <th className="py-2 px-3">Bill</th>
              </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Shop Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-[602px] max-h-[80vh] overflow-y-auto p-4 sm:p-6 lg:p-8 text-left relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Input Data</h2>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => setShowEditModal(false)}
              >
                <img src={cross} alt="close" className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitShop}>
              <div className="space-y-4 mb-4">
                <div className="flex gap-4">
                  {/* Shop Name */}
                  <div>
                    <label className="block font-semibold mb-2 text-sm sm:text-base">
                      Shop Name
                    </label>
                    <input
                      type="text"
                      className="w-[255px] bg-[#F2F2F2] border-opacity-30 rounded-lg px-3 py-2 h-[45px] focus:outline-none"
                      value={shopFormData.shopName}
                      onChange={(e) => setShopFormData({ ...shopFormData, shopName: e.target.value })}
                      required
                    />
                  </div>
                  {/* Mobile Number */}
                  <div>
                    <label className="block font-semibold mb-2 text-sm sm:text-base">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      className="w-[180px] border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 h-[45px] focus:outline-none"
                      value={shopFormData.mobileNumber}
                      onChange={(e) => setShopFormData({ ...shopFormData, mobileNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>
                {/* Address */}
                <div>
                  <label className="block font-semibold mb-2 text-sm sm:text-base">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-[450px] border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 h-[45px] focus:outline-none"
                    value={shopFormData.address}
                    onChange={(e) => setShopFormData({ ...shopFormData, address: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="submit"
                  className="bg-[#BF9853] w-[114px] h-[36px] text-white font-semibold px-4 rounded-md hover:bg-[#a8874a] transition-colors text-sm sm:text-base"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="border border-[#BF9853] w-[114px] h-[36px] text-[#BF9853] font-semibold px-4 rounded-md text-sm sm:text-base"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsTrackerServiceHistory;
