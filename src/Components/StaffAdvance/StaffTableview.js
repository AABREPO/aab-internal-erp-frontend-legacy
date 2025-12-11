import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from 'react-select';
import Filter from '../Images/filter (3).png'
import edit from '../Images/Edit.svg';

// EditModal is now inline - no need for lazy loading

// Memoized components for better performance
const TableRow = memo(({ entry, index, onEditClick, getEmployeeName, getLabourName, getPurposeName, formatDateOnly }) => (
  <tr key={entry.id} className="odd:bg-white even:bg-[#FAF6ED]">
    <td className="text-sm text-left p-2 w-40 font-semibold">{formatDateOnly(entry.date)}</td>
    <td className="text-sm text-left w-[150px] font-semibold">
      {getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || "N/A"}
    </td>
    <td className="text-sm text-left w-[250px] font-semibold">
      {getPurposeName(entry.from_purpose_id)}
    </td>
    <td className="text-sm text-left font-semibold">
      {getPurposeName(entry.to_purpose_id)}
    </td>
    <td className="text-sm text-left pl-2 font-semibold">
      {entry.amount != null && entry.amount !== ""
        ? Number(entry.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })
        : ""}
    </td>
    <td className="text-sm text-left pl-2 font-semibold">
      {entry.staff_refund_amount != null && entry.staff_refund_amount !== ""
        ? Number(entry.staff_refund_amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })
        : ""}
    </td>
    <td className="text-sm text-left font-semibold">{entry.type}</td>
    <td className="text-sm text-left font-semibold">{entry.staff_payment_mode}</td>
    <td className="text-sm text-left font-semibold">{entry.description}</td>
    <td></td>
    <td className="text-sm text-left pl-3 font-semibold">{entry.entry_no}</td>
    <td className="flex py-2">
      <button
        className={`rounded-full transition duration-200 ml-2 mr-3 ${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={entry.not_allow_to_edit}
      >
        <img
          src={edit}
          onClick={entry.not_allow_to_edit ? undefined : () => onEditClick(entry)}
          alt="Edit"
          className={`w-4 h-6 transition duration-200 ${entry.not_allow_to_edit ? '' : 'transform hover:scale-110 hover:brightness-110'}`}
        />
      </button>
    </td>
  </tr>
));

// Inline EditModal component with dynamic field changes
const EditModal = memo(({
  isOpen,
  editFormData,
  setEditFormData,
  staffAdvanceCombinedOptions,
  employees,
  laboursList,
  purposes,
  paymentModeOptions,
  onClose,
  onUpdate,
  formatWithCommas
}) => {
  const handleInputChange = useCallback((field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  }, [setEditFormData]);

  const handleAmountChange = useCallback((e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue)) {
      if (editFormData.type === "Refund") {
        setEditFormData({ ...editFormData, staff_refund_amount: rawValue, amount: '' });
      } else {
        setEditFormData({ ...editFormData, amount: rawValue, staff_refund_amount: '' });
      }
    }
  }, [editFormData, setEditFormData]);

  // Dynamic field configuration based on type
  const fieldConfig = useMemo(() => {
    switch (editFormData.type) {
      case 'Refund':
        return {
          purposeLabel: 'Purpose',
          amountGivenLabel: 'Refund Amount',
          paymentModeLabel: 'Payment Mode',
          showTransferAmount: false
        };
      case 'Transfer':
        return {
          purposeLabel: 'Purpose From',
          amountGivenLabel: 'Purpose To',
          paymentModeLabel: 'Transfer Amount',
          showTransferAmount: true
        };
      default:
        return {
          purposeLabel: 'Purpose',
          amountGivenLabel: 'Amount Given',
          paymentModeLabel: 'Payment Mode',
          showTransferAmount: false
        };
    }
  }, [editFormData.type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[700px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Edit Entry</h2>
        <div className='grid grid-cols-2 gap-4 text-left ml-5'>
          <div className='flex items-center gap-3'>
            <label className='font-semibold text-[#E4572E]'>Select Type</label>
            <select
              value={editFormData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className='w-[163px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
            >
              <option value=''>Select Type...</option>
              <option value='Advance'>Advance</option>
              <option value='Transfer'>Transfer</option>
              <option value='Refund'>Refund</option>
            </select>
          </div>
          <div className='flex items-center gap-3'>
            <label className='font-semibold text-[#E4572E]'>Date</label>
            <input
              type='date'
              placeholder='dd-mm-yyyy'
              value={editFormData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className='w-[144px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
            />
          </div>
          <div className=''>
            <div className='flex'>
              <label className='font-semibold block'>Employee</label>
            </div>
            <Select
              options={staffAdvanceCombinedOptions}
              value={staffAdvanceCombinedOptions.find(
                opt =>
                  (opt.type === "Employee" && opt.id === editFormData.employee_id) ||
                  (opt.type === "Labour" && opt.id === editFormData.labour_id)
              ) || null}
              onChange={(selected) => {
                if (!selected) {
                  setEditFormData(prev => ({ ...prev, employee_id: '', labour_id: '' }));
                  return;
                }
                if (selected.type === "Employee") {
                  setEditFormData(prev => ({ ...prev, employee_id: selected.id, labour_id: null }));
                } else {
                  setEditFormData(prev => ({ ...prev, labour_id: selected.id, employee_id: null }));
                }
              }}
              className='w-[263px] h-[45px] rounded-lg focus:outline-none'
              isClearable
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  borderWidth: '2px',
                  borderRadius: '8px',
                  borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
                  boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
                  '&:hover': {
                    borderColor: 'rgba(191, 152, 83, 0.2)',
                  }
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? 'transparent' : state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'transparent',
                  color: 'black',
                  '&:hover': {
                    backgroundColor: 'rgba(191, 152, 83, 0.1)',
                  },
                }),
              }}
            />
          </div>
          <div>
            <label className='font-semibold block'>{fieldConfig.purposeLabel}</label>
            <Select
              options={purposes}
              value={purposes.find(purp => purp.id === editFormData.from_purpose_id) || null}
              onChange={(selected) => handleInputChange('from_purpose_id', selected?.id || '')}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  borderWidth: '2px',
                  borderRadius: '8px',
                  borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
                  boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
                  '&:hover': {
                    borderColor: 'rgba(191, 152, 83, 0.2)',
                  }
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? 'transparent' : state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'transparent',
                  color: 'black',
                  '&:hover': {
                    backgroundColor: 'rgba(191, 152, 83, 0.1)',
                  },
                }),
              }}
              isClearable
              className='w-[263px] h-[45px] focus:outline-none'
            />
          </div>
          <div>
            <label className='font-semibold block'>{fieldConfig.amountGivenLabel}</label>
            {editFormData.type === 'Transfer' ? (
              <Select
                options={purposes}
                value={purposes.find(purp => purp.id === editFormData.to_purpose_id) || null}
                onChange={(selected) => handleInputChange('to_purpose_id', selected?.id || '')}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    borderWidth: '2px',
                    borderRadius: '8px',
                    borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
                    boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
                    '&:hover': {
                      borderColor: 'rgba(191, 152, 83, 0.2)',
                    }
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected ? 'transparent' : state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'transparent',
                    color: 'black',
                    '&:hover': {
                      backgroundColor: 'rgba(191, 152, 83, 0.1)',
                    },
                  }),
                }}
                isClearable
                className='w-[263px] h-[45px] focus:outline-none'
                placeholder="Select purpose to..."
              />
            ) : (
              <input
                value={editFormData.type === 'Refund' ? formatWithCommas(editFormData.staff_refund_amount) : formatWithCommas(editFormData.amount)}
                onChange={handleAmountChange}
                className='w-[263px] h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
              />
            )}
          </div>
          <div className=''>
            <label className='font-semibold block'>{fieldConfig.paymentModeLabel}</label>
            {editFormData.type === 'Transfer' ? (
              <input
                value={formatWithCommas(editFormData.amount)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, "");
                  if (!isNaN(rawValue)) {
                    setEditFormData({ ...editFormData, amount: rawValue });
                  }
                }}
                className='w-[263px] h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
                placeholder="Enter transfer amount"
              />
            ) : (
              <select
                value={editFormData.staff_payment_mode}
                onChange={(e) => handleInputChange('staff_payment_mode', e.target.value)}
                className='w-[263px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'>
                <option value=''>Select</option>
                {paymentModeOptions && paymentModeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className='col-span-2'>
            <label className='font-semibold block'>Description</label>
            <textarea
              rows={2}
              value={editFormData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className='w-[590px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'>
            </textarea>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 border border-[#BF9853] w-[100px] h-[45px] rounded">
            Cancel
          </button>
          <button onClick={onUpdate} className="px-4 py-2 bg-[#BF9853] w-[100px] h-[45px] text-white rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
});

EditModal.displayName = 'EditModal';

const TableView = ({ username, userRoles = [], paymentModeOptions = [] }) => {
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [laboursList, setLaboursList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectDate, setSelectDate] = useState('');
  const [selectEmployeeName, setSelectEmployeeName] = useState('');
  const [selectPurpose, setSelectPurpose] = useState('');
  const [selectTransferTo, setSelectTransferTo] = useState('');
  const [selectType, setSelectType] = useState('');
  const [selectMode, setSelectMode] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const scrollRef = useRef(null);
  const [virtualScroll, setVirtualScroll] = useState(false);
  const [staffAdvanceCombinedOptions, setStaffAdvanceCombinedOptions] = useState([]);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });
  // Optimized data fetching with parallel requests
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Parallel API calls for better performance
        const [recRes, empRes, purRes] = await Promise.allSettled([
          fetch('https://backendaab.in/aabuildersDash/api/staff-advance/all'),
          fetch('https://backendaab.in/aabuildersDash/api/employee_details/getAll', {
            credentials: 'include',
          }),
          fetch('https://backendaab.in/aabuildersDash/api/purposes/getAll')
        ]);
        // Process staff advance data
        const recData = recRes.status === 'fulfilled' && recRes.value.ok
          ? await recRes.value.json()
          : [];
        // Process employee data
        const empData = empRes.status === 'fulfilled' && empRes.value.ok
          ? await empRes.value.json()
          : [];
        // Process purposes data
        const purData = purRes.status === 'fulfilled' && purRes.value.ok
          ? await purRes.value.json()
          : [];
        console.log('Records:', recData);
        setRecords(recData);
        setEmployees(empData.map(e => ({ id: e.id, label: e.employee_name, type: "Employee" })));
        setPurposes(purData.map(p => ({ id: p.id, label: p.purpose })));
        // Set warning if any API failed
        const failedAPIs = [];
        if (recRes.status === 'rejected' || !recRes.value?.ok) failedAPIs.push('Staff Advance');
        if (empRes.status === 'rejected' || !empRes.value?.ok) failedAPIs.push('Employee Details');
        if (purRes.status === 'rejected' || !purRes.value?.ok) failedAPIs.push('Purposes');
        if (failedAPIs.length > 0) {
          setError(`Warning: Some data may not be available (${failedAPIs.join(', ')})`);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Failed to load data. Please try refreshing the page.');
        setRecords([]);
        setEmployees([]);
        setPurposes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    fetchLaboursList();
  }, []);
  const fetchLaboursList = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/labours-details/getAll');
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.labour_name,
          label: item.labour_name,
          id: item.id,
          type: "Labour",
          salary: item.labour_salary,
          extra: item.extra_amount
        }));
        setLaboursList(formattedData);
      } else {
        console.log('Error fetching Labour names.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  useEffect(() => { setStaffAdvanceCombinedOptions([...employees, ...laboursList]); }, [employees, laboursList]);
  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    scroll.current = {
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop,
    };
    lastMove.current = {
      time: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
    cancelMomentum();
  };
  const handleMouseMove = (e) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const now = Date.now();
    const dt = now - lastMove.current.time || 16;
    velocity.current = {
      x: (e.clientX - lastMove.current.x) / dt,
      y: (e.clientY - lastMove.current.y) / dt,
    };
    scrollRef.current.scrollLeft = scroll.current.left - dx;
    scrollRef.current.scrollTop = scroll.current.top - dy;
    lastMove.current = {
      time: now,
      x: e.clientX,
      y: e.clientY,
    };
  };
  const handleMouseUp = () => {
    if (!isDragging.current || !scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.style.cursor = '';
    scrollRef.current.style.userSelect = '';
    applyMomentum();
  };
  const cancelMomentum = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  };
  const applyMomentum = () => {
    if (!scrollRef.current) return;
    const friction = 0.95;
    const minVelocity = 0.1;
    const step = () => {
      const { x, y } = velocity.current;
      if (!scrollRef.current) return;
      if (Math.abs(x) > minVelocity || Math.abs(y) > minVelocity) {
        scrollRef.current.scrollLeft -= x * 20;
        scrollRef.current.scrollTop -= y * 20;
        velocity.current.x *= friction;
        velocity.current.y *= friction;
        animationFrame.current = requestAnimationFrame(step);
      } else {
        cancelMomentum();
      }
    };
    animationFrame.current = requestAnimationFrame(step);
  };
  // Memoized utility functions
  const formatWithCommas = useCallback((value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, []);

  const formatDateOnly = useCallback((dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  const getEmployeeName = useCallback((id) => employees.find(e => e.id === id)?.label || id, [employees]);
  const getLabourName = useCallback((id) => laboursList.find(l => l.id === id)?.label || id, [laboursList]);
  const getPurposeName = useCallback((id) => purposes.find(p => p.id === id)?.label || id, [purposes]);

  // Get unique employee names from records for filter dropdown
  const employeeNameOptions = useMemo(() => {
    const uniqueNames = new Set();
    records.forEach((entry) => {
      const name = getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id);
      if (name) {
        uniqueNames.add(name);
      }
    });
    return Array.from(uniqueNames).map(name => ({ value: name, label: name }));
  }, [records, getEmployeeName, getLabourName]);

  // Get unique purpose options from records for filter dropdown
  const purposeOptions = useMemo(() => {
    const uniquePurposes = new Set();
    records.forEach((entry) => {
      const purposeName = getPurposeName(entry.from_purpose_id);
      if (purposeName && purposeName !== entry.from_purpose_id) {
        uniquePurposes.add(purposeName);
      }
    });
    return Array.from(uniquePurposes).map(purpose => ({ value: purpose, label: purpose, id: records.find(r => getPurposeName(r.from_purpose_id) === purpose)?.from_purpose_id }));
  }, [records, getPurposeName]);

  // Get unique transfer to options from records for filter dropdown
  const transferToOptions = useMemo(() => {
    const uniqueTransferTo = new Set();
    records.forEach((entry) => {
      const transferToName = getPurposeName(entry.to_purpose_id);
      if (transferToName && transferToName !== entry.to_purpose_id) {
        uniqueTransferTo.add(transferToName);
      }
    });
    return Array.from(uniqueTransferTo).map(transferTo => ({ value: transferTo, label: transferTo, id: records.find(r => getPurposeName(r.to_purpose_id) === transferTo)?.to_purpose_id }));
  }, [records, getPurposeName]);

  // Get unique type options from records for filter dropdown
  const typeOptions = useMemo(() => {
    const uniqueTypes = new Set();
    records.forEach((entry) => {
      if (entry.type) {
        uniqueTypes.add(entry.type);
      }
    });
    return Array.from(uniqueTypes).sort();
  }, [records]);

  // Get unique mode options from records for filter dropdown
  const modeOptions = useMemo(() => {
    const uniqueModes = new Set();
    records.forEach((entry) => {
      if (entry.staff_payment_mode) {
        uniqueModes.add(entry.staff_payment_mode);
      }
    });
    return Array.from(uniqueModes).sort();
  }, [records]);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }, []);
  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
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
          value: item.vendorName,
          label: item.vendorName,
          id: item.id,
          type: "Vendor",
        }));
        setVendorOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchVendorNames();
  }, []);
  useEffect(() => {
    const fetchContractorNames = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
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
          value: item.contractorName,
          label: item.contractorName,
          id: item.id,
          type: "Contractor",
        }));
        setContractorOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchContractorNames();
  }, []);
  useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions]); }, [vendorOptions, contractorOptions]);
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
          id: item.id,
          sNo: item.siteNo
        }));

        // Add predefined site options with IDs 001, 002, 003, 004
        const predefinedSiteOptions = [
          {
            value: "Mason Advance",
            label: "Mason Advance",
            id: "1",
            sNo: "1"
          },
          {
            value: "Material Advance",
            label: "Material Advance",
            id: "2",
            sNo: "2"
          },
          {
            value: "Weekly Advance",
            label: "Weekly Advance",
            id: "3",
            sNo: "3"
          },
          {
            value: "Excess Advance",
            label: "Excess Advance",
            id: "4",
            sNo: "4"
          },
          {
            value: "Material Rent",
            label: "Material Rent",
            id: "",
            sNo: "5"
          },
          {
            value: "Subhash Kumar - Kunnur",
            label: "Subhash Kumar - Kunnur",
            id: "6",
            sNo: "6"
          }
        ];

        // Combine backend data with predefined options
        const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
        setSiteOptions(combinedSiteOptions);
      } catch (error) {
        console.error("Fetch error: ", error);

        // Fallback: if API fails, still show predefined options
        const predefinedSiteOptions = [
          {
            value: "Mason Advance",
            label: "Mason Advance",
            id: "1",
            sNo: "1"
          },
          {
            value: "Material Advance",
            label: "Material Advance",
            id: "2",
            sNo: "2"
          },
          {
            value: "Weekly Advance",
            label: "Weekly Advance",
            id: "3",
            sNo: "3"
          },
          {
            value: "Excess Advance",
            label: "Excess Advance",
            id: "4",
            sNo: "4"
          },
          {
            value: "Material Rent",
            label: "Material Rent",
            id: "",
            sNo: "5"
          },
          {
            value: "Subhash Kumar - Kunnur",
            label: "Subhash Kumar - Kunnur",
            id: "6",
            sNo: "6"
          }
        ];
        setSiteOptions(predefinedSiteOptions);
      }
    };
    fetchSites();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectDate, selectEmployeeName, selectPurpose, selectTransferTo, selectType, selectMode]);
  // Memoized edit handlers
  const handleEditClick = useCallback((entry) => {
    setEditingId(entry.staffAdvancePortalId || entry.id);
    setEditFormData({
      date: entry.date?.split('T')[0] || '',
      amount: entry.amount || '',
      employee_id: entry.employee_id || '',
      labour_id: entry.labour_id || '',
      from_purpose_id: entry.from_purpose_id || '',
      to_purpose_id: entry.to_purpose_id || '',
      entryNo: entry.entryNo || '',
      description: entry.description || '',
      type: entry.type || '',
      staff_payment_mode: entry.staff_payment_mode || '',
      staff_refund_amount: entry.staff_refund_amount || ''
    });
    setIsEditModalOpen(true);
  }, []);

  const handleUpdate = useCallback(async () => {
    try {
      const url = `https://backendaab.in/aabuildersDash/api/staff-advance/${editingId}?editedBy=${username}`;
      const payload = {
        type: editFormData.type || '',
        date: editFormData.date || '',
        employee_id: editFormData.employee_id || '',
        labour_id: editFormData.labour_id || '',
        from_purpose_id: editFormData.from_purpose_id || null,
        to_purpose_id: editFormData.to_purpose_id || null,
        staff_payment_mode: editFormData.staff_payment_mode || '',
        amount: editFormData.type === "Refund" ? 0 : Number(editFormData.amount || 0),
        staff_refund_amount: editFormData.type === "Refund" ? Number(editFormData.staff_refund_amount || 0) : 0,
        entry_no: editFormData.entryNo ?? null,
        description: editFormData.description || '',
        file_url: editFormData.file_url || ''
      };
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }
      const updatedRecords = await response.json();
      setIsEditModalOpen(false);
      window.location.reload();
      setRecords(prevRecords => {
        const updatedEntryNos = new Set(updatedRecords.map(r => r.entryNo));
        const filteredRecords = prevRecords.filter(record =>
          !updatedEntryNos.has(record.entryNo) ||
          updatedRecords.some(u => u.staffAdvancePortalId === record.staffAdvancePortalId)
        );
        return [...filteredRecords, ...updatedRecords];
      });
    } catch (error) {
      console.error('Update error:', error);
      alert(error.message || 'Failed to update record. Please try again.');
    }
  }, [editFormData, editingId, username]);

  // Debounced filter handlers for better performance
  const [debouncedFilters, setDebouncedFilters] = useState({
    selectDate: '',
    selectEmployeeName: '',
    selectPurpose: '',
    selectTransferTo: '',
    selectType: '',
    selectMode: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        selectDate,
        selectEmployeeName,
        selectPurpose,
        selectTransferTo,
        selectType,
        selectMode
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [selectDate, selectEmployeeName, selectPurpose, selectTransferTo, selectType, selectMode]);

  // Filtered records using debounced filters (moved after debouncedFilters initialization)
  const filteredRecords = useMemo(() => {
    return records.filter((entry) => {
      if (debouncedFilters.selectDate) {
        const [year, month, day] = debouncedFilters.selectDate.split("-");
        const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
        const entryDateObj = new Date(entry.date);
        const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
        if (formattedEntryDate !== formattedSelectDate) return false;
      }
      if (debouncedFilters.selectEmployeeName) {
        const employeeName = String(getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || "");
        if (employeeName.toLowerCase() !== debouncedFilters.selectEmployeeName.toLowerCase()) return false;
      }
      if (debouncedFilters.selectPurpose) {
        const purposeName = String(getPurposeName(entry.from_purpose_id) || "");
        if (purposeName.toLowerCase() !== debouncedFilters.selectPurpose.toLowerCase()) return false;
      }
      if (debouncedFilters.selectTransferTo) {
        const transferToName = String(getPurposeName(entry.to_purpose_id) || "");
        if (transferToName.toLowerCase() !== debouncedFilters.selectTransferTo.toLowerCase()) return false;
      }
      if (debouncedFilters.selectType) {
        if (String(entry.type || "").toLowerCase() !== debouncedFilters.selectType.toLowerCase()) return false;
      }
      if (debouncedFilters.selectMode) {
        if (String(entry.staff_payment_mode || "").toLowerCase() !== debouncedFilters.selectMode.toLowerCase()) return false;
      }
      return true;
    });
  }, [records, debouncedFilters, getEmployeeName, getLabourName, getPurposeName]);

  // Calculate totals from filtered records
  const advanceTotal = filteredRecords
    .filter(r => r.type === 'Advance')
    .reduce((acc, r) => acc + (r.amount || 0), 0);
  const transferTotal = filteredRecords
    .filter(r => r.type === 'Transfer')
    .reduce((acc, r) => acc + (r.amount > 0 ? r.amount : 0), 0);
  const refundTotal = filteredRecords
    .filter(r => r.type === 'Refund')
    .reduce((acc, r) => acc + (r.staff_refund_amount || 0), 0);

  // Sorted data (moved after filteredRecords initialization)
  const sortedData = useMemo(() => {
    let sortableData = [...filteredRecords];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aValue, bValue;
        switch (sortConfig.key) {
          case 'date':
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case 'employee':
            aValue = getEmployeeName(a.employee_id);
            bValue = getEmployeeName(b.employee_id) || getLabourName(b.labour_id);
            break;
          case 'purpose':
            aValue = getPurposeName(a.from_purpose_id);
            bValue = getPurposeName(b.from_purpose_id);
            break;
          case 'transfer':
            aValue = getPurposeName(a.to_purpose_id);
            bValue = getPurposeName(b.to_purpose_id);
            break;
          case 'type':
            aValue = a.type || '';
            bValue = b.type || '';
            break;
          case 'mode':
            aValue = a.staff_payment_mode || '';
            bValue = b.staff_payment_mode || '';
            break;
          default:
            return 0;
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sort: newest entries first (by date descending, then by entry_no/id descending)
      sortableData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        // First sort by date (newest first)
        if (dateB.getTime() !== dateA.getTime()) {
          return dateB - dateA;
        }
        // If dates are the same, sort by entry_no or id (newest first)
        const idA = a.staffAdvancePortalId || a.id || a.entry_no || a.entryNo || 0;
        const idB = b.staffAdvancePortalId || b.id || b.entry_no || b.entryNo || 0;
        return idB - idA;
      });
    }
    return sortableData;
  }, [filteredRecords, sortConfig, getEmployeeName, getPurposeName]);

  // Memoized export functions (moved after sortedData initialization)
  const exportPDF = useCallback(() => {
    const doc = new jsPDF("l", "pt", "a4");
    const headers = [
      [
        "S.No",
        "Date",
        "Employee Name",
        "Purpose",
        "Transfer To",
        "Advance",
        "Refund",
        "Type",
        "Mode",
        "Description",
        "E.No"
      ]
    ];
    const rows = sortedData.map((entry, index) => [
      index + 1,
      entry.date ? formatDateOnly(entry.date) : "",
      getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || "",
      getPurposeName(entry.from_purpose_id) || "",
      getPurposeName(entry.to_purpose_id) || "",
      entry.amount != null && entry.amount !== ""
        ? Number(entry.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.staff_refund_amount != null && entry.staff_refund_amount !== ""
        ? Number(entry.staff_refund_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.type || "",
      entry.staff_payment_mode || "",
      entry.description || "",
      entry.entry_no || ""
    ]);
    doc.setFontSize(12);
    doc.text("Staff Advance Data Table", 40, 30);
    doc.autoTable({
      head: headers,
      body: rows,
      startY: 50,
      styles: {
        fontSize: 8,
        cellPadding: 4,
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
        fillColor: null
      },
      headStyles: {
        fillColor: null,
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineWidth: 0.5,
        lineColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: null
      }
    });
    doc.save("StaffAdvanceData.pdf");
  }, [sortedData, formatDateOnly, getEmployeeName, getLabourName, getPurposeName]);

  const exportCSV = useCallback(() => {
    const csvHeaders = [
      "S.No",
      "Date",
      "Employee Name",
      "Purpose",
      "Transfer To",
      "Advance",
      "Refund",
      "Type",
      "Mode",
      "Description",
      "Attached file",
      "E.No"
    ];
    const csvRows = sortedData.map((entry, index) => [
      index + 1,
      entry.date ? formatDateOnly(entry.date) : "",
      getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || "",
      getPurposeName(entry.from_purpose_id) || "",
      getPurposeName(entry.to_purpose_id) || "",
      entry.amount != null && entry.amount !== ""
        ? Number(entry.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.staff_refund_amount != null && entry.staff_refund_amount !== ""
        ? Number(entry.staff_refund_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.type || "",
      entry.staff_payment_mode || "",
      entry.description || "",
      "",
      entry.entry_no || ""
    ]);
    const csvString = [
      csvHeaders.join(","),
      ...csvRows.map(row =>
        row
          .map(value => {
            // Convert null/undefined to empty string, then handle quotes
            const stringValue = value == null ? "" : String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
    ].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "StaffAdvanceData.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [sortedData, formatDateOnly, getEmployeeName, getLabourName, getPurposeName]);

  // Virtual scrolling logic for large datasets (moved after sortedData initialization)
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Enable virtual scrolling for datasets larger than 1000 items
  const shouldUseVirtualScroll = sortedData.length > 1000;

  const currentData = useMemo(() => {
    if (shouldUseVirtualScroll && virtualScroll) {
      return sortedData.slice(visibleRange.start, visibleRange.end);
    }
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, startIndex, endIndex, shouldUseVirtualScroll, virtualScroll, visibleRange]);

  // Auto-enable virtual scrolling for large datasets
  useEffect(() => {
    if (sortedData.length > 1000 && !virtualScroll) {
      setVirtualScroll(true);
      setItemsPerPage(100); // Increase items per page for virtual scrolling
    } else if (sortedData.length <= 1000 && virtualScroll) {
      setVirtualScroll(false);
      setItemsPerPage(50);
    }
  }, [sortedData.length, virtualScroll]);

  // Memoized pagination handlers (moved after totalPages calculation)
  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleItemsPerPageChange = useCallback((e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  // Cleanup effect for memory management
  useEffect(() => {
    return () => {
      cancelMomentum();
      // Clean up any pending timeouts
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Remove any event listeners if they were added
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('mousedown', handleMouseDown);
        scrollRef.current.removeEventListener('mousemove', handleMouseMove);
        scrollRef.current.removeEventListener('mouseup', handleMouseUp);
        scrollRef.current.removeEventListener('mouseleave', handleMouseUp);
      }
    };
  }, []);
  if (isLoading) {
    return (
      <div className="p-6 bg-[#faf6ed] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BF9853] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-[#faf6ed]">
      <div className=' xl:w-[1850px] bg-white text-left lg:flex gap-5 p-5 ml-10 mr-10 shadow-sm rounded'>
        <div className=''>
          <label className='block mb-2 font-semibold'>Advance Amount</label>
          <input
            className='w-[183px] h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
            value={`₹${advanceTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            readOnly
          />
        </div>
        <div className=' '>
          <label className='block mb-2 font-semibold'>Transfer Amount</label>
          <input
            className='w-[220px] h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
            value={`₹${transferTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            readOnly
          />
        </div>
        <div className=''>
          <label className='block mb-2 font-semibold'>Refund Amount</label>
          <input
            className='w-[220px] h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
            value={`₹${refundTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            readOnly
          />
        </div>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg w-full">
          <p className="font-semibold">Warning:</p>
          <p>{error}</p>
        </div>
      )}
      <div className=' xl:w-[1850px] bg-white mt-5 pt-5 ml-10 mr-10'>
        <div
          className={`text-left flex ${selectDate || selectEmployeeName || selectPurpose || selectTransferTo || selectType || selectMode
            ? 'flex-col sm:flex-row sm:justify-between'
            : 'flex-row justify-between items-center'
            } mb-3 gap-2`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
            <button className='pl-2' onClick={() => setShowFilters(!showFilters)}>
              <img
                src={Filter}
                alt="Toggle Filter"
                className="w-7 h-7 border border-[#BF9853] rounded-md ml-3"
              />
            </button>
            {(selectDate || selectEmployeeName || selectPurpose || selectTransferTo || selectType || selectMode) && (
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                {selectDate && (
                  <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                    <span className="font-normal">Date: </span>
                    <span className="font-bold">{selectDate}</span>
                    <button onClick={() => setSelectDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectEmployeeName && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Employee: </span>
                    <span className="font-bold">{selectEmployeeName}</span>
                    <button onClick={() => setSelectEmployeeName('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectPurpose && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Purpose:</span>
                    <span className="font-bold">{selectPurpose}</span>
                    <button onClick={() => setSelectPurpose('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectTransferTo && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Transfer To: </span>
                    <span className="font-bold">{selectTransferTo}</span>
                    <button onClick={() => setSelectTransferTo('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectType && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Type: </span>
                    <span className="font-bold">{selectType}</span>
                    <button onClick={() => setSelectType('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectMode && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Mode: </span>
                    <span className="font-bold">{selectMode}</span>
                    <button onClick={() => setSelectMode('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className='space-x-4 flex justify-end mr-4'>
            <button onClick={exportPDF} className='text-sm text-[#E4572E] hover:underline font-bold'>Export PDF</button>
            <button onClick={exportCSV} className='text-sm text-[#007233] hover:underline font-bold'>Export XL</button>
            <button className='text-sm text-[#BF9853] hover:underline font-bold'>Print</button>
          </div>
        </div>
        <div className='border-l-8 border-l-[#BF9853] rounded-lg ml-5 mr-5'>
          <div
            ref={scrollRef}
            className='overflow-auto max-h-[500px]'
            style={{ willChange: 'scroll-position' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-white ">
                <tr className="bg-[#FAF6ED]">
                  <th className="pt-2 pl-3 min-w-[100px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 min-w-[150px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('employee')}
                  >
                    Employee Name {sortConfig.key === 'employee' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 min-w-[200px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('purpose')}
                  >
                    Purpose {sortConfig.key === 'purpose' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 min-w-[200px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('transfer')}
                  >
                    Transfer To {sortConfig.key === 'transfer' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 min-w-[80px] font-bold text-left">Advance</th>
                  <th className="px-2 min-w-[80px] font-bold text-left">Refund</th>
                  <th className="px-2 min-w-[80px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('type')}
                  >
                    Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 min-w-[100px] font-bold text-left cursor-pointer hover:bg-gray-200 pl-3"
                    onClick={() => handleSort('mode')}
                  >
                    Mode {sortConfig.key === 'mode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 min-w-[100px] font-bold text-left">Description</th>
                  <th className="px-2 min-w-[80px] font-bold text-left">Attached file</th>
                  <th className="px-2 min-w-[60px] font-bold text-left">E.No</th>
                  <th className="px-2 min-w-[80px] font-bold text-left">Activity</th>
                </tr>
                {showFilters && (
                  <tr className="bg-white border-b border-gray-200">
                    <th className="pt-2 pb-2 w-44">
                      <input
                        type="date"
                        value={selectDate}
                        onChange={(e) => setSelectDate(e.target.value)}
                        className="p-1 rounded-md bg-transparent w-32 border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none mr-10"
                        placeholder="Search Date..."
                      />
                    </th>
                    <th className="pt-2 pb-2 w-[220px]">
                      <Select
                        options={employeeNameOptions}
                        value={selectEmployeeName ? { value: selectEmployeeName, label: selectEmployeeName } : null}
                        onChange={(opt) => setSelectEmployeeName(opt ? opt.value : "")}
                        className="text-xs focus:outline-none"
                        placeholder="Employee..."
                        isSearchable
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: 'transparent',
                            borderWidth: '3px',
                            borderColor: state.isFocused
                              ? 'rgba(191, 152, 83, 0.2)'
                              : 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': {
                              borderColor: 'rgba(191, 152, 83, 0.2)',
                            },
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: '#999',
                            textAlign: 'left',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            fontSize: '15px',
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            color: 'black',
                          }),
                        }}
                      />
                    </th>
                    <th className="pt-2 pb-2 w-[300px]">
                      <Select
                        options={purposeOptions}
                        value={selectPurpose ? { value: selectPurpose, label: selectPurpose } : null}
                        onChange={(opt) => setSelectPurpose(opt ? opt.value : "")}
                        className="focus:outline-none text-xs"
                        placeholder="Purpose..."
                        isSearchable
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: 'transparent',
                            borderWidth: '3px',
                            borderColor: state.isFocused
                              ? 'rgba(191, 152, 83, 0.2)'
                              : 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': {
                              borderColor: 'rgba(191, 152, 83, 0.2)',
                            },
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: '#999',
                            textAlign: 'left',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            fontSize: '15px',
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            color: 'black',
                          }),
                        }}
                      />
                    </th>
                    <th className="pt-2 pb-2 w-[350px]">
                      <Select
                        options={transferToOptions}
                        value={selectTransferTo ? { value: selectTransferTo, label: selectTransferTo } : null}
                        onChange={(opt) => setSelectTransferTo(opt ? opt.value : "")}
                        className="focus:outline-none text-xs"
                        placeholder="Transfer To..."
                        isSearchable
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: 'transparent',
                            borderWidth: '3px',
                            borderColor: state.isFocused
                              ? 'rgba(191, 152, 83, 0.2)'
                              : 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': {
                              borderColor: 'rgba(191, 152, 83, 0.2)',
                            },
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: '#999',
                            textAlign: 'left',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            fontSize: '15px',
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            color: 'black',
                          }),
                        }}
                      />
                    </th>
                    <th className=' pt-2 pb-2'></th>
                    <th className=' pt-2 pb-2'></th>
                    <th className="pt-2 pb-2">
                      <select value={selectType} onChange={(e) => setSelectType(e.target.value)}
                        className="p-1 rounded-md bg-transparent w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                        placeholder="Type..."
                      >
                        <option value=''>Select Type...</option>
                        {typeOptions.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </th>
                    <th className="pt-2 pb-2">
                      <select value={selectMode} onChange={(e) => setSelectMode(e.target.value)}
                        className="p-1 rounded-md bg-transparent w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                        placeholder="Mode..."
                      >
                        <option value=''>Select</option>
                        {modeOptions.map(mode => (
                          <option key={mode} value={mode}>{mode}</option>
                        ))}
                      </select>
                    </th>
                    <th className="pt-2 pb-2"></th>
                    <th className=' pt-2 pb-2'></th>
                    <th className=' pt-2 pb-2'></th>
                    <th className=' pt-2 pb-2'></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((entry, index) => (
                    <TableRow
                      key={entry.id}
                      entry={entry}
                      index={index}
                      onEditClick={handleEditClick}
                      getEmployeeName={getEmployeeName}
                      getPurposeName={getPurposeName}
                      getLabourName={getLabourName}
                      formatDateOnly={formatDateOnly}
                    />
                  ))
                ) : (
                  <tr>
                    <td className="p-2 text-center text-sm text-gray-400" colSpan={12}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {sortedData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-4 bg-white">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <select value={itemsPerPage} onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:border-transparent"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
                <option value={400}>400</option>
                <option value={500}>500</option>
                <option value={600}>600</option>
                <option value={700}>700</option>
                <option value={800}>800</option>
                <option value={900}>900</option>
                <option value={1000}>1000</option>
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>
            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={goToPreviousPage} disabled={currentPage === 1}
                className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#BF9853] border border-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors'
                  }`}
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === pageNum
                        ? 'bg-[#BF9853] text-white'
                        : 'bg-white text-[#BF9853] border border-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#BF9853] border border-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors'
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {isEditModalOpen && (
          <EditModal
            isOpen={isEditModalOpen}
            editFormData={editFormData}
            setEditFormData={setEditFormData}
            employees={employees}
            laboursList={laboursList}
            staffAdvanceCombinedOptions={staffAdvanceCombinedOptions}
            purposes={purposes}
            paymentModeOptions={paymentModeOptions}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={handleUpdate}
            formatWithCommas={formatWithCommas}
          />
        )}
      </div>
    </div>
  );
};
// Memoize the main component to prevent unnecessary re-renders
export default memo(TableView);