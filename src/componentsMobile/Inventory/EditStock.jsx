import React, { useState, useEffect, useMemo, useRef } from 'react';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';

const EditStock = () => {
  // Helper function for date
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const [date, setDate] = useState(getTodayDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectOptions, setProjectOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [poItemNames, setPoItemNames] = useState([]);
  const [poBrands, setPoBrands] = useState([]);
  const [poModel, setPoModel] = useState([]);
  const [poTypes, setPoTypes] = useState([]);
  const [poCategories, setPoCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch project names from API
  useEffect(() => {
    const fetchProjects = async () => {
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
          id: item.id
        }));
        setProjectOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchProjects();
  }, []);

  // Fetch category options
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll');
        if (response.ok) {
          const data = await response.json();
          const options = data.map(item => ({
            value: item.category || item.name || item.label,
            label: item.category || item.name || item.label,
            id: item.id
          })).filter(item => item.value);
          setCategoryOptions(options);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch PO item names, brands, models, types, and categories
  useEffect(() => {
    const fetchPOData = async () => {
      try {
        const [itemNamesRes, brandsRes, modelsRes, typesRes, categoriesRes] = await Promise.all([
          fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll')
        ]);

        if (itemNamesRes.ok) {
          const data = await itemNamesRes.json();
          setPoItemNames(data);
        }
        if (brandsRes.ok) {
          const data = await brandsRes.json();
          setPoBrands(data);
        }
        if (modelsRes.ok) {
          const data = await modelsRes.json();
          setPoModel(data);
        }
        if (typesRes.ok) {
          const data = await typesRes.json();
          setPoTypes(data);
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setPoCategories(data);
        }
      } catch (error) {
        console.error('Error fetching PO data:', error);
      }
    };
    fetchPOData();
  }, []);

  // Helper functions to resolve IDs to names
  const findNameById = (array, id, fieldName) => {
    if (!array || !id || id === 0) return '';
    const item = array.find(i => {
      const itemId = i.id || i._id;
      return String(itemId) === String(id) || Number(itemId) === Number(id);
    });
    if (!item) return '';
    return item[fieldName] || item.name || item.label || '';
  };

  const resolveItemName = (itemId) => {
    return findNameById(poItemNames, itemId, 'itemName') || findNameById(poItemNames, itemId, 'name') || '';
  };

  const resolveBrandName = (brandId) => {
    if (!brandId || brandId === 0) return '';
    return findNameById(poBrands, brandId, 'brand') || findNameById(poBrands, brandId, 'brandName') || findNameById(poBrands, brandId, 'name') || '';
  };

  const resolveModelName = (modelId) => {
    if (!modelId) return '';
    return findNameById(poModel, modelId, 'model') || findNameById(poModel, modelId, 'modelName') || findNameById(poModel, modelId, 'name') || '';
  };

  const resolveTypeName = (typeId) => {
    if (!typeId || typeId === 0) return '';
    return findNameById(poTypes, typeId, 'typeColor') || findNameById(poTypes, typeId, 'type') || findNameById(poTypes, typeId, 'typeName') || findNameById(poTypes, typeId, 'name') || '';
  };

  const resolveCategoryName = (categoryId) => {
    if (!categoryId) return '';
    return findNameById(poCategories, categoryId, 'category') || findNameById(poCategories, categoryId, 'name') || findNameById(poCategories, categoryId, 'label') || '';
  };

  // Fetch inventory data
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://backendaab.in/aabuildersDash/api/inventory/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Filter for outgoing type only (dispatch and stock return)
        const outgoingItems = data.filter(item => {
          const inventoryType = item.inventory_type || item.inventoryType || '';
          const outgoingType = item.outgoing_type || item.outgoingType || '';
          const isDeleted = item.delete_status || item.deleteStatus;
          return String(inventoryType).toLowerCase() === 'outgoing' &&
            (String(outgoingType).toLowerCase() === 'dispatch' || String(outgoingType).toLowerCase() === 'stock return') &&
            !isDeleted;
        });

        setInventoryData(outgoingItems);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        setInventoryData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInventoryData();
  }, []);

  // Process and group inventory data by item and project
  const processedUsageData = useMemo(() => {
    if (!inventoryData.length || !poItemNames.length) return [];

    // Group by: item_id, category_id, model_id, brand_id, type_id, and client_id (project)
    const groupedMap = {};

    inventoryData.forEach(record => {
      const inventoryItems = record.inventoryItems || record.inventory_items || [];
      const clientId = record.client_id || record.clientId;
      const outgoingType = (record.outgoing_type || record.outgoingType || '').toLowerCase();
      const recordDate = record.date || record.created_at || record.createdAt;

      // Get project name
      const project = projectOptions.find(p => p.id === clientId);
      const projectName = project ? project.value : '';

      inventoryItems.forEach(invItem => {
        const itemId = invItem.item_id || invItem.itemId;
        const categoryId = invItem.category_id || invItem.categoryId;
        const modelId = invItem.model_id || invItem.modelId;
        const brandId = invItem.brand_id || invItem.brandId;
        const typeId = invItem.type_id || invItem.typeId;
        const quantity = invItem.quantity || invItem.qty || 0;
        const amount = invItem.amount || 0;

        // Create composite key
        const key = `${itemId || 'null'}-${categoryId || 'null'}-${modelId || 'null'}-${brandId || 'null'}-${typeId || 'null'}-${clientId || 'null'}`;

        if (!groupedMap[key]) {
          // Resolve names
          const itemName = resolveItemName(itemId) || invItem.itemName || invItem.item_name || '';
          const brand = resolveBrandName(brandId) || invItem.brandName || invItem.brand_name || invItem.brand || '';
          const model = resolveModelName(modelId) || invItem.modelName || invItem.model_name || invItem.model || '';
          const type = resolveTypeName(typeId) || invItem.typeName || invItem.type_name || invItem.type || '';
          const category = resolveCategoryName(categoryId) || invItem.categoryName || invItem.category_name || invItem.category || '';

          groupedMap[key] = {
            itemId: itemId,
            categoryId: categoryId,
            modelId: modelId,
            brandId: brandId,
            typeId: typeId,
            itemName: itemName,
            brand: brand,
            model: model,
            type: type,
            category: category,
            projectId: clientId,
            projectName: projectName,
            dispatchQty: 0,
            returnQty: 0,
            totalAmount: 0,
            latestDate: recordDate
          };
        }

        // Accumulate quantities and amounts
        const absQty = Math.abs(quantity);
        if (outgoingType === 'dispatch') {
          // Dispatch has negative quantity, so we add the absolute value
          groupedMap[key].dispatchQty += absQty;
        } else if (outgoingType === 'stock return') {
          // Stock return has positive quantity
          groupedMap[key].returnQty += absQty;
        }
        groupedMap[key].totalAmount += Math.abs(amount || 0);

        // Update latest date
        if (new Date(recordDate) > new Date(groupedMap[key].latestDate)) {
          groupedMap[key].latestDate = recordDate;
        }
      });
    });

    // Convert to array and calculate usage
    return Object.values(groupedMap)
      .map(item => ({
        ...item,
        usage: item.dispatchQty - item.returnQty, // Usage = Dispatch - Return
        formattedDate: new Date(item.latestDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }))
      .filter(item => item.usage > 0) // Only show items with usage > 0
      .sort((a, b) => new Date(b.latestDate) - new Date(a.latestDate)); // Sort by date, newest first
  }, [inventoryData, projectOptions, poItemNames, poBrands, poModel, poTypes, poCategories]);

  // Filter processed data
  const filteredData = useMemo(() => {
    let filtered = [...processedUsageData];

    // Filter by project
    if (selectedProject) {
      filtered = filtered.filter(item => item.projectName === selectedProject);
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(item =>
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(query) ||
        item.projectName.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        String(item.itemId).includes(query)
      );
    }

    return filtered;
  }, [processedUsageData, selectedProject, selectedCategory, searchQuery]);

  const handleDateConfirm = (selectedDate) => {
    setDate(selectedDate);
    setShowDatePicker(false);
  };

  const getCategoryColor = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes('electrical')) {
      return 'bg-[#E3F2FD] text-[#1976D2]'; // Light blue
    } else if (cat.includes('paint')) {
      return 'bg-[#E8F5E9] text-[#388E3C]'; // Light green
    } else if (cat.includes('plumbing')) {
      return 'bg-[#FFF3E0] text-[#F57C00]'; // Light orange
    }
    return 'bg-gray-100 text-gray-700'; // Default gray
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden">
      {/* Date Row */}
      <div className="flex-shrink-0 px-4 pt-2 pb-1 border-b border-gray-100">
        <button
          type="button"
          onClick={() => setShowDatePicker(true)}
          className="text-[12px] font-medium text-[#616161] leading-normal underline-offset-2 hover:underline"
        >
          {date}
        </button>
      </div>

      {/* Filters Section */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 space-y-3">
        {/* Project Name Filter */}
        <div>
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            Project Name
          </p>
          <div className="relative">
            <div
              onClick={() => setShowProjectModal(true)}
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white flex items-center cursor-pointer justify-between"
              style={{
                paddingRight: selectedProject ? '40px' : '12px',
                boxSizing: 'border-box',
                color: selectedProject ? '#000' : '#9E9E9E'
              }}
            >
              <span>{selectedProject || 'Select Project'}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {selectedProject && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProject('');
                }}
                className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                style={{ right: '24px' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            Category
          </p>
          <div className="relative">
            <div
              onClick={() => setShowCategoryModal(true)}
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white flex items-center cursor-pointer justify-between"
              style={{
                paddingRight: selectedCategory ? '40px' : '12px',
                boxSizing: 'border-box',
                color: selectedCategory ? '#000' : '#9E9E9E'
              }}
            >
              <span>{selectedCategory || 'Select Category'}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {selectedCategory && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory('');
                }}
                className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                style={{ right: '24px' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="5.5" stroke="#747474" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[40px] border border-[rgba(0,0,0,0.16)] rounded-full pl-10 pr-3 text-[12px] font-medium bg-white"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[14px] text-gray-500">Loading...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[14px] text-gray-500">No data found</p>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {filteredData.map((item, index) => {
              // Format project/incharge display
              const projectIncharge = item.projectName || '';
              // Format details: ID, Brand (matching image format like "190614, Kundan")
              const detailsParts = [];
              if (item.itemId) detailsParts.push(item.itemId);
              if (item.brand) detailsParts.push(item.brand);
              const details = detailsParts.join(', ');

              return (
                <div key={`${item.itemId}-${item.categoryId}-${item.modelId}-${item.brandId}-${item.typeId}-${item.projectId}-${index}`} className="bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] p-2">
                  <div className="flex items-start justify-between">
                    {/* Left Side */}
                    <div className="flex-1 pr-3">
                      {/* Product Name */}
                      <p className="text-[14px] font-semibold text-black mb-1">
                        {item.itemName}
                      </p>

                      {/* Project/Incharge */}
                      <p className="text-[12px] font-medium text-gray-700 mb-1">
                        {projectIncharge}
                      </p>

                      {/* Details */}
                      <p className="text-[12px] font-medium text-gray-600 mb-1">
                        {details}
                      </p>

                      {/* Date */}
                      <p className="text-[12px] font-medium text-gray-600 mb-1">
                        {item.formattedDate}
                      </p>

                      {/* Dispatch/Return on one line */}
                      {(item.dispatchQty > 0 || item.returnQty > 0) && (
                        <p className="text-[12px] font-medium text-gray-600">
                          {item.dispatchQty > 0 && <span className="text-[#E4572E]">• Dispatch {item.dispatchQty}</span>}
                          {item.dispatchQty > 0 && item.returnQty > 0 && ' '}
                          {item.returnQty > 0 && <span className="text-[#007233]">• Return {item.returnQty}</span>}
                        </p>
                      )}
                    </div>

                    {/* Right Side */}
                    <div className="flex flex-col items-end">
                      {/* Category Tag */}
                      {item.category && (
                        <span className={`px-2 py-1 mb-2 rounded-full text-[10px] font-medium ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      )}
                      {/* Usage */}
                      <p className="text-[12px] font-medium text-[#007233] mb-1">
                        Usage {item.usage}
                      </p>

                      {/* Amount */}
                      <p className="text-[14px] font-semibold text-[#007233]">
                        {formatAmount(item.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        initialDate={date}
      />
      <SelectVendorModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelect={(value) => {
          setSelectedProject(value);
          setShowProjectModal(false);
        }}
        selectedValue={selectedProject}
        options={projectOptions.map(proj => proj.value || proj.label)}
        fieldName="Project Name"
      />
      <SelectVendorModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(value) => {
          setSelectedCategory(value);
          setShowCategoryModal(false);
        }}
        selectedValue={selectedCategory}
        options={categoryOptions.map(cat => cat.value || cat.label)}
        fieldName="Category"
      />
    </div>
  );
};

export default EditStock;

