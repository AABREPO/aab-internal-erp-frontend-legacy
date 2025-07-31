import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import deleteIcon from '../Images/Worng.svg';
import add from '../Images/Right.svg';
import print from '../Images/refresh.png'
import cross from '../Images/cross.png';
import jsPDF from 'jspdf';
import "jspdf-autotable";
import loadingScreen from '../Images/AAlogoBlackSVG.svg';
const DesignTool = () => {
    const [interiorFloors, setInteriorFloors] = useState([
        {
            floorName: "Ground Floor",
            areaName: "",
            tiles: [
                { length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0", putty: "No", primer: "No", ceilingCoat: "No", waterproof: "No", paintVariant: "", colorCode: "", orderQty: "" },
            ],
        },
    ]);
    const [exteriorFloors, setExteriorFloors] = useState([
        {
            floorName: "Ground Floor",
            areaName: "",
            tiles: [
                { length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0", putty: "No", primer: "No", ceilingCoat: "No", waterproof: "No", paintVariant: "", colorCode: "", orderQty: "" },
            ],
        },
    ]);
    const [otherFloors, setOtherFloors] = useState([
        {
            floorName: "Ground Floor",
            areaName: "",
            tiles: [
                {paintType: "", height: 0, deduction: 0, area: 0, wastage: 0, productVariant: "", colorCode: "", orderQty: 0 },
            ],
        },
    ]);
    const [tableData, setTableData] = useState([
        { floorName: "", totalOrderedTile: 0, paintVariant: "", paintColor: "", wastagePercentage: 0, orderQty: 0 },
    ]);
    const [puttyTableData, setPuttyTableData] = useState([
        { deduction: '', height: '', paintType: '', totalOrderedTile: 0, wastage: 0, productVariant: '', colorCode: '', orderQty: 0 },
    ])
    const [interiorTableDimensions, setInteriorTableDimensions] = useState({ length: 0, breadth: 0 });
    const [rateLabel, setRateLabel] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [selectedPaintNames, setSelectedPaintNames] = useState([]);
    const [selectedPaintColors, setSelectedPaintColors] = useState([]);
    const [wastageValues, setWastageValues] = useState([]);
    const [selectedModule, setSelectedModule] = useState("");
    const [summaryDatas, setSummaryData] = useState([]);
    const [summaryDatass, setSummaryDatas] = useState([]);
    const [paintData, setPaintData] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isCeilingCoatPopup, setIsCeilingCoatPopup] = useState(false);
    const [isImportPopup, setIsImportPopup] = useState(false);
    const closeImportPopup = () => setIsImportPopup(false);
    const openImportPopup = () => setIsImportPopup(true);
    const closeCeilingCoatPopup = () => setIsCeilingCoatPopup(false);
    const openCeilingCoatPopup = () => setIsCeilingCoatPopup(true);
    const [paints, setPaints] = useState([]);
    const [paintVariants, setPaintVariants] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullData, setFullData] = useState([]);
    const [fullDatas, setFullDatas] = useState([]);
    const [filteredFileOptions, setFilteredFileOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [eno, setEno] = useState(null);
    const [floors, setFloors] = useState([
        {
            floorName: "Ground Floor",
            areaName: "",
            tiles: [
                { length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" },
            ],
        },
    ]);
    const [filteredFormula, setFilteredFormula] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [clientName, setClientName] = useState(null);
    const [clientSNo, setClientSNo] = useState("");
    const [selectedClientData, setSelectedClientData] = useState({});
    const [selectedClientDatas, setSelectedClientDatas] = useState({});
    const [calculationData, setCalculationData] = useState(null);
    const currentDate = new Date().toLocaleDateString();
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [fileOptions, setFileOptions] = useState([]);
    const [fileOption, setFileOption] = useState([]);
    const [commonHeight, setCommonHeight] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selection, setSelection] = useState('');
    const [isModalOpenOC, setIsModalOpenOC] = useState(false);
    const [ocSelection, setOCSelection] = useState('');
    const [isModalOpenSC, setIsModalOpenSC] = useState(false);
    const [scSelection, setSCSelection] = useState('');
    const [isModalOpenEC, setIsModalOpenEC] = useState(false);
    const [ecSelection, setECSelection] = useState('');
    const [ceilingCoatData, setCeilingCoatData] = useState('');
    const [paintTypeOptions, setPaintTypeOptions] = useState([]);
    const [otherHeight, setOtherHeight] = useState();
    const [lengths, setLength] = useState([]);
    const [breaths, setBreath] = useState([]);
    const [floorNames, setFloorName] = useState([]);
    const [paintTypes, setPaintType] = useState([]);
    const [paintItems, setPaintItems] = useState([]);
    const [message, setMessage] = useState('');
    console.log(message);
    const [tableDatas, setTableDatas] = useState([
        { paintType: "", height: 0, deduction: 0, area: 0, wastage: 0, productVariant: "", colorCode: "", orderQty: 0 },
    ]);

    const [wastageOptions] = useState([...Array(16).keys()]);

    useEffect(() => {
        const initializeTableData = () => {
            // Map filteredData to table rows
            const initialTableData = filteredData.map((tile, index) => ({
                paintType: tile.paintType, // Use filtered paintType
                height: 0, // Default value
                deduction: 0, // Default value
                area: 0, // Calculated dynamically
                wastage: 0, // Default dropdown selection
                productVariant: "", // Default empty
                colorCode: "", // Default empty
                orderQty: 0, // Calculated dynamically
            }));

            setTableDatas(initialTableData); // Set table data
        };
        if (filteredData.length > 0) {
            initializeTableData();
        }
    }, [filteredData]); 
    const fetchLatestEno = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/paint_calculation/all/paints');
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
    useEffect(() => {
        const lengths = [];
        const breaths = [];
        const floorNames = [];
        const paintTypes = [];
        interiorFloors.forEach((floor) => {
            floor.tiles.forEach((tile) => {
                lengths.push(tile.length);
                breaths.push(tile.breadth);
                floorNames.push(floor.floorName);
                const paintVariant = paintVariants.find(
                    (variant) => variant.paintName === tile.selectedPaint
                );
                const selectedPaintType = paintVariant?.paintType || "Unknown";
                const matchedPaintType = paintTypeOptions.find(option => option === selectedPaintType);
                paintTypes.push(matchedPaintType || "Unknown");
            });
        });
        setLength(lengths);
        setBreath(breaths);
        setFloorName(floorNames);
        setPaintType(paintTypes);
    }, [interiorFloors, paintVariants, paintTypeOptions]); 

    const handleButtonClick = () => {
        setIsModalOpen(true);
    };
    const handleOCButtonClick = () => {
        setIsModalOpenOC(true);
    }
    const handleSCButtonClick = () => {
        setIsModalOpenSC(true);
    }
    const handleECButtonClick = () => {
        setIsModalOpenEC(true);
    }
    const handlePaintNameChange = (index, value) => {
        const newPaintNames = [...selectedPaintNames];
        newPaintNames[index] = value;
        setSelectedPaintNames(newPaintNames);
    };
    useEffect(() => {
        fetchPaintType();
    }, []);
    const fetchPaintType = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/paint_type/getAll');

            if (response.ok) {
                const data = await response.json();

                // Assuming data is an array of PaintType objects
                setPaintItems(data);
                setPaintTypeOptions(
                    data.map((item) => item.paintItem)  // Extract paintItem for the dropdown
                );
            } else {
                setMessage('Error fetching paint type names.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching paint type names.');
        }
    };
    const handleSelectionChange = (value) => {
        setSelection((prev) => {
            if (prev.includes(value)) {
                return prev.filter((item) => item !== value);
            } else if (prev.length < 2) {
                return [...prev, value];
            } else {
                alert('You can select up to two options only.');
                return prev;
            }
        });
    };

    const handleOCSelectionChange = (value) => {
        setOCSelection((prev) => {
            if (prev.includes(value)) {
                return prev.filter((item) => item !== value);
            } else if (prev.length < 2) {
                return [...prev, value];
            } else {
                alert('You can select up to two options only.');
                return prev;
            }
        });
    }
    const handleConfirmOC = () => {
        if (ocSelection.includes('Interior')) {
            if (ocSelection.includes('With Image')) {
                interiorSummaryPDFWithImage();
            }
            if (ocSelection.includes('Without Image')) {
                interiorSummaryPDF();
            }
        }
        if (ocSelection.includes('Exterior')) {
            if (ocSelection.includes('With Image')) {
                exteriorSummaryPDFWithImage();
            }
            if (ocSelection.includes('Without Image')) {
                exteriorSummaryPDF();
            }
        }
        if (ocSelection.includes('Both')) {
            if (ocSelection.includes('With Image')) {
                BothInteriorExteriorSummaryPDFWithImage();
            }
            if (ocSelection.includes('Without Image')) {
                BothInteriorExteriorSummaryPDF();
            }
        }
        setOCSelection([]);
        setIsModalOpenOC(false);
    }
    const handleConfirmEC = () => {
        if (ecSelection === 'Interior') {
            interiorFullPDF();
        } else if (ecSelection === 'Exterior') {
            exteriorFullPDF();
        } else if (ecSelection === 'Both') {
            BothInteriorExteriorFullPDF();
        }
        setECSelection([]);
        setIsModalOpenEC(false);
    }
    const handleConfirmSC = () => {
        if (scSelection === 'Interior') {
            interiorFloorSummaryPDF();
        } else if (scSelection === 'Exterior') {
            exteriorFloorSummaryPDF();
        } else if (scSelection === 'Both') {
            BothInteriorExteriorFloorSummaryPDF();
        }
        setSCSelection([]);
        setIsModalOpenSC(false);
    }
    const handleConfirm = () => {
        if (selection.includes('Interior')) {
            if (selection.includes('With Image')) {
                interiorCustomerCopyPDF();
            }
            if (selection.includes('Without Image')) {
                interiorCustomerCopyPDFWithoutImage();
            }
        }
        if (selection.includes('Exterior')) {
            if (selection.includes('With Image')) {
                exteriorCustomerCopyPDF();
            }
            if (selection.includes('Without Image')) {
                exteriorCustomerCopyPDFWithoutImage();
            }
        }
        if (selection.includes('Both')) {
            if (selection.includes('With Image')) {
                BothInteriorExteriorCustomerCopyPDF();
            }
            if (selection.includes('Without Image')) {
                BothInteriorExteriorCustomerCopyPDFWithoutImage();
            }
        }
        setSelection([]);
        setIsModalOpen(false);
    };


    const handleCloseModal = () => {
        setSelection([]);
        setIsModalOpen(false);
    };
    const handleCloseModalOC = () => {
        setOCSelection([]);
        setIsModalOpenOC(false);
    }
    const handleCloseModalSC = () => {
        setSCSelection([]);
        setIsModalOpenSC(false);
    }
    const handleCloseModalEC = () => {
        setECSelection([]);
        setIsModalOpenEC(false);
    }
    const handlePaintColorChange = (index, value) => {
        const newPaintColors = [...selectedPaintColors];
        newPaintColors[index] = value;
        setSelectedPaintColors(newPaintColors);
    };
    const handleWastageChange = (index, value) => {
        const newWastageValues = [...wastageValues];
        newWastageValues[index] = value;
        setWastageValues(newWastageValues);
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
    }, []);
    useEffect(() => {
        if (!clientName) {
            setFileOption([]);
            return;
        }
        let filteredOptions = fullDatas.filter(calculation => calculation.clientName === clientName.value);
        if (selectedModule === "Tile Calculation") {
            filteredOptions = filteredOptions.map(calculation => ({
                value: calculation.id,
                label: calculation.fileName,
            }));
        }
        else {
            filteredOptions = [];
        }
        setFileOption(filteredOptions);
    }, [clientName, fullDatas, selectedModule]);

    const fetchCalculation = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/tile/all');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setFullDatas(data); // Save raw data
        } catch (error) {
            console.error('Error fetching calculations:', error);
        }
    };
    useEffect(() => {
        fetchPaintData();
    }, [fetchPaintData]);
    useEffect(() => {
        fetch("https://backendaab.in/aabuilderDash/api/paint/variant/get/all")
            .then((response) => response.json())
            .then((data) => setPaintVariants(data))
            .catch((error) => console.error("Error fetching paint variants:", error));
    }, []);
    const fetchCalculations = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/paint_calculation/all/paints');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const formattedOptions = data.map(calculation => ({
                value: calculation.id,
                clientName: calculation.clientName,
                siteName: calculation.siteName,
                label: calculation.fileName,
            }));
            setFullData(data);
            setFileOptions(formattedOptions);
        } catch (error) {
            console.error('Error fetching calculations:', error);
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
    const handleTileChange = (e, floorIndex, tileIndex) => {
        const { name, value } = e.target;
        setInteriorFloors((prevFloors) =>
            prevFloors.map((floor, fIdx) => {
                if (fIdx !== floorIndex) return floor;
                return {
                    ...floor,
                    tiles: floor.tiles.map((tile, tIdx) => {
                        if (tIdx !== tileIndex) return tile;
                        return {
                            ...tile,
                            [name]: value,
                        };
                    }),
                };
            })
        );
    };
    const handleExteriorchange = (e, floorIndex, tileIndex) => {
        const { name, value } = e.target;
        setExteriorFloors((prevFloors) =>
            prevFloors.map((floor, fIdex) => {
                if (fIdex !== floorIndex) return floor;
                return {
                    ...floor,
                    tiles: floor.tiles.map((tile, tIdex) => {
                        if (tIdex !== tileIndex) return tile;
                        return {
                            ...tile,
                            [name]: value,
                        };
                    }),
                };
            })
        );
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
                tiles: [{ length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" }],
            }]);
        }
    };
    useEffect(() => {
        fetchCalculations();
    }, []);
    useEffect(() => {
        fetchCalculation();
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
    // this is the condition function for ceiling coat popup
    const calculateTotalOrderedTile = useCallback(() => {
        const floorMap = {};
        let lastValidFloorName = null;
        interiorFloors.forEach(floor => {
            const currentFloorName = floor.floorName && floor.floorName.trim() !== "" ? floor.floorName : lastValidFloorName;

            if (currentFloorName) {
                lastValidFloorName = currentFloorName;
            }
            if (!currentFloorName) {
                console.warn("Skipping floor with no valid name:", floor);
                return;
            }
            const filteredTiles = floor.tiles.filter(tile => tile.ceilingCoat === "Yes");
            if (filteredTiles.length === 0) {
                return;
            }
            const totalOrderedTile = filteredTiles.reduce((total, tile) => {
                const tileArea = tile.length * tile.breadth;
                return total + tileArea;
            }, 0);
            if (floorMap[currentFloorName]) {
                floorMap[currentFloorName] += totalOrderedTile;
            } else {
                floorMap[currentFloorName] = totalOrderedTile;
            }
        });
        return Object.entries(floorMap).map(([floorName, totalOrderedTile]) => ({
            floorName,
            totalOrderedTile,
        }));
    }, [interiorFloors]);

    const calculateTotalSum = () => {
        return calculateTotalOrderedTile().reduce((sum, floor) => sum + floor.totalOrderedTile, 0);
    };
    useEffect(() => {
        const initialData = calculateTotalOrderedTile().map((floor) => ({
            floorName: floor.floorName || "",
            totalOrderedTile: floor.totalOrderedTile || 0,
            paintVariant: "",
            paintColor: "",
            wastagePercentage: 0,
            orderQty: 0,
        }));
        setTableData(initialData);
    }, [calculateTotalOrderedTile]);
    const calculateOrderQuantity = (totalOrderedTile, wastagePercentage) => {
        return totalOrderedTile + totalOrderedTile * (wastagePercentage / 100);
    };
    const calculateOrderQty = (row, index) => {
        const selectedPaint = paintVariants.find(
            (variant) => variant.paintName === selectedPaintNames[index]
        );
        const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
        const orderQty =
            (parseFloat(row.totalOrderedTile) *
                (1 + parseFloat(wastageValues[index] || 0) / 100)) / paintCoverBySqft;

        return orderQty;
    };

    const calculateTotalOrderQty = () => {
        return tableData
            .reduce((total, row, index) => total + calculateOrderQty(row, index), 0)
            .toFixed(2); // Format the total for display
    };

    useEffect(() => {
        setTableData((prevData) =>
            prevData.map((row) => ({
                ...row,
                orderQuantity: calculateOrderQuantity(
                    row.totalOrderedTile,
                    row.wastagePercentage
                ),
            }))
        );
    }, []);
    const getRevisionNumber = async (clientName) => {
        try {
            const clientResponse = await fetch("https://backendaab.in/aabuilderDash/api/paint_calculation/all/paints");
            if (!clientResponse.ok) {
                throw new Error("Failed to fetch calculations from the backend");
            }
            const clientData = await clientResponse.json();
            const matchingClientCalculations = clientData.filter(
                (calculation) => calculation.clientName === clientName
            );
            return matchingClientCalculations.length;
        } catch (error) {
            console.error("Error fetching revision number:", error.message);
            return 0;
        }
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
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const revisionCount = await getRevisionNumber(clientName.label);
        const revisionNumber = `R ${revisionCount}`;
        const header = (doc) => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("PAINT MEASUREMENT SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.text("INTERIOR", 14, 43);
            doc.setFontSize(10);
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
            doc.setFontSize(10);
            const tmsDate = `PMS EC ${clientId} - ${selectedDate} - ${revisionNumber}`;
            doc.setFont("helvetica", "normal");
            const textWidth = doc.getTextWidth(tmsDate);
            const rightMargin = 14;
            const pageWidth = doc.internal.pageSize.width;
            const startX = pageWidth - rightMargin - textWidth;
            doc.text(tmsDate, startX, 27);
            doc.setDrawColor('#BF9853');
            doc.setLineWidth(1);
            doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
        };
        const header1 = (doc) => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("PAINT MEASUREMENT SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.text("EXTERIOR", 14, 43);
            doc.setFontSize(10);
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
            doc.setFontSize(10);
            const tmsDate = `PMS EC ${clientId} - ${selectedDate} - ${revisionNumber}`;
            doc.setFont("helvetica", "normal");
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
        let tableData = [];
        let floorCounter = 0;
        if (!floors || floors.length === 0) {
            tableData.push(["No Data", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        } else {
            let globalAreaCounter = 1;
            let previousFloorName = null;
            interiorFloors.forEach((floor, floorIndex) => {
                const currentFloorName = floor.floorName || previousFloorName;
                if (currentFloorName !== previousFloorName || floorIndex === 0) {
                    globalAreaCounter = 1;
                    const floorSerial = String.fromCharCode(65 + floorCounter);
                    tableData.push([
                        { content: floorSerial, styles: { fontStyle: "bold" } },
                        { content: currentFloorName.toUpperCase(), styles: { fontStyle: "bold" } },
                        "",
                        "", "", "", "", "", "", "", "", "", "", "", ""
                    ]);
                    previousFloorName = currentFloorName;
                    floorCounter++;
                }
                floor.tiles.forEach((tile, tileIndex) => {
                    tableData.push([
                        globalAreaCounter,
                        floor.areaName,
                        tile.length || "0",
                        tile.breadth || "0",
                        tile.height || "0",
                        tile.deductionArea || "0",
                        tile.length && (tile.breadth || tile.height)
                            ? ((Number(tile.length) * Number(tile.height) * 2) +
                                (Number(tile.breadth) * Number(tile.height) * 2) -
                                Number(tile.deductionArea || 0)).toFixed(2)
                            : "0",
                        tile.putty || "-",
                        tile.primer || "-",
                        tile.ceilingCoat || "-",
                        tile.waterproof || "-",
                        tile.wastagePercentage || "0%",
                        tile.selectedPaint || "-",
                        tile.selectedPaintColor || "-",
                        tile.length && (tile.breadth || tile.height) && tile.selectedPaint
                            ? (
                                ((Number(tile.length) * Number(tile.height) * 2) +
                                    (Number(tile.breadth) * Number(tile.height) * 2) -
                                    Number(tile.deductionArea || 0)) *
                                (1 + (Number(tile.wastagePercentage) / 100)) /
                                (paintVariants.find((variant) => variant.paintName === tile.selectedPaint)?.paintCoverBySqft || 1)
                            ).toFixed(2) + "L"
                            : "0",
                    ]);
                    globalAreaCounter++;
                });
            });
        }
        const tableStartY = 44;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.autoTable({
            head: [
                [
                    "S.No",
                    "Area Name",
                    "L (Ft)",
                    "B (Ft)",
                    "H (Ft)",
                    "Deduction Area",
                    "Area (Sqft)",
                    "Putty",
                    "Primer",
                    "Ceiling Coat",
                    "Water Proof",
                    "Wastage %",
                    "Product Variant",
                    "Paint Color",
                    "Litter (L)",
                ],
            ],
            body: tableData,
            theme: "grid",
            startY: 44,
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 10,
                halign: "center",
                lineWidth: 0,
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [0, 0, 0],
                halign: "left",
                font: "helvetica",
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 12 },
                1: { halign: "left", cellWidth: 30 },
                2: { halign: "center", cellWidth: 10 },
                3: { halign: "center", cellWidth: 10 },
                4: { halign: "center", cellWidth: 10 },
                5: { halign: "center", cellWidth: 22 },
                6: { halign: "center", cellWidth: 15 },
                7: { halign: "center", cellWidth: 13 },
                8: { halign: "center", cellWidth: 15 },
                9: { halign: "center", cellWidth: 15 },
                10: { halign: "center", cellWidth: 16 },
                11: { halign: "center", cellWidth: 18 },
                12: { halign: "left", cellWidth: 36 },
                13: { halign: "left", cellWidth: 29 },
                14: { halign: "center", cellWidth: 18 },
            },
            margin: { left: 14, right: 14 },
            pageBreak: 'auto',
            didDrawPage: (data) => {
                if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
                    data.settings.startY = -30;
                    const tableStartY = 44;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.01);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                }
                header(doc);
                footer(doc);
            },
            didDrawCell: (data) => {
                if (data.section === "head") {
                    const { doc, cell } = data;
                    const startX = cell.x;
                    const startY = cell.y + cell.height;
                    const endX = cell.x + cell.width;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.6);
                    doc.line(startX, startY, endX, startY);
                }
                if (data.section === 'body' && data.column.index === 0 && data.cell.text[0] === "No Data") {
                    doc.setFontSize(9);
                    doc.setTextColor(0);
                    doc.text("No Data", data.cell.x + 10, data.cell.y + 5);
                }
            },
        });
        doc.addPage();
        let tableDatas = [];
        let floorCounters = 0;
        if (!floors || floors.length === 0) {
            tableDatas.push(["No Data", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        } else {
            let globalAreaCounters = 1;
            let previousFloorName = null;
            exteriorFloors.forEach((floor, floorIndex) => {
                const currentFloorName = floor.floorName || previousFloorName;
                if (currentFloorName !== previousFloorName || floorIndex === 0) {
                    globalAreaCounters = 1;
                    const floorSerial = String.fromCharCode(65 + floorCounters);
                    tableDatas.push([
                        { content: floorSerial, styles: { fontStyle: "bold" } },
                        { content: currentFloorName.toUpperCase(), styles: { fontStyle: "bold" } },
                        "",
                        "", "", "", "", "", "", "", "", "", "", "", ""
                    ]);
                    previousFloorName = currentFloorName;
                    floorCounters++;
                }
                floor.tiles.forEach((tile, tileIndex) => {
                    tableDatas.push([
                        globalAreaCounters,
                        floor.areaName,
                        tile.length || "0",
                        tile.breadth || "0",
                        tile.height || "0",
                        tile.deductionArea || "0",
                        tile.length && (tile.breadth || tile.height)
                            ? ((Number(tile.length) * Number(tile.height) * 2) +
                                (Number(tile.breadth) * Number(tile.height) * 2) -
                                Number(tile.deductionArea || 0)).toFixed(2)
                            : "0",
                        tile.putty || "-",
                        tile.primer || "-",
                        tile.ceilingCoat || "-",
                        tile.waterproof || "-",
                        tile.wastagePercentage || "0%",
                        tile.selectedPaint || "-",
                        tile.selectedPaintColor || "-",
                        tile.length && (tile.breadth || tile.height) && tile.selectedPaint
                            ? (
                                ((Number(tile.length) * Number(tile.height) * 2) +
                                    (Number(tile.breadth) * Number(tile.height) * 2) -
                                    Number(tile.deductionArea || 0)) *
                                (1 + (Number(tile.wastagePercentage) / 100)) /
                                (paintVariants.find((variant) => variant.paintName === tile.selectedPaint)?.paintCoverBySqft || 1)
                            ).toFixed(2) + "L"
                            : "0",
                    ]);
                    globalAreaCounters++;
                });
            });
        }
        doc.autoTable({
            head: [
                [
                    "S.No",
                    "Area Name",
                    "L (Ft)",
                    "B (Ft)",
                    "H (Ft)",
                    "Deduction Area",
                    "Area (Sqft)",
                    "Putty",
                    "Primer",
                    "Ceiling Coat",
                    "Water Proof",
                    "Wastage %",
                    "Product Variant",
                    "Paint Color",
                    "Litter (L)",
                ],
            ],
            body: tableDatas,
            theme: "grid",
            startY: 44,
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 10,
                halign: "center",
                lineWidth: 0,
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [0, 0, 0],
                halign: "left",
                font: "helvetica",
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 12 },
                1: { halign: "left", cellWidth: 30 },
                2: { halign: "center", cellWidth: 10 },
                3: { halign: "center", cellWidth: 10 },
                4: { halign: "center", cellWidth: 10 },
                5: { halign: "center", cellWidth: 22 },
                6: { halign: "center", cellWidth: 15 },
                7: { halign: "center", cellWidth: 13 },
                8: { halign: "center", cellWidth: 15 },
                9: { halign: "center", cellWidth: 15 },
                10: { halign: "center", cellWidth: 16 },
                11: { halign: "center", cellWidth: 18 },
                12: { halign: "left", cellWidth: 36 },
                13: { halign: "left", cellWidth: 29 },
                14: { halign: "center", cellWidth: 18 },
            },
            margin: { left: 14, right: 14 },
            pageBreak: 'auto',
            didDrawPage: (data) => {
                if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
                    data.settings.startY = -30;
                    const tableStartY = 44;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.01);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                }
                header1(doc);
                footer(doc);
            },
            didDrawCell: (data) => {
                if (data.section === "head") {
                    const { doc, cell } = data;
                    const startX = cell.x;
                    const startY = cell.y + cell.height;
                    const endX = cell.x + cell.width;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.6);
                    doc.line(startX, startY, endX, startY);
                }
                if (data.section === 'body' && data.column.index === 0 && data.cell.text[0] === "No Data") {
                    doc.setFontSize(9);
                    doc.setTextColor(0);
                    doc.text("No Data", data.cell.x + 10, data.cell.y + 5);
                }
            },
        });
        const filename = `PMS EC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
        doc.save(filename);
        return doc.output("blob");
    };
    const generateSummaryPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = combinedFloorSummary();
            const exteriorSummaryData = exteriorGenerateSummaryWithFloorName();
            const doc = new jsPDF();
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("INTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${selectedDate} - ${revisionNumber}`;
                const textWidth = doc.getTextWidth(tmsDate);
                const rightMargin = 14;
                const pageWidth = doc.internal.pageSize.width;
                const startX = pageWidth - rightMargin - textWidth;
                doc.text(tmsDate, startX, 27);
                doc.setDrawColor('#BF9853');
                doc.setLineWidth(1);
                doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
            };
            const header1 = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("EXTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${selectedDate} - ${revisionNumber}`;
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
            const headers = [["S.No", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)", "Image"]];
            const tableData = summaryDatas.map((item, index) => {
                return [
                    index + 1,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 50 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 34 },
                    4: { halign: "center", cellWidth: 25 },
                    5: { halign: "center", cellWidth: 23 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                    if (data.column.index === 5 && data.cell.section === "body") {
                        const item = summaryDatas[data.row.index];
                        if (item && item.paintColorImage) {
                            const imageBase64 = `data:image/png;base64,${item.paintColorImage}`;
                            const x = data.cell.x + 4;
                            const y = data.cell.y + 2;
                            const width = data.cell.width - 8;
                            const height = data.cell.height - 3;
                            try {
                                doc.addImage(imageBase64, 'PNG', x, y, width, height);
                            } catch (imageError) {
                                console.error("Error adding image to PDF:", imageError);
                            }
                        } else {
                            console.log("No image data available for row:", data.row.index);
                        }
                    }
                }
            });
            doc.addPage();
            const tableDatas = exteriorSummaryData.map((item, index) => {
                return [
                    index + 1,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableDatas,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 50 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 34 },
                    4: { halign: "center", cellWidth: 25 },
                    5: { halign: "center", cellWidth: 23 },
                },
                didDrawPage: (data) => {
                    header1();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                    if (data.column.index === 5 && data.cell.section === "body") {
                        const item = exteriorSummaryData[data.row.index];
                        if (item && item.paintColorImage) {
                            const imageBase64 = `data:image/png;base64,${item.paintColorImage}`;
                            const x = data.cell.x + 4;
                            const y = data.cell.y + 2;
                            const width = data.cell.width - 8;
                            const height = data.cell.height - 3;
                            try {
                                doc.addImage(imageBase64, 'PNG', x, y, width, height);
                            } catch (imageError) {
                                console.error("Error adding image to PDF:", imageError);
                            }
                        } else {
                            console.log("No image data available for row:", data.row.index);
                        }
                    }
                }
            });
            doc.save(`PMS OC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
            return doc.output("blob");
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };
    const generateInteriorFloorSummaryPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryData = combinedFloorSummary();
            const exteriorSummarys = exteriorGenerateSummaryWithFloorName();
            const doc = new jsPDF();
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("INTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("STOCKING CHART", doc.internal.pageSize.width - 46, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS SC ${clientId} - ${selectedDate} - ${revisionNumber}`;
                const textWidth = doc.getTextWidth(tmsDate);
                const rightMargin = 14;
                const pageWidth = doc.internal.pageSize.width;
                const startX = pageWidth - rightMargin - textWidth;
                doc.text(tmsDate, startX, 27);
                doc.setDrawColor('#BF9853');
                doc.setLineWidth(1);
                doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
            };
            const header1 = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("EXTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("STOCKING CHART", doc.internal.pageSize.width - 46, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS SC ${clientId} - ${selectedDate} - ${revisionNumber}`;
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
            const headers = [["S.No", "Floor Name", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)"]];
            let totalArea = 0;
            let totalQty = 0;
            const tableData = summaryData.map((item, index) => {
                const row = [
                    index + 1,
                    item.floorName,
                    item.paintName,
                    item.paintColor,
                    item.area,
                    item.orderQty,
                ];
                totalArea += parseFloat(item.area) || 0;
                totalQty += parseFloat(item.orderQty) || 0;
                return row;
            });
            tableData.push([
                { content: "", styles: { fontStyle: "bold" } },
                { content: "TOTAL", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: totalArea.toFixed(2), styles: { fontStyle: "bold" } },
                { content: `${totalQty.toFixed(2)}L`, styles: { fontStyle: "bold" } },
            ]);
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
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
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "center", cellWidth: 35 },
                    2: { halign: "left", cellWidth: 46 },
                    3: { halign: "center", cellWidth: 36 },
                    4: { halign: "center", cellWidth: 26 },
                    5: { halign: "center", cellWidth: 24 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                },
            });
            doc.addPage();
            let totalAreas = 0;
            let totalQtys = 0;
            const tableDatas = exteriorSummarys.map((item, index) => {
                const row = [
                    index + 1,
                    item.floorName,
                    item.paintName,
                    item.paintColor,
                    item.area,
                    item.orderQty,
                ];
                totalAreas += parseFloat(item.area) || 0;
                totalQtys += parseFloat(item.orderQty) || 0;
                return row;
            });
            tableDatas.push([
                { content: "", styles: { fontStyle: "bold" } },
                { content: "TOTAL", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: totalAreas.toFixed(2), styles: { fontStyle: "bold" } },
                { content: `${totalQtys.toFixed(2)}L`, styles: { fontStyle: "bold" } },
            ]);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableDatas,
                startY: tableStartY,
                theme: "grid",
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
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "center", cellWidth: 35 },
                    2: { halign: "left", cellWidth: 46 },
                    3: { halign: "center", cellWidth: 36 },
                    4: { halign: "center", cellWidth: 26 },
                    5: { halign: "center", cellWidth: 24 },
                },
                didDrawPage: (data) => {
                    header1();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                },
            });
            const filename = `PMS SC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
            doc.save(filename);
            return doc.output("blob");
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const generateInteriorCustomerCopyPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = combinedFloorSummary();
            const exteriorSummarys = exteriorGenerateSummaryWithFloorName();
            const doc = new jsPDF({
                orientation: "landscape",
            });
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(8);
                doc.text("INTERIOR", 14, 43);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS SC ${clientId} - ${selectedDate} - ${revisionNumber}`;
                doc.setFont("helvetica", "normal");
                const textWidth = doc.getTextWidth(tmsDate);
                const rightMargin = 14;
                const pageWidth = doc.internal.pageSize.width;
                const startX = pageWidth - rightMargin - textWidth;
                doc.text(tmsDate, startX, 27);
                doc.setDrawColor('#BF9853');
                doc.setLineWidth(1);
                doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
            };
            const header1 = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(8);
                doc.text("EXTERIOR", 14, 43);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS CC ${clientId} - ${selectedDate} - ${revisionNumber}`;
                doc.setFont("helvetica", "normal");
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
            const headers = [["S.No", "Floor Name", "Area Name", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)", "Image"]];
            const tableData = summaryDatas.map((item, index) => {
                return [
                    index + 1,
                    item.floorName || "",
                    item.areaName,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 39 },
                    2: { halign: "left", cellWidth: 39 },
                    3: { halign: "left", cellWidth: 50 },
                    4: { halign: "left", cellWidth: 40 },
                    5: { halign: "center", cellWidth: 38 },
                    6: { halign: "center", cellWidth: 25 },
                    7: { halign: "center", cellWidth: 23 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                    if (data.column.index === 7 && data.cell.section === "body") {
                        const item = summaryDatas[data.row.index];
                        if (item && item.paintColorImage) {
                            const imageBase64 = `data:image/png;base64,${item.paintColorImage}`;
                            const x = data.cell.x + 4;
                            const y = data.cell.y + 2;
                            const width = data.cell.width - 8;
                            const height = data.cell.height - 3;
                            try {
                                doc.addImage(imageBase64, 'PNG', x, y, width, height);
                            } catch (imageError) {
                                console.error("Error adding image to PDF:", imageError);
                            }
                        } else {
                            console.log("No image data available for row:", data.row.index);
                        }
                    }
                }
            });
            doc.addPage();
            const headers1 = [["S.No", "Floor Name", "Area Name", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)", "Image"]];
            const tableData1 = exteriorSummarys.map((item, index) => {
                return [
                    index + 1,
                    item.floorName || "",
                    item.areaName,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers1,
                body: tableData1,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 39 },
                    2: { halign: "left", cellWidth: 39 },
                    3: { halign: "left", cellWidth: 50 },
                    4: { halign: "left", cellWidth: 40 },
                    5: { halign: "center", cellWidth: 38 },
                    6: { halign: "center", cellWidth: 25 },
                    7: { halign: "center", cellWidth: 23 },
                },
                didDrawPage: (data) => {
                    header1();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                    if (data.column.index === 7 && data.cell.section === "body") {
                        const item = exteriorSummarys[data.row.index];
                        if (item && item.paintColorImage) {
                            const imageBase64 = `data:image/png;base64,${item.paintColorImage}`;
                            const x = data.cell.x + 4;
                            const y = data.cell.y + 2;
                            const width = data.cell.width - 8;
                            const height = data.cell.height - 3;
                            try {
                                doc.addImage(imageBase64, 'PNG', x, y, width, height);
                            } catch (imageError) {
                                console.error("Error adding image to PDF:", imageError);
                            }
                        } else {
                            console.log("No image data available for row:", data.row.index);
                        }
                    }
                }
            });
            const filename = `PMS CC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
            doc.save(filename);
            const pdf = doc.output("blob");
            return pdf;
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const interiorFloorSummaryPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryData = generateSummaryWithFloorName();
            const doc = new jsPDF();
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'SC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("INTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("STOCKING CHART", doc.internal.pageSize.width - 46, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS SC ${clientId} - ${selectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "Floor Name", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)"]];
            let totalArea = 0;
            let totalQty = 0;
            const tableData = summaryData.map((item, index) => {
                const row = [
                    index + 1,
                    item.floorName,
                    item.paintName,
                    item.paintColor,
                    item.area,
                    item.orderQty,
                ];
                totalArea += parseFloat(item.area) || 0;
                totalQty += parseFloat(item.orderQty) || 0;
                return row;
            });
            tableData.push([
                { content: "", styles: { fontStyle: "bold" } },
                { content: "TOTAL", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: totalArea.toFixed(2), styles: { fontStyle: "bold" } },
                { content: `${totalQty.toFixed(2)}L`, styles: { fontStyle: "bold" } },
            ]);
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
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
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "center", cellWidth: 35 },
                    2: { halign: "left", cellWidth: 46 },
                    3: { halign: "center", cellWidth: 36 },
                    4: { halign: "center", cellWidth: 26 },
                    5: { halign: "center", cellWidth: 24 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                },
            });
            doc.save(filename);
            return doc.output("blob");
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const exteriorFloorSummaryPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryData = exteriorGenerateSummaryWithFloorName();
            const doc = new jsPDF();
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'SC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header1 = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(8);
                doc.text("EXTERIOR", 14, 43);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("STOCKING CHART", doc.internal.pageSize.width - 46, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS SC ${clientId} - ${selectedFile.label}.${incrementValue}`;
                doc.setFont("helvetica", "normal");
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
            const headers = [["S.No", "Floor Name", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)"]];
            let totalArea = 0;
            let totalQty = 0;
            const tableData = summaryData.map((item, index) => {
                const row = [
                    index + 1,
                    item.floorName,
                    item.paintName,
                    item.paintColor,
                    item.area,
                    item.orderQty,
                ];
                totalArea += parseFloat(item.area) || 0;
                totalQty += parseFloat(item.orderQty) || 0;
                return row;
            });
            tableData.push([
                { content: "", styles: { fontStyle: "bold" } },
                { content: "TOTAL", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: totalArea.toFixed(2), styles: { fontStyle: "bold" } },
                { content: `${totalQty.toFixed(2)}L`, styles: { fontStyle: "bold" } },
            ]);
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
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
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "center", cellWidth: 35 },
                    2: { halign: "left", cellWidth: 46 },
                    3: { halign: "center", cellWidth: 36 },
                    4: { halign: "center", cellWidth: 26 },
                    5: { halign: "center", cellWidth: 24 },
                },
                didDrawPage: (data) => {
                    header1();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                },
            });
            doc.save(filename);
            return doc.output("blob");
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const BothInteriorExteriorFloorSummaryPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryData = generateSummaryWithFloorName();
            const exteriorSummaryData = exteriorGenerateSummaryWithFloorName();
            const doc = new jsPDF();
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'SC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("INTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("STOCKING CHART", doc.internal.pageSize.width - 46, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS SC ${clientId} - ${selectedFile.label}.${incrementValue}`;
                const textWidth = doc.getTextWidth(tmsDate);
                const rightMargin = 14;
                const pageWidth = doc.internal.pageSize.width;
                const startX = pageWidth - rightMargin - textWidth;
                doc.text(tmsDate, startX, 27);
                doc.setDrawColor('#BF9853');
                doc.setLineWidth(1);
                doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
            };
            const header1 = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(8);
                doc.text("EXTERIOR", 14, 43);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("STOCKING CHART", doc.internal.pageSize.width - 46, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS SC ${clientId} - ${selectedFile.label}.${incrementValue}`;
                doc.setFont("helvetica", "normal");
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
            const headers = [["S.No", "Floor Name", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)"]];
            let totalArea = 0;
            let totalQty = 0;
            const tableData = summaryData.map((item, index) => {
                const row = [
                    index + 1,
                    item.floorName,
                    item.paintName,
                    item.paintColor,
                    item.area,
                    item.orderQty,
                ];
                totalArea += parseFloat(item.area) || 0;
                totalQty += parseFloat(item.orderQty) || 0;
                return row;
            });
            tableData.push([
                { content: "", styles: { fontStyle: "bold" } },
                { content: "TOTAL", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: totalArea.toFixed(2), styles: { fontStyle: "bold" } },
                { content: `${totalQty.toFixed(2)}L`, styles: { fontStyle: "bold" } },
            ]);
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
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
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "center", cellWidth: 35 },
                    2: { halign: "left", cellWidth: 46 },
                    3: { halign: "center", cellWidth: 36 },
                    4: { halign: "center", cellWidth: 26 },
                    5: { halign: "center", cellWidth: 24 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                },
            });
            doc.addPage();
            let totalAreas = 0;
            let totalQtys = 0;
            const tableDatas = exteriorSummaryData.map((item, index) => {
                const row = [
                    index + 1,
                    item.floorName,
                    item.paintName,
                    item.paintColor,
                    item.area,
                    item.orderQty,
                ];
                totalAreas += parseFloat(item.area) || 0;
                totalQtys += parseFloat(item.orderQty) || 0;
                return row;
            });
            tableData.push([
                { content: "", styles: { fontStyle: "bold" } },
                { content: "TOTAL", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: totalAreas.toFixed(2), styles: { fontStyle: "bold" } },
                { content: `${totalQtys.toFixed(2)}L`, styles: { fontStyle: "bold" } },
            ]);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableDatas,
                startY: tableStartY,
                theme: "grid",
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
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "center", cellWidth: 35 },
                    2: { halign: "left", cellWidth: 46 },
                    3: { halign: "center", cellWidth: 36 },
                    4: { halign: "center", cellWidth: 26 },
                    5: { halign: "center", cellWidth: 24 },
                },
                didDrawPage: (data) => {
                    header1();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                },
            });
            doc.save(filename);
            return doc.output("blob");
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const interiorCustomerCopyPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = combinedFloorSummary();
            const doc = new jsPDF({
                orientation: "landscape",
            });
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'CC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(8);
                doc.text("INTERIOR", 14, 43);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS CC ${clientId} - ${selectedFile.label}.${incrementValue}`;
                doc.setFont("helvetica", "normal");
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
            const headers = [["S.No", "Floor Name", "Area Name", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)", "Image"]];
            const tableData = summaryDatas.map((item, index) => {
                return [
                    index + 1,
                    item.floorName || "",
                    item.areaName,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 39 },
                    2: { halign: "left", cellWidth: 39 },
                    3: { halign: "left", cellWidth: 50 },
                    4: { halign: "left", cellWidth: 40 },
                    5: { halign: "center", cellWidth: 38 },
                    6: { halign: "center", cellWidth: 25 },
                    7: { halign: "center", cellWidth: 23 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                    if (data.column.index === 7 && data.cell.section === "body") {
                        const item = summaryDatas[data.row.index];
                        if (item && item.paintColorImage) {
                            const imageBase64 = `data:image/png;base64,${item.paintColorImage}`;
                            const x = data.cell.x + 4;
                            const y = data.cell.y + 2;
                            const width = data.cell.width - 8;
                            const height = data.cell.height - 3;
                            try {
                                doc.addImage(imageBase64, 'PNG', x, y, width, height);
                            } catch (imageError) {
                                console.error("Error adding image to PDF:", imageError);
                            }
                        } else {
                            console.log("No image data available for row:", data.row.index);
                        }
                    }
                }
            });
            doc.save(filename);
            const pdf = doc.output("blob");
            return pdf;
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const interiorCustomerCopyPDFWithoutImage = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = combinedFloorSummary();
            const doc = new jsPDF({
                orientation: "landscape",
            });
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'CC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(8);
                doc.text("INTERIOR", 14, 43);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS CC ${clientId} - ${selectedFile.label}.${incrementValue}`;
                doc.setFont("helvetica", "normal");
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
            const headers = [["S.No", "Floor Name", "Area Name", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)"]];
            const tableData = summaryDatas.map((item, index) => {
                return [
                    index + 1,
                    item.floorName || "",
                    item.areaName,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 18 },
                    1: { halign: "left", cellWidth: 42 },
                    2: { halign: "left", cellWidth: 42 },
                    3: { halign: "left", cellWidth: 56 },
                    4: { halign: "left", cellWidth: 44 },
                    5: { halign: "center", cellWidth: 40 },
                    6: { halign: "center", cellWidth: 27 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                }
            });
            doc.save(filename);
            const pdf = doc.output("blob");
            return pdf;
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const exteriorCustomerCopyPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = exteriorGenerateSummaryWithFloorName();
            const doc = new jsPDF({
                orientation: "landscape",
            });
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'CC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(8);
                doc.text("EXTERIOR", 14, 43);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS CC ${clientId} - ${selectedFile.label}.${incrementValue}`;
                doc.setFont("helvetica", "normal");
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
            const headers = [["S.No", "Floor Name", "Area Name", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)", "Image"]];
            const tableData = summaryDatas.map((item, index) => {
                return [
                    index + 1,
                    item.floorName || "",
                    item.areaName,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 39 },
                    2: { halign: "left", cellWidth: 39 },
                    3: { halign: "left", cellWidth: 50 },
                    4: { halign: "left", cellWidth: 40 },
                    5: { halign: "center", cellWidth: 38 },
                    6: { halign: "center", cellWidth: 25 },
                    7: { halign: "center", cellWidth: 23 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                    if (data.column.index === 7 && data.cell.section === "body") {
                        const item = summaryDatas[data.row.index];
                        if (item && item.paintColorImage) {
                            const imageBase64 = `data:image/png;base64,${item.paintColorImage}`;
                            const x = data.cell.x + 4;
                            const y = data.cell.y + 2;
                            const width = data.cell.width - 8;
                            const height = data.cell.height - 3;
                            try {
                                doc.addImage(imageBase64, 'PNG', x, y, width, height);
                            } catch (imageError) {
                                console.error("Error adding image to PDF:", imageError);
                            }
                        } else {
                            console.log("No image data available for row:", data.row.index);
                        }
                    }
                }
            });
            doc.save(filename);
            const pdf = doc.output("blob");
            return pdf;
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const exteriorCustomerCopyPDFWithoutImage = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = exteriorGenerateSummaryWithFloorName();
            const doc = new jsPDF({
                orientation: "landscape",
            });
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'CC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(8);
                doc.text("EXTERIOR", 14, 43);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS CC ${clientId} - ${selectedFile.label}.${incrementValue}`;
                doc.setFont("helvetica", "normal");
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
            const headers = [["S.No", "Floor Name", "Area Name", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)"]];
            const tableData = summaryDatas.map((item, index) => {
                return [
                    index + 1,
                    item.floorName || "",
                    item.areaName,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 18 },
                    1: { halign: "left", cellWidth: 42 },
                    2: { halign: "left", cellWidth: 42 },
                    3: { halign: "left", cellWidth: 56 },
                    4: { halign: "left", cellWidth: 44 },
                    5: { halign: "center", cellWidth: 40 },
                    6: { halign: "center", cellWidth: 27 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                }
            });
            footer();
            doc.save(filename);
            const pdf = doc.output("blob");
            return pdf;
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const BothInteriorExteriorCustomerCopyPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = exteriorGenerateSummaryWithFloorName();
            const summaryDatass = combinedFloorSummary();
            const doc = new jsPDF({
                orientation: "landscape",
            });
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'CC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(8);
                doc.text("INTERIOR", 14, 43);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS CC ${clientId} - ${selectedFile.label}.${incrementValue}`;
                doc.setFont("helvetica", "normal");
                const textWidth = doc.getTextWidth(tmsDate);
                const rightMargin = 14;
                const pageWidth = doc.internal.pageSize.width;
                const startX = pageWidth - rightMargin - textWidth;
                doc.text(tmsDate, startX, 27);
                doc.setDrawColor('#BF9853');
                doc.setLineWidth(1);
                doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
            };
            const header1 = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("EXTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS CC ${clientId} - ${selectedDate} - ${revisionNumber}`;
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
            const headers = [["S.No", "Floor Name", "Area Name", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)", "Image"]];
            const tableData = summaryDatass.map((item, index) => {
                return [
                    index + 1,
                    item.floorName || "",
                    item.areaName,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 39 },
                    2: { halign: "left", cellWidth: 39 },
                    3: { halign: "left", cellWidth: 50 },
                    4: { halign: "left", cellWidth: 40 },
                    5: { halign: "center", cellWidth: 38 },
                    6: { halign: "center", cellWidth: 25 },
                    7: { halign: "center", cellWidth: 23 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                    if (data.column.index === 7 && data.cell.section === "body") {
                        const item = summaryDatass[data.row.index];
                        if (item && item.paintColorImage) {
                            const imageBase64 = `data:image/png;base64,${item.paintColorImage}`;
                            const x = data.cell.x + 4;
                            const y = data.cell.y + 2;
                            const width = data.cell.width - 8;
                            const height = data.cell.height - 3;
                            try {
                                doc.addImage(imageBase64, 'PNG', x, y, width, height);
                            } catch (imageError) {
                                console.error("Error adding image to PDF:", imageError);
                            }
                        } else {
                            console.log("No image data available for row:", data.row.index);
                        }
                    }
                }
            });
            doc.addPage();
            const exteriorHeaders = [["S.No", "Floor Name", "Area Name", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)", "Image"]];
            const tableDatas = summaryDatas.map((item, index) => {
                return [
                    index + 1,
                    item.floorName || "",
                    item.areaName,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: exteriorHeaders,
                body: tableDatas,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 39 },
                    2: { halign: "left", cellWidth: 39 },
                    3: { halign: "left", cellWidth: 50 },
                    4: { halign: "left", cellWidth: 40 },
                    5: { halign: "center", cellWidth: 38 },
                    6: { halign: "center", cellWidth: 25 },
                    7: { halign: "center", cellWidth: 23 },
                },
                didDrawPage: (data) => {
                    header1();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                    if (data.column.index === 7 && data.cell.section === "body") {
                        const item = summaryDatas[data.row.index];
                        if (item && item.paintColorImage) {
                            const imageBase64 = `data:image/png;base64,${item.paintColorImage}`;
                            const x = data.cell.x + 4;
                            const y = data.cell.y + 2;
                            const width = data.cell.width - 8;
                            const height = data.cell.height - 3;
                            try {
                                doc.addImage(imageBase64, 'PNG', x, y, width, height);
                            } catch (imageError) {
                                console.error("Error adding image to PDF:", imageError);
                            }
                        } else {
                            console.log("No image data available for row:", data.row.index);
                        }
                    }
                }
            });
            footer();
            doc.save(filename);
            const pdf = doc.output("blob");
            return pdf;
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const BothInteriorExteriorCustomerCopyPDFWithoutImage = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = exteriorGenerateSummaryWithFloorName();
            const summaryDatass = combinedFloorSummary();
            const doc = new jsPDF({
                orientation: "landscape",
            });
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'CC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(8);
                doc.text("INTERIOR", 14, 43);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS CC ${clientId} - ${selectedFile.label}.${incrementValue}`;
                doc.setFont("helvetica", "normal");
                const textWidth = doc.getTextWidth(tmsDate);
                const rightMargin = 14;
                const pageWidth = doc.internal.pageSize.width;
                const startX = pageWidth - rightMargin - textWidth;
                doc.text(tmsDate, startX, 27);
                doc.setDrawColor('#BF9853');
                doc.setLineWidth(1);
                doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
            };
            const header1 = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("EXTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS CC ${clientId} - ${selectedDate} - ${revisionNumber}`;
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
            const headers = [["S.No", "Floor Name", "Area Name", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)"]];
            const tableData = summaryDatass.map((item, index) => {
                return [
                    index + 1,
                    item.floorName || "",
                    item.areaName,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 18 },
                    1: { halign: "left", cellWidth: 42 },
                    2: { halign: "left", cellWidth: 42 },
                    3: { halign: "left", cellWidth: 56 },
                    4: { halign: "left", cellWidth: 44 },
                    5: { halign: "center", cellWidth: 40 },
                    6: { halign: "center", cellWidth: 27 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                }
            });
            doc.addPage();
            const exteriorHeaders = [["S.No", "Floor Name", "Area Name", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)"]];
            const tableDatas = summaryDatas.map((item, index) => {
                return [
                    index + 1,
                    item.floorName || "",
                    item.areaName,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: exteriorHeaders,
                body: tableDatas,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 18 },
                    1: { halign: "left", cellWidth: 42 },
                    2: { halign: "left", cellWidth: 42 },
                    3: { halign: "left", cellWidth: 56 },
                    4: { halign: "left", cellWidth: 44 },
                    5: { halign: "center", cellWidth: 40 },
                    6: { halign: "center", cellWidth: 27 },
                },
                didDrawPage: (data) => {
                    header1();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                }
            });
            footer();
            doc.save(filename);
            const pdf = doc.output("blob");
            return pdf;
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const interiorSummaryPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryData = generateSummary();
            const doc = new jsPDF();
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'OC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("INTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${selectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)"]];
            let totalArea = 0;
            let totalQty = 0;
            const tableData = summaryData.map((item, index) => {
                const row = [
                    index + 1,
                    item.paintName,
                    item.paintColor,
                    item.area,
                    item.orderQty,
                ];
                totalArea += parseFloat(item.area) || 0;
                totalQty += parseFloat(item.orderQty) || 0;
                return row;
            });
            tableData.push([
                { content: "", styles: { fontStyle: "bold" } },
                { content: "TOTAL", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: totalArea.toFixed(2), styles: { fontStyle: "bold" } },
                { content: `${totalQty.toFixed(2)}L`, styles: { fontStyle: "bold" } },
            ]);
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
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
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 57 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 40 },
                    4: { halign: "center", cellWidth: 35 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                },
            });
            doc.save(filename);
            return doc.output("blob");
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };
    const interiorSummaryPDFWithImage = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = combinedFloorSummary();
            const doc = new jsPDF();
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'OC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("INTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${selectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)", "Image"]];
            const tableData = summaryDatas.map((item, index) => {
                return [
                    index + 1,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 50 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 34 },
                    4: { halign: "center", cellWidth: 25 },
                    5: { halign: "center", cellWidth: 23 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                    if (data.column.index === 5 && data.cell.section === "body") {
                        const item = summaryDatas[data.row.index];
                        if (item && item.paintColorImage) {
                            const imageBase64 = `data:image/png;base64,${item.paintColorImage}`;
                            const x = data.cell.x + 4;
                            const y = data.cell.y + 2;
                            const width = data.cell.width - 8;
                            const height = data.cell.height - 3;
                            try {
                                doc.addImage(imageBase64, 'PNG', x, y, width, height);
                            } catch (imageError) {
                                console.error("Error adding image to PDF:", imageError);
                            }
                        } else {
                            console.log("No image data available for row:", data.row.index);
                        }
                    }
                }
            });
            doc.save(filename);
            const pdf = doc.output("blob");
            return pdf;
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const exteriorSummaryPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryData = generateExteriorSummary();
            const doc = new jsPDF();
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'OC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("EXTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${selectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)"]];
            let totalArea = 0;
            let totalQty = 0;
            const tableData = summaryData.map((item, index) => {
                const row = [
                    index + 1,
                    item.paintName,
                    item.paintColor,
                    item.area,
                    item.orderQty,
                ];
                totalArea += parseFloat(item.area) || 0;
                totalQty += parseFloat(item.orderQty) || 0;
                return row;
            });
            tableData.push([
                { content: "", styles: { fontStyle: "bold" } },
                { content: "TOTAL", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: totalArea.toFixed(2), styles: { fontStyle: "bold" } },
                { content: `${totalQty.toFixed(2)}L`, styles: { fontStyle: "bold" } },
            ]);
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
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
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 57 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 40 },
                    4: { halign: "center", cellWidth: 35 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                },
            });
            doc.save(filename);
            return doc.output("blob");
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };
    const exteriorSummaryPDFWithImage = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = exteriorGenerateSummaryWithFloorName();
            const doc = new jsPDF();
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'OC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("EXTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${selectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)", "Image"]];
            const tableData = summaryDatas.map((item, index) => {
                return [
                    index + 1,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 50 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 34 },
                    4: { halign: "center", cellWidth: 25 },
                    5: { halign: "center", cellWidth: 23 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                    if (data.column.index === 5 && data.cell.section === "body") {
                        const item = summaryDatas[data.row.index];
                        if (item && item.paintColorImage) {
                            const imageBase64 = `data:image/png;base64,${item.paintColorImage}`;
                            const x = data.cell.x + 4;
                            const y = data.cell.y + 2;
                            const width = data.cell.width - 8;
                            const height = data.cell.height - 3;
                            try {
                                doc.addImage(imageBase64, 'PNG', x, y, width, height);
                            } catch (imageError) {
                                console.error("Error adding image to PDF:", imageError);
                            }
                        } else {
                            console.log("No image data available for row:", data.row.index);
                        }
                    }
                }
            });
            doc.save(filename);
            const pdf = doc.output("blob");
            return pdf;
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const BothInteriorExteriorSummaryPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryData = generateExteriorSummary();
            const interriorSummaryData = generateSummary();
            const doc = new jsPDF();
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'OC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("EXTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${selectedFile.label}.${incrementValue}`;
                const textWidth = doc.getTextWidth(tmsDate);
                const rightMargin = 14;
                const pageWidth = doc.internal.pageSize.width;
                const startX = pageWidth - rightMargin - textWidth;
                doc.text(tmsDate, startX, 27);
                doc.setDrawColor('#BF9853');
                doc.setLineWidth(1);
                doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
            };
            const header1 = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("INTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${selectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)"]];
            let totalArea = 0;
            let totalQty = 0;
            const tableData = interriorSummaryData.map((item, index) => {
                const row = [
                    index + 1,
                    item.paintName,
                    item.paintColor,
                    item.area,
                    item.orderQty,
                ];
                totalArea += parseFloat(item.area) || 0;
                totalQty += parseFloat(item.orderQty) || 0;
                return row;
            });
            tableData.push([
                { content: "", styles: { fontStyle: "bold" } },
                { content: "TOTAL", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: totalArea.toFixed(2), styles: { fontStyle: "bold" } },
                { content: `${totalQty.toFixed(2)}L`, styles: { fontStyle: "bold" } },
            ]);
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
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
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 57 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 40 },
                    4: { halign: "center", cellWidth: 35 },
                },
                didDrawPage: (data) => {
                    header1();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                },
            });
            doc.addPage();
            const exteriorHeaders = [["S.No", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)"]];
            const tableDatas = summaryData.map((item, index) => {
                const row = [
                    index + 1,
                    item.paintName,
                    item.paintColor,
                    item.area,
                    item.orderQty,
                ];
                totalArea += parseFloat(item.area) || 0;
                totalQty += parseFloat(item.orderQty) || 0;
                return row;
            });
            tableDatas.push([
                { content: "", styles: { fontStyle: "bold" } },
                { content: "TOTAL", styles: { fontStyle: "bold" } },
                { content: "", styles: { fontStyle: "bold" } },
                { content: totalArea.toFixed(2), styles: { fontStyle: "bold" } },
                { content: `${totalQty.toFixed(2)}L`, styles: { fontStyle: "bold" } },
            ]);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: exteriorHeaders,
                body: tableDatas,
                startY: tableStartY,
                theme: "grid",
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
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 57 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 40 },
                    4: { halign: "center", cellWidth: 35 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                },
            });
            doc.save(filename);
            return doc.output("blob");
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };
    const BothInteriorExteriorSummaryPDFWithImage = async () => {
        try {
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = combinedFloorSummary();
            const exteriorSummaryData = exteriorGenerateSummaryWithFloorName();
            const doc = new jsPDF();
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'OC';
            const siteName = clientName.label;
            const clientId = clientSNo || 0;
            const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
            const getIncrement = async (fileLabel) => {
                try {
                    const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch increment from the backend");
                    }
                    const increment = await response.json();
                    return increment;
                } catch (error) {
                    console.error('Error fetching increment:', error.message);
                    return 0;
                }
            };
            const postIncrement = async (fileLabel, fileType) => {
                try {
                    await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
                filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
            } else {
                filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
            }
            await postIncrement(fileLabel, fileType);
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("INTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${selectedFile.label}.${incrementValue}`;
                const textWidth = doc.getTextWidth(tmsDate);
                const rightMargin = 14;
                const pageWidth = doc.internal.pageSize.width;
                const startX = pageWidth - rightMargin - textWidth;
                doc.text(tmsDate, startX, 27);
                doc.setDrawColor('#BF9853');
                doc.setLineWidth(1);
                doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
            };
            const header1 = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("EXTERIOR", 14, 43);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${selectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "Paint Name", "Paint Color", "Total Area (sqft)", "Liter (L)", "Image"]];
            const tableData = summaryDatas.map((item, index) => {
                return [
                    index + 1,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            const tableStartY = 44;
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 50 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 34 },
                    4: { halign: "center", cellWidth: 25 },
                    5: { halign: "center", cellWidth: 23 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                    if (data.column.index === 5 && data.cell.section === "body") {
                        const item = summaryDatas[data.row.index];
                        if (item && item.paintColorImage) {
                            const imageBase64 = `data:image/png;base64,${item.paintColorImage}`;
                            const x = data.cell.x + 4;
                            const y = data.cell.y + 2;
                            const width = data.cell.width - 8;
                            const height = data.cell.height - 3;
                            try {
                                doc.addImage(imageBase64, 'PNG', x, y, width, height);
                            } catch (imageError) {
                                console.error("Error adding image to PDF:", imageError);
                            }
                        } else {
                            console.log("No image data available for row:", data.row.index);
                        }
                    }
                }
            });
            doc.addPage();
            const tableDatas = exteriorSummaryData.map((item, index) => {
                return [
                    index + 1,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
                ];
            });
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.autoTable({
                head: headers,
                body: tableDatas,
                startY: tableStartY,
                theme: "grid",
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "left",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    halign: "center",
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 50 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 34 },
                    4: { halign: "center", cellWidth: 25 },
                    5: { halign: "center", cellWidth: 23 },
                },
                didDrawPage: (data) => {
                    header1();
                    footer();
                },
                didDrawCell: (data) => {
                    if (data.section === "head") {
                        const { doc, cell } = data;
                        const startX = cell.x;
                        const startY = cell.y + cell.height;
                        const endX = cell.x + cell.width;
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.6);
                        doc.line(startX, startY, endX, startY);
                    }
                    if (data.column.index === 5 && data.cell.section === "body") {
                        const item = exteriorSummaryData[data.row.index];
                        if (item && item.paintColorImage) {
                            const imageBase64 = `data:image/png;base64,${item.paintColorImage}`;
                            const x = data.cell.x + 4;
                            const y = data.cell.y + 2;
                            const width = data.cell.width - 8;
                            const height = data.cell.height - 3;
                            try {
                                doc.addImage(imageBase64, 'PNG', x, y, width, height);
                            } catch (imageError) {
                                console.error("Error adding image to PDF:", imageError);
                            }
                        } else {
                            console.log("No image data available for row:", data.row.index);
                        }
                    }
                }
            });
            doc.save(filename);
            const pdf = doc.output("blob");
            return pdf;
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const interiorFullPDF = async () => {
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
        const revisionCount = await getRevisionNumber(clientName.label);
        const revisionNumber = `R ${revisionCount}`;
        const selectedDate = formatDateForName(date);
        const fileType = 'EC';
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
        const getIncrement = async (fileLabel) => {
            try {
                const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch increment from the backend");
                }
                const increment = await response.json();
                return increment;
            } catch (error) {
                console.error('Error fetching increment:', error.message);
                return 0;
            }
        };
        const postIncrement = async (fileLabel, fileType) => {
            try {
                await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
            filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
        } else {
            filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
        }
        await postIncrement(fileLabel, fileType);
        const header = (doc) => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("PAINT MEASUREMENT SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.text("INTERIOR", 14, 43);
            doc.setFontSize(10);
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
            doc.setFontSize(10);
            const tmsDate = `PMS EC ${clientId} - ${selectedFile.label}.${incrementValue}`;
            doc.setFont("helvetica", "normal");
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
        let tableData = [];
        let floorCounter = 0;
        let globalAreaCounter = 1;
        if (!floors || floors.length === 0) {
            tableData.push(["No Data", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        } else {
            let previousFloorName = "";
            interiorFloors.forEach((floor, floorIndex) => {
                const currentFloorName = floor.floorName || previousFloorName;
                if (currentFloorName !== previousFloorName || floorIndex === 0) {
                    const floorSerial = String.fromCharCode(65 + floorCounter);
                    tableData.push([
                        floorSerial,
                        `${currentFloorName}`,
                        "",
                        "", "", "", "", "", "", "", "", "", "", "", ""
                    ]);
                    previousFloorName = currentFloorName;
                    floorCounter++;
                }
                floor.tiles.forEach((tile, tileIndex) => {
                    tableData.push([
                        globalAreaCounter,
                        floor.areaName,
                        tile.length || "0",
                        tile.breadth || "0",
                        tile.height || "0",
                        tile.deductionArea || "0",
                        tile.length && (tile.breadth || tile.height)
                            ? ((Number(tile.length) * Number(tile.height) * 2) +
                                (Number(tile.breadth) * Number(tile.height) * 2) -
                                Number(tile.deductionArea || 0)).toFixed(2)
                            : "0",
                        tile.putty || "-",
                        tile.primer || "-",
                        tile.ceilingCoat || "-",
                        tile.waterproof || "-",
                        tile.wastagePercentage || "0%",
                        tile.selectedPaint || "-",
                        tile.selectedPaintColor || "-",
                        tile.length && (tile.breadth || tile.height) && tile.selectedPaint
                            ? (
                                ((Number(tile.length) * Number(tile.height) * 2) +
                                    (Number(tile.breadth) * Number(tile.height) * 2) -
                                    Number(tile.deductionArea || 0)) *
                                (1 + (Number(tile.wastagePercentage) / 100)) /
                                (paintVariants.find((variant) => variant.paintName === tile.selectedPaint)?.paintCoverBySqft || 1)
                            ).toFixed(2) + "L"
                            : "0",
                    ]);
                    globalAreaCounter++;
                });
            });
        }
        const tableStartY = 44;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.autoTable({
            head: [
                [
                    "S.No",
                    "Area Name",
                    "L (Ft)",
                    "B (Ft)",
                    "H (Ft)",
                    "Deduction Area",
                    "Area (Sqft)",
                    "Putty",
                    "Primer",
                    "Ceiling Coat",
                    "Water Proof",
                    "Wastage %",
                    "Paint Name",
                    "Paint Color",
                    "Litter (L)",
                ],
            ],
            body: tableData,
            theme: "grid",
            startY: 44,
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 10,
                halign: "center",
                lineWidth: 0,
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [0, 0, 0],
                halign: "left",
                font: "helvetica",
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 12 },
                1: { halign: "center", cellWidth: 25 },
                2: { halign: "center", cellWidth: 10 },
                3: { halign: "center", cellWidth: 10 },
                4: { halign: "center", cellWidth: 10 },
                5: { halign: "center", cellWidth: 22 },
                6: { halign: "center", cellWidth: 15 },
                7: { halign: "center", cellWidth: 13 },
                8: { halign: "center", cellWidth: 15 },
                9: { halign: "center", cellWidth: 15 },
                10: { halign: "center", cellWidth: 18 },
                11: { halign: "center", cellWidth: 18 },
                12: { halign: "left", cellWidth: 39 },
                13: { halign: "left", cellWidth: 29 },
                14: { halign: "center", cellWidth: 18 },
            },
            margin: { left: 14, right: 14 },
            pageBreak: 'auto',
            didDrawPage: (data) => {
                if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
                    data.settings.startY = -30;
                    const tableStartY = 44;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.01);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                }
                header(doc);
                footer(doc);
            },
            didDrawCell: (data) => {
                if (data.section === "head") {
                    const { doc, cell } = data;
                    const startX = cell.x;
                    const startY = cell.y + cell.height;
                    const endX = cell.x + cell.width;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.6);
                    doc.line(startX, startY, endX, startY);
                }
                if (data.section === 'body' && data.column.index === 0 && data.cell.text[0] === "No Data") {
                    doc.setFontSize(9);
                    doc.setTextColor(0);
                    doc.text("No Data", data.cell.x + 10, data.cell.y + 5);
                }
            },
        });
        doc.save(filename);
        return doc.output("blob");
    };
    const exteriorFullPDF = async () => {
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
        const revisionCount = await getRevisionNumber(clientName.label);
        const revisionNumber = `R ${revisionCount}`;
        const selectedDate = formatDateForName(date);
        const fileType = 'EC';
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
        const getIncrement = async (fileLabel) => {
            try {
                const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch increment from the backend");
                }
                const increment = await response.json();
                return increment;
            } catch (error) {
                console.error('Error fetching increment:', error.message);
                return 0;
            }
        };
        const postIncrement = async (fileLabel, fileType) => {
            try {
                await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
            filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
        } else {
            filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
        }
        await postIncrement(fileLabel, fileType);
        const header = (doc) => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("PAINT MEASUREMENT SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.text("EXTERIOR", 14, 43);
            doc.setFontSize(10);
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
            doc.setFontSize(10);
            const tmsDate = `PMS EC ${clientId} - ${selectedFile.label}.${incrementValue}`;
            doc.setFont("helvetica", "normal");
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
        let tableData = [];
        let floorCounter = 0;
        let globalAreaCounter = 1;
        if (!floors || floors.length === 0) {
            tableData.push(["No Data", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        } else {
            let previousFloorName = "";
            exteriorFloors.forEach((floor, floorIndex) => {
                const currentFloorName = floor.floorName || previousFloorName;
                if (currentFloorName !== previousFloorName || floorIndex === 0) {
                    const floorSerial = String.fromCharCode(65 + floorCounter);
                    tableData.push([
                        floorSerial,
                        `${currentFloorName}`,
                        "",
                        "", "", "", "", "", "", "", "", "", "", "", ""
                    ]);
                    previousFloorName = currentFloorName;
                    floorCounter++;
                }
                floor.tiles.forEach((tile, tileIndex) => {
                    tableData.push([
                        globalAreaCounter,
                        floor.areaName,
                        tile.length || "0",
                        tile.breadth || "0",
                        tile.height || "0",
                        tile.deductionArea || "0",
                        tile.length && (tile.breadth || tile.height)
                            ? ((Number(tile.length) * Number(tile.height) * 2) +
                                (Number(tile.breadth) * Number(tile.height) * 2) -
                                Number(tile.deductionArea || 0)).toFixed(2)
                            : "0",
                        tile.putty || "-",
                        tile.primer || "-",
                        tile.ceilingCoat || "-",
                        tile.waterproof || "-",
                        tile.wastagePercentage || "0%",
                        tile.selectedPaint || "-",
                        tile.selectedPaintColor || "-",
                        tile.length && (tile.breadth || tile.height) && tile.selectedPaint
                            ? (
                                ((Number(tile.length) * Number(tile.height) * 2) +
                                    (Number(tile.breadth) * Number(tile.height) * 2) -
                                    Number(tile.deductionArea || 0)) *
                                (1 + (Number(tile.wastagePercentage) / 100)) /
                                (paintVariants.find((variant) => variant.paintName === tile.selectedPaint)?.paintCoverBySqft || 1)
                            ).toFixed(2) + "L"
                            : "0",
                    ]);
                    globalAreaCounter++;
                });
            });
        }
        const tableStartY = 44;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.autoTable({
            head: [
                [
                    "S.No",
                    "Area Name",
                    "L (Ft)",
                    "B (Ft)",
                    "H (Ft)",
                    "Deduction Area",
                    "Area (Sqft)",
                    "Putty",
                    "Primer",
                    "Ceiling Coat",
                    "Water Proof",
                    "Wastage %",
                    "Paint Name",
                    "Paint Color",
                    "Litter (L)",
                ],
            ],
            body: tableData,
            theme: "grid",
            startY: 44,
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 10,
                halign: "center",
                lineWidth: 0,
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [0, 0, 0],
                halign: "left",
                font: "helvetica",
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 12 },
                1: { halign: "center", cellWidth: 25 },
                2: { halign: "center", cellWidth: 10 },
                3: { halign: "center", cellWidth: 10 },
                4: { halign: "center", cellWidth: 10 },
                5: { halign: "center", cellWidth: 22 },
                6: { halign: "center", cellWidth: 15 },
                7: { halign: "center", cellWidth: 13 },
                8: { halign: "center", cellWidth: 15 },
                9: { halign: "center", cellWidth: 15 },
                10: { halign: "center", cellWidth: 18 },
                11: { halign: "center", cellWidth: 18 },
                12: { halign: "left", cellWidth: 39 },
                13: { halign: "left", cellWidth: 29 },
                14: { halign: "center", cellWidth: 18 },
            },
            margin: { left: 14, right: 14 },
            pageBreak: 'auto',
            didDrawPage: (data) => {
                if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
                    data.settings.startY = -30;
                    const tableStartY = 44;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.01);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                }
                header(doc);
                footer(doc);
            },
            didDrawCell: (data) => {
                if (data.section === "head") {
                    const { doc, cell } = data;
                    const startX = cell.x;
                    const startY = cell.y + cell.height;
                    const endX = cell.x + cell.width;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.6);
                    doc.line(startX, startY, endX, startY);
                }
                if (data.section === 'body' && data.column.index === 0 && data.cell.text[0] === "No Data") {
                    doc.setFontSize(9);
                    doc.setTextColor(0);
                    doc.text("No Data", data.cell.x + 10, data.cell.y + 5);
                }
            },
        });
        doc.save(filename);
        return doc.output("blob");
    };
    const BothInteriorExteriorFullPDF = async () => {
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
        const revisionCount = await getRevisionNumber(clientName.label);
        const revisionNumber = `R ${revisionCount}`;
        const fileType = 'EC';
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
        const getIncrement = async (fileLabel) => {
            try {
                const response = await fetch(`https://backendaab.in/aabuilderDash/api/paint/pdf/increment?fileLabel=${encodeURIComponent(fileLabel)}&fileType=${encodeURIComponent(fileType)}&clientId=${encodeURIComponent(clientId)}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch increment from the backend");
                }
                const increment = await response.json();
                return increment;
            } catch (error) {
                console.error('Error fetching increment:', error.message);
                return 0;
            }
        };
        const postIncrement = async (fileLabel, fileType) => {
            try {
                await fetch('https://backendaab.in/aabuilderDash/api/paint/pdf/updateIncrement', {
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
            filename = `PMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
        } else {
            filename = `PMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
        }
        await postIncrement(fileLabel, fileType);
        const header = (doc) => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("PAINT MEASUREMENT SHEET", 14, 15);
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
            doc.setFontSize(8);
            doc.text("INTERIOR", doc.internal.pageSize.width - 27.5, 41);
            doc.setFontSize(10);
            const tmsDate = `PMS EC ${clientId} - ${selectedFile.label}.${incrementValue}`;
            doc.setFont("helvetica", "normal");
            const textWidth = doc.getTextWidth(tmsDate);
            const rightMargin = 14;
            const pageWidth = doc.internal.pageSize.width;
            const startX = pageWidth - rightMargin - textWidth;
            doc.text(tmsDate, startX, 27);
            doc.setDrawColor('#BF9853');
            doc.setLineWidth(1);
            doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
        };
        const header1 = (doc) => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("PAINT MEASUREMENT SHEET", 14, 15);
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
            doc.setFontSize(8);
            doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
            doc.setFontSize(10);
            const tmsDate = `PMS EC ${clientId} - ${selectedFile.label}.${incrementValue}`;
            doc.setFont("helvetica", "normal");
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
        let tableData = [];
        if (!floors || floors.length === 0) {
            tableData.push(["No Data", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        } else {
            let previousFloorName = "";
            let floorCounter = 0;
            let globalAreaCounter = 1;
            interiorFloors.forEach((floor, floorIndex) => {
                const currentFloorName = floor.floorName || previousFloorName;
                if (currentFloorName !== previousFloorName || floorIndex === 0) {
                    globalAreaCounter = 1;
                    const floorSerial = String.fromCharCode(65 + floorCounter);
                    tableData.push([
                        { content: floorSerial, styles: { fontStyle: "bold" } },
                        { content: currentFloorName.toUpperCase(), styles: { fontStyle: "bold" } },
                        "",
                        "", "", "", "", "", "", "", "", "", "", "", ""
                    ]);
                    previousFloorName = currentFloorName;
                    floorCounter++;
                }
                floor.tiles.forEach((tile, tileIndex) => {
                    tableData.push([
                        globalAreaCounter,
                        floor.areaName,
                        tile.length || "0",
                        tile.breadth || "0",
                        tile.height || "0",
                        tile.deductionArea || "0",
                        tile.length && (tile.breadth || tile.height)
                            ? ((Number(tile.length) * Number(tile.height) * 2) +
                                (Number(tile.breadth) * Number(tile.height) * 2) -
                                Number(tile.deductionArea || 0)).toFixed(2)
                            : "0",
                        tile.putty || "-",
                        tile.primer || "-",
                        tile.ceilingCoat || "-",
                        tile.waterproof || "-",
                        tile.wastagePercentage || "0%",
                        tile.selectedPaint || "-",
                        tile.selectedPaintColor || "-",
                        tile.length && (tile.breadth || tile.height) && tile.selectedPaint
                            ? (
                                ((Number(tile.length) * Number(tile.height) * 2) +
                                    (Number(tile.breadth) * Number(tile.height) * 2) -
                                    Number(tile.deductionArea || 0)) *
                                (1 + (Number(tile.wastagePercentage) / 100)) /
                                (paintVariants.find((variant) => variant.paintName === tile.selectedPaint)?.paintCoverBySqft || 1)
                            ).toFixed(2) + "L"
                            : "0",
                    ]);
                    globalAreaCounter++;
                });
            });
        }
        const tableStartY = 44;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.autoTable({
            head: [
                [
                    "S.No",
                    "Area Name",
                    "L (Ft)",
                    "B (Ft)",
                    "H (Ft)",
                    "Deduction Area",
                    "Area (Sqft)",
                    "Putty",
                    "Primer",
                    "Ceiling Coat",
                    "Water Proof",
                    "Wastage %",
                    "Paint Name",
                    "Paint Color",
                    "Litter (L)",
                ],
            ],
            body: tableData,
            theme: "grid",
            startY: 44,
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 10,
                halign: "center",
                lineWidth: 0,
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [0, 0, 0],
                halign: "left",
                font: "helvetica",
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 12 },
                1: { halign: "left", cellWidth: 30 },
                2: { halign: "center", cellWidth: 10 },
                3: { halign: "center", cellWidth: 10 },
                4: { halign: "center", cellWidth: 10 },
                5: { halign: "center", cellWidth: 22 },
                6: { halign: "center", cellWidth: 15 },
                7: { halign: "center", cellWidth: 13 },
                8: { halign: "center", cellWidth: 15 },
                9: { halign: "center", cellWidth: 15 },
                10: { halign: "center", cellWidth: 16 },
                11: { halign: "center", cellWidth: 18 },
                12: { halign: "left", cellWidth: 36 },
                13: { halign: "left", cellWidth: 29 },
                14: { halign: "center", cellWidth: 18 },
            },
            margin: { left: 14, right: 14 },
            pageBreak: 'auto',
            didDrawPage: (data) => {
                if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
                    data.settings.startY = -30;
                    const tableStartY = 44;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.01);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                }
                header(doc);
                footer(doc);
            },
            didDrawCell: (data) => {
                if (data.section === "head") {
                    const { doc, cell } = data;
                    const startX = cell.x;
                    const startY = cell.y + cell.height;
                    const endX = cell.x + cell.width;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.6);
                    doc.line(startX, startY, endX, startY);
                }
                if (data.section === 'body' && data.column.index === 0 && data.cell.text[0] === "No Data") {
                    doc.setFontSize(9);
                    doc.setTextColor(0);
                    doc.text("No Data", data.cell.x + 10, data.cell.y + 5);
                }
            },
        });
        doc.addPage();
        let tableDatas = [];
        if (!floors || floors.length === 0) {
            tableData.push(["No Data", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        } else {
            let previousFloorName = "";
            let floorCounters = 0;
            let globalAreaCounters = 1;
            exteriorFloors.forEach((floor, floorIndex) => {
                const currentFloorName = floor.floorName || previousFloorName;
                if (currentFloorName !== previousFloorName || floorIndex === 0) {
                    globalAreaCounters = 1;
                    const floorSerial = String.fromCharCode(65 + floorCounters);
                    tableDatas.push([
                        { content: floorSerial, styles: { fontStyle: "bold" } },
                        { content: currentFloorName.toUpperCase(), styles: { fontStyle: "bold" } },
                        "",
                        "", "", "", "", "", "", "", "", "", "", "", ""
                    ]);
                    previousFloorName = currentFloorName;
                    floorCounters++;
                }
                floor.tiles.forEach((tile, tileIndex) => {
                    tableDatas.push([
                        globalAreaCounters,
                        floor.areaName,
                        tile.length || "0",
                        tile.breadth || "0",
                        tile.height || "0",
                        tile.deductionArea || "0",
                        tile.length && (tile.breadth || tile.height)
                            ? ((Number(tile.length) * Number(tile.height) * 2) +
                                (Number(tile.breadth) * Number(tile.height) * 2) -
                                Number(tile.deductionArea || 0)).toFixed(2)
                            : "0",
                        tile.putty || "-",
                        tile.primer || "-",
                        tile.ceilingCoat || "-",
                        tile.waterproof || "-",
                        tile.wastagePercentage || "0%",
                        tile.selectedPaint || "-",
                        tile.selectedPaintColor || "-",
                        tile.length && (tile.breadth || tile.height) && tile.selectedPaint
                            ? (
                                ((Number(tile.length) * Number(tile.height) * 2) +
                                    (Number(tile.breadth) * Number(tile.height) * 2) -
                                    Number(tile.deductionArea || 0)) *
                                (1 + (Number(tile.wastagePercentage) / 100)) /
                                (paintVariants.find((variant) => variant.paintName === tile.selectedPaint)?.paintCoverBySqft || 1)
                            ).toFixed(2) + "L"
                            : "0",
                    ]);
                    globalAreaCounters++;
                });
            });
        }
        doc.autoTable({
            head: [
                [
                    "S.No",
                    "Area Name",
                    "L (Ft)",
                    "B (Ft)",
                    "H (Ft)",
                    "Deduction Area",
                    "Area (Sqft)",
                    "Putty",
                    "Primer",
                    "Ceiling Coat",
                    "Water Proof",
                    "Wastage %",
                    "Paint Name",
                    "Paint Color",
                    "Litter (L)",
                ],
            ],
            body: tableDatas,
            theme: "grid",
            startY: 44,
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 10,
                halign: "center",
                lineWidth: 0,
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [0, 0, 0],
                halign: "left",
                font: "helvetica",
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 12 },
                1: { halign: "left", cellWidth: 30 },
                2: { halign: "center", cellWidth: 10 },
                3: { halign: "center", cellWidth: 10 },
                4: { halign: "center", cellWidth: 10 },
                5: { halign: "center", cellWidth: 22 },
                6: { halign: "center", cellWidth: 15 },
                7: { halign: "center", cellWidth: 13 },
                8: { halign: "center", cellWidth: 15 },
                9: { halign: "center", cellWidth: 15 },
                10: { halign: "center", cellWidth: 16 },
                11: { halign: "center", cellWidth: 18 },
                12: { halign: "left", cellWidth: 36 },
                13: { halign: "left", cellWidth: 29 },
                14: { halign: "center", cellWidth: 18 },
            },
            margin: { left: 14, right: 14 },
            pageBreak: 'auto',
            didDrawPage: (data) => {
                if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
                    data.settings.startY = -30;
                    const tableStartY = 44;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.01);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                }
                header1(doc);
                footer(doc);
            },
            didDrawCell: (data) => {
                if (data.section === "head") {
                    const { doc, cell } = data;
                    const startX = cell.x;
                    const startY = cell.y + cell.height;
                    const endX = cell.x + cell.width;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.6);
                    doc.line(startX, startY, endX, startY);
                }
                if (data.section === 'body' && data.column.index === 0 && data.cell.text[0] === "No Data") {
                    doc.setFontSize(9);
                    doc.setTextColor(0);
                    doc.text("No Data", data.cell.x + 10, data.cell.y + 5);
                }
            },
        });
        doc.save(filename);
        return doc.output("blob");
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
    const handleSelectChange = (floorIndex, tileIndex, field, value) => {
        const updatedFloors = [...exteriorFloors];
        updatedFloors[floorIndex].tiles[tileIndex][field] = value;
        setExteriorFloors(updatedFloors);
        const updatedSelectedOptions = [...selectedOptions];
        updatedSelectedOptions[floorIndex] = updatedSelectedOptions[floorIndex] || [];
        updatedSelectedOptions[floorIndex][tileIndex] = {
            ...updatedSelectedOptions[floorIndex][tileIndex],
            [field]: value
        };
        setSelectedOptions(updatedSelectedOptions);
    };
    const savePaintCalculation = async () => {
        setIsPopupOpen(true);
        setIsSubmitting(true);
        let previousInteriorFloorName = "";
        let previousExteriorFloorName = "";
        const formattedData = interiorFloors.map((floor) => {
            const floorName = floor.floorName || previousInteriorFloorName;
            previousInteriorFloorName = floorName;
            return {
                floorName,
                areaName: floor.areaName,
                paintTiles: floor.tiles.map((tile) => {
                    const length = parseFloat(tile.length || 0);
                    const breadth = parseFloat(tile.breadth || 0);
                    const height = parseFloat(tile.height || 0);
                    const deductionArea = parseFloat(tile.deductionArea || 0);
                    const wastagePercentage = parseFloat(tile.wastagePercentage || 0);
                    const wastageFactor = 1 + wastagePercentage / 100;
                    const area = ((length * height * 2) + (breadth * height * 2) - deductionArea).toFixed(2);
                    const selectedPaint = paintVariants.find(
                        (variant) => variant.paintName === tile.selectedPaint
                    );
                    const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                    const orderQty = ((area * wastageFactor) / paintCoverBySqft).toFixed(2);
                    return {
                        type: "Interior",
                        length: tile.length || "0",
                        breadth: tile.breadth || "0",
                        height: tile.height || "0",
                        deductionArea: tile.deductionArea || "0",
                        totalOrderedTile: area,
                        selectedPutty: tile.putty || "No",
                        selectedPrimer: tile.primer || "No",
                        ceilingCoat: tile.ceilingCoat || "No",
                        selectedWaterProof: tile.waterproof || "No",
                        wastagePercentage: tile.wastagePercentage || "0",
                        selectedPaint: tile.selectedPaint || "None",
                        selectedColorCode: tile.selectedPaintColor || "None",
                        orderQty,
                    };
                }),
            };
        });
        const selectedData = exteriorFloors.map((floor, floorIndex) => {
            const floorName = floor.floorName || previousExteriorFloorName;
            previousExteriorFloorName = floorName;
            return {
                floorName,
                areaName: floor.areaName,
                paintTiles: floor.tiles.map((tile, tileIndex) => {
                    const selectedTileOptions = selectedOptions[floorIndex]?.[tileIndex] || {};
                    const length = Number(tile.length);
                    const breadth = Number(tile.breadth);
                    const height = Number(tile.height);
                    const deductionArea = Number(tile.deductionArea || 0);
                    const totalOrderedTile = length && breadth && height
                        ? ((length * height * 2) + (breadth * height * 2) - deductionArea).toFixed(2)
                        : "0";
                    const wastagePercentage = Number(tile.wastagePercentage || 0);
                    const orderQty = (length && breadth && height)
                        ? ((totalOrderedTile * (1 + wastagePercentage / 100))).toFixed(2)
                        : "0";
                    const selectedPaints = paintVariants.find(
                        (variant) => variant.paintName === tile.selectedPaint
                    );
                    const paintCoverBySqft = selectedPaints?.paintCoverBySqft || 1;
                    const orderQtys = (orderQty / paintCoverBySqft).toFixed(2);
                    return {
                        type: "Exterior",
                        length: tile.length || "0",
                        breadth: tile.breadth || "0",
                        height: tile.height || "0",
                        deductionArea: tile.deductionArea || "0",
                        totalOrderedTile: totalOrderedTile || "0",
                        wastagePercentage: tile.wastagePercentage || "0",
                        selectedPaint: tile.selectedPaint || "",
                        selectedPrimer: selectedTileOptions.Primer || "No",
                        selectedPutty: selectedTileOptions.Putty || "No",
                        ceilingCoat: "No",
                        selectedWaterProof: selectedTileOptions['Water Proof'] || "No",
                        selectedColorCode: tile.selectedPaintColor || "",
                        orderQty: orderQtys || "0",
                    };
                }),
            };
        });
        const combinedData = {
            formattedData,
            selectedData,
        };
        const formatDate = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        };
        if (!combinedData || !combinedData.formattedData || !combinedData.selectedData) {
            console.error("Data is missing. Cannot save paint calculation.");
            return;
        }
        try {
            const clientResponse = await fetch("https://backendaab.in/aabuilderDash/api/paint_calculation/all/paints");
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
            const clientId = clientSNo || 0;
            const revisionCount = await getRevisionNumber(clientName.label);
            const revisionNumber = `R ${Math.max(revisionCount)}`;
            const fileName = `${formatDate(date)} - R ${clientCount}`;
            const ceilingCoats = tableData.map((row, index) => ({
                clientName: clientName.label,
                fileName,
                date,
                floorName: row.floorName,
                paintVariant: selectedPaintNames[index],
                paintColor: selectedPaintColors[index],
                area: row.totalOrderedTile,
                wastagePercentage: wastageValues[index] || '0',
                orderQty: calculateOrderQty(row, index),
            }));
            const othersTableData = tableDatas
                .map((row) => {
                    let area = 0;
                    let orderQty = 0;
                    const paintItem = paintItems.find((item) => item.paintItem === row.paintType);
                    if (!paintItem) {
                        return null;
                    }
                    const formula = paintItem.formulas || "";
                    if (formula) {
                        try {
                            const lengths = row.lengths || 0;
                            const breadths = row.breaths || 0;
                            const height = row.height || 0;
                            const deduction = row.deduction || 0;
                            const wastage = row.wastage || 0;
                            let formulaWithValues = formula.replace(/x/g, '*');
                            formulaWithValues = formulaWithValues
                                .replace(/L/g, lengths)
                                .replace(/B/g, breadths)
                                .replace(/H/g, height);
                            area = eval(formulaWithValues) - deduction;
                            area = area.toFixed(2);
                            if (wastage) {
                                orderQty = (parseFloat(area) + (parseFloat(area) * wastage / 100)).toFixed(2);
                            } else {
                                orderQty = area;
                            }
                            const selectedPaint = paintVariants.find((variant) => variant.paintName === row.productVariant);
                            const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                            orderQty = (parseFloat(orderQty) / paintCoverBySqft).toFixed(2);
                        } catch (error) {
                            console.error("Error calculating area:", error);
                            area = "Error";
                            orderQty = "Error";
                        }
                    }
                    return {
                        clientName: clientName.label,
                        fileName,
                        date,
                        paintType: row.paintType,
                        lengths: row.lengths,
                        breaths: row.breaths,
                        height: row.height,
                        deductionArea: row.deduction || 0,
                        area: area,
                        wastage: row.wastage || 0,
                        paintName: row.productVariant,
                        paintColor: row.colorCode, 
                        orderQty: orderQty, 
                    };
                })
                .filter((row) => row !== null);

            const responses = await fetch('https://backendaab.in/aabuilderDash/api/ceiling_coat/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ceilingCoats),
            });
            if (!responses.ok) {
                throw new Error("Failed to upload CeilingCoat: ");
            }
            const sending = await fetch("https://backendaab.in/aabuilderDash/api/paintData/extra", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(othersTableData),
            });
            if (sending.ok) {
                console.log("Data sent successfully");
            } else {
                console.error("Failed to send data");
                alert("Error saving paint calculation. Please try again.");
            }
            const payload = {
                clientName: clientName.label,
                clientSno: clientSNo,
                fileName: fileName,
                date: date,
                ENo: eno,
                paintCalculations: combinedData.formattedData.concat(combinedData.selectedData),
            };
            const StockingPdf = await generateInteriorFloorSummaryPDF();
            const fullPdf = await generateFullPDF();
            const customerCopyPdf = await generateInteriorCustomerCopyPDF();
            const summaryPdf = await generateSummaryPDF();
            const uploadPdf = async (pdf, name) => {
                const singleFormData = new FormData();
                singleFormData.append("files", pdf, name);
                const pdfUploadResponse = await fetch(`https://backendaab.in/aabuilderDash/googleUploader/paintPdfs`, {
                    method: "POST",
                    body: singleFormData,
                });
                if (!pdfUploadResponse.ok) {
                    throw new Error("Failed to upload PDF: " + name);
                }
            };
            await uploadPdf(fullPdf, `PMS EC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
            await uploadPdf(summaryPdf, `PMS OC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
            await uploadPdf(StockingPdf, `PMS SC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
            await uploadPdf(customerCopyPdf, `PMS CC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`);
            const response = await fetch("https://backendaab.in/aabuilderDash/api/paint_calculation/save/paints", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                setEno(eno + 1);
                setIsPopupOpen(false);
                alert("Paint calculation saved successfully!");
                window.location.reload();
            } else {
                alert("Error saving paint calculation. Please try again.");
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
        }
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
    const handleInteriorTileChange = (floorIndex, tileIndex, event) => {
        const { name, value } = event.target;
        const updatedFloors = [...interiorFloors];
        updatedFloors[floorIndex].tiles[tileIndex][name] = value;

        // If updating length or breadth, update the state
        if (name === "length" || name === "breadth") {
            setInteriorTableDimensions({
                ...interiorTableDimensions,
                [name]: value
            });
        }

        setInteriorFloors(updatedFloors);
    };
    const handleExteriorTileChange = (floorIndex, tileIndex, e) => {
        const { name, value } = e.target;
        setExteriorFloors((prevFloors) =>
            prevFloors.map((floor, idx) =>
                idx === floorIndex
                    ? {
                        ...floor,
                        tiles: floor.tiles.map((tile, i) =>
                            i === tileIndex ? { ...tile, [name]: value } : tile
                        ),
                    }
                    : floor
            )
        );
    };
    const addAreaRowInterior = (floorIndex) => {
        const updatedInteriorFloors = [...interiorFloors];
        updatedInteriorFloors.splice(floorIndex + 1, 0, {
            floorName: null,
            areaName: "",
            tiles: [
                {
                    length: "",
                    breadth: "",
                    height: "",
                    deductionArea: "",
                    wastagePercentage: "0",
                },
            ],
        });
        setInteriorFloors(updatedInteriorFloors);
    };
    const addFloorRowInterior = () => {
        setInteriorFloors((prevFloors) => [
            ...prevFloors,
            {
                floorName: "Ground Floor",
                areaName: "",
                tiles: [
                    { length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" },
                ],
            },
        ]);
    };
    const addAreaRowExterior = (floorIndex) => {
        const updatedExteriorFloors = [...exteriorFloors];
        updatedExteriorFloors.splice(floorIndex + 1, 0, {
            floorName: null,
            areaName: "",
            tiles: [
                {
                    length: "",
                    breadth: "",
                    height: "",
                    deductionArea: "",
                    wastagePercentage: "0",
                },
            ],
        });
        setExteriorFloors(updatedExteriorFloors);
    };
    const addFloorRowExterior = () => {
        setExteriorFloors((prevFloors) => [
            ...prevFloors,
            {
                floorName: "Ground Floor",
                areaName: "",
                tiles: [
                    { length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" },
                ],
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
    const deleteAreaRow = (floorIndex, type) => {
        if (type === "interior") {
            const updatedInteriorFloors = [...interiorFloors];
            updatedInteriorFloors.splice(floorIndex, 1);
            setInteriorFloors(updatedInteriorFloors);
        } else if (type === "exterior") {
            const updatedExteriorFloors = [...exteriorFloors];
            updatedExteriorFloors.splice(floorIndex, 1);
            setExteriorFloors(updatedExteriorFloors);
        }
    };
    const handleFileChange = (selected) => {
        if (!selected) {
            setSelectedFile(null);
            setSelectedFiles(null);
            setSelectedClientData({ calculations: [] });
            setInteriorFloors([]);
            setExteriorFloors([]);
            return;
        }
        const selectedClientTileData = fullDatas.find((calculation) => calculation.id === selected.value);
        setSelectedFiles(selected);
        const selectedClientData = fullData.find((calculation) => calculation.id === selected.value);
        setSelectedFile(selected);
        if (selectedClientTileData) {
            const seenFloors = new Set();
            const tileData = selectedClientTileData.calculations.map((calculation) => {
                const floorName = calculation.floorName || "No floor name available";
                const areaName = calculation.areaName || "No area name available";
                const floorVisible = !seenFloors.has(floorName);
                if (floorVisible) {
                    seenFloors.add(floorName);
                }
                return {
                    floorName: floorVisible ? floorName : null,
                    areaName: areaName,
                    tiles: calculation.tiles?.map((tile) => ({
                        length: tile.length || "",
                        breadth: tile.breadth || "",
                        height: tile.height || "",
                    })) || [],
                };
            });
            setInteriorFloors(tileData);
        }
        if (selectedClientData) {
            setSelectedClientData(selectedClientData);
            const seenFloors = new Set();
            const allData = selectedClientData.paintCalculations
                .filter((calculation) => calculation.paintTiles?.some((tile) => tile.type === "Interior"))
                .map((calculation) => {
                    const floorName = calculation.floorName || 'No floor name available';
                    const areaName = calculation.areaName || 'No area name available';
                    const floorVisible = !seenFloors.has(floorName);
                    if (floorVisible) {
                        seenFloors.add(floorName);
                    }
                    return {
                        floorName: floorVisible ? floorName : null,
                        areaName: areaName,
                        tiles: calculation.paintTiles?.map((tile) => ({
                            length: tile.length || "",
                            breadth: tile.breadth || "",
                            height: tile.height || "",
                            deductionArea: tile.deductionArea || 0,
                            wastagePercentage: tile.wastagePercentage || 0,
                            selectedPaint: tile.selectedPaint || "",
                            selectedPaintColor: tile.selectedColorCode || "",
                            putty: tile.selectedPutty || "No",
                            primer: tile.selectedPrimer || "No",
                            ceilingCoat: tile.ceilingCoat || "No",
                            waterproof: tile.selectedWaterProof || "No",
                        })) || [],
                    };
                });
            setInteriorFloors(allData);
            const exteriorData = selectedClientData.paintCalculations
                .filter((calculation) => calculation.paintTiles?.some((tile) => tile.type === "Exterior"))
                .map((calculation) => ({
                    floorName: calculation.floorName || "",
                    areaName: calculation.areaName || "",
                    tiles: calculation.paintTiles?.map((tile) => ({
                        length: tile.length || "",
                        breadth: tile.breadth || "",
                        height: tile.height || "",
                        deductionArea: tile.deductionArea || 0,
                        wastagePercentage: tile.wastagePercentage || 0,
                        selectedPaint: tile.selectedPaint || "",
                        selectedPaintColor: tile.selectedColorCode || "",
                        putty: tile.selectedPutty || "No",
                        primer: tile.selectedPrimer || "No",
                        ceilingCoat: tile.ceilingCoat || "No",
                        waterproof: tile.selectedWaterProof || "No",
                    })) || [],
                }));
            setExteriorFloors(exteriorData);
        }
    };
    const handleFileNameSelect = (e) => {
        e.preventDefault();
        if (!selectedFiles) {
            alert("Please select a file before submitting.");
            return;
        }
        handleFileChanges(selectedFiles);
        closeImportPopup();
    };
    useEffect(() => {
        const fetchCeilingCoats = async () => {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/ceiling_coat/getAll');
            const data = await response.json();
            setCeilingCoatData(data);
        };
        fetchCeilingCoats();
    }, []);
    useEffect(() => {
        fetch('https://backendaab.in/aabuilderDash/api/paintData/allExtra')
            .then(response => response.json())
            .then(data => {
                if (clientName && selectedFile) {
                    const filteredData = data.filter(item => item.clientName === clientName.label && item.fileName === selectedFile.label);
                    console.log('Filtered data:', filteredData);
                    const filteredTableData = filteredData.map(item => ({
                        paintType: item.paintType,
                        lengths: item.lengths,
                        breaths: item.breaths,
                        height: item.height,
                        deduction: item.deductionArea,
                        area: item.area,
                        wastage: item.wastage,
                        productVariant: item.paintName,
                        colorCode: item.paintColor,
                        orderQty: item.orderQty,
                    }));
                    setTableDatas(filteredTableData);
                    console.log("Updated table data:", filteredTableData);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [clientName, selectedFile]);

    useEffect(() => {
        if (clientName && selectedFile) {
            const filteredData = ceilingCoatData.filter(coat =>
                coat.clientName === clientName.label && coat.fileName === selectedFile.label
            );
            const filteredTableData = filteredData.map(coat => ({
                floorName: coat.floorName,
                paintVariant: coat.paintVariant,
                paintColor: coat.paintColor,
                totalOrderedTile: coat.area,
                wastagePercentage: coat.wastagePercentage,
                orderQty: coat.orderQty
            }));
            setTableData(filteredTableData);
            const initialPaintNames = filteredTableData.map(row => row.paintVariant || '');
            const initialPaintColors = filteredTableData.map(row => row.paintColor || '');
            const initialWastageValues = filteredTableData.map(row => row.wastagePercentage || 0);
            setSelectedPaintNames(initialPaintNames);
            setSelectedPaintColors(initialPaintColors);
            setWastageValues(initialWastageValues);
        }
    }, [clientName, selectedFile, ceilingCoatData]);

    const handleFileChanges = (selected) => {
        if (!selected) {
            setSelectedFiles(null);
            setSelectedClientDatas({ calculations: [] });
            setFloors([]);
            return;
        }
        const selectedClientDatas = fullDatas.find(calculation => calculation.id === selected.value);
        setSelectedFiles(selected);
        if (selectedClientDatas) {
            setSelectedClientDatas(selectedClientDatas);
            const seenFloors = new Set();
            const newFloorsData = selectedClientDatas.calculations.map(calc => {
                const floorName = calc.floorName || 'No floor name available';
                const areaName = calc.areaName || 'No area name available';
                const floorVisible = !seenFloors.has(floorName);
                seenFloors.add(floorName);
                const filteredTiles = calc.tiles.filter(tile => tile.type === "Floor Tile");
                return {
                    floorName: floorVisible ? floorName : null,
                    areaName: areaName,
                    tiles: filteredTiles.map(tile => {
                        return {
                            type: tile.type,
                            length: tile.length,
                            breadth: tile.breadth,
                            height: tile.height,
                            deductionArea: tile.deductionArea,
                            skirtingArea: tile.skirtingArea,
                            areaTile: tile.areaInSqft || '',
                            quantityBox: tile.qtyPerBox || '',
                            tileName: tile.tileName,
                            tileSize: tile.tileSize,
                            size: tile.size,
                            actualQuantity: tile.actualQuantity,
                            noOfBoxes: tile.noOfBoxes,
                            wastagePercentage: tile.wastagePercentage,
                            isUserChanged: tile.isUserChanged || false,
                            directValue: tile.directValue || 0,
                        };
                    }),
                };
            });
            setInteriorFloors(newFloorsData);
        } else {
            setSelectedClientDatas({ calculations: [] });
            setInteriorFloors([]);
        }
    };
    const generateSummary = () => {
        const summaryMap = {};
        interiorFloors.forEach(floor => {
            floor.tiles.forEach(tile => {
                const length = Number(tile.length);
                const breadth = Number(tile.breadth);
                const height = Number(tile.height);
                const deductionArea = Number(tile.deductionArea || 0);
                const totalOrderedTile = ((length * height) * 2) + ((breadth * height) * 2) - deductionArea;
                const selectedPaint = paintVariants.find(variant => variant.paintName === tile.selectedPaint);
                const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                const wastagePercentage = Number(tile.wastagePercentage);
                const wastage = wastagePercentage / 100;
                const orderQty = totalOrderedTile * (1 + wastage) / paintCoverBySqft;
                const paintKey = `${tile.selectedPaint}-${tile.selectedPaintColor}`;
                if (summaryMap[paintKey]) {
                    summaryMap[paintKey].area = (Number(summaryMap[paintKey].area) + totalOrderedTile).toFixed(2);
                    summaryMap[paintKey].orderQty = (Number(summaryMap[paintKey].orderQty) + orderQty).toFixed(2);
                } else {
                    summaryMap[paintKey] = {
                        paintName: tile.selectedPaint || "No Paint",
                        paintColor: tile.selectedPaintColor || "No Color",
                        area: totalOrderedTile.toFixed(2),
                        orderQty: orderQty.toFixed(2),
                    };
                }
            });
        });
        const result = Object.values(summaryMap).map(item => ({
            ...item,
            orderQty: item.orderQty
        }));
        return result;
    };
    const calculateFloorWiseSummary = () => {
        const floorSummary = {};
        tableData.forEach((row, index) => {
            const key = `${row.floorName}-${selectedPaintNames[index]}-${selectedPaintColors[index]}`;
            if (!floorSummary[key]) {
                floorSummary[key] = {
                    floorName: row.floorName,
                    paintName: selectedPaintNames[index] || "N/A",
                    paintColor: selectedPaintColors[index] || "N/A",
                    area: 0,
                    orderQty: 0,
                };
            }
            floorSummary[key].area += row.totalOrderedTile;
            floorSummary[key].orderQty += calculateOrderQty(row, index);
        });

        return Object.values(floorSummary);
    };

    const combinedSummary = () => {
        const combinedMap = {};
        const paintSummary = generateSummary();
        paintSummary.forEach(paint => {
            const paintKey = `${paint.paintName}-${paint.paintColor}`;
            if (combinedMap[paintKey]) {
                combinedMap[paintKey].area = (Number(combinedMap[paintKey].area) + Number(paint.area)).toFixed(2);
                combinedMap[paintKey].orderQty = (Number(combinedMap[paintKey].orderQty) + Number(paint.orderQty)).toFixed(2);
            } else {
                combinedMap[paintKey] = {
                    paintName: paint.paintName,
                    paintColor: paint.paintColor,
                    area: paint.area,
                    orderQty: paint.orderQty,
                };
            }
        });
        const floorSummary = calculateFloorWiseSummary();
        floorSummary.forEach(floor => {
            const paintKey = `${floor.paintName}-${floor.paintColor}`;
            if (combinedMap[paintKey]) {
                combinedMap[paintKey].area = (Number(combinedMap[paintKey].area) + floor.area).toFixed(2);
                combinedMap[paintKey].orderQty = (Number(combinedMap[paintKey].orderQty) + floor.orderQty).toFixed(2);
            } else {
                combinedMap[paintKey] = {
                    paintName: floor.paintName,
                    paintColor: floor.paintColor,
                    area: floor.area,
                    orderQty: floor.orderQty,
                };
            }
        });
        const result = Object.values(combinedMap).map(item => ({
            ...item,
            orderQty: item.orderQty + "L",
        }));
        return result;
    };
    const summaryData = combinedSummary();
    const generateExteriorSummary = () => {
        const summaryMap = {};
        exteriorFloors.forEach(floor => {
            floor.tiles.forEach(tile => {
                const length = Number(tile.length);
                const breadth = Number(tile.breadth);
                const height = Number(tile.height);
                const deductionArea = Number(tile.deductionArea || 0);
                const totalOrderedTile = ((length * height) * 2) + ((breadth * height) * 2) - deductionArea;
                const selectedPaint = paintVariants.find(variant => variant.paintName === tile.selectedPaint);
                const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                const wastagePercentage = Number(tile.wastagePercentage);
                const wastage = wastagePercentage / 100;
                const orderQty = totalOrderedTile * (1 + wastage) / paintCoverBySqft;
                const paintKey = `${tile.selectedPaintColor}`;
                if (summaryMap[paintKey]) {
                    summaryMap[paintKey].area = (Number(summaryMap[paintKey].area) + totalOrderedTile).toFixed(2);
                    summaryMap[paintKey].orderQty = (Number(summaryMap[paintKey].orderQty) + orderQty).toFixed(2);
                } else {
                    summaryMap[paintKey] = {
                        paintName: tile.selectedPaint || "No Paint",
                        paintColor: tile.selectedPaintColor || "No Color",
                        area: totalOrderedTile.toFixed(2),
                        orderQty: orderQty.toFixed(2),
                    };
                }
            });
        });
        const result = Object.values(summaryMap).map(item => ({
            ...item,
            orderQty: item.orderQty + "L"
        }));
        return result;
    }
    const exteriorSummaryData = generateExteriorSummary();
    const generateSummaryWithFloorName = () => {
        let lastValidFloorName = null;
        const tempSummary = {};
        interiorFloors.forEach(floor => {
            const floorSummary = {};
            floor.tiles.forEach(tile => {
                const length = Number(tile.length);
                const breadth = Number(tile.breadth);
                const height = Number(tile.height);
                const deductionArea = Number(tile.deductionArea || 0);
                const totalOrderedTile = ((length * height) * 2) + ((breadth * height) * 2) - deductionArea;
                const selectedPaint = paintVariants.find(variant => variant.paintName === tile.selectedPaint);
                const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                const wastagePercentage = Number(tile.wastagePercentage);
                const wastage = wastagePercentage / 100;
                const orderQty = totalOrderedTile * (1 + wastage) / paintCoverBySqft;
                const paintKey = `${tile.selectedPaint}-${tile.selectedPaintColor}`;
                const currentFloorName = floor.floorName || lastValidFloorName || "No Floor Name";
                if (floor.floorName) {
                    lastValidFloorName = floor.floorName;
                }
                if (floorSummary[paintKey]) {
                    floorSummary[paintKey].orderQty += orderQty;
                    floorSummary[paintKey].area = (parseFloat(floorSummary[paintKey].area) + totalOrderedTile).toFixed(2);
                } else {
                    floorSummary[paintKey] = {
                        floorName: currentFloorName,
                        paintName: tile.selectedPaint || "No Paint",
                        paintColor: tile.selectedPaintColor || "No Color",
                        area: totalOrderedTile.toFixed(2),
                        orderQty: orderQty,
                    };
                }
            });
            Object.values(floorSummary).forEach(item => {
                const uniqueKey = `${item.floorName}-${item.paintName}-${item.paintColor}`;
                if (tempSummary[uniqueKey]) {
                    tempSummary[uniqueKey].orderQty =
                        Math.round((tempSummary[uniqueKey].orderQty + item.orderQty) * 100) / 100; // Round to 2 decimal places
                    tempSummary[uniqueKey].area =
                        (parseFloat(tempSummary[uniqueKey].area) + parseFloat(item.area)).toFixed(2);
                } else {
                    tempSummary[uniqueKey] = { ...item };
                }
            });
        });
        const mergedSummary = Object.values(tempSummary).map(item => ({
            floorName: item.floorName,
            paintName: item.paintName,
            paintColor: item.paintColor,
            area: item.area,
            orderQty: (Math.round(item.orderQty * 100) / 100).toFixed(2) + "L", // Final rounding
        }));
        return mergedSummary;
    };
    const generateSummaryWithFloorNameAndArea = useCallback(() => {
        let lastValidFloorName = null;
        const tempSummary = {};
        interiorFloors.forEach(floor => {
            const floorSummary = {};
            floor.tiles.forEach(tile => {
                const length = Number(tile.length);
                const breadth = Number(tile.breadth);
                const height = Number(tile.height);
                const deductionArea = Number(tile.deductionArea || 0);
                const totalOrderedTile = ((length * height) * 2) + ((breadth * height) * 2) - deductionArea;
                const selectedPaint = paintVariants.find(variant => variant.paintName === tile.selectedPaint);
                const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                const wastagePercentage = Number(tile.wastagePercentage);
                const wastage = wastagePercentage / 100;
                const orderQty = totalOrderedTile * (1 + wastage) / paintCoverBySqft;
                const paintKey = `${tile.selectedPaint}-${tile.selectedPaintColor}-${floor.areaName}`;
                const currentFloorName = floor.floorName || lastValidFloorName || "No Floor Name";
                if (floor.floorName) {
                    lastValidFloorName = floor.floorName;
                }
                const paintDataItem = paintData.find(paint => paint.paintColor === tile.selectedPaintColor);
                const selectedPaintColorImage = paintDataItem?.image || "/path/to/default-image.jpg";
                if (floorSummary[paintKey]) {
                    floorSummary[paintKey].orderQty += orderQty;
                    floorSummary[paintKey].area = (parseFloat(floorSummary[paintKey].area) + totalOrderedTile).toFixed(2);
                } else {
                    floorSummary[paintKey] = {
                        floorName: currentFloorName,
                        areaName: floor.areaName || "No Area Name",
                        paintName: tile.selectedPaint || "No Paint",
                        paintColor: tile.selectedPaintColor || "No Color",
                        area: totalOrderedTile.toFixed(2),
                        orderQty: orderQty,
                        paintColorImage: selectedPaintColorImage,
                    };
                }
            });
            Object.values(floorSummary).forEach(item => {
                const uniqueKey = `${item.floorName}-${item.paintName}-${item.paintColor}-${item.areaName}`;
                if (tempSummary[uniqueKey]) {
                    tempSummary[uniqueKey].orderQty = Math.round((tempSummary[uniqueKey].orderQty + item.orderQty) * 100) / 100;
                    tempSummary[uniqueKey].area = (parseFloat(tempSummary[uniqueKey].area) + parseFloat(item.area)).toFixed(2);
                } else {
                    tempSummary[uniqueKey] = { ...item };
                }
            });
        });
        const mergedSummary = Object.values(tempSummary).map(item => ({
            floorName: item.floorName,
            areaName: item.areaName,
            paintName: item.paintName,
            paintColor: item.paintColor,
            area: item.area,
            orderQty: (Math.round(item.orderQty * 100) / 100).toFixed(2),
            paintColorImage: item.paintColorImage,
        }));
        return mergedSummary;
    }, [paintData, interiorFloors, paintVariants]);
    const combinedFloorSummary = useCallback(() => {
        const combinedMap = {};
        const detailedSummary = generateSummaryWithFloorNameAndArea();
        detailedSummary.forEach(item => {
            const paintKey = `${item.paintName}-${item.paintColor}`;
            if (combinedMap[paintKey]) {
                combinedMap[paintKey].area = (parseFloat(combinedMap[paintKey].area) + parseFloat(item.area)).toFixed(2);
                combinedMap[paintKey].orderQty = (Math.round((parseFloat(combinedMap[paintKey].orderQty) + parseFloat(item.orderQty)) * 100) / 100).toFixed(2);
                combinedMap[paintKey].floorNames.push(item.floorName);
            } else {
                combinedMap[paintKey] = {
                    floorName: item.floorName,
                    areaName: item.areaName || "No Area Name",
                    paintName: item.paintName,
                    paintColor: item.paintColor,
                    area: item.area,
                    orderQty: item.orderQty,
                    paintColorImage: item.paintColorImage || "/path/to/default-image.jpg",
                    floorNames: [item.floorName],
                };
            }
        });
        const floorSummary = calculateFloorWiseSummary();
        floorSummary.forEach(floor => {
            const paintKey = `${floor.paintName}-${floor.paintColor}`;
            const paintDataItem = paintData.find(paint => paint.paintColor === floor.paintColor);
            const selectedPaintColorImage = paintDataItem?.image || "/path/to/default-image.jpg";
            if (combinedMap[paintKey]) {
                combinedMap[paintKey].area = (Number(combinedMap[paintKey].area) + floor.area).toFixed(2);
                combinedMap[paintKey].orderQty = (Number(combinedMap[paintKey].orderQty) + floor.orderQty).toFixed(2);
            } else {
                combinedMap[paintKey] = {
                    floorName: floor.floorName,
                    paintName: floor.paintName,
                    paintColor: floor.paintColor,
                    area: floor.area,
                    orderQty: floor.orderQty,
                    paintColorImage: selectedPaintColorImage || "/path/to/default-image.jpg",
                    floorNames: [floor.floorName],
                };
            }
        });
        const result = Object.values(combinedMap).map(item => ({
            ...item,
            orderQty: parseFloat(item.orderQty).toFixed(2) + "L",
            floorNames: [...new Set(item.floorNames)].join(", "),
        }));
        return result;
    }, [paintData, interiorFloors, paintVariants, selectedPaintNames, selectedPaintColors]);
    useEffect(() => {
        const summary = combinedFloorSummary();
        setSummaryData(summary);
    }, [paintData, interiorFloors, combinedFloorSummary]);
    const exteriorGenerateSummaryWithFloorName = useCallback(() => {
        let lastValidFloorName = null;
        const tempSummary = {};
        exteriorFloors.forEach(floor => {
            const floorSummary = {};
            floor.tiles.forEach(tile => {
                const length = Number(tile.length);
                const breadth = Number(tile.breadth);
                const height = Number(tile.height);
                const deductionArea = Number(tile.deductionArea || 0);
                const totalOrderedTile = ((length * height) * 2) + ((breadth * height) * 2) - deductionArea;
                const selectedPaint = paintVariants.find(variant => variant.paintName === tile.selectedPaint);
                const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                const wastagePercentage = Number(tile.wastagePercentage);
                const wastage = wastagePercentage / 100;
                const orderQty = totalOrderedTile * (1 + wastage) / paintCoverBySqft;
                const paintKey = `${tile.selectedPaint}-${tile.selectedPaintColor}-${floor.areaName}`;
                const currentFloorName = floor.floorName || lastValidFloorName || "No Floor Name";
                if (floor.floorName) {
                    lastValidFloorName = floor.floorName;
                }
                const paintDataItem = paintData.find(paint => paint.paintColor === tile.selectedPaintColor);
                const selectedPaintColorImage = paintDataItem?.image || "/path/to/default-image.jpg";
                if (floorSummary[paintKey]) {
                    floorSummary[paintKey].orderQty += orderQty;
                    floorSummary[paintKey].area = (parseFloat(floorSummary[paintKey].area) + totalOrderedTile).toFixed(2);
                } else {
                    floorSummary[paintKey] = {
                        floorName: currentFloorName,
                        areaName: floor.areaName || "No Area Name",
                        paintName: tile.selectedPaint || "No Paint",
                        paintColor: tile.selectedPaintColor || "No Color",
                        area: totalOrderedTile.toFixed(2),
                        orderQty: orderQty,
                        paintColorImage: selectedPaintColorImage,
                    };
                }
            });
            Object.values(floorSummary).forEach(item => {
                const uniqueKey = `${item.floorName}-${item.paintName}-${item.paintColor}-${item.areaName}`;
                if (tempSummary[uniqueKey]) {
                    tempSummary[uniqueKey].orderQty = Math.round((tempSummary[uniqueKey].orderQty + item.orderQty) * 100) / 100;
                    tempSummary[uniqueKey].area = (parseFloat(tempSummary[uniqueKey].area) + parseFloat(item.area)).toFixed(2);
                } else {
                    tempSummary[uniqueKey] = { ...item };
                }
            });
        });
        const mergedSummary = Object.values(tempSummary).map(item => ({
            floorName: item.floorName,
            areaName: item.areaName,
            paintName: item.paintName,
            paintColor: item.paintColor,
            area: item.area,
            orderQty: (Math.round(item.orderQty * 100) / 100).toFixed(2) + "L",
            paintColorImage: item.paintColorImage,
        }));
        return mergedSummary;
    }, [paintData, exteriorFloors, paintVariants]);

    useEffect(() => {
        const summary = exteriorGenerateSummaryWithFloorName();
        setSummaryDatas(summary);
    }, [paintData, exteriorFloors, exteriorGenerateSummaryWithFloorName]);
    const [activeTab, setActiveTab] = useState("interior");
    let displayIndex = 1;
    const sortedSiteOptions = siteOptions.sort((a, b) =>
        a.label.localeCompare(b.label)
    );
    const reversedFileOptions = [...filteredFileOptions].reverse();
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === "others" || tab === "summary") {
            setRateLabel("Wastage :");
        } else {
            setRateLabel("");
        }
        setInputValue("");
    };
    useEffect(() => {
        const getFilteredTileData = () => {
            const filteredData = [];
            let formulasToSet = [];
            interiorFloors.forEach(floor => {
                floor.tiles.forEach(tile => {
                    const selectedPaint = paintVariants.find(
                        (variant) => variant.paintName === tile.selectedPaint
                    );
                    const paintType = selectedPaint?.paintType;
                    if (paintType) {
                        filteredData.push({
                            FloorName: floor.floorName,
                            length: tile.length,
                            breadth: tile.breadth,
                            Height: 0,
                            Deduction: 0,
                            Wastage: 0,
                            paintType: paintType,
                        });
                        const matchedItem = paintItems.find(item => item.paintItem === paintType);
                        if (matchedItem) {
                            formulasToSet.push(matchedItem.formulas);
                        }
                    }
                });
            });
            setFilteredFormula(formulasToSet);
            setFilteredData(filteredData);
        };

        getFilteredTileData();

    }, [interiorFloors, paintVariants, paintItems]);
    useEffect(() => {
        const updatedTableDatas = lengths.map((length, index) => {
            const floorName = filteredData[index]?.FloorName;
            return {
                floorName: floorName,
                paintType: paintTypes[index] || "Unknown",
                lengths: length || 0,
                breaths: breaths[index] || 0,
                height: 0,
                deduction: 0,
                wastage: 0, 
                productVariant: "",
                colorCode: "",
                orderQty: 0,
                formula: filteredFormula[index] || "N/A",
            };
        });
        setTableDatas(updatedTableDatas);
    }, [lengths, breaths, paintTypes, filteredFormula, filteredData]);
    
    return (
        <body className="">
            <div className=" mx-auto p-6 border-collapse bg-[#FFFFFF] ml-6 mr-6 rounded-md">
                <div className=" flex">
                    <div className=" flex">
                        <div className="w-full -mt-8 mb-4">
                            <h4 className=" mt-10 font-bold mb-2 -ml-60">Site Name </h4>
                            <Select
                                value={clientName}
                                onChange={handleSiteChange}
                                options={sortedSiteOptions}
                                placeholder="Select Site Name..."
                                className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg w-80 h-12 text-left"
                                styles={customSelectStyles}
                                isClearable />
                        </div>
                        <input
                            type="text"
                            value={clientSNo}
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
                            className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] w-44 rounded-lg px-4 py-2 "
                        />
                    </div>
                    <div>
                        <h4 className=" mt-1.5 font-bold -ml-20"> E No</h4>
                        <input
                            className="bg-gray-100 rounded-lg w-36 h-12 mt-2 ml-2 pl-4"
                            value={eno}
                            readOnly
                        />
                    </div>
                    <div className=" ml-6">
                        <h4 className=" mt-1.5 font-bold mb-2 -ml-32"> Revision</h4>
                        <Select
                            placeholder="Select the file..."
                            className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg w-60 h-12"
                            styles={customSelectStyles}
                            options={reversedFileOptions}
                            isClearable
                            onChange={handleFileChange}
                            value={selectedFile}
                            isDisabled={!clientName}
                        />
                    </div>
                </div>
                <div className="flex ml-[95%] -mt-10">
                    <button className="bg-[#007233] w-28 h-[36px] rounded-md text-white" onClick={openImportPopup}>+ Import</button>
                </div>
            </div>
            <div className="mt-3">
                <div className="tabs flex ml-9 gap-5">
                    <button
                        className={`p-2  ${activeTab === "interior" ? "font-bold text-lg border-b-2 border-[#DAA520]" : "font-semibold text-black"}`}
                        onClick={() => handleTabChange("interior")}
                    >
                        Interior
                    </button>
                    <button
                        className={`p-2 ${activeTab === "exterior" ? "font-bold text-lg border-b-2 border-[#DAA520]" : "font-semibold text-black"}`}
                        onClick={() => handleTabChange("exterior")}
                    >
                        Exterior
                    </button>
                    <button
                        className={`p-2 ${activeTab === "others" ? "font-bold text-lg border-b-2 border-[#DAA520]" : "font-semibold text-black"}`}
                        onClick={() => handleTabChange("others")}>
                        Others
                    </button>
                    <button
                        className={`p-2 ${activeTab === "summary" ? "font-bold text-lg border-b-2 border-[#DAA520]" : "font-semibold text-black"}`}
                        onClick={() => handleTabChange("summary")}>
                        Summary
                    </button>
                </div>
            </div>
            <div className="content">
                {activeTab === "interior" && (
                    <div className=" p-6 bg-[#FFFFFF] ml-6 mr-6 rounded-lg">
                        <div className="interior rounded-lg border-l-8 border-l-[#BF9853] flex mt-1" id="full-table">
                            <table className="table-auto w-full">
                                <thead>
                                    <tr className=" border-none">
                                        <th></th>
                                        <th></th>
                                        <th></th>
                                        <td>
                                            <input
                                                type="text"
                                                id="commonHeight"
                                                value={commonHeight}
                                                placeholder="H"
                                                onChange={(e) => {
                                                    setCommonHeight(e.target.value);
                                                    const updatedFloors = interiorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            height: e.target.value,
                                                        })),
                                                    }));
                                                    setInteriorFloors(updatedFloors);
                                                }}
                                                className=" -mt-3 ml-2 w-12 text-center bg-transparent h-8 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg focus:outline-none"
                                            />
                                        </td>
                                        <th></th>
                                        <th></th>
                                        <td>
                                            <select
                                                className="border rounded"
                                                onChange={(e) => {
                                                    const updatedFloors = interiorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            putty: e.target.value,
                                                        })),
                                                    }));
                                                    setInteriorFloors(updatedFloors);
                                                }}
                                            >
                                                <option value="No">No</option>
                                                <option value="Wall">Wall</option>
                                                <option value="Ceiling">Ceiling</option>
                                                <option value="Both">Both</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                className="border rounded"
                                                onChange={(e) => {
                                                    const updatedFloors = interiorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            primer: e.target.value,
                                                        })),
                                                    }));
                                                    setInteriorFloors(updatedFloors);
                                                }}>
                                                <option value="No">No</option>
                                                <option value="Yes">Yes</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                className="border rounded"
                                                onChange={(e) => {
                                                    const updatedFloors = interiorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            ceilingCoat: e.target.value,
                                                        })),
                                                    }));
                                                    setInteriorFloors(updatedFloors);
                                                }}
                                            >
                                                <option value="No">No</option>
                                                <option value="Yes">Yes</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                className="border rounded"
                                                onChange={(e) => {
                                                    const updatedFloors = interiorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            waterproof: e.target.value,
                                                        })),
                                                    }));
                                                    setInteriorFloors(updatedFloors);
                                                }}
                                            >
                                                <option value="No">No</option>
                                                <option value="Yes">Yes</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                className="border rounded"
                                                onChange={(e) => {
                                                    const updatedFloors = interiorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            wastagePercentage: e.target.value,
                                                        })),
                                                    }));
                                                    setInteriorFloors(updatedFloors);
                                                }}
                                            >
                                                {Array.from({ length: 16 }, (_, index) => (
                                                    <option key={index} value={index}>
                                                        {index}%
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-40 text-left pl-2" rowSpan="2">Discription</th>
                                        <th className="w-32 text-lg " colSpan="3" style={{ letterSpacing: '0.2em' }}>Measurement</th>
                                        <th className="w-14 " rowSpan="2">Deduction Area (sqft)</th>
                                        <th className="w-12 " rowSpan="2">Area (sqft)</th>
                                        <th className="w-16 " rowSpan="2">Putty</th>
                                        <th className="w-16 " rowSpan="2">Primer</th>
                                        <th className="w-16 " rowSpan="2">Ceiling Coat</th>
                                        <th className="w-16 " rowSpan="2">Water Proof</th>
                                        <th className="w-12 " rowSpan="2">Wastage (sqft)</th>
                                        <th className="w-16 " rowSpan="2">Product Variant</th>
                                        <th className="w-60 " rowSpan="2">Color Code</th>
                                        <th className="w-60 " rowSpan="2">Order Qty</th>
                                    </tr>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-6 text-[#E4572E] ">L</th>
                                        <th className="w-6 text-[#E4572E] ">B</th>
                                        <th className="w-6 text-[#E4572E] ">H</th>
                                    </tr>
                                </thead>
                                <tbody >
                                    {interiorFloors.map((floor, floorIndex) => (
                                        <React.Fragment key={floorIndex}>
                                            <tr className="bg-gray-50 ">
                                                <td colSpan="14" className="font-bold text-left">
                                                    {floor.floorName !== null && (
                                                        <div>
                                                            <span className="mt-1">{displayIndex++}.</span>
                                                            <span>{selectedClientData.floorName}</span>
                                                            <select
                                                                value={floor.floorName}
                                                                onChange={(e) => {
                                                                    const updatedFloors = [...interiorFloors];
                                                                    updatedFloors[floorIndex].floorName = e.target.value;
                                                                    setInteriorFloors(updatedFloors);
                                                                }}
                                                                className="w-52 p-1 rounded-lg bg-transparent focus:outline-none">
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
                                            {floor.tiles.map((tile, tileIndex) => {
                                                const globalRowIndex = floorIndex + tileIndex;
                                                return (
                                                    <tr
                                                        key={`${floorIndex}-${tileIndex}`}
                                                        className={globalRowIndex % 2 === 0 ? "bg-[#FAF6ED]" : "bg-white"}>
                                                        <td className="px-1 flex group ml-3">
                                                            {tileIndex === 0 ? (
                                                                <Select
                                                                    name="areaName"
                                                                    options={areaOptions.map(option => ({ value: option, label: option }))}
                                                                    value={floor.areaName ? { value: floor.areaName, label: floor.areaName } : null}
                                                                    onChange={(selectedOption) => {
                                                                        const updatedFloors = [...interiorFloors];
                                                                        updatedFloors[floorIndex].areaName = selectedOption ? selectedOption.value : "";
                                                                        setInteriorFloors(updatedFloors);
                                                                    }}
                                                                    className="w-64 h-10 text-left ml-3"
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
                                                                <div key={floorIndex} className="items-center flex space-x-4 invisible group-hover:visible">
                                                                    <button onClick={() => addAreaRowInterior(floorIndex)}>
                                                                        <img src={add} alt="add" className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => deleteAreaRow(floorIndex, "interior")} className="ml-2">
                                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-1 ">
                                                            <input
                                                                type="text"
                                                                name="length"
                                                                placeholder="L"
                                                                value={tile.length}
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-14 bg-transparent  hover:border focus:outline-none text-center" />
                                                        </td>
                                                        <td className="px-1 ">
                                                            <input
                                                                type="text"
                                                                name="breadth"
                                                                placeholder="B"
                                                                value={tile.breadth}
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-14 bg-transparent hover:border focus:outline-none text-center" />
                                                        </td>
                                                        <td className="px-1">
                                                            <input
                                                                type="text"
                                                                name="height"
                                                                placeholder="H"
                                                                value={tile.height}
                                                                onChange={(e) => {
                                                                    const updatedFloors = [...interiorFloors];
                                                                    updatedFloors[floorIndex].tiles[tileIndex].height = e.target.value;
                                                                    setInteriorFloors(updatedFloors);
                                                                }}
                                                                className="px-2 w-14 bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="px-2">
                                                            <input
                                                                type="text"
                                                                name="deductionArea"
                                                                value={tile.deductionArea}
                                                                placeholder="Deduction"
                                                                className="px-2 w-20 bg-transparent hover:border focus:outline-none"
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                            />
                                                        </td>
                                                        <td className="px-2 ">
                                                            <div className="w-16">
                                                                {tile.length && (tile.breadth || tile.height) ? (
                                                                    (() => {
                                                                        const length = Number(tile.length);
                                                                        const breadth = Number(tile.breadth);
                                                                        const height = Number(tile.height);
                                                                        const deductionArea = Number(tile.deductionArea || 0);
                                                                        const totalOrderedTile = ((length * height) * 2) + ((breadth * height) * 2) - deductionArea;
                                                                        return totalOrderedTile.toFixed(2);
                                                                    })()
                                                                ) : (
                                                                    "0"
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                name="putty"
                                                                className="bg-transparent"
                                                                value={tile.putty || "No"}
                                                                onChange={(e) => {
                                                                    const updatedFloors = [...interiorFloors];
                                                                    updatedFloors[floorIndex].tiles[tileIndex].putty = e.target.value;
                                                                    setInteriorFloors(updatedFloors);
                                                                }}
                                                            >
                                                                <option value="No">No</option>
                                                                <option value="Wall">Wall</option>
                                                                <option value="Ceiling">Ceiling</option>
                                                                <option value="Both">Both</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                name="primer"
                                                                className="bg-transparent"
                                                                value={tile.primer || "No"}
                                                                onChange={(e) => handleTileChange(e, floorIndex, tileIndex)}
                                                            >
                                                                <option>Yes</option>
                                                                <option>No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                name="ceilingCoat"
                                                                className="bg-transparent"
                                                                value={tile.ceilingCoat || "No"}
                                                                onChange={(e) => handleTileChange(e, floorIndex, tileIndex)}
                                                            >
                                                                <option>Yes</option>
                                                                <option>No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                name="waterproof"
                                                                className="bg-transparent"
                                                                value={tile.waterproof || "No"}
                                                                onChange={(e) => handleTileChange(e, floorIndex, tileIndex)}
                                                            >
                                                                <option>Yes</option>
                                                                <option>No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                name="wastagePercentage"
                                                                value={tile.wastagePercentage}
                                                                className="w-12 bg-gray-200 focus:outline-none"
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                            >
                                                                {Array.from({ length: 16 }, (_, index) => (
                                                                    <option key={index} value={index}>
                                                                        {index}%
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                className="bg-transparent ml-10 w-72"
                                                                value={tile.selectedPaint || ""}
                                                                onChange={(e) => {
                                                                    const updatedFloors = [...interiorFloors];
                                                                    updatedFloors[floorIndex].tiles[tileIndex].selectedPaint = e.target.value;
                                                                    setInteriorFloors(updatedFloors);
                                                                }}
                                                                required
                                                            >
                                                                <option value="" disabled>
                                                                    Select Paint..
                                                                </option>
                                                                {paintVariants.map((variant) => (
                                                                    <option key={variant.id} value={variant.paintName}>
                                                                        {variant.paintName}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                className="bg-transparent w-64"
                                                                name="selectedPaintColor"
                                                                value={tile.selectedPaintColor || ""}
                                                                onChange={(e) => handleTileChange(e, floorIndex, tileIndex)}
                                                            >
                                                                <option value="" disabled>
                                                                    Select Paint Color..
                                                                </option>
                                                                {paints.map((paint, index) => (
                                                                    <option key={index} value={`${paint.paintColor}`}>
                                                                        {paint.paintColor}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <div className="w-32 ml-2">
                                                                {tile.length && (tile.breadth || tile.height) && tile.selectedPaint ? (
                                                                    (() => {
                                                                        const length = Number(tile.length);
                                                                        const breadth = Number(tile.breadth);
                                                                        const height = Number(tile.height);
                                                                        const wastagePercentage = Number(tile.wastagePercentage);
                                                                        const deductionArea = Number(tile.deductionArea || 0);
                                                                        const wastage = wastagePercentage / 100;
                                                                        const selectedPaint = paintVariants.find(
                                                                            (variant) => variant.paintName === tile.selectedPaint
                                                                        );
                                                                        const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                                                                        const totalOrderedTile =
                                                                            length * height * 2 + breadth * height * 2 - deductionArea;
                                                                        const orderQty = totalOrderedTile * (1 + wastage) / paintCoverBySqft;
                                                                        return `${orderQty.toFixed(2)}L`;
                                                                    })()
                                                                ) : (
                                                                    "0"
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <button type="button" className="text-[#E4572E] mt-6 mb-20 -ml-[94%] border-dashed border-b-2 border-[#BF9853] font-semibold"
                                onClick={addFloorRowInterior}>
                                + Add Floor
                            </button>
                        </div>
                        <div className=" buttons -mt-14 flex">
                            <div className="">
                                <button className="w-40 text-white px-4 py-2 rounded bg-[#007233] hover:text-white transition duration-200 ease-in-out"
                                    onClick={handleButtonClick}>
                                    Customer Copy
                                </button>
                            </div>
                            <div>
                                <button className="w-40 text-white px-4 py-2 rounded ml-4 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out"
                                    onClick={handleOCButtonClick}>
                                    Order Copy
                                </button>
                            </div>
                            <div className="">
                                <button className="w-40 text-white px-4 py-2 rounded ml-4 bg-[#007233] hover:text-white transition duration-200 ease-in-out"
                                    onClick={handleECButtonClick}>
                                    Engineer Copy
                                </button>
                            </div>
                            <div className="">
                                <button className="w-40 text-white px-4 py-2 rounded ml-4 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out"
                                    onClick={handleSCButtonClick}>
                                    Stocking Chart
                                </button>
                            </div>
                            <div>
                                <button className="w-40 text-black px-4 py-2 rounded ml-4 border border-[#BF9853] h-10" onClick={openCeilingCoatPopup}>
                                    Ceiling Coat
                                </button>
                            </div>
                            <div className="flex ml-[52%]">
                                {isPopupOpen && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                        <div className="bg-white p-3 rounded-lg shadow-lg text-center">
                                            <div>
                                                <img src={loadingScreen} alt="Loading..." className="w-10 h-10 mx-auto" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!isSubmitting && (
                                    <button
                                        type="submit"
                                        onClick={savePaintCalculation}
                                        className="btn bg-[#BF9853] text-white px-8 py-2 rounded-md  font-semibold -ml-60"
                                        disabled={isSubmitting}>
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                )}
                            </div>

                        </div>
                        <div className="-mt-3 flex">
                            <div>
                                <div>
                                    <h1 className="font-bold text-2xl mt-8 -ml-[64%]">Paint Order Copy </h1>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                                    <table className="table-auto mt-2">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="font-extrabold p-2">S.No</th>
                                                <th className="p-2 font-extrabold">Product Variant</th>
                                                <th className="p-2 w-44 font-extrabold">Color Code</th>
                                                <th className=" w-36 font-extrabold">Total Area</th>
                                                <th className=" w-36 font-extrabold">Litre</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summaryData.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="p-2 text-left ">{(index + 1).toString().padStart(1, '0')}</td>
                                                    <td className="p-2">{item.paintName}</td>
                                                    <td className="p-2">{item.paintColor}</td>
                                                    <td className="p-2">{parseFloat(item.area).toFixed(2)}</td>
                                                    <td className="p-2">{parseFloat(item.orderQty).toFixed(2)}L</td>
                                                </tr>

                                            ))}
                                            <tr className="bg-[#FAF6ED] font-bold">
                                                <td></td>
                                                <td className="p-2 text-left" colSpan="2">Total</td>
                                                <td>
                                                    {summaryData.reduce((acc, item) => acc + parseFloat(item.area), 0).toFixed(2)}
                                                </td>
                                                <td>
                                                    {summaryData.reduce((acc, item) => acc + parseFloat(item.orderQty), 0).toFixed(2) + "L"}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className=" ml-10">
                                <div >
                                    <h1 className="font-bold text-2xl mt-8 -ml-[60%]">Paint Stocking Chart </h1>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                                    <table id="summaryTable" className="table-auto mt-2">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="font-extrabold p-2 text-left">S.No</th>
                                                <th className="p-2 font-extrabold text-left">Floor Name</th>
                                                <th className="p-2 font-extrabold text-left">Product Variant</th>
                                                <th className="p-2 font-extrabold text-left">Color Code</th>
                                                <th className="p-2 font-extrabold text-left">Total Area</th>
                                                <th className="p-2 font-extrabold text-left">Litre</th>
                                                <th className="p-2 font-extrabold text-left">Image</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summaryDatas.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7">No data available.</td>
                                                </tr>
                                            ) : (
                                                summaryDatas.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="p-2 text-left ">{(index + 1).toString().padStart(1, '0')}</td>
                                                        <td className="p-2">{item.floorName}</td>
                                                        <td className="p-2">{item.paintName}</td>
                                                        <td className="p-2">{item.paintColor}</td>
                                                        <td className="p-2">{item.area}</td>
                                                        <td className="p-2">{item.orderQty}</td>
                                                        <td>
                                                            {item.paintColorImage ? (
                                                                <img src={`data:image/png;base64,${item.paintColorImage}`} alt={""} className="w-11 h-11 ml-2" />
                                                            ) : (
                                                                <span>No Image</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                            <tr className="bg-[#FAF6ED] font-bold">
                                                <td></td>
                                                <td className="p-2 text-left" colSpan="2">Total</td>
                                                <td></td>
                                                <td>
                                                    {summaryDatas.reduce((acc, item) => acc + parseFloat(item.area), 0).toFixed(2)}
                                                </td>
                                                <td>
                                                    {summaryDatas.reduce((acc, item) => acc + parseFloat(item.orderQty), 0).toFixed(2) + "L"}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="content">
                {activeTab === "exterior" && (
                    <div className=" p-6 bg-[#FFFFFF] ml-6 mr-6 rounded-lg">
                        <div className="rounded-lg border-l-8 border-l-[#BF9853] flex -mt-3" id="full-table">
                            <table className="table-auto w-full">
                                <thead>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-40 text-left pl-2" rowSpan="2">Discription</th>
                                        <th className="w-32 text-lg " colSpan="3" style={{ letterSpacing: '0.2em' }}>Measurement</th>
                                        <th className="w-14 " rowSpan="2">Deduction Area (sqft)</th>
                                        <th className="w-12 " rowSpan="2">Area (sqft)</th>
                                        <th className="w-16 " rowSpan="2">Putty</th>
                                        <th className="w-16 " rowSpan="2">Primer</th>
                                        <th className="w-16 " rowSpan="2">Water Proof</th>
                                        <th className="w-12 " rowSpan="2">Wastage (sqft)</th>
                                        <th className="w-16 " rowSpan="2">Paint Variant</th>
                                        <th className="w-60 " rowSpan="2">Color Code</th>
                                        <th className="w-60 " rowSpan="2">Order Qty</th>
                                    </tr>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-6 text-[#E4572E] ">L</th>
                                        <th className="w-6 text-[#E4572E] ">B</th>
                                        <th className="w-6 text-[#E4572E] ">H</th>
                                    </tr>
                                </thead>
                                <tbody className="Exterior">
                                    {exteriorFloors.map((floor, floorIndex) => (
                                        <React.Fragment key={floorIndex}>
                                            <tr className="bg-white">
                                                <td colSpan="13" className="font-bold text-left flex">
                                                    {floor.floorName !== null && (
                                                        <div>
                                                            <span className="mt-1">{displayIndex++}.</span>
                                                            <span>{selectedClientData.floorName}</span>
                                                            <select
                                                                value={floor.floorName}
                                                                onChange={(e) => {
                                                                    const updatedFloors = [...exteriorFloors];
                                                                    updatedFloors[floorIndex].floorName = e.target.value;
                                                                    setExteriorFloors(updatedFloors);
                                                                }}
                                                                className="w-52 p-1 rounded-lg bg-transparent focus:outline-none">
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
                                            {floor.tiles.map((tile, tileIndex) => {
                                                const globalRowIndex = floorIndex + tileIndex;
                                                return (
                                                    <tr
                                                        key={`${floorIndex}-${tileIndex}`}
                                                        className={globalRowIndex % 2 === 0 ? "bg-[#FAF6ED]" : "bg-white"}
                                                    >
                                                        <td className="px-1 flex group ml-3">
                                                            {tileIndex === 0 ? (
                                                                <Select
                                                                    name="areaName"
                                                                    options={areaOptions.map(option => ({ value: option, label: option }))}
                                                                    value={floor.areaName ? { value: floor.areaName, label: floor.areaName } : null}
                                                                    onChange={(selectedOption) => {
                                                                        const updatedFloors = [...exteriorFloors];
                                                                        updatedFloors[floorIndex].areaName = selectedOption ? selectedOption.value : "";
                                                                        setExteriorFloors(updatedFloors);
                                                                    }}
                                                                    className="w-64 h-10 text-left ml-3"
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
                                                                <div key={floorIndex} className="items-center flex space-x-4 invisible group-hover:visible">
                                                                    <button onClick={() => addAreaRowExterior(floorIndex)}>
                                                                        <img src={add} alt="add" className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => deleteAreaRow(floorIndex, "exterior")} className="ml-2">
                                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-1 ">
                                                            <input
                                                                type="text"
                                                                name="length"
                                                                placeholder="L"
                                                                value={tile.length}
                                                                onChange={(e) => handleExteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-14 bg-transparent  hover:border focus:outline-none text-center" />
                                                        </td>
                                                        <td className="px-1 ">
                                                            <input
                                                                type="text"
                                                                name="breadth"
                                                                placeholder="B"
                                                                value={tile.breadth}
                                                                onChange={(e) => handleExteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-14 bg-transparent hover:border focus:outline-none text-center" />
                                                        </td>
                                                        <td className="px-1 ">
                                                            <input
                                                                type="text"
                                                                name="height"
                                                                placeholder="H"
                                                                value={tile.height}
                                                                onChange={(e) => handleExteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-14 bg-transparent hover:border focus:outline-none text-center" />
                                                        </td>
                                                        <td className="px-2 ">
                                                            <input
                                                                type="text"
                                                                name="deductionArea"
                                                                value={tile.deductionArea}
                                                                onChange={(e) => handleExteriorTileChange(floorIndex, tileIndex, e)}
                                                                placeholder="Deduction"
                                                                className="px-2 w-20 bg-transparent  hover:border focus:outline-none" />
                                                        </td>
                                                        <td className="px-2 ">
                                                            <div className="w-16">
                                                                {tile.length && (tile.breadth || tile.height) ? (
                                                                    (() => {
                                                                        const length = Number(tile.length);
                                                                        const breadth = Number(tile.breadth);
                                                                        const height = Number(tile.height);
                                                                        const deductionArea = Number(tile.deductionArea || 0);
                                                                        const totalOrderedTile = ((length * height) * 2) + ((breadth * height) * 2) - deductionArea;
                                                                        return totalOrderedTile.toFixed(2);
                                                                    })()
                                                                ) : (
                                                                    "0"
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                className="bg-transparent"
                                                                defaultValue="No"
                                                                onChange={(e) =>
                                                                    handleSelectChange(floorIndex, tileIndex, 'Putty', e.target.value)
                                                                }>
                                                                <option>Wall</option>
                                                                <option>Ceiling</option>
                                                                <option>Both</option>
                                                                <option>No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                className="bg-transparent"
                                                                defaultValue="No"
                                                                onChange={(e) =>
                                                                    handleSelectChange(floorIndex, tileIndex, 'Primer', e.target.value)
                                                                }>
                                                                <option>Yes</option>
                                                                <option>No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                className="bg-transparent"
                                                                defaultValue="No"
                                                                onChange={(e) =>
                                                                    handleSelectChange(floorIndex, tileIndex, 'Water Proof', e.target.value)
                                                                }>
                                                                <option>Yes</option>
                                                                <option>No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-2 ">
                                                            <select
                                                                name="wastagePercentage"
                                                                value={tile.wastagePercentage}
                                                                onChange={(e) => handleExteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="  w-12 bg-gray-200 focus:outline-none">
                                                                {Array.from({ length: 16 }, (_, index) => (
                                                                    <option key={index} value={index}>
                                                                        {index}%
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                className="bg-transparent ml-10 w-72"
                                                                value={tile.selectedPaint || ""}
                                                                onChange={(e) => {
                                                                    const updatedFloors = [...exteriorFloors];
                                                                    updatedFloors[floorIndex].tiles[tileIndex].selectedPaint = e.target.value;
                                                                    setExteriorFloors(updatedFloors);
                                                                }} required>
                                                                <option value="" disabled>
                                                                    Select Exterior Paint..
                                                                </option>
                                                                {paintVariants.map((variant) => (
                                                                    <option key={variant.id} value={variant.paintName}>
                                                                        {variant.paintName}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                className="bg-transparent w-64"
                                                                value={tile.selectedPaintColor || ""}
                                                                onChange={(e) => handleExteriorchange(e, floorIndex, tileIndex)}
                                                                name="selectedPaintColor"
                                                                required
                                                            >
                                                                <option value="" disabled>Select Paint Color..</option>
                                                                {paints.map((paint, index) => (
                                                                    <option key={index} value={paint.paintColor}>
                                                                        {paint.paintColor}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <div className="w-32 ml-2">
                                                                {tile.length && (tile.breadth || tile.height) ? (
                                                                    (() => {
                                                                        const length = Number(tile.length);
                                                                        const breadth = Number(tile.breadth);
                                                                        const height = Number(tile.height);
                                                                        const wastagePercentage = Number(tile.wastagePercentage);
                                                                        const deductionArea = Number(tile.deductionArea || 0);
                                                                        const wastage = wastagePercentage / 100;
                                                                        const selectedPaint = paintVariants.find(
                                                                            (variant) => variant.paintName === tile.selectedPaint
                                                                        );
                                                                        const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                                                                        const totalOrderedTile =
                                                                            length * height * 2 + breadth * height * 2 - deductionArea;
                                                                        const orderQty = (totalOrderedTile * (1 + wastage)) / paintCoverBySqft;
                                                                        return `${orderQty.toFixed(2)}L`;
                                                                    })()
                                                                ) : (
                                                                    "0"
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <button type="button" className="text-[#E4572E] mt-6 mb-20 -ml-[94%] border-dashed border-b-2 border-[#BF9853] font-semibold"
                                onClick={addFloorRowExterior}>
                                + Add Floor
                            </button>
                        </div>
                        <div className=" buttons -mt-14 flex">
                            <div className="">
                                <button className="w-60 text-white px-8 py-2 rounded bg-[#007233] hover:text-white transition duration-200 ease-in-out"
                                    onClick={exteriorCustomerCopyPDF}>
                                    Customer Copy
                                </button>
                            </div>
                            <div>
                                <button className="w-60 text-white px-8 py-2 rounded ml-2 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out"
                                    onClick={exteriorSummaryPDF}>
                                    Order Copy
                                </button>
                            </div>
                            <div className="">
                                <button className="w-60 text-white px-8 py-2 rounded ml-2 bg-[#007233] hover:text-white transition duration-200 ease-in-out"
                                    onClick={exteriorFullPDF}>
                                    Engineer Copy
                                </button>
                            </div>
                            <div className="">
                                <button className="w-60 text-white px-8 py-2 rounded ml-2 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out"
                                    onClick={exteriorFloorSummaryPDF}>
                                    Stocking Chart
                                </button>
                            </div>
                            <div className="flex ml-[52%]">
                                {isPopupOpen && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                        <div className="bg-white p-3 rounded-lg shadow-lg text-center">
                                            <div>
                                                <img src={loadingScreen} alt="Loading..." className="w-10 h-10 mx-auto" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!isSubmitting && (
                                    <button
                                        type="submit"
                                        onClick={savePaintCalculation}
                                        className="btn bg-[#BF9853] text-white px-8 py-2 rounded-md  font-semibold -ml-60"
                                        disabled={isSubmitting}>
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                )}
                            </div>

                        </div>
                        <div className="-mt-3 flex">
                            <div>
                                <div>
                                    <h1 className="font-bold text-2xl mt-8 -ml-[65%]">Paint Order Copy </h1>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                                    <table className="table-auto mt-2">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="font-extrabold p-2">S.No</th>
                                                <th className="p-2 font-extrabold">Paint Name</th>
                                                <th className="p-2 w-44 font-extrabold">Color Code</th>
                                                <th className=" w-36 font-extrabold">Total Area</th>
                                                <th className=" w-36 font-extrabold">Litre</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exteriorSummaryData.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="p-2 text-left ">{(index + 1).toString().padStart(1, '0')}</td>
                                                    <td className="p-2">{item.paintName}</td>
                                                    <td className="p-2">{item.paintColor}</td>
                                                    <td className="p-2">{item.area}</td>
                                                    <td className="p-2">{item.orderQty}</td>
                                                </tr>

                                            ))}
                                            <tr className="bg-[#FAF6ED] font-bold">
                                                <td></td>
                                                <td className="p-2 text-left" colSpan="2">Total</td>
                                                <td>
                                                    {exteriorSummaryData.reduce((acc, item) => acc + parseFloat(item.area), 0).toFixed(2)}
                                                </td>
                                                <td>
                                                    {exteriorSummaryData.reduce((acc, item) => acc + parseFloat(item.orderQty), 0).toFixed(2) + "L"}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className=" ml-10">
                                <div >
                                    <h1 className="font-bold text-2xl mt-8 -ml-[52%]">Paint Stocking Chart </h1>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                                    <table id="summaryTable" className="table-auto mt-2">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="font-extrabold p-2 text-left">S.No</th>
                                                <th className="p-2 font-extrabold text-left">Floor Name</th>
                                                <th className="p-2 font-extrabold text-left">Paint Name</th>
                                                <th className="p-2 font-extrabold text-left">Color Code</th>
                                                <th className="p-2 font-extrabold text-left">Total Area</th>
                                                <th className="p-2 font-extrabold text-left">Litre</th>
                                                <th className="p-2 font-extrabold text-left">Image</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summaryDatass.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7">No data available.</td>
                                                </tr>
                                            ) : (
                                                summaryDatass.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="p-2 text-left ">{(index + 1).toString().padStart(1, '0')}</td>
                                                        <td className="p-2">{item.floorName}</td>
                                                        <td className="p-2">{item.paintName}</td>
                                                        <td className="p-2">{item.paintColor}</td>
                                                        <td className="p-2">{item.area}</td>
                                                        <td className="p-2">{item.orderQty}</td>
                                                        <td>
                                                            {item.paintColorImage ? (
                                                                <img src={`data:image/png;base64,${item.paintColorImage}`} alt={""} className="w-11 h-11 ml-2" />
                                                            ) : (
                                                                <span>No Image</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                            <tr className="bg-[#FAF6ED] font-bold">
                                                <td></td>
                                                <td className="p-2 text-left" colSpan="2">Total</td>
                                                <td></td>
                                                <td>
                                                    {summaryDatass.reduce((acc, item) => acc + parseFloat(item.area), 0).toFixed(2)}
                                                </td>
                                                <td>
                                                    {summaryDatass.reduce((acc, item) => acc + parseFloat(item.orderQty), 0).toFixed(2) + "L"}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div>
                {activeTab === "others" && (
                    <div className=" justify-center  mt-">
                        <div
                            className="bg-white p-5 rounded-lg  ml-5"
                            style={{ width: '98vw' }} >
                            <div className="">
                                <div className="rounded-l-lg overflow-hidden"
                                    style={{ borderLeft: '8px solid #BF9853' }}>
                                    <table
                                        className="text-left mb-20"
                                        style={{ width: "1207px", borderCollapse: "collapse" }}
                                    >
                                        <thead className="bg-[#FAF6ED]">
                                            <tr>
                                                <th>Floor Name</th>
                                                <th className="w-32 text-left pl-2 align-middle">
                                                    Item
                                                </th>
                                                <th className="w-32 text-center align-middle">Height (H)</th>
                                                <th className="w-28 text-center pl-2 align-middle">Deduction Area (sqft)</th>
                                                <th className="w-12 text-center pl-6 align-middle">Area (Sqft)</th>
                                                <th className="w-12 text-center pl-6 align-middle">Wastage (%)</th>
                                                <th className="text-left pl-3 align-middle">Product Variant</th>
                                                <th className="text-left pl-3 align-middle">Color Code</th>
                                                <th className="text-left pl-3 align-middle">Order Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableDatas
                                                .filter((row) => paintTypeOptions.includes(row.paintType))
                                                .map((row, index) => {
                                                    const paintItem = paintItems.find((item) => item.paintItem === row.paintType);
                                                    const formula = paintItem ? paintItem.formulas : "";
                                                    let area = row.area || 0;
                                                    let orderQty = row.orderQty || 0;
                                                    if (formula) {
                                                        try {
                                                            const lengths = row.lengths || 0;
                                                            const breadths = row.breaths || 0;
                                                            const height = row.height || 0;
                                                            const deduction = row.deduction || 0;
                                                            const wastage = row.wastage || 0;
                                                            let formulaWithValues = formula.replace(/x/g, '*');
                                                            formulaWithValues = formulaWithValues
                                                                .replace(/L/g, lengths)
                                                                .replace(/B/g, breadths)
                                                                .replace(/H/g, height);
                                                            area = eval(formulaWithValues) - deduction;
                                                            area = area.toFixed(2);
                                                            if (wastage) {
                                                                orderQty = (parseFloat(area) + (parseFloat(area) * wastage / 100)).toFixed(2);
                                                            } else {
                                                                orderQty = area;
                                                            }
                                                            const selectedPaint = paintVariants.find((variant) => variant.paintName === row.productVariant);
                                                            const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                                                            orderQty = (parseFloat(orderQty) / paintCoverBySqft).toFixed(2);

                                                        } catch (error) {
                                                            console.error("Error calculating area:", error);
                                                            area = "Error";
                                                            orderQty = "Error";
                                                        }
                                                    }

                                                    return (
                                                        <tr key={index}>
                                                            <td>{row.floorName}</td>
                                                            <td>{row.paintType}</td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    placeholder="H"
                                                                    value={row.height || ""}
                                                                    onChange={(e) => {
                                                                        const updatedData = [...tableDatas];
                                                                        updatedData[index].height = e.target.value ? parseFloat(e.target.value) : 0;
                                                                        setTableDatas(updatedData);
                                                                    }}
                                                                    className="px-2 w-20 bg-transparent hover:border focus:outline-none appearance-none"
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Deduction"
                                                                    value={row.deduction || ""}
                                                                    onChange={(e) => {
                                                                        const updatedData = [...tableDatas];
                                                                        updatedData[index].deduction = e.target.value ? parseFloat(e.target.value) : 0;
                                                                        setTableDatas(updatedData);
                                                                    }}
                                                                    className="px-2 w-20 bg-transparent hover:border focus:outline-none appearance-none"
                                                                />
                                                            </td>
                                                            <td>{area || row.area}</td>
                                                            <td>
                                                                <select
                                                                    value={row.wastage || 0}
                                                                    onChange={(e) => {
                                                                        const updatedData = [...tableDatas];
                                                                        updatedData[index].wastage = parseFloat(e.target.value);
                                                                        setTableDatas(updatedData);
                                                                    }}
                                                                >
                                                                    {Array.from({ length: 16 }, (_, i) => (
                                                                        <option key={i} value={i}>
                                                                            {i}%
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <Select
                                                                    className="bg-transparent w-72"
                                                                    value={row.productVariant ? { label: row.productVariant, value: row.productVariant } : null}
                                                                    onChange={(selectedOption) => {
                                                                        const updatedData = [...tableDatas];
                                                                        updatedData[index].productVariant = selectedOption?.value || "";
                                                                        setTableDatas(updatedData);
                                                                    }}
                                                                    options={paintVariants.map((variant) => ({
                                                                        label: variant.paintName,
                                                                        value: variant.paintName,
                                                                    }))}
                                                                    isSearchable
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
                                                                    menuPortalTarget={document.body}  // For testing outside the table
                                                                />
                                                            </td>
                                                            <td>
                                                                <Select
                                                                    value={row.colorCode ? { label: row.colorCode, value: row.colorCode } : null}
                                                                    onChange={(selectedOption) => {
                                                                        const updatedData = [...tableDatas];
                                                                        updatedData[index].colorCode = selectedOption?.value || "";
                                                                        setTableDatas(updatedData);
                                                                    }}
                                                                    options={paints.map((paint) => ({
                                                                        label: paint.paintColor,
                                                                        value: paint.paintColor,
                                                                    }))}
                                                                    isSearchable
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
                                                                    menuPortalTarget={document.body}
                                                                />
                                                            </td>
                                                            <td>{orderQty || row.orderQty}L</td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className=" flex">
                                <div className=" mt-8">
                                    <h3 className="text-lg font-semibold mt-5 -ml-[24rem]">Paint Order Copy</h3>
                                    <div className="rounded-lg border-l-8 border-l-[#BF9853] ml-2">
                                        <table className="text-left" style={{ width: "530px", borderCollapse: "collapse" }}>
                                            <thead className="bg-[#FAF6ED]">
                                                <tr>
                                                    <th className="font-extrabold p-2">S.No</th>
                                                    <th className="p-2 w-44 font-extrabold">Product Variant</th>
                                                    <th className="p-2 w-44 font-extrabold">Color</th>
                                                    <th >Total Area</th>
                                                    <th className="w-16 font-extrabold">Order Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="summary-table mb-8">

                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div>
                {activeTab === "summary" && (
                    <div className="bg-white ml-5 p-5 rounded-lg" style={{ width: '98vw' }}>
                        <div className="flex flex-col md:flex-row gap-32 items-start ">
                            {/* Interior Section */}
                            <div className="w-[432px] md:w-[432px]">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="font-bold text-lg">Interior</label>
                                    <label className="font-bold text-base">Print</label>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                                    <table className="table-auto mt-2 w-[520px]">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="font-extrabold p-2">S.No</th>
                                                <th className="p-2 w-44 font-extrabold">Product Variant</th>
                                                <th className="p-2 w-44 font-extrabold">Color Code</th>
                                                <th className=" w-36 font-extrabold">Litre</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summaryData.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="p-2 text-left ">{(index + 1).toString().padStart(1, '0')}</td>
                                                    <td className="p-2 text-left">{item.paintName}</td>
                                                    <td className="p-2 ">{item.paintColor}</td>
                                                    <td className="p-2">{parseFloat(item.orderQty).toFixed(2)}L</td>
                                                </tr>

                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Exterior Section */}
                            <div className=" md:w-[419px] mt-10 md:mt-0">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="font-bold text-lg">Exterior</label>
                                    <label className="font-bold text-base">Print</label>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                                    <table className=" mt-1 w-[419px]">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="font-extrabold p-2">S.No</th>
                                                <th className="p-2 w-44 font-extrabold">Product Name</th>
                                                <th className="p-2 w-44 font-extrabold">Color Code</th>
                                                <th className="w-16 font-extrabold">Order Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exteriorSummaryData.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="p-2 text-left">{(index + 1).toString().padStart(1, '0')}</td>
                                                    <td className="p-2">{item.paintName}</td>
                                                    <td className="p-2">{item.paintColor}</td>
                                                    <td className="p-2">{item.orderQty}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mt-5 -ml-[27.5rem]">Others</h3>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853] -ml-20">
                                    <table className="text-left" style={{ width: "430px", borderCollapse: "collapse" }}>
                                        <thead className="bg-[#FAF6ED]">
                                            <tr>
                                                <th className="font-extrabold p-2">S.No</th>
                                                <th className="p-2 w-44 font-extrabold">Product Variant</th>
                                                <th className="p-2 w-44 font-extrabold">Color</th>
                                                <th className="w-16 font-extrabold">Order Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>

                )}
            </div>
            {isCeilingCoatPopup && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={closeCeilingCoatPopup}>
        <div
            className="bg-white rounded-md w-[52rem] py-2"
            onClick={(e) => e.stopPropagation()} // Stop propagation when clicking inside the popup
        >
            <div className="flex mb-4 mt-2">
                <label className="text-[#E4572E] text-xl font-bold ml-[2%]">Ceiling Coat</label>
                <button className="text-[#E4572E] ml-[79%]" onClick={closeCeilingCoatPopup}>
                    <img src={cross} alt="close" className="w-4 h-4" />
                </button>
            </div>
            <table className="w-full">
                <thead className="p-2">
                    <tr className="bg-[#FAF6ED]">
                        <th className="py-2 pl-4 text-left">Description</th>
                        <th className="text-left py-2">Paint Variant</th>
                        <th className="text-left p-2">Color Code</th>
                        <th className="py-2">Area</th>
                        <th className="py-2">Wastage</th>
                        <th className="py-2 pr-4">Order Qty</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row, index) => (
                        <tr key={index}>
                            <td className="w-40 border-b py-2 pl-4 text-left">{row.floorName}</td>
                            <td className="text-left w-48 border-b">
                                <select
                                    value={selectedPaintNames[index] || ''}
                                    onChange={(e) => handlePaintNameChange(index, e.target.value)}
                                >
                                    <option value="" disabled>
                                        Select Paint Name..
                                    </option>
                                    {paintVariants.map((variant) => (
                                        <option key={variant.id} value={variant.paintName}>
                                            {variant.paintName}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="text-left w-44 border-b">
                                <select
                                    value={selectedPaintColors[index] || ''}
                                    onChange={(e) => handlePaintColorChange(index, e.target.value)}
                                >
                                    <option value="" disabled>
                                        Select Paint Color..
                                    </option>
                                    {paints.map((paint, i) => (
                                        <option key={i} value={paint.paintColor}>
                                            {paint.paintColor}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="w-28 text-center border-b px-2">{row.totalOrderedTile}</td>
                            <td className="px-2 w-24 border-b">
                                <select
                                    name="wastagePercentage"
                                    value={wastageValues[index] || 0}
                                    className="w-14 focus:outline-none"
                                    onChange={(e) => handleWastageChange(index, e.target.value)}
                                >
                                    {Array.from({ length: 16 }, (_, i) => (
                                        <option key={i} value={i}>
                                            {i}%
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="w-24 border-b py-2 pr-4">{calculateOrderQty(row, index).toFixed(2)}L</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="4" className="h-4"></td>
                    </tr>
                    <tr>
                        <td className="w-40 py-2"></td>
                        <td className="w-40 py-2"></td>
                        <td className="w-40 font-bold text-[#E4572E] text-lg py-2">Total</td>
                        <td className="w-20 font-bold text-[#E4572E] text-lg py-2">{calculateTotalSum()}</td>
                        <td className="w-20 py-2"></td>
                        <td className="w-24 font-bold text-[#E4572E] text-lg py-2">{calculateTotalOrderQty()}L</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
)}

            {isImportPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-md w-[32rem] px-2 py-2">
                        <div>
                            <button className="text-red-500 ml-[95%]" onClick={closeImportPopup}>
                                <img src={cross} alt="close" className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleFileNameSelect}>
                            <div className="flex">
                                <div>
                                    <label className="block -ml-16 text-lg font-medium mb-2">Module Name</label>
                                    <select
                                        className="w-52 ml-6 rounded-lg border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 h-12 focus:outline-none"
                                        value={selectedModule}
                                        onChange={(e) => setSelectedModule(e.target.value)}
                                    >
                                        <option value="" disabled>Select Module...</option>
                                        <option value="Tile Calculation">Tile Calculation</option>
                                        <option value="Paint Calculation">Paint Calculation</option>
                                    </select>
                                </div>
                                <div className="ml-4">
                                    <label className="block text-lg font-medium mb-2 -ml-32">Revision</label>
                                    <Select
                                        placeholder="Select the file..."
                                        className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg w-60 h-12"
                                        styles={customSelectStyles}
                                        options={fileOption}
                                        isClearable
                                        value={selectedFiles}
                                        onChange={(option) => setSelectedFiles(option)}
                                        isDisabled={!clientName}
                                    />

                                </div>
                            </div>
                            <div className="flex space-x-2 mt-6 ml-6 mb-5">
                                <button type="submit" className="bg-[#BF9853] text-white px-8 py-2 rounded-lg font-semibold">
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                                    onClick={closeImportPopup}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">Select an Option</h2>
                        <div className="space-y-2">
                            <div className="flex space-x-[5.2rem]">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="selection"
                                        value="Interior"
                                        checked={selection.includes('Interior')}
                                        onChange={(e) => handleSelectionChange(e.target.value)}
                                    />
                                    <span>Interior</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="selection"
                                        value="With Image"
                                        checked={selection.includes('With Image')}
                                        onChange={(e) => handleSelectionChange(e.target.value)}
                                    />
                                    <span>With Image</span>
                                </label>
                            </div>
                            <div className="flex space-x-20">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="selection"
                                        value="Exterior"
                                        checked={selection.includes('Exterior')}
                                        onChange={(e) => handleSelectionChange(e.target.value)}
                                    />
                                    <span>Exterior</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="selection"
                                        value="Without Image"
                                        checked={selection.includes('Without Image')}
                                        onChange={(e) => handleSelectionChange(e.target.value)}
                                    />
                                    <span>Without Image</span>
                                </label>
                            </div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="selection"
                                    value="Both"
                                    checked={selection.includes('Both')}
                                    onChange={(e) => handleSelectionChange(e.target.value)}
                                />
                                <span>Both</span>
                            </label>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                                onClick={handleCloseModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-8 py-2 border rounded-lg bg-[#007233] text-white hover:bg-[#005522]"
                                onClick={handleConfirm}
                                disabled={!selection}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isModalOpenOC && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">Select an Option</h2>
                        <div className="space-y-2">
                            <div className="flex space-x-[5.2rem]">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="ocSelection"
                                        value="Interior"
                                        checked={ocSelection.includes('Interior')}
                                        onChange={(e) => handleOCSelectionChange(e.target.value)}
                                    />
                                    <span>Interior</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="ocSelection"
                                        value="With Image"
                                        checked={ocSelection.includes('With Image')}
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
                                        value="Exterior"
                                        checked={ocSelection.includes('Exterior')}
                                        onChange={(e) => handleOCSelectionChange(e.target.value)}
                                    />
                                    <span>Exterior</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="ocSelection"
                                        value="Without Image"
                                        checked={ocSelection.includes('Without Image')}
                                        onChange={(e) => handleOCSelectionChange(e.target.value)}
                                    />
                                    <span>Without Image</span>
                                </label>
                            </div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="ocSelection"
                                    value="Both"
                                    checked={ocSelection.includes('Both')}
                                    onChange={(e) => handleOCSelectionChange(e.target.value)}
                                />
                                <span>Both</span>
                            </label>
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
                                onClick={handleConfirmOC}
                                disabled={!ocSelection}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isModalOpenSC && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">Select an Option</h2>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="scSelection"
                                    value="Interior"
                                    checked={scSelection === 'Interior'}
                                    onChange={(e) => setSCSelection(e.target.value)}
                                />
                                <span>Interior</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="scSelection"
                                    value="Exterior"
                                    checked={scSelection === 'Exterior'}
                                    onChange={(e) => setSCSelection(e.target.value)}
                                />
                                <span>Exterior</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="scSelection"
                                    value="Both"
                                    checked={scSelection === 'Both'}
                                    onChange={(e) => setSCSelection(e.target.value)}
                                />
                                <span>Both</span>
                            </label>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={handleCloseModalSC}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-[#007233] text-white rounded hover:bg-[#005522]"
                                onClick={handleConfirmSC}
                                disabled={!scSelection}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isModalOpenEC && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">Select an Option</h2>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="ecSelection"
                                    value="Interior"
                                    checked={ecSelection === 'Interior'}
                                    onChange={(e) => setECSelection(e.target.value)}
                                />
                                <span>Interior</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="ecSelection"
                                    value="Exterior"
                                    checked={ecSelection === 'Exterior'}
                                    onChange={(e) => setECSelection(e.target.value)}
                                />
                                <span>Exterior</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="ecSelection"
                                    value="Both"
                                    checked={ecSelection === 'Both'}
                                    onChange={(e) => setECSelection(e.target.value)}
                                />
                                <span>Both</span>
                            </label>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={handleCloseModalEC}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-[#007233] text-white rounded hover:bg-[#005522]"
                                onClick={handleConfirmEC}
                                disabled={!ecSelection}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </body>
    );
};
export default DesignTool;