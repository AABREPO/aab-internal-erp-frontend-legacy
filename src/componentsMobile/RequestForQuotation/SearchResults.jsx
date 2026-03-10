import React, { useState } from 'react';

// Helper function to highlight matching text
const highlightText = (text, searchQuery, matchType, currentMatchType) => {
  if (!text || !searchQuery || matchType !== currentMatchType) {
    return text;
  }

  const query = searchQuery.toLowerCase();
  const textLower = text.toLowerCase();
  const index = textLower.indexOf(query);

  if (index === -1) {
    return text;
  }

  const before = text.substring(0, index);
  const match = text.substring(index, index + searchQuery.length);
  const after = text.substring(index + searchQuery.length);

  return (
    <>
      {before}
      <span className="font-bold">{match}</span>
      {after}
    </>
  );
};

// Helper function to highlight matching parts in model
const highlightModelParts = (modelParts, searchQuery, matchType) => {
  if (!searchQuery || matchType !== 'model') {
    return modelParts.map((part, index) => (
      <span key={index}>{part}</span>
    ));
  }

  const query = searchQuery.toLowerCase();
  return modelParts.map((part, index) => {
    const partLower = part.toLowerCase();
    if (partLower.includes(query)) {
      const matchIndex = partLower.indexOf(query);
      const before = part.substring(0, matchIndex);
      const match = part.substring(matchIndex, matchIndex + searchQuery.length);
      const after = part.substring(matchIndex + searchQuery.length);

      return (
        <span key={index}>
          {before}
          <span className="font-bold">{match}</span>
          {after}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

// Helper function to highlight matching type
const highlightType = (typeMain, searchQuery, matchType) => {
  if (!typeMain || !searchQuery || matchType !== 'type') {
    return typeMain;
  }

  const query = searchQuery.toLowerCase();
  const typeLower = typeMain.toLowerCase();
  const index = typeLower.indexOf(query);

  if (index === -1) {
    return typeMain;
  }

  const before = typeMain.substring(0, index);
  const match = typeMain.substring(index, index + searchQuery.length);
  const after = typeMain.substring(index + searchQuery.length);

  return (
    <>
      {before}
      <span className="font-bold">{match}</span>
      {after}
    </>
  );
};

const SearchResultItem = ({ item, searchQuery, onAdd, onClose }) => {
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = (e) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    setQuantity(quantity + 1);
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    onAdd(item, quantity);
    onClose();
  };

  // Format model to split into parts (e.g., "Natural Cream" -> ["Natural", "Cream"])
  const getModelParts = () => {
    if (!item.model) return [];
    return item.model.split(' ').filter(part => part.trim() !== '');
  };

  // Format type to extract the main part (e.g., "Flip Type" -> "Flip")
  const getTypeMain = () => {
    if (!item.type) return '';
    return item.type.replace(' Type', '').replace(' type', '');
  };

  const modelParts = getModelParts();
  const typeMain = getTypeMain();
  const matchType = item.matchType || null;

  return (
    <div className="w-full px-4 py-3 border-b border-[rgba(0,0,0,0.08)] last:border-b-0">
      {/* Item Name and Category Tag Row */}
      <div className="flex items-center justify-between mb-2.5">
        {/* Item Name at the left - always bold, but search term is also bolded if it matches */}
        <p className="text-[12px] font-semibold text-black leading-normal">
          {highlightText(item.itemName, searchQuery, matchType, 'itemName')}
        </p>

        {/* Category Tag - Green pill shape, aligned to the right */}
        <span className="text-[10px] font-medium text-white bg-[#26bf94] px-2.5 py-1 rounded-full whitespace-nowrap">
          {item.category || 'Electricals'}
        </span>
      </div>

      {/* Item Attributes List Below */}
      <div className="flex flex-wrap items-center gap-1 mb-2.5 text-[11px] font-medium text-[#777777] leading-normal">
        {/* Brand with comma */}
        {item.brand && (
          <span>{highlightText(item.brand, searchQuery, matchType, 'brand')},</span>
        )}

        {/* Model parts - each as separate items */}
        {highlightModelParts(modelParts, searchQuery, matchType)}

        {/* Type main part (e.g., "Flip" or "Toggle") */}
        {typeMain && (
          <span>{highlightType(typeMain, searchQuery, matchType)}</span>
        )}

        {/* Type label */}
        {item.type && (
          <span>Type</span>
        )}

        {/* Stock information */}
        <span>Stock</span>
        <span>64 Psc</span>
      </div>

      {/* Controls Row: Quantity Selector and Add Button - Aligned to the right */}
      <div className="flex items-center justify-end gap-2 mb-2.5">
        {/* Quantity Selector */}
        <div className="flex items-center border border-[rgba(0,0,0,0.16)] rounded-[6px]">
          <button
            onClick={handleDecrease}
            className="w-[28px] h-[28px] flex items-center justify-center text-[14px] font-medium text-black hover:bg-[#f5f5f5] rounded-l-[6px] transition-colors"
          >
            −
          </button>
          <span className="w-[32px] h-[28px] flex items-center justify-center text-[12px] font-semibold text-black">
            {quantity}
          </span>
          <button
            onClick={handleIncrease}
            className="w-[28px] h-[28px] flex items-center justify-center text-[14px] font-medium text-black hover:bg-[#f5f5f5] rounded-r-[6px] transition-colors"
          >
            +
          </button>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAdd}
          className="h-[28px] px-3 bg-black text-white text-[12px] font-medium rounded-[6px] hover:bg-[#333] transition-colors whitespace-nowrap"
        >
          Add
        </button>
      </div>
    </div>
  );
};

const SearchResults = ({ results, searchQuery, onAdd, onClose }) => {
  if (!results || results.length === 0) return null;

  const handleMouseDown = (e) => {
    // Prevent blur event on input when clicking inside search results
    e.preventDefault();
  };

  return (
    <div
      className="search-results-container absolute top-full left-0 right-0 mt-2 bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] shadow-lg z-50 max-h-[400px] overflow-y-auto"
      onMouseDown={handleMouseDown}
    >
      {results.map((item, index) => (
        <SearchResultItem
          key={index}
          item={item}
          searchQuery={searchQuery}
          onAdd={onAdd}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default SearchResults;

