import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import delt from '../Images/Worng.svg';
import add from '../Images/Right.svg';
import Edit from '../Images/Edit.svg';
import jsPDF from 'jspdf';
import deletes from '../Images/Delete.svg';
import AreaTable from "./AreaTable";
import "jspdf-autotable";
const BathFixtur = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bathClientName, setBathClientName] = useState(null);
  const [bathClientSNo, setBathClientSNo] = useState("");
  const [fileOptions, setFileOptions] = useState([]);
  const [filteredFileOptions, setFilteredFileOptions] = useState([]);
  const [bathSelectedFile, setBathSelectedFile] = useState(null);
  const [selectedClientData, setSelectedClientData] = useState({});
  const [siteOptions, setSiteOptions] = useState([]);
  const [floorOptions, setFloorOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(new Set());
  const [areaTables, setAreaTables] = useState({});
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [types, setTypes] = useState([]);
  const [itemNames, setItemNames] = useState([]);
  const [brandNames, setBrandNames] = useState([]);
  const [bathModelData, setBathModelData] = useState([]);
  const [isOCPopupOpen, setIsOCPopupOpen] = useState(false);
  const [ocImageSelection, setOCImageSelection] = useState('');
  const [isModalImageOpenOC, setIsModalImageOpenOC] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [isECPopupOpen, setIsECPopupOpen] = useState(false);
  const [isCCPopupOpen, setIsCCPopupOpen] = useState(false);
  const [isSCPopupOpen, setIsSCPopupOpen] = useState(false);
  const [bathFullData, setBathFullData] = useState([]);
  const [selectedFloors, setSelectedFloors] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [bathFloors, setBathFloors] = useState([
    {
      floorName: "Ground Floor",
      areaName: "",
      tiles: [{ Sno: "" }],
    },
  ]);
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const fetchBathModelData = useCallback(async () => {
    try {
      const response = await fetch("https://backendaab.in/aabuilderDash/api/bath_model/getAll");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const bathDataWithImages = await Promise.all(
        data.map(async (model) => {
          let imageBase64 = model.image;
          let technicalImageBase64 = model.technicalImage;

          if (model.image instanceof Blob) {
            imageBase64 = await convertBlobToBase64(model.image);
          }

          if (model.technicalImage instanceof Blob) {
            technicalImageBase64 = await convertBlobToBase64(model.technicalImage);
          }

          return {
            ...model,
            image: imageBase64,
            technicalImage: technicalImageBase64,
          };
        })
      );
      setBathModelData(bathDataWithImages);
    } catch (error) {
      console.error("Error fetching paint data:", error);
    }
  }, []);
  useEffect(() => {
    fetchBathModelData();
  }, [fetchBathModelData]);

  useEffect(() => {
    fetchItemNames();
  }, []);
  const fetchItemNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/bath/getAll/item');
      if (response.ok) {
        const data = await response.json();
        setItemNames(data);
      } else {
        setMessage('Error fetching item names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching item names.');
    }
  };
  const handleConfirmOC = (selectedDetails) => {
    if (ocImageSelection.includes('With Image')) {
      generateOCPDFWithImage(selectedDetails);
    }
    if (ocImageSelection.includes('Without Image')) {
      generateOCPDFWithOutImage(selectedDetails);
    }

    setOCImageSelection([]);
    setIsModalImageOpenOC(false);
  };
  const handleOCSelectionChange = (value) => {
    setOCImageSelection((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleCloseModalOC = () => {
    setOCImageSelection([]);
    setIsModalImageOpenOC(false);
  }
  useEffect(() => {
    fetchBrandNames();
  }, []);
  const fetchBrandNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/brand_names/getAll');
      if (response.ok) {
        const data = await response.json();
        setBrandNames(data);
      } else {
        setMessage('Error fetching Brand names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching Brand names.');
    }
  };
  useEffect(() => {
    fetchTypes();
  }, []);
  const fetchTypes = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/bath_types/getAll');
      if (response.ok) {
        const data = await response.json();
        setTypes(data);
      } else {
        setMessage('Error fetching Brand names.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching Brand names.');
    }
  };
  const generateSCPDF = (selectedDetails) => {
    const doc = new jsPDF();
    const siteName = bathClientName.label;
    const header = () => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BATH FIXTURES SHEET", 14, 15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const clientLabel = "CLIENT: ";
      doc.text(clientLabel, 14, 33);
      const labelWidth = doc.getTextWidth(clientLabel);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const siteNameText = siteName.toUpperCase();
      doc.text(siteNameText, 14 + labelWidth, 33);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("STOCKING CHART", doc.internal.pageSize.width - 44, 15);
      doc.setFont("helvetica", "normal");
      const tmsDate = `BFS SC ${bathClientSNo} ${bathSelectedFile.label}.1`;
      const textWidth = doc.getTextWidth(tmsDate);
      const rightMargin = 14;
      const pageWidth = doc.internal.pageSize.width;
      const startX = pageWidth - rightMargin - textWidth;
      doc.text(tmsDate, startX, 27);
      doc.setDrawColor('#BF9853');
      doc.setLineWidth(1);
      doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
    };
    const footer = () => {
      const pageWidth = doc.internal.pageSize.width;
      const footerY = doc.internal.pageSize.height - 17;
      doc.setDrawColor(150);
      doc.setLineWidth(0.5);
      doc.line(14, footerY, pageWidth - 14, footerY);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.text("AA BUILDERS", 14, doc.internal.pageSize.height - 12.5);
      doc.setFontSize(9);
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      const currentPageText = `${currentPage} |`;
      const pageText = " P a g e";
      doc.setTextColor(0, 0, 0);
      doc.text(currentPageText, pageWidth - 19 - doc.getTextWidth(pageText), doc.internal.pageSize.height - 12.5);
      doc.setTextColor(200, 200, 200);
      doc.text(pageText, pageWidth - 25, doc.internal.pageSize.height - 12.5);
    };
    const body = [];
    let lastValidFloorName = "";
    const renderedFloors = new Set();
    const imageMap = {};
    const fixedImgWidth = 28;
    const fixedImgHeight = 20;
    const fixedRowHeight = fixedImgHeight + 4;
    let rowIndex = 0;
    let floorCounter = 0;
    const floorSerialMap = {};
    const areaRowCounters = {};
    bathFloors.forEach((floor) => {
      const currentFloorName = floor.floorName?.trim();
      const floorName = currentFloorName || lastValidFloorName;
      if (currentFloorName) lastValidFloorName = floorName;
      const selectedFloor = selectedDetails.find(f => f.floorName === floorName);
      if (!selectedFloor) return;
      const allowedAreas = new Set(selectedFloor.areas);
      const tiles = areaTables[floor.id] || [];
      const filteredTiles = tiles.filter(row => allowedAreas.has(floor.areaName));
      if (!filteredTiles.length) return;
      if (!renderedFloors.has(floorName)) {
        const floorSerial = String.fromCharCode(65 + floorCounter);
        floorSerialMap[floorName] = floorSerial;
        body.push([
          { content: `${floorSerial}        ${floorName}`, colSpan: 9, styles: { halign: 'left', fontStyle: 'bold' } }
        ]);
        renderedFloors.add(floorName);
        rowIndex++;
        floorCounter++;
        areaRowCounters[floorName] = 1;
      }
      const renderedAreaNames = new Set();
      filteredTiles.forEach((row) => {
        const areaName = floor.areaName || "N/A";
        const areaToShow = renderedAreaNames.has(areaName) ? "" : areaName;
        const serialToShow = areaToShow ? `${areaRowCounters[floorName]++}` : "";
        if (areaToShow) renderedAreaNames.add(areaName);
        body.push([
          serialToShow,
          areaToShow,
          row.itemName || "",
          row.model || "",
          row.type || "",
          row.qty,
          { content: "", rowHeight: fixedRowHeight },
        ]);
        if (row.image) imageMap[rowIndex] = row.image;
        rowIndex++;
      });
    });
    const tableStartY = 44;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.autoTable({
      startY: tableStartY,
      head: [["S.No", "Description", "Item", "Model", "Type", "Qty", "Image"]],
      body,
      styles: { fontSize: 10 },
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center ",
        fontSize: 11,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { halign: "left", cellWidth: 34 },
        2: { halign: "left", cellWidth: 47 },
        3: { halign: "center", cellWidth: 20 },
        4: { halign: "center", cellWidth: 20 },
        5: { halign: "center", cellWidth: 15 },
        6: { halign: "center", cellWidth: 32 },
      },
      margin: { left: 14, right: 14, top: 44 },
      didDrawPage: (data) => {
        header();
        footer();
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
      },
      didParseCell: function (data) {
        if (data.column.index === 6 && data.cell.raw?.rowHeight) {
          data.row.height = Math.max(data.row.height, data.cell.raw.rowHeight);
        }
      },
      didDrawCell: (data) => {
        if (data.section === "head") {
          const { doc, cell } = data;
          const startX = cell.x;
          const startY = cell.y + cell.height;
          const endX = cell.x + cell.width;
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.7);
          doc.line(startX, startY, endX, startY);
        }
        if (data.section === "body" && data.column.index === 6) {
          const imgData = imageMap[data.row.index];
          if (imgData) {
            const padding = 2;
            const cellWidth = data.cell.width;
            const cellHeight = data.cell.height;
            const imgWidth = Math.min(fixedImgWidth, cellWidth - padding * 2);
            const imgHeight = Math.min(fixedImgHeight, cellHeight - padding * 2);
            const x = data.cell.x + (cellWidth - imgWidth) / 2;
            const y = data.cell.y + (cellHeight - imgHeight) / 2;
            doc.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
          }
        }
      },
    });
    doc.save("bathroom_specifications.pdf");
  };
  const getRevisionNumber = async (clientName) => {
    try {
      const clientResponse = await fetch("https://backendaab.in/aabuilderDash/api/bath_fixture_calculation/all");
      if (!clientResponse.ok) {
        throw new Error("Failed to fetch calculations from the backend");
      }
      const clientData = await clientResponse.json();
      const matchingClientCalculations = clientData.filter(
        (calculation) =>
          calculation.clientName === clientName &&
          !(calculation.fileName && calculation.fileName.includes("dumyFile"))
      );
      return matchingClientCalculations.length;
    } catch (error) {
      console.error("Error fetching revision number:", error.message);
      return 0;
    }
  };
  const stockingChartPDF = async () => {
    const doc = new jsPDF();
    const formatDateForName = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };
    const selectedDate = formatDateForName(date);
    const siteName = bathClientName.label;
    const clientId = bathClientSNo || 0;
    const revisionCount = await getRevisionNumber(bathClientName.label);
    const revisionNumber = `R ${revisionCount}`;
    const header = () => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BATH FIXTURES SHEET", 14, 15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const clientLabel = "CLIENT: ";
      doc.text(clientLabel, 14, 33);
      const labelWidth = doc.getTextWidth(clientLabel);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const siteNameText = siteName.toUpperCase();
      doc.text(siteNameText, 14 + labelWidth, 33);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("STOCKING CHART", doc.internal.pageSize.width - 46, 15);
      doc.setFont("helvetica", "normal");
      const tmsDate = `BFS SC ${clientId} - ${selectedDate} - ${revisionNumber}`;
      const textWidth = doc.getTextWidth(tmsDate);
      const rightMargin = 14;
      const pageWidth = doc.internal.pageSize.width;
      const startX = pageWidth - rightMargin - textWidth;
      doc.text(tmsDate, startX, 27);
      doc.setDrawColor('#BF9853');
      doc.setLineWidth(1);
      doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
    };
    const footer = () => {
      const pageWidth = doc.internal.pageSize.width;
      const footerY = doc.internal.pageSize.height - 17;
      doc.setDrawColor(150);
      doc.setLineWidth(0.5);
      doc.line(14, footerY, pageWidth - 14, footerY);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.text("AA BUILDERS", 14, doc.internal.pageSize.height - 12.5);
      doc.setFontSize(9);
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      const currentPageText = `${currentPage} |`;
      const pageText = " P a g e";
      doc.setTextColor(0, 0, 0);
      doc.text(currentPageText, pageWidth - 19 - doc.getTextWidth(pageText), doc.internal.pageSize.height - 12.5);
      doc.setTextColor(200, 200, 200);
      doc.text(pageText, pageWidth - 25, doc.internal.pageSize.height - 12.5);
    };
    const body = [];
    let lastValidFloorName = "";
    const renderedFloors = new Set();
    const imageMap = {};
    const fixedImgWidth = 28;
    const fixedImgHeight = 20;
    const fixedRowHeight = fixedImgHeight + 4;
    let rowIndex = 0;
    let floorCounter = 0;
    const floorSerialMap = {};
    const areaRowCounters = {};
    bathFloors.forEach((floor) => {
      const currentFloorName = floor.floorName?.trim();
      const floorName = currentFloorName || lastValidFloorName;
      if (currentFloorName) lastValidFloorName = floorName;
    
      const tiles = areaTables[floor.id] || [];
      if (!tiles.length) return;
    
      if (!renderedFloors.has(floorName)) {
        const floorSerial = String.fromCharCode(65 + floorCounter);
        floorSerialMap[floorName] = floorSerial;
        body.push([
          {
            content: `${floorSerial}        ${floorName}`,
            colSpan: 9,
            styles: { halign: 'left', fontStyle: 'bold' }
          }
        ]);
        renderedFloors.add(floorName);
        rowIndex++;
        floorCounter++;
        areaRowCounters[floorName] = 1;
      }
    
      const renderedAreaNames = new Set();
      tiles.forEach((row) => {
        const areaName = floor.areaName || "N/A";
        const areaToShow = renderedAreaNames.has(areaName) ? "" : areaName;
        const serialToShow = areaToShow ? `${areaRowCounters[floorName]++}` : "";
        if (areaToShow) renderedAreaNames.add(areaName);
    
        body.push([
          serialToShow,
          areaToShow,
          row.itemName || "",
          row.model || "",
          row.type || "",
          row.qty,
          { content: "", rowHeight: fixedRowHeight },
        ]);
    
        if (row.image) imageMap[rowIndex] = row.image;
        rowIndex++;
      });
    });    
    const tableStartY = 44;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.autoTable({
      startY: tableStartY,
      head: [["S.No", "Description", "Item", "Model", "Type", "Qty", "Image"]],
      body,
      styles: { fontSize: 10 },
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center ",
        fontSize: 11,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { halign: "left", cellWidth: 34 },
        2: { halign: "left", cellWidth: 47 },
        3: { halign: "center", cellWidth: 20 },
        4: { halign: "center", cellWidth: 20 },
        5: { halign: "center", cellWidth: 15 },
        6: { halign: "center", cellWidth: 32 },
      },
      margin: { left: 14, right: 14, top: 44 },
      didDrawPage: (data) => {
        header();
        footer();
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
      },
      didParseCell: function (data) {
        if (data.column.index === 6 && data.cell.raw?.rowHeight) {
          data.row.height = Math.max(data.row.height, data.cell.raw.rowHeight);
        }
      },
      didDrawCell: (data) => {
        if (data.section === "head") {
          const { doc, cell } = data;
          const startX = cell.x;
          const startY = cell.y + cell.height;
          const endX = cell.x + cell.width;
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.7);
          doc.line(startX, startY, endX, startY);
        }
        if (data.section === "body" && data.column.index === 6) {
          const imgData = imageMap[data.row.index];
          if (imgData) {
            const padding = 2;
            const cellWidth = data.cell.width;
            const cellHeight = data.cell.height;
            const imgWidth = Math.min(fixedImgWidth, cellWidth - padding * 2);
            const imgHeight = Math.min(fixedImgHeight, cellHeight - padding * 2);
            const x = data.cell.x + (cellWidth - imgWidth) / 2;
            const y = data.cell.y + (cellHeight - imgHeight) / 2;
            doc.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
          }
        }
      },
    });
    const filename = `BFS SC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
    doc.save(filename);
    return doc.output("blob");
  };
  const orderCopyPDF = async () => {
    const doc = new jsPDF();
    const formatDateForName = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };
    const selectedDate = formatDateForName(date);
    const siteName = bathClientName.label;
    const clientId = bathClientSNo || 0;
    const revisionCount = await getRevisionNumber(bathClientName.label);
    const revisionNumber = `R ${revisionCount}`;
    const header = () => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BATH FIXTURES SHEET", 14, 15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const clientLabel = "CLIENT: ";
      doc.text(clientLabel, 14, 33);
      const labelWidth = doc.getTextWidth(clientLabel);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const siteNameText = siteName.toUpperCase();
      doc.text(siteNameText, 14 + labelWidth, 33);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
      doc.setFont("helvetica", "normal");
      const tmsDate = `BFS OC ${clientId} - ${selectedDate} - ${revisionNumber}`;
      const textWidth = doc.getTextWidth(tmsDate);
      const rightMargin = 14;
      const pageWidth = doc.internal.pageSize.width;
      const startX = pageWidth - rightMargin - textWidth;
      doc.text(tmsDate, startX, 27);
      doc.setDrawColor('#BF9853');
      doc.setLineWidth(1);
      doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
    };
    const footer = () => {
      const pageWidth = doc.internal.pageSize.width;
      const footerY = doc.internal.pageSize.height - 17;
      doc.setDrawColor(150);
      doc.setLineWidth(0.5);
      doc.line(14, footerY, pageWidth - 14, footerY);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.text("AA BUILDERS", 14, doc.internal.pageSize.height - 12.5);
      doc.setFontSize(9);
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      const currentPageText = `${currentPage} |`;
      const pageText = " P a g e";
      doc.setTextColor(0, 0, 0);
      doc.text(currentPageText, pageWidth - 19 - doc.getTextWidth(pageText), doc.internal.pageSize.height - 12.5);
      doc.setTextColor(200, 200, 200);
      doc.text(pageText, pageWidth - 25, doc.internal.pageSize.height - 12.5);
    };
    const groupedItems = {};
    const imageMap = {};
    const fixedImgWidth = 28;
    const fixedImgHeight = 20;
    const fixedRowHeight = fixedImgHeight + 4;
    let lastValidFloorName = "";
    bathFloors.forEach((floor) => {
      const currentFloorName = floor.floorName?.trim();
      const floorName = currentFloorName || lastValidFloorName;
      if (currentFloorName) lastValidFloorName = floorName;
    
      const tiles = areaTables[floor.id] || [];
      if (!tiles.length) return;
    
      tiles.forEach((row) => {
        const key = `${row.itemName || ""}__${row.brand || ""}__${row.model || ""}__${row.type || ""}`;
        if (!groupedItems[key]) {
          groupedItems[key] = {
            itemName: row.itemName || "",
            brand: row.brand || "",
            model: row.model || "",
            type: row.type || "",
            qty: 0,
            image: row.image || null,
          };
        }
        groupedItems[key].qty += Number(row.qty) || 0;
        if (row.image) groupedItems[key].image = row.image; // Prefer the current row's image
      });
    });
    
    // Build final `body` with grouped data
    const body = [];
    let rowIndex = 0;
    let serial = 1;
    Object.values(groupedItems).forEach(item => {
      body.push([
        serial++,
        item.itemName,
        item.brand,
        item.model,
        item.type,
        item.qty,
        { content: "", rowHeight: fixedRowHeight }
      ]);
      if (item.image) {
        imageMap[rowIndex] = item.image;
      }
      rowIndex++;
    });
    
    const tableStartY = 44;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.autoTable({
      startY: tableStartY,
      head: [["S.No", "Item", "Brand", "Model", "Type", "Qty", "Image"]],
      body,
      styles: { fontSize: 10 },
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center ",
        fontSize: 11,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { halign: "left", cellWidth: 42 },
        2: { halign: "left", cellWidth: 35 },
        3: { halign: "left", cellWidth: 23 },
        4: { halign: "left", cellWidth: 20 },
        5: { halign: "center", cellWidth: 16 },
        6: { halign: "center", cellWidth: 32 },
      },
      margin: { left: 14, right: 14, top: 44 },
      didDrawPage: (data) => {
        header();
        footer();
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
      },
      didParseCell: function (data) {
        if (data.column.index === 6 && data.cell.raw?.rowHeight) {
          data.row.height = Math.max(data.row.height, data.cell.raw.rowHeight);
        }
      },
      didDrawCell: (data) => {
        if (data.section === "head") {
          const { doc, cell } = data;
          const startX = cell.x;
          const startY = cell.y + cell.height;
          const endX = cell.x + cell.width;
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.7);
          doc.line(startX, startY, endX, startY);
        }
        if (data.section === "body" && data.column.index === 6) {
          const imgData = imageMap[data.row.index];
          if (imgData) {
            const padding = 2;
            const cellWidth = data.cell.width;
            const cellHeight = data.cell.height;
            const imgWidth = Math.min(fixedImgWidth, cellWidth - padding * 2);
            const imgHeight = Math.min(fixedImgHeight, cellHeight - padding * 2);
            const x = data.cell.x + (cellWidth - imgWidth) / 2;
            const y = data.cell.y + (cellHeight - imgHeight) / 2;
            doc.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
          }
        }
      },
    });
    const filename = `BFS OC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
    doc.save(filename);
    return doc.output("blob");
  };
  const engineerCopyPDF = async () => {
    const doc = new jsPDF({
      orientation: "landscape",
    });
    const formatDateForName = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };
    const selectedDate = formatDateForName(date);
    const siteName = bathClientName.label;
    const clientId = bathClientSNo || 0;
    const revisionCount = await getRevisionNumber(bathClientName.label);
    const revisionNumber = `R ${revisionCount}`;
    const header = () => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BATH FIXTURES SHEET", 14, 15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const clientLabel = "CLIENT: ";
      doc.text(clientLabel, 14, 33);
      const labelWidth = doc.getTextWidth(clientLabel);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const siteNameText = siteName.toUpperCase();
      doc.text(siteNameText, 14 + labelWidth, 33);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
      doc.setFont("helvetica", "normal");
      const tmsDate = `BFS EC ${clientId} - ${selectedDate} - ${revisionNumber}`;
      const textWidth = doc.getTextWidth(tmsDate);
      const rightMargin = 14;
      const pageWidth = doc.internal.pageSize.width;
      const startX = pageWidth - rightMargin - textWidth;
      doc.text(tmsDate, startX, 27);
      doc.setDrawColor('#BF9853');
      doc.setLineWidth(1);
      doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
    };
    const footer = () => {
      const pageWidth = doc.internal.pageSize.width;
      const footerY = doc.internal.pageSize.height - 17;
      doc.setDrawColor(150);
      doc.setLineWidth(0.5);
      doc.line(14, footerY, pageWidth - 14, footerY);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.text("AA BUILDERS", 14, doc.internal.pageSize.height - 12.5);
      doc.setFontSize(9);
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      const currentPageText = `${currentPage} |`;
      const pageText = " P a g e";
      doc.setTextColor(0, 0, 0);
      doc.text(currentPageText, pageWidth - 19 - doc.getTextWidth(pageText), doc.internal.pageSize.height - 12.5);
      doc.setTextColor(200, 200, 200);
      doc.text(pageText, pageWidth - 25, doc.internal.pageSize.height - 12.5);
    };
    const body = [];
    let lastValidFloorName = "";
    const renderedFloors = new Set();
    const imageMap = {};
    const technicalImageMap = {};
    const fixedImgWidth = 28;
    const fixedImgHeight = 20;
    const fixedRowHeight = fixedImgHeight + 4;
    let rowIndex = 0;
    let floorCounter = 0;
    const floorSerialMap = {};
    const areaRowCounters = {};
    bathFloors.forEach((floor) => {
      const currentFloorName = floor.floorName?.trim();
      const floorName = currentFloorName || lastValidFloorName;
      if (currentFloorName) lastValidFloorName = floorName;
    
      const tiles = areaTables[floor.id] || [];
      if (!tiles.length) return;
    
      if (!renderedFloors.has(floorName)) {
        const floorSerial = String.fromCharCode(65 + floorCounter);
        floorSerialMap[floorName] = floorSerial;
        body.push([
          { content: `${floorSerial}        ${floorName}`, colSpan: 9, styles: { halign: 'left', fontStyle: 'bold' } }
        ]);
        renderedFloors.add(floorName);
        rowIndex++;
        floorCounter++;
        areaRowCounters[floorName] = 1;
      }
    
      const renderedAreaNames = new Set();
      tiles.forEach((row) => {
        const areaName = floor.areaName || "N/A";
        const areaToShow = renderedAreaNames.has(areaName) ? "" : areaName;
        const serialToShow = areaToShow ? `${areaRowCounters[floorName]++}` : "";
        if (areaToShow) renderedAreaNames.add(areaName);
    
        body.push([
          serialToShow,
          areaToShow,
          row.itemName || "",
          row.brand || "",
          row.model || "",
          row.type || "",
          row.qty,
          { content: "", rowHeight: fixedRowHeight },
          { content: "", rowHeight: fixedRowHeight }
        ]);
    
        if (row.image) imageMap[rowIndex] = row.image;
        if (row.technicalImage) technicalImageMap[rowIndex] = row.technicalImage;
        rowIndex++;
      });
    });
    
    const tableStartY = 44;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.autoTable({
      startY: tableStartY,
      head: [["S.No", "Description", "Item", "Brand", "Model", "Type", "Qty", "Image", "Technical Image"]],
      body,
      styles: { fontSize: 10 },
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center ",
        fontSize: 11,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { halign: "left", cellWidth: 35 },
        2: { halign: "left", cellWidth: 50 },
        3: { halign: "left", cellWidth: 40 },
        4: { halign: "center", cellWidth: 24 },
        5: { halign: "center", cellWidth: 24 },
        6: { halign: "center", cellWidth: 18 },
        7: { halign: "center", cellWidth: 32 },
        8: { halign: "center", cellWidth: 32 },
      },
      margin: { left: 14, right: 14, top: 44 },
      didDrawPage: (data) => {
        header();
        footer();
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
      },
      didParseCell: function (data) {
        if (data.column.index === 7 && data.cell.raw?.rowHeight) {
          data.row.height = Math.max(data.row.height, data.cell.raw.rowHeight);
        }
      },
      didDrawCell: (data) => {
        if (data.section === "head") {
          const { doc, cell } = data;
          const startX = cell.x;
          const startY = cell.y + cell.height;
          const endX = cell.x + cell.width;
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.7);
          doc.line(startX, startY, endX, startY);
        }
        if (data.column.index === 7) {
          const imgData = imageMap[data.row.index];
          if (imgData) {
            doc.addImage(
              imgData,
              "JPEG",
              data.cell.x + 2,
              data.cell.y + 2,
              fixedImgWidth,
              fixedImgHeight
            );
          }
        }
        if (data.column.index === 8) {
          const imgData = technicalImageMap[data.row.index];
          if (imgData) {
            doc.addImage(
              imgData,
              "JPEG",
              data.cell.x + 2,
              data.cell.y + 2,
              fixedImgWidth,
              fixedImgHeight
            );
          }
        }
      },
    });
    const filename = `BFS EC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
    doc.save(filename);
    return doc.output("blob");
  };
  const customerCopyPDF = async () => {
    const doc = new jsPDF({
      orientation: "landscape",
    });
    const formatDateForName = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };
    const selectedDate = formatDateForName(date);
    const siteName = bathClientName.label;
    const clientId = bathClientSNo || 0;
    const revisionCount = await getRevisionNumber(bathClientName.label);
    const revisionNumber = `R ${revisionCount}`;
    const header = () => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BATH FIXTURES SHEET", 14, 15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const clientLabel = "CLIENT: ";
      doc.text(clientLabel, 14, 33);
      const labelWidth = doc.getTextWidth(clientLabel);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const siteNameText = siteName.toUpperCase();
      doc.text(siteNameText, 14 + labelWidth, 33);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 44, 15);
      doc.setFont("helvetica", "normal");
      const tmsDate = `BFS CC ${clientId} - ${selectedDate} - ${revisionNumber}`;
      const textWidth = doc.getTextWidth(tmsDate);
      const rightMargin = 14;
      const pageWidth = doc.internal.pageSize.width;
      const startX = pageWidth - rightMargin - textWidth;
      doc.text(tmsDate, startX, 27);
      doc.setDrawColor('#BF9853');
      doc.setLineWidth(1);
      doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
    };
    const footer = () => {
      const pageWidth = doc.internal.pageSize.width;
      const footerY = doc.internal.pageSize.height - 17;
      doc.setDrawColor(150);
      doc.setLineWidth(0.5);
      doc.line(14, footerY, pageWidth - 14, footerY);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.text("AA BUILDERS", 14, doc.internal.pageSize.height - 12.5);
      doc.setFontSize(9);
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      const currentPageText = `${currentPage} |`;
      const pageText = " P a g e";
      doc.setTextColor(0, 0, 0);
      doc.text(currentPageText, pageWidth - 19 - doc.getTextWidth(pageText), doc.internal.pageSize.height - 12.5);
      doc.setTextColor(200, 200, 200);
      doc.text(pageText, pageWidth - 25, doc.internal.pageSize.height - 12.5);
    };
    const body = [];
    let lastValidFloorName = "";
    const renderedFloors = new Set();
    const imageMap = {};
    const fixedImgWidth = 28;
    const fixedImgHeight = 20;
    const fixedRowHeight = fixedImgHeight + 4;
    let rowIndex = 0;
    let floorCounter = 0;
    const floorSerialMap = {};
    const areaRowCounters = {};
    bathFloors.forEach((floor) => {
      const currentFloorName = floor.floorName?.trim();
      const floorName = currentFloorName || lastValidFloorName;
      if (currentFloorName) lastValidFloorName = floorName;
    
      const tiles = areaTables[floor.id] || [];
      if (!tiles.length) return;
    
      if (!renderedFloors.has(floorName)) {
        const floorSerial = String.fromCharCode(65 + floorCounter);
        floorSerialMap[floorName] = floorSerial;
        body.push([
          { content: `${floorSerial}        ${floorName}`, colSpan: 9, styles: { halign: 'left', fontStyle: 'bold' } }
        ]);
        renderedFloors.add(floorName);
        rowIndex++;
        floorCounter++;
        areaRowCounters[floorName] = 1;
      }
    
      const renderedAreaNames = new Set();
      tiles.forEach((row) => {
        const areaName = floor.areaName || "N/A";
        const areaToShow = renderedAreaNames.has(areaName) ? "" : areaName;
        const serialToShow = areaToShow ? `${areaRowCounters[floorName]++}` : "";
        if (areaToShow) renderedAreaNames.add(areaName);
    
        body.push([
          serialToShow,
          areaToShow,
          row.itemName || "",
          row.brand || "",
          row.model || "",
          row.type || "",
          row.qty,
          { content: "", rowHeight: fixedRowHeight },
        ]);
    
        if (row.image) imageMap[rowIndex] = row.image;
        rowIndex++;
      });
    });
    
    const tableStartY = 44;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.autoTable({
      startY: tableStartY,
      head: [["S.No", "Description", "Item", "Brand", "Model", "Type", "Qty", "Image"]],
      body,
      styles: { fontSize: 10 },
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center ",
        fontSize: 11,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { halign: "left", cellWidth: 40 },
        2: { halign: "left", cellWidth: 60 },
        3: { halign: "left", cellWidth: 50 },
        4: { halign: "center", cellWidth: 27 },
        5: { halign: "center", cellWidth: 27 },
        6: { halign: "center", cellWidth: 20 },
        7: { halign: "center", cellWidth: 32 },
      },
      margin: { left: 14, right: 14, top: 44 },
      didDrawPage: (data) => {
        header();
        footer();
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
      },
      didParseCell: function (data) {
        if (data.column.index === 7 && data.cell.raw?.rowHeight) {
          data.row.height = Math.max(data.row.height, data.cell.raw.rowHeight);
        }
      },
      didDrawCell: (data) => {
        if (data.section === "head") {
          const { doc, cell } = data;
          const startX = cell.x;
          const startY = cell.y + cell.height;
          const endX = cell.x + cell.width;
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.7);
          doc.line(startX, startY, endX, startY);
        }
        if (data.column.index === 7) {
          const imgData = imageMap[data.row.index];
          if (imgData) {
            doc.addImage(
              imgData,
              "JPEG",
              data.cell.x + 2,
              data.cell.y + 2,
              fixedImgWidth,
              fixedImgHeight
            );
          }
        }
      },
    });
    const filename = `BFS CC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
    doc.save(filename);
    return doc.output("blob");
  };
  const generateOCPDFWithImage = (selectedDetails) => {
    const doc = new jsPDF();
    const siteName = bathClientName.label;
    const header = () => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BATH FIXTURES SHEET", 14, 15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const clientLabel = "CLIENT: ";
      doc.text(clientLabel, 14, 33);
      const labelWidth = doc.getTextWidth(clientLabel);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const siteNameText = siteName.toUpperCase();
      doc.text(siteNameText, 14 + labelWidth, 33);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
      doc.setFont("helvetica", "normal");
      const tmsDate = `PMS OC ${bathClientSNo} .1`;
      const textWidth = doc.getTextWidth(tmsDate);
      const rightMargin = 14;
      const pageWidth = doc.internal.pageSize.width;
      const startX = pageWidth - rightMargin - textWidth;
      doc.text(tmsDate, startX, 27);
      doc.setDrawColor('#BF9853');
      doc.setLineWidth(1);
      doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
    };
    const footer = () => {
      const pageWidth = doc.internal.pageSize.width;
      const footerY = doc.internal.pageSize.height - 17;
      doc.setDrawColor(150);
      doc.setLineWidth(0.5);
      doc.line(14, footerY, pageWidth - 14, footerY);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.text("AA BUILDERS", 14, doc.internal.pageSize.height - 12.5);
      doc.setFontSize(9);
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      const currentPageText = `${currentPage} |`;
      const pageText = " P a g e";
      doc.setTextColor(0, 0, 0);
      doc.text(currentPageText, pageWidth - 19 - doc.getTextWidth(pageText), doc.internal.pageSize.height - 12.5);
      doc.setTextColor(200, 200, 200);
      doc.text(pageText, pageWidth - 25, doc.internal.pageSize.height - 12.5);
    };
    const groupedItems = {};
    const imageMap = {};
    const fixedImgWidth = 28;
    const fixedImgHeight = 20;
    const fixedRowHeight = fixedImgHeight + 4;
    let lastValidFloorName = "";
    bathFloors.forEach((floor) => {
      const currentFloorName = floor.floorName?.trim();
      const floorName = currentFloorName || lastValidFloorName;
      if (currentFloorName) lastValidFloorName = floorName;
      const selectedFloor = selectedDetails.find(f => f.floorName === floorName);
      if (!selectedFloor) return;
      const allowedAreas = new Set(selectedFloor.areas);
      const tiles = areaTables[floor.id] || [];
      const filteredTiles = tiles.filter(row => allowedAreas.has(floor.areaName));
      if (!filteredTiles.length) return;
      filteredTiles.forEach((row) => {
        const key = `${row.itemName || ""}__${row.brand || ""}__${row.model || ""}__${row.type || ""}`;
        if (!groupedItems[key]) {
          groupedItems[key] = {
            itemName: row.itemName || "",
            brand: row.brand || "",
            model: row.model || "",
            type: row.type || "",
            qty: 0,
            image: row.image || null,
          };
        }
        groupedItems[key].qty += Number(row.qty) || 0;
        // If current row has image, prefer that image
        if (row.image) groupedItems[key].image = row.image;
      });
    });
    // Now build the final `body` with merged data
    const body = [];
    let rowIndex = 0;
    let serial = 1;
    Object.values(groupedItems).forEach(item => {
      body.push([
        serial++,
        item.itemName,
        item.brand,
        item.model,
        item.type,
        item.qty,
        { content: "", rowHeight: fixedRowHeight }
      ]);
      if (item.image) {
        imageMap[rowIndex] = item.image;
      }
      rowIndex++;
    });
    const tableStartY = 44;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.autoTable({
      startY: tableStartY,
      head: [["S.No", "Item", "Brand", "Model", "Type", "Qty", "Image"]],
      body,
      styles: { fontSize: 10 },
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center ",
        fontSize: 11,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { halign: "left", cellWidth: 42 },
        2: { halign: "left", cellWidth: 35 },
        3: { halign: "left", cellWidth: 23 },
        4: { halign: "left", cellWidth: 20 },
        5: { halign: "center", cellWidth: 16 },
        6: { halign: "center", cellWidth: 32 },
      },
      margin: { left: 14, right: 14, top: 44 },
      didDrawPage: (data) => {
        header();
        footer();
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
      },
      didParseCell: function (data) {
        if (data.column.index === 6 && data.cell.raw?.rowHeight) {
          data.row.height = Math.max(data.row.height, data.cell.raw.rowHeight);
        }
      },
      didDrawCell: (data) => {
        if (data.section === "head") {
          const { doc, cell } = data;
          const startX = cell.x;
          const startY = cell.y + cell.height;
          const endX = cell.x + cell.width;
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.7);
          doc.line(startX, startY, endX, startY);
        }
        if (data.section === "body" && data.column.index === 6) {
          const imgData = imageMap[data.row.index];
          if (imgData) {
            const padding = 2;
            const cellWidth = data.cell.width;
            const cellHeight = data.cell.height;
            const imgWidth = Math.min(fixedImgWidth, cellWidth - padding * 2);
            const imgHeight = Math.min(fixedImgHeight, cellHeight - padding * 2);
            const x = data.cell.x + (cellWidth - imgWidth) / 2;
            const y = data.cell.y + (cellHeight - imgHeight) / 2;
            doc.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
          }
        }
      },
    });
    doc.save("bathroom_specifications.pdf");
  };
  const generateOCPDFWithOutImage = (selectedDetails) => {
    const doc = new jsPDF();
    const siteName = bathClientName.label;
    const header = () => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BATH FIXTURES SHEET", 14, 15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const clientLabel = "CLIENT: ";
      doc.text(clientLabel, 14, 33);
      const labelWidth = doc.getTextWidth(clientLabel);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const siteNameText = siteName.toUpperCase();
      doc.text(siteNameText, 14 + labelWidth, 33);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
      doc.setFont("helvetica", "normal");
      const tmsDate = `PMS OC ${bathClientSNo} .1`;
      const textWidth = doc.getTextWidth(tmsDate);
      const rightMargin = 14;
      const pageWidth = doc.internal.pageSize.width;
      const startX = pageWidth - rightMargin - textWidth;
      doc.text(tmsDate, startX, 27);
      doc.setDrawColor('#BF9853');
      doc.setLineWidth(1);
      doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
    };
    const footer = () => {
      const pageWidth = doc.internal.pageSize.width;
      const footerY = doc.internal.pageSize.height - 17;
      doc.setDrawColor(150);
      doc.setLineWidth(0.5);
      doc.line(14, footerY, pageWidth - 14, footerY);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.text("AA BUILDERS", 14, doc.internal.pageSize.height - 12.5);
      doc.setFontSize(9);
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      const currentPageText = `${currentPage} |`;
      const pageText = " P a g e";
      doc.setTextColor(0, 0, 0);
      doc.text(currentPageText, pageWidth - 19 - doc.getTextWidth(pageText), doc.internal.pageSize.height - 12.5);
      doc.setTextColor(200, 200, 200);
      doc.text(pageText, pageWidth - 25, doc.internal.pageSize.height - 12.5);
    };
    const groupedItems = {};
    let lastValidFloorName = "";
    bathFloors.forEach((floor) => {
      const currentFloorName = floor.floorName?.trim();
      const floorName = currentFloorName || lastValidFloorName;
      if (currentFloorName) lastValidFloorName = floorName;
      const selectedFloor = selectedDetails.find(f => f.floorName === floorName);
      if (!selectedFloor) return;
      const allowedAreas = new Set(selectedFloor.areas);
      const tiles = areaTables[floor.id] || [];
      const filteredTiles = tiles.filter(row => allowedAreas.has(floor.areaName));
      if (!filteredTiles.length) return;
      filteredTiles.forEach((row) => {
        const key = `${row.itemName || ""}__${row.brand || ""}__${row.model || ""}__${row.type || ""}`;
        if (!groupedItems[key]) {
          groupedItems[key] = {
            itemName: row.itemName || "",
            brand: row.brand || "",
            model: row.model || "",
            type: row.type || "",
            qty: 0,
          };
        }
        groupedItems[key].qty += Number(row.qty) || 0;
      });
    });
    const body = [];
    let serial = 1;
    Object.values(groupedItems).forEach(item => {
      body.push([
        serial++,
        item.itemName,
        item.brand,
        item.model,
        item.type,
        item.qty
      ]);
    });
    const tableStartY = 44;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY, doc.internal.pageSize.width - 14, tableStartY);
    doc.autoTable({
      startY: tableStartY,
      head: [["S.No", "Item", "Brand", "Model", "Type", "Qty"]],
      body,
      styles: { fontSize: 10 },
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        fontSize: 11,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { halign: "left", cellWidth: 54 },
        2: { halign: "left", cellWidth: 40 },
        3: { halign: "left", cellWidth: 30 },
        4: { halign: "left", cellWidth: 24 },
        5: { halign: "center", cellWidth: 20 },
      },
      margin: { left: 14, right: 14, top: 44 },
      didDrawPage: (data) => {
        header();
        footer();
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY, doc.internal.pageSize.width - 14, tableStartY);
      },
      didDrawCell: (data) => {
        if (data.section === "head") {
          const { doc, cell } = data;
          const startX = cell.x;
          const startY = cell.y + cell.height;
          const endX = cell.x + cell.width;
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.7);
          doc.line(startX, startY, endX, startY);
        }
      },
    });
    doc.save("bathroom_specifications.pdf");
  };
  const generateECPDF = (selectedDetails) => {
    const doc = new jsPDF({
      orientation: "landscape",
    });
    const siteName = bathClientName.label;
    const header = () => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BATH FIXTURES SHEET", 14, 15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const clientLabel = "CLIENT: ";
      doc.text(clientLabel, 14, 33);
      const labelWidth = doc.getTextWidth(clientLabel);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const siteNameText = siteName.toUpperCase();
      doc.text(siteNameText, 14 + labelWidth, 33);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
      doc.setFont("helvetica", "normal");
      const tmsDate = `BFS EC ${bathClientSNo} .1`;
      const textWidth = doc.getTextWidth(tmsDate);
      const rightMargin = 14;
      const pageWidth = doc.internal.pageSize.width;
      const startX = pageWidth - rightMargin - textWidth;
      doc.text(tmsDate, startX, 27);
      doc.setDrawColor('#BF9853');
      doc.setLineWidth(1);
      doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
    };
    const footer = () => {
      const pageWidth = doc.internal.pageSize.width;
      const footerY = doc.internal.pageSize.height - 17;
      doc.setDrawColor(150);
      doc.setLineWidth(0.5);
      doc.line(14, footerY, pageWidth - 14, footerY);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.text("AA BUILDERS", 14, doc.internal.pageSize.height - 12.5);
      doc.setFontSize(9);
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      const currentPageText = `${currentPage} |`;
      const pageText = " P a g e";
      doc.setTextColor(0, 0, 0);
      doc.text(currentPageText, pageWidth - 19 - doc.getTextWidth(pageText), doc.internal.pageSize.height - 12.5);
      doc.setTextColor(200, 200, 200);
      doc.text(pageText, pageWidth - 25, doc.internal.pageSize.height - 12.5);
    };
    const body = [];
    let lastValidFloorName = "";
    const renderedFloors = new Set();
    const imageMap = {};
    const technicalImageMap = {};
    const fixedImgWidth = 28;
    const fixedImgHeight = 20;
    const fixedRowHeight = fixedImgHeight + 4;
    let rowIndex = 0;
    let floorCounter = 0;
    const floorSerialMap = {};
    const areaRowCounters = {};
    bathFloors.forEach((floor) => {
      const currentFloorName = floor.floorName?.trim();
      const floorName = currentFloorName || lastValidFloorName;
      if (currentFloorName) lastValidFloorName = floorName;
      const selectedFloor = selectedDetails.find(f => f.floorName === floorName);
      if (!selectedFloor) return;
      const allowedAreas = new Set(selectedFloor.areas);
      const tiles = areaTables[floor.id] || [];
      const filteredTiles = tiles.filter(row => allowedAreas.has(floor.areaName));
      if (!filteredTiles.length) return;
      if (!renderedFloors.has(floorName)) {
        const floorSerial = String.fromCharCode(65 + floorCounter);
        floorSerialMap[floorName] = floorSerial;
        body.push([
          { content: `${floorSerial}        ${floorName}`, colSpan: 9, styles: { halign: 'left', fontStyle: 'bold' } }
        ]);
        renderedFloors.add(floorName);
        rowIndex++;
        floorCounter++;
        areaRowCounters[floorName] = 1;
      }
      const renderedAreaNames = new Set();
      filteredTiles.forEach((row) => {
        const areaName = floor.areaName || "N/A";
        const areaToShow = renderedAreaNames.has(areaName) ? "" : areaName;
        const serialToShow = areaToShow ? `${areaRowCounters[floorName]++}` : "";
        if (areaToShow) renderedAreaNames.add(areaName);
        body.push([
          serialToShow,
          areaToShow,
          row.itemName || "",
          row.brand || "",
          row.model || "",
          row.type || "",
          row.qty,
          { content: "", rowHeight: fixedRowHeight },
          { content: "", rowHeight: fixedRowHeight }
        ]);
        if (row.image) imageMap[rowIndex] = row.image;
        if (row.technicalImage) technicalImageMap[rowIndex] = row.technicalImage;
        rowIndex++;
      });
    });
    const tableStartY = 44;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.autoTable({
      startY: tableStartY,
      head: [["S.No", "Description", "Item", "Brand", "Model", "Type", "Qty", "Image", "Technical Image"]],
      body,
      styles: { fontSize: 10 },
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center ",
        fontSize: 11,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { halign: "left", cellWidth: 35 },
        2: { halign: "left", cellWidth: 50 },
        3: { halign: "left", cellWidth: 40 },
        4: { halign: "center", cellWidth: 24 },
        5: { halign: "center", cellWidth: 24 },
        6: { halign: "center", cellWidth: 18 },
        7: { halign: "center", cellWidth: 32 },
        8: { halign: "center", cellWidth: 32 },
      },
      margin: { left: 14, right: 14, top: 44 },
      didDrawPage: (data) => {
        header();
        footer();
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
      },
      didParseCell: function (data) {
        if (data.column.index === 7 && data.cell.raw?.rowHeight) {
          data.row.height = Math.max(data.row.height, data.cell.raw.rowHeight);
        }
      },
      didDrawCell: (data) => {
        if (data.section === "head") {
          const { doc, cell } = data;
          const startX = cell.x;
          const startY = cell.y + cell.height;
          const endX = cell.x + cell.width;
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.7);
          doc.line(startX, startY, endX, startY);
        }
        if (data.column.index === 7) {
          const imgData = imageMap[data.row.index];
          if (imgData) {
            doc.addImage(
              imgData,
              "JPEG",
              data.cell.x + 2,
              data.cell.y + 2,
              fixedImgWidth,
              fixedImgHeight
            );
          }
        }
        if (data.column.index === 8) {
          const imgData = technicalImageMap[data.row.index];
          if (imgData) {
            doc.addImage(
              imgData,
              "JPEG",
              data.cell.x + 2,
              data.cell.y + 2,
              fixedImgWidth,
              fixedImgHeight
            );
          }
        }
      },
    });
    doc.save("bathroom_specifications.pdf");
  };
  const generateCCPDF = (selectedDetails) => {
    const doc = new jsPDF({
      orientation: "landscape",
    });
    const siteName = bathClientName.label;
    const header = () => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BATH FIXTURES SHEET", 14, 15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const clientLabel = "CLIENT: ";
      doc.text(clientLabel, 14, 33);
      const labelWidth = doc.getTextWidth(clientLabel);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const siteNameText = siteName.toUpperCase();
      doc.text(siteNameText, 14 + labelWidth, 33);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 44, 15);
      doc.setFont("helvetica", "normal");
      const tmsDate = `BFS CC ${bathClientSNo} .1`;
      const textWidth = doc.getTextWidth(tmsDate);
      const rightMargin = 14;
      const pageWidth = doc.internal.pageSize.width;
      const startX = pageWidth - rightMargin - textWidth;
      doc.text(tmsDate, startX, 27);
      doc.setDrawColor('#BF9853');
      doc.setLineWidth(1);
      doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
    };
    const footer = () => {
      const pageWidth = doc.internal.pageSize.width;
      const footerY = doc.internal.pageSize.height - 17;
      doc.setDrawColor(150);
      doc.setLineWidth(0.5);
      doc.line(14, footerY, pageWidth - 14, footerY);
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.text("AA BUILDERS", 14, doc.internal.pageSize.height - 12.5);
      doc.setFontSize(9);
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      const currentPageText = `${currentPage} |`;
      const pageText = " P a g e";
      doc.setTextColor(0, 0, 0);
      doc.text(currentPageText, pageWidth - 19 - doc.getTextWidth(pageText), doc.internal.pageSize.height - 12.5);
      doc.setTextColor(200, 200, 200);
      doc.text(pageText, pageWidth - 25, doc.internal.pageSize.height - 12.5);
    };
    const body = [];
    let lastValidFloorName = "";
    const renderedFloors = new Set();
    const imageMap = {};
    const fixedImgWidth = 28;
    const fixedImgHeight = 20;
    const fixedRowHeight = fixedImgHeight + 4;
    let rowIndex = 0;
    let floorCounter = 0;
    const floorSerialMap = {};
    const areaRowCounters = {};
    bathFloors.forEach((floor) => {
      const currentFloorName = floor.floorName?.trim();
      const floorName = currentFloorName || lastValidFloorName;
      if (currentFloorName) lastValidFloorName = floorName;
      const selectedFloor = selectedDetails.find(f => f.floorName === floorName);
      if (!selectedFloor) return;
      const allowedAreas = new Set(selectedFloor.areas);
      const tiles = areaTables[floor.id] || [];
      const filteredTiles = tiles.filter(row => allowedAreas.has(floor.areaName));
      if (!filteredTiles.length) return;
      if (!renderedFloors.has(floorName)) {
        const floorSerial = String.fromCharCode(65 + floorCounter);
        floorSerialMap[floorName] = floorSerial;
        body.push([
          { content: `${floorSerial}        ${floorName}`, colSpan: 9, styles: { halign: 'left', fontStyle: 'bold' } }
        ]);
        renderedFloors.add(floorName);
        rowIndex++;
        floorCounter++;
        areaRowCounters[floorName] = 1;
      }
      const renderedAreaNames = new Set();
      filteredTiles.forEach((row) => {
        const areaName = floor.areaName || "N/A";
        const areaToShow = renderedAreaNames.has(areaName) ? "" : areaName;
        const serialToShow = areaToShow ? `${areaRowCounters[floorName]++}` : "";
        if (areaToShow) renderedAreaNames.add(areaName);
        body.push([
          serialToShow,
          areaToShow,
          row.itemName || "",
          row.brand || "",
          row.model || "",
          row.type || "",
          row.qty,
          { content: "", rowHeight: fixedRowHeight },
        ]);
        if (row.image) imageMap[rowIndex] = row.image;
        rowIndex++;
      });
    });
    const tableStartY = 44;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
    doc.autoTable({
      startY: tableStartY,
      head: [["S.No", "Description", "Item", "Brand", "Model", "Type", "Qty", "Image"]],
      body,
      styles: { fontSize: 10 },
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center ",
        fontSize: 11,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { halign: "left", cellWidth: 40 },
        2: { halign: "left", cellWidth: 60 },
        3: { halign: "left", cellWidth: 50 },
        4: { halign: "center", cellWidth: 27 },
        5: { halign: "center", cellWidth: 27 },
        6: { halign: "center", cellWidth: 20 },
        7: { halign: "center", cellWidth: 32 },
      },
      margin: { left: 14, right: 14, top: 44 },
      didDrawPage: (data) => {
        header();
        footer();
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
      },
      didParseCell: function (data) {
        if (data.column.index === 7 && data.cell.raw?.rowHeight) {
          data.row.height = Math.max(data.row.height, data.cell.raw.rowHeight);
        }
      },
      didDrawCell: (data) => {
        if (data.section === "head") {
          const { doc, cell } = data;
          const startX = cell.x;
          const startY = cell.y + cell.height;
          const endX = cell.x + cell.width;
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.7);
          doc.line(startX, startY, endX, startY);
        }
        if (data.column.index === 7) {
          const imgData = imageMap[data.row.index];
          if (imgData) {
            doc.addImage(
              imgData,
              "JPEG",
              data.cell.x + 2,
              data.cell.y + 2,
              fixedImgWidth,
              fixedImgHeight
            );
          }
        }
      },
    });
    doc.save("bathroom_specifications.pdf");
  };
  const handleAreaSelect = (floorIndex, tileId) => {
    const floor = bathFloors[floorIndex];
    const tile = floor.tiles.find((t) => t.id === tileId);
    const areaKey = `${floor.id}_${tile.id}_${floor.areaName}`;
    setAreaTables((prevTables) => {
      if (!prevTables[areaKey]) {
        return {
          ...prevTables,
          [areaKey]: [],
        };
      }
      return prevTables;
    });
    setActiveFloorIndex(floorIndex);
  };
  useEffect(() => {
    const savedClientName = sessionStorage.getItem('bathClientName');
    const savedClientSNo = sessionStorage.getItem('bathClientSNo');
    const savedFloors = sessionStorage.getItem('bathFloors');
    const savedFilteredFileOptions = sessionStorage.getItem('filteredFileOptions');
    const savedSelectedFile = sessionStorage.getItem('bathSelectedFile');
    const savedAreaTable = sessionStorage.getItem('areaTables');
    try {
      if (savedClientName) setBathClientName(JSON.parse(savedClientName));
      if (savedClientSNo) setBathClientSNo(savedClientSNo);
      if (savedFloors) setBathFloors(JSON.parse(savedFloors));
      if (savedFilteredFileOptions) setFilteredFileOptions(JSON.parse(savedFilteredFileOptions));
      if (savedSelectedFile) setBathSelectedFile(JSON.parse(savedSelectedFile));
      if (savedAreaTable) setAreaTables(JSON.parse(savedAreaTable));
    } catch (error) {
      console.error("Error parsing sessionStorage data:", error);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  const handleBeforeUnload = () => {
    sessionStorage.removeItem('bathClientName');
    sessionStorage.removeItem('bathClientSNo');
    sessionStorage.removeItem('filteredFileOptions');
    sessionStorage.removeItem('bathFloors');
    sessionStorage.removeItem('rows');
    sessionStorage.removeItem('areaTables');
    sessionStorage.removeItem('bathSelectedFile');
  };
  useEffect(() => {
    if (bathClientName) sessionStorage.setItem('bathClientName', JSON.stringify(bathClientName));
    if (bathClientSNo) sessionStorage.setItem('bathClientSNo', bathClientSNo);
    sessionStorage.setItem('bathFloors', JSON.stringify(bathFloors));
    sessionStorage.setItem('filteredFileOptions', JSON.stringify(filteredFileOptions));
    sessionStorage.setItem('areaTables', JSON.stringify(areaTables));
    if (bathSelectedFile) sessionStorage.setItem('bathSelectedFile', JSON.stringify(bathSelectedFile))
  }, [bathClientName, bathClientSNo, bathFloors, filteredFileOptions, areaTables, bathSelectedFile]);
  const fetchBathFixtureData = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/bath_fixture_calculation/all');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const formattedOptions = data.map(calculation => ({
        value: calculation.id,
        bathClientName: calculation.clientName,
        siteName: calculation.siteName,
        label: calculation.fileName,
      }));
      setFileOptions(formattedOptions);
      setBathFullData(data);
    } catch (error) {
      console.error("Error fetching bath fixture data:", error);
    }
  };
  useEffect(() => {
    fetchBathFixtureData();
  }, []);
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
  const areaOptions = [
    { value: "Bath 1", label: "Bath 1" },
    { value: "Bath 2", label: "Bath 2" },
    { value: "Bath 3", label: "Bath 3" },
    { value: "Bath 4", label: "Bath 4" },
    { value: "Bath 5", label: "Bath 5" },
  ]
  const handleSiteChange = (selected) => {
    setBathClientName(selected);
    setBathClientSNo(selected ? selected.sNo : "");
    if (selected) {
      const clientNameFromSite = selected.value;
      const filteredOptions = fileOptions.filter(
        option => option.bathClientName === clientNameFromSite
      );
      const selectedData = bathFullData.filter(
        (calculation) => calculation.clientName === clientNameFromSite
      );
      const dumyFileData = selectedData.filter(
        (calculation) => calculation.fileName === "dumyFile"
      );
      setFilteredFileOptions(filteredOptions);
      if (dumyFileData.length > 0) {
        const seenFloors = new Set();
        const newFloorsData = [];
        const newAreaTables = {};
        dumyFileData.forEach((entry, index) => {
          entry.bathFixtureCalculations.forEach((calc, calcIndex) => {
            const floorName = calc.floorName || "No floor name available";
            const areaName = calc.areaName || "No area name available";
            const floorVisible = !seenFloors.has(floorName);
            seenFloors.add(floorName);
            const newFloor = {
              id: `${floorName}-${areaName}-${index}-${calcIndex}`,
              floorName: floorVisible ? floorName : null,
              areaName: areaName,
              tiles: [{ Sno: "" }],
            };
            newFloorsData.push(newFloor);
            newAreaTables[newFloor.id] = calc.bathFixtureTables?.map((tableItem) => {
              const matchedModel = (bathModelData || []).find((modelData) => {
                const isMatch =
                  modelData.model?.trim().toLowerCase() === tableItem.model?.trim().toLowerCase() &&
                  modelData.type?.trim().toLowerCase() === tableItem.type?.trim().toLowerCase();
                return isMatch;
              });
              return {
                brand: tableItem.brand || "",
                itemName: tableItem.itemName || "",
                model: tableItem.model || "",
                type: tableItem.type || "",
                qty: tableItem.quantity || "",
                price: tableItem.price || "",
                overAllPrice: tableItem.overAllPrice | "",
                image: matchedModel?.image || "",
                technicalImage: matchedModel?.technicalImage || ""
              };
            }) || [];
          });
        });
        setBathFloors(newFloorsData);
        setAreaTables(newAreaTables);
      } else {
        setSelectedClientData({ calculations: [] });
        setAreaTables({});
      }
    } else {
      setFilteredFileOptions([]);
      setBathSelectedFile(null);
      setSelectedClientData({ calculations: [] });
      setBathFloors([
        {
          floorName: "Ground Floor",
          areaName: "",
          tiles: [{ type: "" }],
        },
      ]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/floorName');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const areas = data.map(item => item.floorName);
        setFloorOptions([...new Set(areas)]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
  const addAreaRow = (floorIndex) => {
    const updatedFloors = [...bathFloors];
    updatedFloors.splice(floorIndex + 1, 0, {
      floorName: null,
      areaName: "",
      id: Date.now(),
      tiles: [{ id: Date.now() + 1, type: "" }],
    });
    setBathFloors(updatedFloors);
  };
  const addFloorRow = () => {
    setBathFloors((prevFloors) => [
      ...prevFloors,
      {
        id: Date.now(),
        floorName: "",
        areaName: "",
        tiles: [{ id: Date.now() + 1, type: "" }],
      },
    ]);
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
  const handleFloorCheckbox = (floorName) => {
    const floorData = groupedFloors.find(f => f.floorName === floorName);
    const areaList = floorData?.areas || [];
    setSelectedFloors(prev => {
      if (prev.includes(floorName)) {
        // Deselect floor and its areas
        const newFloors = prev.filter(f => f !== floorName);
        setSelectedAreas(prevAreas => {
          const newAreas = { ...prevAreas };
          delete newAreas[floorName];
          return newAreas;
        });
        return newFloors;
      } else {
        // Select floor and all areas
        setSelectedAreas(prevAreas => ({
          ...prevAreas,
          [floorName]: areaList,
        }));
        return [...prev, floorName];
      }
    });
  };
  const handleAreaCheckbox = (floorName, area) => {
    setSelectedAreas(prev => {
      const currentAreas = prev[floorName] || [];
      const updatedAreas = currentAreas.includes(area)
        ? currentAreas.filter(a => a !== area)
        : [...currentAreas, area];

      return {
        ...prev,
        [floorName]: updatedAreas,
      };
    });
  };
  const handleSelectAll = () => {
    const allFloors = groupedFloors.map(f => f.floorName);
    const allAreas = {};
    groupedFloors.forEach(floor => {
      allAreas[floor.floorName] = [...floor.areas];
    });
    if (!selectAll) {
      setSelectedFloors(allFloors);
      setSelectedAreas(allAreas);
    } else {
      setSelectedFloors([]);
      setSelectedAreas({});
    }
    setSelectAll(!selectAll);
  };
  const groupFloors = () => {
    let previousFloorName = null;
    const grouped = {};
    bathFloors.forEach(floor => {
      const currentFloorName = floor.floorName || previousFloorName;
      if (!currentFloorName) return;
      previousFloorName = currentFloorName;
      if (!grouped[currentFloorName]) {
        grouped[currentFloorName] = {
          floorName: currentFloorName,
          areas: new Set(),
        };
      }
      if (floor.areaName) {
        grouped[currentFloorName].areas.add(floor.areaName);
      }
    });
    // Convert areas from Set to array
    return Object.values(grouped).map(group => ({
      floorName: group.floorName,
      areas: Array.from(group.areas),
    }));
  };
  const groupedFloors = groupFloors();
  const resetSelections = () => {
    setSelectedFloors([]);
    setSelectedAreas({});
    setSelectAll(false);
  };

  const deleteAreaRow = (floorIndex) => {
    const updatedFloors = [...bathFloors];
    const targetFloor = updatedFloors[floorIndex];
    if (!targetFloor) return;
    // Always clean up the areaTables for this floor's ID
    if (targetFloor.id) {
      setAreaTables((prev) => {
        const updated = { ...prev };
        delete updated[targetFloor.id];
        return updated;
      });
    }
    if (targetFloor.floorName) {
      // Just clear the areaName and regenerate the ID
      updatedFloors[floorIndex] = {
        ...targetFloor,
        areaName: "",
        id: `${targetFloor.floorName}--${floorIndex}` // regenerate ID since areaName is gone
      };
    } else {
      // floorName is null/empty → remove the whole row
      updatedFloors.splice(floorIndex, 1);
    }
    setBathFloors(updatedFloors);
  };
  const sortedSiteOptions = siteOptions.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  const deleteFloor = (floorIndex) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this floor?");
    if (confirmDelete) {
      const updatedFloors = [...bathFloors];
      updatedFloors.splice(floorIndex, 1);
      let i = floorIndex;
      while (i < updatedFloors.length && (!updatedFloors[i] || !updatedFloors[i].floorName)) {
        updatedFloors.splice(i, 1);
      }
      setBathFloors(updatedFloors);
    }
  };
  const updateRowData = (areaKey, index, updatedRow) => {
    setAreaTables((prevTables) => {
      const updated = { ...prevTables };
      updated[areaKey][index] = updatedRow;
      return updated;
    });
  };
  const addRow = (areaKey) => {
    setAreaTables((prevTables) => {
      const updated = { ...prevTables };
      if (!updated[areaKey]) {
        updated[areaKey] = [];
      }
      updated[areaKey] = [
        ...updated[areaKey],
        {
          brand: "",
          itemName: "",
          model: "",
          type: "",
          qty: "",
        },
      ];
      return updated;
    });
  };
  const deleteRowData = (areaKey, rowIndex) => {
    setAreaTables((prevTables) => {
      const updatedTable = [...(prevTables[areaKey] || [])];
      updatedTable.splice(rowIndex, 1);
      return {
        ...prevTables,
        [areaKey]: updatedTable,
      };
    });
  };
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const prepareBathFixturePayload = async (e) => {
    const clientResponse = await fetch(`https://backendaab.in/aabuilderDash/api/bath_fixture_calculation/all`);
    if (!clientResponse.ok) {
      throw new Error("Failed to fetch calculations from the backend");
    }
    const clientData = await clientResponse.json();
    const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === bathClientName.label 
      && !(calculation.fileName && calculation.fileName.includes("dumyFile"))
    );
    const clientCount = matchingClientCalculations.length;
    const fileName = `${formatDate(date)} - R ${clientCount}`;
    let previousFloorName = "";
    return {
      clientName: bathClientName.label,
      fileName: fileName,
      date: formatDate(date),
      ENo: "",
      bathFixtureCalculations: bathFloors.map((floor) => {
        const currentFloorName = floor.floorName || previousFloorName;
        if (floor.floorName) {
          previousFloorName = floor.floorName;
        }
        return {
          floorName: currentFloorName,
          areaName: floor.areaName,
          bathFixtureTables:
            areaTables[floor.id]?.map((row) => ({
              brand: row.brand || "",
              itemName: row.itemName || "",
              model: row.model || "",
              type: row.type || "",
              quantity: row.qty || "",
              price: row.price,
              overAllPrice: (Number(row.qty) * Number(row.price)) || "",
            })) || [],
        };
      }),
    };
  };
  const prepareBathFixturePayloadOfDumyFile = async (e) => {
    const fileName = 'dumyFile';
    let previousFloorName = "";
    return {
      clientName: bathClientName.label,
      fileName: fileName,
      date: formatDate(date),
      ENo: "",
      bathFixtureCalculations: bathFloors.map((floor) => {
        const currentFloorName = floor.floorName || previousFloorName;
        if (floor.floorName) {
          previousFloorName = floor.floorName;
        }
        return {
          floorName: currentFloorName,
          areaName: floor.areaName,
          bathFixtureTables:
            areaTables[floor.id]?.map((row) => ({
              brand: row.brand || "",
              itemName: row.itemName || "",
              model: row.model || "",
              type: row.type || "",
              quantity: row.qty || "",
              price: row.price,
              overAllPrice: (Number(row.qty) * Number(row.price)) || "",
            })) || [],
        };
      }),
    };
  };
  const saveBathFixtureData = async () => {
    const payload = await prepareBathFixturePayload();
    console.log(payload);
    const formatDateForName = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };
    const selectedDate = formatDateForName(date);
    const clientId = bathClientSNo || 0;
    const revisionCount = await getRevisionNumber(bathClientName.label);
    const revisionNumber = `R ${revisionCount}`;
    try {
      const StockingPdf = await stockingChartPDF();
      const fullPdf = await engineerCopyPDF(selectedDetails);
      const customerCopyPdf = await customerCopyPDF(selectedDetails);
      const summaryPdf = await orderCopyPDF(selectedDetails);
      const uploadPdf = async (pdf, name) => {
        const singleFormData = new FormData();
        singleFormData.append("files", pdf, name);
        const pdfUploadResponse = await fetch('https://backendaab.in/aabuilderDash/googleUploader/bathPdfs', {
          method: "POST",
          body: singleFormData,
        });
        if (!pdfUploadResponse.ok) {
          throw new Error("Failed to upload PDF: " + name);
        }
      };
      await uploadPdf(fullPdf, `BFS EC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
      await uploadPdf(summaryPdf, `BFS OC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
      await uploadPdf(StockingPdf, `BFS SC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
      await uploadPdf(customerCopyPdf, `BFS CC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
      const response = await fetch('https://backendaab.in/aabuilderDash/api/bath_fixture_calculation/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      alert("Data saved successfully!!!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving bath fixture data:", error);
    }
  };

  const saveBathFixtureDataOfDumyFile = async () => {
    const payload = await prepareBathFixturePayloadOfDumyFile();
    console.log(payload);
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/bath_fixture_calculation/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      alert("Data saved successfully!!!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving bath fixture data:", error);
    }
  };
  const handleBathFileChange = (selected) => {
    if (!selected) {
      setBathSelectedFile(null);
      setSelectedClientData({ calculations: [] });
      setBathFloors([]);
      setAreaTables({});
      return;
    }
    const selectedClientData = bathFullData.find(
      (calculation) => calculation.id === selected.value
    );
    setBathSelectedFile(selected);
    if (selectedClientData) {
      const seenFloors = new Set();
      const newFloorsData = [];
      const newAreaTables = {};
      selectedClientData.bathFixtureCalculations.forEach((calc, index) => {
        const floorName = calc.floorName || "No floor name available";
        const areaName = calc.areaName || "No area name available";
        const floorVisible = !seenFloors.has(floorName);
        seenFloors.add(floorName);
        const newFloor = {
          id: `${floorName}-${areaName}-${index}`,
          floorName: floorVisible ? floorName : null,
          areaName: areaName,
          tiles: [{ Sno: "" }],
        };
        newFloorsData.push(newFloor);
        newAreaTables[newFloor.id] = calc.bathFixtureTables?.map((tableItem) => {
          const matchedModel = (bathModelData || []).find((modelData) => {
            const isMatch =
              modelData.model?.trim().toLowerCase() === tableItem.model?.trim().toLowerCase() &&
              modelData.type?.trim().toLowerCase() === tableItem.type?.trim().toLowerCase();
            return isMatch;
          });
          return {
            brand: tableItem.brand || "",
            itemName: tableItem.itemName || "",
            model: tableItem.model || "",
            type: tableItem.type || "",
            qty: tableItem.quantity || "",
            price: tableItem.price || "",
            overAllPrice: tableItem.overAllPrice | "",
            image: matchedModel?.image || "",
            technicalImage: matchedModel?.technicalImage || ""
          };
        }) || [];
      });
      setBathFloors(newFloorsData);
      setAreaTables(newAreaTables);
    } else {
      setSelectedClientData({ calculations: [] });
      setBathFloors([]);
      setAreaTables({});
    }
  };
  const reversedFileOptions = [...filteredFileOptions].reverse();
  const handlePrintOC = () => {
    const selectedDetails = selectedFloors.map(floor => ({
      floorName: floor,
      areas: selectedAreas[floor] || [],
    }));
    setSelectedDetails(selectedDetails);
    setIsOCPopupOpen(false);
    setIsModalImageOpenOC(true);
    resetSelections();
  };
  const handlePrintCC = () => {
    const selectedDetails = selectedFloors.map(floor => ({
      floorName: floor,
      areas: selectedAreas[floor] || [],
    }));
    generateCCPDF(selectedDetails);
    resetSelections();
    setIsCCPopupOpen(false);
  };
  const handlePrintEC = () => {
    const selectedDetails = selectedFloors.map(floor => ({
      floorName: floor,
      areas: selectedAreas[floor] || [],
    }));
    generateECPDF(selectedDetails);
    resetSelections();
    setIsECPopupOpen(false);
  };
  const handlePrintSC = () => {
    const selectedDetails = selectedFloors.map(floor => ({
      floorName: floor,
      areas: selectedAreas[floor] || [],
    }));
    generateSCPDF(selectedDetails);
    resetSelections();
    setIsSCPopupOpen(false);
  };
  let displayIndex = 1;
  return (
    <body>
      <div>
        <div className=" mx-auto p-6 border-collapse bg-[#FFFFFF] ml-6 mr-6 rounded-md">
          <div className=" flex">
            <div className=" flex">
              <div className="w-full -mt-8 mb-4">
                <h4 className=" mt-10 font-bold mb-2 lg:-ml-52 -ml-36">Project Name</h4>
                <Select
                  value={bathClientName}
                  onChange={handleSiteChange}
                  options={sortedSiteOptions}
                  placeholder="Select Site Name..."
                  className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg lg:w-80 w-64 h-12 text-left"
                  styles={customSelectStyles}
                  isClearable />
              </div>
              <input
                type="text"
                value={bathClientSNo}
                readOnly
                className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg h-12 w-16 mt-10 ml-1 bg-transparent text-center"
              />
            </div>
            <div className=" ml-6 mt-1">
              <h4 className=" font-bold mb-2 -ml-32">Date </h4>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] w-[168px] rounded-lg px-4 py-2 " />
            </div>
            <div>
              <h4 className=" mt-1.5 font-bold -ml-20"> E No</h4>
              <input
                className="bg-gray-100 rounded-lg w-[158px] h-12 mt-2 ml-2 pl-4"
                readOnly />
            </div>
            <div className=" ml-6">
              <h4 className=" mt-1.5 font-bold mb-2 -ml-32"> Revision</h4>
              <Select
                placeholder="Select the file..."
                className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg w-52 h-12"
                styles={customSelectStyles}
                options={reversedFileOptions.filter(option => option.label?.trim() !== 'dumyFile')}
                isClearable
                value={bathSelectedFile}
                onChange={handleBathFileChange}
                isDisabled={!bathClientName}
              />
            </div>
          </div>
          <div className="flex ml-[83%] -mt-5">
            <div className="flex ml-[2%] mt-0">
              <button className="bg-[#007233] w-28 h-[36px] rounded-md text-white">+ Import</button>
            </div>
          </div>
        </div>
        <div className=" p-6 bg-[#FFFFFF] mt-6 ml-6 mr-6">
          <div className="flex ">
            <div>
              <div className="rounded-lg border-l-8 border-l-[#BF9853] mt-4 flex" id="full-table">
                <div className="overflow-x-auto w-full flex">
                  <table className="table-auto w-72 text-sm sm:text-base">
                    <thead>
                      <tr className="bg-[#FAF6ED]">
                        <th className="w-40 h-12 text-left pl-4" rowSpan="2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bathFloors.map((floor, floorIndex) => (
                        <React.Fragment key={floorIndex}>
                          <tr className="bg-white">
                            <td colSpan="13" className="font-bold text-left flex group">
                              {floor.floorName !== null && (
                                <div className="flex">
                                  <span className="mt-1">{displayIndex++}.</span>
                                  <span>{selectedClientData.floorName}</span>
                                  <select
                                    value={floor.floorName || ""}
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      if (newValue) {
                                        const updatedFloors = [...bathFloors];
                                        updatedFloors[floorIndex].floorName = newValue;
                                        setBathFloors(updatedFloors);
                                        const selectedValues = updatedFloors.map((f) => f.floorName).filter(Boolean);
                                        setSelectedOptions(new Set(selectedValues));
                                      }
                                    }}
                                    className="w-52 p-1 rounded-lg bg-transparent focus:outline-none">
                                    <option value="" disabled>Select Floor..</option>
                                    {floorOptions
                                      .filter(
                                        (floorOption) =>
                                          !selectedOptions.has(floorOption) || floorOption === floor.floorName
                                      )
                                      .map((floorOption, idx) => (
                                        <option key={idx} value={floorOption}>
                                          {floorOption}
                                        </option>
                                      ))}
                                  </select>
                                  <div className="items-center flex space-x-2 invisible group-hover:visible">
                                    <button onClick={() => deleteFloor(floorIndex)} className="delete-floor-button">
                                      <img src={deletes} alt="delete" className="w-8 h-4" />
                                    </button>
                                    <button onClick={() => addAreaRow(floorIndex)}>
                                      <img src={add} alt="add" className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                          {floor.tiles.map((tile, tileIndex) => (
                            <tr
                              key={`${floor.areaName}-${tileIndex}`}
                              className={tileIndex % 2 === 1 ? "bg-white" : "bg-[#FAF6ED]"}>
                              <td className="px-1 flex group ml-3 items-center">
                                {tileIndex === 0 ? (
                                  <div className="w-52 h-10 text-left ml-3 flex items-center space-x-2">
                                    {floor.isEditing ? (
                                      <Select
                                        name="areaName"
                                        options={areaOptions}
                                        value={floor.areaName ? { value: floor.areaName, label: floor.areaName } : null}
                                        onChange={(selectedOption) => {
                                          const updatedFloors = [...bathFloors];
                                          updatedFloors[floorIndex].areaName = selectedOption ? selectedOption.value : "";
                                          updatedFloors[floorIndex].isEditing = false;
                                          setBathFloors(updatedFloors);
                                        }}
                                        onBlur={() => {
                                          const updatedFloors = [...bathFloors];
                                          updatedFloors[floorIndex].isEditing = false;
                                          setBathFloors(updatedFloors);
                                        }}
                                        autoFocus
                                        className="w-full h-10"
                                        placeholder="Select Area"
                                        isClearable
                                        menuPortalTarget={document.body}
                                        styles={{
                                          control: (base) => ({
                                            ...base,
                                            backgroundColor: "transparent",
                                            border: "none",
                                            boxShadow: "none",
                                          }),
                                          dropdownIndicator: (base) => ({
                                            ...base,
                                            color: "#000",
                                          }),
                                          indicatorSeparator: () => ({
                                            display: "none",
                                          }),
                                          placeholder: (base) => ({
                                            ...base,
                                            color: "#888",
                                          }),
                                          singleValue: (base) => ({
                                            ...base,
                                            color: "#000",
                                          }),
                                          option: (base, state) => ({
                                            ...base,
                                            color: state.isSelected ? "red" : base.color,
                                            backgroundColor: state.isSelected ? "#ffecec" : base.backgroundColor,
                                          }),
                                          menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                          }),
                                        }}
                                      />
                                    ) : (
                                      <button onClick={() => handleAreaSelect(floorIndex, tile.id)} className={`font-semibold ${activeFloorIndex === floorIndex && floor.areaName !== "" ? 'text-red-500' : 'text-black'}`}>
                                        {floor.areaName || "Select Area"}
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-52"></div>
                                )}
                                {tileIndex === 0 && (
                                  <div key={floorIndex} className="items-center flex space-x-2 invisible group-hover:visible" >
                                    <button onClick={() => addAreaRow(floorIndex)}>
                                      <img src={add} alt="add" className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteAreaRow(floorIndex, tileIndex)} className="ml-2" >
                                      <img src={delt} alt="delete" className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { const updatedFloors = [...bathFloors]; updatedFloors[floorIndex].isEditing = true; setBathFloors(updatedFloors); }} title="Edit">
                                      <img src={Edit} alt="edit" className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div>
              {activeFloorIndex !== null &&
                bathFloors[activeFloorIndex] &&
                bathFloors[activeFloorIndex].areaName && (
                  <div className="mt-4">
                    <AreaTable
                      areaKey={bathFloors[activeFloorIndex].id}
                      tableData={areaTables[bathFloors[activeFloorIndex].id] || []}
                      updateRowData={updateRowData}
                      addRow={addRow}
                      deleteRowData={deleteRowData}
                      itemNames={itemNames}
                      brandNames={brandNames}
                      types={types}
                      bathModelData={bathModelData}
                    />
                  </div>
                )}
            </div>
            <div>
              {isCCPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                  <div className="bg-white  shadow-lg p-6 w-[318px] max-h-[80vh] overflow-y-auto">
                    <div className="mb-4 flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                      <span className="text-sm">Select All</span>
                    </div>
                    <form>
                      {groupedFloors.map((floor, index) => (
                        <div key={index} className="mb-4 ml-16">
                          <div>
                            <label className="font-bold flex items-center ">
                              <input
                                type="checkbox"
                                className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                                checked={selectedFloors.includes(floor.floorName)}
                                onChange={() => handleFloorCheckbox(floor.floorName)}
                              />
                              <span className="ml-2">{floor.floorName}</span>
                            </label>
                          </div>
                          {selectedFloors.includes(floor.floorName) && (
                            <div className="mt-1 -ml-14">
                              {floor.areas.map((area, areaIndex) => (
                                <label key={areaIndex} className="block">
                                  <input
                                    type="checkbox"
                                    className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                                    checked={
                                      selectedAreas[floor.floorName]?.includes(area) || false
                                    }
                                    onChange={() => handleAreaCheckbox(floor.floorName, area)}
                                  />
                                  <span className="ml-2">{area}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </form>
                    <div className="mt-6 flex justify-start gap-2">
                      <button className="bg-[#BF9853] text-white w-[96px] h-[36px] px-4 rounded" onClick={handlePrintCC}>
                        Print
                      </button>
                      <button className="bg-white text-[#BF9853] border border-[#BF9853] w-[114px] h-[36px] px-4 rounded" onClick={() => { resetSelections(); setIsCCPopupOpen(false) }} >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {isOCPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                  <div className="bg-white  shadow-lg p-6 w-[318px] max-h-[80vh] overflow-y-auto">
                    <div className="mb-4 flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                      <span className="text-sm">Select All</span>
                    </div>
                    <form>
                      {groupedFloors.map((floor, index) => (
                        <div key={index} className="mb-4 ml-16">
                          <div>
                            <label className="font-bold flex items-center ">
                              <input
                                type="checkbox"
                                className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                                checked={selectedFloors.includes(floor.floorName)}
                                onChange={() => handleFloorCheckbox(floor.floorName)}
                              />
                              <span className="ml-2">{floor.floorName}</span>
                            </label>
                          </div>
                          {selectedFloors.includes(floor.floorName) && (
                            <div className="mt-1 -ml-14">
                              {floor.areas.map((area, areaIndex) => (
                                <label key={areaIndex} className="block">
                                  <input
                                    type="checkbox"
                                    className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                                    checked={
                                      selectedAreas[floor.floorName]?.includes(area) || false
                                    }
                                    onChange={() => handleAreaCheckbox(floor.floorName, area)}
                                  />
                                  <span className="ml-2">{area}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </form>
                    <div className="mt-6 flex justify-start gap-2">
                      <button className="bg-[#BF9853] text-white w-[96px] h-[36px] px-4 rounded" onClick={handlePrintOC}>
                        Print
                      </button>
                      <button className="bg-white text-[#BF9853] border border-[#BF9853] w-[114px] h-[36px] px-4 rounded" onClick={() => { resetSelections(); setIsOCPopupOpen(false) }} >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {isECPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                  <div className="bg-white  shadow-lg p-6 w-[318px] max-h-[80vh] overflow-y-auto">
                    <div className="mb-4 flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                      <span className="text-sm">Select All</span>
                    </div>
                    <form>
                      {groupedFloors.map((floor, index) => (
                        <div key={index} className="mb-4 ml-16">
                          <div>
                            <label className="font-bold flex items-center ">
                              <input
                                type="checkbox"
                                className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                                checked={selectedFloors.includes(floor.floorName)}
                                onChange={() => handleFloorCheckbox(floor.floorName)}
                              />
                              <span className="ml-2">{floor.floorName}</span>
                            </label>
                          </div>
                          {selectedFloors.includes(floor.floorName) && (
                            <div className="mt-1 -ml-14">
                              {floor.areas.map((area, areaIndex) => (
                                <label key={areaIndex} className="block">
                                  <input
                                    type="checkbox"
                                    className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                                    checked={
                                      selectedAreas[floor.floorName]?.includes(area) || false
                                    }
                                    onChange={() => handleAreaCheckbox(floor.floorName, area)}
                                  />
                                  <span className="ml-2">{area}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </form>
                    <div className="mt-6 flex justify-start gap-2">
                      <button className="bg-[#BF9853] text-white w-[96px] h-[36px] px-4 rounded" onClick={handlePrintEC}>
                        Print
                      </button>
                      <button className="bg-white text-[#BF9853] border border-[#BF9853] w-[114px] h-[36px] px-4 rounded" onClick={() => { resetSelections(); setIsECPopupOpen(false) }} >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {isSCPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                  <div className="bg-white  shadow-lg p-6 w-[318px] max-h-[80vh] overflow-y-auto">
                    <div className="mb-4 flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                      <span className="text-sm">Select All</span>
                    </div>
                    <form>
                      {groupedFloors.map((floor, index) => (
                        <div key={index} className="mb-4 ml-16">
                          <div>
                            <label className="font-bold flex items-center ">
                              <input
                                type="checkbox"
                                className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                                checked={selectedFloors.includes(floor.floorName)}
                                onChange={() => handleFloorCheckbox(floor.floorName)}
                              />
                              <span className="ml-2">{floor.floorName}</span>
                            </label>
                          </div>
                          {selectedFloors.includes(floor.floorName) && (
                            <div className="mt-1 -ml-14">
                              {floor.areas.map((area, areaIndex) => (
                                <label key={areaIndex} className="block">
                                  <input
                                    type="checkbox"
                                    className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                                    checked={
                                      selectedAreas[floor.floorName]?.includes(area) || false
                                    }
                                    onChange={() => handleAreaCheckbox(floor.floorName, area)}
                                  />
                                  <span className="ml-2">{area}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </form>
                    <div className="mt-6 flex justify-start gap-2">
                      <button className="bg-[#BF9853] text-white w-[96px] h-[36px] px-4 rounded" onClick={handlePrintSC}>
                        Print
                      </button>
                      <button className="bg-white text-[#BF9853] border border-[#BF9853] w-[114px] h-[36px] px-4 rounded" onClick={() => { resetSelections(); setIsSCPopupOpen(false) }} >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="">
            <button type="button" className="text-[#E4572E] mb-20 -ml-[95%]  border-dashed border-b-2 border-[#BF9853] font-semibold" onClick={addFloorRow}>
              + Add Floor
            </button>
          </div>
          <div className=" mt-[-50px] ml-4">
            <button type="button" className="text-white bg-[#c5994e] p-1 w-[130px] h-[40px] font-bold rounded -ml-[94%]" onClick={saveBathFixtureData}>Submit</button>
          </div>
          <div>
            <div>
              <button type='button' className='text-white bg-[#E4572E] ml-[850px] mt-[-400px] w-24 h-9 rounded' onClick={saveBathFixtureDataOfDumyFile}>Save</button>
            </div>
          </div>
          <div className='flex ml-[680px] mt-7'>
            <div className="">
              <button className="w-44 text-white px-4 py-2 rounded bg-[#007233] hover:text-white transition duration-200 ease-in-out" onClick={() => setIsCCPopupOpen(true)} >
                Customer Copy
              </button>
            </div>
            <div>
              <button className="w-40 text-white px-4 py-2 rounded ml-4 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out" onClick={() => setIsOCPopupOpen(true)}>
                Order Copy
              </button>
            </div>
            <div className="">
              <button className="w-40 text-white px-4 py-2 rounded ml-4 bg-[#007233] hover:text-white transition duration-200 ease-in-out" onClick={() => setIsECPopupOpen(true)}>
                Engineer Copy
              </button>
            </div>
            <div className="">
              <button className="w-40 text-white px-4 py-2 rounded ml-4 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out" onClick={() => setIsSCPopupOpen(true)}>
                Stocking Chart
              </button>
            </div>
          </div>
          <div className="-mt-3 flex">
            <div>
              <div>
                <h1 className="font-bold text-xl mt-8 -ml-[62%]">Fixtures Order Copy </h1>
              </div>
              <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                <table className="table-auto w-[500px] mt-2">
                  <thead>
                    <tr className="bg-[#FAF6ED]">
                      <th className="font-extrabold p-3">S.No</th>
                      <th className="p-3 font-extrabold">Item Name</th>
                      <th className="p-3 font-extrabold">Model</th>
                      <th className="p-3 font-extrabold">Total Qty</th>
                      <th className="p-3 font-extrabold">Price</th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
            <div className=" ml-10">
              <div >
                <h1 className="font-bold text-xl mt-8 -ml-[67%]">Fixtures Stocking Chart </h1>
              </div>
              <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                <table id="summaryTable" className="table-auto w-[680px] mt-2">
                  <thead>
                    <tr className="bg-[#FAF6ED]">
                      <th className="font-extrabold p-3 text-left">S.No</th>
                      <th className="p-3 font-extrabold text-left">Floor Name</th>
                      <th className="p-3 font-extrabold text-left">Bath Number</th>
                      <th className="p-3 font-extrabold text-left">Item Name</th>
                      <th className="p-3 font-extrabold text-left">Model</th>
                      <th className="p-3 font-extrabold text-left">Total Qty</th>
                      <th className="p-3 font-extrabold text-left">Price</th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>
        </div>
        {isModalImageOpenOC && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h2 className="text-lg font-bold mb-4">Select an Order Copy Option</h2>
              <div className="space-y-2">
                <div className="flex space-x-[5.2rem]">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="ocSelection"
                      value="With Image"
                      className="appearance-none w-4 h-4 rounded-md bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:content-['✔'] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                      checked={ocImageSelection.includes('With Image')}
                      onChange={(e) => handleOCSelectionChange(e.target.value)}
                    />
                    <span>With Image</span>
                  </label>
                </div>
                <div className="flex space-x-20">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="ocSelection"
                      value="Without Image"
                      className="appearance-none w-4 h-4 rounded-md bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:content-['✔'] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                      checked={ocImageSelection.includes('Without Image')}
                      onChange={(e) => handleOCSelectionChange(e.target.value)}
                    />
                    <span>Without Image</span>
                  </label>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={handleCloseModalOC}
                >
                  Cancel
                </button>
                <button
                  className="px-8 py-2 border rounded-lg bg-[#007233] text-white hover:bg-[#005522]"
                  onClick={() => handleConfirmOC(selectedDetails)}
                  disabled={ocImageSelection.length === 0}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </body>
  )
}
export default BathFixtur