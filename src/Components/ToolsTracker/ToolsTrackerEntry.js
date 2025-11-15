import { useState, useEffect, useRef } from 'react';
import deleteIcon from '../Images/Delete.svg';
import Select from 'react-select';

const ToolsTrackerEntry = ({ username, userRoles = [] }) => {
  const [fromOptions, setFromOptions] = useState([]);
  const [toOptions, setToOptions] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [entryNo, setEntryNo] = useState(0);
  const [selectedIncharge, setSelectedIncharge] = useState(null);
  const [siteInchargeOptions, setSiteInchargeOptions] = useState([]);

  // Item selection fields
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState(null);
  const [availableStock, setAvailableStock] = useState(0);
  const [itemIdOptions, setItemIdOptions] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [brandOptions, setBrandOptions] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [machineNumber, setMachineNumber] = useState('');

  // Items list
  const [items, setItems] = useState([]);

  // Photo attachment
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch sites/projects for From and To dropdowns
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
          sNo: item.siteNo,
          id: item.id,
        }));
        setFromOptions(formattedData);
        setToOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchSites();
  }, []);

  // Fetch site incharge
  useEffect(() => {
    const fetchSiteIncharge = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/site_incharge/getAll');
        if (response.ok) {
          const data = await response.json();
          const formatted = data.map((item) => ({
            value: item.id,
            label: item.siteEngineer,
            mobileNumber: item.mobileNumber,
            id: item.id,
          }));
          setSiteInchargeOptions(formatted);
        } else {
          console.log('Error fetching site incharge.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchSiteIncharge();
  }, []);

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
        } else {
          console.log('Error fetching categories.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch item names when category is selected
  useEffect(() => {
    if (selectedCategory) {
      const fetchItemNames = async () => {
        try {
          const response = await fetch('https://backendaab.in/aabuilderDash/api/po_itemNames/getAll');
          if (response.ok) {
            const data = await response.json();
            const filteredItems = data.filter(
              item => item.category?.toLowerCase() === selectedCategory.value?.toLowerCase()
            );
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
    } else {
      setItemNameOptions([]);
      setAvailableStock(0);
    }
  }, [selectedCategory]);

  // Fetch item IDs, brands, and available stock when item name is selected
  useEffect(() => {
    if (selectedItemName && selectedFrom) {
      // TODO: Replace with actual API endpoint for tools tracker
      // For now, simulate fetching available stock
      const fetchItemDetails = async () => {
        try {
          // This should be replaced with actual tools tracker API
          // Example: fetch(`https://backendaab.in/aabuilderDash/api/tools_tracker/available?itemId=${selectedItemName.id}&fromSiteId=${selectedFrom.id}`)

          // Simulating available stock for now
          setAvailableStock(0); // Will be updated when API is available

          // Fetch brands
          const brandResponse = await fetch('https://backendaab.in/aabuilderDash/api/po_brand/getAll');
          if (brandResponse.ok) {
            const brandData = await brandResponse.json();
            const filteredBrands = brandData
              .filter(b => !b.category || b.category?.toLowerCase() === selectedCategory?.value?.toLowerCase())
              .map(b => ({
                value: b.brand?.trim(),
                label: b.brand?.trim(),
                id: b.id
              }))
              .filter(b => b.value);
            setBrandOptions(filteredBrands);
          }

          // TODO: Fetch item IDs for the selected item
          // This would come from a tools tracker API
          setItemIdOptions([]);
        } catch (error) {
          console.error('Error fetching item details:', error);
        }
      };
      fetchItemDetails();
    } else {
      setItemIdOptions([]);
      setBrandOptions([]);
      setAvailableStock(0);
    }
  }, [selectedItemName, selectedFrom, selectedCategory]);

  // Generate entry number
  useEffect(() => {
    if (selectedFrom) {
      const generateEntryNo = async () => {
        try {
          // TODO: Replace with actual API endpoint
          // Example: const response = await fetch(`https://backendaab.in/aabuilderDash/api/tools_tracker/countBySite?siteId=${selectedFrom.id}`);
          // For now, set a placeholder
          setEntryNo(236);
        } catch (error) {
          console.error('Error generating entry number:', error);
        }
      };
      generateEntryNo();
    }
  }, [selectedFrom]);

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
    setSelectedItemName(null);
    setSelectedItemId(null);
    setSelectedBrand(null);
    setAvailableStock(0);
    setMachineNumber('');
  };

  const handleItemNameChange = (selectedOption) => {
    setSelectedItemName(selectedOption);
    setSelectedItemId(null);
    setSelectedBrand(null);
    setMachineNumber('');
  };

  const handleItemIdChange = (selectedOption) => {
    setSelectedItemId(selectedOption);
    // TODO: Fetch machine number based on item ID
    // For now, generate a placeholder
    if (selectedOption) {
      setMachineNumber(Math.random().toString().substring(2, 15));
    } else {
      setMachineNumber('');
    }
  };

  const handleBrandChange = (selectedOption) => {
    setSelectedBrand(selectedOption);
  };

  const handlePhotoAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedPhoto(file);
    }
  };

  const handleAddItem = () => {
    if (!selectedItemName || !selectedBrand || !selectedItemId || !machineNumber) {
      alert("Please fill in all required fields: Item Name, Brand, Item ID, and Machine Number");
      return;
    }

    const newItem = {
      itemName: selectedItemName.label,
      itemId: selectedItemId.label || selectedItemId.value,
      brand: selectedBrand.label,
      machineNumber: machineNumber,
      itemIdValue: selectedItemId.value,
      brandId: selectedBrand.id,
      itemNameId: selectedItemName.id,
    };

    setItems([...items, newItem]);

    // Reset form
    setSelectedItemName(null);
    setSelectedItemId(null);
    setSelectedBrand(null);
    setMachineNumber('');
    setAvailableStock(0);
    setAttachedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleTransfer = async () => {
    if (!selectedFrom || !selectedTo || !selectedIncharge || items.length === 0) {
      alert("Please fill in all required fields and add at least one item");
      return;
    }

    try {
      // TODO: Replace with actual API endpoint
      const payload = {
        from_site_id: selectedFrom.id,
        to_site_id: selectedTo.id,
        date: date,
        entry_no: entryNo,
        project_incharge_id: selectedIncharge.id,
        project_incharge_mobile: selectedIncharge.mobileNumber || "",
        created_by: username,
        items: items.map(item => ({
          item_name_id: item.itemNameId,
          item_id: item.itemIdValue,
          brand_id: item.brandId,
          machine_number: item.machineNumber,
        }))
      };

      // Example API call (replace with actual endpoint)
      const response = await fetch("https://backendaab.in/aabuilderDash/api/tools_tracker/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Transfer completed successfully!");
        // Reset form
        setSelectedFrom(null);
        setSelectedTo(null);
        setSelectedIncharge(null);
        setDate(() => {
          const today = new Date();
          return today.toISOString().split("T")[0];
        });
        setEntryNo(0);
        setItems([]);
      } else {
        const error = await response.text();
        console.error("Error:", error);
        alert("Failed to complete transfer");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Server not responding");
    }
  };

  const customStyles = {
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-[#FAF6ED]">
      {/* Header Section */}
      <div className="p-6 border-collapse bg-[#FFFFFF] rounded-md mx-auto mb-3 ml-5 mr-5">
        <div className="flex flex-wrap gap-[16px]">
          <div className=" text-left">
            <h4 className="font-bold mb-2">From</h4>
            <Select
              value={selectedFrom ? fromOptions.find(option => option.value === selectedFrom.value) : null}
              onChange={(selectedOption) => setSelectedFrom(selectedOption)}
              options={fromOptions}
              placeholder="Select From"
              isSearchable
              isClearable
              className="lg:w-[275px] h-[45px]"
              styles={customStyles}
            />
          </div>
          <div className=" text-left">
            <h4 className="font-bold mb-2">To</h4>
            <Select
              value={selectedTo ? toOptions.find(option => option.value === selectedTo.value) : null}
              onChange={(selectedOption) => setSelectedTo(selectedOption)}
              options={toOptions}
              placeholder="Select To"
              isSearchable
              isClearable
              className="w-[275px] h-[45px]"
              styles={customStyles}
            />
          </div>
          <div className="text-left">
            <h4 className="font-bold mb-2">Date</h4>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-2 border-[#BF9853] border-opacity-35 focus:outline-none lg:w-[168px] h-[45px] rounded-lg px-4 py-2 cursor-pointer"
              />
            </div>
          </div>
          <div className="text-left">
            <h4 className=" font-bold mb-2">E.No</h4>
            <input
              value={entryNo}
              readOnly
              className="border-2 border-[#BF9853] border-opacity-35 focus:outline-none bg-[#F2F2F2] rounded-lg w-[149px] h-[45px] px-2 py-2 appearance-none no-spinner"
            />
          </div>
          <div className="text-left">
            <div className="flex justify-between items-center">
              <h4 className="font-bold mb-2">Project Incharge</h4>
              {selectedIncharge && (
                <span className="text-[#E4572E] text-sm font-bold">
                  {selectedIncharge.mobileNumber}
                </span>
              )}
            </div>
            <Select
              options={siteInchargeOptions}
              value={selectedIncharge}
              onChange={setSelectedIncharge}
              isSearchable
              isClearable
              placeholder="Select Project Incharge"
              className="lg:w-[275px] h-[45px]"
              styles={customStyles}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {(selectedFrom && selectedTo) && (
        <div className="p-6 border-collapse bg-[#FFFFFF] rounded-md mx-auto ml-5 mr-5">
          <div className="lg:flex lg:justify-between lg:gap-10 gap-8">
            <div>
              {/* Left Panel - Item Input Section */}
              <div className="[@media(min-width:1300px)]:space-y-6 text-left lg:w-1/3">
                <div>
                  <label className="block font-semibold [@media(min-width:1300px)]:mb-2">Category</label>
                  <Select
                    value={categoryOptions.find(opt => opt.value === selectedCategory?.value)}
                    onChange={handleCategoryChange}
                    options={categoryOptions}
                    placeholder="Select Category"
                    isSearchable
                    isClearable
                    styles={customStyles}
                    className="lg:w-[224px] h-[45px]"
                  />
                </div>
                <div className='flex gap-8'>
                  <div>
                    <label className="block font-semibold [@media(min-width:1300px)]:mb-2">Item Name</label>
                    <Select
                      value={selectedItemName}
                      onChange={handleItemNameChange}
                      options={itemNameOptions}
                      placeholder="Select Item Name"
                      isSearchable
                      isClearable
                      styles={customStyles}
                      className="lg:w-[275px] h-[45px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold [@media(min-width:1300px)]:mb-2">Available</label>
                    <input
                      type="text"
                      value={availableStock}
                      readOnly
                      className={` w-[80px] h-[45px] pl-3 border-2 border-[#BF9853] border-opacity-[20%] focus:outline-none rounded-lg bg-[#F2F2F2] ${availableStock === 0 ? 'text-red-500' : ''}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold [@media(min-width:1300px)]:mb-2">Item ID</label>
                  <Select
                    value={selectedItemId}
                    onChange={handleItemIdChange}
                    options={itemIdOptions}
                    placeholder="Select Item ID"
                    isSearchable
                    isClearable
                    styles={customStyles}
                    className="lg:w-[275px] h-[45px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold [@media(min-width:1300px)]:mb-2">Brand</label>
                  <Select
                    value={selectedBrand}
                    onChange={handleBrandChange}
                    options={brandOptions}
                    placeholder="Select Brand"
                    isSearchable
                    isClearable
                    styles={customStyles}
                    className="lg:w-[275px] h-[45px]"
                  />
                </div>
                <div>
                  <button
                    onClick={handlePhotoAttach}
                    className="flex items-center gap-2 text-[#BF9853] font-semibold [@media(min-width:1300px)]:mb-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Attach Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {attachedPhoto && (
                    <p className="text-sm text-gray-600 mt-1">{attachedPhoto.name}</p>
                  )}
                </div>
                <button
                  onClick={handleAddItem}
                  className="w-[80px] h-[35px] mt-2 text-white rounded bg-[#707070]"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Right Panel - Items Table */}
            <div className=" mt-3">
              <div className="w-full rounded-lg border-l-8 border-l-[#BF9853] overflow-auto">
                <table className="w-full text-left text-base table-auto min-w-[800px]">
                  <thead className="bg-[#FAF6ED] text-left">
                    <tr className="">
                      <th className="py-2 px-3">Sl.No</th>
                      <th className="py-2 w-60 px-3">Item Name</th>
                      <th className="py-2 px-3">Brand</th>
                      <th className="py-2 px-3">Machine Number</th>
                      <th className="py-2 px-3">Item ID</th>
                      <th className="py-2 px-3">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="odd:bg-white even:bg-[#FAF6ED]">
                        <td className="py-2 px-3 font-semibold">{String(index + 1).padStart(2, '0')}</td>
                        <td className="py-2 px-3 font-semibold">{item.itemName}</td>
                        <td className="py-2 px-3 font-semibold">{item.brand}</td>
                        <td className="py-2 px-3 font-semibold">{item.machineNumber}</td>
                        <td className="py-2 px-3 font-semibold">{item.itemId}</td>
                        <td className="py-2 px-3">
                          <button onClick={() => handleDeleteItem(index)}>
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-500">
                          No items added yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  className="bg-[#BF9853] text-white w-[134px] h-[39px] px-5 rounded flex items-center justify-center gap-2"
                  onClick={handleTransfer}
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default ToolsTrackerEntry;
