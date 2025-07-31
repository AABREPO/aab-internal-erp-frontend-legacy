import React, { useState, useEffect } from 'react';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import cross from '../Images/cross.png';
import download from '../Images/Download.svg';
import edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';
import attach from '../Images/Attachfile.svg';
const TileNameModal = ({ isOpen, onClose, imageSrc, tileName }) => {
  if (!isOpen) return null;
  const handleOutsideClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      onClick={handleOutsideClick}
    >
      <div>
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold text-center mb-4 text-white -py-2">{tileName}</h2>
          <a
            href={imageSrc}
            download={tileName}
          >
            <img src={download} alt='download' className='w-8 h-8 ' />
          </a>
        </div>
        <div className="flex items-center justify-center">
          <img
            src={imageSrc}
            alt="Tile"
            className="max-w-full h-80 mb-4 object-contain"
          />
        </div>
      </div>
    </div>
  );
};
const DTableView = () => {
  const [selectedTileName, setSelectedTileName] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAreaNameOpen, setIsAreaNameOpen] = useState(false);
  const [isTileVendorsOpen, setIsTileVendorsOpen] = useState(false);
  const [isSiteNamesOpen, setIsSiteNamesOpen] = useState(false);
  const [isFloorNameOpen, setIsFloorNameOpen] = useState(false);
  const [isFloorTypeOpen, setIsFloorTypeOpen] = useState(false);
  const [isTileSizeOpen, setIsTileSizeOpen] = useState(false);
  const closeTileSize = () => setIsTileSizeOpen(false);
  const openTileSize = () => setIsTileSizeOpen(true);
  const closeFloorType = () => setIsFloorTypeOpen(false);
  const openFloorType = () => setIsFloorTypeOpen(true);
  const openFloorName = () => setIsFloorNameOpen(true);
  const closeFloorName = () => setIsFloorNameOpen(false);
  const openAreaName = () => setIsAreaNameOpen(true);
  const closeAreaName = () => setIsAreaNameOpen(false);
  const openTileVendors = () => setIsTileVendorsOpen(true);
  const closeTileVendors = () => setIsTileVendorsOpen(false);
  const openSiteNames = () => setIsSiteNamesOpen(true);
  const closeSiteNames = () => setIsSiteNamesOpen(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [file, setFile] = useState(null);
  const [areaSearch, setAreaSearch] = useState("");
  const [tileVendorSearch, setTileVendorSearch] = useState("");
  const [siteNameSearch, setSiteNameSearch] = useState("");
  const [vendorNameSearch, setVendorNameSearch] = useState("");
  const [contractorNameSearch, setContractorNameSearch] = useState("");
  const [expensesCategorySearch, setExpensesCategorySearch] = useState("");
  const [sizeSearch, setSizeSearch] = useState('');
  const [tileName, setTileName] = useState('');
  const [tileSize, setTileSize] = useState('');
  const [floorSearch, setFloorSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('');
  const [areaName, setAreaName] = useState('');
  const [tileVendor, setVendors] = useState('');
  const [siteName, setSiteName] = useState('');
  const [siteNo, setSiteNo] = useState('');
  const [floorName, setFloorName] = useState('');
  const [floorType, setFloorType] = useState('');
  const [formula, setFormula] = useState('');
  const [tileAreaNames, setTileAreaNames] = useState([]);
  const [tileVendors, setTileVendors] = useState([]);
  const [siteNames, setSiteNames] = useState([]);
  const [vendorNames, setVendorNames] = useState([]);
  const [contractorNames, setContractorNames] = useState([]);
  const [expensesCategory, setExpensesCategory] = useState([]);
  const [tileFloorNames, setTileFloorNames] = useState([]);
  const [tileToDelete, setTileToDelete] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tileData, setTileData] = useState({
    tileSize: '',
    quantityBox: '',
    areaTile: ''
  });
  const [isAreaModalOpens, setIsAreaModalOpens] = useState(false);
  const [isTileVendorModalOpens, setIsTileVendorModalOpems] = useState(false);
  const [isSiteNamesModelOpens, setIsSiteNamesModelOpens] = useState(false);
  const [isVendorNameModelOpens, setIsVendorNameModelOpens] = useState(false);
  const [isContractorNameModelOpens, setIsContractorNameModelOpens] = useState(false);
  const [isCategoryModelOpens, setIsCategoryModelOpens] = useState(false);
  const [tileList, setTileList] = useState([]);
  const [tileFloorTypes, setTileFloorTypes] = useState([]);
  const [tiles, setTiles] = useState([]);
  const [isTileNameModalOpen, setIsTileNameModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [message, setMessage] = useState('');
  console.log(message);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [areaEdit, setAreaEdit] = useState(null);
  const [tileVendorEdit, setTileVendorEdit] = useState(null);
  const [editTileData, setEditTileData] = useState({
    id: '',
    tileName: '',
    tileSize: '',
    image: null,
  });
  const [isTileEditSizeOpen, setIsTileEditSizeOpen] = useState(false);
  const [currentTileSize, setCurrentTileSize] = useState(null);
  const [isEditFloorOpen, setIsEditFloorOpen] = useState(false);
  const [editFloorName, setEditFloorName] = useState('');
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [isEditFloorTypeOpen, setIsEditFloorTypeOpen] = useState(false);
  const [editFloorType, setEditFloorType] = useState('');
  const [editFormula, setEditFormula] = useState('');
  const [selectedFloorTypeId, setSelectedFloorTypeId] = useState(null);
  const [isSizeModalOpens, setIsSizeModalOpens] = useState(false);
  const [isFloorNameOpens, setIsFloorNameOpens] = useState(false);
  const [isFloorTypeOpens, setIsFloorTypeOpens] = useState(false);
  const [isTileNameAndImageOpens, setIsTileNameAndImageOpens] = useState(false);
  const openEditFloorTypePopup = (floorType) => {
    setEditFloorType(floorType.floorType);
    setEditFormula(floorType.formula);
    setSelectedFloorTypeId(floorType.id);
    setIsEditFloorTypeOpen(true);
  };
  const openAreaModals = () => setIsAreaModalOpens(true);
  const openTileVendorModals = () => setIsTileVendorModalOpems(true);
  const openSiteNamesModals = () => setIsSiteNamesModelOpens(true);
  const openVendorNamesModals = () => setIsVendorNameModelOpens(true);
  const openContractorNamesModals = () => setIsContractorNameModelOpens(true);
  const openCategoryModels = () => setIsCategoryModelOpens(true);
  const openSizeModals = () => setIsSizeModalOpens(true);
  const openFloorNameModals = () => setIsFloorNameOpens(true);
  const openFloorTypeModals = () => setIsFloorTypeOpens(true);
  const openTileNameAndImageModals = () => setIsTileNameAndImageOpens(true);
  const closeAreaModals = () => setIsAreaModalOpens(false);
  const closeTileVendorModals = () => setIsTileVendorModalOpems(false);
  const closeSiteNamesModals = () => setIsSiteNamesModelOpens(false);
  const closeVendorNamesModals = () => setIsVendorNameModelOpens(false);
  const closeContractorNamesModals = () => setIsContractorNameModelOpens(false);
  const closeCategoryModels = () => setIsCategoryModelOpens(false);
  const closeSizeModals = () => setIsSizeModalOpens(false);
  const closeFloorNameModals = () => setIsFloorNameOpens(false);
  const closeFloorTypeModals = () => setIsFloorTypeOpens(false);
  const closeTileNameAndImageModals = () => setIsTileNameAndImageOpens(false);
  const closeEditFloorTypePopup = () => {
    setIsEditFloorTypeOpen(false);
    setEditFloorType('');
    setSelectedFloorTypeId(null);
  };
  const handleEditFloorTypeSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/typeFloor/${selectedFloorTypeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ floorType: editFloorType, formula: editFormula }),
      });
      if (response.ok) {
        closeEditFloorTypePopup();
        window.location.reload();
      } else {
        console.error('Failed to update floor type');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const deleteFloorType = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/typeFloor/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTileFloorTypes(tileFloorTypes.filter(type => type.id !== id));
      } else {
        console.error("Failed to delete floor type. Status:", response.status);
        alert("Error deleting the floor type. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the floor type.");
    }
  };
  const openEditFloorPopup = (floor) => {
    setEditFloorName(floor.floorName);
    setSelectedFloorId(floor.id);
    setIsEditFloorOpen(true);
  };
  const closeEditFloorPopup = () => {
    setIsEditFloorOpen(false);
    setEditFloorName('');
    setSelectedFloorId(null);
  };
  const handleUploadTileNameAndImage = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/tiles/tileNameBulkUpload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const result = await response.text();
        alert(result);
      } else {
        alert("File upload failed with status: " + response.status);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed!");
    }
  };
  const handleUploadAreaName = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/tile/bulkUpload", {
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
  const handleUploadTileVendor = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/tile/vendor/bulkUpload", {
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
  const handleUploadSiteNames = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/bulk_upload", {
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
  const handleUploadVendorNames = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/bulk_upload", {
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
  const handleUploadContractorNames = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/bulk_upload", {
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
  const handleUploadcategory = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/expenses_categories/bulk_upload", {
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
  const handleUploadSize = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/tile/sizeBulkUpload", {
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
  const handleUploadFloorName = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/tile/floorNameBulkUpload", {
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
  const handleUploadFloorType = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/tile/bulkUploadType", {
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
  const handleEditFloorName = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/nameFloor/${selectedFloorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ floorName: editFloorName }),
      });
      if (response.ok) {
        closeEditFloorPopup();
        window.location.reload();
      } else {
        console.error('Failed to update floor name');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const deleteFloor = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/nameFloor/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTileFloorNames(tileFloorNames.filter(floor => floor.id !== id));
      } else {
        console.error("Failed to delete floor. Status:", response.status);
        alert("Error deleting the floor. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the floor.");
    }
  };
  const deleteTileSizeAndQuantity = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/size/quantity/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTileList(tileList.filter(item => item.id !== id));
      } else {
        console.error("Failed to delete tile size and quantity. Status:", response.status);
        alert("Error deleting the tile size and quantity. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the tile size and quantity.");
    }
  };
  const deleteAllTileSizeAndQuantity = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all area names?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/tile/size/quantity/all", {
          method: "DELETE",
        });
        if (response.ok) {
          setTileList([]);
          alert("All area names have been deleted successfully.");
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
  }
  const openTileEditSize = (item) => {
    setCurrentTileSize(item);
    setIsTileEditSizeOpen(true);
  };
  const closeTileEditSize = () => {
    setIsTileEditSizeOpen(false);
    setCurrentTileSize(null);
  };
  const handleChangeTileEditSize = (e) => {
    const { name, value } = e.target;
    setCurrentTileSize((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmitTileEditSize = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/size/quantity/${currentTileSize.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentTileSize),
      });
      if (response.ok) {
        console.log('Tile size updated successfully');
        window.location.reload();
      } else {
        console.error('Error updating tile size');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      closeTileSize();
    }
  };
  const handleAreaEdit = (item) => {
    setAreaEdit(item);
  };
  const handleTileVendorEdit = (item) => {
    setTileVendorEdit(item);
  }
  const handleAreaDelete = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/nameArea/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTileAreaNames(tileAreaNames.filter(item => item.id !== id));
      } else {
        console.error("Failed to delete the area name. Status:", response.status);
        alert("Error deleting the area name. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the area name.");
    }
  };
  const handleTileVendorDelete = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/vendor/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTileVendors(tileVendors.filter(item => item.id !== id));
      } else {
        console.error("Failed to delete the area name. Status:", response.status);
        alert("Error deleting the area name. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the area name.");
    }
  };
  const handleAllAreaDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all area names?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/tile/nameArea/all", {
          method: "DELETE",
        });
        if (response.ok) {
          setTileAreaNames([]);
          alert("All area names have been deleted successfully.");
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
  const handleAllTileVendorDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all vendors?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/tile/vendor/delete/all", {
          method: "DELETE",
        });
        if (response.ok) {
          setTileVendors([]);
          alert("All area names have been deleted successfully.");
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
  const handleAllSiteNameDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all Site Names?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/deleteAll", {
          method: "DELETE",
        });
        if (response.ok) {
          setSiteNames([]);
          alert("All area names have been deleted successfully.");
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
  const handleAllFloorNameDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all area names?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/tile/nameFloor/all", {
          method: "DELETE",
        });
        if (response.ok) {
          setTileFloorNames([]);
          alert("All area names have been deleted successfully.");
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
  const handleAllFloorTypeDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all area names?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/tile/nameFloorType/all", {
          method: "DELETE",
        });
        if (response.ok) {
          setTileFloorTypes([]);
          alert("All area names have been deleted successfully.");
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
  const handleAllTileNameDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all area names?");
    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/tiles/allTile", {
          method: "DELETE",
        });
        if (response.ok) {
          setTiles([]);
          alert("All area names have been deleted successfully.");
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
  const handleAreaEditSave = async () => {
    if (!areaEdit) return;
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/nameArea/${areaEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ areaName: areaEdit.areaName }),
      });
      if (response.ok) {
        setTileAreaNames(tileAreaNames.map(item => (item.id === areaEdit.id ? areaEdit : item)));
        setAreaEdit(null);
        window.location.reload();
      } else {
        console.error('Failed to update the item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };
  const handleTileVendorEditSave = async () => {
    if (!tileVendorEdit) return;
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/vendor/${tileVendorEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tileVendor: tileVendorEdit.tileVendor }),
      });
      if (response.ok) {
        setTileVendors(tileVendors.map(item => (item.id === tileVendorEdit.id ? tileVendorEdit : item)));
        setTileVendorEdit(null);
        window.location.reload();
      } else {
        console.error('Failed to update the item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };
  const openTileNameEditModal = (tile) => {
    setEditTileData({
      id: tile.id,
      tileName: tile.tileName,
      tileSize: tile.tileSize,
      image: tile.image,
    });
    setIsEditModalOpen(true);
  };
  const handleTileEditChange = (e) => {
    const { name, value } = e.target;
    setEditTileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const confirmDeleteTile = () => {
    if (tileToDelete) {
      deleteTile(tileToDelete);
      setTileToDelete(null);
    }
    setConfirmDelete(false);
  };
  const deleteTile = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this tile?");
    if (confirmed) {
      fetch(`https://backendaab.in/aabuilderDash/api/tiles/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to delete tile");
          }
          return response.text();
        })
        .then((message) => {
          setTiles((prevTiles) => prevTiles.filter((tile) => tile.id !== id));
          alert(message);
        })
        .catch((error) => {
          console.error("Error deleting tile:", error);
          alert("An error occurred while deleting the tile.");
        });
    }
  };
  const cancelDelete = () => {
    setTileToDelete(null);
    setConfirmDelete(false);
  };
  const handleTileEditSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (editTileData.tileName) {
      formData.append("tileName", editTileData.tileName);
    }
    if (editTileData.tileSize) {
      formData.append("tileSize", editTileData.tileSize);
    }
    if (editTileData.image) {
      const byteString = atob(editTileData.image);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uintArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uintArray[i] = byteString.charCodeAt(i);
      }
      const imageBlob = new Blob([uintArray], { type: "image/png" });
      const fileName = selectedFile ? selectedFile.name : 'default.png';
      formData.append("image", imageBlob, fileName);
    }
    fetch(`https://backendaab.in/aabuilderDash/api/tiles/change/${editTileData.id}`, {
      method: "PUT",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update tile data");
        }
        return response.text();
      })
      .then((message) => {
        setIsEditModalOpen(false);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error updating tile data:", error);
      });
  };
  useEffect(() => {
    fetchTileFloorTypes();
  }, []);
  const fetchTileFloorTypes = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/floorType');
      if (response.ok) {
        const data = await response.json();
        setTileFloorTypes(data);
      } else {
        setMessage('Error fetching tile floor types.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile floor types.');
    }
  };
  const handleSubmitTileFloorType = async (e) => {
    e.preventDefault();
    const newTileFloorType = { floorType, formula };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/typeFloor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTileFloorType),
      });
      if (response.ok) {
        setMessage('Floor type saved successfully!');
        setFloorType('');
        fetchTileFloorTypes();
        closeFloorType();
      } else {
        setMessage('Error saving floor type.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving floor type.');
    }
  };
  useEffect(() => {
    fetchTileAreaNames();
  }, []);
  const fetchTileAreaNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/areaName');
      if (response.ok) {
        const data = await response.json();
        setTileAreaNames(data);
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchTileVendors();
  }, []);
  const fetchTileVendors = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/vendor/getAll');
      if (response.ok) {
        const data = await response.json();
        setTileVendors(data);
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
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
    fetchVendorNames();
  }, []);
  const fetchVendorNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll');
      if (response.ok) {
        const data = await response.json();
        setVendorNames(data);
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchContractorNames();
  }, []);
  const fetchContractorNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/contractor_Names/getAll');
      if (response.ok) {
        const data = await response.json();
        setContractorNames(data);
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/expenses_categories/getAll');
      if (response.ok) {
        const data = await response.json();
        setExpensesCategory(data);
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
    }
  };
  const handleSubmitTileAreaName = async (e) => {
    e.preventDefault();
    const newTileArea = { areaName };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/nameArea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTileArea),
      });
      if (response.ok) {
        setMessage('Area name saved successfully!');
        setAreaName('');
        fetchTileAreaNames();
        closeAreaName();
      } else {
        setMessage('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving area name.');
    }
  };
  const handleSubmitTileVendor = async (e) => {
    e.preventDefault();
    const newTileVendors = { tileVendor };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/vendor/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTileVendors),
      });
      if (response.ok) {
        setMessage('Area name saved successfully!');
        setVendors('');
        fetchTileVendors();
        closeTileVendors();
      } else {
        setMessage('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving area name.');
    }
  };
  const handleSubmitSiteNames = async (e) => {
    e.preventDefault();
    const newSiteNames = { siteName, siteNo };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/project_Names/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSiteNames),
      });
      if (response.ok) {
        setMessage('Area name saved successfully!');
        setSiteName('');
        setSiteNo('');
        fetchTileVendors();
        closeTileVendors();
      } else {
        setMessage('Error saving area name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving area name.');
    }
  };
  useEffect(() => {
    fetchTileFloorNames();
  }, []);
  const fetchTileFloorNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/floorName');
      if (response.ok) {
        const data = await response.json();
        setTileFloorNames(data);
      } else {
        setMessage('Error fetching tile floor names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile floor names.');
    }
  };
  const handleSubmitTileFloorName = async (e) => {
    e.preventDefault();
    const newTileFloor = { floorName };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/nameFloor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTileFloor),
      });
      if (response.ok) {
        setMessage('Floor name saved successfully!');
        setFloorName('');
        fetchTileFloorNames();
        closeFloorName();
      } else {
        setMessage('Error saving floor name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving floor name.');
    }
  };
  const handleChangeTileSize = (e) => {
    const { name, value } = e.target;
    setTileData({
      ...tileData,
      [name]: value
    });
  };
  useEffect(() => {
    const fetchTiles = async () => {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tiles/all/data');
      const data = await response.json();
      setTiles(data);
    };
    fetchTiles();
  }, []);
  const openTileNameModal = (imageSrc, name, size) => {
    const fullTileName = size ? `${name} - ${size}` : name;
    setSelectedImage(`data:image/jpeg;base64,${imageSrc}`);
    setSelectedTileName(fullTileName);
    setIsTileNameModalOpen(true);
  };
  const closeTileNameModal = () => {
    setIsTileNameModalOpen(false);
    setSelectedImage(null);
    setSelectedTileName(null);
  };
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (upload) => {
        setEditTileData({
          ...editTileData,
          image: upload.target.result.split(',')[1],
        });
      };
      reader.readAsDataURL(file);
    }
  };
  const fetchTileData = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/quantity/size');
      const data = await response.json();
      setTileList(data);
    } catch (error) {
      console.error("Error fetching tile data:", error);
    }
  };
  useEffect(() => {
    fetchTileData();
  }, []);
  const handleSubmitTileSize = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/size/quantity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tileData)
      });
      if (response.ok) {
        fetchTileData();
        setTileData({ tileSize: '', quantityBox: '', areaTile: '' });
        closeTileSize();
      }
    } catch (error) {
      console.error("Error saving tile data:", error);
    }
  };
  const handleSubmitTileName = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('tileName', tileName);
    formData.append('tileSize', tileSize);
    formData.append('image', selectedFile);
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/tiles/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setMessage('Tile data uploaded successfully!');
        closeModal();
        window.location.reload();
      } else {
        setMessage('Error uploading tile data.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error uploading tile data.');
    }
  };
  const filteredTiles = tiles.filter((tile) => {
    const tileNameAndSize = `${tile.tileName} - ${tile.tileSize}`.toLowerCase();
    return tileNameAndSize.includes(searchTerm.toLowerCase());
  });
  const filteredAreaNames = tileAreaNames.filter((item) =>
    item.areaName.toLowerCase().includes(areaSearch.toLowerCase())
  );
  const filteredTileVendors = tileVendors.filter((item) =>
    item.tileVendor.toLowerCase().includes(tileVendorSearch.toLocaleLowerCase())
  );
  const filteredSiteNames = siteNames.filter((item) =>
    item.siteName.toLowerCase().includes(siteNameSearch.toLowerCase())
  );
  const filteredVendorNames = vendorNames.filter((item) =>
    item.vendorName.toLowerCase().includes(vendorNameSearch.toLowerCase())
  );
  const filteredContractorNames = contractorNames.filter((item) =>
    item.contractorName.toLowerCase().includes(contractorNameSearch.toLowerCase())
  );
  const filteredCategories = expensesCategory.filter((item) =>
    item.category.toLowerCase().includes(expensesCategorySearch.toLowerCase())
  );
  const filteredFloorNames = tileFloorNames.filter((item) =>
    item.floorName.toLowerCase().includes(floorSearch.toLowerCase())
  );
  const filteredTileSize = tileList.filter((item) =>
    item.tileSize.toLowerCase().includes(sizeSearch.toLowerCase())
  );
  const filteredFloorTypes = tileFloorTypes.filter((item) =>
    item.floorType.toLowerCase().includes(typeSearch.toLowerCase())
  );
  return (
    <div className="p-4 bg-white ml-6 mr-8">
      <div className="sm:grid sm:grid-cols-2 sm:gap-1 lg:flex space-x-[2%] w-full overflow-x-auto">
        <div>
          <div className="flex items-center mb-2">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-80 h-12 focus:outline-none"
              placeholder="Search Tile Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className=" text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
              onClick={openModal}>
              + Add
            </button>
          </div>
          <button onClick={openTileNameAndImageModals} className="text-[#E4572E] -mb-4 flex ">
            <img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' />
            <h1 className='mt-1.5 text-sm'>Import file</h1>
          </button>
          <button onClick={handleAllTileNameDelete}>
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 lg:ml-[23rem] ml-[15rem]' />
          </button>
          <div className="rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-96 md:w-full w-full">
                <thead className="bg-[#FAF6ED]">
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left md:w-full text-xl font-bold">Tile Name/Size</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto lg:w-96 md:w-full w-full">
                <tbody>
                  {filteredTiles.map((tile, index) => (
                    <tr key={tile.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 group flex justify-between items-center font-semibold">
                        <div className="flex flex-grow">
                          <button onClick={() => openTileNameModal(tile.image, `${tile.tileName} - ${tile.tileSize}`)} className="font-medium hover:text-[#E4572E] text-left flex">
                            {tile.tileName} - {tile.tileSize}
                          </button>
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" onClick={() => openTileNameEditModal(tile)}>
                            <img src={edit} alt="edit" className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteTile(tile.id)}>
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <TileNameModal
                isOpen={isTileNameModalOpen}
                onClose={closeTileNameModal}
                imageSrc={selectedImage}
                tileName={selectedTileName}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center mb-2 lg:mt-0 md:mt-0 sm:mt-0 mt-2">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search Room Name.."
              value={areaSearch}
              onChange={(e) => setAreaSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
              onClick={openAreaName}>
              + Add
            </button>
          </div>
          <button onClick={openAreaModals} className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
          <button onClick={handleAllAreaDelete}>
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 lg:ml-[19rem] ml-[12rem]' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-80 md:w-full w-full">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left md:w-full w-full text-xl font-bold">Room Name</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto lg:w-80 md:w-full w-full">
                <tbody>
                  {filteredAreaNames.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.areaName}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => handleAreaEdit(item)} />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleAreaDelete(item.id)} />
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
        <div>
          <div className="flex items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search Tile Size.."
              value={sizeSearch}
              onChange={(e) => setSizeSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold ml-4 px-1 border-dashed border-b-2 border-[#BF9853]"
              onClick={openTileSize}>
              + Add
            </button>
          </div>
          <button onClick={openSizeModals} className="text-[#E4572E] -mb-4 flex "><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
          <button onClick={deleteAllTileSizeAndQuantity}>
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 md:ml-[17rem] ml-[14rem]' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-72 md:w-full w-full">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left md:w-full w-full text-xl font-bold">Tile Size</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto lg:w-72 md:w-full w-full">
                <tbody>
                  {filteredTileSize.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.tileSize}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openTileEditSize(item)} />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => deleteTileSizeAndQuantity(item.id)} />
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
        <div>
          <div className="flex items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none "
              placeholder="Search Floor Name.."
              value={floorSearch}
              onChange={(e) => setFloorSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold ml-4 px-1 border-dashed border-b-2 border-[#BF9853]"
              onClick={openFloorName}>
              + Add
            </button>
          </div>
          <button onClick={openFloorNameModals} className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
          <button onClick={handleAllFloorNameDelete}>
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[15rem]' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-72 md:w-full w-full">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left w-auto text-xl font-bold">Floor Name</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto lg:w-72 md:w-full w-full">
                <tbody>
                  {filteredFloorNames.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.floorName}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button">
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => openEditFloorPopup(item)} />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => deleteFloor(item.id)} />
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
        <div>
          <div className="flex items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search Floor Type.."
              value={typeSearch}
              onChange={(e) => setTypeSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold ml-4 px-1 border-dashed border-b-2 border-[#BF9853]"
              onClick={openFloorType}>
              + Add
            </button>
          </div>
          <button onClick={openFloorTypeModals} className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
          <button onClick={handleAllFloorTypeDelete}>
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 lg:ml-[15rem] ml-[14rem]' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-72 md:w-full w-full">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left w-full text-xl font-bold">Floor Type</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto md:w-full w-full">
                <tbody>
                  {filteredFloorTypes.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.floorType}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" onClick={() => openEditFloorTypePopup(item)}>
                            <img src={edit} alt="edit" className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => deleteFloorType(item.id)}>
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
        <div>
          <div className="flex items-center mb-2 lg:mt-0 mt-3">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search Vendors ..."
              value={tileVendorSearch}
              onChange={(e) => setTileVendorSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
              onClick={openTileVendors}>
              + Add
            </button>
          </div>
          <button onClick={openTileVendorModals} className="text-[#E4572E] -mb-4 flex"><img src={imports} alt='import' className=' w-6 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5 text-sm'>Import file</h1></button>
          <button onClick={handleAllTileVendorDelete}>
            <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[15rem]' />
          </button>
          <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
            <div className="bg-[#FAF6ED]">
              <table className="table-auto lg:w-72 md:w-full w-full">
                <thead className='bg-[#FAF6ED]'>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left w-full text-xl font-bold">Vendors</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto md:w-full w-full">
                <tbody>
                  {filteredTileVendors.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.tileVendor}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ">
                          <button type="button" >
                            <img src={edit} alt="add" className="w-4 h-4" type="button" onClick={() => handleTileVendorEdit(item)} />
                          </button>
                          <button >
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" onClick={() => handleTileVendorDelete(item.id)} />
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
      {areaEdit && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={() => setAreaEdit(null)}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <label className="block text-lg font-medium mb-2 -ml-72">Area Name</label>
            <input
              type="text"
              value={areaEdit.areaName}
              onChange={(e) => setAreaEdit({ ...areaEdit, areaName: e.target.value })}
              className="w-96 -ml-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
            />
            <div className="flex space-x-2 mt-8 ml-12">
              <button onClick={handleAreaEditSave} className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">Save</button>
              <button onClick={() => setAreaEdit(null)} className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {tileVendorEdit && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={() => setTileVendorEdit(null)}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <label className="block text-lg font-medium mb-2 -ml-[20rem]">Vendors</label>
            <input
              type="text"
              value={tileVendorEdit.tileVendor}
              onChange={(e) => setTileVendorEdit({ ...tileVendorEdit, tileVendor: e.target.value })}
              className="w-96 -ml-2 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
            />
            <div className="flex space-x-2 mt-8 ml-12">
              <button onClick={handleTileVendorEditSave} className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">Save</button>
              <button onClick={() => setTileVendorEdit(null)} className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {isTileEditSizeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[37rem] h-[22rem] px-2 py-2">
            <button className="text-red-500 ml-[95%]" onClick={closeTileEditSize}>
              <img src={cross} alt="close" className="w-5 h-5" />
            </button>
            <form onSubmit={handleSubmitTileEditSize}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[25rem]">Tile Size</label>
                <input
                  type="text"
                  name="tileSize"
                  className="w-[30rem] border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter here.."
                  value={currentTileSize?.tileSize || ''}
                  onChange={handleChangeTileEditSize}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2 -ml-[4rem]">Quantity/Box</label>
                  <input
                    type="text"
                    name="quantityBox"
                    className="w-56 ml-12 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                    placeholder="Enter here.."
                    value={currentTileSize?.quantityBox || ''}
                    onChange={handleChangeTileEditSize}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2 -ml-28">Tile Area/Sqft</label>
                  <input
                    type="text"
                    name="areaTile"
                    className="w-60 ml-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                    placeholder="Enter Sqft"
                    value={currentTileSize?.areaTile || ''}
                    onChange={handleChangeTileEditSize}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button type="submit" className="bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeTileEditSize}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditFloorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeEditFloorPopup}>
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleEditFloorName}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[16rem]">Floor Name</label>
                <input
                  type="text"
                  value={editFloorName}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Floor Name"
                  onChange={(e) => setEditFloorName(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold" >
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeEditFloorPopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditFloorTypeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-80 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeEditFloorTypePopup}>
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleEditFloorTypeSubmit}>
              <div className="mb-3">
                <label className="block text-lg font-medium mb-2 -ml-[16.5rem]">Floor Type</label>
                <input
                  type="text"
                  value={editFloorType}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Floor Type"
                  onChange={(e) => setEditFloorType(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-lg font-medium mb-2 -ml-[17.5rem]">Formula</label>
                <select
                  value={editFormula}
                  onChange={(e) => setEditFormula(e.target.value)}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                  required
                >
                  <option value="">Select Formula</option>
                  <option value="L x B">L x B</option>
                  <option value="L x H">L x H</option>
                </select>
              </div>
              <div className="flex space-x-2 mt-6 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeEditFloorTypePopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-96 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeModal}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitTileName}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[17.5rem]">Tile Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Tile Name"
                  onChange={(e) => setTileName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-72">Tile Size</label>
                <select
                  className="w-40 rounded-lg border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2  -ml-52 h-12 focus:outline-none"
                  required
                  onChange={(e) => setTileSize(e.target.value)}
                  value={tileSize}
                >
                  <option value="">Select Size</option>
                  {filteredTileSize.map((tile) => (
                    <option key={tile.id} value={tile.size}>
                      {tile.tileSize}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 ml-12 -mb-4">
                <label htmlFor="fileInput" className="cursor-pointer flex items-center text-orange-600 font-bold">
                  <img src={attach} alt='attach' className=' w-5 h-5' />
                  <h1 className='ml-4 text-lg'>Attach file</h1>
                </label>
                <input type="file" id="fileInput" className="hidden" onChange={handleImageChange} />
                {selectedFile && <span className="text-gray-600">{selectedFile.name}</span>}
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold" >
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isAreaNameOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeAreaName}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitTileAreaName}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[16rem]">Area Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Area Name"
                  onChange={(e) => setAreaName(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold" >
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeAreaName}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isTileVendorsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeTileVendors}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitTileVendor}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-72">Vendors </label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Vendor Name"
                  onChange={(e) => setVendors(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeTileVendors}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isSiteNamesOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-80 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeSiteNames}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitSiteNames}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-72">Site Name </label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Site Name"
                  onChange={(e) => setSiteName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-72">Site No </label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Site No"
                  onChange={(e) => setSiteNo(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeSiteNames}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isFloorNameOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeFloorName}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitTileFloorName}>
              <div className="mb-4">
                <label className="block text-xl font-medium mb-2 -ml-[16.5rem]">Floor Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Floor Name"
                  onChange={(e) => setFloorName(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeFloorName}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isFloorTypeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-80 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeFloorType}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitTileFloorType}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[16.5rem]">Floor Type</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Floor Type"
                  onChange={(e) => setFloorType(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[17.5rem]">Formula</label>
                <select
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                  onChange={(e) => setFormula(e.target.value)}
                  required
                >
                  <option value="">Select Formula</option>
                  <option value="L x B">L x B</option>
                  <option value="L x H">L x H</option>
                </select>
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button type="submit" className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeFloorType}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isTileSizeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[37rem] h-[22rem] px-2 py-2">
            <button className="text-red-500 ml-[95%]" onClick={closeTileSize}>
              <img src={cross} alt="close" className="w-5 h-5" />
            </button>
            <form onSubmit={handleSubmitTileSize}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[25rem]">Tile Size</label>
                <input
                  type="text"
                  name="tileSize"
                  className="w-[30rem] border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter here.."
                  onChange={handleChangeTileSize}
                  required
                />
              </div>
              <div className="flex items-center space-x-1">
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2 -ml-12">Quantity/Box</label>
                  <input
                    type="text"
                    name="quantityBox"
                    className="w-56 ml-[3rem] border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                    placeholder="Enter here.."
                    onChange={handleChangeTileSize}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-lg font-medium mb-2 -ml-28">Tile Area/Sqft</label>
                  <input
                    type="text"
                    name="areaTile"
                    className="w-60 ml-4 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                    placeholder="Enter Sqft"
                    onChange={handleChangeTileSize}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-8 ml-12">
                <button type="submit" className="bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={closeTileSize}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[28rem] p-6 relative">
            <button className="absolute top-4 right-4 text-red-500" onClick={() => setIsEditModalOpen(false)} >
              <img src={cross} alt="Close" className="w-5 h-5" />
            </button>
            <form onSubmit={handleTileEditSubmit}>
              <div className="mb-4">
                <label className="block text-xl font-medium mb-2 -ml-80">Tile Name</label>
                <input
                  type="text"
                  name="tileName"
                  value={editTileData.tileName}
                  onChange={handleTileEditChange}
                  className="w-full border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                  required
                />
              </div>
              <div className='flex justify-between'>
                <div className="mb-4">
                  <label className="block text-xl font-medium mb-2 -ml-32">Tile Size</label>
                  <select
                    name="tileSize"
                    value={editTileData.tileSize}
                    onChange={handleTileEditChange}
                    className="w-52 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] p-2 rounded-lg h-14 focus:outline-none"
                    required >
                    {filteredTileSize.map((tile) => (
                      <option key={tile.id} value={tile.size}>
                        {tile.tileSize}
                      </option>
                    ))}
                  </select>
                </div>
                {editTileData.image && (
                  <img
                    src={`data:image/png;base64,${editTileData.image}`}
                    alt="Preview"
                    className=" h-28 w-40 object-cover"
                  />
                )}
              </div>
              <div className="mb-4 flex justify-between">
                <div className="flex items-center space-x-2">
                  <label htmlFor="fileInput" className="cursor-pointer flex items-center text-orange-600 font-bold">
                    <img src={attach} alt='attach' className=' w-5 h-5' />
                    <h1 className='ml-4 text-lg'>Attach file</h1>
                  </label>
                  <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {selectedFile && <span className="text-gray-600">{selectedFile.name}</span>}
                </div>
              </div>
              <div className="flex space-x-2 mt-8">
                <button type="submit" className="bg-[#BF9853] text-white px-8 py-2 rounded-lg font-semibold">
                  Save
                </button>
                <button type="button" className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]" onClick={() => setIsEditModalOpen(false)} >
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
              <button onClick={confirmDeleteTile} className="bg-red-500 text-white p-2 rounded">
                Yes, Delete
              </button>
              <button onClick={cancelDelete} className="bg-gray-300 p-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ModalArea
        isOpen={isAreaModalOpens}
        onClose={closeAreaModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadAreaName}
      />
      <ModalTileVendor
        isOpen={isTileVendorModalOpens}
        onClose={closeTileVendorModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadTileVendor}
      />
      <ModalSiteName
        isOpen={isSiteNamesModelOpens}
        onClose={closeSiteNamesModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadSiteNames}
      />
      <ModalVendorName
        isOpen={isVendorNameModelOpens}
        onClose={closeVendorNamesModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadVendorNames}
      />
      <ModalContractorName
        isOpen={isContractorNameModelOpens}
        onClose={closeContractorNamesModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadContractorNames}
      />
      <ModalCategory
        isOpen={isCategoryModelOpens}
        onClose={closeCategoryModels}
        onFileChange={handleFileChange}
        onUpload={handleUploadcategory}
      />
      <ModalSize
        isOpen={isSizeModalOpens}
        onClose={closeSizeModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadSize}
      />
      <ModalFloorName
        isOpen={isFloorNameOpens}
        onClose={closeFloorNameModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadFloorName}
      />
      <ModalFloorType
        isOpen={isFloorTypeOpens}
        onClose={closeFloorTypeModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadFloorType}
      />
      <ModalTileNameAndImage
        isOpen={isTileNameAndImageOpens}
        onClose={closeTileNameAndImageModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadTileNameAndImage}
      />
    </div>
  );
};
export default DTableView;
function ModalArea({ isOpen, onClose, onFileChange, onUpload }) {
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
function ModalTileVendor({ isOpen, onClose, onFileChange, onUpload }) {
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
function ModalSiteName({ isOpen, onClose, onFileChange, onUpload }) {
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
function ModalVendorName({ isOpen, onClose, onFileChange, onUpload }) {
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
function ModalContractorName({ isOpen, onClose, onFileChange, onUpload }) {
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
function ModalCategory({ isOpen, onClose, onFileChange, onUpload }) {
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
function ModalSize({ isOpen, onClose, onFileChange, onUpload }) {
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
function ModalFloorName({ isOpen, onClose, onFileChange, onUpload }) {
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
function ModalFloorType({ isOpen, onClose, onFileChange, onUpload }) {
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
function ModalTileNameAndImage({ isOpen, onClose, onFileChange, onUpload }) {
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