import React, { useRef, useEffect, useState } from 'react';
import Edit from '../Images/edit1.png'
import Delete from '../Images/delete.png'

// Helper function to hash a string to a number
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Helper function to get category color (randomly assigned but consistent)
const getCategoryColor = (category) => {
  if (!category) return 'bg-[#E3F2FD] text-[#1976D2]';
  
  // Define a palette of color combinations
  const colorPalette = [
    'bg-[#E3F2FD] text-[#1976D2]', // Light blue
    'bg-[#E8F5E9] text-[#2E7D32]', // Light green
    'bg-[#FFF3E0] text-[#F57C00]', // Light orange
    'bg-[#F3E5F5] text-[#7B1FA2]', // Light purple
    'bg-[#FCE4EC] text-[#C2185B]', // Light pink
    'bg-[#E0F2F1] text-[#00695C]', // Light teal
    'bg-[#FFF9C4] text-[#F57F17]', // Light yellow
    'bg-[#E1BEE7] text-[#6A1B9A]', // Light lavender
    'bg-[#FFE0B2] text-[#E65100]', // Light deep orange
    'bg-[#BBDEFB] text-[#0D47A1]', // Light indigo
    'bg-[#C8E6C9] text-[#1B5E20]', // Light dark green
    'bg-[#FFCCBC] text-[#BF360C]', // Light deep orange red
  ];
  
  // Hash the category name to get a consistent index
  const hash = hashString(category.toLowerCase());
  const colorIndex = hash % colorPalette.length;
  
  return colorPalette[colorIndex];
};

