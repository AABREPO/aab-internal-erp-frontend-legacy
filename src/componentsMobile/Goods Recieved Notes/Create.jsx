import React, { useEffect, useMemo, useRef, useState } from 'react';
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
const basePurchaseOrdersUrl = 'https://backendaab.in/aabuildersDash/api/purchase_orders';

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
  if (purchaseOrder?.grnCompleted || purchaseOrder?.grn_completed || purchaseOrder?.is_Grn_completed) return 'Completed';
  if (purchaseOrder?.grnVerified || purchaseOrder?.grn_verified || purchaseOrder?.is_grn_verified) return 'Review';
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

    return {
      id: item?.id || `item-${index}`,
      name: itemName,
      brand,
      type: [model, type].filter(Boolean).join(', '),
      category,
      orderedQuantity: quantity,
      quantity: `${quantity}/${quantity} Qty`,
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
    itemsCount: items.length,
    items
  };

  console.log('GRN Create mapped purchase order card:', {
    rawPurchaseOrder: purchaseOrder,
    mappedCard
  });

  return mappedCard;
};

const Create = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('goods-recieved-notes');
  const [activeStatus, setActiveStatus] = useState('Pending');
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showImagePickerSheet, setShowImagePickerSheet] = useState(false);
  const [activeImageItemId, setActiveImageItemId] = useState(null);
  const [selectedImages, setSelectedImages] = useState({});
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
        const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll', {
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
        const response = await fetch('https://backendaab.in/aabuilderDash/api/project_Names/getAll', {
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
          fetch('https://backendaab.in/aabuildersDash/api/employee_details/site_engineers', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          }),
          fetch('https://backendaab.in/aabuildersDash/api/support_staff/getAll', {
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
        const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
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
        const response = await fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll');
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
        const response = await fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll');
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
        const response = await fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll');
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
        const response = await fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll');
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

    console.log('GRN Create auto-selected engineer from login:', {
      username,
      matchedEmployee
    });

    setSelectedInchargeFilter(resolvedName);
    setSelectedInchargeId(matchedEmployee.id || null);
  }, [employeeList, selectedInchargeFilter, selectedInchargeId, user]);

  useEffect(() => {
    setSelectedCard(null);
    setSelectedItem(null);
  }, [activeStatus, selectedVendorFilter, selectedInchargeFilter]);

  useEffect(() => {
    const fetchPurchaseOrdersByIncharge = async () => {
      if (!selectedInchargeId) {
        setPurchaseOrders([]);
        return;
      }

      try {
        console.log('GRN Create fetching purchase orders for site incharge:', {
          selectedInchargeId,
          selectedInchargeFilter
        });

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
        console.log('GRN Create site-incharge API response:', data);
        setPurchaseOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching purchase orders by site incharge:', error);
        setPurchaseOrders([]);
      }
    };

    fetchPurchaseOrdersByIncharge();
  }, [selectedInchargeId]);

  useEffect(() => {
    if (!selectedInchargeId) return;

    console.log(
      'GRN Create mapped cards state:',
      purchaseOrders.map((purchaseOrder) =>
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
      )
    );
  }, [categoryOptions, employeeList, poBrand, poItemName, poModel, poType, purchaseOrders, selectedInchargeId, siteOptions, vendorNameOptions]);

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
    const isDesktopView = typeof window !== 'undefined' && window.innerWidth > 768;

    if (isDesktopView) {
      setActiveImageItemId(itemId);
      if (galleryInputRef.current) {
        galleryInputRef.current.click();
      }
      return;
    }

    setActiveImageItemId(itemId);
    setShowImagePickerSheet(true);
  };

  const handleOpenItemDetails = (item) => {
    setSelectedItem(item);
  };

  const handleCloseItemDetails = () => {
    setSelectedItem(null);
  };

  const closeImagePickerSheet = () => {
    setShowImagePickerSheet(false);
    setActiveImageItemId(null);
  };

  const handlePickSource = (source) => {
    if (source === 'camera' && cameraInputRef.current) {
      cameraInputRef.current.click();
      return;
    }
    if (source === 'gallery' && galleryInputRef.current) {
      galleryInputRef.current.click();
      return;
    }
    if (source === 'photos' && photosInputRef.current) {
      photosInputRef.current.click();
    }
  };

  const handleImageSelection = (event) => {
    const files = Array.from(event.target.files || []);
    if (!activeImageItemId || files.length === 0) {
      closeImagePickerSheet();
      return;
    }

    setSelectedImages((prev) => {
      const existingFiles = prev[activeImageItemId] || [];
      const nextFiles = [...existingFiles, ...files].slice(0, 5);

      return {
        ...prev,
        [activeImageItemId]: nextFiles
      };
    });
    setActivePreviewImageIndex((prev) => {
      const existingFiles = selectedImages[activeImageItemId] || [];
      return {
        ...prev,
        [activeImageItemId]: existingFiles.length
      };
    });
    event.target.value = '';
    closeImagePickerSheet();
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

      <div className="mt-[126px] h-[calc(100vh-126px-80px)] overflow-y-auto no-scrollbar bg-white">
        <div className="pb-[16px]">
          {selectedCard ? (
            <>
              {selectedItem ? (
                <>
                  <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-[8px] mb-[8px]">
                    <button
                      type="button"
                      onClick={handleCloseItemDetails}
                      className="flex items-center gap-[6px] text-[12px] font-medium text-[#202020]"
                    >
                      <span className="text-[15px] leading-none">&larr;</span>
                      Back
                    </button>
                    <button type="button" className="text-[12px] font-semibold text-[#202020]">
                      Submit
                    </button>
                  </div>

                  <div className="pb-[88px]">
                    <p className="text-[12px] font-semibold text-[#202020]">{selectedCard.vendorName}</p>
                    <p className="mt-[2px] text-[12px] font-medium text-[#202020]">{selectedCard.siteName}</p>

                    <div className="mt-[10px] h-[270px] rounded-[2px] bg-[#F0F0F0] flex items-center justify-center overflow-hidden">
                      {selectedImages[selectedItem.id]?.[activePreviewImageIndex[selectedItem.id] || 0] ? (
                        <img
                          src={URL.createObjectURL(selectedImages[selectedItem.id][activePreviewImageIndex[selectedItem.id] || 0])}
                          alt={selectedItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="44" height="44" rx="4" fill="#D9D9D9" />
                          <path d="M10 31V13H34V31H10Z" fill="#BEBEBE" />
                          <path d="M13 28L20 21L25 25L29 20L31 22V28H13Z" fill="#9B9B9B" />
                          <circle cx="28.5" cy="17.5" r="2.5" fill="#F1F1F1" />
                        </svg>
                      )}
                    </div>

                    <p className="mt-[10px] text-[12px] font-medium text-[#202020]">
                      {[selectedItem.name, selectedItem.brand, selectedItem.type].filter(Boolean).join(' - ')}
                    </p>

                    <input
                      type="text"
                      value={receivedQuantities[selectedItem.id] || ''}
                      onChange={(e) =>
                        setReceivedQuantities((prev) => ({
                          ...prev,
                          [selectedItem.id]: e.target.value
                        }))
                      }
                      placeholder="Received Quantity"
                      className="mt-[10px] w-full h-[32px] rounded-[4px] border border-[#D0D0D0] px-[10px] text-[12px] font-medium text-[#202020] placeholder:text-[#A7A7A7] focus:outline-none"
                    />

                    <div className="mt-[8px]">
                      <p className="text-[12px] font-medium text-[#202020]">Description</p>
                      <textarea
                        value={itemImageDescriptions[selectedItem.id]?.[activePreviewImageIndex[selectedItem.id] || 0] || ''}
                        onChange={(e) => {
                          const currentImageIndex = activePreviewImageIndex[selectedItem.id] || 0;
                          setItemImageDescriptions((prev) => {
                            const itemDescriptions = prev[selectedItem.id] || [];
                            const updatedDescriptions = [...itemDescriptions];
                            updatedDescriptions[currentImageIndex] = e.target.value;
                            return {
                              ...prev,
                              [selectedItem.id]: updatedDescriptions
                            };
                          });
                        }}
                        placeholder="Enter Your Description"
                        rows={4}
                        className="mt-[6px] w-full rounded-[4px] border border-[#D0D0D0] px-[10px] py-[10px] text-[12px] font-medium text-[#202020] placeholder:text-[#A7A7A7] focus:outline-none resize-none"
                      />
                    </div>

                    <div className="mt-[8px] flex items-center gap-[6px] overflow-x-auto no-scrollbar">
                      {(selectedImages[selectedItem.id] || []).map((imageFile, index) => (
                        <button
                          key={`${selectedItem.id}-thumb-${index}`}
                          type="button"
                          onClick={() =>
                            setActivePreviewImageIndex((prev) => ({
                              ...prev,
                              [selectedItem.id]: index
                            }))
                          }
                          className={`w-[40px] h-[40px] bg-[#EFEFEF] border flex-shrink-0 overflow-hidden ${
                            (activePreviewImageIndex[selectedItem.id] || 0) === index ? 'border-[#4F5DFF]' : 'border-[#E2E2E2]'
                          }`}
                        >
                          <img
                            src={URL.createObjectURL(imageFile)}
                            alt={`${selectedItem.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => openImagePickerSheet(selectedItem.id)}
                        className="w-[40px] h-[40px] bg-[#EFEFEF] flex items-center justify-center text-[#BEBEBE] text-[32px] leading-none flex-shrink-0"
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
                    <button type="button" className="text-[12px] font-semibold text-[#202020]">
                      Submit
                    </button>
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
                  </div>

                  <div className="space-y-[10px] pb-[70px]">
                    {selectedCard.items.map((item) => (
                      <div key={item.id} className="rounded-[16px] border border-[#EFE7DD] bg-white px-[12px] py-[10px] shadow-[0px_1px_8px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start justify-between gap-[10px]">
                          <div>
                            <p className="text-[11px] font-semibold text-[#202020]">{item.name}</p>
                            <p className="mt-[6px] text-[11px] font-medium text-[#202020]">{item.brand}</p>
                            <p className="mt-[4px] text-[11px] font-medium text-[#202020]">{item.type}</p>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center rounded-full px-[10px] py-[4px] text-[10px] font-semibold ${item.categoryColor} ${item.categoryBg}`}>
                              {item.category}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenItemDetails(item)}
                              className="mt-[6px] block text-[11px] font-medium text-[#202020] underline underline-offset-2"
                            >
                              {selectedImages[item.id]?.length ? `${selectedImages[item.id].length} Image` : 'Image'}
                            </button>
                            <p className="mt-[4px] text-[11px] font-semibold text-[#202020]">
                              {receivedQuantities[item.id]
                                ? `${receivedQuantities[item.id]}/${item.orderedQuantity} Qty`
                                : item.quantity}
                            </p>
                            <div className="mt-[2px] border-b border-dashed border-[#9E9E9E]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
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
                key={card.id}
                type="button"
                onClick={() => setSelectedCard(card)}
                className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px] w-full text-left"
                style={{ marginBottom: '0px' }}
              >
                <div className="rounded-[8px] h-full px-3 py-[10px] cursor-pointer transition-all duration-300 ease-out select-none bg-white">
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

      {showImagePickerSheet && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex items-end justify-center"
          onClick={closeImagePickerSheet}
        >
          <div
            className="w-full max-w-[360px] bg-black text-white rounded-t-[20px] px-[24px] pt-[20px] pb-[24px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[14px] font-semibold">Select App</p>
                <p className="mt-[6px] text-[11px] font-medium text-[#BDBDBD]">You Can Select 5 Images Only</p>
              </div>
              <button type="button" onClick={closeImagePickerSheet} className="text-white text-[24px] leading-none">
                ×
              </button>
            </div>

            <div className="flex items-center justify-start gap-[34px] mt-[24px]">
              <button type="button" onClick={() => handlePickSource('camera')} className="flex flex-col items-center gap-[8px]">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.333 7L10.733 5.133C10.953 4.84 11.299 4.667 11.667 4.667H16.333C16.701 4.667 17.047 4.84 17.267 5.133L18.667 7H21C22.289 7 23.333 8.045 23.333 9.333V19.833C23.333 21.122 22.289 22.167 21 22.167H7C5.711 22.167 4.667 21.122 4.667 19.833V9.333C4.667 8.045 5.711 7 7 7H9.333Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 17.5C15.933 17.5 17.5 15.933 17.5 14C17.5 12.067 15.933 10.5 14 10.5C12.067 10.5 10.5 12.067 10.5 14C10.5 15.933 12.067 17.5 14 17.5Z" stroke="white" strokeWidth="1.5" />
                </svg>
                <span className="text-[11px] font-medium">Camera</span>
              </button>
              <button type="button" onClick={() => handlePickSource('gallery')} className="flex flex-col items-center gap-[8px]">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 5.833H21C22.289 5.833 23.333 6.878 23.333 8.167V19.833C23.333 21.122 22.289 22.167 21 22.167H7C5.711 22.167 4.667 21.122 4.667 19.833V8.167C4.667 6.878 5.711 5.833 7 5.833Z" stroke="white" strokeWidth="1.5" />
                  <path d="M10.5 12.833C11.144 12.833 11.667 12.311 11.667 11.667C11.667 11.023 11.144 10.5 10.5 10.5C9.856 10.5 9.333 11.023 9.333 11.667C9.333 12.311 9.856 12.833 10.5 12.833Z" fill="white" />
                  <path d="M23.333 17.5L18.667 12.833L7 22.167" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[11px] font-medium">Gallery</span>
              </button>
              <button type="button" onClick={() => handlePickSource('photos')} className="flex flex-col items-center gap-[8px]">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 4.667L16.357 9.443L21.633 10.212L17.817 13.931L18.718 19.185L14 16.705L9.282 19.185L10.183 13.931L6.367 10.212L11.643 9.443L14 4.667Z" fill="#34A853" />
                  <path d="M22.167 8.167C22.167 6.878 21.122 5.833 19.833 5.833H8.167C6.878 5.833 5.833 6.878 5.833 8.167V19.833C5.833 21.122 6.878 22.167 8.167 22.167H19.833C21.122 22.167 22.167 21.122 22.167 19.833V8.167Z" stroke="#4285F4" strokeWidth="1.5" />
                </svg>
                <span className="text-[11px] font-medium">Photos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <SelectVendorModal
        isOpen={showInchargeModal}
        onClose={() => setShowInchargeModal(false)}
        onSelect={(value) => {
          const selectedEmployee = employeeList.find((employee) => {
            const employeeName = employee.employeeName || employee.name || employee.fullName || employee.employee_name || '';
            return employeeName === value;
          });
          console.log('GRN Create selected engineer:', {
            value,
            selectedEmployee
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
