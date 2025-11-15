import React, { useEffect, useMemo, useRef, useState } from 'react'
import Select from 'react-select'
import edit from '../Images/Edit.svg'
import deleteIcon from '../Images/Delete.svg'
import search from '../Images/search.png'
import imports from '../Images/Import.svg'
import filterIcon from '../Images/filter (3).png'

const DirectorySubscription = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'https://backendaab.in/aabuildersDash';

  const [isSubscriptionCreateOpen, setIsSubscriptionCreateOpen] = useState(false);
  const [addInputsOpen, setAddInputsOpen] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    type: '',
    network: '',
    number: '',
    planNumber: '',
    mailId: '',
    project: '',
    purpose: '',
    amount: '',
    paymentDate: '',
    serviceStart: '',
    serviceEnd: '',
    validityValue: 0,
    validityUnit: '',
    registeredPerson: ''
  });
  const [filters, setFilters] = useState({
    year: '',
    provider: '',
    service: '',
    number: '',
    project: '',
    registered: '',
    status: '',
    date: ''
  });
  const [activeAddPopup, setActiveAddPopup] = useState(null);
  const [addPopupValue, setAddPopupValue] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [typeItems, setTypeItems] = useState([]);
  const [networkItems, setNetworkItems] = useState([]);
  const [purposeItems, setPurposeItems] = useState([]);
  const [typeSearch, setTypeSearch] = useState('');
  const [networkSearch, setNetworkSearch] = useState('');
  const [purposeSearch, setPurposeSearch] = useState('');
  const [projectItems, setProjectItems] = useState([]);
  const [subscriptionEntries, setSubscriptionEntries] = useState([]);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [editingSubscriptionId, setEditingSubscriptionId] = useState(null);
  const isEditingSubscription = editingSubscriptionId !== null && editingSubscriptionId !== undefined;
  const [isFilterRowVisible, setIsFilterRowVisible] = useState(false);
  const fileInputRefs = useRef({});

  const addPopupContent = {
    type: {
      title: 'Add Service Type',
      label: 'Service Type',
      placeholder: 'Enter service type'
    },
    network: {
      title: 'Add Service Provider',
      label: 'Service Provider',
      placeholder: 'Enter provider'
    },
    purpose: {
      title: 'Add Purpose',
      label: 'Purpose',
      placeholder: 'Enter purpose'
    }
  };

  const listConfig = {
    type: {
      getItems: () => typeItems,
      setItems: setTypeItems,
      endpoints: {
        list: '/api/subscription-service-type/all',
        create: '/api/subscription-service-type/save',
        update: (id) => `/api/subscription-service-type/update/${id}`,
        delete: (id) => `/api/subscription-service-type/delete/${id}`
      },
      requestKey: 'subscription_service_type',
      responseKeys: ['subscription_service_type', 'subscriptionServiceType']
    },
    network: {
      getItems: () => networkItems,
      setItems: setNetworkItems,
      endpoints: {
        list: '/api/subscription-service-provider/all',
        create: '/api/subscription-service-provider/save',
        update: (id) => `/api/subscription-service-provider/update/${id}`,
        delete: (id) => `/api/subscription-service-provider/delete/${id}`
      },
      requestKey: 'subscription_service_provider',
      responseKeys: ['subscription_service_provider', 'subscriptionServiceProvider']
    },
    purpose: {
      getItems: () => purposeItems,
      setItems: setPurposeItems,
      endpoints: {
        list: '/api/subscription-purpose/all',
        create: '/api/subscription-purpose/save',
        update: (id) => `/api/subscription-purpose/update/${id}`,
        delete: (id) => `/api/subscription-purpose/delete/${id}`
      },
      requestKey: 'subscription_purpose',
      responseKeys: ['subscription_purpose', 'subscriptionPurpose']
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

  const filteredPurposeItems = useMemo(() => {
    const term = purposeSearch.trim().toLowerCase();
    if (!term) return purposeItems;
    return purposeItems.filter(item => item.name.toLowerCase().includes(term));
  }, [purposeItems, purposeSearch]);

  const formatDisplayDate = (value) => {
    const date = toDateAtMidnight(value);
    if (!date) return '-';
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

    return toDateAtMidnight(computedEnd);
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

  const typeOptions = useMemo(
    () => typeItems.map(item => ({ value: item.name, label: item.name })),
    [typeItems]
  );

  const networkOptions = useMemo(
    () => networkItems.map(item => ({ value: item.name, label: item.name })),
    [networkItems]
  );

  const purposeOptions = useMemo(
    () => purposeItems.map(item => ({ value: item.name, label: item.name })),
    [purposeItems]
  );

  const projectOptions = useMemo(
    () => projectItems.map(item => ({
      value: String(item.id ?? item.projectId ?? item.siteNo ?? ''),
      label: item.name,
      data: item
    })),
    [projectItems]
  );

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
    const serviceStartingDate = item.service_starting_date ?? item.serviceStartingDate ?? '';
    const serviceEndDate = item.service_end_date ?? item.serviceEndDate ?? '';
    const validityValue = item.validity ?? item.validity_value ?? '';
    const validityType = item.validity_type ?? item.validityType ?? '';
    const expiryDate = calculateExpiryDate(serviceStartingDate, validityValue, validityType, serviceEndDate);
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

  const statusFilterOptions = useMemo(() => {
    const statuses = new Set(subscriptionEntries.map((item) => getEntryStatus(item)));
    return Array.from(statuses).map((status) => ({
      value: status,
      label: status
    }));
  }, [subscriptionEntries]);

  const selectedTypeOption = useMemo(
    () => typeOptions.find(option => option.value === subscriptionForm.type) ?? null,
    [typeOptions, subscriptionForm.type]
  );

  const selectedNetworkOption = useMemo(
    () => networkOptions.find(option => option.value === subscriptionForm.network) ?? null,
    [networkOptions, subscriptionForm.network]
  );

  const selectedPurposeOption = useMemo(
    () => purposeOptions.find(option => option.value === subscriptionForm.purpose) ?? null,
    [purposeOptions, subscriptionForm.purpose]
  );

  const selectedProjectOption = useMemo(
    () => projectOptions.find(option => option.value === subscriptionForm.project) ?? null,
    [projectOptions, subscriptionForm.project]
  );

  const selectedProjectFilterOption = useMemo(
    () => projectOptions.find(option => option.value === filters.project) ?? null,
    [projectOptions, filters.project]
  );

  const filteredSubscriptionEntries = useMemo(() => {
    return subscriptionEntries.filter((item) => {
      const paymentDateValue = item.payment_date ?? item.paymentDate ?? '';
      const paymentDateISO = paymentDateValue ? new Date(paymentDateValue).toISOString().slice(0, 10) : '';
      const providerValue = (item.service_provider ?? item.serviceProvider ?? '').toLowerCase();
      const serviceTypeValue = (item.service_type ?? item.serviceType ?? '').toLowerCase();
      const serviceNumberValue = (item.service_number ?? item.serviceNumber ?? '').toLowerCase();
      const registeredValue = (item.registered_person ?? item.registeredPerson ?? '').toLowerCase();
      const projectIdValue = item.project_id ?? item.projectId ?? null;
      const entryStatus = getEntryStatus(item);

      if (filters.project && String(filters.project) !== String(projectIdValue)) {
        return false;
      }

      if (filters.date && paymentDateISO !== filters.date) {
        return false;
      }

      if (filters.status && entryStatus !== filters.status) {
        return false;
      }

      if (filters.provider && !providerValue.includes(filters.provider.toLowerCase())) {
        return false;
      }

      if (filters.service && !serviceTypeValue.includes(filters.service.toLowerCase())) {
        return false;
      }

      if (filters.number && !serviceNumberValue.includes(filters.number.toLowerCase())) {
        return false;
      }

      if (filters.registered && !registeredValue.includes(filters.registered.toLowerCase())) {
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
  }, [subscriptionEntries, filters, projectItems]);

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
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      year: '',
      provider: '',
      service: '',
      number: '',
      project: '',
      registered: '',
      status: '',
      date: ''
    })
  }

  const handleFormChange = (key, value) => {
    setSubscriptionForm((prev) => {
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
    setActiveAddPopup(popupKey);
    setAddPopupValue('');
    setEditingItem(null);
  };

  const handleCloseAddPopup = () => {
    setActiveAddPopup(null);
    setAddPopupValue('');
    setEditingItem(null);
  };

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
        for (const responseKey of config.responseKeys) {
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

  const fetchSubscriptionEntries = async () => {
    setSubscriptionLoading(true);
    setSubscriptionError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/utility-subscription/getAll`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscription entries');
      }
      const result = await response.json();
      if (!Array.isArray(result)) {
        throw new Error('Unexpected response for subscription entries');
      }
      setSubscriptionEntries(result);
    } catch (error) {
      console.error(error);
      setSubscriptionError('Unable to load subscription entries. Please try again.');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    fetchList('type');
    fetchList('network');
    fetchList('purpose');
    fetchProjectItems();
    fetchSubscriptionEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!addInputsOpen) return;
    fetchList('type');
    fetchList('network');
    fetchList('purpose');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addInputsOpen]);

  useEffect(() => {
    if (!isSubscriptionCreateOpen) return;
    fetchProjectItems();
    setSaveError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubscriptionCreateOpen]);

  useEffect(() => {
    const { serviceStart, serviceEnd } = subscriptionForm;
    if (!serviceStart || !serviceEnd) {
      return;
    }

    const validity = deriveValidityFromDateRange(serviceStart, serviceEnd);

    setSubscriptionForm((prev) => {
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
  }, [subscriptionForm.serviceStart, subscriptionForm.serviceEnd]);

  const subscriptionDurationLabel = useMemo(() => {
    if (subscriptionForm.validityUnit !== 'Days') {
      return '';
    }
    const startDate = toDateAtMidnight(subscriptionForm.serviceStart);
    const endDate = toDateAtMidnight(subscriptionForm.serviceEnd);
    if (!startDate || !endDate || endDate < startDate) {
      return '';
    }
    const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / DAY_IN_MS) + 1;
    if (!Number.isFinite(diffDays) || diffDays <= 0) {
      return '';
    }
    return `Duration: ${diffDays} Day${diffDays === 1 ? '' : 's'}`;
  }, [subscriptionForm.serviceStart, subscriptionForm.serviceEnd, subscriptionForm.validityUnit]);

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

  const handleOpenCreateForm = () => {
    resetForm();
    setSaveError('');
    setIsSubscriptionCreateOpen(true);
  };

  const handleEditSubscription = (item) => {
    if (!item) return;
    const itemId = item.id ?? null;
    if (itemId === null || itemId === undefined) {
      console.error('Unable to edit subscription: missing id.');
      return;
    }
    const projectId = item.project_id ?? item.projectId ?? '';
    const paymentDateValue = item.payment_date ?? item.paymentDate ?? '';
    const serviceStartValue = item.service_starting_date ?? item.serviceStartingDate ?? '';
    const serviceEndValue = item.service_end_date ?? item.serviceEndDate ?? '';
    const validityRaw = item.validity ?? item.validity_value ?? item.validityValue ?? '';
    const validityType = item.validity_type ?? item.validityType ?? '';
    const parsedValidity = Number(validityRaw);
    setSubscriptionForm({
      type: item.service_type ?? item.serviceType ?? '',
      network: item.service_provider ?? item.serviceProvider ?? '',
      number: item.mobile_number ?? item.mobileNumber ?? '',
      planNumber: item.service_number ?? item.serviceNumber ?? '',
      mailId: item.mail_id ?? item.mailId ?? '',
      project: projectId !== null && projectId !== undefined && projectId !== '' ? String(projectId) : '',
      purpose: item.purpose ?? '',
      amount: item.amount !== undefined && item.amount !== null ? String(item.amount) : '',
      paymentDate: formatDateForInput(paymentDateValue),
      serviceStart: formatDateForInput(serviceStartValue),
      serviceEnd: formatDateForInput(serviceEndValue),
      validityValue: Number.isNaN(parsedValidity) ? 0 : parsedValidity,
      validityUnit: validityType ?? '',
      registeredPerson: item.registered_person ?? item.registeredPerson ?? ''
    });
    setEditingSubscriptionId(itemId);
    setSaveError('');
    setIsSubscriptionCreateOpen(true);
  };

  const handleDeleteSubscription = async (item) => {
    if (!item?.id) return;
    const confirmed = window.confirm('Are you sure you want to delete this subscription?');
    if (!confirmed) return;
    setSubscriptionError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/utility-subscription/delete/${item.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete subscription');
      }
      if (editingSubscriptionId === (item.id ?? null)) {
        resetForm();
        setIsSubscriptionCreateOpen(false);
      }
      await fetchSubscriptionEntries();
    } catch (error) {
      console.error(error);
      setSubscriptionError('Failed to delete subscription. Please try again.');
    }
  };

  const handleSubmitSubscription = async () => {
    const projectIdValue = resolveProjectIdForSave(subscriptionForm.project);

    const payload = {
      service_type: subscriptionForm.type || null,
      service_provider: subscriptionForm.network || null,
      service_number: subscriptionForm.planNumber || null,
      project_id: projectIdValue,
      purpose: subscriptionForm.purpose || null,
      amount: subscriptionForm.amount ? Number(subscriptionForm.amount) : 0,
      payment_date: subscriptionForm.paymentDate || null,
      service_starting_date: subscriptionForm.serviceStart || null,
    service_end_date: subscriptionForm.serviceEnd || null,
      validity: subscriptionForm.validityValue ? String(subscriptionForm.validityValue) : null,
      validity_type: subscriptionForm.validityUnit || null,
      registered_person: subscriptionForm.registeredPerson || null,
      mobile_number: subscriptionForm.number || null,
      mail_id: subscriptionForm.mailId || null
    };

    if (isEditingSubscription) {
      payload.id = editingSubscriptionId;
    }

    const isEditing = isEditingSubscription;
    setIsSaving(true);
    setSaveError('');
    try {
      const url = isEditing
        ? `${API_BASE_URL}/api/utility-subscription/update/${editingSubscriptionId}`
        : `${API_BASE_URL}/api/utility-subscription/save`;
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'save'} subscription details`);
      }
      await fetchSubscriptionEntries();
      resetForm();
      setIsSubscriptionCreateOpen(false);
    } catch (error) {
      console.error(error);
      setSaveError(`Failed to ${isEditing ? 'update' : 'save'} subscription details. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportClick = (key) => {
    fileInputRefs.current[key]?.click();
  };

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
          } catch (error) {
            console.error(error);
          }
        }
        await fetchList(key);
      };
      uploadItems();
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleEditItem = (key, item) => {
    setActiveAddPopup(key);
    setAddPopupValue(item.name ?? '');
    setEditingItem({ ...item, key });
  };
  const customStyles = {
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

  const resetForm = () => {
    setSubscriptionForm({
      type: '',
      network: '',
      number: '',
      planNumber: '',
      mailId: '',
      project: '',
      purpose: '',
      amount: '',
      paymentDate: '',
      serviceStart: '',
      serviceEnd: '',
      validityValue: 0,
      validityUnit: '',
      registeredPerson: ''
    });
    setEditingSubscriptionId(null);
  }
  return (
    <div>
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
          <label className="block font-semibold mb-1">Service Provider</label>
          <input
            value={filters.provider}
            onChange={(e) => handleFilterChange('provider', e.target.value)}
            placeholder="Service provider"
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block font-semibold mb-1">Service</label>
          <Select
            value={filters.service ? { value: filters.service, label: filters.service } : null}
            onChange={(option) => handleFilterChange('service', option?.value ?? '')}
            options={typeOptions}
            styles={customStyles}
            placeholder="Select service"
            isSearchable
            isClearable
            classNamePrefix="subscription-select"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Service Number</label>
          <input
            value={filters.number}
            onChange={(e) => handleFilterChange('number', e.target.value)}
            placeholder="Filter by number"
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block font-semibold mb-1">Project Name</label>
          <Select
            value={selectedProjectFilterOption}
            onChange={(option) => handleFilterChange('project', option?.value ?? '')}
            options={projectOptions}
            styles={customStyles}
            placeholder="Select project"
            isSearchable
            isClearable
            classNamePrefix="subscription-select"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Registered Person</label>
          <input
            value={filters.registered}
            onChange={(e) => handleFilterChange('registered', e.target.value)}
            placeholder="Registered person"
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Payment Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-4 overflow-x-auto bg-white p-4 ml-5 mr-5 h-[650px] rounded-md">
        {/* Tabs and Actions */}
        <div className=" flex flex-col md:flex-row md:items-center md:justify-between mt-5 mb-3">
          <div className="inline-flex rounded-md p-1 w-fit gap-4">
            <button
              className="inline-flex items-center gap-2 text-sm font-semibold rounded-md px-3 py-1 shadow-lg"
              onClick={() => setIsFilterRowVisible(prev => !prev)}
            >
              <img src={filterIcon} alt="filter" className="w-5 h-5" />
            </button>
            <button
              className={'px-6 py-2 rounded font-semibold transition-colors border border-gray-300 hover:bg-gray-50'}
            >
              Clients Projects
            </button>
            <button
              className={'px-6 py-2 rounded font-semibold transition-colors border border-gray-300 hover:bg-gray-50'}
            >
              Own Projects
            </button>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <button className="h-10 text-[#E4572E] hover:underline">Export PDF</button>
            <button className="h-10 text-[#007233] hover:underline">Export XL</button>
            <button className="h-10 text-[#BF9853] hover:underline">Print</button>
            <button className="h-10 px-4 bg-[#BF9853] text-white rounded-md" onClick={() => setAddInputsOpen(true)}>+ Add Input</button>
            <button className="h-10 px-4 bg-[#BF9853] text-white rounded-md" onClick={handleOpenCreateForm}>Create</button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-3 px-2">

          {(filters.year || filters.date || filters.project || filters.provider || filters.service || filters.status || filters.number || filters.registered) && (
            <div className="flex flex-wrap gap-2 items-center">
              {filters.year && (
                <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium">
                  <span className="font-normal">Year:</span>
                  <span className="font-bold">{filters.year}</span>
                  <button onClick={() => handleFilterChange('year', '')} className="text-[#BF9853] ml-1 text-lg leading-none">×</button>
                </span>
              )}
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
              {filters.provider && (
                <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium">
                  <span className="font-normal">Provider:</span>
                  <span className="font-bold">{filters.provider}</span>
                  <button onClick={() => handleFilterChange('provider', '')} className="text-[#BF9853] ml-1 text-lg leading-none">×</button>
                </span>
              )}
              {filters.service && (
                <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium">
                  <span className="font-normal">Type:</span>
                  <span className="font-bold">{filters.service}</span>
                  <button onClick={() => handleFilterChange('service', '')} className="text-[#BF9853] ml-1 text-lg leading-none">×</button>
                </span>
              )}
              {filters.number && (
                <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium">
                  <span className="font-normal">Number:</span>
                  <span className="font-bold">{filters.number}</span>
                  <button onClick={() => handleFilterChange('number', '')} className="text-[#BF9853] ml-1 text-lg leading-none">×</button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium">
                  <span className="font-normal">Status:</span>
                  <span className="font-bold">{filters.status}</span>
                  <button onClick={() => handleFilterChange('status', '')} className="text-[#BF9853] ml-1 text-lg leading-none">×</button>
                </span>
              )}
              {filters.registered && (
                <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium">
                  <span className="font-normal">Registered:</span>
                  <span className="font-bold">{filters.registered}</span>
                  <button onClick={() => handleFilterChange('registered', '')} className="text-[#BF9853] ml-1 text-lg leading-none">×</button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
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
                <th className="p-2">Service Number</th>
                <th className="p-2">Payment Date</th>
                <th className="p-2">Validity</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Exp Date</th>
                <th className="p-2">Remain Days</th>
                <th className="p-2">Exp Ago</th>
                <th className="p-2">Status</th>
                <th className="p-2">Registered</th>
                <th className="p-2">Activity</th>
              </tr>
              {isFilterRowVisible && (
                <tr className="bg-white border-b border-gray-200 text-sm">
                  <th className="p-2 pl-3"></th>
                  <th className="p-2">
                    <Select
                      value={selectedProjectFilterOption}
                      onChange={(option) => handleFilterChange('project', option?.value ?? '')}
                      options={projectOptions}
                      styles={customStyles}
                      placeholder="All projects"
                      isSearchable
                      isClearable
                      classNamePrefix="subscription-select"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      value={filters.provider}
                      onChange={(e) => handleFilterChange('provider', e.target.value)}
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
                      classNamePrefix="subscription-select"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      value={filters.number}
                      onChange={(e) => handleFilterChange('number', e.target.value)}
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
                      classNamePrefix="subscription-select"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      value={filters.registered}
                      onChange={(e) => handleFilterChange('registered', e.target.value)}
                      placeholder="Registered person..."
                      className="w-full h-10 border border-[#BF9853]/40 rounded-md px-2 text-sm focus:outline-none"
                    />
                  </th>
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                </tr>
              )}
            </thead>
            <tbody>
              {subscriptionLoading && (
                <tr>
                  <td colSpan={14} className="p-4 text-center text-gray-500">Loading subscription entries...</td>
                </tr>
              )}
              {!subscriptionLoading && subscriptionError && (
                <tr>
                  <td colSpan={14} className="p-4 text-center text-red-600">{subscriptionError}</td>
                </tr>
              )}
              {!subscriptionLoading && !subscriptionError && subscriptionEntries.length === 0 && (
                <tr>
                  <td colSpan={14} className="p-4 text-center text-gray-500">No subscription entries found.</td>
                </tr>
              )}
              {!subscriptionLoading && !subscriptionError && subscriptionEntries.length > 0 && filteredSubscriptionEntries.length === 0 && (
                <tr>
                  <td colSpan={14} className="p-4 text-center text-gray-500">No subscription entries match the applied filters.</td>
                </tr>
              )}
              {!subscriptionLoading && !subscriptionError && filteredSubscriptionEntries.map((item, index) => {
                const serviceStartingDate = item.service_starting_date ?? item.serviceStartingDate ?? '';
                const serviceEndDate = item.service_end_date ?? item.serviceEndDate ?? '';
                const validityValue = item.validity ?? item.validity_value ?? '';
                const validityType = item.validity_type ?? item.validityType ?? '';
                const paymentDateValue = item.payment_date ?? item.paymentDate ?? '';
                const serviceProvider = item.service_provider ?? item.serviceProvider ?? '-';
                const serviceType = item.service_type ?? item.serviceType ?? '-';
                const serviceNumber = item.service_number ?? item.serviceNumber ?? '-';
                const registeredPerson = item.registered_person ?? item.registeredPerson ?? '-';
                const mobileNumber = item.mobile_number ?? item.mobileNumber ?? '-';
                const mailId = item.mail_id ?? item.mailId ?? '-';
                const expiryDate = calculateExpiryDate(serviceStartingDate, validityValue, validityType, serviceEndDate);
                const validityLabel = validityValue && validityType
                  ? `${validityValue} ${validityType}`
                  : validityValue || '-';
                const projectCategory = getProjectCategory(item.project_id);
                const providerStyles = getProjectCategoryStyles(projectCategory);
                const status = getEntryStatus(item);
                return (
                  <tr key={item.id ?? index} className="border-b last:border-b-0">
                    <td className="p-2 pl-3">{index + 1}</td>
                    <td className="p-2">{getProjectName(item.project_id)}</td>
                    <td className="p-2">
                      <span
                        className="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-semibold"
                        style={providerStyles}
                      >
                        {item.purpose}
                      </span>
                    </td>
                    <td className="p-2">{serviceType}</td>
                    <td className="p-2">
                      <div className="relative inline-block group">
                        <span className="cursor-default">{serviceNumber}</span>
                        <div className="absolute right-0 top-full z-40 mt-2 hidden w-60 rounded-lg border border-[#BF9853]/30 bg-white p-3 text-sm shadow-lg group-hover:block">
                          <div className="space-y-2">
                            <div className="flex">
                              <span className="w-20 font-medium text-black">Service :</span>
                              <span className="flex-1 font-semibold text-[#E4572E] truncate" title={serviceProvider}>{serviceProvider}</span>
                            </div>
                            <div className="flex">
                              <span className="w-20 font-medium text-black">Mobile :</span>
                              <span className="flex-1 font-semibold text-[#E4572E] truncate" title={mobileNumber}>{mobileNumber}</span>
                            </div>
                            <div className="flex">
                              <span className="w-20 font-medium text-black">Mail Id :</span>
                              <span className="flex-1 font-semibold text-[#E4572E] truncate" title={mailId}>{mailId}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2">{formatDisplayDate(paymentDateValue)}</td>
                    <td className="p-2">{validityLabel}</td>
                    <td className="p-2">{formatAmount(item.amount)}</td>
                    <td className="p-2">{formatDisplayDate(expiryDate)}</td>
                    <td className="p-2">{calculateRemainingDays(expiryDate)}</td>
                    <td className="p-2">{calculateExpiredAgo(expiryDate)}</td>
                    <td className="p-2">{status}</td>
                    <td className="p-2">{registeredPerson}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <button className="p-1 rounded" title="Edit" onClick={() => handleEditSubscription(item)}>
                          <img src={edit} alt="edit" className="w-4 h-4" />
                        </button>
                        <button className="p-1 rounded" title="Delete" onClick={() => handleDeleteSubscription(item)}>
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
        {addInputsOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setAddInputsOpen(false)} />
            <div className="relative z-40 bg-white rounded-lg shadow-xl p-5 w-[900px] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Subscription Inputs</h3>
                <button className="text-red-600 text-2xl" onClick={() => setAddInputsOpen(false)}>×</button>
              </div>
              <div className="flex overflow-x-auto space-x-[1%] pb-4">
                {/* TYPE COLUMN */}
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
                      <button className="text-black font-bold px-1 ml-6 rounded border-dashed border-b-2 border-[#BF9853]"
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
                              <th className="p-2 text-left w-48 text-base font-bold">Service Type</th>
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
                                <td className="p-2 w-48 flex justify-between items-center">
                                  <span>{item.name}</span>
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
                {/* NETWORK COLUMN */}
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
                      <button className="text-black font-bold px-1 ml-6 rounded border-dashed border-b-2 border-[#BF9853]"
                        onClick={() => handleOpenAddPopup('network')}
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
                              <th className="p-2 text-left w-48 text-base font-bold">Service Provider</th>
                            </tr>
                          </thead>
                        </table>
                      </div>
                      <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <table className="table-auto w-full">
                          <tbody>
                            {filteredNetworkItems.map((item) => (
                              <tr key={`${item.id}-${item.name}`} className="border-b last:border-b-0 group">
                                <td className="p-2 w-16 font-semibold">{item.id}</td>
                                <td className="p-2 w-48 flex justify-between items-center">
                                  <span>{item.name}</span>
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
                        value={purposeSearch}
                        onChange={(e) => setPurposeSearch(e.target.value)}
                        className="border-2 rounded-lg border-[#BF9853] w-[240px] h-[45px] border-opacity-[0.17] pl-3 placeholder:text-sm placeholder:text-gray-500 placeholder:font-semibold"
                      />
                      <button className="-ml-8 mt-5 transform -translate-y-1/2 text-gray-500">
                        <img src={search} alt='search' className=' w-5 h-5' />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <button className="text-[#E4572E] font-semibold text-sm flex" onClick={() => handleImportClick('purpose')}>
                        <img src={imports} alt="import" className="w-6 h-5 bg-transparent pr-2 mt-1" />
                        <h1 className="mt-1.5">Import file</h1>
                      </button>
                      <button className="text-black font-bold px-1 ml-6 rounded border-dashed border-b-2 border-[#BF9853]"
                        onClick={() => handleOpenAddPopup('purpose')}
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
                              <th className="p-2 text-left w-48 text-base font-bold">Purpose</th>
                            </tr>
                          </thead>
                        </table>
                      </div>
                      <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <table className="table-auto w-full">
                          <tbody>
                            {filteredPurposeItems.map((item) => (
                              <tr key={`${item.id}-${item.name}`} className="border-b last:border-b-0 group">
                                <td className="p-2 w-16 font-semibold">{item.id}</td>
                                <td className="p-2 w-48 flex justify-between items-center">
                                  <span>{item.name}</span>
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button onClick={() => handleEditItem('purpose', item)} className="p-1 rounded hover:bg-gray-100">
                                      <img src={edit} alt="edit" className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteItem('purpose', item)} className="p-1 rounded hover:bg-gray-100">
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
              {/* Action Buttons */}
              <div className="flex gap-2 justify-end mr-10 mb-4">
                <button className="px-6 py-2 bg-[#BF9853] text-white rounded-md">Save</button>
                <button className="px-6 py-2 border border-[#BF9853] text-[#BF9853] rounded-md" onClick={() => setAddInputsOpen(false)}>Cancel</button>
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
                  <button
                    className="px-6 py-2 border border-[#BF9853] text-[#BF9853] rounded-md"
                    onClick={handleCloseAddPopup}
                  >
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
          ref={(el) => { fileInputRefs.current.purpose = el; }}
          onChange={(event) => handleFileImport('purpose', event)}
        />
        {isSubscriptionCreateOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => { setIsSubscriptionCreateOpen(false); resetForm(); setSaveError(''); }} />
            <div className="relative z-40 bg-white rounded-lg shadow-xl p-6 w-[860px] max-w-[92vw]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Subscription Details</h3>
                <button className="text-red-600 text-2xl" onClick={() => { setIsSubscriptionCreateOpen(false); resetForm(); setSaveError(''); }}>×</button>
              </div>
              {saveError && (
                <div className="mb-4">
                  <p className="text-red-600 text-sm font-medium">{saveError}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-left">
                <div>
                  <label className="block font-semibold mb-1">Service Type</label>
                  <Select
                    value={selectedTypeOption}
                    onChange={(option) => handleFormChange('type', option?.value ?? '')}
                    options={typeOptions}
                    styles={selectStyles}
                    placeholder="Select"
                    isSearchable
                    isClearable
                    classNamePrefix="subscription-select"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Service Provider</label>
                  <Select
                    value={selectedNetworkOption}
                    onChange={(option) => handleFormChange('network', option?.value ?? '')}
                    options={networkOptions}
                    styles={selectStyles}
                    placeholder="Select"
                    isSearchable
                    isClearable
                    classNamePrefix="subscription-select"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Service Number</label>
                  <input
                    value={subscriptionForm.planNumber}
                    onChange={(e) => handleFormChange('planNumber', e.target.value)}
                    placeholder="Enter here"
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Project</label>
                  <Select
                    value={selectedProjectOption}
                    onChange={(option) => handleFormChange('project', option?.value ?? '')}
                    options={projectOptions}
                    styles={selectStyles}
                    placeholder="Select"
                    isSearchable
                    isClearable
                    classNamePrefix="subscription-select"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Purpose</label>
                  <Select
                    value={selectedPurposeOption}
                    onChange={(option) => handleFormChange('purpose', option?.value ?? '')}
                    options={purposeOptions}
                    styles={selectStyles}
                    placeholder="Select"
                    isSearchable
                    isClearable
                    classNamePrefix="subscription-select"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Amount</label>
                  <input
                    value={subscriptionForm.amount}
                    onChange={(e) => handleFormChange('amount', e.target.value)}
                    placeholder="Enter here"
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block font-semibold mb-1">Payment Date</label>
                    <input
                      type="date"
                      value={subscriptionForm.paymentDate}
                      onChange={(e) => handleFormChange('paymentDate', e.target.value)}
                      className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Service Start Date</label>
                    <input
                      type="date"
                      value={subscriptionForm.serviceStart}
                      onChange={(e) => handleFormChange('serviceStart', e.target.value)}
                      className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Service End Date</label>
                    <input
                      type="date"
                      value={subscriptionForm.serviceEnd}
                      onChange={(e) => handleFormChange('serviceEnd', e.target.value)}
                      className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Validity</label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        min="0"
                        value={subscriptionForm.validityValue}
                        onChange={(e) => handleFormChange('validityValue', Number(e.target.value))}
                        className="h-11 w-20 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                      />
                      <select
                        value={subscriptionForm.validityUnit}
                        onChange={(e) => handleFormChange('validityUnit', e.target.value)}
                        className="h-11 flex-1 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="Days">Days</option>
                        <option value="Months">Months</option>
                        <option value="Years">Years</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Registered Person</label>
                  <select
                    value={subscriptionForm.registeredPerson}
                    onChange={(e) => handleFormChange('registeredPerson', e.target.value)}
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="Amir H">Amir H</option>
                    <option value="Jothi S">Jothi S</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Mobile Number</label>
                  <input
                    value={subscriptionForm.number}
                    onChange={(e) => handleFormChange('number', e.target.value)}
                    placeholder="Enter here"
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Mail Id</label>
                  <input
                    value={subscriptionForm.mailId}
                    onChange={(e) => handleFormChange('mailId', e.target.value)}
                    placeholder="Enter here"
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                  />
                </div>
              </div>
              <div className="pt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  <button
                    className="px-10 py-2 bg-[#BF9853] text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleSubmitSubscription}
                    disabled={isSaving}
                  >
                    {isSaving
                      ? (isEditingSubscription ? 'Updating...' : 'Saving...')
                      : (isEditingSubscription ? 'Update' : 'Submit')}
                  </button>
                  <button
                    className="px-10 py-2 border border-[#BF9853] text-[#BF9853] rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => { setIsSubscriptionCreateOpen(false); resetForm(); setSaveError(''); }}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
                {subscriptionDurationLabel ? (
                  <div className="text-sm font-semibold text-[#BF9853] md:text-right">
                    {subscriptionDurationLabel}
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

export default DirectorySubscription
