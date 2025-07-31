import React, { useState, useEffect, useCallback } from 'react';
import search from '../Images/search.png';
import CreatableSelect from 'react-select/creatable';
import imports from '../Images/Import.svg';
import cross from '../Images/cross.png';
import download from '../Images/Download.svg';
import edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';
import attach from '../Images/Attachfile.svg';

const RcAddInput = () => {
  const [selectedFileNames, setSelectedFileNames] = useState("");
  const [beamData, setBeamData] = useState([]);
  const [beamNames, setBeamNames] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const [isFloorNameOpen, setIsFloorNameOpen] = useState(false);
  const [isRccSizeOpen,setIsRccSizeOpen] = useState(false);
  const [isBeamTypesOpen, setIsBeamTypesOpen] = useState(false);
  const [isCalculationFormulaOpen, setIsCalculationFormulaOpen] = useState(false);
  const [measurementImage, setMeasurementImage] = useState(null);
  const closeCalculationFormula = () => setIsCalculationFormulaOpen(false);
  const openCalculationFormula = () => setIsCalculationFormulaOpen(true);
  const openFloorName = () => setIsFloorNameOpen(true);
  const closeFloorName = () => setIsFloorNameOpen(false);
  const openRccSizePopup = () => setIsRccSizeOpen(true);
  const closeRccSizePopup = () => setIsRccSizeOpen(false);
  const openBeamTypes = () => setIsBeamTypesOpen(true);
  const closeBeamTypes = () => setIsBeamTypesOpen(false);
  const closeFormulaOpen = () => setIsFormulaOpen(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [BeamNameSearch, setBeamNameSearch] = useState("");
  const [file, setFile] = useState(null);
  const [formulaSearch, setFormulaSearch] = useState('');
  const [beamNamess, setBeamName] = useState('');
  const [formula, setFormula] = useState('');
  const [beamName, setBeamNameOption] = useState('');
  const [calculationFormulas, setCalculationFormula] = useState('');
  const [rate, setBeamRate] = useState('');
  const [floorSearch, setFloorSearch] = useState('');
  const [rccSizeSearch, setRccSizeSearch] = useState('');
  const [rccTypeSearch, setRccTypeSearch] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [floorName, setFloorName] = useState('');
  const [size,setSize] = useState('');
  const [beamType, setBeamTypes] = useState('');
  const [tileAreaNames, setTileAreaNames] = useState([]);
  const [calculationFormulaOptions, setCalculationFormulaOptions] = useState([]);
  const [formulasOptions, setFormulasOptions] = useState([]);
  const [tileFloorNames, setTileFloorNames] = useState([]);
  const [rccSizeList, setRccSizeList] = useState([]);
  const [rccBeamTypes, setRccBeamTypes] = useState([]);
  const [isAreaModalOpens, setIsAreaModalOpens] = useState(false);
  const [message, setMessage] = useState('');
  console.log(message);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [areaEdit, setAreaEdit] = useState(null);
  const [isEditFloorOpen, setIsEditFloorOpen] = useState(false);
  const [isEditRccSizeOpen, setIsEditRccSizeOpen] = useState(false);
  const [isEditTypeOpen, setIsEditTypeOpen] = useState(false);
  const [editFloorName, setEditFloorName] = useState('');
  const [editRccSize, setEditRccSize] = useState('');
  const [editBeamType, setEditBeamType] = useState('');
  const [editBeamName, setEditBeamName] = useState('');
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [selectedRccSizeId, setSelectedRccSizeId] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [isPaintColorModalOpens, setIsPaintColorModalOpens] = useState(false);
  const [isFloorNameOpens, setIsFloorNameOpens] = useState(false);
  const [isRccBeamTypeOpens, setIsRccBeamTypeOpens] = useState(false);
  const [isPaintVariantOpens, setIsPaintVariantOpens] = useState(false);
  const [isPaintFormulaOpens, setIsPaintFormulaOpens] = useState(false);
  const openFloorNameModals = () => setIsFloorNameOpens(true);
  const openRccBeamTypeModals = () => setIsRccBeamTypeOpens(true);
  const closeRccBeamTypeModals = () => setIsRccBeamTypeOpens(false);
  const openPaintVariantModals = () => setIsPaintVariantOpens(true);
  const closeAreaModals = () => setIsAreaModalOpens(false);
  const closePaintColorModals = () => setIsPaintColorModalOpens(false);
  const closeFloorNameModals = () => setIsFloorNameOpens(false);
  const openPaintFormulaModals = () => setIsPaintFormulaOpens(true);
  const closePaintFormulaModals = () => setIsPaintFormulaOpens(false);
  const closePaintVariantModals = () => {
    setFile(null);
    setIsPaintVariantOpens(false);
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  const openEditFloorPopup = (floor) => {
    setEditFloorName(floor.floorName);
    setSelectedFloorId(floor.id);
    setIsEditFloorOpen(true);
  };
  const openEditRccSize = (item) => {
    setEditRccSize(item.size);
    setSelectedRccSizeId(item.id);
    setIsEditRccSizeOpen(true);
  };
  const openEditTypePopup = (floor) => {
    setEditBeamType(floor.beamType);
    setEditBeamName(floor.beamName);
    setSelectedTypeId(floor.id);
    setIsEditTypeOpen(true);
  };
  const closeEditFloorPopup = () => {
    setIsEditFloorOpen(false);
    setEditFloorName('');
    setSelectedFloorId(null);
  };
  const closeEditRccSize = () => {
    setIsEditRccSizeOpen(false);
    setEditRccSize('');
    setSelectedRccSizeId(null);
  };
  const closeEditTypePopup = () => {
    setIsEditTypeOpen(false);
    setEditBeamType('');
    setSelectedTypeId(null);
  };
  const handleFileChanges = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFileNames(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setMeasurementImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleUploadPaintVariant = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/paint/bulkUploadPaintVariants", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const result = await response.text();
        alert(result);
        closePaintVariantModals();
        window.location.reload();
      } else {
        alert("File upload failed with status: " + response.status);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed!");
    }
  };
  const handleUploadPaintFormulas = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/rcc/formulas/bulk_upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const result = await response.text();
        alert(result);
        window.location.reload();
      } else {
        alert("File upload failed with status: " + response.status);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed!");
    }
  };
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  const fetchRccBeamData = useCallback(async () => {
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/rcc/all/beamNameData");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const beamDataWithImage = await Promise.all(
        data.map(async (item) => {
          let imageBase64 = null;
          if (item.measurementImage) {
            if (item.measurementImage instanceof Blob) {
              imageBase64 = await convertBlobToBase64(item.measurementImage);
            } else {
              imageBase64 = item.measurementImage;
            }
          }
          return {
            ...item,
            image: imageBase64,
          };
        })
      );
      const beamNames = beamDataWithImage.map((item) => item.beamName);
      setBeamData(beamDataWithImage);
      setBeamNames(beamNames);
    } catch (error) {
      console.error("Error fetching paint data:", error);
    }
  }, []);
  useEffect(() => {
    fetchRccBeamData();
  }, [fetchRccBeamData]);

  const BeamImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setMeasurementImage(file);
      setSelectedFileName(file.name);
    }
  }
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
  const handleUploadPaintColor = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/paints/bulk-upload", {
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
  const handleUploadBeamType = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/beam_types/bulkUpload", {
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
  const handleUploadPaintItem = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/paint_type/bulk_upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.text();
      if (response.ok) {
        alert(result);
      } else {
        alert(`Upload failed: ${result}`);
      }
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
  const handleEditRccSize = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/rcc/size/edit/${selectedRccSizeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ size: editRccSize }),
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
  const handleEditBeamType = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/beam_types/edit/${selectedTypeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ beamType: editBeamType , beamName: editBeamName }),
      });
      if (response.ok) {
        closeEditTypePopup();
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
  const deleteRccSize = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/rcc/size/delete/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRccSizeList(rccSizeList.filter(item => item.id !== id));
      } else {
        console.error("Failed to delete floor. Status:", response.status);
        alert("Error deleting the floor. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the floor.");
    }
  };
  const deleteBeamTyper = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/beam_types/delete/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRccBeamTypes(rccBeamTypes.filter(floor => floor.id !== id));
      } else {
        console.error("Failed to delete floor. Status:", response.status);
        alert("Error deleting the floor. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the floor.");
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
  const handleAllRccSizeDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all area names?");

    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/rcc/size/deleteAll", {
          method: "DELETE",
        });

        if (response.ok) {
          setRccBeamTypes([]);
          alert("All Data have been deleted successfully.");
        } else {
          console.error("Failed to delete all data. Status:", response.status);
          alert("Error deleting the area names. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting all data:", error);
        alert("An error occurred while deleting all area names.");
      }
    } else {
      console.log("Deletion cancelled.");
    }
  };
  const handleAllBeamTypesDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all area names?");

    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/beam_types/delete/all", {
          method: "DELETE",
        });

        if (response.ok) {
          setBeamTypes([]);
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

  const handleAllRccBeamDataDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all area names?");

    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/rcc/delete/allRccBeamNames", {
          method: "DELETE",
        });
        if (response.ok) {
          setBeamData([]);
          alert("All Paint Data have been deleted successfully.");
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
  const handleRccBeamDataDelete = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/rcc/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert("Paint Variant Deleted Successfully")
        window.location.reload();
      } else {
        console.error("Failed to delete the area name. Status:", response.status);
        alert("Error deleting the area name. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the area name.");
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
  const handleEditClick = (variantId, variantData) => {
    setSelectedVariantId(variantId);
    setBeamName(variantData.beamName);
    setFormula(variantData.formula);
    setBeamRate(variantData.rate);
    setMeasurementImage(variantData.image);
    setIsEditModalOpen(true);
  };
  const editRccBeamData = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("beamName", beamNamess);
    formData.append("formula", formula);
    formData.append("rate", rate);

    if (measurementImage && measurementImage.startsWith("data:image")) {
      const base64Data = measurementImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      const blob = new Blob(byteArrays, { type: "image/png" });
      formData.append("measurementImage", blob, "paintImage.png");
    } else if (selectedFile) {
      formData.append("measurementImage", selectedFile);
    }

    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/rcc/edit/${selectedVariantId}`, {
        method: "PUT",
        body: formData,
      });
      if (response.ok) {
        alert("Beam data updated successfully!");
        window.location.reload();
      } else {
        alert("Error: Could not update beam data");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error during edit:", error);
      alert("Error: Something went wrong");
      window.location.reload();
    }
  };
  const openFormulaEdit = (item) => {
    setCalculationFormula(item);
    setIsFormulaOpen(true);
  }
  const handlePaintFormulasDeleteAll = async () => {
    if (window.confirm("Are you sure you want to delete all Formulas?")) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/rcc/formulas/delete/all", {
          method: "DELETE",
        });
        if (response.ok) {
          alert("All Formulas deleted successfully!");
          setCalculationFormulaOptions([]);
        } else {
          alert("Failed to delete all Formulas.");
        }
      } catch (error) {
        console.error("Error deleting all Formulas:", error);
      }
    }
  };
  useEffect(() => {
    fetchCalculationFormula();
  }, []);
  const fetchCalculationFormula = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/rcc/formulas/getAll');
      if (response.ok) {
        const data = await response.json();
        setCalculationFormulaOptions(data);
        setFormulasOptions(data.map((item) => item.formulas));
      } else {
        setMessage('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile area names.');
    }
  };
  const handleSubmitCalculationFormulas = async (e) => {
    e.preventDefault();
    const newTileArea = { formulas: calculationFormulas };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/rcc/formulas/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTileArea),
      });
      if (response.ok) {
        setMessage('Area name saved successfully!');
        setCalculationFormula('');
        fetchCalculationFormula();
        closeCalculationFormula();
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
  useEffect(() => {
    fetchBeamTypes();
  }, []);
  const fetchBeamTypes = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/beam_types/getAll');
      if (response.ok) {
        const data = await response.json();
        setRccBeamTypes(data);
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
  useEffect(() => {
    fetchRccSize();
  }, []);
  const fetchRccSize = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/rcc/size/get');
      if (response.ok) {
        const data = await response.json();
        setRccSizeList(data);
      } else {
        setMessage('Error fetching tile floor names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching tile floor names.');
    }
  };
  const handleSubmitRccSize = async (e) => {
    e.preventDefault();
    const newRccSize = { size };
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/rcc/size/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRccSize),
      });

      if (response.ok) {
        setMessage('Floor name saved successfully!');
        setSize('');
        fetchRccSize();
        closeRccSizePopup();
      } else {
        setMessage('Error saving floor name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving floor name.');
    }
  };
  const handleSubmitBeamType = async (e) => {
    e.preventDefault();
    const newBeamData = {
      beamType,
      beamName
    };
    console.log(newBeamData);
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/beam_types/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBeamData),
      });

      if (response.ok) {
        setMessage('Floor name saved successfully!');
        setBeamTypes('');
        closeBeamTypes();
        window.location.reload();
      } else {
        setMessage('Error saving floor name.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving floor name.');
    }
  };
  const handleSubmitBeamData = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("beamName", beamNamess);
    formData.append("formula", formula);
    formData.append("rate", rate);
    if (measurementImage) formData.append("measurementImage", measurementImage);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/rcc/upload/beamName", {
        method: "POST",
        body: formData,
      });
      const result = await response.text();
      alert(result);
      window.location.reload();
    } catch (error) {
      console.error("Error uploading paint data:", error);
    }
  };
  const handleEditFormula = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://backendaab.in/aabuilderDash/api/rcc/formulas/edit/${calculationFormulas.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calculationFormulas),
        }
      );
      if (response.ok) {
        alert('Formula updated successfully!');
        setIsFormulaOpen(false);
        fetchCalculationFormula();
      } else {
        alert('Failed to update formula.');
      }
    } catch (error) {
      console.error('Error updating formula:', error);
    }
  };

  const handleDeleteFormula = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/rcc/formulas/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Formula deleted successfully!');
        setCalculationFormulaOptions((prev) => prev.filter((formula) => formula.id !== id));
      } else {
        alert('Failed to delete formula.');
      }
    } catch (error) {
      console.error('Error deleting formula:', error);
    }
  };
  const filteredBeamNames = beamData.filter((item)=>
    item.beamName.toLowerCase().includes(BeamNameSearch.toLowerCase())
  );
  const filteredFloorNames = tileFloorNames.filter((item) =>
    item.floorName.toLowerCase().includes(floorSearch.toLowerCase())
  );
  const filteredRccTypes = rccBeamTypes.filter((item) =>
    item.beamType.toLowerCase().includes(rccTypeSearch.toLowerCase())
  );
  const filteredRccSizes = rccSizeList.filter((item)=>
    item.size.toLowerCase().includes(rccSizeSearch.toLowerCase())
  );
  const filteredFormulas = calculationFormulaOptions.filter((item) =>
    item.formulas.toLowerCase().includes(formulaSearch.toLowerCase())
  );
  return (
    <div className="p-4 bg-white ml-6 mr-8">
      <div className=" flex overflow-y-auto space-x-[1%]">
        <div>
          <div className="flex items-center mb-2">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-52 h-12 focus:outline-none"
              placeholder="Search Structure Name..."
              value={BeamNameSearch}
              onChange={(e) => setBeamNameSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className=" text-black font-bold px-1 ml-4 rounded border-dashed border-b-2 border-[#BF9853]"
              onClick={openModal}>
              + Add
            </button>
          </div>
          <button onClick={openPaintVariantModals} className="text-[#E4572E] font-semibold -mb-4 flex">
            <img src={imports} alt="import" className="w-7 h-5 bg-transparent pr-2 mt-1" />
            <h1 className="mt-1.5">Import file</h1>
          </button>
          <button onClick={handleAllRccBeamDataDelete}>
            <img src={deleteIcon} alt="del" className="-mb-14 mt-5 ml-[14.3rem]" />
          </button>
          <div className="rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
            <div className="bg-[#FAF6ED]">
              <table className="table-auto w-[16.5rem]">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-lg font-bold">S.No</th>
                    <th className="p-2 text-left w-48 text-lg font-bold">Structure Name</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto w-[16.5rem]">
                <tbody>
                  {filteredBeamNames.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="p-2 group flex justify-between items-center font-semibold ml-5">
                        {item.beamName}
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button type="button">
                            <img
                              src={edit}
                              alt="edit"
                              className="w-4 h-4"
                              onClick={() => handleEditClick(item.id, item)}
                            />
                          </button>
                          <button>
                            <img src={deleteIcon} alt="delete" className="w-4 h-4"
                              onClick={() => handleRccBeamDataDelete(item.id)} />
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
          <div className="flex items-center mb-2">
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
            <button className="text-black font-bold ml-4 px-1 rounded border-dashed border-b-2 border-[#BF9853]"
              onClick={openFloorName}>
              + Add
            </button>
          </div>
          <button onClick={openFloorNameModals} className="text-[#E4572E] font-semibold -mb-4 flex"><img src={imports} alt='import' className=' w-7 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5'>Import file</h1></button>
          <button onClick={handleAllFloorNameDelete}>
            <img src={deleteIcon} alt="del" className="-mb-14 mt-5 ml-[15.4rem]" />
          </button>
          <div className="rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
            <div className="bg-[#FAF6ED]">
              <table className="table-auto w-64">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left w-auto text-xl font-bold">Floor Name</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div
              className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
              <table className="table-auto w-64">
                <tbody>
                  {filteredFloorNames.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow ml-5">{item.floorName}</div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button type="button">
                            <img
                              src={edit}
                              alt="edit"
                              className="w-4 h-4"
                              onClick={() => openEditFloorPopup(item)}
                            />
                          </button>
                          <button>
                            <img
                              src={deleteIcon}
                              alt="delete"
                              className="w-4 h-4"
                              onClick={() => deleteFloor(item.id)}
                            />
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
          <div className="flex items-center mb-2">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none "
              placeholder="Search Type.."
              value={rccTypeSearch}
              onChange={(e) => setRccTypeSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold ml-4 px-1 rounded border-dashed border-b-2 border-[#BF9853]"
              onClick={openBeamTypes}>
              + Add
            </button>
          </div>
          <button onClick={openRccBeamTypeModals} className="text-[#E4572E] font-semibold -mb-4 flex"><img src={imports} alt='import' className=' w-7 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5'>Import file</h1></button>
          <button onClick={handleAllBeamTypesDelete}>
            <img src={deleteIcon} alt="del" className="-mb-14 mt-5 ml-[15.4rem]" />
          </button>
          <div className="rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
            <div className="bg-[#FAF6ED]">
              <table className="table-auto w-64">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left w-auto text-xl font-bold">Type</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto w-64">
                <tbody>
                  {filteredRccTypes.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow ml-5">{item.beamType}</div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button type="button">
                            <img
                              src={edit}
                              alt="edit"
                              className="w-4 h-4"
                              onClick={() => openEditTypePopup(item)}
                            />
                          </button>
                          <button>
                            <img
                              src={deleteIcon}
                              alt="delete"
                              className="w-4 h-4"
                              onClick={() => deleteBeamTyper(item.id)}
                            />
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
          <div className="flex items-center mb-2">
            <input
              type="text"
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none "
              placeholder="Search Size.."
              value={rccSizeSearch}
              onChange={(e) => setRccSizeSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold ml-4 px-1 rounded border-dashed border-b-2 border-[#BF9853]"
              onClick={openRccSizePopup}>
              + Add
            </button>
          </div>
          <button onClick={openFloorNameModals} className="text-[#E4572E] font-semibold -mb-4 flex"><img src={imports} alt='import' className=' w-7 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5'>Import file</h1></button>
          <button onClick={handleAllRccSizeDelete}>
            <img src={deleteIcon} alt="del" className="-mb-14 mt-5 ml-[15.4rem]" />
          </button>
          <div className="rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
            <div className="bg-[#FAF6ED]">
              <table className="table-auto w-64">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left w-auto text-xl font-bold">Size</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div
              className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
              <table className="table-auto w-64">
                <tbody>
                  {filteredRccSizes.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow ml-5">{item.size}</div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button type="button">
                            <img
                              src={edit}
                              alt="edit"
                              className="w-4 h-4"
                              onClick={() => openEditRccSize(item)}
                            />
                          </button>
                          <button>
                            <img
                              src={deleteIcon}
                              alt="delete"
                              className="w-4 h-4"
                              onClick={() => deleteRccSize(item.id)}
                            />
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
          <div>
            <div className="flex items-center mb-2">
              <input
                type="text"
                className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
                placeholder="Search Formula.."
                value={formulaSearch}
                onChange={(e) => setFormulaSearch(e.target.value)}
              />
              <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
                <img src={search} alt='search' className=' w-5 h-5' />
              </button>
              <button className="text-black font-bold px-1 ml-4 rounded border-dashed border-b-2 border-[#BF9853]"
                onClick={openCalculationFormula}>
                + Add
              </button>
            </div>
            <button onClick={openPaintFormulaModals} className="text-[#E4572E] font-semibold -mb-4 flex"><img src={imports} alt='import' className=' w-7 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5'>Import file</h1></button>
            <button onClick={handlePaintFormulasDeleteAll}>
              <img src={deleteIcon} alt='del' className='-mb-14 mt-5 ml-[17rem]' />
            </button>
            <div className='rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]'>
              <table className="table-auto w-72">
                <thead className="bg-[#FAF6ED]">
                  <tr className="border-b">
                    <th className="p-2 text-left w-12 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left w-60 text-xl font-bold">Formula</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFormulas.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow">
                          {item.formulas}
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button type="button" onClick={() => openFormulaEdit(item)}>
                            <img src={edit} alt="edit" className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handleDeleteFormula(item.id)}>
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
      {areaEdit && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" >
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={() => setAreaEdit(null)}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <label className="block text-xl font-medium mb-2 -ml-72">Area Name</label>
            <input
              type="text"
              value={areaEdit.areaName}
              onChange={(e) => setAreaEdit({ ...areaEdit, areaName: e.target.value })}
              className="w-96 -ml-2 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
            />
            <div className="flex space-x-2 mt-8 ml-12">
              <button onClick={handleAreaEditSave} className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">Save</button>
              <button onClick={() => setAreaEdit(null)} className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]">Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      {isEditFloorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeEditFloorPopup}>
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleEditFloorName}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[17rem]">Floor Name</label>
                <input
                  type="text"
                  value={editFloorName}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Floor Name"
                  onChange={(e) => setEditFloorName(e.target.value)}
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
                  onClick={closeEditFloorPopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditRccSizeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeEditRccSize}>
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleEditRccSize}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[20.5rem]">Size</label>
                <input
                  type="text"
                  value={editRccSize}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Floor Name"
                  onChange={(e) => setEditRccSize(e.target.value)}
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
                  onClick={closeEditRccSize}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditTypeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
          <div className="bg-white rounded-md w-[30rem] px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeEditTypePopup}>
                <img src={cross} alt='close' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleEditBeamType}>
              <div className="mb-4">
                <label className="block text-lg font-medium mb-2 -ml-[20.5rem]">Type</label>
                <input
                  type="text"
                  value={editBeamType}
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Beam Type"
                  onChange={(e) => setEditBeamType(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 -ml-72">
                <label className="block text-base font-medium mb-2 ml-2">Structure Name</label>
                <select
                  className="w-60 ml-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  onChange={(e) => setEditBeamName(e.target.value)}
                  value={editBeamName}
                  required
                >
                  <option value="">Select Structure Name..</option>
                  {beamNames.length > 0 ? (
                    beamNames.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading options...</option>
                  )}
                </select>
              </div>
              <div className="flex space-x-2 mt-4 ml-12 mb-3">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeEditTypePopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md lg:w-[34rem] w-[18rem] px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeModal}>
                <img src={cross} alt='cross' className='lg:w-5 w-4 lg:h-5 h-4' />
              </button>
            </div>
            <form onSubmit={handleSubmitBeamData}>
              <div className="lg:mb-4 lg:-mt-0 -mt-4">
                <label className="block text-base font-medium lg:mb-2 mb-3 lg:-ml-[20.5rem] -ml-[9rem]">Structure Name</label>
                <input
                  type="text"
                  className="lg:w-[27rem] w-[15rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg lg:h-12 h-11 focus:outline-none lg:-mt-0 -mt-2"
                  placeholder="Enter here"
                  onChange={(e) => setBeamName(e.target.value)}
                  required
                />
              </div>
              <div className=' flex ml-8 '>
                <div className="mb-4 -ml-36">
                  <label className="block text-base font-medium mb-2 lg:-ml-3 ml-8">Formula</label>
                  <select
                    className="lg:w-60 w-40 lg:ml-40 ml-32 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg lg:h-14 h-12 focus:outline-none"
                    onChange={(e) => setFormula(e.target.value)}
                    required
                  >
                    <option value="">Select Formula..</option>
                    {formulasOptions.length > 0 ? (
                      formulasOptions.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading options...</option>
                    )}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-base font-medium mb-2 lg:-ml-[4.5rem] -ml-6">Rate</label>
                  <input
                    type="text"
                    className="lg:w-32 w-[4.5rem] lg:ml-4 ml-2  border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg lg:h-14 h-12 focus:outline-none"
                    placeholder="Enter here"
                    onChange={(e) => setBeamRate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 lg:ml-12 ml-5 lg:mt-0 -mt-2">
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer flex items-center text-orange-600 font-bold"
                >
                  <img src={attach} alt="attach" className="w-5 h-5" />
                  <h1 className="lg:ml-4 ml-2 text-lg">Attach file</h1>
                </label>
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  onChange={BeamImageUpload}
                />
                {selectedFileName && (
                  <span className="text-gray-600 ml-4 text-sm italic">
                    {selectedFileName}
                  </span>
                )}
              </div>
              <div className="flex space-x-5 lg:mt-4 mt-2 lg:ml-12 ml-5 lg:mb-4 mb-2">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white lg:px-8 px-4 lg:py-2 py-1 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="lg:px-8 px-4 lg:py-2 py-1 border rounded-lg text-[#BF9853] border-[#BF9853] "
                  onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isFormulaOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
          <div className="bg-white rounded shadow-lg w-[30rem] h-52 px-2 py-2">
            <div>
              <button className="text-[#E4572E] ml-[95%]" onClick={closeFormulaOpen}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleEditFormula}>
              <label className="block text-base font-medium mb-2 -ml-[20rem] -mt-4">Formula</label>
              <input
                type="text"
                className="w-96 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                value={calculationFormulas?.formulas || ''}
                onChange={(e) =>
                  setCalculationFormula({ ...calculationFormulas, formulas: e.target.value })
                }
                required
              />
              <div className="flex space-x-2 mt-8 mb-4 ml-10">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeFormulaOpen}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isCalculationFormulaOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center " >
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-[#E4572E] ml-[95%]" onClick={closeCalculationFormula}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitCalculationFormulas}>
              <div className="mb-4">
                <label className="block text-xl font-medium mb-2 -ml-72">Formulas</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Formulas"
                  onChange={(e) => setCalculationFormula(e.target.value)}
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
                  onClick={closeCalculationFormula}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isFloorNameOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center " >
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-[#E4572E] ml-[95%]" onClick={closeFloorName}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitTileFloorName}>
              <div className="mb-4">
                <label className="block text-xl font-medium mb-2 -ml-64">Floor Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Floor Name"
                  onChange={(e) => setFloorName(e.target.value)}
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
                  onClick={closeFloorName}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isRccSizeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center " >
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-[#E4572E] ml-[95%]" onClick={closeRccSizePopup}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitRccSize}>
              <div className="mb-4">
                <label className="block text-xl font-medium mb-2 -ml-[20.5rem]">Size</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Floor Name"
                  onChange={(e) => setSize(e.target.value)}
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
                  onClick={closeRccSizePopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isBeamTypesOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center " >
          <div className="bg-white rounded-md w-[30rem] px-2 py-2">
            <div>
              <button className="text-[#E4572E] ml-[95%]" onClick={closeBeamTypes}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitBeamType}>
              <div className="mb-4">
                <label className="block text-xl font-medium mb-2 -ml-80">Type</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Beam Type"
                  onChange={(e) => setBeamTypes(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 -ml-72">
                <label className="block text-xl font-medium mb-2 ml-8">Structure Name</label>
                <select
                  className="w-60 ml-40 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  onChange={(e) => setBeamNameOption(e.target.value)}
                  required
                >
                  <option value="">Select Structure Name..</option>
                  {beamNames.length > 0 ? (
                    beamNames.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading options...</option>
                  )}
                </select>
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
                  onClick={closeBeamTypes}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" >
          <div className="bg-white rounded-md w-[28rem] p-6 relative">
            <button
              className="absolute top-4 right-4 text-red-500"
              onClick={() => setIsEditModalOpen(false)}
            >
              <img src={cross} alt="Close" className="w-5 h-5" />
            </button>
            <form onSubmit={editRccBeamData}>
              <div className="mb-4">
                <label className="block text-base font-medium mb-2 -ml-[15rem]">Structure Name</label>
                <input
                  type="text"
                  className="w-[21rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-12 focus:outline-none"
                  placeholder="Enter here"
                  value={beamNamess}
                  onChange={(e) => setBeamName(e.target.value)}
                  required
                />
              </div>
              <div className=' flex ml-4 '>
                <div className="mb-4">
                  <label className="block text-base font-medium mb-2 -ml-[7rem]">Formula</label>
                  <select
                    className="w-48 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-12 focus:outline-none"
                    value={formula}
                    onChange={(e) => setFormula(e.target.value)}
                    required
                  >
                    <option value="">Select Formula..</option>
                    {formulasOptions.length > 0 ? (
                      formulasOptions.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading options...</option>
                    )}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-base font-medium mb-2 -ml-[4.5rem]">Rate</label>
                  <input
                    type="text"
                    className="w-32 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-12 focus:outline-none"
                    placeholder="Enter here"
                    value={rate}
                    onChange={(e) => setBeamRate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-4 ml-6">
                {measurementImage ? (
                  <img
                    src={measurementImage.startsWith("data:image")
                      ? measurementImage
                      : `data:image/png;base64,${measurementImage}`}
                    alt="Edit Paint"
                    className="w-40 h-16 object-cover"
                  />
                ) : (
                  <span>No Image</span>
                )}
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer flex items-center text-[#E4572E] font-bold mt-2"
                >
                  <img src={attach} alt="attach" className="w-4 h-4" />
                  <h1 className="ml-2 text-sm">Attach Color</h1>
                </label>
                <div className=' flex'>
                  <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    onChange={(e) => handleFileChanges(e)}
                  />
                  <div>
                    {selectedFileNames && (
                      <p className="mt-2 text-sm text-gray-500">{selectedFileNames}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-5 mt-8 ml-8">
                <button type="submit" className="bg-[#BF9853] text-white px-8 py-2 rounded-lg font-semibold">
                  Save
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ModalArea
        isOpen={isAreaModalOpens}
        onClose={closeAreaModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadAreaName}
      />
      <ModalPaintColor
        isOpen={isPaintColorModalOpens}
        onClose={closePaintColorModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadPaintColor}
      />
      <ModalFloorName
        isOpen={isFloorNameOpens}
        onClose={closeFloorNameModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadFloorName}
      />
      <ModalBeamType
        isOpen={isRccBeamTypeOpens}
        onClose={closeRccBeamTypeModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadBeamType}
      />
      <ModalPaintVariant
        isOpen={isPaintVariantOpens}
        onClose={closePaintVariantModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadPaintVariant}
      />
      <ModalPaintFormula
        isOpen={isPaintFormulaOpens}
        onClose={closePaintFormulaModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadPaintFormulas}
      />
    </div>
  );
};
export default RcAddInput;

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
function ModalPaintColor({ isOpen, onClose, onFileChange, onUpload }) {
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
function ModalBeamType({ isOpen, onClose, onFileChange, onUpload }) {
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
function ModalPaintVariant({ isOpen, onClose, onFileChange, onUpload }) {
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
function ModalPaintFormula({ isOpen, onClose, onFileChange, onUpload }) {
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