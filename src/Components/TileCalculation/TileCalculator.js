import React, { useState, useEffect, useRef, useCallback } from "react";
import Select from "react-select";
import delt from '../Images/Worng.svg';
import add from '../Images/Right.svg';
import change from '../Images/change.png';
import refresh from '../Images/refresh.png';
import deletes from '../Images/Delete.svg';
import jsPDF from 'jspdf';
import cross from '../Images/cross.png';
import loadingScreen from '../Images/AAlogoBlackSVG.svg';
import CreatableSelect from 'react-select/creatable';
import { evaluate } from 'mathjs';
import "jspdf-autotable";
function PopupModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 shadow-lg relative">
                <div className="flex justify-center mb-4">
                    <div className="text-green-500 text-5xl">
                        <i className="fas fa-check-circle"></i>
                    </div>
                </div>
                <h2 className="text-center text-lg font-bold mb-2">Your file Saved successfully!</h2>
                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                    >
                        Okay
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                    &times;
                </button>
            </div>
        </div>
    );
}
const DesignTool = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullData, setFullData] = useState([]);
    const [tileFloorTypes, setTileFloorTypes] = useState([]);
    const [tileList, setTileList] = useState([]);
    const [tileOptions, setTileOptions] = useState([]);
    const [tileWithImages, setTileWithImages] = useState([]);
    const [filteredFileOptions, setFilteredFileOptions] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState(new Set());
    const [isModalOpen, setModalOpen] = useState(false);
    const [isClientName, setIsClientName] = useState(false);
    const [extraClient, setExtraClient] = useState("");
    const [wastagePercentages, setWastagePercentage] = useState(0);
    const [selectSkirtingArea, setSelectSkiritingArea] = useState(0);
    const [commonRate, setCommonRate] = useState("");
    const [hoveredTile, setHoveredTile] = useState({ floorIndex: null, tileIndex: null });
    const [hoveredTileB, setHoveredTileB] = useState({ floorIndex: null, tileIndex: null });
    const [hoveredTileH, setHoveredTileH] = useState({ floorIndex: null, tileIndex: null });
    const [commonTileName, setCommonTileName] = useState(null);
    const [commonTileSize, setCommonTileSize] = useState(null);
    const [rateByType, setRateByType] = useState({});
    const [rows, setRows] = useState([
        { tileName: "", size: "", qtyPerBox: "", numberOfBoxes: "" },
    ]);
    const [floors, setFloors] = useState([
        {
            floorName: "Ground Floor",
            areaName: "",
            tiles: [
                {
                    type: "Floor Tile", length: "", lengthInput: "", breadth: "", breadthInput: "", height: "", heightInput: "", deductionThickness: "", deductionThicknessInputs: "", deductionArea: "", deductionInput: "", deduction1: "",
                    deduction2: "", deduction3: "", deduction4: "", deduction5: "", deduction6: "", deduction7: "", deduction8: "", deduction9: "", deduction10: "", deduction11: "",
                    deduction12: "", deduction13: "", deduction14: "", deduction15: "", deduction16: "", wastagePercentage: "0", skirtingArea: "", rate: "", vendor: "",
                },
            ],
        },
    ]);
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
    const calculateSkirtingArea = (tile, areaName) => {
        const length = parseFeetInches(tile.length);
        const breadth = parseFeetInches(tile.breadth);
        const height = parseFeetInches(tile.height);
        const selectedSkirtingArea = selectSkirtingArea;
        // Skip skirting if areaName contains "bath" or "toilet" (case-insensitive)
        const name = areaName?.toLowerCase() || '';
        if (name.includes('bath') || name.includes('toilet')) {
            return 0;
        }
        if (!length || (!breadth && !height)) return 0;
        let skirtingArea = 0;
        if (tile.type === "Floor Tile") {
            const perimeter = (2 * length) + (2 * breadth);
            const skirtingHeight = (selectedSkirtingArea / 12).toFixed(2); // inches to feet
            skirtingArea = perimeter * skirtingHeight;
        }
        return skirtingArea;
    };
    const handleSkirtingAreaChange = (selectedOption) => {
        if (!selectedOption) return;
        const selectedValue = parseInt(selectedOption.value, 10);
        setSelectSkiritingArea(selectedValue);
        setFloors((prevFloors) =>
            prevFloors.map((floor) => {
                const updatedTiles = floor.tiles.map((tile) => {
                    if (tile.type === "Floor Tile") {
                        const newSkirtingArea = calculateSkirtingArea(tile, floor.areaName);
                        return {
                            ...tile,
                            skirtingArea: newSkirtingArea,
                            isUserChanged: false,
                        };
                    }
                    return tile;
                });
                return {
                    ...floor,
                    tiles: updatedTiles,
                };
            })
        );
    };
    const [commonVendor, setCommonVendor] = useState('');
    const [ocTileSelection, setOCTileSelection] = useState('');
    const [customerCopyPDFSelect, setCustomerCopyPDFSelect] = useState('');
    const [isModalTileOpenOC, setIsModalTileOpenOC] = useState(false);
    const [isCustomerCopyPdfSelect, setIsCustomerCopyPdfSelect] = useState(false);
    const [isFloorSelectOpen, setIsFloorSelectOpen] = useState(false);
    const [selectedFloorName, setSelectedFloorName] = useState([]);
    const [isVendorSelectOpen, setIsVendorSelectOpen] = useState(false);
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [availableVendors, setAvailableVendors] = useState([]);
    const [isTileBillOpen, setIsTileBillOpen] = useState(false);
    const [floorRateSelect, setFloorRateSelect] = useState('');
    const [skirtingAreaRate, setSkirtingAreaRate] = useState('');
    const [deductionPopupState, setDeductionPopupState] = useState({});
    const [deductionPopupData, setDeductionPopupData] = useState({});
    const [deductionInputs, setDeductionInputs] = useState({});
    const [deductionRowWiseInputs, setDeductionRowWiseInputs] = useState({});
    const [eno, setEno] = useState(null);
    const [clientName, setClientName] = useState(null);
    const [clientSNo, setClientSNo] = useState("");
    const [selectedClientData, setSelectedClientData] = useState({});
    const [calculationData, setCalculationData] = useState(null);
    const currentDate = new Date().toLocaleDateString();
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileOptions, setFileOptions] = useState([]);
    const inputRef = useRef(null);
    const evaluateExpression = (expression) => {
        try {
            const sanitizedExpression = expression.replace(/x|X/g, '*').replace(/[^\d+\-*/().\s]/g, '');
            return evaluate(sanitizedExpression);
        } catch (error) {
            console.error("Invalid mathematical expression:", expression);
            return 0;
        }
    };
    const updateDeductionInputs = (floorIndex, tileIndex) => {
        const deductionData = deductionPopupData[`${floorIndex}-${tileIndex}`] || [];
        const formattedMeasurement = deductionData
            .filter((row) => row.measurement)
            .map((row) => {
                if (row.measurement && row.qty) {
                    return `((${row.measurement}) x ${row.qty})`;
                } else if (row.measurement) {
                    return `${row.measurement}`;
                }
                return '';
            })
            .join(" + ");
        if (deductionData.some((row) => parseFloat(row.qty) > 0)) {
            setDeductionInputs((prevState) => ({
                ...prevState,
                [`${floorIndex}-${tileIndex}`]: formattedMeasurement || "0 x 1",
            }));
        }
        const formattedRows = deductionData.map((row) => {
            const evaluatedMeasurement = row.measurement ? evaluateExpression(row.measurement) : 0;
            const output = evaluatedMeasurement * (parseFloat(row.qty) || 0);
            row.output = output.toString() || '';
            return `${row.type || " "}, ${row.measurement || ''}, ${row.qty || ''},${row.location || "Wall"}, ${row.thickness || "Wall"}, ${row.deductionThickness || "Wall"}, ${output || ''}`;
        });
        setDeductionRowWiseInputs((prevState) => ({
            ...prevState,
            [`${floorIndex}-${tileIndex}`]: formattedRows.join("\n"),
        }));
    };
    const handleRateChange = (e, floorIndex, tileIndex) => {
        const { value } = e.target;
        const updatedFloors = floors.map((floor, fIndex) => {
            if (fIndex === floorIndex) {
                return {
                    ...floor,
                    tiles: floor.tiles.map((tile, tIndex) => {
                        if (tIndex === tileIndex) {
                            return { ...tile, rate: value };
                        }
                        return tile;
                    }),
                };
            }
            return floor;
        });
        setFloors(updatedFloors);
    };
    const handleTileBillClick = () => {
        setIsTileBillOpen(true);
    }
    const preprocessFloors = (calculationData) => {
        let lastValidFloorName = '';
        return calculationData.map((floor) => {
            if (!floor.floorName || floor.floorName.trim() === '') {
                return {
                    ...floor,
                    floorName: lastValidFloorName
                };
            } else {
                lastValidFloorName = floor.floorName;
                return floor;
            }
        });
    };
    const getMismatchedFloors = () => {
        const processedFloors = preprocessFloors(calculationData.calculations);
        const mismatches = [];
        if (!selectedClientData || !selectedClientData.calculations) {
            console.error("selectedClientData or calculations are missing!");
            mismatches.push({
                type: 'Missing Calculations',
                message: 'No calculations found for selectedClientData'
            });
            return mismatches;
        }
        const calculations = selectedClientData.calculations;
        if (calculations.length !== processedFloors.length) {
            mismatches.push({
                type: 'Length Mismatch',
                calculationsLength: calculations.length,
                floorsLength: processedFloors.length
            });
        }
        for (let i = 0; i < processedFloors.length; i++) {
            const calc = calculations[i];
            const floor = processedFloors[i];
            const diff = {};
            const calcFloorName = calc.floorName?.trim() || '';
            const floorFloorName = floor.floorName?.trim() || '';
            const calcAreaName = calc.areaName?.trim() || '';
            const floorAreaName = floor.areaName?.trim() || '';
            if (calcFloorName !== floorFloorName) {
                diff.floorName = {
                    expected: calcFloorName,
                    actual: floorFloorName
                };
            }
            if (calcAreaName !== floorAreaName) {
                diff.areaName = {
                    expected: calcAreaName,
                    actual: floorAreaName
                };
            }
            const sanitizeTiles = (tiles) => {
                if (!tiles) return [];
                return tiles.map(tile => {
                    const {
                        id,
                        actualQuantity,
                        deductionThickness,
                        deductionThicknessInputs,
                        isUserChanged,
                        vendor,
                        vendors,
                        ...rest
                    } = tile;
                    const normalizedIsUserChanged =
                        rest.isUserChanged === "" ||
                            rest.isUserChanged === null ||
                            rest.isUserChanged === false ||
                            rest.isUserChanged === undefined
                            ? "false"
                            : String(rest.isUserChanged);
                    const normalizeValue = (value) => {
                        if (value === null || value === undefined) return "";
                        if (!isNaN(value) && value !== "") return Number(value);
                        return String(value).trim();
                    };
                    return {
                        ...rest,
                        isUserChanged: normalizedIsUserChanged,
                        areaInSqft: normalizeValue(rest.areaInSqft),
                        breadth: normalizeValue(rest.breadth),
                        correctQuantityBox: normalizeValue(rest.correctQuantityBox),
                        deductionArea: normalizeValue(rest.deductionArea),
                        height: normalizeValue(rest.height),
                        length: normalizeValue(rest.length),
                        noOfBoxes: normalizeValue(rest.noOfBoxes),
                        qtyPerBox: normalizeValue(rest.qtyPerBox),
                        rate: normalizeValue(rest.rate),
                        skirtingArea: normalizeValue(rest.skirtingArea),
                        totalOrderedTile: normalizeValue(rest.totalOrderedTile),
                        wastagePercentage: normalizeValue(rest.wastagePercentage),
                    };
                });
            };
            const sanitizedCalcTiles = sanitizeTiles(calc.tiles);
            const sanitizedFloorTiles = sanitizeTiles(floor.tiles);
            const tileDifferences = [];
            sanitizedCalcTiles.forEach((calcTile, tileIndex) => {
                const floorTile = sanitizedFloorTiles[tileIndex];
                if (!floorTile) {
                    tileDifferences.push({
                        tileIndex,
                        issue: 'Missing tile in floor data',
                        expected: calcTile
                    });
                    return;
                }
                const tileDiff = {};
                Object.keys(calcTile).forEach(key => {
                    if (calcTile[key] !== floorTile[key]) {
                        tileDiff[key] = {
                            expected: calcTile[key],
                            actual: floorTile[key]
                        };
                    }
                });
                if (Object.keys(tileDiff).length > 0) {
                    tileDifferences.push({
                        tileIndex,
                        differences: tileDiff
                    });
                }
            });
            if (sanitizedFloorTiles.length > sanitizedCalcTiles.length) {
                for (let j = sanitizedCalcTiles.length; j < sanitizedFloorTiles.length; j++) {
                    tileDifferences.push({
                        tileIndex: j,
                        issue: 'Extra tile in floor data',
                        actual: sanitizedFloorTiles[j]
                    });
                }
            }
            if (tileDifferences.length > 0) {
                diff.tiles = tileDifferences;
            }
            if (Object.keys(diff).length > 0) {
                mismatches.push({
                    index: i,
                    differences: diff
                });
            }
        }
        return mismatches;
    };
    const handleConfirmTileBill = () => {
        const mismatches = getMismatchedFloors();
        if (floorRateSelect === 'With Rate' || floorRateSelect === 'Without Rate') {
            extractTileBillData();
        }
        if (mismatches.length > 0) {
            console.log(mismatches);
            console.log("Not Match!!!!!!!!!");
            handleSubmitWithTileBile();
        } else {
            console.log('No mismatches found. Proceeding...');
        }
        setFloorRateSelect([]);
        setIsTileBillOpen(false);
    };
    const handleCloseTileBill = () => {
        setFloorRateSelect([]);
        setIsTileBillOpen(false);
    }
    const deductionType = [
        { value: "MD - 1", label: "MD - 1" },
        { value: "MD - 2", label: "MD - 2" },
        { value: "MD - 3", label: "MD - 3" },
        { value: "MD - 4", label: "MD - 4" },
        { value: "MD - 5", label: "MD - 5" },
        { value: "D - 1", label: "D - 1" },
        { value: "D - 2", label: "D - 2" },
        { value: "D - 3", label: "D - 3" },
        { value: "D - 4", label: "D - 4" },
        { value: "D - 5", label: "D - 5" },
        { value: "W - 1", label: "W - 1" },
        { value: "W - 2", label: "W - 2" },
        { value: "W - 3", label: "W - 3" },
        { value: "W - 4", label: "W - 4" },
        { value: "W - 5", label: "W - 5" },
        { value: "W - 6", label: "W - 6" },
        { value: "W - 7", label: "W - 7" },
        { value: "W - 8", label: "W - 8" },
        { value: "W - 9", label: "W - 9" },
        { value: "W - 10", label: "W - 10" },
        { value: "V - 1", label: "V - 1" },
        { value: "V - 2", label: "V - 2" },
        { value: "V - 3", label: "V - 3" },
        { value: "V - 4", label: "V - 4" },
        { value: "V - 5", label: "V - 5" },
        { value: "KO - 1", label: "KO - 1" },
        { value: "KO - 2", label: "KO - 2" },
        { value: "KO - 3", label: "KO - 3" },
        { value: "KO - 4", label: "KO - 4" },
        { value: "KO - 5", label: "KO - 5" },
        { value: "AO - 1", label: "AO - 1" },
        { value: "AO - 2", label: "AO - 2" },
        { value: "AO - 3", label: "AO - 3" },
        { value: "AO - 4", label: "AO - 4" },
        { value: "AO - 5", label: "AO - 5" },
    ];
    const deductionMeasurment = [
        { value: "3 X 7", label: "3 X 7" },
        { value: "3.5 X 7", label: "3.5 X 7" },
        { value: "4 X 7", label: "4 X 7" },
        { value: "4.5 X 7", label: "4.5 X 7" },
        { value: "5 X 7", label: "5 X 7" },
        { value: "5.5 X 7", label: "5.5 X 7" },
        { value: "2.5 X 7", label: "2.5 X 7" },
        { value: "3.25 X 7", label: "3.25 X 7" },
        { value: "4 X 4", label: "4 X 4" },
        { value: "4.5 X 4", label: "4.5 X 4" },
        { value: "3.5 X 4", label: "3.5 X 4" },
        { value: "3 X 4", label: "3 X 4" },
        { value: "3 X 3", label: "3 X 3" },
        { value: "2 X 4", label: "2 X 4" },
        { value: "6 X 4", label: "6 X 4" },
        { value: "5 X 4", label: "5 X 4" },
        { value: "2 X 2", label: "2 X 2" },
        { value: "3 X 2", label: "3 X 2" },
        { value: "1.5 X 1.5", label: "1.5 X 1.5" },
    ]
    const deductionThickness = [
        { value: "0\"", label: "0\"" },
        { value: "1\"", label: "1\"" },
        { value: "2\"", label: "2\"" },
        { value: "3\"", label: "3\"" },
        { value: "4\"", label: "4\"" },
        { value: "5\"", label: "5\"" },
        { value: "6\"", label: "6\"" },
        { value: "7\"", label: "7\"" },
        { value: "8\"", label: "8\"" },
        { value: "9\"", label: "9\"" },
        { value: "10\"", label: "10\"" },
        { value: "11\"", label: "11\"" },
        { value: "12\"", label: "12\"" },
    ];
    const handlePopupDataChange = (floorIndex, tileIndex, updatedData) => {
        setDeductionPopupData((prevData) => ({
            ...prevData,
            [`${floorIndex}-${tileIndex}`]: updatedData,
        }));
    };
    const handleMeasurementChange = (selectedOption, floorIndex, tileIndex, index) => {
        const updatedData = [...(deductionPopupData[`${floorIndex}-${tileIndex}`] || [])];
        if (!updatedData[index]) updatedData[index] = {};
        updatedData[index].measurement = selectedOption?.value || "";
        if (!updatedData[index].measurement) {
            updatedData[index].thickness = '0"';
            updatedData[index].deductionThickness = "0.00";
        }
        handlePopupDataChange(floorIndex, tileIndex, updatedData);
        updateDeductionInputs(floorIndex, tileIndex);
    };
    const handleQtyChange = (e, floorIndex, tileIndex, index) => {
        const updatedData = [...(deductionPopupData[`${floorIndex}-${tileIndex}`] || [])];
        if (!updatedData[index]) updatedData[index] = {};
        const newQty = e.target.value;
        updatedData[index].qty = newQty;
        const measurementValue = updatedData[index]?.measurement || "";
        const qty = parseFloat(newQty) || 0;
        const measurementParts = measurementValue
            .split(/x|X/)
            .map((item) => parseFloat(item.trim()));
        const output = (measurementParts?.[0] * measurementParts?.[1] || 0) * qty;
        updatedData[index].output = output.toString();
        setDeductionPopupData((prevData) => ({
            ...prevData,
            [`${floorIndex}-${tileIndex}`]: updatedData,
        }));
        setTimeout(() => updateDeductionInputs(floorIndex, tileIndex), 0);
    };
    const handleTypeChange = (selectedOption, floorIndex, tileIndex, index) => {
        setDeductionPopupData((prevData) => {
            const updatedData = { ...prevData };
            const key = `${floorIndex}-${tileIndex}`;
            if (!updatedData[key]) {
                updatedData[key] = [];
            }
            if (!updatedData[key][index]) {
                updatedData[key][index] = {};
            }
            updatedData[key][index].type = selectedOption ? selectedOption.value : "";
            const measurement = updatedData[key][index].measurement || "";
            const thicknessValue = parseFloat(updatedData[key][index].thickness) || 0;
            const location = updatedData[key][index].location;
            if (location === "Floor") {
                updatedData[key][index].deductionThickness = "0.00";
            } else if (measurement && thicknessValue) {
                const [length, breadth] = measurement.split(/x|X/).map(num => parseFloat(num.trim()));
                if (!isNaN(length) && !isNaN(breadth)) {
                    let calculatedThickness;
                    if (/^W\s*-|^w\s*-/.test(updatedData[key][index].type)) {
                        calculatedThickness = ((length + breadth + length + breadth) * (thicknessValue / 12));
                    } else {
                        calculatedThickness = ((length + breadth + breadth) * (thicknessValue / 24));
                    }
                    updatedData[key][index].deductionThickness = calculatedThickness.toFixed(2);
                }
            }
            return { ...updatedData };
        });
        updateTotalThickness(floorIndex, tileIndex);
    };
    const handleThicknessChange = (selectedOption, floorIndex, tileIndex, index) => {
        setDeductionPopupData((prevData) => {
            const updatedData = { ...prevData };
            const key = `${floorIndex}-${tileIndex}`;
            if (!updatedData[key]) {
                updatedData[key] = [];
            }
            if (!updatedData[key][index]) {
                updatedData[key][index] = {};
            }
            const measurement = updatedData[key][index].measurement || "";
            if (!measurement) {
                updatedData[key][index].thickness = '0"';
                updatedData[key][index].deductionThickness = "0.00";
            } else {
                updatedData[key][index].thickness = selectedOption ? selectedOption.value : "";
                const type = (updatedData[key][index].type || "N/A").trim();
                if (selectedOption) {
                    const [length, breadth] = measurement.split(/x|X/).map(num => parseFloat(num.trim()));
                    if (!isNaN(length) && !isNaN(breadth)) {
                        const thicknessValue = parseFloat(selectedOption.value) || 0;
                        let calculatedThickness;
                        let formulaUsed = "";
                        if (/^W\s*-|^w\s*-/.test(type)) {
                            calculatedThickness = ((length + breadth + length + breadth) * (thicknessValue / 12));
                            formulaUsed = `(${length} + ${breadth} + ${length} + ${breadth}) * (${thicknessValue} / 12)`;
                        } else {
                            calculatedThickness = ((length + breadth + breadth) * (thicknessValue / 24));
                            formulaUsed = `(${length} + ${breadth} + ${breadth}) * (${thicknessValue} / 24)`;
                        }
                        updatedData[key][index].deductionThickness = calculatedThickness.toFixed(2);
                    } else {
                        updatedData[key][index].deductionThickness = "0.00";
                    }
                } else {
                    updatedData[key][index].deductionThickness = "0.00";
                }
            }
            return { ...updatedData };
        });
        updateDeductionInputs(floorIndex, tileIndex);
        updateTotalThickness(floorIndex, tileIndex);
    };
    const getTotalThickness = (floorIndex, tileIndex) => {
        const key = `${floorIndex}-${tileIndex}`;
        const data = deductionPopupData[key] || [];
        if (data.length === 0) return { total: "0.00", formattedValues: "" };
        const values = data
            .map((item) => (parseFloat(item?.deductionThickness) || 0).toFixed(2))
            .filter((val) => val !== "0.00");
        if (values.length === 0) return { total: "0.00", formattedValues: "" };
        const total = values.reduce((sum, val) => sum + parseFloat(val), 0).toFixed(2);
        const formattedValues = values.join(" + ");
        return { total, formattedValues };
    };
    const updateTotalThickness = (floorIndex, tileIndex) => {
        const { total, formattedValues } = getTotalThickness(floorIndex, tileIndex);
        setFloors((prevFloors) =>
            prevFloors.map((floor, fIndex) => {
                if (fIndex === floorIndex) {
                    return {
                        ...floor,
                        tiles: floor.tiles.map((tile, tIndex) => {
                            if (tIndex === tileIndex) {
                                return {
                                    ...tile,
                                    deductionThickness: total === "0.00" ? "0.00" : total,
                                    deductionThicknessInputs: formattedValues
                                };
                            }
                            return tile;
                        }),
                    };
                }
                return floor;
            })
        );
    };
    const handleDeductionChange = useCallback((floorIndex, tileIndex) => {
        const input = deductionInputs[`${floorIndex}-${tileIndex}`];
        const input1 = deductionRowWiseInputs[`${floorIndex}-${tileIndex}`];
        if (!input1) return;
        const rows = input1.split("\n").slice(0, 8);
        try {
            const formattedInput = input ? input.replace(/x|X/g, '*').replace(/'/g, "") : null;
            const result = formattedInput ? evaluate(formattedInput) : 0;
            setFloors((prevFloors) => {
                return prevFloors.map((floor, fIdx) => {
                    if (fIdx !== floorIndex) return floor;
                    return {
                        ...floor,
                        tiles: floor.tiles.map((tile, tIdx) => {
                            if (tIdx !== tileIndex) return tile;
                            return {
                                ...tile,
                                deductionArea: result,
                                deductionInput: input,
                                ...Object.fromEntries(rows.map((row, index) => [`deduction${index + 1}`, row])),
                                ...Object.fromEntries([...Array(8 - rows.length).keys()].map(i => [`deduction${rows.length + i + 1}`, '']))
                            };
                        }),
                    };
                });
            });
        } catch (error) {
            console.error('Invalid calculation! Please check your input.', error);
        }
    }, [deductionInputs, deductionRowWiseInputs]);
    useEffect(() => {
        floors.forEach((floor, floorIndex) => {
            floor.tiles.forEach((tile, tileIndex) => {
                handleDeductionChange(floorIndex, tileIndex);
            });
        });
    }, [deductionInputs, deductionRowWiseInputs]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setIsClientName(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    useEffect(() => {
        const savedClientName = sessionStorage.getItem('clientName');
        const savedClientSNo = sessionStorage.getItem('clientSNo');
        const savedFloors = sessionStorage.getItem('floors');
        const savedFilteredFileOptions = sessionStorage.getItem('filteredFileOptions');
        const savedSelectedFile = sessionStorage.getItem('selectedFile');
        const savedSelectedSkirtingArea = sessionStorage.getItem('selectedSkirtingArea');
        const savedWastagePercentage = sessionStorage.getItem('wastagePercentages');
        try {
            if (savedClientName) setClientName(JSON.parse(savedClientName));
            if (savedClientSNo) setClientSNo(savedClientSNo);
            if (savedFloors) setFloors(JSON.parse(savedFloors));
            if (savedFilteredFileOptions) setFilteredFileOptions(JSON.parse(savedFilteredFileOptions));
            if (savedSelectedFile) setSelectedFile(JSON.parse(savedSelectedFile));
            if (savedSelectedSkirtingArea) setSelectSkiritingArea(JSON.parse(savedSelectedSkirtingArea));
            if (savedWastagePercentage) setWastagePercentage(JSON.parse(savedWastagePercentage));
        } catch (error) {
            console.error("Error parsing sessionStorage data:", error);
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    const handleBeforeUnload = () => {
        sessionStorage.removeItem('clientName');
        sessionStorage.removeItem('clientSNo');
        sessionStorage.removeItem('filteredFileOptions');
        sessionStorage.removeItem('selectedSkirtingArea');
        sessionStorage.removeItem('wastagePercentages');
        sessionStorage.removeItem('floors');
        sessionStorage.removeItem('rows');
    };
    useEffect(() => {
        if (clientName) sessionStorage.setItem('clientName', JSON.stringify(clientName));
        if (clientSNo) sessionStorage.setItem('clientSNo', clientSNo);
        sessionStorage.setItem('floors', JSON.stringify(floors));
        sessionStorage.setItem('filteredFileOptions', JSON.stringify(filteredFileOptions));
        if (selectedFile) sessionStorage.setItem('selectedFile', JSON.stringify(selectedFile));
        if (selectSkirtingArea) sessionStorage.setItem('selectedSkirtingArea', JSON.stringify(selectSkirtingArea));
        if (wastagePercentages) sessionStorage.setItem('wastagePercentages', JSON.stringify(wastagePercentages));
    }, [clientName, clientSNo, floors, filteredFileOptions, selectedFile, selectSkirtingArea, wastagePercentages]);
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
    const fetchCalculations = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/tile/all');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data.length > 0) {
                const lastEno = Math.max(...data.map(item => item.eno));
                setEno(lastEno + 1);
            } else {
                setEno(100);
            }
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
        fetchCalculations();
    }, []);
    const parseFeetInches = (value) => {
        if (!value || typeof value !== "string") return 0;
        const feetInchMatch = value.match(/^(\d+)'(\d+)"?$/);
        if (feetInchMatch) {
            const feet = parseInt(feetInchMatch[1]);
            const inches = parseInt(feetInchMatch[2]);
            return feet + inches / 12;
        }
        const feetOnlyMatch = value.match(/^(\d+)'$/);
        if (feetOnlyMatch) {
            const feet = parseInt(feetOnlyMatch[1]);
            return feet;
        }
        const inchesOnlyMatch = value.match(/^(\d+)"$/);
        if (inchesOnlyMatch) {
            const inches = parseInt(inchesOnlyMatch[1]);
            return inches / 12;
        }
        if (!isNaN(Number(value))) {
            return Number(value);
        }
        return 0;
    };
    const convertDecimalFeetToFeetInches = (decimalFeet) => {
        const feet = Math.floor(decimalFeet);
        const remainingFeet = decimalFeet - feet;
        const inches = Math.round(remainingFeet * 12);
        if (inches === 12) {
            return `${feet + 1}'0"`;
        }
        return `${feet}'${inches}"`;
    };
    const parseFeetInchesExpression = (expression) => {
        const formattedExpression = /^[+-]/.test(expression.trim()) ? expression : `+${expression}`;
        const parts = formattedExpression.match(/[+-]?\s*[^+-]+/g);
        if (!parts) {
            return expression;
        }
        let totalInches = 0;
        for (let part of parts) {
            const trimmedPart = part.trim();
            const sign = trimmedPart.startsWith('-') ? -1 : 1;
            const cleanPart = trimmedPart.replace(/^[+-]/, '').trim();
            const inches = parseFeetInches(cleanPart);
            if (isNaN(inches)) {
                return expression;
            }
            totalInches += sign * inches;
        }
        return convertDecimalFeetToFeetInches(totalInches);
    };
    const handleSiteChange = (selected) => {
        setClientName(selected);
        setClientSNo(selected ? selected.sNo : "");
        if (selected) {
            const clientNameFromSite = selected.value;
            const filteredOptions = fileOptions.filter(option => option.clientName === clientNameFromSite);
            setFilteredFileOptions(filteredOptions);
            sessionStorage.setItem('clientName', JSON.stringify(selected));
            sessionStorage.setItem('clientSNo', selected.sNo);
            sessionStorage.setItem('filteredFileOptions', JSON.stringify(filteredOptions));
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
            sessionStorage.removeItem('clientName');
            sessionStorage.removeItem('clientSNo');
            sessionStorage.removeItem('filteredFileOptions');
            sessionStorage.removeItem('selectedFile');
            sessionStorage.removeItem('selectedClientData');
            sessionStorage.removeItem('floors');
            sessionStorage.removeItem('rows');
        }
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
                console.error('Error fetching tile floor types.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const openDeductionPopup = (floorIndex, tileIndex) => {
        const key = `${floorIndex}-${tileIndex}`;
        setDeductionPopupData((prevData) => {
            if (prevData[key]) {
                return prevData;
            }
            const deductions = [
                floors[floorIndex]?.tiles[tileIndex]?.deduction1,
                floors[floorIndex]?.tiles[tileIndex]?.deduction2,
                floors[floorIndex]?.tiles[tileIndex]?.deduction3,
                floors[floorIndex]?.tiles[tileIndex]?.deduction4,
                floors[floorIndex]?.tiles[tileIndex]?.deduction5,
                floors[floorIndex]?.tiles[tileIndex]?.deduction6,
                floors[floorIndex]?.tiles[tileIndex]?.deduction7,
                floors[floorIndex]?.tiles[tileIndex]?.deduction8,
                floors[floorIndex]?.tiles[tileIndex]?.deduction9,
                floors[floorIndex]?.tiles[tileIndex]?.deduction10,
                floors[floorIndex]?.tiles[tileIndex]?.deduction11,
                floors[floorIndex]?.tiles[tileIndex]?.deduction12,
                floors[floorIndex]?.tiles[tileIndex]?.deduction13,
                floors[floorIndex]?.tiles[tileIndex]?.deduction14,
                floors[floorIndex]?.tiles[tileIndex]?.deduction15,
                floors[floorIndex]?.tiles[tileIndex]?.deduction16,
            ];
            const processedDeductions = deductions.map((deduction, index) => {
                if (deduction) {
                    const splitData = deduction.split(',').map((val) => val.trim());
                    const row = {
                        type: splitData[0] || '',
                        measurement: splitData[1] || '',
                        qty: splitData[2] || '1',
                        location: splitData[3] || '',
                        thickness: splitData[4] || '0"',
                        deductionThickness: splitData[5] || '',
                        output: splitData[6] || ''
                    };
                    return row;
                }
                return null;
            }).filter(row => row !== null);
            const formattedData = processedDeductions.length > 0 ? {
                [key]: processedDeductions,
            } : {};
            return {
                ...prevData,
                ...formattedData,
            };
        });
        setDeductionPopupState((prevState) => ({
            ...prevState,
            [key]: true,
        }));
    };
    const closeDeductionPopup = (floorIndex, tileIndex) => {
        setDeductionPopupState((prevState) => ({
            ...prevState,
            [`${floorIndex}-${tileIndex}`]: false,
        }));
    };
    const [floorOptions, setFloorOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState([]);
    const [tileVendorOptions, setTileVendorOptions] = useState([]);
    const calculateSkirtingAreas = (tile, areaName) => {
        const name = areaName?.toLowerCase() || '';
        if (name.includes('bath') || name.includes('toilet')) {
            return 0;
        }
        if (tile.type === "Floor Tile" && tile.isUserChanged === false) {
            const length = parseFeetInches(tile.length);
            const breadth = parseFeetInches(tile.breadth);
            const height = parseFeetInches(tile.height);
            const selectedSkirtingArea = selectSkirtingArea;
            if (!length || (!breadth && !height)) return 0;
            const perimeter = (2 * length) + (2 * breadth);
            const skirtingHeight = (selectedSkirtingArea / 12).toFixed(2);
            const skirtingArea = perimeter * skirtingHeight;
            return skirtingArea;
        }
        return tile.skirtingArea;
    };
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
                const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/vendor/getAll');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const vendors = data.map(item => item.tileVendor);
                setTileVendorOptions([...new Set(vendors)]);
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
    const summaryMap = {};
    let lastValidFloorName = "";
    floors.forEach((floor) => {
        const currentFloorName = floor.floorName || lastValidFloorName;
        if (floor.floorName) {
            lastValidFloorName = floor.floorName;
        }
        floor.tiles.forEach((tile) => {
            const length = parseFeetInches(tile.length || 0);
            const breadth = parseFeetInches(tile.breadth || 0);
            const height = parseFeetInches(tile.height || 0);
            const wastagePercentage = parseFloat(tile.wastagePercentage || 0);
            const deductionArea = parseFloat(tile.deductionArea || 0);
            let tileArea = 0;
            let skirtingArea = tile.type === "Floor Tile" ? parseFloat(calculateSkirtingAreas(tile, floor.areaName)) : 0;
            const formula = tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula;
            if (formula === 'L x B') {
                tileArea = length * breadth;
            } else if (formula === 'L x H') {
                tileArea = length * height;
            }
            const finalArea = tileArea - deductionArea;
            const actualQuantity = finalArea + skirtingArea;
            const wastage = (wastagePercentage / 100) * actualQuantity;
            const totalOrderedTile = actualQuantity + wastage;
            const qtyPerBox = parseFloat(tile.quantityBox || 1);
            const Areainsqft = parseFloat(tile.areaTile || 1);
            const totalBoxes = totalOrderedTile / (qtyPerBox * Areainsqft);
            const tileKey = `${currentFloorName}-${tile.tileName}-${tile.size}-${tile.vendor}`;
            if (summaryMap[tileKey]) {
                summaryMap[tileKey].totalOrderedQuantity = (
                    parseFloat(summaryMap[tileKey].totalOrderedQuantity) + totalOrderedTile
                ).toFixed(2);
                summaryMap[tileKey].totalBoxes = (
                    parseFloat(summaryMap[tileKey].totalBoxes) + totalBoxes
                ).toFixed(2);
            } else {
                summaryMap[tileKey] = {
                    floorName: currentFloorName,
                    tileName: tile.tileName,
                    tileSize: tile.size,
                    vendor: tile.vendor,
                    totalOrderedQuantity: totalOrderedTile.toFixed(2),
                    totalBoxes: totalBoxes.toFixed(2),
                };
            }
        });
    });
    const summaryMap1 = {};
    let lastValidFloorName1 = "";
    floors.forEach((floor) => {
        const currentFloorName = floor.floorName || lastValidFloorName1;
        if (floor.floorName) {
            lastValidFloorName1 = floor.floorName;
        }
        floor.tiles.forEach((tile) => {
            const length = parseFeetInches(tile.length || 0);
            const breadth = parseFeetInches(tile.breadth || 0);
            const height = parseFeetInches(tile.height || 0);
            const wastagePercentage = parseFloat(tile.wastagePercentage || 0);
            const deductionArea = parseFloat(tile.deductionArea || 0);
            let tileArea = 0;
            let skirtingArea = tile.isUserChanged === true ? Number(tile.skirtingArea) : parseFloat(calculateSkirtingAreas(tile, floor.areaName));
            if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x B') {
                tileArea = length * breadth;
            } else if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x H') {
                tileArea = length * height;
            }
            const finalArea = tileArea - deductionArea;
            const actualQuantity = finalArea + (skirtingArea || 0);
            const wastage = (wastagePercentage / 100) * actualQuantity;
            const totalOrderedTile = actualQuantity + wastage;
            const qtyPerBox = parseFloat(tile.quantityBox || 1);
            const Areainsqft = parseFloat(tile.areaTile || 1);
            const totalBoxes = totalOrderedTile / (qtyPerBox * Areainsqft);
            const tileKey = `${currentFloorName}-${tile.tileName}-${tile.size}`;
            if (summaryMap1[tileKey]) {
                summaryMap1[tileKey].totalOrderedQuantity = (
                    parseFloat(summaryMap1[tileKey].totalOrderedQuantity) + totalOrderedTile
                ).toFixed(2);
                summaryMap1[tileKey].totalBoxes = (
                    parseFloat(summaryMap1[tileKey].totalBoxes) + totalBoxes
                ).toFixed(2);
            } else {
                summaryMap1[tileKey] = {
                    floorName: currentFloorName,
                    tileName: tile.tileName,
                    tileSize: tile.size,
                    vendor: tile.vendor,
                    totalOrderedQuantity: totalOrderedTile.toFixed(2),
                    totalBoxes: totalBoxes.toFixed(2),
                };
            }
        });
    });
    const summary2 = Object.values(summaryMap1);
    const summaryMapByTile = {};
    floors.forEach((floor) => {
        floor.tiles.forEach((tile) => {
            const length = parseFeetInches(tile.length || 0);
            const breadth = parseFeetInches(tile.breadth || 0);
            const height = parseFeetInches(tile.height || 0);
            const wastagePercentage = parseFloat(tile.wastagePercentage || 0);
            const deductionArea = parseFloat(tile.deductionArea || 0);
            let tileArea = 0;
            let skirtingArea = tile.isUserChanged === true
                ? Number(tile.skirtingArea)
                : parseFloat(calculateSkirtingAreas(tile));
            const formula = tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula;
            if (formula === 'L x B') {
                tileArea = length * breadth;
            } else if (formula === 'L x H') {
                tileArea = length * height;
            }
            const finalArea = tileArea - deductionArea;
            const actualQuantity = finalArea + (skirtingArea || 0);
            const wastage = (wastagePercentage / 100) * actualQuantity;
            const totalOrderedTile = actualQuantity + wastage;
            const qtyPerBox = parseFloat(tile.quantityBox || 1);
            const areaInSqft = parseFloat(tile.areaTile || 1);
            const totalBoxes = totalOrderedTile / (qtyPerBox * areaInSqft);
            const tileKey = `${tile.tileName}-${tile.size}`;
            if (summaryMapByTile[tileKey]) {
                summaryMapByTile[tileKey].totalOrderedQuantity = (
                    parseFloat(summaryMapByTile[tileKey].totalOrderedQuantity) + totalOrderedTile
                ).toFixed(2);
                summaryMapByTile[tileKey].totalBoxes = (
                    parseFloat(summaryMapByTile[tileKey].totalBoxes) + totalBoxes
                ).toFixed(2);
            } else {
                // 🔍 Find the matching image (if any)
                const matchingTileImage = tileWithImages.find(
                    img => img.tileName === tile.tileName && img.tileSize === tile.size
                );
                summaryMapByTile[tileKey] = {
                    tileName: tile.tileName,
                    tileSize: tile.size,
                    vendor: tile.vendor,
                    totalOrderedQuantity: totalOrderedTile.toFixed(2),
                    totalBoxes: totalBoxes.toFixed(2),
                    image: matchingTileImage?.image || "", // Add image if available
                };
            }
        });
    });
    const summaryMergedByTile = Object.values(summaryMapByTile);
    const handleAddRow = () => {
        setRows([
            ...rows,
            { tileName: "", size: "", qtyPerBox: "", numberOfBoxes: "" },
        ]);
    };
    useEffect(() => {
        const calculations = floors.map(floor => {
            let totalOrderedQuantity = 0;
            let totalBoxes = 0;
            const floorTiles = floor.tiles.map(tile => {
                const lengthNum = parseFeetInches(tile.length) || 0;
                const breadthNum = tile.type !== "Floor Tile" ? 0 : parseFeetInches(tile.breadth);
                const heightNum = tile.type === "Floor Tile" ? 0 : parseFeetInches(tile.height) || 0;
                const deductionAreaNum = Number(tile.deductionArea) || 0;
                const deductionInputs = tile.deductionInput;
                let tileArea;
                let skirtingArea = Number(tile.skirtingArea);
                if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x B') {
                    tileArea = lengthNum * breadthNum;
                } else if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x H') {
                    tileArea = lengthNum * heightNum;
                }
                const finalArea = tileArea - deductionAreaNum;
                const actualQuantity = finalArea + (skirtingArea || 0);
                const wastagePercentage = (Number(tile.wastagePercentage) || 0) / 100 * actualQuantity;
                const totalOrderedTile = (actualQuantity + wastagePercentage).toFixed(2);
                const qtyPerBoxNum = Number(tile.quantityBox) || 1;
                const AreainsqftNum = Number(tile.areaTile) || 1;
                const noOfBoxes = (totalOrderedTile / (qtyPerBoxNum * AreainsqftNum)).toFixed(2);
                const skirtingAreaChanged = tile.isUserChanged === false ? "" : true;
                return {
                    type: tile.type,
                    length: tile.length,
                    lengthInput: tile.lengthInput,
                    breadth: tile.breadth,
                    breadthInput: tile.breadthInput,
                    height: tile.height,
                    heightInput: tile.heightInput,
                    deductionArea: deductionAreaNum,
                    deductionInput: deductionInputs || "",
                    deduction1: tile.deduction1 || "",
                    deduction2: tile.deduction2 || "",
                    deduction3: tile.deduction3 || "",
                    deduction4: tile.deduction4 || "",
                    deduction5: tile.deduction5 || "",
                    deduction6: tile.deduction6 || "",
                    deduction7: tile.deduction7 || "",
                    deduction8: tile.deduction8 || "",
                    deduction9: tile.deduction9 || "",
                    deduction10: tile.deduction10 || "",
                    deduction11: tile.deduction11 || "",
                    deduction12: tile.deduction12 || "",
                    deduction13: tile.deduction13 || "",
                    deduction14: tile.deduction14 || "",
                    deduction15: tile.deduction15 || "",
                    deduction16: tile.deduction16 || "",
                    deductionThickness: tile.deductionThickness,
                    deductionThicknessInputs: tile.deductionThicknessInputs,
                    wastagePercentage: tile.wastagePercentage,
                    skirtingArea,
                    actualQuantity,
                    totalOrderedTile,
                    correctQuantityBox: tile.correctQuantityBox,
                    tileName: tile.tileName || "",
                    tileSize: tile.tileSize,
                    size: tile.size || "",
                    qtyPerBox: qtyPerBoxNum,
                    areaInSqft: AreainsqftNum,
                    noOfBoxes: noOfBoxes,
                    rate: tile.rate || "",
                    vendor: tile.vendor || "",
                    isUserChange: skirtingAreaChanged,
                };
            });
            return {
                floorName: floor.floorName,
                areaName: floor.areaName,
                tiles: floorTiles,
                totalOrderedQuantity,
                totalBoxes,
            };
        });
        setCalculationData({
            clientName: clientName ? clientName.label : null,
            date: currentDate,
            calculations,
        });
    }, [clientName, floors, currentDate, clientSNo]);
    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setIsPopupOpen(true);
        setModalOpen(true)
        setIsSubmitting(true);
        if (!calculationData || !calculationData.calculations.length || !clientName) {
            console.error("Data is incomplete, please check inputs.");
            setIsSubmitting(false);
            setIsPopupOpen(false);
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
                    const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === clientName);
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
                skirting: selectSkirtingArea,
                commonWastage: wastagePercentages,
                rate: commonRate,
                commonVendors: commonVendor,
                ENo: eno,
                calculations: normalizedCalculations.map((floor, floorIndex) => ({
                    floorName: floor.floorName,
                    areaName: floor.areaName,
                    tiles: floor.tiles.map((tile) => ({
                        type: tile.type,
                        length: tile.length || "0'",
                        breadth: tile.breadth || "0'",
                        height: tile.height || "0'",
                        lengthInput: tile.lengthInput || "No Input",
                        breadthInput: tile.breadthInput || "No Input",
                        heightInput: tile.heightInput || "No Input",
                        deductionArea: Number(tile.deductionArea) || 0,
                        deductionInput: tile.deductionInput || "",
                        deduction1: tile.deduction1 || "",
                        deduction2: tile.deduction2 || "",
                        deduction3: tile.deduction3 || "",
                        deduction4: tile.deduction4 || "",
                        deduction5: tile.deduction5 || "",
                        deduction6: tile.deduction6 || "",
                        deduction7: tile.deduction7 || "",
                        deduction8: tile.deduction8 || "",
                        deduction9: tile.deduction9 || "",
                        deduction10: tile.deduction10 || "",
                        deduction11: tile.deduction11 || "",
                        deduction12: tile.deduction12 || "",
                        deduction13: tile.deduction13 || "",
                        deduction14: tile.deduction14 || "",
                        deduction15: tile.deduction15 || "",
                        deduction16: tile.deduction16 || "",
                        wastagePercentage: Number(tile.wastagePercentage) || 0,
                        skirtingArea: Number(tile.skirtingArea) || 0,
                        actualQuantity: Number(tile.actualQuantity) || 0,
                        totalOrderedTile: Number(tile.totalOrderedTile) || 0,
                        tileName: tile.tileName || "",
                        correctQuantityBox: Number(tile.correctQuantityBox) || 0,
                        tileSize: tile.tileSize || "",
                        size: tile.size || "",
                        rate: tile.rate || "",
                        vendors: tile.vendor || "",
                        qtyPerBox: Number(tile.qtyPerBox) || 1,
                        areaInSqft: Number(tile.areaInSqft) || 1,
                        noOfBoxes: Number(tile.noOfBoxes) || 0,
                        isUserChanged: tile.isUserChange,
                    })),
                })),
            };
            const summaryData = Object.values(summaryMap1);
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
            alert("Tile Data Saved Successfully!");
            window.location.reload();
            setFloors([{
                floorName: "Ground Floor",
                areaName: "",
                tiles: [{ type: "Floor Tile", length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" }],
            }]);
            setRows([{ tileName: "", size: "", qtyPerBox: "", numberOfBoxes: "" }]);
            setIsPopupOpen(false);
            setTimeout(() => {
                setModalOpen(true);
            }, 2000);
        } catch (error) {
            console.error('Error during form submission:', error);
            setIsSubmitting(false);
            setIsPopupOpen(false);
        }
    };
    const handleSubmitWithTileBile = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setIsPopupOpen(true);
        setModalOpen(true);
        setIsSubmitting(true);
        if (!calculationData || !calculationData.calculations.length || !clientName) {
            console.error("Data is incomplete, please check inputs.");
            setIsSubmitting(false);
            setIsPopupOpen(false);
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
                skirting: selectSkirtingArea,
                commonWastage: wastagePercentages,
                rate: commonRate,
                commonVendors: "",
                ENo: eno,
                calculations: normalizedCalculations.map((floor, floorIndex) => ({
                    floorName: floor.floorName,
                    areaName: floor.areaName,
                    tiles: floor.tiles.map((tile) => ({
                        type: tile.type,
                        length: tile.length || "0'",
                        breadth: tile.breadth || "0'",
                        height: tile.height || "0'",
                        lengthInput: tile.lengthInput || "No Input",
                        breadthInput: tile.breadthInput || "No Input",
                        heightInput: tile.heightInput || "No Input",
                        deductionArea: Number(tile.deductionArea) || 0,
                        deductionInput: tile.deductionInput || "",
                        deduction1: tile.deduction1,
                        deduction2: tile.deduction2,
                        deduction3: tile.deduction3,
                        deduction4: tile.deduction4,
                        deduction5: tile.deduction5,
                        deduction6: tile.deduction6,
                        deduction7: tile.deduction7,
                        deduction8: tile.deduction8,
                        deduction9: tile.deduction9 || "",
                        deduction10: tile.deduction10 || "",
                        deduction11: tile.deduction11 || "",
                        deduction12: tile.deduction12 || "",
                        deduction13: tile.deduction13 || "",
                        deduction14: tile.deduction14 || "",
                        deduction15: tile.deduction15 || "",
                        deduction16: tile.deduction16 || "",
                        wastagePercentage: Number(tile.wastagePercentage) || 0,
                        skirtingArea: Number(tile.skirtingArea) || 0,
                        actualQuantity: Number(tile.actualQuantity) || 0,
                        totalOrderedTile: Number(tile.totalOrderedTile) || 0,
                        tileName: tile.tileName || "",
                        correctQuantityBox: Number(tile.correctQuantityBox) || 0,
                        tileSize: tile.tileSize || "",
                        size: tile.size || " ",
                        rate: tile.rate || "",
                        vendors: tile.vendor || "",
                        qtyPerBox: Number(tile.qtyPerBox) || 1,
                        areaInSqft: Number(tile.areaInSqft) || 1,
                        noOfBoxes: Number(tile.noOfBoxes) || 0,
                        isUserChanged: tile.isUserChange,
                    })),
                })),
            };
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
            alert("Tile Data Saved Successfully!");
            window.location.reload();
            setFloors([{
                floorName: "Ground Floor",
                areaName: "",
                tiles: [{ type: "Floor Tile", length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" }],
            }]);
            setRows([{ tileName: "", size: "", qtyPerBox: "", numberOfBoxes: "" }]);
            setIsPopupOpen(false);
            setTimeout(() => {
                setModalOpen(true);
            }, 2000);
        } catch (error) {
            console.error('Error during form submission:', error);
            setIsSubmitting(false);
            setIsPopupOpen(false);
        }
    };
    const handleTileChange = (floorIndex, tileIndex, event) => {
        const { name, value } = event.target;
        const updatedFloors = [...floors];
        const floor = updatedFloors[floorIndex];
        const areaNames = floor.areaName;
        const tile = updatedFloors[floorIndex].tiles[tileIndex];
        if (name === "tileName") {
            const selectedTile = tileOptions.find(tile => tile.value === value);
            if (selectedTile) {
                tile.tileName = value;
                tile.tileSize = selectedTile.tileSize;
                tile.defaultSize = selectedTile.tileSize;
                const selectedSizeOption = tileList.find(tile => tile.tileSize === selectedTile.tileSize);
                if (selectedSizeOption) {
                    tile.quantityBox = selectedSizeOption.quantityBox || '';
                    tile.areaTile = selectedSizeOption.areaTile || '';
                    tile.correctQuantityBox = selectedSizeOption.quantityBox || '';
                }
            } else {
                tile.tileName = '';
                tile.tileSize = '';
                tile.quantityBox = '';
                tile.areaTile = '';
                tile.defaultSize = '';
                tile.correctQuantityBox = '';
            }
        }
        else if (name === "deductionArea") {
            tile[name] = value;
        } else {
            tile[name] = value;
        }
        if (name === "length" || name === "breadth") {
            tile.skirtingArea = parseFloat(calculateSkirtingArea(tile, areaNames).toFixed(2));
        }
        setFloors(updatedFloors);
    };
    const deleteFloor = (floorIndex) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this floor?");
        if (confirmDelete) {
            const updatedFloors = [...floors];
            updatedFloors.splice(floorIndex, 1);
            let i = floorIndex;
            while (i < updatedFloors.length && (!updatedFloors[i] || !updatedFloors[i].floorName)) {
                updatedFloors.splice(i, 1);
            }
            setFloors(updatedFloors);
        }
    };
    const handleKeyDown = (floorIndex, tileIndex, event) => {
        if (event.key === 'Enter') {
            const { name, value } = event.target;
            const updatedFloors = [...floors];
            const tile = updatedFloors[floorIndex].tiles[tileIndex];
            if (name === "length" || name === "breadth" || name === "height") {
                tile[`${name}Input`] = value;
                const parsedValue = parseFeetInchesExpression(value);
                tile[name] = parsedValue;
            } else {
                tile[name] = value;
            }
            setFloors(updatedFloors);
        }
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
        const updatedPopupState = {};
        const updatedPopupData = {};
        Object.keys(deductionPopupState).forEach((key) => {
            const [existingFloorIndex, tileIndex] = key.split('-').map(Number);
            if (existingFloorIndex > floorIndex) {
                const newKey = `${existingFloorIndex + 1}-${tileIndex}`;
                updatedPopupState[newKey] = deductionPopupState[key];
                updatedPopupData[newKey] = deductionPopupData[key];
            } else {
                updatedPopupState[key] = deductionPopupState[key];
                updatedPopupData[key] = deductionPopupData[key];
            }
        });
        updatedPopupState[`${floorIndex + 1}-0`] = false;
        updatedPopupData[`${floorIndex + 1}-0`] = [];
        setDeductionPopupState(updatedPopupState);
        setDeductionPopupData(updatedPopupData);
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
        const updatedPopupState = {};
        const updatedPopupData = {};
        Object.keys(deductionPopupState).forEach((key) => {
            const [existingFloorIndex, tileIndex] = key.split('-').map(Number);
            if (existingFloorIndex > floorIndex) {
                const newKey = `${existingFloorIndex + 1}-${tileIndex}`;
                updatedPopupState[newKey] = deductionPopupState[key];
                updatedPopupData[newKey] = deductionPopupData[key];
            } else {
                updatedPopupState[key] = deductionPopupState[key];
                updatedPopupData[key] = deductionPopupData[key];
            }
        });
        updatedPopupState[`${floorIndex + 1}-0`] = false;
        updatedPopupData[`${floorIndex + 1}-0`] = [];
        setDeductionPopupState(updatedPopupState);
        setDeductionPopupData(updatedPopupData);
        handleAddRow();
        setFloors(updatedFloors);
    };
    const addFloorRow = () => {
        setFloors((prevFloors) => [
            ...prevFloors,
            {
                floorName: "",
                areaName: "",
                tiles: [
                    { type: "Floor Tile", length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" },
                ],
            },
        ]);
        setDeductionPopupState((prevPopupState) => ({
            ...prevPopupState,
            [`${floors.length}-0`]: false,
        }));
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
        menu: (base) => ({
            ...base,
            zIndex: 9999,
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: '#000',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
    };
    const convertBlobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };
    useEffect(() => {
        const fetchTiles = async () => {
            try {
                const response = await fetch('https://backendaab.in/aabuilderDash/api/tiles/all/data');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const options = data.map(tile => ({
                    value: tile.label || tile.tileName,
                    label: tile.label || tile.tileName,
                    tileSize: tile.tileSize || 'default size'
                }));
                const TileDataWithImages = await Promise.all(
                    data.map(async (tile) => {
                        let imageBase64 = null;
                        if (tile.image) {
                            if (tile.image instanceof Blob) {
                                imageBase64 = await convertBlobToBase64(tile.image);
                            } else {
                                imageBase64 = tile.image;
                            }
                        }
                        return {
                            ...tile,
                            image: imageBase64,
                        };
                    })
                );
                setTileWithImages(TileDataWithImages);
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
                const matchingTileImage = tileWithImages.find(
                    img => img.tileName === tile.tileName && img.tileSize === tile.size
                );
                if (!summaryMap[key]) {
                    summaryMap[key] = {
                        tileName: tile.tileName,
                        size: tile.size,
                        totalOrderedQuantity: 0,
                        totalBoxes: 0,
                        image: matchingTileImage ? matchingTileImage.image : '',
                    };
                }
                let skirtingArea = tile.isUserChanged === true ? Number(tile.skirtingArea) : parseFloat(calculateSkirtingAreas(tile, floor.areaName));
                let totalOrderedQuantity = 0;
                if (tile.length && (tile.breadth || tile.height)) {
                    const length = parseFeetInches(tile.length || 0);
                    const breadth = parseFeetInches(tile.breadth || 0);
                    const height = parseFeetInches(tile.height || 0);
                    const wastagePercentage = Number(tile.wastagePercentage || 0);
                    const deductionArea = Number(tile.deductionArea || 0);
                    let tileArea = 0;
                    if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x B') {
                        tileArea = length * breadth;
                    } else if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x H') {
                        tileArea = length * height;
                    }
                    const finalArea = Math.max(tileArea - deductionArea, 0);
                    const actualQuantity = finalArea + (skirtingArea || 0);
                    const wastage = (wastagePercentage / 100) * actualQuantity;
                    totalOrderedQuantity = actualQuantity + wastage;
                }
                summaryMap[key].totalOrderedQuantity += totalOrderedQuantity || 0;
                const qtyPerBox = Number(tile.quantityBox || 1);
                const areaInSqFt = Number(tile.areaTile || 1);
                summaryMap[key].totalBoxes += (totalOrderedQuantity / (qtyPerBox * areaInSqFt)) || 0;
            });
        });
        return Object.values(summaryMap).map(item => ({
            ...item,
            totalOrderedQuantity: (Number(item.totalOrderedQuantity) || 0).toFixed(2),
            totalBoxes: (Number(item.totalBoxes) || 0).toFixed(2),
        }));
    };
    const summary = calculateSummary();
    const generateCustomerCopyPDF = async () => {
        const doc = new jsPDF();
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
                const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === clientName);
                return matchingClientCalculations.length;
            } catch (error) {
                console.error('Error fetching revision number:', error.message);
                return 0;
            }
        };
        const revisionCount = await getRevisionNumber(siteName);
        const revisionNumber = `R ${Math.max(revisionCount)}`;
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("TILE MEASUREMENT SHEET", 14, 15);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        const clientLabel = "CLIENT: ";
        doc.text(clientLabel, 14, 33);
        const labelWidth = doc.getTextWidth(clientLabel);
        doc.setFont("helvetica", "normal");
        const siteNameText = siteName.toUpperCase();
        doc.text(siteNameText, 14 + labelWidth, 33);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("CLIENT COPY", doc.internal.pageSize.width - 38, 15);
        doc.setFontSize(10);
        doc.setFontSize(10);
        const tmsDate = `TMS CC ${clientId} - ${selectedDate} - ${revisionNumber}`;
        doc.setFont("helvetica", "normal");
        const textWidth = doc.getTextWidth(tmsDate);
        const rightMargin = 14;
        const pageWidth = doc.internal.pageSize.width;
        const startX = pageWidth - rightMargin - textWidth;
        doc.text(tmsDate, startX, 27);
        doc.setDrawColor('#BF9853');
        doc.setLineWidth(1);
        doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
        const headers = [
            [
                "SNO",
                "AREA NAME",
                "TYPE",
                "L  (Ft)",
                "B  (Ft)",
                "H  (Ft)",
                "LESS AREA (SQFT)",
                "SKIRTING AREA (SQFT)",
                "EXTRA (%)",
                "ORDER QTY (SQFT)"
            ]
        ];
        const rows = [];
        let previousFloorName = null;
        let floorCounter = 0;
        let areaCounter = 1;
        floors.forEach((floor) => {
            const currentFloorName = (floor.floorName || previousFloorName).toUpperCase();
            if (currentFloorName !== previousFloorName) {
                floorCounter += 1;
                areaCounter = 1;
                const floorLetter = String.fromCharCode(64 + floorCounter);
                rows.push([
                    { content: floorLetter, styles: { fontStyle: "bold" } },
                    { content: currentFloorName, styles: { fontStyle: "bold" } },
                    "", "", "", "", "", "", "", "", "", "", "", ""
                ]);
                previousFloorName = currentFloorName;
            }
            let areaNamePrinted = false;
            floor.tiles.forEach(tile => {
                const { length, breadth, height, wastagePercentage, deductionArea, type } = tile;
                const lengthNum = parseFeetInches(length);
                const breadthNum = parseFeetInches(breadth);
                const heightNum = parseFeetInches(height);
                const wastagePercentageNum = Number(wastagePercentage);
                const deductionAreaNum = Number(deductionArea || 0);
                let tileArea;
                let skirtingArea = tile.type === "Floor Tile" ? Number(tile.skirtingArea) : 0;
                if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x B') {
                    tileArea = lengthNum * breadthNum;
                } else if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x H') {
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
        const tableStartY = 44;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.autoTable({
            head: headers,
            body: rows,
            startY: tableStartY,
            theme: "grid",
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
                0: { halign: "center", cellWidth: 11, minCellHeight: 2 },
                1: { halign: "left", cellWidth: 42.5, cellHeight: 2 },
                2: { halign: "left", cellWidth: 20, cellHeight: 2 },
                3: { halign: "center", cellWidth: 12.5, cellHeight: 2 },
                4: { halign: "center", cellWidth: 12.5, cellHeight: 2 },
                5: { halign: "center", cellWidth: 12.5, cellHeight: 2 },
                6: { halign: "center", cellWidth: 16.6, cellHeight: 2 },
                7: { halign: "center", cellWidth: 22, cellHeight: 2 },
                8: { halign: "center", cellWidth: 16, cellHeight: 2 },
                9: { halign: "center", cellWidth: 17, cellHeight: 2 },
            },
            margin: { left: 14, right: 14, top: 44 },
            pageBreak: 'auto',
            tableWidth: 'wrap',
            rowPageBreak: 'avoid',
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
        footer(doc);
        const filename = `TMS CC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
        doc.save(filename);
        return doc.output("blob");
    };
    const handleDirectValueChange = (floorIndex, tileIndex, event) => {
        const updatedFloors = [...floors];
        const tile = { ...updatedFloors[floorIndex].tiles[tileIndex] };
        const inputValue = Number(event.target.value) || 0;
        tile.directValue = inputValue;
        tile.skirtingArea = inputValue;
        tile.isUserChanged = true;
        updatedFloors[floorIndex].tiles[tileIndex] = tile;
        setFloors(updatedFloors);
    };
    const resetToCalculatedValue = (floorIndex, tileIndex) => {
        const updatedFloors = [...floors];
        const floor = updatedFloors[floorIndex];
        const areaNames = floor.areaName;
        const tile = { ...updatedFloors[floorIndex].tiles[tileIndex] };
        let calculatedSkirtingArea = parseFloat(calculateSkirtingArea(tile, areaNames)).toFixed(2);
        tile.skirtingArea = Number(calculatedSkirtingArea);
        tile.isUserChanged = false;
        tile.directValue = "";
        updatedFloors[floorIndex].tiles[tileIndex] = tile;
        setFloors(updatedFloors);
    };
    const generateSummaryPDF = async () => {
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
        const pdf = new jsPDF();
        pdf.addFileToVFS("ArialNovaCond.ttf", "BASE64_ENCODED_FONT_DATA");
        pdf.addFont("ArialNovaCond.ttf", "ArialNovaCond", "normal");
        const getRevisionNumber = async (clientName) => {
            try {
                const response = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/all`);
                if (!response.ok) {
                    throw new Error("Failed to fetch revision data");
                }
                const data = await response.json();
                return data.filter((calc) => calc.clientName === clientName).length;
            } catch (error) {
                console.error("Error fetching revision:", error);
                return 0;
            }
        };
        const revisionCount = await getRevisionNumber(siteName);
        const revisionNumber = `R ${revisionCount}`;
        const header = () => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("TILE MEASUREMENT SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFont("helvetica", "normal");
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const tmsDate = `TMS OC ${clientId} - ${selectedDate} - ${revisionNumber}`;
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
        const columns = [
            { content: "SNO", styles: { halign: "center", fontStyle: "bold" } },
            { content: "TILE NAME", styles: { halign: "left", fontStyle: "bold" } },
            { content: "SIZE", styles: { halign: "center", fontStyle: "bold" } },
            { content: "TOTAL AREA (SQFT)", styles: { halign: "center", fontStyle: "bold" } },
            { content: "NO OF BOXES", styles: { halign: "center", fontStyle: "bold" } },
        ];
        const rows = summary.map((row, index) => {
            const totalOrderedQuantity = parseFloat(row.totalOrderedQuantity) || 0;
            const totalBoxes = parseFloat(row.totalBoxes) || 0;
            return [
                { content: (index + 1).toString(), styles: { halign: "center" } },
                { content: row.tileName, styles: { halign: "left" } },
                { content: row.size, styles: { halign: "center" } },
                { content: totalOrderedQuantity.toFixed(2), styles: { halign: "center" } },
                { content: totalBoxes.toFixed(2), styles: { halign: "center" } },
            ];
        });
        const totalArea = summary.reduce((acc, row) => acc + (parseFloat(row.totalOrderedQuantity) || 0), 0).toFixed(2);
        const totalBoxes = summary.reduce((acc, row) => acc + (parseFloat(row.totalBoxes) || 0), 0).toFixed(2);
        rows.push([
            { content: "", styles: { fontStyle: "bold" } },
            { content: "TOTAL", styles: { fontStyle: "bold" } },
            { content: "", styles: { fontStyle: "bold" } },
            { content: totalArea, styles: { halign: "center", fontStyle: "bold" } },
            { content: totalBoxes, styles: { halign: "center", fontStyle: "bold" } },
        ]);
        const tableStartY = 44;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.autoTable({
            head: [columns.map((col) => col.content)],
            body: rows,
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
            margin: { left: 14, right: 14, top: 44 },
            rowPageBreak: 'avoid',
            didDrawPage: (data) => {
                header();
                footer();
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.2);
                doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
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
        const filename = `TMS OC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
        doc.save(filename);
        return doc.output("blob");
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
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const getRevisionNumber = async (clientName) => {
            try {
                const clientResponse = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/all`);
                if (!clientResponse.ok) {
                    throw new Error("Failed to fetch calculations from the backend");
                }
                const clientData = await clientResponse.json();
                const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === clientName);
                return matchingClientCalculations.length;
            } catch (error) {
                console.error('Error fetching revision number:', error.message);
                return 0;
            }
        };
        const revisionCount = await getRevisionNumber(siteName);
        const revisionNumber = `R ${revisionCount}`;
        const header = () => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("TILE MEASUREMENT SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFont("helvetica", "normal");
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("STOCKING CHART", doc.internal.pageSize.width - 46, 15);
            doc.setFontSize(10);
            const tmsDate = `TMS SC ${clientId} - ${selectedDate} - ${revisionNumber}`;
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
        const columns = [
            { content: "SNO", styles: { halign: "center", fontStyle: "bold" } },
            { content: "FLOOR NAME", styles: { halign: "center", fontStyle: "bold" } },
            { content: "TILE NAME", styles: { halign: "left", fontStyle: "bold" } },
            { content: "TILE SIZE", styles: { halign: "center", fontStyle: "bold" } },
            { content: "TOTAL AREA (SQFT)", styles: { halign: "center", fontStyle: "bold" } },
            { content: "NO OF BOXES", styles: { halign: "center", fontStyle: "bold" } },
        ];
        const rows = [];
        const floorData = {};
        let previousFloorName = "";
        let serialNumber = 1;
        summaryData.forEach(item => {
            const floorName = item.floorName && item.floorName.trim() !== "" ? item.floorName : previousFloorName;
            if (floorName) {
                previousFloorName = floorName;
            }
            const tileKey = `${item.tileName}|${item.tileSize}`;
            if (!floorData[floorName]) {
                floorData[floorName] = {};
            }
            if (!floorData[floorName][tileKey]) {
                floorData[floorName][tileKey] = {
                    tileName: item.tileName,
                    tileSize: item.tileSize,
                    totalOrderedQuantity: '',
                    totalBoxes: ''
                };
            }
            floorData[floorName][tileKey].totalOrderedQuantity += item.totalOrderedQuantity;
            floorData[floorName][tileKey].totalBoxes += item.totalBoxes;
        });
        for (const floor in floorData) {
            for (const tileKey in floorData[floor]) {
                const tile = floorData[floor][tileKey];
                rows.push([
                    { content: serialNumber++, styles: { halign: "center" } },
                    { content: floor, styles: { halign: "center" } },
                    { content: tile.tileName, styles: { halign: "left" } },
                    { content: tile.tileSize, styles: { halign: "center" } },
                    { content: tile.totalOrderedQuantity, styles: { halign: "center" } },
                    { content: tile.totalBoxes, styles: { halign: "center" } },
                ]);
            }
        }
        const totalArea = summaryData.reduce((acc, row) => acc + (parseFloat(row.totalOrderedQuantity) || 0), 0).toFixed(2);
        const totalBoxes = summaryData.reduce((acc, row) => acc + (parseFloat(row.totalBoxes) || 0), 0).toFixed(2);
        rows.push([
            { content: "", styles: { fontStyle: "bold" } },
            { content: "TOTAL", styles: { fontStyle: "bold" }, fontSize: 12 },
            { content: "", styles: { fontStyle: "bold" } },
            { content: "", styles: { fontStyle: "bold" } },
            { content: totalArea, styles: { halign: "center", fontStyle: "bold" }, fontSize: 12 },
            { content: totalBoxes, styles: { halign: "center", fontStyle: "bold" }, fontSize: 12 },
        ]);
        const tableStartY = 44;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.autoTable({
            head: [columns.map(col => col.content)],
            body: rows,
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
                0: { cellWidth: 15 },
                1: { cellWidth: 34 },
                2: { cellWidth: 48 },
                3: { cellWidth: 30 },
                4: { cellWidth: 30 },
                5: { cellWidth: 25 },
            },
            margin: { left: 14, right: 14, top: 44 },
            rowPageBreak: 'avoid',
            didDrawPage: (data) => {
                header();
                footer();
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.2);
                doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
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
        const filename = `TMS SC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
        doc.save(filename);
        return doc.output("blob");
    };
    const handleGeneratePDF = () => {
        const summaryData = Object.values(summaryMap1);
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
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const getRevisionNumber = async (clientName) => {
            try {
                const clientResponse = await fetch(`https://backendaab.in/aabuilderDash/api/tile/tile/all`);
                if (!clientResponse.ok) {
                    throw new Error("Failed to fetch calculations from the backend");
                }
                const clientData = await clientResponse.json();
                const matchingClientCalculations = clientData.filter(calculation => calculation.clientName === clientName);
                return matchingClientCalculations.length;
            } catch (error) {
                console.error('Error fetching revision number:', error.message);
                return 0;
            }
        };
        const revisionCount = await getRevisionNumber(siteName);
        const revisionNumber = `R ${Math.max(revisionCount)}`;
        const header = (doc) => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("TILE MEASUREMENT SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFont("helvetica", "normal");
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
            doc.setFontSize(10);
            const tmsDate = `TMS EC ${clientId} - ${selectedDate} - ${revisionNumber}`;
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
        const customerHeaders = [
            [
                "SNO",
                "AREA NAME",
                "TYPE",
                "L  (Ft)",
                "B  (Ft)",
                "H  (Ft)",
                "LESS AREA (SQFT)",
                "SKIRTING AREA (SQFT)",
                "EXTRA (%)",
                "ORDER QTY (SQFT)",
                "TILE NAME",
                "SIZE",
                "QTY/ BOX",
                "BOX NOS",
            ],
        ];
        const customerRows = [];
        if (!floors || floors.length === 0) {
            customerRows.push(["No Data", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        } else {
            let floorCounter = 0;
            let areaCounter = 1;
            let previousFloorName = null;
            floors.forEach((floor) => {
                const currentFloorName = (floor.floorName || previousFloorName).toUpperCase();
                if (currentFloorName !== previousFloorName) {
                    floorCounter += 1;
                    areaCounter = 1;
                    const floorLetter = String.fromCharCode(64 + floorCounter);
                    customerRows.push([
                        { content: floorLetter, styles: { fontStyle: "bold" } },
                        { content: currentFloorName, styles: { fontStyle: "bold" } },
                        "", "", "", "", "", "", "", "", "", "", "", ""
                    ]);
                    previousFloorName = currentFloorName;
                }
                let areaNamePrinted = false;
                floor.tiles.forEach(tile => {
                    const {
                        length, breadth, height, wastagePercentage, deductionArea,
                        type, quantityBox, tileName, size, areaTile
                    } = tile;
                    const lengthNum = parseFeetInches(length);
                    const breadthNum = parseFeetInches(breadth);
                    const heightNum = parseFeetInches(height);
                    const wastagePercentageNum = Number(wastagePercentage);
                    const deductionAreaNum = Number(deductionArea || 0);
                    let tileArea;
                    let skirtingArea = tile.type === "Floor Tile" ? parseFloat(calculateSkirtingAreas(tile, floor.areaName)) : 0;
                    if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x B') {
                        tileArea = lengthNum * breadthNum;
                    } else if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x H') {
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
                        type,
                        length,
                        breadth,
                        height,
                        deductionAreaNum,
                        skirtingArea.toFixed(2),
                        `${wastagePercentage}%`,
                        totalOrderedQuantity.toFixed(2),
                        tileName,
                        size,
                        quantityBox,
                        noOfBoxes
                    ]);
                    areaCounter += 1;
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
            head: customerHeaders,
            body: customerRows,
            startY: 44,
            theme: "grid",
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
                0: { halign: "center", cellWidth: 12, minCellHeight: 2 },
                1: { halign: "left", cellWidth: 35, cellHeight: 2 },
                2: { halign: "left", cellWidth: 20, cellHeight: 2 },
                3: { halign: "center", cellWidth: 12.5, cellHeight: 2 },
                4: { halign: "center", cellWidth: 12.5, cellHeight: 2 },
                5: { halign: "center", cellWidth: 12.5, cellHeight: 2 },
                6: { halign: "center", cellWidth: 16.5, cellHeight: 2 },
                7: { halign: "center", cellWidth: 20.5, cellHeight: 2 },
                8: { halign: "center", cellWidth: 15.5, cellHeight: 2 },
                9: { halign: "center", cellWidth: 17, cellHeight: 2 },
                10: { halign: "left", cellWidth: 46.6, cellHeight: 2 },
                11: { halign: "center", cellWidth: 22, cellHeight: 2 },
                12: { halign: "center", cellWidth: 12.5, cellHeight: 2 },
                13: { halign: "center", cellWidth: 14, cellHeight: 2 },
            },
            margin: { left: 14, top: 44, bottom: 25 },
            pageBreak: 'auto',
            rowPageBreak: 'avoid',
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
    const deleteAreaRow = (floorIndex, tileIndex) => {
        const updatedFloors = [...floors];
        const floor = updatedFloors[floorIndex];
        floor.tiles.splice(tileIndex, 1);
        let i = tileIndex;
        while (i < floor.tiles.length && (!floor.tiles[i] || !floor.tiles[i].areaName)) {
            floor.tiles.splice(i, 1);
        }
        setFloors(updatedFloors);
    };
    const handleCommonWastageChange = (selectedOption) => {
        const selectedValue = selectedOption.value;
        setWastagePercentage(selectedValue);
        const updatedFloors = floors.map((floor) => ({
            ...floor,
            tiles: floor.tiles.map((tile) => ({
                ...tile,
                wastagePercentage: selectedValue,
            })),
        }));
        setFloors(updatedFloors);
    };
    const totalArea = summary2.reduce((acc, row) => {
        const quantity = parseFloat(row.totalOrderedQuantity);
        return acc + (isNaN(quantity) ? 0 : quantity);
    }, 0);
    const totalBoxes = summary2.reduce((acc, row) => {
        const boxes = parseFloat(row.totalBoxes);
        return acc + (isNaN(boxes) ? 0 : boxes);
    }, 0);
    const handleSizeChange = (floorIndex, tileIndex, newSize) => {
        const updatedFloors = [...floors];
        updatedFloors[floorIndex].tiles[tileIndex].size = newSize;
        const selectedSizeOption = tileList.find(
            (size) => size.tileSize === newSize
        );
        if (selectedSizeOption) {
            updatedFloors[floorIndex].tiles[tileIndex].quantityBox =
                selectedSizeOption.quantityBox;
            updatedFloors[floorIndex].tiles[tileIndex].areaTile =
                selectedSizeOption.areaTile;
        } else {
            updatedFloors[floorIndex].tiles[tileIndex].quantityBox = "";
            updatedFloors[floorIndex].tiles[tileIndex].areaTile = "";
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
        setDeductionPopupData({});
        setDeductionPopupState({});
        if (selectedClientData) {
            const { commonWastage, skirting, rate, commonVendors } = selectedClientData;
            setSelectSkiritingArea(skirting);
            setWastagePercentage(commonWastage);
            setCommonRate(rate);
            setSelectedClientData(selectedClientData);
            setCommonVendor(commonVendors);
            const seenFloors = new Set();
            const newFloorsData = selectedClientData.calculations.map((calc, floorIndex) => {
                const floorName = calc.floorName || 'No floor name available';
                const areaName = calc.areaName || 'No area name available';
                const floorVisible = !seenFloors.has(floorName);
                seenFloors.add(floorName);
                let deductionData = {};
                return {
                    floorName: floorVisible ? floorName : null,
                    areaName: areaName,
                    tiles: calc.tiles.map((tile, tileIndex) => {
                        const deductions = [
                            tile.deduction1, tile.deduction2, tile.deduction3, tile.deduction4,
                            tile.deduction5, tile.deduction6, tile.deduction7, tile.deduction8
                        ];
                        const processedDeductions = deductions.map((deduction) => {
                            if (deduction) {
                                const splitData = deduction.split(',').map((val) => val.trim());
                                return {
                                    type: splitData[0] || '',
                                    measurement: splitData[1] || '',
                                    qty: splitData[2] || '',
                                    location: splitData[3] || '',
                                    thickness: splitData[4] || '',
                                    deductionThickness: splitData[5] || '',
                                    output: splitData[6] || ''
                                };
                            }
                            return null;
                        }).filter(row => row !== null);
                        if (processedDeductions.length > 0) {
                            deductionData[`${floorIndex}-${tileIndex}`] = processedDeductions;
                        }
                        const selectedTile = tileList.find(t => t.tileSize === tile.tileSize);
                        return {
                            type: tile.type,
                            length: tile.length,
                            breadth: tile.breadth,
                            height: tile.height,
                            lengthInput: tile.lengthInput || "No Input",
                            breadthInput: tile.breadthInput || "No Input",
                            heightInput: tile.heightInput || "No Input",
                            deduction1: tile.deduction1 || "",
                            deduction2: tile.deduction2 || "",
                            deduction3: tile.deduction3 || "",
                            deduction4: tile.deduction4 || "",
                            deduction5: tile.deduction5 || "",
                            deduction6: tile.deduction6 || "",
                            deduction7: tile.deduction7 || "",
                            deduction8: tile.deduction8 || "",
                            deduction9: tile.deduction9 || "",
                            deduction10: tile.deduction10 || "",
                            deduction11: tile.deduction11 || "",
                            deduction12: tile.deduction12 || "",
                            deduction13: tile.deduction13 || "",
                            deduction14: tile.deduction14 || "",
                            deduction15: tile.deduction15 || "",
                            deduction16: tile.deduction16 || "",
                            deductionArea: tile.deductionArea || 0,
                            deductionInput: tile.deductionInput || "",
                            skirtingArea: tile.skirtingArea || "",
                            areaTile: tile.areaInSqft || '',
                            quantityBox: tile.qtyPerBox || '',
                            tileName: tile.tileName,
                            tileSize: tile.tileSize,
                            size: tile.size,
                            rate: tile.rate,
                            vendor: tile.vendors,
                            actualQuantity: tile.actualQuantity,
                            noOfBoxes: tile.noOfBoxes,
                            wastagePercentage: tile.wastagePercentage,
                            isUserChanged: tile.isUserChanged || false,
                            directValue: tile.skirtingArea || 0,
                            defaultSize: selectedTile ? selectedTile.tileSize : tile.tileSize || '',
                            correctQuantityBox: tile.correctQuantityBox,
                            hasSizeChanged: selectedTile && tile.size !== selectedTile.tileSize,
                        };
                    }),
                };
            });
            setFloors(newFloorsData);
        } else {
            setSelectedClientData({ calculations: [] });
            setFloors([]);
        }
    };
    const customerCopyPDF = async () => {
        const doc = new jsPDF({
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
                return 0;
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
        const incrementValue = await getIncrement(fileLabel, fileType, clientId);
        if (selectedFile && selectedFile.label) {
            filename = `TMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
        } else {
            const revisionNumber = await getRevisionNumber(siteName);
            filename = `TMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDate(currentDate)}.pdf`;
        }
        await postIncrement(fileLabel, fileType);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("TILE MEASUREMENT SHEET", 14, 15);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        const clientLabel = "CLIENT: ";
        doc.text(clientLabel, 14, 33);
        const labelWidth = doc.getTextWidth(clientLabel);
        doc.setFont("helvetica", "normal");
        const siteNameText = siteName.toUpperCase();
        doc.text(siteNameText, 14 + labelWidth, 33);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("CLIENT REQUIREMENT COPY", doc.internal.pageSize.width - 38, 15);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const tmsDate = `TMS CC ${clientId} - ${selectedFile.label}.${incrementValue}`;
        const textWidth = doc.getTextWidth(tmsDate);
        const rightMargin = 14;
        const pageWidth = doc.internal.pageSize.width;
        const startX = pageWidth - rightMargin - textWidth;
        doc.text(tmsDate, startX, 27);
        doc.setDrawColor('#BF9853');
        doc.setLineWidth(1);
        doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
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
        const headers = [
            [
                "SNO",
                "AREA NAME",
                "TYPE",
                "L  (Ft)",
                "B  (Ft)",
                "H  (Ft)",
                "LESS AREA (SQFT)",
                "SKIRTING AREA (SQFT)",
                "EXTRA (%)",
                "ORDER QTY (SQFT)"
            ]
        ];
        const rows = [];
        let previousFloorName = null;
        let floorCounter = 0;
        let areaCounter = 1;
        floors.forEach((floor) => {
            const currentFloorName = (floor.floorName || previousFloorName).toUpperCase();
            if (currentFloorName !== previousFloorName) {
                floorCounter += 1;
                areaCounter = 1;
                const floorLetter = String.fromCharCode(64 + floorCounter);
                rows.push([
                    { content: floorLetter, styles: { fontStyle: "bold" } },
                    { content: currentFloorName, styles: { fontStyle: "bold" } },
                    "", "", "", "", "", "", "", "", "", "", "", ""
                ]);
                previousFloorName = currentFloorName;
            }
            let areaNamePrinted = false;
            floor.tiles.forEach(tile => {
                const { length, breadth, height, wastagePercentage, deductionArea, type } = tile;
                const lengthNum = parseFeetInches(length);
                const breadthNum = parseFeetInches(breadth);
                const heightNum = parseFeetInches(height);
                const wastagePercentageNum = Number(wastagePercentage);
                const deductionAreaNum = Number(deductionArea || 0);
                let tileArea;
                let skirtingArea = tile.type === "Floor Tile" ? parseFloat(calculateSkirtingAreas(tile, floor.areaName)) : 0;
                if (type === "Floor Tile") {
                    tileArea = lengthNum * breadthNum;
                } else {
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
        const tableStartY = 44;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.autoTable({
            head: headers,
            body: rows,
            startY: tableStartY,
            theme: "grid",
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
                0: { halign: "center", cellWidth: 11, minCellHeight: 2 },
                1: { halign: "left", cellWidth: 42.5, cellHeight: 2 },
                2: { halign: "left", cellWidth: 20, cellHeight: 2 },
                3: { halign: "center", cellWidth: 12.5, cellHeight: 2 },
                4: { halign: "center", cellWidth: 12.5, cellHeight: 2 },
                5: { halign: "center", cellWidth: 12.5, cellHeight: 2 },
                6: { halign: "center", cellWidth: 16.6, cellHeight: 2 },
                7: { halign: "center", cellWidth: 21.5, cellHeight: 2 },
                8: { halign: "center", cellWidth: 16, cellHeight: 2 },
                9: { halign: "center", cellWidth: 17, cellHeight: 2 },
            },
            margin: { left: 14, right: 14, top: 44 },
            tableWidth: 'wrap',
            rowPageBreak: 'avoid',
            didDrawPage: (data) => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("TILE MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CLIENT COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const tmsDate = `TMS CC ${clientId} - ${selectedFile.label}.${incrementValue}`;
                const textWidth = doc.getTextWidth(tmsDate);
                const rightMargin = 14;
                const pageWidth = doc.internal.pageSize.width;
                const startX = pageWidth - rightMargin - textWidth;
                doc.text(tmsDate, startX, 27);
                doc.setDrawColor('#BF9853');
                doc.setLineWidth(1);
                doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
                footer();
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.2);
                doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
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
    };
    const customerCopyPDFWithImage = async () => {
        const doc = new jsPDF({
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
                return 0;
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
        const incrementValue = await getIncrement(fileLabel, fileType, clientId);
        if (selectedFile && selectedFile.label) {
            filename = `TMS ${fileType} ${clientId} - ${selectedFile.label}.${incrementValue}.pdf`;
        } else {
            const revisionNumber = await getRevisionNumber(siteName);
            filename = `TMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDate(currentDate)}.pdf`;
        }
        await postIncrement(fileLabel, fileType);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("TILE MEASUREMENT SHEET", 14, 15);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        const clientLabel = "CLIENT: ";
        doc.text(clientLabel, 14, 33);
        const labelWidth = doc.getTextWidth(clientLabel);
        doc.setFont("helvetica", "normal");
        const siteNameText = siteName.toUpperCase();
        doc.text(siteNameText, 14 + labelWidth, 33);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("CLIENT CONFIRMATION COPY", doc.internal.pageSize.width - 38, 15);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const tmsDate = `TMS CC ${clientId} - ${selectedFile.label}.${incrementValue}`;
        const textWidth = doc.getTextWidth(tmsDate);
        const rightMargin = 14;
        const pageWidth = doc.internal.pageSize.width;
        const startX = pageWidth - rightMargin - textWidth;
        doc.text(tmsDate, startX, 27);
        doc.setDrawColor('#BF9853');
        doc.setLineWidth(1);
        doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
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
        const headers = [
            [
                "SNO",
                "AREA NAME",
                "TYPE",
                "Tile Name",
                "Tile Size",
                "Image",
            ]
        ];
        const rows = [];
        let previousFloorName = null;
        let floorCounter = 0;
        let areaCounter = 1;
        floors.forEach((floor) => {
            const currentFloorName = (floor.floorName || previousFloorName).toUpperCase();
            if (currentFloorName !== previousFloorName) {
                floorCounter += 1;
                areaCounter = 1;
                const floorLetter = String.fromCharCode(64 + floorCounter);
                rows.push([
                    { content: floorLetter, styles: { fontStyle: "bold" } },
                    { content: currentFloorName, styles: { fontStyle: "bold" } },
                    "", "", "", "", "", "", "", "", "", "", "", ""
                ]);
                previousFloorName = currentFloorName;
            }
            let areaNamePrinted = false;
            floor.tiles.forEach(tile => {
                const areaNameCell = areaNamePrinted ? '' : floor.areaName;
                areaNamePrinted = true;
                const matchingTileImage = tileWithImages.find(
                    img => img.tileName === tile.tileName && img.tileSize === tile.size
                );
                rows.push([
                    areaCounter,
                    areaNameCell,
                    tile.type,
                    tile.tileName,
                    tile.tileSize,
                    matchingTileImage ? { image: matchingTileImage.image, display: '' } : '',
                ]);
                areaCounter += 1;
            });
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
            body: rows,
            startY: tableStartY,
            theme: "grid",
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
                0: { halign: "center", cellWidth: 11, minCellHeight: 2 },
                1: { halign: "left", cellWidth: 42.5, cellHeight: 2 },
                2: { halign: "left", cellWidth: 20, cellHeight: 2 },
                3: { halign: "center", cellWidth: 44.5, cellHeight: 2 },
                4: { halign: "center", cellWidth: 24, cellHeight: 2 },
                5: { halign: "center", cellWidth: 40, cellHeight: 2 },
            },
            margin: { left: 14, right: 14, top: 44 },
            tableWidth: 'wrap',
            rowPageBreak: 'avoid',
            didDrawPage: (data) => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("TILE MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFont("helvetica", "normal");
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CLIENT COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const tmsDate = `TMS CC ${clientId} - ${selectedFile.label}.${incrementValue}`;
                const textWidth = doc.getTextWidth(tmsDate);
                const rightMargin = 14;
                const pageWidth = doc.internal.pageSize.width;
                const startX = pageWidth - rightMargin - textWidth;
                doc.text(tmsDate, startX, 27);
                doc.setDrawColor('#BF9853');
                doc.setLineWidth(1);
                doc.line(14, 20, doc.internal.pageSize.width - 14, 20);
                footer();
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.2);
                doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            },
            didParseCell: (data) => {
                // Check if it's a floor row (floor name should be in column 1)
                if (data.section === "body" && data.column.index === 1) {
                    const isFloorRow = data.cell.raw && data.cell.raw.content && data.cell.raw.content.toUpperCase().includes("FLOOR");
                    // Apply smaller height for floor name rows, else use larger height
                    if (isFloorRow) {
                        data.cell.styles.minCellHeight = 8;
                    } else {
                        data.cell.styles.minCellHeight = 40;
                    }
                }
            },
            didDrawCell: (data) => {
                const { doc, cell } = data;
                // Render image
                if (
                    data.section === "body" &&
                    data.column.index === 5 &&
                    typeof cell.raw === "object" &&
                    cell.raw.image
                ) {
                    const imageBase64 = `data:image/jpeg;base64,${cell.raw.image}`;
                    try {
                        doc.addImage(
                            imageBase64,
                            "JPEG",  // or "PNG" if needed
                            cell.x + 1,
                            cell.y + 1,
                            37,
                            37
                        );
                    } catch (e) {
                        console.warn("Image rendering failed:", e);
                    }
                }
            }
        });
        doc.save(filename);
        return doc.output("blob");
    };
    const handleTileOCButtonClick = () => {
        setIsModalTileOpenOC(true);
    }
    const handleTileCCButtonClick = () => {
        setIsCustomerCopyPdfSelect(true);
    }
    const handleCloseModalTileOC = () => {
        setOCTileSelection([]);
        setIsModalTileOpenOC(false);
    }
    const handleCloseModalTileCC = () => {
        setIsCustomerCopyPdfSelect(false);
    }
    const handleConfirmTileOC = () => {
        if (ocTileSelection === 'With Image' || ocTileSelection === 'Without Image') {
            setIsFloorSelectOpen(true);
        }
        setIsModalTileOpenOC(false);
    };
    const handleConfirmTileCC = () => {
        if (customerCopyPDFSelect === 'Requirement Copy') {
            customerCopyPDF();
        }
        if (customerCopyPDFSelect === 'Confirmation Copy') {
            customerCopyPDFWithImage();
        }
        setIsCustomerCopyPdfSelect(false);
        setCustomerCopyPDFSelect('');
    };
    const handleConfirmFloorSelection = () => {
        const vendors = [];
        let lastValidFloorName = "";
        floors.forEach((floor) => {
            let floorName = floor.floorName?.trim() || "";
            if (floorName === "") {
                floorName = lastValidFloorName;
            } else {
                lastValidFloorName = floorName;
            }
            if (selectedFloorName.includes(floorName)) {
                floor.tiles.forEach((tile) => {
                    if (tile.vendor) {
                        vendors.push(tile.vendor.trim());
                    }
                });
            }
        });
        const uniqueVendors = [...new Set(vendors)];
        setAvailableVendors(uniqueVendors);
        setSelectedVendors(uniqueVendors);
        setIsVendorSelectOpen(true);
        setIsFloorSelectOpen(false);
    };
    const handleConfirmVendorSelection = () => {
        if (ocTileSelection === 'With Image') {
            summaryPDFWithImage(selectedFloorName, selectedVendors);
        } else if (ocTileSelection === 'Without Image') {
            summaryPDF(selectedFloorName, selectedVendors);
        }
        setIsVendorSelectOpen(false);
        setOCTileSelection('');
        setSelectedFloorName('');
        setSelectedVendors([]);
        setAvailableVendors([]);
    };
    const summaryPDF = async (floorName, selectedVendors) => {
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
                return 0;
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
        const header = () => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("TILE MEASUREMENT SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFont("helvetica", "normal");
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            const tmsDate = `TMS OC ${clientId} - ${selectedFile.label}.${incrementValue}`;
            const textWidth = doc.getTextWidth(tmsDate);
            const rightMargin = 14;
            const pageWidth = doc.internal.pageSize.width;
            const startX = pageWidth - rightMargin - textWidth;
            doc.text(tmsDate, startX, 27);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
            doc.setDrawColor("#BF9853");
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
        const columns = [
            { content: "SNO", styles: { halign: "center", fontStyle: "bold" } },
            { content: "TILE NAME", styles: { halign: "left", fontStyle: "bold" } },
            { content: "SIZE", styles: { halign: "center", fontStyle: "bold" } },
            { content: "TOTAL AREA (SQFT)", styles: { halign: "center", fontStyle: "bold" } },
            { content: "NO OF BOXES", styles: { halign: "center", fontStyle: "bold" } },
        ];
        const filteredSummary = summary2.filter(row =>
            selectedVendors.length > 0
                ? floorName.includes(row.floorName) && selectedVendors.includes(row.vendor)
                : floorName.includes(row.floorName)
        );
        const mergedSummaryMap = new Map();
        filteredSummary.forEach(row => {
            const key = `${row.tileName}_${row.tileSize}`;
            if (!mergedSummaryMap.has(key)) {
                mergedSummaryMap.set(key, {
                    tileName: row.tileName,
                    tileSize: row.tileSize,
                    totalOrderedQuantity: parseFloat(row.totalOrderedQuantity) || 0,
                    totalBoxes: parseFloat(row.totalBoxes) || 0
                });
            } else {
                const existing = mergedSummaryMap.get(key);
                existing.totalOrderedQuantity += parseFloat(row.totalOrderedQuantity) || 0;
                existing.totalBoxes += parseFloat(row.totalBoxes) || 0;
                mergedSummaryMap.set(key, existing);
            }
        });
        const mergedSummary = Array.from(mergedSummaryMap.values());
        const rows = mergedSummary.map((row, index) => {
            const totalOrderedQuantity = parseFloat(row.totalOrderedQuantity) || 0;
            const totalBoxes = parseFloat(row.totalBoxes) || 0;
            return [
                { content: (index + 1).toString(), styles: { halign: "center" } },
                { content: row.tileName, styles: { halign: "left" } },
                { content: row.tileSize, styles: { halign: "center" } },
                { content: totalOrderedQuantity.toFixed(2), styles: { halign: "center" } },
                { content: totalBoxes.toFixed(2), styles: { halign: "center" } },
            ];
        });
        const totalArea = mergedSummary.reduce((acc, row) => acc + (parseFloat(row.totalOrderedQuantity) || 0), 0).toFixed(2);
        const totalBoxes = mergedSummary.reduce((acc, row) => acc + (parseFloat(row.totalBoxes) || 0), 0).toFixed(2);
        rows.push([
            { content: "", styles: { fontStyle: "bold" } },
            { content: "TOTAL", styles: { fontStyle: "bold" } },
            { content: "", styles: { fontStyle: "bold" } },
            { content: totalArea, styles: { halign: "center", fontStyle: "bold" } },
            { content: totalBoxes, styles: { halign: "center", fontStyle: "bold" } },
        ]);
        const tableStartY = 44;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.autoTable({
            head: [columns.map((col) => col.content)],
            body: rows,
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
            margin: { left: 14, right: 14, top: 44 },
            rowPageBreak: 'avoid',
            didDrawPage: (data) => {
                header();
                footer();
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.2);
                doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
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
    };
    const summaryPDFWithImage = async (floorName, selectedVendors) => {
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
                return 0;
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
        const header = () => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("TILE MEASUREMENT SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFont("helvetica", "normal");
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            const tmsDate = `TMS OC ${clientId} - ${selectedFile.label}.${incrementValue}`;
            const textWidth = doc.getTextWidth(tmsDate);
            const rightMargin = 14;
            const pageWidth = doc.internal.pageSize.width;
            const startX = pageWidth - rightMargin - textWidth;
            doc.text(tmsDate, startX, 27);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
            doc.setDrawColor("#BF9853");
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
        const columns = [
            { content: "SNO", styles: { halign: "center", fontStyle: "bold" } },
            { content: "TILE NAME", styles: { halign: "left", fontStyle: "bold" } },
            { content: "SIZE", styles: { halign: "center", fontStyle: "bold" } },
            { content: "TOTAL AREA (SQFT)", styles: { halign: "center", fontStyle: "bold" } },
            { content: "NO OF BOXES", styles: { halign: "center", fontStyle: "bold" } },
            { content: "IMAGE", styles: { halign: "center", fontStyle: "bold" } },
        ];
        const filteredSummary = summary2.filter(row =>
            selectedVendors.length > 0
                ? floorName.includes(row.floorName) && selectedVendors.includes(row.vendor)
                : floorName.includes(row.floorName)
        );
        const mergedSummaryMap = new Map();
        filteredSummary.forEach(row => {
            const key = `${row.tileName}_${row.tileSize}`;
            if (!mergedSummaryMap.has(key)) {
                mergedSummaryMap.set(key, {
                    tileName: row.tileName,
                    tileSize: row.tileSize,
                    totalOrderedQuantity: parseFloat(row.totalOrderedQuantity) || 0,
                    totalBoxes: parseFloat(row.totalBoxes) || 0
                });
            } else {
                const existing = mergedSummaryMap.get(key);
                existing.totalOrderedQuantity += parseFloat(row.totalOrderedQuantity) || 0;
                existing.totalBoxes += parseFloat(row.totalBoxes) || 0;
                mergedSummaryMap.set(key, existing);
            }
        });
        const mergedSummary = Array.from(mergedSummaryMap.values());
        const rows = mergedSummary.map((row, index) => {
            const totalOrderedQuantity = parseFloat(row.totalOrderedQuantity) || 0;
            const totalBoxes = parseFloat(row.totalBoxes) || 0;
            return [
                { content: (index + 1).toString(), styles: { halign: "center" } },
                { content: row.tileName, styles: { halign: "left" } },
                { content: row.tileSize, styles: { halign: "center" } },
                { content: totalOrderedQuantity.toFixed(2), styles: { halign: "center" } },
                { content: totalBoxes.toFixed(2), styles: { halign: "center" } },
                { content: "", styles: { halign: "center" } },
            ];
        });
        const totalArea = mergedSummary.reduce((acc, row) => acc + (parseFloat(row.totalOrderedQuantity) || 0), 0).toFixed(2);
        const totalBoxes = mergedSummary.reduce((acc, row) => acc + (parseFloat(row.totalBoxes) || 0), 0).toFixed(2);
        rows.push([
            { content: "", styles: { fontStyle: "bold" } },
            { content: "TOTAL", styles: { fontStyle: "bold" } },
            { content: "", styles: { fontStyle: "bold" } },
            { content: totalArea, styles: { halign: "center", fontStyle: "bold" } },
            { content: totalBoxes, styles: { halign: "center", fontStyle: "bold" } },
        ]);
        const tableStartY = 44;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.autoTable({
            head: [columns.map((col) => col.content)],
            body: rows,
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
                minCellHeight: 36,
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 15 },
                1: { halign: "left", cellWidth: 44 },
                2: { halign: "center", cellWidth: 26 },
                3: { halign: "center", cellWidth: 25 },
                4: { halign: "center", cellWidth: 20 },
                5: { halign: "center", cellWidth: 52 },
            },
            margin: { left: 14, right: 14, top: 44 },
            rowPageBreak: 'avoid',
            didDrawPage: (data) => {
                header();
                footer();
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.2);
                doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            },
            didParseCell: (data) => {
                const isTotalRow = rows.length - 1 === data.row.index;
                if (data.section === 'body' && isTotalRow) {
                    data.cell.styles.minCellHeight = 15;
                }
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
                if (data.section === "body" && data.column.index === 5) {
                    const isTotalRow = rows.length - 1 === data.row.index;
                    if (isTotalRow) {
                        return;
                    }
                    const item = summary[data.row.index];
                    if (item && item.image) {
                        const imageBase64 = `data:image/png;base64,${item.image}`;
                        const x = data.cell.x + 2;
                        const y = data.cell.y + 1;
                        const width = data.cell.width - 4;
                        const height = data.cell.height - 2;

                        try {
                            doc.addImage(imageBase64, 'PNG', x, y, width, height);
                        } catch (imageError) {
                            console.error("Error adding image to PDF:", imageError);
                        }
                    }
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
                return 0;
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
        const header = () => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("TILE MEASUREMENT SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFont("helvetica", "normal");
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            const tmsDate = `TMS SC ${clientId} - ${selectedFile.label}.${incrementValue}`;
            const textWidth = doc.getTextWidth(tmsDate);
            const rightMargin = 14;
            const pageWidth = doc.internal.pageSize.width;
            const startX = pageWidth - rightMargin - textWidth;
            doc.text(tmsDate, startX, 27);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("STOCKING CHART", doc.internal.pageSize.width - 46, 15);
            doc.setDrawColor("#BF9853");
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
        const columns = [
            { content: "SNO", styles: { halign: "center", fontStyle: "bold" } },
            { content: "FLOOR NAME", styles: { halign: "center", fontStyle: "bold" } },
            { content: "TILE NAME", styles: { halign: "left", fontStyle: "bold" } },
            { content: "TILE SIZE", styles: { halign: "center", fontStyle: "bold" } },
            { content: "TOTAL AREA (SQFT)", styles: { halign: "center", fontStyle: "bold" } },
            { content: "NO OF BOXES", styles: { halign: "center", fontStyle: "bold" } },
        ];
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
                    size: item.tileSize,
                    totalOrderedQuantity: '',
                    totalBoxes: ''
                };
            }
            floorData[floorName][tileKey].totalOrderedQuantity += item.totalOrderedQuantity;
            floorData[floorName][tileKey].totalBoxes += item.totalBoxes;
        });
        for (const floor in floorData) {
            for (const tileKey in floorData[floor]) {
                const tile = floorData[floor][tileKey];
                rows.push([
                    { content: serialNumber++, styles: { halign: "center" } },
                    { content: floor, styles: { halign: "center" } },
                    { content: tile.tileName, styles: { halign: "left" } },
                    { content: tile.size, styles: { halign: "center" } },
                    { content: tile.totalOrderedQuantity, styles: { halign: "center" } },
                    { content: tile.totalBoxes, styles: { halign: "center" } },
                ]);
            }
        }
        const totalArea = summaryData.reduce((acc, row) => acc + (parseFloat(row.totalOrderedQuantity) || 0), 0).toFixed(2);
        const totalBoxes = summaryData.reduce((acc, row) => acc + (parseFloat(row.totalBoxes) || 0), 0).toFixed(2);
        rows.push([
            { content: "", styles: { fontStyle: "bold" } },
            { content: "TOTAL", styles: { fontStyle: "bold" }, fontSize: 12 },
            { content: "", styles: { fontStyle: "bold" } },
            { content: "", styles: { fontStyle: "bold" } },
            { content: totalArea, styles: { halign: "center", fontStyle: "bold" }, fontSize: 12 },
            { content: totalBoxes, styles: { halign: "center", fontStyle: "bold" }, fontSize: 12 },
        ]);
        const tableStartY = 45;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
        doc.autoTable({
            head: [columns.map(col => col.content)],
            body: rows,
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
                0: { cellWidth: 15 },
                1: { cellWidth: 35 },
                2: { cellWidth: 48 },
                3: { cellWidth: 30 },
                4: { cellWidth: 30 },
                5: { cellWidth: 24.1 },
            },
            margin: { left: 14, top: 44, bottom: 25 },
            pageBreak: 'auto',
            rowPageBreak: 'avoid',
            didDrawPage: (data) => {
                if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
                    data.settings.startY = -30;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
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
                return 0;
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
        const header = (doc) => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("TILE MEASUREMENT SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFont("helvetica", "normal");
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            const tmsDate = `TMS EC ${clientId} - ${selectedFile.label}.${incrementValue}`;
            const textWidth = doc.getTextWidth(tmsDate);
            const rightMargin = 14;
            const pageWidth = doc.internal.pageSize.width;
            const startX = pageWidth - rightMargin - textWidth;
            doc.text(tmsDate, startX, 27);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
            doc.setFont("helvetica", "normal");
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
        const customerHeaders = [
            [
                "SNO",
                "AREA NAME",
                "TYPE",
                "L  (Ft)",
                "B  (Ft)",
                "H  (Ft)",
                "LESS AREA (SQFT)",
                "SKIRTING AREA (SQFT)",
                "EXTRA (%)",
                "ORDER QTY (SQFT)",
                "TILE NAME",
                "SIZE",
                "QTY/ BOX",
                "BOX NOS",
            ],
        ];
        const customerRows = [];
        let previousFloorName = null;
        let floorCounter = 0;
        let areaCounter = 1;
        floors.forEach((floor) => {
            const currentFloorName = (floor.floorName || previousFloorName).toUpperCase();
            if (currentFloorName !== previousFloorName) {
                floorCounter += 1;
                areaCounter = 1;
                const floorLetter = String.fromCharCode(64 + floorCounter);
                customerRows.push([
                    { content: floorLetter, styles: { fontStyle: "bold" } },
                    { content: currentFloorName, styles: { fontStyle: "bold" } },
                    "", "", "", "", "", "", "", "", "", "", "", ""
                ]);
                previousFloorName = currentFloorName;
            }
            let areaNamePrinted = false;
            floor.tiles.forEach(tile => {
                const { length, breadth, height, wastagePercentage, deductionArea, type, quantityBox, tileName, size, areaTile } = tile;
                const lengthNum = parseFeetInches(length);
                const breadthNum = parseFeetInches(breadth);
                const heightNum = parseFeetInches(height);
                const wastagePercentageNum = Number(wastagePercentage);
                const deductionAreaNum = Number(deductionArea || 0);
                let tileArea;
                let skirtingArea = tile.type === "Floor Tile" ? Number(tile.skirtingArea) : 0;
                if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x B') {
                    tileArea = lengthNum * breadthNum;
                } else if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x H') {
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
                    type,
                    length,
                    breadth,
                    height,
                    deductionAreaNum,
                    skirtingArea.toFixed(2),
                    `${wastagePercentage}%`,
                    totalOrderedQuantity.toFixed(2),
                    tileName,
                    size,
                    quantityBox,
                    noOfBoxes
                ]);
                areaCounter += 1;
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
            head: customerHeaders,
            body: customerRows,
            startY: tableStartY,
            theme: "grid",
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
                0: { halign: "center", cellWidth: 12, minCellHeight: 2 },
                1: { halign: "left", cellWidth: 35, cellHeight: 2 },
                2: { halign: "left", cellWidth: 20, cellHeight: 2 },
                3: { halign: "center", cellWidth: 12.5, cellHeight: 2 },
                4: { halign: "center", cellWidth: 12.5, cellHeight: 2 },
                5: { halign: "center", cellWidth: 12.5, cellHeight: 2 },
                6: { halign: "center", cellWidth: 16.5, cellHeight: 2 },
                7: { halign: "center", cellWidth: 20.5, cellHeight: 2 },
                8: { halign: "center", cellWidth: 15.5, cellHeight: 2 },
                9: { halign: "center", cellWidth: 17, cellHeight: 2 },
                10: { halign: "left", cellWidth: 46.6, cellHeight: 2 },
                11: { halign: "center", cellWidth: 22, cellHeight: 2 },
                12: { halign: "center", cellWidth: 12.5, cellHeight: 2 },
                13: { halign: "center", cellWidth: 14, cellHeight: 2 },
            },
            margin: { left: 14, top: 44, bottom: 25 },
            pageBreak: 'auto',
            rowPageBreak: 'avoid',
            didDrawPage: (data) => {
                if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
                    data.settings.startY = -30;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
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
            },
        });
        doc.save(filename);
        return doc.output("blob");
    };
    const getRevisionNumber = async (clientName) => {
        try {
            const clientResponse = await fetch("https://backendaab.in/aabuilderDash/api/tile/tile/all");
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
    const extractTileBillData = () => {
        let lastFloorName = "";
        const groupedData = {};
        floors.forEach((floor) => {
            if (floor.floorName && floor.floorName.trim() !== "") {
                lastFloorName = floor.floorName;
            }
            if (!floor.tiles || floor.tiles.length === 0) {
                console.warn(`No tiles found for ${lastFloorName}`);
                return;
            }
            const typeTotals = {};
            floor.tiles.forEach((tile) => {
                const commonData = {
                    floorName: lastFloorName,
                    areaName: floor.areaName || "",
                    length: tile.length || "",
                    breadth: tile.breadth || "",
                    height: tile.height || "",
                };
                function formatDeductionInput(deductionInput) {
                    if (!deductionInput) return "";
                    return deductionInput
                        .replace(/\(\((\d+(\.\d+)?\s*[Xx]\s*\d+(\.\d+)?)\s*\)\s*x\s*1\)/g, "($1)")
                        .replace(/\s+/g, "")
                        .replace(/[X]/g, "x");
                }
                const deductionShortInputs = formatDeductionInput(tile.deductionInput);
                const tileLength = parseFeetInches(tile.length || 0);
                const tileBreadth = parseFeetInches(tile.breadth || 0);
                const tileHeight = parseFeetInches(tile.height || 0);
                const matchedFloorType = tileFloorTypes.find(floor => floor.floorType === tile.type);
                const formula = matchedFloorType?.formula;
                let area;
                let measurement;
                if (formula === 'L x B') {
                    area = tileLength * tileBreadth;
                    measurement = `${tile.length} x ${tile.breadth}`;
                } else if (formula === 'L x H') {
                    area = tileLength * tileHeight;
                    measurement = `${tile.length} x ${tile.height}`;
                } else {
                    area = 0;
                    measurement = "";
                }
                const skirtingAreaInch = (Number(selectSkirtingArea) / 12).toFixed(2);
                const skirtingAreaMeasurement = tile.type === "Floor Tile"
                    ? `((${tile.length}x2)+(${tile.breadth}x2))x${skirtingAreaInch}`
                    : 0;
                const skirtingArea = tile.type === "Floor Tile" ? Number(tile.skirtingArea) : 0;
                if (!typeTotals[tile.type]) {
                    typeTotals[tile.type] = 0;
                }
                typeTotals[tile.type] += area + (tile.type === "Floor Tile" ? skirtingArea : 0);
                if (!groupedData[lastFloorName]) groupedData[lastFloorName] = {};
                if (!groupedData[lastFloorName][floor.areaName]) groupedData[lastFloorName][floor.areaName] = [];
                const rate = parseFloat(rateByType[tile.type]) || Number(tile.rate) || 0;
                const amount = ((area - tile.deductionArea) * rate).toFixed(2);
                const skirtingRate = parseFloat(skirtingAreaRate) || Number(tile.rate) || 0;
                const skirtingAreaAmount = (skirtingArea * skirtingRate).toFixed(2);
                groupedData[lastFloorName][floor.areaName].push({
                    ...commonData,
                    description: tile.type,
                    area: area,
                    deductionArea: tile.deductionArea,
                    measurement: measurement,
                    netArea: (area - tile.deductionArea).toFixed(2),
                    rate: rate,
                    amount: amount,
                });
                if (tile.type === "Floor Tile" && skirtingArea > 0) {
                    const validRate = skirtingAreaRate || Number(tile.rate) || 0;

                    groupedData[lastFloorName][floor.areaName].push({
                        ...commonData,
                        description: `Skirting (${selectSkirtingArea}")`,
                        area: skirtingArea,
                        deductionArea: 0,
                        measurement: skirtingAreaMeasurement,
                        netArea: skirtingArea,
                        rate: validRate,
                        amount: (skirtingArea * validRate).toFixed(2),
                    });
                }
                groupedData[lastFloorName][floor.areaName].push({
                    ...commonData,
                    description: "Additional",
                    area: 0,
                    deductionArea: 0,
                    measurement: 0,
                    netArea: 0,
                    rate: 0,
                    amount: 0,
                });
                groupedData[lastFloorName][floor.areaName].push({
                    ...commonData,
                    description: "Deduction",
                    area: 0,
                    deductionArea: 0,
                    measurement: deductionShortInputs || "",
                    netArea: 0,
                    rate: 0,
                    amount: 0,
                });
                groupedData[lastFloorName][floor.areaName].push({
                    ...commonData,
                    description: `${tile.type} Area`,
                    area: typeTotals[tile.type],
                    deductionArea: tile.deductionArea,
                    measurement: 0,
                    netArea: typeTotals[tile.type] - tile.deductionArea,
                    rate: 0,
                    amount: tile.type === "Floor Tile" ? parseFloat(amount) + parseFloat(skirtingAreaAmount) : amount,
                });
                typeTotals[tile.type] = 0;
            });
        });
        generateTileBillPDF(groupedData);
    };
    const generateTileBillPDF = async (groupedData) => {
        const doc = new jsPDF();
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
        const fileType = 'TILE';
        const siteName = clientName.label;
        const clientId = clientSNo || 0;
        const fileLabel = selectedFile && selectedFile.label ? selectedFile.label : `${selectedDate}`;
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
                return 0;
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
            filename = `TMS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
        }
        await postIncrement(fileLabel, fileType);
        const header = (doc) => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("TILE BILLING SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFontSize(8);
            doc.text("TILE WORK", doc.internal.pageSize.width - 30, 41);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setFont("helvetica", "bold");
            doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
            doc.setFontSize(10);
            const tmsDate = `TMS TILE WORK ${clientId} - ${selectedFile.label}.${incrementValue}`;
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
        const footer = (doc) => {
            const pageWidth = doc.internal.pageSize.width;
            const footerY = doc.internal.pageSize.height - 14;
            doc.setDrawColor(150);
            doc.setLineWidth(0.5);
            doc.line(14, footerY, pageWidth - 14, footerY);
            doc.setFontSize(10.5);
            doc.setFont("helvetica", "bold");
            doc.text("AA BUILDERS", 14, doc.internal.pageSize.height - 9);
            doc.setFontSize(9);
            const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
            const currentPageText = `${currentPage} |`;
            const pageText = " P a g e";
            doc.setTextColor(0, 0, 0);
            doc.text(currentPageText, pageWidth - 19 - doc.getTextWidth(pageText), doc.internal.pageSize.height - 9);
            doc.setTextColor(200, 200, 200);
            doc.text(pageText, pageWidth - 25, doc.internal.pageSize.height - 9);
        };
        let yPosition = 10;
        const tableHeader = ["S.No", "Area Name", "Measurement", "Area (Sqft)", "Deduction Area", "Net Area", "Rate", "Amount"];
        const allTableRows = [];
        const floorWiseSums = [];
        let floorIndex = 0;
        const tileTypesWithArea = floors.flatMap(floor =>
            floor.tiles.map(tile => `${tile.type} Area`)
        );
        const tileTypes = floors.flatMap(floor =>
            floor.tiles.map(tile => `${tile.type}`)
        );
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const currencyFormatter = new Intl.NumberFormat("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        const numberFormatter = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        Object.keys(groupedData).forEach((floorName) => {
            const floorData = groupedData[floorName];
            const floorSNo = alphabet[floorIndex++];
            let floorSum = 0;
            allTableRows.push([
                { content: floorSNo, styles: { halign: 'center', fontStyle: 'bold' } },
                { content: `${floorName}`, colSpan: 8, styles: { halign: 'left', fontStyle: 'bold' } },
            ]);
            let areaIndex = 1;
            Object.keys(floorData).forEach((areaName) => {
                const areaSNo = areaIndex++;
                let tileIndex = 1;
                allTableRows.push([
                    { content: areaSNo, styles: { halign: 'center', fontStyle: 'bold', font: 'helvetica' } },
                    { content: `${areaName}`, colSpan: 7, styles: { halign: 'left', fontStyle: 'bold', font: 'helvetica' } },
                ]);
                const tableRows = floorData[areaName].map((row) => {
                    let serialNumber = "";
                    if (tileTypes.includes(row.description)) {
                        serialNumber = `${areaSNo}.${tileIndex}`;
                        tileIndex++;
                    }
                    if (tileTypesWithArea.includes(row.description)) {
                        floorSum += row.amount || 0;
                    }
                    return row.description === "Deduction"
                        ? [
                            { content: serialNumber, styles: { halign: 'right' } },
                            row.description || "",
                            {
                                content: `${row.measurement || ""} ${row.area ? numberFormatter.format(row.area) : ""}`,
                                colSpan: 2,
                                styles: { halign: 'left' }
                            },
                            row.deductionArea === 0 ? "" : row.deductionArea,
                            row.netArea === 0 ? "" : numberFormatter.format(row.netArea),
                            row.rate === 0 ? "" : row.rate,
                            row.amount === 0 ? "" : currencyFormatter.format(row.amount),
                        ]
                        : [
                            { content: serialNumber, styles: { halign: 'right' } },
                            row.description || "",
                            row.measurement || "",
                            row.area === 0 ? "" : numberFormatter.format(row.area),
                            row.deductionArea === 0 ? "" : row.deductionArea,
                            row.netArea === 0 ? "" : numberFormatter.format(row.netArea),
                            row.rate === 0 ? "" : row.rate,
                            row.amount === 0 ? "" : currencyFormatter.format(row.amount),
                        ];
                });
                allTableRows.push(...tableRows);
            });
            floorWiseSums.push({ floorName, floorSum });
        });
        const uniqueTileTypes = Array.from(
            new Set(floors.flatMap(floor => floor.tiles.map(tile => tile.type)))
        );
        const floorWiseTotal = {};
        const floorWiseAmountTotal = {};
        Object.keys(groupedData).forEach((floorName) => {
            const areaTotals = {};
            const amountTotals = {};
            let areaSkirting = 0;
            let amountSkirting = 0;
            uniqueTileTypes.forEach(type => {
                areaTotals[type] = 0;
                amountTotals[type] = 0;
            });
            Object.values(groupedData[floorName]).forEach((areaData) => {
                areaData.forEach((row) => {
                    uniqueTileTypes.forEach(type => {
                        if (row.description?.trim().toLowerCase() === type.toLowerCase()) {
                            areaTotals[type] += parseFloat(row.netArea || 0);
                            amountTotals[type] += parseFloat(row.amount || 0);
                        }
                    });
                    if (row.description?.trim().toLowerCase() === `skirting (${selectSkirtingArea}")`) {
                        areaSkirting += parseFloat(row.netArea || 0);
                        amountSkirting += parseFloat(row.amount || 0);
                    }
                });
            });
            floorWiseTotal[floorName] = {};
            floorWiseAmountTotal[floorName] = {};
            uniqueTileTypes.forEach(type => {
                if (areaTotals[type] > 0) {
                    floorWiseTotal[floorName][type] = numberFormatter.format(areaTotals[type]);
                    floorWiseAmountTotal[floorName][type] = numberFormatter.format(amountTotals[type]);
                }
            });
            if (areaSkirting > 0) {
                floorWiseTotal[floorName][`Skirting (${selectSkirtingArea}")`] = numberFormatter.format(areaSkirting);
                floorWiseAmountTotal[floorName][`Skirting (${selectSkirtingArea}")`] = numberFormatter.format(amountSkirting);
            }
        });
        const floorWiseTotals = Object.keys(groupedData).map((floorName) => {
            let totalAmount = 0;
            let totalArea = 0;
            Object.values(groupedData[floorName]).forEach((areaData) => {
                totalAmount += areaData
                    .filter((row) => (tileTypesWithArea.includes(row.description)))
                    .reduce((sum, row) => sum + parseFloat(row.amount || 0), 0);
                totalArea += areaData
                    .filter((row) => (tileTypesWithArea.includes(row.description)))
                    .reduce((sum, row) => sum + parseFloat(row.netArea || 0), 0);
            });
            return {
                floorName,
                totalAmount: currencyFormatter.format(totalAmount),
                totalArea: numberFormatter.format(totalArea)
            };
        });
        const grandTotalAmount = floorWiseTotals.reduce(
            (sum, floor) => sum + parseFloat(floor.totalAmount.replace(/,/g, '').replace(/₹/g, '')), 0
        );
        const grandTotalArea = floorWiseTotals.reduce(
            (sum, floor) => sum + parseFloat(floor.totalArea.replace(/,/g, '')), 0
        );
        const formattedGrandTotalAmount = currencyFormatter.format(grandTotalAmount);
        const formattedGrandTotalArea = numberFormatter.format(grandTotalArea);
        const tableStartY = 44;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);
        doc.line(14, tableStartY, doc.internal.pageSize.width - 14, tableStartY);
        doc.setFontSize(12);
        doc.autoTable({
            startY: yPosition + 34,
            head: [tableHeader],
            body: allTableRows,
            theme: 'grid',
            columnStyles: {
                0: { cellWidth: 14, halign: 'center' },
                1: { cellWidth: 27, halign: 'left' },
                2: { cellWidth: 38, halign: 'left' },
                3: { cellWidth: 19, halign: 'right' },
                4: { cellWidth: 24, halign: 'center' },
                5: { cellWidth: 20, halign: 'center' },
                6: { cellWidth: 16, halign: 'center' },
                7: { cellWidth: 24, halign: 'right' },
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                font: "helvetica",
                fontSize: 10,
                halign: 'center',
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [0, 0, 0],
                halign: "left",
                font: "helvetica",
            },
            margin: { top: 44 },
            didDrawPage: (data) => {
                header(doc);
                footer(doc);
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.1);
                doc.line(14, tableStartY, doc.internal.pageSize.width - 14, tableStartY);
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.1);
                const startX = data.table?.startX || 14;
                const endX = (data.table?.startX || 96) + (data.table?.width || 100);
                const yPosition = (data.row?.y || 7.3) + (data.row?.height || 48.5);
                doc.line(startX, yPosition, endX, yPosition);
            },
            didParseCell: (data) => {
                const tileTypesWithArea = floors.flatMap(floor =>
                    floor.tiles.map(tile => `${tile.type} Area`)
                );
                if (data.row.index !== undefined && tileTypesWithArea.includes(data.row.raw[1])) {
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });
        const totalsTableRows = floorWiseTotals.flatMap((total, index) => {
            const floorName = total.floorName;
            const rows = [];
            if (index === 0) {
                rows.push([
                    { content: "", styles: {} },
                    { content: "BILL SUMMARY", styles: { halign: "left", fontStyle: "bold" } },
                    { content: "", styles: {} },
                    { content: "", styles: {} },
                    { content: "", styles: {} },
                ]);
            }
            rows.push([
                { content: String.fromCharCode(65 + index), styles: { halign: "center", fontStyle: "bold" } },
                { content: `Total Amount Of ${floorName}`, styles: { halign: "left", fontStyle: "bold" } },
                { content: total.totalArea, styles: { halign: "center", fontStyle: "bold" } },
                { content: "", styles: {} },
                { content: total.totalAmount, styles: { halign: "right", fontStyle: "bold" } },
            ]);
            uniqueTileTypes.forEach(type => {
                const areaRaw = floorWiseTotal[floorName]?.[type];
                const amountRaw = floorWiseAmountTotal[floorName]?.[type];
                if (!areaRaw || !amountRaw) return;
                const area = parseFloat(areaRaw.replace(/,/g, "")).toFixed(2);
                const amount = amountRaw;
                rows.push([
                    { content: "", styles: {} },
                    { content: `Total ${type.replace(/([A-Z])/g, ' $1')}`, styles: { halign: "left" } },
                    { content: area, styles: { halign: "center" } },
                    { content: "", styles: { halign: "center" } },
                    { content: amount, styles: { halign: "right" } },
                ]);

            });
            const skirtingAreaRaw = floorWiseTotal[floorName]?.[`Skirting (${selectSkirtingArea}")`] || '0';
            const skirtingAmountRaw = floorWiseAmountTotal[floorName]?.[`Skirting (${selectSkirtingArea}")`] || '0';
            rows.push([
                { content: "", styles: {} },
                { content: `Total of Skirting (${selectSkirtingArea}")`, styles: { halign: "left" } },
                { content: skirtingAreaRaw, styles: { halign: "center" } },
                { content: "", styles: { halign: "center" } },
                { content: skirtingAmountRaw, styles: { halign: "right" } },
            ]);
            return rows;
        });
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: " BILL STATEMENT", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: { halign: "right", fontStyle: "bold" } },
            { content: "", styles: {} },
            { content: "", styles: { halign: "right", fontStyle: "bold" } },
        ]);
        const grandTotalRows = [];
        const grandAreas = {};
        const grandAmounts = {};
        uniqueTileTypes.forEach(type => {
            grandAreas[type] = 0;
            grandAmounts[type] = 0;
        });
        const skirtingKey = `Skirting (${selectSkirtingArea}")`;
        grandAreas[skirtingKey] = 0;
        grandAmounts[skirtingKey] = 0;
        Object.keys(floorWiseTotal).forEach(floorName => {
            uniqueTileTypes.forEach(type => {
                const area = parseFloat((floorWiseTotal[floorName]?.[type] || "0").replace(/,/g, ""));
                const amount = parseFloat((floorWiseAmountTotal[floorName]?.[type] || "0").replace(/,/g, ""));
                grandAreas[type] += area;
                grandAmounts[type] += amount;
            });
            const skirtingArea = parseFloat((floorWiseTotal[floorName]?.[skirtingKey] || "0").replace(/,/g, ""));
            const skirtingAmount = parseFloat((floorWiseAmountTotal[floorName]?.[skirtingKey] || "0").replace(/,/g, ""));
            grandAreas[skirtingKey] += skirtingArea;
            grandAmounts[skirtingKey] += skirtingAmount;
        });
        uniqueTileTypes.forEach(type => {
            if (grandAreas[type] > 0 || grandAmounts[type] > 0) {
                grandTotalRows.push([
                    { content: "", styles: {} },
                    { content: `Grand Total ${type.replace(/([A-Z])/g, ' $1')}`, styles: { halign: "left" } },
                    { content: grandAreas[type].toFixed(2), styles: { halign: "center" } },
                    { content: "", styles: { halign: "center" } },
                    { content: numberFormatter.format(grandAmounts[type]), styles: { halign: "right" } },
                ]);
            }
        });
        if (grandAreas[skirtingKey] > 0 || grandAmounts[skirtingKey] > 0) {
            grandTotalRows.push([
                { content: "", styles: {} },
                { content: `Grand Total of ${skirtingKey}`, styles: { halign: "left" } },
                { content: grandAreas[skirtingKey].toFixed(2), styles: { halign: "center" } },
                { content: "", styles: { halign: "center" } },
                { content: numberFormatter.format(grandAmounts[skirtingKey]), styles: { halign: "right" } },
            ]);
        }
        grandTotalRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Total Bill Amount (All Floors)", styles: { halign: "left", fontStyle: "bold" } },
            { content: formattedGrandTotalArea, styles: { halign: "center", fontStyle: "bold" } },
            { content: "", styles: {} },
            { content: formattedGrandTotalAmount, styles: { halign: "right", fontStyle: "bold" } },
        ]);
        grandTotalRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Advance Amount", styles: { halign: "left" } },
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: {} },
            { content: "0", styles: { halign: "right" } },
        ]);
        const remainingAmount = formattedGrandTotalAmount;
        grandTotalRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Balance Amount to be Paid", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: {} },
            { content: remainingAmount, styles: { halign: "right", fontStyle: "bold" } },
        ]);
        const finalTable = [...totalsTableRows, ...grandTotalRows];
        const totalsTableStartY = doc.autoTable.previous.finalY;
        doc.autoTable({
            startY: totalsTableStartY,
            head: "",
            body: finalTable,
            theme: 'grid',
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                font: "helvetica",
                fontSize: 10,
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [0, 0, 0],
                halign: "left",
                font: "helvetica",
            },
            columnStyles: {
                0: { cellWidth: 14, halign: 'center' },
                1: { cellWidth: 108, halign: 'left' },
                2: { cellWidth: 20, halign: 'left' },
                3: { cellWidth: 16, halign: 'center' },
                4: { cellWidth: 24, halign: 'right' },
            },
            didDrawPage: (data) => {
                footer(doc);
            },
        });
        doc.save(filename);
    };
    let displayIndex = 1;
    const sortedSiteOptions = siteOptions.sort((a, b) =>
        a.label.localeCompare(b.label)
    );
    const reversedFileOptions = [...filteredFileOptions].reverse();
    const sizeOptions = tileList.map((sizeOption) => ({
        value: sizeOption.tileSize,
        label: sizeOption.tileSize,
    }));
    const typeOptions = tileFloorTypes.map((floorType) => ({
        value: floorType.floorType,
        label: floorType.floorType,
    }));
    return (
        <body className="">
            <div className=" mx-auto p-6 border-collapse bg-[#FFFFFF] ml-6 mr-6 ">
                <div className=" lg:flex md:grid md:grid-cols-3">
                    <div className=" flex ">
                        <div className="w-full -mt-8 mb-4 text-left">
                            <h4 className="mt-10 font-bold mb-2 -ml-5 md:ml-0 lg:ml-0">Project Name</h4>
                            <div className="relative group">
                                <Select
                                    value={clientName}
                                    onChange={handleSiteChange}
                                    options={sortedSiteOptions}
                                    placeholder="Select Site Name..."
                                    className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg 
                                    [@media(min-width:450px)]:w-[22rem] [@media(min-width:510px)]:w-[23rem] [@media(min-width:550px)]:w-[25.5rem] [@media(min-width:605px)]:w-[29rem] 
                                    [@media(min-width:625px)]:w-[32rem] [@media(min-width:635px)]:w-[33rem] [@media(min-width:645px)]:w-[34rem] [@media(min-width:768px)]:w-[17.5rem] 
                                    [@media(min-width:850px)]:w-[19rem] [@media(min-width:934px)]:w-[21rem] lg:w-96 w-[17.5rem] h-12 lg:-ml-0 md:ml-0 -ml-5 text-left"
                                    styles={customSelectStyles}
                                    isClearable
                                />
                                {extraClient && (
                                    <div className="absolute top-full left-0 mt-2 bg-black text-white text-sm rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {extraClient}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-left md:ml-12 lg:ml-2">
                            <h4 className="font-bold -mb-8 mt-2 ">P.ID</h4>
                            <input
                                type="text"
                                value={clientSNo}
                                readOnly
                                className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg h-12 w-14 md:w-16 mt-10 ml-1 bg-transparent text-center"
                            />
                        </div>
                    </div>
                    <div className="lg:flex ">
                        <div className="flex gap-2">
                            <div className=" lg:ml-3 md:ml-32 -ml-4 md:mt-2 lg:mt-2 -mt-4 text-left">
                                <h4 className=" font-bold mb-2 ">Date </h4>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] w-44 rounded-lg px-4 py-2 "
                                />
                            </div>
                            <div className="lg:mt-2 text-left -mt-2 md:mt-4">
                                <h4 className="font-bold "> E No</h4>
                                <input
                                    className="bg-gray-100 rounded-lg md:w-36 w-28 h-[3.2rem]  lg:mt-2 pl-4"
                                    value={eno}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className=" lg:ml-3 md:-ml-[13rem] text-left">
                            <h4 className="mt-1.5 font-bold mb-2 lg:ml-0 -ml-3"> Revision</h4>
                            <Select
                                placeholder="Select the file..."
                                className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg lg:w-60 w-56 h-[3.2rem] lg:-ml-0 -ml-4 text-left"
                                styles={customSelectStyles}
                                options={reversedFileOptions}
                                isClearable
                                onChange={handleFileChange}
                                value={selectedFile}
                                isDisabled={!clientName}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className={`p-6 bg-[#FFFFFF] mt-6 ml-6 mr-6 rounded-lg overflow-x-auto select-none`}
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}>
                <div className="rounded-lg border-l-8 border-l-[#BF9853] flex mt-5 " id="full-table">
                    <table className="table-auto min-w-max">
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <td>
                                    <Select
                                        value={{ value: selectSkirtingArea, label: `${selectSkirtingArea}"` }}
                                        onChange={handleSkirtingAreaChange}
                                        isSearchable
                                        options={Array.from({ length: 12 }, (_, index) => ({
                                            value: index,
                                            label: `${index}"`,
                                        }))}
                                        styles={customSelectStyles}
                                        className="lg:ml-2 bg-transparent lg:h-11 h-12 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg focus:outline-none lg:w-24 -ml-1 w-24 align-text-top"
                                    />
                                </td>
                                <td>
                                    <Select
                                        name="wastagePercentageDropdown"
                                        value={{ value: wastagePercentages, label: `${wastagePercentages}%` }}
                                        onChange={handleCommonWastageChange}
                                        options={Array.from({ length: 16 }, (_, index) => ({
                                            value: index,
                                            label: `${index}%`
                                        }))}
                                        className="lg:ml-2 bg-transparent lg:h-11 h-12 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg focus:outline-none w-24"
                                        isSearchable={true}
                                        styles={customSelectStyles}
                                    />
                                </td>
                                <th></th>
                                <td>
                                    <Select
                                        value={commonTileName}
                                        onChange={(selectedOption) => {
                                            setCommonTileName(selectedOption);
                                            const newTileName = selectedOption?.value || '';
                                            const updatedFloors = floors.map((floor) => ({
                                                ...floor,
                                                tiles: floor.tiles.map((tile) => {
                                                    const selectedTile = tileOptions.find((t) => t.value === newTileName);
                                                    if (selectedTile) {
                                                        const selectedSizeOption = tileList.find(t => t.tileSize === selectedTile.tileSize);
                                                        return {
                                                            ...tile,
                                                            tileName: newTileName,
                                                            size: selectedTile?.tileSize || '',
                                                            tileSize: selectedTile?.tileSize || '',
                                                            quantityBox: selectedSizeOption?.quantityBox || '',
                                                            correctQuantityBox: selectedSizeOption?.quantityBox || '',
                                                            areaTile: selectedSizeOption?.areaTile || '',
                                                        };
                                                    } else {
                                                        return {
                                                            ...tile,
                                                            tileName: '',
                                                            size: '',
                                                            tileSize: '',
                                                            quantityBox: '',
                                                            correctQuantityBox: '',
                                                            areaTile: '',
                                                        };
                                                    }
                                                }),
                                            }));
                                            setFloors(updatedFloors);
                                        }}
                                        options={tileOptions}
                                        className="text-left"
                                        placeholder="Select Tile Name"
                                        isClearable
                                        menuPortalTarget={document.body}
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
                                </td>
                                <td>
                                    <Select
                                        value={commonTileSize}
                                        onChange={(selectedOption) => {
                                            setCommonTileSize(selectedOption);
                                            const newSize = selectedOption?.value || '';
                                            const selectedSizeData = tileList.find((t) => t.tileSize === newSize);
                                            const updatedData = floors.map((floor) => ({
                                                ...floor,
                                                tiles: floor.tiles.map((tile) => ({
                                                    ...tile,
                                                    size: newSize,
                                                    quantityBox: selectedSizeData?.quantityBox || '',
                                                    correctQuantityBox: selectedSizeData?.quantityBox || '',
                                                    areaTile: selectedSizeData?.areaTile || '',
                                                })),
                                            }));
                                            setFloors(updatedData);
                                        }}
                                        options={sizeOptions}
                                        className="text-left"
                                        placeholder="Select Tile Size"
                                        isClearable
                                        menuPortalTarget={document.body}
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
                                </td>
                                <th></th>
                                <th></th>
                                <td className="">
                                    <input
                                        type="text"
                                        id="commonRate"
                                        value={commonRate}
                                        placeholder="Rate"
                                        onChange={(e) => {
                                            setCommonRate(e.target.value);
                                            const updatedFloors = floors.map((floor) => ({
                                                ...floor,
                                                tiles: floor.tiles.map((tile) => ({
                                                    ...tile,
                                                    rate: e.target.value,
                                                })),
                                            }));
                                            setFloors(updatedFloors);
                                        }}
                                        className="mt-1 ml-2 text-sm w-20 text-center bg-transparent h-11 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg focus:outline-none"
                                    />
                                </td>
                                <td>
                                    <div className="flex items-center">
                                        <Select
                                            name="commonVendor"
                                            options={tileVendorOptions.map(option => ({ value: option, label: option }))}
                                            value={commonVendor ? { value: commonVendor, label: commonVendor } : null}
                                            onChange={(selectedOption) => {
                                                const selectedVendor = selectedOption ? selectedOption.value : '';
                                                setCommonVendor(selectedVendor);
                                                const updatedFloors = floors.map(floor => ({
                                                    ...floor,
                                                    tiles: floor.tiles.map(tile => ({
                                                        ...tile,
                                                        vendor: selectedVendor,
                                                    })),
                                                }));
                                                setFloors(updatedFloors);
                                            }}
                                            className="w-72 h-10 text-left"
                                            placeholder="Select Common Vendor"
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
                                    </div>
                                </td>
                            </tr>
                            <tr className="bg-[#FAF6ED]">
                                <th className="w-40 text-left pl-2" rowSpan="2">Description</th>
                                <th className="w-36 text-left pl-5" rowSpan="2">Type</th>
                                <th className="w-32 text-lg " colSpan="3" style={{ letterSpacing: '0.2em' }}>Measurement</th>
                                <th className="w-14 " rowSpan="2">Deduction Area (sqft)</th>
                                <th className="w-12 " rowSpan="2">Skirting Area (sqft)</th>
                                <th className="w-12 " rowSpan="2">Wastage (sqft)</th>
                                <th className="w-16 " rowSpan="2">Order Qty (sqft)</th>
                                <th className="w-60 text-left " rowSpan="2">Tile Name</th>
                                <th className="w-40 text-left" rowSpan="2">Size</th>
                                <th className="w-20 text-left" rowSpan="2">Qty/Box</th>
                                <th className="w-20 text-left" rowSpan="2">No.Box</th>
                                <th className="w-20 " rowSpan="2">Rate</th>
                                <th className="w-60 text-left " rowSpan="2">Vendor</th>
                            </tr>
                            <tr className="bg-[#FAF6ED]">
                                <th className="w-6 text-[#E4572E] ">L</th>
                                <th className="w-6 text-[#E4572E] ">B</th>
                                <th className="w-6 text-[#E4572E] ">H</th>
                            </tr>
                        </thead>
                        <tbody>
                            {floors.map((floor, floorIndex) => (
                                <React.Fragment key={floorIndex}>
                                    <tr className="bg-gray-50">
                                        <td colSpan="15" className="font-bold text-left pl-2 group">
                                            {floor.floorName !== null && (
                                                <div className="flex">
                                                    <span className="mt-1">{displayIndex++}.</span>
                                                    <span>{selectedClientData.floorName}</span>
                                                    <select
                                                        value={floor.floorName || ""}
                                                        onChange={(e) => {
                                                            const newValue = e.target.value;
                                                            if (newValue) {
                                                                const updatedFloors = [...floors];
                                                                updatedFloors[floorIndex].floorName = newValue;
                                                                setFloors(updatedFloors);
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
                                                    <div className="items-center flex space-x-4 invisible group-hover:visible">
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
                                                                const updatedFloors = [...floors];
                                                                updatedFloors[floorIndex].areaName = selectedOption ? selectedOption.value : '';
                                                                setFloors(updatedFloors);
                                                            }}
                                                            className="w-72 h-10 text-left ml-3"
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
                                                        <div key={floorIndex} className="items-center flex space-x-2 invisible group-hover:visible">
                                                            <button onClick={() => addAreaRow(floorIndex)}>
                                                                <img src={add} alt="add" className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => deleteAreaRow(floorIndex, tileIndex)} className="ml-2">
                                                                <img src={delt} alt="delete" className="w-4 h-4 " />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-1 w-80">
                                                    <div className="flex group">
                                                        <Select
                                                            name="type"
                                                            value={typeOptions.find((option) => option.value === tile.type) || null}
                                                            onChange={(selectedOption) => {
                                                                const syntheticEvent = {
                                                                    target: {
                                                                        name: "type",
                                                                        value: selectedOption ? selectedOption.value : "",
                                                                    },
                                                                };
                                                                handleTileChange(floorIndex, tileIndex, syntheticEvent);
                                                            }}
                                                            options={typeOptions}
                                                            placeholder="Select Type"
                                                            className="w-52"
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
                                                            classNamePrefix="react-select"
                                                            isSearchable
                                                            isClearable
                                                        />
                                                        <div className="flex items-center ml-3 space-x-2 invisible group-hover:visible">
                                                            <button type="button" onClick={() => addTile(floorIndex, tileIndex)}>
                                                                <img src={add} alt="add" className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => deleteTileRow(floorIndex, tileIndex)}>
                                                                <img src={delt} alt="delete" className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="relative px-1">
                                                    {hoveredTile.floorIndex === floorIndex && hoveredTile.tileIndex === tileIndex && (
                                                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow z-10 whitespace-nowrap">
                                                            {tile.lengthInput || 'No input'}
                                                        </div>
                                                    )}
                                                    <input
                                                        type="text"
                                                        name="length"
                                                        placeholder="L"
                                                        value={tile.length}
                                                        onChange={(e) => handleTileChange(floorIndex, tileIndex, e)}
                                                        onKeyUp={(e) => handleKeyDown(floorIndex, tileIndex, e)}
                                                        onMouseEnter={() => setHoveredTile({ floorIndex, tileIndex })}
                                                        onMouseLeave={() => setHoveredTile({ floorIndex: null, tileIndex: null })}
                                                        className="px-2 w-16 bg-transparent hover:border focus:outline-none text-center"
                                                    />
                                                </td>
                                                <td className="relative px-1">
                                                    {hoveredTileB.floorIndex === floorIndex && hoveredTileB.tileIndex === tileIndex && (
                                                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow z-10 whitespace-nowrap">
                                                            {tile.breadthInput || 'No input'}
                                                        </div>
                                                    )}
                                                    <input
                                                        type="text"
                                                        name="breadth"
                                                        placeholder="B"
                                                        value={
                                                            !tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula?.includes('B')
                                                                ? 0
                                                                : tile.breadth
                                                        }
                                                        onChange={(e) => handleTileChange(floorIndex, tileIndex, e)}
                                                        onKeyUp={(e) => handleKeyDown(floorIndex, tileIndex, e)}
                                                        onMouseEnter={() => setHoveredTileB({ floorIndex, tileIndex })}
                                                        onMouseLeave={() => setHoveredTileB({ floorIndex: null, tileIndex: null })}
                                                        disabled={
                                                            !tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula?.includes('B')
                                                        }
                                                        className="px-2 w-16 bg-transparent hover:border focus:outline-none text-center"
                                                    />
                                                </td>
                                                <td className="relative px-1">
                                                    {hoveredTileH.floorIndex === floorIndex && hoveredTileH.tileIndex === tileIndex && (
                                                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow z-10 whitespace-nowrap">
                                                            {tile.heightInput || 'No input'}
                                                        </div>
                                                    )}
                                                    <input
                                                        type="text"
                                                        name="height"
                                                        placeholder="H"
                                                        value={
                                                            !tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula?.includes('H')
                                                                ? 0
                                                                : tile.height
                                                        }
                                                        onChange={(e) => handleTileChange(floorIndex, tileIndex, e)}
                                                        onKeyUp={(e) => handleKeyDown(floorIndex, tileIndex, e)}
                                                        onMouseEnter={() => setHoveredTileH({ floorIndex, tileIndex })}
                                                        onMouseLeave={() => setHoveredTileH({ floorIndex: null, tileIndex: null })}
                                                        disabled={
                                                            !tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula?.includes('H')
                                                        }
                                                        className="px-2 w-16 bg-transparent hover:border focus:outline-none text-center"
                                                    />
                                                </td>
                                                <td className="px-2 mt-2 flex">
                                                    <input
                                                        type="text"
                                                        name="deductionArea"
                                                        value={tile.deductionArea || ""}
                                                        readOnly
                                                        placeholder="Dedu"
                                                        className="px-2 w-16 bg-transparent hover:border focus:outline-none"
                                                    />
                                                    <button className="text-[#E4572E]" onClick={() => openDeductionPopup(floorIndex, tileIndex)} >
                                                        D
                                                    </button>
                                                </td>
                                                {deductionPopupState[`${floorIndex}-${tileIndex}`] && (
                                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={() => closeDeductionPopup(floorIndex, tileIndex)}>
                                                        <div className="bg-white rounded-md w-[54rem] py-2 relative z-50" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex mb-3 mt-3">
                                                                <label className="text-[#0e0d0d] text-xl -ml-12 font-bold w-96">{floor.areaName} - Deduction</label>
                                                                <button className="text-[#E4572E] ml-[31rem] -mt-5" onClick={() => closeDeductionPopup(floorIndex, tileIndex)}>
                                                                    <img src={cross} alt="close" className="w-6 h-6" />
                                                                </button>
                                                            </div>
                                                            <div className="overflow-x-auto px-6">
                                                                <div className="max-h-[38rem] overflow-y-auto">
                                                                    <table className="min-w-full ">
                                                                        <tbody className="odd:bg-white even:bg-[#FAF6ED]">
                                                                            {[...Array(16)].map((_, index) => (
                                                                                <tr key={index} >
                                                                                    <td className="border-t border-b border-gray-400 py-2 text-center font-bold">
                                                                                        {index + 1}
                                                                                    </td>
                                                                                    <td className="border-t border-b border-gray-400 px-1 py-2">
                                                                                        <CreatableSelect
                                                                                            isClearable
                                                                                            className="w-36 border rounded-lg border-[#FAF6ED] border-r-[0.15rem] border-l-[0.15rem] border-b-[0.15rem] border-t-[0.15rem] text-left"
                                                                                            options={deductionType}
                                                                                            value={
                                                                                                deductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.type
                                                                                                    ? {
                                                                                                        value: deductionPopupData[`${floorIndex}-${tileIndex}`][index].type,
                                                                                                        label: deductionPopupData[`${floorIndex}-${tileIndex}`][index].type
                                                                                                    }
                                                                                                    : null
                                                                                            }
                                                                                            onChange={(selectedOption) => handleTypeChange(selectedOption, floorIndex, tileIndex, index)}
                                                                                            placeholder="Type"
                                                                                            menuPortalTarget={document.body}
                                                                                            styles={{
                                                                                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                menu: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                control: (base) => ({ ...base, backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }),
                                                                                            }}
                                                                                        />
                                                                                    </td>
                                                                                    <td className="border-t border-b border-gray-400 px-2 py-2">
                                                                                        <CreatableSelect
                                                                                            isClearable
                                                                                            className="border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] w-48 rounded-lg text-left"
                                                                                            options={deductionMeasurment}
                                                                                            value={
                                                                                                deductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.measurement
                                                                                                    ? {
                                                                                                        value: deductionPopupData[`${floorIndex}-${tileIndex}`][index].measurement,
                                                                                                        label: deductionPopupData[`${floorIndex}-${tileIndex}`][index].measurement
                                                                                                    }
                                                                                                    : null
                                                                                            }
                                                                                            onChange={(selectedOption) => handleMeasurementChange(selectedOption, floorIndex, tileIndex, index)}
                                                                                            placeholder="Measurement"
                                                                                            menuPortalTarget={document.body}
                                                                                            styles={customSelectStyles}
                                                                                        />
                                                                                    </td>
                                                                                    <td className="border-t border-b border-gray-400 px-2 py-2">
                                                                                        <input
                                                                                            type="text"
                                                                                            className="w-24 h-11 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-lg text-left px-2 py-1"
                                                                                            placeholder="Qty"
                                                                                            value={deductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.qty || ""}
                                                                                            onChange={(e) => handleQtyChange(e, floorIndex, tileIndex, index)}
                                                                                        />
                                                                                    </td>
                                                                                    <td className="border-t border-b border-gray-400 py-7">
                                                                                        <CreatableSelect
                                                                                            className="w-28 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-lg text-left"
                                                                                            options={deductionThickness}
                                                                                            value={
                                                                                                deductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.thickness
                                                                                                    ? { value: deductionPopupData[`${floorIndex}-${tileIndex}`][index].thickness, label: deductionPopupData[`${floorIndex}-${tileIndex}`][index].thickness }
                                                                                                    : null
                                                                                            }
                                                                                            onChange={(selectedOption) => handleThicknessChange(selectedOption, floorIndex, tileIndex, index)}
                                                                                            placeholder="Thickness"
                                                                                            menuPortalTarget={document.body}
                                                                                            styles={{
                                                                                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                menu: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                control: (base) => ({ ...base, backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }),
                                                                                            }}
                                                                                        />
                                                                                    </td>
                                                                                    <td className="border-t border-b border-gray-400 px-2 py-7">
                                                                                        <input
                                                                                            type="text"
                                                                                            className="w-44 h-11 border bg-gray-100 rounded-lg text-left px-2 py-1"
                                                                                            placeholder="Output"
                                                                                            value={deductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.output || ""}
                                                                                            readOnly
                                                                                        />
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                                <div className="bg-gray-200 border border-gray-300">
                                                                    <table className="min-w-full border-collapse border border-gray-300">
                                                                        <tbody>
                                                                            <tr className="bg-gray-200">
                                                                                <td className="px-4 py-2 text-center font-bold"></td>
                                                                                <td className="px-4 py-2 text-center font-bold"></td>
                                                                                <td className="px-4 py-2 text-center font-bold"></td>
                                                                                <td className="px-4 py-2 text-center font-bold"></td>
                                                                                <td className="px-4 py-2 text-center font-bold"></td>
                                                                                <td className="px-4 py-2 text-center font-bold"></td>
                                                                                <td className="px-4 py-2 text-right font-bold">
                                                                                    Total:
                                                                                </td>
                                                                                <td className="px-4 py-2 text-right font-bold">
                                                                                    {getTotalThickness(floorIndex, tileIndex).total}
                                                                                </td>
                                                                                <td className="px-4 py-2">
                                                                                    {deductionPopupData[`${floorIndex}-${tileIndex}`]?.reduce((total, row) => {
                                                                                        const outputValue = parseFloat(row.output) || 0;
                                                                                        return total + outputValue;
                                                                                    }, 0).toFixed(2)}
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                <td className="px-2 w-28">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="text"
                                                            name="directValue"
                                                            value={
                                                                tile.isUserChanged
                                                                    ? tile.directValue
                                                                    : tile.type === "Floor Tile"
                                                                        ? calculateSkirtingArea(tile, floor.areaName).toFixed(2)
                                                                        : "0"
                                                            }
                                                            onChange={(e) => handleDirectValueChange(floorIndex, tileIndex, e)}
                                                            className="px-2 rounded-lg w-16 bg-transparent"
                                                        />
                                                        {tile.isUserChanged && (
                                                            <button onClick={() => resetToCalculatedValue(floorIndex, tileIndex)} className="ml-2" >
                                                                <img src={refresh} alt="refresh" className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-2 ">
                                                    <select
                                                        name="wastagePercentage"
                                                        value={tile.wastagePercentage}
                                                        onChange={(e) => handleTileChange(floorIndex, tileIndex, e)}
                                                        className=" rounded-lg w-16 bg-transparent focus:outline-none">
                                                        {Array.from({ length: 16 }, (_, index) => (
                                                            <option key={index} value={index}>
                                                                {index}%
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-2 w-20">
                                                    <div className="w-16">
                                                        {tile.length && (tile.breadth || tile.height) ? (
                                                            (() => {
                                                                const length = parseFeetInches(tile.length);
                                                                const breadth = parseFeetInches(tile.breadth);
                                                                const height = parseFeetInches(tile.height);
                                                                const wastagePercentage = Number(tile.wastagePercentage || 0);
                                                                const deductionArea = Number(tile.deductionArea || 0);
                                                                let tileArea = 0;
                                                                if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x B') {
                                                                    tileArea = length * breadth;
                                                                } else if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x H') {
                                                                    tileArea = length * height;
                                                                }
                                                                const skirtingArea = tile.isUserChanged
                                                                    ? Number(tile.skirtingArea || 0)
                                                                    : calculateSkirtingArea(tile, floor.areaName);
                                                                const finalArea = tileArea - deductionArea;
                                                                const actualQuantity = finalArea + skirtingArea;
                                                                const wastage = (wastagePercentage / 100) * actualQuantity;
                                                                const totalOrderedTile = actualQuantity + wastage;
                                                                return totalOrderedTile > 0 ? totalOrderedTile.toFixed(2) : "0";
                                                            })()
                                                        ) : (
                                                            "0"
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-2 text-left w-80">
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
                                                                    target: { name: "size", value: '' }
                                                                });
                                                                handleTileChange(floorIndex, tileIndex, {
                                                                    target: { name: "qtyPerBox", value: '' }
                                                                });
                                                                handleTileChange(floorIndex, tileIndex, {
                                                                    target: { name: "Areainsqft", value: '' }
                                                                });
                                                            } else {
                                                                const selectedTile = tileOptions.find(tile => tile.value === newTileName);
                                                                if (selectedTile) {
                                                                    handleTileChange(floorIndex, tileIndex, {
                                                                        target: {
                                                                            name: "size",
                                                                            value: selectedTile.tileSize
                                                                        }
                                                                    });
                                                                    handleTileChange(floorIndex, tileIndex, {
                                                                        target: {
                                                                            name: "qtyPerBox",
                                                                            value: selectedTile.qtyPerBox || ''
                                                                        }
                                                                    });
                                                                    handleTileChange(floorIndex, tileIndex, {
                                                                        target: {
                                                                            name: "Areainsqft",
                                                                            value: selectedTile.Areainsqft || ''
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        }}
                                                        placeholder="Select Tile"
                                                        menuPortalTarget={document.body}
                                                        className="w-80"
                                                        menuPosition="fixed"
                                                        styles={{
                                                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                            control: (base) => ({
                                                                ...base,
                                                                backgroundColor: 'transparent',
                                                                border: 'none',
                                                                boxShadow: 'none',
                                                                textAlign: 'left',
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
                                                                textAlign: 'left',
                                                            }),
                                                            singleValue: (base) => ({
                                                                ...base,
                                                                color: '#000',
                                                                textAlign: 'left',
                                                            }),
                                                            menu: (base) => ({
                                                                ...base,
                                                                textAlign: 'left',
                                                            }),
                                                        }}
                                                        isClearable
                                                    />
                                                </td>
                                                <td className="w-52">
                                                    <div className="flex items-center">
                                                        <Select
                                                            value={sizeOptions.find((option) => option.value === tile.size) || null}
                                                            onChange={(selectedOption) => {
                                                                const newSize = selectedOption ? selectedOption.value : "";
                                                                handleSizeChange(floorIndex, tileIndex, newSize);
                                                            }}
                                                            options={sizeOptions}
                                                            placeholder="Select Size"
                                                            className="w-44"
                                                            classNamePrefix="react-select"
                                                            isClearable
                                                            isSearchable
                                                            styles={{
                                                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                                control: (base) => ({
                                                                    ...base,
                                                                    backgroundColor: 'transparent',
                                                                    border: 'none',
                                                                    boxShadow: 'none',
                                                                    textAlign: 'left',
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
                                                                    textAlign: 'left',
                                                                }),
                                                                singleValue: (base) => ({
                                                                    ...base,
                                                                    color: '#000',
                                                                    textAlign: 'left',
                                                                }),
                                                                menu: (base) => ({
                                                                    ...base,
                                                                    textAlign: 'left',
                                                                }),
                                                            }}
                                                        />
                                                        {tile.size !== tile.tileSize &&
                                                            (<span className="ml-2 text-red-500">
                                                                <img src={change} alt="Change indicator" className="w-5 h-5 mt-1" />
                                                            </span>)
                                                        }
                                                    </div>
                                                </td>
                                                <td className="w-32">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="text"
                                                            value={tile.quantityBox}
                                                            onChange={(e) => {
                                                                handleTileChange(floorIndex, tileIndex, {
                                                                    target: { name: "quantityBox", value: e.target.value },
                                                                });
                                                            }}
                                                            className="rounded px-1 w-12 bg-transparent"
                                                        />
                                                        {Number(tile.quantityBox) !== Number(tile.correctQuantityBox) && (
                                                            <span className="ml-2 text-red-500">
                                                                <img src={change} alt="change indicator" className="w-5 h-5 mt-1" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="w-16">
                                                    <div>
                                                        {tile.length && (tile.breadth || tile.height) ? (
                                                            (() => {
                                                                const length = parseFeetInches(tile.length);
                                                                const breadth = parseFeetInches(tile.breadth);
                                                                const height = parseFeetInches(tile.height);
                                                                const wastagePercentage = Number(tile.wastagePercentage || 0);
                                                                const deductionArea = Number(tile.deductionArea || 0);
                                                                let tileArea = 0;
                                                                if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x B') {
                                                                    tileArea = length * breadth;
                                                                } else if (tileFloorTypes.find(floorType => floorType.floorType === tile.type)?.formula === 'L x H') {
                                                                    tileArea = length * height;
                                                                }
                                                                const skirtingArea = tile.isUserChanged
                                                                    ? Number(tile.skirtingArea || 0)
                                                                    : calculateSkirtingArea(tile, floor.areaName);
                                                                const skirtingAreaValue = Number(skirtingArea || 0);
                                                                const finalArea = tileArea - deductionArea;
                                                                const actualQuantity = finalArea + skirtingAreaValue;
                                                                const wastage = (wastagePercentage / 100) * actualQuantity;
                                                                const totalOrderedTile = actualQuantity + wastage;
                                                                const qtyPerBox = Number(tile.quantityBox || 1);
                                                                const Areainsqft = Number(tile.areaTile || 1);
                                                                const finalResult = totalOrderedTile / (qtyPerBox * Areainsqft);
                                                                return finalResult.toFixed(2);
                                                            })()
                                                        ) : (
                                                            "0"
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="">
                                                    <input
                                                        type="text"
                                                        name="rate"
                                                        placeholder="Rate"
                                                        value={tile.rate || ""}
                                                        onChange={(e) => handleRateChange(e, floorIndex, tileIndex)}
                                                        className="px-2 w-14 bg-transparent hover:border focus:outline-none text-center"
                                                    />
                                                </td>
                                                <td>
                                                    <Select
                                                        name="vendor"
                                                        options={tileVendorOptions.map(option => ({ value: option, label: option }))}
                                                        value={tile.vendor ? { value: tile.vendor, label: tile.vendor } : ""}
                                                        onChange={(selectedOption) => {
                                                            const updatedFloors = [...floors];
                                                            updatedFloors[floorIndex].tiles[tileIndex].vendor = selectedOption ? selectedOption.value : '';
                                                            setFloors(updatedFloors);
                                                        }}
                                                        className="w-72 h-10 text-left ml-3"
                                                        placeholder="Select Vendor"
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
                    <button type="button" className="text-[#E4572E] mt-6 mb-20 -ml-[70%] lg:-ml-[94%] border-dashed border-b-2 border-[#BF9853] font-semibold"
                        onClick={addFloorRow}>
                        + Add Floor
                    </button>
                </div>
                <div className=" buttons -mt-14 flex">
                    <div className="">
                        <button onClick={handleTileCCButtonClick} className=" text-white whitespace-nowrap px-8 py-2 rounded bg-[#007233] hover:text-white transition duration-200 ease-in-out">
                            Customer Copy
                        </button>
                    </div>
                    <div>
                        <button onClick={handleTileOCButtonClick} className=" text-white whitespace-nowrap px-8 py-2 rounded ml-2 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out">
                            Order Copy
                        </button>
                    </div>
                    <div className="">
                        <button onClick={fullPDF} className=" text-white whitespace-nowrap px-8 py-2 rounded ml-2 bg-[#007233] hover:text-white transition duration-200 ease-in-out">
                            Engineer Copy
                        </button>
                    </div>
                    <div className="">
                        <button onClick={handleGeneratePDF} className=" text-white whitespace-nowrap px-8 py-2 rounded ml-2 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out">
                            Stocking Chart
                        </button>
                    </div>
                    <div>
                        <button className="bg-[#E4572E] whitespace-nowrap text-white lg:px-4 px-1 py-1 rounded lg:w-52 h-10 ml-4 " onClick={handleTileBillClick}>
                            Generate Tile Bill
                        </button>
                    </div>
                    <div>
                        {isPopupOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                <div className="bg-white p-3 rounded-lg shadow-lg text-center">
                                    <div>
                                        <img src={loadingScreen} alt="Loading..." className="w-10 h-10 mx-auto" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {isModalOpen && <PopupModal />}
                        <form onSubmit={handleSubmit}>
                            <button type="submit" disabled={isSubmitting} className="bg-[#BF9853] text-white px-6 py-2 rounded-lg ml-[47rem]">
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
                <div className="-mt-3 flex">
                    <div>
                        <div>
                            <h1 className="font-bold text-2xl mt-8 md:-ml-[76%] lg:-ml-[67%] -ml-[50%] ">Tile Order Copy </h1>
                        </div>
                        <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                            <table className="table-auto mt-2 w-[50rem] ">
                                <thead>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="font-extrabold p-2">S.No</th>
                                        <th className="p-2 font-extrabold text-left">Tile Name</th>
                                        <th className="p-2 font-extrabold text-left">Tile Size</th>
                                        <th className="p-2 w-40 font-extrabold">Total Area (sqft)</th>
                                        <th className="p-2 w-36 font-extrabold">No.Box</th>
                                        <th className="p-2 w-20 font-extrabold text-left">Image</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summaryMergedByTile.map((row, index) => {
                                        const totalOrderedQuantity = Number(row.totalOrderedQuantity) || 0;
                                        const totalBoxes = Number(row.totalBoxes) || 0;
                                        return (
                                            <tr key={index} className="odd:bg-white even:bg-[#FAF6ED]">
                                                <td className="p-2 text-center">{(index + 1).toString().padStart(1, '0')}</td>
                                                <td className="p-2 w-auto text-left">{row.tileName}</td>
                                                <td className="p-2 w-auto text-left">{row.tileSize}</td>
                                                <td className="p-2 w-20">{totalOrderedQuantity.toFixed(2)}</td>
                                                <td className="p-2 w-20">{totalBoxes.toFixed(2)}</td>
                                                <td>
                                                    {row.image ? (
                                                        <img src={`data:image/png;base64,${row.image}`} alt={""} className="w-11 h-11 ml-2" />
                                                    ) : (
                                                        <span></span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="bg-white font-bold border border-r-[#BF9853] border-t-[#BF9853] border-b-[#BF9853]">
                                        <td className="p-2 font-bold" colSpan="3">Total</td>
                                        <td className="p-2 font-bold border border-[#BF9853]">{(Number(totalArea) || 0).toFixed(2)}</td>
                                        <td className="p-2 font-bold border-t border-b border-t-[#BF9853] border-b-[#BF9853] border-l-none">{(Number(totalBoxes) || 0).toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className=" ml-10">
                        <div >
                            <h1 className="font-bold text-2xl mt-8 md:-ml-[72%] lg:-ml-[60%] -ml-[50%]">Tile Stocking Chart </h1>
                        </div>
                        <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                            <table id="summaryTable" className="table-auto mt-2 w-[46rem] ">
                                <thead>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="font-extrabold p-2">S.No</th>
                                        <th className="p-2 font-extrabold">Floor Name</th>
                                        <th className="p-2 font-extrabold text-left">Tile Name</th>
                                        <th className="p-2 font-extrabold text-left">Tile Size</th>
                                        <th className="p-2 font-extrabold">Total Area (sqft)</th>
                                        <th className="p-2 font-extrabold">No.Box</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary2.map((item, index) => (
                                        <tr key={index} className="odd:bg-white even:bg-[#FAF6ED]">
                                            <td className="p-2 text-left ">{(index + 1).toString().padStart(1, '0')}</td>
                                            <td className="p-2 text-left ">{item.floorName}</td>
                                            <td className="p-2 text-left ">{item.tileName}</td>
                                            <td className="p-2 text-left ">{item.tileSize}</td>
                                            <td className="p-2 ">{parseFloat(item.totalOrderedQuantity || 0).toFixed(2)}</td>
                                            <td className="p-2 ">{parseFloat(item.totalBoxes || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-white font-bold border border-r-[#BF9853] border-t-[#BF9853] border-b-[#BF9853]">
                                        <td className="p-2 font-bold" colSpan="4">Total</td>
                                        <td className="p-2 font-bold border border-[#BF9853]">{totalArea.toFixed(2)}</td>
                                        <td className="p-2 font-bold border border-[#BF9853]">{totalBoxes.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {isClientName && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div
                            className="bg-white rounded-md w-[9rem] h-[4rem] p-2 relative"
                            ref={inputRef}>
                            <input
                                type="text"
                                name="extraClient"
                                className="w-32 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] p-2 rounded h-12 focus:outline-none"
                                value={extraClient}
                                onChange={(e) => setExtraClient(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setIsClientName(false);
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
            {isTileBillOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold mb-4">Select an Option</h2>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="floorRateSelect"
                                    value="With Rate"
                                    checked={floorRateSelect === 'With Rate'}
                                    onChange={(e) => {
                                        setFloorRateSelect(e.target.value);
                                        setRateByType({});
                                        setSkirtingAreaRate(null);
                                    }}
                                />
                                <span>With Rate</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="floorRateSelect"
                                    value="Without Rate"
                                    checked={floorRateSelect === 'Without Rate'}
                                    onChange={(e) => {
                                        setFloorRateSelect(e.target.value);
                                        setSkirtingAreaRate(null);
                                    }}
                                />
                                <span>Without Rate</span>
                            </label>
                        </div>
                        {floorRateSelect === 'With Rate' && (
                            <div className="mt-4 space-y-4 max-h-64 overflow-y-auto pr-1">
                                {[...new Set(floors.flatMap(floor => floor.tiles.map(tile => tile.type)))]
                                    .filter(type => type)
                                    .map((type, index) => (
                                        <div key={index}>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Enter {type} Rate:
                                            </label>
                                            <input
                                                type="text"
                                                value={rateByType[type] || ''}
                                                onChange={(e) =>
                                                    setRateByType(prev => ({ ...prev, [type]: e.target.value }))
                                                }
                                                className="mt-1 p-2 border rounded w-full"
                                                placeholder={`Enter ${type} rate here`}
                                            />
                                        </div>
                                    ))
                                }
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Enter Skirting Area Rate:
                                    </label>
                                    <input
                                        type="text"
                                        value={skirtingAreaRate || ''}
                                        onChange={(e) => setSkirtingAreaRate(e.target.value)}
                                        className="mt-1 p-2 border rounded w-full"
                                        placeholder="Enter Skirting Area rate here"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="mt-4 flex justify-end space-x-2">
                            <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={handleCloseTileBill}>
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-[#007233] text-white rounded hover:bg-[#005522]" onClick={handleConfirmTileBill} >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isModalTileOpenOC && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">Select an Option</h2>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="ocTileSelection"
                                    value="With Image"
                                    className="custom-checkbox appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] "
                                    checked={ocTileSelection === 'With Image'}
                                    onChange={(e) => setOCTileSelection(e.target.value)}
                                />
                                <span>With Image</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="ocTileSelection"
                                    value="Without Image"
                                    className="custom-checkbox appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638]"
                                    checked={ocTileSelection === 'Without Image'}
                                    onChange={(e) => setOCTileSelection(e.target.value)}
                                />
                                <span>Without Image</span>
                            </label>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={handleCloseModalTileOC}>
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-[#007233] text-white rounded hover:bg-[#005522]" onClick={handleConfirmTileOC} disabled={!ocTileSelection}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isCustomerCopyPdfSelect && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">Select an Option</h2>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="customerCopyPDFSelect"
                                    value="Requirement Copy"
                                    className="custom-checkbox appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638]"
                                    checked={customerCopyPDFSelect === 'Requirement Copy'}
                                    onChange={(e) => setCustomerCopyPDFSelect(e.target.value)}
                                />
                                <span>Requirement Copy</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="customerCopyPDFSelect"
                                    value="Confirmation Copy"
                                    className="custom-checkbox appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638]"
                                    checked={customerCopyPDFSelect === 'Confirmation Copy'}
                                    onChange={(e) => setCustomerCopyPDFSelect(e.target.value)}
                                />
                                <span>Confirmation Copy</span>
                            </label>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={handleCloseModalTileCC}>
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-[#007233] text-white rounded hover:bg-[#005522]" onClick={handleConfirmTileCC} disabled={!customerCopyPDFSelect}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isFloorSelectOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">Select Floor</h2>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {(() => {
                                let lastValidFloorName = "";
                                const uniqueFloorNames = new Set();
                                floors.forEach((floor) => {
                                    let floorName = floor.floorName?.trim() || "";
                                    if (floorName === "") {
                                        floorName = lastValidFloorName;
                                    } else {
                                        lastValidFloorName = floorName;
                                    }
                                    if (floorName && !uniqueFloorNames.has(floorName)) {
                                        uniqueFloorNames.add(floorName);
                                    }
                                });
                                return Array.from(uniqueFloorNames).map((floorName, index) => (
                                    <label key={index} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="floorSelect"
                                            className="custom-checkbox appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638]"
                                            value={floorName}
                                            checked={selectedFloorName.includes(floorName)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedFloorName((prev) => [...prev, floorName]);
                                                } else {
                                                    setSelectedFloorName((prev) =>
                                                        prev.filter((name) => name !== floorName)
                                                    );
                                                }
                                            }}
                                        />
                                        <span>{floorName}</span>
                                    </label>
                                ));
                            })()}
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={() => setIsFloorSelectOpen(false)} >
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-[#007233] text-white rounded hover:bg-[#005522]" onClick={handleConfirmFloorSelection} disabled={selectedFloorName.length === 0}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isVendorSelectOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">Select Vendors</h2>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {availableVendors.length > 0 ? (
                                availableVendors.map((vendor, index) => (
                                    <label key={index} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox appearance-none w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638]"
                                            name="vendorSelect"
                                            value={vendor}
                                            checked={selectedVendors.includes(vendor)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedVendors((prev) => [...prev, vendor]);
                                                } else {
                                                    setSelectedVendors((prev) =>
                                                        prev.filter((v) => v !== vendor)
                                                    );
                                                }
                                            }}
                                        />
                                        <span>{vendor}</span>
                                    </label>
                                ))
                            ) : (
                                <p>No vendors found for selected floors.</p>
                            )}
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={() => setIsVendorSelectOpen(false)}>
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-[#007233] text-white rounded hover:bg-[#005522]" onClick={handleConfirmVendorSelection}>
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