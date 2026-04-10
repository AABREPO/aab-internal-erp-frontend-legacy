import React, { useEffect, useMemo, useState } from 'react';
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

const mapPurchaseOrderToCard = (purchaseOrder, vendorNameOptions = [], siteOptions = [], employeeList = []) => {
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
    itemsCount: Array.isArray(items) ? items.length : 0
  };

  console.log('GRN Verify mapped purchase order card:', {
    rawPurchaseOrder: purchaseOrder,
    mappedCard
  });

  return mappedCard;
};

const verifyCards = [
  {
    id: 1,
    status: 'Pending',
    poNo: 'PO - 2025 - 134',
    vendorName: 'Sriram Paints',
    siteName: 'Ramar - Krishnankovil',
    time: 'Today - 10:24 AM',
    engineerName: 'Krishnamoorthi K',
    itemsCount: 3
  },
  {
    id: 2,
    status: 'Pending',
    poNo: 'PO - 2025 - 33',
    vendorName: 'Thangapa Nadar Paints',
    siteName: 'Ramar - Krishnankovil',
    time: 'Today - 09:42 AM',
    engineerName: 'Krishnamoorthi K',
    itemsCount: 6
  },
  {
    id: 3,
    status: 'Review',
    poNo: 'PO - 2025 - 134',
    vendorName: 'Sriram Paints',
    siteName: 'Ramar - Krishnankovil',
    time: 'Today - 10:24 AM',
    engineerName: 'Krishnamoorthi K',
    itemsCount: 3
  },
  {
    id: 4,
    status: 'Completed',
    poNo: 'PO - 2025 - 134',
    vendorName: 'Sriram Paints',
    siteName: 'Ramar - Krishnankovil',
    time: 'Today - 10:24 AM',
    engineerName: 'Krishnamoorthi K',
    itemsCount: 3
  }
];

const Verify = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('goods-recieved-notes');
  const [activeStatus, setActiveStatus] = useState('Pending');
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
      return verifyCards;
    }

    return purchaseOrders.map((purchaseOrder) =>
      mapPurchaseOrderToCard(purchaseOrder, vendorNameOptions, siteOptions, employeeList)
    );
  }, [employeeList, purchaseOrders, selectedInchargeId, siteOptions, vendorNameOptions]);
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
    const fetchPurchaseOrdersByIncharge = async () => {
      if (!selectedInchargeId) {
        setPurchaseOrders([]);
        return;
      }

      try {
        console.log('GRN Verify fetching purchase orders for site incharge:', {
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
        console.log('GRN Verify site-incharge API response:', data);
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
      'GRN Verify mapped cards state:',
      purchaseOrders.map((purchaseOrder) =>
        mapPurchaseOrderToCard(purchaseOrder, vendorNameOptions, siteOptions, employeeList)
      )
    );
  }, [employeeList, purchaseOrders, selectedInchargeId, siteOptions, vendorNameOptions]);

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

      <div className="mt-[126px] h-[calc(100vh-126px-80px)] overflow-y-auto no-scrollbar bg-white">
        <div className="pb-[16px]">
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
              <div
                key={card.id}
                className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px] w-full"
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
              </div>
            ))}
          </div>
        </div>
      </div>

      <SelectVendorModal
        isOpen={showInchargeModal}
        onClose={() => setShowInchargeModal(false)}
        onSelect={(value) => {
          const selectedEmployee = employeeList.find((employee) => {
            const employeeName = employee.employeeName || employee.name || employee.fullName || employee.employee_name || '';
            return employeeName === value;
          });
          console.log('GRN Verify selected engineer:', {
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

export default Verify;
