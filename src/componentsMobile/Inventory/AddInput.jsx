import React, { useState, useEffect } from 'react';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import SelectLocatorsModal from './SelectLocatorsModal';

const AddInput = () => {
  // Add Input page state
  const [addInputData, setAddInputData] = useState({
    category: '',
    itemName: '',
    model: '',
    type: '',
    brand: '',
    minQty: '',
    defaultQty: ''
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemNameModal, setShowItemNameModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupOptions, setGroupOptions] = useState([]);

  // Fetch group names from API (same as InputData page but independent)
  const fetchGroupNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/group_name/getAll');
      if (response.ok) {
        const data = await response.json();
        const options = (data || []).map(item => item.groupName || '').filter(Boolean);
        setGroupOptions(options);
      } else {
        console.log('Error fetching group names.');
        setGroupOptions([]);
      }
    } catch (error) {
      console.error('Error fetching group names:', error);
      setGroupOptions([]);
    }
  };

  // Fetch group names when component mounts
  useEffect(() => {
    fetchGroupNames();
  }, []);

  // Handle adding new group name
  const handleAddNewGroupName = async (newGroupName) => {
    if (!newGroupName || !newGroupName.trim()) {
      return;
    }
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/group_name/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupName: newGroupName.trim() }),
      });
      if (response.ok) {
        console.log('Group name saved successfully!');
        await fetchGroupNames();
        if (!groupOptions.includes(newGroupName.trim())) {
          setGroupOptions([...groupOptions, newGroupName.trim()]);
        }
      } else {
        console.log('Error saving group name.');
        // Still add to local options for immediate use
        if (!groupOptions.includes(newGroupName.trim())) {
          setGroupOptions([...groupOptions, newGroupName.trim()]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error saving group name.');
      // Still add to local options for immediate use
      if (!groupOptions.includes(newGroupName.trim())) {
        setGroupOptions([...groupOptions, newGroupName.trim()]);
      }
    }
  };

  const [selectedLocators, setSelectedLocators] = useState([]);
  const [showLocatorsModal, setShowLocatorsModal] = useState(false);
  const [locatorOptions, setLocatorOptions] = useState([]);
  const [previousSelectedLocators, setPreviousSelectedLocators] = useState([]);

  // Outgoing page options for locators (same as PurchaseOrder but independent)
  const [outgoingSiteOptions, setOutgoingSiteOptions] = useState([]);
  const [outgoingProjectOptions, setOutgoingProjectOptions] = useState([]);
  const [allSiteData, setAllSiteData] = useState([]); // Store full site data including markedAsStockingLocation

  // Fetch project names (sites) from API for locators
  useEffect(() => {
    const fetchOutgoingSites = async () => {
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
        // Store full site data
        setAllSiteData(data);
        const formattedData = data.map(item => ({
          value: item.siteName,
          label: item.siteName,
          sNo: item.siteNo,
          id: item.id,
          markedAsStockingLocation: item.markedAsStockingLocation || false,
        }));
        setOutgoingSiteOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchOutgoingSites();
  }, []);

  // Extract project names as strings for the dropdown
  useEffect(() => {
    setOutgoingProjectOptions(outgoingSiteOptions.map(option => option.value));
  }, [outgoingSiteOptions]);

  // Update locator options to use project names when available
  useEffect(() => {
    if (outgoingProjectOptions.length > 0) {
      setLocatorOptions(outgoingProjectOptions);
    }
  }, [outgoingProjectOptions]);

  // Initialize selectedLocators from sites that are already marked as stocking locations
  // Only initialize once when site options are first loaded
  useEffect(() => {
    if (outgoingSiteOptions.length > 0 && previousSelectedLocators.length === 0 && selectedLocators.length === 0) {
      const initialSelected = outgoingSiteOptions
        .filter(site => site.markedAsStockingLocation === true)
        .map(site => site.value)
        .filter(Boolean);
      
      // Always set previousSelectedLocators, even if empty, so comparison works correctly
      setPreviousSelectedLocators(initialSelected);
      
      if (initialSelected.length > 0) {
        setSelectedLocators(initialSelected);
      }
    }
  }, [outgoingSiteOptions]);

  // Refresh site data from API
  const refreshSiteData = async () => {
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAllSiteData(data);
        const formattedData = data.map(item => ({
          value: item.siteName,
          label: item.siteName,
          sNo: item.siteNo,
          id: item.id,
          markedAsStockingLocation: item.markedAsStockingLocation || false,
        }));
        setOutgoingSiteOptions(formattedData);
      }
    } catch (error) {
      console.error("Error refreshing site data: ", error);
    }
  };

  // Update stocking location status when locators are selected/deselected
  const updateStockingLocationStatus = async (newSelectedLocators) => {
    try {
      console.log('updateStockingLocationStatus called with:', newSelectedLocators);
      console.log('previousSelectedLocators:', previousSelectedLocators);
      console.log('outgoingSiteOptions:', outgoingSiteOptions);
      
      // Process all sites - update based on whether they're in the new selection
      const updatePromises = [];
      
      for (const site of outgoingSiteOptions) {
        if (site.id && site.value) {
          const shouldBeSelected = newSelectedLocators.includes(site.value);
          const wasSelected = previousSelectedLocators.includes(site.value);
          
          // Only update if the status needs to change
          if (shouldBeSelected !== wasSelected) {
            const url = `https://backendaab.in/aabuilderDash/api/project_Names/${site.id}/stocking-location?markedAsStockingLocation=${shouldBeSelected}`;
            console.log(`Updating site ${site.value} (id: ${site.id}): ${shouldBeSelected ? 'true' : 'false'}`);
            console.log(`Sending PUT request to: ${url}`);
            
            const updatePromise = fetch(url, {
              method: 'PUT',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .then(response => {
              if (response.ok) {
                console.log(`✓ Successfully updated site ${site.id} (${site.value}): ${shouldBeSelected}`);
                return { success: true, siteId: site.id, siteName: site.value };
              } else {
                console.error(`✗ Failed to update site ${site.id}: ${response.status} ${response.statusText}`);
                return { success: false, siteId: site.id, siteName: site.value, error: response.statusText };
              }
            })
            .catch(error => {
              console.error(`✗ Error updating site ${site.id}:`, error);
              return { success: false, siteId: site.id, siteName: site.value, error: error.message };
            });
            
            updatePromises.push(updatePromise);
          } else {
            console.log(`Skipping site ${site.value} - no change needed (was: ${wasSelected}, should be: ${shouldBeSelected})`);
          }
        }
      }
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      // Update previous selection for next comparison
      setPreviousSelectedLocators(newSelectedLocators);
      
      // Refresh site data to get updated markedAsStockingLocation values
      await refreshSiteData();
    } catch (error) {
      console.error('Error updating stocking location status:', error);
    }
  };

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([
    'Electricals',
    'Plumbing',
    'Steel',
    'Paint',
    'Wall Putty',
    'Carpentry',
    'Tiles',
    'Hardwares'
  ]);

  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden">
      {/* Group, Locators, Categories Labels */}
      <div className="flex-shrink-0 px-4 pt-2 pb-2 border-b">
        <div className="flex items-center justify-between">
          <p 
            onClick={() => setShowGroupModal(true)}
            className="text-[12px] font-medium text-black leading-normal cursor-pointer"
          >
            {selectedGroup || 'Group'}
          </p>
          <div className="flex items-center gap-4">
            <p 
              onClick={() => setShowLocatorsModal(true)}
              className="text-[12px] font-medium text-black leading-normal cursor-pointer"
            >
              Locators
            </p>
            <p 
              onClick={() => setShowCategoriesModal(true)}
              className="text-[12px] font-medium text-black leading-normal cursor-pointer"
            >
              Categories
            </p>
          </div>
        </div>
      </div>
      {/* Form Fields */}
      <div className="flex-shrink-0 px-4 pt-4 overflow-y-auto">
        {/* Category Field */}
        <div className="mb-4 relative">
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            Category
          </p>
          <div className="relative">
            <div
              onClick={() => setShowCategoryModal(true)}
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                paddingRight: addInputData.category ? '40px' : '12px',
                boxSizing: 'border-box',
                color: addInputData.category ? '#000' : '#9E9E9E'
              }}
            >
              {addInputData.category || 'Select Category'}
            </div>
            {addInputData.category && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAddInputData({ ...addInputData, category: '' });
                }}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                style={{ right: '32px' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Item Name Field */}
        <div className="mb-4 relative">
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            Item Name
          </p>
          <div className="relative">
            <div
              onClick={() => setShowItemNameModal(true)}
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                paddingRight: addInputData.itemName ? '40px' : '12px',
                boxSizing: 'border-box',
                color: addInputData.itemName ? '#000' : '#9E9E9E'
              }}
            >
              {addInputData.itemName || 'Select Item'}
            </div>
            {addInputData.itemName && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAddInputData({ ...addInputData, itemName: '' });
                }}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                style={{ right: '32px' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Model Field */}
        <div className="mb-4 relative">
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            Model
          </p>
          <div className="relative">
            <div
              onClick={() => setShowModelModal(true)}
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                color: addInputData.model ? '#000' : '#9E9E9E'
              }}
            >
              {addInputData.model || 'Select Model'}
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Type Field */}
        <div className="mb-4 relative">
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            Type
          </p>
          <div className="relative">
            <div
              onClick={() => setShowTypeModal(true)}
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                color: addInputData.type ? '#000' : '#9E9E9E'
              }}
            >
              {addInputData.type || 'Select Type'}
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {/* Brand Field */}
          <div className="flex-1 relative">
            <p className="text-[12px] font-semibold text-black leading-normal mb-1">
              Brand
            </p>
            <div className="relative">
              <div
                onClick={() => setShowBrandModal(true)}
                className="w-[120px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-3 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  color: addInputData.brand ? '#000' : '#9E9E9E'
                }}
              >
                {addInputData.brand || 'Select Brand'}
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Min.Qty Field */}
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-black leading-normal mb-1">
              Min.Qty
            </p>
            <input
              type="text"
              value={addInputData.minQty}
              onChange={(e) => setAddInputData({ ...addInputData, minQty: e.target.value })}
              placeholder="Enter"
              className="w-[90px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white"
              style={{
                color: addInputData.minQty ? '#000' : '#9E9E9E'
              }}
            />
          </div>

          {/* Default Qty Field */}
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-black leading-normal mb-1">
              Default Qty
            </p>
            <input
              type="text"
              value={addInputData.defaultQty}
              onChange={(e) => setAddInputData({ ...addInputData, defaultQty: e.target.value })}
              placeholder="Enter"
              className="w-[90px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white"
              style={{
                color: addInputData.defaultQty ? '#000' : '#9E9E9E'
              }}
            />
          </div>
        </div>
      </div>

      {/* Add to List Button */}
      <div className="flex-shrink-0 px-4 pb-4">
        <button
          type="button"
          className="w-full h-[35px] bg-gray-300 rounded-[8px] text-[14px] font-semibold text-white flex items-center justify-center"
        >
          + Add to List
        </button>
      </div>

      {/* Modals */}
      <SelectVendorModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(value) => {
          setAddInputData({ ...addInputData, category: value });
          setShowCategoryModal(false);
        }}
        selectedValue={addInputData.category}
        options={[]}
        fieldName="Category"
        showStarIcon={false}
      />
      <SelectVendorModal
        isOpen={showItemNameModal}
        onClose={() => setShowItemNameModal(false)}
        onSelect={(value) => {
          setAddInputData({ ...addInputData, itemName: value });
          setShowItemNameModal(false);
        }}
        selectedValue={addInputData.itemName}
        options={[]}
        fieldName="Item Name"
        showStarIcon={false}
      />
      <SelectVendorModal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        onSelect={(value) => {
          setAddInputData({ ...addInputData, model: value });
          setShowModelModal(false);
        }}
        selectedValue={addInputData.model}
        options={[]}
        fieldName="Model"
        showStarIcon={false}
      />
      <SelectVendorModal
        isOpen={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelect={(value) => {
          setAddInputData({ ...addInputData, type: value });
          setShowTypeModal(false);
        }}
        selectedValue={addInputData.type}
        options={[]}
        fieldName="Type"
        showStarIcon={false}
      />
      <SelectVendorModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onSelect={(value) => {
          setAddInputData({ ...addInputData, brand: value });
          setShowBrandModal(false);
        }}
        selectedValue={addInputData.brand}
        options={[]}
        fieldName="Brand"
        showStarIcon={false}
      />
      <SelectVendorModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onSelect={(value) => {
          setSelectedGroup(value);
          setShowGroupModal(false);
        }}
        selectedValue={selectedGroup}
        options={groupOptions}
        fieldName="Group"
        showStarIcon={false}
        onAddNew={handleAddNewGroupName}
      />
      <SelectLocatorsModal
        isOpen={showLocatorsModal}
        onClose={() => setShowLocatorsModal(false)}
        onSelect={async (values) => {
          console.log('SelectLocatorsModal onSelect called with values:', values);
          setSelectedLocators(values);
          await updateStockingLocationStatus(values);
          // Don't close modal immediately - let user continue selecting
        }}
        selectedValues={selectedLocators}
        options={locatorOptions}
        fieldName="Locators"
        onAddNew={(newLocator) => {
          if (newLocator && !locatorOptions.includes(newLocator)) {
            setLocatorOptions([...locatorOptions, newLocator]);
          }
        }}
      />
      <SelectLocatorsModal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        onSelect={(values) => {
          setSelectedCategories(values);
          setShowCategoriesModal(false);
        }}
        selectedValues={selectedCategories}
        options={categoryOptions}
        fieldName="Categories"
        onAddNew={(newCategory) => {
          if (newCategory && !categoryOptions.includes(newCategory)) {
            setCategoryOptions([...categoryOptions, newCategory]);
          }
        }}
      />
    </div>
  );
};

export default AddInput;

