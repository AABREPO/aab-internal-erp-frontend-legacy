import React, { useState, useEffect, useRef } from 'react';
import CreatableSelect from 'react-select/creatable';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import deleteIcon from '../Images/Delete.svg';
import edit from '../Images/Edit.svg';
import Select from "react-select";
const PurchaseInputData = () => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [hoveredModelName, setHoveredModelName] = useState(null);
  const [hoveredBrandName, setHoveredBrandName] = useState(null);
  const [hoveredTypeColor, setHoveredTypeColor] = useState(null);
  const [siteOptions, setSiteOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState("");
  const [model, setModel] = useState("");
  const [typeColor, setTypeColor] = useState("");
  const [brand, setBrand] = useState("");
  const [poCategory, setPoCategory] = useState([]);
  const [poCategorySearch, setPoCategorySearch] = useState('');
  const [poModel, setPoModel] = useState([]);
  const [poModelSearch, setPoModelSearch] = useState('');
  const [poBrand, setPoBrand] = useState([]);
  const [poBrandSearch, setPoBrandSearch] = useState('');
  const [poType, setPoType] = useState([]);
  const [poTypeSearch, setPoTypeSearch] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [typeColorOptions, setTypeColorOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedModelCategory, setSelectedModelCategory] = useState(null);
  const [selectedBrandcategory, setSelectedBrandCategory] = useState(null);
  const [selectedTypeCategory, setSelectedTypeCategory] = useState(null);
  const [editModelCategory, setEditModelCategory] = useState(null);
  const [editBrandCategory, setEditBrandCategory] = useState(null);
  const [editTypeCategory, setEditTypeCategory] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSiteInchargeAddPopupOpen, setIsSiteInchargeAddPopupOpen] = useState(false);
  const [isSiteInchargeEditPopupOpen, setIsSiteInchargeEditPopupOpen] = useState(false);
  const [isGroupNameAddPopupOpen, setIsGroupNameAddPopupOpen] = useState(false);
  const [isGroupNameEditPopupOpen, setIsGroupNameEditPopupOpen] = useState(false);
  const [isPopupOpen1, setIsPopupOpen1] = useState(false);
  const [isPopupOpen2, setIsPopupOpen2] = useState(false);
  const [isPopupOpen3, setIsPopupOpen3] = useState(false);
  const [isBrandUploadOpens, setIsBrandUploadOpens] = useState(false);
  const [isItemNameUploadOpens, setIsItemUploadOpens] = useState(false);
  const [isModelUploadOpens, setIsModelUploadOpens] = useState(false);
  const [isTypeUploadOpens, setIsTypeUploadOpens] = useState(false);
  const [file, setFile] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isCategoryEditPopupOpen, setIsCategoryEditPopupOpen] = useState(false);
  const [editModel, setEditModel] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [isModelEditPopupOpen, setIsModelEditPopupOpen] = useState(false);
  const [editBrand, setEditBrand] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [isBrandEditPopupOpen, setIsBrandEditPopupOpen] = useState(false);
  const [editTypeColor, setEditTypeColor] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [isTypeEditPopupOpen, setIsTypeEditPopupOpen] = useState(false);
  const [poItemName, setPoItemName] = useState([]);
  const [siteIncharge, setSiteIncharge] = useState([]);
  const [groupName, setGroupName] = useState([]);
  const [groupNameId, setGroupNameId] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [groupNameList, setGroupNameList] = useState([]);
  const [groupNameOptions, setGroupNameOptions] = useState([]);
  const [poItemNameSearch, setPoItemNameSearch] = useState('');
  const [siteInchargeSearch, setSiteInchargeSearch] = useState('');
  const [groupNameSearch, setGroupNameSearch] = useState('');
  const [poItemNameId, setPoItemNameId] = useState('');
  const [siteInchargeId, setSiteInchargeId] = useState('');
  const [isItemNameEditPopupOpen, setIsItemNameEditPopupOpen] = useState(false);
  const [expandedTables, setExpandedTables] = useState({
    itemName: false,
    model: false,
    brand: false,
    type: false,
    category: false,
    siteIncharge: false,
    groupName: false
  });
  const [openSearchFields, setOpenSearchFields] = useState({
    itemName: false,
    model: false,
    brand: false,
    type: false,
    category: false,
    siteIncharge: false,
    groupName: false
  });
  const toggleTable = (tableName) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };
  const toggleSearchField = (fieldName) => {
    setOpenSearchFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };
  const closeModelUpload = () => setIsModelUploadOpens(false);
  const openModelUpload = () => setIsModelUploadOpens(true);
  const closeBrandUpload = () => setIsBrandUploadOpens(false);
  const openBrandUpload = () => setIsBrandUploadOpens(true);
  const closeItemNameUpload = () => setIsItemUploadOpens(false);
  const openItemNameUpload = () => setIsItemUploadOpens(true);
  const closeTypeUpload = () => setIsTypeUploadOpens(false);
  const openTypeUpload = () => setIsTypeUploadOpens(true);
  const [mappedCategoryAddPopup, setMappedCategoryAddPopup] = useState(false);
  const [searcher, setSearcher] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [originalSelectedOptions, setOriginalSelectedOptions] = useState([]);
  const [mappedCategoryMap, setMappedCategoryMap] = useState({}); // { categoryName: id }
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });

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
  useEffect(() => {
    return () => cancelMomentum();
  }, []);
  const [poItemList, setPoItemList] = useState({
    itemName: '',
    category: '',
    groupName: '',
    otherPOEntityList: [
      {
        modelName: '',
        brandName: '',
        typeColor: '',
        minimumQty: '',
        defaultQty: ''
      }
    ]
  });
  const [siteInchargeWithSite, setSiteInchargeWithSite] = useState({
    siteEngineer: "",
    mobileNumber: "",
    sites: [
      {
        siteName: "",
        siteNo: "",
        siteStatus: false,
        branch: "",
      },
    ],
  });
  const [editSiteInchargeWithSite, setEditSiteInchargeWithSite] = useState({
    siteEngineer: "",
    mobileNumber: "",
    sites: [
      {
        siteName: "",
        siteNo: "",
        siteStatus: false,
        branch: "",
      },
    ],
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const [poEditItemList, setPoEditItemList] = useState({
    itemName: '',
    category: '',
    groupName: '',
    otherPOEntityList: [
      {
        modelName: '',
        brandName: '',
        typeColor: '',
        minimumQty: '',
        defaultQty: ''
      }
    ]
  });

  const [fields, setFields] = useState([
    { label: 'Item Name', inputType: 'text', dropdown: 'Dropdown' },
    { label: 'Model', inputType: 'text', dropdown: 'Dropdown' },
    { label: 'Type', inputType: 'text', dropdown: 'Dropdown' },
    { label: 'Quantity', inputType: 'text', dropdown: 'Dropdown' }
  ]);

  const openEditCategory = (item) => {
    setEditCategory(item.category)
    setSelectedCategoryId(item.id)
    setIsCategoryEditPopupOpen(true)
  }
  const openEditModel = (item) => {
    setEditModel(item.model);

    const selectedCategoryOption = categoryOptions.find(
      (option) => option.value === item.category
    );
    setEditModelCategory(selectedCategoryOption || null);

    setSelectedModelId(item.id);
    setIsModelEditPopupOpen(true);
  };

  const openEditBrand = (item) => {
    setEditBrand(item.brand);
    const selectedCategoryOption = categoryOptions.find(
      (option) => option.value === item.category
    );
    setEditBrandCategory(selectedCategoryOption || null);
    setSelectedBrandId(item.id);
    setIsBrandEditPopupOpen(true);
  }
  const openEditTypeColor = (item) => {
    setEditTypeColor(item.typeColor);
    const selectedCategoryOption = categoryOptions.find(
      (option) => option.value === item.category
    );
    setEditTypeCategory(selectedCategoryOption || null);
    setSelectedTypeId(item.id)
    setIsTypeEditPopupOpen(true)
  }
  const openEditGroupName = (item) => {
    setEditGroupName(item.groupName)
    setGroupNameId(item.id)
    setIsGroupNameEditPopupOpen(true)
  }
  const openEditItemName = (item) => {
    setPoEditItemList({
      itemName: item.itemName || '',
      category: item.category || '',
      groupName: item.groupName || '',
      otherPOEntityList: item.otherPOEntityList?.length ? item.otherPOEntityList : [{
        modelName: '',
        brandName: '',
        typeColor: '',
        minimumQty: '',
        defaultQty: ''
      }]
    });
    setPoItemNameId(item.id);
    setIsItemNameEditPopupOpen(true);
  };
  const openEditSiteIncharge = (item) => {
    setEditSiteInchargeWithSite({
      siteEngineer: item.siteEngineer || '',
      mobileNumber: item.mobileNumber || '',
      sites: item.sites?.length ? item.sites : [{
        siteName: '',
        siteNo: '',
        siteStatus: item.siteStatus ?? true,
        branch: ''
      }]
    });
    setSiteInchargeId(item.id);
    setIsSiteInchargeEditPopupOpen(true);
  };
  const closeEditCategory = (item) => {
    setEditCategory('')
    setSelectedCategoryId('')
    setIsCategoryEditPopupOpen(false)
  }
  const closeEditModel = (item) => {
    setEditModel('')
    setSelectedModelId('')
    setEditModelCategory('')
    setIsModelEditPopupOpen(false)
  }
  const closeEditBrand = (item) => {
    setEditBrand('')
    setSelectedBrandId('')
    setIsBrandEditPopupOpen(false)
  }
  const closeEditTypeColor = (item) => {
    setEditTypeColor('')
    setSelectedTypeId('')
    setIsTypeEditPopupOpen(false)
  }
  const closeEditGroupName = (item) => {
    setEditGroupName('')
    setGroupNameId('')
    setIsGroupNameEditPopupOpen(false)
  }
  const handleAddField = () => {
    setFields([...fields, { label: '', inputType: 'text', dropdown: 'Dropdown' }]);
  };

  const handleUploadModel = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuildersDash/api/po_model/model_bulkUpload", {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      alert(result);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed!");
    }
    window.location.reload();
  };
  const handleUploadBrand = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuildersDash/api/po_brand/bulkUpload", {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      alert(result);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed!");
    }
    window.location.reload();
  };
  const handleUploadType = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuildersDash/api/po_type/bulkUpload", {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      alert(result);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed!");
    }
    window.location.reload();
  };
  const handleUploadItemName = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuildersDash/api/po_itemNames/upload/csv", {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      alert(result);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed!");
    }
    window.location.reload();
  };
  const handleSubmitEditCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/po_category/edit/${selectedCategoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: editCategory }),
      });
      if (response.ok) {
        closeEditCategory();
        window.location.reload();
      } else {
        console.error('Failed to update floor name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
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
          sNo: item.siteNo
        }));
        setSiteOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchSites();
  }, []);
  const handleSubmitEditModel = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/po_model/edit/${selectedModelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: editModel,
          category: editModelCategory?.value || ""
        }),
      });
      if (response.ok) {
        closeEditModel();
        window.location.reload();
      } else {
        console.error('Failed to update floor name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  const handleSubmitEditBrand = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/po_brand/edit/${selectedBrandId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brand: editBrand, category: editBrandCategory?.value || "" }),
      });
      if (response.ok) {
        closeEditBrand();
        window.location.reload();
      } else {
        console.error('Failed to update floor name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  const handleSubmitEditType = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/po_type/edit/${selectedTypeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ typeColor: editTypeColor, category: editTypeCategory?.value || "" }),
      });
      if (response.ok) {
        closeEditTypeColor();
        window.location.reload();
      } else {
        console.error('Failed to update floor name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  const handleSubmitEditItemName = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/po_itemNames/edit/${poItemNameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(poEditItemList),
      });
      if (response.ok) {
        const result = await response.json();
        window.location.reload();
      } else {
        const errorResult = await response.text(); // or .json() if your backend returns JSON errors
        console.error('Failed to update:', errorResult);
      }

    } catch (error) {
      console.error('Error:', error);
    }
  }
  const handleSubmitEditSiteIncharge = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/site_incharge/edit/${siteInchargeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editSiteInchargeWithSite),
      });
      if (response.ok) {
        const result = await response.json();
        window.location.reload();
      } else {
        const errorResult = await response.text(); // or .json() if your backend returns JSON errors
        console.error('Failed to update:', errorResult);
      }

    } catch (error) {
      console.error('Error:', error);
    }
  }
  const handleSubmitEditGroupName = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/group_name/edit/${groupNameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupName: editGroupName }),
      });
      if (response.ok) {
        closeEditGroupName();
        window.location.reload();
      } else {
        console.error('Failed to update floor name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  const handleCategoryDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete This Category?");
    if (confirmed) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/po_category/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert("Category deleted successfully!!!");
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
  const handleModelDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete This Model?");
    if (confirmed) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/po_model/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert("Model deleted successfully!!!");
          window.location.reload();
        } else {
          console.error("Failed to delete the Payment Mode. Status:", response.status);
          alert("Error deleting the Model. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the Model");
      }
    } else {
      console.log("Cancelled");
    }
  };
  const handleItemNameDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete This Item Name?");
    if (confirmed) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/po_itemNames/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert("Item Name deleted successfully!!!");
          window.location.reload();
        } else {
          console.error("Failed to delete the Payment Mode. Status:", response.status);
          alert("Error deleting the Item. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the Item");
      }
    } else {
      console.log("Cancelled");
    }
  };
  const handleBrandDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete This Brand?");
    if (confirmed) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/po_brand/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert("Brand deleted successfully!!!");
          window.location.reload();
        } else {
          console.error("Failed to delete the Brand. Status:", response.status);
          alert("Error deleting the Brand. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the Brand.");
      }
    } else {
      console.log("Cancelled");
    }
  };
  const handleTypeDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete This Type?");
    if (confirmed) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/po_type/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert("Type delete successfully!!!");
          window.location.reload();
        } else {
          console.error("Failed to delete the Type. Status:", response.status);
          alert("Error deleting the Type. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the Type.");
      }
    } else {
      console.log("Cancelled");
    }
  }
  const handleGroupNameDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete This Type?");
    if (confirmed) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/group_name/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert("Type delete successfully!!!");
          window.location.reload();
        } else {
          console.error("Failed to delete the Type. Status:", response.status);
          alert("Error deleting the Type. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the Type.");
      }
    } else {
      console.log("Cancelled");
    }
  }

  const handleSiteInchargeDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete This Site Incharge?");
    if (confirmed) {
      try {
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/site_incharge/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert("Site Incharge delete successfully!!!");
          window.location.reload();
        } else {
          console.error("Failed to delete the Site Incharge. Status:", response.status);
          alert("Error deleting the Site Incharge. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the Site Incharge.");
      }
    } else {
      console.log("Cancelled");
    }
  }

  const handleSubmitCategary = async (e) => {
    e.preventDefault();
    const newAccountType = { category };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_category/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccountType),
      });
      if (response.ok) {
        console.log('Account Type saved successfully!');
        setCategory('');
        window.location.reload();
      } else {
        console.log('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error saving area name.');
    }
  };
  const handleSubmitModel = async (e) => {
    e.preventDefault();
    const newModelData = {
      model: model,
      category: selectedModelCategory?.value || null,
    };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_model/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newModelData),
      });
      if (response.ok) {
        console.log('Account Type saved successfully!');
        setModel('');
        window.location.reload();
      } else {
        console.log('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error saving area name.');
    }
  };
  const handleSubmitBrand = async (e) => {
    e.preventDefault();
    const newBrandData = { brand, category: selectedBrandcategory?.value || null };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_brand/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBrandData),
      });
      if (response.ok) {
        console.log('Account Type saved successfully!');
        setBrand('');
        window.location.reload();
      } else {
        console.log('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error saving area name.');
    }
  };
  const handleSubmitType = async (e) => {
    e.preventDefault();
    const newTypeData = { typeColor, category: selectedTypeCategory?.value || null };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_type/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTypeData),
      });
      if (response.ok) {
        console.log('Account Type saved successfully!');
        setTypeColor('');
        window.location.reload();
      } else {
        console.log('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error saving area name.');
    }
  };
  const handleSubmitGroupName = async (e) => {
    e.preventDefault();
    const newAccountType = { groupName };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/group_name/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccountType),
      });
      if (response.ok) {
        console.log('Account Type saved successfully!');
        setGroupName('');
        window.location.reload();
      } else {
        console.log('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error saving area name.');
    }
  };
  useEffect(() => {
    fetchPoCategory();
  }, []);
  const fetchPoCategory = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoCategory(data);
        const options = data.map(item => ({
          value: item.category,
          label: item.category,
        }));
        setCategoryOptions(options);
      } else {
        console.log('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchPoModel();
  }, []);
  const fetchPoModel = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoModel(data);
      } else {
        setModelOptions([]);
        console.log('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchPoBrand();
  }, []);
  const fetchPoBrand = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoBrand(data);
      } else {
        setBrandOptions([]);
        console.log('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchPoType();
  }, []);
  const fetchPoType = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoType(data);
        //setTypeColorOptions([]);
      } else {
        console.log('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchPoItemName();
  }, []);
  const fetchPoItemName = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoItemName(data);
      } else {
        console.log('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchSiteIncharge();
  }, []);
  const fetchSiteIncharge = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/site_incharge/getAll');
      if (response.ok) {
        const data = await response.json();
        setSiteIncharge(data);
      } else {
        console.log('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchGroupNameList();
  }, []);
  const fetchGroupNameList = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/group_name/getAll');
      if (response.ok) {
        const data = await response.json();
        setGroupNameList(data);
        const options = data.map(item => ({
          value: item.groupName,
          label: item.groupName,
        }));
        setGroupNameOptions(options)
      } else {
        console.log('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    if (poItemList.category) {
      const filteredModels = poModel
        .filter((item) => item.category === poItemList.category)
        .map((item) => ({
          value: item.model,
          label: item.model,
        }));
      setModelOptions(filteredModels);
      const filteredBrand = poBrand
        .filter((item) => item.category === poItemList.category)
        .map((item) => ({
          value: item.brand,
          label: item.brand,
        }));
      setBrandOptions(filteredBrand);
      const filteredTypeColor = poType
        .filter((item) => item.category === poItemList.category)
        .map((item) => ({
          value: item.typeColor,
          label: item.typeColor,
        }));
      setTypeColorOptions(filteredTypeColor);
    } else {
      setModelOptions([]);
    }
  }, [poItemList.category, poModel, poBrand, poType]);
  useEffect(() => {
    if (poEditItemList.category) {
      const filteredEditModels = poModel
        .filter((item) => item.category === poEditItemList.category)
        .map((item) => ({
          value: item.model,
          label: item.model,
        }));
      setModelOptions(filteredEditModels);
      const filteredEditBrand = poBrand
        .filter((item) => item.category === poEditItemList.category)
        .map((item) => ({
          value: item.brand,
          label: item.brand,
        }));
      setBrandOptions(filteredEditBrand);
      const filteredEditTypeColor = poType
        .filter((item) => item.category === poEditItemList.category)
        .map((item) => ({
          value: item.typeColor,
          label: item.typeColor,
        }));
      setTypeColorOptions(filteredEditTypeColor);
    } else {
      setModelOptions([]);
    }
  }, [poEditItemList.category, poModel, poBrand, poType]);

  const handleRemoveField = (index) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);
  };
  const filteredPocategory = poCategory.filter((item) =>
    item.category.toLowerCase().includes(poCategorySearch.toLowerCase())
  );
  const filteredPoModel = poModel.filter((item) =>
    item.model.toLowerCase().includes(poModelSearch.toLowerCase())
  );
  const filteredPoBrand = poBrand.filter((item) =>
    item.brand.toLowerCase().includes(poBrandSearch.toLowerCase())
  );
  const filteredPoTypeColor = poType.filter((item) =>
    (item.typeColor ?? '').toLowerCase().includes((poTypeSearch ?? '').toLowerCase())
  );
  const filteredPoItemName = poItemName.filter((item) =>
    (item.itemName ?? '').toLowerCase().includes((poItemNameSearch ?? '').toLowerCase()) &&
    (!selectedCategory || item.category === selectedCategory.value)
  );
  const filteredSiteIncharge = siteIncharge.filter((item) =>
    item.siteEngineer.toLowerCase().includes(siteInchargeSearch.toLowerCase())
  );
  const filteredGroupName = groupNameList.filter((item) =>
    item.groupName.toLowerCase().includes(groupNameSearch.toLowerCase())
  );
  const getItemNamesForModel = (modelName) => {
    return poItemName
      .filter(item => item.otherPOEntityList?.some(entry => entry.modelName === modelName))
      .map(item => item.itemName);
  };

  const handleSubmitSiteIncharge = async () => {
    // Basic validation
    if (!siteInchargeWithSite.siteEngineer || !siteInchargeWithSite.mobileNumber) {
      alert("Site Engineer and Mobile Number are required");
      return;
    }
    try {
      const response = await fetch("https://backendaab.in/aabuildersDash/api/site_incharge/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(siteInchargeWithSite),
      });
      if (response.ok) {
        const result = await response.json();
        alert("Site Incharge saved successfully!");
        // Optionally reset the form
        setSiteInchargeWithSite({
          siteEngineer: "",
          mobileNumber: "",
          sites: [
            {
              siteName: "",
              siteNo: "",
              siteStatus: false,
              branch: "",
            },
          ],
        });
        setIsSiteInchargeAddPopupOpen(false);
      } else {
        const err = await response.text();
        alert("Failed to save: " + err);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error saving site incharge");
    }
  };
  const handleSubmit = async () => {
    const payload = {
      itemName: poItemList.itemName,
      category: poItemList.category,
      groupName: poItemList.groupName,
      otherPOEntityList: poItemList.otherPOEntityList,
    };
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit data');
      }

      const data = await response.json();
      window.location.reload();
      // Optionally show success message or close popup
      setIsPopupOpen(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit the form.');
    }
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "transparent",
      borderColor: state.isFocused ? "#FAF6ED" : "transparent",
      "&:hover": {
        borderColor: "none",
      },
      boxShadow: state.isFocused ? "0 0 0 #FAF6ED" : "none",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#000',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
  };

  const fetchMappedCategories = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/mapped/category/getAll');
      if (response.ok) {
        const data = await response.json();
        const selected = data.map(d => d.mappedCategory);
        setSelectedOptions(selected);
        setOriginalSelectedOptions(selected);

        // Map category to its DB id for deletion
        const idMap = {};
        data.forEach(item => {
          idMap[item.mappedCategory] = item.id;
        });
        setMappedCategoryMap(idMap);
      }
    } catch (error) {
      console.error('Error fetching mapped categories:', error);
    }
  };

  const handleSave = async () => {
    // Categories the user just selected
    const toAdd = selectedOptions.filter(opt => !originalSelectedOptions.includes(opt));
    // Categories the user unselected
    const toRemove = originalSelectedOptions.filter(opt => !selectedOptions.includes(opt));
    try {
      // 1️⃣ Add new selections
      for (const category of toAdd) {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/mapped/category/save", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mappedCategory: category }),
        });
        if (!response.ok) {
          console.error(`❌ Failed to add category '${category}':`, response.status);
        } else {
          console.log(`✅ Added category: ${category}`);
        }
      }
      // 2️⃣ Delete unselected categories
      for (const category of toRemove) {
        const id = mappedCategoryMap[category];
        if (id) {
          const deleteResponse = await fetch(`https://backendaab.in/aabuildersDash/api/mapped/category/delete/${id}`, {
            method: "DELETE",
          });
          if (!deleteResponse.ok) {
            console.error(`❌ Failed to delete category '${category}' with ID ${id}:`, deleteResponse.status);
          } else {
            console.log(`🗑️ Deleted category: ${category} (ID: ${id})`);
          }
        } else {
          console.warn(`⚠️ No ID found for '${category}', cannot delete.`);
        }
      }
      alert("✅ Categories updated successfully.");
      window.location.reload();
      setMappedCategoryAddPopup(false);
    } catch (error) {
      console.error("🔥 Error in handleSave:", error);
      alert("❌ Failed to update categories. Check console for details.");
    }
  };
  return (
    <div className="p-4 bg-white ml-6 mr-8">
      <div className='lg:flex justify-between items-center text-left'>
        <div className="text-left">
          <h4 className=" font-semibold mb-2 ">Category</h4>
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
            placeholder="Select Category..."
            className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg lg:w-[450px] w-64 h-12 text-left"
            styles={customSelectStyles}
            isClearable
          />
        </div>
        <div className=' lg:mt-0 mt-4'>
          <button
            onClick={() => {
              fetchMappedCategories();
              setMappedCategoryAddPopup(true);
            }}
            className='rounded-md text-white font-medium w-48 bg-[#BF9853] p-2.5'
          >
            Category Mapping
          </button>
        </div>
      </div>
      <div className=" lg:flex space-x-[2%] w-full mt-4 overflow-x-auto "
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}>
        <div className='lg:ml-0 ml-2 lg:mb-0 mb-4'>
          <div className="lg:flex hidden items-center mb-2">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-[250px] h-12 focus:outline-none"
              placeholder="Search Item Name.."
              value={poItemNameSearch}
              onChange={(e) => setPoItemNameSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button
              onClick={() => { setIsPopupOpen(true) }}
              className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
            >
              + Add
            </button>
          </div>
          <button onClick={openItemNameUpload} className="text-[#E4572E] lg:flex hidden mb-6">
            <img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' />
            <h1 className='mt-1.5 text-sm'>Import file</h1>
          </button>
          <button className="lg:block hidden">
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 lg:ml-[20rem] ml-[15rem]' />
          </button>
          <div className="rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-[355px] w-full">
                <thead className="bg-[#FAF6ED]">
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold lg:table-cell hidden">S.No</th>
                    <th className="p-2 text-left w-72 text-xl font-bold lg:cursor-default">
                      {openSearchFields.itemName ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-2 bg-transparent border-l-2 border-b-2 border-t-2 rounded-lg p-1.5 flex-1 h-10 focus:outline-none text-sm"
                            placeholder="Search Item Name.."
                            value={poItemNameSearch}
                            onChange={(e) => setPoItemNameSearch(e.target.value)}
                            autoFocus
                          />
                          <button 
                            onClick={() => toggleSearchField('itemName')}
                            className="text-gray-500"
                          >
                            <img src={search} alt='search' className='w-4 h-4' />
                          </button>
                          <button 
                            onClick={() => toggleTable('itemName')} 
                            className="text-gray-700 lg:hidden"
                          >
                            <span className="text-xl font-bold">
                              {expandedTables.itemName ? '↑' : '↓'}
                            </span>
                          </button>
                          <button
                            onClick={() => { setIsPopupOpen(true) }}
                            className="text-black font-bold text-xl lg:hidden"
                          >
                            +
                          </button>
                          <button
                            onClick={() => { setIsPopupOpen(true) }}
                            className="text-black font-bold px-1 border-dashed border-b-2 border-[#BF9853] text-sm lg:block hidden"
                          >
                            + Add
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span 
                            className="cursor-pointer lg:cursor-default"
                            onClick={() => toggleSearchField('itemName')}
                          >
                            Item Name
                          </span>
                          <div className="flex items-center gap-2 lg:hidden">
                            <button 
                              onClick={() => toggleSearchField('itemName')}
                              className="text-gray-500"
                            >
                              <img src={search} alt='search' className='w-4 h-4' />
                            </button>
                            <button onClick={() => toggleTable('itemName')} className="text-gray-700">
                              <span className="text-xl font-bold">
                                {expandedTables.itemName ? '↑' : '↓'}
                              </span>
                            </button>
                            <button
                              onClick={() => { setIsPopupOpen(true) }}
                              className="text-black font-bold text-xl"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </th>
                    <th className="p-2 text-right lg:hidden">
                      {!openSearchFields.itemName && (
                        <div className="flex items-center justify-end gap-2">
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className={`overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 lg:block ${expandedTables.itemName ? 'block' : 'hidden'}`}>
              <table className="table-auto w-full">
                <tbody>
                  {filteredPoItemName.map((item, index) => (
                    <tr className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold lg:table-cell hidden">{(poItemName.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 group flex justify-between items-center font-semibold">
                        {item.itemName}
                        <div className="flex flex-grow">
                          <button className="font-medium hover:text-[#E4572E] text-left flex">
                          </button>
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button
                            type="button"
                            onClick={() => { openEditItemName(item) }}
                          >
                            <img src={edit} alt="edit" className="w-4 h-4" />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleItemNameDelete(item.id)} />
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
        <div className='lg:ml-0 ml-2 lg:mb-0 mb-4'>
          <div className="lg:flex hidden items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search Model.."
              value={poModelSearch}
              onChange={(e) => setPoModelSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button
              onClick={() => setIsPopupOpen1(true)}
              className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
            >
              + Add
            </button>
          </div>
          <button onClick={openModelUpload} className="text-[#E4572E] lg:flex hidden mb-6">
            <img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' />
            <h1 className='mt-1.5 text-sm'>Import file</h1>
            </button>
          <button className="lg:block hidden">
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 lg:ml-[15rem] ml-[12rem]' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-[249px] w-full">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold lg:table-cell hidden">S.No</th>
                    <th className="p-2 text-left w-72 text-xl font-bold lg:cursor-default">
                      {openSearchFields.model ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-2 border-l-2 border-b-2 border-t-2 bg-transparent rounded-lg p-1.5 flex-1 h-10 focus:outline-none text-sm"
                            placeholder="Search Model.."
                            value={poModelSearch}
                            onChange={(e) => setPoModelSearch(e.target.value)}
                            autoFocus
                          />
                          <button 
                            onClick={() => toggleSearchField('model')}
                            className="text-gray-500"
                          >
                            <img src={search} alt='search' className='w-4 h-4' />
                          </button>
                          <button 
                            onClick={() => toggleTable('model')} 
                            className="text-gray-700 lg:hidden"
                          >
                            <span className="text-xl font-bold">
                              {expandedTables.model ? '↑' : '↓'}
                            </span>
                          </button>
                          <button
                            onClick={() => setIsPopupOpen1(true)}
                            className="text-black font-bold text-xl lg:hidden"
                          >
                            +
                          </button>
                          <button
                            onClick={() => setIsPopupOpen1(true)}
                            className="text-black font-bold px-1 border-dashed border-b-2 border-[#BF9853] text-sm lg:block hidden"
                          >
                            + Add
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span 
                            className="cursor-pointer lg:cursor-default"
                            onClick={() => toggleSearchField('model')}
                          >
                            Model
                          </span>
                          <div className="flex items-center gap-2 lg:hidden">
                            <button 
                              onClick={() => toggleSearchField('model')}
                              className="text-gray-500"
                            >
                              <img src={search} alt='search' className='w-4 h-4' />
                            </button>
                            <button onClick={() => toggleTable('model')} className="text-gray-700">
                              <span className="text-xl font-bold">
                                {expandedTables.model ? '↑' : '↓'}
                              </span>
                            </button>
                            <button
                              onClick={() => setIsPopupOpen1(true)}
                              className="text-black font-bold text-xl"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </th>
                    <th className="p-2 text-right lg:hidden">
                      {!openSearchFields.model && (
                        <div className="flex items-center justify-end gap-2">
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className={`overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 lg:block ${expandedTables.model ? 'block' : 'hidden'}`}>
              <table className="table-auto w-full">
                <tbody>
                  {filteredPoModel.map((modelItem, index) => {
                    const itemNamesForThisModel = getItemNamesForModel(modelItem.model);
                    return (
                      <tr
                        key={modelItem.id}
                        className="border-b odd:bg-white even:bg-[#FAF6ED]"
                        onMouseEnter={() => setHoveredModelName(modelItem.model)}
                        onMouseLeave={() => setHoveredModelName(null)}
                      >
                        <td className="p-2 text-left font-semibold lg:table-cell hidden">
                          {(poModel.findIndex(acc => acc.id === modelItem.id) + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="p-2 text-left group flex font-semibold relative">
                          <div className="flex flex-grow">{modelItem.model}</div>
                          <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button type="button">
                              <img src={edit} alt="edit" className="w-4 h-4" onClick={() => openEditModel(modelItem)} />
                            </button>
                            <button>
                              <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleModelDelete(modelItem.id)} />
                            </button>
                          </div>
                          {hoveredModelName === modelItem.model && itemNamesForThisModel.length > 0 && (
                            <div className="absolute top-8 left-0 z-10 bg-white border border-gray-300 rounded shadow-md p-2 w-48 text-sm">
                              <ul className="list-disc ml-4">
                                {itemNamesForThisModel.map((name, idx) => (
                                  <li key={idx}>{name}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className='lg:ml-0 ml-2 lg:mb-0 mb-4'>
          <div className="lg:flex hidden items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search Brand.."
              value={poBrandSearch}
              onChange={(e) => setPoBrandSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button
              onClick={() => setIsPopupOpen2(true)}
              className="text-black font-bold ml-4 px-1 border-dashed border-b-2 border-[#BF9853]"
            >
              + Add
            </button>
          </div>
          <button onClick={openBrandUpload} className="text-[#E4572E] lg:flex hidden mb-6">
            <img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' />
            <h1 className='mt-1.5 text-sm'>Import file</h1>
            </button>
          <button className="lg:block hidden">
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[17rem]' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-[323px] w-full">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold lg:table-cell hidden">S.No</th>
                    <th className="p-2 text-left w-72 text-xl font-bold lg:cursor-default">
                      {openSearchFields.brand ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-2 border-l-2 border-b-2 border-t-2 bg-transparent rounded-lg p-1.5 flex-1 h-10 focus:outline-none text-sm"
                            placeholder="Search Brand.."
                            value={poBrandSearch}
                            onChange={(e) => setPoBrandSearch(e.target.value)}
                            autoFocus
                          />
                          <button 
                            onClick={() => toggleSearchField('brand')}
                            className="text-gray-500"
                          >
                            <img src={search} alt='search' className='w-4 h-4' />
                          </button>
                          <button 
                            onClick={() => toggleTable('brand')} 
                            className="text-gray-700 lg:hidden"
                          >
                            <span className="text-xl font-bold">
                              {expandedTables.brand ? '↑' : '↓'}
                            </span>
                          </button>
                          <button
                            onClick={() => setIsPopupOpen2(true)}
                            className="text-black font-bold text-xl lg:hidden"
                          >
                            +
                          </button>
                          <button
                            onClick={() => setIsPopupOpen2(true)}
                            className="text-black font-bold px-1 border-dashed border-b-2 border-[#BF9853] text-sm lg:block hidden"
                          >
                            + Add
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span 
                            className="cursor-pointer lg:cursor-default"
                            onClick={() => toggleSearchField('brand')}
                          >
                            Brand
                          </span>
                          <div className="flex items-center gap-2 lg:hidden">
                            <button 
                              onClick={() => toggleSearchField('brand')}
                              className="text-gray-500"
                            >
                              <img src={search} alt='search' className='w-4 h-4' />
                            </button>
                            <button onClick={() => toggleTable('brand')} className="text-gray-700">
                              <span className="text-xl font-bold">
                                {expandedTables.brand ? '↑' : '↓'}
                              </span>
                            </button>
                            <button
                              onClick={() => setIsPopupOpen2(true)}
                              className="text-black font-bold text-xl"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </th>
                    <th className="p-2 text-right lg:hidden">
                      {!openSearchFields.brand && (
                        <div className="flex items-center justify-end gap-2">
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className={`overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 lg:block ${expandedTables.brand ? 'block' : 'hidden'}`}>
              <table className="table-auto w-full">
                <tbody>
                  {filteredPoBrand.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold lg:table-cell hidden">{(poBrand.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.brand}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditBrand(item)} />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleBrandDelete(item.id)} />
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
        <div className='lg:ml-0 ml-2 lg:mb-0 mb-4'>
          <div className="lg:flex hidden items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none "
              placeholder="Search Type.."
              value={poTypeSearch}
              onChange={(e) => setPoTypeSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button
              onClick={() => setIsPopupOpen3(true)}
              className="text-black font-bold ml-4 px-1 border-dashed border-b-2 border-[#BF9853]"
            >
              + Add
            </button>
          </div>
          <button onClick={openTypeUpload} className="text-[#E4572E] lg:flex hidden mb-6">
            <img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' />
            <h1 className='mt-1.5 text-sm'>Import file</h1>
            </button>
          <button className="lg:block hidden">
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[13rem]' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-[249px] w-full">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold lg:table-cell hidden">S.No</th>
                    <th className="p-2 text-left w-72 text-xl font-bold lg:cursor-default">
                      {openSearchFields.type ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-2 border-l-2 border-b-2 border-t-2 bg-transparent rounded-lg p-1.5 flex-1 h-10 focus:outline-none text-sm"
                            placeholder="Search Type.."
                            value={poTypeSearch}
                            onChange={(e) => setPoTypeSearch(e.target.value)}
                            autoFocus
                          />
                          <button 
                            onClick={() => toggleSearchField('type')}
                            className="text-gray-500"
                          >
                            <img src={search} alt='search' className='w-4 h-4' />
                          </button>
                          <button 
                            onClick={() => toggleTable('type')} 
                            className="text-gray-700 lg:hidden"
                          >
                            <span className="text-xl font-bold">
                              {expandedTables.type ? '↑' : '↓'}
                            </span>
                          </button>
                          <button
                            onClick={() => setIsPopupOpen3(true)}
                            className="text-black font-bold text-xl lg:hidden"
                          >
                            +
                          </button>
                          <button
                            onClick={() => setIsPopupOpen3(true)}
                            className="text-black font-bold px-1 border-dashed border-b-2 border-[#BF9853] text-sm lg:block hidden"
                          >
                            + Add
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span 
                            className="cursor-pointer lg:cursor-default"
                            onClick={() => toggleSearchField('type')}
                          >
                            Type
                          </span>
                          <div className="flex items-center gap-2 lg:hidden">
                            <button 
                              onClick={() => toggleSearchField('type')}
                              className="text-gray-500"
                            >
                              <img src={search} alt='search' className='w-4 h-4' />
                            </button>
                            <button onClick={() => toggleTable('type')} className="text-gray-700">
                              <span className="text-xl font-bold">
                                {expandedTables.type ? '↑' : '↓'}
                              </span>
                            </button>
                            <button
                              onClick={() => setIsPopupOpen3(true)}
                              className="text-black font-bold text-xl"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </th>
                    <th className="p-2 text-right lg:hidden">
                      {!openSearchFields.type && (
                        <div className="flex items-center justify-end gap-2">
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className={`overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 lg:block ${expandedTables.type ? 'block' : 'hidden'}`}>
              <table className="table-auto w-full">
                <tbody>
                  {filteredPoTypeColor.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold lg:table-cell hidden">{(poType.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.typeColor}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditTypeColor(item)} />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleTypeDelete(item.id)} />
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
        <div className='lg:ml-0 ml-2 lg:mb-0 mb-4'>
          <div className="lg:flex hidden items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-[250px] h-12 focus:outline-none"
              placeholder="Search Category.."
              value={poCategorySearch}
              onChange={(e) => setPoCategorySearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button
              className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
              onClick={() => setIsShowModal(true)}
            >
              + Add
            </button>
          </div>
          <button className="text-[#E4572E] lg:flex hidden ">
            <img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1 mb-6' />
            <h1 className='mt-1.5 text-sm'>Import file</h1>
          </button>
          <button className="lg:block hidden">
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 lg:ml-[20rem] ml-[15rem]' />
          </button>
          <div className="rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-[355px] w-full">
                <thead className="bg-[#FAF6ED]">
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold lg:table-cell hidden">S.No</th>
                    <th className="p-2 text-left w-72 text-xl font-bold lg:cursor-default">
                      {openSearchFields.category ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-2 border-l-2 border-b-2 border-t-2 bg-transparent rounded-lg p-1.5 flex-1 h-10 focus:outline-none text-sm"
                            placeholder="Search Category.."
                            value={poCategorySearch}
                            onChange={(e) => setPoCategorySearch(e.target.value)}
                            autoFocus
                          />
                          <button 
                            onClick={() => toggleSearchField('category')}
                            className="text-gray-500"
                          >
                            <img src={search} alt='search' className='w-4 h-4' />
                          </button>
                          <button 
                            onClick={() => toggleTable('category')} 
                            className="text-gray-700 lg:hidden"
                          >
                            <span className="text-xl font-bold">
                              {expandedTables.category ? '↑' : '↓'}
                            </span>
                          </button>
                          <button
                            onClick={() => setIsShowModal(true)}
                            className="text-black font-bold text-xl lg:hidden"
                          >
                            +
                          </button>
                          <button
                            className="text-black font-bold px-1 border-dashed border-b-2 border-[#BF9853] text-sm lg:block hidden"
                            onClick={() => setIsShowModal(true)}
                          >
                            + Add
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span 
                            className="cursor-pointer lg:cursor-default"
                            onClick={() => toggleSearchField('category')}
                          >
                            Category
                          </span>
                          <div className="flex items-center gap-2 lg:hidden">
                            <button 
                              onClick={() => toggleSearchField('category')}
                              className="text-gray-500"
                            >
                              <img src={search} alt='search' className='w-4 h-4' />
                            </button>
                            <button onClick={() => toggleTable('category')} className="text-gray-700">
                              <span className="text-xl font-bold">
                                {expandedTables.category ? '↑' : '↓'}
                              </span>
                            </button>
                            <button
                              onClick={() => setIsShowModal(true)}
                              className="text-black font-bold text-xl"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </th>
                    <th className="p-2 text-right lg:hidden">
                      {!openSearchFields.category && (
                        <div className="flex items-center justify-end gap-2">
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className={`overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 lg:block ${expandedTables.category ? 'block' : 'hidden'}`}>
              <table className="table-auto w-full">
                <tbody>
                  {filteredPocategory.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold lg:table-cell hidden">{(poCategory.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.category}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditCategory(item)} />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleCategoryDelete(item.id)} />
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
        <div className='lg:ml-0 ml-2 lg:mb-0 mb-4'>
          <div className="lg:flex hidden items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-[250px] h-12 focus:outline-none"
              placeholder="Search Site Incharge Name.."
              value={siteInchargeSearch}
              onChange={(e) => setSiteInchargeSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button onClick={() => setIsSiteInchargeAddPopupOpen(true)} className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]" >
              + Add
            </button>
          </div>
          <button className="text-[#E4572E] lg:flex hidden ">
            <img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1 mb-6' />
            <h1 className='mt-1.5 text-sm'>Import file</h1>
          </button>
          <button className="lg:block hidden">
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 lg:ml-[20rem] ml-[15rem]' />
          </button>
          <div className="rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-[355px] w-full">
                <thead className="bg-[#FAF6ED]">
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold lg:table-cell hidden">S.No</th>
                    <th className="p-2 text-left w-72 text-xl font-bold lg:cursor-default">
                      {openSearchFields.siteIncharge ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-2 border-l-2 border-b-2 border-t-2 rounded-lg p-1.5 flex-1 h-10 focus:outline-none text-sm"
                            placeholder="Search Site Incharge Name.."
                            value={siteInchargeSearch}
                            onChange={(e) => setSiteInchargeSearch(e.target.value)}
                            autoFocus
                          />
                          <button 
                            onClick={() => toggleSearchField('siteIncharge')}
                            className="text-gray-500"
                          >
                            <img src={search} alt='search' className='w-4 h-4' />
                          </button>
                          <button 
                            onClick={() => toggleTable('siteIncharge')} 
                            className="text-gray-700 lg:hidden"
                          >
                            <span className="text-xl font-bold">
                              {expandedTables.siteIncharge ? '↑' : '↓'}
                            </span>
                          </button>
                          <button
                            onClick={() => setIsSiteInchargeAddPopupOpen(true)}
                            className="text-black font-bold text-xl lg:hidden"
                          >
                            +
                          </button>
                          <button 
                            onClick={() => setIsSiteInchargeAddPopupOpen(true)} 
                            className="text-black font-bold px-1 border-dashed border-b-2 border-[#BF9853] text-sm lg:block hidden"
                          >
                            + Add
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span 
                            className="cursor-pointer lg:cursor-default"
                            onClick={() => toggleSearchField('siteIncharge')}
                          >
                            Site Incharge
                          </span>
                          <div className="flex items-center gap-2 lg:hidden">
                            <button 
                              onClick={() => toggleSearchField('siteIncharge')}
                              className="text-gray-500"
                            >
                              <img src={search} alt='search' className='w-4 h-4' />
                            </button>
                            <button onClick={() => toggleTable('siteIncharge')} className="text-gray-700">
                              <span className="text-xl font-bold">
                                {expandedTables.siteIncharge ? '↑' : '↓'}
                              </span>
                            </button>
                            <button
                              onClick={() => setIsSiteInchargeAddPopupOpen(true)}
                              className="text-black font-bold text-xl"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </th>
                    <th className="p-2 text-right lg:hidden">
                      {!openSearchFields.siteIncharge && (
                        <div className="flex items-center justify-end gap-2">
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className={`overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 lg:block ${expandedTables.siteIncharge ? 'block' : 'hidden'}`}>
              <table className="table-auto w-full">
                <tbody>
                  {filteredSiteIncharge.map((item, index) => (
                    <tr className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold lg:table-cell hidden">{(siteIncharge.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 group flex justify-between items-center font-semibold">
                        {item.siteEngineer}
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button
                            type="button"
                            onClick={() => openEditSiteIncharge(item)}
                          >
                            <img src={edit} alt="edit" className="w-4 h-4" />
                          </button>
                          <button>
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleSiteInchargeDelete(item.id)} />
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
        <div className='lg:ml-0 ml-2 lg:mb-0 mb-4'>
          <div className="lg:flex hidden items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              value={groupNameSearch}
              onChange={(e) => setGroupNameSearch(e.target.value)}
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-[250px] h-12 focus:outline-none"
              placeholder="Search Group Name.."
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button onClick={() => setIsGroupNameAddPopupOpen(true)} className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]" >
              + Add
            </button>
          </div>
          <button className="text-[#E4572E] lg:flex hidden">
            <img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1 mb-6' />
            <h1 className='mt-1.5 text-sm'>Import file</h1>
          </button>
          <button className="lg:block hidden">
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 lg:ml-[20rem] ml-[15rem]' />
          </button>
          <div className="rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-[355px] w-full">
                <thead className="bg-[#FAF6ED]">
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold lg:table-cell hidden">S.No</th>
                    <th className="p-2 text-left w-72 text-xl font-bold lg:cursor-default">
                      {openSearchFields.groupName ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="border border-[#FAF6ED] border-r-2 border-l-2 border-b-2 border-t-2 bg-transparent rounded-lg p-1.5 flex-1 h-10 focus:outline-none text-sm"
                            placeholder="Search Group Name.."
                            value={groupNameSearch}
                            onChange={(e) => setGroupNameSearch(e.target.value)}
                            autoFocus
                          />
                          <button 
                            onClick={() => toggleSearchField('groupName')}
                            className="text-gray-500"
                          >
                            <img src={search} alt='search' className='w-4 h-4' />
                          </button>
                          <button 
                            onClick={() => toggleTable('groupName')} 
                            className="text-gray-700 lg:hidden"
                          >
                            <span className="text-xl font-bold">
                              {expandedTables.groupName ? '↑' : '↓'}
                            </span>
                          </button>
                          <button
                            onClick={() => setIsGroupNameAddPopupOpen(true)}
                            className="text-black font-bold text-xl lg:hidden"
                          >
                            +
                          </button>
                          <button 
                            onClick={() => setIsGroupNameAddPopupOpen(true)} 
                            className="text-black font-bold px-1 border-dashed border-b-2 border-[#BF9853] text-sm lg:block hidden"
                          >
                            + Add
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span 
                            className="cursor-pointer lg:cursor-default"
                            onClick={() => toggleSearchField('groupName')}
                          >
                            Group Name
                          </span>
                          <div className="flex items-center gap-2 lg:hidden">
                            <button 
                              onClick={() => toggleSearchField('groupName')}
                              className="text-gray-500"
                            >
                              <img src={search} alt='search' className='w-4 h-4' />
                            </button>
                            <button onClick={() => toggleTable('groupName')} className="text-gray-700">
                              <span className="text-xl font-bold">
                                {expandedTables.groupName ? '↑' : '↓'}
                              </span>
                            </button>
                            <button
                              onClick={() => setIsGroupNameAddPopupOpen(true)}
                              className="text-black font-bold text-xl"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </th>
                    <th className="p-2 text-right lg:hidden">
                      {!openSearchFields.groupName && (
                        <div className="flex items-center justify-end gap-2">
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className={`overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 lg:block ${expandedTables.groupName ? 'block' : 'hidden'}`}>
              <table className="table-auto w-full">
                <tbody>
                  {filteredGroupName.map((item, index) => (
                    <tr className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold lg:table-cell hidden">{(groupNameList.findIndex(acc => acc.id === item.id) + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 group flex justify-between items-center font-semibold">
                        {item.groupName}
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button
                            type="button"
                          >
                            <img src={edit} alt="edit" className="w-4 h-4" onClick={() => openEditGroupName(item)} />
                          </button>
                          <button>
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleGroupNameDelete(item.id)} />
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
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md">
            <h2 className="text-xl font-semibold mb-4">Input Data</h2>
            <div className="space-y-3 max-h-[60vh] overflow-auto">
              {fields.map((field, index) => (
                <div className="flex items-center gap-2" key={index}>
                  <input
                    type={field.inputType}
                    placeholder={field.label || 'Field'}
                    className="flex-1 border px-3 py-2 rounded"
                  />
                  <select className="border px-2 py-2 rounded">
                    <option>{field.dropdown}</option>
                  </select>
                  <button
                    className="text-red-500"
                    onClick={() => handleRemoveField(index)}
                  >
                    <img src={deleteIcon} alt='#' className='w-4 h-4'></img>
                  </button>
                </div>
              ))}
              <p
                className="text-[#E4572E] font-semibold text-sm cursor-pointer text-left border-b-2 border-dashed w-16"
                onClick={handleAddField}
              >
                + Add on
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="bg-[#BF9853] text-white px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Submit
              </button>
              <button
                className="border border-[#BF9853] text-[#BF9853] px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isShowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white w-[500px] rounded-md shadow-lg p-6 relative">
            <div className="flex justify-between items-center mb-4 text-left">
              <button
                className="text-red-500 text-xl font-bold"
                onClick={() => setIsShowModal(false)}
              >
                ×
              </button>
            </div>
            <label className="block text-[15px] font-medium text-gray-400 mb-1 text-left">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-2 border-[#BF9853] border-opacity-25 rounded-md p-2 w-full mb-4 focus:outline-none"
              placeholder="Enter category"
            />
            <div className="flex justify-end gap-3">
              <button
                className="border border-[#BF9853] text-[#BF9853] rounded px-4 py-1"
                onClick={() => setIsShowModal(false)}
              >
                Close
              </button>
              <button
                className="bg-[#BF9853] text-white rounded px-4 py-1"
                onClick={handleSubmitCategary}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isCategoryEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white w-[500px] rounded-md shadow-lg p-6 relative">
            <div className="flex justify-between items-center border-b pb-2 mb-4 text-left">
              <h2 className="text-lg font-semibold">Edit CATEGORY</h2>
              <button
                className="text-red-500 text-xl font-bold"
                onClick={() => setIsCategoryEditPopupOpen(false)}
              >
                ×
              </button>
            </div>
            <label className="block text-[15px] font-medium text-gray-400 mb-1 text-left">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="border-2 border-[#BF9853] border-opacity-25 rounded-md p-2 w-full mb-4 focus:outline-none"
              placeholder="Enter category"
            />
            <div className="flex justify-end gap-3">
              <button
                className="border border-[#BF9853] text-[#BF9853] rounded px-4 py-1"
                onClick={() => setIsCategoryEditPopupOpen(false)}
              >
                Close
              </button>
              <button
                className="bg-[#BF9853] text-white rounded px-4 py-1"
                onClick={handleSubmitEditCategory}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-md w-[1150px] shadow-lg text-left p-6">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <button onClick={() => setIsPopupOpen(false)} className="text-red-500 text-[30px] font-bold">×</button>
            </div>
            <div className="space-y-4">
              <div className='flex gap-3'>
                <div className="text-left mt-2">
                  <label className="block font-medium text-gray-400 text-[15px]">Category</label>
                  <Select
                    value={categoryOptions.find(opt => opt.value === poItemList.category) || null}
                    onChange={(selectedOption) =>
                      setPoItemList({ ...poItemList, category: selectedOption ? selectedOption.value : '' })
                    }
                    options={categoryOptions}
                    placeholder="Select Category..."
                    className="border-2 border-[#BF9853] border-opacity-25 rounded-lg lg:w-[500px] w-64 text-left"
                    styles={customSelectStyles}
                    isClearable
                  />
                </div>
                <div className="text-left mt-1.5">
                  <label className="block font-medium text-gray-400 text-[15px]">Group name </label>
                  <Select
                    options={groupNameOptions}
                    value={groupNameOptions.find(opt => opt.value === poItemList.groupName) || null}
                    onChange={(selectedOption) =>
                      setPoItemList({ ...poItemList, groupName: selectedOption ? selectedOption.value : "", })
                    }
                    placeholder="Group Name..."
                    isSearchable
                    isClearable
                    className="lg:w-[485px] w-64 border-2 border-[#BF9853] border-opacity-25 rounded-lg"
                    styles={customSelectStyles}
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-400 text-[15px]">Item Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={poItemList.itemName}
                  onChange={(e) => setPoItemList({ ...poItemList, itemName: e.target.value })}
                  className="w-full border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                  placeholder="Test item"
                />
              </div>
              <div className="w-[1120px] overflow-x-hidden h-[250px] overflow-y-auto ">
                {poItemList.otherPOEntityList.map((item, index) => (
                  <div key={index} className="flex flex-wrap gap-4 items-end mb-2">
                    <div>
                      <label className="block font-medium text-gray-400 text-[15px]">Model Name <span className="text-red-500">*</span></label>
                      <CreatableSelect
                        options={modelOptions}
                        isClearable={true}
                        value={item.modelName ? { value: item.modelName, label: item.modelName } : null}
                        onChange={(selectedOption) => {
                          const updatedList = [...poItemList.otherPOEntityList];
                          updatedList[index].modelName = selectedOption ? selectedOption.value : '';
                          setPoItemList({ ...poItemList, otherPOEntityList: updatedList });
                        }}
                        onCreateOption={async (inputValue) => {
                          const newModelData = {
                            model: inputValue,
                            category: poItemList.category || selectedModelCategory?.value || null,
                          };

                          try {
                            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_model/save', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(newModelData),
                            });

                            if (response.ok) {
                              // Refresh full model list from backend
                              await fetchPoModel(); // fetch again to update poModel list

                              // Add new option to modelOptions manually
                              const newOption = { value: inputValue, label: inputValue };
                              setModelOptions((prev) => [...prev, newOption]);

                              // Update the selected value in that row
                              const updatedList = [...poItemList.otherPOEntityList];
                              updatedList[index].modelName = inputValue;
                              setPoItemList({ ...poItemList, otherPOEntityList: updatedList });
                            } else {
                              console.log('Error saving model name.');
                            }
                          } catch (err) {
                            console.error('Error:', err);
                          }
                        }}
                        formatCreateLabel={(inputValue) => `+ Add "${inputValue}"`}
                        className="border-2 border-[#BF9853] border-opacity-25 rounded-lg lg:w-[320px] w-64 text-left"
                        styles={customSelectStyles}
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-400 text-[15px]">Brand Name <span className="text-red-500">*</span></label>
                      <CreatableSelect
                        options={brandOptions}
                        isClearable={true}
                        value={item.brandName ? { value: item.brandName, label: item.brandName } : null}
                        onChange={(selectedOption) => {
                          const updatedList = [...poItemList.otherPOEntityList];
                          updatedList[index].brandName = selectedOption ? selectedOption.value : '';
                          setPoItemList({ ...poItemList, otherPOEntityList: updatedList });
                        }}
                        onCreateOption={async (inputValue) => {
                          const newBrand = {
                            brand: inputValue,
                            category: poItemList.category || null,
                          };

                          try {
                            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_brand/save', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(newBrand),
                            });

                            if (response.ok) {
                              // Refresh full model list from backend
                              await fetchPoBrand(); // fetch again to update poModel list
                              const newOption = { value: inputValue, label: inputValue };
                              setBrandOptions((prev) => [...prev, newOption]);

                              const updatedList = [...poItemList.otherPOEntityList];
                              updatedList[index].brandName = inputValue;
                              setPoItemList({ ...poItemList, otherPOEntityList: updatedList });
                            } else {
                              console.log('Error saving brand.');
                            }
                          } catch (err) {
                            console.error('Error:', err);
                          }
                        }}
                        formatCreateLabel={(inputValue) => `+ Add "${inputValue}"`}
                        className="border-2 border-[#BF9853] border-opacity-25 rounded-lg lg:w-[230px] w-64 text-left"
                        styles={customSelectStyles}
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-400 text-[15px]">Type/Color <span className="text-red-500">*</span></label>
                      <CreatableSelect
                        options={typeColorOptions}
                        isClearable={true}
                        value={item.typeColor ? { value: item.typeColor, label: item.typeColor } : null}
                        onChange={(selectedOption) => {
                          const updatedList = [...poItemList.otherPOEntityList];
                          updatedList[index].typeColor = selectedOption ? selectedOption.value : '';
                          setPoItemList({ ...poItemList, otherPOEntityList: updatedList });
                        }}
                        onCreateOption={async (inputValue) => {
                          const newTypeColor = {
                            typeColor: inputValue,
                            category: poItemList.category || null,
                          };

                          try {
                            const response = await fetch('https://backendaab.in/aabuildersDash/api/po_type/save', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(newTypeColor),
                            });

                            if (response.ok) {
                              await fetchPoType();
                              const newOption = { value: inputValue, label: inputValue };
                              setTypeColorOptions((prev) => [...prev, newOption]);

                              const updatedList = [...poItemList.otherPOEntityList];
                              updatedList[index].typeColor = inputValue;
                              setPoItemList({ ...poItemList, otherPOEntityList: updatedList });
                            } else {
                              console.log('Error saving type/color.');
                            }
                          } catch (err) {
                            console.error('Error:', err);
                          }
                        }}
                        formatCreateLabel={(inputValue) => `+ Add "${inputValue}"`}
                        className="border-2 border-[#BF9853] border-opacity-25 rounded-lg lg:w-[230px] w-64 text-left"
                        styles={customSelectStyles}
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-400 text-[15px]">Min Qty <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="w-28 border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none no-spinner"
                        value={item.minimumQty}
                        onChange={(e) => {
                          const updatedList = [...poItemList.otherPOEntityList];
                          updatedList[index].minimumQty = parseInt(e.target.value, 10) || '';
                          setPoItemList({ ...poItemList, otherPOEntityList: updatedList });
                        }}
                        onWheel={(e) => e.target.blur()}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <label className="block font-medium text-gray-400 text-[15px]">Default Qty <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          className="w-28 border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none no-spinner"
                          value={item.defaultQty}
                          onChange={(e) => {
                            const updatedList = [...poItemList.otherPOEntityList];
                            updatedList[index].defaultQty = parseInt(e.target.value, 10) || '';
                            setPoItemList({ ...poItemList, otherPOEntityList: updatedList });
                          }}
                          onWheel={(e) => e.target.blur()}
                        />
                      </div>
                      {/* ❌ Remove button */}
                      {poItemList.otherPOEntityList.length > 1 && (
                        <button
                          onClick={() => {
                            const updatedList = poItemList.otherPOEntityList.filter((_, i) => i !== index);
                            setPoItemList({ ...poItemList, otherPOEntityList: updatedList });
                          }}
                          className="text-red-500 text-[25px] font-bold mt-6"
                          title="Remove this row"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setPoItemList((prev) => ({
                    ...prev,
                    otherPOEntityList: [
                      ...prev.otherPOEntityList,
                      {
                        modelName: '',
                        brandName: '',
                        typeColor: '',
                        minimumQty: '',
                        defaultQty: '',
                      },
                    ],
                  }));
                }}
                className="text-[#BF9853] font-semibold mt-2"
              >
                + Add on
              </button>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="border border-[#BF9853] text-[#BF9853] px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={handleSubmit}
                className="bg-[#BF9853] text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isSiteInchargeAddPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-md w-[1050px] shadow-lg text-left p-6">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <button onClick={() => setIsSiteInchargeAddPopupOpen(false)} className="text-red-500 text-[30px] font-bold">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-400 text-[15px]">Site Incharge <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={siteInchargeWithSite.siteEngineer}
                  onChange={(e) => setSiteInchargeWithSite({ ...siteInchargeWithSite, siteEngineer: e.target.value })}
                  className="w-full border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                  placeholder="Test item"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-400 text-[15px]">Mobile Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={siteInchargeWithSite.mobileNumber}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, ''); // remove non-digits
                    setSiteInchargeWithSite({ ...siteInchargeWithSite, mobileNumber: numericValue });
                  }}
                  className="w-full border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                  placeholder="Enter mobile number"
                />
              </div>
              {siteInchargeWithSite.sites.map((item, index) => (
                <div key={index} className="flex flex-wrap gap-4 items-end mb-2">
                  <div>
                    <label className="block font-medium text-gray-400 text-[15px]">Site Name <span className="text-red-500">*</span></label>
                    <Select
                      options={siteOptions}
                      isClearable={true}
                      value={
                        item.siteName
                          ? siteOptions.find((opt) => opt.value === item.siteName) || null
                          : null
                      }
                      onChange={(selectedOption) => {
                        const updatedList = [...siteInchargeWithSite.sites];
                        updatedList[index].siteName = selectedOption ? selectedOption.value : "";
                        updatedList[index].siteNo = selectedOption ? selectedOption.sNo : "";
                        setSiteInchargeWithSite({
                          ...siteInchargeWithSite,
                          sites: updatedList,
                        });
                      }}
                      styles={{
                        container: (base) => ({ ...base, width: 230 }),
                      }}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-400 text-[15px]">Site No</label>
                    <input
                      type="text"
                      className="w-28 border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                      value={item.siteNo}
                      readOnly
                    />
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={item.siteStatus}
                      onChange={(e) => {
                        const updatedList = [...siteInchargeWithSite.sites];
                        updatedList[index].siteStatus = e.target.checked;
                        setSiteInchargeWithSite({ ...siteInchargeWithSite, sites: updatedList });
                      }}
                      className="custom-checkbox cursor-pointer appearance-none w-4 h-4 mt-3 -ml-1 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-400 text-[15px]">Branch <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-28 border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none no-spinner"
                      value={item.branch}
                      onChange={(e) => {
                        const updatedList = [...siteInchargeWithSite.sites];
                        updatedList[index].branch = (e.target.value) || '';
                        setSiteInchargeWithSite({ ...siteInchargeWithSite, sites: updatedList });
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {siteInchargeWithSite.sites.length > 1 && (
                      <button
                        onClick={() => {
                          const updatedList = siteInchargeWithSite.sites.filter((_, i) => i !== index);
                          setSiteInchargeWithSite({ ...siteInchargeWithSite, sites: updatedList });
                        }}
                        className="text-red-500 text-[25px] font-bold mt-6"
                        title="Remove this row"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  setSiteInchargeWithSite((prev) => ({
                    ...prev,
                    sites: [
                      ...prev.sites,
                      {
                        siteName: '',
                        siteNo: '',
                        siteStatus: '',
                        branch: '',
                      },
                    ],
                  }));
                }}
                className="text-[#BF9853] font-semibold mt-2"
              >
                + Add on
              </button>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setIsSiteInchargeAddPopupOpen(false)}
                className="border border-[#BF9853] text-[#BF9853] px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={handleSubmitSiteIncharge}
                className="bg-[#BF9853] text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isSiteInchargeEditPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-md w-[1050px] shadow-lg text-left p-6">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <button onClick={() => setIsSiteInchargeEditPopupOpen(false)} className="text-red-500 text-[30px] font-bold">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-400 text-[15px]">Site Incharge <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editSiteInchargeWithSite.siteEngineer}
                  onChange={(e) => setEditSiteInchargeWithSite({ ...editSiteInchargeWithSite, siteEngineer: e.target.value })}
                  className="w-full border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                  placeholder="Test item"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-400 text-[15px]">Mobile Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editSiteInchargeWithSite.mobileNumber}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, ''); // remove non-digits
                    setEditSiteInchargeWithSite({ ...editSiteInchargeWithSite, mobileNumber: numericValue });
                  }}
                  className="w-full border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                  placeholder="Enter mobile number"
                />
              </div>
              {editSiteInchargeWithSite.sites.map((item, index) => (
                <div key={index} className="flex flex-wrap gap-4 items-end mb-2">
                  <div>
                    <label className="block font-medium text-gray-400 text-[15px]">Site Name <span className="text-red-500">*</span></label>
                    <Select
                      options={siteOptions}
                      isClearable={true}
                      value={
                        item.siteName
                          ? siteOptions.find((opt) => opt.value === item.siteName) || null
                          : null
                      }
                      onChange={(selectedOption) => {
                        const updatedList = [...editSiteInchargeWithSite.sites];
                        updatedList[index].siteName = selectedOption ? selectedOption.value : "";
                        updatedList[index].siteNo = selectedOption ? selectedOption.sNo : "";
                        setEditSiteInchargeWithSite({
                          ...editSiteInchargeWithSite,
                          sites: updatedList,
                        });
                      }}
                      styles={{
                        container: (base) => ({ ...base, width: 230 }),
                      }}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-400 text-[15px]">Site No</label>
                    <input
                      type="text"
                      className="w-28 border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                      value={item.siteNo}
                      readOnly
                    />
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={item.siteStatus}
                      onChange={(e) => {
                        const updatedList = [...editSiteInchargeWithSite.sites];
                        updatedList[index].siteStatus = e.target.checked;
                        setEditSiteInchargeWithSite({ ...editSiteInchargeWithSite, sites: updatedList });
                      }}
                      className="custom-checkbox cursor-pointer appearance-none w-4 h-4 mt-3 -ml-1 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-400 text-[15px]">Branch <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-28 border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none no-spinner"
                      value={item.branch}
                      onChange={(e) => {
                        const updatedList = [...editSiteInchargeWithSite.sites];
                        updatedList[index].branch = (e.target.value) || '';
                        setEditSiteInchargeWithSite({ ...editSiteInchargeWithSite, sites: updatedList });
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {editSiteInchargeWithSite.sites.length > 1 && (
                      <button
                        onClick={() => {
                          const updatedList = editSiteInchargeWithSite.sites.filter((_, i) => i !== index);
                          setEditSiteInchargeWithSite({ ...editSiteInchargeWithSite, sites: updatedList });
                        }}
                        className="text-red-500 text-[25px] font-bold mt-6"
                        title="Remove this row"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  setEditSiteInchargeWithSite((prev) => ({
                    ...prev,
                    sites: [
                      ...prev.sites,
                      {
                        siteName: '',
                        siteNo: '',
                        siteStatus: '',
                        branch: '',
                      },
                    ],
                  }));
                }}
                className="text-[#BF9853] font-semibold mt-2"
              >
                + Add on
              </button>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setIsSiteInchargeEditPopupOpen(false)}
                className="border border-[#BF9853] text-[#BF9853] px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={handleSubmitEditSiteIncharge}
                className="bg-[#BF9853] text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isGroupNameAddPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[500px] shadow-lg p-6 text-left">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setIsGroupNameAddPopupOpen(false)}
                className="text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            {/* Model Name Input */}
            <div className="mb-6">
              <label className="block text-[15px] font-medium text-gray-400 mb-1">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                placeholder="Enter group name"
              />
            </div>
            {/* Footer Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsGroupNameAddPopupOpen(false)}
                className="border border-[#BF9853] text-[#BF9853] px-4 py-2 rounded text-sm"
              >
                Close
              </button>
              <button
                onClick={handleSubmitGroupName}
                className="bg-[#BF9853] text-white px-4 py-2 rounded text-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isGroupNameEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[500px] shadow-lg p-6 text-left">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setIsGroupNameEditPopupOpen(false)}
                className="text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            {/* Model Name Input */}
            <div className="mb-6">
              <label className="block text-[15px] font-medium text-gray-400 mb-1">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                placeholder="Enter group name"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
              />
            </div>
            {/* Footer Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsGroupNameEditPopupOpen(false)}
                className="border border-[#BF9853] text-[#BF9853] px-4 py-2 rounded text-sm"
              >
                Close
              </button>
              <button
                className="bg-[#BF9853] text-white px-4 py-2 rounded text-sm"
                onClick={handleSubmitEditGroupName}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isItemNameEditPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-md w-[1150px] shadow-lg text-left p-6">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <button onClick={() => setIsItemNameEditPopupOpen(false)} className="text-red-500 text-[30px] font-bold">×</button>
            </div>
            {/* Modal Form */}
            <div className="space-y-4">
              <div className='flex gap-3'>
                <div className="text-left mt-2">
                  <label className="block font-medium text-gray-400 text-[15px]">Category</label>
                  <Select
                    value={categoryOptions.find(opt => opt.value === poEditItemList.category) || null}
                    onChange={(selectedOption) =>
                      setPoEditItemList({ ...poEditItemList, category: selectedOption ? selectedOption.value : '' })
                    }
                    options={categoryOptions}
                    placeholder="Select Category..."
                    className="border-2 border-[#BF9853] border-opacity-25 rounded-lg lg:w-[495px] w-64 text-left"
                    styles={customSelectStyles}
                    isClearable
                  />
                </div>
                <div className="text-left mt-1.5">
                  <label className="block font-medium text-gray-400 text-[15px]">Group Name </label>
                  <Select
                    options={groupNameOptions}
                    value={groupNameOptions.find(opt => opt.value === poEditItemList.groupName) || null}
                    onChange={(selectedOption) =>
                      setPoEditItemList({ ...poEditItemList, groupName: selectedOption ? selectedOption.value : "", })
                    }
                    placeholder="Group Name..."
                    isSearchable
                    isClearable
                    className="lg:w-[485px] w-64 border-2 border-[#BF9853] border-opacity-25 rounded-lg"
                    styles={customSelectStyles}
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-400 text-[15px]">Item Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={poEditItemList.itemName}
                  onChange={(e) => setPoEditItemList({ ...poEditItemList, itemName: e.target.value })}
                  className="w-full border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                  placeholder="Test item"
                />
              </div>
              <div className="w-[1120px] overflow-x-hidden h-[300px] overflow-y-auto ">
                {poEditItemList.otherPOEntityList.map((item, index) => (
                  <div key={index} className="flex flex-wrap gap-4 items-end mb-2">
                    <div>
                      <label className="block font-medium text-gray-400 text-[15px]">Model Name <span className="text-red-500">*</span></label>
                      <Select
                        options={modelOptions}
                        isClearable={true}
                        value={item.modelName ? { value: item.modelName, label: item.modelName } : null}
                        onChange={(selectedOption) => {
                          const updatedList = [...poEditItemList.otherPOEntityList];
                          updatedList[index].modelName = selectedOption ? selectedOption.value : '';
                          setPoEditItemList({ ...poEditItemList, otherPOEntityList: updatedList });
                        }}
                        styles={{
                          container: (base) => ({ ...base, width: 320 }),
                        }}
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-400 text-[15px]">Brand Name <span className="text-red-500">*</span></label>
                      <Select
                        options={brandOptions}
                        isClearable={true}
                        value={item.brandName ? { value: item.brandName, label: item.brandName } : null}
                        onChange={(selectedOption) => {
                          const updatedList = [...poEditItemList.otherPOEntityList];
                          updatedList[index].brandName = selectedOption ? selectedOption.value : '';
                          setPoEditItemList({ ...poEditItemList, otherPOEntityList: updatedList });
                        }}
                        styles={{
                          container: (base) => ({ ...base, width: 230 }),
                        }}
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-400 text-[15px]">Type/Color <span className="text-red-500">*</span></label>
                      <Select
                        options={typeColorOptions}
                        isClearable={true}
                        value={item.typeColor ? { value: item.typeColor, label: item.typeColor } : null}
                        onChange={(selectedOption) => {
                          const updatedList = [...poEditItemList.otherPOEntityList];
                          updatedList[index].typeColor = selectedOption ? selectedOption.value : '';
                          setPoEditItemList({ ...poEditItemList, otherPOEntityList: updatedList });
                        }}
                        styles={{
                          container: (base) => ({ ...base, width: 230 }),
                        }}
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-400 text-[15px]">Min Qty <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="w-28 border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none no-spinner"
                        value={item.minimumQty}
                        onChange={(e) => {
                          const updatedList = [...poEditItemList.otherPOEntityList];
                          updatedList[index].minimumQty = parseInt(e.target.value, 10) || '';
                          setPoEditItemList({ ...poEditItemList, otherPOEntityList: updatedList });
                        }}
                        onWheel={(e) => e.target.blur()}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <label className="block font-medium text-gray-400 text-[15px]">Default Qty <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          className="w-28 border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none no-spinner"
                          value={item.defaultQty}
                          onChange={(e) => {
                            const updatedList = [...poEditItemList.otherPOEntityList];
                            updatedList[index].defaultQty = parseInt(e.target.value, 10) || '';
                            setPoEditItemList({ ...poEditItemList, otherPOEntityList: updatedList });
                          }}
                          onWheel={(e) => e.target.blur()}
                        />
                      </div>
                      {/* ❌ Remove button */}
                      {poEditItemList.otherPOEntityList.length > 1 && (
                        <button
                          onClick={() => {
                            const updatedList = poEditItemList.otherPOEntityList.filter((_, i) => i !== index);
                            setPoEditItemList({ ...poEditItemList, otherPOEntityList: updatedList });
                          }}
                          className="text-red-500 text-[25px] font-bold mt-6"
                          title="Remove this row"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setPoEditItemList((prev) => ({
                    ...prev,
                    otherPOEntityList: [
                      ...prev.otherPOEntityList,
                      {
                        modelName: '',
                        brandName: '',
                        typeColor: '',
                        minimumQty: '',
                        defaultQty: '',
                      },
                    ],
                  }));
                }}
                className="text-[#BF9853] font-semibold mt-2"
              >
                + Add on
              </button>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setIsItemNameEditPopupOpen(false)}
                className="border border-[#BF9853] text-[#BF9853] px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={handleSubmitEditItemName}
                className="bg-[#BF9853] text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isPopupOpen1 && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[500px] shadow-lg p-6 text-left">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setIsPopupOpen1(false)}
                className="text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            {/* Model Name Input */}
            <div className="mb-6">
              <label className="block text-[15px] font-medium text-gray-400 mb-1">
                Model Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                placeholder="Enter model name"
              />
            </div>
            <div>
              <Select
                value={selectedModelCategory}
                onChange={setSelectedModelCategory}
                options={categoryOptions}
                placeholder="Select Category..."
                isClearable
                isSearchable
                className='mb-3'
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    height: '45px',
                    minHeight: '45px',
                    backgroundColor: 'transparent',
                    borderWidth: '2px',
                    borderColor: 'rgba(191, 152, 83, 0.25)', // 25% opacity
                    borderRadius: '8px',
                    boxShadow: state.isFocused
                      ? '0 0 0 1px rgba(191, 152, 83, 0.25)' // also 25% opacity
                      : 'none',
                    '&:hover': {
                      borderColor: 'rgba(191, 152, 83, 0.25)',
                    },
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: '#999',
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: 'black',
                  }),
                }}
              >

              </Select>
            </div>
            {/* Footer Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsPopupOpen1(false)}
                className="border border-[#BF9853] text-[#BF9853] px-4 py-2 rounded text-sm"
              >
                Close
              </button>
              <button
                onClick={handleSubmitModel}
                className="bg-[#BF9853] text-white px-4 py-2 rounded text-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isModelEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[500px] shadow-lg p-6 text-left">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-lg font-semibold">Edit MODEL</h2>
              <button
                onClick={() => setIsModelEditPopupOpen(false)}
                className="text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            {/* Model Name Input */}
            <div className="mb-6">
              <label className="block text-[15px] font-medium text-gray-400 mb-1">
                Model Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editModel}
                onChange={(e) => setEditModel(e.target.value)}
                className="w-full border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                placeholder="Enter model name"
              />
            </div>
            <div>
              <Select
                value={editModelCategory}
                onChange={setEditModelCategory}
                options={categoryOptions}
                placeholder="Select Category..."
                isClearable
                isSearchable
                className='mb-3'
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    height: '45px',
                    minHeight: '45px',
                    backgroundColor: 'transparent',
                    borderWidth: '2px',
                    borderColor: 'rgba(191, 152, 83, 0.25)', // 25% opacity
                    borderRadius: '8px',
                    boxShadow: state.isFocused
                      ? '0 0 0 1px rgba(191, 152, 83, 0.25)' // also 25% opacity
                      : 'none',
                    '&:hover': {
                      borderColor: 'rgba(191, 152, 83, 0.25)',
                    },
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: '#999',
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: 'black',
                  }),
                }}
              >

              </Select>
            </div>
            {/* Footer Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModelEditPopupOpen(false)}
                className="border border-[#BF9853] text-[#BF9853] px-4 py-2 rounded text-sm"
              >
                Close
              </button>
              <button
                onClick={handleSubmitEditModel}
                className="bg-[#BF9853] text-white px-4 py-2 rounded text-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isPopupOpen2 && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[500px] shadow-lg p-6 text-left">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setIsPopupOpen2(false)}
                className="text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            {/* Brand Name Input */}
            <div className="mb-6">
              <label className="block text-[15px] font-medium text-gray-400 mb-1">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                placeholder="Enter brand name"
              />
            </div>
            <div>
              <Select
                value={selectedBrandcategory}
                onChange={setSelectedBrandCategory}
                options={categoryOptions}
                placeholder="Select Category..."
                isClearable
                isSearchable
                className='mb-3'
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    height: '45px',
                    minHeight: '45px',
                    backgroundColor: 'transparent',
                    borderWidth: '2px',
                    borderColor: 'rgba(191, 152, 83, 0.25)', // 25% opacity
                    borderRadius: '8px',
                    boxShadow: state.isFocused
                      ? '0 0 0 1px rgba(191, 152, 83, 0.25)' // also 25% opacity
                      : 'none',
                    '&:hover': {
                      borderColor: 'rgba(191, 152, 83, 0.25)',
                    },
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: '#999',
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: 'black',
                  }),
                }}
              >
              </Select>
            </div>
            {/* Footer Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsPopupOpen2(false)}
                className="border border-[#BF9853] text-[#BF9853] px-4 py-2 rounded text-sm"
              >
                Close
              </button>
              <button
                onClick={handleSubmitBrand}
                className="bg-[#BF9853] text-white px-4 py-2 rounded text-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isBrandEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[500px] shadow-lg p-6 text-left">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-lg font-semibold">Edit BRAND</h2>
              <button
                onClick={() => setIsBrandEditPopupOpen(false)}
                className="text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            {/* Brand Name Input */}
            <div className="mb-6">
              <label className="block text-[15px] font-medium text-gray-400 mb-1">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editBrand}
                onChange={(e) => setEditBrand(e.target.value)}
                className="w-full border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                placeholder="Enter brand name"
              />
            </div>
            <Select
              value={editBrandCategory}
              onChange={setEditBrandCategory}
              options={categoryOptions}
              placeholder="Select Category..."
              isClearable
              isSearchable
              className='mb-3'
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  height: '45px',
                  minHeight: '45px',
                  backgroundColor: 'transparent',
                  borderWidth: '2px',
                  borderColor: 'rgba(191, 152, 83, 0.25)', // 25% opacity
                  borderRadius: '8px',
                  boxShadow: state.isFocused
                    ? '0 0 0 1px rgba(191, 152, 83, 0.25)' // also 25% opacity
                    : 'none',
                  '&:hover': {
                    borderColor: 'rgba(191, 152, 83, 0.25)',
                  },
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: '#999',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'black',
                }),
              }}
            >
            </Select>
            {/* Footer Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsBrandEditPopupOpen(false)}
                className="border border-[#BF9853] text-[#BF9853] px-4 py-2 rounded text-sm"
              >
                Close
              </button>
              <button
                onClick={handleSubmitEditBrand}
                className="bg-[#BF9853] text-white px-4 py-2 rounded text-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isPopupOpen3 && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[500px] shadow-lg p-6 text-left">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setIsPopupOpen3(false)}
                className="text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            {/* Type Input Field */}
            <div className="mb-6">
              <label className="block text-[15px] font-medium text-gray-400 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={typeColor}
                onChange={(e) => setTypeColor(e.target.value)}
                className="w-full border-2 border-[#BF9853] border-opacity-25 p-2 rounded"
                placeholder="Enter type name"
              />
            </div>
            <Select
              value={selectedTypeCategory}
              onChange={setSelectedTypeCategory}
              options={categoryOptions}
              placeholder="Select Category..."
              isClearable
              isSearchable
              className='mb-3'
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  height: '45px',
                  minHeight: '45px',
                  backgroundColor: 'transparent',
                  borderWidth: '2px',
                  borderColor: 'rgba(191, 152, 83, 0.25)', // 25% opacity
                  borderRadius: '8px',
                  boxShadow: state.isFocused
                    ? '0 0 0 1px rgba(191, 152, 83, 0.25)' // also 25% opacity
                    : 'none',
                  '&:hover': {
                    borderColor: 'rgba(191, 152, 83, 0.25)',
                  },
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: '#999',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'black',
                }),
              }}
            >
            </Select>
            {/* Footer */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsPopupOpen3(false)}
                className="border border-[#BF9853] text-[#BF9853] px-4 py-2 rounded text-sm"
              >
                Close
              </button>
              <button
                onClick={handleSubmitType}
                className="bg-[#BF9853] text-white px-4 py-2 rounded text-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {isTypeEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[500px] shadow-lg p-6 text-left">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-lg font-semibold">Edit TYPE</h2>
              <button
                onClick={() => setIsTypeEditPopupOpen(false)}
                className="text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>
            {/* Type Input Field */}
            <div className="mb-6">
              <label className="block text-[15px] font-medium text-gray-400 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editTypeColor}
                onChange={(e) => setEditTypeColor(e.target.value)}
                className="w-full border-2 border-[#BF9853] border-opacity-25 p-2 rounded focus:outline-none"
                placeholder="Enter type name"
              />
            </div>
            <Select
              value={editTypeCategory}
              onChange={setEditTypeCategory}
              options={categoryOptions}
              placeholder="Select Category..."
              isClearable
              isSearchable
              className='mb-3'
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  height: '45px',
                  minHeight: '45px',
                  backgroundColor: 'transparent',
                  borderWidth: '2px',
                  borderColor: 'rgba(191, 152, 83, 0.25)', // 25% opacity
                  borderRadius: '8px',
                  boxShadow: state.isFocused
                    ? '0 0 0 1px rgba(191, 152, 83, 0.25)' // also 25% opacity
                    : 'none',
                  '&:hover': {
                    borderColor: 'rgba(191, 152, 83, 0.25)',
                  },
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: '#999',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'black',
                }),
              }}
            >
            </Select>
            {/* Footer */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsTypeEditPopupOpen(false)}
                className="border border-[#BF9853] text-[#BF9853] px-4 py-2 rounded text-sm"
              >
                Close
              </button>
              <button
                onClick={handleSubmitEditType}
                className="bg-[#BF9853] text-white px-4 py-2 rounded text-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {mappedCategoryAddPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[350px] max-h-[80vh] overflow-y-auto shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Select Categories</h2>
            <div className="max-h-60 overflow-y-auto mb-4">
              {categoryOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option.label)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOptions([...selectedOptions, option.label]);
                      } else {
                        setSelectedOptions(selectedOptions.filter(o => o !== option.label));
                      }
                    }}
                  />
                  <label>{option.label}</label>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#BF9853] text-white rounded-md text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setMappedCategoryAddPopup(false)}
                className="px-4 py-2 bg-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ModalModelList
        isOpen={isModelUploadOpens}
        onClose={closeModelUpload}
        onFileChange={handleFileChange}
        onUpload={handleUploadModel}
      />
      <ModalBrandList
        isOpen={isBrandUploadOpens}
        onClose={closeBrandUpload}
        onFileChange={handleFileChange}
        onUpload={handleUploadBrand}
      />
      <ModalTypeList
        isOpen={isTypeUploadOpens}
        onClose={closeTypeUpload}
        onFileChange={handleFileChange}
        onUpload={handleUploadType}
      />
      <ModalItemName
        isOpen={isItemNameUploadOpens}
        onClose={closeItemNameUpload}
        onFileChange={handleFileChange}
        onUpload={handleUploadItemName}
      />
    </div>
  )
}
export default PurchaseInputData;
function ModalItemName({ isOpen, onClose, onFileChange, onUpload }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg text-center w-96 shadow-lg">
        <h2 className="mb-4 text-xl text-gray-800">Upload Bulk Data</h2>
        <div className="mb-5">
          <input
            type="file"
            onChange={onFileChange}
            accept=".csv, .sql"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          />
          <div className="flex justify-between">
            <button
              onClick={onUpload}
              className="px-8 py-2 bg-[#BF9853] text-white rounded-lg cursor-pointer  transition-colors"
            >
              Upload
            </button>
            <button
              onClick={onClose}
              className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function ModalModelList({ isOpen, onClose, onFileChange, onUpload }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg text-center w-96 shadow-lg">
        <h2 className="mb-4 text-xl text-gray-800">Upload Bulk Data</h2>
        <div className="mb-5">
          <input
            type="file"
            onChange={onFileChange}
            accept=".csv, .sql"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          />
          <div className="flex justify-between">
            <button
              onClick={onUpload}
              className="px-8 py-2 bg-[#BF9853] text-white rounded-lg cursor-pointer  transition-colors"
            >
              Upload
            </button>
            <button
              onClick={onClose}
              className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function ModalBrandList({ isOpen, onClose, onFileChange, onUpload }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg text-center w-96 shadow-lg">
        <h2 className="mb-4 text-xl text-gray-800">Upload Bulk Data</h2>
        <div className="mb-5">
          <input
            type="file"
            onChange={onFileChange}
            accept=".csv, .sql"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          />
          <div className="flex justify-between">
            <button
              onClick={onUpload}
              className="px-8 py-2 bg-[#BF9853] text-white rounded-lg cursor-pointer  transition-colors"
            >
              Upload
            </button>
            <button
              onClick={onClose}
              className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function ModalTypeList({ isOpen, onClose, onFileChange, onUpload }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg text-center w-96 shadow-lg">
        <h2 className="mb-4 text-xl text-gray-800">Upload Bulk Data</h2>
        <div className="mb-5">
          <input
            type="file"
            onChange={onFileChange}
            accept=".csv, .sql"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          />
          <div className="flex justify-between">
            <button
              onClick={onUpload}
              className="px-8 py-2 bg-[#BF9853] text-white rounded-lg cursor-pointer  transition-colors"
            >
              Upload
            </button>
            <button
              onClick={onClose}
              className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}