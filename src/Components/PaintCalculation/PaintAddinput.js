import React, { useState, useEffect, useCallback } from 'react';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import cross from '../Images/cross.png';
import download from '../Images/Download.svg';
import edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';
import attach from '../Images/Attachfile.svg';

const PaintAddInput = () => {
  const [selectedFileNames, setSelectedFileNames] = useState("");
  const [paintVariants, setPaintVariants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAreaNameOpen, setIsAreaNameOpen] = useState(false);
  const [isPaintTypeOpen, setIsPaintTypeOpen] = useState(false);
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const [isFloorNameOpen, setIsFloorNameOpen] = useState(false);
  const [isPaintColorCodeOpen, setIsPaintColorCodeOpen] = useState(false);
  const [isCalculationFormulaOpen, setIsCalculationFormulaOpen] = useState(false);
  const [paintColor, setPaintColor] = useState("");
  const [paintImage, setPaintImage] = useState(null);
  const [paints, setPaints] = useState([]);
  const [paintTypeOptions, setPaintTypeOptions] = useState([]);
  const closeCalculationFormula = () => setIsCalculationFormulaOpen(false);
  const openCalculationFormula = () => setIsCalculationFormulaOpen(true);
  const closeTileSize = () => setIsPaintColorCodeOpen(false);
  const openPaintColorCode = () => setIsPaintColorCodeOpen(true);
  const openFloorName = () => setIsFloorNameOpen(true);
  const closeFloorName = () => setIsFloorNameOpen(false);
  const openAreaName = () => setIsAreaNameOpen(true);
  const openPaintType = () => setIsPaintTypeOpen(true);
  const closeAreaName = () => setIsAreaNameOpen(false);
  const closePaintType = () => setIsPaintTypeOpen(false);
  const closeFormulaOpen = () => setIsFormulaOpen(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [paintSearch, setPaintSearch] = useState("");
  const [file, setFile] = useState(null);
  const [areaSearch, setAreaSearch] = useState("");
  const [paintColorSearch, setPaintColorSearch] = useState('');
  const [formulaSearch, setFormulaSearch] = useState('');
  const [paintName, setPaintName] = useState('');
  const [paintType, setPaintType] = useState('');
  const [paintFormula, setPaintFormula] = useState('');
  const [paintItem, setPaintTypes] = useState('');
  const [calculationFormulas, setCalculationFormula] = useState('');
  const [paintCoverBySqft, setPaintCoverBySqft] = useState('');
  const [floorSearch, setFloorSearch] = useState('');
  const [paintItemSearch, setPaintItemSearch] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [areaName, setAreaName] = useState('');
  const [floorName, setFloorName] = useState('');
  const [tileAreaNames, setTileAreaNames] = useState([]);
  const [paintItems, setPaintItems] = useState([]);
  const [calculationFormulaOptions, setCalculationFormulaOptions] = useState([]);
  const [formulasOptions, setFormulasOptions] = useState([]);
  const [tileFloorNames, setTileFloorNames] = useState([]);
  const [editingPaint, setEditingPaint] = useState([]);
  const [isAreaModalOpens, setIsAreaModalOpens] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [message, setMessage] = useState('');
  console.log(message);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [areaEdit, setAreaEdit] = useState(null);
  const [selectedPaintTypeId, setSelectedPaintTypeId] = useState(null);
  const [paintData, setPaintData] = useState([]);
  const [isPaintTypeEditOpen, setIsPaintTypeEditOpen] = useState(false);
  const [isEditFloorOpen, setIsEditFloorOpen] = useState(false);
  const [editFloorName, setEditFloorName] = useState('');
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [isPaintColorModalOpens, setIsPaintColorModalOpens] = useState(false);
  const [isFloorNameOpens, setIsFloorNameOpens] = useState(false);
  const [isPaintItemOpens, setIsPaintItemOpens] = useState(false);
  const [isPaintVariantOpens, setIsPaintVariantOpens] = useState(false);
  const [isPaintFormulaOpens, setIsPaintFormulaOpens] = useState(false);
  const openAreaModals = () => setIsAreaModalOpens(true);
  const openPaintColorModals = () => setIsPaintColorModalOpens(true);
  const openFloorNameModals = () => setIsFloorNameOpens(true);
  const openPaintVariantModals = () => setIsPaintVariantOpens(true);
  const closeAreaModals = () => setIsAreaModalOpens(false);
  const closePaintColorModals = () => setIsPaintColorModalOpens(false);
  const closeFloorNameModals = () => setIsFloorNameOpens(false);
  const closePaintItemModals = () => setIsPaintItemOpens(false);
  const openPaintItemModals = () => setIsPaintItemOpens(true);
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

  const closeEditFloorPopup = () => {
    setIsEditFloorOpen(false);
    setEditFloorName('');
    setSelectedFloorId(null);
  };
  const handleFileChanges = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFileNames(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setEditingPaint({ ...editingPaint, paintColorImage: reader.result });
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
      const response = await fetch("https://backendaab.in/aabuilderDash/api/formulas/bulk_upload", {
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
  useEffect(() => {
    fetchPaints();
  }, []);
  const fetchPaints = async () => {
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/paints/all/data");
      const data = await response.json();
      setPaints(data);
    } catch (error) {
      console.error("Error fetching paints:", error);
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
  const fetchPaintData = useCallback(async () => {
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/paints/all/data");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const paintDataWithImages = await Promise.all(
        data.map(async (paint) => {
          let imageBase64 = null;
          if (paint.paintImage) {
            if (paint.paintImage instanceof Blob) {
              imageBase64 = await convertBlobToBase64(paint.paintImage);
            } else {
              imageBase64 = paint.paintImage;
            }
          }
          return {
            ...paint,
            image: imageBase64,
          };
        })
      );
      setPaintData(paintDataWithImages);
    } catch (error) {
      console.error("Error fetching paint data:", error);
    }
  },[]);
  useEffect(() => {
    fetchPaintData();
  }, [fetchPaintData]);
  const handlePaintUpdate = async (e) => {
    e.preventDefault();
    const { paintColor, paintColorImage } = editingPaint;
    if (!paintColor) {
      alert("Color code is required!");
      return;
    }
    const formData = new FormData();
    formData.append("paintColor", paintColor);
    if (paintColorImage && paintColorImage.startsWith("data:image")) {
      const base64Data = paintColorImage.split(',')[1];
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
      formData.append("paintImage", blob, "paintImage.png");
    } else if (selectedFile) {
      formData.append("paintImage", selectedFile);
    }
    try {
      const response = await fetch(
        `https://backendaab.in/aabuilderDash/api/paints/change/${editingPaint.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );
      if (response.ok) {
        alert("Paint updated successfully!");
        setShowEditModal(false);
        window.location.reload();
        setSelectedFileNames("");
      } else {
        const errorData = await response.json();
        alert(`Failed to update paint: ${errorData.message}`);
      }
    } catch (error) {
      alert(`Error updating paint: ${error.message}`);
    }
  };
  const handleDeletePaint = async (id) => {
    try {
      const response = await fetch(
        `https://backendaab.in/aabuilderDash/api/paints/delete/${id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        alert("Paint deleted successfully!");
        window.location.reload();
        setPaints(paints.filter((paint) => paint.id !== id));
      } else {
        const errorData = await response.json();
        alert(`Failed to delete paint: ${errorData.message}`);
      }
    } catch (error) {
      alert(`Error deleting paint: ${error.message}`);
    }
  };
  const paintImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPaintImage(file);
      setSelectedFileName(file.name);
    }
  }
  const deletePaint = async (id) => {
    try {
      const response = await fetch(
        `https://backendaab.in/aabuilderDash/api/paints/delete/${id}`,
        { method: "DELETE" }
      );
      const result = await response.text();
      fetchPaints();
    } catch (error) {
      console.error("Error deleting paint:", error);
    }
  };
  useEffect(() => {
    fetch("https://backendaab.in/aabuilderDash/api/paint/variant/get/all")
      .then((response) => response.json())
      .then((data) => setPaintVariants(data))
      .catch((error) => console.error("Error fetching paint variants:", error));
  }, []);
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
  const closePaintTypeEdit = () => {
    setIsPaintTypeEditOpen(false);
  };
  const handleAreaEdit = (item) => {
    setAreaEdit(item);
  };

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

  const handleAllPaintVariantDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all area names?");

    if (confirmed) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/paint/variant/delete/all", {
          method: "DELETE",
        });

        if (response.ok) {
          setPaintVariants([]);
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
  const handlePaintVariantDelete = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/variant/delete/${id}`, {
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
    setPaintName(variantData.paintName);
    setPaintType(variantData.paintType);
    setPaintCoverBySqft(variantData.paintCoverBySqft);
    setIsEditModalOpen(true);
  };
  const handleEditClicks = (paint) => {
    setEditingPaint({
      id: paint.id,
      paintColor: paint.paintColor,
      paintColorImage: paint.image || "/path/to/default-image.jpg",
    });
    setShowEditModal(true);
  };
  const editPaintVariant = async (paintVariantData) => {
    console.log(paintVariantData);
    try {
      const response = await fetch(
        `https://backendaab.in/aabuilderDash/api/paint/variant/update/${selectedVariantId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paintVariantData),
        }
      );
      const responseBody = await response.text();
      if (response.ok) {
        const result = JSON.parse(responseBody);
        console.log("Paint variant updated:", result);
        alert("Paint variant updated successfully!");
        window.location.reload();
      } else {
        console.error("Failed to update paint variant", responseBody);
        alert("Error: Could not update paint variant");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error during edit:", error);
      alert("Error: Something went wrong");
      window.location.reload();
    }
  };
  const handleDownloadImage = (imageUrl, paintName) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${paintName || "paint"}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
  useEffect(() => {
    fetchPaintType();
  }, []);
  const fetchPaintType = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/paint_type/getAll');

      if (response.ok) {
        const data = await response.json();
        setPaintItems(data);
        setPaintTypeOptions(
          data.map((item) => item.paintItem)
        );
      } else {
        setMessage('Error fetching paint type names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching paint type names.');
    }
  };
  const openPaintTypeEdit = (id) => {
    const selectedPaint = paintItems.find((item) => item.id === id);
    if (selectedPaint) {
      setPaintTypes(selectedPaint.paintItem);
      setPaintFormula(selectedPaint.formulas);
    }
    setSelectedPaintTypeId(id);
    setIsPaintTypeEditOpen(true);
  };
  const openFormulaEdit = (item) => {
    setCalculationFormula(item);
    setIsFormulaOpen(true);
  }
  const updatePaintType = async () => {
    const payload = {
      paintItem: paintItem,
      formulas: paintFormula,
    };
    console.log(selectedPaintTypeId);
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint_type/edit/${selectedPaintTypeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const updatedPaintType = await response.json();
        setPaintItems((prev) =>
          prev.map((item) =>
            item.id === updatedPaintType.id ? updatedPaintType : item
          )
        );
        alert("Paint type updated successfully!");
        closePaintTypeEdit();
      } else {
        const errorData = await response.json();
        console.error("Failed to update paint type:", errorData);
        alert("Failed to update paint type!");
      }
    } catch (error) {
      console.error("Error updating paint type:", error);
      alert("An error occurred while updating paint type!");
    }
  };
  const handlePaintItemDelete = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint_type/delete/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Item deleted successfully!");
        setPaintItems((prevItems) => prevItems.filter((item) => item.id !== id));
      } else {
        alert("Failed to delete item.");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  const handlePaintItemDeleteAll = async () => {
    if (window.confirm("Are you sure you want to delete all items?")) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/paint_type/deleteAll", {
          method: "DELETE",
        });
        if (response.ok) {
          alert("All items deleted successfully!");
          setPaintItems([]); // Clear the table
        } else {
          alert("Failed to delete all items.");
        }
      } catch (error) {
        console.error("Error deleting all items:", error);
      }
    }
  };
  const handlePaintFormulasDeleteAll = async () => {
    if (window.confirm("Are you sure you want to delete all Formulas?")) {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/formulas/delete/all", {
          method: "DELETE",
        });
        if (response.ok) {
          alert("All Formulas deleted successfully!");
          setCalculationFormulaOptions([]); // Clear the table
        } else {
          alert("Failed to delete all Formulas.");
        }
      } catch (error) {
        console.error("Error deleting all Formulas:", error);
      }
    }
  };
  const handleSubmitPaintType = async (e) => {
    e.preventDefault();
    const newPaintType = {
      paintItem: paintItem,
      formulas: paintFormula,
    };
    console.log("before send", newPaintType);
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/paint_type/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPaintType),
      });

      if (response.ok) {
        setMessage('Paint Type saved successfully!');
        setPaintItems('');
        setPaintFormula('');
        fetchPaintType();
        closePaintType();
      } else {
        setMessage('Error saving paint type.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving paint type.');
    }
  };

  useEffect(() => {
    fetchCalculationFormula();
  }, []);
  const fetchCalculationFormula = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/formulas/getAll');
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

    const newTileArea = { formulas: calculationFormulas };  // Ensure the field is 'formulas'

    console.log("before send", newTileArea);  // Verify the data

    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/formulas/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTileArea),  // Send the correct JSON structure
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
  const handleOpenImage = (image, color) => {
    setSelectedImage(`data:image/jpeg;base64,${image}`);
    setPaintColor(color);
  };

  const handleCloseImageModal = () => {
    setSelectedImage(null);
  };
  const handleSubmitPaintColor = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("paintColor", paintColor);
    if (paintImage) formData.append("paintImage", paintImage);
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/paints/upload", {
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
  const handleSubmitTileName = async (e) => {
    e.preventDefault();
    const paintVariantData = {
      paintName,
      paintType,
      paintCoverBySqft,
    };
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/paint/variant/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paintVariantData),
      });
      if (response.ok) {
        const result = await response.json();
        console.log("Paint variant saved:", result);
        alert("Paint variant saved successfully!");
        closeModal();
      } else {
        console.error("Failed to save paint variant");
        alert("Error: Could not save paint variant");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      alert("Error: Something went wrong");
    }
  };
  const handleEditFormula = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://backendaab.in/aabuilderDash/api/formulas/edit/${calculationFormulas.id}`,
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
        fetchCalculationFormula(); // Refresh the data
      } else {
        alert('Failed to update formula.');
      }
    } catch (error) {
      console.error('Error updating formula:', error);
    }
  };
  const handleDeleteFormula = async (id) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuilderDash/api/formulas/delete/${id}`, {
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

  const filteredPaintName = paintVariants.filter((item) =>
    item.paintName.toLowerCase().includes(paintSearch.toLowerCase())
  );
  const filteredAreaNames = tileAreaNames.filter((item) =>
    item.areaName.toLowerCase().includes(areaSearch.toLowerCase())
  );
  const filteredPaintColor = paintData.filter((item) =>
    item.paintColor.toLowerCase().includes(paintColorSearch.toLowerCase())
  );
  const filteredFloorNames = tileFloorNames.filter((item) =>
    item.floorName.toLowerCase().includes(floorSearch.toLowerCase())
  );
  const filteredPaintItems = paintItems.filter((item) =>
    item.paintItem.toLowerCase().includes(paintItemSearch.toLowerCase())
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
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-80 h-12 focus:outline-none"
              placeholder="Search Paint Name..."
              value={paintSearch}
              onChange={(e) => setPaintSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className=" text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
              onClick={openModal}>
              + Add
            </button>
          </div>
          <button onClick={openPaintVariantModals} className="text-[#E4572E] font-semibold -mb-4 flex">
            <img src={imports} alt="import" className="w-7 h-5 bg-transparent pr-2 mt-1" />
            <h1 className="mt-1.5">Import file</h1>
          </button>
          <button onClick={handleAllPaintVariantDelete}>
            <img src={deleteIcon} alt="del" className="-mb-14 mt-5 ml-[24.3rem]" />
          </button>
          <div className="rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
            <div className="bg-[#FAF6ED]">
              <table className="table-auto w-96">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-lg font-bold">S.No</th>
                    <th className="p-2 text-left w-72 text-lg font-bold">Paint Variant</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div
              className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
              <table className="table-auto w-96">
                <tbody>
                  {filteredPaintName.map((variant, index) => (
                    <tr key={variant.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="p-2 group flex justify-between items-center font-semibold ml-5">
                        {variant.paintName}
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button type="button">
                            <img
                              src={edit}
                              alt="edit"
                              className="w-4 h-4"
                              onClick={() => handleEditClick(variant.id, variant)}
                            />
                          </button>
                          <button>
                            <img src={deleteIcon} alt="delete" className="w-4 h-4" 
                            onClick={() => handlePaintVariantDelete(variant.id)}/>
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
          <button onClick={openAreaModals} className="text-[#E4572E] font-semibold -mb-4 flex"><img src={imports} alt='import' className=' w-7 h-5 bg-transparent pr-2 mt-1' />
            <h1 className='mt-1.5'>Import file</h1></button>
          <button onClick={handleAllAreaDelete}>
            <img src={deleteIcon} alt="del" className="-mb-14 mt-5 ml-[15.3rem]" />
          </button>
          <div className="rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] mb-10">
            <div className="bg-[#FAF6ED]">
              <table className="table-auto w-60">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left w-10 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left w-52 text-xl font-bold">Room Name</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
              <table className="table-auto w-60">
                <tbody>
                  {filteredAreaNames.map((item, index) => (
                    <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="p-2 text-left group flex font-semibold ml-4">
                        <div className="flex flex-grow">{item.areaName}</div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button type="button">
                            <img
                              src={edit}
                              alt="edit"
                              className="w-4 h-4"
                              onClick={() => handleAreaEdit(item)}
                            />
                          </button>
                          <button>
                            <img
                              src={deleteIcon}
                              alt="delete"
                              className="w-4 h-4"
                              onClick={() => handleAreaDelete(item.id)}
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
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search Paint Color.."
              value={paintColorSearch}
              onChange={(e) => setPaintColorSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold ml-4 px-1 border-dashed border-b-2 border-[#BF9853]"
              onClick={openPaintColorCode}>
              + Add
            </button>
          </div>
          <button onClick={openPaintColorModals} className="text-[#E4572E] font-semibold -mb-4 flex "><img src={imports} alt='import' className=' w-7 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5'>Import file</h1></button>
          <button className="bg-[#FAF6ED]">
            <img src={deleteIcon} alt="del" className="-mb-14 mt-5 ml-[18.5rem]" />
          </button>
          <div className="rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
            <div className="bg-[#FAF6ED]">
              <table className="table-auto w-72">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                    <th className="p-2 text-left w-72 text-xl font-bold">Color Code</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div
              className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
              <table className="table-auto w-72">
                <tbody>
                  {filteredPaintColor.map((paint, index) => (
                    <tr key={paint.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                      <td className="p-2 text-left font-semibold">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="p-2 text-left group flex font-semibold">
                        <div className="flex flex-grow ml-5">
                          <button
                            className="font-medium hover:text-[#E4572E] text-left flex"
                            onClick={() => handleOpenImage(paint.image, paint.paintColor)}
                          >
                            {paint.paintColor}
                          </button>
                        </div>
                        <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button type="button">
                            <img
                              src={edit}
                              alt="add"
                              className="w-4 h-4"
                              onClick={() => handleEditClicks(paint)}
                            />
                          </button>
                          <button>
                            <img
                              src={deleteIcon}
                              alt="delete"
                              className="w-4 h-4"
                              onClick={() => handleDeletePaint(paint.id)}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedImage && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={handleCloseImageModal}
              >
                <div
                  className="bg-transparent p-4 rounded-lg shadow-lg max-w-lg max-h-full overflow-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h1 className="text-lg font-semibold text-white">{paintColor}</h1>
                    <button
                      onClick={() => handleDownloadImage(selectedImage, paintColor)}
                      className="px-3 py-2 rounded-md flex items-center"
                    >
                      <img src={download} alt="download" className="w-4 h-4" />
                    </button>
                  </div>
                  <img
                    src={selectedImage}
                    alt="Paint"
                    className="max-w-full max-h-96 object-contain"
                  />
                </div>
              </div>
            )}
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
            <button className="text-black font-bold ml-4 px-1 border-dashed border-b-2 border-[#BF9853]"
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
              className="overflow-y-auto max-h-[600px] scrollbar-thumb-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
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
              className="border border-[#FAF6ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg p-2 flex-1 w-44 h-12 focus:outline-none"
              placeholder="Search Paint Item.."
              value={paintItemSearch}
              onChange={(e) => setPaintItemSearch(e.target.value)}
            />
            <button className="-ml-6 mt-5 transform -translate-y-1/2 text-gray-500">
              <img src={search} alt='search' className=' w-5 h-5' />
            </button>
            <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
              onClick={openPaintType}>
              + Add
            </button>
          </div>
          <button onClick={openPaintItemModals} className="text-[#E4572E] font-semibold -mb-4 flex"><img src={imports} alt='import' className=' w-7 h-5 bg-transparent pr-2 mt-1' /><h1 className='mt-1.5'>Import file</h1></button>
          <button onClick={handlePaintItemDeleteAll}>
            <img src={deleteIcon} alt="del" className="-mb-14 mt-5 ml-[15rem]" />
          </button>
          <div className="rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
            <table className="table-auto w-64">
              <thead className="bg-[#FAF6ED]">
                <tr className="border-b">
                  <th className="p-2 text-left w-16 text-xl font-bold">S.No</th>
                  <th className="p-2 text-left text-xl font-bold">Item</th>
                </tr>
              </thead>
            </table>
            <div className="overflow-y-auto max-h-[600px] w-64 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="table-auto w-full">
                <tbody>
                  {Array.isArray(paintItems) &&
                    paintItems.length > 0 &&
                    filteredPaintItems.map((item, index) => (
                      <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                        <td className="p-2 text-left font-semibold">
                          {(index + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="p-2 text-left group ml-4 flex font-semibold">
                          <div className="flex flex-grow">{item.paintItem}</div>
                          <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button type="button">
                              <img
                                src={edit}
                                alt="edit"
                                className="w-4 h-4"
                                onClick={() => openPaintTypeEdit(item.id)}
                              />
                            </button>
                            <button>
                              <img
                                src={deleteIcon}
                                alt="delete"
                                className="w-4 h-4"
                                onClick={() => handlePaintItemDelete(item.id)}
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
              <button className="text-black font-bold px-1 ml-4 border-dashed border-b-2 border-[#BF9853]"
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
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
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
      {isPaintTypeEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[32rem] px-2 py-2">
            <button className="text-red-500 ml-[95%]" onClick={closePaintTypeEdit}>
              <img src={cross} alt="close" className="w-5 h-5" />
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updatePaintType();
              }}
            >
              <div className="mb-4">
                <label className="block text-xl font-medium mb-2 -ml-[18rem]">Paint Item</label>
                <input
                  type="text"
                  className="w-96 -ml-2 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  placeholder="Enter Type"
                  value={paintItem}
                  onChange={(e) => setPaintTypes(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-xl font-medium mb-2 -ml-[20rem]">Formula</label>
                <select
                  className="w-60 -ml-[9.5rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  value={paintFormula}
                  onChange={(e) => setPaintFormula(e.target.value)}
                  required
                >
                  <option value="">Select Formula...</option>
                  {formulasOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2 ml-14 mt-2 mb-3">
                <button type="submit" className="bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold">
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closePaintTypeEdit}
                >
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[34rem] h-80 px-2 py-2">
            <div>
              <button className="text-red-500 ml-[95%]" onClick={closeModal}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitTileName}>
              <div className="mb-4">
                <label className="block text-base font-medium mb-2 -ml-[20.5rem]">Paint Variant</label>
                <input
                  type="text"
                  className="w-[27rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-12 focus:outline-none"
                  placeholder="Enter here"
                  onChange={(e) => setPaintName(e.target.value)}
                  required
                />
              </div>
              <div className=' flex ml-8 '>
                <div className="mb-4">
                  <label className="block text-base font-medium mb-2 -ml-20">Type</label>
                  <select
                    className="w-36 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-12 focus:outline-none"
                    value={paintType}
                    onChange={(e) => setPaintType(e.target.value)}
                    required
                  >
                    <option value="Interior">Interior</option>
                    <option value="Exterior">Exterior</option>
                    {paintTypeOptions.length > 0 ? (
                      paintTypeOptions.map((option, index) => (
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
                  <label className="block text-base font-medium mb-2 -ml-6">Cover/Sqft</label>
                  <input
                    type="text"
                    className="w-32 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-12 focus:outline-none"
                    placeholder="Enter here"
                    onChange={(e) => setPaintCoverBySqft(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-5 mt-4 ml-12">
                <button
                  type="submit"
                  className="btn bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={closeModal}>
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
                <label className="block text-xl font-medium mb-2 -ml-72">Area Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Area Name"
                  onChange={(e) => setAreaName(e.target.value)}
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
                  onClick={closeAreaName}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isPaintTypeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] px-2 py-2">
            <div>
              <button className="text-[#E4572E] ml-[95%]" onClick={closePaintType}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitPaintType}>
              <div className="mb-4">
                <label className="block text-xl font-medium mb-2 -ml-[17rem]">Paint Item</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
                  placeholder="Enter Type"
                  onChange={(e) => setPaintTypes(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 -ml-36">
                <label className="block text-base font-medium mb-2 -ml-48">Formula</label>
                <select
                  className="w-60 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-14 focus:outline-none"
                  value={paintFormula}
                  onChange={(e) => setPaintFormula(e.target.value)}
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
                  onClick={closePaintType}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isFormulaOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
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
                className="w-96 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
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
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="bg-white rounded-md w-[30rem] h-60 px-2 py-2">
            <div>
              <button className="text-[#E4572E] ml-[95%]" onClick={closeFloorName}>
                <img src={cross} alt='cross' className='w-5 h-5' />
              </button>
            </div>
            <form onSubmit={handleSubmitTileFloorName}>
              <div className="mb-4">
                <label className="block text-xl font-medium mb-2 -ml-72">Floor Name</label>
                <input
                  type="text"
                  className="w-96 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-14 focus:outline-none"
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
      {isPaintColorCodeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[27rem] px-2 py-2">
            <button className="text-[#E4572E] ml-[95%]" onClick={closeTileSize}>
              <img src={cross} alt="close" className="w-5 h-5" />
            </button>
            <form onSubmit={handleSubmitPaintColor}>
              <div className="mb-4 ml-12">
                <label className="block text-base font-medium mb-2 -ml-[19rem]">Paint Color</label>
                <input
                  type="text"
                  name="tileSize"
                  className="w-[20rem] -ml-16 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-12 focus:outline-none"
                  placeholder="Enter here.."
                  value={paintColor}
                  onChange={(e) => setPaintColor(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2 ml-12 -mb-4">
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer flex items-center text-orange-600 font-bold"
                >
                  <img src={attach} alt="attach" className="w-5 h-5" />
                  <h1 className="ml-4 text-lg">Attach file</h1>
                </label>
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  onChange={paintImageUpload}
                />
                {selectedFileName && (
                  <span className="text-gray-600 ml-4 text-sm italic">
                    {selectedFileName}
                  </span>
                )}
              </div>
              <div className="flex space-x-2 mt-8 ml-12 mb-4">
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
          <div className="bg-white rounded-md w-[34rem] h-80 p-6 relative">
            <button
              className="absolute top-4 right-4 text-red-500"
              onClick={() => setIsEditModalOpen(false)}
            >
              <img src={cross} alt="Close" className="w-5 h-5" />
            </button>
            <form onSubmit={(e) => {
              e.preventDefault();
              const paintVariantData = {
                paintName,
                paintType,
                paintCoverBySqft,
              };
              editPaintVariant(paintVariantData);
            }}>
              <div className="mb-4">
                <label className="block text-base font-medium mb-2 -ml-[20.5rem]">Paint Variant</label>
                <input
                  type="text"
                  className="w-[27rem] border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-12 focus:outline-none"
                  placeholder="Enter here"
                  value={paintName}
                  onChange={(e) => setPaintName(e.target.value)}
                  required
                />
              </div>
              <div className=' flex ml-4 '>
                <div className="mb-4">
                  <label className="block text-base font-medium mb-2 -ml-20">Type</label>
                  <select
                    className="w-36 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-12 focus:outline-none"
                    value={paintType}
                    onChange={(e) => setPaintType(e.target.value)}
                    required
                  >
                    <option value="Interior">Interior</option>
                    <option value="Exterior">Exterior</option>
                    {paintTypeOptions.length > 0 ? (
                      paintTypeOptions.map((option, index) => (
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
                  <label className="block text-base font-medium mb-2 -ml-6">Cover/Sqft</label>
                  <input
                    type="text"
                    className="w-32 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-12 focus:outline-none"
                    placeholder="Enter here"
                    value={paintCoverBySqft}
                    onChange={(e) => setPaintCoverBySqft(e.target.value)}
                    required
                  />
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
      {showEditModal && editingPaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-md w-[24rem] p-6 relative">
            <button
              className="absolute top-4 right-4 text-[#E4572E]"
              onClick={() => setShowEditModal(false)}
            >
              <img src={cross} alt="Close" className="w-5 h-5" />
            </button>
            <form onSubmit={handlePaintUpdate}>
              <div className="mb-4 -ml-6">
                <label className="block font-semibold -ml-[11.5rem] mb-2">Color Code</label>
                <input
                  type="text"
                  className="w-72 ml-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded-lg h-12 focus:outline-none"
                  value={editingPaint.paintColor}
                  onChange={(e) =>
                    setEditingPaint({ ...editingPaint, paintColor: e.target.value })
                  }
                />
              </div>
              <div className="mb-4 ml-6">
                {editingPaint.paintColorImage ? (
                  <img
                    src={editingPaint.paintColorImage.startsWith("data:image")
                      ? editingPaint.paintColorImage
                      : `data:image/png;base64,${editingPaint.paintColorImage}`}
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
              <div className="flex space-x-2 ml-6 mb-3">
                <button type="submit" className="bg-[#BF9853] text-white px-8 py-2 rounded-lg font-semibold">
                  Save
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedFileNames("");
                  }}
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
      <ModalPaintItem
        isOpen={isPaintItemOpens}
        onClose={closePaintItemModals}
        onFileChange={handleFileChange}
        onUpload={handleUploadPaintItem}
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
export default PaintAddInput;

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
function ModalPaintItem({ isOpen, onClose, onFileChange, onUpload }) {
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