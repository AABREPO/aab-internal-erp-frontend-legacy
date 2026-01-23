import React, { useState, useEffect } from 'react';
import SearchableDropdown from '../PurchaseOrder/SearchableDropdown';

const AddInput = ({ user }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItemName, setSelectedItemName] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [itemIdOptions, setItemIdOptions] = useState([]);
  const [tableData, setTableData] = useState([
    {
      id: 1,
      itemId: 'AA DM 01',
      brand: 'Brand 1',
      model: 'Seven Star',
      machine: '214444700002879'
    },
    {
      id: 2,
      itemId: 'AA DM 02',
      brand: 'Flip',
      model: 'Helther',
      machine: '577779991028'
    },
    {
      id: 3,
      itemId: 'AA DM 03',
      brand: 'Double color',
      model: 'Meropolin',
      machine: '01222178784'
    }
  ]);

  // Fetch item names
  useEffect(() => {
    const fetchItemNames = async () => {
      try {
        const response = await fetch('https:///api/po_itemNames/getAll');
        if (response.ok) {
          const data = await response.json();
          const itemNameOpts = data.map(item => item.itemName);
          setItemNameOptions(itemNameOpts);
        }
      } catch (error) {
        console.error('Error fetching item names:', error);
      }
    };
    fetchItemNames();
  }, []);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('https:///api/po_brand/getAll');
        if (response.ok) {
          const data = await response.json();
          const brandOpts = data
            .map(b => b.brand?.trim())
            .filter(b => b);
          setBrandOptions(brandOpts);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, []);

  // Fetch item IDs when item name or brand is selected
  useEffect(() => {
    if (selectedItemName || selectedBrand) {
      // TODO: Replace with actual API endpoint
      const sampleItemIds = [
        'AA DM 01',
        'AA DM 02',
        'AA DM 03',
        'AA DM 04'
      ];
      setItemIdOptions(sampleItemIds);
    } else {
      setItemIdOptions([]);
    }
  }, [selectedItemName, selectedBrand]);

  const handleAddNew = () => {
    // Handle add new item logic
    console.log('Add New clicked');
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-90px-80px)] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Category Section */}
      <div className="flex-shrink-0 px-4 pt-2 pb-3">
        <div className="flex items-center justify-between border-b border-gray-200 gap-2">
          <p className="text-[12px] mb-2 font-medium text-black leading-normal">Category</p>
          <p className="text-[12px] mb-2 font-medium text-black leading-normal">Manage shops</p>
        </div>
      </div>

      {/* Input Fields */}
      <div className="flex-shrink-0 px-4 pb-4">
        {/* Item Name */}
        <div className="mb-4">
          <p className="text-[12px] font-medium text-black leading-normal mb-1">
            Item Name<span className="text-[#eb2f8e]">*</span>
          </p>
          <SearchableDropdown
            value={selectedItemName || ''}
            onChange={(value) => setSelectedItemName(value)}
            options={itemNameOptions}
            placeholder="Drilling Machine"
            fieldName="Item Name"
            showAllOptions={true}
          />
        </div>

        {/* Brand and Item ID Row */}
        <div className="flex gap-3 mb-4">
          {/* Brand */}
          <div className="flex-1">
            <p className="text-[12px] font-medium text-black leading-normal mb-1">
              Brand<span className="text-[#eb2f8e]">*</span>
            </p>
            <SearchableDropdown
              value={selectedBrand || ''}
              onChange={(value) => setSelectedBrand(value)}
              options={brandOptions}
              placeholder="Select Brand"
              fieldName="Brand"
              showAllOptions={true}
            />
          </div>
          {/* Item ID */}
          <div className="flex-1">
            <p className="text-[12px] font-medium text-black leading-normal mb-1">
              Item ID<span className="text-[#eb2f8e]">*</span>
            </p>
            <SearchableDropdown
              value={selectedItemId || ''}
              onChange={(value) => setSelectedItemId(value)}
              options={itemIdOptions}
              placeholder="Select Item ID"
              fieldName="Item ID"
              showAllOptions={true}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <div className="bg-white rounded-[8px] border border-[#E0E0E0]">
          {/* Table Header */}
          <div className="bg-[#F5F5F5] px-2 py-2 border-b border-[#E0E0E0]">
            <div className="grid grid-cols-5 gap-2">
              <div className="text-[10px] font-bold text-black leading-normal"></div>
              <div className="text-[10px] font-bold text-black leading-normal">Item ID</div>
              <div className="text-[10px] font-bold text-black leading-normal">Brand</div>
              <div className="text-[10px] font-bold text-black leading-normal">Model</div>
              <div className="text-[10px] font-bold text-black leading-normal">Machine</div>
            </div>
          </div>
          {/* Table Body */}
          <div>
            
          </div>
        </div>
      </div>

      {/* Floating Action Button - Add New */}
      <div 
        className="fixed bottom-[110px] right-[24px] lg:right-[calc(50%-164px)] z-30 cursor-pointer"
        onClick={handleAddNew}
      >
        <div className="bg-black rounded-full px-4 py-2 flex items-center gap-2 h-[43px]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-white text-[14px] font-medium">Add New</span>
        </div>
      </div>
    </div>
  );
};

export default AddInput;
