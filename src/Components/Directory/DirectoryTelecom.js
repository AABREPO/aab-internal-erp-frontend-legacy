import React, { useEffect, useMemo, useRef, useState } from 'react'
import Select from 'react-select'
import edit from '../Images/Edit.svg'
import deleteIcon from '../Images/Delete.svg'
import search from '../Images/search.png'
import imports from '../Images/Import.svg'
import filterIcon from '../Images/filter (3).png'

const DirectoryTelecom = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'https://backendaab.in/aabuildersDash';

  const [activeTab, setActiveTab] = useState('clients');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInputsOpen, setIsInputsOpen] = useState(false);
  const [form, setForm] = useState({
    type: '',
    network: '',
    number: '',
    project: '',
    purpose: '',
    amount: '',
    paymentDate: '',
    serviceStart: '',
    serviceEnd: '',
    validityValue: 0,
    validityUnit: '',
    registeredPerson: '',
    assignedPerson: ''
  });
  const [filters, setFilters] = useState({
    year: '',
    vendor: '',
    service: '',
    doorNo: '',
    shop: '',
    project: '',
    tenant: '',
    status: '',
    date: ''
  });
  const [activeAddPopup, setActiveAddPopup] = useState(null);
  const [addPopupValue, setAddPopupValue] = useState('');
  const [typeItems, setTypeItems] = useState([]);
  const [networkItems, setNetworkItems] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [projectItems, setProjectItems] = useState([]);
  const [telecomEntries, setTelecomEntries] = useState([]);
  const [telecomLoading, setTelecomLoading] = useState(false);
  const [telecomError, setTelecomError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isFilterRowVisible, setIsFilterRowVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [typeSearch, setTypeSearch] = useState('');
  const [networkSearch, setNetworkSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const fileInputRefs = useRef({});

  const addPopupContent = {
    type: {
      title: 'Add Type',
      label: 'Service Type',
      placeholder: 'Enter type name'
    },
    network: {
      title: 'Add Network',
      label: 'Service Provider',
      placeholder: 'Enter network name'
    },
    category: {
      title: 'Add Category',
      label: 'Purpose',
      placeholder: 'Enter category name'
    }
  };
  const listConfig = {
    type: {
      getItems: () => typeItems,
      setItems: setTypeItems,
      endpoints: {
        list: '/api/utility-telecom-service-type/all',
        create: '/api/utility-telecom-service-type/save',
        update: (id) => `/api/utility-telecom-service-type/update/${id}`,
        delete: (id) => `/api/utility-telecom-service-type/delete/${id}`
      },
      requestKey: 'telecom_service_type',
      responseKeys: ['telecom_service_type', 'telecomServiceType']
    },
    network: {
      getItems: () => networkItems,
      setItems: setNetworkItems,
      endpoints: {
        list: '/api/utility-telecom-service-provider/all',
        create: '/api/utility-telecom-service-provider/save',
        update: (id) => `/api/utility-telecom-service-provider/update/${id}`,
        delete: (id) => `/api/utility-telecom-service-provider/delete/${id}`
      },
      requestKey: 'telecom_service_provider',
      responseKeys: ['telecom_service_provider', 'telecomServiceProvider']
    },
    category: {
      getItems: () => categoryItems,
      setItems: setCategoryItems,
      endpoints: {
        list: '/api/utility-telecom-purpose/all',
        create: '/api/utility-telecom-purpose/save',
        update: (id) => `/api/utility-telecom-purpose/update/${id}`,
        delete: (id) => `/api/utility-telecom-purpose/delete/${id}`
      },
      requestKey: 'telecom_purpose',
      responseKeys: ['telecom_purpose', 'telecomPurpose']
    }
  };
  const DAY_IN_MS = 1000 * 60 * 60 * 24;
  const toDateAtMidnight = (value) => {
    if (!value) return null;
    const date =
      value instanceof Date
        ? new Date(value.getTime())
        : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const formatDateInputValue = (date) => {
    if (!(date instanceof Date)) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const addMonthsRespectingEndOfMonth = (sourceDate, months) => {
    const result = new Date(sourceDate);
    const originalDay = result.getDate();
    result.setDate(1);
    result.setMonth(result.getMonth() + months);
    const lastDayOfTargetMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(originalDay, lastDayOfTargetMonth));
    result.setHours(0, 0, 0, 0);
    return result;
  };
  const computeServiceEndDate = (startValue, validityValue, validityUnit) => {
    const startDate = toDateAtMidnight(startValue);
    const numericValidity = Number(validityValue);
    const normalizedUnit = (validityUnit ?? '').toLowerCase();
    if (!startDate || !Number.isFinite(numericValidity) || numericValidity <= 0 || !normalizedUnit) {
      return null;
    }
    let endDate;
    if (normalizedUnit === 'days') {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (numericValidity - 1));
    } else if (normalizedUnit === 'months') {
      endDate = addMonthsRespectingEndOfMonth(startDate, numericValidity);
    } else if (normalizedUnit === 'years') {
      endDate = addMonthsRespectingEndOfMonth(startDate, numericValidity * 12);
    } else {
      return null;
    }
    endDate.setHours(0, 0, 0, 0);
    return formatDateInputValue(endDate);
  };
  const deriveValidityFromDateRange = (startValue, endValue) => {
    const startDate = toDateAtMidnight(startValue);
    const endDate = toDateAtMidnight(endValue);
    if (!startDate || !endDate || endDate < startDate) {
      return null;
    }
    const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / DAY_IN_MS) + 1;
    const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    if (totalMonths > 0) {
      const candidateEnd = addMonthsRespectingEndOfMonth(startDate, totalMonths);
      if (candidateEnd.getTime() === endDate.getTime()) {
        if (totalMonths % 12 === 0) {
          const years = totalMonths / 12;
          if (years > 0) {
            return {
              value: years,
              unit: 'Years'
            };
          }
        }
        return {
          value: totalMonths,
          unit: 'Months'
        };
      }
    }
    return {
      value: diffDays,
      unit: 'Days'
    };
  };
  const formatDisplayDate = (value) => {
    if (!value) return '-';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB');
  };
  const formatDateForInput = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    const date = toDateAtMidnight(value);
    if (!date) return '';
    return formatDateInputValue(date);
  };
  const calculateExpiryDate = (startDate, validityValue, validityUnit, serviceEndDate) => {
    const explicitEnd = toDateAtMidnight(serviceEndDate);
    if (explicitEnd) {
      return explicitEnd;
    }
    const computedEnd = computeServiceEndDate(startDate, validityValue, validityUnit);
    if (!computedEnd) {
      return null;
    }
    const normalizedEnd = toDateAtMidnight(computedEnd);
    return normalizedEnd;
  };
  const calculateRemainingDays = (expiryDate) => {
    if (!expiryDate) return '-';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffMs = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (Number.isNaN(diffDays)) return '-';
    if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
    if (diffDays === 0) return 'Today';
    return 'Expired';
  };
  const calculateExpiredAgo = (expiryDate) => {
    if (!expiryDate) return '-';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffMs = today.getTime() - expiry.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (Number.isNaN(diffDays) || diffDays <= 0) return '-';
    return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
  };
  const formatAmount = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return value;
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(numberValue);
  };
  const findProjectItemByValue = (value) => {
    if (value === null || value === undefined) return undefined;
    const stringValue = String(value);
    return projectItems.find((item) => {
      const idMatch = item.id !== undefined && item.id !== null && String(item.id) === stringValue;
      const siteNoMatch = item.siteNo !== undefined && item.siteNo !== null && String(item.siteNo) === stringValue;
      return idMatch || siteNoMatch;
    });
  };
  const getProjectName = (projectId) => {
    const project = findProjectItemByValue(projectId);
    return project?.name ?? '-';
  };
  const getProjectCategory = (projectId) => {
    const project = findProjectItemByValue(projectId);
    return project?.category ?? '';
  };
  const getProjectCategoryStyles = (category) => {
    const normalized = (category ?? '').trim().toLowerCase();
    const isOwn = normalized.includes('own');
    const isClient = normalized.includes('client') || normalized.includes('cliant');
    if (isOwn) {
      return {
        backgroundColor: 'rgba(34, 197, 94, 0.18)',
        color: '#166534'
      };
    }
    if (isClient) {
      return {
        backgroundColor: 'rgba(248, 113, 113, 0.22)',
        color: '#991b1b'
      };
    }
    return {
      backgroundColor: 'rgba(191, 152, 83, 0.12)',
      color: '#1f2937'
    };
  };
  const resolveProjectIdForSave = (projectValue) => {
    if (!projectValue && projectValue !== 0) return null;
    const project = findProjectItemByValue(projectValue);
    if (project?.id !== undefined && project?.id !== null) {
      const numericId = Number(project.id);
      return Number.isNaN(numericId) ? project.id : numericId;
    }
    const numericValue = Number(projectValue);
    return Number.isNaN(numericValue) ? null : numericValue;
  };
  const getEntryStatus = (item) => {
    const expiryDate = calculateExpiryDate(
      item.service_starting_date,
      item.validity,
      item.validity_type,
      item.service_end_date ?? item.serviceEndDate
    );
    if (!expiryDate) return 'Unknown';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (Number.isNaN(diffDays)) return 'Unknown';
    if (diffDays < 0) return 'Expired';
    if (diffDays <= 7) return 'Expiring Soon';
    return 'Active';
  };
  const categoryFilterOptions = useMemo(() => {
    const categories = new Set(
      telecomEntries.map((item) => {
        const category = getProjectCategory(item.project_id);
        return category ? category : null;
      }).filter(Boolean)
    );
    return Array.from(categories).map((category) => ({
      value: category,
      label: category
    }));
  }, [telecomEntries, projectItems]);
  const statusFilterOptions = useMemo(() => {
    const statuses = new Set(telecomEntries.map((item) => getEntryStatus(item)));
    return Array.from(statuses).map((status) => ({
      value: status,
      label: status
    }));
  }, [telecomEntries]);
  const filteredTelecomEntries = useMemo(() => {
    return telecomEntries.filter((item) => {
      const paymentDateValue = item.payment_date ?? item.paymentDate ?? '';
      const paymentDateISO = paymentDateValue ? new Date(paymentDateValue).toISOString().slice(0, 10) : '';
      const serviceProviderValue = (item.service_provider ?? item.serviceProvider ?? '').toLowerCase();
      const serviceTypeValue = (item.service_type ?? item.serviceType ?? '').toLowerCase();
      const serviceNumberValue = (item.service_number ?? item.serviceNumber ?? '').toLowerCase();
      const assignedValue = (item.assigned_person ?? item.assignedPerson ?? '').toLowerCase();
      const projectIdValue = item.project_id ?? item.projectId ?? null;
      const projectCategoryValue = getProjectCategory(projectIdValue);
      const entryStatus = getEntryStatus(item);
      if (filters.project && String(filters.project) !== String(projectIdValue)) {
        return false;
      }
      if (filters.date) {
        if (paymentDateISO !== filters.date) {
          return false;
        }
      }
      if (filters.category && projectCategoryValue !== filters.category) {
        return false;
      }
      if (filters.status && entryStatus !== filters.status) {
        return false;
      }
      if (filters.vendor && !serviceProviderValue.includes(filters.vendor.toLowerCase())) {
        return false;
      }
      if (filters.service && !serviceTypeValue.includes(filters.service.toLowerCase())) {
        return false;
      }
      if (filters.tenant && !assignedValue.includes(filters.tenant.toLowerCase())) {
        return false;
      }
      if (filters.doorNo && !serviceNumberValue.includes(filters.doorNo.toLowerCase())) {
        return false;
      }
      if (filters.year) {
        const paymentYear = paymentDateValue ? String(new Date(paymentDateValue).getFullYear()) : '';
        if (paymentYear !== filters.year) {
          return false;
        }
      }
      return true;
    });
  }, [telecomEntries, filters, projectItems]);
  const filteredTypeItems = useMemo(() => {
    const term = typeSearch.trim().toLowerCase();
    if (!term) return typeItems;
    return typeItems.filter(item => item.name.toLowerCase().includes(term));
  }, [typeItems, typeSearch]);
  const filteredNetworkItems = useMemo(() => {
    const term = networkSearch.trim().toLowerCase();
    if (!term) return networkItems;
    return networkItems.filter(item => item.name.toLowerCase().includes(term));
  }, [networkItems, networkSearch]);
  const filteredCategoryItems = useMemo(() => {
    const term = categorySearch.trim().toLowerCase();
    if (!term) return categoryItems;
    return categoryItems.filter(item => item.name.toLowerCase().includes(term));
  }, [categoryItems, categorySearch]);
  const typeOptions = useMemo(
    () => typeItems.map(item => ({ value: item.name, label: item.name })),
    [typeItems]
  );
  const networkOptions = useMemo(
    () => networkItems.map(item => ({ value: item.name, label: item.name })),
    [networkItems]
  );
  const categoryOptions = useMemo(
    () => categoryItems.map(item => ({ value: item.name, label: item.name })),
    [categoryItems]
  );
  const projectOptions = useMemo(
    () => projectItems.map(item => ({
      value: String(item.id ?? item.siteNo ?? ''),
      label: item.name,
      data: item
    })),
    [projectItems]
  );
  const selectedTypeOption = useMemo(
    () => typeOptions.find(option => option.value === form.type) ?? null,
    [typeOptions, form.type]
  );
  const selectedNetworkOption = useMemo(
    () => networkOptions.find(option => option.value === form.network) ?? null,
    [networkOptions, form.network]
  );
  const selectedCategoryOption = useMemo(
    () => categoryOptions.find(option => option.value === form.purpose) ?? null,
    [categoryOptions, form.purpose]
  );
  const selectedProjectOption = useMemo(
    () => projectOptions.find(option => option.value === form.project) ?? null,
    [projectOptions, form.project]
  );
  const selectedProjectFilterOption = useMemo(
    () => projectOptions.find(option => option.value === filters.project) ?? null,
    [projectOptions, filters.project]
  );
  const selectStyles = useMemo(
    () => ({
      container: (provided) => ({
        ...provided,
        width: '100%'
      }),
      control: (provided, state) => ({
        ...provided,
        minHeight: 44,
        borderRadius: 8,
        borderColor: state.isFocused ? '#BF9853' : 'rgba(191, 152, 83, 0.3)',
        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.15)' : 'none',
        '&:hover': {
          borderColor: '#BF9853'
        }
      }),
      menu: (provided) => ({
        ...provided,
        zIndex: 9999
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
          ? '#BF9853'
          : state.isFocused
            ? 'rgba(191, 152, 83, 0.1)'
            : provided.backgroundColor,
        color: state.isSelected ? '#FFFFFF' : provided.color
      })
    }),
    []
  );
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  const clearAllFilters = () => {
    setFilters({
      year: '',
      vendor: '',
      service: '',
      doorNo: '',
      shop: '',
      project: '',
      tenant: '',
      status: '',
      date: ''
    });
  };
  const handleFormChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'serviceEnd') {
        next.serviceEnd = formatDateForInput(value);
        return next;
      }
      if (['serviceStart', 'validityValue', 'validityUnit'].includes(key)) {
        const computedEnd = computeServiceEndDate(
          next.serviceStart,
          next.validityValue,
          next.validityUnit
        );
        if (computedEnd && next.serviceEnd !== computedEnd) {
          next.serviceEnd = computedEnd;
        }
      }

      return next;
    });
  };
  const handleOpenAddPopup = (popupKey) => {
    setActiveAddPopup(popupKey)
    setAddPopupValue('')
    setEditingItem(null)
  }
  const handleCloseAddPopup = () => {
    setActiveAddPopup(null)
    setAddPopupValue('')
    setEditingItem(null)
  }
  const fetchList = async (key) => {
    const config = listConfig[key];
    if (!config) return;
    try {
      const response = await fetch(`${API_BASE_URL}${config.endpoints.list}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${key} list`);
      }
      const result = await response.json();
      if (!Array.isArray(result)) {
        throw new Error(`Unexpected response for ${key} list`);
      }
      const resolveName = (item) => {
        const keys = listConfig[key].responseKeys;
        for (const responseKey of keys) {
          if (item?.[responseKey] !== undefined && item[responseKey] !== null) {
            return item[responseKey];
          }
        }
        return '';
      };
      config.setItems(
        result.map((item, index) => ({
          id: item.id ?? index + 1,
          name: resolveName(item)
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };
  const fetchProjectItems = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/getAll');
      if (!response.ok) {
        throw new Error('Failed to fetch project list');
      }
      const result = await response.json();
      if (!Array.isArray(result)) {
        throw new Error('Unexpected response for project list');
      }
      setProjectItems(
        result.map((item, index) => ({
          id: item.id ?? item.projectId ?? index + 1,
          name: item.projectName ?? item.siteName ?? '',
          siteNo: item.projectId ?? item.siteNo ?? '',
          category: item.projectCategory ?? item.project_category ?? item.category ?? '',
          raw: item
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };
  const fetchTelecomEntries = async () => {
    setTelecomLoading(true);
    setTelecomError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/utility-telecom/getAll`);
      if (!response.ok) {
        throw new Error('Failed to fetch telecom entries');
      }
      const result = await response.json();
      if (!Array.isArray(result)) {
        throw new Error('Unexpected response for telecom entries');
      }
      setTelecomEntries(result);
    } catch (error) {
      console.error(error);
      setTelecomError('Unable to load telecom entries. Please try again.');
    } finally {
      setTelecomLoading(false);
    }
  };
  useEffect(() => {
    fetchList('type');
    fetchList('network');
    fetchList('category');
    fetchProjectItems();
    fetchTelecomEntries();
  }, []);
  useEffect(() => {
    if (!isInputsOpen) return;
    fetchList('type');
    fetchList('network');
    fetchList('category');
  }, [isInputsOpen]);
  useEffect(() => {
    if (!isCreateOpen) return;
    fetchProjectItems();
    setSaveError('');
  }, [isCreateOpen]);
  useEffect(() => {
    const { serviceStart, serviceEnd } = form;
    if (!serviceStart || !serviceEnd) {
      return;
    }
    const validity = deriveValidityFromDateRange(serviceStart, serviceEnd);
    setForm((prev) => {
      if (!validity) {
        if (prev.validityValue === 0 && prev.validityUnit === '') {
          return prev;
        }
        return {
          ...prev,
          validityValue: 0,
          validityUnit: ''
        };
      }
      if (prev.validityValue === validity.value && prev.validityUnit === validity.unit) {
        return prev;
      }
      return {
        ...prev,
        validityValue: validity.value,
        validityUnit: validity.unit
      };
    });
  }, [form.serviceStart, form.serviceEnd]);
  const durationDaysLabel = useMemo(() => {
    if (form.validityUnit !== 'Days') {
      return '';
    }
    const startDate = toDateAtMidnight(form.serviceStart);
    const endDate = toDateAtMidnight(form.serviceEnd);
    if (!startDate || !endDate || endDate < startDate) {
      return '';
    }
    const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / DAY_IN_MS) + 1;
    if (!Number.isFinite(diffDays) || diffDays <= 0) {
      return '';
    }
    return `Duration: ${diffDays} Day${diffDays === 1 ? '' : 's'}`;
  }, [form.serviceStart, form.serviceEnd, form.validityUnit]);
  const handleSubmitAddPopup = () => {
    if (!activeAddPopup) return;
    const { setItems, endpoints, requestKey, responseKeys } = listConfig[activeAddPopup];
    const trimmedValue = addPopupValue.trim();
    if (!trimmedValue) return;
    const payload = { [requestKey]: trimmedValue };
    const isEditing = Boolean(editingItem?.id);
    const saveItem = async () => {
      const optimisticId = isEditing ? editingItem.id : Date.now();
      if (!isEditing) {
        setItems(prev => [
          ...prev,
          {
            id: optimisticId,
            name: trimmedValue
          }
        ]);
      } else {
        setItems(prev =>
          prev.map(item =>
            item.id === optimisticId ? { ...item, name: trimmedValue } : item
          )
        );
      }
      try {
        const url = isEditing
          ? `${API_BASE_URL}${endpoints.update(editingItem.id)}`
          : `${API_BASE_URL}${endpoints.create}`;
        const response = await fetch(url, {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error(`Failed to ${isEditing ? 'update' : 'save'} ${activeAddPopup} item`);
        }
        const savedItem = await response.json();
        const resolvedName =
          responseKeys.map((key) => savedItem?.[key]).find((value) => value !== undefined && value !== null) ??
          trimmedValue;
        setItems(prev =>
          prev.map(item =>
            item.id === optimisticId
              ? { id: savedItem.id ?? optimisticId, name: resolvedName }
              : item
          )
        );
        await fetchList(activeAddPopup);
      } catch (error) {
        console.error(error);
        setItems(prev => {
          if (isEditing) {
            return prev.map(item =>
              item.id === editingItem.id
                ? { id: editingItem.id, name: editingItem.name }
                : item
            );
          }
          return prev.filter(item => item.id !== optimisticId);
        });
      } finally {
        handleCloseAddPopup();
      }
    };
    saveItem();
  };
  const handleCreateSubmit = async () => {
    const projectIdValue = resolveProjectIdForSave(form.project);
    const payload = {
      service_type: form.type || null,
      service_provider: form.network || null,
      service_number: form.number || null,
      project_id: projectIdValue,
      purpose: form.purpose || null,
      amount: form.amount ? Number(form.amount) : 0,
      payment_date: form.paymentDate || null,
      service_starting_date: form.serviceStart || null,
      service_end_date: form.serviceEnd || null,
      validity: form.validityValue ? String(form.validityValue) : null,
      validity_type: form.validityUnit || null,
      registered_person: form.registeredPerson || null,
      assigned_person: form.assignedPerson || null
    };
    setIsSaving(true);
    setSaveError('');
    const isEditing = Boolean(editingEntry?.id);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/utility-telecom/${isEditing ? `update/${editingEntry.id}` : 'save'}`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'save'} telecom details`);
      }
      await fetchTelecomEntries();
      closeCreateModal(true);
    } catch (error) {
      console.error(error);
      setSaveError(`Failed to ${isEditing ? 'update' : 'save'} telecom details. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };
  const handleImportClick = (key) => {
    fileInputRefs.current[key]?.click();
  }
  const handleFileImport = (key, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const config = listConfig[key];
    if (!config) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      if (!lines.length) return;
      const uploadItems = async () => {
        const existingNames = new Set(config.getItems().map(item => item.name.toLowerCase()));
        const uniqueValues = lines.filter(line => !existingNames.has(line.toLowerCase()));
        if (!uniqueValues.length) return;
        const createdItems = [];
        for (const value of uniqueValues) {
          const payload = { [config.requestKey]: value };
          try {
            const response = await fetch(`${API_BASE_URL}${config.endpoints.create}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });
            if (!response.ok) {
              throw new Error(`Failed to import ${key} item: ${value}`);
            }
            const savedItem = await response.json();
            createdItems.push({
              id: savedItem.id ?? value,
              name:
                config.responseKeys
                  .map(responseKey => savedItem?.[responseKey])
                  .find((val) => val !== undefined && val !== null) ?? value
            });
          } catch (error) {
            console.error(error);
          }
        }
        if (createdItems.length) {
          config.setItems(prev => {
            const startIndex = prev.length;
            return [
              ...prev,
              ...createdItems.map((item, index) => ({
                id: typeof item.id === 'number' ? item.id : startIndex + index + 1,
                name: item.name
              }))
            ];
          });
        }
      };
      uploadItems();
    };
    reader.readAsText(file);
    event.target.value = '';
  }
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderWidth: '2px',
      height: '45px',
      borderRadius: '8px',
      borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
      '&:hover': {
        borderColor: 'rgba(191, 152, 83, 0.2)',
      }
    }),
  };
  const handleEditItem = (key, item) => {
    setActiveAddPopup(key);
    setAddPopupValue(item.name ?? '');
    setEditingItem({ ...item, key });
  };
  const handleDeleteItem = async (key, item) => {
    const config = listConfig[key];
    if (!config?.endpoints?.delete) return;
    const confirmed = window.confirm('Are you sure you want to delete this entry?');
    if (!confirmed) return;
    try {
      const response = await fetch(`${API_BASE_URL}${config.endpoints.delete(item.id)}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Failed to delete ${key} item`);
      }
      await fetchList(key);
    } catch (error) {
      console.error(error);
    }
  };
  const handleDeleteEntry = async (item) => {
    if (!item?.id) return;
    const confirmed = window.confirm('Are you sure you want to delete this telecom entry?');
    if (!confirmed) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/utility-telecom/delete/${item.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete telecom entry');
      }
      await fetchTelecomEntries();
    } catch (error) {
      console.error(error);
    }
  };
  const resetForm = () => {
    setForm({
      type: '',
      network: '',
      number: '',
      project: '',
      purpose: '',
      amount: '',
      paymentDate: '',
      serviceStart: '',
      serviceEnd: '',
      validityValue: 0,
      validityUnit: '',
      registeredPerson: '',
      assignedPerson: ''
    });
  }
  const closeCreateModal = (force = false) => {
    if (isSaving && !force) return;
    setIsCreateOpen(false);
    setEditingEntry(null);
    resetForm();
    setSaveError('');
  };
  const openCreateModal = (entry = null) => {
    if (entry) {
      const validityRaw = entry.validity ?? entry.validity_value ?? entry.validityValue ?? '';
      const parsedValidity = Number(validityRaw);
      const amountRaw = entry.amount ?? entry.amount_value ?? entry.amountValue ?? '';
      const projectRaw = entry.project_id ?? entry.projectId ?? entry.project ?? '';
      setForm({
        type: entry.service_type ?? entry.serviceType ?? '',
        network: entry.service_provider ?? entry.serviceProvider ?? '',
        number: entry.service_number ?? entry.serviceNumber ?? '',
        project: projectRaw !== undefined && projectRaw !== null ? String(projectRaw) : '',
        purpose: entry.purpose ?? '',
        amount:
          amountRaw !== undefined && amountRaw !== null && amountRaw !== ''
            ? String(amountRaw)
            : '',
        paymentDate: formatDateForInput(entry.payment_date ?? entry.paymentDate),
        serviceStart: formatDateForInput(entry.service_starting_date ?? entry.serviceStartingDate),
        serviceEnd: formatDateForInput(entry.service_end_date ?? entry.serviceEndDate),
        validityValue: Number.isNaN(parsedValidity) ? 0 : parsedValidity,
        validityUnit: entry.validity_type ?? entry.validityType ?? '',
        registeredPerson: entry.registered_person ?? entry.registeredPerson ?? '',
        assignedPerson: entry.assigned_person ?? entry.assignedPerson ?? ''
      });
      setEditingEntry(entry);
    } else {
      resetForm();
      setEditingEntry(null);
    }
    setSaveError('');
    setIsCreateOpen(true);
  };
  return (
    <div className=" rounded-lg shadow-sm ">
      <div className="bg-white lg:flex gap-3 p-4 ml-5 mr-5 rounded-md lg:h-[128px] text-left">
        <div>
          <label className="block font-semibold mb-1">Year</label>
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Year</option>
            <option>2024</option>
            <option>2025</option>
            <option>2026</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Vendor</label>
          <select
            value={filters.vendor}
            onChange={(e) => handleFilterChange('vendor', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Vendor</option>
            <option>Jio</option>
            <option>Airtel</option>
            <option>BSNL</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Service</label>
          <select
            value={filters.service}
            onChange={(e) => handleFilterChange('service', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Service</option>
            <option>DTH</option>
            <option>Landline</option>
            <option>Mobile</option>
            <option>CCTV</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Door No</label>
          <select
            value={filters.doorNo}
            onChange={(e) => handleFilterChange('doorNo', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Door No</option>
            <option>Office</option>
            <option>Godown</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Shop</label>
          <select
            value={filters.shop}
            onChange={(e) => handleFilterChange('shop', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Shop</option>
            <option>AA Plot</option>
            <option>Kambathupatti</option>
          </select>
        </div>
        <div className="w-full md:w-48">
          <label className="block font-semibold mb-1">Project Name</label>
          <Select
            value={selectedProjectFilterOption}
            onChange={(option) => handleFilterChange('project', option?.value ?? '')}
            options={projectOptions}
            styles={customStyles}
            placeholder="Select Project"
            isSearchable
            isClearable
            classNamePrefix="telecom-select"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Tenant</label>
          <select
            value={filters.tenant}
            onChange={(e) => handleFilterChange('tenant', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Tenant</option>
            <option>Amir H</option>
            <option>Jothi S</option>
          </select>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto bg-white p-4 ml-5 mr-5 rounded-md">
        <div className=" flex flex-col md:flex-row md:items-center md:justify-between mt-5 mb-3">
          <div className="inline-flex rounded-md p-1 w-fit gap-4">
            <button className="inline-flex items-center gap-2 text-sm font-semibold rounded-md px-3 py-1 shadow-lg" onClick={() => setIsFilterRowVisible(prev => !prev)} >
              <img src={filterIcon} alt="filter" className="w-4 h-5" />
            </button>
            <button className={'px-6 py-2 rounded font-semibold transition-colors border border-gray-300 hover:bg-gray-50'} >
              Clients Projects
            </button>
            <button className={'px-6 py-2 rounded font-semibold transition-colors border border-gray-300 hover:bg-gray-50'} >
              Own Projects
            </button>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <button className="h-10 text-[#E4572E] hover:underline">Export PDF</button>
            <button className="h-10 text-[#007233] hover:underline">Export XL</button>
            <button className="h-10 text-[#BF9853] hover:underline">Print</button>
            <button className="h-10 px-4 bg-[#BF9853] text-white rounded-md" onClick={() => setIsInputsOpen(true)}>Add New</button>
            <button className="h-10 px-4 bg-[#BF9853] text-white rounded-md" onClick={() => openCreateModal()}>Create</button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-3 px-2">
          {(filters.date || filters.project || filters.category || filters.status || filters.vendor || filters.service) && (
            <div className="flex flex-wrap gap-2 items-center">
              {filters.date && (
                <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium">
                  <span className="font-normal">Date:</span>
                  <span className="font-bold">{filters.date}</span>
                  <button onClick={() => handleFilterChange('date', '')} className="text-[#BF9853] ml-1 text-lg leading-none">×</button>
                </span>
              )}
              {filters.project && (
                <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium">
                  <span className="font-normal">Project:</span>
                  <span className="font-bold">{getProjectName(filters.project)}</span>
                  <button onClick={() => handleFilterChange('project', '')} className="text-[#BF9853] ml-1 text-lg leading-none">×</button>
                </span>
              )}
              {filters.vendor && (
                <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium">
                  <span className="font-normal">Provider:</span>
                  <span className="font-bold">{filters.vendor}</span>
                  <button onClick={() => handleFilterChange('vendor', '')} className="text-[#BF9853] ml-1 text-lg leading-none">×</button>
                </span>
              )}
              {filters.service && (
                <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium">
                  <span className="font-normal">Type:</span>
                  <span className="font-bold">{filters.service}</span>
                  <button onClick={() => handleFilterChange('service', '')} className="text-[#BF9853] ml-1 text-lg leading-none">×</button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium">
                  <span className="font-normal">Category:</span>
                  <span className="font-bold">{filters.category}</span>
                  <button onClick={() => handleFilterChange('category', '')} className="text-[#BF9853] ml-1 text-lg leading-none">×</button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium">
                  <span className="font-normal">Status:</span>
                  <span className="font-bold">{filters.status}</span>
                  <button onClick={() => handleFilterChange('status', '')} className="text-[#BF9853] ml-1 text-lg leading-none">×</button>
                </span>
              )}
              <button onClick={clearAllFilters}
                className="text-[#BF9853] border border-[#BF9853] rounded px-3 py-1 text-sm font-medium hover:bg-[#BF9853] hover:text-white transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
        <div className="rounded-lg border-l-8 border-l-[#BF9853]">
          <table className="w-full table-auto mb-4 border-collapse">
            <thead>
              <tr className="bg-[#FAF6ED] text-left">
                <th className="p-2 pl-3">Sl.No</th>
                <th className="p-2">Projects</th>
                <th className="p-2">Service Provider</th>
                <th className="p-2">Type</th>
                <th className="p-2">Number</th>
                <th className="p-2">Payment Date</th>
                <th className="p-2">Validity</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Exp Date</th>
                <th className="p-2">Remain Days</th>
                <th className="p-2">Exp Ago</th>
                <th className="p-2">Registered</th>
                <th className="p-2">Assigned</th>
                <th className="p-2">Activity</th>
              </tr>
              {isFilterRowVisible && (
                <tr className="bg-white border-b border-gray-200 text-sm">
                  <th className="p-2 pl-3"></th>
                  <th className="p-2 space-y-2">
                    <Select
                      value={selectedProjectFilterOption}
                      onChange={(option) => handleFilterChange('project', option?.value ?? '')}
                      options={projectOptions}
                      styles={customStyles}
                      placeholder="All projects"
                      isSearchable
                      isClearable
                      classNamePrefix="telecom-select"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      value={filters.vendor}
                      onChange={(e) => handleFilterChange('vendor', e.target.value)}
                      placeholder="Service provider..."
                      className="w-full h-10 border border-[#BF9853]/40 rounded-md px-2 text-sm focus:outline-none"
                    />
                  </th>
                  <th className="p-2">
                    <Select
                      value={filters.service ? { value: filters.service, label: filters.service } : null}
                      onChange={(option) => handleFilterChange('service', option?.value ?? '')}
                      options={typeOptions}
                      styles={customStyles}
                      placeholder="Service type"
                      isSearchable
                      isClearable
                      classNamePrefix="telecom-select"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      value={filters.doorNo}
                      onChange={(e) => handleFilterChange('doorNo', e.target.value)}
                      placeholder="Service number..."
                      className="w-full h-10 border border-[#BF9853]/40 rounded-md px-2 text-sm focus:outline-none"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(e) => handleFilterChange('date', e.target.value)}
                      className="w-full h-10 border border-[#BF9853]/40 rounded-md px-2 text-sm focus:outline-none"
                    />
                  </th>
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                  <th className="p-2">
                    <Select
                      value={filters.status ? { value: filters.status, label: filters.status } : null}
                      onChange={(option) => handleFilterChange('status', option?.value ?? '')}
                      options={statusFilterOptions}
                      styles={customStyles}
                      placeholder="Status"
                      isSearchable
                      isClearable
                      classNamePrefix="telecom-select"
                    />
                  </th>
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                  <th className="p-2">
                    <input
                      value={filters.tenant}
                      onChange={(e) => handleFilterChange('tenant', e.target.value)}
                      placeholder="Assigned person..."
                      className="w-full h-10 border border-[#BF9853]/40 rounded-md px-2 text-sm focus:outline-none"
                    />
                  </th>
                  <th className="p-2"></th>
                </tr>
              )}
            </thead>
            <tbody>
              {telecomLoading && (
                <tr>
                  <td colSpan={13} className="p-4 text-center text-gray-500">Loading telecom entries...</td>
                </tr>
              )}
              {!telecomLoading && telecomError && (
                <tr>
                  <td colSpan={13} className="p-4 text-center text-red-600">{telecomError}</td>
                </tr>
              )}
              {!telecomLoading && !telecomError && telecomEntries.length === 0 && (
                <tr>
                  <td colSpan={13} className="p-4 text-center text-gray-500">No telecom entries found.</td>
                </tr>
              )}
              {!telecomLoading && !telecomError && telecomEntries.length > 0 && filteredTelecomEntries.length === 0 && (
                <tr>
                  <td colSpan={13} className="p-4 text-center text-gray-500">No telecom entries match the applied filters.</td>
                </tr>
              )}
              {!telecomLoading && !telecomError && filteredTelecomEntries.map((item, index) => {
                const expiry_date = calculateExpiryDate(
                  item.service_starting_date,
                  item.validity,
                  item.validity_type,
                  item.service_end_date ?? item.serviceEndDate
                );
                const validityLabel = item.validity && item.validity_type
                  ? `${item.validity} ${item.validity_type}`
                  : item.validity || '-';
                const projectCategory = getProjectCategory(item.project_id);
                const providerStyles = getProjectCategoryStyles(projectCategory);
                return (
                  <tr key={item.id ?? index} className="border-b last:border-b-0">
                    <td className="p-2 pl-3">{index + 1}</td>
                    <td className="p-2">{getProjectName(item.project_id)}</td>
                    <td className="p-2">
                      <span
                        className="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-semibold"
                        style={providerStyles}
                        title={projectCategory ? `Category: ${projectCategory}` : undefined}
                      >
                        {item.service_provider || '-'}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="font-semibold">{item.service_type || '-'}</div>
                    </td>
                    <td className="p-2">{item.service_number || '-'}</td>
                    <td className="p-2">{formatDisplayDate(item.payment_date)}</td>
                    <td className="p-2">{validityLabel}</td>
                    <td className="p-2">{formatAmount(item.amount)}</td>
                    <td className="p-2">{formatDisplayDate(expiry_date)}</td>
                    <td className="p-2">{calculateRemainingDays(expiry_date)}</td>
                    <td className="p-2">{calculateExpiredAgo(expiry_date)}</td>
                    <td className="p-2">{item.registered_person || '-'}</td>
                    <td className="p-2">{item.assigned_person || '-'}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <button className="p-1 rounded " title="Edit" onClick={() => openCreateModal(item)}>
                          <img src={edit} alt="edit" className="w-4 h-4" />
                        </button>
                        <button className="p-1 rounded " title="Delete" onClick={() => handleDeleteEntry(item)}>
                          <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {isInputsOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsInputsOpen(false)} />
            <div className="relative z-40 bg-white rounded-lg shadow-xl p-5 w-[900px] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Telecom Inputs</h3>
                <button className="text-red-600 text-2xl" onClick={() => setIsInputsOpen(false)}>×</button>
              </div>
              <div className="flex overflow-x-auto space-x-[1%] pb-4">
                <div>
                  <div className="ml-5">
                    <div className="flex items-center mb-2">
                      <input
                        type="text"
                        placeholder="Search type..."
                        value={typeSearch}
                        onChange={(e) => setTypeSearch(e.target.value)}
                        className="border-2 rounded-lg border-[#BF9853] w-[240px] h-[45px] border-opacity-[0.17] pl-3 placeholder:text-sm placeholder:text-gray-500 placeholder:font-semibold"
                      />
                      <button className="-ml-8 mt-5 transform -translate-y-1/2 text-gray-500">
                        <img src={search} alt='search' className=' w-5 h-5' />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <button className="text-[#E4572E] font-semibold text-sm flex" onClick={() => handleImportClick('type')}>
                        <img src={imports} alt="import" className="w-6 h-5 bg-transparent pr-2 mt-1" />
                        <h1 className="mt-1.5">Import file</h1>
                      </button>
                      <button
                        className="text-black font-bold px-1 ml-6 rounded border-dashed border-b-2 border-[#BF9853]"
                        onClick={() => handleOpenAddPopup('type')}
                      >
                        + Add
                      </button>
                    </div>
                    <div className="rounded-lg border border-gray-200 mt-4 border-l-8 border-l-[#BF9853] w-[230px]">
                      <div className="bg-[#FAF6ED]">
                        <table className="table-auto">
                          <thead>
                            <tr className="border-b">
                              <th className="p-2 text-left w-16 text-base font-bold">S.No</th>
                              <th className="p-2 text-left w-40 text-base font-bold">Service Type</th>
                            </tr>
                          </thead>
                        </table>
                      </div>
                      <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <table className="table-auto w-full">
                          <tbody>
                            {filteredTypeItems.map((item) => (
                              <tr key={`${item.id}-${item.name}`} className="border-b last:border-b-0 group">
                                <td className="p-2 w-16 font-semibold">{item.id}</td>
                                <td className="p-2 w-40 flex justify-between">{item.name}
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button onClick={() => handleEditItem('type', item)} className="p-1 rounded hover:bg-gray-100">
                                      <img src={edit} alt="edit" className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteItem('type', item)} className="p-1 rounded hover:bg-gray-100">
                                      <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="ml-7">
                    <div className="flex items-center mb-2">
                      <input
                        type="text"
                        placeholder="Search provider..."
                        value={networkSearch}
                        onChange={(e) => setNetworkSearch(e.target.value)}
                        className="border-2 rounded-lg border-[#BF9853] w-[240px] h-[45px] border-opacity-[0.17] pl-3 placeholder:text-sm placeholder:text-gray-500 placeholder:font-semibold"
                      />
                      <button className="-ml-8 mt-5 transform -translate-y-1/2 text-gray-500">
                        <img src={search} alt='search' className=' w-5 h-5' />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <button className="text-[#E4572E] font-semibold text-sm flex" onClick={() => handleImportClick('network')}>
                        <img src={imports} alt="import" className="w-6 h-5 bg-transparent pr-2 mt-1" />
                        <h1 className="mt-1.5">Import file</h1>
                      </button>
                      <button className="text-black font-bold px-1 ml-6 rounded border-dashed border-b-2 border-[#BF9853]" onClick={() => handleOpenAddPopup('network')}>
                        + Add
                      </button>
                    </div>
                    <div className="rounded-lg border border-gray-200 mt-4 border-l-8 border-l-[#BF9853] w-[230px]">
                      <div className="bg-[#FAF6ED]">
                        <table className="table-auto">
                          <thead>
                            <tr className="border-b">
                              <th className="p-2 text-left w-16 text-base font-bold">S.No</th>
                              <th className="p-2 text-left w-40 text-base font-bold">Service Provider</th>
                            </tr>
                          </thead>
                        </table>
                      </div>
                      <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <table className="table-auto w-full">
                          <tbody>
                            {filteredNetworkItems.map((item) => (
                              <tr key={`${item.id}-${item.name}`} className="border-b last:border-b-0 group">
                                <td className="p-2 w-16 font-semibold">{item.id}</td>
                                <td className="p-2 w-40 flex justify-between">{item.name}
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button onClick={() => handleEditItem('network', item)} className="p-1 rounded hover:bg-gray-100">
                                      <img src={edit} alt="edit" className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteItem('network', item)} className="p-1 rounded hover:bg-gray-100">
                                      <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="ml-7">
                    <div className="flex items-center mb-2">
                      <input
                        type="text"
                        placeholder="Search purpose..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="border-2 rounded-lg border-[#BF9853] w-[240px] h-[45px] border-opacity-[0.17] pl-3 placeholder:text-sm placeholder:text-gray-500 placeholder:font-semibold"
                      />
                      <button className="-ml-8 mt-5 transform -translate-y-1/2 text-gray-500">
                        <img src={search} alt='search' className=' w-5 h-5' />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <button className="text-[#E4572E] font-semibold text-sm flex" onClick={() => handleImportClick('category')}>
                        <img src={imports} alt="import" className="w-6 h-5 bg-transparent pr-2 mt-1" />
                        <h1 className="mt-1.5">Import file</h1>
                      </button>
                      <button className="text-black font-bold px-1 ml-6 rounded border-dashed border-b-2 border-[#BF9853]" onClick={() => handleOpenAddPopup('category')}>
                        + Add
                      </button>
                    </div>
                    <div className="rounded-lg border border-gray-200 mt-4 border-l-8 border-l-[#BF9853] w-[230px]">
                      <div className="bg-[#FAF6ED]">
                        <table className="table-auto">
                          <thead>
                            <tr className="border-b">
                              <th className="p-2 text-left w-16 text-base font-bold">S.No</th>
                              <th className="p-2 text-left w-40 text-base font-bold">Purpose</th>
                            </tr>
                          </thead>
                        </table>
                      </div>
                      <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <table className="table-auto w-full">
                          <tbody>
                            {filteredCategoryItems.map((item) => (
                              <tr key={`${item.id}-${item.name}`} className="border-b last:border-b-0 group">
                                <td className="p-2 w-16 font-semibold">{item.id}</td>
                                <td className="p-2 w-40 flex justify-between">{item.name}
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button onClick={() => handleEditItem('category', item)} className="p-1 rounded hover:bg-gray-100">
                                      <img src={edit} alt="edit" className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteItem('category', item)} className="p-1 rounded hover:bg-gray-100">
                                      <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mr-10 mb-4">
                <button className="px-6 py-2 bg-[#BF9853] text-white rounded-md">Save</button>
                <button className="px-6 py-2 border border-[#BF9853] text-[#BF9853] rounded-md" onClick={() => setIsInputsOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {activeAddPopup && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={handleCloseAddPopup} />
            <div className="relative z-50 bg-white rounded-lg shadow-xl w-[400px] max-w-[90vw] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{addPopupContent[activeAddPopup].title}</h3>
                <button className="text-red-600 text-2xl leading-none" onClick={handleCloseAddPopup}>×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-left mb-1">{addPopupContent[activeAddPopup].label}</label>
                  <input
                    value={addPopupValue}
                    onChange={(e) => setAddPopupValue(e.target.value)}
                    placeholder={addPopupContent[activeAddPopup].placeholder}
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button className="px-6 py-2 border border-[#BF9853] text-[#BF9853] rounded-md" onClick={handleCloseAddPopup} >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-2 bg-[#BF9853] text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleSubmitAddPopup}
                    disabled={!addPopupValue.trim()}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <input
          type="file"
          accept=".txt,.csv"
          className="hidden"
          ref={(el) => { fileInputRefs.current.type = el; }}
          onChange={(event) => handleFileImport('type', event)}
        />
        <input
          type="file"
          accept=".txt,.csv"
          className="hidden"
          ref={(el) => { fileInputRefs.current.network = el; }}
          onChange={(event) => handleFileImport('network', event)}
        />
        <input
          type="file"
          accept=".txt,.csv"
          className="hidden"
          ref={(el) => { fileInputRefs.current.category = el; }}
          onChange={(event) => handleFileImport('category', event)}
        />
        {isCreateOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeCreateModal} />
            <div className="relative z-40 bg-white rounded-lg shadow-xl w-[860px] max-w-[92vw]">
              <div className="flex items-center justify-between px-6 py-4">
                <h3 className="text-lg font-semibold">{editingEntry ? 'Edit Telecom Details' : 'Telecom Details'}</h3>
                <button className="text-red-600 text-2xl" onClick={closeCreateModal}>×</button>
              </div>
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                {saveError && (
                  <div className="md:col-span-3">
                    <p className="text-red-600 text-sm font-medium">{saveError}</p>
                  </div>
                )}
                <div>
                  <label className="block font-semibold mb-1">Service Type</label>
                  <Select
                    value={selectedTypeOption}
                    onChange={(option) => handleFormChange('type', option?.value ?? '')}
                    options={typeOptions}
                    styles={customStyles}
                    placeholder="Select"
                    isSearchable
                    isClearable
                    classNamePrefix="telecom-select"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Service Provider</label>
                  <Select
                    value={selectedNetworkOption}
                    onChange={(option) => handleFormChange('network', option?.value ?? '')}
                    options={networkOptions}
                    styles={customStyles}
                    placeholder="Select"
                    isSearchable
                    isClearable
                    classNamePrefix="telecom-select"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Service Number</label>
                  <input value={form.number} onChange={(e) => handleFormChange('number', e.target.value)} placeholder="Enter here" className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Project</label>
                  <Select
                    value={selectedProjectOption}
                    onChange={(option) => handleFormChange('project', option?.value ?? '')}
                    options={projectOptions}
                    styles={customStyles}
                    placeholder="Select"
                    isSearchable
                    isClearable
                    classNamePrefix="telecom-select"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Purpose</label>
                  <Select
                    value={selectedCategoryOption}
                    onChange={(option) => handleFormChange('purpose', option?.value ?? '')}
                    options={categoryOptions}
                    styles={customStyles}
                    placeholder="Select"
                    isSearchable
                    isClearable
                    classNamePrefix="telecom-select"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Amount</label>
                  <input value={form.amount} onChange={(e) => handleFormChange('amount', e.target.value)} placeholder="Enter here" className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Payment Date</label>
                  <input type="date" value={form.paymentDate} onChange={(e) => handleFormChange('paymentDate', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Service Start Date</label>
                  <input type="date" value={form.serviceStart} onChange={(e) => handleFormChange('serviceStart', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Service End Date</label>
                  <input type="date" value={form.serviceEnd} onChange={(e) => handleFormChange('serviceEnd', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Registered Person</label>
                  <select value={form.registeredPerson} onChange={(e) => handleFormChange('registeredPerson', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                    <option value="">Select</option>
                    <option>Amir H</option>
                    <option>Jothi S</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Assigned Person</label>
                  <select value={form.assignedPerson} onChange={(e) => handleFormChange('assignedPerson', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                    <option value="">Select</option>
                    <option>Amir H</option>
                    <option>Vinoth G</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Validity</label>
                  <div className="flex gap-2">
                    <input type="number" min="0" value={form.validityValue} onChange={(e) => handleFormChange('validityValue', Number(e.target.value))} className="h-11 w-20 border-2 border-[#BF9853] border-opacity-30 rounded-md px-3 focus:outline-none no-spinner" />
                    <select value={form.validityUnit} onChange={(e) => handleFormChange('validityUnit', e.target.value)} className="h-11 flex-1 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                      <option value="">Select</option>
                      <option value="Days">Days</option>
                      <option value="Months">Months</option>
                      <option value="Years">Years</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  <button
                    className="px-6 py-2 bg-[#BF9853] text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleCreateSubmit}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : editingEntry ? 'Update' : 'Submit'}
                  </button>
                  <button
                    className="px-6 py-2 border border-[#BF9853] text-[#BF9853] rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={closeCreateModal}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
                {durationDaysLabel ? (
                  <div className="text-sm font-semibold text-[#BF9853] md:text-right">
                    {durationDaysLabel}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default DirectoryTelecom