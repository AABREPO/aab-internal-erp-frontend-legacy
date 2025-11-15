import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";

const ToolsTrackerNetStock = ({ username, userRoles = [] }) => {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItemName, setSelectedItemName] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  const [itemIdOptions, setItemIdOptions] = useState([]);
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredInventoryData, setFilteredInventoryData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);

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
          const electrical = options.find(opt => opt.value === 'Electrical' || opt.value === 'Electricals');
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

  // Fetch item names
  useEffect(() => {
    const fetchItemNames = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuilderDash/api/po_itemNames/getAll');
        if (response.ok) {
          const data = await response.json();
          const filteredItems = selectedCategory
            ? data.filter(item => item.category?.toLowerCase() === selectedCategory.value?.toLowerCase())
            : data;
          const itemNameOpts = filteredItems.map(item => ({
            value: item.itemName,
            label: item.itemName,
            id: item.id,
            category: item.category,
          }));
          setItemNameOptions(itemNameOpts);
        }
      } catch (error) {
        console.error('Error fetching item names:', error);
      }
    };
    fetchItemNames();
  }, [selectedCategory]);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuilderDash/api/po_brand/getAll');
        if (response.ok) {
          const data = await response.json();
          const filteredBrands = selectedCategory
            ? data.filter(b => !b.category || b.category?.toLowerCase() === selectedCategory.value?.toLowerCase())
            : data;
          const brandOpts = filteredBrands
            .map(b => ({
              value: b.brand?.trim(),
              label: b.brand?.trim(),
              id: b.id
            }))
            .filter(b => b.value);
          setBrandOptions(brandOpts);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, [selectedCategory]);

  // Fetch inventory data
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        // TODO: Replace with actual API endpoint when available
        // const response = await fetch('https://backendaab.in/aabuilderDash/api/tools_tracker/netStock');
        // if (response.ok) {
        //   const data = await response.json();
        //   setInventoryData(data);
        // }
        
        // Sample data matching the image
        const sampleData = [
          {
            id: 1,
            sNo: '01',
            itemName: 'Drilling Machine',
            itemId: 'AA DM 01',
            location: 'Godown',
            model: 'Seven star',
            brand: 'Bosch',
            machineNumber: '2214789700014',
            status: 'Working'
          },
          {
            id: 2,
            sNo: '02',
            itemName: 'Drilling Machine',
            itemId: 'AA DM 02',
            location: 'Ramar Krishnankovil',
            model: 'Helther',
            brand: 'Bosch',
            machineNumber: '5647810087999',
            status: 'Woking'
          },
          {
            id: 3,
            sNo: '03',
            itemName: 'Drilling Machine',
            itemId: 'AA DM 03',
            location: 'Godown',
            model: 'Meropolin',
            brand: 'Bosch',
            machineNumber: '00014576610',
            status: 'Dead'
          },
          {
            id: 4,
            sNo: '04',
            itemName: 'Drilling Machine',
            itemId: 'AA DM 04',
            location: 'Site A',
            model: 'Model X',
            brand: 'Stanley',
            machineNumber: '1234567890123',
            status: 'Working'
          },
          {
            id: 5,
            sNo: '05',
            itemName: 'Cutter machine',
            itemId: 'AA CM 01',
            location: 'Godown',
            model: 'Model Y',
            brand: 'Stanley',
            machineNumber: '9876543210987',
            status: 'Working'
          },
          {
            id: 6,
            sNo: '06',
            itemName: 'Chipping Hammer',
            itemId: 'AA CH 01',
            location: 'Site B',
            model: 'Model Z',
            brand: 'Bosch',
            machineNumber: '5555555555555',
            status: 'Working'
          },
          {
            id: 7,
            sNo: '07',
            itemName: 'Angle Grinder',
            itemId: 'AA AG 01',
            location: 'Godown',
            model: 'Model A',
            brand: 'Stanley',
            machineNumber: '1111111111111',
            status: 'Working'
          },
          {
            id: 8,
            sNo: '08',
            itemName: 'Angle Grinder',
            itemId: 'AA AG 02',
            location: 'Site C',
            model: 'Model B',
            brand: 'Stanley',
            machineNumber: '2222222222222',
            status: 'Working'
          }
        ];
        setInventoryData(sampleData);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      }
    };
    fetchInventoryData();
  }, []);

  // Generate item ID options from inventory data
  useEffect(() => {
    if (inventoryData.length > 0) {
      const uniqueItemIds = [...new Set(inventoryData.map(item => item.itemId))];
      const itemIdOpts = uniqueItemIds.map(itemId => ({
        value: itemId,
        label: itemId
      }));
      setItemIdOptions(itemIdOpts);
    }
  }, [inventoryData]);

  // Filter inventory data
  useEffect(() => {
    let filtered = [...inventoryData];

    if (selectedCategory) {
      filtered = filtered.filter(item => 
        item.category?.toLowerCase() === selectedCategory.value?.toLowerCase()
      );
    }

    if (selectedItemId) {
      filtered = filtered.filter(item => item.itemId === selectedItemId.value);
    }

    if (selectedItemName) {
      filtered = filtered.filter(item => item.itemName === selectedItemName.value);
    }

    if (selectedBrand) {
      filtered = filtered.filter(item => item.brand === selectedBrand.value);
    }

    // Update S.NO after filtering
    filtered = filtered.map((item, index) => ({
      ...item,
      sNo: String(index + 1).padStart(2, '0')
    }));

    setFilteredInventoryData(filtered);
  }, [selectedCategory, selectedItemId, selectedItemName, selectedBrand, inventoryData]);

  // Calculate summary data
  useEffect(() => {
    const summary = {};
    
    filteredInventoryData.forEach(item => {
      const key = `${item.itemName}_${item.brand}`;
      if (!summary[key]) {
        summary[key] = {
          itemName: item.itemName,
          brand: item.brand,
          total: 0
        };
      }
      summary[key].total += 1;
    });

    const summaryArray = Object.values(summary).map((item, index) => ({
      ...item,
      sNo: String(index + 1).padStart(2, '0')
    }));

    setSummaryData(summaryArray);
  }, [filteredInventoryData]);

  // Export PDF for detailed inventory table
  const exportDetailedPDF = () => {
    if (filteredInventoryData.length === 0) {
      alert("No data to export.");
      return;
    }

    const doc = new jsPDF("l", "pt", "a4");
    const headers = [
      [
        "S.NO",
        "Item Name",
        "Item ID",
        "Location",
        "Model",
        "Brand",
        "Machine Number",
        "Status"
      ]
    ];

    const rows = filteredInventoryData.map((item) => [
      item.sNo,
      item.itemName,
      item.itemId,
      item.location,
      item.model,
      item.brand,
      item.machineNumber,
      item.status
    ]);

    doc.setFontSize(12);
    doc.text("Tools Tracker Net Stock - Detailed Inventory", 40, 30);
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
    doc.save("ToolsTrackerNetStock_Detailed.pdf");
  };

  // Export PDF for summary table
  const exportSummaryPDF = () => {
    if (summaryData.length === 0) {
      alert("No data to export.");
      return;
    }

    const doc = new jsPDF("l", "pt", "a4");
    const headers = [
      [
        "S.No",
        "Item Name",
        "Brand",
        "Total"
      ]
    ];

    const rows = summaryData.map((item) => [
      item.sNo,
      item.itemName,
      item.brand,
      item.total.toString()
    ]);

    doc.setFontSize(12);
    doc.text("Tools Tracker Net Stock - Summary", 40, 30);
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
    doc.save("ToolsTrackerNetStock_Summary.pdf");
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
      {/* Filter Bar */}
      <div className="bg-white p-5 ml-5 mr-5 mb-4">
        <div className="flex flex-wrap gap-4">
          <div className="text-left">
            <label className="block font-semibold mb-2">Category</label>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              isSearchable
              styles={customSelectStyles}
              placeholder="Select Category"
              className="w-[323px] h-[45px]"
            />
          </div>
          <div className="text-left">
            <label className="block font-semibold mb-2">Item ID</label>
            <Select
              value={selectedItemId}
              onChange={setSelectedItemId}
              options={itemIdOptions}
              isSearchable
              styles={customSelectStyles}
              placeholder="Select ID"
              className="w-[174px] h-[45px]"
            />
          </div>
          <div className="text-left">
            <label className="block font-semibold mb-2">Item Name</label>
            <Select
              value={selectedItemName}
              onChange={setSelectedItemName}
              options={itemNameOptions}
              isSearchable
              styles={customSelectStyles}
              placeholder="Select Item Name"
              className="w-[323px] h-[45px]"
            />
          </div>
          <div className="text-left">
            <label className="block font-semibold mb-2">Brand</label>
            <Select
              value={selectedBrand}
              onChange={setSelectedBrand}
              options={brandOptions}
              isSearchable
              styles={customSelectStyles}
              placeholder="Select Brand"
              className="w-[174px] h-[45px]"
            />
          </div>
        </div>
      </div>

      {/* Main Content - Two Tables Side by Side */}
      <div className="flex flex-col lg:flex-row gap-4 ml-5 mr-5 mb-5">
        {/* Detailed Inventory Table - Left Side */}
        <div className="flex-1 bg-white p-5 rounded-lg">
          <div className="flex justify-end items-center mb-4">
            <span
              className="text-[#E4572E] font-semibold hover:underline cursor-pointer text-sm sm:text-base flex items-center gap-1"
              onClick={exportDetailedPDF}
            >
              Export PDF
            </span>
          </div>
          <div className="w-full rounded-lg border-l-8 border-l-[#BF9853] overflow-auto">
            <table className="w-full text-left text-base table-auto min-w-[1000px]">
              <thead className="bg-[#FAF6ED] text-left">
                <tr>
                  <th className="py-2 px-3">S.NO</th>
                  <th className="py-2 px-3">
                    Item Name
                    <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </th>
                  <th className="py-2 px-3">Item ID</th>
                  <th className="py-2 px-3">
                    Location
                    <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </th>
                  <th className="py-2 px-3">Model</th>
                  <th className="py-2 px-3">
                    Brand
                    <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </th>
                  <th className="py-2 px-3">Machine Number</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Table - Right Side */}
        <div className="flex-1 bg-white p-5 rounded-lg">
          <div className="flex justify-end items-center mb-4">
            <span
              className="text-[#E4572E] font-semibold hover:underline cursor-pointer text-sm sm:text-base flex items-center gap-1"
              onClick={exportSummaryPDF}
            >
              Export PDF
            </span>
          </div>
          <div className="w-full rounded-lg border-l-8 border-l-[#BF9853] overflow-auto">
            <table className="w-full text-left text-base table-auto min-w-[500px]">
              <thead className="bg-[#FAF6ED] text-left">
                <tr>
                  <th className="py-2 px-3">S.No</th>
                  <th className="py-2 px-3">
                    Item Name
                    <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </th>
                  <th className="py-2 px-3">
                    Brand
                    <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </th>
                  <th className="py-2 px-3">Total</th>
                </tr>
              </thead>
              <tbody>
                
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsTrackerNetStock;
