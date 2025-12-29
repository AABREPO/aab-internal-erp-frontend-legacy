import React, { useState, useEffect } from 'react';

const CategorySelectModal = ({ isOpen, onClose, onSelect, selectedCategory, categories = [], onGroupNameSelect, selectedGroupName: propSelectedGroupName = '', showGroupName = false }) => {
  const [viewMode, setViewMode] = useState('category'); // 'category' or 'groupName'
  const [selectedGroupName, setSelectedGroupName] = useState(propSelectedGroupName);
  const [groupNameList, setGroupNameList] = useState([]);
  const [groupNameOptions, setGroupNameOptions] = useState([]);

  // Sync with prop when it changes
  useEffect(() => {
    setSelectedGroupName(propSelectedGroupName);
  }, [propSelectedGroupName]);

  // Predefined categories
  const predefinedCategories = ['CARPENTRY', 'PLUMBING', 'ELECTRICAL', 'PAINTING', 'STEEL'];

  // Fetch group names from API only if showGroupName is true
  useEffect(() => {
    if (isOpen && showGroupName) {
      fetchGroupNameList();
    }
  }, [isOpen, showGroupName]);

  const fetchGroupNameList = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/group_name/getAll');
      if (response.ok) {
        const data = await response.json();
        setGroupNameList(data);
        const options = data.map(item => ({
          value: item.groupName,
          label: item.groupName,
        }));
        setGroupNameOptions(options);
      } else {
        console.log('Error fetching group names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching group names.');
    }
  };

  const handleCategorySelect = (category) => {
    onSelect(category);
    // Check if both are selected after category selection
    if (category && selectedGroupName) {
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  const handleGroupNameSelect = (groupName) => {
    setSelectedGroupName(groupName);
    if (onGroupNameSelect) {
      onGroupNameSelect(groupName);
    }
    // Check if both are selected after group name selection
    if (groupName && selectedCategory) {
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="bg-white w-full max-w-[360px] rounded-tl-[16px] rounded-tr-[16px] p-6 pb-8 relative" style={{ minHeight: '400px', maxHeight: '80vh' }}>
        <div className="flex justify-between items-center mb-4">
          <p className="text-[16px] font-medium text-black">Select Category</p>
          <button onClick={onClose} className="text-[#e4572e] text-[14px] font-semibold underline">
            Cancel
          </button>
        </div>

        {/* Segmented Control (Category/Group Name) - Only show if showGroupName is true */}
        {showGroupName && (
          <div className="mb-4 flex items-center bg-[#F5F5F5] rounded-[8px] p-1 w-full">
            <button
              onClick={() => setViewMode('category')}
              className={`flex-1 h-[32px] rounded-[6px] text-[12px] font-medium transition-colors ${
                viewMode === 'category'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#9E9E9E]'
              }`}
            >
              Category
            </button>
            <button
              onClick={() => setViewMode('groupName')}
              className={`flex-1 h-[32px] rounded-[6px] text-[12px] font-medium transition-colors ${
                viewMode === 'groupName'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#9E9E9E]'
              }`}
            >
              Group Name
            </button>
          </div>
        )}

        {/* Category View */}
        {(!showGroupName || viewMode === 'category') && (
          <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
            {predefinedCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`h-[36px] rounded-[6px] px-3 flex items-center justify-between ${
                  selectedCategory === category
                    ? 'bg-white border-[0.8px] border-[#26bf94]'
                    : 'bg-[#f3f5f7]'
                }`}
              >
                <p className="text-[12px] font-medium text-black">{category}</p>
                {selectedCategory === category && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="6" stroke="#26bf94" strokeWidth="2" />
                    <path d="M4 7L6 9L10 5" stroke="#26bf94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Group Name View */}
        {viewMode === 'groupName' && (
          <div className=" max-h-[50vh] overflow-y-auto">
            {groupNameOptions.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {groupNameOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleGroupNameSelect(option.value)}
                    className={`w-full h-[36px] rounded-[6px] px-3 flex items-center justify-between ${
                      selectedGroupName === option.value
                        ? 'bg-white border-[0.8px] border-[#26bf94]'
                        : 'bg-[#f3f5f7]'
                    }`}
                  >
                    <p className="text-[12px] font-medium text-black">{option.label}</p>
                    {selectedGroupName === option.value && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="6" stroke="#26bf94" strokeWidth="2" />
                        <path d="M4 7L6 9L10 5" stroke="#26bf94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[#777777] text-center py-4">
                No group names available
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySelectModal;


