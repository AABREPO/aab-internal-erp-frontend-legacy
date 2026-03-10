import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import cross from '../Images/cross.png';
import deleteIcon from '../Images/Delete.svg';
import edit from '../Images/Edit.svg';

const API_BASE = 'https://backendaab.in/aabuildersDash';

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

  // Table data
  const [toolsItemNameList, setToolsItemNameList] = useState([]);
  const [toolsBrandList, setToolsBrandList] = useState([]);
  const [toolsItemIdList, setToolsItemIdList] = useState([]);
  const [poCategoryList, setPoCategoryList] = useState([]);

  // Edit modal states
  const [isItemNameEditOpen, setIsItemNameEditOpen] = useState(false);
  const [isBrandEditOpen, setIsBrandEditOpen] = useState(false);
  const [isItemIdEditOpen, setIsItemIdEditOpen] = useState(false);
  const [isCategoryEditOpen, setIsCategoryEditOpen] = useState(false);

  // Edit form values
  const [editItemName, setEditItemName] = useState({ id: '', item_name: '', category_id: '' });
  const [editBrand, setEditBrand] = useState({ id: '', tools_brand: '' });
  const [editItemId, setEditItemId] = useState({ id: '', item_id: '', item_name_id: '' });
  const [editCategory, setEditCategory] = useState({ id: '', category: '' });

  // Add modal states
  const [showAddItemName, setShowAddItemName] = useState(false);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showAddItemId, setShowAddItemId] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Add form values
  const [addItemName, setAddItemName] = useState({ item_name: '', category_id: '' });
  const [addBrand, setAddBrand] = useState('');
  const [addItemId, setAddItemId] = useState({ item_id: '', item_name_id: '' });
  const [addCategory, setAddCategory] = useState('');

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

  const fetchAllData = async () => {
    try {
      const [catRes, brandRes, itemIdRes, itemNameRes] = await Promise.all([
        fetch(`${API_BASE}/api/po_category/getAll`),
        fetch(`${API_BASE}/api/tools_brand/getAll`),
        fetch(`${API_BASE}/api/tools_item_id/getAll`),
        fetch(`${API_BASE}/api/tools_item_name/getAll`),
      ]);
      if (catRes.ok) {
        const data = await catRes.json();
        const options = data.map(item => ({
          value: item.category,
          label: item.category,
          id: item.id,
        }));
        setCategoryOptions(options);
        setPoCategoryList(data);
        const electrical = options.find(opt => opt.value === 'Electrical');
        if (electrical) setSelectedCategory(electrical);
      }
      if (brandRes.ok) {
        const data = await brandRes.json();
        setToolsBrandList(data);
        setBrandOptions(data.map(b => ({ value: b.tools_brand, label: b.tools_brand, id: b.id })));
      }
      if (itemIdRes.ok) {
        const data = await itemIdRes.json();
        setToolsItemIdList(data);
      }
      if (itemNameRes.ok) {
        const data = await itemNameRes.json();
        setToolsItemNameList(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredItemNames = toolsItemNameList.filter(item =>
    (item.item_name || '').toLowerCase().includes(itemNameSearch.toLowerCase())
  );
  const filteredBrands = toolsBrandList.filter(item =>
    (item.tools_brand || '').toLowerCase().includes(brandSearch.toLowerCase())
  );
  const filteredItemIds = toolsItemIdList.filter(item =>
    (item.item_id || '').toLowerCase().includes(itemIdSearch.toLowerCase())
  );
  const filteredCategories = poCategoryList.filter(item =>
    (item.category || '').toLowerCase().includes(categorySearch.toLowerCase())
  );

  const itemNameOptions = toolsItemNameList.map(item => ({
    value: String(item.id),
    label: item.item_name || '-',
    id: item.id,
  }));

  const openEditItemName = (item) => {
    setEditItemName({
      id: item.id,
      item_name: item.item_name || '',
      category_id: item.category_id || '',
    });
    setIsItemNameEditOpen(true);
  };
  const openEditBrand = (item) => {
    setEditBrand({ id: item.id, tools_brand: item.tools_brand || '' });
    setIsBrandEditOpen(true);
  };
  const openEditItemId = (item) => {
    setEditItemId({
      id: item.id,
      item_id: item.item_id || '',
      item_name_id: item.item_name_id || '',
    });
    setIsItemIdEditOpen(true);
  };
  const openEditCategory = (item) => {
    setEditCategory({ id: item.id, category: item.category || '' });
    setIsCategoryEditOpen(true);
  };

  const handleSubmitEditItemName = async (e) => {
    e.preventDefault();
    const existingItem = toolsItemNameList.find(i => i.id === editItemName.id);
    const toolsDetails = existingItem?.tools_details || [];
    try {
      const res = await fetch(`${API_BASE}/api/tools_item_name/edit/${editItemName.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: editItemName.item_name,
          category_id: editItemName.category_id,
          tools_details: toolsDetails,
        }),
      });
      if (res.ok) {
        setIsItemNameEditOpen(false);
        fetchAllData();
      } else console.error('Failed to update item name');
    } catch (err) {
      console.error(err);
    }
  };
  const handleSubmitEditBrand = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/tools_brand/edit/${editBrand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools_brand: editBrand.tools_brand }),
      });
      if (res.ok) {
        setIsBrandEditOpen(false);
        fetchAllData();
      } else console.error('Failed to update brand');
    } catch (err) {
      console.error(err);
    }
  };
  const handleSubmitEditItemId = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/tools_item_id/edit/${editItemId.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: editItemId.item_id,
          item_name_id: editItemId.item_name_id,
        }),
      });
      if (res.ok) {
        setIsItemIdEditOpen(false);
        fetchAllData();
      } else console.error('Failed to update item ID');
    } catch (err) {
      console.error(err);
    }
  };
  const handleSubmitEditCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/po_category/edit/${editCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: editCategory.category }),
      });
      if (res.ok) {
        setIsCategoryEditOpen(false);
        fetchAllData();
      } else console.error('Failed to update category');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItemName = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Item Name?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/tools_item_name/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllData();
      } else alert('Failed to delete');
    } catch (err) {
      console.error(err);
    }
  };
  const handleDeleteBrand = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Brand?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/tools_brand/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllData();
      } else alert('Failed to delete');
    } catch (err) {
      console.error(err);
    }
  };
  const handleDeleteItemId = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Item ID?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/tools_item_id/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllData();
      } else alert('Failed to delete');
    } catch (err) {
      console.error(err);
    }
  };
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Category?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/po_category/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllData();
      } else alert('Failed to delete');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItemName = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/tools_item_name/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: addItemName.item_name,
          category_id: addItemName.category_id,
          tools_details: [],
        }),
      });
      if (res.ok) {
        setShowAddItemName(false);
        setAddItemName({ item_name: '', category_id: '' });
        fetchAllData();
      } else console.error('Failed to add item name');
    } catch (err) {
      console.error(err);
    }
  };
  const handleAddBrand = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/tools_brand/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools_brand: addBrand }),
      });
      if (res.ok) {
        setShowAddBrand(false);
        setAddBrand('');
        fetchAllData();
      } else console.error('Failed to add brand');
    } catch (err) {
      console.error(err);
    }
  };
  const handleAddItemId = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/tools_item_id/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: addItemId.item_id,
          item_name_id: addItemId.item_name_id,
        }),
      });
      if (res.ok) {
        setShowAddItemId(false);
        setAddItemId({ item_id: '', item_name_id: '' });
        fetchAllData();
      } else console.error('Failed to add item ID');
    } catch (err) {
      console.error(err);
    }
  };
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/po_category/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: addCategory }),
      });
      if (res.ok) {
        setShowAddCategory(false);
        setAddCategory('');
        fetchAllData();
      } else console.error('Failed to add category');
    } catch (err) {
      console.error(err);
    }
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
                <button className="text-sm sm:text-base border-dashed border-b-2 border-[#BF9853] font-semibold w-fit" onClick={() => setShowAddItemName(true)}>+ Add</button>
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
                      <th className="px-2 sm:px-4 py-2 font-bold text-sm sm:text-base w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItemNames.map((item, index) => (
                      <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED] group">
                        <td className="px-2 sm:px-4 py-2 font-semibold text-sm">{(index + 1).toString().padStart(2, '0')}</td>
                        <td className="px-2 sm:px-4 py-2 font-semibold text-sm">{item.item_name || '-'}</td>
                        <td className="px-2 sm:px-4 py-2">
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button type="button" onClick={() => openEditItemName(item)}>
                              <img src={edit} alt="edit" className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleDeleteItemName(item.id)}>
                              <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                <button className="text-sm sm:text-base border-dashed border-b-2 border-[#BF9853] font-semibold w-fit" onClick={() => setShowAddBrand(true)}>+ Add</button>
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
                      <th className="px-2 sm:px-4 py-2 font-bold text-sm sm:text-base w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrands.map((item, index) => (
                      <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED] group">
                        <td className="px-2 sm:px-4 py-2 font-semibold text-sm">{(index + 1).toString().padStart(2, '0')}</td>
                        <td className="px-2 sm:px-4 py-2 font-semibold text-sm">{item.tools_brand || '-'}</td>
                        <td className="px-2 sm:px-4 py-2">
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button type="button" onClick={() => openEditBrand(item)}>
                              <img src={edit} alt="edit" className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleDeleteBrand(item.id)}>
                              <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                <button className="text-sm sm:text-base border-dashed border-b-2 border-[#BF9853] font-semibold w-fit" onClick={() => setShowAddItemId(true)}>+ Add</button>
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
                      <th className="px-2 sm:px-4 py-2 font-bold text-sm sm:text-base w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItemIds.map((item, index) => (
                      <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED] group">
                        <td className="px-2 sm:px-4 py-2 font-semibold text-sm">{(index + 1).toString().padStart(2, '0')}</td>
                        <td className="px-2 sm:px-4 py-2 font-semibold text-sm">{item.item_id || '-'}</td>
                        <td className="px-2 sm:px-4 py-2">
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button type="button" onClick={() => openEditItemId(item)}>
                              <img src={edit} alt="edit" className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleDeleteItemId(item.id)}>
                              <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                <button className="text-sm sm:text-base border-dashed border-b-2 border-[#BF9853] font-semibold w-fit" onClick={() => setShowAddCategory(true)}>+ Add</button>
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
                      <th className="px-2 sm:px-4 py-2 font-bold text-sm sm:text-base w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((item, index) => (
                      <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED] group">
                        <td className="px-2 sm:px-4 py-2 font-semibold text-sm">{(index + 1).toString().padStart(2, '0')}</td>
                        <td className="px-2 sm:px-4 py-2 font-semibold text-sm">{item.category || '-'}</td>
                        <td className="px-2 sm:px-4 py-2">
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button type="button" onClick={() => openEditCategory(item)}>
                              <img src={edit} alt="edit" className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleDeleteCategory(item.id)}>
                              <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Modals */}
      {isItemNameEditOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Item Name</h2>
              <button onClick={() => setIsItemNameEditOpen(false)} className="text-red-500 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmitEditItemName}>
              <label className="block font-semibold mb-2">Item Name <span className="text-red-500">*</span></label>
              <input type="text" value={editItemName.item_name} onChange={(e) => setEditItemName({ ...editItemName, item_name: e.target.value })} className="w-full border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 mb-4" required />
              <label className="block font-semibold mb-2">Category</label>
              <Select value={categoryOptions.find(o => String(o?.id) === String(editItemName.category_id)) || null} onChange={(opt) => setEditItemName({ ...editItemName, category_id: opt ? String(opt.id) : '' })} options={categoryOptions} isSearchable styles={customSelectStyles} className="mb-4" placeholder="Select Category" />
              <div className="flex gap-2 justify-end">
                <button type="button" className="border-2 border-[#BF9853] text-[#BF9853] px-4 py-2 rounded-lg" onClick={() => setIsItemNameEditOpen(false)}>Cancel</button>
                <button type="submit" className="bg-[#BF9853] text-white px-4 py-2 rounded-lg">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isBrandEditOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Brand</h2>
              <button onClick={() => setIsBrandEditOpen(false)} className="text-red-500 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmitEditBrand}>
              <label className="block font-semibold mb-2">Brand <span className="text-red-500">*</span></label>
              <input type="text" value={editBrand.tools_brand} onChange={(e) => setEditBrand({ ...editBrand, tools_brand: e.target.value })} className="w-full border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 mb-4" required />
              <div className="flex gap-2 justify-end">
                <button type="button" className="border-2 border-[#BF9853] text-[#BF9853] px-4 py-2 rounded-lg" onClick={() => setIsBrandEditOpen(false)}>Cancel</button>
                <button type="submit" className="bg-[#BF9853] text-white px-4 py-2 rounded-lg">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isItemIdEditOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Item ID</h2>
              <button onClick={() => setIsItemIdEditOpen(false)} className="text-red-500 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmitEditItemId}>
              <label className="block font-semibold mb-2">Item ID <span className="text-red-500">*</span></label>
              <input type="text" value={editItemId.item_id} onChange={(e) => setEditItemId({ ...editItemId, item_id: e.target.value })} className="w-full border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 mb-4" required />
              <label className="block font-semibold mb-2">Item Name</label>
              <Select
                value={itemNameOptions.find(o => String(o.value) === String(editItemId.item_name_id)) || null}
                onChange={(opt) => setEditItemId({ ...editItemId, item_name_id: opt ? opt.value : '' })}
                options={itemNameOptions}
                isClearable
                isSearchable
                styles={customSelectStyles}
                className="mb-4 text-left"
                placeholder="Select Item Name"
              />
              <div className="flex gap-2 justify-end">
                <button type="button" className="border-2 border-[#BF9853] text-[#BF9853] px-4 py-2 rounded-lg" onClick={() => setIsItemIdEditOpen(false)}>Cancel</button>
                <button type="submit" className="bg-[#BF9853] text-white px-4 py-2 rounded-lg">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isCategoryEditOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Category</h2>
              <button onClick={() => setIsCategoryEditOpen(false)} className="text-red-500 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmitEditCategory}>
              <label className="block font-semibold mb-2">Category <span className="text-red-500">*</span></label>
              <input type="text" value={editCategory.category} onChange={(e) => setEditCategory({ ...editCategory, category: e.target.value })} className="w-full border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 mb-4" required />
              <div className="flex gap-2 justify-end">
                <button type="button" className="border-2 border-[#BF9853] text-[#BF9853] px-4 py-2 rounded-lg" onClick={() => setIsCategoryEditOpen(false)}>Cancel</button>
                <button type="submit" className="bg-[#BF9853] text-white px-4 py-2 rounded-lg">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Modals */}
      {showAddItemName && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Item Name</h2>
              <button onClick={() => setShowAddItemName(false)} className="text-red-500 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleAddItemName}>
              <label className="block font-semibold mb-2">Item Name <span className="text-red-500">*</span></label>
              <input type="text" value={addItemName.item_name} onChange={(e) => setAddItemName({ ...addItemName, item_name: e.target.value })} className="w-full border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 mb-4" required />
              <label className="block font-semibold mb-2">Category</label>
              <Select value={categoryOptions.find(o => String(o?.id) === String(addItemName.category_id)) || null} onChange={(opt) => setAddItemName({ ...addItemName, category_id: opt ? String(opt.id) : '' })} options={categoryOptions} isSearchable styles={customSelectStyles} className="mb-4" placeholder="Select Category" />
              <div className="flex gap-2 justify-end">
                <button type="button" className="border-2 border-[#BF9853] text-[#BF9853] px-4 py-2 rounded-lg" onClick={() => setShowAddItemName(false)}>Cancel</button>
                <button type="submit" className="bg-[#BF9853] text-white px-4 py-2 rounded-lg">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAddBrand && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Brand</h2>
              <button onClick={() => setShowAddBrand(false)} className="text-red-500 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleAddBrand}>
              <label className="block font-semibold mb-2">Brand <span className="text-red-500">*</span></label>
              <input type="text" value={addBrand} onChange={(e) => setAddBrand(e.target.value)} className="w-full border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 mb-4" required />
              <div className="flex gap-2 justify-end">
                <button type="button" className="border-2 border-[#BF9853] text-[#BF9853] px-4 py-2 rounded-lg" onClick={() => setShowAddBrand(false)}>Cancel</button>
                <button type="submit" className="bg-[#BF9853] text-white px-4 py-2 rounded-lg">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAddItemId && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Item ID</h2>
              <button onClick={() => setShowAddItemId(false)} className="text-red-500 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleAddItemId}>
              <label className="block font-semibold mb-2">Item ID <span className="text-red-500">*</span></label>
              <input type="text" value={addItemId.item_id} onChange={(e) => setAddItemId({ ...addItemId, item_id: e.target.value })} className="w-full border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 mb-4" required />
              <label className="block font-semibold mb-2">Item Name</label>
              <Select
                value={itemNameOptions.find(o => String(o.value) === String(addItemId.item_name_id)) || null}
                onChange={(opt) => setAddItemId({ ...addItemId, item_name_id: opt ? opt.value : '' })}
                options={itemNameOptions}
                isSearchable
                styles={customSelectStyles}
                className="mb-4"
                placeholder="Select Item Name"
              />
              <div className="flex gap-2 justify-end">
                <button type="button" className="border-2 border-[#BF9853] text-[#BF9853] px-4 py-2 rounded-lg" onClick={() => setShowAddItemId(false)}>Cancel</button>
                <button type="submit" className="bg-[#BF9853] text-white px-4 py-2 rounded-lg">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAddCategory && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Category</h2>
              <button onClick={() => setShowAddCategory(false)} className="text-red-500 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleAddCategory}>
              <label className="block font-semibold mb-2">Category <span className="text-red-500">*</span></label>
              <input type="text" value={addCategory} onChange={(e) => setAddCategory(e.target.value)} className="w-full border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 mb-4" required />
              <div className="flex gap-2 justify-end">
                <button type="button" className="border-2 border-[#BF9853] text-[#BF9853] px-4 py-2 rounded-lg" onClick={() => setShowAddCategory(false)}>Cancel</button>
                <button type="submit" className="bg-[#BF9853] text-white px-4 py-2 rounded-lg">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add New Item Modal */}
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