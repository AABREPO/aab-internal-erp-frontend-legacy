import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
const FILE_UPLOAD_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/files';
const GRN_IMAGES_BASE_URL = 'https://backendaab.in/demoAabuildersDash/api/grn-images';
/** Prefix for purchase-order-level (common) line placeholder; id is `${prefix}${poId}`. */
const GRN_PO_COMMON_ID_PREFIX = '__grn_po_common__:';
const uploadGrnFilesToBackend = async (files, { folder, fileNamePrefix } = {}) => {
  const uploadUrl = `${FILE_UPLOAD_BASE_URL}/upload`;
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  formData.append('folder', folder || 'FileUpload / GRN_Images');
  if (fileNamePrefix) formData.append('fileName', fileNamePrefix);
  const res = await fetch(uploadUrl, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[GRN files/upload] error', { status: res.status, statusText: res.statusText, body: text });
    throw new Error(text || `Upload failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const urls = Array.isArray(data?.urls) ? data.urls : [];
  return urls;
};
const saveGrnImageToApi = async (payload) => {
  const url = `${GRN_IMAGES_BASE_URL}/save`;
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const responseText = await res.text().catch(() => '');
  let responseBody = responseText;
  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    // keep as string
  }
  if (!res.ok) {
    console.error('[GRN grn-images/save] error response', {
      status: res.status,
      statusText: res.statusText,
      body: responseBody
    });
    const errMsg =
      typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
    throw new Error(errMsg || `Save GRN image failed: ${res.status} ${res.statusText}`);
  }
  return responseBody;
};
const fetchGrnImagesForPurchaseOrder = async (purchaseOrderId) => {
  const url = `${GRN_IMAGES_BASE_URL}?purchaseOrderId=${purchaseOrderId}`;
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const responseText = await res.text().catch(() => '');
  let responseBody = responseText;
  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    // keep as string
  }
  if (!res.ok) {
    console.error('[GRN grn-images/get] error response', {
      status: res.status,
      statusText: res.statusText,
      body: responseBody
    });
    const errMsg = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
    throw new Error(errMsg || `Fetch GRN images failed: ${res.status} ${res.statusText}`);
  }
  return Array.isArray(responseBody) ? responseBody : [];
};
const setGrnRequestSendStatus = async (purchaseOrderId, status) => {
  const url = `${basePurchaseOrdersUrl}/${purchaseOrderId}/grn-request?status=${status ? 'true' : 'false'}`;
  const res = await fetch(url, {
    method: 'PATCH',
    credentials: 'include'
  });
  const responseText = await res.text().catch(() => '');
  let responseBody = responseText;
  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    // keep as string
  }
  if (!res.ok) {
    console.error('[GRN purchase_orders/grn-request] error response', {
      status: res.status,
      statusText: res.statusText,
      body: responseBody
    });
    const errMsg = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
    throw new Error(errMsg || `Failed to update grn-request: ${res.status} ${res.statusText}`);
  }
  return responseBody;
};
/** One POST /api/grn-images/save per URL (description and quantity per row). */
const saveGrnRecordsFromSlots = async (urls, descriptions, { purchaseOrderId, isPoLevel, purchaseOrderTableId, quantityStr }) => {
  for (let i = 0; i < urls.length; i += 1) {
    const imageUrl = urls[i];
    if (!imageUrl) {
      throw new Error('Missing image URL for one of the slots.');
    }
    const description = descriptions[i] || '';
    const payload = {
      image_url: imageUrl,
      quantity: quantityStr ?? '',
      description,
      purchase_order_id: purchaseOrderId
    };
    if (!isPoLevel) {
      payload.purchase_order_table_id = purchaseOrderTableId;
    }
    await saveGrnImageToApi(payload);
  }
};
const buildGrnImageFileNamePrefix = ({ purchaseOrderId, purchaseOrderTableId, isPoLevel }) => {
  const safePart = (value) =>
    String(value ?? '')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 80);
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(now.getHours())}:${pad(
    now.getMinutes()
  )}:${pad(now.getSeconds())}`;
  if (isPoLevel) {
    return `GRN_PO_${safePart(purchaseOrderId) || 'po'}_${ts}`;
  }
  return `GRN_${safePart(purchaseOrderId) || 'po'}_row_${safePart(purchaseOrderTableId) || 'line'}_${ts}`;
};
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
  // If GRN verification was rejected, keep it in Review (not Pending)
  if (
    purchaseOrder?.grnVerificationRejected ||
    purchaseOrder?.grn_verification_rejected ||
    purchaseOrder?.is_grn_verification_rejected ||
    purchaseOrder?.isGrnVerificationRejected
  )
    return 'Review';
  // If GRN request has been sent, it should move out of Pending into Review.
  if (
    purchaseOrder?.grnRequestSend ||
    purchaseOrder?.grn_request_send ||
    purchaseOrder?.grnRequestSent ||
    purchaseOrder?.grn_request_sent ||
    purchaseOrder?.is_grn_request_send ||
    purchaseOrder?.is_grn_send_request ||
    purchaseOrder?.isGrnSendRequest
  )
    return 'Review';
  return 'Pending';
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
    const quantity = item?.quantity ?? item?.qty ?? 0;
    const itemName =
      item?.name ||
      item?.itemName ||
      findNameById(poItemName, item?.item_id || item?.itemId, ['itemName', 'poItemName', 'item_name']);
    const brand =
      item?.brand ||
      item?.brandName ||
      findNameById(poBrand, item?.brand_id || item?.brandId, ['brand', 'brandName']);
    const model =
      item?.model ||
      item?.modelName ||
      findNameById(poModel, item?.model_id || item?.modelId, ['model', 'modelName']);
    const type =
      item?.type ||
      item?.typeName ||
      item?.typeColor ||
      findNameById(poType, item?.type_id || item?.typeId, ['typeColor', 'type', 'typeName']);
    const rawTableRowId = item?.id ?? item?.purchaseOrderTableId ?? item?.purchase_order_table_id;
    const numericTableRowId =
      rawTableRowId !== undefined && rawTableRowId !== null
        ? Number(rawTableRowId)
        : null;
    const purchaseOrderTableId =
      numericTableRowId !== null && Number.isFinite(numericTableRowId) ? numericTableRowId : null;

    const rejectedReason = item?.rejectedReason ?? item?.rejected_reason ?? item?.rejectionReason ?? '';
    const isRejected = Boolean(
      item?.isRejected ??
        item?.is_rejected ??
        item?.rejected ??
        item?.is_reject ??
        item?.isRejectedItem ??
        false
    );
    return {
      id: item?.id || `item-${index}`,
      purchaseOrderTableId,
      name: itemName,
      brand,
      type: [model, type].filter(Boolean).join(', '),
      category,
      orderedQuantity: quantity,
      quantity: `${quantity}/${quantity} Qty`,
      isRejected,
      rejectedReason: rejectedReason ? String(rejectedReason) : '',
      categoryColor: category.toLowerCase().includes('paint') ? 'text-[#1EBD9D]' : 'text-[#4F5DFF]',
      categoryBg: category.toLowerCase().includes('paint') ? 'bg-[#E4FFF8]' : 'bg-[#EEF0FF]'
    };
  });
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
  const items = mapPurchaseOrderItems(
    purchaseOrder?.purchaseOrderTable ||
    purchaseOrder?.purchaseTable ||
    purchaseOrder?.poTable ||
    purchaseOrder?.items ||
    [],
    poItemName,
    poBrand,
    poModel,
    poType,
    categoryOptions
  );
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
    contact: purchaseOrder?.contact || purchaseOrder?.site_incharge_mobile_number || '',
    description: purchaseOrder?.description ?? '',
    isGrnVerificationRejected: Boolean(
      purchaseOrder?.grnVerificationRejected ??
        purchaseOrder?.grn_verification_rejected ??
        purchaseOrder?.is_grn_verification_rejected ??
        purchaseOrder?.is_grn_verification_reject ??
        purchaseOrder?.isGrnVerificationRejected ??
        false
    ),
    itemsCount: items.length,
    items
  };
  return mappedCard;
};
const Create = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('goods-recieved-notes');
  const [activeStatus, setActiveStatus] = useState('Pending');
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemMode, setSelectedItemMode] = useState('card');
  const [showQtyInput, setShowQtyInput] = useState(false);
  const [activeImageItemId, setActiveImageItemId] = useState(null);
  const [activePreviewImageIndex, setActivePreviewImageIndex] = useState({});
  const [receivedQuantities, setReceivedQuantities] = useState({});
  const [itemImageDescriptions, setItemImageDescriptions] = useState({});
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showInchargeModal, setShowInchargeModal] = useState(false);
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('');
  const [selectedInchargeFilter, setSelectedInchargeFilter] = useState('');
  const [selectedInchargeId, setSelectedInchargeId] = useState(null);
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
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const photosInputRef = useRef(null);
  /** Avoid stale state if onChange runs before activeImageItemId commits (same tick as file picker). */
  const grnFilePickerTargetRef = useRef(null);
  const [isSubmittingGrn, setIsSubmittingGrn] = useState(false);
  /** Server URLs from /api/files/upload (auto after picker); header Submit persists via /api/grn-images/save */
  const [grnUploadedImageUrls, setGrnUploadedImageUrls] = useState({});
  const [isUploadingGrn, setIsUploadingGrn] = useState(false);
  const [infoPopup, setInfoPopup] = useState({ open: false, title: '', message: '' });
  const grnUploadedImageUrlsRef = useRef({});
  useEffect(() => {
    grnUploadedImageUrlsRef.current = grnUploadedImageUrls;
  }, [grnUploadedImageUrls]);
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
  const cards = useMemo(() => {
    if (!selectedInchargeId) {
      return [];
    }
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
  }, [categoryOptions, employeeList, poBrand, poItemName, poModel, poType, purchaseOrders, selectedInchargeId, siteOptions, vendorNameOptions]);
  const filteredCards = useMemo(
    () =>
      cards.filter((card) => {
        const statusMatches = card.status === activeStatus;
        const vendorMatches = !selectedVendorFilter || card.vendorName === selectedVendorFilter;
        const inchargeMatches = !selectedInchargeFilter || card.engineerName === selectedInchargeFilter;
        return statusMatches && vendorMatches && inchargeMatches;
      }),
    [activeStatus, cards, selectedInchargeFilter, selectedVendorFilter]
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
  useEffect(() => {
    const fetchPoItemName = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_itemNames/getAll');
        if (response.ok) {
          const data = await response.json();
          setPoItemName(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching PO item names:', error);
      }
    };
    const fetchPoBrand = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_brand/getAll');
        if (response.ok) {
          const data = await response.json();
          setPoBrand(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching PO brands:', error);
      }
    };
    const fetchPoModel = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_model/getAll');
        if (response.ok) {
          const data = await response.json();
          setPoModel(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching PO models:', error);
      }
    };
    const fetchPoType = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_type/getAll');
        if (response.ok) {
          const data = await response.json();
          setPoType(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching PO types:', error);
      }
    };
    const fetchPoCategory = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/po_category/getAll');
        if (response.ok) {
          const data = await response.json();
          setCategoryOptions(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching PO categories:', error);
      }
    };
    fetchPoItemName();
    fetchPoBrand();
    fetchPoModel();
    fetchPoType();
    fetchPoCategory();
  }, []);
  useEffect(() => {
    const username = user?.username ? String(user.username).trim().toLowerCase() : '';
    if (!username) return;
    if (selectedInchargeId || selectedInchargeFilter) return;
    if (!Array.isArray(employeeList) || employeeList.length === 0) return;
    const matchedEmployee = employeeList.find((employee) => {
      const employeeUsername = employee.user_name || employee.userName || employee.username || '';
      return String(employeeUsername).trim().toLowerCase() === username;
    });
    if (!matchedEmployee) return;
    const resolvedName =
      matchedEmployee.employeeName ||
      matchedEmployee.name ||
      matchedEmployee.fullName ||
      matchedEmployee.employee_name ||
      '';
    if (!resolvedName) return;
    setSelectedInchargeFilter(resolvedName);
    setSelectedInchargeId(matchedEmployee.id || null);
  }, [employeeList, selectedInchargeFilter, selectedInchargeId, user]);
  useEffect(() => {
    setSelectedCard(null);
    setSelectedItem(null);
  }, [activeStatus, selectedVendorFilter, selectedInchargeFilter]);
  useEffect(() => {
    setSelectedItem(null);
  }, [selectedCard?.id]);

  const refetchPurchaseOrdersByIncharge = useCallback(async () => {
    if (!selectedInchargeId) {
      setPurchaseOrders([]);
      return;
    }
    try {
      const response = await fetch(`${basePurchaseOrdersUrl}/site-incharge/${selectedInchargeId}`, {
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
      console.error('Error fetching purchase orders by site incharge:', error);
      setPurchaseOrders([]);
    }
  }, [selectedInchargeId]);

  // When a PO card is opened, preload already-saved GRN images (and their descriptions/quantities)
  // from `grn_images_with_details` via GET /api/grn-images?purchaseOrderId=...
  useEffect(() => {
    const poId = selectedCard?.id != null ? Number(selectedCard.id) : null;
    if (!poId || !Number.isFinite(poId)) return;

    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchGrnImagesForPurchaseOrder(poId);
        if (cancelled) return;

        const urlsByKey = {};
        const descByKey = {};
        const qtyByLineId = {};

        const commonKey = `${GRN_PO_COMMON_ID_PREFIX}${poId}-common`;

        rows.forEach((r) => {
          const url = r?.image_url ?? r?.imageUrl ?? '';
          if (!url) return;
          const description = r?.description ?? '';
          const qty = r?.quantity ?? '';
          const tableIdRaw = r?.purchase_order_table_id ?? r?.purchaseOrderTableId ?? null;
          const tableId = tableIdRaw != null && tableIdRaw !== '' ? Number(tableIdRaw) : null;

          const key = tableId && Number.isFinite(tableId) ? `${tableId}-card` : commonKey;
          if (!urlsByKey[key]) urlsByKey[key] = [];
          if (!descByKey[key]) descByKey[key] = [];
          const idx = urlsByKey[key].length;
          urlsByKey[key].push(url);
          descByKey[key][idx] = description;

          if (tableId && Number.isFinite(tableId) && qty && qtyByLineId[tableId] == null) {
            qtyByLineId[tableId] = String(qty);
          }
        });

        setGrnUploadedImageUrls((prev) => ({ ...prev, ...urlsByKey }));
        grnUploadedImageUrlsRef.current = { ...grnUploadedImageUrlsRef.current, ...urlsByKey };
        setItemImageDescriptions((prev) => ({ ...prev, ...descByKey }));
        setReceivedQuantities((prev) => {
          const next = { ...prev };
          Object.entries(qtyByLineId).forEach(([tableId, qty]) => {
            // Use the item id (which is the purchaseOrderTableId in this screen) for quantity mapping.
            if (next[tableId] == null || String(next[tableId]).trim() === '') {
              next[tableId] = qty;
            }
          });
          return next;
        });
      } catch (e) {
        console.error('Failed to preload GRN images for PO', poId, e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedCard?.id]);
  useEffect(() => {
    refetchPurchaseOrdersByIncharge();
  }, [refetchPurchaseOrdersByIncharge]);
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
  const openImagePickerSheet = (itemId) => {
    grnFilePickerTargetRef.current = { itemId, mode: selectedItemMode };
    setActiveImageItemId(itemId);
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };
  const handleOpenItemDetails = (item, showQty = true, mode = 'card') => {
    setSelectedItem(item);
    setSelectedItemMode(mode);
    setShowQtyInput(showQty);
  };
  const handleCloseItemDetails = () => {
    setSelectedItem(null);
    setShowQtyInput(false);
    setSelectedItemMode('card');
  };
  const handleImageSelection = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) return;
    if (!selectedCard?.id || !selectedItem) return;
    const picker = grnFilePickerTargetRef.current;
    const itemId = picker?.itemId ?? activeImageItemId;
    const mode = picker?.mode ?? selectedItemMode;
    if (!itemId) return;
    const imageKey = `${itemId}-${mode}`;
    const existingUrls = grnUploadedImageUrlsRef.current[imageKey] || [];
    const room = Math.max(0, 5 - existingUrls.length);
    const filesToUpload = files.slice(0, room);
    if (filesToUpload.length === 0) {
      window.alert('You can add at most 5 images per line.');
      return;
    }
    const purchaseOrderId = Number(selectedCard.id);
    if (!Number.isFinite(purchaseOrderId)) {
      window.alert('Invalid purchase order id.');
      return;
    }
    const isPoLevel = Boolean(selectedItem.isPoLevel);
    setIsUploadingGrn(true);
    try {
      const newUrls = await uploadGrnFilesToBackend(filesToUpload, {
        folder: 'FileUpload / GRN_Images',
        fileNamePrefix: buildGrnImageFileNamePrefix({
          purchaseOrderId,
          purchaseOrderTableId: selectedItem.purchaseOrderTableId,
          isPoLevel
        })
      });
      if (newUrls.length !== filesToUpload.length) {
        throw new Error('Upload did not return a URL for every file.');
      }
      const merged = [...existingUrls, ...newUrls];
      setGrnUploadedImageUrls((prev) => ({ ...prev, [imageKey]: merged }));
      grnUploadedImageUrlsRef.current = { ...grnUploadedImageUrlsRef.current, [imageKey]: merged };
      const previewIdx = merged.length - 1;
      setActivePreviewImageIndex((prev) => ({
        ...prev,
        [imageKey]: previewIdx >= 0 ? previewIdx : 0
      }));
    } catch (error) {
      console.error('GRN auto-upload error:', error);
      window.alert(error?.message || 'Failed to upload image.');
    } finally {
      setIsUploadingGrn(false);
    }
  };
  const currentImageKey = selectedItem ? `${selectedItem.id}-${selectedItemMode}` : null;
  const handleOpenPoCommonImages = () => {
    if (!selectedCard) return;
    const poLevelItem = {
      id: `${GRN_PO_COMMON_ID_PREFIX}${selectedCard.id}`,
      isPoLevel: true,
      purchaseOrderTableId: null,
      name: 'Common - entire purchase order',
      brand: '',
      type: '',
      orderedQuantity: 0
    };
    handleOpenItemDetails(poLevelItem, false, 'common');
  };
  /** Item-detail header Submit: POST /api/grn-images/save for the open line only. */
  const handleSaveGrnImagesToBackend = async () => {
    if (!selectedCard?.id || !selectedItem || !currentImageKey) return;
    const urls = grnUploadedImageUrls[currentImageKey] || [];
    if (urls.length === 0) {
      window.alert('Add at least one image using + (images upload automatically).');
      return;
    }
    const isPoLevel = Boolean(selectedItem.isPoLevel);
    if (!isPoLevel && (selectedItem.purchaseOrderTableId == null || Number.isNaN(selectedItem.purchaseOrderTableId))) {
      window.alert('This line item has no table id from the server. Save is blocked until the PO row id is available.');
      return;
    }
    const purchaseOrderId = Number(selectedCard.id);
    if (!Number.isFinite(purchaseOrderId)) {
      window.alert('Invalid purchase order id.');
      return;
    }
    const descriptions = itemImageDescriptions[currentImageKey] || [];
    const quantityStr = isPoLevel ? '' : String(receivedQuantities[selectedItem.id] ?? '').trim();
    setIsSubmittingGrn(true);
    try {
      await saveGrnRecordsFromSlots(urls, descriptions, {
        purchaseOrderId,
        isPoLevel,
        purchaseOrderTableId: selectedItem.purchaseOrderTableId,
        quantityStr
      });
      // mark GRN request sent after successful save
      await setGrnRequestSendStatus(purchaseOrderId, true);
      setGrnUploadedImageUrls((prev) => ({ ...prev, [currentImageKey]: [] }));
      grnUploadedImageUrlsRef.current = { ...grnUploadedImageUrlsRef.current, [currentImageKey]: [] };
      setItemImageDescriptions((prev) => ({ ...prev, [currentImageKey]: [] }));
      setActivePreviewImageIndex((prev) => ({ ...prev, [currentImageKey]: 0 }));
      window.alert('Images saved successfully.');
      handleCloseItemDetails();
      // refresh list so status/tabs update without page reload
      refetchPurchaseOrdersByIncharge();
    } catch (error) {
      console.error('GRN image save error:', error);
      window.alert(error?.message || 'Failed to save images.');
    } finally {
      setIsSubmittingGrn(false);
    }
  };
  /** PO card view Submit: save every line (and common PO images) that has uploaded URLs. */
  const handleSubmitAllGrnForSelectedCard = async () => {
    if (!selectedCard?.id) return;
    const purchaseOrderId = Number(selectedCard.id);
    if (!Number.isFinite(purchaseOrderId)) {
      window.alert('Invalid purchase order id.');
      return;
    }
    const commonKey = `${GRN_PO_COMMON_ID_PREFIX}${selectedCard.id}-common`;
    const tasks = [];
    const commonUrls = grnUploadedImageUrls[commonKey] || [];
    if (commonUrls.length > 0) {
      tasks.push({
        key: commonKey,
        urls: commonUrls,
        descriptions: itemImageDescriptions[commonKey] || [],
        opts: {
          purchaseOrderId,
          isPoLevel: true,
          purchaseOrderTableId: null,
          quantityStr: ''
        }
      });
    }
    for (const item of selectedCard.items) {
      const key = `${item.id}-card`;
      const urls = grnUploadedImageUrls[key] || [];
      if (urls.length === 0) continue;
      if (item.purchaseOrderTableId == null || Number.isNaN(item.purchaseOrderTableId)) {
        window.alert(`Cannot save images for "${item.name}": missing purchase order line id.`);
        return;
      }
      const quantityStr = String(receivedQuantities[item.id] ?? '').trim();
      tasks.push({
        key,
        urls,
        descriptions: itemImageDescriptions[key] || [],
        opts: {
          purchaseOrderId,
          isPoLevel: false,
          purchaseOrderTableId: item.purchaseOrderTableId,
          quantityStr
        }
      });
    }
    if (tasks.length === 0) {
      window.alert('No uploaded images to save. Open Image on each item (or use the common upload) first.');
      return;
    }
    setIsSubmittingGrn(true);
    try {
      const keysToClear = [];
      for (const t of tasks) {
        await saveGrnRecordsFromSlots(t.urls, t.descriptions, t.opts);
        keysToClear.push(t.key);
      }
      // mark GRN request sent after successful batch save
      await setGrnRequestSendStatus(purchaseOrderId, true);
      setGrnUploadedImageUrls((prev) => {
        const next = { ...prev };
        keysToClear.forEach((k) => {
          next[k] = [];
        });
        return next;
      });
      const refNext = { ...grnUploadedImageUrlsRef.current };
      keysToClear.forEach((k) => {
        refNext[k] = [];
      });
      grnUploadedImageUrlsRef.current = refNext;
      setItemImageDescriptions((prev) => {
        const next = { ...prev };
        keysToClear.forEach((k) => {
          next[k] = [];
        });
        return next;
      });
      setActivePreviewImageIndex((prev) => {
        const next = { ...prev };
        keysToClear.forEach((k) => {
          next[k] = 0;
        });
        return next;
      });
      window.alert('All images saved successfully.');
      // refresh list so status/tabs update without page reload
      refetchPurchaseOrdersByIncharge();
    } catch (error) {
      console.error('GRN batch save error:', error);
      window.alert(error?.message || 'Failed to save images.');
    } finally {
      setIsSubmittingGrn(false);
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
          activeTab="create"
          onTabChange={(tab) => navigate(tab === 'create' ? '/grn/create' : '/grn/verify')}
          leftLabel={selectedInchargeFilter || 'Engineer'}
          rightLabel={selectedVendorFilter || 'Vendor'}
          onLeftClick={() => setShowInchargeModal(true)}
          onRightClick={() => setShowVendorModal(true)}
        />
      </Header>

      {infoPopup.open ? (
        <div className="absolute inset-0 z-[9999] bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-[320px] rounded-[10px] bg-white p-4">
            <p className="text-[14px] font-semibold text-[#202020]">{infoPopup.title || 'Info'}</p>
            <div className="mt-2 max-h-[220px] overflow-y-auto whitespace-pre-wrap text-[12px] text-[#3F3F3F]">
              {infoPopup.message || ''}
            </div>
            <div className="mt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setInfoPopup({ open: false, title: '', message: '' })}
                className="text-[13px] font-semibold text-white bg-[#202020] px-3 py-2 rounded-[8px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-[126px] h-[calc(100vh-126px-80px)] overflow-y-auto no-scrollbar bg-white">
        <div className="pb-[16px]">
          {selectedCard ? (
            <>
              {selectedItem ? (
                <>
                  <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-[8px] mb-[8px]">
                    <button type="button" onClick={handleCloseItemDetails}
                      className="flex items-center gap-[6px] text-[12px] font-medium text-[#202020]"
                    >
                      <span className="text-[15px] leading-none">&larr;</span>
                      Back
                    </button>
                    <div className="flex items-center gap-3">
                      {activeStatus !== 'Completed' ? (
                        <button
                          type="button"
                          onClick={handleSaveGrnImagesToBackend}
                          disabled={isSubmittingGrn}
                          className="text-[12px] font-semibold text-[#202020] disabled:opacity-40"
                        >
                          {isSubmittingGrn ? 'Saving…' : 'Submit'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="pb-[80px] text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-[#202020]">{selectedCard.vendorName}</p>
                        <p className="mt-[2px] text-[10px] font-semibold text-[#202020]">{selectedCard.siteName}</p>
                      </div>
                      {selectedItem?.isRejected && String(selectedItem?.rejectedReason || '').trim() ? (
                        <button
                          type="button"
                          onClick={() =>
                            setInfoPopup({
                              open: true,
                              title: 'Rejection Reason',
                              message: String(selectedItem?.rejectedReason || '')
                            })
                          }
                          className="shrink-0 text-[12px] font-semibold text-[#E4572E] underline underline-offset-2"
                        >
                          View Reason
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-[10px] h-[270px] rounded-[2px] bg-[#F0F0F0] flex items-center justify-center overflow-hidden relative">
                      {isUploadingGrn && (
                        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-black/20 text-[12px] font-semibold text-white">
                          Uploading…
                        </div>
                      )}
                      {(() => {
                        const urls = grnUploadedImageUrls[currentImageKey] || [];
                        const idx = activePreviewImageIndex[currentImageKey] || 0;
                        if (idx < urls.length && urls[idx]) {
                          return (
                            <img src={urls[idx]} alt={selectedItem.name} className="w-full h-full object-cover" />
                          );
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
                    {showQtyInput && (
                      <input
                        type="text"
                        value={receivedQuantities[selectedItem.id] || ''}
                        readOnly={activeStatus === 'Completed'}
                        onChange={(e) =>
                          setReceivedQuantities((prev) => ({
                            ...prev,
                            [selectedItem.id]: e.target.value
                          }))
                        }
                        placeholder="Received Quantity"
                        className="mt-[6px] w-full h-[32px] rounded-[4px] border border-[#D0D0D0] px-[10px] text-[12px] font-medium text-[#202020] placeholder:text-[#A7A7A7] focus:outline-none"
                      />
                    )}
                    <div className="mt-[6px]">
                      <p className="text-[12px] font-semibold text-[#202020]">Description</p>
                      <textarea
                        value={itemImageDescriptions[currentImageKey]?.[activePreviewImageIndex[currentImageKey] || 0] || ''}
                        onChange={(e) => {
                          if (activeStatus === 'Completed') return;
                          const currentImageIndex = activePreviewImageIndex[currentImageKey] || 0;
                          setItemImageDescriptions((prev) => {
                            const itemDescriptions = prev[currentImageKey] || [];
                            const updatedDescriptions = [...itemDescriptions];
                            updatedDescriptions[currentImageIndex] = e.target.value;
                            return {
                              ...prev,
                              [currentImageKey]: updatedDescriptions
                            };
                          });
                        }}
                        placeholder="Enter Your Description"
                        rows={4}
                        readOnly={activeStatus === 'Completed'}
                        className="mt-[6px] w-full rounded-[4px] border border-[#D0D0D0] px-[10px] py-[10px] text-[12px] font-medium text-[#202020] placeholder:text-[#A7A7A7] focus:outline-none resize-none"
                      />
                    </div>
                    <div className="mt-[8px] flex items-center gap-[6px] overflow-x-auto no-scrollbar">
                      {(grnUploadedImageUrls[currentImageKey] || []).map((url, index) => (
                        <button
                          key={`${selectedItem.id}-url-thumb-${index}`}
                          type="button"
                          onClick={() =>
                            setActivePreviewImageIndex((prev) => ({
                              ...prev,
                              [currentImageKey]: index
                            }))
                          }
                          className={`w-[40px] h-[40px] bg-[#EFEFEF] border flex-shrink-0 overflow-hidden ${(activePreviewImageIndex[currentImageKey] || 0) === index ? 'border-[#4F5DFF]' : 'border-[#E2E2E2]'
                            }`}
                        >
                          <img src={url} alt={`${selectedItem.name} ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => openImagePickerSheet(selectedItem.id)}
                        disabled={
                          activeStatus === 'Completed' ||
                          isUploadingGrn ||
                          (grnUploadedImageUrls[currentImageKey] || []).length >= 5
                        }
                        className="w-[40px] h-[40px] bg-[#EFEFEF] flex items-center justify-center text-[#BEBEBE] text-[32px] leading-none flex-shrink-0 disabled:opacity-40"
                      >
                        +
                      </button>
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
                      onClick={handleSubmitAllGrnForSelectedCard}
                      disabled={isSubmittingGrn || isUploadingGrn}
                      className="text-[12px] font-semibold text-[#202020] disabled:opacity-40"
                    >
                      {isSubmittingGrn ? 'Saving…' : 'Submit'}
                    </button>
                  ) : null}
                  </div>
                  <div className="mt-[8px] rounded-[6px] bg-[#F1F4F8] p-[4px] flex items-center gap-[6px]">
                    {statusTabs.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveStatus(tab)}
                        className={`flex-1 h-[28px] rounded-[4px] text-[12px] font-medium ${activeStatus === tab ? 'bg-white text-[#202020] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]' : 'text-[#7D828B]'
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
                    <div className="flex items-start">
                      <p className="w-[110px] text-[12px] font-medium text-[#3F3F3F]">Contact</p>
                      <p className="mx-[8px] text-[12px] font-medium text-black">:</p>
                      <p className="text-[12px] font-medium text-[#A6A6A6]">{selectedCard.contact}</p>
                    </div>
                  </div>
                  <div className="mt-[12px] mb-[10px] flex items-center gap-[8px] border-b border-[#E0E0E0] pb-[8px]">
                    <p className="text-[14px] font-medium text-black">Items</p>
                    <div className="w-[24px] h-[24px] rounded-full bg-[#E2E2E2] flex items-center justify-center text-[12px] font-semibold text-black">
                      {selectedCard.items.length}
                    </div>
                    {selectedCard.isGrnVerificationRejected && String(selectedCard.description || '').trim() ? (
                      <button
                        type="button"
                        onClick={() =>
                          setInfoPopup({
                            open: true,
                            title: 'Rejection Reason',
                            message: String(selectedCard.description || '')
                          })
                        }
                        className="ml-auto text-[11px] font-semibold text-[#E4572E] underline underline-offset-2"
                      >
                        View Reason
                      </button>
                    ) : null}
                  </div>
                  <div className="space-y-[10px] pb-[70px]">
                    {selectedCard.items.map((item) => (
                      <div key={item.id} className="rounded-[16px] border border-[#EFE7DD] bg-white px-[12px] py-[10px] shadow-[0px_1px_8px_rgba(0,0,0,0.04)]">
                        <div className="space-y-[6px]">
                          <div className="flex items-center justify-between gap-[10px]">
                            <p className="text-[11px] font-semibold text-[#202020]">{item.name}</p>
                            <div className={`inline-flex items-center rounded-full px-[10px] py-[4px] text-[10px] font-semibold ${item.categoryColor} ${item.categoryBg}`}>
                              {item.category}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-[10px]">
                            <p className="text-[11px] font-medium text-[#202020]">{item.brand}</p>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleOpenItemDetails(item, true, 'card')}
                                className={`text-[11px] font-medium text-[#202020] ${grnUploadedImageUrls[`${item.id}-card`]?.length ? 'underline underline-offset-2' : ''
                                  }`}
                              >
                                Image
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-[10px]">
                            <p className="text-[11px] font-medium text-[#202020]">{item.type}</p>
                            <div className="flex items-center gap-[8px]">
                              <span className="flex-1 border-b border-dashed border-[#9E9E9E]" />
                              <span className="inline-flex items-center rounded-[4px] px-[8px] py-[4px] text-[11px] font-semibold text-[#202020]">
                                {receivedQuantities[item.id] || 0}
                                <span className="text-[#BF9853]">/{item.orderedQuantity} Qty</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={handleOpenPoCommonImages}
                    className="fixed bottom-[106px] right-[18px] lg:right-[calc(50%-162px)] w-[48px] h-[48px] rounded-full bg-[#C89A43] text-white shadow-lg flex items-center justify-center"
                  >
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 14V8M11 8L8.5 10.5M11 8L13.5 10.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6.5 14.5C4.84315 14.5 3.5 15.8431 3.5 17.5C3.5 19.1569 4.84315 20.5 6.5 20.5H15.5C17.1569 20.5 18.5 19.1569 18.5 17.5C18.5 15.8431 17.1569 14.5 15.5 14.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M11 2.5C6.30558 2.5 2.5 6.30558 2.5 11C2.5 12.4328 2.85449 13.7828 3.48076 14.9668" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <div className="mt-[8px] rounded-[6px] bg-[#F1F4F8] p-[4px] flex items-center gap-[6px]">
                {statusTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveStatus(tab)}
                    className={`flex-1 h-[28px] rounded-[4px] text-[12px] font-medium ${activeStatus === tab ? 'bg-white text-[#202020] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]' : 'text-[#7D828B]'
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
                    key={card.id} type="button" onClick={() => setSelectedCard(card)}
                    className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[16px] w-full max-w-full text-left"
                    style={{ marginBottom: '0px' }}
                  >
                    <div className="rounded-[16px] h-full px-3 py-[10px] cursor-pointer transition-all duration-300 ease-out select-none bg-white">
                      <div className="flex items-start justify-between mb-[2px]">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <p className="text-[12px] font-semibold leading-snug truncate text-black">
                            {card.poNo}
                          </p>
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
                        <p className="text-[12px] font-medium leading-snug flex-shrink-0 ml-2 text-black">
                          &nbsp;
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleImageSelection}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageSelection}
      />
      <input
        ref={photosInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageSelection}
      />
      <SelectVendorModal
        isOpen={showInchargeModal}
        onClose={() => setShowInchargeModal(false)}
        onSelect={(value) => {
          const selectedEmployee = employeeList.find((employee) => {
            const employeeName = employee.employeeName || employee.name || employee.fullName || employee.employee_name || '';
            return employeeName === value;
          });
          setSelectedInchargeFilter(value);
          setSelectedInchargeId(selectedEmployee?.id || null);
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
export default Create;