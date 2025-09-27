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
  const [tenantshoplink, setTenantshoplink] = useState(false);
  const [isPropertyOpen, setIsPropertyOpen] = useState(false);
  const [isPaymentModeOpen, setIsPaymentModeOpen] = useState(false);
  const [isPropertyEditOpen, setIsPropertyEditOpen] = useState(false);
  const [tenantshopadd, setTenantshopadd] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [tenantList, setTenantList] = useState([]);
  const [editPaymentModeOpen, setEditPaymentModeopen] = useState(false);
  const [propertyNames, setPropertyNames] = useState([]);
  const [shopNoOptions, setShopNo] = useState([]);
  const [floorOptions, setFloorOptions] = useState([]);
  const [editFloorOptions, setEditFloorOptions] = useState([]);
  const [editShopNoOptions, setEditShopNoOptions] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedPropertyEdit, setSelectedPropertyEdit] = useState(null);
  const [usedShopNos, setUsedShopNos] = useState(new Set());
  const [userPermissions, setUserPermissions] = useState([]);
  const [shouldCollectAdvance, setShouldCollectAdvance] = useState(true); // default is Yes
  const moduleName = "Rent Management";
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
  const [newProperty, setNewProperty] = useState({
    propertyName: "",
    propertyAddress: "",
    ownerDetailsList: [{ ownerName: "", fatherName: "", mobile: "", age: "", ownerAddress: "" }],
    propertyDetailsList: [{ propertyType: "", floorName: "", doorNo: "", area: "", ebNo: "" }],
  });
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
  const [propertySearch, setPropertySearch] = useState("");
  const [tenantNameSearch, setTenantNameSearch] = useState("");
  const [paymentModeSearch, setPaymentModeSearch] = useState("");
  const [accountType, setAccountType] = useState('');
  const [modeOfPayment, setModeOfPayment] = useState('');
  const [paymentMode, setPaymentMode] = useState([]);
  const [siteNames, setSiteNames] = useState([]);
  const [properties, setProperties] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedGroupIndex, setExpandedGroupIndex] = useState(null);
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
    { value: 'Flat', label: 'Flat' }, // Add Flat here too
  ];
  const propertyTypeEditOptions = [
    { value: 'Shop', label: 'Shop' },
    { value: 'House', label: 'House' },
    { value: 'Land', label: 'Land' },
    { value: 'Flat', label: 'Flat' }, // Add Flat here too
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
      propertyDetailsList: [...item.propertyDetailsList], // preserve original order
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
        // Extract property names
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
        console.log(updatedTenants);
        const usedShopsArray = updatedTenants.flatMap((tenant) =>
          tenant.property?.flatMap((prop) =>
            prop.shops?.map((shop) => shop.shopNo).filter(Boolean)
          ) || []
        );
        const usedShops = new Set(usedShopsArray);
        setUsedShopNos(usedShops);
      } catch (error) {
        console.error('Error fetching tenants:', error);
      }
    };
    fetchTenantsWithShop();
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
          shouldCollectAdvance,
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
  const filteredProperties = properties.filter((item) =>
    item.propertyName.toLowerCase().includes(propertySearch.toLowerCase())
  );
  const filteredPaymentMode = paymentMode.filter((item) =>
    item.modeOfPayment.toLowerCase().includes(paymentModeSearch.toLowerCase())
  );
  const filteredTenantName = tenantList.filter((item) =>
    item.tenantName.toLowerCase().includes(tenantNameSearch.toLowerCase())
  );
  useEffect(() => {
    if (!editformData || !editformData.property) return;
    editformData.property.forEach((property) => {
      const selectedProperty = property.propertyName;
      const shops = property.shops || [];
      shops.forEach((shop) => {
        const selectedType = shop.propertyType;
        if (selectedProperty && selectedType) {
          const matchedProperty = properties.find(
            (p) => p.propertyName === selectedProperty
          );
          if (matchedProperty) {
            const floorNames = matchedProperty.propertyDetailsList
              .filter((detail) => detail.propertyType === selectedType)
              .map((detail) => detail.floorName)
              .filter((v, i, arr) => v && arr.indexOf(v) === i);
            const shopNos = matchedProperty.propertyDetailsList
              .filter((detail) => detail.propertyType === selectedType)
              .map((detail) => detail.shopNo)
              .filter((v, i, arr) => v && arr.indexOf(v) === i);
            const floorOptions = floorNames.map((f) => ({
              value: f,
              label: f,
            }));
            const shopNoOptions = shopNos.map((d) => ({
              value: d,
              label: d,
            }));
            setEditFloorOptions(floorOptions);
            setEditShopNoOptions(shopNoOptions);
          }
        }
      });
    });
  }, [editformData, properties]);
  return (
    <div className="p-4 bg-white ml-12 mr-8">
      <div className=" lg:flex space-x-[2%] w-full overflow-x-auto">
        <div>
          <div className="flex items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search tenant name.."
              value={tenantNameSearch}
              onChange={(e) => setTenantNameSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
              onClick={openAccountTypes}>
              + Add
            </button>
          </div>
          <button className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
          <div className={`${userPermissions.includes("Delete") ? '' : 'mt-5'}`}>
            {userPermissions.includes("Delete") && (
              <button onClick={handleAllTenantWithShop}>
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
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto w-96">
                <tbody>
                  {filteredTenantName.map((group, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-b bg-white hover:bg-gray-50 cursor-pointer" >
                        <td className="p-2 align-top">{index + 1}</td>
                        <td className="py-2 pl-9 font-semibold group flex text-left ">
                          <div className="flex flex-grow">
                            {group.tenantName}
                          </div>
                          <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                            <button type="button" onClick={() => openEditTenantNameWithShop(group)}>
                              <img src={edit} alt="add" className="w-4 h-4" type="button" />
                            </button>
                            {userPermissions.includes("Delete") && (
                              <button >
                                <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleTenantDelete(group.id)} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {isModalOpen && selectedPdf && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}>
                <div style={{
                  backgroundColor: '#fff',
                  padding: '20px',
                  borderRadius: '10px',
                  width: '80%',
                  height: '80%',
                  position: 'relative'
                }}>
                  <button onClick={closeModal} style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    fontSize: '18px'
                  }}>X</button>
                  <iframe
                    src={selectedPdf}
                    title="Aadhaar PDF"
                    width="100%"
                    height="100%"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search Property Name.."
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
              onClick={openPropertyPopup}>
              + Add
            </button>
          </div>
          <button className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
          <div className={`${userPermissions.includes("Delete") ? '' : 'mt-5'}`}>
            {userPermissions.includes("Delete") && (
              <button onClick={handleAllProperties}>
                <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[15rem]' />
              </button>
            )}
          </div>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto w-72 ">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left w-72 text-xl font-bold">Property Name</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto w-72">
                <tbody>
                  {filteredProperties.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(properties.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.propertyName}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditPropertyPopup(item)} />
                          </button>
                          {userPermissions.includes("Delete") && (
                            <button >
                              <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handlePropertiesDelete(item.id)} />
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
                        <option value="Flat">Flat</option>
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
      {tenantshoplink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[85rem] h-[44rem] px-2 py-2 overflow-y-auto">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeAccountTypes}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold">Tenant Details</h2>
              <div className='text-left mb-2'>
                <div className='flex gap-10'>
                  <div className='mt-3'>
                    <label className='block font-semibold'>Tenant Name</label>
                    <input
                      type="text"
                      name="tenantName"
                      value={formData.tenantName}
                      onChange={handleTenantChange}
                      className="block w-[450px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                      placeholder="Tenant Name"
                    />
                  </div>
                  <div className='mt-3'>
                    <label className='block font-semibold'>Tenant FullName</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleTenantChange}
                      className="block w-[450px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                      placeholder="Full Name"
                    />
                  </div>
                </div>
                <div className='flex gap-10'>
                  <div className='mt-3'>
                    <label className='block font-semibold'>Tenant FatherName</label>
                    <input
                      type="text"
                      className="block w-[450px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                      placeholder="Father Name"
                    />
                  </div>
                  <div className='mt-3'>
                    <label className='block font-semibold'>Tenant Age</label>
                    <input
                      type="text"
                      name="age"
                      value={formData.age}
                      onChange={handleTenantChange}
                      className="block w-[450px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
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
                      value={formData.mobileNumber}
                      onChange={handleTenantChange}
                      className="block w-[450px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                      placeholder="Mobile Number"
                    />
                  </div>
                  <div className='mt-3'>
                    <label className='block font-semibold'>Tenant Address</label>
                    <input
                      type="text"
                      name="tenantAddress"
                      value={formData.tenantAddress}
                      onChange={handleTenantChange}
                      className="block w-[450px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                      placeholder="Tenant Address"
                    />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold">Property Details</h2>
              {formData.properties.map((property, pIndex) => (
                <div key={pIndex} className="bg-gray-50 p-4 rounded-lg shadow-md mb-6 text-left w-[1150px]">
                  <div>
                    <button
                      type="button"
                      onClick={() => removeProperty(pIndex)} // ← attach function here
                      className="ml-[950px] text-red-500 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div>
                    <label className='font-semibold'>Property Name</label>
                    <Select
                      name="propertyName"
                      options={propertyOptions}
                      value={propertyOptions.find(opt => opt.value === property.propertyName)}
                      onChange={(selectedOption) => {
                        setSelectedProperty(selectedOption?.value);
                        handlePropertyChange(pIndex, {
                          target: {
                            name: 'propertyName',
                            value: selectedOption?.value || ''
                          }
                        });
                      }}
                      placeholder="Select Property Name"
                      className="w-[970px] mb-3"
                      isClearable
                      menuPortalTarget={document.body}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: 'transparent',
                          borderWidth: '2.5px',
                          borderColor: state.isFocused
                            ? 'rgba(191, 152, 83, 0.2)'
                            : 'rgba(191, 152, 83, 0.2)',
                          borderRadius: '6px',
                          boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                          '&:hover': {
                            borderColor: 'rgba(191, 152, 83, 0.2)',
                          },
                        }),
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: '#999',
                          textAlign: 'left',
                        }),
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
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
                  </div>
                  {property.shops.map((shop, sIndex) => (
                    <div key={sIndex} className="grid grid-cols-7 mb-2 ">
                      <Select
                        name="propertyType"
                        value={propertyTypeOptions.find(option => option.value === shop.propertyType)}
                        onChange={(selectedOption) => {
                          const newType = selectedOption?.value || '';
                          if (selectedProperty && newType) {
                            const matchedProperty = properties.find(
                              (p) => p.propertyName === selectedProperty
                            );
                            if (matchedProperty) {
                              const floorNames = matchedProperty.propertyDetailsList
                                .filter((detail) => detail.propertyType === newType)
                                .map((detail) => detail.floorName)
                                .filter((v, i, arr) => v && arr.indexOf(v) === i);
                              const shopNos = matchedProperty.propertyDetailsList
                                .filter((detail) => detail.propertyType === newType)
                                .map((detail) => detail.shopNo)
                                .filter((shopNo, i, arr) =>
                                  shopNo &&
                                  arr.indexOf(shopNo) === i &&        // unique
                                  !usedShopNos.has(shopNo)            // ✅ remove linked ones
                                );
                              const floorOptions = floorNames.map((f) => ({
                                value: f,
                                label: f,
                              }));
                              const shopNoOptions = shopNos.map((d) => ({
                                value: d,
                                label: d,
                              }));

                              setFloorOptions(floorOptions);
                              setShopNo(shopNoOptions);
                            }
                          }
                          handleShopChange(pIndex, sIndex, {
                            target: {
                              name: 'propertyType',
                              value: newType,
                            },
                          });
                        }}
                        options={propertyTypeOptions}
                        className="mb-4 w-36 "
                        classNamePrefix="select"
                        placeholder="Type..."
                        isSearchable
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            height: '44px', // ✅ Set manual height here
                            minHeight: '44px',
                            backgroundColor: 'transparent',
                            borderWidth: '2.5px',
                            borderColor: state.isFocused
                              ? 'rgba(191, 152, 83, 0.2)'
                              : 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': {
                              borderColor: 'rgba(191, 152, 83, 0.2)',
                            },
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: '#999',
                            textAlign: 'left',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
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
                      <CreatableSelect
                        name="floorName"
                        value={floorOptions.find(option => option.value === shop.floorName)}
                        onChange={(selectedOption) => {
                          handleShopChange(pIndex, sIndex, {
                            target: {
                              name: 'floorName',
                              value: selectedOption ? selectedOption.value : '',
                            },
                          });
                        }}
                        options={floorOptions}
                        placeholder="Floor"
                        isClearable
                        className="w-36"
                        classNamePrefix="select"
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            height: '44px', // equivalent to h-11
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
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
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
                        value={shopNoOptions.find(option => option.value === shop.shopNo)}
                        onChange={(selectedOption) => {
                          const selectedShopNo = selectedOption ? selectedOption.value : '';

                          let doorNo = '';
                          if (selectedProperty && selectedShopNo) {
                            const matchedProperty = properties.find(
                              (p) => p.propertyName === selectedProperty
                            );
                            if (matchedProperty) {
                              const matchedDetail = matchedProperty.propertyDetailsList.find(
                                (detail) =>
                                  detail.propertyType === shop.propertyType &&
                                  detail.shopNo === selectedShopNo
                              );
                              if (matchedDetail) {
                                doorNo = matchedDetail.doorNo || '';
                              }
                            }
                          }
                          // Update both shopNo and doorNo
                          handleShopChange(pIndex, sIndex, {
                            target: {
                              name: 'shopNo',
                              value: selectedShopNo,
                            },
                          });

                          handleShopChange(pIndex, sIndex, {
                            target: {
                              name: 'doorNo',
                              value: doorNo,
                            },
                          });
                        }}
                        options={shopNoOptions}
                        placeholder="Shop No"
                        isSearchable
                        isClearable
                        className="w-36"
                        classNamePrefix="select"
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
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
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
                        value={shop.doorNo}
                        onChange={(e) => handleShopChange(pIndex, sIndex, e)}
                        className="border-2 border-[#BF9853] w-28 h-11 border-opacity-25 p-2 rounded-lg focus:outline-none"
                        placeholder="Door No"
                      />
                      <div className='flex gap-1'>
                        <input
                          type="text"
                          name="monthlyRent"
                          value={formatINR(shop.monthlyRent)}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^0-9]/g, '');
                            handleShopChange(pIndex, sIndex, {
                              target: {
                                name: 'monthlyRent',
                                value: rawValue, // store unformatted numeric value
                              },
                            });
                          }}
                          className="border-2 border-[#BF9853] w-36 h-11 border-opacity-25 -ml-8 p-2 rounded-lg focus:outline-none"
                          placeholder="Rent"
                        />
                        <input
                          type="checkbox"
                          name="shouldCollectAdvance"
                          checked={shop.shouldCollectAdvance}
                          onChange={(e) => handleShopChange(pIndex, sIndex, e)}
                          className="custom-checkbox cursor-pointer appearance-none w-4 h-4 mt-3 -ml-1 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] "
                        />
                      </div>
                      <input
                        type="text"
                        name="advanceAmount"
                        value={formatINR(shop.advanceAmount)}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^0-9]/g, '');
                          handleShopChange(pIndex, sIndex, {
                            target: {
                              name: 'advanceAmount',
                              value: rawValue, // store unformatted numeric value
                            },
                          });
                        }}
                        className="border-2 border-[#BF9853] w-36 h-11 border-opacity-25 -ml-8 p-2 rounded-lg focus:outline-none"
                        placeholder="Advance"
                      />
                      <div className="relative flex">
                        <input
                          type="date"
                          name="startingDate"
                          value={shop.startingDate}
                          onChange={(e) => {
                            const rawValue = e.target.value;
                            handleShopChange(pIndex, sIndex, {
                              target: {
                                name: 'startingDate',
                                value: rawValue, // store unformatted numeric value
                              },
                            });
                          }}
                          className="border-2 border-[#BF9853] w-36 h-11 border-opacity-25 -ml-8 p-2 rounded-lg focus:outline-none"
                          placeholder="Advance"
                        />
                        {property.shops.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeShop(pIndex, sIndex)}
                            className=" text-red-500 font-bold ml-3"
                          >
                            <img src={cross} alt='cross' className='w-5 h-5' />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addShop(pIndex)}
                    className='text-[#E4572E] font-bold px-1  border-dashed border-b-2 border-[#BF9853]'
                  >
                    + Add On
                  </button>
                </div>
              ))}
              <div className='text-left'>
                <button
                  type="button"
                  onClick={addProperty}
                  className='text-[#E4572E] font-bold px-1 border-dashed border-b-2 border-[#BF9853]'
                >
                  + Add Another row
                </button>
              </div>
              <div className="flex space-x-2 mt-6 mb-4">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeAccountTypes}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {tenantshopadd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[85rem] h-[44rem] px-2 py-2 overflow-y-auto">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeAccount1Types}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form className="max-w-5xl mx-auto space-y-2" onSubmit={handleEditTenantSubmit}>
              <h2 className="text-2xl font-bold">Tenant Details</h2>
              <div className='text-left'>
                <div className='flex gap-10'>
                  <div className='mt-3'>
                    <label className='block font-semibold'>Tenant Name</label>
                    <input
                      type="text"
                      name="tenantName"
                      value={editformData.tenantName}
                      onChange={handleTenanteditChange}
                      className="block w-[450px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                      placeholder="Tenant Name"
                    />
                  </div>
                  <div className='mt-3'>
                    <label className='block font-semibold'>Tenant FullName</label>
                    <input
                      type="text"
                      name="fullName"
                      value={editformData.fullName}
                      onChange={handleTenanteditChange}
                      className="block w-[450px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                      placeholder="Full Name"
                    />
                  </div>
                </div>
                <div className='flex gap-10'>
                  <div className='mt-3'>
                    <label className='block font-semibold'>Tenant FatherName</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={editformData.fatherName}
                      onChange={handleTenanteditChange}
                      className="block w-[450px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                      placeholder="Father Name"
                    />
                  </div>
                  <div className='mt-3'>
                    <label className='block font-semibold'>Tenant Age</label>
                    <input
                      type="text"
                      name="age"
                      value={editformData.age}
                      onChange={handleTenanteditChange}
                      className="block w-[450px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
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
                      value={editformData.mobileNumber}
                      onChange={handleTenanteditChange}
                      className="block w-[450px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                      placeholder="Mobile Number"
                    />
                  </div>
                  <div className='mt-3'>
                    <label className='block font-semibold'>Tenant Address</label>
                    <input
                      type="text"
                      name="tenantAddress"
                      value={editformData.tenantAddress}
                      onChange={handleTenanteditChange}
                      className="block w-[450px] border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg focus:outline-none"
                      placeholder="Tenant Address"
                    />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold">Property Details</h2>
              {editformData.property.map((property, pIndex) => (
                <div key={pIndex} className="bg-gray-50 p-4 rounded-lg shadow-md ml-[-90px] mb-6 text-left w-[1200px]">
                  <div>
                    <button
                      type="button"
                      onClick={() => removePropertyEdit(pIndex)} // ← attach function here
                      className="ml-[1100px] text-red-500 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div>
                    <label className='font-semibold'>Property Name</label>
                    <Select
                      name="propertyName"
                      options={propertyOptions}
                      value={propertyOptions.find(opt => opt.value === property.propertyName)}
                      onChange={(selectedOption) => {
                        setSelectedPropertyEdit(selectedOption?.value);
                        handlePropertyeditChange(pIndex, {
                          target: {
                            name: 'propertyName',
                            value: selectedOption?.value || ''
                          }
                        });
                      }}
                      placeholder="Select Property Name"
                      className="w-[970px] mb-3"
                      isClearable
                      menuPortalTarget={document.body}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: 'transparent',
                          borderWidth: '2.5px',
                          borderColor: state.isFocused
                            ? 'rgba(191, 152, 83, 0.2)'
                            : 'rgba(191, 152, 83, 0.2)',
                          borderRadius: '6px',
                          boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                          '&:hover': {
                            borderColor: 'rgba(191, 152, 83, 0.2)',
                          },
                        }),
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: '#999',
                          textAlign: 'left',
                        }),
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
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
                  </div>
                  {property.shops.map((shop, sIndex) => (
                    <div key={sIndex} className="grid grid-cols-8 mb-5 ">
                      <Select
                        name="propertyType"
                        value={propertyTypeEditOptions.find(option => option.value === shop.propertyType)}
                        onChange={(selectedOption) => {
                          const newType = selectedOption?.value || '';
                          if (selectedPropertyEdit && newType) {
                            const matchedProperty = properties.find(
                              (p) => p.propertyName === selectedPropertyEdit
                            );
                            if (matchedProperty) {
                              const floorNames = matchedProperty.propertyDetailsList
                                .filter((detail) => detail.propertyType === newType)
                                .map((detail) => detail.floorName)
                                .filter((v, i, arr) => v && arr.indexOf(v) === i);
                              const shopNos = matchedProperty.propertyDetailsList
                                .filter((detail) => detail.propertyType === newType)
                                .map((detail) => detail.shopNo)
                                .filter((shopNo, i, arr) =>
                                  shopNo &&
                                  arr.indexOf(shopNo) === i &&        // unique
                                  !usedShopNos.has(shopNo)            // ✅ remove linked ones
                                );
                              const floorOptions = floorNames.map((f) => ({
                                value: f,
                                label: f,
                              }));
                              const shopNoOptions = shopNos.map((d) => ({
                                value: d,
                                label: d,
                              }));
                              setEditFloorOptions(floorOptions);
                              setEditShopNoOptions(shopNoOptions);
                            }
                          }
                          handleShopeditChange(pIndex, sIndex, {
                            target: {
                              name: 'propertyType',
                              value: newType,
                            },
                          });
                        }}
                        options={propertyTypeEditOptions}
                        className="mb-4 w-36 "
                        classNamePrefix="select"
                        placeholder="Type..."
                        isSearchable
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            height: '44px', // ✅ Set manual height here
                            minHeight: '44px',
                            backgroundColor: 'transparent',
                            borderWidth: '2.5px',
                            borderColor: state.isFocused
                              ? 'rgba(191, 152, 83, 0.2)'
                              : 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': {
                              borderColor: 'rgba(191, 152, 83, 0.2)',
                            },
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: '#999',
                            textAlign: 'left',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
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
                      <CreatableSelect
                        name="floorName"
                        value={editFloorOptions.find(option => option.value === shop.floorName)}
                        onChange={(selectedOption) => {
                          handleShopeditChange(pIndex, sIndex, {
                            target: {
                              name: 'floorName',
                              value: selectedOption ? selectedOption.value : '',
                            },
                          });
                        }}
                        options={editFloorOptions}
                        placeholder="Floor"
                        isClearable
                        className="w-36"
                        classNamePrefix="select"
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            height: '44px', // equivalent to h-11
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
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
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
                        value={editShopNoOptions.find(option => option.value === shop.shopNo)}
                        onChange={(selectedOption) => {
                          const selectedShopNo = selectedOption ? selectedOption.value : '';
                          let doorNo = '';
                          if (selectedPropertyEdit && selectedShopNo) {
                            const matchedProperty = properties.find(
                              (p) => p.propertyName === selectedPropertyEdit
                            );
                            if (matchedProperty) {
                              const matchedDetail = matchedProperty.propertyDetailsList.find(
                                (detail) =>
                                  detail.propertyType === shop.propertyType &&
                                  detail.shopNo === selectedShopNo
                              );
                              if (matchedDetail) {
                                doorNo = matchedDetail.doorNo || '';
                              }
                            }
                          }
                          handleShopeditChange(pIndex, sIndex, {
                            target: {
                              name: 'shopNo',
                              value: selectedShopNo,
                            },
                          });
                          handleShopeditChange(pIndex, sIndex, {
                            target: {
                              name: 'doorNo',
                              value: doorNo,
                            },
                          });
                        }}
                        options={editShopNoOptions}
                        placeholder="Shop No"
                        isSearchable
                        isClearable
                        className="w-36"
                        classNamePrefix="select"
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
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
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
                        value={shop.doorNo}
                        onChange={(e) => handleShopeditChange(pIndex, sIndex, e)}
                        className="border-2 border-[#BF9853] w-28 h-11 border-opacity-25 p-2 rounded-lg focus:outline-none"
                        placeholder="Door No"
                      />
                      <div className='flex gap-1'>
                        <input
                          type="text"
                          name="monthlyRent"
                          value={formatINR(shop.monthlyRent)}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^0-9]/g, '');
                            handleShopeditChange(pIndex, sIndex, {
                              target: {
                                name: 'monthlyRent',
                                value: rawValue, // store unformatted numeric value
                              },
                            });
                          }}
                          className="border-2 border-[#BF9853] w-32 h-11 border-opacity-25 -ml-8 p-2 rounded-lg focus:outline-none"
                          placeholder="Rent"
                        />
                        <input
                          type="checkbox"
                          name="shouldCollectAdvance"
                          checked={shop.shouldCollectAdvance}
                          onChange={(e) => handleShopeditChange(pIndex, sIndex, e)}
                          className="custom-checkbox cursor-pointer appearance-none w-4 h-4 mt-3 -ml-1 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638]"
                        />
                      </div>
                      <input
                        type="text"
                        name="advanceAmount"
                        value={formatINR(shop.advanceAmount)}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^0-9]/g, '');
                          handleShopeditChange(pIndex, sIndex, {
                            target: {
                              name: 'advanceAmount',
                              value: rawValue, // store unformatted numeric value
                            },
                          });
                        }}
                        className="border-2 border-[#BF9853] w-36 h-11 border-opacity-25 -ml-8 p-2 rounded-lg focus:outline-none"
                        placeholder="Advance"
                      />
                        <input
                          type="date"
                          name="startingDate"
                          value={shop.startingDate}
                          onChange={(e) => {
                            const rawValue = e.target.value;
                            handleShopeditChange(pIndex, sIndex, {
                              target: {
                                name: 'startingDate',
                                value: rawValue, // store unformatted numeric value
                              },
                            });
                          }}
                          className="border-2 border-[#BF9853] w-36 h-11 border-opacity-25 -ml-8 p-2 rounded-lg focus:outline-none"
                          placeholder="Advance"
                        />
                      <div className="relative flex">
                        <input
                          type="date"
                          name="shopClosureDate"
                          value={shop.shopClosureDate || ''}
                          onChange={(e) => {
                            const rawValue = e.target.value;
                            handleShopeditChange(pIndex, sIndex, {
                              target: {
                                name: 'shopClosureDate',
                                value: rawValue,
                              },
                            });
                          }}
                          className="border-2 border-[#BF9853] w-36 h-11 border-opacity-25 -ml-8 p-2 rounded-lg focus:outline-none"
                          placeholder="Closure Date"
                        />
                        {property.shops.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeShopEdit(pIndex, sIndex)}
                            className=" text-red-500 font-bold ml-3"
                          >
                            <img src={cross} alt='cross' className='w-5 h-5' />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addShopEdit(pIndex)}
                    className='text-[#E4572E] font-bold px-1  border-dashed border-b-2 border-[#BF9853]'
                  >
                    + Add On
                  </button>
                </div>
              ))}
              <div className='text-left'>
                <button
                  type="button"
                  onClick={addPropertyEdit}
                  className='text-[#E4572E] font-bold px-1 border-dashed border-b-2 border-[#BF9853]'
                >
                  + Add Another row
                </button>
              </div>
              <div className="flex space-x-2 mt-6 mb-4">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeAccount1Types}>
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
    </div>
  );
}
export default InputData