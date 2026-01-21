import React, { useState, useEffect } from 'react';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import cross from '../Images/cross.png';
import download from '../Images/Download.svg';
import edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';
import Select from 'react-select';
import attach from '../Images/Attachfile.svg';
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
const InputData = ({ username, userRoles = [] }) => {
  const [tenantNameSearch, setTenantNameSearch] = useState("");
  const [paymentModeSearch, setPaymentModeSearch] = useState("");
  const [tenantLinkSearch, setTenantLinkSearch] = useState("");
  const [tenantLinkList, setTenantLinkList] = useState([]);
  const [isTenantLinkOpen, setIsTenantLinkOpen] = useState(false);
  const [isTenantLinkEditOpen, setIsTenantLinkEditOpen] = useState(false);
  const [selectedTenantLinkId, setSelectedTenantLinkId] = useState(null);
  const [tenantshoplink, setTenantshoplink] = useState(false);
  const [isPropertyOpen, setIsPropertyOpen] = useState(false);
  const [isPaymentModeOpen, setIsPaymentModeOpen] = useState(false);
  const [isPropertyEditOpen, setIsPropertyEditOpen] = useState(false);
  const [tenantshopadd, setTenantshopadd] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [tenantList, setTenantList] = useState([]);
  const [editPaymentModeOpen, setEditPaymentModeopen] = useState(false);
  const [propertyNames, setPropertyNames] = useState([]);
  const [editFloorOptions, setEditFloorOptions] = useState([]);
  const [editShopNoOptions, setEditShopNoOptions] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedPropertyEdit, setSelectedPropertyEdit] = useState(null);
  const [usedShopNos, setUsedShopNos] = useState(new Set());
  const [shopsWithClosureDate, setShopsWithClosureDate] = useState(new Set());
  const [userPermissions, setUserPermissions] = useState([]);
  const [isProjectManagementOpen, setIsProjectManagementOpen] = useState(false);
  const [isProjectEditOpen, setIsProjectEditOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectManagementSearch, setProjectManagementSearch] = useState('');
  const moduleName = "Rent Management";
  const [newProject, setNewProject] = useState({
    projectName: '',
    projectAddress: '',
    projectId: '',
    projectCategory: '',
    projectReferenceName: '',
    ownerDetailsList: [{
      clientName: "",
      fatherName: "",
      mobile: "",
      age: "",
      clientAddress: ""
    }],
    propertyDetailsList: [{
      projectType: "",
      floorName: "",
      shopNo: "",
      doorNo: "",
      area: "",
      ebNo: "",
      ebNoPhase: "1P",
      ebNoFrequency: "",
      propertyTaxNo: "",
      propertyTaxFrequency: "",
      waterTaxNo: "",
      waterTaxFrequency: ""
    }]
  });
  const sortPropertyDetailsByShopNo = (details = []) => {
    const parseShopNo = (shopNo = '') => {
      const trimmed = shopNo.trim().toUpperCase();
      const sanitized = trimmed.replace(/[\s-]+/g, '');
      if (!trimmed) {
        return { isEmpty: true, prefix: '', number: Number.MAX_SAFE_INTEGER, remainder: '' };
      }

      const alphaNumericMatch = sanitized.match(/^([A-Z]+)(\d+)/);
      if (alphaNumericMatch) {
        const [, prefix, numberPart] = alphaNumericMatch;
        return {
          isEmpty: false,
          prefix,
          number: parseInt(numberPart, 10),
          remainder: sanitized.slice(alphaNumericMatch[0].length),
        };
      }

      const numericMatch = sanitized.match(/^(\d+)/);
      if (numericMatch) {
        return {
          isEmpty: false,
          prefix: '',
          number: parseInt(numericMatch[1], 10),
          remainder: sanitized.slice(numericMatch[1].length),
        };
      }

      return { isEmpty: false, prefix: sanitized || trimmed, number: Number.MAX_SAFE_INTEGER, remainder: '' };
    };

    return [...details].sort((a, b) => {
      const shopA = parseShopNo(a.shopNo);
      const shopB = parseShopNo(b.shopNo);

      if (shopA.isEmpty !== shopB.isEmpty) {
        return shopA.isEmpty ? 1 : -1;
      }
      if (shopA.prefix !== shopB.prefix) {
        return shopA.prefix.localeCompare(shopB.prefix);
      }
      if (shopA.number !== shopB.number) {
        return shopA.number - shopB.number;
      }
      return shopA.remainder.localeCompare(shopB.remainder);
    });
  };

  const [editProject, setEditProject] = useState({
    projectName: '',
    projectAddress: '',
    projectId: '',
    projectCategory: '',
    projectReferenceName: '',
    ownerDetailsList: [{
      clientName: "",
      fatherName: "",
      mobile: "",
      age: "",
      clientAddress: ""
    }],
    propertyDetailsList: [{
      projectType: "",
      floorName: "",
      shopNo: "",
      doorNo: "",
      area: "",
      ebNo: "",
      ebNoPhase: "1P",
      ebNoFrequency: "",
      propertyTaxNo: "",
      propertyTaxFrequency: "",
      waterTaxNo: "",
      waterTaxFrequency: ""
    }]
  });
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const response = await axios.get("https://backendaab.in/aabuilderDash/api/user_roles/all");
        const allRoles = response.data;
        const userRoleNames = userRoles.map(r => r.roles);
        const matchedRoles = allRoles.filter(role =>
          userRoleNames.includes(role.userRoles)
        );
        const models = matchedRoles.flatMap(role => role.userModels || []);
        const matchedModel = models.find(role => role.models === moduleName);
        const permissions = matchedModel?.permissions?.[0]?.userPermissions || [];
        setUserPermissions(permissions);
      } catch (error) {
        console.error("Error fetching user roles:", error);
      }
    };
    if (userRoles.length > 0) {
      fetchUserRoles();
    }
  }, [userRoles]);
  const fetchProjects = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/getAll');
      if (response.ok) {
        const data = await response.json();
        const ownProjects = Array.isArray(data)
          ? data.filter(p =>
            (p.projectCategory || '').toLowerCase() === 'own project' &&
            p.projectReferenceName
          )
          : [];
        setProjects(ownProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };
  useEffect(() => {
    fetchProjects();
  }, []);
  const [editProperties, setEditProperties] = useState({
    propertyName: '',
    propertyAddress: '',
    ownerDetailsList: [],
    propertyDetailsList: [],
  });
  const [selectedTenantNameId, setSelectedTenantNameId] = useState(null);
  const propertyOptions = propertyNames.map(name => ({
    value: name,
    label: name
  }));
  const projectOptions = projects
    .filter(project => project.projectReferenceName)
    .map(project => ({
      value: project.projectReferenceName,
      label: project.projectReferenceName,
      project: project
    }));
  const [newProperty, setNewProperty] = useState({
    propertyName: "",
    propertyAddress: "",
    ownerDetailsList: [{ ownerName: "", fatherName: "", mobile: "", age: "", ownerAddress: "" }],
    propertyDetailsList: [{ propertyType: "", floorName: "", doorNo: "", area: "", ebNo: "" }],
  });
  const getShopOptionsForProperty = (projectRefName, propertyType, includeCurrentShops = []) => {
    if (!projectRefName || !propertyType) return [];
    const matchedProject = projects.find(
      (p) => p.projectReferenceName === projectRefName
    );
    if (!matchedProject) {
      return [];
    }

    if (!matchedProject.propertyDetails) {
      return [];
    }

    const propertyDetailsArray = Array.isArray(matchedProject.propertyDetails)
      ? matchedProject.propertyDetails
      : Array.from(matchedProject.propertyDetails || []);

    if (propertyDetailsArray.length === 0) {
      return [];
    }
    const filteredByType = propertyDetailsArray.filter((detail) =>
      detail.projectType === propertyType
    );
    if (filteredByType.length === 0) {
      return [];
    }
    const shopNos = filteredByType
      .map((detail) => detail.shopNo)
      .filter((shopNo) => shopNo !== null && shopNo !== undefined && shopNo !== '')
      .map((shopNo) => String(shopNo).trim())
      .filter((shopNo) => shopNo !== '')
      .filter((shopNo, i, arr) => arr.indexOf(shopNo) === i);
    const currentShopNosSet = new Set(includeCurrentShops.map(s => String(s)));
    const availableShopNos = shopNos.filter((shopNo) => {
      const isMapped = usedShopNos.has(shopNo);
      const hasClosureDate = shopsWithClosureDate.has(shopNo);
      const isCurrentShop = currentShopNosSet.has(shopNo);
      return !isMapped || hasClosureDate || isCurrentShop;
    });
    return availableShopNos.map((d) => ({
      value: d,
      label: d,
    }));
  };
  const getFloorOptionsForProperty = (projectRefName, propertyType) => {
    if (!projectRefName || !propertyType) return [];
    const matchedProject = projects.find(
      (p) => p.projectReferenceName === projectRefName
    );
    if (!matchedProject || !matchedProject.propertyDetails) return [];
    const propertyDetailsArray = Array.isArray(matchedProject.propertyDetails)
      ? matchedProject.propertyDetails
      : Array.from(matchedProject.propertyDetails || []);
    const floorNames = propertyDetailsArray
      .filter((detail) => detail.projectType === propertyType)
      .map((detail) => detail.floorName)
      .filter((v) => v && v.trim() !== '')
      .filter((v, i, arr) => arr.indexOf(v) === i);
    return floorNames.map((f) => ({
      value: f,
      label: f,
    }));
  };
  const getAllShopNumbersUnfiltered = () => {
    const shopMap = new Map();
    projects.forEach((project) => {
      if (!project || !project.propertyDetails) return;
      const propertyDetailsArray = Array.isArray(project.propertyDetails)
        ? project.propertyDetails
        : Array.from(project.propertyDetails || []);
      propertyDetailsArray.forEach((detail) => {
        if (detail && detail.shopNo && detail.shopNo !== null && detail.shopNo !== undefined && detail.shopNo !== '') {
          const shopNoStr = String(detail.shopNo).trim();
          if (shopNoStr !== '' && !shopMap.has(shopNoStr)) {
            const shopId = detail.id || detail.shopNo;
            shopMap.set(shopNoStr, {
              value: shopId,
              label: shopNoStr,
              shopNo: shopNoStr,
              id: shopId,
              projectReferenceName: project.projectReferenceName || '',
              doorNo: detail.doorNo || ''
            });
          }
        }
      });
    });
    return Array.from(shopMap.values()).sort((a, b) => {
      const aNum = parseInt(a.shopNo);
      const bNum = parseInt(b.shopNo);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.shopNo.localeCompare(b.shopNo);
    });
  };
  const getAllShopNumbers = () => {
    const activeLinkedShopNoIds = new Set();
    if (tenantLinkList && Array.isArray(tenantLinkList)) {
      tenantLinkList.forEach((tenantLink) => {
        if (tenantLink && tenantLink.shopNos && Array.isArray(tenantLink.shopNos)) {
          tenantLink.shopNos.forEach((shop) => {
            if (shop && shop.shopNoId != null && shop.active === true) {
              const shopIdStr = String(shop.shopNoId).trim();
              activeLinkedShopNoIds.add(shopIdStr);
            }
          });
        }
      });
    }
    const shopMap = new Map();
    projects.forEach((project) => {
      if (!project || !project.propertyDetails) return;
      const propertyDetailsArray = Array.isArray(project.propertyDetails)
        ? project.propertyDetails
        : Array.from(project.propertyDetails || []);
      propertyDetailsArray.forEach((detail) => {
        if (detail && detail.shopNo && detail.shopNo !== null && detail.shopNo !== undefined && detail.shopNo !== '') {
          const shopNoStr = String(detail.shopNo).trim();
          if (shopNoStr !== '') {
            const shopId = detail.id || detail.shopNo;
            const shopIdStr = String(shopId).trim();
            const isActiveLinked = activeLinkedShopNoIds.has(shopIdStr);
            if (!shopMap.has(shopNoStr) && !isActiveLinked) {
              shopMap.set(shopNoStr, {
                value: shopId,
                label: shopNoStr,
                shopNo: shopNoStr,
                id: shopId,
                projectReferenceName: project.projectReferenceName || '',
                doorNo: detail.doorNo || ''
              });
            }
          }
        }
      });
    });
    return Array.from(shopMap.values()).sort((a, b) => {
      const aNum = parseInt(a.shopNo);
      const bNum = parseInt(b.shopNo);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.shopNo.localeCompare(b.shopNo);
    });
  };
  const getAllShopNumbersForEdit = () => {
    const activeLinkedShopNoIds = new Set();
    if (tenantLinkList && Array.isArray(tenantLinkList)) {
      tenantLinkList.forEach((tenantLink) => {
        // Exclude the currently edited tenant link from filtering
        if (tenantLink.id === selectedTenantLinkId) {
          return;
        }
        if (tenantLink && tenantLink.shopNos && Array.isArray(tenantLink.shopNos)) {
          tenantLink.shopNos.forEach((shop) => {
            if (shop && shop.shopNoId != null && shop.active === true) {
              const shopIdStr = String(shop.shopNoId).trim();
              activeLinkedShopNoIds.add(shopIdStr);
            }
          });
        }
      });
    }
    const shopMap = new Map();
    projects.forEach((project) => {
      if (!project || !project.propertyDetails) return;
      const propertyDetailsArray = Array.isArray(project.propertyDetails)
        ? project.propertyDetails
        : Array.from(project.propertyDetails || []);
      propertyDetailsArray.forEach((detail) => {
        if (detail && detail.shopNo && detail.shopNo !== null && detail.shopNo !== undefined && detail.shopNo !== '') {
          const shopNoStr = String(detail.shopNo).trim();
          if (shopNoStr !== '') {
            const shopId = detail.id || detail.shopNo;
            const shopIdStr = String(shopId).trim();
            const isActiveLinked = activeLinkedShopNoIds.has(shopIdStr);
            if (!shopMap.has(shopNoStr) && !isActiveLinked) {
              shopMap.set(shopNoStr, {
                value: shopId,
                label: shopNoStr,
                shopNo: shopNoStr,
                id: shopId,
                projectReferenceName: project.projectReferenceName || '',
                doorNo: detail.doorNo || ''
              });
            }
          }
        }
      });
    });
    return Array.from(shopMap.values()).sort((a, b) => {
      const aNum = parseInt(a.shopNo);
      const bNum = parseInt(b.shopNo);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.shopNo.localeCompare(b.shopNo);
    });
  };
  const getShopDetailsById = (shopNoId) => {
    if (!shopNoId) return null;
    for (const project of projects) {
      if (!project.propertyDetails) continue;
      const propertyDetailsArray = Array.isArray(project.propertyDetails)
        ? project.propertyDetails
        : Array.from(project.propertyDetails || []);
      const detail = propertyDetailsArray.find(d =>
        (d.id && d.id.toString() === shopNoId.toString()) ||
        (d.shopNo && d.shopNo.toString() === shopNoId.toString())
      );
      if (detail) {
        return {
          shopNo: detail.shopNo || '',
          projectReferenceName: project.projectReferenceName || '',
          doorNo: detail.doorNo || '',
          projectType: detail.projectType || '',
          floorName: detail.floorName || ''
        };
      }
    }
    return null;
  };
  const getShopsByProjectReferenceName = (projectRefName, useUnfiltered = false, forEdit = false) => {
    const allShops = useUnfiltered ? getAllShopNumbersUnfiltered() : (forEdit ? getAllShopNumbersForEdit() : getAllShopNumbers());
    if (!projectRefName || projectRefName === '') {
      return allShops;
    }
    return allShops.filter(shop => shop.projectReferenceName === projectRefName);
  };

  const [formData, setFormData] = useState({
    tenantName: '',
    fullName: '',
    tenantFatherName: '',
    age: '',
    mobileNumber: '',
    tenantAddress: '',
    properties: [
      {
        propertyName: '',
        shops: [
          {
            propertyType: '',
            floorName: '',
            doorNo: '',
            shopNo: '',
            monthlyRent: '',
            advanceAmount: '',
            startingDate: '',
            shouldCollectAdvance: true,
          }
        ]
      }
    ]
  });
  const [editformData, setEditformData] = useState({
    tenantName: '',
    fullName: '',
    tenantFatherName: '',
    age: '',
    mobileNumber: '',
    tenantAddress: '',
    property: [
      {
        propertyName: '',
        shops: [
          {
            propertyType: '',
            floorName: '',
            doorNo: '',
            shopNo: '',
            Rent: '',
            advance: '',
            startingDate: '',
            shouldCollectAdvance: true,
          }
        ]
      }
    ]
  })

  const handleEditOwnerChange = (index, field, value) => {
    const updatedOwners = [...editProject.ownerDetailsList];
    updatedOwners[index][field] = value;
    setEditProject((prev) => ({ ...prev, ownerDetailsList: updatedOwners }));
  };

  const handleEditDetailChange = (index, field, value) => {
    const updatedDetails = [...editProject.propertyDetailsList];
    updatedDetails[index][field] = value;
    setEditProject((prev) => ({
      ...prev,
      propertyDetailsList: updatedDetails,
    }));
  };
  const addEditOwner = () => {
    setEditProject((prev) => ({
      ...prev,
      ownerDetailsList: [...prev.ownerDetailsList, {
        clientName: "",
        fatherName: "",
        mobile: "",
        age: "",
        clientAddress: ""
      }]
    }));
  };

  const addEditPropertyDetail = () => {
    setEditProject((prev) => ({
      ...prev,
      propertyDetailsList: [
        ...prev.propertyDetailsList,
        {
          projectType: "",
          floorName: "",
          shopNo: "",
          doorNo: "",
          area: "",
          ebNo: "",
          ebNoPhase: "1P",
          ebNoFrequency: "",
          propertyTaxNo: "",
          propertyTaxFrequency: "",
          waterTaxNo: "",
          waterTaxFrequency: ""
        },
      ],
    }));
  };
  const handleTenantChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleTenanteditChange = (e) => {
    const { name, value } = e.target;
    setEditformData((prev) => ({
      ...prev,
      [name]: value
    }))
  }
  const handlePropertyChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...formData.properties];
    updated[index][name] = value;
    setFormData({ ...formData, properties: updated });
  };
  const handlePropertyeditChange = (propertyIndex, e) => {
    const { name, value } = e.target;
    setEditformData(prev => {
      const newProperties = [...prev.property];
      newProperties[propertyIndex] = {
        ...newProperties[propertyIndex],
        [name]: value
      };
      return { ...prev, property: newProperties };
    });
  };
  const handleShopChange = (pIndex, sIndex, e) => {
    const { name, type, checked, value } = e.target;
    const updated = [...formData.properties];
    updated[pIndex].shops[sIndex][name] = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, properties: updated });
  };
  const handleShopeditChange = (propertyIndex, shopIndex, e) => {
    const { name, type, checked, value } = e.target;
    setEditformData(prev => {
      const updatedProperties = [...prev.property];
      const updatedShops = [...updatedProperties[propertyIndex].shops];
      updatedShops[shopIndex] = {
        ...updatedShops[shopIndex],
        [name]: type === "checkbox" ? checked : value,
      };
      updatedProperties[propertyIndex] = {
        ...updatedProperties[propertyIndex],
        shops: updatedShops,
      };
      return { ...prev, property: updatedProperties };
    });
  };
  const addShop = (pIndex) => {
    const updated = [...formData.properties];
    updated[pIndex].shops.push({
      propertyType: '',
      floorName: '',
      doorNo: '',
      shopNo: '',
      monthlyRent: '',
      advanceAmount: '',
      shouldCollectAdvance: true,
    });
    setFormData({ ...formData, properties: updated });
  };
  const addShopEdit = (pIndex) => {
    const updated = [...editformData.property];
    updated[pIndex].shops.push({
      propertyType: '',
      floorName: '',
      doorNo: '',
      shopNo: '',
      Rent: '',
      advance: '',
      shouldCollectAdvance: true,
    });
    setEditformData({ ...editformData, property: updated });
  }
  const removeShop = (pIndex, sIndex) => {
    const updated = [...formData.properties];
    updated[pIndex].shops.splice(sIndex, 1);
    setFormData({ ...formData, properties: updated });
  };
  const removeShopEdit = (pIndex, sIndex) => {
    const updated = [...editformData.property];
    updated[pIndex].shops.splice(sIndex, 1);
    setEditformData({ ...editformData, property: updated });
  }
  const removePropertyEdit = (pIndex) => {
    const updatedProperties = [...editformData.property];
    updatedProperties.splice(pIndex, 1);
    setEditformData({
      ...editformData,
      property: updatedProperties
    });
  }
  const addProperty = () => {
    setFormData((prev) => ({
      ...prev,
      properties: [
        ...prev.properties,
        {
          propertyName: '',
          shops: [
            {
              propertyType: '',
              floorName: '',
              doorNo: '',
              shopNo: '',
              Rent: '',
              advance: '',
              shouldCollectAdvance: true,
            }
          ]
        }
      ]
    }));
  };
  const addPropertyEdit = () => {
    setEditformData((prev) => ({
      ...prev,
      property: [
        ...prev.property,
        {
          propertyName: '',
          shops: [
            {
              propertyType: '',
              floorName: '',
              doorNo: '',
              shopNo: '',
              Rent: '',
              advance: '',
              shouldCollectAdvance: true,
            }
          ]
        }
      ]
    }));
  }
  const openPaymentModePopup = () => setIsPaymentModeOpen(true);
  const closePaymentModePopup = () => setIsPaymentModeOpen(false);
  const openAccountTypes = () => setTenantshoplink(true);
  const closeAccountTypes = () => {
    setTenantshoplink(false);
    setFormData({
      tenantName: '',
      fullName: '',
      tenantFatherName: '',
      age: '',
      mobileNumber: '',
      tenantAddress: '',
      properties: [
        {
          propertyName: '',
          shops: [
            {
              propertyType: '',
              floorName: '',
              doorNo: '',
              shopNo: '',
              monthlyRent: '',
              advanceAmount: ''
            }
          ]
        }
      ]
    });
  };
  const closeAccount1Types = () => {
    setTenantshopadd(false);
    setEditformData({
      tenantName: '',
      fullName: '',
      tenantFatherName: '',
      age: '',
      mobileNumber: '',
      tenantAddress: '',
      properties: [
        {
          propertyName: '',
          shops: [
            {
              propertyType: '',
              floorName: '',
              doorNo: '',
              shopNo: '',
              monthlyRent: '',
              advanceAmount: ''
            }
          ]
        }
      ]
    });
  };
  const openPropertyPopup = () => setIsPropertyOpen(true);
  const closePropertyPopup = () => setIsPropertyOpen(false);
  const [tenantLinkFormData, setTenantLinkFormData] = useState({
    tenantName: '',
    fullName: '',
    tenantFatherName: '',
    age: '',
    mobileNumber: '',
    tenantAddress: '',
    shopNos: [
      {
        shopNoId: '',
        projectReferenceName: '',
        monthlyRent: '',
        advanceAmount: '',
        startingDate: '',
        shouldCollectAdvance: true
      }
    ]
  });
  const [editTenantLinkFormData, setEditTenantLinkFormData] = useState({
    tenantName: '',
    fullName: '',
    tenantFatherName: '',
    age: '',
    mobileNumber: '',
    tenantAddress: '',
    shopNos: [
      {
        shopNoId: '',
        projectReferenceName: '',
        monthlyRent: '',
        advanceAmount: '',
        startingDate: '',
        rentIncreaseYear: '',
        rentIncreasePercentage: '',
        rentAssignDate: '',
        shouldCollectAdvance: true,
        shopClosureDate: ''
      }
    ]
  });
  const [accountType, setAccountType] = useState('');
  const [modeOfPayment, setModeOfPayment] = useState('');
  const [paymentMode, setPaymentMode] = useState([]);
  const [siteNames, setSiteNames] = useState([]);
  const [properties, setProperties] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentModeId, setSelectedPaymentModeId] = useState('');
  const [editModeOfPayment, setEditModeOfPayment] = useState('');
  const handleTenantClick = (aadhaarFile) => {
    const blob = new Blob([Uint8Array.from(atob(aadhaarFile), c => c.charCodeAt(0))], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);
    setSelectedPdf(pdfUrl);
    setIsModalOpen(true);
  };
  const propertyTypeOptions = [
    { value: 'Shop', label: 'Shop' },
    { value: 'House', label: 'House' },
    { value: 'Land', label: 'Land' },
    { value: 'Flat', label: 'Flat' },
  ];
  const propertyTypeEditOptions = [
    { value: 'Shop', label: 'Shop' },
    { value: 'House', label: 'House' },
    { value: 'Land', label: 'Land' },
    { value: 'Flat', label: 'Flat' },
  ];
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPdf(null);
  };
  console.log(message);
  const openEditPaymentMode = (item) => {
    setEditModeOfPayment(item.modeOfPayment);
    setSelectedPaymentModeId(item.id);
    setEditPaymentModeopen(true);
  }
  const openEditTenantNameWithShop = (item) => {
    setEditformData({
      ...item,
      shouldCollectAdvance: item.shouldCollectAdvance ?? true
    });
    setSelectedTenantNameId(item.id);
    setTenantshopadd(true);
  };
  const closeEditPaymentMode = () => {
    setEditPaymentModeopen(false);
    setEditModeOfPayment('');
    setSelectedPaymentModeId('');
  }
  const openEditPropertyPopup = (item) => {
    setEditProperties({
      ...item,
      propertyDetailsList: [...item.propertyDetailsList],
    });
    setSelectedPropertyId(item.id);
    setIsPropertyEditOpen(true);
  }
  const closeEditPropertyPopup = () => {
    setIsPropertyEditOpen(false);
    setEditProperties(null);
    setSelectedPropertyId('');
  }
  const handleNewOwnerChange = (index, field, value) => {
    const updatedOwners = [...newProperty.ownerDetailsList];
    updatedOwners[index][field] = value;
    setNewProperty((prev) => ({ ...prev, ownerDetailsList: updatedOwners }));
  };
  const handleNewDetailChange = (index, field, value) => {
    const updatedDetails = [...newProperty.propertyDetailsList];
    updatedDetails[index][field] = value;
    setNewProperty((prev) => ({ ...prev, propertyDetailsList: updatedDetails }));
  };
  const addNewOwner = () => {
    setNewProperty((prev) => ({
      ...prev,
      ownerDetailsList: [...prev.ownerDetailsList, { ownerName: "", fatherName: "", mobile: "", age: "", ownerAddress: "" }]
    }));
  };
  const addNewPropertyDetail = () => {
    setNewProperty((prev) => ({
      ...prev,
      propertyDetailsList: [...prev.propertyDetailsList, { propertyType: "", floorName: "", doorNo: "", area: "" }]
    }));
  };
  const removeOwner = (indexToRemove) => {
    setEditProperties((prev) => ({
      ...prev,
      ownerDetailsList: prev.ownerDetailsList.filter((_, i) => i !== indexToRemove),
    }));
  };
  useEffect(() => {
    fetchProperties();
  }, []);
  const fetchProperties = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/properties/all');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
        const propertyNamesList = data.map((item) => item.propertyName);
        setPropertyNames(propertyNamesList);
      } else {
        setMessage('Error fetching properties.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching properties.');
    }
  };
  const handleOwnerChange = (index, field, value) => {
    const updatedOwners = [...editProperties.ownerDetailsList];
    updatedOwners[index][field] = value;
    setEditProperties((prev) => ({ ...prev, ownerDetailsList: updatedOwners }));
  };
  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...editProperties.propertyDetailsList];
    updatedDetails[index][field] = value;
    setEditProperties((prev) => ({ ...prev, propertyDetailsList: updatedDetails }));
  };
  const addOwner = () => {
    setEditProperties((prev) => ({
      ...prev,
      ownerDetailsList: [
        ...prev.ownerDetailsList,
        {
          ownerName: '',
          fatherName: '',
          mobile: '',
          age: '',
          ownerAddress: '',
        },
      ],
    }));
  };
  const removePropertyDetail = (indexToRemove) => {
    setEditProperties((prev) => ({
      ...prev,
      propertyDetailsList: prev.propertyDetailsList.filter((_, i) => i !== indexToRemove),
    }));
  };
  const addPropertyDetail = () => {
    setEditProperties((prev) => ({
      ...prev,
      propertyDetailsList: [
        ...prev.propertyDetailsList,
        {
          propertyType: '',
          floorName: '',
          doorNo: '',
          area: '',
        },
      ],
    }));
  };
  const removeProperty = (pIndex) => {
    const updatedProperties = [...formData.properties];
    updatedProperties.splice(pIndex, 1);
    setFormData({
      ...formData,
      properties: updatedProperties
    });
  };
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await axios.get('https://backendaab.in/aabuildersDash/api/tenant-groups/all');
        const updatedTenants = response.data.map((tenant) => {
          if (tenant.aadhaarFile) {
            return {
              ...tenant,
              aadhaarImageUrl: `data:image/jpeg;base64,${tenant.aadhaarFile}`,
            };
          }
          return tenant;
        });
      } catch (error) {
        console.error('Error fetching tenants:', error);
      }
    };
    fetchTenants();
  }, []);
  useEffect(() => {
    const fetchTenantsWithShop = async () => {
      try {
        const response = await axios.get('https://backendaab.in/aabuildersDash/api/tenantShop/getAll');
        const updatedTenants = response.data
        setTenantList(updatedTenants);
        const usedShopsArray = updatedTenants.flatMap((tenant) =>
          tenant.property?.flatMap((prop) =>
            prop.shops?.map((shop) => shop.shopNo).filter(Boolean)
          ) || []
        );
        const usedShops = new Set(usedShopsArray.map(s => String(s)));
        setUsedShopNos(usedShops);
        const shopsWithClosureArray = updatedTenants.flatMap((tenant) =>
          tenant.property?.flatMap((prop) =>
            prop.shops
              ?.filter((shop) => shop.shopNo && shop.shopClosureDate)
              .map((shop) => shop.shopNo)
              .filter(Boolean)
          ) || []
        );
        const shopsWithClosure = new Set(shopsWithClosureArray.map(s => String(s)));
        setShopsWithClosureDate(shopsWithClosure);
      } catch (error) {
        console.error('Error fetching tenants:', error);
      }
    };
    fetchTenantsWithShop();
  }, []);
  useEffect(() => {
    const fetchTenantLinkWithShop = async () => {
      try {
        const response = await axios.get('https://backendaab.in/aabuildersDash/api/tenant_link_shop/getAll');
        setTenantLinkList(response.data);
      } catch (error) {
        console.error('Error fetching tenant link with shop:', error);
      }
    };
    fetchTenantLinkWithShop();
  }, []);
  const handleAllProperties = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all Properties ?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/properties/deleteAll", {
          method: "DELETE",
        });
        if (response.ok) {
          alert("All Properties have been deleted successfully.");
        } else {
          console.error("Failed to delete all Properties. Status:", response.status);
          alert("Error deleting the Properties. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting all Properties:", error);
        alert("An error occurred while deleting all Properties.");
      }
    } else {
      console.log("Deletion cancelled.");
    }
  };
  const handleAllTenantWithShop = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all Tenants ?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/tenantShop/deleteAll", {
          method: "DELETE",
        });
        if (response.ok) {
          alert("All Tenants have been deleted successfully.");
        } else {
          console.error("Failed to delete all Tenants. Status:", response.status);
          alert("Error deleting the Tenants. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting all Tenants:", error);
        alert("An error occurred while deleting all Tenants.");
      }
    } else {
      console.log("Deletion cancelled.");
    }
  };
  const handleAllPaymentModes = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all Payment Modes?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/payment_mode/deleteAll", {
          method: "DELETE",
        });
        if (response.ok) {
          setPaymentMode([]);
          alert("All Payment Mode have been deleted successfully.");
        } else {
          console.error("Failed to delete all area names. Status:", response.status);
          alert("Error deleting the area names. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting all area names:", error);
        alert("An error occurred while deleting all area names.");
      }
    } else {
      console.log("Deletion cancelled.");
    }
  };
  useEffect(() => {
    fetchSiteNames();
  }, []);
  const fetchSiteNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/project_Names/getAll');
      if (response.ok) {
        const data = await response.json();
        setSiteNames(data);
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchPaymentModes();
  }, []);
  const fetchPaymentModes = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/payment_mode/getAll');
      if (response.ok) {
        const data = await response.json();
        setPaymentMode(data);
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
    }
  };
  const handleSubmitPaymentMode = async (e) => {
    e.preventDefault();
    const newAccountType = { modeOfPayment };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/payment_mode/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccountType),
      });
      if (response.ok) {
        setMessage('Account Type saved successfully!');
        setAccountType('');
        window.location.reload();
      } else {
        setMessage('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving area name.');
    }
  };
  const handlePaymentModeDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete This Payment Mode?");
    if (confirmed) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/payment_mode/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert("Payment Mode deleted successfully!!!");
          window.location.reload();
        } else {
          console.error("Failed to delete the Payment Mode. Status:", response.status);
          alert("Error deleting the Payment Mode. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the Payment Mode.");
      }
    } else {
      console.log("Cancelled");
    }
  };
  const handleNewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://backendaab.in/aabuildersDash/api/properties/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProperty),
      });
      if (!response.ok) {
        throw new Error("Failed to save property");
      }
      const data = await response.json();
      window.location.reload();
      setNewProperty({
        propertyName: "",
        ownerDetailsList: [{ ownerName: "", fatherName: "", mobile: "", age: "", ownerAddress: "" }],
        propertyDetailsList: [{ propertyType: "", floorName: "", doorNo: "", area: "", ebNo: "" }],
      });
      closePropertyPopup();
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const formatINR = (value) => {
    if (value === undefined || value === null) return ''; // guard clause

    const amount = value.toString().replace(/[^0-9]/g, '');
    if (!amount) return '';

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(amount));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/properties/edit/${selectedPropertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editProperties),
      });
      if (response.ok) {
        window.location.reload();
        closeEditPropertyPopup();
      } else {
        console.error('Update failed:', response.statusText);
        alert('Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Something went wrong while updating the property');
    }
  };
  const handlePropertiesDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete This Property?");
    if (confirmed) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/properties/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert("Properties are deleted successfully!!!");
          window.location.reload();
        } else {
          console.error("Failed to delete the Properties. Status:", response.status);
          alert("Error deleting the Properties. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the Properties.");
      }
    } else {
      console.log("Cancelled");
    }
  };
  const handleTenantDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete This Tenant?");
    if (confirmed) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/tenantShop/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert("Tenants are deleted successfully!!!");
          window.location.reload();
        } else {
          console.error("Failed to delete the Tenant name. Status:", response.status);
          alert("Error deleting the Tenant name. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the Tenant Name.");
      }
    } else {
      console.log("Cancelled");
    }
  };
  const openTenantLinkPopup = () => {
    setTenantLinkFormData({
      tenantName: '',
      fullName: '',
      tenantFatherName: '',
      age: '',
      mobileNumber: '',
      tenantAddress: '',
      shopNos: [
        {
          shopNoId: '',
          projectReferenceName: '',
          monthlyRent: '',
          advanceAmount: '',
          startingDate: '',
          shouldCollectAdvance: true
        }
      ]
    });
    setIsTenantLinkOpen(true);
  };
  const closeTenantLinkPopup = () => {
    setIsTenantLinkOpen(false);
    setTenantLinkFormData({
      tenantName: '',
      fullName: '',
      tenantFatherName: '',
      age: '',
      mobileNumber: '',
      tenantAddress: '',
      shopNos: [
        {
          shopNoId: '',
          projectReferenceName: '',
          monthlyRent: '',
          advanceAmount: '',
          startingDate: '',
          shouldCollectAdvance: true
        }
      ]
    });
  };
  const openEditTenantLink = (item) => {
    setSelectedTenantLinkId(item.id);
    setEditTenantLinkFormData({
      tenantName: item.tenantName || '',
      fullName: item.fullName || '',
      tenantFatherName: item.tenantFatherName || '',
      age: item.age || '',
      mobileNumber: item.mobileNumber || '',
      tenantAddress: item.tenantAddress || '',
      shopNos: item.shopNos && item.shopNos.length > 0 ? item.shopNos.map(shop => {
        const shopDetails = shop.shopNoId ? getShopDetailsById(shop.shopNoId) : null;
        return {
          id: shop.id,
          shopNoId: shop.shopNoId || '',
          projectReferenceName: shopDetails?.projectReferenceName || shop.projectReferenceName || '',
          monthlyRent: shop.monthlyRent || '',
          advanceAmount: shop.advanceAmount || '',
          startingDate: shop.startingDate || '',
          rentIncreaseYear: shop.rentIncreaseYear || '',
          rentIncreasePercentage: shop.rentIncreasePercentage || '',
          rentAssignDate: shop.rentAssignDate || '',
          shouldCollectAdvance: shop.shouldCollectAdvance !== undefined ? shop.shouldCollectAdvance : true,
          shopClosureDate: shop.shopClosureDate || ''
        };
      }) : [{
        shopNoId: '',
        projectReferenceName: '',
        monthlyRent: '',
        advanceAmount: '',
        startingDate: '',
        rentIncreaseYear: '',
        rentIncreasePercentage: '',
        rentAssignDate: '',
        shouldCollectAdvance: true,
        shopClosureDate: ''
      }]
    });
    setIsTenantLinkEditOpen(true);
  };
  const closeEditTenantLink = () => {
    setIsTenantLinkEditOpen(false);
    setSelectedTenantLinkId(null);
    setEditTenantLinkFormData({
      tenantName: '',
      fullName: '',
      tenantFatherName: '',
      age: '',
      mobileNumber: '',
      tenantAddress: '',
      shopNos: [
        {
          shopNoId: '',
          projectReferenceName: '',
          monthlyRent: '',
          advanceAmount: '',
          startingDate: '',
          rentIncreaseYear: '',
          rentIncreasePercentage: '',
          rentAssignDate: '',
          shouldCollectAdvance: true,
          shopClosureDate: ''
        }
      ]
    });
  };
  const handleTenantLinkDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete This Tenant Link?");
    if (confirmed) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/tenant_link_shop/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert("Tenant Link deleted successfully!!!");
          window.location.reload();
        } else {
          console.error("Failed to delete the Tenant Link. Status:", response.status);
          alert("Error deleting the Tenant Link. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the Tenant Link.");
      }
    }
  };
  const handleAllTenantLinkDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all Tenant Links?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/tenant_link_shop/deleteAll", {
          method: "DELETE",
        });
        if (response.ok) {
          alert("All Tenant Links have been deleted successfully.");
          window.location.reload();
        } else {
          console.error("Failed to delete all Tenant Links. Status:", response.status);
          alert("Error deleting the Tenant Links. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting all Tenant Links:", error);
        alert("An error occurred while deleting all Tenant Links.");
      }
    }
  };

  // Tenant Link Form Handlers
  const handleTenantLinkChange = (e) => {
    const { name, value } = e.target;
    setTenantLinkFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditTenantLinkChange = (e) => {
    const { name, value } = e.target;
    setEditTenantLinkFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTenantLinkShopChange = (sIndex, e) => {
    const { name, type, checked, value } = e.target;
    const updated = [...tenantLinkFormData.shopNos];
    updated[sIndex][name] = type === 'checkbox' ? checked : value;
    setTenantLinkFormData({ ...tenantLinkFormData, shopNos: updated });
  };

  const handleEditTenantLinkShopChange = (sIndex, e) => {
    const { name, type, checked, value } = e.target;
    const updated = [...editTenantLinkFormData.shopNos];
    updated[sIndex][name] = type === 'checkbox' ? checked : value;
    setEditTenantLinkFormData({ ...editTenantLinkFormData, shopNos: updated });
  };

  const addTenantLinkShop = () => {
    setTenantLinkFormData({
      ...tenantLinkFormData,
      shopNos: [
        ...tenantLinkFormData.shopNos,
        {
          shopNoId: '',
          projectReferenceName: '',
          monthlyRent: '',
          advanceAmount: '',
          startingDate: '',
          shouldCollectAdvance: true
        }
      ]
    });
  };

  const addEditTenantLinkShop = () => {
    setEditTenantLinkFormData({
      ...editTenantLinkFormData,
      shopNos: [
        ...editTenantLinkFormData.shopNos,
        {
          shopNoId: '',
          projectReferenceName: '',
          monthlyRent: '',
          advanceAmount: '',
          startingDate: '',
          rentIncreaseYear: '',
          rentIncreasePercentage: '',
          rentAssignDate: '',
          shouldCollectAdvance: true,
          shopClosureDate: ''
        }
      ]
    });
  };

  const removeTenantLinkShop = (sIndex) => {
    const updated = [...tenantLinkFormData.shopNos];
    updated.splice(sIndex, 1);
    setTenantLinkFormData({ ...tenantLinkFormData, shopNos: updated });
  };

  const removeEditTenantLinkShop = (sIndex) => {
    const updated = [...editTenantLinkFormData.shopNos];
    updated.splice(sIndex, 1);
    setEditTenantLinkFormData({ ...editTenantLinkFormData, shopNos: updated });
  };

  const handleTenantLinkSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        tenantName: tenantLinkFormData.tenantName,
        fullName: tenantLinkFormData.fullName,
        tenantFatherName: tenantLinkFormData.tenantFatherName,
        age: tenantLinkFormData.age,
        mobileNumber: tenantLinkFormData.mobileNumber,
        tenantAddress: tenantLinkFormData.tenantAddress,
        shopNos: tenantLinkFormData.shopNos.map((shop) => ({
          shopNoId: shop.shopNoId ? parseInt(shop.shopNoId) : null,
          monthlyRent: shop.monthlyRent || '',
          advanceAmount: shop.advanceAmount || '',
          startingDate: shop.startingDate || '',
          shouldCollectAdvance: shop.shouldCollectAdvance !== undefined ? shop.shouldCollectAdvance : true
        }))
      };

      const response = await fetch('https://backendaab.in/aabuildersDash/api/tenant_link_shop/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Tenant Link saved successfully!");
        closeTenantLinkPopup();
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Save failed:', error);
        alert("Failed to save Tenant Link. Please check the data.");
      }
    } catch (err) {
      console.error('Network error:', err);
      alert("Network error. Please try again.");
    }
  };

  const handleEditTenantLinkSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        tenantName: editTenantLinkFormData.tenantName,
        fullName: editTenantLinkFormData.fullName,
        tenantFatherName: editTenantLinkFormData.tenantFatherName,
        age: editTenantLinkFormData.age,
        mobileNumber: editTenantLinkFormData.mobileNumber,
        tenantAddress: editTenantLinkFormData.tenantAddress,
        shopNos: editTenantLinkFormData.shopNos.map((shop) => ({
          id: shop.id,
          shopNoId: shop.shopNoId ? parseInt(shop.shopNoId) : null,
          monthlyRent: shop.monthlyRent || '',
          advanceAmount: shop.advanceAmount || '',
          startingDate: shop.startingDate || '',
          rentIncreaseYear: shop.rentIncreaseYear || '',
          rentIncreasePercentage: shop.rentIncreasePercentage || '',
          rentAssignDate: shop.rentAssignDate || '',
          shouldCollectAdvance: shop.shouldCollectAdvance !== undefined ? shop.shouldCollectAdvance : true,
          shopClosureDate: shop.shopClosureDate || ''
        }))
      };

      const response = await fetch(`https://backendaab.in/aabuildersDash/api/tenant_link_shop/edit/${selectedTenantLinkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Tenant Link updated successfully!");
        closeEditTenantLink();
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Update failed:', error);
        alert("Failed to update Tenant Link. Please check the data.");
      }
    } catch (err) {
      console.error('Network error:', err);
      alert("Network error. Please try again.");
    }
  };
  const handleSubmitEditPaymentMode = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/payment_mode/edit/${selectedPaymentModeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modeOfPayment: editModeOfPayment }),
      });
      if (response.ok) {
        closeEditPaymentMode();
        window.location.reload();
      } else {
        console.error('Failed to update floor name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  const handleEditTenantSubmit = async (e) => {
    e.preventDefault(); // prevent page reload
    const cleanedData = {
      ...editformData,
      property: editformData.property.map(p => ({
        ...p,
        shops: p.shops.map(shop => ({
          ...shop,
          monthlyRent: shop.monthlyRent != null ? shop.monthlyRent.toString().replace(/[^0-9]/g, '') : '',
          advanceAmount: shop.advanceAmount != null ? shop.advanceAmount.toString().replace(/[^0-9]/g, '') : ''
        }))
      }))
    };
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/tenantShop/edit/${selectedTenantNameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });
      if (response.ok) {
        const result = await response.json();
        // Optional: close modal, refresh list, show toast, etc.
        closeAccount1Types();
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Edit failed:', error);
        alert("Update failed. Please check the data.");
      }
    } catch (err) {
      console.error('Network error:', err);
      alert("Network error. Please try again.");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      tenantName: formData.tenantName,
      fullName: formData.fullName,
      tenantFatherName: formData.tenantFatherName,
      age: formData.age,
      mobileNumber: formData.mobileNumber,
      tenantAddress: formData.tenantAddress,
      property: formData.properties.map((prop) => ({
        propertyName: prop.propertyName,
        shops: prop.shops.map((shop) => ({
          shopNo: shop.shopNo,
          propertyType: shop.propertyType,
          floorName: shop.floorName,
          monthlyRent: shop.monthlyRent,
          advanceAmount: shop.advanceAmount,
          doorNo: shop.doorNo,
          startingDate: shop.startingDate,
        }))
      }))
    };
    const updatedTenants = [{
      tenantName: formData.tenantName,
      tenantDetailsList: [
        {
          tenantFullName: formData.fullName,
          tenantFatherName: formData.tenantFatherName,
          tenantMobile: formData.mobileNumber,
          tenantAge: parseInt(formData.age),
          tenantAddress: formData.tenantAddress,
          aadhaarFile: ""
        }
      ]
    }];
    try {
      const tenantGroupRes = await fetch('https://backendaab.in/aabuildersDash/api/tenant-groups/bulk-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTenants),
      });
      if (!tenantGroupRes.ok) {
        throw new Error('Failed to save tenant group');
      }
      const tenantShopRes = await fetch('https://backendaab.in/aabuildersDash/api/tenantShop/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!tenantShopRes.ok) {
        throw new Error('Failed to save tenant shop');
      }
      const result = await tenantShopRes.json();
      window.location.reload();
    } catch (error) {
      console.error('Submission Error:', error);
    }
  };

  const filteredPaymentMode = paymentMode.filter((item) =>
    item.modeOfPayment.toLowerCase().includes(paymentModeSearch.toLowerCase())
  );
  const filteredTenantName = tenantList.filter((item) =>
    item.tenantName.toLowerCase().includes(tenantNameSearch.toLowerCase())
  );
  const filteredTenantLink = tenantLinkList.filter((item) =>
    item.tenantName?.toLowerCase().includes(tenantLinkSearch.toLowerCase())
  );
  useEffect(() => {
    if (!editformData || !editformData.property) return;
    // Get all current shop numbers from the tenant being edited
    const currentShops = editformData.property.flatMap((prop) =>
      prop.shops?.map((shop) => shop.shopNo).filter(Boolean) || []
    );

    editformData.property.forEach((property) => {
      const selectedProperty = property.propertyName;
      const shops = property.shops || [];
      shops.forEach((shop) => {
        const selectedType = shop.propertyType;
        if (selectedProperty && selectedType) {
          // Use the helper function with current shops included
          const shopOptions = getShopOptionsForProperty(selectedProperty, selectedType, currentShops);
          const floorOptions = getFloorOptionsForProperty(selectedProperty, selectedType);

          setEditFloorOptions(floorOptions);
          setEditShopNoOptions(shopOptions);
        }
      });
    });
  }, [editformData, projects, usedShopNos, shopsWithClosureDate]);
  const handleEditProject = (item) => {
    setSelectedProjectId(item.id);
    setEditProject({
      projectName: item.projectName || '',
      projectAddress: item.projectAddress || '',
      projectId: item.projectId || '',
      projectCategory: item.projectCategory || '',
      projectReferenceName: item.projectReferenceName || '',
      ownerDetailsList: item.ownerDetails && item.ownerDetails.length > 0 ? item.ownerDetails : [{
        clientName: "",
        fatherName: "",
        mobile: "",
        age: "",
        clientAddress: ""
      }],
      propertyDetailsList: sortPropertyDetailsByShopNo(
        item.propertyDetails && item.propertyDetails.length > 0
          ? item.propertyDetails.map(detail => ({
            ...detail,
            ebNoPhase: detail.ebNoPhase || "1P"
          }))
          : [
            {
              projectType: "",
              floorName: "",
              shopNo: "",
              doorNo: "",
              area: "",
              ebNo: "",
              ebNoPhase: "1P",
              ebNoFrequency: "",
              propertyTaxNo: "",
              propertyTaxFrequency: "",
              waterTaxNo: "",
              waterTaxFrequency: ""
            }
          ]
      )
    });
    setIsProjectEditOpen(true);
  };
  const handleSubmitEditProject = async (e) => {
    e.preventDefault();
    try {
      // Sort property details only on submit
      const sortedPropertyDetails = sortPropertyDetailsByShopNo(editProject.propertyDetailsList);
      const payload = {
        projectName: editProject.projectName,
        projectAddress: editProject.projectAddress,
        projectId: editProject.projectId,
        projectCategory: editProject.projectCategory,
        projectReferenceName: editProject.projectReferenceName,
        ownerDetails: editProject.ownerDetailsList,       // mapped for backend
        propertyDetails: sortedPropertyDetails  // mapped for backend - sorted before submit
      };
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/projects/edit/${selectedProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        try {
          const existingSiteNameBySiteNo = siteNames.find(site => site.siteNo === editProject.projectId.toString());
          const existingSiteNameById = siteNames.find(site => site.id === selectedProjectId);
          const existingSiteName = existingSiteNameById || existingSiteNameBySiteNo;
          const siteNamePayload = {
            siteName: editProject.projectName,
            siteNo: editProject.projectId
          };
          if (existingSiteName) {
            const siteNameResponse = await fetch(`https://backendaab.in/aabuilderDash/api/project_Names/edit/${existingSiteName.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(siteNamePayload),
            });
            if (siteNameResponse.ok) {
              fetchSiteNames(); // Refresh site names list
            }
          } else {
            const siteNameResponse = await fetch('https://backendaab.in/aabuilderDash/api/project_Names/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(siteNamePayload),
            });
            if (siteNameResponse.ok) {
              fetchSiteNames(); // Refresh site names list
            }
          }
        } catch (syncError) {
          console.error('Error syncing with Project Names:', syncError);
        }
        setMessage('Project updated successfully!');
        setIsProjectEditOpen(false);
        fetchProjects();
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setMessage('Failed to update project.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error occurred while updating project.');
    }
  };
  const openProjectManagement = () => {
    // Generate next project ID
    const generateNextProjectId = () => {
      if (projects.length === 0) {
        return '1'; // Start with 1 if no projects exist
      }

      // Extract numbers from existing project IDs and find the highest
      const projectIds = projects
        .map(project => project.projectId)
        .filter(projectId => projectId && projectId.toString().trim() !== '')
        .map(projectId => {
          // Try to extract numeric value from various formats
          const numericMatch = projectId.toString().match(/\d+/);
          return numericMatch ? parseInt(numericMatch[0]) : null;
        })
        .filter(num => num !== null && !isNaN(num));

      if (projectIds.length === 0) {
        return '1'; // Default to 1 if no valid numbers found
      }

      const maxNumber = Math.max(...projectIds);
      const nextNumber = maxNumber + 1;
      return nextNumber.toString();
    };

    // Set the auto-generated project ID
    const nextProjectId = generateNextProjectId();
    setNewProject(prev => ({
      ...prev,
      projectId: nextProjectId
    }));

    setIsProjectManagementOpen(true);
  };
  const closeProjectManagement = () => {
    setIsProjectManagementOpen(false);
    // Reset form data with default sets
    setNewProject({
      projectName: '',
      projectAddress: '',
      projectId: '',
      projectCategory: '',
      projectReferenceName: '',
      ownerDetailsList: [{
        clientName: "",
        fatherName: "",
        mobile: "",
        age: "",
        clientAddress: ""
      }],
      propertyDetailsList: [{
        projectType: "",
        floorName: "",
        shopNo: "",
        doorNo: "",
        area: "",
        ebNo: "",
        ebNoFrequency: "",
        propertyTaxNo: "",
        propertyTaxFrequency: "",
        waterTaxNo: "",
        waterTaxFrequency: ""
      }]
    });
  };
  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const projectToDelete = projects.find(project => project.id === id);
        const response = await fetch(`https://backendaab.in/aabuilderDash/api/projects/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          if (projectToDelete) {
            try {
              const existingSiteNameBySiteNo = siteNames.find(site => site.siteNo === projectToDelete.projectId?.toString());
              const existingSiteNameById = siteNames.find(site => site.id === id);
              const existingSiteName = existingSiteNameById || existingSiteNameBySiteNo;
              if (existingSiteName) {
                const siteNameResponse = await fetch(`https://backendaab.in/aabuilderDash/api/project_Names/delete/${existingSiteName.id}`, {
                  method: 'DELETE',
                });
                if (siteNameResponse.ok) {
                  fetchSiteNames(); // Refresh site names list
                }
              }
            } catch (syncError) {
              console.error('Error syncing delete with Project Names:', syncError);
            }
          }
          setMessage('Project deleted successfully!');
          fetchProjects();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        projectName: newProject.projectName,
        projectAddress: newProject.projectAddress,
        projectId: newProject.projectId,
        projectCategory: newProject.projectCategory,
        projectReferenceName: newProject.projectReferenceName,
        ownerDetails: newProject.ownerDetailsList,      // map to backend
        propertyDetails: newProject.propertyDetailsList // map to backend
      };
      const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        try {
          const existingSiteName = siteNames.find(site => site.siteNo === newProject.projectId.toString());
          const siteNamePayload = {
            siteName: newProject.projectName,
            siteNo: newProject.projectId
          };
          if (existingSiteName) {
            const siteNameResponse = await fetch(`https://backendaab.in/aabuilderDash/api/project_Names/edit/${existingSiteName.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(siteNamePayload),
            });
            if (siteNameResponse.ok) {
              fetchSiteNames();
            }
          } else {
            const siteNameResponse = await fetch('https://backendaab.in/aabuilderDash/api/project_Names/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(siteNamePayload),
            });
            if (siteNameResponse.ok) {
              fetchSiteNames();
            }
          }
        } catch (syncError) {
          console.error('Error syncing with Project Names:', syncError);
        }
        setMessage('Project saved successfully!');
        closeProjectManagement();
        fetchProjects();
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setMessage('Failed to save project.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error occurred while saving project.');
    }
  };
  const handleProjectManagementBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/upload-sql', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const result = await response.text();
        setMessage(`Project Management bulk upload successful! ${result}`);
        fetchProjects();
      } else {
        const errorData = await response.text();
        setMessage(`Project Management bulk upload failed: ${errorData}`);
      }
    } catch (error) {
      console.error('Project Management bulk upload error:', error);
      setMessage(`Project Management bulk upload failed: ${error.message}`);
    }
    e.target.value = '';
  };
  return (
    <div className="p-4 bg-white ml-12 mr-8">
      <div className=" lg:flex space-x-[2%] w-full overflow-x-auto">
        <div>
          <div className="flex items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search Tenant Link.."
              value={tenantLinkSearch}
              onChange={(e) => setTenantLinkSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
              onClick={openTenantLinkPopup}>
              + Add
            </button>
          </div>
          <button className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
          <div className={`${userPermissions.includes("Delete") ? '' : 'mt-5'}`}>
            {userPermissions.includes("Delete") && (
              <button onClick={handleAllTenantLinkDelete}>
                <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[15rem]' />
              </button>
            )}
          </div>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto w-96">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left text-xl font-bold">Tenant Name</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto w-96">
                <tbody>
                  {filteredTenantLink.map((item, index) => {
                    // Check if tenant has any vacated shops (similar to Dashboard.js logic)
                    // A shop is vacated if it has a shopClosureDate (active = !shopClosureDate in Dashboard.js)
                    const hasVacatedShops = item.shopNos?.some(shop => 
                      shop.shopClosureDate && shop.shopClosureDate.trim() !== ''
                    ) || false;
                    const displayTenantName = hasVacatedShops 
                      ? `${item.tenantName || 'N/A'} (Vacated)`
                      : (item.tenantName || 'N/A');
                    
                    return (
                      <tr key={item.id} className="border-b bg-white hover:bg-gray-50 cursor-pointer">
                        <td className="p-2 align-top">{index + 1}</td>
                        <td className="py-2 pl-9 font-semibold group flex text-left ">
                          <div className="flex flex-grow">
                            {displayTenantName}
                          </div>
                          <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                            <button type="button" onClick={() => openEditTenantLink(item)}>
                              <img src={edit} alt="add" className="w-4 h-4" type="button" />
                            </button>
                            {userPermissions.includes("Delete") && (
                              <button >
                                <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleTenantLinkDelete(item.id)} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search Mode..."
              value={paymentModeSearch}
              onChange={(e) => setPaymentModeSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
              onClick={openPaymentModePopup}>
              + Add
            </button>
          </div>
          <button className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' />
            <h1 className='mt-1.5 text-sm'>Import file</h1>
          </button>
          <div className={`${userPermissions.includes("Delete") ? '' : 'mt-5'}`}>
            {userPermissions.includes("Delete") && (
              <button onClick={handleAllPaymentModes}>
                <img
                  src={deleteIcon}
                  alt='del'
                  className='-mb-14 ml-[15rem] mt-5 lg:ml-[17rem] md:ml-[30rem]'
                />
              </button>
            )}
          </div>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-72 ">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left lg:w-72 text-xl font-bold">Payment Mode</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto lg:w-72 w-full">
                <tbody>
                  {filteredPaymentMode.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">
                        {(paymentMode.findIndex(v => v.id === item.id) + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.modeOfPayment}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditPaymentMode(item)} />
                          </button>
                          {userPermissions.includes("Delete") && (
                            <button >
                              <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handlePaymentModeDelete(item.id)} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search Project.."
              value={projectManagementSearch}
              onChange={(e) => setProjectManagementSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
              onClick={openProjectManagement}>
              + Add
            </button>
          </div>
          <button className="flex items-center text-[#E4572E] font-bold px-1 ml-4 mt-2 mb-2"
            onClick={() => document.getElementById('projectManagementFileInput').click()}>
            <img src={imports} alt='import' className='w-4 h-4 mr-1' />
            Import File
          </button>
          <input
            type="file"
            id="projectManagementFileInput"
            accept=".sql"
            style={{ display: 'none' }}
            onChange={(e) => handleProjectManagementBulkUpload(e)}
          />
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-60">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left lg:w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left lg:w-52 text-xl font-bold">Property Name</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto lg:w-full w-full">
                <tbody>
                  {projects.filter(project =>
                    (project.projectCategory || '').toLowerCase() === 'own project' &&
                    project.projectReferenceName &&
                    (project.projectName?.toLowerCase().includes(projectManagementSearch.toLowerCase()) ||
                      project.projectAddress?.toLowerCase().includes(projectManagementSearch.toLowerCase()) ||
                      project.projectId?.toLowerCase().includes(projectManagementSearch.toLowerCase()))
                  ).map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">
                        {(projects.findIndex(p => p.id === item.id) + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.projectReferenceName || ''}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button onClick={() => handleEditProject(item)} className="text-blue-600 hover:text-blue-800" title="Edit" >
                            <img src={edit} alt="Edit" className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteProject(item.id)} className="text-red-600 hover:text-red-800" title="Delete" >
                            <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
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
      {isPropertyEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
          <div className="bg-white rounded-md w-[80rem] h-[40rem] text-left pl-28 overflow-y-auto">
            <div>
              <button className="text-red-500 ml-[95%] mt-3" onClick={closeEditPropertyPopup}>
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit}>
              <div className="mb-4 pl-5">
                <label className="block text-lg font-medium mb-2 ">Property Name</label>
                <input
                  type="text"
                  value={editProperties.propertyName}
                  onChange={(e) =>
                    setEditProperties((prev) => ({
                      ...prev,
                      propertyName: e.target.value,
                    }))
                  }
                  className="w-[45rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Property Name"
                  required
                />
              </div>
              <div className="mb-4 pl-5">
                <label className="block text-lg font-medium mb-2 ">Property Address</label>
                <input className="w-[45rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Property Address"
                  type="text"
                  value={editProperties.propertyAddress}
                  onChange={(e) =>
                    setEditProperties((prev) => ({
                      ...prev,
                      propertyAddress: e.target.value,
                    }))
                  }></input>
              </div>
              <div>
                {editProperties.ownerDetailsList.map((owner, index) => (
                  <div key={index} className="mb-2">
                    <div className='flex mb-2 gap-5'>
                      <div className='mt-12'>
                        {index + 1}.
                      </div>
                      <div className="flex flex-col">
                        <label className="mb-1 text-lg font-medium">Owner Name</label>
                        <input
                          type="text"
                          value={owner.ownerName}
                          onChange={(e) => handleOwnerChange(index, 'ownerName', e.target.value)}
                          placeholder="Owner Name"
                          className="w-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="mb-1 text-lg font-medium">Father Name</label>
                        <input
                          type="text"
                          value={owner.fatherName}
                          onChange={(e) => handleOwnerChange(index, 'fatherName', e.target.value)}
                          placeholder="Father Name"
                          className="w-36 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="mb-1 text-lg font-medium">Mobile</label>
                        <input
                          type="text"
                          value={owner.mobile}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d{0,10}$/.test(value)) {
                              handleOwnerChange(index, 'mobile', value);
                            }
                          }}
                          placeholder="Mobile"
                          maxLength={10}
                          className="w-32 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 no-spinner"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="mb-1 text-lg font-medium">Age</label>
                        <input
                          type="number"
                          value={owner.age}
                          onChange={(e) => handleOwnerChange(index, 'age', e.target.value)}
                          placeholder="Age"
                          className="w-20 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 no-spinner"
                        />
                      </div>
                    </div>
                    <div className="ml-3 relative pl-4">
                      <label className="block text-lg font-medium">Owner Address</label>
                      <input
                        type="text"
                        value={owner.ownerAddress}
                        onChange={(e) => handleOwnerChange(index, 'ownerAddress', e.target.value)}
                        placeholder="Owner Address"
                        className="w-[45rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                      />
                      <button
                        type="button"
                        onClick={() => removeOwner(index)}
                        className="absolute ml-2 mt-3 text-red-600 text-lg font-bold hover:text-red-800"
                        title="Remove Owner"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className='text-[#E4572E] font-bold px-1 border-dashed border-b-2 border-[#BF9853]' onClick={addOwner}>+ Add Another Owner</button>
              </div>
              <div>
                {editProperties.propertyDetailsList.map((detail, index) => (
                  <div className='flex mb-1 -ml-2 text-left gap-5' key={detail.id}>
                    <div className='mt-12 ml-4'>
                      {index + 1}.
                    </div>
                    <div className=''>
                      <label className="block mb-1 text-lg font-medium">Property Type</label>
                      <select value={detail.propertyType} onChange={(e) => handleDetailChange(index, 'propertyType', e.target.value)}
                        className="w-40  border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14">
                        <option value="" disabled>Select Type</option>
                        <option value="Shop">Shop</option>
                        <option value="House">House</option>
                        <option value="Land">Land</option>
                        <option value="Office">Office</option>
                        <option value="Construction">Construction</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium ">Floor Name</label>
                      <select value={detail.floorName} onChange={(e) => handleDetailChange(index, 'floorName', e.target.value)}
                        className="w-36 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14">
                        <option value="" disabled>Select Floor</option>
                        <option value="Ground Floor">Ground Floor</option>
                        <option value="First Floor">First Floor</option>
                        <option value="Second Floor">Second Floor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium ">Shop No</label>
                      <input
                        type="text"
                        value={detail.shopNo}
                        onChange={(e) => handleDetailChange(index, 'shopNo', e.target.value)}
                        placeholder="Shop No"
                        className="w-32 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium ">Door No</label>
                      <input
                        type="text"
                        value={detail.doorNo}
                        onChange={(e) => handleDetailChange(index, 'doorNo', e.target.value)}
                        placeholder="Door No"
                        className="w-28 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium ">Area</label>
                      <input
                        type="text"
                        value={detail.area}
                        onChange={(e) => handleDetailChange(index, 'area', e.target.value)}
                        placeholder="Area"
                        className="w-28 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div className="relative">
                      <label className='block mb-1 text-lg font-medium '>EB.NO</label>
                      <input
                        type='text'
                        value={detail.ebNo}
                        onChange={(e) => handleDetailChange(index, 'ebNo', e.target.value)}
                        placeholder='EBNO'
                        className='w-56 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none'
                      />
                      <button type="button" onClick={() => removePropertyDetail(index)} className="absolute top-[2.9rem] right-[-1.5rem] text-red-600 text-lg font-bold hover:text-red-800"
                        title="Remove Row">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className='text-[#E4572E] font-bold px-1 border-dashed border-b-2 border-[#BF9853]' onClick={addPropertyDetail}>+ Add on</button>
              </div>
              <div className="flex space-x-2 mt-6 mb-4 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold" >
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeEditPropertyPopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isPaymentModeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-52 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closePaymentModePopup}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitPaymentMode}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-60">Payment Mode</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Payment Mode"
                  onChange={(e) => setModeOfPayment(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-4 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closePaymentModePopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isPropertyOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[80rem] h-[40rem] text-left overflow-y-auto pl-28">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closePropertyPopup}>
                <img src={cross} alt="close" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleNewSubmit}>
              <div className="mb-4 pl-5">
                <label className="block text-lg font-medium mb-2">Property Name</label>
                <input
                  type="text"
                  value={newProperty.propertyName}
                  onChange={(e) =>
                    setNewProperty((prev) => ({ ...prev, propertyName: e.target.value }))
                  }
                  className="w-[45rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Property Name"
                  required
                />
              </div>
              <div className="mb-4 pl-5">
                <label className="block text-lg font-medium mb-2">Property Address</label>
                <input className="w-[45rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Property Name"
                  type="text"
                  value={newProperty.propertyAddress}
                  onChange={(e) =>
                    setNewProperty((prev) => ({ ...prev, propertyAddress: e.target.value }))
                  }></input>
              </div>
              {newProperty.ownerDetailsList.map((owner, index) => (
                <div key={index} className="mb-2">
                  <div className="flex mb-2 ">
                    <div className="mt-12 mr-4">
                      {index + 1}.
                    </div>
                    <div className='flex mb-2 gap-5'>
                      <div className="flex flex-col">
                        <label className="mb-1 text-lg font-medium">Owner Name</label>
                        <input
                          type="text"
                          value={owner.ownerName}
                          onChange={(e) => handleNewOwnerChange(index, 'ownerName', e.target.value)}
                          placeholder="Owner Name"
                          className="w-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="mb-1 text-lg font-medium">Father Name</label>
                        <input
                          type="text"
                          value={owner.fatherName}
                          onChange={(e) => handleNewOwnerChange(index, 'fatherName', e.target.value)}
                          placeholder="Father Name"
                          className="w-36 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="mb-1 text-lg font-medium">Mobile</label>
                        <input
                          type="text"
                          value={owner.mobile}
                          onChange={(e) => handleNewOwnerChange(index, 'mobile', e.target.value)}
                          placeholder="Mobile"
                          className="w-32 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="mb-1 text-lg font-medium">Age</label>
                        <input
                          type="text"
                          value={owner.age}
                          onChange={(e) => handleNewOwnerChange(index, 'age', e.target.value)}
                          placeholder="Age"
                          className="w-20 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                        />
                      </div>
                    </div>
                  </div>
                  <div className=" relative pl-4">
                    <label className="block text-lg font-medium ">Owner Address</label>
                    <input
                      type="text"
                      value={owner.ownerAddress}
                      onChange={(e) => handleNewOwnerChange(index, 'ownerAddress', e.target.value)}
                      placeholder="Owner Address"
                      className="w-[45rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updatedOwners = [...newProperty.ownerDetailsList];
                        updatedOwners.splice(index, 1);
                        setNewProperty((prev) => ({
                          ...prev,
                          ownerDetailsList: updatedOwners,
                        }));
                      }}
                      className="absolute ml-2 mt-3 text-red-500 font-bold text-xl"
                      title="Remove this owner"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="text-[#E4572E] font-bold ml-4 px-1 border-dashed border-b-2 border-[#BF9853]" onClick={addNewOwner}>+ Add Another Owner</button>
              {newProperty.propertyDetailsList.map((detail, index) => (
                <div className="flex mb-2 gap-5" key={index}>
                  <div className="mt-12">
                    {index + 1}.
                  </div>
                  <div className="">
                    <label className="block mb-1 text-lg font-medium">Property Type</label>
                    <select
                      value={detail.propertyType}
                      onChange={(e) => handleNewDetailChange(index, 'propertyType', e.target.value)}
                      className="w-40  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                    >
                      <option value="">Select Type</option>
                      <option value="Shop">Shop</option>
                        <option value="House">House</option>
                        <option value="Land">Land</option>
                        <option value="Office">Office</option>
                        <option value="Construction">Construction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-lg font-medium">Floor Name</label>
                    <select
                      value={detail.floorName}
                      onChange={(e) => handleNewDetailChange(index, 'floorName', e.target.value)}
                      className="w-36  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                    >
                      <option value="">Select Floor</option>
                      <option value="Ground Floor">Ground Floor</option>
                      <option value="First Floor">First Floor</option>
                      <option value="Second Floor">Second Floor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-lg font-medium">Shop No</label>
                    <input
                      type="text"
                      value={detail.shopNo}
                      onChange={(e) => handleNewDetailChange(index, 'shopNo', e.target.value)}
                      placeholder="Shop No"
                      className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-lg font-medium">Door No</label>
                    <input
                      type="text"
                      value={detail.doorNo}
                      onChange={(e) => handleNewDetailChange(index, 'doorNo', e.target.value)}
                      placeholder="Door No"
                      className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-lg font-medium">Area</label>
                    <input
                      type="text"
                      value={detail.area}
                      onChange={(e) => handleNewDetailChange(index, 'area', e.target.value)}
                      placeholder="Area"
                      className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                    />
                  </div>
                  <div className="relative">
                    <label className='block mb-1 text-lg font-medium '>EB.NO</label>
                    <input
                      type='text'
                      value={detail.ebNo}
                      onChange={(e) => handleNewDetailChange(index, 'ebNo', e.target.value)}
                      placeholder='EB NO'
                      className='w-56 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none'
                    />
                  </div>
                  <div className="flex items-end ml-2 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        const updatedList = [...newProperty.propertyDetailsList];
                        updatedList.splice(index, 1);
                        setNewProperty(prev => ({
                          ...prev,
                          propertyDetailsList: updatedList,
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
              <button type="button" className="text-[#E4572E] font-bold px-1 ml-3 border-dashed border-b-2 border-[#BF9853] " onClick={addNewPropertyDetail}>+ Add on</button>
              <div className="flex space-x-2 mt-6 mb-4 ml-5">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closePropertyPopup}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editPaymentModeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeEditPaymentMode}>
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitEditPaymentMode}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[15.5rem]">Payment Mode</label>
                <input
                  type="text"
                  value={editModeOfPayment}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Payment Mode"
                  onChange={(e) => setEditModeOfPayment(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeEditPaymentMode}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this tile?</p>
            <div className="flex space-x-4">
              <button className="bg-red-500 text-white p-2 rounded">
                Yes, Delete
              </button>
              <button className="bg-gray-300 p-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isProjectManagementOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[95rem] h-[40rem] text-left overflow-y-auto pl-20">
            <div className='flex justify-end mr-16 mt-4'>
              <div>
                <button className="text-red-500 " onClick={closeProjectManagement}>
                  <img src={cross} alt="close" className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmitProject}>
              <div className='overflow-y-auto h-[500px]'>
                <div className="flex gap-4">
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Name</label>
                    <input
                      type="text"
                      value={newProject.projectName}
                      onChange={(e) =>
                        setNewProject((prev) => ({ ...prev, projectName: e.target.value }))
                      }
                      className="w-[35rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter Project Name"
                      required
                    />
                  </div>
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project ID</label>
                    <input className="w-[25rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter Project ID"
                      type="text"
                      value={newProject.projectId}
                      onChange={(e) =>
                        setNewProject((prev) => ({ ...prev, projectId: e.target.value }))
                      }></input>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Reference Name</label>
                    <input className="w-[35rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter Project Reference Name"
                      type="text"
                      value={newProject.projectReferenceName}
                      onChange={(e) =>
                        setNewProject((prev) => ({ ...prev, projectReferenceName: e.target.value }))
                      }></input>
                  </div>
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Category</label>
                    <select className="w-[25rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      value={newProject.projectCategory}
                      onChange={(e) =>
                        setNewProject((prev) => ({ ...prev, projectCategory: e.target.value }))
                      }>
                      <option value="">Select Project Category</option>
                      <option value="Client Project">Client Project</option>
                      <option value="Own Project">Own Project</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4 pl-5">
                  <label className="block text-lg font-medium mb-2">Project Address</label>
                  <input className="w-[62rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                    placeholder="Enter Project Address"
                    type="text"
                    value={newProject.projectAddress}
                    onChange={(e) =>
                      setNewProject((prev) => ({ ...prev, projectAddress: e.target.value }))
                    }></input>
                </div>
                {newProject.ownerDetailsList.map((owner, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex mb-2 ">
                      <div className="mt-12 mr-4">
                        {index + 1}.
                      </div>
                      <div className='flex mb-2 gap-5'>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Client Name</label>
                          <input
                            type="text"
                            value={owner.clientName}
                            onChange={(e) => handleNewOwnerChange(index, 'clientName', e.target.value)}
                            placeholder="Client Name"
                            className="w-80 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Father Name</label>
                          <input
                            type="text"
                            value={owner.fatherName}
                            onChange={(e) => handleNewOwnerChange(index, 'fatherName', e.target.value)}
                            placeholder="Father Name"
                            className="w-72 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Mobile</label>
                          <input
                            type="text"
                            value={owner.mobile}
                            onChange={(e) => handleNewOwnerChange(index, 'mobile', e.target.value)}
                            placeholder="Mobile"
                            className="w-60 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Age</label>
                          <input
                            type="text"
                            value={owner.age}
                            onChange={(e) => handleNewOwnerChange(index, 'age', e.target.value)}
                            placeholder="Age"
                            className="w-20 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                      </div>
                    </div>
                    <div className=" relative pl-4">
                      <label className="block text-lg font-medium ">Client Address</label>
                      <input
                        type="text"
                        value={owner.clientAddress}
                        onChange={(e) => handleNewOwnerChange(index, 'clientAddress', e.target.value)}
                        placeholder="Client Address"
                        className="w-[62rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedOwners = [...newProject.ownerDetailsList];
                          updatedOwners.splice(index, 1);
                          setNewProject((prev) => ({
                            ...prev,
                            ownerDetailsList: updatedOwners,
                          }));
                        }}
                        className="absolute ml-2 mt-3 text-red-500 font-bold text-xl"
                        title="Remove this owner"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="text-[#E4572E] font-bold ml-4 px-1 border-dashed border-b-2 border-[#BF9853]" onClick={addNewOwner}>+ Add Another Owner</button>
                {newProject.propertyDetailsList.map((detail, index) => (
                  <div className="flex mb-2 gap-5" key={index}>
                    <div className="mt-12">
                      {index + 1}.
                    </div>
                    <div className="">
                      <label className="block mb-1 text-lg font-medium">Project Type</label>
                      <select
                        value={detail.projectType}
                        onChange={(e) => handleNewDetailChange(index, 'projectType', e.target.value)}
                        className="w-40  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      >
                        <option value="">Select Type</option>
                        <option value="Shop">Shop</option>
                        <option value="House">House</option>
                        <option value="Land">Land</option>
                        <option value="Office">Office</option>
                        <option value="Construction">Construction</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Floor Name</label>
                      <select
                        value={detail.floorName}
                        onChange={(e) => handleNewDetailChange(index, 'floorName', e.target.value)}
                        className="w-36  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      >
                        <option value="">Select Floor</option>
                        <option value="Ground Floor">Ground Floor</option>
                        <option value="First Floor">First Floor</option>
                        <option value="Second Floor">Second Floor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Shop No</label>
                      <input
                        type="text"
                        value={detail.shopNo}
                        onChange={(e) => handleNewDetailChange(index, 'shopNo', e.target.value)}
                        placeholder="Shop No"
                        className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Door No</label>
                      <input
                        type="text"
                        value={detail.doorNo}
                        onChange={(e) => handleNewDetailChange(index, 'doorNo', e.target.value)}
                        placeholder="Door No"
                        className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Area</label>
                      <input
                        type="text"
                        value={detail.area}
                        onChange={(e) => handleNewDetailChange(index, 'area', e.target.value)}
                        placeholder="Area"
                        className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-1">
                        <label className='text-lg font-medium '>EB.NO</label>
                        <div className="relative inline-flex bg-gray-200 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handleNewDetailChange(index, 'ebNoPhase', '1P')}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${(detail.ebNoPhase || '1P') === '1P'
                                ? 'bg-[#BF9853] text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                              }`}
                          >
                            1P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNewDetailChange(index, 'ebNoPhase', '3P')}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${detail.ebNoPhase === '3P'
                                ? 'bg-[#BF9853] text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                              }`}
                          >
                            3P
                          </button>
                        </div>
                      </div>
                      <div className="flex">
                        <input
                          type='text'
                          value={detail.ebNo}
                          onChange={(e) => handleNewDetailChange(index, 'ebNo', e.target.value)}
                          placeholder='EB NO'
                          className='w-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none'
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className='block mb-1 text-lg font-medium '>Property Tax No</label>
                      <div className="flex">
                        <input
                          type='text'
                          value={detail.propertyTaxNo}
                          onChange={(e) => handleNewDetailChange(index, 'propertyTaxNo', e.target.value)}
                          placeholder='Property Tax No'
                          className='w-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none'
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className='block mb-1 text-lg font-medium '>Water Tax No</label>
                      <div className="flex">
                        <input
                          type='text'
                          value={detail.waterTaxNo}
                          onChange={(e) => handleNewDetailChange(index, 'waterTaxNo', e.target.value)}
                          placeholder='Water Tax No'
                          className='w-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none'
                        />
                      </div>
                    </div>
                    <div className="flex items-end mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedList = [...newProject.propertyDetailsList];
                          updatedList.splice(index, 1);
                          setNewProject(prev => ({
                            ...prev,
                            propertyDetailsList: updatedList,
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
                <button type="button" className="text-[#E4572E] font-bold px-1 ml-3 border-dashed border-b-2 border-[#BF9853] " onClick={addNewPropertyDetail}>+ Add on</button>
              </div>
              <div className="flex justify-end space-x-2 mt-6 mb-4 mr-5">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeProjectManagement}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isProjectEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[95rem] h-[40rem] text-left overflow-y-auto pl-20">
            <div className='flex justify-end mr-16 mt-4'>
              <button className="text-red-500" onClick={() => setIsProjectEditOpen(false)}>
                <img src={cross} alt="close" className="w-5 h-5" />
              </button>
            </div>
            <form>
              <div className="overflow-y-auto h-[500px]">
                <div className="flex gap-4">
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Name</label>
                    <input
                      type="text"
                      value={editProject.projectName}
                      onChange={(e) =>
                        setEditProject((prev) => ({ ...prev, projectName: e.target.value }))
                      }
                      className="w-[35rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter Project Name"
                      required
                    />
                  </div>
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project ID</label>
                    <input className="w-[25rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter Project ID"
                      type="text"
                      value={editProject.projectId}
                      onChange={(e) =>
                        setEditProject((prev) => ({ ...prev, projectId: e.target.value }))
                      }></input>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Reference Name</label>
                    <input className="w-[35rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      placeholder="Enter Project Reference Name"
                      type="text"
                      value={editProject.projectReferenceName}
                      onChange={(e) =>
                        setEditProject((prev) => ({ ...prev, projectReferenceName: e.target.value }))
                      }></input>
                  </div>
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Category</label>
                    <select className="w-[25rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                      value={editProject.projectCategory}
                      onChange={(e) =>
                        setEditProject((prev) => ({ ...prev, projectCategory: e.target.value }))
                      }>
                      <option value="">Select Project Category</option>
                      <option value="Client Project">Client Project</option>
                      <option value="Own Project">Own Project</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4 pl-5">
                  <label className="block text-lg font-medium mb-2">Project Address</label>
                  <input className="w-[62rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                    placeholder="Enter Project Address"
                    type="text"
                    value={editProject.projectAddress}
                    onChange={(e) =>
                      setEditProject((prev) => ({ ...prev, projectAddress: e.target.value }))
                    }></input>
                </div>
                {editProject.ownerDetailsList.map((owner, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex mb-2 ">
                      <div className="mt-12 mr-4">
                        {index + 1}.
                      </div>
                      <div className='flex mb-2 gap-5'>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Client Name</label>
                          <input
                            type="text"
                            value={owner.clientName}
                            onChange={(e) => handleEditOwnerChange(index, 'clientName', e.target.value)}
                            placeholder="Client Name"
                            className="w-80 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Father Name</label>
                          <input
                            type="text"
                            value={owner.fatherName}
                            onChange={(e) => handleEditOwnerChange(index, 'fatherName', e.target.value)}
                            placeholder="Father Name"
                            className="w-72 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Mobile</label>
                          <input
                            type="text"
                            value={owner.mobile}
                            onChange={(e) => handleEditOwnerChange(index, 'mobile', e.target.value)}
                            placeholder="Mobile"
                            className="w-60 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Age</label>
                          <input
                            type="text"
                            value={owner.age}
                            onChange={(e) => handleEditOwnerChange(index, 'age', e.target.value)}
                            placeholder="Age"
                            className="w-20 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                          />
                        </div>
                      </div>
                    </div>
                    <div className=" relative pl-4">
                      <label className="block text-lg font-medium ">Client Address</label>
                      <input
                        type="text"
                        value={owner.clientAddress}
                        onChange={(e) => handleEditOwnerChange(index, 'clientAddress', e.target.value)}
                        placeholder="Client Address"
                        className="w-[62rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedOwners = [...editProject.ownerDetailsList];
                          updatedOwners.splice(index, 1);
                          setEditProject((prev) => ({
                            ...prev,
                            ownerDetailsList: updatedOwners,
                          }));
                        }}
                        className="absolute ml-2 mt-3 text-red-500 font-bold text-xl"
                        title="Remove this owner"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="text-[#E4572E] font-bold ml-4 px-1 border-dashed border-b-2 border-[#BF9853]" onClick={addEditOwner}>+ Add Another Owner</button>
                {editProject.propertyDetailsList.map((detail, index) => (
                  <div className="flex mb-2 gap-5" key={index}>
                    <div className="mt-12">
                      {index + 1}.
                    </div>
                    <div className="">
                      <label className="block mb-1 text-lg font-medium">Project Type</label>
                      <select
                        value={detail.projectType}
                        onChange={(e) => handleEditDetailChange(index, 'projectType', e.target.value)}
                        className="w-40  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      >
                        <option value="">Select Type</option>
                        <option value="Shop">Shop</option>
                        <option value="House">House</option>
                        <option value="Land">Land</option>
                        <option value="Office">Office</option>
                        <option value="Construction">Construction</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Floor Name</label>
                      <select
                        value={detail.floorName}
                        onChange={(e) => handleEditDetailChange(index, 'floorName', e.target.value)}
                        className="w-36  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      >
                        <option value="">Select Floor</option>
                        <option value="Ground Floor">Ground Floor</option>
                        <option value="First Floor">First Floor</option>
                        <option value="Second Floor">Second Floor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Shop No</label>
                      <input
                        type="text"
                        value={detail.shopNo}
                        onChange={(e) => handleEditDetailChange(index, 'shopNo', e.target.value)}
                        placeholder="Shop No"
                        className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Door No</label>
                      <input
                        type="text"
                        value={detail.doorNo}
                        onChange={(e) => handleEditDetailChange(index, 'doorNo', e.target.value)}
                        placeholder="Door No"
                        className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Area</label>
                      <input
                        type="text"
                        value={detail.area}
                        onChange={(e) => handleEditDetailChange(index, 'area', e.target.value)}
                        placeholder="Area"
                        className="w-28  border-[#FAF6ED] border-[0.25rem] p-2 rounded-lg h-14"
                      />
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-1">
                        <label className='text-lg font-medium '>EB.NO</label>
                        <div className="relative inline-flex bg-gray-200 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handleEditDetailChange(index, 'ebNoPhase', '1P')}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${(detail.ebNoPhase || '1P') === '1P'
                                ? 'bg-[#BF9853] text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                              }`}
                          >
                            1P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditDetailChange(index, 'ebNoPhase', '3P')}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${detail.ebNoPhase === '3P'
                                ? 'bg-[#BF9853] text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                              }`}
                          >
                            3P
                          </button>
                        </div>
                      </div>
                      <div className="flex">
                        <input
                          type='text'
                          value={detail.ebNo}
                          onChange={(e) => handleEditDetailChange(index, 'ebNo', e.target.value)}
                          placeholder='EB NO'
                          className='w-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none'
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className='block mb-1 text-lg font-medium '>Property Tax No</label>
                      <div className="flex">
                        <input
                          type='text'
                          value={detail.propertyTaxNo}
                          onChange={(e) => handleEditDetailChange(index, 'propertyTaxNo', e.target.value)}
                          placeholder='Property Tax No'
                          className='w-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none'
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className='block mb-1 text-lg font-medium '>Water Tax No</label>
                      <div className="flex">
                        <input
                          type='text'
                          value={detail.waterTaxNo}
                          onChange={(e) => handleEditDetailChange(index, 'waterTaxNo', e.target.value)}
                          placeholder='Water Tax No'
                          className='w-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none'
                        />
                      </div>
                    </div>
                    <div className="flex items-end mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedList = [...editProject.propertyDetailsList];
                          updatedList.splice(index, 1);
                          setEditProject(prev => ({
                            ...prev,
                            propertyDetailsList: updatedList,
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
                <button type="button" className="text-[#E4572E] font-bold px-1 ml-3 border-dashed border-b-2 border-[#BF9853] " onClick={addEditPropertyDetail}>+ Add on</button>
              </div>
              <div className="flex justify-end space-x-2 mt-6 mb-4 mr-5">
                <button
                  type="submit"
                  onClick={handleSubmitEditProject}
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Update
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={() => setIsProjectEditOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isTenantLinkOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[83rem] h-[44rem] px-6 py-4 pl-24">
            <div className='overflow-y-auto h-[38rem]'>
              <div className="flex justify-end mr-4">
                <button className="text-red-500" onClick={closeTenantLinkPopup}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <form onSubmit={handleTenantLinkSubmit} className=" space-y-2">
                <h2 className="text-2xl font-bold">Tenant Details</h2>
                <div className='text-left mb-2'>
                  <div className='flex gap-10'>
                    <div className='mt-3'>
                      <label className='block font-semibold'>Tenant Name</label>
                      <input
                        type="text"
                        name="tenantName"
                        value={tenantLinkFormData.tenantName}
                        onChange={handleTenantLinkChange}
                        className="block w-[550px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                        placeholder="Tenant Name"
                      />
                    </div>
                    <div className='mt-3'>
                      <label className='block font-semibold'>Tenant FullName</label>
                      <input
                        type="text"
                        name="fullName"
                        value={tenantLinkFormData.fullName}
                        onChange={handleTenantLinkChange}
                        className="block w-[550px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                        placeholder="Full Name"
                      />
                    </div>
                  </div>
                  <div className='flex gap-10'>
                    <div className='mt-3'>
                      <label className='block font-semibold'>Tenant FatherName</label>
                      <input
                        type="text"
                        name="tenantFatherName"
                        value={tenantLinkFormData.tenantFatherName}
                        onChange={handleTenantLinkChange}
                        className="block w-[550px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                        placeholder="Father Name"
                      />
                    </div>
                    <div className='mt-3'>
                      <label className='block font-semibold'>Tenant Age</label>
                      <input
                        type="text"
                        name="age"
                        value={tenantLinkFormData.age}
                        onChange={handleTenantLinkChange}
                        className="block w-[550px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                        placeholder="Age"
                      />
                    </div>
                  </div>
                  <div className='flex gap-10'>
                    <div className='mt-3'>
                      <label className='block font-semibold'>Mobile Number</label>
                      <input
                        type="text"
                        name="mobileNumber"
                        value={tenantLinkFormData.mobileNumber}
                        onChange={handleTenantLinkChange}
                        className="block w-[550px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                        placeholder="Mobile Number"
                      />
                    </div>
                    <div className='mt-3'>
                      <label className='block font-semibold'>Tenant Address</label>
                      <input
                        type="text"
                        name="tenantAddress"
                        value={tenantLinkFormData.tenantAddress}
                        onChange={handleTenantLinkChange}
                        className="block w-[550px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                        placeholder="Tenant Address"
                      />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold">Shop Details</h2>
                {(() => {
                  const projectRefNames = tenantLinkFormData.shopNos
                    .map(shop => {
                      const details = getShopDetailsById(shop.shopNoId);
                      return details?.projectReferenceName;
                    })
                    .filter(name => name && name !== '')
                    .filter((name, index, self) => self.indexOf(name) === index);
                  const showProjectAtTop = projectRefNames.length === 1 && projectRefNames[0];
                  return (
                    <>
                      {tenantLinkFormData.shopNos.map((shop, sIndex) => {
                        const shopDetails = getShopDetailsById(shop.shopNoId);
                        const filteredShops = getShopsByProjectReferenceName(shop.projectReferenceName);
                        const selectedShopOption = filteredShops.find(option =>
                          option.value === shop.shopNoId || option.id === shop.shopNoId ||
                          String(option.value) === String(shop.shopNoId) || String(option.id) === String(shop.shopNoId)
                        ) || getAllShopNumbers().find(option =>
                          option.value === shop.shopNoId || option.id === shop.shopNoId ||
                          String(option.value) === String(shop.shopNoId) || String(option.id) === String(shop.shopNoId)
                        );
                        return (
                          <div key={sIndex} className="bg-gray-50 p-4 rounded-lg shadow-md mb-6 text-left w-[1150px]">
                            <div className="flex gap-2 mb-2 ">
                              <Select
                                name="projectReferenceName"
                                options={projectOptions}
                                value={projectOptions.find(opt => opt.value === shop.projectReferenceName)}
                                onChange={(selectedOption) => {
                                  const projectRefName = selectedOption?.value || '';
                                  handleTenantLinkShopChange(sIndex, {
                                    target: {
                                      name: 'projectReferenceName',
                                      value: projectRefName
                                    }
                                  });
                                  if (selectedShopOption && selectedShopOption.projectReferenceName !== projectRefName) {
                                    handleTenantLinkShopChange(sIndex, {
                                      target: {
                                        name: 'shopNoId',
                                        value: ''
                                      }
                                    });
                                  }
                                }}
                                placeholder="Property Name"
                                isSearchable
                                isClearable
                                className="w-60 text-sm"
                                classNamePrefix="select"
                                menuPortalTarget={document.body}
                                styles={{
                                  control: (provided, state) => ({
                                    ...provided,
                                    height: '44px',
                                    minHeight: '44px',
                                    backgroundColor: 'transparent',
                                    borderWidth: '2px',
                                    borderColor: state.isFocused
                                      ? 'rgba(191, 152, 83, 0.5)'
                                      : 'rgba(191, 152, 83, 0.25)',
                                    borderRadius: '8px',
                                    boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                    '&:hover': {
                                      borderColor: 'rgba(191, 152, 83, 0.4)',
                                    },
                                  }),
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                  menu: (provided) => ({
                                    ...provided,
                                    zIndex: 9999,
                                  }),
                                  option: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: state.isSelected
                                      ? 'rgba(191, 152, 83, 0.3)'
                                      : state.isFocused
                                        ? 'rgba(191, 152, 83, 0.1)'
                                        : 'white',
                                    color: 'black',
                                    fontWeight: state.isSelected ? 'bold' : 'normal',
                                  }),
                                  singleValue: (provided) => ({
                                    ...provided,
                                    color: 'black',
                                  }),
                                  placeholder: (provided) => ({
                                    ...provided,
                                    color: '#999',
                                  }),
                                }}
                              />
                              <Select
                                name="shopNo"
                                options={getShopsByProjectReferenceName(shop.projectReferenceName)}
                                value={selectedShopOption}
                                menuPlacement="auto"
                                onMenuOpen={() => {
                                  if (selectedShopOption) {
                                    setTimeout(() => {
                                      const menu = document.querySelector('.select__menu');
                                      if (menu) {
                                        const menuList = menu.querySelector('.select__menu-list');
                                        if (menuList) {
                                          const options = menuList.querySelectorAll('.select__option');
                                          options.forEach((option) => {
                                            if (option.textContent === selectedShopOption.label ||
                                              option.textContent === String(selectedShopOption.shopNo)) {
                                              option.scrollIntoView({ block: 'center', behavior: 'auto' });
                                            }
                                          });
                                        }
                                      }
                                    }, 50);
                                  }
                                }}
                                onChange={(selectedOption) => {
                                  if (selectedOption) {
                                    const shopDetails = getShopDetailsById(selectedOption.value || selectedOption.id);
                                    handleTenantLinkShopChange(sIndex, {
                                      target: {
                                        name: 'shopNoId',
                                        value: selectedOption.value || selectedOption.id
                                      }
                                    });
                                    // Auto-populate project reference name if not set
                                    if (!shop.projectReferenceName && shopDetails?.projectReferenceName) {
                                      handleTenantLinkShopChange(sIndex, {
                                        target: {
                                          name: 'projectReferenceName',
                                          value: shopDetails.projectReferenceName
                                        }
                                      });
                                    }
                                  } else {
                                    // Handle clear
                                    handleTenantLinkShopChange(sIndex, {
                                      target: {
                                        name: 'shopNoId',
                                        value: ''
                                      }
                                    });
                                  }
                                }}
                                placeholder="Shop No"
                                isSearchable
                                isClearable
                                className="w-44 text-sm"
                                classNamePrefix="select"
                                menuPortalTarget={document.body}
                                styles={{
                                  control: (provided, state) => ({
                                    ...provided,
                                    height: '44px',
                                    minHeight: '44px',
                                    backgroundColor: 'transparent',
                                    borderWidth: '2px',
                                    borderColor: state.isFocused
                                      ? 'rgba(191, 152, 83, 0.5)'
                                      : 'rgba(191, 152, 83, 0.25)',
                                    borderRadius: '8px',
                                    boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                    '&:hover': {
                                      borderColor: 'rgba(191, 152, 83, 0.4)',
                                    },
                                  }),
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                  menu: (provided) => ({
                                    ...provided,
                                    zIndex: 9999,
                                  }),
                                  option: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: state.isSelected
                                      ? 'rgba(191, 152, 83, 0.3)'
                                      : state.isFocused
                                        ? 'rgba(191, 152, 83, 0.1)'
                                        : 'white',
                                    color: 'black',
                                    fontWeight: state.isSelected ? 'bold' : 'normal',
                                  }),
                                  singleValue: (provided) => ({
                                    ...provided,
                                    color: 'black',
                                  }),
                                  placeholder: (provided) => ({
                                    ...provided,
                                    color: '#999',
                                  }),
                                }}
                              />
                              <input
                                type="text"
                                name="doorNo"
                                value={shopDetails?.doorNo || ''}
                                readOnly
                                className="border-2 text-sm border-[#BF9853] w-16 h-11 border-opacity-25 p-2 rounded-lg focus:outline-none bg-gray-100"
                                placeholder="Door No"
                              />
                              <input
                                type="text"
                                name="projectType"
                                value={shopDetails?.projectType || ''}
                                readOnly
                                className="border-2 text-sm border-[#BF9853] w-20 h-11 border-opacity-25 p-2 rounded-lg focus:outline-none bg-gray-100"
                                placeholder="Project type"
                              />
                              <input
                                type="text"
                                name="floorName"
                                value={shopDetails?.floorName || ''}
                                readOnly
                                className="border-2 text-sm border-[#BF9853] w-28 h-11 border-opacity-25 p-2 rounded-lg focus:outline-none bg-gray-100"
                                placeholder="Floor"
                              />
                              <div className='flex gap-1'>
                                <input
                                  type="text"
                                  name="monthlyRent"
                                  value={formatINR(shop.monthlyRent)}
                                  onChange={(e) => {
                                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                    handleTenantLinkShopChange(sIndex, {
                                      target: {
                                        name: 'monthlyRent',
                                        value: rawValue,
                                      },
                                    });
                                  }}
                                  className="border-2 text-sm border-[#BF9853] w-28 h-11 border-opacity-25 p-2 rounded-lg focus:outline-none"
                                  placeholder="Rent"
                                />
                                <input
                                  type="checkbox"
                                  name="shouldCollectAdvance"
                                  checked={shop.shouldCollectAdvance}
                                  onChange={(e) => handleTenantLinkShopChange(sIndex, e)}
                                  className="custom-checkbox cursor-pointer appearance-none w-4 h-4 mt-3 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] "
                                />
                              </div>
                              <input
                                type="text"
                                name="advanceAmount"
                                value={formatINR(shop.advanceAmount)}
                                onChange={(e) => {
                                  const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                  handleTenantLinkShopChange(sIndex, {
                                    target: {
                                      name: 'advanceAmount',
                                      value: rawValue,
                                    },
                                  });
                                }}
                                className="border-2 text-sm border-[#BF9853] w-28 h-11 border-opacity-25 p-2 rounded-lg focus:outline-none"
                                placeholder="Advance"
                              />
                              <div className="relative flex">
                                <input
                                  type="date"
                                  name="startingDate"
                                  value={shop.startingDate}
                                  onChange={(e) => {
                                    const rawValue = e.target.value;
                                    handleTenantLinkShopChange(sIndex, {
                                      target: {
                                        name: 'startingDate',
                                        value: rawValue,
                                      },
                                    });
                                  }}
                                  className="border-2 text-sm border-[#BF9853] w-28 h-11 border-opacity-25 p-2 rounded-lg focus:outline-none"
                                  placeholder="Advance"
                                />
                                {tenantLinkFormData.shopNos.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeTenantLinkShop(sIndex)}
                                    className=" text-red-500 font-bold ml-3"
                                  >
                                    <img src={cross} alt='cross' className='w-5 h-5' />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
                <div className='text-left'>
                  <button
                    type="button"
                    onClick={addTenantLinkShop}
                    className='text-[#E4572E] font-bold px-1  border-dashed border-b-2 border-[#BF9853]'
                  >
                    + Add On
                  </button>
                </div>
              </form>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="submit"
                onClick={handleTenantLinkSubmit}
                className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
              >
                Submit
              </button>
              <button
                type="button"
                className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                onClick={closeTenantLinkPopup}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isTenantLinkEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[87rem] h-[44rem] px-6 py-4 pl-24 ">
            <div className='overflow-y-auto h-[38rem]'>
              <div className="flex justify-end mb-2">
                <button className="text-red-500 " onClick={closeEditTenantLink}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <form className="space-y-2" >
                <h2 className="text-2xl font-bold">Tenant Details</h2>
                <div className='text-left'>
                  <div className='flex gap-10'>
                    <div className='mt-3'>
                      <label className='block font-semibold'>Tenant Name</label>
                      <input
                        type="text"
                        name="tenantName"
                        value={editTenantLinkFormData.tenantName}
                        onChange={handleEditTenantLinkChange}
                        className="block w-[600px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                        placeholder="Tenant Name"
                      />
                    </div>
                    <div className='mt-3'>
                      <label className='block font-semibold'>Tenant FullName</label>
                      <input
                        type="text"
                        name="fullName"
                        value={editTenantLinkFormData.fullName}
                        onChange={handleEditTenantLinkChange}
                        className="block w-[600px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                        placeholder="Full Name"
                      />
                    </div>
                  </div>
                  <div className='flex gap-10'>
                    <div className='mt-3'>
                      <label className='block font-semibold'>Tenant FatherName</label>
                      <input
                        type="text"
                        name="tenantFatherName"
                        value={editTenantLinkFormData.tenantFatherName}
                        onChange={handleEditTenantLinkChange}
                        className="block w-[600px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                        placeholder="Father Name"
                      />
                    </div>
                    <div className='mt-3'>
                      <label className='block font-semibold'>Tenant Age</label>
                      <input
                        type="text"
                        name="age"
                        value={editTenantLinkFormData.age}
                        onChange={handleEditTenantLinkChange}
                        className="block w-[600px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                        placeholder="Age"
                      />
                    </div>
                  </div>
                  <div className='flex gap-10'>
                    <div className='mt-3'>
                      <label className='block font-semibold'>Mobile Number</label>
                      <input
                        type="text"
                        name="mobileNumber"
                        value={editTenantLinkFormData.mobileNumber}
                        onChange={handleEditTenantLinkChange}
                        className="block w-[600px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                        placeholder="Mobile Number"
                      />
                    </div>
                    <div className='mt-3'>
                      <label className='block font-semibold'>Tenant Address</label>
                      <input
                        type="text"
                        name="tenantAddress"
                        value={editTenantLinkFormData.tenantAddress}
                        onChange={handleEditTenantLinkChange}
                        className="block w-[600px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                        placeholder="Tenant Address"
                      />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold">Shop Details</h2>
                {(() => {
                  const projectRefNames = editTenantLinkFormData.shopNos
                    .map(shop => {
                      const details = getShopDetailsById(shop.shopNoId);
                      return details?.projectReferenceName;
                    })
                    .filter(name => name && name !== '')
                    .filter((name, index, self) => self.indexOf(name) === index);
                  const showProjectAtTop = projectRefNames.length === 1 && projectRefNames[0];
                  return (
                    <>
                      {editTenantLinkFormData.shopNos.map((shop, sIndex) => {
                        const shopDetails = getShopDetailsById(shop.shopNoId);
                        const filteredShops = getShopsByProjectReferenceName(shop.projectReferenceName, false, true);
                        const selectedShopOption = (shop.shopNoId && (shop.shopNoId !== '' && shop.shopNoId !== null))
                          ? (filteredShops.find(option =>
                            option.value === shop.shopNoId || option.id === shop.shopNoId ||
                            String(option.value) === String(shop.shopNoId) || String(option.id) === String(shop.shopNoId)
                          ) || getAllShopNumbersForEdit().find(option =>
                            option.value === shop.shopNoId || option.id === shop.shopNoId ||
                            String(option.value) === String(shop.shopNoId) || String(option.id) === String(shop.shopNoId)
                          ))
                          : null;
                        const isVacated = shop.shopClosureDate && shop.shopClosureDate.trim() !== '';
                        // Create a display option for the shop dropdown that shows the shop number
                        // Always show shop number if shopNoId exists, even if not found in filtered shops
                        let shopDisplayOption = null;
                        if (shop.shopNoId && shop.shopNoId !== '' && shop.shopNoId !== null) {
                          const shopNo = shopDetails?.shopNo;
                          if (selectedShopOption) {
                            // Use selectedShopOption but override label with shop number
                            shopDisplayOption = {
                              ...selectedShopOption,
                              label: shopNo || selectedShopOption.label || selectedShopOption.shopNo || 'Shop No'
                            };
                          } else if (shopNo) {
                            // Create option from shop details if not found in filtered shops
                            shopDisplayOption = {
                              value: shop.shopNoId,
                              id: shop.shopNoId,
                              label: shopNo,
                              shopNo: shopNo,
                              projectReferenceName: shopDetails?.projectReferenceName || shop.projectReferenceName || ''
                            };
                          }
                        }
                        
                        return (
                          <div key={sIndex} className="p-2 rounded-lg shadow-md mb-6 text-left w-[1250px] bg-gray-50">
                            <div className="flex gap-1 mb-2 ">
                              <Select
                                name="projectReferenceName"
                                options={projectOptions}
                                value={projectOptions.find(opt => opt.value === shop.projectReferenceName)}
                                onChange={(selectedOption) => {
                                  const projectRefName = selectedOption?.value || '';
                                  handleEditTenantLinkShopChange(sIndex, {
                                    target: {
                                      name: 'projectReferenceName',
                                      value: projectRefName
                                    }
                                  });
                                  // Always clear Shop No if Property Name is cleared
                                  if (!selectedOption) {
                                    handleEditTenantLinkShopChange(sIndex, {
                                      target: {
                                        name: 'shopNoId',
                                        value: ''
                                      }
                                    });
                                  } else if (selectedShopOption && selectedShopOption.projectReferenceName !== projectRefName) {
                                    // Also clear if the selected shop's project doesn't match the new property name
                                    handleEditTenantLinkShopChange(sIndex, {
                                      target: {
                                        name: 'shopNoId',
                                        value: ''
                                      }
                                    });
                                  }
                                }}
                                placeholder="Property Name"
                                isSearchable
                                isClearable
                                isDisabled={isVacated}
                                className="w-60 text-sm"
                                classNamePrefix="select"
                                menuPortalTarget={document.body}
                                styles={{
                                  control: (provided, state) => ({
                                    ...provided,
                                    height: '44px',
                                    minHeight: '44px',
                                    backgroundColor: 'transparent',
                                    borderWidth: '2px',
                                    borderColor: state.isFocused
                                      ? 'rgba(191, 152, 83, 0.5)'
                                      : 'rgba(191, 152, 83, 0.25)',
                                    borderRadius: '8px',
                                    boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                    '&:hover': {
                                      borderColor: 'rgba(191, 152, 83, 0.4)',
                                    },
                                    cursor: isVacated ? 'not-allowed' : 'pointer',
                                  }),
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                  menu: (provided) => ({
                                    ...provided,
                                    zIndex: 9999,
                                  }),
                                  option: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: state.isSelected
                                      ? 'rgba(191, 152, 83, 0.3)'
                                      : state.isFocused
                                        ? 'rgba(191, 152, 83, 0.1)'
                                        : 'white',
                                    color: 'black',
                                    fontWeight: state.isSelected ? 'bold' : 'normal',
                                  }),
                                  singleValue: (provided) => ({
                                    ...provided,
                                    color: 'black',
                                  }),
                                  placeholder: (provided) => ({
                                    ...provided,
                                    color: '#999',
                                  }),
                                }}
                              />
                              <Select
                                name="shopNo"
                                options={filteredShops}
                                value={shopDisplayOption}
                                menuPlacement="auto"
                                isDisabled={isVacated}
                                onMenuOpen={() => {
                                  if (isVacated) return;
                                  setTimeout(() => {
                                    const menu = document.querySelector('.select__menu');
                                    if (menu && selectedShopOption) {
                                      const menuList = menu.querySelector('.select__menu-list');
                                      if (menuList) {
                                        const options = menuList.querySelectorAll('.select__option');
                                        options.forEach((option) => {
                                          if (option.textContent === selectedShopOption.label ||
                                            option.textContent === String(selectedShopOption.shopNo)) {
                                            option.scrollIntoView({ block: 'center', behavior: 'auto' });
                                          }
                                        });
                                      }
                                    }
                                  }, 50);
                                }}
                                onChange={(selectedOption) => {
                                  if (isVacated) return;
                                  if (selectedOption) {
                                    const shopDetails = getShopDetailsById(selectedOption.value || selectedOption.id);
                                    handleEditTenantLinkShopChange(sIndex, {
                                      target: {
                                        name: 'shopNoId',
                                        value: selectedOption.value || selectedOption.id
                                      }
                                    });
                                    if (!shop.projectReferenceName && shopDetails?.projectReferenceName) {
                                      handleEditTenantLinkShopChange(sIndex, {
                                        target: {
                                          name: 'projectReferenceName',
                                          value: shopDetails.projectReferenceName
                                        }
                                      });
                                    }
                                  } else {
                                    handleEditTenantLinkShopChange(sIndex, {
                                      target: {
                                        name: 'shopNoId',
                                        value: ''
                                      }
                                    });
                                  }
                                }}
                                placeholder="Shop No"
                                isSearchable
                                isClearable={!isVacated}
                                className="w-44 text-sm"
                                classNamePrefix="select"
                                menuPortalTarget={document.body}
                                styles={{
                                  control: (provided, state) => ({
                                    ...provided,
                                    height: '44px',
                                    minHeight: '44px',
                                    backgroundColor: 'transparent',
                                    borderWidth: '2px',
                                    borderColor: state.isFocused
                                      ? 'rgba(191, 152, 83, 0.5)'
                                      : 'rgba(191, 152, 83, 0.25)',
                                    borderRadius: '8px',
                                    boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                    '&:hover': {
                                      borderColor: 'rgba(191, 152, 83, 0.4)',
                                    },
                                    cursor: isVacated ? 'not-allowed' : 'pointer',
                                  }),
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                  menu: (provided) => ({
                                    ...provided,
                                    zIndex: 9999,
                                  }),
                                  option: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: state.isSelected
                                      ? 'rgba(191, 152, 83, 0.3)'
                                      : state.isFocused
                                        ? 'rgba(191, 152, 83, 0.1)'
                                        : 'white',
                                    color: 'black',
                                    fontWeight: state.isSelected ? 'bold' : 'normal',
                                  }),
                                  singleValue: (provided) => ({
                                    ...provided,
                                    color: 'black',
                                  }),
                                  placeholder: (provided) => ({
                                    ...provided,
                                    color: '#999',
                                  }),
                                }}
                              />
                              <input
                                type="text"
                                name="doorNo"
                                value={shopDetails?.doorNo || ''}
                                readOnly
                                className="border-2 text-sm border-[#BF9853] w-20 h-11 border-opacity-25 p-2 rounded-lg focus:outline-none bg-gray-100"
                                placeholder="Door No"
                              />
                              <input
                                type="text"
                                name="projectType"
                                value={shopDetails?.projectType || ''}
                                readOnly
                                className="border-2 text-sm border-[#BF9853] w-24 h-11 border-opacity-25 p-2 rounded-lg focus:outline-none bg-gray-100"
                                placeholder="Project type"
                              />
                              <input
                                type="text"
                                name="floorName"
                                value={shopDetails?.floorName || ''}
                                readOnly
                                className="border-2 text-sm border-[#BF9853] w-28 h-11 border-opacity-25 p-2 rounded-lg focus:outline-none bg-gray-100"
                                placeholder="Floor"
                              />
                              <div className='flex gap-1'>
                                <input
                                  type="text"
                                  name="monthlyRent"
                                  value={formatINR(shop.monthlyRent)}
                                  onChange={(e) => {
                                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                    handleEditTenantLinkShopChange(sIndex, {
                                      target: {
                                        name: 'monthlyRent',
                                        value: rawValue,
                                      },
                                    });
                                  }}
                                  className="border-2 text-sm border-[#BF9853] w-28 h-11 border-opacity-25 p-2 rounded-lg focus:outline-none"
                                  placeholder="Rent"
                                />
                                <input
                                  type="checkbox"
                                  name="shouldCollectAdvance"
                                  checked={shop.shouldCollectAdvance}
                                  onChange={(e) => handleEditTenantLinkShopChange(sIndex, e)}
                                  className="custom-checkbox cursor-pointer appearance-none w-4 h-4 mt-3 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638]"
                                />
                              </div>
                              <input
                                type="text"
                                name="advanceAmount"
                                value={formatINR(shop.advanceAmount)}
                                onChange={(e) => {
                                  const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                  handleEditTenantLinkShopChange(sIndex, {
                                    target: {
                                      name: 'advanceAmount',
                                      value: rawValue,
                                    },
                                  });
                                }}
                                className="border-2 text-sm border-[#BF9853] w-28 h-11 border-opacity-25 p-2 rounded-lg focus:outline-none"
                                placeholder="Advance"
                              />
                              <input
                                type="date"
                                name="startingDate"
                                value={shop.startingDate}
                                onChange={(e) => {
                                  const rawValue = e.target.value;
                                  handleEditTenantLinkShopChange(sIndex, {
                                    target: {
                                      name: 'startingDate',
                                      value: rawValue,
                                    },
                                  });
                                }}
                                className="border-2 text-sm border-[#BF9853] w-[122px] h-11 border-opacity-25 p-2 rounded-lg focus:outline-none"
                                placeholder="Advance"
                              />
                              <div className="relative flex">
                                <input
                                  type="date"
                                  name="shopClosureDate"
                                  value={shop.shopClosureDate || ''}
                                  onChange={(e) => {
                                    const rawValue = e.target.value;
                                    handleEditTenantLinkShopChange(sIndex, {
                                      target: {
                                        name: 'shopClosureDate',
                                        value: rawValue,
                                      },
                                    });
                                  }}
                                  className="border-2 text-sm border-[#BF9853] w-[122px] h-11 border-opacity-25 p-2 rounded-lg focus:outline-none"
                                  placeholder="Closure Date"
                                />
                                {editTenantLinkFormData.shopNos.length > 1 && (
                                  <button type="button" onClick={() => removeEditTenantLinkShop(sIndex)} className=" text-red-500 font-bold ml-">
                                    <img src={cross} alt='cross' className='w-5 h-5' />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
                <div className='text-left'>
                  <button type="button" onClick={addEditTenantLinkShop} className='text-[#E4572E] font-bold px-1  border-dashed border-b-2 border-[#BF9853]'>
                    + Add On
                  </button>
                </div>
              </form>
            </div>
            <div className="flex justify-end space-x-2 mb-4">
              <button type="submit" onClick={handleEditTenantLinkSubmit} className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                Submit
              </button>
              <button
                type="button"
                className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                onClick={closeEditTenantLink}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default InputData