// Reusable item card with swipe-to-reveal Edit/Delete buttons (like History page)
const ItemCard = ({
  item,
  onEdit,
  onDelete,
  isExpanded,
  onToggleExpand,      // kept for backward compatibility (click-to-expand if needed)
  onSwipeStart,
  onSwipeMove,
  onSwipeEnd,
  swipeState,
  onAmountChange      // Optional callback when amount changes
}) => {
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [amountValue, setAmountValue] = useState(item?.price || 0);
  const amountInputRef = useRef(null);
  // Ref for the card element to attach non-passive event listeners
  // Must be called before any conditional returns
  const cardRef = useRef(null);

  // Calculate total amount from price and quantity (before early return)
  const totalAmount = ((item?.price || 0) * (item?.quantity || 1));

  // Update amount value when item changes (must be before early return)
  useEffect(() => {
    if (!isEditingAmount && item) {
      setAmountValue(totalAmount);
    }
  }, [totalAmount, isEditingAmount, item]);

  // Focus input when editing starts (must be before early return)
  useEffect(() => {
    if (isEditingAmount && amountInputRef.current) {
      amountInputRef.current.focus();
      amountInputRef.current.select();
    }
  }, [isEditingAmount]);

  // Set up non-passive event listeners using refs
  // Must be called before any conditional returns
  useEffect(() => {
    if (!item) return;
    
    const element = cardRef.current;
    if (!element || !onSwipeStart || !onSwipeMove || !onSwipeEnd) return;

    const touchStartHandler = (e) => {
      if (onSwipeStart) {
        onSwipeStart(e, item.id);
      }
    };

    const touchMoveHandler = (e) => {
      if (onSwipeMove) {
        onSwipeMove(e, item.id);
      }
    };

    const touchEndHandler = () => {
      if (onSwipeEnd) {
        onSwipeEnd(item.id);
      }
    };

    // Mouse event handler for desktop support (only mousedown, mousemove/mouseup handled globally in parent)
    const mouseDownHandler = (e) => {
      if (e.button !== 0) return; // Only handle left mouse button
      const syntheticEvent = {
        touches: [{ clientX: e.clientX }],
        preventDefault: () => e.preventDefault()
      };
      if (onSwipeStart) {
        onSwipeStart(syntheticEvent, item.id);
      }
    };

    // Add non-passive event listeners for touch
    element.addEventListener('touchstart', touchStartHandler, { passive: false });
    element.addEventListener('touchmove', touchMoveHandler, { passive: false });
    element.addEventListener('touchend', touchEndHandler, { passive: false });

    // Add mouse event listener for desktop support (only mousedown)
    element.addEventListener('mousedown', mouseDownHandler);

    return () => {
      element.removeEventListener('touchstart', touchStartHandler);
      element.removeEventListener('touchmove', touchMoveHandler);
      element.removeEventListener('touchend', touchEndHandler);
      element.removeEventListener('mousedown', mouseDownHandler);
    };
  }, [item, item?.id, onSwipeStart, onSwipeMove, onSwipeEnd]);

  if (!item) return null;

  const expanded = isExpanded || false;

  // Extract category from item.name (format: "ItemName, Category") or use item.category
  let category = item.category || '';
  if (!category && item.name && item.name.includes(',')) {
    const parts = item.name.split(',');
    category = parts[1] ? parts[1].trim() : '';
  }

  // Width of the combined action buttons (2 * 40px + gap)
  const buttonWidth = 96;

  // Calculate swipe offset for smooth animation
  const swipeOffset =
    swipeState && swipeState.isSwiping
      ? Math.max(-buttonWidth, swipeState.currentX - swipeState.startX)
      : expanded
        ? -buttonWidth
        : 0;

  const handleCardClick = (e) => {
    // Don't trigger if clicking on the action buttons or amount input
    if (e.target.closest('.action-button') || e.target.closest('.amount-input-container')) {
      return;
    }
    // Optional click-to-toggle if parent provided it
    if (onToggleExpand) {
      onToggleExpand();
    }
  };

  const handleAmountClick = (e) => {
    e.stopPropagation();
    setIsEditingAmount(true);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmountValue(value);
  };

  const handleAmountBlur = () => {
    setIsEditingAmount(false);
    const numericValue = parseFloat(amountValue) || 0;
    setAmountValue(numericValue);
    // Calculate price per unit from total amount
    const quantity = item.quantity || 1;
    const pricePerUnit = quantity > 0 ? numericValue / quantity : 0;
    if (onAmountChange) {
      onAmountChange(item.id, pricePerUnit);
    }
  };

  const handleAmountKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setAmountValue(totalAmount);
      setIsEditingAmount(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Card */}
      <div
        ref={cardRef}
        className="flex-1 bg-white border border-[#E0E0E0] rounded-[8px] px-3 py-2 cursor-pointer transition-transform duration-300 ease-out select-none"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          touchAction: 'pan-y',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between gap-2">
          {/* Left: Item details */}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-black leading-snug truncate">
              {item.name && item.name.includes(',') ? item.name.split(',')[0].trim() : item.name}
            </p>
            <div className="mt-1 space-y-1">
              {item.model && (
                <p className="text-[11px] font-medium text-[#777777] leading-snug truncate">
                  {item.model}
                </p>
              )}
              {(item.brand || item.type) && (
                <p className="text-[11px] font-medium text-[#9E9E9E] leading-snug truncate">
                  {item.brand && item.type
                    ? `${item.brand} • ${item.type}`
                    : item.brand || item.type}
                </p>
              )}
            </div>
          </div>
          {/* Right: Category, Qty / Price (only when collapsed) */}
          {!expanded && (
            <div className="flex flex-col items-end space-y-1 flex-shrink-0">
              {category && (
                <span className={`text-[10px] font-medium px-2 rounded-full whitespace-nowrap ${getCategoryColor(category)}`}>
                  {category}
                </span>
              )}
              <p className="text-[12px] font-semibold text-black leading-snug">
                {item.quantity} Qty
              </p>
              <div 
                className="amount-input-container"
                onClick={handleAmountClick}
              >
                {isEditingAmount ? (
                  <input
                    ref={amountInputRef}
                    type="text"
                    value={amountValue}
                    onChange={handleAmountChange}
                    onBlur={handleAmountBlur}
                    onKeyDown={handleAmountKeyDown}
                    className="text-[12px] font-semibold text-black leading-snug bg-transparent outline-none p-0 w-16 text-right border border-gray-400 rounded"
                    style={{ 
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                      marginTop: 0,
                      marginBottom: 0,
                      height: 'auto',
                      lineHeight: '1.375rem'
                    }}
                  />
                ) : (
                  <p className="text-[12px] font-semibold text-black leading-snug cursor-text" style={{ marginTop: 0, marginBottom: 0 }}>
                    ₹{totalAmount}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Behind the card on the right, revealed on swipe */}
      <div
        className="absolute right-0 top-0 flex gap-2 flex-shrink-0 z-0"
        style={{
          opacity:
            expanded ||
              (swipeState && swipeState.isSwiping && swipeOffset < -20)
              ? 1
              : 0,
          transition: 'opacity 0.2s ease-out',
          pointerEvents: expanded ? 'auto' : 'none'
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit();
          }}
          className="action-button w-[40px] h-[66px] bg-[#007233] rounded-[6px] flex items-center justify-center gap-1.5 hover:bg-[#22a882] transition-colors shadow-sm"
        >
          <img src={Edit} alt="Edit" className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete();
          }}
          className="action-button w-[40px] h-[66px] bg-[#E4572E] flex rounded-[6px] items-center justify-center gap-1.5 hover:bg-[#cc4d26] transition-colors shadow-sm"
        >
          <img src={Delete} alt="Delete" className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
};

export default ItemCard;


