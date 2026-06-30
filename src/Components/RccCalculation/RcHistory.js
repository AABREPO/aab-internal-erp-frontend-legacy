import React, { useState, useEffect } from "react";
import Select from "react-select";
import jsPDF from 'jspdf';
import "jspdf-autotable";
import Edit from '../Images/Edit.svg'
import dele from '../Images/Delete.svg'
const RcHistory = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullData, setFullData] = useState([]);
    const [tileFloorTypes, setTileFloorTypes] = useState([]);
    const [tileList, setTileList] = useState([]);
    const [tileOptions, setTileOptions] = useState([]);
    const [message, setMessage] = useState('');
    console.log(message);
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
    const [eno, setEno] = useState(null);
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
    const fetchLatestEno = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/tile/all');
            if (!response.ok) {
                throw new Error('Failed to fetch ENo');
            }
            const data = await response.json();
            if (data.length > 0) {
                const lastEno = Math.max(...data.map(item => item.eno));
                setEno(lastEno + 1);
            } else {
                setEno(100);
            }
        } catch (error) {
            console.error('Error fetching latest ENo:', error);
        }
    };
    useEffect(() => {
        fetchLatestEno();
    }, []);
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
        fetchTileFloorTypes();
    }, []);

    // Function to fetch tile floor types
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
    useEffect(() => {
        fetchCalculations();
    }, []);
    const [floorOptions, setFloorOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/areaName');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const areas = data.map(item => item.areaName);
                setAreaOptions([...new Set(areas)]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);
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
            const qtyPerBox = Number(tile.quantityBox || 1);
            const Areainsqft = Number(tile.areaTile || 1);
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
                    const qtyPerBoxNum = Number(tile.quantityBox) || 1;
                    const AreainsqftNum = Number(tile.areaTile) || 1;
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
            const fileName = `${formatDate(date)} - R ${clientCount}`;
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
                ENo: eno,
                calculations: normalizedCalculations.map((floor, floorIndex) => ({
                    floorName: floor.floorName,
                    areaName: floor.areaName,
                    tiles: floor.tiles.map((tile, tileIndex) => ({
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
            console.log('E.No:', eno);
            const summaryData = createSummaryData();
            const StockingPdf = await generateFloorSummaryPDF(summaryData);
            const fullPdf = await generateFullPDF();
            const customerCopyPdf = await generateCustomerCopyPDF();
            const summaryPdf = await generateSummaryPDF();
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
            };

            await uploadPdf(fullPdf, `TMS EC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
            await uploadPdf(customerCopyPdf, `TMS CC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
            await uploadPdf(summaryPdf, `TMS OC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
            await uploadPdf(StockingPdf, `TMS SC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
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
            setEno(eno + 1);
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
            setIsSubmitting(false);
        }
    };
    const handleTileChange = (floorIndex, tileIndex, event) => {
        const { name, value } = event.target;
        const updatedFloors = [...floors];

        if (name === "tileName") {
            const selectedTile = tileOptions.find(tile => tile.value === value);
            if (selectedTile) {
                // Update the selected tile size
                updatedFloors[floorIndex].tiles[tileIndex].tileSize = selectedTile.tileSize;

                // Find the corresponding size option in the tileList
                const selectedSizeOption = tileList.find(tile => tile.tileSize === selectedTile.tileSize); // Adjust this as needed

                if (selectedSizeOption) {
                    updatedFloors[floorIndex].tiles[tileIndex].quantityBox = selectedSizeOption.quantityBox; // Ensure quantityBox exists
                    updatedFloors[floorIndex].tiles[tileIndex].areaTile = selectedSizeOption.areaTile; // Ensure areaTile exists
                }
            } else {
                // Reset values if no tile is selected
                updatedFloors[floorIndex].tiles[tileIndex].tileSize = '';
                updatedFloors[floorIndex].tiles[tileIndex].quantityBox = '';
                updatedFloors[floorIndex].tiles[tileIndex].areaTile = '';
            }
        }

        // Update other properties based on the input event
        updatedFloors[floorIndex].tiles[tileIndex][name] = value; // For other inputs
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
    const [rows, setRows] = useState([
        { tileName: "", size: "", qtyPerBox: "", numberOfBoxes: "" },
    ]);


    useEffect(() => {
        const fetchTiles = async () => {
            try {
                const response = await fetch('https://backendaab.in/aabuilderDash/api/tiles/all/data');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                // Map fetched data to the required structure
                const options = data.map(tile => ({
                    value: tile.label || tile.tileName,  // Adjust these field names based on your API response
                    label: tile.label || tile.tileName,
                    tileSize: tile.tileSize || 'default size' // Adjust to your needs
                }));

                setTileOptions(options);
            } catch (error) {
                console.error('Failed to fetch tiles:', error);
            }
        };

        fetchTiles();
    }, []);
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
                const qtyPerBox = Number(tile.quantityBox || 1);
                const Areainsqft = Number(tile.areaTile || 1);
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

        // Update directValue and mark as manually changed
        tile.directValue = Number(event.target.value) || 0; // Allow 0 if input is empty
        tile.isUserChanged = true; // Mark as manually changed

        // Recalculate skirting area based on the updated directValue
        tile.skirtingArea = tile.directValue;

        setFloors(updatedFloors); // Update the state with recalculated values
    };

    const resetToCalculatedValue = (floorIndex, tileIndex) => {
        const updatedFloors = [...floors];
        const tile = updatedFloors[floorIndex].tiles[tileIndex];

        // Calculate the new skirtingArea based on current tile values
        const length = Number(tile.length);
        const breadth = Number(tile.breadth);
        let calculatedSkirtingArea;

        if (tile.type === "Wall Tile") {
            calculatedSkirtingArea = 0;
        } else {
            calculatedSkirtingArea = (tile.isUserChanged ? Number(tile.directValue) : ((length + breadth) * 0.33));
        }

        // Reset the values
        tile.directValue = calculatedSkirtingArea; // Reset to calculated skirting area
        tile.isUserChanged = false; // Mark as not manually changed
        tile.skirtingArea = calculatedSkirtingArea; // Update skirting area in the tile

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
            row.totalOrderedQuantity.toFixed(3),
            row.totalBoxes.toFixed(3),
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
                    const qtyPerBox = Number(tile.quantityBox) || 1;
                    const Areainsqft = Number(tile.areaTile || 1);
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
            SNo: "",
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
                const { length, breadth, height, wastagePercentage, deductionArea, type, quantityBox, tileName, size, areaTile } = tile;
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
                const areainsqft = Number(areaTile || 1);
                const noOfBoxes = (totalOrderedQuantity / (quantityBox * areainsqft)).toFixed(2);
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
                    quantityBox,
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
        const updatedFloors = [...floors];
        updatedFloors[floorIndex].tiles[tileIndex].size = newSize;
        const selectedSizeOption = tileList.find(size => size.tileSize === newSize);
        if (selectedSizeOption) {
            updatedFloors[floorIndex].tiles[tileIndex].quantityBox = selectedSizeOption.quantityBox;
            updatedFloors[floorIndex].tiles[tileIndex].areaTile = selectedSizeOption.areaTile;
        } else {
            updatedFloors[floorIndex].tiles[tileIndex].quantityBox = '';
            updatedFloors[floorIndex].tiles[tileIndex].areaTile = '';
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
                            size: tile.tileSize,
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
                            areaTile: tile.areaInSqft,
                            quantityBox: tile.qtyPerBox,
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
                const { length, breadth, height, wastagePercentage, deductionArea, type, quantityBox, tileName, size, areaTile } = tile;
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
                const areainsqft = Number(areaTile || 1);
                const noOfBoxes = (totalOrderedQuantity / (quantityBox * areainsqft)).toFixed(2);
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
                    quantityBox,
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
                0: { cellWidth: 12 },
                1: { cellWidth: 14 },
                2: { cellWidth: 50 },
                3: { cellWidth: 30 },
                4: { cellWidth: 30 },
                5: { cellWidth: 25 },
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
    let displayIndex = 1;
    const data = [
        {
            slNo: 4,
            date: "24/04/2024",
            siteName: "Ramar Krishnankovil",
            eNo: 40,
            revision: "124/04/2024_R1",
            noOfLitre: 9,
            Amount: "7,500",
        },
        {
            slNo: 3,
            date: "13/04/2024",
            siteName: "Ramar Krishnankovil",
            eNo: 34,
            revision: "13/04/2024_R1",
            noOfLitre: 10,
            Amount: "8,000",
        },
        {
            slNo: 2,
            date: "13/04/2024",
            siteName: "Ramar Krishnankovil",
            eNo: 30,
            revision: "12/04/2024_R1",
            noOfLitre: 12,
            Amount: "12,500",
        },
        
    ];
    return (
        <div>
            <div className=" mx-auto p-6 border-collapse bg-[#FFFFFF] ml-6 mr-6 rounded-md">
                <div className=" flex">
                    <div className=" flex">
                        <div className="w-full -mt-8 mb-4">
                            <h4 className=" mt-10 font-bold mb-2 -ml-60">Site Name </h4>
                            <Select
                                value={clientName}
                                onChange={handleSiteChange}
                                options={siteOptions}
                                placeholder="Select Site Name..."
                                className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg w-80 h-12 text-left"
                                styles={customSelectStyles}
                                isClearable />
                        </div>
                        
                    </div>
                    <div className=" ml-6 mt-1">
                        <h4 className=" font-bold mb-2 -ml-32">Date </h4>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] w-44 rounded-lg px-4 py-2 "
                        />
                    </div>
                    <div>
                        <h4 className=" mt-1.5 font-bold -ml-20 "> E No</h4>
                        <select
                            className=" rounded-lg w-36 h-12 mt-2 ml-2 pl-4 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem]"
                            readOnly
                        />
                    </div>
                    <div className=" ml-6">
                        <h4 className=" mt-1.5 font-bold mb-2 -ml-32"> Revision</h4>
                        <Select
                            placeholder="Select the file..."
                            className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg w-52 h-12"
                            styles={customSelectStyles}
                            options={filteredFileOptions}
                            isClearable
                            onChange={handleFileChange}
                            value={selectedFile}
                            isDisabled={!clientName}

                        />
                    </div>
                </div>
            </div>
            <div className="bg-white mx-auto mt-4 pt-7 pr-7 ml-6 " style={{ maxWidth: '1870px' }}>
                <div
                    className="ml-5 text-left rounded-l-lg"
                    style={{ width: '100%', borderLeft: '8px solid #BF9853', backgroundColor: '#FAF6ED' }}
                >
                    <table className="w-full rounded-lg">
                        <thead className="bg-[#FAF6ED]">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold">Sl.No</th>
                                <th className="px-4 py-2 text-left font-semibold">Date</th>
                                <th className="px-4 py-2 text-left font-semibold">Site Name</th>
                                <th className="px-4 py-2 text-left font-semibold">E. No</th>
                                <th className="px-4 py-2 text-left font-semibold">BFM Revision</th>
                                <th className="px-4 py-2 text-left font-semibold">Total Items</th>
                                <th className="px-4 py-2 text-left font-semibold">Amount</th>
                                <th className="px-4 py-2 text-left font-semibold">File</th>
                                <th className="px-4 py-2 text-left font-semibold">Print</th>
                                <th className="px-4 py-2 text-left font-semibold">Activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr
                                    key={index}
                                    className={index % 2 === 0 ? "odd:bg-white" : "even:bg-[#FAF6ED]"}
                                >
                                    <td className="px-4 py-2 text-left font-semibold">{item.slNo}</td>
                                    <td className="px-4 py-2 text-left font-semibold">{item.date}</td>
                                    <td className="px-4 py-2 text-left font-semibold">{item.siteName}</td>
                                    <td className="px-4 py-2 text-left font-semibold">{item.eNo}</td>
                                    <td className="px-4 py-2 text-left font-semibold">{item.revision}</td>
                                    <td className="px-4 py-2 text-left font-semibold">{item.noOfLitre}</td>
                                    <td className="px-4 py-2 text-left font-semibold">{item.Amount}</td>
                                    <td className="px-4 py-2 text-left font-semibold text-red-500 underline">
                                        <a href="#">View</a>
                                    </td>
                                    <td className="px-4 py-2 text-left cursor-pointer">🖨️</td>
                                    <td className="px-4 py-2 text-left flex cursor-pointer"><img src={Edit}></img> <img src={dele}></img></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>


    )
}

export default RcHistory
