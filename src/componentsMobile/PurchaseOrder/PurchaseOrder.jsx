import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from '../Bars/Sidebar';
import Tabs from './Tabs';
import BottomNav from './BottomNav';
import AddButton from './AddButton';
import AddItemsToPO from './AddItemsToPO';
import ItemCard from './ItemCard';
import DatePickerModal from './DatePickerModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import SearchResults from './SearchResults';
import SearchableDropdown from './SearchableDropdown';
import History from './History';
import SelectVendorModal from './SelectVendorModal';
import InputData from './InputData';
import SearchItemsModal from './SearchItemsModal';
import Summary from './Summary';
import editIcon from '../Images/edit.png';

const PurchaseOrder = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('purchase-order');
  // Load activeTab from localStorage on mount, default to 'create'
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('activeTab');
    return savedTab || 'create';
  });
  const [showAddItems, setShowAddItems] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showInchargeModal, setShowInchargeModal] = useState(false);
  const [showSearchItemsModal, setShowSearchItemsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(''); // Store selected category to persist across modal opens

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD (best for input[type="date"])
  };
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const [poData, setPoData] = useState({
    poNumber: '',
    date: formatDate(getTodayDate()),   // current date by default
    vendorName: '',
    projectName: '',
    projectIncharge: '',
    contact: '',
    created_by: '', // For PDF footer
  });


  // State to track selected vendor, site, and incharge with IDs
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedIncharge, setSelectedIncharge] = useState(null); // { id, name, mobileNumber, type: 'employee' | 'support staff' }

  const [items, setItems] = useState([]);
  const [hasOpenedAdd, setHasOpenedAdd] = useState(false); // track if + page has been opened
  const [isEditMode, setIsEditMode] = useState(false); // track if in edit mode
  const [isEditFromHistory, setIsEditFromHistory] = useState(false); // track if edit came from History page
  const [isViewOnlyFromHistory, setIsViewOnlyFromHistory] = useState(false); // track if viewing from History page (read-only with PDF)
  const [expandedItemId, setExpandedItemId] = useState(null); // track which item card is expanded
  const [swipeStates, setSwipeStates] = useState({}); // track swipe state per item
  const expandedItemIdRef = useRef(expandedItemId); // ref to track current expandedItemId for event handlers
  const previousVendorName = useRef(poData.vendorName); // Track previous vendor name
  const previousVendorId = useRef(null); // Track previous vendor ID to detect actual changes
  const [isPdfGenerated, setIsPdfGenerated] = useState(false); // track if PDF has been generated
  const [pdfBlob, setPdfBlob] = useState(null); // store generated PDF blob
  const [isGenerating, setIsGenerating] = useState(false); // track if PO is being generated

  // State for vendor name options from API
  const [vendorNameOptions, setVendorNameOptions] = useState([]);

  // State for project name options from API
  const [siteOptions, setSiteOptions] = useState([]);

  // State for employee list options from API
  const [employeeList, setEmployeeList] = useState([]);
  const [supportStaffList, setSupportStaffList] = useState([]);

  // State for PO item options from API (with IDs for lookup)
  const [poItemName, setPoItemName] = useState([]);
  const [poModel, setPoModel] = useState([]);
  const [poBrand, setPoBrand] = useState([]);
  const [poType, setPoType] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  // Check if we're in empty/home state
  const isEmptyState = !poData.vendorName && !poData.projectName && !poData.projectIncharge && items.length === 0 && !isEditMode;

  // Check if all required fields are filled (for enabling AddButton)
  const areFieldsFilled = poData.vendorName && poData.projectName && poData.projectIncharge;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Helper function to find name by ID from API data
  const findNameById = (dataArray, id, fieldName) => {
    if (!id || !dataArray || !Array.isArray(dataArray)) return '';
    // Convert both IDs to strings for comparison to handle number/string mismatches
    const idStr = String(id);
    const found = dataArray.find(item => {
      const itemId = String(item.id || item._id || '');
      return itemId === idStr;
    });
    return found ? (found[fieldName] || found.name || '') : '';
  };

  // Update ref when expandedItemId changes
  useEffect(() => {
    expandedItemIdRef.current = expandedItemId;
  }, [expandedItemId]);

  // Global mouse handlers for desktop support (like History.jsx)
  useEffect(() => {
    if (items.length === 0) return;

    const minSwipeDistance = 50;
    const globalMouseMoveHandler = (e) => {
      setSwipeStates(prev => {
        let hasChanges = false;
        const newState = { ...prev };

        items.forEach(item => {
          const state = prev[item.id];
          if (!state) return;

          const deltaX = e.clientX - state.startX;
          const isExpanded = expandedItemIdRef.current === item.id;

          // Only update if dragging horizontally
          if (deltaX < 0 || (isExpanded && deltaX > 0)) {
            newState[item.id] = {
              ...state,
              currentX: e.clientX,
              isSwiping: true
            };
            hasChanges = true;
          }
        });

        return hasChanges ? newState : prev;
      });
    };

    const globalMouseUpHandler = () => {
      setSwipeStates(prev => {
        let hasChanges = false;
        const newState = { ...prev };

        items.forEach(item => {
          const state = prev[item.id];
          if (!state) return;

          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);

          if (absDeltaX >= minSwipeDistance) {
            if (deltaX < 0) {
              // Swiped left (reveal buttons)
              setExpandedItemId(item.id);
            } else {
              // Swiped right (hide buttons)
              setExpandedItemId(null);
            }
          } else {
            // Small movement - snap back
            if (expandedItemIdRef.current === item.id) {
              setExpandedItemId(null);
            }
          }

          // Remove swipe state for this card
          delete newState[item.id];
          hasChanges = true;
        });

        return hasChanges ? newState : prev;
      });
    };

    // Add global mouse event listeners
    document.addEventListener('mousemove', globalMouseMoveHandler);
    document.addEventListener('mouseup', globalMouseUpHandler);

    return () => {
      document.removeEventListener('mousemove', globalMouseMoveHandler);
      document.removeEventListener('mouseup', globalMouseUpHandler);
    };
  }, [items]);

  // Normalize string for case/space-insensitive comparison
  const normalize = (value) => (value || '').toString().trim().toLowerCase();

  // Resolve category id from a category name/value using current options
  const resolveCategoryId = (categoryName) => {
    if (!categoryName || !categoryOptions || !categoryOptions.length) return null;
    const target = normalize(categoryName);
    const found = categoryOptions.find(cat => {
      const label = normalize(cat.label);
      const val = normalize(cat.value);
      const name = normalize(cat.name);
      const catName = normalize(cat.categoryName);
      return label === target || val === target || name === target || catName === target;
    });
    return found ? (found.id || found._id || null) : null;
  };

  // Listen for editPO event from History component
  useEffect(() => {
    const handleEditPO = (event) => {
      const po = event.detail;
      if (po) {
        // Find vendor by name to set selectedVendor
        const vendorOption = vendorNameOptions.find(opt => opt.value === po.vendorName);
        if (vendorOption) {
          // Set previous vendor ID BEFORE setting selectedVendor to preserve PO number
          // This ensures the useEffect doesn't update PO number when loading from History
          previousVendorId.current = vendorOption.id;
          setSelectedVendor({ id: vendorOption.id, name: po.vendorName });
        }

        // Extract eno and display as #eno format (this event only fires when editing from History)
        let displayPoNumber = po.poNumber || '';
        if (po.eno) {
          // Use eno directly to show as #eno format
          displayPoNumber = `#${po.eno}`;
        } else if (po.poNumber && po.poNumber.includes(' - ')) {
          // Extract eno from "PO - YYYY - eno" format
          const parts = po.poNumber.split(' - ');
          if (parts.length >= 3) {
            displayPoNumber = `#${parts[2]}`;
          }
        }

        // Load PO data into form, preserving original ID and creation date
        setPoData({
          poNumber: displayPoNumber,
          date: po.date || '10/11/2025',
          vendorName: po.vendorName || '',
          projectName: po.projectName || '',
          projectIncharge: po.projectIncharge || '',
          contact: po.contact || '',
          created_by: po.created_by || (user && user.username) || '',
          paymentStatus: po.paymentStatus || 'Unpaid',
          // For clone, don't set originalId so it creates a new PO instead of updating
          originalId: po.isClone ? undefined : po.id, // Preserve original ID for updating (only if not clone)
          originalCreatedAt: po.createdAt, // Preserve original creation date
          originalClientId: po.client_id || po.clientId || null,
          originalSiteInchargeId: po.site_incharge_id || po.siteInchargeId || null,
          originalSiteInchargeMobileNumber: po.site_incharge_mobile_number || po.contact || null,
          originalSiteInchargeType: po.site_incharge_type || po.siteInchargeType || null,
        });

        // Restore selected site (client) if we have its ID
        const clientId = po.client_id || po.clientId || null;
        if (clientId && siteOptions && siteOptions.length > 0) {
          const siteOpt = siteOptions.find(s => String(s.id) === String(clientId));
          if (siteOpt) {
            setSelectedSite({ id: siteOpt.id, name: siteOpt.value });
          }
        }

        // Restore selected incharge if we have its ID - check both employee and support staff
        const inchargeId = po.site_incharge_id || po.siteInchargeId || null;
        const inchargeType = po.site_incharge_type || po.siteInchargeType || null;

        if (inchargeId) {
          if (inchargeType === 'support staff' || inchargeType === 'support_staff') {
            // Look for support staff
            if (supportStaffList && supportStaffList.length > 0) {
              const staff = supportStaffList.find(s => String(s.id) === String(inchargeId));
              if (staff) {
                setSelectedIncharge({
                  id: staff.id,
                  name: staff.support_staff_name || staff.supportStaffName || '',
                  mobileNumber: staff.mobile_number || staff.mobileNumber || '',
                  type: 'support staff'
                });
              }
            }
          } else {
            // Default to employee or if type is 'employee'
            if (employeeList && employeeList.length > 0) {
              const emp = employeeList.find(e => String(e.id) === String(inchargeId));
              if (emp) {
                setSelectedIncharge({
                  id: emp.id,
                  name: emp.employeeName || emp.name || emp.fullName || emp.employee_name || '',
                  mobileNumber: emp.employee_mobile_number || emp.mobileNumber || emp.mobile_number || emp.contact || '',
                  type: 'employee'
                });
              }
            }
          }
        }

        // Ensure items have proper id field and all required fields for ItemCard component
        const itemsWithIds = (po.items || []).map((item, index) => {
          console.log('Processing item from history:', item);

          // Extract item name - check if it already includes category (format: "ItemName, Category")
          // Prefer explicit item_id / itemId over generic id (which might be purchaseTable row id)
          const rawItemId = item.itemId || item.item_id || item.itemId || null;
          let itemId = rawItemId || item.id || null;
          let itemName = item.name || item.itemName || '';
          let category = '';
          const existingCategoryId = item.categoryId || item.category_id || null;

          // If backend sent name as just the numeric ID (e.g. "12"), treat it as missing
          if (itemName && rawItemId && normalize(itemName) === String(rawItemId)) {
            itemName = '';
          }

          // If name includes comma, split it (format: "ItemName, Category")
          if (itemName && itemName.includes(',')) {
            const parts = itemName.split(',');
            itemName = parts[0].trim();
            category = parts[1] ? parts[1].trim() : '';
          }

          // If name is empty but we have itemId, look it up from poItemName API data
          if (!itemName && rawItemId && poItemName && poItemName.length > 0) {
            itemName = findNameById(poItemName, rawItemId, 'itemName') ||
              findNameById(poItemName, rawItemId, 'name') || '';
          }
          if (!itemId && itemName && poItemName && poItemName.length > 0) {
            const foundItem = poItemName.find(i => {
              const label = (i.itemName || i.name || '').toLowerCase().trim();
              return label === itemName.toLowerCase().trim();
            });
            itemId = foundItem ? (foundItem.id || foundItem._id) : null;
          }

          // Look up category from categoryId if not already extracted
          let resolvedCategoryId = existingCategoryId;
          if (!category && existingCategoryId && categoryOptions && categoryOptions.length > 0) {
            const categoryOption = categoryOptions.find(cat => String(cat.id) === String(existingCategoryId));
            category = categoryOption ? categoryOption.label : '';
          }
          // Fallback category
          if (!category) {
            category = '';
          }
          if (!resolvedCategoryId && category && categoryOptions && categoryOptions.length > 0) {
            const foundCategory = categoryOptions.find(cat => {
              const label = (cat.label || cat.name || cat.categoryName || '').toLowerCase().trim();
              return label === category.toLowerCase().trim();
            });
            resolvedCategoryId = foundCategory ? (foundCategory.id || foundCategory._id) : null;
          }

          // Reconstruct name with category (format: "ItemName, Category")
          const fullName = itemName ? `${itemName}, ${category}` : '';

          // Handle brand - check multiple possible fields and look up from API if needed
          let brand = item.brand || item.brandName || '';
          let brandId = item.brandId || item.brand_id || null;
          if (!brand && item.brandId && poBrand && poBrand.length > 0) {
            brand = findNameById(poBrand, item.brandId, 'brand') ||
              findNameById(poBrand, item.brandId, 'brandName') ||
              findNameById(poBrand, item.brandId, 'name') || '';
          }

          // Handle model - check multiple possible fields and look up from API if needed
          let model = item.model || item.modelName || '';
          let modelId = item.modelId || item.model_id || null;
          if (!model && item.modelId && poModel && poModel.length > 0) {
            model = findNameById(poModel, item.modelId, 'model') ||
              findNameById(poModel, item.modelId, 'modelName') ||
              findNameById(poModel, item.modelId, 'name') || '';
          }

          // Handle type - check multiple possible fields and look up from API if needed
          let type = item.type || item.typeName || item.typeColor || '';
          let typeId = item.typeId || item.type_id || null;
          if (!type && item.typeId && poType && poType.length > 0) {
            type = findNameById(poType, item.typeId, 'typeColor') ||
              findNameById(poType, item.typeId, 'type') ||
              findNameById(poType, item.typeId, 'typeName') ||
              findNameById(poType, item.typeId, 'name') || '';
          }
          if (!typeId && type && poType && poType.length > 0) {
            const foundType = poType.find(t => {
              const label = (t.typeColor || t.type || t.typeName || t.name || '').toLowerCase().trim();
              return label === type.toLowerCase().trim();
            });
            typeId = foundType ? (foundType.id || foundType._id) : null;
          }

          // Handle price - calculate from amount if needed
          let price = item.price || 0;
          if (!price && item.amount && item.quantity) {
            price = item.amount / item.quantity;
          }

          const transformedItem = {
            ...item,
            id: `item-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            // Preserve underlying purchase table row id for editing via API
            tableRowId: item.id || null,
            name: fullName,
            brand: brand,
            model: model,
            type: type,
            quantity: item.quantity || 0,
            price: price,
            category: category,
            itemId: itemId,
            brandId: brandId,
            modelId: modelId,
            typeId: typeId,
            categoryId: resolvedCategoryId,
          };
          return transformedItem;
        });
        setItems(itemsWithIds);
        setIsEditMode(true);
        // Check if this is a clone operation - if so, don't set isEditFromHistory to show "Generate PO" instead of "Update PO"
        if (po.isClone) {
          setIsEditFromHistory(false); // Clone should show "Generate PO"
          setHasOpenedAdd(false);
        } else {
          setIsEditFromHistory(true); // Edit should show "Update PO"
          setHasOpenedAdd(po.items && po.items.length > 0);
        }
        
        setIsPdfGenerated(false);
        setPdfBlob(null);
        // Switch to create tab
        setActiveTab('create');
      }
    };

    window.addEventListener('editPO', handleEditPO);
    return () => {
      window.removeEventListener('editPO', handleEditPO);
    };
  }, [user, vendorNameOptions, siteOptions, employeeList, supportStaffList, poItemName, poBrand, poModel, poType, categoryOptions]);

  // Listen for viewPO event from History component (view mode with PDF generation)
  useEffect(() => {
    const handleViewPO = (event) => {
      const po = event.detail;
      if (po) {
        // Reset PDF state first to prevent showing wrong PDF data when switching between POs
        setIsPdfGenerated(false);
        setPdfBlob(null);

        // Find vendor by name to set selectedVendor
        const vendorOption = vendorNameOptions.find(opt => opt.value === po.vendorName);
        if (vendorOption) {
          // Set previous vendor ID BEFORE setting selectedVendor to preserve PO number
          // This ensures the useEffect doesn't update PO number when loading from History
          previousVendorId.current = vendorOption.id;
          setSelectedVendor({ id: vendorOption.id, name: po.vendorName });
        }

        // Extract eno and display as #eno format
        let displayPoNumber = po.poNumber || '';
        if (po.eno) {
          displayPoNumber = `#${po.eno}`;
        } else if (po.poNumber && po.poNumber.includes(' - ')) {
          const parts = po.poNumber.split(' - ');
          if (parts.length >= 3) {
            displayPoNumber = `#${parts[2]}`;
          }
        }

        // Load PO data into form
        setPoData({
          poNumber: displayPoNumber,
          date: po.date || '10/11/2025',
          vendorName: po.vendorName || '',
          projectName: po.projectName || '',
          projectIncharge: po.projectIncharge || '',
          contact: po.contact || '',
          created_by: po.created_by || (user && user.username) || '',
          paymentStatus: po.paymentStatus || 'Unpaid',
          // For clone, don't set originalId so it creates a new PO instead of updating
          originalId: po.isClone ? undefined : po.id,
          originalCreatedAt: po.createdAt,
          originalClientId: po.client_id || po.clientId || null,
          originalSiteInchargeId: po.site_incharge_id || po.siteInchargeId || null,
          originalSiteInchargeMobileNumber: po.site_incharge_mobile_number || po.contact || null,
          originalSiteInchargeType: po.site_incharge_type || po.siteInchargeType || null,
        });

        // Restore selected site (client) if we have its ID
        const clientId = po.client_id || po.clientId || null;
        if (clientId && siteOptions && siteOptions.length > 0) {
          const siteOpt = siteOptions.find(s => String(s.id) === String(clientId));
          if (siteOpt) {
            setSelectedSite({ id: siteOpt.id, name: siteOpt.value });
          }
        }

        // Restore selected incharge if we have its ID - check both employee and support staff
        const inchargeId = po.site_incharge_id || po.siteInchargeId || null;
        const inchargeType = po.site_incharge_type || po.siteInchargeType || null;

        if (inchargeId) {
          if (inchargeType === 'support staff' || inchargeType === 'support_staff') {
            // Look for support staff
            if (supportStaffList && supportStaffList.length > 0) {
              const staff = supportStaffList.find(s => String(s.id) === String(inchargeId));
              if (staff) {
                setSelectedIncharge({
                  id: staff.id,
                  name: staff.support_staff_name || staff.supportStaffName || '',
                  mobileNumber: staff.mobile_number || staff.mobileNumber || '',
                  type: 'support staff'
                });
              }
            }
          } else {
            // Default to employee or if type is 'employee'
            if (employeeList && employeeList.length > 0) {
              const emp = employeeList.find(e => String(e.id) === String(inchargeId));
              if (emp) {
                setSelectedIncharge({
                  id: emp.id,
                  name: emp.employeeName || emp.name || emp.fullName || emp.employee_name || '',
                  mobileNumber: emp.employee_mobile_number || emp.mobileNumber || emp.mobile_number || emp.contact || '',
                  type: 'employee'
                });
              }
            }
          }
        }

        // Process items similar to editPO handler
        const itemsWithIds = (po.items || []).map((item, index) => {
          const rawItemId = item.itemId || item.item_id || item.itemId || null;
          let itemId = rawItemId || item.id || null;
          let itemName = item.name || item.itemName || '';
          let category = '';
          const existingCategoryId = item.categoryId || item.category_id || null;

          if (itemName && rawItemId && normalize(itemName) === String(rawItemId)) {
            itemName = '';
          }

          if (itemName && itemName.includes(',')) {
            const parts = itemName.split(',');
            itemName = parts[0].trim();
            category = parts[1] ? parts[1].trim() : '';
          }

          if (!itemName && rawItemId && poItemName && poItemName.length > 0) {
            itemName = findNameById(poItemName, rawItemId, 'itemName') ||
              findNameById(poItemName, rawItemId, 'name') || '';
          }
          if (!itemId && itemName && poItemName && poItemName.length > 0) {
            const foundItem = poItemName.find(i => {
              const label = (i.itemName || i.name || '').toLowerCase().trim();
              return label === itemName.toLowerCase().trim();
            });
            itemId = foundItem ? (foundItem.id || foundItem._id) : null;
          }

          let resolvedCategoryId = existingCategoryId;
          if (!category && existingCategoryId && categoryOptions && categoryOptions.length > 0) {
            const categoryOption = categoryOptions.find(cat => String(cat.id) === String(existingCategoryId));
            category = categoryOption ? categoryOption.label : '';
          }
          if (!category) {
            category = '';
          }
          if (!resolvedCategoryId && category && categoryOptions && categoryOptions.length > 0) {
            const foundCategory = categoryOptions.find(cat => {
              const label = (cat.label || cat.name || cat.categoryName || '').toLowerCase().trim();
              return label === category.toLowerCase().trim();
            });
            resolvedCategoryId = foundCategory ? (foundCategory.id || foundCategory._id) : null;
          }

          const fullName = itemName ? `${itemName}, ${category}` : '';

          let brand = item.brand || item.brandName || '';
          let brandId = item.brandId || item.brand_id || null;
          if (!brand && item.brandId && poBrand && poBrand.length > 0) {
            brand = findNameById(poBrand, item.brandId, 'brand') ||
              findNameById(poBrand, item.brandId, 'brandName') ||
              findNameById(poBrand, item.brandId, 'name') || '';
          }

          let model = item.model || item.modelName || '';
          let modelId = item.modelId || item.model_id || null;
          if (!model && item.modelId && poModel && poModel.length > 0) {
            model = findNameById(poModel, item.modelId, 'model') ||
              findNameById(poModel, item.modelId, 'modelName') ||
              findNameById(poModel, item.modelId, 'name') || '';
          }

          let type = item.type || item.typeName || item.typeColor || '';
          let typeId = item.typeId || item.type_id || null;
          if (!type && item.typeId && poType && poType.length > 0) {
            type = findNameById(poType, item.typeId, 'typeColor') ||
              findNameById(poType, item.typeId, 'type') ||
              findNameById(poType, item.typeId, 'typeName') ||
              findNameById(poType, item.typeId, 'name') || '';
          }
          if (!typeId && type && poType && poType.length > 0) {
            const foundType = poType.find(t => {
              const label = (t.typeColor || t.type || t.typeName || t.name || '').toLowerCase().trim();
              return label === type.toLowerCase().trim();
            });
            typeId = foundType ? (foundType.id || foundType._id) : null;
          }

          let price = item.price || 0;
          if (!price && item.amount && item.quantity) {
            price = item.amount / item.quantity;
          }

          return {
            ...item,
            id: `item-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            tableRowId: item.id || null,
            name: fullName,
            brand: brand,
            model: model,
            type: type,
            quantity: item.quantity || 0,
            price: price,
            category: category,
            itemId: itemId,
            brandId: brandId,
            modelId: modelId,
            typeId: typeId,
            categoryId: resolvedCategoryId,
          };
        });
        setItems(itemsWithIds);
        setIsViewOnlyFromHistory(true); // Mark as view-only mode
        setIsEditMode(false);
        setIsEditFromHistory(false);
        setHasOpenedAdd(po.items && po.items.length > 0);
        // Switch to create tab
        setActiveTab('create');
      }
    };

    window.addEventListener('viewPO', handleViewPO);
    return () => {
      window.removeEventListener('viewPO', handleViewPO);
    };
  }, [user, vendorNameOptions, siteOptions, employeeList, supportStaffList, poItemName, poBrand, poModel, poType, categoryOptions]);

  // Auto-generate PDF when in view-only mode and all required data is available
  useEffect(() => {
    const generateViewOnlyPDF = async () => {
      // Allow PDF generation even for POs with 0 items - just need vendor, site (or clientId), and PO number
      const hasSite = selectedSite || poData.originalClientId;
      if (isViewOnlyFromHistory && !isPdfGenerated && selectedVendor && hasSite && poData.poNumber) {
        // Refresh all option arrays to ensure we have latest data before generating PDF
        await Promise.all([
          fetchPoItemName(),
          fetchPoModel(),
          fetchPoBrand(),
          fetchPoType()
        ]);

        // Construct payload for PDF generation
        const currentPoNo = poData.poNumber.replace('#', '').trim();
        const username = poData.created_by || (user && user.username) || '';
        const clientIdForPayload = selectedSite?.id || poData.originalClientId || null;
        const siteInchargeIdForPayload = selectedIncharge?.id || poData.originalSiteInchargeId || null;
        const mobileForPayload = selectedIncharge?.mobileNumber ||
          selectedIncharge?.mobile_number ||
          selectedIncharge?.contact ||
          poData.contact ||
          poData.originalSiteInchargeMobileNumber ||
          "";
        const siteInchargeTypeForPayload = selectedIncharge?.type || poData.originalSiteInchargeType || null;

        const payload = {
          vendor_id: selectedVendor.id,
          client_id: clientIdForPayload,
          date: poData.date,
          site_incharge_id: siteInchargeIdForPayload,
          site_incharge_mobile_number: mobileForPayload,
          site_incharge_type: siteInchargeTypeForPayload,
          eno: currentPoNo,
          created_by: username,
          purchaseTable: items.map(item => {
            const nameParts = item.name ? item.name.split(',') : [];
            const itemNameOnly = nameParts[0] ? nameParts[0].trim() : '';
            const categoryName = item.category || (nameParts[1] ? nameParts[1].trim() : '');

            return {
              item_id: item.itemId || null,
              category_id: item.categoryId || null,
              model_id: item.modelId || null,
              brand_id: item.brandId || null,
              type_id: item.typeId || null,
              quantity: item.quantity,
              amount: item.amount || (item.quantity * item.price) || 0,
            };
          })
        };

        // Generate PDF without saving to API or auto-downloading (view-only mode)
        generatePDF(payload, true);
      }
    };
    generateViewOnlyPDF();
  }, [isViewOnlyFromHistory, isPdfGenerated, selectedVendor, selectedSite, selectedIncharge, items, poData, user]);

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab]);

  // Clear editingPO from localStorage on mount to ensure fresh start on page reload
  useEffect(() => {
    // Clear any editingPO from localStorage on page reload to start fresh
    localStorage.removeItem('editingPO');

    // Reset all state to ensure clean start on page reload
    setPoData({
      poNumber: '',
      date: formatDate(getTodayDate()),
      vendorName: '',
      projectName: '',
      projectIncharge: '',
      contact: '',
      created_by: (user && user.username) || '',
    });
    setSelectedVendor(null);
    setSelectedSite(null);
    setSelectedIncharge(null);
    setItems([]);
    setHasOpenedAdd(false);
    setIsEditMode(false);
    setIsEditFromHistory(false);
    setIsViewOnlyFromHistory(false);
    setIsPdfGenerated(false);
    setPdfBlob(null);
    setEditingItem(null);
    setExpandedItemId(null);
    setSwipeStates({});
    previousVendorId.current = null; // Reset previous vendor ID tracking
  }, []);

  // Get available items function - returns the actual API data structure
  // Uses the nested otherPOEntityList from the API instead of generating combinations
  const getAvailableItems = useCallback(() => {
    // Return the actual API data structure with nested otherPOEntityList
    // This contains the real relationships between itemName, brand, model, and type
    if (poItemName && poItemName.length > 0) {
      return {
        items: poItemName, // Array of items with otherPOEntityList
        useNestedStructure: true
      };
    }

    // Fallback to old format if API data not available
    const extractedItemNames = poItemName.map(item => item.itemName || item.name || '').filter(name => name !== '');
    const extractedBrands = poBrand.map(item => item.brand || item.name || '').filter(brand => brand !== '');
    const extractedModels = poModel.map(item => item.model || item.name || '').filter(model => model !== '');
    const extractedTypes = poType.map(item => item.typeColor || item.type || item.name || '').filter(type => type !== '');
    const category = categoryOptions.length > 0 ? categoryOptions[0].label : '';

    const fallbackItemNames = extractedItemNames.length > 0 ? extractedItemNames : JSON.parse(localStorage.getItem('itemNameOptions') || '[]');
    const fallbackBrands = extractedBrands.length > 0 ? extractedBrands : JSON.parse(localStorage.getItem('brandOptions') || '[]');
    const fallbackModels = extractedModels.length > 0 ? extractedModels : JSON.parse(localStorage.getItem('modelOptions') || '[]');
    const fallbackTypes = extractedTypes.length > 0 ? extractedTypes : JSON.parse(localStorage.getItem('typeOptions') || '[]');

    return {
      itemNames: fallbackItemNames,
      brands: fallbackBrands,
      models: fallbackModels,
      types: fallbackTypes,
      category: category,
      useNestedStructure: false
    };
  }, [poItemName, poBrand, poModel, poType, categoryOptions]);

  // Fetch vendor names from API
  useEffect(() => {
    fetchVendorNames();
  }, []);

  const fetchVendorNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll');
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.vendorName,
          label: item.vendorName,
          type: "Vendor",
          id: item.id,
        }));
        setVendorNameOptions(formattedData);
      } else {
        console.log('Error fetching vendor names.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Extract vendor names as strings for the dropdown - convert to state for creatable functionality
  const [vendorOptions, setVendorOptions] = useState([]);
  useEffect(() => {
    setVendorOptions(vendorNameOptions.map(option => option.value));
  }, [vendorNameOptions]);

  // Fetch project names (sites) from API
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
        setSiteOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchSites();
  }, []);

  // Extract project names as strings for the dropdown - convert to state for creatable functionality
  const [projectOptions, setProjectOptions] = useState([]);
  useEffect(() => {
    setProjectOptions(siteOptions.map(option => option.value));
  }, [siteOptions]);

  // Fetch employee list from API
  useEffect(() => {
    const fetchEmployeeList = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/getAll');
        if (response.ok) {
          const data = await response.json();
          const siteEngineers = data.filter(
            (emp) => emp.role_of_employee === 'Site Engineer'
          );
          setEmployeeList(siteEngineers);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchEmployeeList();
  }, []);

  // Fetch support staff list from API
  useEffect(() => {
    const fetchSupportStaffList = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/support_staff/getAll');
        if (response.ok) {
          const data = await response.json();
          setSupportStaffList(data);
        }
      } catch (error) {
        console.error('Error fetching support staff:', error);
      }
    };
    fetchSupportStaffList();
  }, []);

  // Extract employee and support staff names as strings for the dropdown - merge both lists
  const [inchargeOptions, setInchargeOptions] = useState([]);
  useEffect(() => {
    const employeeNames = employeeList.map(employee => {
      return employee.employeeName || employee.name || employee.fullName || employee.employee_name || '';
    }).filter(name => name !== '');

    const supportStaffNames = supportStaffList.map(staff => {
      return staff.support_staff_name || staff.supportStaffName || '';
    }).filter(name => name !== '');

    // Merge and remove duplicates
    const merged = [...new Set([...employeeNames, ...supportStaffNames])].sort();
    setInchargeOptions(merged);
  }, [employeeList, supportStaffList]);

  // Create siteInchargeOptions with IDs for lookup in PDF - includes both employees and support staff
  const siteInchargeOptions = [
    ...employeeList.map(emp => ({
      id: emp.id,
      label: emp.employeeName || emp.name || emp.fullName || emp.employee_name || '',
      type: 'employee'
    })),
    ...supportStaffList.map(staff => ({
      id: staff.id,
      label: staff.support_staff_name || staff.supportStaffName || '',
      type: 'support staff'
    }))
  ];
  // Fetch PO item names from API - extracted as reusable function
  const fetchPoItemName = useCallback(async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoItemName(data);
      }
    } catch (error) {
      console.error('Error fetching PO item names:', error);
    }
  }, []);

  // Fetch PO model from API - extracted as reusable function
  const fetchPoModel = useCallback(async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoModel(data);
      }
    } catch (error) {
      console.error('Error fetching PO models:', error);
    }
  }, []);

  // Fetch PO brand from API - extracted as reusable function
  const fetchPoBrand = useCallback(async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoBrand(data);
      }
    } catch (error) {
      console.error('Error fetching PO brands:', error);
    }
  }, []);

  // Fetch PO type from API - extracted as reusable function
  const fetchPoType = useCallback(async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoType(data);
      }
    } catch (error) {
      console.error('Error fetching PO types:', error);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchPoItemName();
  }, []);

  useEffect(() => {
    fetchPoModel();
  }, []);

  useEffect(() => {
    fetchPoBrand();
  }, []);

  useEffect(() => {
    fetchPoType();
  }, []);

  // Fetch PO categories (id + label)
  useEffect(() => {
    const fetchPoCategory = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll');
        if (response.ok) {
          const data = await response.json();
          const options = (data || []).map(item => ({
            value: item.category || item.categoryName || item.name || '',
            label: item.category || item.categoryName || item.name || '',
            id: item.id || item._id || null,
          }));
          setCategoryOptions(options);
        } else {
          console.log('Error fetching categories, using empty list.');
          setCategoryOptions([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoryOptions([]);
      }
    };
    fetchPoCategory();
  }, []);

  // Helper function to extract numeric value from eno
  const getNumericEno = (order) => {
    const eno = order.eno || order.ENO || order.poNumber || order.po_number || '';
    if (typeof eno === 'number') {
      return eno;
    }
    const str = String(eno);
    // Extract numeric part (remove #, spaces, etc.)
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Fetch next PO number for vendor
  const fetchNextPoNumberForVendor = async (vendorId) => {
    if (!vendorId) {
      return 1;
    }
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/purchase_orders/getAll');
      if (!response.ok) {
        throw new Error('Failed to fetch purchase orders');
      }
      const data = await response.json();
      const normalizedVendorId = String(vendorId);
      const vendorOrders = data.filter(order => String(order.vendor_id ?? order.vendorId) === normalizedVendorId);
      if (!vendorOrders.length) {
        return 1;
      }
      const latestEno = vendorOrders.reduce((maxValue, order) => {
        const currentEno = getNumericEno(order);
        return currentEno > maxValue ? currentEno : maxValue;
      }, 0);
      return latestEno + 1;
    } catch (error) {
      console.error('Failed to fetch last PO number:', error);
      return 1;
    }
  };
  // Handlers for adding new options
  const handleAddNewVendor = async (newVendor) => {
    if (!newVendor || !newVendor.trim()) {
      return;
    }
    try {
      // Create vendor data with only vendorName (other fields will be null/empty)
      const vendorData = {
        vendorName: newVendor.trim(),
        account_holder_name: '',
        account_number: '',
        bank_name: '',
        ifsc_code: '',
        branch: '',
        gpay_number: '',
        upi_id: '',
        contact_number: '',
        contact_email: ''
      };
      // Create FormData object
      const formData = new FormData();
      // Create a blob for the vendor data
      const vendorBlob = new Blob([JSON.stringify(vendorData)], { type: 'application/json' });
      formData.append("vendor", vendorBlob);
      // No file appended since we're only saving vendor name
      const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/save", {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to save vendor: ${response.status} - ${errorText}`);
        throw new Error(`Failed to save vendor: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      await fetchVendorNames();
      if (!vendorOptions.includes(newVendor)) {
        setVendorOptions([...vendorOptions, newVendor]);
      }
    } catch (error) {
      console.error("Error saving vendor:", error);
      alert(`Failed to save vendor: ${error.message}`);
      if (!vendorOptions.includes(newVendor)) {
        setVendorOptions([...vendorOptions, newVendor]);
      }
    }
  };
  const handleAddNewProject = (newProject) => {
    if (!projectOptions.includes(newProject)) {
      setProjectOptions([...projectOptions, newProject]);
    }
  };
  const handleAddNewIncharge = (newIncharge) => {
    if (!inchargeOptions.includes(newIncharge)) {
      setInchargeOptions([...inchargeOptions, newIncharge]);
    }
  };
  // Search functionality (legacy - may not be used anymore)
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const data = getAvailableItems();
      const query = searchQuery.toLowerCase().trim();
      // Handle nested structure from API
      let availableItems = [];
      if (data.useNestedStructure && data.items && Array.isArray(data.items)) {
        // Use nested structure from API
        for (const item of data.items) {
          const itemName = item.itemName || '';
          const category = item.category || '';
          const otherPOEntityList = item.otherPOEntityList || [];
          const itemNameLower = itemName.toLowerCase();
          const itemNameMatches = itemNameLower.includes(query);
          for (const entity of otherPOEntityList) {
            const brand = entity.brandName || '';
            const model = entity.modelName || '';
            const type = entity.typeColor || '';
            const brandLower = brand.toLowerCase();
            const modelLower = model.toLowerCase();
            const typeLower = type.toLowerCase();
            if (itemNameMatches || brandLower.includes(query) ||
              modelLower.includes(query) || typeLower.includes(query)) {
              availableItems.push({
                itemName,
                brand,
                model,
                type,
                category
              });
            }
          }
        }
      } else if (Array.isArray(data)) {
        availableItems = data;
      } else {
        // Fallback: generate combinations on-demand for search
        const MAX_RESULTS = 50;
        let count = 0;
        const itemNames = data.itemNames || [];
        const brands = data.brands || [];
        const models = data.models || [];
        const types = data.types || [];
        const category = data.category || '';
        for (const itemName of itemNames) {
          if (count >= MAX_RESULTS) break;
          for (const brand of brands) {
            if (count >= MAX_RESULTS) break;
            for (const model of models) {
              if (count >= MAX_RESULTS) break;
              for (const type of types) {
                if (count >= MAX_RESULTS) break;
                const itemNameLower = itemName.toLowerCase();
                const brandLower = brand.toLowerCase();
                const modelLower = model.toLowerCase();
                const typeLower = type.toLowerCase();
                if (itemNameLower.includes(query) || brandLower.includes(query) ||
                  modelLower.includes(query) || typeLower.includes(query)) {
                  availableItems.push({
                    itemName,
                    brand,
                    model,
                    type,
                    category
                  });
                  count++;
                }
              }
            }
          }
        }
      }
      // First, filter items that match the search query and identify which field matches
      // Each item should only appear once, with matchType based on priority: brand > model > type > itemName
      const filtered = availableItems.map(item => {
        let matchType = null;
        // Check fields in priority order - first match wins
        if (item.brand.toLowerCase().includes(query)) {
          matchType = 'brand';
        } else if (item.model.toLowerCase().includes(query)) {
          matchType = 'model';
        } else if (item.type.toLowerCase().includes(query)) {
          matchType = 'type';
        } else if (item.itemName.toLowerCase().includes(query)) {
          matchType = 'itemName';
        }
        return matchType ? { ...item, matchType } : null;
      }).filter(item => item !== null);
      // Group by match type
      const itemNameMatches = [];
      const brandMatches = [];
      const modelMatches = [];
      const typeMatches = [];
      filtered.forEach(item => {
        if (item.matchType === 'brand') {
          brandMatches.push(item);
        } else if (item.matchType === 'model') {
          modelMatches.push(item);
        } else if (item.matchType === 'type') {
          typeMatches.push(item);
        } else if (item.matchType === 'itemName') {
          itemNameMatches.push(item);
        }
      });
      let sorted = [];
      if (brandMatches.length > 0) {
        sorted = [...brandMatches, ...modelMatches, ...typeMatches, ...itemNameMatches];
      } else if (modelMatches.length > 0) {
        sorted = [...modelMatches, ...typeMatches, ...itemNameMatches, ...brandMatches];
      } else if (typeMatches.length > 0) {
        sorted = [...typeMatches, ...itemNameMatches, ...brandMatches, ...modelMatches];
      } else {
        sorted = [...itemNameMatches, ...brandMatches, ...modelMatches, ...typeMatches];
      }
      // Sort alphabetically within each match type group
      sorted = sorted.sort((a, b) => {
        if (a.matchType !== b.matchType) {
          // Keep the priority order we established above
          return 0;
        }
        return a.itemName.localeCompare(b.itemName);
      });
      // Limit to 50 results to avoid performance issues
      const results = sorted.slice(0, 50);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);
  // Handle search result add with quantity
  const handleSearchAdd = (item, quantity, isIncremental = false) => {
    // Normalize values for comparison
    const normalizeValue = (val) => (val || '').toString().toLowerCase().trim();

    const newItemName = normalizeValue(item.itemName);
    const newCategory = normalizeValue(item.category);
    const newModel = normalizeValue(item.model);
    const newBrand = normalizeValue(item.brand);
    const newType = normalizeValue(item.type);

    // Check if an item with the same properties (including category) already exists
    const existingItemIndex = items.findIndex(existingItem => {
      const nameParts = existingItem.name ? existingItem.name.split(',') : [];
      const existingItemName = normalizeValue(nameParts[0]);
      const existingCategory = normalizeValue(nameParts[1] || existingItem.category || '');
      const existingModel = normalizeValue(existingItem.model);
      const existingBrand = normalizeValue(existingItem.brand);
      const existingType = normalizeValue(existingItem.type);

      // Match if all properties including category are the same
      return (
        existingItemName === newItemName &&
        existingCategory === newCategory &&
        existingModel === newModel &&
        existingBrand === newBrand &&
        existingType === newType
      );
    });

    if (existingItemIndex !== -1) {
      // Update existing item quantity (merge quantities)
      const updatedItems = [...items];
      const currentQuantity = updatedItems[existingItemIndex].quantity || 0;
      const newQuantity = isIncremental ? currentQuantity + quantity : quantity;
      if (newQuantity > 0) {
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity
        };
        setItems(updatedItems);
      } else {
        // Remove item if quantity becomes 0 or negative
        updatedItems.splice(existingItemIndex, 1);
        setItems(updatedItems);
      }
    } else if (quantity > 0) {
      // Add new item
      const newItemId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
      const newItem = {
        id: newItemId,
        name: `${item.itemName}, ${item.category}`,
        brand: item.brand,
        model: item.model,
        type: item.type,
        category: item.category || '',
        quantity: quantity,
        price: 0,
        itemId: item.itemId || null,
        brandId: item.brandId || null,
        modelId: item.modelId || null,
        typeId: item.typeId || null,
        categoryId: item.categoryId || null,
      };
      setItems([...items, newItem]);
    }
    if (items.length === 0 && !poData.poNumber) {
      setPoData({ ...poData, poNumber: '#312' });
    }
    setHasOpenedAdd(true);
  };
  useEffect(() => {
    const fetchPoNumber = async () => {
      if (isViewOnlyFromHistory) {
        previousVendorId.current = selectedVendor?.id || null;
        return;
      }
      const vendorIdChanged = previousVendorId.current !== selectedVendor?.id;
      if (selectedVendor?.id && vendorIdChanged) {
        try {
          const nextPoNo = await fetchNextPoNumberForVendor(selectedVendor.id);
          setPoData(prev => ({ ...prev, poNumber: `#${nextPoNo}` }));
          previousVendorId.current = selectedVendor.id;
        } catch (error) {
          console.error('Error fetching PO number:', error);
        }
      } else if (!selectedVendor && (!isEditMode || (isEditMode && !isEditFromHistory))) {
        setPoData(prev => ({ ...prev, poNumber: '' }));
        previousVendorId.current = null;
      } else if (selectedVendor?.id && !vendorIdChanged) {
        previousVendorId.current = selectedVendor.id;
      }
    };
    fetchPoNumber();
  }, [selectedVendor, isEditMode, isEditFromHistory, isViewOnlyFromHistory]);
  useEffect(() => {
    if (isEditMode && previousVendorName.current !== '' &&
      previousVendorName.current !== poData.vendorName) {
      setItems([]);
    }
    previousVendorName.current = poData.vendorName;
  }, [poData.vendorName, isEditMode]);
  const handleAddItem = (itemData) => {
    if (editingItem) {
      const updatedItems = items.map(item =>
        item.id === editingItem.id
          ? {
            ...item,
            name: `${itemData.itemName}, ${itemData.category}`,
            brand: itemData.brand,
            model: itemData.model,
            type: itemData.type,
            quantity: parseInt(itemData.quantity),
            // When editing, use the new itemData IDs - don't fall back to old item IDs
            // This ensures that if user selects a new item, we use the new item's ID, not the old deleted one
            itemId: itemData.itemId || null,
            brandId: itemData.brandId || null,
            modelId: itemData.modelId || null,
            typeId: itemData.typeId || null,
            categoryId: itemData.categoryId || resolveCategoryId(itemData.category) || null,
          }
          : item
      );
      setItems(updatedItems);
      setEditingItem(null);
    } else {
      // Normalize values for comparison
      const normalizeValue = (val) => (val || '').toString().toLowerCase().trim();
      const newItemName = normalizeValue(itemData.itemName);
      const newCategory = normalizeValue(itemData.category);
      const newModel = normalizeValue(itemData.model);
      const newBrand = normalizeValue(itemData.brand);
      const newType = normalizeValue(itemData.type);
      const newQuantity = parseInt(itemData.quantity) || 0;
      // Check if an item with the same properties exists
      const existingItemIndex = items.findIndex(item => {
        const itemNameParts = item.name ? item.name.split(',') : [];
        const existingItemName = normalizeValue(itemNameParts[0]);
        const existingCategory = normalizeValue(itemNameParts[1] || item.category || '');
        const existingModel = normalizeValue(item.model);
        const existingBrand = normalizeValue(item.brand);
        const existingType = normalizeValue(item.type);
        // Match if all properties are the same
        return (
          existingItemName === newItemName &&
          existingCategory === newCategory &&
          existingModel === newModel &&
          existingBrand === newBrand &&
          existingType === newType
        );
      });
      if (existingItemIndex !== -1) {
        // Merge with existing item by adding quantities
        const updatedItems = items.map((item, index) => {
          if (index === existingItemIndex) {
            return {
              ...item,
              quantity: (item.quantity || 0) + newQuantity,
            };
          }
          return item;
        });
        setItems(updatedItems);
      } else {
        // Add as new item
        const newItem = {
          id: items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1,
          name: `${itemData.itemName}, ${itemData.category}`,
          brand: itemData.brand,
          model: itemData.model,
          type: itemData.type,
          category: itemData.category || '',
          quantity: newQuantity,
          price: 0,
          itemId: itemData.itemId || null,
          brandId: itemData.brandId || null,
          modelId: itemData.modelId || null,
          typeId: itemData.typeId || null,
          categoryId: itemData.categoryId || resolveCategoryId(itemData.category) || null,
        };
        setItems([...items, newItem]);
      }
    }
    if (items.length === 0 && !poData.poNumber) {
      setPoData({ ...poData, poNumber: '#312' });
    }
  };
  const handleDeleteItem = (itemId) => {
    setItemToDelete(itemId);
    setShowDeleteConfirm(true);
  };
  const confirmDelete = () => {
    if (itemToDelete) {
      setItems(items.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
    }
    setShowDeleteConfirm(false);
  };
  const handleDateConfirm = (date) => {
    setPoData({ ...poData, date });
    setShowDatePicker(false);
  };
  const formatDateOnly = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('/')) {
      return dateString;
    }
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const generatePO = async () => {
    if (!selectedVendor?.id) {
      alert("Please select a Vendor before generating a PO.");
      return;
    }
    setIsGenerating(true);
    try {
      const username = (user && user.username) || poData.created_by || '';
      let currentPoNo;
      if (isEditMode && poData.originalId) {
        currentPoNo = getNumericEno({ eno: poData.poNumber || '' });
      } else {
        currentPoNo = await fetchNextPoNumberForVendor(selectedVendor.id);
        setPoData(prev => ({ ...prev, poNumber: `#${currentPoNo}` }));
      }
      const clientIdForPayload =
        selectedSite?.id ??
        poData.originalClientId ??
        null;
      const siteInchargeIdForPayload =
        selectedIncharge?.id ??
        poData.originalSiteInchargeId ??
        null;
      const mobileForPayload =
        selectedIncharge?.mobileNumber ||
        poData.contact ||
        poData.originalSiteInchargeMobileNumber ||
        "";
      const siteInchargeTypeForPayload =
        selectedIncharge?.type ||
        poData.originalSiteInchargeType ||
        null;
      const payload = {
        vendor_id: selectedVendor.id,
        client_id: clientIdForPayload,
        date: poData.date,
        site_incharge_id: siteInchargeIdForPayload,
        site_incharge_mobile_number: mobileForPayload,
        site_incharge_type: siteInchargeTypeForPayload,
        eno: currentPoNo,
        created_by: username,
        purchaseTable: items.map(item => {
          const nameParts = item.name ? item.name.split(',') : [];
          const itemNameOnly = nameParts[0] ? nameParts[0].trim() : '';
          const categoryName = item.category || (nameParts[1] ? nameParts[1].trim() : '');
          let itemId = item.itemId;
          let brandId = item.brandId;
          let modelId = item.modelId;
          let typeId = item.typeId;
          let categoryId = item.categoryId;
          if (!itemId && itemNameOnly && poItemName && poItemName.length > 0) {
            const foundItem = poItemName.find(i =>
              (i.itemName || i.name || '').toLowerCase() === itemNameOnly.toLowerCase()
            );
            itemId = foundItem ? (foundItem.id || foundItem._id) : null;
          }
          if (!brandId && item.brand && poBrand && poBrand.length > 0) {
            const foundBrand = poBrand.find(b =>
              (b.brand || b.brandName || b.name || '').toLowerCase() === item.brand.toLowerCase()
            );
            brandId = foundBrand ? (foundBrand.id || foundBrand._id) : null;
          }
          if (!modelId && item.model && poModel && poModel.length > 0) {
            const foundModel = poModel.find(m =>
              (m.model || m.modelName || m.name || '').toLowerCase() === item.model.toLowerCase()
            );
            modelId = foundModel ? (foundModel.id || foundModel._id) : null;
          }
          if (!typeId && item.type && poType && poType.length > 0) {
            const foundType = poType.find(t =>
              (t.typeColor || t.type || t.typeName || t.name || '').toLowerCase() === item.type.toLowerCase()
            );
            typeId = foundType ? (foundType.id || foundType._id) : null;
          }
          if (!categoryId && categoryName && categoryOptions && categoryOptions.length > 0) {
            categoryId = resolveCategoryId(categoryName);
          }
          return {
            id: (isEditMode && poData.originalId) ? (item.tableRowId || null) : null,
            item_id: itemId || null,
            category_id: categoryId || null,
            model_id: modelId || null,
            brand_id: brandId || null,
            type_id: typeId || null,
            quantity: item.quantity,
            amount: item.amount || (item.quantity * 0) || 0,
          };
        })
      };
      const isEditingExistingPo = isEditMode && poData.originalId;
      const baseUrl = "https://backendaab.in/aabuildersDash/api/purchase_orders";
      const url = isEditingExistingPo
        ? `${baseUrl}/edit_with_history/${poData.originalId}?changedBy=${encodeURIComponent(username)}`
        : `${baseUrl}/save`;
      const response = await fetch(url, {
        method: isEditingExistingPo ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const result = await response.json();
        console.log("Response from API:", result);
        // Refresh all option arrays to ensure we have latest data before generating PDF
        await Promise.all([
          fetchPoItemName(),
          fetchPoModel(),
          fetchPoBrand(),
          fetchPoType()
        ]);
        generatePDF(payload);
        setSelectedCategory('');
        alert(isEditingExistingPo ? "Purchase Order Updated!" : "Purchase Order Generated!");
      } else {
        const error = await response.text();
        console.error("Error:", error);
        alert("Failed to save Purchase Order");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Server not responding");
    } finally {
      setIsGenerating(false);
    }
  };
  const generatePDF = (payload, skipSaveAndDownload = false) => {
    const doc = new jsPDF();
    const findNameById = (options, id, key) => {
      if (!id || !options || !Array.isArray(options)) return '';
      const match = options.find(opt => opt.id == id);
      if (!match) return '';
      return match[key] || match.label || match.name || '';
    };
    const vendorName = findNameById(vendorNameOptions, payload.vendor_id, "label");
    const clientName = findNameById(siteOptions, payload.client_id, "label");
    const siteInchargeName = findNameById(siteInchargeOptions, payload.site_incharge_id, "label");
    const isRajaganapathyVendor = vendorName === "Rajaganapathy Plywoods";
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 41.8);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PURCHASE ORDER", 12, 22);
    doc.text(`PO No :`, 12, 28);
    doc.setFontSize(16);
    doc.text("AA BUILDERS", 105, 17, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("181 Madurai Road, Srivilliputtur - 626 125", 105, 28, { align: "center" });
    doc.text(`# ${payload.eno}`, 35, 28);
    doc.line(10, 30, 200, 30);
    doc.setFont("helvetica", "bold");
    doc.text(`VENDOR:`, 12, 37);
    doc.setFont("helvetica", "normal");
    doc.text(vendorName || "", 35, 37);
    doc.setFont("helvetica", "bold");
    doc.text(`DATE:`, 12, 44.5);
    doc.setFont("helvetica", "normal");
    doc.text(formatDateOnly(payload.date) || "", 35, 44.5);
    doc.setFont("helvetica", "bold");
    doc.text("SITE NAME:", 107, 37);
    doc.setFont("helvetica", "normal");
    // Wrap site name text to fit within the box (from x=130 to x=200, width ~70)
    const siteNameText = clientName || "";
    if (siteNameText) {
      const maxWidth = 70; // Available width for site name
      const wrappedText = doc.splitTextToSize(siteNameText, maxWidth);
      doc.text(wrappedText, 130, 37);
    }
    doc.setFont("helvetica", "bold");
    doc.text("Site Incharge:", 104, 44.5);
    doc.setFont("helvetica", "normal");
    doc.text(siteInchargeName || "", 130, 44.5);
    const mobileNumber = payload.site_incharge_mobile_number || poData.contact || (selectedIncharge && (selectedIncharge.mobileNumber || selectedIncharge.mobile_number || selectedIncharge.contact));
    if (mobileNumber) {
      doc.setFont("helvetica", "bold");
      doc.text("Phone:", 115, 50);
      doc.setFont("helvetica", "normal");
      doc.text(mobileNumber, 130, 50);
    }
    const purchaseTableData = (payload.purchaseTable && payload.purchaseTable.length > 0 && payload.purchaseTable.some(item => item.item_id))
      ? payload.purchaseTable
      : items.map(item => {
        const nameParts = item.name ? item.name.split(',') : [];
        return {
          item_id: item.itemId || null,
          category_id: item.categoryId || null,
          model_id: item.modelId || null,
          brand_id: item.brandId || null,
          type_id: item.typeId || null,
          quantity: item.quantity || 0,
          amount: item.amount || (item.quantity * item.price) || 0,
          _itemName: nameParts[0] || '',
          _category: nameParts[1] ? nameParts[1].trim() : '',
          _model: item.model || '',
          _brand: item.brand || '',
          _type: item.type || ''
        };
      });
    const tableBody = purchaseTableData.map((item, index) => {
      let itemName = '';
      let category = '';
      let model = '';
      let brand = '';
      let type = '';
      if (item.item_id) {
        itemName = findNameById(poItemName, item.item_id, "itemName") || findNameById(poItemName, item.item_id, "name") || '';
      }
      if (!itemName && item._itemName) {
        itemName = item._itemName;
      }
      if (item.category_id) {
        category = findNameById(categoryOptions, item.category_id, "label") || '';
      }
      if (!category && item._category) {
        category = item._category;
      }
      if (item.model_id) {
        model = findNameById(poModel, item.model_id, "model") || findNameById(poModel, item.model_id, "name") || '';
      }
      if (!model && item._model) {
        model = item._model;
      }
      if (item.brand_id) {
        brand = findNameById(poBrand, item.brand_id, "brand") || findNameById(poBrand, item.brand_id, "name") || '';
      }
      if (!brand && item._brand) {
        brand = item._brand;
      }
      if (item.type_id) {
        type = findNameById(poType, item.type_id, "typeColor") || findNameById(poType, item.type_id, "name") || '';
      }
      if (!type && item._type) {
        type = item._type;
      }
      if (isRajaganapathyVendor) {
        // For Rajaganapathy Plywoods: SNO, BRAND, ITEM NAME, MODEL, TYPE, QTY, PRICE (no CATEGORY)
        return [
          index + 1,
          brand,
          itemName,
          model,
          type,
          item.quantity || "",
          item.amount || ""
        ];
      } else {
        // Original order: SNO, ITEM NAME, CATEGORY, MODEL, BRAND, TYPE, QTY, PRICE
        return [
          index + 1,
          itemName,
          category,
          model,
          brand,
          type,
          item.quantity || "",
          item.amount || ""
        ];
      }
    });
    while (tableBody.length < 24) {
      if (isRajaganapathyVendor) {
        tableBody.push(["", "", "", "", "", "", ""]);
      } else {
        tableBody.push(["", "", "", "", "", "", "", ""]);
      }
    }
    const totalQty = purchaseTableData.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalAmount = purchaseTableData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    if (isRajaganapathyVendor) {
      tableBody.push([
        "", "", "", "",
        { content: `TOTAL`, styles: { fontStyle: "bold", halign: "center" } },
        { content: `${totalQty}`, styles: { fontStyle: "bold", halign: "center" } },
        { content: `${totalAmount}`, styles: { fontStyle: "bold", halign: "center" } }
      ]);
    } else {
      tableBody.push([
        "", "", "", "", "",
        { content: `TOTAL`, styles: { fontStyle: "bold", halign: "center" } },
        { content: `${totalQty}`, styles: { fontStyle: "bold", halign: "center" } },
        { content: `${totalAmount}`, styles: { fontStyle: "bold", halign: "center" } }
      ]);
    }
    const tableHeaders = isRajaganapathyVendor 
      ? [["SNO", "BRAND", "ITEM NAME", "MODEL", "TYPE", "QTY", "PRICE"]]
      : [["SNO", "ITEM NAME", "CATEGORY", "MODEL", "BRAND", "TYPE", "QTY", "PRICE"]];
    
    const columnStylesConfig = isRajaganapathyVendor
      ? {
          0: { cellWidth: 12 }, // SNO
          1: { cellWidth: 25 }, // BRAND
          2: { cellWidth: 75 }, // ITEM NAME
          3: { cellWidth: 28 }, // MODEL
          4: { cellWidth: 20 }, // TYPE
          5: { cellWidth: 13 }, // QTY
          6: { cellWidth: 17 }  // PRICE
        }
      : {
          0: { cellWidth: 12 }, // SNO
          1: { cellWidth: 50 }, // ITEM NAME
          2: { cellWidth: 30 }, // CATEGORY
          3: { cellWidth: 28 }, // MODEL
          4: { cellWidth: 20 }, // BRAND
          5: { cellWidth: 20 }, // TYPE
          6: { cellWidth: 13 }, // QTY
          7: { cellWidth: 17 }  // PRICE
        };

    autoTable(doc, {
      startY: 52,
      margin: { left: 10, right: 10 },
      tableWidth: 190,
      head: tableHeaders,
      body: tableBody,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 2,
        textColor: 0,
        lineColor: [100, 100, 100],
        lineWidth: 0.2,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        fontStyle: "bold",
      },
      columnStyles: columnStylesConfig,
      didDrawPage: function () {
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        doc.setFontSize(5);
        doc.text(`Created By: ${payload.created_by || ''}`, 14, pageHeight - 10);
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
        doc.text(`Date: ${formattedDateTime}`, pageWidth - 60, pageHeight - 10);
      }
    });
    const pdfBlob = doc.output('blob');
    setPdfBlob(pdfBlob);
    setIsPdfGenerated(true);
    if (!skipSaveAndDownload) {
      savePurchaseOrderToHistory(pdfBlob);
      doc.save(`#${payload.eno} - ${formatDateOnly(payload.date).replace(/\//g, '-')} - ${clientName}.pdf`);
    }
  };
  const savePurchaseOrderToHistory = (pdfBlob) => {
    try {
      const createdBy = poData.created_by || (user && user.username) || '';
      const poToSave = {
        id: isEditMode && poData.originalId ? poData.originalId : Date.now().toString(), // Preserve ID if editing
        poNumber: poData.poNumber,
        date: poData.date,
        vendorName: poData.vendorName,
        projectName: poData.projectName,
        projectIncharge: poData.projectIncharge,
        contact: poData.contact,
        created_by: createdBy,
        items: items.map(item => ({
          name: item.name,
          brand: item.brand,
          model: item.model,
          type: item.type,
          quantity: item.quantity,
          price: item.price,
          amount: item.amount || (item.quantity * item.price)
        })),
        paymentStatus: poData.paymentStatus || 'Unpaid',
        createdAt: isEditMode && poData.originalCreatedAt ? poData.originalCreatedAt : new Date().toISOString(),
        pdfBlob: null
      };
      const existingPOs = localStorage.getItem('purchaseOrders');
      const poList = existingPOs ? JSON.parse(existingPOs) : [];
      if (isEditMode && poData.originalId) {
        const index = poList.findIndex(po => po.id === poData.originalId);
        if (index !== -1) {
          poList[index] = poToSave;
        } else {
          poList.push(poToSave);
        }
      } else {
        poList.push(poToSave);
      }
      localStorage.setItem('purchaseOrders', JSON.stringify(poList));
      window.dispatchEvent(new CustomEvent('poUpdated'));
      setIsEditMode(false);
      setIsEditFromHistory(false);
      setPoData(prev => {
        const { originalId, originalCreatedAt, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Error saving purchase order to history:', error);
    }
  };
  const downloadPDF = () => {
    if (pdfBlob) {
      const dateForFilename = formatDateOnly(poData.date).replace(/\//g, '-');
      const poNumber = poData.poNumber.replace('#', '').trim();
      const filename = `#${poNumber} - ${dateForFilename} - ${poData.projectName}.pdf`;
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  const handleNewPO = () => {
    setPoData({
      poNumber: '',
      date: formatDate(getTodayDate()),
      vendorName: '',
      projectName: '',
      projectIncharge: '',
      contact: '',
      created_by: poData.created_by || (user && user.username) || '',
    });
    setSelectedVendor(null);
    setSelectedSite(null);
    setSelectedIncharge(null);
    setItems([]);
    setHasOpenedAdd(false);
    setIsEditMode(false);
    setIsEditFromHistory(false);
    setIsViewOnlyFromHistory(false);
    setIsPdfGenerated(false);
    setPdfBlob(null);
    setEditingItem(null);
    setExpandedItemId(null);
    setSwipeStates({});
    setSelectedCategory('');
    previousVendorId.current = null;
  };
  const shareViaWhatsApp = () => {
    if (pdfBlob) {
      const message = `Purchase Order ${poData.poNumber}\nDate: ${poData.date}\nVendor: ${poData.vendorName}\nProject: ${poData.projectName}\n\nPlease find the attached PDF.`;
      const dateForFilename = formatDateOnly(poData.date).replace(/\//g, '-');
      const poNumber = poData.poNumber.replace('#', '').trim();
      const filename = `#${poNumber} - ${dateForFilename} - ${poData.projectName}.pdf`;
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });
      if (navigator.share && navigator.canShare) {
        const shareData = {
          files: [file],
          title: `Purchase Order ${poData.poNumber}`,
          text: message
        };
        if (navigator.canShare(shareData)) {
          navigator.share(shareData)
            .then(() => {
              console.log('PDF shared successfully');
            })
            .catch((error) => {
              console.error('Error sharing PDF:', error);
              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + '\n\nNote: Please download and attach the PDF manually.')}`;
              window.open(whatsappUrl, '_blank');
            });
          return;
        }
      }
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setTimeout(() => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + '\n\nNote: The PDF has been downloaded. Please attach it manually.')}`;
        window.open(whatsappUrl, '_blank');
      }, 500);
    }
  };
  const handleMenuClick = () => {
    setSidebarOpen(true);
  };
  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };
  const handleNavigate = (page) => {
    if (page === 'purchase-order') {
      setCurrentPage('purchase-order');
      navigate('/purchaseorder');
    } else if (page === 'inventory') {
      setCurrentPage('inventory');
      navigate('/inventory');
    }
    // Other pages can be handled here when implemented
  };
  return (
    <div className="relative w-full min-h-screen bg-white max-w-[360px] mx-auto pb-[80px]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        userRoles={user?.userRoles || []}
      />
      {/* Header - Fixed */}
      <Header user={user} onLogout={onLogout} onMenuClick={handleMenuClick} />
      {/* Tabs - Fixed */}
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Content Area - Add padding to account for fixed Header and Tabs */}
      <div className="pt-[85px]">
        {/* History Tab Content */}
        {activeTab === 'history' && <History />}
        {/* Input Data Tab Content */}
        {activeTab === 'input' && <InputData />}
        {/* Summary Tab Content */}
        {activeTab === 'summary' && <Summary />}
        {/* Create PO Tab Content */}
        {activeTab === 'create' && (
          <div className="flex flex-col h-[calc(100vh-85px-80px)] overflow-hidden">
            {/* PO Number and Date Row - Only show date when not in empty state */}
            {!isEmptyState && (
              <div className="flex-shrink-0 px-4 pt-2 pb-1 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {poData.poNumber && (
                      <p className="text-[12px] font-medium text-black leading-normal">{poData.poNumber}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(true)}
                      className="text-[12px] font-medium text-[#616161] leading-normal underline-offset-2 hover:underline"
                    >
                      {poData.date}
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    {isPdfGenerated ? (
                      <>
                        <button
                          type="button"
                          onClick={downloadPDF}
                          className="text-[13px] font-medium text-black leading-normal"
                        >
                          Download
                        </button>

                      </>
                    ) : !isViewOnlyFromHistory && areFieldsFilled ? (
                      <button
                        type="button"
                        onClick={generatePO}
                        disabled={isGenerating}
                        className={`text-[13px] font-bold leading-normal ${isGenerating ? 'text-gray-400 cursor-not-allowed' : 'text-black'}`}
                      >
                        {isGenerating ? (isEditFromHistory ? 'Updating...' : 'Generating...') : (isEditFromHistory ? 'Update PO' : 'Generate PO')}
                      </button>
                    ) : null}
                    {!isViewOnlyFromHistory && (
                      <button
                        type="button"
                        onClick={() => {
                          // Update UI state immediately for instant response
                          setIsEditMode(true);
                          setIsViewOnlyFromHistory(false); // Clear view-only mode when editing
                          setHasOpenedAdd(false);
                          setIsPdfGenerated(false);
                          setPdfBlob(null);

                          // Preserve isEditFromHistory flag - don't clear it if already editing from History
                          // Only clear if we're not already editing from History (editing from Create PO page)
                          if (!isEditFromHistory) {
                            setIsEditFromHistory(false);
                            // Update PO number automatically when clicking edit after generating PO
                            // Do this asynchronously without blocking UI update
                            if (selectedVendor?.id) {
                              fetchNextPoNumberForVendor(selectedVendor.id)
                                .then(nextPoNo => {
                                  setPoData(prev => ({ ...prev, poNumber: `#${nextPoNo}` }));
                                  previousVendorId.current = selectedVendor.id; // Update tracked vendor ID
                                })
                                .catch(error => {
                                  console.error('Error fetching PO number:', error);
                                });
                            }
                          }
                        }}
                        className="flex items-center font-semibold justify-center"
                      >
                        <img src={editIcon} alt="Edit" className="w-[15px] h-[15px]" />
                      </button>
                    )}

                  </div>
                </div>
              </div>
            )}
            {/* Input Fields - visible while you are selecting the three fields (before first + click) */}
            {!showAddItems && !hasOpenedAdd && (
              <div className="flex-shrink-0 px-4 pt-4">
                {/* Date and PO Number in empty state (matches design) */}
                {isEmptyState && (
                  <div className="mb-4 border-b border-gray-200 pb-2">
                    <div className="flex items-center gap-2">
                      {poData.poNumber && (
                        <p className="text-[12px] font-medium text-black leading-normal">{poData.poNumber}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(true)}
                        className="text-[12px] font-medium text-[#616161] leading-normal underline-offset-2 hover:underline"
                      >
                        {poData.date}
                      </button>
                    </div>
                  </div>
                )}
                {/* Vendor Name Field */}
                <div className="mb-4 relative">
                  <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                    Vendor Name<span className="text-[#eb2f8e]">*</span>
                  </p>
                  <div className="relative">
                    <div
                      onClick={() => {
                        // Prevent editing vendor name when editing from History page
                        if (!isEditFromHistory) {
                          setShowVendorModal(true);
                        }
                      }}
                      className={`w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium flex items-center ${isEditFromHistory ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'
                        }`}
                      style={{
                        paddingRight: poData.vendorName ? '40px' : '12px',
                        boxSizing: 'border-box',
                        color: poData.vendorName ? '#000' : '#9E9E9E'
                      }}
                    >
                      {poData.vendorName || 'Select Name'}
                    </div>
                    {/* Hide clear button when editing from History */}
                    {poData.vendorName && !isEditFromHistory && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVendor(null);
                          setPoData({ ...poData, vendorName: '', poNumber: '' });
                          previousVendorId.current = null; // Reset previous vendor ID tracking
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
                {/* Project Name Field */}
                <div className="mb-4 relative">
                  <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                    Project Name<span className="text-[#eb2f8e]">*</span>
                  </p>
                  <div className="relative">
                    <div
                      onClick={() => setShowProjectModal(true)}
                      className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                      style={{
                        paddingRight: poData.projectName ? '40px' : '12px',
                        boxSizing: 'border-box',
                        color: poData.projectName ? '#000' : '#9E9E9E'
                      }}
                    >
                      {poData.projectName || 'Select Name'}
                    </div>
                    {poData.projectName && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPoData({ ...poData, projectName: '' });
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
                {/* Project Incharge Field */}
                <div className="mb-4 relative">
                  <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                    Project Incharge<span className="text-[#eb2f8e]">*</span>
                  </p>
                  <div className="relative">
                    <div
                      onClick={() => setShowInchargeModal(true)}
                      className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                      style={{
                        paddingRight: poData.projectIncharge ? '40px' : '12px',
                        boxSizing: 'border-box',
                        color: poData.projectIncharge ? '#000' : '#9E9E9E'
                      }}
                    >
                      {poData.projectIncharge || 'Select Name'}
                    </div>
                    {poData.projectIncharge && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPoData({ ...poData, projectIncharge: '' });
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
              </div>
            )}
            {/* Summary details card - show after first + click (both under popup and after closing it) */}
            {hasOpenedAdd && !isEmptyState && (poData.vendorName || poData.projectName || poData.projectIncharge) && (
              <div className="flex-shrink-0 mx-2 mb-1 p-2 bg-white border border-[#aaaaaa] rounded-[8px]">
                <div className="flex flex-col gap-2 px-2">
                  {poData.vendorName && (
                    <div className="flex items-start">
                      <p className="text-[12px] font-medium text-[#3f3f3f] leading-normal w-[111px]">Vendor Name</p>
                      <p className="text-[12px] font-medium text-black leading-normal mx-1">:</p>
                      <p className="text-[12px] font-medium text-[#a6a6a6] leading-normal flex-1">{poData.vendorName}</p>
                    </div>
                  )}
                  {poData.projectName && (
                    <div className="flex items-start">
                      <p className="text-[12px] font-medium text-[#3f3f3f] leading-normal w-[111px]">Project Name</p>
                      <p className="text-[12px] font-medium text-black leading-normal mx-1">:</p>
                      <p className="text-[12px] font-medium text-[#a6a6a6] leading-normal flex-1">{poData.projectName}</p>
                    </div>
                  )}
                  {poData.projectIncharge && (
                    <div className="flex items-start">
                      <p className="text-[12px] font-medium text-[#3f3f3f] leading-normal w-[111px]">Project Incharge</p>
                      <p className="text-[12px] font-medium text-black leading-normal mx-1">:</p>
                      <p className="text-[12px] font-medium text-[#a6a6a6] leading-normal flex-1">{poData.projectIncharge}</p>
                    </div>
                  )}
                  {(poData.contact || (selectedIncharge && (selectedIncharge.mobileNumber || selectedIncharge.mobile_number || selectedIncharge.contact))) && (
                    <div className="flex items-start">
                      <p className="text-[12px] font-medium text-[#3f3f3f] leading-normal w-[111px]">Contact</p>
                      <p className="text-[12px] font-medium text-black leading-normal mx-1">:</p>
                      <p className="text-[12px] font-medium text-[#a6a6a6] leading-normal flex-1">
                        {poData.contact || selectedIncharge?.mobileNumber || selectedIncharge?.mobile_number || selectedIncharge?.contact}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Filled State extras (items) - Show when fields are filled OR after opening add items OR in edit mode */}
            {(hasOpenedAdd || !isEmptyState || isEditMode) && (
              <>
                {/* Items Section - Show only when all three fields are filled */}
                {(!isEmptyState || isEditMode) && poData.vendorName && poData.projectName && poData.projectIncharge && (
                  <div className="flex flex-col flex-1 min-h-0 mx-4 mb-4">
                    {/* Items Header - Fixed */}
                    <div className="flex-shrink-0 flex items-center gap-2 mb-2 border-b border-[#E0E0E0] pb-2">
                      <p className="text-[14px] font-medium text-black leading-normal">Items</p>
                      <input
                        type="text"
                        value={items.length}
                        readOnly
                        className="w-[30px] h-[30px] border border-[rgba(0,0,0,0.16)] rounded-full px-2 text-[12px] font-medium text-black bg-gray-200 text-center"
                      />
                      <div className="ml-auto cursor-pointer" onClick={() => setShowSearchItemsModal(true)}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="7" cy="7" r="5.5" stroke="#747474" strokeWidth="1.5" />
                          <path d="M11 11L14 14" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                    {/* Items List - Scrollable */}
                    {items.length > 0 && (
                      <div className="flex-1 overflow-y-auto scrollbar-hide">
                        <div className="space-y-2">
                          {items.map((item) => {
                            const minSwipeDistance = 50;
                            const handleTouchStart = (e, itemId) => {
                              const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
                              setSwipeStates(prev => ({
                                ...prev,
                                [itemId]: {
                                  startX: touch.clientX,
                                  currentX: touch.clientX,
                                  isSwiping: false
                                }
                              }));
                            };
                            const handleTouchMove = (e, itemId) => {
                              const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
                              const state = swipeStates[itemId];
                              if (!state) return;
                              const deltaX = touch.clientX - state.startX;
                              const isExpanded = expandedItemId === itemId;
                              // Allow swiping left to reveal buttons, or swiping right to hide if already expanded
                              if (deltaX < 0 || (isExpanded && deltaX > 0)) {
                                if (e.preventDefault) {
                                  e.preventDefault();
                                }
                                setSwipeStates(prev => ({
                                  ...prev,
                                  [itemId]: {
                                    ...prev[itemId],
                                    currentX: touch.clientX,
                                    isSwiping: true
                                  }
                                }));
                              }
                            };
                            const handleTouchEnd = (itemId) => {
                              const state = swipeStates[itemId];
                              if (!state) return;
                              const deltaX = state.currentX - state.startX;
                              const absDeltaX = Math.abs(deltaX);
                              if (absDeltaX >= minSwipeDistance) {
                                if (deltaX < 0) {
                                  // Swiped left (reveal buttons) - only expand this card
                                  setExpandedItemId(itemId);
                                } else {
                                  // Swiped right (hide buttons)
                                  setExpandedItemId(null);
                                }
                              } else {
                                // Small movement - snap back or close if already expanded
                                if (expandedItemId === itemId) {
                                  setExpandedItemId(null);
                                }
                              }
                              // Reset swipe state
                              setSwipeStates(prev => {
                                const newState = { ...prev };
                                delete newState[itemId];
                                return newState;
                              });
                            };
                            return (
                              <ItemCard
                                key={item.id}
                                item={item}
                                isExpanded={expandedItemId === item.id}
                                swipeState={swipeStates[item.id]}
                                onSwipeStart={handleTouchStart}
                                onSwipeMove={handleTouchMove}
                                onSwipeEnd={handleTouchEnd}
                                onEdit={() => {
                                  setExpandedItemId(null);
                                  setEditingItem(item);
                                  setHasOpenedAdd(true);
                                  setShowAddItems(true);
                                }}
                                onDelete={() => {
                                  setExpandedItemId(null);
                                  handleDeleteItem(item.id);
                                }}
                                hideButtons={isViewOnlyFromHistory}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {/* Add Button - Fixed position (only enabled when all required fields are filled and on create tab) */}
        {/* Show "+ New" button after PDF generation, show "+" button otherwise */}
        {activeTab === 'create' && (
          <AddButton
            onClick={isPdfGenerated ? handleNewPO : () => {
              setHasOpenedAdd(true);
              setEditingItem(null);
              setShowAddItems(true);
            }}
            disabled={isPdfGenerated ? false : !areFieldsFilled}
            showNew={isPdfGenerated}
          />
        )}
        {/* Floating WhatsApp Button - Show after PDF generation (only on create tab) */}
        {activeTab === 'create' && isPdfGenerated && (
          <button
            type="button"
            onClick={shareViaWhatsApp}
            className="fixed bottom-[180px] right-[24px] lg:right-[calc(50%-164px)] w-[48px] h-[48px] rounded-full bg-[#25D366] flex items-center justify-center shadow-lg z-40 hover:bg-[#20BA5A] transition-colors"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.386 1.262.617 1.694.789.712.276 1.36.237 1.871.144.571-.104 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="white" />
            </svg>
          </button>
        )}
        {/* Bottom Navigation */}
        <BottomNav activeTab="home" />
        {/* Modals */}
        <AddItemsToPO
          isOpen={showAddItems}
          onClose={() => {
            setShowAddItems(false);
            setEditingItem(null);
          }}
          onAdd={handleAddItem}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          initialData={editingItem ? (() => {
            // Resolve category: prefer editingItem.category, then extract from name, then resolve from categoryId
            let resolvedCategory = editingItem.category || '';
            if (!resolvedCategory && editingItem.name && editingItem.name.includes(',')) {
              resolvedCategory = editingItem.name.split(',')[1]?.trim() || '';
            }
            if (!resolvedCategory && editingItem.categoryId && categoryOptions.length > 0) {
              const categoryOption = categoryOptions.find(cat => String(cat.id) === String(editingItem.categoryId));
              resolvedCategory = categoryOption?.label || categoryOption?.value || '';
            }
            return {
              itemName: editingItem.name ? editingItem.name.split(',')[0].trim() : '',
              model: editingItem.model || '',
              brand: editingItem.brand || '',
              type: editingItem.type || '',
              quantity: editingItem.quantity ? String(editingItem.quantity) : '',
              category: resolvedCategory,
              itemId: editingItem.itemId || null,
              brandId: editingItem.brandId || null,
              modelId: editingItem.modelId || null,
              typeId: editingItem.typeId || null,
              categoryId: editingItem.categoryId || null,
            };
          })() : {}}
          onRefreshItemName={fetchPoItemName}
          onRefreshModel={fetchPoModel}
          onRefreshBrand={fetchPoBrand}
          onRefreshType={fetchPoType}
        />
        <DatePickerModal
          isOpen={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onConfirm={handleDateConfirm}
          initialDate={poData.date}
        />
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDelete}
        />
        <SelectVendorModal
          isOpen={showVendorModal && !isEditFromHistory}
          onClose={() => setShowVendorModal(false)}
          onSelect={(value) => {
            // Prevent vendor change when editing from History page
            if (isEditFromHistory) {
              setShowVendorModal(false);
              return;
            }
            const selectedOption = vendorNameOptions.find(opt => opt.value === value);
            setSelectedVendor(selectedOption ? { id: selectedOption.id, name: value } : null);
            setPoData({ ...poData, vendorName: value });
            setShowVendorModal(false);
          }}
          selectedValue={poData.vendorName}
          options={vendorOptions}
          fieldName="Vendor"
          onAddNew={handleAddNewVendor}
        />
        <SelectVendorModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          onSelect={(value) => {
            const selectedOption = siteOptions.find(opt => opt.value === value);
            setSelectedSite(selectedOption ? { id: selectedOption.id, name: value } : null);
            setPoData({ ...poData, projectName: value });
            setShowProjectModal(false);
          }}
          selectedValue={poData.projectName}
          options={projectOptions}
          fieldName="Project"
        />
        <SelectVendorModal
          isOpen={showInchargeModal}
          onClose={() => setShowInchargeModal(false)}
          onSelect={(value) => {
            // First check if it's an employee
            const selectedEmployee = employeeList.find(emp => {
              const empName = emp.employeeName || emp.name || emp.fullName || emp.employee_name || '';
              return empName === value;
            });

            // If not an employee, check if it's support staff
            const selectedSupportStaff = !selectedEmployee ? supportStaffList.find(staff => {
              const staffName = staff.support_staff_name || staff.supportStaffName || '';
              return staffName === value;
            }) : null;

            if (selectedEmployee) {
              setSelectedIncharge({
                id: selectedEmployee.id,
                name: value,
                mobileNumber: selectedEmployee.employee_mobile_number || selectedEmployee.mobileNumber || selectedEmployee.mobile_number || selectedEmployee.contact || '',
                type: 'employee'
              });
              setPoData({
                ...poData,
                projectIncharge: value,
                contact: selectedEmployee.employee_mobile_number || selectedEmployee.mobileNumber || selectedEmployee.mobile_number || selectedEmployee.contact || ''
              });
            } else if (selectedSupportStaff) {
              setSelectedIncharge({
                id: selectedSupportStaff.id,
                name: value,
                mobileNumber: selectedSupportStaff.mobile_number || selectedSupportStaff.mobileNumber || '',
                type: 'support staff'
              });
              setPoData({
                ...poData,
                projectIncharge: value,
                contact: selectedSupportStaff.mobile_number || selectedSupportStaff.mobileNumber || ''
              });
            } else {
              setSelectedIncharge(null);
            }
            setShowInchargeModal(false);
          }}
          selectedValue={poData.projectIncharge}
          options={inchargeOptions}
          fieldName="Project Incharge"
        />
        <SearchItemsModal
          isOpen={showSearchItemsModal}
          onClose={() => setShowSearchItemsModal(false)}
          onAdd={handleSearchAdd}
          getAvailableItems={getAvailableItems}
          existingItems={items}
          onRefreshData={fetchPoItemName}
        />
      </div>
    </div>
  );
};
export default PurchaseOrder;