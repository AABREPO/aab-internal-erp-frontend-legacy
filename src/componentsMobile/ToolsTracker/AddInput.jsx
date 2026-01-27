import React, { useState, useEffect } from 'react';
import SearchableDropdown from '../PurchaseOrder/SearchableDropdown';
import SelectLocatorsModal from '../Inventory/SelectLocatorsModal';

const AddInput = ({ user }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItemName, setSelectedItemName] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [itemIdOptions, setItemIdOptions] = useState([]);
  const [showAddNewSheet, setShowAddNewSheet] = useState(false);
  const [vendorNameOptions, setVendorNameOptions] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [showVendorsModal, setShowVendorsModal] = useState(false);
  const [allVendorData, setAllVendorData] = useState([]); // Store full vendor data including makeAsServiceShop
  const [vendorOptions, setVendorOptions] = useState([]); // Store vendor options with IDs and makeAsServiceShop
  const [previousSelectedVendors, setPreviousSelectedVendors] = useState([]);
  const [addSheetForm, setAddSheetForm] = useState({
    itemName: 'Drilling Machine',
    quantity: '0',
    itemId: 'AA DM 06',
    model: '',
    machineNumber: '',
    brand: '',
    purchaseDate: '',
    warrantyDate: '',
    contact: '',
    purchaseStore: '',
    shopAddress: ''
  });
  const modelOptions = ['Model A', 'Model B', 'Seven Star', 'Helther', 'Meropolin'];
  const purchaseStoreOptions = ['Store 1', 'Store 2', 'Store 3'];
  const sheetItemIdOptions = itemIdOptions.length ? itemIdOptions : ['AA DM 01', 'AA DM 02', 'AA DM 03', 'AA DM 04', 'AA DM 05', 'AA DM 06'];
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
  // Fetch vendor names
  useEffect(() => {
    fetchVendorNames();
  }, []);
  const fetchVendorNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll', {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Store full vendor data
        setAllVendorData(data);
        const formattedData = data.map(item => ({
          value: item.vendorName,
          label: item.vendorName,
          id: item.id,
          makeAsServiceShop: item.makeAsServiceShop || false,
        }));
        // Sort vendors: makeAsServiceShop === true first, then alphabetically
        const sortedVendors = formattedData.sort((a, b) => {
          if (a.makeAsServiceShop && !b.makeAsServiceShop) return -1;
          if (!a.makeAsServiceShop && b.makeAsServiceShop) return 1;
          return (a.label || a.value || '').localeCompare(b.label || b.value || '');
        });
        setVendorOptions(sortedVendors);
        // Extract vendor names as strings for the modal (already sorted)
        const vendorNames = sortedVendors.map(item => item.label || item.value).filter(Boolean);
        setVendorNameOptions(vendorNames);
      } else {
        console.log('Error fetching vendor names.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Initialize selectedVendors from vendors that are already marked as service shops
  useEffect(() => {
    if (vendorOptions.length > 0 && previousSelectedVendors.length === 0 && selectedVendors.length === 0) {
      const initialSelected = vendorOptions
        .filter(vendor => vendor.makeAsServiceShop === true)
        .map(vendor => vendor.value)
        .filter(Boolean);

      // Always set previousSelectedVendors, even if empty, so comparison works correctly
      setPreviousSelectedVendors(initialSelected);

      if (initialSelected.length > 0) {
        setSelectedVendors(initialSelected);
      }
    }
  }, [vendorOptions]);

  // Refresh vendor data from API
  const refreshVendorData = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll', {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAllVendorData(data);
        const formattedData = data.map(item => ({
          value: item.vendorName,
          label: item.vendorName,
          id: item.id,
          makeAsServiceShop: item.makeAsServiceShop || false,
        }));
        // Sort vendors: makeAsServiceShop === true first, then alphabetically
        const sortedVendors = formattedData.sort((a, b) => {
          if (a.makeAsServiceShop && !b.makeAsServiceShop) return -1;
          if (!a.makeAsServiceShop && b.makeAsServiceShop) return 1;
          return (a.label || a.value || '').localeCompare(b.label || b.value || '');
        });
        setVendorOptions(sortedVendors);
        // Extract vendor names as strings for the modal (already sorted)
        const vendorNames = sortedVendors.map(item => item.label || item.value).filter(Boolean);
        setVendorNameOptions(vendorNames);
      }
    } catch (error) {
      console.error("Error refreshing vendor data: ", error);
    }
  };

  // Update service shop status when vendors are selected/deselected
  const updateServiceShopStatus = async (newSelectedVendors) => {
    try {
      // Process all vendors - update based on whether they're in the new selection
      const updatePromises = [];
      for (const vendor of vendorOptions) {
        if (vendor.id && vendor.value) {
          const shouldBeSelected = newSelectedVendors.includes(vendor.value);
          const wasSelected = previousSelectedVendors.includes(vendor.value);
          // Only update if the status needs to change
          if (shouldBeSelected !== wasSelected) {
            const url = `https://backendaab.in/aabuilderDash/api/vendor_Names/${vendor.id}/make-store?makeAsServiceStore=${shouldBeSelected}`;
            const updatePromise = fetch(url, {
              method: 'PUT',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            })
              .then(response => {
                if (response.ok) {
                  return { success: true, vendorId: vendor.id, vendorName: vendor.value };
                } else {
                  console.error(`✗ Failed to update vendor ${vendor.id}: ${response.status} ${response.statusText}`);
                  return { success: false, vendorId: vendor.id, vendorName: vendor.value, error: response.statusText };
                }
              })
              .catch(error => {
                console.error(`✗ Error updating vendor ${vendor.id}:`, error);
                return { success: false, vendorId: vendor.id, vendorName: vendor.value, error: error.message };
              });
            updatePromises.push(updatePromise);
          }
        }
      }
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      // Update previous selection for next comparison
      setPreviousSelectedVendors(newSelectedVendors);
      // Refresh vendor data to get updated makeAsServiceShop values
      await refreshVendorData();
    } catch (error) {
      console.error('Error updating service shop status:', error);
    }
  };
  const [sheetOpenPicker, setSheetOpenPicker] = useState(null);
  const [sheetPickerSearch, setSheetPickerSearch] = useState('');
  const handleAddNew = () => {
    setShowAddNewSheet(true);
  };
  const handleCloseAddNewSheet = () => {
    setShowAddNewSheet(false);
    setSheetOpenPicker(null);
    setSheetPickerSearch('');
  };
  const handleAddSheetFieldChange = (field, value) => {
    setAddSheetForm(prev => ({ ...prev, [field]: value }));
  };
  const handleAddSheetSave = () => {
    // Save logic - no-op to keep existing behavior
    handleCloseAddNewSheet();
  };
  const getPickerOptions = () => {
    if (!sheetOpenPicker) return [];
    const opts = { itemName: itemNameOptions, itemId: sheetItemIdOptions, model: modelOptions, brand: brandOptions, purchaseStore: purchaseStoreOptions }[sheetOpenPicker] || [];
    const q = (sheetPickerSearch || '').trim().toLowerCase();
    if (!q) return opts;
    return opts.filter(o => String(o).toLowerCase().includes(q));
  };
  const getPickerPlaceholder = () => {
    const pl = { itemName: 'Select', itemId: 'Select', model: 'Select', brand: 'Select', purchaseStore: 'Select' }[sheetOpenPicker];
    return pl || 'Select';
  };
  const openSheetPicker = (field) => {
    setSheetOpenPicker(field);
    setSheetPickerSearch('');
  };
  const closeSheetPicker = () => {
    setSheetOpenPicker(null);
    setSheetPickerSearch('');
  };
  const handleSheetPickerSelect = (field, value) => {
    handleAddSheetFieldChange(field, value);
    closeSheetPicker();
  };
  const renderSheetDropdown = (field, value, placeholder) => (
    <div className="relative w-full">
      <div
        onClick={() => openSheetPicker(field)}
        className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
        style={{ color: value ? '#000' : '#9E9E9E', boxSizing: 'border-box', paddingRight: '40px' }}
      >
        {value || placeholder}
      </div>
      {value && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleAddSheetFieldChange(field, ''); }}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  );
  return (
    <div className="flex flex-col min-h-[calc(100vh-90px-80px)] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Category Section */}
      <div className="flex-shrink-0 px-4 pt-2 pb-3">
        <div className="flex items-center justify-between border-b border-gray-200 gap-2">
          <p className="text-[12px] mb-2 font-medium text-black leading-normal">Category</p>
          <button
            onClick={() => setShowVendorsModal(true)}
            className="text-[12px] mb-2 font-medium text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity"
          >
            Manage shops
          </button>
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
      <div className="fixed bottom-[110px] right-[24px] lg:right-[calc(50%-164px)] z-30 cursor-pointer" onClick={handleAddNew} >
        <div className="bg-black rounded-full px-4 py-2 flex items-center gap-2 h-[43px]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-white text-[14px] font-medium">Add New</span>
        </div>
      </div>
      {/* Select Filters Bottom Sheet Modal */}
      {showAddNewSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }} onClick={handleCloseAddNewSheet}>
          <div className="bg-white w-full max-w-[360px] max-h-[70vh] rounded-tl-[16px] rounded-tr-[16px] relative z-50 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 pt-5 pb-1">
              <p className="text-[16px] font-bold text-black">Select Filters</p>
              <button type="button" onClick={handleCloseAddNewSheet} className="text-[#e06256] text-xl font-bold leading-none">
                ×
              </button>
            </div>
            {/* Form - scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-1">
              {/* Row 1: Item Name* + Quantity (half) */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Item Name<span className="text-[#eb2f8e]">*</span>
                  </p>
                  <div className='w-[220px]'>
                    {renderSheetDropdown('itemName', addSheetForm.itemName, 'Select')}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Quantity</p>
                  <input
                    type="text"
                    value={addSheetForm.quantity}
                    onChange={(e) => handleAddSheetFieldChange('quantity', e.target.value)}
                    className="w-full h-[32px] border border-[#d6d6d6] px-3 text-[12px] font-medium focus:outline-none text-gray-700"
                    placeholder="0"
                  />
                </div>
              </div>
              {/* Row 2: Item ID + Model* */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">Item ID</p>
                  {renderSheetDropdown('itemId', addSheetForm.itemId, 'Select')}
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Model<span className="text-[#eb2f8e]">*</span>
                  </p>
                  {renderSheetDropdown('model', addSheetForm.model, 'Select')}
                </div>
              </div>
              {/* Row 3: Machine Number* + Brand* */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Machine Number<span className="text-[#eb2f8e]">*</span>
                  </p>
                  <input
                    type="text"
                    value={addSheetForm.machineNumber}
                    onChange={(e) => handleAddSheetFieldChange('machineNumber', e.target.value)}
                    className="w-full h-[32px] border border-[#d6d6d6] px-3 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
                    placeholder="Enter"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Brand<span className="text-[#eb2f8e]">*</span>
                  </p>
                  {renderSheetDropdown('brand', addSheetForm.brand, 'Select')}
                </div>
              </div>
              {/* Row 4: Purchase Date* + Warranty Date* */}
              <div className="flex gap-3 w-[100px] mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Purchase Date<span className="text-[#eb2f8e]">*</span>
                  </p>
                  <div className="relative">
                    <input
                      type="date"
                      value={addSheetForm.purchaseDate}
                      onChange={(e) => handleAddSheetFieldChange('purchaseDate', e.target.value)}
                      className="w-[150px] h-[32px] border border-[#d6d6d6] pl-3 pr-3 text-[12px] font-medium focus:outline-none text-gray-700"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Warranty Date<span className="text-[#eb2f8e]">*</span>
                  </p>
                  <div className="relative">
                    <input
                      type="date"
                      value={addSheetForm.warrantyDate}
                      onChange={(e) => handleAddSheetFieldChange('warrantyDate', e.target.value)}
                      className="w-[150px] h-[32px] border border-[#d6d6d6] pl-3 pr-3 text-[12px] font-medium focus:outline-none text-gray-700"
                    />
                  </div>
                </div>
              </div>
              {/* Row 5: Contact* + Purchase Store* */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Contact<span className="text-[#eb2f8e]">*</span>
                  </p>
                  <input
                    type="text"
                    value={addSheetForm.contact}
                    onChange={(e) => handleAddSheetFieldChange('contact', e.target.value)}
                    className="w-full h-[32px] border border-[#d6d6d6] px-3 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
                    placeholder="Enter"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-black mb-1">
                    Purchase Store<span className="text-[#eb2f8e]">*</span>
                  </p>
                  {renderSheetDropdown('purchaseStore', addSheetForm.purchaseStore, 'Select')}
                </div>
              </div>
              {/* Row 6: Shop Address* full width */}
              <div className="mb-2">
                <p className="text-[12px] font-medium text-black mb-1">
                  Shop Address<span className="text-[#eb2f8e]">*</span>
                </p>
                <input
                  type="text"
                  value={addSheetForm.shopAddress}
                  onChange={(e) => handleAddSheetFieldChange('shopAddress', e.target.value)}
                  className="w-full h-[32px] border border-[#d6d6d6]  px-3 text-[12px] font-medium focus:outline-none text-gray-700 placeholder-gray-500"
                  placeholder="Enter"
                />
              </div>
              {/* Attach File */}
              <div className="">
                <label htmlFor="add-sheet-attach-file" className="flex items-center gap-1 cursor-pointer text-[12px] font-medium text-[#E4572E]">
                  <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                  </svg>
                  Attach File
                </label>
                <input id="add-sheet-attach-file" type="file" className="hidden" />
              </div>
            </div>
            {/* Footer: Cancel + Save */}
            <div className="flex-shrink-0 flex gap-4 px-6 pb-6 pt-2">
              <button type="button" onClick={handleCloseAddNewSheet} className="flex-1 h-[40px] border border-black rounded-[8px] text-[14px] font-bold text-black bg-white">
                Cancel
              </button>
              <button type="button" onClick={handleAddSheetSave} className="flex-1 h-[40px] rounded-[8px] text-[14px] font-bold text-white bg-black">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sheet dropdown picker modal (Transfer-style) */}
      {showAddNewSheet && sheetOpenPicker && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeSheetPicker()}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-5">
              <p className="text-[16px] font-semibold text-black">
                Select {({ itemName: 'Item Name', itemId: 'Item ID', model: 'Model', brand: 'Brand', purchaseStore: 'Purchase Store' })[sheetOpenPicker]}
              </p>
              <button type="button" onClick={closeSheetPicker} className="text-red-500 text-[20px] font-semibold hover:opacity-80">
                ×
              </button>
            </div>
            <div className="px-6 pt-4 pb-4">
              <div className="relative">
                <input
                  type="text"
                  value={sheetPickerSearch}
                  onChange={(e) => setSheetPickerSearch(e.target.value)}
                  placeholder="Search"
                  className="w-full h-[32px] pl-10 pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" /><path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto mb-4 px-6">
              <div className="shadow-md rounded-lg overflow-hidden">
                {getPickerOptions().length > 0 ? (
                  getPickerOptions().map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSheetPickerSelect(sheetOpenPicker, opt)}
                      className="w-full h-[40px] px-6 flex items-center text-left hover:bg-[#F5F5F5] transition-colors text-[14px] font-medium text-black"
                    >
                      {opt}
                    </button>
                  ))
                ) : (
                  <p className="text-[14px] font-medium text-[#9E9E9E] text-center py-4">
                    {sheetPickerSearch.trim() ? 'No options found' : 'No options available'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Vendor Names Modal */}
      <SelectLocatorsModal
        isOpen={showVendorsModal}
        onClose={() => setShowVendorsModal(false)}
        onSelect={async (values) => {
          setSelectedVendors(values);
          await updateServiceShopStatus(values);
          // Don't close modal immediately - let user continue selecting
        }}
        selectedValues={selectedVendors}
        options={vendorNameOptions}
        fieldName="Vendor"
        onAddNew={(newVendor) => {
          if (newVendor && !vendorNameOptions.includes(newVendor)) {
            setVendorNameOptions([...vendorNameOptions, newVendor]);
          }
        }}
      />
    </div>
  );
};
export default AddInput;