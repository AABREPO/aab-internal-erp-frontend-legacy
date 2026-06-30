import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../PurchaseOrder/Header';
import Sidebar from '../Bars/Sidebar';
import BottomNav from '../PurchaseOrder/BottomNav';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import Filter from '../Images/Filter.png';
import GoodsRecievedNotesTabs from './GoodsRecievedNotesTabs';

const statusTabs = ['Pending', 'Review', 'Completed'];
const vendorCache = { data: null };
const projectCache = { data: null };
const siteEngineersCache = { data: null };
const supportStaffCache = { data: null };
const basePurchaseOrdersUrl = 'https://backendaab.in/demoAabuildersDash/api/purchase_orders';
const GRN_IMAGES_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/grn-images';
const baseLookupsUrl = 'https://backendaab.in/demoAabuildersDash/api';

const findNameById = (dataArray, id, fieldNames = []) => {
  if (!id || !Array.isArray(dataArray)) return '';
  const idStr = String(id);
  const found = dataArray.find((item) => String(item?.id || item?._id || '') === idStr);
  if (!found) return '';
  for (const fieldName of fieldNames) {
    if (found?.[fieldName]) return found[fieldName];
  }
  return found?.name || found?.label || found?.value || '';
};

const mapPurchaseOrderItems = (
  rows = [],
  poItemName = [],
  poBrand = [],
  poModel = [],
  poType = [],
  categoryOptions = []
) =>
  rows.map((item, index) => {
    const category =
      item?.category ||
      item?.categoryName ||
      findNameById(categoryOptions, item?.category_id || item?.categoryId, ['label', 'value', 'categoryName', 'category']);

    const rawQty = item?.quantity ?? item?.qty ?? 0;
    const itemName =
      item?.name ||
      item?.itemName ||
      findNameById(poItemName, item?.item_id || item?.itemId, ['itemName', 'poItemName', 'item_name', 'name']);
    const brand =
      item?.brand ||
      item?.brandName ||
      findNameById(poBrand, item?.brand_id || item?.brandId, ['brand', 'brandName', 'name']);
    const model =
      item?.model ||
      item?.modelName ||
      findNameById(poModel, item?.model_id || item?.modelId, ['model', 'modelName', 'name']);
    const type =
      item?.type ||
      item?.typeName ||
      item?.typeColor ||
      findNameById(poType, item?.type_id || item?.typeId, ['typeColor', 'type', 'typeName', 'name']);

    const rawTableRowId = item?.id ?? item?.purchaseOrderTableId ?? item?.purchase_order_table_id;
    const numericTableRowId =
      rawTableRowId !== undefined && rawTableRowId !== null ? Number(rawTableRowId) : null;
    const purchaseOrderTableId =
      numericTableRowId !== null && Number.isFinite(numericTableRowId) ? numericTableRowId : null;

    return {
      id: item?.id || `item-${index}`,
      purchaseOrderTableId,
      name: itemName || `Item ${index + 1}`,
      brand: brand || '',
      type: [model, type].filter(Boolean).join(', '),
      category: category || '',
      orderedQuantity: rawQty,
      verified: Boolean(item?.verified ?? item?.isVerified ?? item?.is_verified ?? false),
      categoryColor: String(category || '').toLowerCase().includes('paint') ? 'text-[#1EBD9D]' : 'text-[#4F5DFF]',
      categoryBg: String(category || '').toLowerCase().includes('paint') ? 'bg-[#E4FFF8]' : 'bg-[#EEF0FF]'
    };
  });

const formatCardTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return `${date.toLocaleDateString('en-GB')} - ${date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
};

const getGrnStatus = (purchaseOrder) => {
  if (
    purchaseOrder?.grnCompleted ||
    purchaseOrder?.grn_completed ||
    purchaseOrder?.is_Grn_completed ||
    purchaseOrder?.is_grn_completed
  )
    return 'Completed';
  if (purchaseOrder?.grnVerified || purchaseOrder?.grn_verified || purchaseOrder?.is_grn_verified) return 'Review';
  // For Verify screen: if request was sent, it should appear in Pending (awaiting verification).
  if (
    purchaseOrder?.grnRequestSend ||
    purchaseOrder?.grn_request_send ||
    purchaseOrder?.grnRequestSent ||
    purchaseOrder?.grn_request_sent ||
    purchaseOrder?.is_grn_request_send ||
    purchaseOrder?.is_grn_send_request ||
    purchaseOrder?.isGrnSendRequest
  )
    return 'Pending';
  return 'Pending';
};

const mapPurchaseOrderToCard = (
  purchaseOrder,
  vendorNameOptions = [],
  siteOptions = [],
  employeeList = [],
  poItemName = [],
  poBrand = [],
  poModel = [],
  poType = [],
  categoryOptions = []
) => {
  const resolvedVendor =
    vendorNameOptions.find((option) => String(option.id) === String(purchaseOrder?.vendor_id))?.value ||
    purchaseOrder?.vendorName ||
    '';
  const resolvedProject =
    siteOptions.find((option) => String(option.id) === String(purchaseOrder?.client_id))?.value ||
    purchaseOrder?.projectName ||
    purchaseOrder?.siteName ||
    '';
  const matchedEmployee = employeeList.find(
    (employee) => String(employee.id) === String(purchaseOrder?.site_incharge_id)
  );
  const resolvedEngineer =
    matchedEmployee?.employeeName ||
    matchedEmployee?.name ||
    matchedEmployee?.fullName ||
    matchedEmployee?.employee_name ||
    purchaseOrder?.projectIncharge ||
    purchaseOrder?.site_incharge_name ||
    '';
  const items =
    purchaseOrder?.purchaseOrderTable ||
    purchaseOrder?.purchaseTable ||
    purchaseOrder?.poTable ||
    purchaseOrder?.items ||
    [];

  const mappedItems = mapPurchaseOrderItems(items, poItemName, poBrand, poModel, poType, categoryOptions);

  const mappedCard = {
    id: purchaseOrder?.id || purchaseOrder?._id || purchaseOrder?.eno,
    status: getGrnStatus(purchaseOrder),
    poNo: purchaseOrder?.eno ? `PO - 2026 - ${purchaseOrder.eno}` : purchaseOrder?.poNumber || 'PO',
    vendorName: resolvedVendor,
    siteName: resolvedProject,
    time: formatCardTime(
      purchaseOrder?.created_date_time || purchaseOrder?.createdAt || purchaseOrder?.created_at || purchaseOrder?.date
    ),
    engineerName: resolvedEngineer,
    itemsCount: mappedItems.length,
    items: mappedItems
  };


  return mappedCard;
};

const Verify = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('goods-recieved-notes');
  const [activeStatus, setActiveStatus] = useState('Pending');
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [grnImageUrlsByKey, setGrnImageUrlsByKey] = useState({});
  const [grnDescriptionsByKey, setGrnDescriptionsByKey] = useState({});
  const [grnQtyByKey, setGrnQtyByKey] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionPopup, setRejectionPopup] = useState({
    open: false,
    mode: /** @type {'item' | 'po'} */ ('item'),
    text: ''
  });
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showInchargeModal, setShowInchargeModal] = useState(false);
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('');
  const [selectedInchargeFilter, setSelectedInchargeFilter] = useState('');
  const [vendorNameOptions, setVendorNameOptions] = useState(() => vendorCache.data || []);
  const [siteOptions, setSiteOptions] = useState(() => projectCache.data || []);
  const [employeeList, setEmployeeList] = useState(() => siteEngineersCache.data || []);
  const [supportStaffList, setSupportStaffList] = useState(() => supportStaffCache.data || []);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [poItemName, setPoItemName] = useState([]);
  const [poBrand, setPoBrand] = useState([]);
  const [poModel, setPoModel] = useState([]);
  const [poType, setPoType] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const vendorOptions = useMemo(
    () => vendorNameOptions.map((option) => option.value).filter(Boolean),
    [vendorNameOptions]
  );
  const inchargeOptions = useMemo(() => {
    const employeeNames = employeeList
      .map((employee) => employee.employeeName || employee.name || employee.fullName || employee.employee_name || '')
      .filter(Boolean);

    return [...new Set(employeeNames)].sort((a, b) => a.localeCompare(b));
  }, [employeeList]);
  // Always map grn-requested POs; engineer/vendor filters are applied in filteredCards (no API filter = show all).
  const cards = useMemo(() => {
    return purchaseOrders.map((purchaseOrder) =>
      mapPurchaseOrderToCard(
        purchaseOrder,
        vendorNameOptions,
        siteOptions,
        employeeList,
        poItemName,
        poBrand,
        poModel,
        poType,
        categoryOptions
      )
    );
  }, [categoryOptions, employeeList, poBrand, poItemName, poModel, poType, purchaseOrders, siteOptions, vendorNameOptions]);

  // Data source is already restricted to GRN requested POs via /grn-requested.
  const verifyCardsOnly = useMemo(() => {
    return cards.filter((card) => {
      const po = purchaseOrders.find((p) => String(p?.id) === String(card.id));
      const verified = po?.grnVerified || po?.grn_verified || po?.is_grn_verified || false;
      const completed = po?.grnCompleted || po?.grn_completed || po?.is_Grn_completed || po?.is_grn_completed || false;
      return Boolean(verified || completed || po);
    });
  }, [cards, purchaseOrders]);

  const filteredCards = useMemo(
    () =>
      verifyCardsOnly.filter((card) => {
        const statusMatches = card.status === activeStatus;
        const vendorMatches = !selectedVendorFilter || card.vendorName === selectedVendorFilter;
        const inchargeMatches = !selectedInchargeFilter || card.engineerName === selectedInchargeFilter;
        return statusMatches && vendorMatches && inchargeMatches;
      }),
    [activeStatus, selectedInchargeFilter, selectedVendorFilter, verifyCardsOnly]
  );

  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`Vendor fetch failed: ${response.status}`);
        }
        const data = await response.json();
        const formattedData = Array.isArray(data)
          ? data.map((item) => ({
              value: item.vendorName,
              label: item.vendorName,
              id: item.id
            }))
          : [];
        vendorCache.data = formattedData;
        setVendorNameOptions(formattedData);
      } catch (error) {
        console.error('Error fetching vendor names:', error);
      }
    };

    fetchVendorNames();
  }, []);

  useEffect(() => {
    const fetchAllLookups = async () => {
      try {
        const [itemRes, brandRes, modelRes, typeRes, catRes] = await Promise.all([
          fetch(`${baseLookupsUrl}/po_itemNames/getAll`, { credentials: 'include' }),
          fetch(`${baseLookupsUrl}/po_brand/getAll`, { credentials: 'include' }),
          fetch(`${baseLookupsUrl}/po_model/getAll`, { credentials: 'include' }),
          fetch(`${baseLookupsUrl}/po_type/getAll`, { credentials: 'include' }),
          fetch(`${baseLookupsUrl}/po_category/getAll`, { credentials: 'include' })
        ]);
        if (itemRes.ok) {
          const data = await itemRes.json();
          setPoItemName(Array.isArray(data) ? data : []);
        }
        if (brandRes.ok) {
          const data = await brandRes.json();
          setPoBrand(Array.isArray(data) ? data : []);
        }
        if (modelRes.ok) {
          const data = await modelRes.json();
          setPoModel(Array.isArray(data) ? data : []);
        }
        if (typeRes.ok) {
          const data = await typeRes.json();
          setPoType(Array.isArray(data) ? data : []);
        }
        if (catRes.ok) {
          const data = await catRes.json();
          setCategoryOptions(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Verify lookups fetch failed', e);
      }
    };
    fetchAllLookups();
  }, []);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuilderDash/api/project_Names/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`Project fetch failed: ${response.status}`);
        }
        const data = await response.json();
        const formattedData = Array.isArray(data)
          ? data.map((item) => ({
              value: item.siteName || item.projectName || '',
              label: item.siteName || item.projectName || '',
              id: item.id
            }))
          : [];
        projectCache.data = formattedData;
        setSiteOptions(formattedData);
      } catch (error) {
        console.error('Error fetching project names:', error);
      }
    };

    fetchSites();
  }, []);

  useEffect(() => {
    const fetchBothLists = async () => {
      try {
        const [employeeResponse, supportStaffResponse] = await Promise.all([
          fetch('https://backendaab.in/demoAabuildersDash/api/employee_details/site_engineers', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          }),
          fetch('https://backendaab.in/demoAabuildersDash/api/support_staff/getAll', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (employeeResponse.ok) {
          const employeeData = await employeeResponse.json();
          const employees = Array.isArray(employeeData) ? employeeData : [];
          siteEngineersCache.data = employees;
          setEmployeeList(employees);
        }

        if (supportStaffResponse.ok) {
          const supportStaffData = await supportStaffResponse.json();
          const staff = Array.isArray(supportStaffData) ? supportStaffData : [];
          supportStaffCache.data = staff;
          setSupportStaffList(staff);
        }
      } catch (error) {
        console.error('Error fetching project incharge options:', error);
      }
    };

    fetchBothLists();
  }, []);

  const refetchGrnRequestedPurchaseOrders = useCallback(async () => {
    try {
      const response = await fetch(`${basePurchaseOrdersUrl}/grn-requested`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`PO fetch failed: ${response.status}`);
      }

      const data = await response.json();
      setPurchaseOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching GRN requested purchase orders:', error);
      setPurchaseOrders([]);
    }
  }, []);

  useEffect(() => {
    refetchGrnRequestedPurchaseOrders();
  }, [refetchGrnRequestedPurchaseOrders]);

  const getStatusBadgeStyles = (status) => {
    if (status === 'Review') return 'bg-[#FFF4E5] text-[#C98A1C]';
    if (status === 'Completed') return 'bg-[#E8F8EE] text-[#13A14B]';
    return 'bg-[#FFF0EA] text-[#F07A4A]';
  };

  const getStatusDotStyles = (status) => {
    if (status === 'Review') return 'bg-[#C98A1C]';
    if (status === 'Completed') return 'bg-[#13A14B]';
    return 'bg-[#F07A4A]';
  };

  const getStatusLabel = (status) => {
    if (status === 'Review') return 'In Review';
    return status;
  };

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleNavigate = (page) => {
    if (page === 'request-for-quotation') {
      setCurrentPage('request-for-quotation');
      navigate('/rfq');
    } else if (page === 'billing') {
      setCurrentPage('billing');
      navigate('/tracker/pendingbill');
    } else if (page === 'purchase-order') {
      setCurrentPage('purchase-order');
      navigate('/purchaseorder');
    } else if (page === 'goods-recieved-notes') {
      setCurrentPage('goods-recieved-notes');
      navigate('/grn/create');
    } else if (page === 'inventory') {
      setCurrentPage('inventory');
      navigate('/inventory');
    } else if (page === 'tools-tracker') {
      setCurrentPage('tools-tracker');
      navigate('/toolsTracker');
    } else if (page === 'project-advance') {
      setCurrentPage('project-advance');
      navigate('/portal');
    } else if (page === 'loan-portal') {
      setCurrentPage('loan-portal');
      navigate('/loan');
    }
  };

  const fetchGrnImagesForPurchaseOrder = async (purchaseOrderId) => {
    const url = `${GRN_IMAGES_BASE_URL}?purchaseOrderId=${purchaseOrderId}`;
    const res = await fetch(url, { method: 'GET', credentials: 'include' });
    const text = await res.text().catch(() => '');
    let body = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      // keep string
    }
    if (!res.ok) {
      console.error('[Verify grn-images/get] error', { status: res.status, statusText: res.statusText, body });
      throw new Error(typeof body === 'string' ? body : JSON.stringify(body));
    }
    return Array.isArray(body) ? body : [];
  };

  const patchItemVerification = async (poId, itemId, isVerified) => {
    const url = `${basePurchaseOrdersUrl}/verify/${poId}/${itemId}`;
    const res = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'text/plain' },
      body: String(isVerified)
    });
    const text = await res.text().catch(() => '');
    let body = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      // keep string
    }
    if (!res.ok) {
      console.error('[Verify verify-item] error', { status: res.status, statusText: res.statusText, body });
      throw new Error(typeof body === 'string' ? body : JSON.stringify(body));
    }
    return body;
  };

  const patchItemRejectionReason = async (poId, itemId, reason) => {
    const url = `${basePurchaseOrdersUrl}/reason/${poId}/${itemId}`;
    const res = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'text/plain' },
      body: String(reason ?? '')
    });
    const text = await res.text().catch(() => '');
    let body = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      // keep string
    }
    if (!res.ok) {
      console.error('[Verify rejection-reason] error', { status: res.status, statusText: res.statusText, body });
      throw new Error(typeof body === 'string' ? body : JSON.stringify(body));
    }
    return body;
  };

  const patchPurchaseOrderDescription = async (poId, description) => {
    const url = `${basePurchaseOrdersUrl}/description/${poId}`;
    const res = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'text/plain' },
      body: String(description ?? '')
    });
    const text = await res.text().catch(() => '');
    let body = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      // keep string
    }
    if (!res.ok) {
      console.error('[Verify po-description] error', { status: res.status, statusText: res.statusText, body });
      throw new Error(typeof body === 'string' ? body : JSON.stringify(body));
    }
    return body;
  };

  const patchItemRejectionStatus = async (poId, itemId, isRejected) => {
    const url = `${basePurchaseOrdersUrl}/reject/${poId}/${itemId}`;
    const res = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'text/plain' },
      body: String(Boolean(isRejected))
    });
    const text = await res.text().catch(() => '');
    let body = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      // keep string
    }
    if (!res.ok) {
      console.error('[Verify item-reject-status] error', { status: res.status, statusText: res.statusText, body });
      throw new Error(typeof body === 'string' ? body : JSON.stringify(body));
    }
    return body;
  };

  const patchPoGrnRejected = async (poId, status) => {
    const url = `${basePurchaseOrdersUrl}/${poId}/grn-rejected?status=${status ? 'true' : 'false'}`;
    const res = await fetch(url, { method: 'PATCH', credentials: 'include' });
    const text = await res.text().catch(() => '');
    let body = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      // keep string
    }
    if (!res.ok) {
      console.error('[Verify po-grn-rejected] error', { status: res.status, statusText: res.statusText, body });
      throw new Error(typeof body === 'string' ? body : JSON.stringify(body));
    }
    return body;
  };

  const patchPoFlag = async (poId, path, status) => {
    const url = `${basePurchaseOrdersUrl}/${poId}/${path}?status=${status ? 'true' : 'false'}`;
    const res = await fetch(url, { method: 'PATCH', credentials: 'include' });
    const text = await res.text().catch(() => '');
    let body = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      // keep string
    }
    if (!res.ok) {
      console.error('[Verify po-flag] error', { status: res.status, statusText: res.statusText, body });
      throw new Error(typeof body === 'string' ? body : JSON.stringify(body));
    }
    return body;
  };

  useEffect(() => {
    setSelectedItem(null);
    setActivePreviewIndex(0);
    if (!selectedCard?.id) return;
    const poId = Number(selectedCard.id);
    if (!Number.isFinite(poId)) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchGrnImagesForPurchaseOrder(poId);
        if (cancelled) return;
        const urlsByKey = {};
        const descByKey = {};
        const qtyByKey = {};
        rows.forEach((r) => {
          const url = r?.image_url ?? r?.imageUrl ?? '';
          if (!url) return;
          const description = r?.description ?? '';
          const qty = r?.quantity ?? '';
          const tableIdRaw = r?.purchase_order_table_id ?? r?.purchaseOrderTableId ?? null;
          const tableId = tableIdRaw != null && tableIdRaw !== '' ? Number(tableIdRaw) : null;
          const key = tableId && Number.isFinite(tableId) ? String(tableId) : 'common';
          if (!urlsByKey[key]) urlsByKey[key] = [];
          if (!descByKey[key]) descByKey[key] = [];
          const idx = urlsByKey[key].length;
          urlsByKey[key].push(url);
          descByKey[key][idx] = description;
          if (tableId && Number.isFinite(tableId) && qty && qtyByKey[String(tableId)] == null) {
            qtyByKey[String(tableId)] = String(qty);
          }
        });
        setGrnImageUrlsByKey((prev) => ({ ...prev, ...urlsByKey }));
        setGrnDescriptionsByKey((prev) => ({ ...prev, ...descByKey }));
        setGrnQtyByKey((prev) => ({ ...prev, ...qtyByKey }));
      } catch (e) {
        console.error('Verify preload images failed', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCard?.id]);

  const handleApproveReject = async (isVerified) => {
    if (!selectedCard?.id || !selectedItem?.purchaseOrderTableId) return;
    const poId = Number(selectedCard.id);
    const itemId = Number(selectedItem.purchaseOrderTableId);
    if (!Number.isFinite(poId) || !Number.isFinite(itemId)) return;

    if (!isVerified) {
      setRejectionPopup({ open: true, mode: 'item', text: '' });
      return;
    }

    setIsSubmitting(true);
    try {
      await patchItemVerification(poId, itemId, isVerified);
      setSelectedCard((prev) => {
        if (!prev) return prev;
        const nextItems = (prev.items || []).map((it) =>
          String(it.purchaseOrderTableId) === String(itemId) ? { ...it, verified: isVerified } : it
        );
        return { ...prev, items: nextItems };
      });
      setSelectedItem((prev) => (prev ? { ...prev, verified: isVerified } : prev));
    } catch (e) {
      window.alert(e?.message || 'Failed to update verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetAllItemsFromCommon = async (isVerified) => {
    if (!selectedCard?.id) return;
    const poId = Number(selectedCard.id);
    if (!Number.isFinite(poId)) return;

    const items = selectedCard?.items || [];
    const itemIds = items
      .map((it) => it?.purchaseOrderTableId)
      .filter((id) => id != null && Number.isFinite(Number(id)))
      .map((id) => Number(id));

    if (itemIds.length === 0) return;

    if (!isVerified) {
      setRejectionPopup({ open: true, mode: 'po', text: '' });
      return;
    }

    setIsSubmitting(true);
    try {
      for (const itemId of itemIds) {
        await patchItemVerification(poId, itemId, Boolean(isVerified));
      }

      setSelectedCard((prev) => {
        if (!prev) return prev;
        const nextItems = (prev.items || []).map((it) =>
          it.purchaseOrderTableId != null ? { ...it, verified: Boolean(isVerified) } : it
        );
        return { ...prev, items: nextItems };
      });
      setSelectedItem((prev) => (prev ? { ...prev, verified: Boolean(isVerified) } : prev));
      window.alert(isVerified ? 'All items approved.' : 'All items marked as not approved.');
    } catch (e) {
      window.alert(e?.message || 'Failed to update all items.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPoCommonImages = () => {
    if (!selectedCard?.id) return;
    setSelectedItem({
      id: `common-${selectedCard.id}`,
      isPoLevel: true,
      purchaseOrderTableId: null,
      name: 'Common - entire purchase order',
      brand: '',
      type: '',
      category: '',
      categoryColor: 'text-[#4F5DFF]',
      categoryBg: 'bg-[#EEF0FF]',
      orderedQuantity: 0,
      verified: (selectedCard?.items || []).every((it) => it?.verified)
    });
    setActivePreviewIndex(0);
  };

  const handleConfirmRejection = async () => {
    if (!rejectionPopup.open) return;
    const text = String(rejectionPopup.text || '').trim();
    if (!text) {
      window.alert(rejectionPopup.mode === 'po' ? 'Please enter the rejection description.' : 'Please enter the rejection reason.');
      return;
    }

    if (!selectedCard?.id) return;
    const poId = Number(selectedCard.id);
    if (!Number.isFinite(poId)) return;

    setIsSubmitting(true);
    try {
      // Any rejection should reset PO-level verified/completed flags
      await patchPoFlag(poId, 'grn-verified', false);
      await patchPoFlag(poId, 'grn-completed', false);
      // Also reset request-send so it no longer appears in /grn-requested list
      await patchPoFlag(poId, 'grn-request', false);

      if (rejectionPopup.mode === 'item') {
        const itemId = Number(selectedItem?.purchaseOrderTableId);
        if (!Number.isFinite(itemId)) return;
        await patchItemRejectionReason(poId, itemId, text);
        await patchItemRejectionStatus(poId, itemId, true);
        await patchItemVerification(poId, itemId, false);
        setSelectedCard((prev) => {
          if (!prev) return prev;
          const nextItems = (prev.items || []).map((it) =>
            String(it.purchaseOrderTableId) === String(itemId) ? { ...it, verified: false } : it
          );
          return { ...prev, items: nextItems };
        });
        setSelectedItem((prev) => (prev ? { ...prev, verified: false } : prev));
      } else {
        const items = selectedCard?.items || [];
        const itemIds = items
          .map((it) => it?.purchaseOrderTableId)
          .filter((id) => id != null && Number.isFinite(Number(id)))
          .map((id) => Number(id));

        await patchPurchaseOrderDescription(poId, text);
        await patchPoGrnRejected(poId, true);
        for (const itemId of itemIds) {
          await patchItemRejectionStatus(poId, itemId, true);
          await patchItemVerification(poId, itemId, false);
        }
        setSelectedCard((prev) => {
          if (!prev) return prev;
          const nextItems = (prev.items || []).map((it) =>
            it.purchaseOrderTableId != null ? { ...it, verified: false } : it
          );
          return { ...prev, items: nextItems };
        });
        setSelectedItem((prev) => (prev ? { ...prev, verified: false } : prev));
        window.alert('All items rejected.');
      }
      setRejectionPopup({ open: false, mode: 'item', text: '' });
      // refresh list so rejected PO disappears without reload
      await refetchGrnRequestedPurchaseOrders();
      setSelectedCard(null);
      setSelectedItem(null);
    } catch (e) {
      window.alert(e?.message || 'Failed to reject.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!selectedCard?.id) return;
    const poId = Number(selectedCard.id);
    if (!Number.isFinite(poId)) return;
    const items = selectedCard?.items || [];
    const anyVerified = items.some((it) => it.verified);
    const allVerified = items.length > 0 && items.every((it) => it.verified);
    if (!anyVerified) {
      window.alert('Approve at least one item before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await patchPoFlag(poId, 'grn-verified', true);
      if (allVerified) {
        await patchPoFlag(poId, 'grn-completed', true);
      }
      window.alert(allVerified ? 'GRN Completed.' : 'GRN Verified.');
      // refresh list so status/tabs update without page reload
      await refetchGrnRequestedPurchaseOrders();
      setSelectedCard(null);
      setSelectedItem(null);
    } catch (e) {
      window.alert(e?.message || 'Failed to submit verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-[100vh] bg-white max-w-[360px] mx-auto overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        userRoles={user?.userRoles || []}
      />

      <Header
        title="Goods Recieved Note"
        user={user}
        onLogout={onLogout}
        onMenuClick={handleMenuClick}
      >
        <GoodsRecievedNotesTabs
          activeTab="verify"
          onTabChange={(tab) => navigate(tab === 'create' ? '/grn/create' : '/grn/verify')}
          leftLabel={selectedInchargeFilter || 'Engineer'}
          rightLabel={selectedVendorFilter || 'Vendor'}
          onLeftClick={() => setShowInchargeModal(true)}
          onRightClick={() => setShowVendorModal(true)}
        />
      </Header>

      {rejectionPopup.open ? (
        <div className="absolute inset-0 z-[9999] bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-[320px] rounded-[10px] bg-white p-4">
            <p className="text-[14px] font-semibold text-[#202020]">
              {rejectionPopup.mode === 'po' ? 'Reject Purchase Order' : 'Reject Item'}
            </p>
            <p className="mt-1 text-[12px] text-[#6B6B6B]">
              {rejectionPopup.mode === 'po'
                ? 'Enter description for rejecting the full purchase order.'
                : 'Enter reason for rejecting this item.'}
            </p>
            <textarea
              value={rejectionPopup.text}
              onChange={(e) => setRejectionPopup((prev) => ({ ...prev, text: e.target.value }))}
              className="mt-3 w-full h-[90px] rounded-[8px] border border-[#E0E0E0] p-2 text-[12px] outline-none"
              placeholder={rejectionPopup.mode === 'po' ? 'Enter description...' : 'Enter reason...'}
            />
            <div className="mt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setRejectionPopup({ open: false, mode: 'item', text: '' })}
                className="text-[13px] font-semibold text-[#6B6B6B] disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmRejection}
                className="text-[13px] font-semibold text-white bg-[#E4572E] px-3 py-2 rounded-[8px] disabled:opacity-40"
              >
                {isSubmitting ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-[126px] h-[calc(100vh-126px-80px)] overflow-y-auto no-scrollbar bg-white">
        <div className="pb-[16px]">
          {selectedCard ? (
            selectedItem ? (
              <>
                <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-[8px] mb-[8px]">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="flex items-center gap-[6px] text-[12px] font-medium text-[#202020]"
                  >
                    <span className="text-[15px] leading-none">&larr;</span>
                    Back
                  </button>
                  {activeStatus === 'Completed' ? null : selectedItem.isPoLevel ? (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSetAllItemsFromCommon(false)}
                        className="text-[13px] font-semibold text-[#E4572E] disabled:opacity-40"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSetAllItemsFromCommon(true)}
                        className="text-[13px] font-semibold text-[#13A14B] disabled:opacity-40"
                      >
                        {isSubmitting ? 'Approving…' : 'Approve'}
                      </button>
                    </div>
                  ) : selectedItem.verified ? (
                    <p className="text-[13px] font-semibold text-[#13A14B]">Approved</p>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleApproveReject(false)}
                        className="text-[13px] font-semibold text-[#E4572E] disabled:opacity-40"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleApproveReject(true)}
                        className="text-[13px] font-semibold text-[#13A14B] disabled:opacity-40"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>

                <div className="pb-[80px] text-left">
                  <p className="text-[10px] font-semibold text-[#202020]">{selectedCard.vendorName}</p>
                  <p className="mt-[2px] text-[10px] font-semibold text-[#202020]">{selectedCard.siteName}</p>

                  <div className="mt-[10px] h-[270px] rounded-[2px] bg-[#F0F0F0] flex items-center justify-center overflow-hidden">
                    {(() => {
                      const key = selectedItem.purchaseOrderTableId ? String(selectedItem.purchaseOrderTableId) : 'common';
                      const urls = grnImageUrlsByKey[key] || [];
                      const url = urls[activePreviewIndex] || urls[0] || '';
                      if (url) {
                        return <img src={url} alt={selectedItem.name} className="w-full h-full object-cover" />;
                      }
                      return (
                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="44" height="44" rx="4" fill="#D9D9D9" />
                          <path d="M10 31V13H34V31H10Z" fill="#BEBEBE" />
                          <path d="M13 28L20 21L25 25L29 20L31 22V28H13Z" fill="#9B9B9B" />
                          <circle cx="28.5" cy="17.5" r="2.5" fill="#F1F1F1" />
                        </svg>
                      );
                    })()}
                  </div>

                  <p className="mt-[5px] text-[10px] font-semibold text-[#202020]">
                    {[selectedItem.name, selectedItem.brand, selectedItem.type].filter(Boolean).join(' - ')}
                  </p>

                  {!selectedItem.isPoLevel ? (
                    <input
                      type="text"
                      value={grnQtyByKey[String(selectedItem.purchaseOrderTableId || '')] || ''}
                      readOnly
                      className="mt-[6px] w-full h-[32px] rounded-[4px] border border-[#D0D0D0] px-[10px] text-[12px] font-medium text-[#202020] placeholder:text-[#A7A7A7] focus:outline-none"
                    />
                  ) : null}

                  <div className="mt-[6px]">
                    <p className="text-[12px] font-semibold text-[#202020]">Description</p>
                    <textarea
                      value={(() => {
                        const key = selectedItem.purchaseOrderTableId ? String(selectedItem.purchaseOrderTableId) : 'common';
                        const descs = grnDescriptionsByKey[key] || [];
                        return descs[activePreviewIndex] || '';
                      })()}
                      readOnly
                      rows={4}
                      className="mt-[6px] w-full rounded-[4px] border border-[#D0D0D0] px-[10px] py-[10px] text-[12px] font-medium text-[#202020] placeholder:text-[#A7A7A7] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="mt-[8px] flex items-center gap-[6px] overflow-x-auto no-scrollbar">
                    {(() => {
                      const key = selectedItem.purchaseOrderTableId ? String(selectedItem.purchaseOrderTableId) : 'common';
                      const urls = grnImageUrlsByKey[key] || [];
                      return urls.map((url, idx) => (
                        <button
                          key={`${key}-thumb-${idx}`}
                          type="button"
                          onClick={() => setActivePreviewIndex(idx)}
                          className={`w-[40px] h-[40px] bg-[#EFEFEF] border flex-shrink-0 overflow-hidden ${
                            activePreviewIndex === idx ? 'border-[#4F5DFF]' : 'border-[#E2E2E2]'
                          }`}
                        >
                          <img src={url} alt={`${selectedItem.name} ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-[8px] mb-[10px]">
                  <button
                    type="button"
                    onClick={() => setSelectedCard(null)}
                    className="flex items-center gap-[6px] text-[12px] font-medium text-[#202020]"
                  >
                    <span className="text-[15px] leading-none">&larr;</span>
                    Back
                  </button>
                  {activeStatus !== 'Completed' ? (
                    <button
                      type="button"
                      onClick={handleSubmitVerification}
                      disabled={isSubmitting}
                      className="text-[12px] font-semibold text-[#202020] disabled:opacity-40"
                    >
                      {isSubmitting ? 'Submitting…' : 'Submit'}
                    </button>
                  ) : null}
                </div>

                <div className="mt-[8px] rounded-[6px] bg-[#F1F4F8] p-[4px] flex items-center gap-[6px]">
                  {statusTabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveStatus(tab)}
                      className={`flex-1 h-[28px] rounded-[4px] text-[12px] font-medium ${
                        activeStatus === tab ? 'bg-white text-[#202020] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]' : 'text-[#7D828B]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="mt-[10px] rounded-[10px] border border-[#A9A9A9] bg-white px-[12px] py-[10px]">
                  <div className="flex items-start mb-[8px]">
                    <p className="w-[110px] text-[12px] font-medium text-[#3F3F3F]">Vendor Name</p>
                    <p className="mx-[8px] text-[12px] font-medium text-black">:</p>
                    <p className="text-[12px] font-medium text-[#A6A6A6]">{selectedCard.vendorName}</p>
                  </div>
                  <div className="flex items-start mb-[8px]">
                    <p className="w-[110px] text-[12px] font-medium text-[#3F3F3F]">Project Name</p>
                    <p className="mx-[8px] text-[12px] font-medium text-black">:</p>
                    <p className="text-[12px] font-medium text-[#A6A6A6]">{selectedCard.siteName}</p>
                  </div>
                  <div className="flex items-start mb-[8px]">
                    <p className="w-[110px] text-[12px] font-medium text-[#3F3F3F]">Project Incharge</p>
                    <p className="mx-[8px] text-[12px] font-medium text-black">:</p>
                    <p className="text-[12px] font-medium text-[#A6A6A6]">{selectedCard.engineerName}</p>
                  </div>
                </div>

                <div className="mt-[12px] mb-[10px] flex items-center gap-[8px] border-b border-[#E0E0E0] pb-[8px]">
                  <p className="text-[14px] font-medium text-black">Items</p>
                  <div className="w-[24px] h-[24px] rounded-full bg-[#E2E2E2] flex items-center justify-center text-[12px] font-semibold text-black">
                    {selectedCard.items.length}
                  </div>
                </div>

                <div className="space-y-[10px] pb-[70px]">
                  {selectedCard.items.map((item) => {
                    const borderClass = item.verified ? 'border-[#13A14B]' : 'border-[#C89A43]';
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item);
                          setActivePreviewIndex(0);
                        }}
                        className={`w-full text-left rounded-[16px] border ${borderClass} bg-white px-[12px] py-[10px] shadow-[0px_1px_8px_rgba(0,0,0,0.04)]`}
                      >
                        <div className="flex items-start justify-between gap-[10px]">
                          <div className="min-w-0 space-y-[6px]">
                            <p className="text-[11px] font-semibold text-[#202020]">{item.name}</p>
                            <p className="text-[11px] font-medium text-[#202020]">{item.brand}</p>
                            <p className="text-[11px] font-medium text-[#202020]">{item.type}</p>
                          </div>

                          <div className="flex flex-col items-end gap-[6px] flex-shrink-0">
                            <div className={`inline-flex items-center rounded-full px-[10px] py-[4px] text-[10px] font-semibold ${item.categoryColor} ${item.categoryBg}`}>
                              {item.category || 'Category'}
                            </div>
                            <span className="text-[11px] font-medium text-[#202020] underline underline-offset-2">
                              Image
                            </span>
                            <span className="inline-flex items-center rounded-[4px] px-[8px] py-[4px] text-[11px] font-semibold text-[#202020]">
                              {grnQtyByKey[String(item.purchaseOrderTableId)] || 0}
                              <span className="text-[#BF9853]">/{item.orderedQuantity} Qty</span>
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {activeStatus !== 'Completed' ? (
                  <button
                    type="button"
                    onClick={handleOpenPoCommonImages}
                    className="fixed bottom-[106px] right-[18px] lg:right-[calc(50%-162px)] w-[48px] h-[48px] rounded-full bg-[#C89A43] text-white shadow-lg flex items-center justify-center"
                    title="Common images"
                  >
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 14V8M11 8L8.5 10.5M11 8L13.5 10.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6.5 14.5C4.84315 14.5 3.5 15.8431 3.5 17.5C3.5 19.1569 4.84315 20.5 6.5 20.5H15.5C17.1569 20.5 18.5 19.1569 18.5 17.5C18.5 15.8431 17.1569 14.5 15.5 14.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M11 2.5C6.30558 2.5 2.5 6.30558 2.5 11C2.5 12.4328 2.85449 13.7828 3.48076 14.9668" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : null}
              </>
            )
          ) : (
            <>
              <div className="mt-[8px] rounded-[6px] bg-[#F1F4F8] p-[4px] flex items-center gap-[6px]">
                {statusTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveStatus(tab)}
                    className={`flex-1 h-[28px] rounded-[4px] text-[12px] font-medium ${
                      activeStatus === tab ? 'bg-white text-[#202020] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]' : 'text-[#7D828B]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center gap-[4px] px-0 mt-[6px] mb-[8px] flex-shrink-0">
                <div className="flex items-center gap-[4px] min-w-0">
                  <button type="button" className="flex items-center gap-[4px] px-[6px] py-[2px] flex-shrink-0">
                    <img src={Filter} alt="Filter" className="w-[13px] h-[11px]" />
                    <span className="text-[12px] font-medium text-black flex-shrink-0">Filter</span>
                  </button>
                </div>
              </div>

              <div className="mt-[6px]">
                {filteredCards.map((card) => (
                  <button
                    type="button"
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px] w-full text-left"
                    style={{ marginBottom: '0px' }}
                  >
                    <div className="rounded-[8px] h-full px-3 py-[10px] cursor-pointer transition-all duration-300 ease-out select-none bg-white">
                      <div className="flex items-start justify-between mb-[2px]">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <p className="text-[12px] font-semibold leading-snug truncate text-black">{card.poNo}</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0 ml-2">
                          <span className={`px-[8px] py-[2px] rounded-full text-[10px] font-medium flex items-center gap-[4px] ${getStatusBadgeStyles(card.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotStyles(card.status)}`} />
                            {getStatusLabel(card.status)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start justify-between mb-[2px]">
                        <p className="text-[11px] leading-snug font-semibold truncate flex-1 min-w-0 text-black text-left">
                          {card.vendorName}
                        </p>
                        <p className="text-[11px] leading-snug flex-shrink-0 ml-2 truncate max-w-[40%] text-black">
                          {card.engineerName}
                        </p>
                      </div>
                      <div className="flex items-start justify-between mb-[2px]">
                        <p className="text-[11px] leading-snug font-semibold truncate flex-1 min-w-0 text-[#777777] text-left">
                          {card.siteName}
                        </p>
                        <p className="text-[11px] font-medium leading-snug text-black flex-shrink-0 ml-2">
                          No. of Items: {card.itemsCount}
                        </p>
                      </div>
                      <div className="flex items-start justify-between">
                        <p className="flex items-center gap-[2px] text-[11px] leading-normal min-w-0 flex-1">
                          <span className="font-bold text-black">{card.time.split(' - ')[0]}</span>
                          <span className="font-semibold text-[#9E9E9E]"> - {card.time.split(' - ')[1]}</span>
                        </p>
                        <p className="text-[12px] font-medium leading-snug flex-shrink-0 ml-2 text-black">&nbsp;</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <SelectVendorModal
        isOpen={showInchargeModal}
        onClose={() => setShowInchargeModal(false)}
        onSelect={(value) => {
          setSelectedInchargeFilter(value);
          setShowInchargeModal(false);
        }}
        selectedValue={selectedInchargeFilter}
        options={inchargeOptions}
        fieldName="Project Incharge"
      />

      <SelectVendorModal
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
        onSelect={(value) => {
          setSelectedVendorFilter(value);
          setShowVendorModal(false);
        }}
        selectedValue={selectedVendorFilter}
        options={vendorOptions}
        fieldName="Vendor"
      />

      <BottomNav activeTab="home" />
    </div>
  );
};

export default Verify;
