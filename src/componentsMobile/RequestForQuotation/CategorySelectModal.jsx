import React, { useState, useEffect, useRef } from 'react';

const CategorySelectModal = ({ isOpen, onClose, onSelect, selectedCategory, categories = [], onGroupNameSelect, selectedGroupName: propSelectedGroupName = '', showGroupName = false }) => {
  const [viewMode, setViewMode] = useState('category'); // 'category' or 'groupName'
  const [selectedGroupName, setSelectedGroupName] = useState(propSelectedGroupName);
  const [groupNameList, setGroupNameList] = useState([]);
  const [groupNameOptions, setGroupNameOptions] = useState([]);
  const selectedCategoryRef = useRef(null);
  const selectedGroupNameRef = useRef(null);
  const categoryScrollContainerRef = useRef(null);
  const groupNameScrollContainerRef = useRef(null);
  const [categoryFavorites, setCategoryFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteCategories');
    return saved ? JSON.parse(saved) : [];
  });
  const [groupNameFavorites, setGroupNameFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteGroupNames');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync with prop when it changes
  useEffect(() => {
    setSelectedGroupName(propSelectedGroupName);
  }, [propSelectedGroupName]);

  // Scroll to selected option when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        let container = null;
        let selectedElement = null;
        
        if (viewMode === 'category' && selectedCategory && selectedCategoryRef.current && categoryScrollContainerRef.current) {
          container = categoryScrollContainerRef.current;
          selectedElement = selectedCategoryRef.current;
        } else if (viewMode === 'groupName' && selectedGroupName && selectedGroupNameRef.current && groupNameScrollContainerRef.current) {
          container = groupNameScrollContainerRef.current;
          selectedElement = selectedGroupNameRef.current;
        }
        
        if (container && selectedElement) {
          const elementOffsetTop = selectedElement.offsetTop;
          const containerHeight = container.clientHeight;
          const elementHeight = selectedElement.offsetHeight;
          
          // Calculate the scroll position to center the selected element
          const scrollPosition = elementOffsetTop - (containerHeight / 2) + (elementHeight / 2);
          container.scrollTop = Math.max(0, scrollPosition);
        }
      }, 100);
    }
  }, [isOpen, selectedCategory, selectedGroupName, viewMode]);

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

  // Toggle category favorite
  const handleToggleCategoryFavorite = (e, category) => {
    e.stopPropagation();
    const updatedFavorites = categoryFavorites.includes(category)
      ? categoryFavorites.filter(fav => fav !== category)
      : [...categoryFavorites, category];
    setCategoryFavorites(updatedFavorites);
    localStorage.setItem('favoriteCategories', JSON.stringify(updatedFavorites));
  };

  // Toggle group name favorite
  const handleToggleGroupNameFavorite = (e, groupName) => {
    e.stopPropagation();
    const updatedFavorites = groupNameFavorites.includes(groupName)
      ? groupNameFavorites.filter(fav => fav !== groupName)
      : [...groupNameFavorites, groupName];
    setGroupNameFavorites(updatedFavorites);
    localStorage.setItem('favoriteGroupNames', JSON.stringify(updatedFavorites));
  };

  // Helper function to split option text at first hyphen
  const splitOptionText = (text) => {
    if (!text) return { firstLine: '', secondLine: '' };
    const firstHyphenIndex = text.indexOf(' - ');
    if (firstHyphenIndex === -1) {
      return { firstLine: text, secondLine: '' };
    }
    return {
      firstLine: text.substring(0, firstHyphenIndex),
      secondLine: text.substring(firstHyphenIndex + 3) // +3 to skip ' - '
    };
  };

  // Sort categories: favorites first, then alphabetically
  const sortedCategories = [...predefinedCategories].sort((a, b) => {
    const aIsFavorite = categoryFavorites.includes(a);
    const bIsFavorite = categoryFavorites.includes(b);
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return a.localeCompare(b);
  });

  // Sort group names: favorites first, then alphabetically
  const sortedGroupNames = [...groupNameOptions].sort((a, b) => {
    const aIsFavorite = groupNameFavorites.includes(a.value);
    const bIsFavorite = groupNameFavorites.includes(b.value);
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return a.value.localeCompare(b.value);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="bg-white w-full max-w-[360px] rounded-tl-[16px] rounded-tr-[16px] p-[24px] pb-[32px] relative transform -translate-y-24" style={{ minHeight: '400px', maxHeight: '80vh' }}>
        <div className="flex justify-between items-center mb-4">
          <p className="text-[16px] font-medium text-black">Select Category</p>
          <button onClick={onClose} className="text-[#e4572e] text-[14px] font-semibold underline">
            Cancel
          </button>
        </div>

        {/* Segmented Control (Category/Group Name) - Only show if showGroupName is true */}
        {showGroupName && (
          <div className="mb-4 flex items-center bg-[#F5F5F5] rounded-[8px] p-[4px] w-full">
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
          <div ref={categoryScrollContainerRef} className="grid grid-cols-2 gap-[12px] max-h-[50vh] overflow-y-auto">
            {sortedCategories.map((category) => {
              const isSelected = selectedCategory === category;
              const isFavorite = categoryFavorites.includes(category);
              return (
              <button
                key={category}
                ref={isSelected ? selectedCategoryRef : null}
                onClick={() => handleCategorySelect(category)}
                className={`rounded-[6px] px-[12px] flex items-center gap-[8px] ${
                  isSelected
                    ? 'bg-white border-[0.8px] border-[#26bf94]'
                    : 'bg-[#f3f5f7]'
                }`}
                style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
              >
                <button
                  onClick={(e) => handleToggleCategoryFavorite(e, category)}
                  className="w-5 h-5 flex items-center justify-center flex-shrink-0"
                >
                  {isFavorite ? (
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#e4572e" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <div className="flex flex-col flex-1 min-w-0">
                  {(() => {
                    const { firstLine, secondLine } = splitOptionText(category);
                    return (
                      <>
                        <p className="text-[12px] font-medium text-black truncate whitespace-nowrap">{firstLine}</p>
                        {secondLine && (
                          <p className="text-[11px] font-medium text-[#777777] truncate whitespace-nowrap">{secondLine}</p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </button>
            );
            })}
          </div>
        )}

        {/* Group Name View */}
        {viewMode === 'groupName' && (
          <div ref={groupNameScrollContainerRef} className=" max-h-[50vh] overflow-y-auto">
            {sortedGroupNames.length > 0 ? (
              <div className="grid grid-cols-2 gap-[12px]">
                {sortedGroupNames.map((option, index) => {
                  const isSelected = selectedGroupName === option.value;
                  const isFavorite = groupNameFavorites.includes(option.value);
                  return (
                  <button
                    key={index}
                    ref={isSelected ? selectedGroupNameRef : null}
                    onClick={() => handleGroupNameSelect(option.value)}
                    className={`w-full rounded-[6px] px-[12px] flex items-center gap-[8px] ${
                      isSelected
                        ? 'bg-white border-[0.8px] border-[#26bf94]'
                        : 'bg-[#f3f5f7]'
                    }`}
                    style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                  >
                    <button
                      onClick={(e) => handleToggleGroupNameFavorite(e, option.value)}
                      className="w-5 h-5 flex items-center justify-center flex-shrink-0"
                    >
                      {isFavorite ? (
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#e4572e" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                    <div className="flex flex-col flex-1 min-w-0">
                      {(() => {
                        const { firstLine, secondLine } = splitOptionText(option.label);
                        return (
                          <>
                            <p className="text-[12px] font-medium text-black truncate whitespace-nowrap">{firstLine}</p>
                            {secondLine && (
                              <p className="text-[11px] font-medium text-[#777777] truncate whitespace-nowrap">{secondLine}</p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </button>
                );
                })}
              </div>
            ) : (
              <p className="text-[12px] text-[#777777] text-center py-[16px]">
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


