import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";

const ToolsTrackerPendingItems = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedDays, setSelectedDays] = useState({ value: 'all', label: 'All Days' });

  // Sample data matching the image - replace with actual API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Replace with actual API endpoint when available
        // const response = await fetch('https://backendaab.in/aabuilderDash/api/tools_tracker/pending');
        // if (response.ok) {
        //   const data = await response.json();
        //   setTableData(data);
        // }
        
        // Sample data matching the image
        const sampleData = [
          {
            id: 1,
            date: '2024-03-05',
            itemName: 'Angle Grinder',
            from: 'Godown',
            to: 'Rafiq - Ashok Nagar',
            itemId: 'AA AG 03',
            entryNo: '229',
            projectEngineer: 'Er.Pon Pandiyan'
          },
          {
            id: 2,
            date: '2024-03-11',
            itemName: 'Drilling machine',
            from: 'Mahadevan - Valayapatti',
            to: 'Muthupandi - Krishnankovil',
            itemId: 'AA DM 05',
            entryNo: '230',
            projectEngineer: 'Er.Ramar'
          },
          {
            id: 3,
            date: '2024-04-10',
            itemName: 'Angle Grinder',
            from: 'Godown',
            to: 'Suresh - Kambathupatti',
            itemId: 'AA AG 01',
            entryNo: '233',
            projectEngineer: 'Er.Kalimuthu'
          },
          {
            id: 4,
            date: '2024-04-11',
            itemName: 'Chipping Hammer',
            from: 'Muthukrishnan - Godhai Nagar',
            to: 'Rafiq - Ashok Nagar',
            itemId: 'AA CH 01',
            entryNo: '234',
            projectEngineer: 'Er.Siva Prakasham'
          },
          {
            id: 5,
            date: '2024-04-12',
            itemName: 'Angle Grinder',
            from: 'ESM - A.A.Nagar',
            to: 'Guru Electricals',
            itemId: 'AA AG 02',
            entryNo: '235',
            projectEngineer: 'Er.Paramasivam'
          },
          {
            id: 6,
            date: '2024-04-15',
            itemName: 'Cutter machine',
            from: 'Ramar Krishnankovil',
            to: 'Rafiq - Ashok Nagar',
            itemId: 'AA CM 01',
            entryNo: '236',
            projectEngineer: 'Mani Kandan K'
          },
          {
            id: 7,
            date: '2024-04-15',
            itemName: 'Drilling machine',
            from: 'Ramar Krishnankovil',
            to: 'Rafiq - Ashok Nagar',
            itemId: 'AA DM 02',
            entryNo: '236',
            projectEngineer: 'Mani Kandan K'
          }
        ];
        setTableData(sampleData);
      } catch (error) {
        console.error('Error fetching pending items data:', error);
      }
    };
    fetchData();
  }, []);

  // Filter data by days
  useEffect(() => {
    if (selectedDays.value === 'all') {
      setFilteredData(tableData);
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days = parseInt(selectedDays.value);
      const filterDate = new Date(today);
      filterDate.setDate(today.getDate() - days);
      
      const filtered = tableData.filter(item => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= filterDate;
      });
      setFilteredData(filtered);
    }
  }, [selectedDays, tableData]);

  // Calculate duration in days
  const calculateDuration = (dateString) => {
    if (!dateString) return '0 days';
    const itemDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    itemDate.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today - itemDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    }
    // Match image format: "35 days", "30 days", "5 Days", etc.
    return `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'}`;
  };

  // Check if item is overdue (red text condition)
  const isOverdue = (item) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    itemDate.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today - itemDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Red if duration is 30+ days
    return diffDays >= 30;
  };

  // Check if "To" field should be red
  const isToFieldRed = (item) => {
    return item.to?.toLowerCase().includes('electricals') || item.to?.toLowerCase().includes('external');
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date sorting
      if (sortConfig.key === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle duration sorting
      if (sortConfig.key === 'duration') {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        aDate.setHours(0, 0, 0, 0);
        bDate.setHours(0, 0, 0, 0);
        const aDays = Math.ceil(Math.abs(today - aDate) / (1000 * 60 * 60 * 24));
        const bDays = Math.ceil(Math.abs(today - bDate) / (1000 * 60 * 60 * 24));
        return sortConfig.direction === 'asc' ? aDays - bDays : bDays - aDays;
      }

      // Handle numeric sorting
      if (sortConfig.key === 'entryNo') {
        aValue = Number(aValue);
        bValue = Number(bValue);
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
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Day filter options
  const dayOptions = [
    { value: 'all', label: 'All Days' },
    { value: '7', label: 'Last 7 Days' },
    { value: '15', label: 'Last 15 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' }
  ];

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      height: '35px',
      minHeight: '35px',
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
        "From",
        "To",
        "Item ID",
        "Duration",
        "E.No",
        "Project Engineer"
      ]
    ];

    const rows = sortedData.map((entry) => [
      formatDate(entry.date),
      entry.itemName,
      entry.from,
      entry.to,
      entry.itemId,
      calculateDuration(entry.date),
      entry.entryNo,
      entry.projectEngineer
    ]);

    doc.setFontSize(12);
    doc.text("Tools Tracker Pending Items", 40, 30);
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
    doc.save("ToolsTrackerPendingItems.pdf");
  };

  // Export Excel (CSV)
  const exportExcel = () => {
    if (sortedData.length === 0) {
      alert("No data to export.");
      return;
    }

    const csvHeaders = [
      "Date",
      "Item Name",
      "From",
      "To",
      "Item ID",
      "Duration",
      "E.No",
      "Project Engineer"
    ];

    const csvRows = sortedData.map((entry) => [
      formatDate(entry.date),
      entry.itemName,
      entry.from,
      entry.to,
      entry.itemId,
      calculateDuration(entry.date),
      entry.entryNo,
      entry.projectEngineer
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "ToolsTrackerPendingItems.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#FAF6ED]">
      {/* Table Section */}
      <div className="bg-white p-5 ml-5 mr-5 rounded-lg shadow-sm">
        {/* Right Side - Export Buttons and Filter */}
          <div className="lg:flex justify-end gap-4 mb-4 items-center">
            {/* Export Buttons */}
            <div className="flex gap-4 items-center">
              <span
                className="text-[#E4572E] font-semibold hover:underline cursor-pointer text-sm sm:text-base flex items-center gap-1"
                onClick={exportPDF}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Export PDF
              </span>
              <span
                className="text-[#007233] font-semibold hover:underline cursor-pointer text-sm sm:text-base flex items-center gap-1"
                onClick={exportExcel}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export XL
              </span>
              <span
                className="text-[#BF9853] font-semibold hover:underline cursor-pointer text-sm sm:text-base flex items-center gap-1"
                onClick={handlePrint}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4z" clipRule="evenodd" />
                </svg>
                Print
              </span>
            </div>

            {/* Days Filter Dropdown */}
            <div className="w-full sm:w-auto">
              <Select
                value={selectedDays}
                onChange={setSelectedDays}
                options={dayOptions}
                styles={customSelectStyles}
                className="w-full sm:w-40"
              />
            </div>
          </div>
        <div className="w-full rounded-lg border-l-8 border-l-[#BF9853] overflow-auto">
          <table className="w-full text-left text-base table-fixed">
            <thead className="bg-[#FAF6ED] text-left">
              <tr>
                <th
                  className="py-2 px-3 w-[10%]"
                >
                  <div className="flex items-center gap-1">
                    Date
                  </div>
                </th>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200 w-[15%]"
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
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200 w-[15%]"
                  onClick={() => handleSort('from')}
                >
                  <div className="flex items-center gap-1">
                    From
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200 w-[15%]"
                  onClick={() => handleSort('to')}
                >
                  <div className="flex items-center gap-1">
                    To
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200 w-[12%]"
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
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200 w-[10%]"
                  onClick={() => handleSort('duration')}
                >
                  <div className="flex items-center gap-1">
                    Duration
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200 w-[8%]"
                  onClick={() => handleSort('entryNo')}
                >
                  <div className="flex items-center gap-1">
                    E.No
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
                <th
                  className="py-2 px-3 cursor-pointer hover:bg-gray-200 w-[15%]"
                  onClick={() => handleSort('projectEngineer')}
                >
                  <div className="flex items-center gap-1">
                    Project Engineer
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ToolsTrackerPendingItems;
