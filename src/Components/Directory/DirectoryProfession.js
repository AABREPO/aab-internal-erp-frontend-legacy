import React, { useEffect, useMemo, useRef, useState } from 'react';
import Select from 'react-select';
import filterIcon from '../Images/filter (3).png';
import cross from '../Images/cross.png';

const PROJECTS_API = 'https://backendaab.in/demoAabuilderDash/api/projects/getAll';
const PROPERTY_TYPES_API = 'https://backendaab.in/demoAabuildersDash/api/property_types/getAll';

const EMPTY_OWNER = {
  clientName: '',
  fatherName: '',
  mobile: '',
  age: '',
  clientAddress: '',
};

const EMPTY_PROPERTY_DETAIL = {
  projectType: '',
  floorName: '',
  shopNo: '',
  doorNo: '',
  area: '',
  professionTaxNo: '',
};

const safeTrim = (value) => String(value ?? '').trim();

const INITIAL_PROFESSION_PROJECT = {
  projectName: '',
  projectAddress: '',
  projectId: '',
  projectCategory: '',
  projectReferenceName: '',
  branch: '',
  ownerDetailsList: [{ ...EMPTY_OWNER }],
  propertyDetailsList: [{ ...EMPTY_PROPERTY_DETAIL }],
  siteEngineerId: '',
};

const fieldLg =
  'border-2 border-[#BF9853] border-opacity-30 p-2 rounded-lg h-14 focus:outline-none';

const fieldRO = `${fieldLg} bg-[#F5F5F5] cursor-default pointer-events-none select-none caret-transparent`;

const roInputProps = {
  readOnly: true,
  tabIndex: -1,
  onFocus: (e) => e.target.blur(),
  onMouseDown: (e) => e.preventDefault(),
};

