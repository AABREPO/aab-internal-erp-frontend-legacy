import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import cross from '../Images/cross.png';

const ToolsTrackerAddInput = () => {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showManageShopsModal, setShowManageShopsModal] = useState(false);

  // Search states for each table
  const [itemNameSearch, setItemNameSearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [itemIdSearch, setItemIdSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  const [brandOptions, setBrandOptions] = useState([]);
  const [purchaseStoreOptions, setPurchaseStoreOptions] = useState([
    { value: 'Guru Electricals', label: 'Guru Electricals' }
  ]);

  // Manage Shops Modal states
  const [shopSearch, setShopSearch] = useState('');
  const [selectedShops, setSelectedShops] = useState(new Set([
    'Manickam Electricals',
    'Rajaguru Electricals',
    'Guru Electricals',
    'Vinayagam Electricals',
    'Amazon',
    'Flipkart'
  ]));

  const [allShops] = useState([
    'Manickam Electricals',
    'Rajaguru Electricals',
    'Guru Electricals',
    'Vinayagam Electricals',
    'Amazon',
    'Flipkart',
    'Pannady Tiles',
    'Rajaganapathy Plywoods',
    'Sriram Pipes',
    'Sriram Electricals',
    'VA Traders',
    'SVS Bluemetals'
  ]);

  // Form states for modal
  const [formData, setFormData] = useState({
    itemName: '',
    brand: null,
    itemId: '',
    model: '',
    machineNumber: '',
    purchaseDate: '',
    purchaseStore: { value: 'Guru Electricals', label: 'Guru Electricals' },
    warrantyDate: '',
    contactNumber: '',
    shopAddress: '',
  });

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
      {/* Four Tables Section */}
      <div className="p-2 sm:p-4 bg-white ml-2 sm:ml-4 lg:ml-6 lg:w-[1800px] mr-2 sm:mr-4 lg:mr-8">
        <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 pb-4 gap-4'>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Category Selector */}
            <div className="w-full sm:w-auto text-left">
              <label className="block font-semibold mb-2">Category</label>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={categoryOptions}
                isSearchable
                styles={customSelectStyles}
                placeholder="Select Category"
                className="w-full sm:w-64"
              />
            </div>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-4 sm:mt-7">
              <button
                className="bg-[#BF9853] text-white font-semibold px-4 sm:px-6 py-2 rounded-lg hover:bg-[#a8874a] transition-colors text-sm sm:text-base"
                onClick={() => setShowModal(true)}
              >
                + Add New Item
              </button>
              <button className="bg-[#BF9853] text-white font-semibold px-4 sm:px-6 py-2 rounded-lg hover:bg-[#a8874a] transition-colors text-sm sm:text-base">
                Edit
              </button>
            </div>
          </div>
          <div>
            <button
              className="bg-[#BF9853] text-white font-semibold px-4 sm:px-6 py-2 rounded-lg hover:bg-[#a8874a] transition-colors w-full sm:w-auto text-sm sm:text-base"
              onClick={() => setShowManageShopsModal(true)}
            >
              Manage Shops
            </button>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row mt-1">
          <div className="bg-white p-3 sm:p-5 rounded-lg flex flex-col lg:flex-row mb-5 gap-4 sm:gap-8 overflow-x-auto">
            {/* Item Name Table */}
            <div className="flex-1 min-w-[280px] sm:min-w-[314px]">
              <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-2 sm:gap-0">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search Item Name"
                    className="border-2 border-[#FAF6ED] rounded-lg px-3 py-2 text-sm w-full sm:w-[253px] h-[45px] pr-8"
                    value={itemNameSearch}
                    onChange={(e) => setItemNameSearch(e.target.value)}
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <img src={search} alt='search' className=' w-5 h-5' />
                  </button>
                </div>
                <button className="text-sm sm:text-base border-dashed border-b-2 border-[#BF9853] font-semibold w-fit">+ Add</button>
              </div>
              <button className="text-[#E4572E] font-semibold mb-2 flex text-sm sm:text-base">
                <img src={imports} alt='import' className=' w-5 sm:w-7 h-5 bg-transparent pr-2 mt-1' />
                <h1 className='mt-1.5'>Import file</h1>
              </button>
              <div
                className="rounded-l-lg"
                style={{ borderLeft: '8px solid #BF9853' }}
              >
                <table className="text-left w-full sm:w-[314px]">
                  <thead className="bg-[#FAF6ED]">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 font-bold text-sm sm:text-base">Sl.No</th>
                      <th className="px-2 sm:px-4 py-2 font-bold text-sm sm:text-base">Item Name</th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Brand Table */}
            <div className="flex-1 min-w-[220px] sm:min-w-[249px]">
              <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-2 sm:gap-0">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search Brand.."
                    className="border-2 border-[#FAF6ED] rounded-lg px-3 py-2 text-sm w-full sm:w-[179px] h-[45px] pr-8"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <img src={search} alt='search' className=' w-5 h-5' />
                  </button>
                </div>
                <button className="text-sm sm:text-base border-dashed border-b-2 border-[#BF9853] font-semibold w-fit">+ Add</button>
              </div>
              <button className="text-[#E4572E] font-semibold mb-2 flex text-sm sm:text-base">
                <img src={imports} alt='import' className=' w-5 sm:w-7 h-5 bg-transparent pr-2 mt-1' />
                <h1 className='mt-1.5'>Import file</h1>
              </button>
              <div
                className="rounded-l-lg overflow-x-auto"
                style={{ borderLeft: '8px solid #BF9853' }}
              >
                <table className="text-left w-full sm:w-[249px]">
                  <thead className="bg-[#FAF6ED]">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 font-bold text-sm sm:text-base">Sl.No</th>
                      <th className="px-2 sm:px-4 py-2 font-bold text-sm sm:text-base">Brand</th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Item ID Table */}
            <div className="flex-1 min-w-[230px] sm:min-w-[256px]">
              <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-2 sm:gap-0">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search Item ID..."
                    className="border-2 border-[#FAF6ED] rounded-lg px-3 py-2 text-sm w-full sm:w-[195px] h-[45px] pr-8"
                    value={itemIdSearch}
                    onChange={(e) => setItemIdSearch(e.target.value)}
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <img src={search} alt='search' className=' w-5 h-5' />
                  </button>
                </div>
                <button className="text-sm sm:text-base border-dashed border-b-2 border-[#BF9853] font-semibold w-fit">+ Add</button>
              </div>
              <button className="text-[#E4572E] font-semibold mb-2 flex text-sm sm:text-base">
                <img src={imports} alt='import' className=' w-5 sm:w-7 h-5 bg-transparent pr-2 mt-1' />
                <h1 className='mt-1.5'>Import file</h1>
              </button>
              <div
                className="rounded-l-lg overflow-x-auto"
                style={{ borderLeft: '8px solid #BF9853' }}
              >
                <table className="text-left w-full sm:w-[256px]">
                  <thead className="bg-[#FAF6ED]">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 font-bold text-sm sm:text-base">Sl.No</th>
                      <th className="px-2 sm:px-4 py-2 font-bold text-sm sm:text-base">Item ID</th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Category Table */}
            <div className="flex-1 min-w-[250px] sm:min-w-[280px]">
              <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-2 sm:gap-0">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search Category Na.."
                    className="border-2 border-[#FAF6ED] rounded-lg px-3 py-2 text-sm w-full sm:w-[219px] h-[45px] pr-8"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <img src={search} alt='search' className=' w-5 h-5' />
                  </button>
                </div>
                <button className="text-sm sm:text-base border-dashed border-b-2 border-[#BF9853] font-semibold w-fit">+ Add</button>
              </div>
              <button className="text-[#E4572E] font-semibold mb-2 flex text-sm sm:text-base">
                <img src={imports} alt='import' className=' w-5 sm:w-7 h-5 bg-transparent pr-2 mt-1' />
                <h1 className='mt-1.5'>Import file</h1>
              </button>
              <div
                className="rounded-l-lg"
                style={{ borderLeft: '8px solid #BF9853' }}
              >
                <table className="text-left w-full sm:w-[280px]">
                  <thead className="bg-[#FAF6ED]">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 font-bold text-sm sm:text-base">Sl.No</th>
                      <th className="px-2 sm:px-4 py-2 font-bold text-sm sm:text-base">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-[652px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8 text-left relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Input Data</h2>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => setShowModal(false)}
              >
                <img src={cross} alt="close" className="w-5 h-5" />
              </button>
            </div>
            {/* Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              setShowModal(false);
            }}>
              <div className="gap-4 mb-4">
                {/* Row 1 */}
                <div className="flex flex-col sm:flex-row gap-4 mb-2">
                  <div className="flex-1">
                    <label className="block font-semibold mb-2 text-sm sm:text-base">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full sm:w-[375px] border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 h-[45px] focus:outline-none"
                      placeholder="Drilling Machine"
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <label className="block font-semibold mb-2 text-sm sm:text-base">Brand</label>
                    <Select
                      value={formData.brand}
                      onChange={(selected) => setFormData({ ...formData, brand: selected })}
                      options={brandOptions}
                      placeholder="Select Brand"
                      isSearchable
                      styles={customSelectStyles}
                      className="w-full sm:w-[180px] h-[45px]"
                    />
                  </div>
                </div>
                {/* Row 2 */}
                <div className="flex flex-col sm:flex-row gap-4 mb-2">
                  <div className="flex-1 sm:flex-none">
                    <label className="block font-semibold mb-2 text-sm sm:text-base">
                      Item ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full sm:w-[180px] border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 h-[45px] focus:outline-none"
                      placeholder="AA DM 06"
                      value={formData.itemId}
                      onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <label className="block font-semibold mb-2 text-sm sm:text-base">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full sm:w-[180px] border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 h-[45px] focus:outline-none"
                      placeholder="ABEFG - 2456"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <label className="block font-semibold mb-2 text-sm sm:text-base">Machine Number</label>
                    <input
                      type="text"
                      className="w-full sm:w-[180px] border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 h-[45px] focus:outline-none"
                      placeholder="Enter Machine Num.."
                      value={formData.machineNumber}
                      onChange={(e) => setFormData({ ...formData, machineNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-2">
                  {/* Row 3 */}
                  <div className="flex-1 sm:flex-none">
                    <label className="block font-semibold mb-2 text-sm sm:text-base">Purchase Date</label>
                    <input
                      type="date"
                      className="w-full sm:w-[180px] border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 h-[45px] focus:outline-none"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    />
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <label className="block font-semibold mb-2 text-sm sm:text-base">Purchase Store</label>
                    <Select
                      value={formData.purchaseStore}
                      onChange={(selected) => setFormData({ ...formData, purchaseStore: selected })}
                      options={purchaseStoreOptions}
                      placeholder="Select Store"
                      isSearchable
                      styles={customSelectStyles}
                      className="w-full sm:w-[180px] h-[45px]"
                    />
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <label className="block font-semibold mb-2 text-sm sm:text-base">Warranty Date</label>
                    <input
                      type="date"
                      className="w-full sm:w-[180px] border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 h-[45px] focus:outline-none"
                      value={formData.warrantyDate}
                      onChange={(e) => setFormData({ ...formData, warrantyDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-2">
                  {/* Row 4 */}
                  <div className="flex-1 sm:flex-none">
                    <label className="block font-semibold mb-2 text-sm sm:text-base">Contact Number</label>
                    <input
                      type="text"
                      className="w-full sm:w-[180px] border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 h-[45px] focus:outline-none"
                      placeholder="Enter Mobile Number.."
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-semibold mb-2 text-sm sm:text-base">Shop Address</label>
                    <input
                      type="text"
                      className="w-full sm:w-[372px] border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 h-[45px] focus:outline-none"
                      placeholder="Enter Shop Address.."
                      value={formData.shopAddress}
                      onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="items-center mt-6">
                <button
                  type="button"
                  className="text-[#E4572E] font-semibold flex items-center gap-2 mb-4 sm:mb-6 text-sm sm:text-base"
                  onClick={() => {
                    // Handle file attachment
                    document.getElementById('fileInput').click();
                  }}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Attach File
                </button>
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    // Handle file selection
                    console.log('File selected:', e.target.files[0]);
                  }}
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="bg-[#BF9853] text-white font-semibold px-6 sm:px-8 py-2 rounded-lg hover:bg-[#a8874a] transition-colors text-sm sm:text-base"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="border-2 border-[#BF9853] text-[#BF9853] font-semibold px-6 sm:px-8 py-2 rounded-lg text-sm sm:text-base"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div >
      )}
      {/* Manage Shops Modal */}
      {showManageShopsModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-[447px] max-h-[90vh] sm:h-[559px] p-4 sm:p-6 lg:p-8 relative flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Service Shops</h2>
              <button
                className="text-orange-500 hover:text-orange-700"
                onClick={() => setShowManageShopsModal(false)}
              >
                <img src={cross} alt="close" className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            {/* Search Bar */}
            <div className="relative mb-2">
              <input
                type="text"
                className="w-full sm:w-[318px] h-[45px] border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:border-transparent"
                placeholder="Search Service Shop"
                value={shopSearch}
                onChange={(e) => setShopSearch(e.target.value)}
              />
              <img
                src={search}
                alt="search"
                className="absolute right-3 sm:right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none"
              />
            </div>
            {/* Shop List */}
            <div className="flex-1 sm:ml-7 overflow-y-auto mb-2 w-full sm:w-[318px] h-[300px] sm:h-[364px] rounded-lg shadow-lg">
              {allShops
                .filter(shop =>
                  shop.toLowerCase().includes(shopSearch.toLowerCase())
                )
                .map((shop) => (
                  <div
                    key={shop}
                    className="flex items-center py-3 px-2 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      const newSelected = new Set(selectedShops);
                      if (newSelected.has(shop)) {
                        newSelected.delete(shop);
                      } else {
                        newSelected.add(shop);
                      }
                      setSelectedShops(newSelected);
                    }}
                  >
                    <div className="flex items-center justify-center mr-4 w-5 h-5">
                      {selectedShops.has(shop) ? (
                        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: '#E2F9E1' }}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#034638' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-400 rounded-sm"></div>
                      )}
                    </div>
                    <span className="text-base text-gray-800">{shop}</span>
                  </div>
                ))}
            </div>
            {/* Action Buttons */}
            <div className="flex sm:ml-7 gap-3 sm:gap-4 pt-4 justify-center sm:justify-start">
              <button
                type="button"
                className="bg-[#BF9853] w-full sm:w-[114px] h-[36px] text-white font-bold px-4 rounded-lg hover:bg-[#a8874a] transition-colors text-sm sm:text-base"
                onClick={() => {setShowManageShopsModal(false);}}
              >
                Submit
              </button>
              <button
                type="button"
                className="bg-white w-full sm:w-[114px] h-[36px] border border-[#BF9853] text-[#BF9853] font-bold px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                onClick={() => setShowManageShopsModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default ToolsTrackerAddInput;