import React, { useState, useEffect, useCallback } from 'react';
import SelectVendorModal from './SelectVendorModal';
import DatePickerModal from './DatePickerModal';
import CloseIcon from '../Images/Close F.svg'

const Summary = () => {
  const [viewMode, setViewMode] = useState('vendor'); // 'vendor' or 'project'
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [summaryData, setSummaryData] = useState([]);

  // State for all available options from APIs
  const [allVendors, setAllVendors] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  // Get current date formatted as DD/MM/YYYY
  const getTodayDate = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  // Fetch all vendors and projects from API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch('https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll');
        if (res.ok) {
          const data = await res.json();
          setAllVendors(data);
          const apiVendors = data
            .map(v => v.vendorName)
            .filter(Boolean);
          setVendorOptions(apiVendors);
        }
      } catch (e) {
        console.error('Error fetching vendors:', e);
      }
    };
    const fetchProjects = async () => {
      try {
        const res = await fetch('https://backendaab.in/demoAabuilderDash/api/project_Names/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          setAllProjects(data);
          const apiProjects = data
            .map(p => p.siteName)
            .filter(Boolean);
          setProjectOptions(apiProjects);
        }
      } catch (e) {
        console.error('Error fetching projects:', e);
      }
    };
    fetchVendors();
    fetchProjects();
  }, []);
  // Load purchase orders from API
  const loadPurchaseOrders = useCallback(async () => {
    // Don't load if vendors/projects aren't ready yet
    if (allVendors.length === 0 && allProjects.length === 0) {
      return;
    }
    try {
      const response = await fetch('https://backendaab.in/demoAabuildersDash/api/purchase_orders/getAll');
      if (!response.ok) {
        throw new Error('Failed to fetch purchase orders');
      }
      const data = await response.json();
      // Transform API data to match expected format
      const transformedPOs = data.map((po) => {
        // Fetch vendor name if we have vendor_id
        let vendorName = '';
        if (po.vendor_id && allVendors.length > 0) {
          const vendorMatch = allVendors.find(v => v.id === po.vendor_id);
          vendorName = vendorMatch?.vendorName || '';
        }
        // Fetch project/site name if we have client_id
        let projectName = '';
        if (po.client_id && allProjects.length > 0) {
          const projectMatch = allProjects.find(p => p.id === po.client_id);
          projectName = projectMatch?.siteName || '';
        }
        return {
          id: po.id || po._id,
          date: po.date || '',
          vendorName: vendorName || po.vendorName || '',
          projectName: projectName || po.projectName || '',
          vendor_id: po.vendor_id,
          client_id: po.client_id,
        };
      });
      setPurchaseOrders(transformedPOs);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    }
  }, [allVendors, allProjects]);
  // Load purchase orders when vendors and projects are ready
  useEffect(() => {
    if (allVendors.length > 0 || allProjects.length > 0) {
      loadPurchaseOrders();
    }
  }, [allVendors, allProjects, loadPurchaseOrders]);
  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      loadPurchaseOrders();
    };
    window.addEventListener('poUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('poUpdated', handleStorageChange);
    };
  }, [loadPurchaseOrders]);
  // Helper function to normalize date format for comparison
  const normalizeDate = (dateStr) => {
    if (!dateStr) return '';
    // If already in DD/MM/YYYY format, return as is
    if (dateStr.includes('/')) {
      return dateStr;
    }
    // Otherwise try to parse and format
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };
  // Calculate summary data based on selected vendor and date
  useEffect(() => {
    if (viewMode === 'vendor' && selectedVendor) {
      // Group by project for selected vendor and selected date
      const projectMap = new Map();
      const normalizedSelectedDate = normalizeDate(selectedDate);
      purchaseOrders
        .filter(po => {
          const poVendorName = po.vendorName || '';
          const poDate = normalizeDate(po.date);
          return poVendorName === selectedVendor && poDate === normalizedSelectedDate;
        })
        .forEach(po => {
          if (po.projectName) {
            const currentCount = projectMap.get(po.projectName) || 0;
            projectMap.set(po.projectName, currentCount + 1);
          }
        });
      const data = Array.from(projectMap.entries()).map(([project, quantity]) => ({
        name: project,
        quantity: quantity
      }));
      setSummaryData(data);
    } else if (viewMode === 'project' && selectedProject) {
      // Group by vendor for selected project
      const vendorMap = new Map();
      purchaseOrders
        .filter(po => po.projectName === selectedProject)
        .forEach(po => {
          if (po.vendorName) {
            const currentCount = vendorMap.get(po.vendorName) || 0;
            vendorMap.set(po.vendorName, currentCount + 1);
          }
        });
      const data = Array.from(vendorMap.entries()).map(([vendor, quantity]) => ({
        name: vendor,
        quantity: quantity
      }));
      setSummaryData(data);
    } else {
      setSummaryData([]);
    }
  }, [viewMode, selectedVendor, selectedProject, selectedDate, purchaseOrders]);
  const handleAddNewVendor = (newVendor) => {
    if (!vendorOptions.includes(newVendor)) {
      setVendorOptions([...vendorOptions, newVendor]);
    }
  };
  const handleAddNewProject = (newProject) => {
    if (!projectOptions.includes(newProject)) {
      setProjectOptions([...projectOptions, newProject]);
    }
  };
  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };
  return (
    <div className="flex flex-col min-h-[calc(100vh-96px-80px)] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Header Section - Sticky */}
      <div className="sticky top-0 bg-white z-10 flex-shrink-0">
        {/* Date Display - Clickable */}
        <div className="flex-shrink-0 flex mb-[8px] items-center border-b border-[#E0E0E0] justify-between">
          <div className="flex items-center pb-[8px] gap-[8px]">
          <button
            type="button"
            onClick={() => setShowDatePicker(true)}
            className="text-[12px] font-semibold text-black leading-normal underline-offset-2 hover:underline"
          >
            {selectedDate}
          </button>
          </div>
        </div>
        {/* Segmented Control (Vendor/Project) */}
        <div className="mb-2 flex items-center bg-[#F5F5F5] rounded-[8px] w-full h-[32px]">
          <button
            onClick={() => setViewMode('vendor')}
            className={`flex-1 ml-0.5 h-[28px] rounded text-[12px] font-medium transition-colors ${viewMode === 'vendor'
                ? 'bg-white text-black shadow-sm'
                : 'text-[#9E9E9E]'
              }`}
          >
            Vendor
          </button>
          <button
            onClick={() => setViewMode('project')}
            className={`flex-1 mr-0.5 h-[28px] rounded text-[12px] font-medium transition-colors ${viewMode === 'project'
                ? 'bg-white text-black shadow-sm'
                : 'text-[#9E9E9E]'
              }`}
          >
            Project
          </button>
        </div>
        {/* Vendor/Project Selection */}
        {viewMode === 'vendor' ? (
          <div className="pb-[8px]">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Vendor Name<span className="text-[#E4572E]">*</span>
            </p>
            <div className="relative">
              <div className="relative">
                <div
                  onClick={() => setShowVendorModal(true)}
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[40px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                  style={{
                    boxSizing: 'border-box',
                    color: selectedVendor ? '#000' : '#9E9E9E'
                  }}
                >
                  {selectedVendor || 'Select ...'}
                </div>
                {!selectedVendor && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
              {selectedVendor && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVendor('');
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="pb-[8px]">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Project Name<span className="text-[#E4572E]">*</span>
            </p>
            <div className="relative">
              <div className="relative">
                <div
                  onClick={() => setShowProjectModal(true)}
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[40px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                  style={{
                    boxSizing: 'border-box',
                    color: selectedProject ? '#000' : '#9E9E9E'
                  }}
                >
                  {selectedProject || 'Select ...'}
                </div>
                {!selectedProject && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
              {selectedProject && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject('');
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Project/Vendor List Summary Card */}
      {summaryData.length > 0 && (
        <div className="bg-white shadow-lg rounded-[8px] shadow-top-lg w-[360px] mt-[8px]">
          {/* Header */}
          <div className="flex items-center px-[16px] py-[10px] justify-between bg-white rounded-t-[8px] border-b border-[rgba(0,0,0,0.10)]">
            <p className="text-[12px] font-semibold text-[#9E9E9E]">
              {viewMode === 'vendor' ? 'Project List' : 'Vendor List'}
            </p>
            <p className="text-[12px] font-semibold text-[#9E9E9E]">Quantity</p>
          </div>
          {/* List Items */}
          <div>
            {summaryData.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between px-[16px] py-[12px] ${index < summaryData.length - 1 ? 'border-b border-[rgba(0,0,0,0.08)]' : ''
                  }`}
              >
                <p className="text-[12px] font-medium text-black flex-1 text-left">
                  {item.name}
                </p>
                <p className="text-[12px] font-medium text-[#26bf94] ml-4">
                  {String(item.quantity).padStart(2, '0')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Empty State */}
      {((viewMode === 'vendor' && selectedVendor) || (viewMode === 'project' && selectedProject)) && summaryData.length === 0 && (
        <div className="bg-white rounded- border border-[rgba(0,0,0,0.16)] w-[360px] p-[32px] text-center">
          <p className="text-[12px] font-medium text-[#9E9E9E]">
            No {viewMode === 'vendor' ? 'projects' : 'vendors'} found
          </p>
        </div>
      )}
      {/* Vendor Select Modal */}
      <SelectVendorModal
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
        onSelect={(value) => {
          setSelectedVendor(value);
          setShowVendorModal(false);
        }}
        selectedValue={selectedVendor}
        options={vendorOptions}
        fieldName="Vendor"
      />
      {/* Project Select Modal */}
      <SelectVendorModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelect={(value) => {
          setSelectedProject(value);
          setShowProjectModal(false);
        }}
        selectedValue={selectedProject}
        options={projectOptions}
        fieldName="Project"
      />
      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        initialDate={selectedDate}
      />
    </div>
  );
};
export default Summary;