import React, { useState, useEffect } from "react";
import Select from "react-select";
import add from '../Images/adding.png';
import deleteIcon from '../Images/delete.png';
import change from '../Images/change.png';
import refresh from '../Images/refresh.png';
import jsPDF from 'jspdf';
import "jspdf-autotable";
const DesignTool = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullData, setFullData] = useState([]);
    const [filteredFileOptions, setFilteredFileOptions] = useState([]);
    const [floors, setFloors] = useState([
        {
            floorName: "Ground Floor",
            areaName: "",
            tiles: [
                { type: "Floor Tile", length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" },
            ],
        },
    ]);
    const [clientName, setClientName] = useState(null);
    const [clientSNo, setClientSNo] = useState("");
    const [selectedClientData, setSelectedClientData] = useState({});
    const [calculationData, setCalculationData] = useState(null);
    const currentDate = new Date().toLocaleDateString();
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileOptions, setFileOptions] = useState([]);
    const fetchCalculations = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/tile/all');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const uniqueSiteNames = Array.from(new Set(data.map(calculation => calculation.siteName)));
            const formattedSiteOptions = uniqueSiteNames.map(siteName => ({
                value: siteName,
                label: siteName,
            }));
            const formattedOptions = data.map(calculation => ({
                value: calculation.id,
                clientName: calculation.clientName,
                siteName: calculation.siteName,
                label: calculation.fileName,
            }));
            setFullData(data);
            setSiteOptions(formattedSiteOptions);
            setFileOptions(formattedOptions);
        } catch (error) {
            console.error('Error fetching calculations:', error);
        }
    };
    const handleSiteChange = (selected) => {
        setClientName(selected);
        setClientSNo(selected ? selected.sNo : "");
        if (selected) {
            const clientNameFromSite = selected.value;
            const filteredOptions = fileOptions.filter(
                option => option.clientName === clientNameFromSite
            );
            setFilteredFileOptions(filteredOptions);
        } else {
            setFilteredFileOptions([]);
            setSelectedFile(null);
            setSelectedClientData({ calculations: [] });
            setFloors([{
                floorName: "Ground Floor",
                areaName: "",
                tiles: [{ type: "Floor Tile", length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" }],
            }]);
            setRows([{ tileName: "", size: "", qtyPerBox: "", numberOfBoxes: "" }]);
        }
    };
    useEffect(() => {
        fetchCalculations();
    }, []);
    const [floorOptions, setFloorOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState([]);

    useEffect(() => {
        // Fetch data from the backend
        const fetchData = async () => {
            try {
                const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/areaFloor');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const floors = data.map(item => item.floorName);
                const areas = data.map(item => item.areaName);

                setFloorOptions([...new Set(floors)]);
                setAreaOptions([...new Set(areas)]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);
    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };
    useEffect(() => {
        const fetchSites = async () => {
            try {
                const response = await fetch("https://backendaab.in/aabuilderDash/api/expenses/sites", {
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
                    sNo: item.sNo
                }));
                setSiteOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchSites();
    }, []);
    let lastValidFloorName = '';
    const summaryMap = {};
    floors.forEach(floor => {
        const currentFloorName = floor.floorName || lastValidFloorName;
        if (floor.floorName) {
            lastValidFloorName = floor.floorName;
        }
        floor.tiles.forEach(tile => {
            const length = Number(tile.length);
            const breadth = Number(tile.breadth);
            const height = Number(tile.height);
            const wastagePercentage = Number(tile.wastagePercentage);
            const deductionArea = Number(tile.deductionArea || 0);
            let tileArea;
            let skirtingArea;
            if (tile.type === "Wall Tile") {
                skirtingArea = 0;
            } else {
                skirtingArea = (tile.skirtingArea !== undefined && tile.skirtingArea !== null)
                    ? Number(tile.skirtingArea)
                    : (tile.isUserChanged ? Number(tile.directValue) : ((length + breadth) * 0.33));
            }
            if (tile.type === "Floor Tile") {
                tileArea = length * breadth;
            } else if (tile.type === "Wall Tile") {
                tileArea = length * height;
            }
            const finalArea = tileArea - deductionArea;
            const actualQuantity = finalArea + skirtingArea;
            const wastage = (wastagePercentage / 100) * actualQuantity;
            const totalOrderedTile = actualQuantity + wastage;
            const qtyPerBox = Number(tile.qtyPerBox || 1);
            const Areainsqft = Number(tile.Areainsqft || 1);
            const totalBoxes = totalOrderedTile / (qtyPerBox * Areainsqft);
            const tileKey = `${currentFloorName}-${tile.tileName}-${tile.size}`;
            if (summaryMap[tileKey]) {
                summaryMap[tileKey].totalOrderedQuantity = (
                    parseFloat(summaryMap[tileKey].totalOrderedQuantity) +
                    totalOrderedTile
                ).toFixed(2);
                summaryMap[tileKey].totalBoxes = (
                    parseFloat(summaryMap[tileKey].totalBoxes) +
                    totalBoxes
                ).toFixed(2);
            } else {
                summaryMap[tileKey] = {
                    floorName: currentFloorName,
                    tileName: tile.tileName,
                    tileSize: tile.size,
                    totalOrderedQuantity: totalOrderedTile.toFixed(2),
                    totalBoxes: totalBoxes.toFixed(2),
                };
            }
        });
    });
    const summary1 = Object.values(summaryMap);
    const handleAddRow = () => {
        setRows([
            ...rows,
            { tileName: "", size: "", qtyPerBox: "", numberOfBoxes: "" },
        ]);
    };
    useEffect(() => {
        const calculations = floors.map(floor => {
            return {
                floorName: floor.floorName,
                areaName: floor.areaName,
                tiles: floor.tiles.map(tile => {
                    const lengthNum = Number(tile.length) || 0;
                    const breadthNum = Number(tile.breadth) || 0;
                    const heightNum = Number(tile.height) || 0;
                    const deductionAreaNum = Number(tile.deductionArea) || 0;
                    let tileArea;
                    let skirtingArea = (tile.type === "Wall Tile") ? 0 : (tile.isUserChanged ? Number(tile.directValue) : ((lengthNum + breadthNum) * 0.33));
                    if (tile.type === "Floor Tile") {
                        tileArea = lengthNum * breadthNum;
                    } else if (tile.type === "Wall Tile") {
                        tileArea = lengthNum * heightNum;
                    }
                    const finalArea = tileArea - deductionAreaNum;
                    const actualQuantity = finalArea + skirtingArea;
                    const wastagePercentage = (Number(tile.wastagePercentage) || 0) / 100 * actualQuantity;
                    const totalOrderedTile = actualQuantity + wastagePercentage;
                    const qtyPerBoxNum = Number(tile.qtyPerBox) || 1;
                    const AreainsqftNum = Number(tile.Areainsqft) || 1;
                    console.log("Areainsqft:", AreainsqftNum);
                    const noOfBoxes = (totalOrderedTile / (qtyPerBoxNum * AreainsqftNum)).toFixed(2);
                    return {
                        type: tile.type,
                        length: lengthNum,
                        breadth: breadthNum,
                        height: heightNum,
                        deductionArea: deductionAreaNum,
                        wastagePercentage: tile.wastagePercentage,
                        skirtingArea,
                        actualQuantity,
                        totalOrderedTile,
                        tileName: tile.tileName || "Default Tile Name",
                        size: tile.size || "Default Size",
                        qtyPerBox: qtyPerBoxNum,
                        Areainsqft: AreainsqftNum,
                        noOfBoxes,
                    };
                }),
            };
        });
        setCalculationData({
            clientName: clientName ? clientName.label : null,
            date: currentDate,
            calculations,
        });
    }, [clientName, floors, currentDate, clientSNo]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (!calculationData || !calculationData.calculations.length || !clientName) {
            console.error("Data is incomplete, please check inputs.");
            setIsSubmitting(false);
            return;
        }
        try {
            const clientResponse = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/all`);
            if (!clientResponse.ok) {
                throw new Error("Failed to fetch calculations from the backend");
            }
            const clientData = await clientResponse.json();
            const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === calculationData.clientName);
            const clientCount = matchingClientCalculations.length;
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const getRevisionNumber = async (clientName) => {
                try {
                    const clientResponse = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/all`);
                    if (!clientResponse.ok) {
                        throw new Error("Failed to fetch calculations from the backend");
                    }
                    const clientData = await clientResponse.json();
                    console.log("Client Data:", clientData);
                    const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === clientName);
                    console.log("Matching Calculations:", matchingClientCalculations);
                    return matchingClientCalculations.length;
                } catch (error) {
                    console.error('Error fetching revision number:', error.message);
                    return 0;
                }
            };
            const revisionCount = await getRevisionNumber(siteName);
            const revisionNumber = `R ${Math.max(revisionCount)}`;
            const fileName = `${formatDate(date)}-R ${clientCount}`;
            const normalizedCalculations = calculationData.calculations.reduce((acc, floor, index) => {
                if (!floor.floorName && index > 0) {
                    floor.floorName = acc[index - 1].floorName;
                }
                acc.push(floor);
                return acc;
            }, []);
            const formattedData = {
                clientName: calculationData.clientName,
                date: formatDate(date),
                fileName,
                calculations: normalizedCalculations.map(floor => ({
                    floorName: floor.floorName,
                    areaName: floor.areaName,
                    tiles: floor.tiles.map(tile => ({
                        type: tile.type,
                        length: Number(tile.length) || 0,
                        breadth: Number(tile.breadth) || 0,
                        height: Number(tile.height) || 0,
                        deductionArea: Number(tile.deductionArea) || 0,
                        wastagePercentage: Number(tile.wastagePercentage) || 0,
                        skirtingArea: Number(tile.skirtingArea) || 0,
                        actualQuantity: Number(tile.actualQuantity) || 0,
                        totalOrderedTile: Number(tile.totalOrderedTile) || 0,
                        tileName: tile.tileName || "Default Tile Name",
                        size: tile.size || "Default Size",
                        qtyPerBox: Number(tile.qtyPerBox) || 1,
                        areaInSqft: Number(tile.Areainsqft) || 1,
                        noOfBoxes: Number(tile.noOfBoxes) || 0,
                    })),
                })),
            };
            const summaryData = createSummaryData();
            const StockingPdf = await generateFloorSummaryPDF(summaryData);
            const fullPdf = await generateFullPDF();
            const customerCopyPdf = await generateCustomerCopyPDF();
            const summaryPdf = await generateSummaryPDF();
            // Function to upload PDFs
            const uploadPdf = async (pdf, name) => {
                const singleFormData = new FormData();
                singleFormData.append("files", pdf, name);
                const pdfUploadResponse = await fetch(`https://backendaab.in/aabuilderDash/googleUploader/pdfs`, {
                    method: "POST",
                    body: singleFormData,
                });
                if (!pdfUploadResponse.ok) {
                    throw new Error("Failed to upload PDF: " + name);
                }
                console.log(`${name} uploaded successfully`);
            };

            await uploadPdf(fullPdf, `TMS EC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
            await uploadPdf(customerCopyPdf, `TMS CC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
            await uploadPdf(summaryPdf, `TMS OC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
            await uploadPdf(StockingPdf, `TMS SC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`)
            console.log("All PDFs uploaded successfully");
            console.log("Formatted Data Before Submission:", formattedData);
            const response = await fetch("https://backendaab.in/aabuilderDash/api/tile/tile/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formattedData),
            });
            if (!response.ok) {
                throw new Error("Failed to send data to the backend");
            }
            const responseData = await response.json();
            console.log("Response from backend:", responseData);

            setIsSubmitting(false);
            setClientName(null);
            setClientSNo('');
            setFloors([{
                floorName: "Ground Floor",
                areaName: "",
                tiles: [{ type: "Floor Tile", length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" }],
            }]);
            setRows([{ tileName: "", size: "", qtyPerBox: "", numberOfBoxes: "" }]);
            alert('Data submitted successfully!');
            window.location.reload();
        } catch (error) {
            console.error("Error sending data to the backend:", error);
            setIsSubmitting(false);
        }
    };
    const handleTileChange = (floorIndex, tileIndex, event) => {
        const { name, value } = event.target;
        const updatedFloors = [...floors];
        if (name === "tileName") {
            const selectedTile = tileOptions.find(tile => tile.value === value);
            if (selectedTile) {
                updatedFloors[floorIndex].tiles[tileIndex].size = selectedTile.size;
                updatedFloors[floorIndex].tiles[tileIndex].qtyPerBox = selectedTile.qtyPerBox;
                updatedFloors[floorIndex].tiles[tileIndex].Areainsqft = selectedTile.Areainsqft;
                updatedFloors[floorIndex].tiles[tileIndex].defaultSize = selectedTile.size;
                updatedFloors[floorIndex].tiles[tileIndex].defaultQtyPerBox = selectedTile.qtyPerBox;
            }
        }
        updatedFloors[floorIndex].tiles[tileIndex][name] = value;
        setFloors(updatedFloors);
    };
    const addTile = (floorIndex, tileIndex) => {
        const newTile = {
            type: 'Floor Tile',
            length: '',
            breadth: '',
            height: '',
            deductionArea: '',
            wastagePercentage: '0',
        };
        const updatedFloors = floors.map((floor, index) => {
            if (index === floorIndex) {
                const updatedTiles = [...floor.tiles];
                updatedTiles.splice(tileIndex + 1, 0, newTile);
                return { ...floor, tiles: updatedTiles };
            }
            return floor;
        });
        setFloors(updatedFloors);
        handleAddRow();
    };
    const addAreaRow = (floorIndex) => {
        const updatedFloors = [...floors];
        updatedFloors.splice(floorIndex + 1, 0, {
            floorName: null,
            areaName: "",
            tiles: [
                { type: "Floor Tile", length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" },
            ],
        });
        handleAddRow();
        setFloors(updatedFloors);
    };
    const addFloorRow = () => {
        setFloors((prevFloors) => [
            ...prevFloors,
            {
                floorName: "Ground Floor",
                areaName: "",
                tiles: [
                    { type: "Floor Tile", length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" },
                ],
            },
        ]);
        handleAddRow();
    };
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: "transparent",
            borderColor: state.isFocused ? "#FAF6ED" : "transparent",
            "&:hover": {
                borderColor: "#FAF6ED",
            },
            boxShadow: state.isFocused ? "0 0 0 1px #FAF6ED" : "none",
        }),
    };
    const [rows, setRows] = useState([
        { tileName: "", size: "", qtyPerBox: "", numberOfBoxes: "" },
    ]);
    const tileOptions = [
        {
            value: "Kajaria-Monaco Beige",
            label: "Kajaria-Monaco Beige",
            size: "5.25*2.75",
            qtyPerBox: 2,
            Areainsqft: 14.43,
        },
        {
            value: "Somany-Geostone Crema",
            label: "Somany-Geostone Crema",
            size: "2*2",
            qtyPerBox: 4,
            Areainsqft: 4,
        },
        {
            value: "Kajaria-Jurassic Gold",
            label: "Kajaria-Jurassic Gold",
            size: "4*2",
            qtyPerBox: 2,
            Areainsqft: 8,
        },
    ];
    const sizeOptions = [
        { value: "2*2", label: "2*2" },
        { value: "4*2", label: "4*2" },
        { value: "5.25*2.75", label: "5.25*2.75" },
    ];
    const calculateSummary = () => {
        const summaryMap = {};
        floors.forEach((floor) => {
            floor.tiles.forEach((tile) => {
                const key = `${tile.tileName}-${tile.size}`;
                if (!summaryMap[key]) {
                    summaryMap[key] = {
                        tileName: tile.tileName,
                        size: tile.size,
                        totalOrderedQuantity: 0,
                        totalBoxes: 0,
                    };
                }
                const totalOrderedQuantity = tile.length && (tile.breadth || tile.height)
                    ? (() => {
                        const length = Number(tile.length);
                        const breadth = Number(tile.breadth);
                        const height = Number(tile.height);
                        const wastagePercentage = Number(tile.wastagePercentage);
                        const deductionArea = Number(tile.deductionArea || 0);
                        let tileArea;
                        let skirtingArea;
                        if (tile.type === "Wall Tile") {
                            skirtingArea = 0;
                        } else {
                            skirtingArea = (tile.skirtingArea !== undefined && tile.skirtingArea !== null)
                                ? Number(tile.skirtingArea)
                                : (tile.isUserChanged ? Number(tile.directValue) : ((length + breadth) * 0.33));
                        }
                        if (tile.type === "Floor Tile") {
                            tileArea = length * breadth;
                        } else if (tile.type === "Wall Tile") {
                            tileArea = length * height;
                        }
                        const finalArea = tileArea - deductionArea;
                        const actualQuantity = finalArea + skirtingArea;
                        const wastage = (wastagePercentage / 100) * actualQuantity;
                        return actualQuantity + wastage;
                    })()
                    : 0;
                const qtyPerBox = Number(tile.qtyPerBox || 1);
                const Areainsqft = Number(tile.Areainsqft || 1);
                const numberOfBoxes = totalOrderedQuantity / (qtyPerBox * Areainsqft);
                summaryMap[key].totalOrderedQuantity += totalOrderedQuantity;
                summaryMap[key].totalBoxes += numberOfBoxes;
            });
        });
        return Object.values(summaryMap);
    };
    const summary = calculateSummary();
    const hexToRgb = (hex) => {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
    };
    const generateCustomerCopyPDF = async () => {
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
        const formatDate = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const getRevisionNumber = async (clientName) => {
            try {
                const clientResponse = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/all`);
                if (!clientResponse.ok) {
                    throw new Error("Failed to fetch calculations from the backend");
                }
                const clientData = await clientResponse.json();
                console.log("Client Data:", clientData);
                const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === clientName);
                console.log("Matching Calculations:", matchingClientCalculations);
                return matchingClientCalculations.length;
            } catch (error) {
                console.error('Error fetching revision number:', error.message);
                return 0;
            }
        };
        const revisionCount = await getRevisionNumber(siteName);
        const revisionNumber = `R ${Math.max(revisionCount)}`;
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Tile Measurement Sheet", doc.internal.pageSize.width / 2, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Site Name: ${siteName}`, 14, 40);
        doc.text(`Date: ${formatDate(date)}`, 14, 50);
        const headers = [
            ["S.No", "Area Name", "Type", "Length (ft)", "Breadth (ft)", "Height (ft)", "Deduction Area (sqft)", "Skirting Area (sqft)", "Wastage", "Quantity To Be Ordered (sqft)"]
        ];
        const rows = [];
        let previousFloorName = null;
        let floorCounter = 0;
        let areaCounter = 1;
        floors.forEach((floor) => {
            const currentFloorName = floor.floorName || previousFloorName;
            if (currentFloorName !== previousFloorName) {
                floorCounter += 1;
                areaCounter = 1;
                const floorLetter = String.fromCharCode(64 + floorCounter);
                rows.push([floorLetter, currentFloorName, "", "", "", "", "", "", "", "", "", "", "", ""]);
                previousFloorName = currentFloorName;
            }
            let areaNamePrinted = false;
            floor.tiles.forEach(tile => {
                const { length, breadth, height, wastagePercentage, deductionArea, type } = tile;
                const lengthNum = Number(length);
                const breadthNum = Number(breadth);
                const heightNum = Number(height);
                const wastagePercentageNum = Number(wastagePercentage);
                const deductionAreaNum = Number(deductionArea || 0);
                let tileArea;
                let skirtingArea = 0;
                if (type === "Wall Tile") {
                    skirtingArea = 0;
                } else {
                    skirtingArea = (tile.skirtingArea !== undefined && tile.skirtingArea !== null)
                        ? Number(tile.skirtingArea)
                        : (tile.isUserChanged ? Number(tile.directValue) : ((lengthNum + breadthNum) * 0.33));
                }
                if (type === "Floor Tile") {
                    tileArea = lengthNum * breadthNum;
                } else if (type === "Wall Tile") {
                    tileArea = lengthNum * heightNum;
                }
                const finalArea = tileArea - deductionAreaNum;
                const actualQuantity = finalArea + skirtingArea;
                const wastage = (wastagePercentageNum / 100) * actualQuantity;
                const totalOrderedQuantity = actualQuantity + wastage;
                const areaNameCell = areaNamePrinted ? '' : floor.areaName;
                areaNamePrinted = true;
                rows.push([
                    areaCounter,
                    areaNameCell,
                    tile.type,
                    length,
                    breadth,
                    height,
                    deductionAreaNum,
                    skirtingArea.toFixed(2),
                    wastagePercentage + "%",
                    totalOrderedQuantity.toFixed(2)
                ]);

            });
        });
        doc.autoTable({
            head: headers,
            body: rows,
            startY: 60,
            theme: "grid",
            headStyles: {
                fillColor: hexToRgb("#F2F2F2"),
                textColor: hexToRgb("#000000"),
                fontSize: 9,
                lineWidth: 0.3,
            },
            bodyStyles: {
                fontSize: 9,
                halign: 'left',
                lineWidth: 0
            },
            columnStyles: {
                0: { cellWidth: 13 },
                1: { cellWidth: 25 },
                2: { cellWidth: 20 },
                3: { cellWidth: 20 },
                4: { cellWidth: 22 },
                5: { cellWidth: 20 },
                6: { cellWidth: 30 },
                7: { cellWidth: 30 },
                8: { cellWidth: 17 },
                9: { cellWidth: 23 },
            },
            margin: { top: 30 },
            pageBreak: 'auto',
            tableWidth: 'wrap',
            didDrawCell: (data) => {
                doc.setLineWidth(0.3);
                if (data.row.index === 0) {
                    doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                    const cellX = data.cell.x;
                    const cellY = data.cell.y;
                    doc.line(cellX, cellY, cellX, cellY);
                } else if (data.row.index > 0) {
                    const previousRow = data.table.body[data.row.index - 1];
                    const previousRowFirstColumnValue = previousRow.cells[0].raw;
                    const currentRowFirstColumnValue = data.row.cells[0].raw;
                    console.log(previousRowFirstColumnValue)
                    doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                    if (currentRowFirstColumnValue === null || currentRowFirstColumnValue === '') {
                        const previousRowY = previousRow.cells[0].y;
                        doc.line(data.cell.x, previousRowY, data.cell.x + data.cell.width, previousRowY);
                    }
                    const currentFloorName = currentRowFirstColumnValue;
                    const removeVerticalBorder = ["Ground Floor", "First Floor", "Second Floor"].includes(currentFloorName);
                    if (!removeVerticalBorder) {
                        doc.setLineWidth(0.5);
                        if (data.column.index > 0) {
                            doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + data.cell.height);
                            doc.line(data.cell.x + data.cell.width, data.cell.y, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                        }
                    }
                }
                if (data.row.index >= 0) {
                    if (data.column.index === 0) {
                        doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + data.cell.height);
                    }
                    if (data.column.index === 8) {
                        doc.line(data.cell.x + data.cell.width, data.cell.y, data.cell.x + data.cell.width, data.cell.y + data.cell.height); // Right vertical line
                    }
                }
            }
        });
        // Create the filename
        const filename = `TMS CC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
        doc.save(filename);
        return doc.output("blob");
    };
    const handleDirectValueChange = (floorIndex, tileIndex, event) => {
        const updatedFloors = [...floors];
        const tile = updatedFloors[floorIndex].tiles[tileIndex];

        // Update directValue and mark as changed
        tile.directValue = Number(event.target.value) || 0; // Allow 0 if input is empty
        tile.isUserChanged = true; // Mark as manually changed

        setFloors(updatedFloors); // Update the state
    };
    const resetToCalculatedValue = (floorIndex, tileIndex) => {
        const updatedFloors = [...floors];
        const tile = updatedFloors[floorIndex].tiles[tileIndex];

        // Reset the skirting area to the calculated value
        tile.directValue = ((Number(tile.length) + Number(tile.breadth)) * 0.33).toFixed(2);
        tile.isUserChanged = false; // Mark as not manually changed, allowing future edits

        setFloors(updatedFloors); // Update the state
    };
    const generateSummaryPDF = async () => {
        const doc = new jsPDF();
        const formatDateForName = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        };
        const selectedDate = formatDateForName(date);
        const formatDate = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const getRevisionNumber = async (clientName) => {
            try {
                const clientResponse = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/all`);
                if (!clientResponse.ok) {
                    throw new Error("Failed to fetch calculations from the backend");
                }
                const clientData = await clientResponse.json();
                console.log("Client Data:", clientData);

                const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === clientName);
                console.log("Matching Calculations:", matchingClientCalculations);
                return matchingClientCalculations.length;
            } catch (error) {
                console.error('Error fetching revision number:', error.message);
                return 0;
            }
        };
        const revisionCount = await getRevisionNumber(siteName);
        const revisionNumber = `R ${Math.max(revisionCount)}`;
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Tile Order Copy", doc.internal.pageSize.width / 2, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Site Name: ${siteName}`, 14, 30);
        doc.text(`Date: ${formatDate(date)}`, 14, 40);
        const columns = ["S.No", "Tile Name", "Size", "Total Area (sqft)", "No of Boxes"];
        const rows = summary.map((row, index) => [
            index + 1,
            row.tileName,
            row.size,
            row.totalOrderedQuantity.toFixed(2),
            row.totalBoxes.toFixed(2),
        ]);
        const totalArea = summary.reduce((acc, row) => acc + row.totalOrderedQuantity, 0).toFixed(2);
        const totalBoxes = summary.reduce((acc, row) => acc + row.totalBoxes, 0).toFixed(2);
        rows.push([{ content: "Total", styles: { fontStyle: 'bold' } }, "", totalArea, totalBoxes]);
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 50,
            styles: {
                textColor: hexToRgb("#000000"),
                halign: 'left',
                cellPadding: 2,
                lineWidth: 0.2,
            },
            headStyles: {
                fillColor: hexToRgb("#F2F2F2"),
                lineWidth: 0.2,
            },
            bodyStyles: {
                fillColor: hexToRgb("#FFFFFF"),
                textColor: hexToRgb("#000000"),
                halign: 'left',
                lineWidth: 0.2,
            },
            alternateRowStyles: {
                fillColor: hexToRgb("#FFFFFF"),
            },
            columnStyles: {
                0: { cellWidth: 14 },
                1: { cellWidth: 50 },
                2: { cellWidth: 30 },
                3: { cellWidth: 30 },
                4: { cellWidth: 25 },
            },
            didParseCell: (data) => {
                if (data.row.index === rows.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });
        const filename = `TMS OC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
        doc.save(filename);
        return doc.output("blob");
    };
    const createSummaryData = () => {
        const summaryData = [];
        let grandTotalArea = 0; // Initialize grand total for area
        let grandTotalBoxes = 0;
        floors.forEach(floor => {
            const floorName = floor.floorName;
            floor.tiles.forEach(tile => {
                if (tile.tileName) {
                    const length = Number(tile.length) || 0;
                    const breadth = Number(tile.breadth) || 0;
                    const height = Number(tile.height) || 0;
                    const deductionArea = Number(tile.deductionArea) || 0;
                    const wastagePercentage = Number(tile.wastagePercentage) || 0;
                    const qtyPerBox = Number(tile.qtyPerBox) || 1;
                    const Areainsqft = Number(tile.Areainsqft || 1);
                    // Calculate the tile area based on type
                    let tileArea;
                    let skirtingArea;
                    if (tile.type === "Wall Tile") {
                        skirtingArea = 0;
                    } else {
                        skirtingArea = (tile.skirtingArea !== undefined && tile.skirtingArea !== null)
                            ? Number(tile.skirtingArea)
                            : (tile.isUserChanged ? Number(tile.directValue) : ((length + breadth) * 0.33));
                    }
                    if (tile.type === "Floor Tile") {
                        tileArea = length * breadth;
                    } else if (tile.type === "Wall Tile") {
                        tileArea = length * height;
                    }
                    const finalArea = tileArea - deductionArea; // Deduct any specified area
                    const actualQuantity = finalArea + skirtingArea;
                    const wastage = (wastagePercentage / 100) * actualQuantity; // Calculate wastage
                    const totalOrderedTile = actualQuantity + wastage;
                    const numberOfBoxes = (totalOrderedTile / (qtyPerBox * Areainsqft));
                    grandTotalArea += totalOrderedTile;
                    grandTotalBoxes += numberOfBoxes;
                    summaryData.push({
                        floorName: floorName,
                        tileName: tile.tileName,
                        size: tile.size,
                        totalOrderedQuantity: totalOrderedTile, // Round to two decimal places
                        totalBoxes: numberOfBoxes // Keep as number
                    });
                }
            });
        });
        summaryData.push({
            floorName: "Total",
            tileName: "",
            size: "",
            totalOrderedQuantity: grandTotalArea, // Round total area
            totalBoxes: grandTotalBoxes // Round total boxes
        });
        return summaryData; // Return the collected data
    };
    const generateFloorSummaryPDF = async (summaryData) => {
        const doc = new jsPDF();
        const formatDateForName = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        };
        const selectedDate = formatDateForName(date);
        const formatDate = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const getRevisionNumber = async (clientName) => {
            try {
                const clientResponse = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/all`);
                if (!clientResponse.ok) {
                    throw new Error("Failed to fetch calculations from the backend");
                }
                const clientData = await clientResponse.json();
                console.log("Client Data:", clientData);
                const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === clientName);
                console.log("Matching Calculations:", matchingClientCalculations);
                return matchingClientCalculations.length;
            } catch (error) {
                console.error('Error fetching revision number:', error.message);
                return 0;
            }
        };
        const revisionCount = await getRevisionNumber(siteName);
        const revisionNumber = `R ${Math.max(revisionCount)}`;
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Tile Stocking Chart", doc.internal.pageSize.width / 2, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Site Name: ${siteName}`, 14, 30);
        doc.text(`Date: ${formatDate(date)}`, 14, 40);
        const columns = ["Floor Name", "Tile Name", "Tile Size", "Total Area (sqft)", "No of Boxes"];
        const rows = [];
        const floorData = {};
        let previousFloorName = "";
        let serialNumber = 1;
        summaryData.forEach(item => {
            const floorName = item.floorName && item.floorName.trim() !== "" ? item.floorName : previousFloorName;
            if (floorName) {
                previousFloorName = floorName;
            }
            const tileKey = `${item.tileName}|${item.size}`;
            if (!floorData[floorName]) {
                floorData[floorName] = {};
            }
            if (!floorData[floorName][tileKey]) {
                floorData[floorName][tileKey] = {
                    tileName: item.tileName,
                    size: item.size,
                    totalOrderedQuantity: 0,
                    totalBoxes: 0
                };
            }
            floorData[floorName][tileKey].totalOrderedQuantity += item.totalOrderedQuantity;
            floorData[floorName][tileKey].totalBoxes += item.totalBoxes;
        });
        for (const floor in floorData) {
            for (const tileKey in floorData[floor]) {
                const tile = floorData[floor][tileKey];
                rows.push([
                    serialNumber++,
                    floor,
                    tile.tileName,
                    tile.size,
                    tile.totalOrderedQuantity.toFixed(2),
                    tile.totalBoxes.toFixed(2),
                ]);
            }
        }
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 50,
            styles: {
                textColor: hexToRgb("#000000"),
                halign: 'left',
                cellPadding: 2,
                lineWidth: 0.2,
            },
            headStyles: {
                fillColor: hexToRgb("#F2F2F2"),
                lineWidth: 0.2,
            },
            bodyStyles: {
                fillColor: hexToRgb("#FFFFFF"),
                textColor: hexToRgb("#000000"),
                halign: 'left',
                lineWidth: 0.2,
            },
            alternateRowStyles: {
                fillColor: hexToRgb("#FFFFFF"),
            },
            columnStyles: {
                0: { cellWidth: 45 },
                1: { cellWidth: 45 },
                2: { cellWidth: 30 },
                3: { cellWidth: 30 },
                4: { cellWidth: 25 },
            },
            didParseCell: (data) => {
                if (data.row.index === rows.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });
        const filename = `TMS SC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
        doc.save(filename);
        return doc.output("blob");
    };
    const handleGeneratePDF = () => {
        const summaryData = createSummaryData();
        floorSummaryPDF(summaryData);
    };
    const generateFullPDF = async () => {
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
        const formatDate = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const getRevisionNumber = async (clientName) => {
            try {
                const clientResponse = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/all`);
                if (!clientResponse.ok) {
                    throw new Error("Failed to fetch calculations from the backend");
                }
                const clientData = await clientResponse.json();
                console.log("Client Data:", clientData);
                const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === clientName);
                console.log("Matching Calculations:", matchingClientCalculations);
                return matchingClientCalculations.length;
            } catch (error) {
                console.error('Error fetching revision number:', error.message);
                return 0;
            }
        };
        const revisionCount = await getRevisionNumber(siteName);
        const revisionNumber = `R ${Math.max(revisionCount)}`;
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Tile Measurement Sheet", doc.internal.pageSize.width / 2, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Site Name: ${siteName}`, 14, 40);
        doc.text(`Date: ${formatDate(date)}`, 14, 50);
        const customerHeaders = [
            ["S.No", "Area Name", "Type", "L  (ft)", "B  (ft)", "H  (ft)", "Deduction Area (sqft)", "Skirting Area (sqft)", "Wastage", "Quantity To Be Ordered (sqft)", "Tile Name", "Size", "Qty/Box", "No of Boxes"]
        ];
        const customerRows = [];
        let previousFloorName = null;
        let floorCounter = 0;
        let areaCounter = 1;
        floors.forEach((floor) => {
            const currentFloorName = floor.floorName || previousFloorName;
            if (currentFloorName !== previousFloorName) {
                floorCounter += 1;
                areaCounter = 1; // Reset areaCounter for each floor
                const floorLetter = String.fromCharCode(64 + floorCounter);
                customerRows.push([floorLetter, currentFloorName, "", "", "", "", "", "", "", "", "", "", "", ""]);
                previousFloorName = currentFloorName;
            }
            let areaNamePrinted = false;
            floor.tiles.forEach(tile => {
                const { length, breadth, height, wastagePercentage, deductionArea, type, qtyPerBox, tileName, size, Areainsqft } = tile;
                const lengthNum = Number(length);
                const breadthNum = Number(breadth);
                const heightNum = Number(height);
                const wastagePercentageNum = Number(wastagePercentage);
                const deductionAreaNum = Number(deductionArea || 0);
                let tileArea;
                let skirtingArea = 0;
                if (type === "Wall Tile") {
                    skirtingArea = 0;
                } else {
                    skirtingArea = (tile.skirtingArea !== undefined && tile.skirtingArea !== null)
                        ? Number(tile.skirtingArea)
                        : (tile.isUserChanged ? Number(tile.directValue) : ((lengthNum + breadthNum) * 0.33));
                }
                if (type === "Floor Tile") {
                    tileArea = lengthNum * breadthNum;
                } else if (type === "Wall Tile") {
                    tileArea = lengthNum * heightNum;
                }
                const finalArea = tileArea - deductionAreaNum;
                const actualQuantity = finalArea + skirtingArea;
                const wastage = (wastagePercentageNum / 100) * actualQuantity;
                const totalOrderedQuantity = actualQuantity + wastage;
                const areainsqft = Number(Areainsqft || 1);
                const noOfBoxes = (totalOrderedQuantity / (qtyPerBox * areainsqft)).toFixed(2);
                const areaNameCell = areaNamePrinted ? '' : floor.areaName;
                areaNamePrinted = true;
                customerRows.push([
                    areaCounter,
                    areaNameCell,
                    tile.type,
                    length,
                    breadth,
                    height,
                    deductionAreaNum,
                    skirtingArea.toFixed(2),
                    wastagePercentage + "%",
                    totalOrderedQuantity.toFixed(2),
                    tileName,
                    size,
                    qtyPerBox,
                    noOfBoxes
                ]);
                areaCounter += 1;
            });
        });
        doc.autoTable({
            head: customerHeaders,
            body: customerRows,
            startY: 60,
            theme: "grid",
            headStyles: {
                fillColor: hexToRgb("#F2F2F2"),
                textColor: hexToRgb("#000000"),
                fontSize: 9,
                lineWidth: 0.3,
            },
            bodyStyles: {
                fontSize: 9,
                halign: 'left',
                lineWidth: 0
            },
            columnStyles: {
                0: { cellWidth: 13 },
                1: { cellWidth: 25 },
                2: { cellWidth: 20 },
                3: { cellWidth: 14 },
                4: { cellWidth: 14 },
                5: { cellWidth: 14 },
                6: { cellWidth: 20 },
                7: { cellWidth: 17 },
                8: { cellWidth: 17 },
                9: { cellWidth: 23 },
                10: { cellWidth: 30 },
                11: { cellWidth: 20 },
                12: { cellWidth: 11 },
                13: { cellWidth: 18 },
            },
            margin: { top: 30 },
            pageBreak: 'auto',
            tableWidth: 'wrap',
            didDrawCell: (data) => {
                doc.setLineWidth(0.3);
                if (data.row.index === 0) {
                    doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                    const cellX = data.cell.x;
                    const cellY = data.cell.y;
                    doc.line(cellX, cellY, cellX, cellY);
                } else if (data.row.index > 0) {
                    const previousRow = data.table.body[data.row.index - 1];
                    const previousRowFirstColumnValue = previousRow.cells[0].raw;
                    const currentRowFirstColumnValue = data.row.cells[0].raw;
                    console.log(previousRowFirstColumnValue)
                    doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                    if (currentRowFirstColumnValue === null || currentRowFirstColumnValue === '') {
                        const previousRowY = previousRow.cells[0].y;
                        doc.line(data.cell.x, previousRowY, data.cell.x + data.cell.width, previousRowY);
                    }
                    const currentFloorName = currentRowFirstColumnValue;
                    const removeVerticalBorder = ["Ground Floor", "First Floor", "Second Floor"].includes(currentFloorName);
                    if (!removeVerticalBorder) {
                        doc.setLineWidth(0.5);
                        if (data.column.index > 0) {
                            doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + data.cell.height);
                            doc.line(data.cell.x + data.cell.width, data.cell.y, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                        }
                    }
                }
                if (data.row.index >= 0) {
                    if (data.column.index === 0) {
                        doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + data.cell.height);
                    }
                    if (data.column.index === 12) {
                        doc.line(data.cell.x + data.cell.width, data.cell.y, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                    }
                }
            }
        });
        doc.addPage();
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        const title = "Tile Order Copy";
        const titleWidth = doc.getTextWidth(title);
        const pageWidth = doc.internal.pageSize.getWidth();
        const titleX = (pageWidth - titleWidth) / 2;
        doc.text(title, titleX, 20);
        doc.setFontSize(12);
        doc.text(`Site Name: ${siteName}`, 14, 30);
        doc.text(`Date: ${formatDate(date)}`, 14, 40);
        const summaryHeaders = ["S.No", "Tile Name", "Size", "Total Area (sqft)", "No of Boxes"];
        const summaryRows = summary.map((row, index) => [
            index + 1,
            row.tileName,
            row.size,
            row.totalOrderedQuantity.toFixed(2),
            row.totalBoxes.toFixed(2),
        ]);
        const totalArea = summary.reduce((acc, row) => acc + row.totalOrderedQuantity, 0).toFixed(2);
        const totalBoxes = summary.reduce((acc, row) => acc + row.totalBoxes, 0).toFixed(2);
        summaryRows.push([{ content: "", styles: { fontStyle: 'bold' } }, "Total", "", totalArea, totalBoxes]);
        doc.autoTable({
            head: [summaryHeaders],
            body: summaryRows,
            startY: 50,
            styles: {
                textColor: hexToRgb("#000000"),
                halign: 'left',
                cellPadding: 2,
                lineWidth: 0.2,
            },
            headStyles: {
                fillColor: hexToRgb("#F2F2F2"),
                lineWidth: 0.2,
            },
            bodyStyles: {
                fillColor: hexToRgb("#FFFFFF"),
                textColor: hexToRgb("#000000"),
                halign: 'left',
                lineWidth: 0.2,
            },
            alternateRowStyles: {
                fillColor: hexToRgb("#FFFFFF"),
            },
            columnStyles: {
                0: { cellWidth: 14 },
                1: { cellWidth: 50 },
                2: { cellWidth: 30 },
                3: { cellWidth: 30 },
                4: { cellWidth: 25 },
            },
            didParseCell: (data) => {
                if (data.row.index === summaryRows.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });
        const filename = `TMS EC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
        doc.save(filename);
        return doc.output("blob");
    };
    const deleteTileRow = (floorIndex, tileIndex) => {
        const updatedFloors = [...floors];
        updatedFloors[floorIndex].tiles.splice(tileIndex, 1);
        setFloors(updatedFloors);
    };
    const deleteAreaRow = (floorIndex) => {
        const updatedFloors = [...floors];
        updatedFloors.splice(floorIndex, 1);
        setFloors(updatedFloors);
    };
    const [wastagePercentage, setWastagePercentage] = useState(0);
    const handleCommonWastageChange = (e) => {
        const selectedValue = parseInt(e.target.value, 10);
        setWastagePercentage(selectedValue);
        const updatedFloors = floors.map((floor) => ({
            ...floor,
            tiles: floor.tiles.map((tile) => ({
                ...tile,
                wastagePercentage: selectedValue,  // Reset all rows' wastage percentage
            })),
        }));
        setFloors(updatedFloors);
    };
    const totalArea = summary1.reduce((sum, item) => sum + parseFloat(item.totalOrderedQuantity || 0), 0);
    const totalBoxes = summary1.reduce((sum, item) => sum + parseFloat(item.totalBoxes || 0), 0);
    const handleSizeChange = (floorIndex, tileIndex, newSize) => {
        const selectedTile = tileOptions.find(tile => tile.size === newSize);
        const updatedFloors = [...floors];
        updatedFloors[floorIndex].tiles[tileIndex].size = newSize;
        if (selectedTile) {
            updatedFloors[floorIndex].tiles[tileIndex].qtyPerBox = selectedTile.qtyPerBox;
            updatedFloors[floorIndex].tiles[tileIndex].Areainsqft = selectedTile.Areainsqft;
        } else {
            updatedFloors[floorIndex].tiles[tileIndex].qtyPerBox = '';
            updatedFloors[floorIndex].tiles[tileIndex].Areainsqft = '';
        }
        setFloors(updatedFloors);
    };

    const handleFileChange = (selected) => {
        if (!selected) {
            setSelectedFile(null);
            setSelectedClientData({ calculations: [] });
            setFloors([]);
            return;
        }
        const selectedClientData = fullData.find(calculation => calculation.id === selected.value);
        setSelectedFile(selected);
        if (selectedClientData) {
            setSelectedClientData(selectedClientData);
            console.log('Full Data for Selected Client:', selectedClientData);
            const seenFloors = new Set();
            const newFloorsData = selectedClientData.calculations.map((calc) => {
                const floorName = calc.floorName || 'No floor name available';
                const areaName = calc.areaName || 'No area name available';
                if (seenFloors.has(floorName)) {
                    return {
                        floorName: null,
                        areaName: areaName,
                        tiles: calc.tiles.map(tile => ({
                            type: tile.type,
                            length: tile.length,
                            breadth: tile.breadth,
                            height: tile.height,
                            deductionArea: tile.deductionArea,
                            skirtingArea: tile.skirtingArea,
                            Areainsqft: tile.areaInSqft,
                            qtyPerBox: tile.qtyPerBox,
                            tileName: tile.tileName,
                            size: tile.size,
                            actualQuantity: tile.actualQuantity,
                            noOfBoxes: tile.noOfBoxes,
                            wastagePercentage: tile.wastagePercentage,
                            isUserChanged: tile.isUserChanged || false,
                            directValue: tile.directValue || 0,
                            defaultSize: tile.defaultSize || '',
                            defaultQtyPerBox: tile.defaultQtyPerBox || '',
                        })),
                    };
                } else {
                    seenFloors.add(floorName);
                    return {
                        floorName: floorName,
                        areaName: areaName,
                        tiles: calc.tiles.map(tile => ({
                            type: tile.type,
                            length: tile.length,
                            breadth: tile.breadth,
                            height: tile.height,
                            deductionArea: tile.deductionArea,
                            skirtingArea: tile.skirtingArea,
                            Areainsqft: tile.areaInSqft,
                            qtyPerBox: tile.qtyPerBox,
                            tileName: tile.tileName,
                            size: tile.size,
                            actualQuantity: tile.actualQuantity,
                            noOfBoxes: tile.noOfBoxes,
                            wastagePercentage: tile.wastagePercentage,
                            isUserChanged: tile.isUserChanged || false,
                            directValue: tile.directValue || 0,
                            defaultSize: tile.defaultSize || '',
                            defaultQtyPerBox: tile.defaultQtyPerBox || '',
                        })),
                    };
                }
            });

            setFloors(newFloorsData);
        } else {
            setSelectedClientData({ calculations: [] });
            setFloors([]);
        }
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
        const formatDate = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const fileType = "CC";
        const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
        // Get the revision number from the backend
        const getRevisionNumber = async (clientName) => {
            try {
                const clientResponse = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/all`);
                if (!clientResponse.ok) {
                    throw new Error("Failed to fetch calculations from the backend");
                }
                const clientData = await clientResponse.json();
                const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === clientName);
                const revisionNumber = matchingClientCalculations.length > 0 ? `R ${Math.max(matchingClientCalculations.length - 1, 0)}` : 'R0';
                return revisionNumber;
            } catch (error) {
                console.error('Error fetching revision number:', error.message);
                return 'R 0';
            }
        };
        const getIncrement = async (fileLabel) => {
            try {

                const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch increment from the backend");
                }
                const increment = await response.json();
                return increment;
            } catch (error) {
                console.error('Error fetching increment:', error.message);
                return 0; // Default to 0 if there's an error
            }
        };

        // Post increment data to the backend
        const postIncrement = async (fileLabel, fileType) => {
            try {
                await fetch('https://backendaab.in/aabuilderDash/api/tile/tile/updateIncrement', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fileLabel, fileType, clientId }),
                });
            } catch (error) {
                console.error('Error posting increment:', error.message);
            }
        };

        let filename;
        const incrementValue = await getIncrement(fileLabel, fileType, clientId);
        if (selectedFile && selectedFile.label) {
            filename = `TMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
        } else {
            const revisionNumber = await getRevisionNumber(siteName);
            filename = `TMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDate(currentDate)}.pdf`;
        }

        await postIncrement(fileLabel, fileType); // Post the data here
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Tile Measurement Sheet", doc.internal.pageSize.width / 2, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Site Name: ${siteName}`, 14, 40);
        doc.text(`Date: ${formatDate(date)}`, 14, 50);
        const headers = [
            ["S.No", "Area Name", "Type", "Length (ft)", "Breadth (ft)", "Height (ft)", "Deduction Area (sqft)", "Skirting Area (sqft)", "Wastage", "Quantity To Be Ordered (sqft)"]
        ];
        const rows = [];
        let previousFloorName = null;
        let floorCounter = 0;
        let areaCounter = 1;
        floors.forEach((floor) => {
            const currentFloorName = floor.floorName || previousFloorName;
            if (currentFloorName !== previousFloorName) {
                floorCounter += 1;
                areaCounter = 1;
                const floorLetter = String.fromCharCode(64 + floorCounter);
                rows.push([floorLetter, currentFloorName, "", "", "", "", "", "", "", "", "", "", "", ""]);
                previousFloorName = currentFloorName;
            }
            let areaNamePrinted = false;
            floor.tiles.forEach(tile => {
                const { length, breadth, height, wastagePercentage, deductionArea, type } = tile;
                const lengthNum = Number(length);
                const breadthNum = Number(breadth);
                const heightNum = Number(height);
                const wastagePercentageNum = Number(wastagePercentage);
                const deductionAreaNum = Number(deductionArea || 0);
                let tileArea;
                let skirtingArea = 0;
                if (type === "Wall Tile") {
                    skirtingArea = 0;
                } else {
                    skirtingArea = (tile.skirtingArea !== undefined && tile.skirtingArea !== null)
                        ? Number(tile.skirtingArea)
                        : (tile.isUserChanged ? Number(tile.directValue) : ((lengthNum + breadthNum) * 0.33));
                }
                if (type === "Floor Tile") {
                    tileArea = lengthNum * breadthNum;
                } else if (type === "Wall Tile") {
                    tileArea = lengthNum * heightNum;
                }

                const finalArea = tileArea - deductionAreaNum;
                const actualQuantity = finalArea + skirtingArea;
                const wastage = (wastagePercentageNum / 100) * actualQuantity;
                const totalOrderedQuantity = actualQuantity + wastage;
                const areaNameCell = areaNamePrinted ? '' : floor.areaName;
                areaNamePrinted = true;
                rows.push([
                    areaCounter,
                    areaNameCell,
                    tile.type,
                    length,
                    breadth,
                    height,
                    deductionAreaNum,
                    skirtingArea.toFixed(2),
                    wastagePercentage + "%",
                    totalOrderedQuantity.toFixed(2)
                ]);
                areaCounter += 1;
            });
        });
        doc.autoTable({
            head: headers,
            body: rows,
            startY: 60,
            theme: "grid",
            headStyles: {
                fillColor: hexToRgb("#F2F2F2"),
                textColor: hexToRgb("#000000"),
                fontSize: 9,
                lineWidth: 0.3,
            },
            bodyStyles: {
                fontSize: 9,
                halign: 'left',
                lineWidth: 0
            },
            columnStyles: {
                0: { cellWidth: 12 },
                1: { cellWidth: 25 },
                2: { cellWidth: 20 },
                3: { cellWidth: 20 },
                4: { cellWidth: 22 },
                5: { cellWidth: 20 },
                6: { cellWidth: 30 },
                7: { cellWidth: 30 },
                8: { cellWidth: 17 },
                9: { cellWidth: 23 },
            },
            margin: { top: 30 },
            pageBreak: 'auto',
            tableWidth: 'wrap',
            didDrawCell: (data) => {
                doc.setLineWidth(0.3);
                if (data.row.index === 0) {
                    doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                    const cellX = data.cell.x;
                    const cellY = data.cell.y;
                    doc.line(cellX, cellY, cellX, cellY);
                } else if (data.row.index > 0) {
                    const previousRow = data.table.body[data.row.index - 1];
                    //const previousRowFirstColumnValue = previousRow.cells[0].raw;
                    const currentRowFirstColumnValue = data.row.cells[0].raw;
                    doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                    if (currentRowFirstColumnValue === null || currentRowFirstColumnValue === '') {
                        const previousRowY = previousRow.cells[0].y;
                        doc.line(data.cell.x, previousRowY, data.cell.x + data.cell.width, previousRowY);
                    }
                    const currentFloorName = currentRowFirstColumnValue;
                    const removeVerticalBorder = ["Ground Floor", "First Floor", "Second Floor"].includes(currentFloorName);
                    if (!removeVerticalBorder) {
                        doc.setLineWidth(0.5);
                        if (data.column.index > 0) {
                            doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + data.cell.height);
                            doc.line(data.cell.x + data.cell.width, data.cell.y, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                        }
                    }
                }
                if (data.row.index >= 0) {
                    if (data.column.index === 0) {
                        doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + data.cell.height);
                    }
                    if (data.column.index === 8) {
                        doc.line(data.cell.x + data.cell.width, data.cell.y, data.cell.x + data.cell.width, data.cell.y + data.cell.height); // Right vertical line
                    }
                }
            }
        });
        doc.save(filename);
        return doc.output("blob");
    };
    const summaryPDF = async () => {
        const doc = new jsPDF();
        const formatDate = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };
        const formatDateForName = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        };
        const fileType = 'OC';
        const selectedDate = formatDateForName(date);
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
        const getRevisionNumber = async (clientName) => {
            try {
                const clientResponse = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/all`);
                if (!clientResponse.ok) {
                    throw new Error("Failed to fetch calculations from the backend");
                }
                const clientData = await clientResponse.json();
                const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === clientName);
                const revisionNumber = matchingClientCalculations.length > 0 ? `R ${Math.max(matchingClientCalculations.length - 1, 0)}` : 'R0';
                return revisionNumber;
            } catch (error) {
                console.error('Error fetching revision number:', error.message);
                return 'R 0';
            }
        };
        const getIncrement = async (fileLabel) => {
            try {

                const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch increment from the backend");
                }
                const increment = await response.json();
                return increment;
            } catch (error) {
                console.error('Error fetching increment:', error.message);
                return 0; // Default to 0 if there's an error
            }
        };

        // Post increment data to the backend
        const postIncrement = async (fileLabel, fileType) => {
            try {
                await fetch('https://backendaab.in/aabuilderDash/api/tile/tile/updateIncrement', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fileLabel, fileType, clientId }),
                });
            } catch (error) {
                console.error('Error posting increment:', error.message);
            }
        };
        let filename;
        const incrementValue = await getIncrement(fileLabel, fileType);
        if (selectedFile && selectedFile.label) {
            filename = `TMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
        } else {
            const revisionNumber = await getRevisionNumber(siteName);
            filename = `TMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDate(currentDate)}.pdf`;
        }
        await postIncrement(fileLabel, fileType);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Tile Order Copy", doc.internal.pageSize.width / 2, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Site Name: ${siteName}`, 14, 30);
        doc.text(`Date: ${formatDate(date)}`, 14, 40);
        const columns = ["S.No.", "Tile Name", "Size", "Total Area (sqft)", "No of Boxes"];

        // Add S.No. to the rows
        const rows = summary.map((row, index) => [
            index + 1, // Add S.No. here
            row.tileName,
            row.size,
            row.totalOrderedQuantity.toFixed(2),
            row.totalBoxes.toFixed(2),
        ]);
        const totalArea = summary.reduce((acc, row) => acc + row.totalOrderedQuantity, 0).toFixed(2);
        const totalBoxes = summary.reduce((acc, row) => acc + row.totalBoxes, 0).toFixed(2);
        rows.push([{ content: "", styles: { fontStyle: 'bold' } }, "Total", "", totalArea, totalBoxes]);
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 50,
            styles: {
                textColor: hexToRgb("#000000"),
                halign: 'left',
                cellPadding: 2,
                lineWidth: 0.2,
            },
            headStyles: {
                fillColor: hexToRgb("#F2F2F2"),
                lineWidth: 0.2,
            },
            bodyStyles: {
                fillColor: hexToRgb("#FFFFFF"),
                textColor: hexToRgb("#000000"),
                halign: 'left',
                lineWidth: 0.2,
            },
            alternateRowStyles: {
                fillColor: hexToRgb("#FFFFFF"),
            },
            columnStyles: {
                0: { cellWidth: 14 }, // S.No. column width
                1: { cellWidth: 50 },
                2: { cellWidth: 30 },
                3: { cellWidth: 30 },
                4: { cellWidth: 25 },
            },
            didParseCell: (data) => {
                if (data.row.index === rows.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });

        doc.save(filename);
        return doc.output("blob");
    };
    const floorSummaryPDF = async (summaryData) => {
        const doc = new jsPDF();
        const formatDateForName = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        };
        const selectedDate = formatDateForName(date);
        const formatDate = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };
        const fileType = 'SC';
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
        const getRevisionNumber = async (clientName) => {
            try {
                const clientResponse = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/all`);
                if (!clientResponse.ok) {
                    throw new Error("Failed to fetch calculations from the backend");
                }
                const clientData = await clientResponse.json();
                const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === clientName);
                const revisionNumber = matchingClientCalculations.length > 0 ? `R ${Math.max(matchingClientCalculations.length - 1, 0)}` : 'R0';
                return revisionNumber;
            } catch (error) {
                console.error('Error fetching revision number:', error.message);
                return 'R 0';
            }
        };
        // Get the increment for the given file label
        const getIncrement = async (fileLabel) => {
            try {

                const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch increment from the backend");
                }
                const increment = await response.json();
                return increment;
            } catch (error) {
                console.error('Error fetching increment:', error.message);
                return 0; // Default to 0 if there's an error
            }
        };
        // Post increment data to the backend
        const postIncrement = async (fileLabel, fileType) => {
            try {
                await fetch('https://backendaab.in/aabuilderDash/api/tile/tile/updateIncrement', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fileLabel, fileType, clientId }),
                });
            } catch (error) {
                console.error('Error posting increment:', error.message);
            }
        };

        let filename;
        const incrementValue = await getIncrement(fileLabel, fileType);
        console.log(fileLabel);
        console.log(fileType);
        console.log(incrementValue);
        if (selectedFile && selectedFile.label) {
            filename = `TMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
        } else {
            const revisionNumber = await getRevisionNumber(siteName);
            filename = `TMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDate(currentDate)}.pdf`;
        }

        await postIncrement(fileLabel, fileType); // Post the data here
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Tile Stocking Chart", doc.internal.pageSize.width / 2, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Site Name: ${siteName}`, 14, 30);
        doc.text(`Date: ${formatDate(date)}`, 14, 40);
        const columns = ["S.No", "Floor Name", "Tile Name", "Tile Size", "Total Area (sqft)", "No of Boxes"];
        const rows = [];
        const floorData = {};
        let previousFloorName = "";
        let serialNumber = 1;
        summaryData.forEach(item => {
            const floorName = item.floorName && item.floorName.trim() !== "" ? item.floorName : previousFloorName;
            if (floorName) {
                previousFloorName = floorName;
            }
            const tileKey = `${item.tileName}|${item.size}`;
            if (!floorData[floorName]) {
                floorData[floorName] = {};
            }
            if (!floorData[floorName][tileKey]) {
                floorData[floorName][tileKey] = {
                    tileName: item.tileName,
                    size: item.size,
                    totalOrderedQuantity: 0,
                    totalBoxes: 0
                };
            }
            floorData[floorName][tileKey].totalOrderedQuantity += item.totalOrderedQuantity;
            floorData[floorName][tileKey].totalBoxes += item.totalBoxes;
        });
        for (const floor in floorData) {
            for (const tileKey in floorData[floor]) {
                const tile = floorData[floor][tileKey];
                rows.push([
                    serialNumber++,
                    floor,
                    tile.tileName,
                    tile.size,
                    tile.totalOrderedQuantity.toFixed(2),
                    tile.totalBoxes.toFixed(2),
                ]);
            }
        }
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 50,
            styles: {
                textColor: hexToRgb("#000000"),
                halign: 'left',
                cellPadding: 2,
                lineWidth: 0.2,
            },
            headStyles: {
                fillColor: hexToRgb("#F2F2F2"),
                lineWidth: 0.2,
            },
            bodyStyles: {
                fillColor: hexToRgb("#FFFFFF"),
                textColor: hexToRgb("#000000"),
                halign: 'left',
                lineWidth: 0.2,
            },
            alternateRowStyles: {
                fillColor: hexToRgb("#FFFFFF"),
            },
            columnStyles: {
                0: { cellWidth: 15 },
                1: { cellWidth: 45 },
                2: { cellWidth: 45 },
                3: { cellWidth: 30 },
                4: { cellWidth: 30 },
                5: { cellWidth: 25 },
            },
            didParseCell: (data) => {
                if (data.row.index === rows.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });
        doc.save(filename);
        return doc.output("blob");
    };
    const fullPDF = async () => {
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
        const formatDate = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };
        const fileType = 'EC';
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
        // Get the revision number from the backend
        const getRevisionNumber = async (clientName) => {
            try {
                const clientResponse = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/all`);
                if (!clientResponse.ok) {
                    throw new Error("Failed to fetch calculations from the backend");
                }
                const clientData = await clientResponse.json();
                const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === clientName);
                const revisionNumber = matchingClientCalculations.length > 0 ? `R ${Math.max(matchingClientCalculations.length - 1, 0)}` : 'R0';
                return revisionNumber;
            } catch (error) {
                console.error('Error fetching revision number:', error.message);
                return 'R 0';
            }
        };
        // Get the increment for the given file label
        const getIncrement = async (fileLabel) => {
            try {

                const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch increment from the backend");
                }
                const increment = await response.json();
                return increment;
            } catch (error) {
                console.error('Error fetching increment:', error.message);
                return 0; // Default to 0 if there's an error
            }
        };
        // Post increment data to the backend
        const postIncrement = async (fileLabel, fileType) => {
            try {
                await fetch('https://backendaab.in/aabuilderDash/api/tile/tile/updateIncrement', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fileLabel, fileType, clientId }),
                });
            } catch (error) {
                console.error('Error posting increment:', error.message);
            }
        };
        let filename;
        const incrementValue = await getIncrement(fileLabel, fileType);
        console.log(fileLabel);
        console.log(fileType);
        console.log(incrementValue);
        if (selectedFile && selectedFile.label) {
            filename = `TMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
        } else {
            const revisionNumber = await getRevisionNumber(siteName);
            filename = `TMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDate(currentDate)}.pdf`;
        }

        await postIncrement(fileLabel, fileType); // Post the data here
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Tile Measurement Sheet", doc.internal.pageSize.width / 2, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Site Name: ${siteName}`, 14, 40);
        doc.text(`Date: ${formatDate(date)}`, 14, 50);
        const customerHeaders = [
            ["S.No", "Area Name", "Type", "L  (ft)", "B  (ft)", "H  (ft)", "Deduction Area (sqft)", "Skirting Area (sqft)", "Wastage", "Quantity To Be Ordered (sqft)", "Tile Name", "Size", "Qty/Box", "No of Boxes"]
        ];
        const customerRows = [];
        let previousFloorName = null;
        let floorCounter = 0;
        let areaCounter = 1;
        floors.forEach((floor) => {
            const currentFloorName = floor.floorName || previousFloorName;
            if (currentFloorName !== previousFloorName) {
                floorCounter += 1;
                areaCounter = 1; // Reset areaCounter for each floor
                const floorLetter = String.fromCharCode(64 + floorCounter);
                customerRows.push([floorLetter, currentFloorName, "", "", "", "", "", "", "", "", "", "", "", ""]);
                previousFloorName = currentFloorName;
            }
            let areaNamePrinted = false;
            floor.tiles.forEach(tile => {
                const { length, breadth, height, wastagePercentage, deductionArea, type, qtyPerBox, tileName, size, Areainsqft } = tile;
                const lengthNum = Number(length);
                const breadthNum = Number(breadth);
                const heightNum = Number(height);
                const wastagePercentageNum = Number(wastagePercentage);
                const deductionAreaNum = Number(deductionArea || 0);
                let tileArea;
                let skirtingArea = 0;
                if (type === "Wall Tile") {
                    skirtingArea = 0;
                } else {
                    skirtingArea = (tile.skirtingArea !== undefined && tile.skirtingArea !== null)
                        ? Number(tile.skirtingArea)
                        : (tile.isUserChanged ? Number(tile.directValue) : ((lengthNum + breadthNum) * 0.33));
                }
                if (type === "Floor Tile") {
                    tileArea = lengthNum * breadthNum;
                } else if (type === "Wall Tile") {
                    tileArea = lengthNum * heightNum;
                }
                const finalArea = tileArea - deductionAreaNum;
                const actualQuantity = finalArea + skirtingArea;
                const wastage = (wastagePercentageNum / 100) * actualQuantity;
                const totalOrderedQuantity = actualQuantity + wastage;
                const areainsqft = Number(Areainsqft || 1);
                const noOfBoxes = (totalOrderedQuantity / (qtyPerBox * areainsqft)).toFixed(2);
                const areaNameCell = areaNamePrinted ? '' : floor.areaName;
                areaNamePrinted = true;
                customerRows.push([
                    areaCounter,
                    areaNameCell,
                    tile.type,
                    length,
                    breadth,
                    height,
                    deductionAreaNum,
                    skirtingArea.toFixed(2),
                    wastagePercentage + "%",
                    totalOrderedQuantity.toFixed(2),
                    tileName,
                    size,
                    qtyPerBox,
                    noOfBoxes
                ]);
                areaCounter += 1;
            });
        });
        doc.autoTable({
            head: customerHeaders,
            body: customerRows,
            startY: 60,
            theme: "grid",
            headStyles: {
                fillColor: hexToRgb("#F2F2F2"),
                textColor: hexToRgb("#000000"),
                fontSize: 9,
                lineWidth: 0.3,
            },
            bodyStyles: {
                fontSize: 9,
                halign: 'left',
                lineWidth: 0
            },
            columnStyles: {
                0: { cellWidth: 13 },
                1: { cellWidth: 25 },
                2: { cellWidth: 20 },
                3: { cellWidth: 14 },
                4: { cellWidth: 14 },
                5: { cellWidth: 14 },
                6: { cellWidth: 20 },
                7: { cellWidth: 17 },
                8: { cellWidth: 17 },
                9: { cellWidth: 23 },
                10: { cellWidth: 30 },
                11: { cellWidth: 20 },
                12: { cellWidth: 11 },
                13: { cellWidth: 18 },
            },
            margin: { top: 30 },
            pageBreak: 'auto',
            tableWidth: 'wrap',
            didDrawCell: (data) => {
                doc.setLineWidth(0.3);
                if (data.row.index === 0) {
                    doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                    const cellX = data.cell.x;
                    const cellY = data.cell.y;
                    doc.line(cellX, cellY, cellX, cellY);
                } else if (data.row.index > 0) {
                    const previousRow = data.table.body[data.row.index - 1];
                    const previousRowFirstColumnValue = previousRow.cells[0].raw;
                    const currentRowFirstColumnValue = data.row.cells[0].raw;
                    console.log(previousRowFirstColumnValue)
                    doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                    if (currentRowFirstColumnValue === null || currentRowFirstColumnValue === '') {
                        const previousRowY = previousRow.cells[0].y;
                        doc.line(data.cell.x, previousRowY, data.cell.x + data.cell.width, previousRowY);
                    }
                    const currentFloorName = currentRowFirstColumnValue;
                    const removeVerticalBorder = ["Ground Floor", "First Floor", "Second Floor"].includes(currentFloorName);
                    if (!removeVerticalBorder) {
                        doc.setLineWidth(0.5);
                        if (data.column.index > 0) {
                            doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + data.cell.height);
                            doc.line(data.cell.x + data.cell.width, data.cell.y, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                        }
                    }
                }
                if (data.row.index >= 0) {
                    if (data.column.index === 0) {
                        doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + data.cell.height);
                    }
                    if (data.column.index === 12) {
                        doc.line(data.cell.x + data.cell.width, data.cell.y, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                    }
                }
            }
        });
        doc.addPage();
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        const title = "Tile Order Copy";
        const titleWidth = doc.getTextWidth(title);
        const pageWidth = doc.internal.pageSize.getWidth();
        const titleX = (pageWidth - titleWidth) / 2;
        doc.text(title, titleX, 20);
        doc.setFontSize(12);
        doc.text(`Site Name: ${siteName}`, 14, 30);
        doc.text(`Date: ${formatDate(date)}`, 14, 40);
        const summaryHeaders = ["Tile Name", "Size", "Total Area (sqft)", "No of Boxes"];
        const summaryRows = summary.map((row, index) => [
            index + 1,
            row.tileName,
            row.size,
            row.totalOrderedQuantity.toFixed(2),
            row.totalBoxes.toFixed(2),
        ]);
        const totalArea = summary.reduce((acc, row) => acc + row.totalOrderedQuantity, 0).toFixed(2);
        const totalBoxes = summary.reduce((acc, row) => acc + row.totalBoxes, 0).toFixed(2);
        summaryRows.push([{ content: "Total", styles: { fontStyle: 'bold' } }, "", totalArea, totalBoxes]);
        doc.autoTable({
            head: [summaryHeaders],
            body: summaryRows,
            startY: 50,
            styles: {
                textColor: hexToRgb("#000000"),
                halign: 'left',
                cellPadding: 2,
                lineWidth: 0.2,
            },
            headStyles: {
                fillColor: hexToRgb("#F2F2F2"),
                lineWidth: 0.2,
            },
            bodyStyles: {
                fillColor: hexToRgb("#FFFFFF"),
                textColor: hexToRgb("#000000"),
                halign: 'left',
                lineWidth: 0.2,
            },
            alternateRowStyles: {
                fillColor: hexToRgb("#FFFFFF"),
            },
            columnStyles: {
                0: { cellWidth: 14 },
                1: { cellWidth: 50 },
                2: { cellWidth: 30 },
                3: { cellWidth: 30 },
                4: { cellWidth: 25 },
            },
            didParseCell: (data) => {
                if (data.row.index === summaryRows.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });
        doc.save(filename);
        return doc.output("blob");
    };
    return (
        <body className="">
            <div className=" mx-auto p-6 border-collapse bg-[#FFFFFF] ml-6 mr-6">
                <div className=" flex">
                    <div className=" flex">
                        <div className="w-full -mt-8 mb-4">
                            <h4 className=" mt-10 font-bold mb-2">Site Name </h4>
                            <Select
                                value={clientName}
                                onChange={handleSiteChange}
                                options={siteOptions}
                                placeholder="Select Site Name..."
                                className="border border-[#FAF0ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg w-80"
                                styles={customSelectStyles}
                                isClearable
                            />
                        </div>
                        <input
                            type="text"
                            value={clientSNo}
                            readOnly
                            className="border border-[#FAF0ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg h-10 w-16 mt-11 ml-1 bg-transparent text-center"
                        />
                    </div>

                    <div className=" ml-6 mt-1">
                        <h4 className=" font-bold mb-2">Date </h4>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border border-[#FAF0ED] border-r-4 border-l-4 border-b-4 border-t-4 w-44 rounded-lg px-4 py-2 "
                        />
                    </div>

                    <div className=" ml-6">
                        <h4 className=" mt-1.5 font-bold mb-2"> Variant</h4>
                        <Select
                            placeholder="Select the file..."
                            className="border border-[#FAF0ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg w-52"
                            styles={customSelectStyles}
                            options={filteredFileOptions}
                            isClearable
                            onChange={handleFileChange}
                            value={selectedFile}
                            isDisabled={!clientName}
                        />
                    </div>
                </div>
                <div className="flex ml-[90%] -mt-12">
                    <h4 className="font-normal text-lg mt-1">Wastage :</h4>
                    <select
                        name="wastagePercentageDropdown"
                        value={wastagePercentage}
                        onChange={handleCommonWastageChange}
                        className="ml-2 bg-transparent h-10 border border-[#FAF0ED] border-r-4 border-l-4 border-b-4 border-t-4 rounded-lg focus:outline-none">
                        {Array.from({ length: 16 }, (_, index) => (
                            <option key={index} value={index}>
                                {index}%
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className=" p-6 bg-[#FFFFFF] mt-6 ml-6 mr-6">
                <div className="rounded-lg border-l-8 border-l-[#BF9853] flex mt-5" id="full-table">
                    <table className="table-auto w-full">
                        <thead>
                            <tr className="bg-[#FAF6ED]">
                                <th className="w-40 border-l-2" rowSpan="2">Discription</th>
                                <th className="w-36 border-l-2" rowSpan="2">Type</th>
                                <th className="w-32 border-l-2" colSpan="3">Measurement</th>
                                <th className="w-14 border-l-2" rowSpan="2">Deduction Area (sqft)</th>
                                <th className="w-12 border-l-2" rowSpan="2">Skirting Area (sqft)</th>
                                <th className="w-12 border-l-2" rowSpan="2">Wastage (sqft)</th>
                                <th className="w-16 border-l-2" rowSpan="2">Order Qty (sqft)</th>
                                <th className="w-60 border-l-2" rowSpan="2">Tile Name</th>
                                <th className="w-40 border-l-2" rowSpan="2">Size</th>
                                <th className="w-20 border-l-2" rowSpan="2">Qty/Box</th>
                                <th className="w-20 border-l-2" rowSpan="2">No.Box</th>
                            </tr>
                            <tr className="bg-[#FAF6ED]">
                                <th className="w-6 text-[#E4572E] border">L</th>
                                <th className="w-6 text-[#E4572E] border">B</th>
                                <th className="w-6 text-[#E4572E] border">H</th>
                            </tr>
                        </thead>

                        <tbody>
                            {floors.map((floor, floorIndex) => (
                                <React.Fragment key={floorIndex}>
                                    {/* Separate row for Floor Name */}
                                    <tr className="bg-white">
                                        <td colSpan="13" className="font-bold text-left ">
                                            {floor.floorName !== null && (
                                                <div>
                                                    <span className="mt-1">{displayIndex++}.</span>
                                                    <span>{selectedClientData.floorName}</span>
                                                    <select
                                                        value={floor.floorName}
                                                        onChange={(e) => {
                                                            const updatedFloors = [...floors];
                                                            updatedFloors[floorIndex].floorName = e.target.value;
                                                            setFloors(updatedFloors);
                                                        }}
                                                        className="w-52 p-1 rounded-lg bg-transparent">
                                                        {floorOptions.map((floorOption, idx) => (
                                                            <option key={idx} value={floorOption}>
                                                                {floorOption}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                    {floor.tiles.map((tile, tileIndex) => (
                                        <tr key={`${floorIndex}-${tileIndex}`} className="odd:bg-white even:bg-orange-50">
                                            <td className="px-2 flex border-l-2">
                                                {tileIndex === 0 ? (
                                                    <Select
                                                        name="areaName"
                                                        options={areaOptions.map(option => ({ value: option, label: option }))}
                                                        value={floor.areaName ? { value: floor.areaName, label: floor.areaName } : null}
                                                        onChange={(selectedOption) => {
                                                            const updatedFloors = [...floors];
                                                            updatedFloors[floorIndex].areaName = selectedOption ? selectedOption.value : "";
                                                            setFloors(updatedFloors);
                                                        }}
                                                        className="w-52 h-10 mb-2"
                                                        placeholder="Select Area"
                                                        isClearable
                                                        styles={{
                                                            control: (base) => ({
                                                                ...base,
                                                                backgroundColor: 'transparent',
                                                                border: 'none',
                                                                boxShadow: 'none',
                                                            }),
                                                            dropdownIndicator: (base) => ({
                                                                ...base,
                                                                color: '#000',
                                                            }),
                                                            indicatorSeparator: () => ({
                                                                display: 'none',
                                                            }),
                                                            placeholder: (base) => ({
                                                                ...base,
                                                                color: '#888',
                                                            }),
                                                            singleValue: (base) => ({
                                                                ...base,
                                                                color: '#000',
                                                            }),
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-52"></div>
                                                )}
                                                {tileIndex === 0 && (
                                                    <div key={floorIndex} className="mb-4 items-center flex">
                                                        <button onClick={() => addAreaRow(floorIndex)}>
                                                            <img src={add} alt="add" className="w-4 h-4 ml-1 mt-2" />
                                                        </button>
                                                        <button onClick={() => deleteAreaRow(floorIndex)} className="ml-2">
                                                            <img src={deleteIcon} alt="delete" className="w-4 h-4 mt-2" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-2 w-48 border-l-2">
                                                <div className="flex">
                                                    <select
                                                        name="type"
                                                        value={tile.type}
                                                        onChange={(e) => handleTileChange(floorIndex, tileIndex, e)}
                                                        className="rounded-lg bg-transparent">
                                                        <option value="Floor Tile">Floor Tile</option>
                                                        <option value="Wall Tile">Wall Tile</option>
                                                    </select>
                                                    <button type="button" onClick={() => addTile(floorIndex, tileIndex)}>
                                                        <img src={add} alt="add" className="w-5 h-5 ml-3 p-1" />
                                                    </button>
                                                    <button onClick={() => deleteTileRow(floorIndex, tileIndex)} className="ml-8">
                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-1 border-l-2">
                                                <input
                                                    type="text"
                                                    name="length"
                                                    placeholder="L"
                                                    value={tile.length}
                                                    onChange={(e) => handleTileChange(floorIndex, tileIndex, e)}
                                                    className="px-2 w-14 bg-transparent  hover:border focus:outline-none" />
                                            </td>
                                            <td className="px-1 border-l-2">
                                                <input
                                                    type="text"
                                                    name="breadth"
                                                    placeholder="B"
                                                    value={tile.breadth}
                                                    onChange={(e) => handleTileChange(floorIndex, tileIndex, e)}
                                                    className="px-2 w-14 bg-transparent hover:border focus:outline-none" />
                                            </td>
                                            <td className="px-1 border-l-2">
                                                <input
                                                    type="text"
                                                    name="height"
                                                    placeholder="H"
                                                    value={tile.height}
                                                    onChange={(e) => handleTileChange(floorIndex, tileIndex, e)}
                                                    className="px-2 w-14 bg-transparent hover:border focus:outline-none" />
                                            </td>
                                            <td className="px-2 border-l-2">
                                                <input
                                                    type="text"
                                                    name="deductionArea"
                                                    value={tile.deductionArea}
                                                    onChange={(e) => handleTileChange(floorIndex, tileIndex, e)}
                                                    placeholder="Deduction"
                                                    className="px-2 rounded-lg w-20 bg-transparent" />
                                            </td>
                                            <td className="px-2 border-l-2">
                                                <div className="flex items-center">
                                                    <input
                                                        type="text"
                                                        name="directValue"
                                                        value={
                                                            tile.type === "Floor Tile"
                                                                ? (tile.isUserChanged // If user has changed the value
                                                                    ? tile.directValue // Use the value directly set by the user
                                                                    : ((Number(tile.length) + Number(tile.breadth)) * 0.33).toFixed(2) // Auto-calculate if not manually changed
                                                                )
                                                                : "0"
                                                        }
                                                        onChange={(e) => handleDirectValueChange(floorIndex, tileIndex, e)}
                                                        className="px-2 rounded-lg w-20 bg-transparent"
                                                    />
                                                    {tile.isUserChanged && (
                                                        <button
                                                            onClick={() => resetToCalculatedValue(floorIndex, tileIndex)}
                                                        >
                                                            <img src={refresh} alt="refresh" className=" h-5 w-5"></img>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 border-l-2">
                                                <select
                                                    name="wastagePercentage"
                                                    value={tile.wastagePercentage}
                                                    onChange={(e) => handleTileChange(floorIndex, tileIndex, e)}
                                                    className=" rounded-lg w-16">
                                                    {Array.from({ length: 16 }, (_, index) => (
                                                        <option key={index} value={index}>
                                                            {index}%
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-2 border-l-2">
                                                <div className=" w-16">
                                                    {tile.length && (tile.breadth || tile.height) ? (
                                                        (() => {
                                                            const length = Number(tile.length);
                                                            const breadth = Number(tile.breadth);
                                                            const height = Number(tile.height);
                                                            const wastagePercentage = Number(tile.wastagePercentage);
                                                            const deductionArea = Number(tile.deductionArea || 0);
                                                            let tileArea;
                                                            let skirtingArea;
                                                            if (tile.type === "Wall Tile") {
                                                                skirtingArea = 0;
                                                            } else {
                                                                skirtingArea = (tile.skirtingArea !== undefined && tile.skirtingArea !== null)
                                                                    ? Number(tile.skirtingArea)
                                                                    : (tile.isUserChanged ? Number(tile.directValue) : ((length + breadth) * 0.33));
                                                            }
                                                            if (tile.type === "Floor Tile") {
                                                                tileArea = length * breadth;
                                                            } else if (tile.type === "Wall Tile") {
                                                                tileArea = length * height;
                                                            }
                                                            const finalArea = tileArea - deductionArea;
                                                            const actualQuantity = finalArea + skirtingArea;
                                                            const wastage = (wastagePercentage / 100) * actualQuantity;
                                                            const totalOrderedTile = actualQuantity + wastage;
                                                            return totalOrderedTile.toFixed(2);
                                                        })()
                                                    ) : (
                                                        "0"
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 border-l-2">
                                                <Select
                                                    options={tileOptions}
                                                    value={tileOptions.find((option) => option.value === tile.tileName)}
                                                    onChange={(selectedOption) => {
                                                        const newTileName = selectedOption?.value || '';
                                                        handleTileChange(floorIndex, tileIndex, {
                                                            target: {
                                                                name: "tileName",
                                                                value: newTileName
                                                            }
                                                        });
                                                        if (!newTileName) {
                                                            handleTileChange(floorIndex, tileIndex, {
                                                                target: {
                                                                    name: "size",
                                                                    value: ''
                                                                }
                                                            });
                                                            handleTileChange(floorIndex, tileIndex, {
                                                                target: {
                                                                    name: "qtyPerBox",
                                                                    value: ''
                                                                }
                                                            });
                                                            handleTileChange(floorIndex, tileIndex, {
                                                                target: {
                                                                    name: "Areainsqft",
                                                                    value: ''
                                                                }
                                                            });
                                                        } else {
                                                            const selectedTile = tileOptions.find(tile => tile.value === newTileName);
                                                            if (selectedTile) {
                                                                handleTileChange(floorIndex, tileIndex, {
                                                                    target: {
                                                                        name: "size",
                                                                        value: selectedTile.size
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    }}
                                                    placeholder="Select Tile"
                                                    menuPortalTarget={document.body}
                                                    className=" w-64"
                                                    menuPosition="fixed"
                                                    styles={{
                                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                        control: (base) => ({
                                                            ...base,
                                                            backgroundColor: 'transparent', // Remove background color
                                                            border: 'none', // Remove border
                                                            boxShadow: 'none', // Remove any shadow effect
                                                        }),
                                                        dropdownIndicator: (base) => ({
                                                            ...base,
                                                            color: '#000', // Customize dropdown arrow color if needed
                                                        }),
                                                        indicatorSeparator: () => ({
                                                            display: 'none', // This removes the vertical line
                                                        }),
                                                        placeholder: (base) => ({
                                                            ...base,
                                                            color: '#888', // Customize placeholder color if needed
                                                        }),
                                                        singleValue: (base) => ({
                                                            ...base,
                                                            color: '#000', // Customize the selected option text color
                                                        }),
                                                    }}
                                                    isClearable
                                                />
                                            </td>
                                            <td className="px-2 border-l-2">
                                                <div className="flex">
                                                    <select
                                                        value={tile.size}
                                                        onChange={(e) => {
                                                            const newSize = e.target.value;
                                                            handleSizeChange(floorIndex, tileIndex, newSize);
                                                        }}
                                                        className="rounded px-1"
                                                    >
                                                        <option value="">Select Size</option>
                                                        {sizeOptions.map((sizeOption) => (
                                                            <option key={sizeOption.value} value={sizeOption.value}>
                                                                {sizeOption.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {tile.defaultSize && tile.size !== tile.defaultSize && (
                                                        <span className="ml-2 text-red-500 ">
                                                            <img src={change} alt="change indicator" className="w-5 h-5 mt-1" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className=" px-2 border-l-2">
                                                <div className="flex">
                                                    <input
                                                        type="text"
                                                        value={tile.qtyPerBox}
                                                        onChange={(e) => handleTileChange(floorIndex, tileIndex, { target: { name: "qtyPerBox", value: e.target.value } })}
                                                        className="rounded px-1 w-12 " />
                                                    {tile.defaultQtyPerBox && tile.qtyPerBox !== tile.defaultQtyPerBox && (
                                                        <span className="ml-2 text-red-500 ">
                                                            <img src={change} alt="ch" className="w-5 h-5 mt-1" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 w-16 border-l-2">
                                                <div className="">
                                                    {tile.length && (tile.breadth || tile.height) ? (
                                                        (() => {
                                                            const length = Number(tile.length);
                                                            const breadth = Number(tile.breadth);
                                                            const height = Number(tile.height);
                                                            const wastagePercentage = Number(tile.wastagePercentage);
                                                            const deductionArea = Number(tile.deductionArea || 0);
                                                            let tileArea;
                                                            let skirtingArea;
                                                            if (tile.type === "Wall Tile") {
                                                                skirtingArea = 0;
                                                            } else {
                                                                skirtingArea = (tile.skirtingArea !== undefined && tile.skirtingArea !== null)
                                                                    ? Number(tile.skirtingArea)
                                                                    : (tile.isUserChanged ? Number(tile.directValue) : ((length + breadth) * 0.33));
                                                            }
                                                            if (tile.type === "Floor Tile") {
                                                                tileArea = length * breadth;
                                                            } else if (tile.type === "Wall Tile") {
                                                                tileArea = length * height;
                                                            }
                                                            const finalArea = tileArea - deductionArea;
                                                            const actualQuantity = finalArea + skirtingArea;
                                                            const wastage = (wastagePercentage / 100) * actualQuantity;
                                                            const totalOrderedTile = actualQuantity + wastage;
                                                            const qtyPerBox = Number(tile.qtyPerBox || 1);
                                                            const Areainsqft = Number(tile.Areainsqft || 1);
                                                            const finalResult = totalOrderedTile / (qtyPerBox * Areainsqft);
                                                            return finalResult.toFixed(2);
                                                        })()
                                                    ) : (
                                                        "0"
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div>
                    <button type="button" className="text-[#E4572E] mt-6 mb-20 mr-4 border-dashed border-b-2 border-[#BF9853] font-semibold"
                        onClick={addFloorRow}>
                        + Add Floor
                    </button>
                </div>
                <div className=" buttons ml-[57%] -mt-20 flex">
                    <div className="">
                        <button onClick={customerCopyPDF} className=" text-white px-8 py-2 rounded bg-green-800 hover:text-white transition duration-200 ease-in-out">
                            Customer Copy
                        </button>
                    </div>

                    <div>
                        <button onClick={summaryPDF} className=" text-white px-8 py-2 rounded ml-2 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out">
                            Order Copy
                        </button>
                    </div>
                    <div className="">
                        <button onClick={fullPDF} className=" text-white px-8 py-2 rounded ml-2 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out">
                            Engineer Copy
                        </button>
                    </div>
                    <div className="">
                        <button onClick={handleGeneratePDF} className=" text-white px-8 py-2 rounded ml-2 bg-green-800 hover:text-white transition duration-200 ease-in-out">
                            Stocking Chart
                        </button>
                    </div>
                </div>
                <div className="-mt-3 flex">
                    <div>
                        <div>
                            <h1 className="font-bold text-2xl mt-8">Tile Order Copy :</h1>
                        </div>
                        <div>
                            <table className="table-auto mt-2">
                                <thead>
                                    <tr className="bg-orange-50">
                                        <th className="border p-2">Tile Name</th>
                                        <th className="border p-2">Size</th>
                                        <th className="border p-2 w-40">Total Area (sqft)</th>
                                        <th className="border p-2 w-36">No of Boxes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.map((row, index) => (
                                        <tr key={index} className="">
                                            <td className="border p-2">{row.tileName}</td>
                                            <td className="border p-2">{row.size}</td>
                                            <td className="border p-2 w-20">{row.totalOrderedQuantity.toFixed(2)}</td>
                                            <td className="border p-2 w-20">{row.totalBoxes.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-orange-100 font-bold">
                                        <td className="border p-2 font-bold" colSpan="2">Total</td>
                                        <td className="border p-2 font-bold">{totalArea.toFixed(2)}</td>
                                        <td className="border p-2 font-bold">{totalBoxes.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className=" ml-10">
                        <div >
                            <h1 className="font-bold text-2xl mt-8 ml-2">Tile Stocking Chart :</h1>
                        </div>
                        <div>
                            <table id="summaryTable" className="table-auto mt-2 ml-2">
                                <thead>
                                    <tr className="bg-orange-50">
                                        <th className="border p-2">Floor Name</th>
                                        <th className="border p-2">Tile Name</th>
                                        <th className="border p-2">Tile Size</th>
                                        <th className="border p-2">Total Area (sqft)</th>
                                        <th className="border p-2">No of Boxes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary1.map((item, index) => (
                                        <tr key={index}>
                                            <td className="border p-2">{item.floorName}</td>
                                            <td className="border p-2">{item.tileName}</td>
                                            <td className="border p-2">{item.tileSize}</td>
                                            <td className="border p-2">{parseFloat(item.totalOrderedQuantity || 0).toFixed(2)}</td>
                                            <td className="border p-2">{parseFloat(item.totalBoxes || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-orange-100 font-bold">
                                        <td className="border p-2 font-bold" colSpan="3">Total</td>
                                        <td className="border p-2 font-bold">{totalArea.toFixed(2)}</td>
                                        <td className="border p-2 font-bold">{totalBoxes.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="flex">
                    {!isSubmitting && (
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="btn bg-[#BF9853] text-white px-8 py-2.5 rounded-md hover:bg-yellow-800 font-semibold mt-5"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    )}
                </div>
            </div>
        </body>
    );
};
export default DesignTool;