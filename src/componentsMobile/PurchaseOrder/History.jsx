import React, { useState, useEffect, useRef, useCallback } from 'react';
import DeleteConfirmModal from './DeleteConfirmModal';
import SearchableDropdown from './SearchableDropdown';
import DateRangePickerModal from './DateRangePickerModal';
import SelectVendorModal from './SelectVendorModal';
import Edit from '../Images/edit1.png'
import Delete from '../Images/delete.png'
import Filter from '../Images/Filter.png'
import Search from '../Images/Search.png'
const History = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  // Cache for fast "get by id" lookups during clone (prevents repeated network calls)
  const quickFetchCacheRef = useRef(new Map());
  // Initialize searchQuery from localStorage if available
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      const saved = localStorage.getItem('purchaseOrderHistorySearchQuery');
      return saved || '';
    } catch (error) {
      return '';
    }
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [poToDelete, setPoToDelete] = useState(null);
  const [expandedPoId, setExpandedPoId] = useState(null);
  const [cloneExpandedPoId, setCloneExpandedPoId] = useState(null);
  const [isFirstCardClosed, setIsFirstCardClosed] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  // Initialize filters from localStorage if available
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem('purchaseOrderHistoryFilters');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading filters from localStorage:', error);
    }
    return {
      vendorName: '',
      clientName: '',
      siteIncharge: '',
      startDate: '',
      endDate: '',
      poNumber: '',
      branch: ''
    };
  });

  // Swipe detection state - track per card
  const [swipeStates, setSwipeStates] = useState({});

  // Refs to store element references for non-passive event listeners
  const cardRefs = useRef({});

  // Refs to track current state values for event handlers
  const expandedPoIdRef = useRef(expandedPoId);
  const cloneExpandedPoIdRef = useRef(cloneExpandedPoId);
  const isFirstCardClosedRef = useRef(isFirstCardClosed);
  const isInitialMount = useRef(true);

  // Keep refs in sync with state
  useEffect(() => {
    expandedPoIdRef.current = expandedPoId;
  }, [expandedPoId]);

  useEffect(() => {
    cloneExpandedPoIdRef.current = cloneExpandedPoId;
  }, [cloneExpandedPoId]);

  useEffect(() => {
    isFirstCardClosedRef.current = isFirstCardClosed;
  }, [isFirstCardClosed]);

  // State for all available options from APIs
  const [allVendors, setAllVendors] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [allSupportStaff, setAllSupportStaff] = useState([]);

  // Mark initial mount as complete after first render
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // Save filters to localStorage whenever they change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) return;
    try {
      localStorage.setItem('purchaseOrderHistoryFilters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [filters]);

  // Save searchQuery to localStorage whenever it changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) return;
    try {
      localStorage.setItem('purchaseOrderHistorySearchQuery', searchQuery);
    } catch (error) {
      console.error('Error saving searchQuery to localStorage:', error);
    }
  }, [searchQuery]);

  // Fetch all vendors, projects, employees, and support staff from APIs
  useEffect(() => {
    fetchAllVendors();
    fetchAllProjects();
    fetchAllEmployees();
    fetchAllSupportStaff();
  }, []);

  // Clear clientName if it doesn't belong to the selected branch
  useEffect(() => {
    if (filters.branch && filters.clientName) {
      const selectedProject = allProjects.find(
        p => (p.siteName === filters.clientName || p.projectName === filters.clientName) && p.branch === filters.branch
      );
      if (!selectedProject) {
        setFilters(prev => ({ ...prev, clientName: '' }));
      }
    }
  }, [filters.branch, filters.clientName, allProjects]);

  const fetchAllVendors = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll');
      if (response.ok) {
        const data = await response.json();
        setAllVendors(data); // Store full objects instead of just names
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchAllProjects = async () => {
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
        setAllProjects(data); // Store full objects instead of just names
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/getAll');
      if (response.ok) {
        const data = await response.json();
        setAllEmployees(data); // Store full objects instead of just names
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAllSupportStaff = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/support_staff/getAll');
      if (response.ok) {
        const data = await response.json();
        setAllSupportStaff(data);
      }
    } catch (error) {
      console.error('Error fetching support staff:', error);
    }
  };

  // Load purchase orders from API
  const loadPurchaseOrders = useCallback(async (skipCache = false) => {
    // Don't load if vendors/projects aren't ready yet
    if (allVendors.length === 0 && allProjects.length === 0) {
      return;
    }

    // Check if any filters are active
    const hasActiveFilters = searchQuery || filters.vendorName || filters.clientName || filters.siteIncharge || filters.startDate || filters.endDate || filters.poNumber || filters.branch;

    // If filters are active and we have cached data, load from cache first for instant display
    if (!skipCache && hasActiveFilters) {
      try {
        const cachedData = localStorage.getItem('purchaseOrdersHistoryCache');
        if (cachedData) {
          const cachedPOs = JSON.parse(cachedData);
          if (cachedPOs.length > 0) {
            const sorted = cachedPOs.sort((a, b) => {
              const idA = parseInt(a.id) || 0;
              const idB = parseInt(b.id) || 0;
              return idB - idA;
            });
            setPurchaseOrders(sorted);
          }
        }
      } catch (error) {
        console.error('Error loading from cache:', error);
      }
    }
    try {
      const apiUrl = hasActiveFilters
        ? 'https://backendaab.in/aabuildersDash/api/purchase_orders/getAll'
        : 'https://backendaab.in/aabuildersDash/api/purchase_orders/get/latest';

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch purchase orders');
      }
      const data = await response.json();
      const transformedPOs = data
        .filter((po) => {
          return !(po.delete_status === true || po.deleteStatus === true);
        })
        .map((po) => {
          let vendorName = '';
          if (po.vendor_id && allVendors.length > 0) {
            const vendorMatch = allVendors.find(v => v.id === po.vendor_id);
            vendorName = vendorMatch?.vendorName || '';
          }
          let projectName = '';
          let projectBranch = '';
          if (po.client_id && allProjects.length > 0) {
            const projectMatch = allProjects.find(p => p.id === po.client_id);
            projectName = projectMatch?.siteName || projectMatch?.projectName || '';
            projectBranch = projectMatch?.branch || '';
          }
          let projectIncharge = '';
          if (po.site_incharge_id) {
            const inchargeType = po.site_incharge_type || po.siteInchargeType;
            if (inchargeType === 'support staff' || inchargeType === 'support_staff') {
              if (allSupportStaff.length > 0) {
                const supportStaffMatch = allSupportStaff.find(s => s.id === po.site_incharge_id);
                projectIncharge = supportStaffMatch?.support_staff_name || supportStaffMatch?.supportStaffName || '';
              }
            } else {
              if (allEmployees.length > 0) {
                const inchargeMatch = allEmployees.find(e => e.id === po.site_incharge_id);
                projectIncharge = inchargeMatch?.employeeName || inchargeMatch?.name || inchargeMatch?.fullName || inchargeMatch?.employee_name || '';
              }
            }
          }

          // Transform purchaseTable to items format
          const items = (po.purchaseTable || []).map(item => ({
            name: item.itemName || `${item.item_id || ''}`,
            brand: item.brandName || '',
            model: item.modelName || '',
            type: item.typeName || '',
            quantity: item.quantity || 0,
            price: item.price || (item.amount / (item.quantity || 1)) || 0,
            amount: item.amount || 0,
            itemId: item.item_id,
            categoryId: item.category_id,
            modelId: item.model_id,
            brandId: item.brand_id,
            typeId: item.type_id,
          }));

          // Extract year from date (format: DD/MM/YYYY)
          const getYearFromDate = (dateStr) => {
            if (!dateStr) return new Date().getFullYear();
            if (dateStr.includes('/')) {
              const parts = dateStr.split('/');
              return parts[2] || new Date().getFullYear();
            }
            try {
              const date = new Date(dateStr);
              return date.getFullYear();
            } catch {
              return new Date().getFullYear();
            }
          };
          const year = getYearFromDate(po.date);

          // Determine payment status from payment_complete_status field
          let paymentStatus = 'Unpaid';
          if (po.payment_complete_status !== undefined) {
            paymentStatus = po.payment_complete_status === true ? 'Paid' : 'Unpaid';
          } else if (po.paymentCompleteStatus !== undefined) {
            paymentStatus = po.paymentCompleteStatus === true ? 'Paid' : 'Unpaid';
          } else if (po.paymentStatus) {
            // Fallback to existing paymentStatus field if available
            paymentStatus = po.paymentStatus;
          }

          return {
            id: po.id || po._id,
            poNumber: po.eno ? `PO - ${year} - ${po.eno}` : po.poNumber || '',
            eno: po.eno || null, // Preserve eno for edit screen
            date: po.date || '',
            vendorName: vendorName || po.vendorName || '',
            projectName: projectName || po.projectName || '',
            projectBranch: projectBranch || po.branch || '',
            projectIncharge: projectIncharge || po.site_incharge_name || '',
            contact: po.site_incharge_mobile_number || po.contact || '',
            created_by: po.created_by || '',
            items: items,
            paymentStatus: paymentStatus,
            createdAt: po.createdAt || po.created_at || po.created_date_time || po.date || new Date().toISOString(),
            created_date_time: po.created_date_time || po.createdAt || po.created_at || null,
            // Preserve raw IDs so edit screen can send them back when unchanged
            vendor_id: po.vendor_id,
            client_id: po.client_id,
            site_incharge_id: po.site_incharge_id,
            site_incharge_mobile_number: po.site_incharge_mobile_number,
            site_incharge_type: po.site_incharge_type || po.siteInchargeType || null,
          };
        });
      // Sort by ID (highest ID first - most recently entered)
      const sorted = transformedPOs.sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idB - idA; // Descending order (highest ID first)
      });
      setPurchaseOrders(sorted);

      // Cache the transformed data for fast loading next time
      try {
        localStorage.setItem('purchaseOrdersHistoryCache', JSON.stringify(sorted));
      } catch (error) {
        console.error('Error caching purchase orders:', error);
      }
    } catch (error) {
      console.error('Error loading purchase orders:', error);
      // Fallback to localStorage cache if API fails
      if (!hasActiveFilters) {
        try {
          const cachedData = localStorage.getItem('purchaseOrdersHistoryCache');
          if (cachedData) {
            const cachedPOs = JSON.parse(cachedData);
            const sorted = cachedPOs.sort((a, b) => {
              const idA = parseInt(a.id) || 0;
              const idB = parseInt(b.id) || 0;
              return idB - idA;
            });
            setPurchaseOrders(sorted);
          }
        } catch (localError) {
          console.error('Error loading from cache:', localError);
        }
      }
    }
  }, [allVendors, allProjects, allEmployees, allSupportStaff, searchQuery, filters]);

  useEffect(() => {
    if (allVendors.length > 0 || allProjects.length > 0) {
      loadPurchaseOrders();
    }
    // Also listen for custom event when PO is updated
    const handlePOUpdate = () => {
      loadPurchaseOrders();
    };
    window.addEventListener('poUpdated', handlePOUpdate);
    // Check if filters are active
    const hasActiveFilters = searchQuery || filters.vendorName || filters.clientName || filters.siteIncharge || filters.startDate || filters.endDate || filters.poNumber || filters.branch;
    // Poll for changes periodically (only when no filters are active to avoid heavy load)
    const interval = hasActiveFilters ? null : setInterval(() => {
      loadPurchaseOrders();
    }, 5000); // Poll every 5 seconds
    return () => {
      window.removeEventListener('poUpdated', handlePOUpdate);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [allVendors, allProjects, allEmployees, allSupportStaff, searchQuery, filters, loadPurchaseOrders]);
  const handleEdit = async (po) => {
    // Fetch the specific PO quickly (ensures purchaseTable/items are present immediately)
    let payload = po;
    try {
      const apiPo = await fetchPurchaseOrderById(po?.id);
      if (apiPo) {
        payload = {
          ...po,
          vendor_id: apiPo.vendor_id ?? po.vendor_id,
          client_id: apiPo.client_id ?? po.client_id,
          site_incharge_id: apiPo.site_incharge_id ?? po.site_incharge_id,
          site_incharge_type: apiPo.site_incharge_type ?? po.site_incharge_type,
          site_incharge_mobile_number: apiPo.site_incharge_mobile_number ?? po.site_incharge_mobile_number,
          items: (apiPo.purchaseTable || []).map((row) => ({
            name: row.itemName || `${row.item_id || ''}`,
            itemName: row.itemName || '',
            item_id: row.item_id,
            itemId: row.item_id,
            category_id: row.category_id,
            categoryId: row.category_id,
            model_id: row.model_id,
            modelId: row.model_id,
            brand_id: row.brand_id,
            brandId: row.brand_id,
            type_id: row.type_id,
            typeId: row.type_id,
            brand: row.brandName || '',
            brandName: row.brandName || '',
            model: row.modelName || '',
            modelName: row.modelName || '',
            type: row.typeName || '',
            typeName: row.typeName || '',
            quantity: row.quantity || 0,
            price: row.price || (row.amount / (row.quantity || 1)) || 0,
            amount: row.amount || 0,
          })),
        };
      }

      // Enrich edit payload using fast get/{id} APIs (same strategy as Clone)
      const vendorId = payload.vendor_id || payload.vendorId || null;
      const clientId = payload.client_id || payload.clientId || null;
      const inchargeId = payload.site_incharge_id || payload.siteInchargeId || null;
      const inchargeType = payload.site_incharge_type || payload.siteInchargeType || null;

      const [vendorObj, projectObj, inchargeObj] = await Promise.all([
        vendorId
          ? quickFetchJson(`https://backendaab.in/aabuilderDash/api/vendor_Names/get/${vendorId}`)
          : Promise.resolve(null),
        clientId
          ? quickFetchJson(`https://backendaab.in/aabuilderDash/api/project_Names/get/${clientId}`)
          : Promise.resolve(null),
        inchargeId && (!inchargeType || inchargeType === 'employee')
          ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/employee_details/get/${inchargeId}`)
          : Promise.resolve(null),
      ]);

      if (vendorObj) {
        payload.vendorName =
          vendorObj.vendorName || vendorObj.name || vendorObj.vendor_name || payload.vendorName || '';
      }
      if (projectObj) {
        payload.projectName =
          projectObj.siteName || projectObj.projectName || projectObj.name || payload.projectName || '';
      }
      if (inchargeObj) {
        const resolvedName =
          inchargeObj.employeeName ||
          inchargeObj.name ||
          inchargeObj.fullName ||
          inchargeObj.employee_name ||
          '';
        if (resolvedName) payload.projectIncharge = resolvedName;
        const resolvedMobile =
          inchargeObj.employee_mobile_number ||
          inchargeObj.mobileNumber ||
          inchargeObj.mobile_number ||
          inchargeObj.contact ||
          '';
        if (resolvedMobile) payload.contact = payload.contact || resolvedMobile;
        payload.site_incharge_type = 'employee';
      }

      if (Array.isArray(payload.items) && payload.items.length > 0) {
        payload.items = await Promise.all(
          payload.items.map(async (item) => {
            const next = { ...item };
            const itemId = next.item_id || next.itemId || null;
            const modelId = next.model_id || next.modelId || null;
            const brandId = next.brand_id || next.brandId || null;
            const typeId = next.type_id || next.typeId || null;
            const categoryId = next.category_id || next.categoryId || null;

            const [itemObj, modelObj, brandObj, typeObj, categoryObj] = await Promise.all([
              itemId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_itemNames/get/${itemId}`)
                : Promise.resolve(null),
              modelId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_model/get/${modelId}`)
                : Promise.resolve(null),
              brandId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_brand/get/${brandId}`)
                : Promise.resolve(null),
              typeId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_type/get/${typeId}`)
                : Promise.resolve(null),
              categoryId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_category/get/${categoryId}`)
                : Promise.resolve(null),
            ]);

            if (itemObj) {
              const resolved =
                itemObj.itemName || itemObj.poItemName || itemObj.name || itemObj.item_name || '';
              if (resolved) {
                next.itemName = next.itemName || resolved;
                next.name = next.name || resolved;
              }
              next.item_id = itemId;
            }
            if (modelObj) {
              const resolved = modelObj.model || modelObj.poModel || modelObj.modelName || modelObj.name || '';
              if (resolved) {
                next.model = next.model || resolved;
                next.modelName = next.modelName || resolved;
              }
              next.model_id = modelId;
            }
            if (brandObj) {
              const resolved = brandObj.brand || brandObj.poBrand || brandObj.brandName || brandObj.name || '';
              if (resolved) {
                next.brand = next.brand || resolved;
                next.brandName = next.brandName || resolved;
              }
              next.brand_id = brandId;
            }
            if (typeObj) {
              const resolved =
                typeObj.typeColor || typeObj.type || typeObj.typeName || typeObj.name || '';
              if (resolved) {
                next.type = next.type || resolved;
                next.typeName = next.typeName || resolved;
                next.typeColor = next.typeColor || resolved;
              }
              next.type_id = typeId;
            }
            if (categoryObj) {
              const resolved = categoryObj.category || categoryObj.categoryName || categoryObj.name || '';
              if (resolved) {
                next.category = next.category || resolved;
                next.categoryName = next.categoryName || resolved;
              }
              next.category_id = categoryId;
            }
            return next;
          })
        );
      }
    } catch (e) {
      // best-effort
    }
    // Store PO data in localStorage to load in create tab
    localStorage.setItem('editingPO', JSON.stringify(payload));
    // Switch to create tab immediately
    localStorage.setItem('activeTab', 'create');
    window.dispatchEvent(new CustomEvent('editPO', { detail: payload }));
  };

  const handleView = async (po) => {
    // View-only mode (Download button) with fast PO-by-id fetch
    let payload = po;
    try {
      const apiPo = await fetchPurchaseOrderById(po?.id);
      if (apiPo) {
        payload = {
          ...po,
          vendor_id: apiPo.vendor_id ?? po.vendor_id,
          client_id: apiPo.client_id ?? po.client_id,
          site_incharge_id: apiPo.site_incharge_id ?? po.site_incharge_id,
          site_incharge_type: apiPo.site_incharge_type ?? po.site_incharge_type,
          site_incharge_mobile_number: apiPo.site_incharge_mobile_number ?? po.site_incharge_mobile_number,
          items: (apiPo.purchaseTable || []).map((row) => ({
            name: row.itemName || `${row.item_id || ''}`,
            itemName: row.itemName || '',
            item_id: row.item_id,
            itemId: row.item_id,
            category_id: row.category_id,
            categoryId: row.category_id,
            model_id: row.model_id,
            modelId: row.model_id,
            brand_id: row.brand_id,
            brandId: row.brand_id,
            type_id: row.type_id,
            typeId: row.type_id,
            brand: row.brandName || '',
            brandName: row.brandName || '',
            model: row.modelName || '',
            modelName: row.modelName || '',
            type: row.typeName || '',
            typeName: row.typeName || '',
            quantity: row.quantity || 0,
            price: row.price || (row.amount / (row.quantity || 1)) || 0,
            amount: row.amount || 0,
          })),
        };
      }

      // Enrich view payload using fast get/{id} APIs (same strategy as Clone/Edit)
      const vendorId = payload.vendor_id || payload.vendorId || null;
      const clientId = payload.client_id || payload.clientId || null;
      const inchargeId = payload.site_incharge_id || payload.siteInchargeId || null;
      const inchargeType = payload.site_incharge_type || payload.siteInchargeType || null;

      const [vendorObj, projectObj, inchargeObj] = await Promise.all([
        vendorId
          ? quickFetchJson(`https://backendaab.in/aabuilderDash/api/vendor_Names/get/${vendorId}`)
          : Promise.resolve(null),
        clientId
          ? quickFetchJson(`https://backendaab.in/aabuilderDash/api/project_Names/get/${clientId}`)
          : Promise.resolve(null),
        inchargeId && (!inchargeType || inchargeType === 'employee')
          ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/employee_details/get/${inchargeId}`)
          : Promise.resolve(null),
      ]);

      if (vendorObj) {
        payload.vendorName =
          vendorObj.vendorName || vendorObj.name || vendorObj.vendor_name || payload.vendorName || '';
      }
      if (projectObj) {
        payload.projectName =
          projectObj.siteName || projectObj.projectName || projectObj.name || payload.projectName || '';
      }
      if (inchargeObj) {
        const resolvedName =
          inchargeObj.employeeName ||
          inchargeObj.name ||
          inchargeObj.fullName ||
          inchargeObj.employee_name ||
          '';
        if (resolvedName) payload.projectIncharge = resolvedName;
        const resolvedMobile =
          inchargeObj.employee_mobile_number ||
          inchargeObj.mobileNumber ||
          inchargeObj.mobile_number ||
          inchargeObj.contact ||
          '';
        if (resolvedMobile) payload.contact = payload.contact || resolvedMobile;
        payload.site_incharge_type = 'employee';
      }

      if (Array.isArray(payload.items) && payload.items.length > 0) {
        payload.items = await Promise.all(
          payload.items.map(async (item) => {
            const next = { ...item };
            const itemId = next.item_id || next.itemId || null;
            const modelId = next.model_id || next.modelId || null;
            const brandId = next.brand_id || next.brandId || null;
            const typeId = next.type_id || next.typeId || null;
            const categoryId = next.category_id || next.categoryId || null;

            const [itemObj, modelObj, brandObj, typeObj, categoryObj] = await Promise.all([
              itemId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_itemNames/get/${itemId}`)
                : Promise.resolve(null),
              modelId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_model/get/${modelId}`)
                : Promise.resolve(null),
              brandId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_brand/get/${brandId}`)
                : Promise.resolve(null),
              typeId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_type/get/${typeId}`)
                : Promise.resolve(null),
              categoryId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_category/get/${categoryId}`)
                : Promise.resolve(null),
            ]);

            if (itemObj) {
              const resolved =
                itemObj.itemName || itemObj.poItemName || itemObj.name || itemObj.item_name || '';
              if (resolved) {
                next.itemName = next.itemName || resolved;
                next.name = next.name || resolved;
              }
              next.item_id = itemId;
            }
            if (modelObj) {
              const resolved = modelObj.model || modelObj.poModel || modelObj.modelName || modelObj.name || '';
              if (resolved) {
                next.model = next.model || resolved;
                next.modelName = next.modelName || resolved;
              }
              next.model_id = modelId;
            }
            if (brandObj) {
              const resolved = brandObj.brand || brandObj.poBrand || brandObj.brandName || brandObj.name || '';
              if (resolved) {
                next.brand = next.brand || resolved;
                next.brandName = next.brandName || resolved;
              }
              next.brand_id = brandId;
            }
            if (typeObj) {
              const resolved =
                typeObj.typeColor || typeObj.type || typeObj.typeName || typeObj.name || '';
              if (resolved) {
                next.type = next.type || resolved;
                next.typeName = next.typeName || resolved;
                next.typeColor = next.typeColor || resolved;
              }
              next.type_id = typeId;
            }
            if (categoryObj) {
              const resolved = categoryObj.category || categoryObj.categoryName || categoryObj.name || '';
              if (resolved) {
                next.category = next.category || resolved;
                next.categoryName = next.categoryName || resolved;
              }
              next.category_id = categoryId;
            }
            return next;
          })
        );
      }
    } catch (e) {
      // best-effort
    }
    // Switch to create tab so details are visible
    localStorage.setItem('activeTab', 'create');
    window.dispatchEvent(new CustomEvent('viewPO', { detail: payload }));
  };

  const quickFetchJson = useCallback(async (url) => {
    if (!url) return null;
    const cache = quickFetchCacheRef.current;
    if (cache.has(url)) return cache.get(url);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        cache.set(url, null);
        return null;
      }
      const data = await res.json();
      cache.set(url, data);
      return data;
    } catch (e) {
      cache.set(url, null);
      return null;
    }
  }, []);

  const fetchPurchaseOrderById = useCallback(
    async (poId) => {
      if (!poId) return null;
      return await quickFetchJson(`https://backendaab.in/aabuildersDash/api/purchase_orders/get/${poId}`);
    },
    [quickFetchJson]
  );

  const handleClone = async (po) => {
    // Fetch the specific PO quickly (ensures purchaseTable/items are present immediately)
    let sourcePO = { ...po };
    try {
      const apiPo = await fetchPurchaseOrderById(po?.id);
      if (apiPo) {
        sourcePO = {
          ...sourcePO,
          vendor_id: apiPo.vendor_id ?? sourcePO.vendor_id,
          client_id: apiPo.client_id ?? sourcePO.client_id,
          site_incharge_id: apiPo.site_incharge_id ?? sourcePO.site_incharge_id,
          site_incharge_type: apiPo.site_incharge_type ?? sourcePO.site_incharge_type,
          site_incharge_mobile_number:
            apiPo.site_incharge_mobile_number ?? sourcePO.site_incharge_mobile_number,
          // Rebuild items from purchaseTable so Create tab always receives item rows
          items: (apiPo.purchaseTable || []).map((row) => ({
            name: row.itemName || `${row.item_id || ''}`,
            itemName: row.itemName || '',
            item_id: row.item_id,
            itemId: row.item_id,
            category_id: row.category_id,
            categoryId: row.category_id,
            model_id: row.model_id,
            modelId: row.model_id,
            brand_id: row.brand_id,
            brandId: row.brand_id,
            type_id: row.type_id,
            typeId: row.type_id,
            brand: row.brandName || '',
            brandName: row.brandName || '',
            model: row.modelName || '',
            modelName: row.modelName || '',
            type: row.typeName || '',
            typeName: row.typeName || '',
            quantity: row.quantity || 0,
            price: row.price || (row.amount / (row.quantity || 1)) || 0,
            amount: row.amount || 0,
          })),
        };
      }
    } catch (e) {
      // best-effort
    }

    // Clone PO data - remove ID to create new record
    const clonedPO = { ...sourcePO };
    delete clonedPO.id;
    // Mark as clone so Create PO component knows to show "Generate PO" instead of "Update PO"
    clonedPO.isClone = true;

    // Prefetch specific entities by ID so Create tab can render immediately (avoid slow getAll lists)
    try {
      const vendorId = clonedPO.vendor_id || clonedPO.vendorId || null;
      const clientId = clonedPO.client_id || clonedPO.clientId || null;
      const inchargeId = clonedPO.site_incharge_id || clonedPO.siteInchargeId || null;
      const inchargeType = clonedPO.site_incharge_type || clonedPO.siteInchargeType || null;

      const [vendorObj, projectObj, inchargeObj] = await Promise.all([
        vendorId
          ? quickFetchJson(`https://backendaab.in/aabuilderDash/api/vendor_Names/get/${vendorId}`)
          : Promise.resolve(null),
        clientId
          ? quickFetchJson(`https://backendaab.in/aabuilderDash/api/project_Names/get/${clientId}`)
          : Promise.resolve(null),
        // Fast fetch for employee incharge (if it's an employee); support-staff stays best-effort via existing list
        inchargeId && (!inchargeType || inchargeType === 'employee')
          ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/employee_details/get/${inchargeId}`)
          : Promise.resolve(null),
      ]);

      if (vendorObj) {
        clonedPO.vendorName =
          vendorObj.vendorName || vendorObj.name || vendorObj.vendor_name || clonedPO.vendorName || '';
        // Keep id explicitly for Create page to use without waiting for dropdown options
        clonedPO.vendor_id = vendorId;

        // Prefetch next PO number for this vendor in background (non-blocking)
        // Don't await - let it fetch in background while page opens
        fetch('https://backendaab.in/aabuildersDash/api/purchase_orders/getAll')
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            return null;
          })
          .then(data => {
            if (data) {
              const normalizedVendorId = String(vendorId);
              const vendorOrders = data.filter(order => String(order.vendor_id ?? order.vendorId) === normalizedVendorId);
              const getNumericEno = (order) => {
                const eno = order.eno || order.ENO || order.poNumber || order.po_number || '';
                if (typeof eno === 'number') return eno;
                const str = String(eno);
                const match = str.match(/\d+/);
                return match ? parseInt(match[0], 10) : 0;
              };
              const latestEno = vendorOrders.reduce((maxValue, order) => {
                const currentEno = getNumericEno(order);
                return currentEno > maxValue ? currentEno : maxValue;
              }, 0);
              const nextPoNo = latestEno + 1;
              // Dispatch updated PO number to Create PO page if it's still open
              const updatedPO = { ...clonedPO, prefetchedPoNumber: `#${nextPoNo}` };
              window.dispatchEvent(new CustomEvent('poNumberPrefetched', { detail: { vendorId, poNumber: `#${nextPoNo}` } }));
            }
          })
          .catch(e => {
            // Best-effort: if PO number fetch fails, let Create PO page generate it
          });
      }

      if (projectObj) {
        clonedPO.projectName =
          projectObj.siteName || projectObj.projectName || projectObj.name || clonedPO.projectName || '';
        clonedPO.client_id = clientId;
      }

      if (inchargeObj) {
        const resolvedName =
          inchargeObj.employeeName ||
          inchargeObj.name ||
          inchargeObj.fullName ||
          inchargeObj.employee_name ||
          '';
        if (resolvedName) {
          clonedPO.projectIncharge = resolvedName;
        }
        // Also try to set contact quickly (if present)
        const resolvedMobile =
          inchargeObj.employee_mobile_number ||
          inchargeObj.mobileNumber ||
          inchargeObj.mobile_number ||
          inchargeObj.contact ||
          '';
        if (resolvedMobile) {
          clonedPO.contact = clonedPO.contact || resolvedMobile;
        }
        clonedPO.site_incharge_id = inchargeId;
        clonedPO.site_incharge_type = 'employee';
      }

      // Enrich items (item/model/brand/type/category) by their IDs
      if (Array.isArray(clonedPO.items) && clonedPO.items.length > 0) {
        clonedPO.items = await Promise.all(
          clonedPO.items.map(async (item) => {
            const next = { ...item };

            const itemId = next.item_id || next.itemId || null;
            const modelId = next.model_id || next.modelId || null;
            const brandId = next.brand_id || next.brandId || null;
            const typeId = next.type_id || next.typeId || null;
            const categoryId = next.category_id || next.categoryId || null;

            const [itemObj, modelObj, brandObj, typeObj, categoryObj] = await Promise.all([
              itemId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_itemNames/get/${itemId}`)
                : Promise.resolve(null),
              modelId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_model/get/${modelId}`)
                : Promise.resolve(null),
              brandId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_brand/get/${brandId}`)
                : Promise.resolve(null),
              typeId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_type/get/${typeId}`)
                : Promise.resolve(null),
              categoryId
                ? quickFetchJson(`https://backendaab.in/aabuildersDash/api/po_category/get/${categoryId}`)
                : Promise.resolve(null),
            ]);

            if (itemObj) {
              const resolved =
                itemObj.itemName || itemObj.poItemName || itemObj.name || itemObj.item_name || '';
              // PurchaseOrder.jsx checks item.name || item.itemName
              if (resolved) {
                next.itemName = next.itemName || resolved;
                next.name = next.name || resolved;
              }
              next.item_id = itemId;
            }

            if (modelObj) {
              const resolved = modelObj.model || modelObj.poModel || modelObj.modelName || modelObj.name || '';
              if (resolved) {
                next.model = next.model || resolved;
                next.modelName = next.modelName || resolved;
              }
              next.model_id = modelId;
            }

            if (brandObj) {
              const resolved = brandObj.brand || brandObj.poBrand || brandObj.brandName || brandObj.name || '';
              if (resolved) {
                next.brand = next.brand || resolved;
                next.brandName = next.brandName || resolved;
              }
              next.brand_id = brandId;
            }

            if (typeObj) {
              const resolved =
                typeObj.typeColor || typeObj.type || typeObj.typeName || typeObj.name || '';
              if (resolved) {
                next.type = next.type || resolved;
                next.typeName = next.typeName || resolved;
                next.typeColor = next.typeColor || resolved;
              }
              next.type_id = typeId;
            }

            if (categoryObj) {
              const resolved = categoryObj.category || categoryObj.categoryName || categoryObj.name || '';
              if (resolved) {
                next.category = next.category || resolved;
                next.categoryName = next.categoryName || resolved;
              }
              next.category_id = categoryId;
            }

            return next;
          })
        );
      }
    } catch (e) {
      // Best-effort: if fast lookups fail, still proceed with raw cloned data
      console.error('Clone quick-prefetch failed:', e);
    }

    // Store cloned PO data in localStorage to load in create tab
    localStorage.setItem('editingPO', JSON.stringify(clonedPO));
    // Switch to create tab immediately
    localStorage.setItem('activeTab', 'create');
    // Dispatch custom event for create tab to listen
    window.dispatchEvent(new CustomEvent('editPO', { detail: clonedPO }));
    setCloneExpandedPoId(null);
  };
  const handleDelete = (poId) => {
    setPoToDelete(poId);
    setShowDeleteConfirm(true);
  };
  const confirmDelete = async () => {
    if (poToDelete) {
      try {
        // Find the PO to get its order ID
        const order = purchaseOrders.find(po => po.id === poToDelete);
        if (order) {
          // Call API to mark PO as deleted - matching working example format
          const apiUrl = `https://backendaab.in/aabuildersDash/api/purchase_orders/markDeleted/${order.id}?deleteStatus=true`;
          const response = await fetch(apiUrl, {
            method: 'PUT',
          });
          if (response.ok) {
            const responseData = await response.json();
            // Wait a moment for database to update, then reload
            setTimeout(() => {
              loadPurchaseOrders();
            }, 1000);
            window.location.reload();
          } else {
            const errorText = await response.text();
            console.error('API Error - Status:', response.status);
            console.error('API Error - Response:', errorText);
            alert(`Failed to delete purchase order. Status: ${response.status}`);
          }
        } else {
          console.error('Order not found with ID:', poToDelete);
          alert('Purchase order not found.');
        }
      } catch (error) {
        console.error('Error deleting purchase order:', error);
        alert('An error occurred while deleting the purchase order. Please try again.');
      } finally {
        setShowDeleteConfirm(false);
        setPoToDelete(null);
        setExpandedPoId(null);
      }
    }
  };
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPoToDelete(null);
  };
  const handleClear = () => {
    setSearchQuery('');
    setFilters({
      vendorName: '',
      clientName: '',
      siteIncharge: '',
      startDate: '',
      endDate: '',
      poNumber: '',
      branch: ''
    });
    // Clear localStorage
    try {
      localStorage.removeItem('purchaseOrderHistoryFilters');
      localStorage.removeItem('purchaseOrderHistorySearchQuery');
    } catch (error) {
      console.error('Error clearing filters from localStorage:', error);
    }
  };
  const filteredPOs = purchaseOrders.filter(po => {
    // Search query filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      // Helper function to parse date from various formats
      const parseDate = (dateStr) => {
        if (!dateStr) return null;
        // Try DD/MM/YYYY format first
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
              return new Date(year, month, day);
            }
          }
        }
        // Try standard date parsing
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date;
        }
        return null;
      };

      // Helper function to check if date matches
      const dateMatches = (poDate, targetDate) => {
        if (!poDate || !targetDate) return false;
        const po = new Date(poDate);
        const target = new Date(targetDate);
        po.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        return po.getTime() === target.getTime();
      };

      // Check for "today" keyword
      if (query === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const poDate = parseDate(po.date || po.createdAt);
        if (!poDate || !dateMatches(poDate, today)) {
          return false;
        }
      }
      // Check for "yesterday" keyword
      else if (query === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const poDate = parseDate(po.date || po.createdAt);
        if (!poDate || !dateMatches(poDate, yesterday)) {
          return false;
        }
      }
      // Check for "paid" keyword
      else if (query === 'paid') {
        if (po.paymentStatus?.toLowerCase() !== 'paid') {
          return false;
        }
      }
      // Check for "unpaid" keyword
      else if (query === 'unpaid') {
        if (po.paymentStatus?.toLowerCase() !== 'unpaid') {
          return false;
        }
      }
      // General search across multiple fields
      else {
        // First check if query matches date (try parsing as date)
        const parsedDate = parseDate(query);
        let dateMatchFound = false;
        if (parsedDate) {
          const poDate = parseDate(po.date || po.createdAt);
          if (poDate) {
            const poDateObj = new Date(poDate);
            const targetDateObj = new Date(parsedDate);
            poDateObj.setHours(0, 0, 0, 0);
            targetDateObj.setHours(0, 0, 0, 0);
            dateMatchFound = poDateObj.getTime() === targetDateObj.getTime();
          }
        }

        // Check all searchable fields
        const matchesSearch = (
          dateMatchFound ||
          po.poNumber?.toLowerCase().includes(query) ||
          po.vendorName?.toLowerCase().includes(query) ||
          po.projectName?.toLowerCase().includes(query) ||
          po.date?.toLowerCase().includes(query) ||
          po.projectBranch?.toLowerCase().includes(query) ||
          po.projectIncharge?.toLowerCase().includes(query) ||
          po.contact?.toLowerCase().includes(query) ||
          po.created_by?.toLowerCase().includes(query) ||
          po.paymentStatus?.toLowerCase().includes(query) ||
          (po.eno && String(po.eno).includes(query))
        );
        if (!matchesSearch) return false;
      }
    }
    // Filter by vendor name
    if (filters.vendorName && po.vendorName?.toLowerCase() !== filters.vendorName.toLowerCase()) {
      return false;
    }
    // Filter by client name (project name)
    if (filters.clientName && po.projectName?.toLowerCase() !== filters.clientName.toLowerCase()) {
      return false;
    }
    // Filter by site incharge (project incharge)
    if (filters.siteIncharge && po.projectIncharge?.toLowerCase() !== filters.siteIncharge.toLowerCase()) {
      return false;
    }
    // Filter by date range
    if (filters.startDate || filters.endDate) {
      const poDate = new Date(po.createdAt || po.date || 0);
      poDate.setHours(0, 0, 0, 0); // Reset time to compare dates only
      if (filters.startDate && filters.endDate) {
        // Both start and end dates selected - check if PO date is within range
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(filters.endDate);
        endDate.setHours(0, 0, 0, 0);
        if (poDate < startDate || poDate > endDate) {
          return false;
        }
      } else if (filters.startDate) {
        // Only start date selected - check if PO date is on or after start date
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (poDate < startDate) {
          return false;
        }
      } else if (filters.endDate) {
        // Only end date selected - check if PO date is on or before end date
        const endDate = new Date(filters.endDate);
        endDate.setHours(0, 0, 0, 0);
        if (poDate > endDate) {
          return false;
        }
      }
    }
    // Filter by PO number
    if (filters.poNumber && po.poNumber?.toLowerCase().includes(filters.poNumber.toLowerCase()) === false) {
      return false;
    }
    // Filter by branch
    if (filters.branch && po.projectBranch?.toLowerCase() !== filters.branch.toLowerCase()) {
      return false;
    }
    return true;
  });
  // Reset first card to expanded state on mount and when filtered list changes
  useEffect(() => {
    setIsFirstCardClosed(true);
  }, [filteredPOs.length]);
  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;
  const handleTouchStart = (e, poId) => {
    const touch = e.touches[0];
    const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === poId;
    const wasExpanded = isFirstCard ? (!isFirstCardClosed || expandedPoId === poId) : expandedPoId === poId;
    const wasCloneExpanded = cloneExpandedPoId === poId;
    // Don't prevent default here - wait to see if it's a horizontal swipe
    setSwipeStates(prev => ({
      ...prev,
      [poId]: {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        isSwiping: false,
        wasExpanded: wasExpanded,
        wasCloneExpanded: wasCloneExpanded
      }
    }));
  };
  const handleTouchMove = (e, poId) => {
    const touch = e.touches[0];
    const state = swipeStates[poId];
    if (!state) return;
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Only handle horizontal swipe if horizontal movement is greater than vertical
    // This allows vertical scrolling to work normally
    if (absDeltaX <= absDeltaY) {
      // Vertical scroll - don't interfere, clear swipe state
      setSwipeStates(prev => {
        const newState = { ...prev };
        delete newState[poId];
        return newState;
      });
      return;
    }

    const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === poId;
    const isExpanded = isFirstCard ? (!isFirstCardClosed || expandedPoId === poId) : expandedPoId === poId;
    const isCloneExpanded = cloneExpandedPoId === poId;
    // Allow swiping left to reveal buttons, swiping right to reveal clone, or swiping to hide if already expanded
    // But ensure only one direction is allowed at a time
    if (deltaX < 0 || (deltaX > 0 && !isExpanded) || (isExpanded && deltaX > 0) || (isCloneExpanded && deltaX < 0)) {
      e.preventDefault();
      // Close the opposite side when starting to swipe
      if (deltaX < -10 && isCloneExpanded) {
        setCloneExpandedPoId(null);
      } else if (deltaX > 10 && isExpanded) {
        setExpandedPoId(null);
        if (isFirstCard) {
          setIsFirstCardClosed(true);
        }
      }
      setSwipeStates(prev => ({
        ...prev,
        [poId]: {
          ...prev[poId],
          currentX: touch.clientX,
          currentY: touch.clientY,
          isSwiping: true,
          wasExpanded: prev[poId].wasExpanded,
          wasCloneExpanded: prev[poId].wasCloneExpanded
        }
      }));
    }
  };
  const handleTouchEnd = (poId) => {
    const state = swipeStates[poId];
    if (!state) return;
    const deltaX = state.currentX - state.startX;
    const absDeltaX = Math.abs(deltaX);
    const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === poId;
    const isExpanded = isFirstCard ? (!isFirstCardClosed || expandedPoId === poId) : expandedPoId === poId;
    const wasCloneExpanded = state.wasCloneExpanded || false;
    const wasExpanded = state.wasExpanded || false;

    if (absDeltaX >= minSwipeDistance) {
      if (deltaX < 0) {
        // Swiped left
        if (wasCloneExpanded) {
          // If clone was expanded, only close clone button - don't show edit/delete buttons
          setCloneExpandedPoId(null);
        } else {
          // If clone was NOT expanded, reveal edit/delete buttons on right
          setCloneExpandedPoId(null);
          if (isFirstCard) {
            setIsFirstCardClosed(false);
          }
          setExpandedPoId(poId);
        }
      } else {
        // Swiped right
        if (wasExpanded) {
          // If Edit/Delete buttons were visible, just hide them (don't show Clone)
          setExpandedPoId(null);
          if (isFirstCard) {
            setIsFirstCardClosed(true);
          }
          setCloneExpandedPoId(null);
        } else {
          // If Edit/Delete buttons were NOT visible, show Clone button
          setCloneExpandedPoId(poId);
        }
      }
    } else {
      // Small movement - snap back (no change needed, buttons stay as they are)
    }
    // Reset swipe state
    setSwipeStates(prev => {
      const newState = { ...prev };
      delete newState[poId];
      return newState;
    });
  };
  // Set up non-passive event listeners using refs
  useEffect(() => {
    const cleanupFunctions = [];
    // Global mouse event handlers for desktop support
    const globalMouseMoveHandler = (e) => {
      // Check all cards to see if any are being dragged
      setSwipeStates(prev => {
        let hasChanges = false;
        const newState = { ...prev };
        filteredPOs.forEach(po => {
          const state = prev[po.id];
          if (!state) return;
          const deltaX = e.clientX - state.startX;
          const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === po.id;
          // Use refs to get current values
          const currentIsFirstCardClosed = isFirstCardClosedRef.current;
          const currentExpandedPoId = expandedPoIdRef.current;
          const currentCloneExpandedPoId = cloneExpandedPoIdRef.current;
          // Check if card is expanded
          const isExpanded = isFirstCard
            ? (!currentIsFirstCardClosed || currentExpandedPoId === po.id)
            : currentExpandedPoId === po.id;
          const isCloneExpanded = currentCloneExpandedPoId === po.id;
          // Only update if dragging horizontally
          if (deltaX < 0 || (deltaX > 0 && !isExpanded) || (isExpanded && deltaX > 0) || (isCloneExpanded && deltaX < 0)) {
            // Close the opposite side when starting to swipe
            if (deltaX < -10 && isCloneExpanded) {
              setCloneExpandedPoId(null);
            } else if (deltaX > 10 && isExpanded) {
              setExpandedPoId(null);
              if (isFirstCard) {
                setIsFirstCardClosed(true);
              }
            }
            newState[po.id] = {
              ...state,
              currentX: e.clientX,
              isSwiping: true,
              wasExpanded: state.wasExpanded,
              wasCloneExpanded: state.wasCloneExpanded
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
        filteredPOs.forEach(po => {
          const state = prev[po.id];
          if (!state) return;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === po.id;
          const currentIsFirstCardClosed = isFirstCardClosedRef.current;
          const currentExpandedPoId = expandedPoIdRef.current;
          const isExpanded = isFirstCard
            ? (!currentIsFirstCardClosed || currentExpandedPoId === po.id)
            : currentExpandedPoId === po.id;
          const wasCloneExpanded = state.wasCloneExpanded || false;
          const wasExpanded = state.wasExpanded || false;
          if (absDeltaX >= minSwipeDistance) {
            if (deltaX < 0) {
              // Swiped left
              if (wasCloneExpanded) {
                // If clone was expanded, only close clone button - don't show edit/delete buttons
                setCloneExpandedPoId(null);
              } else {
                // If clone was NOT expanded, reveal edit/delete buttons on right
                setCloneExpandedPoId(null);
                if (isFirstCard) {
                  setIsFirstCardClosed(false);
                }
                setExpandedPoId(po.id);
              }
            } else {
              // Swiped right
              if (wasExpanded) {
                // If Edit/Delete buttons were visible, just hide them (don't show Clone)
                setExpandedPoId(null);
                if (isFirstCard) {
                  setIsFirstCardClosed(true);
                }
                setCloneExpandedPoId(null);
              } else {
                // If Edit/Delete buttons were NOT visible, show Clone button
                setCloneExpandedPoId(po.id);
              }
            }
          } else {
            // Small movement - snap back (no change needed, buttons stay as they are)
          }
          // Remove swipe state for this card
          delete newState[po.id];
          hasChanges = true;
        });
        return hasChanges ? newState : prev;
      });
    };
    // Add global mouse event listeners
    document.addEventListener('mousemove', globalMouseMoveHandler);
    document.addEventListener('mouseup', globalMouseUpHandler);
    cleanupFunctions.push(() => {
      document.removeEventListener('mousemove', globalMouseMoveHandler);
      document.removeEventListener('mouseup', globalMouseUpHandler);
    });
    filteredPOs.forEach(po => {
      const element = cardRefs.current[po.id];
      if (!element) return;
      const touchStartHandler = (e) => {
        const touch = e.touches[0];
        const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === po.id;
        // Use refs to get current values
        const currentIsFirstCardClosed = isFirstCardClosedRef.current;
        const currentExpandedPoId = expandedPoIdRef.current;
        const currentCloneExpandedPoId = cloneExpandedPoIdRef.current;
        const wasExpanded = isFirstCard
          ? (!currentIsFirstCardClosed || currentExpandedPoId === po.id)
          : currentExpandedPoId === po.id;
        const wasCloneExpanded = currentCloneExpandedPoId === po.id;
        // Don't prevent default here - wait to see if it's a horizontal swipe
        setSwipeStates(prev => ({
          ...prev,
          [po.id]: {
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
            isSwiping: false,
            wasExpanded: wasExpanded,
            wasCloneExpanded: wasCloneExpanded
          }
        }));
      };
      const touchMoveHandler = (e) => {
        const touch = e.touches[0];
        setSwipeStates(prev => {
          const state = prev[po.id];
          if (!state) return prev;
          const deltaX = touch.clientX - state.startX;
          const deltaY = touch.clientY - state.startY;
          const absDeltaX = Math.abs(deltaX);
          const absDeltaY = Math.abs(deltaY);

          // Only handle horizontal swipe if horizontal movement is greater than vertical
          // This allows vertical scrolling to work normally
          if (absDeltaX <= absDeltaY) {
            // Vertical scroll - don't interfere, clear swipe state
            const newState = { ...prev };
            delete newState[po.id];
            return newState;
          }

          const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === po.id;
          // Use refs to get current values
          const currentIsFirstCardClosed = isFirstCardClosedRef.current;
          const currentExpandedPoId = expandedPoIdRef.current;
          const currentCloneExpandedPoId = cloneExpandedPoIdRef.current;
          // Check if card is expanded
          const isExpanded = isFirstCard
            ? (!currentIsFirstCardClosed || currentExpandedPoId === po.id)
            : currentExpandedPoId === po.id;
          const isCloneExpanded = currentCloneExpandedPoId === po.id;
          // Only prevent default and update if swiping horizontally
          if (deltaX < 0 || (deltaX > 0 && !isExpanded) || (isExpanded && deltaX > 0) || (isCloneExpanded && deltaX < 0)) {
            e.preventDefault();
            // Close the opposite side when starting to swipe
            if (deltaX < -10 && isCloneExpanded) {
              setCloneExpandedPoId(null);
            } else if (deltaX > 10 && isExpanded) {
              setExpandedPoId(null);
              if (isFirstCard) {
                setIsFirstCardClosed(true);
              }
            }
            return {
              ...prev,
              [po.id]: {
                ...prev[po.id],
                currentX: touch.clientX,
                currentY: touch.clientY,
                isSwiping: true,
                wasExpanded: prev[po.id].wasExpanded,
                wasCloneExpanded: prev[po.id].wasCloneExpanded
              }
            };
          }
          return prev;
        });
      };
      const touchEndHandler = () => {
        setSwipeStates(prev => {
          const state = prev[po.id];
          if (!state) return prev;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === po.id;
          const currentIsFirstCardClosed = isFirstCardClosedRef.current;
          const currentExpandedPoId = expandedPoIdRef.current;
          const isExpanded = isFirstCard
            ? (!currentIsFirstCardClosed || currentExpandedPoId === po.id)
            : currentExpandedPoId === po.id;
          const wasCloneExpanded = state.wasCloneExpanded || false;
          const wasExpanded = state.wasExpanded || false;

          if (absDeltaX >= minSwipeDistance) {
            if (deltaX < 0) {
              // Swiped left
              if (wasCloneExpanded) {
                // If clone was expanded, only close clone button - don't show edit/delete buttons
                setCloneExpandedPoId(null);
              } else {
                // If clone was NOT expanded, reveal edit/delete buttons on right
                setCloneExpandedPoId(null);
                if (isFirstCard) {
                  setIsFirstCardClosed(false);
                }
                setExpandedPoId(po.id);
              }
            } else {
              // Swiped right
              if (wasExpanded) {
                // If Edit/Delete buttons were visible, just hide them (don't show Clone)
                setExpandedPoId(null);
                if (isFirstCard) {
                  setIsFirstCardClosed(true);
                }
                setCloneExpandedPoId(null);
              } else {
                // If Edit/Delete buttons were NOT visible, show Clone button
                setCloneExpandedPoId(po.id);
              }
            }
          } else {
            // Small movement - snap back (no change needed, buttons stay as they are)
          }
          // Reset swipe state
          const newState = { ...prev };
          delete newState[po.id];
          return newState;
        });
      };
      // Mouse event handlers for desktop support
      const mouseDownHandler = (e) => {
        // Prevent text selection during swipe
        e.preventDefault();
        const isFirstCard = filteredPOs.length > 0 && filteredPOs[0].id === po.id;
        // Use refs to get current values
        const currentIsFirstCardClosed = isFirstCardClosedRef.current;
        const currentExpandedPoId = expandedPoIdRef.current;
        const currentCloneExpandedPoId = cloneExpandedPoIdRef.current;
        const wasExpanded = isFirstCard
          ? (!currentIsFirstCardClosed || currentExpandedPoId === po.id)
          : currentExpandedPoId === po.id;
        const wasCloneExpanded = currentCloneExpandedPoId === po.id;
        setSwipeStates(prev => ({
          ...prev,
          [po.id]: {
            startX: e.clientX,
            currentX: e.clientX,
            isSwiping: false,
            wasExpanded: wasExpanded,
            wasCloneExpanded: wasCloneExpanded
          }
        }));
      };
      // Add non-passive event listeners for touch
      element.addEventListener('touchstart', touchStartHandler, { passive: false });
      element.addEventListener('touchmove', touchMoveHandler, { passive: false });
      element.addEventListener('touchend', touchEndHandler, { passive: false });
      // Add mouse event listeners for desktop support
      element.addEventListener('mousedown', mouseDownHandler);
      cleanupFunctions.push(() => {
        element.removeEventListener('touchstart', touchStartHandler);
        element.removeEventListener('touchmove', touchMoveHandler);
        element.removeEventListener('touchend', touchEndHandler);
        element.removeEventListener('mousedown', mouseDownHandler);
      });
    });
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [filteredPOs, minSwipeDistance, cloneExpandedPoId]);
  // Format date/time for display: "Today • 09:42 AM", "Yesterday • 11:11 AM", or "DD/MM/YYYY • HH:MM AM/PM"
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      // Format time
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const timeStr = `${hours}:${minutes} ${ampm}`;
      // Check if today, yesterday, or older
      if (dateOnly.getTime() === today.getTime()) {
        return `Today • ${timeStr}`;
      } else if (dateOnly.getTime() === yesterday.getTime()) {
        return `Yesterday • ${timeStr}`;
      } else {
        // Format date as DD/MM/YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year} • ${timeStr}`;
      }
    } catch (error) {
      console.error('Error formatting date/time:', error);
      return '';
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('/')) return dateString;
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };
  const handleDateConfirm = (startDate, endDate) => {
    setFilters({
      ...filters,
      startDate: startDate || '',
      endDate: endDate || ''
    });
    setShowDatePicker(false);
  };
  const hasActiveFilters = searchQuery || filters.vendorName || filters.clientName || filters.siteIncharge || filters.startDate || filters.endDate || filters.poNumber || filters.branch;
  // Use all available options from APIs for filter dropdowns
  const uniqueVendors = [...new Set(allVendors.map(v => v.vendorName).filter(Boolean))].sort();
  // Extract unique branches from projects
  const uniqueBranches = [...new Set(allProjects.map(p => p.branch).filter(Boolean))].sort();
  // Filter projects by selected branch
  const filteredProjects = filters.branch
    ? allProjects.filter(p => p.branch === filters.branch)
    : allProjects;
  const uniqueClients = [...new Set(filteredProjects.map(p => p.siteName || p.projectName).filter(Boolean))].sort();
  const uniqueSiteIncharges = [...new Set([
    ...allEmployees.map(e =>
      e.employeeName || e.name || e.fullName || e.employee_name || ''
    ),
    ...allSupportStaff.map(s =>
      s.support_staff_name || s.supportStaffName || ''
    )
  ].filter(Boolean))].sort();
  return (
    <div className="relative w-full bg-white max-w-[360px] mx-auto flex flex-col scrollbar-none overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 bg-white px-4 pt-4 z-30">
        {/* Search Bar */}
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[328px] h-[40px] pl-10 pr-4 border border-[#E0E0E0] rounded-3xl text-[14px] font-medium text-black placeholder:text-[#9E9E9E] focus:outline-none"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.79011 10.8302C8.57368 10.8302 10.8302 8.57368 10.8302 5.79011C10.8302 3.00653 8.57368 0.75 5.79011 0.75C3.00653 0.75 0.75 3.00653 0.75 5.79011C0.75 8.57368 3.00653 10.8302 5.79011 10.8302Z" stroke="#747474" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12.75 12.9716L9.50195 9.72363" stroke="#747474" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
        {/* Filter and Clear Buttons with Filter Tags */}
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-2  min-w-0">
            <button onClick={() => setShowFilterModal(true)} className="flex items-center gap-2 px-0 flex-shrink-0" >
              <img src={Filter} alt='filter' className=' w-[11px] h-[11px]' />
              {!hasActiveFilters && (
                <span className="text-[14px] font-medium flex-shrink-0 text-[#9E9E9E]">
                  Filter
                </span>
              )}
            </button>
            {/* Active Filter Tags - Next to Filter button */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none  min-w-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* Show "Filter" text only when no filters are active */}
              {/* Show filter tags when filters are active */}
              {(filters.vendorName || filters.clientName || filters.siteIncharge || filters.startDate || filters.endDate || filters.branch) && (
                <div className="flex items-center gap-2 flex-nowrap">
                  {filters.branch && (
                    <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black">Branch</span>
                      <button
                        onClick={() => {
                          setFilters({ ...filters, branch: '', clientName: '' }); // Clear clientName when branch is cleared
                        }}
                        className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {filters.vendorName && (
                    <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black">Vendor</span>
                      <button onClick={() => setFilters({ ...filters, vendorName: '' })}
                        className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {filters.clientName && (
                    <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black">Project</span>
                      <button onClick={() => setFilters({ ...filters, clientName: '' })}
                        className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {filters.siteIncharge && (
                    <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black">Incharge</span>
                      <button onClick={() => setFilters({ ...filters, siteIncharge: '' })}
                        className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {(filters.startDate || filters.endDate) && (
                    <div className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-full flex-shrink-0">
                      <span className="text-[11px] font-medium text-black whitespace-nowrap">
                        Date
                      </span>
                      <button onClick={() => setFilters({ ...filters, startDate: '', endDate: '' })}
                        className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={handleClear} className="text-[14px] font-medium hover:text-black transition-colors flex-shrink-0 text-[#9E9E9E]" >
              x
            </button>
          )}
        </div>
      </div>
      {/* Purchase Orders List - Scrollable */}
      <div className="overflow-y-auto no-scrollbar mx-auto scrollbar-none scrollbar-hide px-4 mt-1 " style={{ height: 'calc(100vh - 180px - 80px)', maxHeight: 'calc(100vh - 180px - 80px)' }}
        onClick={() => {
          setExpandedPoId(null);
          setCloneExpandedPoId(null);
        }}
      >
        {filteredPOs.length === 0 ? (
          <div className="flex flex-col items-center justify-center ">
            <div className="w-[64px] h-[64px] rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12H24M8 20H24M8 28H24" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#9E9E9E] text-center">
              {searchQuery ? 'No purchase orders found' : 'No purchase orders yet'}
            </p>
          </div>
        ) : (
          <div className="">
            {filteredPOs.map((po, index) => {
              const isFirstCard = index === 0;
              // First card starts expanded, but can be closed by swiping right
              const isExpanded = isFirstCard
                ? (!isFirstCardClosed || expandedPoId === po.id)
                : expandedPoId === po.id;
              const totalItems = po.items?.length || 0;
              const totalQuantity = po.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
              const totalAmount = po.items?.reduce((sum, item) => {
                const amount = item.amount || (item.quantity * item.price) || 0;
                return sum + Number(amount);
              }, 0) || 0;
              const swipeState = swipeStates[po.id];
              const isCloneExpanded = cloneExpandedPoId === po.id;
              let swipeOffset = 0;
              if (swipeState && swipeState.isSwiping) {
                const deltaX = swipeState.currentX - swipeState.startX;
                // Only allow swipe in one direction at a time
                if (deltaX < 0) {
                  // Swiping left - only show negative offset (edit/delete buttons)
                  swipeOffset = Math.max(-110, deltaX);
                } else {
                  // Swiping right
                  if (isExpanded) {
                    // If Edit/Delete buttons are visible, only allow hiding them (offset from -110 to 0)
                    // Start from -110 and add positive deltaX to move towards 0
                    swipeOffset = Math.max(-110, Math.min(0, -110 + deltaX));
                  } else {
                    // If Edit/Delete buttons are NOT visible, show Clone button (positive offset)
                    swipeOffset = Math.min(48, deltaX);
                  }
                }
              } else if (isExpanded) {
                swipeOffset = -110;
              } else if (isCloneExpanded) {
                swipeOffset = 48;
              } else {
                swipeOffset = 0;
              }
              return (
                <div
                  key={po.id}
                  className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] h-[100px]"
                  style={{
                    userSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                    WebkitUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                    MozUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                    msUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto'
                  }}
                >
                  {/* Clone Button - Behind the card on the left, revealed on right swipe */}
                  <div
                    className="absolute left-0 top-0 flex gap-2 flex-shrink-0 z-0"
                    style={{
                      opacity: (isCloneExpanded || (swipeState && swipeState.isSwiping && swipeOffset > 20)) && !isExpanded ? 1 : 0,
                      transition: 'opacity 0.2s ease-out',
                      pointerEvents: isCloneExpanded ? 'auto' : 'none'
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClone(po);
                      }}
                      className="action-button w-[48px] h-[95px] bg-[#007233] rounded-[6px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      title="Clone"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 6.75V3.75C12 3.33579 11.6642 3 11.25 3H3.75C3.33579 3 3 3.33579 3 3.75V11.25C3 11.6642 3.33579 12 3.75 12H6.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15 6.75H7.5C6.67157 6.75 6 7.42157 6 8.25V14.25C6 15.0784 6.67157 15.75 7.5 15.75H14.25C15.0784 15.75 15.75 15.0784 15.75 14.25V8.25C15.75 7.42157 15.0784 6.75 14.25 6.75H15Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  {/* PO Card */}
                  <div
                    ref={(el) => {
                      if (el) {
                        cardRefs.current[po.id] = el;
                      } else {
                        delete cardRefs.current[po.id];
                      }
                    }}
                    className="flex-1 bg-white rounded-[8px] h-full px-3 py-3 transition-all duration-300 ease-out"
                    style={{
                      transform: `translateX(${swipeOffset}px)`,
                      touchAction: 'pan-y',
                      userSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                      WebkitUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                      MozUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto',
                      msUserSelect: (swipeState && swipeState.isSwiping) ? 'none' : 'auto'
                    }}
                    onClick={(e) => {
                      if (!isExpanded && !isCloneExpanded) {
                        e.stopPropagation();
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Left: PO Details */}
                      <div className=" min-w-0 mb-1">
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Open in view-only mode (Download button)
                              handleView(po);
                              setExpandedPoId(null);
                              setCloneExpandedPoId(null);
                            }}
                            className="text-[12px] font-semibold text-black leading-snug cursor-pointer hover:text-blue-600 hover:underline text-left"
                          >
                            {po.poNumber || 'N/A'}
                          </button>

                        </div>
                        <p className="text-[12px] font-semibold text-black leading-snug truncate mb-0.5">
                          {po.vendorName || 'N/A'}
                        </p>
                        <p className="text-[11px] font-medium text-[#777777] leading-snug truncate">
                          {po.projectName || 'N/A'}
                        </p>
                        {!isExpanded && (
                          <span className="text-[11px] font-medium text-[#777777] leading-snug">
                            {formatDateTime(po.created_date_time || po.createdAt)}
                          </span>
                        )}
                      </div>
                      {/* Right: Payment Status Badge and Amount - Always visible */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        {po.paymentStatus && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${po.paymentStatus === 'Paid'
                              ? 'bg-[#E8F5E9] text-[#2E7D32]'
                              : po.paymentStatus === 'Unpaid'
                                ? 'bg-[#FFEBEE] text-[#C62828]'
                                : po.paymentStatus === 'Partially paid'
                                  ? 'bg-[#E8F5E9] text-[#388E3C]'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${po.paymentStatus === 'Paid'
                                ? 'bg-[#2E7D32]'
                                : po.paymentStatus === 'Unpaid'
                                  ? 'bg-[#C62828]'
                                  : po.paymentStatus === 'Partially paid'
                                    ? 'bg-[#388E3C]'
                                    : 'bg-gray-600'
                                }`}
                            ></span>
                            {po.paymentStatus}
                          </span>
                        )}
                        {totalAmount > 0 && (
                          <>
                            <p className="text-[12px] font-semibold text-black block leading-snug mt-5 mb-0">
                              ₹{totalAmount.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10px] font-medium text-[#9E9E9E]"> Incl Tax</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons - Behind the card on the right, revealed on swipe */}
                  <div
                    className="absolute right-0 top-0 flex gap-2 flex-shrink-0 z-0"
                    style={{
                      opacity: isExpanded || (swipeState && swipeState.isSwiping && swipeOffset < -20) ? 1 : 0,
                      transform: swipeOffset < 0
                        ? `translateX(${Math.max(0, 110 + swipeOffset)}px)`
                        : 'translateX(110px)',
                      transition: 'opacity 0.2s ease-out',
                      pointerEvents: isExpanded ? 'auto' : 'none'
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle edit - load PO data into create tab
                        handleEdit(po);
                        setExpandedPoId(null); // Close after edit
                      }}
                      className="action-button w-[48px] h-[95px] bg-[#007233] rounded-[6px] flex items-center justify-center gap-1.5 hover:bg-[#22a882] transition-colors shadow-sm"
                      title="Edit"
                    >
                      <img src={Edit} alt="Edit" className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(po.id);
                        setExpandedPoId(null); // Close after delete
                      }}
                      className="action-button w-[48px] h-[95px] bg-[#E4572E] flex rounded-[6px] items-center justify-center gap-1.5 hover:bg-[#cc4d26] transition-colors shadow-sm"
                      title="Delete"
                    >
                      <img src={Delete} alt="Delete" className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center" style={{ fontFamily: "'Manrope', sans-serif" }} onClick={() => setShowFilterModal(false)}>
          <div className="bg-white w-full max-w-[360px] h-[370px] rounded-tl-[16px] rounded-tr-[16px] relative z-50 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }} onClick={(e) => e.stopPropagation()}>
            {/* Title */}
            <div className="px-6 pt-5 pb-4 flex items-center justify-between">
              <p className="text-[14px] font-semibold text-black">Select Filters</p>
              {/* Branch Filter Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBranchModal(true);
                }}
                className="text-[14px] font-semibold text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity"
              >
                {filters.branch || 'Branch'}
              </button>
            </div>
            <div className="px-6">
              <div className="space-y-[6px]">
                {/* Vendor Name Filter */}
                <div>
                  <label className="text-[12px] font-semibold text-black mb-0.5 block">
                    Vendor Name
                  </label>
                  <SearchableDropdown
                    value={filters.vendorName}
                    onChange={(value) => setFilters({ ...filters, vendorName: value })}
                    options={uniqueVendors}
                    placeholder="Select"
                    fieldName="Vendor Filter"
                    showAddNew={false}
                    showAllOptions={true}
                  />
                </div>
                {/* Client Name Filter */}
                <div>
                  <label className="text-[12px] font-semibold text-black mb-0.5 block">
                    Project Name
                  </label>
                  <SearchableDropdown
                    value={filters.clientName}
                    onChange={(value) => setFilters({ ...filters, clientName: value })}
                    options={uniqueClients}
                    placeholder="Select"
                    fieldName="Client Filter"
                    showAddNew={false}
                    showAllOptions={true}
                  />
                </div>
                {/* Site Incharge Filter */}
                <div>
                  <label className="text-[12px] font-semibold text-black mb-0.5 block">
                    Site Incharge
                  </label>
                  <SearchableDropdown
                    value={filters.siteIncharge}
                    onChange={(value) => setFilters({ ...filters, siteIncharge: value })}
                    options={uniqueSiteIncharges}
                    placeholder="Select"
                    fieldName="Site Incharge Filter"
                    showAddNew={false}
                    showAllOptions={true}
                  />
                </div>
                <div className="flex gap-2">
                  {/* Date Filter */}
                  <div className="flex-1">
                    <label className="text-[12px] font-semibold text-black mb-0.5 block">Date</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(true)}
                        className="w-full h-[32px] px-4 border border-[#E0E0E0] rounded text-[10px] font-medium text-black bg-white flex items-center justify-between focus:outline-none"
                      >
                        <span className={`${(filters.startDate || filters.endDate) ? 'text-black' : 'text-[#9E9E9E]'} whitespace-nowrap overflow-hidden text-ellipsis`}>
                          {filters.startDate && filters.endDate
                            ? `${formatDate(filters.startDate)} to ${formatDate(filters.endDate)}`
                            : filters.startDate
                              ? formatDate(filters.startDate)
                              : filters.endDate
                                ? formatDate(filters.endDate)
                                : 'Select Date'}
                        </span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 ml-2">
                          <path d="M3 4H13M3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4M3 4C3 3.44772 3.44772 3 4 3H12C12.5523 3 13 3.44772 13 4M6 2V5M10 2V5" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* PO.No Filter */}
                  <div className="flex-1">
                    <label className="text-[12px] font-semibold text-black mb-0.5 block">PO.No</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.poNumber}
                        onChange={(e) => setFilters({ ...filters, poNumber: e.target.value })}
                        placeholder="Enter"
                        className="w-full h-[32px] px-4 border border-[#E0E0E0] rounded text-[14px] font-medium text-black placeholder:text-[#9E9E9E] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Action Buttons - Fixed at bottom */}
            <div className="absolute mt-5 left-0 right-0 px-6 flex gap-4">
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-[175px] h-[40px] border border-[#949494] rounded-[8px] text-[14px] font-bold text-[#363636] bg-white leading-normal"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-[175px] h-[40px] bg-black border border-[#f4ede2] rounded-[8px] text-[14px] font-bold text-white leading-normal"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        message="Are you sure you want to delete this purchase order?"
      />
      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        initialStartDate={filters.startDate ? formatDate(filters.startDate) : ''}
        initialEndDate={filters.endDate ? formatDate(filters.endDate) : ''}
      />
      {/* Branch Select Modal */}
      <SelectVendorModal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        onSelect={(value) => {
          setFilters({ ...filters, branch: value, clientName: '' });
          setShowBranchModal(false);
        }}
        selectedValue={filters.branch}
        options={uniqueBranches}
        fieldName="Branch"
        onAddNew={null}
        showStarIcon={false}
      />
    </div>
  );
};
export default History;