const DirectoryProfession = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'https://backendaab.in/demoAabuildersDash';
  const [isFilterRowVisible, setIsFilterRowVisible] = useState(false);
  const [isProfessionProjectFormOpen, setIsProfessionProjectFormOpen] = useState(false);
  const [projectsList, setProjectsList] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [professionProjectForm, setProfessionProjectForm] = useState(INITIAL_PROFESSION_PROJECT);
  const [professionProjectSaving, setProfessionProjectSaving] = useState(false);
  const [editingProjectDbId, setEditingProjectDbId] = useState(null);
  const selectedProjectSnapshotRef = useRef(null);
  const fileInputRef = useRef(null);
  const [professionFilters, setProfessionFilters] = useState({
    year: '',
    vendor: '',
    service: '',
    doorNo: '',
    shop: '',
    project: '',
    tenant: '',
  });
  const [tableFilters, setTableFilters] = useState({
    project: '',
    type: '',
    number: '',
    paymentDate: '',
  });
  const [professionRows] = useState([]);

  const handleFilterChange = (key, value) => {
    setProfessionFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTableFilterChange = (key, value) => {
    setTableFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setProfessionFilters({
      year: '',
      vendor: '',
      service: '',
      doorNo: '',
      shop: '',
      project: '',
      tenant: '',
    });
    setTableFilters({
      project: '',
      type: '',
      number: '',
      paymentDate: '',
    });
  };

  const hasActiveFilters =
    professionFilters.year ||
    professionFilters.vendor ||
    professionFilters.service ||
    professionFilters.doorNo ||
    professionFilters.shop ||
    professionFilters.project ||
    professionFilters.tenant ||
    tableFilters.project ||
    tableFilters.type ||
    tableFilters.number ||
    tableFilters.paymentDate;

  const selectClass =
    'h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none';

  const inputClass =
    'w-full h-10 border border-[#BF9853]/40 rounded-md px-2 text-sm focus:outline-none';

  const siteEngineerSelectOptions = useMemo(() => {
    const list = Array.isArray(employeeList) ? employeeList : [];
    return list
      .map((emp) => {
        const rowId = emp.id ?? emp.employee_id ?? emp.employeeId;
        const label = emp.employee_name ?? emp.employeeName ?? emp.name ?? '';
        if (rowId == null || rowId === '') return null;
        return {
          value: String(rowId),
          label: String(label || `Employee #${rowId}`),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [employeeList]);

  const professionProjectSelectStyles = useMemo(
    () => ({
      control: (provided, state) => ({
        ...provided,
        minHeight: '56px',
        height: '56px',
        border: '2px solid rgba(191, 152, 83, 0.3)',
        borderRadius: '0.5rem',
        boxShadow: 'none',
        '&:hover': { borderColor: 'rgba(191, 152, 83, 0.5)' },
        ...(state.isFocused && { borderColor: '#BF9853', boxShadow: 'none' }),
      }),
      valueContainer: (provided) => ({ ...provided, height: '52px', padding: '2px 8px' }),
      indicatorsContainer: (provided) => ({ ...provided, height: '52px' }),
      menuPortal: (base, portalProps) => ({
        ...base,
        zIndex: 9999,
        boxSizing: 'border-box',
        ...(portalProps?.rect?.width != null ? { width: `${portalProps.rect.width}px` } : {}),
      }),
      menu: (base) => ({
        ...base,
        left: 0,
        width: '100%',
        margin: 0,
        textAlign: 'left',
        boxSizing: 'border-box',
      }),
      menuList: (base) => ({
        ...base,
        textAlign: 'left',
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#BF9853' : state.isFocused ? '#F5F5F5' : 'white',
        color: state.isSelected ? 'white' : 'black',
      }),
      placeholder: (provided) => ({ ...provided, color: '#9CA3AF' }),
    }),
    []
  );

  const projectSelectOptions = useMemo(() => {
    const seen = new Set();
    return projectsList
      .map((p) => {
        const label = safeTrim(p.projectName ?? p.siteName);
        if (!label || seen.has(label)) return null;
        seen.add(label);
        return {
          value: String(p.id ?? label),
          label,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [projectsList]);

  const selectedProfessionProjectOption = useMemo(() => {
    const name = safeTrim(professionProjectForm.projectName);
    if (!name) return null;
    return (
      projectSelectOptions.find((o) => o.label === name) ?? { value: name, label: name }
    );
  }, [projectSelectOptions, professionProjectForm.projectName]);

  const siteEngineerDisplayName = useMemo(() => {
    const match = siteEngineerSelectOptions.find(
      (o) => o.value === professionProjectForm.siteEngineerId
    );
    return match?.label ?? '';
  }, [siteEngineerSelectOptions, professionProjectForm.siteEngineerId]);

  const mapOwnerFromApi = (owner) => ({
    clientName: owner?.clientName ?? '',
    fatherName: owner?.fatherName ?? '',
    mobile: owner?.mobile ?? '',
    age: owner?.age ?? '',
    clientAddress: owner?.clientAddress ?? '',
  });

  const mapPropertyFromApi = (detail) => ({
    id: detail?.id,
    projectType: detail?.projectType ?? '',
    floorName: detail?.floorName ?? '',
    shopNo: detail?.shopNo ?? '',
    doorNo: detail?.doorNo ?? '',
    area: detail?.area ?? '',
    ebNo: detail?.ebNo ?? '',
    ebNoPhase: detail?.ebNoPhase ?? '',
    ebNoFrequency: detail?.ebNoFrequency ?? '',
    propertyTaxNo: detail?.propertyTaxNo ?? '',
    propertyTaxFrequency: detail?.propertyTaxFrequency ?? '',
    waterTaxNo: detail?.waterTaxNo ?? '',
    waterTaxFrequency: detail?.waterTaxFrequency ?? '',
    professionTaxNo:
      detail?.professionalTaxNo ?? detail?.professionTaxNo ?? detail?.waterTaxNo ?? '',
  });

  const fetchProjectsForForm = async () => {
    try {
      const response = await fetch(PROJECTS_API);
      if (response.ok) {
        const data = await response.json();
        setProjectsList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPropertyTypesForForm = async () => {
    try {
      const response = await fetch(PROPERTY_TYPES_API);
      if (response.ok) {
        const data = await response.json();
        setPropertyTypes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEmployeesForForm = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee_details/basic/getAll`);
      if (response.ok) {
        const data = await response.json();
        setEmployeeList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetProfessionProjectForm = () => {
    setEditingProjectDbId(null);
    selectedProjectSnapshotRef.current = null;
    setProfessionProjectForm({
      ...INITIAL_PROFESSION_PROJECT,
      ownerDetailsList: [{ ...EMPTY_OWNER }],
      propertyDetailsList: [{ ...EMPTY_PROPERTY_DETAIL }],
    });
  };

  const handleOpenAddPopup = () => {
    resetProfessionProjectForm();
    setIsProfessionProjectFormOpen(true);
  };

  const handleCloseProfessionProjectForm = () => {
    setIsProfessionProjectFormOpen(false);
    resetProfessionProjectForm();
  };

  const handleProjectSelectChange = (option) => {
    if (!option) {
      resetProfessionProjectForm();
      return;
    }
    handleProjectNameChange(option.label);
  };

  const handleProjectNameChange = (projectName) => {
    const found = projectsList.find((p) => (p.projectName ?? p.siteName ?? '') === projectName);
    if (!found) {
      setEditingProjectDbId(null);
      selectedProjectSnapshotRef.current = null;
      setProfessionProjectForm((prev) => ({ ...prev, projectName }));
      return;
    }
    setEditingProjectDbId(found.id ?? null);
    selectedProjectSnapshotRef.current = found;
    const owners = found.ownerDetails ?? found.ownerDetailsList;
    const properties = found.propertyDetails ?? found.propertyDetailsList;
    const rawSeId =
      found.siteEngineerId ?? found.siteEngineer?.id ?? found.site_engineer_id ?? '';
    setProfessionProjectForm({
      projectName: found.projectName ?? projectName,
      projectAddress: found.projectAddress ?? '',
      projectId: found.projectId ?? found.siteNo ?? '',
      projectCategory: found.projectCategory ?? '',
      projectReferenceName: found.projectReferenceName ?? '',
      branch: found.branch ?? '',
      siteEngineerId: rawSeId === '' || rawSeId == null ? '' : String(rawSeId),
      ownerDetailsList:
        Array.isArray(owners) && owners.length
          ? owners.map(mapOwnerFromApi)
          : [{ ...EMPTY_OWNER }],
      propertyDetailsList:
        Array.isArray(properties) && properties.length
          ? properties.map(mapPropertyFromApi)
          : [{ ...EMPTY_PROPERTY_DETAIL }],
    });
  };

  const handleNewOwnerChange = (index, field, value) => {
    setProfessionProjectForm((prev) => {
      const updated = [...prev.ownerDetailsList];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, ownerDetailsList: updated };
    });
  };

  const addNewOwner = () => {
    setProfessionProjectForm((prev) => ({
      ...prev,
      ownerDetailsList: [...prev.ownerDetailsList, { ...EMPTY_OWNER }],
    }));
  };

  const handleNewDetailChange = (index, field, value) => {
    setProfessionProjectForm((prev) => {
      const updated = [...prev.propertyDetailsList];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, propertyDetailsList: updated };
    });
  };

  const addNewPropertyDetail = () => {
    setProfessionProjectForm((prev) => ({
      ...prev,
      propertyDetailsList: [...prev.propertyDetailsList, { ...EMPTY_PROPERTY_DETAIL }],
    }));
  };

  const handleSubmitProfessionProject = async (e) => {
    e.preventDefault();
    if (!safeTrim(professionProjectForm.projectName)) return;
    if (!editingProjectDbId) {
      window.alert('Please select a project to update.');
      return;
    }
    const snapshot = selectedProjectSnapshotRef.current;
    if (!snapshot) {
      window.alert('Project data is not loaded. Please select the project again.');
      return;
    }

    setProfessionProjectSaving(true);
    const originalProperties = Array.isArray(snapshot.propertyDetails)
      ? snapshot.propertyDetails
      : [];

    const propertyDetails = professionProjectForm.propertyDetailsList.map((detail, index) => {
      const original = originalProperties[index] ?? {};
      return {
        ...original,
        projectType: original.projectType ?? detail.projectType ?? '',
        floorName: original.floorName ?? detail.floorName ?? '',
        shopNo: original.shopNo ?? detail.shopNo ?? '',
        doorNo: original.doorNo ?? detail.doorNo ?? '',
        area: original.area ?? detail.area ?? '',
        ebNo: original.ebNo ?? '',
        ebNoPhase: original.ebNoPhase ?? '',
        ebNoFrequency: original.ebNoFrequency ?? '',
        propertyTaxNo: original.propertyTaxNo ?? '',
        propertyTaxFrequency: original.propertyTaxFrequency ?? '',
        waterTaxNo: original.waterTaxNo ?? '',
        waterTaxFrequency: original.waterTaxFrequency ?? '',
        professionalTaxNo: safeTrim(detail.professionTaxNo),
      };
    });

    const payload = {
      projectName: snapshot.projectName ?? professionProjectForm.projectName,
      projectAddress: snapshot.projectAddress ?? professionProjectForm.projectAddress ?? '',
      projectId: snapshot.projectId ?? professionProjectForm.projectId ?? '',
      projectCategory: snapshot.projectCategory ?? professionProjectForm.projectCategory ?? '',
      projectReferenceName:
        snapshot.projectReferenceName ?? professionProjectForm.projectReferenceName ?? '',
      branch: snapshot.branch ?? professionProjectForm.branch ?? '',
      location: snapshot.location ?? '',
      siteEngineerId:
        snapshot.siteEngineerId ??
        (professionProjectForm.siteEngineerId === ''
          ? null
          : String(professionProjectForm.siteEngineerId)),
      ownerDetails: snapshot.ownerDetails ?? professionProjectForm.ownerDetailsList,
      accountDetails: snapshot.accountDetails ?? [],
      propertyDetails,
    };

    try {
      const response = await fetch(
        `https://backendaab.in/demoAabuilderDash/api/projects/edit/${editingProjectDbId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update professional tax numbers');
      }
      await fetchProjectsForForm();
      handleCloseProfessionProjectForm();
    } catch (error) {
      console.error(error);
      window.alert(error?.message || 'Failed to update professional tax numbers.');
    } finally {
      setProfessionProjectSaving(false);
    }
  };

  useEffect(() => {
    if (!isProfessionProjectFormOpen) return;
    fetchProjectsForForm();
    fetchPropertyTypesForForm();
    fetchEmployeesForForm();
  }, [isProfessionProjectFormOpen]);

  return (
    <div>
      <div className="bg-white lg:flex gap-3 p-4 ml-5 mr-5 rounded-md lg:h-[128px] text-left">
        <div>
          <label className="block font-semibold mb-1">Year</label>
          <select value={professionFilters.year} onChange={(e) => handleFilterChange('year', e.target.value)} className={selectClass}>
            <option value="">Select Year</option>
            <option>2024</option>
            <option>2025</option>
            <option>2026</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Vendor</label>
          <select value={professionFilters.vendor} onChange={(e) => handleFilterChange('vendor', e.target.value)} className={selectClass}>
            <option value="">Select Vendor</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Service</label>
          <select value={professionFilters.service} onChange={(e) => handleFilterChange('service', e.target.value)} className={selectClass}>
            <option value="">Select Service</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Door No</label>
          <select value={professionFilters.doorNo} onChange={(e) => handleFilterChange('doorNo', e.target.value)} className={selectClass}>
            <option value="">Select Door No</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Shop</label>
          <select value={professionFilters.shop} onChange={(e) => handleFilterChange('shop', e.target.value)} className={selectClass}>
            <option value="">Select Shop</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Project Name</label>
          <select value={professionFilters.project} onChange={(e) => handleFilterChange('project', e.target.value)} className={selectClass}>
            <option value="">Select Project</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Tenant</label>
          <select value={professionFilters.tenant} onChange={(e) => handleFilterChange('tenant', e.target.value)} className={selectClass}>
            <option value="">Select Tenant</option>
          </select>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto bg-white p-4 ml-5 mr-5 rounded-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-5 mb-3">
          <div className="inline-flex rounded-md p-1 w-fit gap-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-semibold rounded-md px-3 py-1 shadow-lg"
              onClick={() => setIsFilterRowVisible((prev) => !prev)}
            >
              <img src={filterIcon} alt="filter" className="w-4 h-5" />
            </button>
            <button type="button" className="px-6 py-2 rounded font-semibold transition-colors border border-gray-300 hover:bg-gray-50">
              Clients Projects
            </button>
            <button type="button" className="px-6 py-2 rounded font-semibold transition-colors border border-gray-300 hover:bg-gray-50">
              Own Projects
            </button>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <button type="button" className="h-10 text-[#E4572E] hover:underline">Export PDF</button>
            <button type="button" className="h-10 text-[#007233] hover:underline">Export XL</button>
            <button type="button" className="h-10 text-[#BF9853] hover:underline">Print</button>
            <button type="button" className="h-10 px-4 bg-[#BF9853] text-white rounded-md" onClick={handleOpenAddPopup}>Create</button>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center mb-3 px-2">
            {professionFilters.year && (
              <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium">
                <span className="font-normal">Year:</span>
                <span className="font-bold">{professionFilters.year}</span>
                <button type="button" onClick={() => handleFilterChange('year', '')} className="text-[#BF9853] ml-1 text-lg leading-none">×</button>
              </span>
            )}
            <button type="button" onClick={clearAllFilters} className="text-[#BF9853] border border-[#BF9853] rounded px-3 py-1 text-sm font-medium hover:bg-[#BF9853] hover:text-white transition-colors">
              Clear All
            </button>
          </div>
        )}
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
              {isFilterRowVisible && (
                <tr className="bg-white border-b border-gray-200 text-sm">
                  <th className="p-2 pl-3" />
                  <th className="p-2">
                    <input value={tableFilters.project} onChange={(e) => handleTableFilterChange('project', e.target.value)} placeholder="Project..." className={inputClass} />
                  </th>
                  <th className="p-2">
                    <input value={tableFilters.type} onChange={(e) => handleTableFilterChange('type', e.target.value)} placeholder="Type..." className={inputClass} />
                  </th>
                  <th className="p-2">
                    <input value={tableFilters.number} onChange={(e) => handleTableFilterChange('number', e.target.value)} placeholder="Number..." className={inputClass} />
                  </th>
                  <th className="p-2">
                    <input type="date" value={tableFilters.paymentDate} onChange={(e) => handleTableFilterChange('paymentDate', e.target.value)} className={inputClass} />
                  </th>
                  <th className="p-2" colSpan={8} />
                </tr>
              )}
            </thead>
            <tbody>
              {professionRows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-6 text-center text-gray-500 text-sm">
                    No profession records yet.
                  </td>
                </tr>
              ) : (
                professionRows.map((row, index) => (
                  <tr key={row.id ?? index} className="border-b border-gray-100">
                    <td className="p-2 pl-3">{index + 1}</td>
                    <td className="p-2">{row.project ?? '-'}</td>
                    <td className="p-2">{row.type ?? '-'}</td>
                    <td className="p-2">{row.number ?? '-'}</td>
                    <td className="p-2">{row.paymentDate ?? '-'}</td>
                    <td className="p-2">{row.validity ?? '-'}</td>
                    <td className="p-2">{row.amount ?? '-'}</td>
                    <td className="p-2">{row.expDate ?? '-'}</td>
                    <td className="p-2">{row.remainDays ?? '-'}</td>
                    <td className="p-2">{row.nextService ?? '-'}</td>
                    <td className="p-2">{row.expAgo ?? '-'}</td>
                    <td className="p-2">{row.registered ?? '-'}</td>
                    <td className="p-2">{row.activity ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isProfessionProjectFormOpen && (
        <div className="fixed inset-0 z-[60] flex justify-center items-center p-4 overflow-y-auto bg-black/50">
          <div className="bg-white rounded-md w-full max-w-[95rem] max-h-[90vh] text-left overflow-y-auto pl-4 sm:pl-20">
            <div className="flex justify-end mt-4 mr-8">
              <button type="button" onClick={handleCloseProfessionProjectForm}>
                <img src={cross} alt="close" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitProfessionProject}>
              <div className="h-[500px] overflow-auto pb-4">
                <div className="flex gap-4 flex-wrap">
                  <div className="mb-4 pl-5 w-[35rem] max-w-full">
                    <label className="block text-lg font-medium mb-2">Project Name</label>
                    <Select
                      inputId="profession-project-name"
                      value={selectedProfessionProjectOption}
                      onChange={handleProjectSelectChange}
                      options={projectSelectOptions}
                      placeholder="Search or select project name"
                      isSearchable
                      isClearable
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      menuPosition="fixed"
                      styles={professionProjectSelectStyles}
                      classNamePrefix="profession-project-select"
                      noOptionsMessage={() => 'No projects found'}
                    />
                  </div>
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project ID</label>
                    <input
                      type="text"
                      {...roInputProps}
                      className={`w-[25rem] max-w-full ${fieldRO}`}
                      value={professionProjectForm.projectId}
                    />
                  </div>
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Branch</label>
                    <input
                      type="text"
                      {...roInputProps}
                      className={`w-[15rem] max-w-full ${fieldRO}`}
                      value={professionProjectForm.branch}
                    />
                  </div>
                </div>
                <div className="flex gap-4 flex-wrap items-end">
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Reference Name</label>
                    <input
                      type="text"
                      {...roInputProps}
                      className={`w-[35rem] max-w-full ${fieldRO}`}
                      value={professionProjectForm.projectReferenceName}
                    />
                  </div>
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Category</label>
                    <input
                      type="text"
                      {...roInputProps}
                      className={`w-[25rem] max-w-full ${fieldRO}`}
                      value={professionProjectForm.projectCategory}
                    />
                  </div>
                  <div className="mb-4 pl-5 min-w-[16rem] w-[20rem]">
                    <label className="block text-lg font-medium mb-2">Site Engineer</label>
                    <input
                      type="text"
                      {...roInputProps}
                      className={`w-full ${fieldRO}`}
                      value={siteEngineerDisplayName}
                    />
                  </div>
                </div>
                <div className="mb-4 pl-5">
                  <label className="block text-lg font-medium mb-2">Project Address</label>
                  <input
                    type="text"
                    {...roInputProps}
                    className={`w-[62rem] max-w-full ${fieldRO}`}
                    value={professionProjectForm.projectAddress}
                  />
                </div>
                {professionProjectForm.ownerDetailsList.map((owner, index) => (
                  <div key={`owner-${index}`} className="mb-2">
                    <div className="flex mb-2">
                      <div className="mt-12 mr-4">{index + 1}.</div>
                      <div className="flex mb-2 gap-5 flex-wrap">
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Client Name</label>
                          <input
                            type="text"
                            {...roInputProps}
                            value={owner.clientName}
                            className={`w-80 ${fieldRO}`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Father Name</label>
                          <input
                            type="text"
                            {...roInputProps}
                            value={owner.fatherName}
                            className={`w-72 ${fieldRO}`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Mobile</label>
                          <input
                            type="text"
                            {...roInputProps}
                            value={owner.mobile}
                            className={`w-60 ${fieldRO}`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Age</label>
                          <input
                            type="text"
                            {...roInputProps}
                            value={owner.age}
                            className={`w-20 ${fieldRO}`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="relative pl-4">
                      <label className="block text-lg font-medium">Client Address</label>
                      <input
                        type="text"
                        {...roInputProps}
                        value={owner.clientAddress}
                        className={`w-[62rem] max-w-full ${fieldRO}`}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-[#E4572E] font-bold ml-4 px-1 border-dashed border-b-2 border-[#BF9853]"
                  onClick={addNewOwner}
                >
                  + Add Another Owner
                </button>
                {professionProjectForm.propertyDetailsList.map((detail, index) => (
                  <div key={`property-${index}`} className="flex mb-2 gap-5 flex-wrap">
                    <div className="mt-12">{index + 1}.</div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Project Type</label>
                      <input
                        type="text"
                        {...roInputProps}
                        value={detail.projectType}
                        className={`w-40 ${fieldRO}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Floor Name</label>
                      <input
                        type="text"
                        {...roInputProps}
                        value={detail.floorName}
                        className={`w-36 ${fieldRO}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Shop No</label>
                      <input
                        type="text"
                        {...roInputProps}
                        value={detail.shopNo}
                        className={`w-28 ${fieldRO}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Door No</label>
                      <input
                        type="text"
                        {...roInputProps}
                        value={detail.doorNo}
                        className={`w-28 ${fieldRO}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Area</label>
                      <input
                        type="text"
                        {...roInputProps}
                        value={detail.area}
                        className={`w-28 ${fieldRO}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Professional Tax</label>
                      <input
                        type="text"
                        value={detail.professionTaxNo}
                        onChange={(e) => handleNewDetailChange(index, 'professionTaxNo', e.target.value)}
                        placeholder="Professional Tax"
                        className={`w-40 ${fieldLg}`}
                      />
                    </div>
                    <div className="flex items-end mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedList = [...professionProjectForm.propertyDetailsList];
                          updatedList.splice(index, 1);
                          setProfessionProjectForm((prev) => ({
                            ...prev,
                            propertyDetailsList: updatedList.length
                              ? updatedList
                              : [{ ...EMPTY_PROPERTY_DETAIL }],
                          }));
                        }}
                        className="text-red-500 font-bold text-xl hover:text-red-700"
                        title="Remove this row"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-[#E4572E] font-bold px-1 ml-3 border-dashed border-b-2 border-[#BF9853]"
                  onClick={addNewPropertyDetail}
                >
                  + Add on
                </button>
              </div>
              <div className="flex justify-end mr-5 space-x-2 mt-8 mb-4">
                <button
                  type="submit"
                  className="bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold disabled:opacity-60"
                  disabled={professionProjectSaving}
                >
                  {professionProjectSaving ? 'Saving...' : 'Update'}
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={handleCloseProfessionProjectForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectoryProfession;
