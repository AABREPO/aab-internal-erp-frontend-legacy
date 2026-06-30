import React, { useEffect, useMemo, useRef, useState } from 'react'
import edit from '../Images/Edit.svg'
import deleteIcon from '../Images/Delete.svg'
import search from '../Images/search.png'
import imports from '../Images/Import.svg'

const DirectoryAmc = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'https://backendaab.in/aabuildersDash';
  const [activeTab, setActiveTab] = useState('clients');
  const [isAmcCreateOpen, setIsAmcCreateOpen] = useState(false);
  const [isAmcInputsOpen, setIsAmcInputsOpen] = useState(false);
  const [activeAddPopup, setActiveAddPopup] = useState(null);
  const [addPopupValue, setAddPopupValue] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [typeItems, setTypeItems] = useState([]);
  const [networkItems, setNetworkItems] = useState([]);
  const [purposeItems, setPurposeItems] = useState([]);
  const [typeSearch, setTypeSearch] = useState('');
  const [networkSearch, setNetworkSearch] = useState('');
  const [purposeSearch, setPurposeSearch] = useState('');
  const fileInputRefs = useRef({});
  const [amcForm, setAmcForm] = useState({
    type: '',
    network: '',
    number: '',
    nextServiceValue: 0,
    nextServiceUnit: '',
    project: '',
    purpose: '',
    amount: '',
    paymentDate: '',
    serviceStart: '',
    validityValue: 0,
    validityUnit: '',
    registeredPerson: '',
    assignedPerson: '',
    mailId: ''
  });
  const [amcFilters, setAmcFilters] = useState({
    year: '',
    vendor: '',
    service: '',
    doorNo: '',
    shop: '',
    project: '',
    tenant: ''
  });

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
        list: '/api/amc-service-type/all',
        create: '/api/amc-service-type/save',
        update: (id) => `/api/amc-service-type/update/${id}`,
        delete: (id) => `/api/amc-service-type/delete/${id}`
      },
      requestKey: 'amc_service_type',
      responseKeys: ['amc_service_type', 'amcServiceType']
    },
    network: {
      getItems: () => networkItems,
      setItems: setNetworkItems,
      endpoints: {
        list: '/api/amc-service-provider/all',
        create: '/api/amc-service-provider/save',
        update: (id) => `/api/amc-service-provider/update/${id}`,
        delete: (id) => `/api/amc-service-provider/delete/${id}`
      },
      requestKey: 'amc_service_provider',
      responseKeys: ['amc_service_provider', 'amcServiceProvider']
    },
    purpose: {
      getItems: () => purposeItems,
      setItems: setPurposeItems,
      endpoints: {
        list: '/api/amc-purpose/all',
        create: '/api/amc-purpose/save',
        update: (id) => `/api/amc-purpose/update/${id}`,
        delete: (id) => `/api/amc-purpose/delete/${id}`
      },
      requestKey: 'amc_purpose',
      responseKeys: ['amc_purpose', 'amcPurpose']
    }
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

  const handleFilterChange = (key, value) => {
    setAmcFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleFormChange = (key, value) => {
    setAmcForm(prev => ({ ...prev, [key]: value }))
  }

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

  useEffect(() => {
    fetchList('type');
    fetchList('network');
    fetchList('purpose');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAmcInputsOpen) return;
    fetchList('type');
    fetchList('network');
    fetchList('purpose');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAmcInputsOpen]);

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
    setAmcForm({
      type: '',
      network: '',
      number: '',
      nextServiceValue: 0,
      nextServiceUnit: '',
      project: '',
      purpose: '',
      amount: '',
      paymentDate: '',
      serviceStart: '',
      validityValue: 0,
      validityUnit: '',
      registeredPerson: '',
      assignedPerson: '',
      mailId: ''
    });
  }
  return (
    <div>
      <div className="bg-white lg:flex gap-3 p-4 ml-5 mr-5 rounded-md lg:h-[128px] text-left">
        <div>
          <label className="block font-semibold mb-1">Year</label>
          <select
            value={amcFilters.year}
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
            value={amcFilters.vendor}
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
            value={amcFilters.service}
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
            value={amcFilters.doorNo}
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
            value={amcFilters.shop}
            onChange={(e) => handleFilterChange('shop', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Shop</option>
            <option>AA Plot</option>
            <option>Kambathupatti</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Project Name</label>
          <select
            value={amcFilters.project}
            onChange={(e) => handleFilterChange('project', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Project</option>
            <option>Clients</option>
            <option>Own</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Tenant</label>
          <select
              value={amcFilters.tenant}
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
        {/* Tabs and Actions */}
        <div className=" flex flex-col md:flex-row md:items-center md:justify-between mt-5 mb-3">
          <div className="inline-flex rounded-md p-1 w-fit gap-2">
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
            <button className="h-10 px-4 bg-[#BF9853] text-white rounded-md" onClick={() => setIsAmcInputsOpen(true)}>+ Add Input</button>
            <button className="h-10 px-4 bg-[#BF9853] text-white rounded-md" onClick={() => setIsAmcCreateOpen(true)}>Create</button>
          </div>
        </div>
        <div className="rounded-lg border-l-8 border-l-[#BF9853]">
          <table className="w-full table-auto mb-4 border-collapse">
            <thead>
              <tr className="bg-[#FAF6ED] text-left">
                <th className="p-2 pl-3">Sl.No</th>
                <th className="p-2">Projects</th>
                <th className="p-2">Type</th>
                <th className="p-2">Number</th>
                <th className="p-2">Payment Date</th>
                <th className="p-2">Validity</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Exp Date</th>
                <th className="p-2">Remain Days</th>
                <th className="p-2">Next Service</th>
                <th className="p-2">Exp Ago</th>
                <th className="p-2">Registered</th>
                <th className="p-2">Activity</th>
              </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>
        {isAmcInputsOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsAmcInputsOpen(false)} />
            <div className="relative z-40 bg-white rounded-lg shadow-xl p-5 w-[900px] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">AMC Inputs</h3>
                <button className="text-red-600 text-2xl" onClick={() => setIsAmcInputsOpen(false)}>×</button>
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
                                <td className="p-2 w-20 font-semibold">{item.id}</td>
                                <td className="p-2 text-left w-48 flex justify-between items-center">
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
                      <button
                        className="text-black font-bold px-1 ml-6 rounded border-dashed border-b-2 border-[#BF9853]"
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
                                <td className="p-2 text-left w-48 flex justify-between items-center">
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
                {/* PURPOSE COLUMN */}
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
                      <button
                        className="text-black font-bold px-1 ml-6 rounded border-dashed border-b-2 border-[#BF9853]"
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
                                <td className="p-2 text-left w-48 flex justify-between items-center">
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
                <button className="px-6 py-2 border border-[#BF9853] text-[#BF9853] rounded-md" onClick={() => setIsAmcInputsOpen(false)}>Cancel</button>
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

        {isAmcCreateOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsAmcCreateOpen(false)} />
            <div className="relative z-40 bg-white rounded-lg shadow-xl p-6 w-[860px] max-w-[92vw]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">AMC Details</h3>
                <button className="text-red-600 text-2xl" onClick={() => setIsAmcCreateOpen(false)}>×</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-left">
                <div>
                  <label className="block font-semibold mb-1">Service Type</label>
                  <select
                    value={amcForm.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none"
                  >
                    <option value="">Select</option>
                    {typeItems.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Service Provider</label>
                  <input
                    list="amc-service-providers"
                    value={amcForm.network}
                    onChange={(e) => handleFormChange('network', e.target.value)}
                    placeholder="Enter here"
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                  />
                  <datalist id="amc-service-providers">
                    {networkItems.map(item => (
                      <option key={item.id} value={item.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Service Number</label>
                  <input
                    value={amcForm.number}
                    onChange={(e) => handleFormChange('number', e.target.value)}
                    placeholder="Select"
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Project</label>
                  <select
                    value={amcForm.project}
                    onChange={(e) => handleFormChange('project', e.target.value)}
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="Clients">Clients</option>
                    <option value="Own">Own</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Purpose</label>
                  <select
                    value={amcForm.purpose}
                    onChange={(e) => handleFormChange('purpose', e.target.value)}
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none"
                  >
                    <option value="">Select</option>
                    {purposeItems.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Amount</label>
                  <input
                    value={amcForm.amount}
                    onChange={(e) => handleFormChange('amount', e.target.value)}
                    placeholder="Enter here"
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={amcForm.paymentDate}
                    onChange={(e) => handleFormChange('paymentDate', e.target.value)}
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Service Start Date</label>
                  <input
                    type="date"
                    value={amcForm.serviceStart}
                    onChange={(e) => handleFormChange('serviceStart', e.target.value)}
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Validity</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min="0"
                      value={amcForm.validityValue}
                      onChange={(e) => handleFormChange('validityValue', Number(e.target.value))}
                      className="h-11 w-20 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                    />
                    <select
                      value={amcForm.validityUnit}
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
                <div>
                  <label className="block font-semibold mb-1">Registered Person</label>
                  <select
                    value={amcForm.registeredPerson}
                    onChange={(e) => handleFormChange('registeredPerson', e.target.value)}
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="Amir H">Amir H</option>
                    <option value="Jothi S">Jothi S</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Assigned Person</label>
                  <select
                    value={amcForm.assignedPerson}
                    onChange={(e) => handleFormChange('assignedPerson', e.target.value)}
                    className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="Vinothan P">Vinothan P</option>
                    <option value="Amir H">Amir H</option>
                    <option value="Jothi S">Jothi S</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Next Service</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min="0"
                      value={amcForm.nextServiceValue}
                      onChange={(e) => handleFormChange('nextServiceValue', Number(e.target.value))}
                      className="h-11 w-20 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                    />
                    <select
                      value={amcForm.nextServiceUnit}
                      onChange={(e) => handleFormChange('nextServiceUnit', e.target.value)}
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
              <div className="pt-5 flex gap-4">
                <button
                  className="px-10 py-2 bg-[#BF9853] text-white rounded-md"
                  onClick={() => { setIsAmcCreateOpen(false); resetForm(); }}
                >
                  Submit
                </button>
                <button
                  className="px-10 py-2 border border-[#BF9853] text-[#BF9853] rounded-md"
                  onClick={() => { setIsAmcCreateOpen(false); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default DirectoryAmc
