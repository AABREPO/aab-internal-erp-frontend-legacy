import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";

const ToolsTrackerDatabase = () => {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuilderDash/api/po_category/getAll');
        if (response.ok) {
          const data = await response.json();
          const options = data.map(item => ({
            value: item.category,
            label: item.category,
            id: item.id,
          }));
          setCategoryOptions(options);
          // Set default to "Electrical" if available
          const electrical = options.find(opt => opt.value === 'Electrical');
          if (electrical) {
            setSelectedCategory(electrical);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch tools tracker data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Replace with actual API endpoint when available
        // const response = await fetch('https://backendaab.in/aabuilderDash/api/tools_tracker/getAll');
        // if (response.ok) {
        //   const data = await response.json();
        //   setTableData(data);
        // }
      } catch (error) {
        console.error('Error fetching tools tracker data:', error);
      }
    };
    fetchData();
  }, []);

  // Filter data by category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = tableData.filter(item =>
        item.category?.toLowerCase() === selectedCategory.value?.toLowerCase()
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(tableData);
    }
  }, [selectedCategory, tableData]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date sorting
      if (sortConfig.key === 'date' || sortConfig.key === 'timestamp') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
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

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
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
        "Time Stamp",
        "Date",
        "Item Name",
        "From",
        "To",
        "Category",
        "Item ID",
        "E.No",
        "Project Engineer"
      ]
    ];

    const rows = sortedData.map((entry) => [
      formatTimestamp(entry.timestamp || entry.createdAt || entry.date),
      formatDate(entry.date),
      entry.itemName,
      entry.from,
      entry.to,
      entry.category,
      entry.itemId,
      entry.entryNo,
      entry.projectEngineer
    ]);

    doc.setFontSize(12);
    doc.text("Tools Tracker Data Table", 40, 30);
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
    doc.save("ToolsTrackerData.pdf");
  };

  // Export Excel (CSV)
  const exportExcel = () => {
    if (sortedData.length === 0) {
      alert("No data to export.");
      return;
    }

    const csvHeaders = [
      "Time Stamp",
      "Date",
      "Item Name",
      "From",
      "To",
      "Category",
      "Item ID",
      "E.No",
      "Project Engineer"
    ];

    const csvRows = sortedData.map((entry) => [
      formatTimestamp(entry.timestamp || entry.createdAt || entry.date),
      formatDate(entry.date),
      entry.itemName,
      entry.from,
      entry.to,
      entry.category,
      entry.itemId,
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
    link.setAttribute("download", "ToolsTrackerData.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print
  const handlePrint = () => {
    window.print();
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
  };

  return (
    <div className="bg-[#FAF6ED]">
      {/* Top Section - Category Filter and Export Buttons */}
      <div className="">
        <div className="flex flex-col lg:flex-row justify-between bg-white p-3 sm:p-5 ml-2 sm:ml-4 lg:ml-5 mr-2 sm:mr-4 lg:mr-5 items-start lg:items-center gap-4 mb-4">
          {/* Category Filter - Left Side */}
          <div className="w-full lg:w-auto text-left">
            <label className="block font-semibold mb-2 text-sm sm:text-base">Category</label>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              isSearchable
              styles={customSelectStyles}
              placeholder="Select Category"
              className="w-full lg:w-64"
            />
          </div>


        </div>

        {/* Table Section */}
        <div className="bg-white p-2 sm:p-5 ml-2 sm:ml-4 lg:ml-5 mr-2 sm:mr-4 lg:mr-5">
          {/* Export Buttons - Right Side */}
          <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-start lg:justify-end w-full lg:w-auto">
            <span
              className="text-[#E4572E] font-semibold hover:underline cursor-pointer text-xs sm:text-sm md:text-base flex items-center gap-1"
              onClick={exportPDF}
            > Export PDF
            </span>
            <span
              className="text-[#007233] font-semibold hover:underline cursor-pointer text-xs sm:text-sm md:text-base flex items-center gap-1"
              onClick={exportExcel}
            > Export XL
            </span>
            <span
              className="text-[#BF9853] font-semibold hover:underline cursor-pointer text-xs sm:text-sm md:text-base flex items-center gap-1"
              onClick={handlePrint}
            > Print
            </span>
          </div>
          <div className="w-full rounded-lg border-l-8 border-l-[#BF9853] overflow-x-auto">
            <table className="w-full text-left text-sm sm:text-base table-auto min-w-[1200px]">
              <thead className="bg-[#FAF6ED] text-left">
                <tr className="">
                  <th className="py-2 px-2 sm:px-3 text-xs sm:text-sm md:text-base">
                    Time Stamp
                  </th>
                  <th className="py-2 px-2 sm:px-3 text-xs sm:text-sm md:text-base">
                    Date
                  </th>
                  <th
                    className="py-2 px-2 sm:px-3 cursor-pointer hover:bg-gray-200 text-xs sm:text-sm md:text-base"
                    onClick={() => handleSort('itemName')}
                  >
                    Item Name {sortConfig.key === 'itemName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="py-2 px-2 sm:px-3 cursor-pointer hover:bg-gray-200 text-xs sm:text-sm md:text-base"
                    onClick={() => handleSort('from')}
                  >
                    From {sortConfig.key === 'from' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="py-2 px-2 sm:px-3 cursor-pointer hover:bg-gray-200 text-xs sm:text-sm md:text-base"
                    onClick={() => handleSort('to')}
                  >
                    To {sortConfig.key === 'to' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="py-2 px-2 sm:px-3 cursor-pointer hover:bg-gray-200 text-xs sm:text-sm md:text-base"
                    onClick={() => handleSort('category')}
                  >
                    Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="py-2 px-2 sm:px-3 cursor-pointer hover:bg-gray-200 text-xs sm:text-sm md:text-base"
                    onClick={() => handleSort('itemId')}
                  >
                    Item ID {sortConfig.key === 'itemId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="py-2 px-2 sm:px-3 cursor-pointer hover:bg-gray-200 text-xs sm:text-sm md:text-base"
                    onClick={() => handleSort('entryNo')}
                  >
                    E.No {sortConfig.key === 'entryNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="py-2 px-2 sm:px-3 cursor-pointer hover:bg-gray-200 text-xs sm:text-sm md:text-base"
                    onClick={() => handleSort('projectEngineer')}
                  >
                    Project Engineer {sortConfig.key === 'projectEngineer' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="py-2 px-2 sm:px-3 cursor-pointer hover:bg-gray-200 text-xs sm:text-sm md:text-base"
                    onClick={() => handleSort('image')}
                  >
                    Image {sortConfig.key === 'image' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="py-2 px-2 sm:px-3 cursor-pointer hover:bg-gray-200 text-xs sm:text-sm md:text-base"
                    onClick={() => handleSort('activity')}
                  >
                    Activity {sortConfig.key === 'activity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="py-8 text-center text-gray-500 text-sm sm:text-base">
                      No data available
                    </td>
                  </tr>
                ) : (
                  sortedData.map((row, index) => (
                    <tr key={index} className="odd:bg-white even:bg-[#FAF6ED]">
                      <td className="py-2 px-2 sm:px-3 font-semibold text-xs sm:text-sm">{formatTimestamp(row.timestamp || row.createdAt || row.date)}</td>
                      <td className="py-2 px-2 sm:px-3 font-semibold text-xs sm:text-sm">{formatDate(row.date)}</td>
                      <td className="py-2 px-2 sm:px-3 font-semibold text-xs sm:text-sm">{row.itemName}</td>
                      <td className="py-2 px-2 sm:px-3 font-semibold text-xs sm:text-sm">{row.from}</td>
                      <td className="py-2 px-2 sm:px-3 font-semibold text-xs sm:text-sm">{row.to}</td>
                      <td className="py-2 px-2 sm:px-3 font-semibold text-xs sm:text-sm">{row.category}</td>
                      <td className="py-2 px-2 sm:px-3 font-semibold text-xs sm:text-sm">{row.itemId}</td>
                      <td className="py-2 px-2 sm:px-3 font-semibold text-xs sm:text-sm">{row.entryNo}</td>
                      <td className="py-2 px-2 sm:px-3 font-semibold text-xs sm:text-sm">{row.projectEngineer}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsTrackerDatabase;
