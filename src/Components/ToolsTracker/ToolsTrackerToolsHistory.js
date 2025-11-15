import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import edit from '../Images/Edit.svg';

const ToolsTrackerToolsHistory = () => {
  // Selection/Filter states
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState(null);
  const [brandOptions, setBrandOptions] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [itemIdOptions, setItemIdOptions] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [machineNumberOptions, setMachineNumberOptions] = useState([]);
  const [selectedMachineNumber, setSelectedMachineNumber] = useState(null);
  const [location, setLocation] = useState('');

  // Detailed information states
  const [itemDetails, setItemDetails] = useState({
    itemId: '',
    brand: '',
    model: '',
    purchaseDate: '',
    purchaseStore: '',
    contactNumber: '',
    machineNumber: '',
    warrantyDate: '',
    shopAddress: ''
  });

  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch item names
  useEffect(() => {
    const fetchItemNames = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuilderDash/api/po_itemNames/getAll');
        if (response.ok) {
          const data = await response.json();
          const options = data.map(item => ({
            value: item.itemName,
            label: item.itemName,
            id: item.id,
          }));
          setItemNameOptions(options);
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
        const response = await fetch('https://backendaab.in/aabuilderDash/api/po_brand/getAll');
        if (response.ok) {
          const data = await response.json();
          const options = data
            .map(b => ({
              value: b.brand?.trim(),
              label: b.brand?.trim(),
              id: b.id
            }))
            .filter(b => b.value);
          setBrandOptions(options);
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
      // For now, generate sample item IDs
      const sampleItemIds = [
        { value: 'AA DM 01', label: 'AA DM 01' },
        { value: 'AA DM 02', label: 'AA DM 02' },
        { value: 'AA DM 03', label: 'AA DM 03' },
      ];
      setItemIdOptions(sampleItemIds);
    } else {
      setItemIdOptions([]);
    }
  }, [selectedItemName, selectedBrand]);

  // Fetch machine numbers when item ID is selected
  useEffect(() => {
    if (selectedItemId) {
      // TODO: Replace with actual API endpoint
      // For now, generate sample machine numbers
      const sampleMachineNumbers = [
        { value: '2214789700014', label: '2214789700014' },
        { value: '5647810087999', label: '5647810087999' },
        { value: '00014576610', label: '00014576610' },
      ];
      setMachineNumberOptions(sampleMachineNumbers);
    } else {
      setMachineNumberOptions([]);
    }
  }, [selectedItemId]);

  // Fetch item details when all selections are made
  useEffect(() => {
    if (selectedItemId && selectedMachineNumber) {
      // TODO: Replace with actual API endpoint
      // Example: fetch(`https://backendaab.in/aabuilderDash/api/tools_tracker/history/${selectedItemId.value}/${selectedMachineNumber.value}`)

      // Sample data matching the image
      setItemDetails({
        itemId: selectedItemId.value || 'AA DM 01',
        brand: selectedBrand?.value || 'Bosch',
        model: 'Seven star',
        purchaseDate: '12/09/2023',
        purchaseStore: 'Guru electricals',
        contactNumber: '9876543210',
        machineNumber: selectedMachineNumber.value || '2214789700014',
        warrantyDate: '24/08/2028',
        shopAddress: '12/201C Valaikulam street, Srivilliputtur - 626125'
      });
    }
  }, [selectedItemId, selectedMachineNumber, selectedBrand]);

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

  const handleEdit = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSave = () => {
    // TODO: Implement save functionality with API call
    setIsEditMode(false);
    alert('Details saved successfully!');
  };

  return (
    <div className="bg-[#FAF6ED]">
      {/* Top Selection/Filter Area */}
      <div className="bg-white p-5 ml-5 mr-5 mb-4">
        <div className="flex flex-wrap gap-[16px]">
          <div className="text-left">
            <label className="block font-semibold mb-2">Item Name</label>
            <Select
              value={selectedItemName}
              onChange={setSelectedItemName}
              options={itemNameOptions}
              isSearchable
              isClearable
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
              isClearable
              styles={customSelectStyles}
              placeholder="Select Brand"
              className="w-[202px] h-[45px]"
            />
          </div>
          <div className="text-left">
            <label className="block font-semibold mb-2">Item ID</label>
            <Select
              value={selectedItemId}
              onChange={setSelectedItemId}
              options={itemIdOptions}
              isSearchable
              isClearable
              styles={customSelectStyles}
              placeholder="Select Item ID"
              className="w-[202px] h-[45px]"
            />
          </div>
          <div className="text-left">
            <label className="block font-semibold mb-2">Machine Number</label>
            <Select
              value={selectedMachineNumber}
              onChange={setSelectedMachineNumber}
              options={machineNumberOptions}
              isSearchable
              isClearable
              styles={customSelectStyles}
              placeholder="Machine Number"
              className="w-[202px] h-[45px]"
            />
          </div>
          <div className="text-left">
            <label className="block font-semibold mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className=" bg-[#F2F2F2] border-opacity-35 focus:outline-none rounded-lg w-[202px] h-[45px] px-3"
            />
          </div>
        </div>
      </div>

      {/* Detailed Information Display Area */}
      <div className="bg-white p-5 ml-5 mr-5 rounded-lg">
        <div className="flex ml-[350px] w-[72px] h-[33px] items-center mb-4">
          {isEditMode ? (
            <button
              onClick={handleSave}
              className="bg-[#E5FEF0] text-[#007233] px-4 py-2 rounded-md flex items-center gap-2"
            >
              Save
            </button>
          ) : (
            <button
              onClick={handleEdit}
              className="bg-[#E5FEF0] text-[#007233] px-3 py-2 rounded-md flex items-center gap-2"
            >
              Edit <img src={edit} alt='edit' className='w-4 h-4' />
            </button>
          )}
        </div>

        <div className="space-y-4 pl-10">
          {/* Row 1 */}
          <div className="text-left flex gap-4">
            <div>
              <label className="block font-semibold mb-2">Item ID</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={itemDetails.itemId}
                  onChange={(e) => setItemDetails({ ...itemDetails, itemId: e.target.value })}
                  className="w-[180px] border-2 border-[#BF9853] border-opacity-35 focus:outline-none rounded-lg h-[45px] px-3 bg-white"
                />
              ) : (
                <div className="w-[180px] bg-[#F2F2F2] rounded-lg h-[45px] px-3 flex items-center">
                  {itemDetails.itemId || ''}
                </div>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-2">Brand</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={itemDetails.brand}
                  onChange={(e) => setItemDetails({ ...itemDetails, brand: e.target.value })}
                  className="w-[180px] border-2 border-[#BF9853] border-opacity-35 focus:outline-none rounded-lg h-[45px] px-3 bg-white"
                />
              ) : (
                <div className="w-[180px] bg-[#F2F2F2] rounded-lg h-[45px] px-3 flex items-center">
                  {itemDetails.brand || ''}
                </div>
              )}
            </div>
          </div>

          {/* Row 2 */}
          <div className="text-left flex gap-4">
            <div>
              <label className="block font-semibold mb-2">Model</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={itemDetails.model}
                  onChange={(e) => setItemDetails({ ...itemDetails, model: e.target.value })}
                  className="w-[180px] border-2 border-[#BF9853] border-opacity-35 focus:outline-none rounded-lg h-[45px] px-3 bg-white"
                />
              ) : (
                <div className="w-[180px] bg-[#F2F2F2] rounded-lg h-[45px] px-3 flex items-center">
                  {itemDetails.model || ''}
                </div>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-2">Purchase Date</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={itemDetails.purchaseDate}
                  onChange={(e) => setItemDetails({ ...itemDetails, purchaseDate: e.target.value })}
                  className="w-[180px] border-2 border-[#BF9853] border-opacity-35 focus:outline-none rounded-lg h-[45px] px-3 bg-white"
                />
              ) : (
                <div className="w-[180px] bg-[#F2F2F2] rounded-lg h-[45px] px-3 flex items-center">
                  {itemDetails.purchaseDate || ''}
                </div>
              )}
            </div>
          </div>

          {/* Row 3 */}
          <div className="text-left flex gap-4">
            <div>
              <label className="block font-semibold mb-2">Purchase Store</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={itemDetails.purchaseStore}
                  onChange={(e) => setItemDetails({ ...itemDetails, purchaseStore: e.target.value })}
                  className="w-[180px] border-2 border-[#BF9853] border-opacity-35 focus:outline-none rounded-lg h-[45px] px-3 bg-white"
                />
              ) : (
                <div className="w-[180px] bg-[#F2F2F2] rounded-lg h-[45px] px-3 flex items-center">
                  {itemDetails.purchaseStore || ''}
                </div>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-2">Contact Number</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={itemDetails.contactNumber}
                  onChange={(e) => setItemDetails({ ...itemDetails, contactNumber: e.target.value })}
                  className="w-[180px] border-2 border-[#BF9853] border-opacity-35 focus:outline-none rounded-lg h-[45px] px-3 bg-white"
                />
              ) : (
                <div className="w-[180px] bg-[#F2F2F2] rounded-lg h-[45px] px-3 flex items-center">
                  {itemDetails.contactNumber || ''}
                </div>
              )}
            </div>
          </div>

          {/* Row 4 */}
          <div className="text-left flex gap-4">
            <div>
              <label className="block font-semibold mb-2">Machine Number</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={itemDetails.machineNumber}
                  onChange={(e) => setItemDetails({ ...itemDetails, machineNumber: e.target.value })}
                  className="w-[180px] border-2 border-[#BF9853] border-opacity-35 focus:outline-none rounded-lg h-[45px] px-3 bg-white"
                />
              ) : (
                <div className="w-[180px] bg-[#F2F2F2] rounded-lg h-[45px] px-3 flex items-center">
                  {itemDetails.machineNumber || ''}
                </div>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-2">Warranty Date</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={itemDetails.warrantyDate}
                  onChange={(e) => setItemDetails({ ...itemDetails, warrantyDate: e.target.value })}
                  className="w-[180px] border-2 border-[#BF9853] border-opacity-35 focus:outline-none rounded-lg h-[45px] px-3 bg-white"
                />
              ) : (
                <div className="w-[180px] bg-[#F2F2F2] rounded-lg h-[45px] px-3 flex items-center">
                  {itemDetails.warrantyDate || ''}
                </div>
              )}
            </div>
          </div>

          {/* Row 5 - Full Width */}
          <div className="text-left">
            <label className="block font-semibold mb-2">Shop Address</label>
            {isEditMode ? (
              <input
                type="text"
                value={itemDetails.shopAddress}
                onChange={(e) => setItemDetails({ ...itemDetails, shopAddress: e.target.value })}
                className="w-[376px] border-2 border-[#BF9853] border-opacity-35 focus:outline-none rounded-lg h-[45px] px-3 bg-white"
              />
            ) : (
              <div className="w-[376px] bg-[#F2F2F2] rounded-lg h-[45px] px-3 flex items-center">
                {itemDetails.shopAddress || ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsTrackerToolsHistory;
