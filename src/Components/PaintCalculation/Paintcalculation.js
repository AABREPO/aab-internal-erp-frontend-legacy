import React, { useState, useEffect, useCallback, useRef } from "react";
import Select from "react-select";
import deleteIcon from '../Images/Worng.svg';
import deletes from '../Images/Delete.svg';
import add from '../Images/Right.svg';
import cross from '../Images/cross.png';
import jsPDF from 'jspdf';
import "jspdf-autotable";
import { evaluate } from 'mathjs';
import CreatableSelect from 'react-select/creatable';
import loadingScreen from '../Images/AAlogoBlackSVG.svg';

const DesignTool = () => {
    const [interiorFloors, setInteriorFloors] = useState([
        {
            floorName: "Ground Floor",
            areaName: "",
            tiles: [
                {
                    length: "", lengthInput: "", breadth: "", breadthInput: "", height: "", heightInput: "", deductionThickness: "", deductionThicknessInputs: "", deductionArea: "", deductionInput: "", wallDeductionInputs: "", ceilingDeductionInputs: "", bothDeducitonInputs: "", wallDeductionArea: "", ceilingDeductionArea: "", bothDeductionArea: "",
                    deduction1: "", deduction2: "", deduction3: "", deduction4: "", deduction5: "", deduction6: "", deduction7: "", deduction8: "", deduction9: "", deduction10: "",
                    deduction11: "", deduction12: "", deduction13: "", deduction14: "", deduction15: "", deduction16: "", paintVariant: "", colorCode: "", orderQty: "",
                    wastagePercentage: "0", putty: "No", primer: "No", ceilingCoat: "No", WallCoat: "No", waterproof: "No",
                },
            ],
        },
    ]);
    const [exteriorFloors, setExteriorFloors] = useState([
        {
            floorName: "Ground Floor",
            areaName: "",
            tiles: [
                {
                    length: "", length1: "", length2: "", length3: "", length4: "", length5: "", length6: "", length7: "", length8: "", length9: "", length10: "", length11: "",
                    length12: "", length13: "", length14: "", length15: "", length16: "", length17: "", length18: "", length19: "", length20: "", length21: "", length22: "", length23: "", length24: "",
                    length25: "", length26: "", length27: "", length28: "", length29: "", length30: "", breadth: "", height: "", wallDeductionArea: "", ceilingDeductionArea: "", bothDeductionArea: "",
                    deductionThickness: "", deductionThicknessInputs: "", deductionArea: "", deductionInput: "", wallDeductionInputs: "", ceilingDeductionInputs: "", bothDeducitonInputs: "",
                    deduction1: "", deduction2: "", deduction3: "", deduction4: "", deduction5: "", deduction6: "", deduction7: "", deduction8: "", deduction9: "", deduction10: "", deduction11: "",
                    deduction12: "", deduction13: "", deduction14: "", deduction15: "", deduction16: "", WallCoat: "No", waterproof: "No", paintVariant: "", colorCode: "", orderQty: "",
                    wastagePercentage: "0", putty: "No", primer: "No", ceilingCoat: "No",
                },
            ],
        },
    ]);
    const [tableData, setTableData] = useState([
        { floorName: "", totalOrderedTile: 0, paintVariant: "", paintColor: "", wastagePercentage: 0, orderQty: 0 },
    ]);
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
        { value: "3 x 7", label: "3 x 7" },
        { value: "3.5 x 7", label: "3.5 x 7" },
        { value: "4 x 7", label: "4 x 7" },
        { value: "4.5 x 7", label: "4.5 x 7" },
        { value: "5 x 7", label: "5 x 7" },
        { value: "5.5 x 7", label: "5.5 x 7" },
        { value: "2.5 x 7", label: "2.5 x 7" },
        { value: "3.25 x 7", label: "3.25 x 7" },
        { value: "4 x 4", label: "4 x 4" },
        { value: "4.5 x 4", label: "4.5 x 4" },
        { value: "3.5 x 4", label: "3.5 x 4" },
        { value: "3 x 4", label: "3 x 4" },
        { value: "3 x 3", label: "3 x 3" },
        { value: "2 x 4", label: "2 x 4" },
        { value: "6 x 4", label: "6 x 4" },
        { value: "5 x 4", label: "5 x 4" },
        { value: "2 x 2", label: "2 x 2" },
        { value: "3 x 2", label: "3 x 2" },
        { value: "1.5 x 1.5", label: "1.5 x 1.5" },
    ];
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
    const [hoveredTile, setHoveredTile] = useState({ floorIndex: null, tileIndex: null });
    const [hoveredTileB, setHoveredTileB] = useState({ floorIndex: null, tileIndex: null });
    const [hoveredTileH, setHoveredTileH] = useState({ floorIndex: null, tileIndex: null });
    const [hoveredExteriorTileH, setHoveredExteriorTileH] = useState({ floorIndex: null, tileIndex: null });
    const [commonPaintName, setCommonPaintName] = useState("");
    const [commonPaintColors, setCommonPaintColors] = useState("");
    const [ceilingCommonWastage, setCeilingCommonWastage] = useState("");
    const [deductionPopupState, setDeductionPopupState] = useState({});
    const [deductionPopupData, setDeductionPopupData] = useState({});
    const [exteriorDeductionPopupState, setExteriorDeductionPopupState] = useState({});
    const [exteriorDeductionPopupData, setExteriorDeductionPopupData] = useState({});
    const [commonPaint, setCommonPaint] = useState("");
    const [commonExteriorPaint, setCommonExteriorPaint] = useState("");
    const [commonPaintColor, setCommonPaintColor] = useState("");
    const [commonExteriorPaintColor, setCommonExteriorPaintColor] = useState("");
    const [interiorTableDimensions, setInteriorTableDimensions] = useState({ length: 0, breadth: 0 });
    const [selectedPaintNames, setSelectedPaintNames] = useState([]);
    const [selectedPaintColors, setSelectedPaintColors] = useState([]);
    const [wastageValues, setWastageValues] = useState([]);
    const [selectedModule, setSelectedModule] = useState("");
    const [summaryDatas, setSummaryData] = useState([]);
    const [summaryDatass, setSummaryDatas] = useState([]);
    const [paintData, setPaintData] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isCeilingCoatPopup, setIsCeilingCoatPopup] = useState(false);
    const [deductionInputs, setDeductionInputs] = useState({});
    const [deductionRowWiseInputs, setDeductionRowWiseInputs] = useState({});
    const [exteriorDeductionInputs, setExteriorDeductionInputs] = useState({});
    const [exteriorDeductionRowWiseInputs, setExteriorDeductionRowWiseInputs] = useState({});
    const [isImportPopup, setIsImportPopup] = useState(false);
    const closeImportPopup = () => setIsImportPopup(false);
    const openImportPopup = () => setIsImportPopup(true);
    const closeCeilingCoatPopup = () => setIsCeilingCoatPopup(false);
    const openCeilingCoatPopup = () => setIsCeilingCoatPopup(true);
    const openDeductionPopup = (floorIndex, tileIndex) => {
        const deductions = [
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction1,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction2,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction3,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction4,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction5,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction6,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction7,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction8,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction9,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction10,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction11,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction12,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction13,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction14,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction15,
            interiorFloors[floorIndex]?.tiles[tileIndex]?.deduction16,
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
            [`${floorIndex}-${tileIndex}`]: processedDeductions,
        } : {};
        setDeductionPopupState((prevState) => ({
            ...prevState,
            [`${floorIndex}-${tileIndex}`]: true,
        }));
        setDeductionPopupData((prevData) => ({
            ...prevData,
            ...formattedData,
        }));
    };
    const openExteriorDeductionPopup = (floorIndex, tileIndex) => {
        const deductions = [
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction1,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction2,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction3,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction4,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction5,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction6,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction7,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction8,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction9,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction10,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction11,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction12,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction13,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction14,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction15,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.deduction16,
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
            [`${floorIndex}-${tileIndex}`]: processedDeductions,
        } : {};
        setExteriorDeductionPopupState((prevState) => ({
            ...prevState,
            [`${floorIndex}-${tileIndex}`]: true,
        }));
        setExteriorDeductionPopupData((prevData) => ({
            ...prevData,
            ...formattedData,
        }));
    };
    const closeDeductionPopup = (floorIndex, tileIndex) => {
        setDeductionPopupState((prevState) => ({
            ...prevState,
            [`${floorIndex}-${tileIndex}`]: false,
        }));
    };
    const closeExteriorDeductionPopup = (floorIndex, tileIndex) => {
        setExteriorDeductionPopupState((prevState) => ({
            ...prevState,
            [`${floorIndex}-${tileIndex}`]: false,
        }));
    };
    const handlePopupDataChange = (floorIndex, tileIndex, updatedData) => {
        setDeductionPopupData((prevData) => ({
            ...prevData,
            [`${floorIndex}-${tileIndex}`]: updatedData,
        }));
    };
    const handleExteriorPopupDataChange = (floorIndex, tileIndex, updatedData) => {
        setExteriorDeductionPopupData((prevData) => ({
            ...prevData,
            [`${floorIndex}-${tileIndex}`]: updatedData,
        }));
    };
    const [paints, setPaints] = useState([]);
    const [paintVariants, setPaintVariants] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullData, setFullData] = useState([]);
    const [fullDatas, setFullDatas] = useState([]);
    const [filteredFileOptions, setFilteredFileOptions] = useState([]);
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
    const [paintClientName, setPaintClientName] = useState(null);
    const [paintClientSNo, setPaintClientSNo] = useState("");
    const [selectedClientData, setSelectedClientData] = useState({});
    const [calculationData, setCalculationData] = useState(null);
    const currentDate = new Date().toLocaleDateString();
    const [paintSelectedFile, setPaintSelectedFile] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [fileOptions, setFileOptions] = useState([]);
    const [fileOption, setFileOption] = useState([]);
    const [commonHeight, setCommonHeight] = useState("");
    const [commonPutty, setCommonPutty] = useState("");
    const [commonPrimer, setCommonPrimer] = useState("");
    const [commonWallCoat, setCommonWallCoat] = useState("No");
    const [commonCeilingCoat, setCommonCeilingCoat] = useState("No");
    const [commonWaterProof, setCommonWaterProof] = useState("No");
    const [commonWastagePercentage, setCommonWastagePercentage] = useState(0);
    const [commonExteriorHeight, setCommonExteriorHeight] = useState("");
    const [commonExteriorPutty, setCommonExteriorPutty] = useState("");
    const [commonExteriorPrimer, setCommonExteriorPrimer] = useState("");
    const [commonExteriorWallCoat, setCommonExteriorWallCoat] = useState("No");
    const [commonExteriorCeilingCoat, setCommonExteriorCeilingCoat] = useState("No");
    const [commonExteriorWaterProof, setCommonExteriorWaterProof] = useState("No");
    const [commonExteriorWastagePercentage, setCommonExteriorWastagePercentage] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selection, setSelection] = useState('');
    const [isModalOpenOC, setIsModalOpenOC] = useState(false);
    const [ocSelection, setOCSelection] = useState('');
    const [isModalOpenSC, setIsModalOpenSC] = useState(false);
    const [scSelection, setSCSelection] = useState('');
    const [isModalOpenEC, setIsModalOpenEC] = useState(false);
    const [isPuttyBillOpen, setIsPuttyBillOpen] = useState(false);
    const [isExteriorPuttyBillOpen, setIsExteriorPuttyBillOpen] = useState(false);
    const [isPaintBillOpen, setIsPaintBillOpen] = useState(false);
    const [isExteriorPaintBillOpen, setIsExteriorPaintBillOpen] = useState(false);
    const [ecSelection, setECSelection] = useState('');
    const [puttyRate, setPuttyRate] = useState('');
    const [exteriorPuttyRate, setExteriorPuttyRate] = useState('');
    const [primerRate, setPrimerRate] = useState('');
    const [exteriorPrimerRate, setExteriorPrimerRate] = useState('');
    const [wallCoatRate, setWallCoatRate] = useState('');
    const [exteriorWallCoatRate, setExteriorWallCoatRate] = useState('');
    const [ceilingCoatRate, setCeilingCoatRate] = useState('');
    const [exteriorCeilingCoatRate, setExteriorCeilingCoatRate] = useState('');
    const [puttyRateSelect, setPuttyRateSelect] = useState('');
    const [exteriorPuttyRateSelect, setExteriorPuttyRateSelect] = useState('');
    const [primerRateSelect, setPrimerRateSelect] = useState('');
    const [exteriorPrimerRateSelect, setExteriorPrimerRateSelect] = useState('');
    const [ceilingCoatData, setCeilingCoatData] = useState([]);
    const [paintTypeOptions, setPaintTypeOptions] = useState([]);
    const [paintItems, setPaintItems] = useState([]);
    const [message, setMessage] = useState('');
    const [otherTable, setOtherTable] = useState([]);
    console.log(message);
    const [tilesData, setTilesData] = useState([
        {
            paintItem: '',
            height: '',
            deduction: '',
            wastage: 0,
            calculatedFloorAreas: [{ floorName: '', totalArea: 0, totalOrderQtys: 0 }],
            calculatedAreas: 0,
            selectedPaint: '',
            selectedPaintColor: '',
            calculatedOrderQtys: 0,
        },
    ]);
    useEffect(() => {
        const savedClientName = sessionStorage.getItem('paintClientName');
        const savedClientSNo = sessionStorage.getItem('paintClientSNo');
        const savedInteriorFloors = sessionStorage.getItem('interiorFloors');
        const savedExteriorFloors = sessionStorage.getItem('exteriorFloors');
        const savedOthersFloors = sessionStorage.getItem('tilesData');
        const savedFilteredFileOptions = sessionStorage.getItem('filteredFileOptions');
        const savedSelectedFile = sessionStorage.getItem('paintSelectedFile');
        try {
            if (savedClientName) setPaintClientName(JSON.parse(savedClientName));
            if (savedClientSNo) setPaintClientSNo(savedClientSNo);
            if (savedInteriorFloors) setInteriorFloors(JSON.parse(savedInteriorFloors));
            if (savedExteriorFloors) setExteriorFloors(JSON.parse(savedExteriorFloors));
            if (savedOthersFloors) setTilesData(JSON.parse(savedOthersFloors));
            if (savedFilteredFileOptions) setFilteredFileOptions(JSON.parse(savedFilteredFileOptions));
            if (savedSelectedFile) setPaintSelectedFile(JSON.parse(savedSelectedFile));
        } catch (error) {
            console.error("Error parsing sessionStorage data:", error);
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const handleBeforeUnload = () => {
        sessionStorage.removeItem('paintClientName');
        sessionStorage.removeItem('paintClientSNo');
        sessionStorage.removeItem('filteredFileOptions');
        sessionStorage.removeItem('interiorFloors');
        sessionStorage.removeItem('exteriorFloors')
        sessionStorage.removeItem('tilesData');
        sessionStorage.removeItem('rows');
        sessionStorage.removeItem('paintSelectedFile');
    };
    useEffect(() => {
        if (paintClientName) sessionStorage.setItem('paintClientName', JSON.stringify(paintClientName));
        if (paintClientSNo) sessionStorage.setItem('paintClientSNo', paintClientSNo);
        sessionStorage.setItem('interiorFloors', JSON.stringify(interiorFloors));
        sessionStorage.setItem('exteriorFloors', JSON.stringify(exteriorFloors));
        sessionStorage.setItem('tilesData', JSON.stringify(tilesData));
        sessionStorage.setItem('filteredFileOptions', JSON.stringify(filteredFileOptions));
        if (paintSelectedFile) sessionStorage.setItem('paintSelectedFile', JSON.stringify(paintSelectedFile));
    }, [paintClientName, paintClientSNo, interiorFloors, filteredFileOptions, tilesData, paintSelectedFile, exteriorFloors]);

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
    const handleChange = (e, index, field) => {
        const updatedTiles = [...tilesData];
        updatedTiles[index][field] = e.target.value;
        setTilesData(updatedTiles);
    };
    const handleOthersDeductionKeyPress = (e, index) => {
        if (e.key === 'Enter') {
            const input = e.target.value.trim();
            try {
                const result = evaluate(input);
                const updatedTiles = [...tilesData];
                updatedTiles[index].deduction = result;
                setTilesData(updatedTiles);
            } catch (error) {
                alert('Invalid calculation! Please check your input.');
            }
        }
    };
    const addAreaRowOthers = (index) => {
        setTilesData([
            ...tilesData,
            {
                paintItem: '',
                height: '',
                deduction: '',
                wastage: 0,
                selectedPaint: '',
                selectedPaintColor: '',
            },
        ]);
    };
    const handleCommonPaintChange = (selectedOption) => {
        const selectedPaint = selectedOption ? selectedOption.value : '';
        setCommonPaint(selectedPaint);
        const updatedFloors = interiorFloors.map((floor) => ({
            ...floor,
            tiles: floor.tiles.map((tile) => ({
                ...tile,
                selectedPaint: selectedPaint,
            })),
        }));
        setInteriorFloors(updatedFloors);
    };
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
        const formattedMeasurement = Object.entries(
            deductionData.reduce((acc, row) => {
                const location = row.location || "Wall";
                if (row.measurement) {
                    const formattedEntry = row.qty ? `((${row.measurement} )x ${row.qty})` : row.measurement;
                    acc[location] = acc[location] ? `${acc[location]} + ${formattedEntry}` : `${location}: ${formattedEntry}`;
                }
                return acc;
            }, {})
        ).map(([_, value]) => value).join(" , ");
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
    const updateExteriorDeductionInputs = (floorIndex, tileIndex) => {
        const deductionData = exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`] || [];
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
            setExteriorDeductionInputs((prevState) => ({
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
        setExteriorDeductionRowWiseInputs((prevState) => ({
            ...prevState,
            [`${floorIndex}-${tileIndex}`]: formattedRows.join("\n"),
        }));
    };

    const handleQtyChange = (e, floorIndex, tileIndex, index) => {
        const updatedData = [...(deductionPopupData[`${floorIndex}-${tileIndex}`] || [])];
        const newQty = e.target.value;
        updatedData[index] = {
            ...updatedData[index],
            qty: newQty,
        };
        const measurementValue = updatedData[index]?.measurement;
        const qty = parseFloat(newQty) || 0;
        const measurementParts = measurementValue?.split(/x|X/).map((item) => parseFloat(item.trim()));
        const output = (measurementParts?.[0] * measurementParts?.[1] || 0) * qty;
        updatedData[index].output = output.toString();
        handlePopupDataChange(floorIndex, tileIndex, updatedData);
        updateDeductionInputs(floorIndex, tileIndex);
    };
    const handleLocationChange = (e, floorIndex, tileIndex, index) => {
        const updatedData = [...(deductionPopupData[`${floorIndex}-${tileIndex}`] || [])];
        if (!updatedData[index]) updatedData[index] = {};
        updatedData[index].location = e.target.value;
        handlePopupDataChange(floorIndex, tileIndex, updatedData);
    };
    const handleExteriorLocationChange = (e, floorIndex, tileIndex, index) => {
        const updatedData = [...(exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`] || [])];
        if (!updatedData[index]) updatedData[index] = {};
        updatedData[index].location = e.target.value;
        handleExteriorPopupDataChange(floorIndex, tileIndex, updatedData);
    };
    const handleExteriorQtyChange = (e, floorIndex, tileIndex, index) => {
        const updatedData = [...(exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`] || [])];
        const newQty = e.target.value;
        updatedData[index] = {
            ...updatedData[index],
            qty: newQty,
        };
        const measurementValue = updatedData[index]?.measurement;
        const qty = parseFloat(newQty) || 0;
        const measurementParts = measurementValue?.split(/x|X/).map((item) => parseFloat(item.trim()));
        const output = (measurementParts?.[0] * measurementParts?.[1] || 0) * qty;
        updatedData[index].output = output.toString();
        handleExteriorPopupDataChange(floorIndex, tileIndex, updatedData);
        updateExteriorDeductionInputs(floorIndex, tileIndex);
    };
    const handleMeasurementChange = (selectedOption, floorIndex, tileIndex, index) => {
        const updatedData = [...(deductionPopupData[`${floorIndex}-${tileIndex}`] || [])];
        if (!updatedData[index]) updatedData[index] = {};
        updatedData[index].measurement = selectedOption?.value || "";
        handlePopupDataChange(floorIndex, tileIndex, updatedData);
        updateDeductionInputs(floorIndex, tileIndex);
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
            if (measurement && thicknessValue) {
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
    const handleExteriorTypeChange = (selectedOption, floorIndex, tileIndex, index) => {
        setExteriorDeductionPopupData((prevData) => {
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
            if (measurement && thicknessValue) {
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
            updatedData[key][index].thickness = selectedOption ? selectedOption.value : "";
            const type = (updatedData[key][index].type || "N/A").trim();
            const measurement = updatedData[key][index].measurement || "";
            if (measurement) {
                const [length, breadth] = measurement.split(/x|X/).map(num => parseFloat(num.trim()));
                if (!isNaN(length) && !isNaN(breadth) && selectedOption) {
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
                }
            }
            return { ...updatedData };
        });
        updateDeductionInputs(floorIndex, tileIndex);
        updateTotalThickness(floorIndex, tileIndex);
    };
    const handleExteriorThicknessChange = (selectedOption, floorIndex, tileIndex, index) => {
        setExteriorDeductionPopupData((prevData) => {
            const updatedData = { ...prevData };
            const key = `${floorIndex}-${tileIndex}`;
            if (!updatedData[key]) {
                updatedData[key] = [];
            }
            if (!updatedData[key][index]) {
                updatedData[key][index] = {};
            }
            updatedData[key][index].thickness = selectedOption ? selectedOption.value : "";
            const type = (updatedData[key][index].type || "N/A").trim();
            const measurement = updatedData[key][index].measurement || "";
            if (measurement) {
                const [length, breadth] = measurement.split(/x|X/).map(num => parseFloat(num.trim()));
                if (!isNaN(length) && !isNaN(breadth) && selectedOption) {
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
                }
            }
            return { ...updatedData };
        });
        updateExteriorDeductionInputs(floorIndex, tileIndex);
        updateTotalExteriorThickness(floorIndex, tileIndex);
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

    const getExteriorTotalThickness = (floorIndex, tileIndex) => {
        const key = `${floorIndex}-${tileIndex}`;
        if (!exteriorDeductionPopupData[key]) return { total: "0.00", formattedValues: "" };
        const values = exteriorDeductionPopupData[key]
            .map((item) => (parseFloat(item?.deductionThickness) || 0).toFixed(2))
            .filter((val) => val !== "0.00");
        const total = values
            .reduce((sum, val) => sum + parseFloat(val), 0)
            .toFixed(2);
        const formattedValues = values.join(" + ");
        return { total, formattedValues };
    };

    const updateTotalThickness = (floorIndex, tileIndex) => {
        const { total, formattedValues } = getTotalThickness(floorIndex, tileIndex);
        setInteriorFloors((prevFloors) =>
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
    const updateTotalExteriorThickness = (floorIndex, tileIndex) => {
        const { total, formattedValues } = getExteriorTotalThickness(floorIndex, tileIndex);
        setExteriorFloors((prevFloors) =>
            prevFloors.map((floor, fIndex) => {
                if (fIndex === floorIndex) {
                    return {
                        ...floor,
                        tiles: floor.tiles.map((tile, tIndex) => {
                            if (tIndex === tileIndex) {
                                return {
                                    ...tile,
                                    deductionThickness: total,
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
    const handleExteriorMeasurementChange = (selectedOption, floorIndex, tileIndex, index) => {
        const updatedData = [...(exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`] || [])];
        if (!updatedData[index]) updatedData[index] = {};
        updatedData[index].measurement = selectedOption?.value || "";
        handleExteriorPopupDataChange(floorIndex, tileIndex, updatedData);
        updateExteriorDeductionInputs(floorIndex, tileIndex);
    };
    useEffect(() => {
        Object.values(deductionInputs).forEach((formattedMeasurement, index) => {
        });
    }, [deductionInputs]);
    useEffect(() => {
        Object.values(exteriorDeductionInputs).forEach((formattedMeasurement, index) => {
        });
    }, [exteriorDeductionInputs]);
    useEffect(() => {
        Object.keys(deductionPopupData).forEach((key) => {
            const [floorIndex, tileIndex] = key.split('-');
            updateDeductionInputs(floorIndex, tileIndex);
        });
    }, [deductionPopupData]);
    useEffect(() => {
        Object.keys(exteriorDeductionPopupData).forEach((key) => {
            const [floorIndex, tileIndex] = key.split('-');
            updateExteriorDeductionInputs(floorIndex, tileIndex);
        });
    }, [exteriorDeductionPopupData]);
    const handleCommonExteriorPaintChange = (selectedOption) => {
        const selectedPaint = selectedOption ? selectedOption.value : "";
        setCommonExteriorPaint(selectedPaint);
        const updatedFloors = exteriorFloors.map((floor) => ({
            ...floor,
            tiles: floor.tiles.map((tile) => ({
                ...tile,
                selectedPaint: selectedPaint,
            })),
        }));
        setExteriorFloors(updatedFloors);
    };
    const handleCommonPaintColorChange = (selectedOption) => {
        const selectedPaintColor = selectedOption ? selectedOption.value : '';
        setCommonPaintColor(selectedPaintColor);

        const updatedFloors = interiorFloors.map((floor) => ({
            ...floor,
            tiles: floor.tiles.map((tile) => ({
                ...tile,
                selectedPaintColor: selectedPaintColor,
            })),
        }));
        setInteriorFloors(updatedFloors);
    };
    const handleCommonExteriorPaintColorChange = (selectedOption) => {
        const selectedPaintColor = selectedOption ? selectedOption.value : "";
        setCommonExteriorPaintColor(selectedPaintColor);
        const updatedFloors = exteriorFloors.map((floor) => ({
            ...floor,
            tiles: floor.tiles.map((tile) => ({
                ...tile,
                selectedPaintColor: selectedPaintColor,
            })),
        }));
        setExteriorFloors(updatedFloors);
    };
    const deleteAreaRowOthers = (index) => {
        const updatedTilesData = tilesData.filter((_, i) => i !== index);
        setTilesData(updatedTilesData);
    };
    const calculateArea = (length, breadth, height, deduction, formula, putty, primer, waterProof, paintItem) => {
        try {
            const variables = {
                L: Number(length),
                B: Number(breadth),
                H: Number(height),
                deduction: Number(deduction),
            };
            const parseFormula = (formula) => {
                if (!formula) return 0;
                return formula.replace(/L|B|H|deduction/g, (match) => variables[match]).replace(/x/g, "*");
            };
            const evaluateFormula = (formattedFormula) => {
                try {
                    return evaluate(formattedFormula);
                } catch {
                    throw new Error("Invalid formula");
                }
            };
            let areaCalculation = 0;
            if (waterProof === "No" && paintItem === "Water Proof") {
                return "0.00";
            }
            if (primer === "No" && paintItem === "Primer") {
                return "0.00";
            }
            if (putty === "Wall" && paintItem === "Pre Putty Coat") {
                if (formula) {
                    const formattedFormula = parseFormula(formula);
                    const calculatedArea = evaluateFormula(formattedFormula);
                    areaCalculation = calculatedArea - Number(deduction);
                }
            } else if (putty === "Ceiling" && paintItem === "Pre Putty Coat") {
                areaCalculation = 0;
            } else if (putty === "No" && paintItem === "Pre Putty Coat") {
                areaCalculation = 0;
            } else if (putty === "Wall" && paintItem === "Putty") {
                if (formula) {
                    const formattedFormula = parseFormula(formula);
                    const calculatedArea = evaluateFormula(formattedFormula);
                    areaCalculation = calculatedArea - Number(deduction);
                }
            } else if (putty === "Both" && paintItem === "Putty") {
                if (formula) {
                    const formattedFormula = parseFormula(formula);
                    const calculatedArea = evaluateFormula(formattedFormula);
                    const ceiling = Number(length) * Number(breadth);
                    areaCalculation = calculatedArea + ceiling - Number(deduction);
                }
            } else if (putty === "Ceiling" && paintItem === "Putty") {
                const ceiling = Number(length) * Number(breadth);
                areaCalculation = ceiling - Number(deduction);
            } else if (putty === "No" && paintItem === "Putty") {
                areaCalculation = 0;
            } else if (primer === "Yes" && paintItem === "Primer") {
                if (formula) {
                    const formattedFormula = parseFormula(formula);
                    const calculatedArea = evaluateFormula(formattedFormula);
                    const ceiling = Number(length) * Number(breadth);
                    areaCalculation = calculatedArea + ceiling - Number(deduction);
                }
            } else if (waterProof === "Yes" && paintItem === "Water Proof") {
                if (formula) {
                    const formattedFormula = parseFormula(formula);
                    const calculatedArea = evaluateFormula(formattedFormula);
                    const ceiling = Number(length) * Number(breadth);
                    areaCalculation = calculatedArea + ceiling - Number(deduction);
                }
            } else {
                if (formula) {
                    const formattedFormula = parseFormula(formula);
                    areaCalculation = evaluateFormula(formattedFormula);
                }
            }
            return areaCalculation.toFixed(2);
        } catch (error) {
            console.error("Error evaluating formula:", error);
            return "0.00";
        }
    };
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
    const paintColors = paints.map((color) => ({
        label: color.paintColor,
        value: color.paintColor,
    }));
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
    const handlePuttyBillClick = () => {
        setIsPuttyBillOpen(true);
    }
    const handleExteriorPuttyBillClick = () => {
        setIsExteriorPuttyBillOpen(true);
    }
    const handlePaintBillClick = () => {
        setIsPaintBillOpen(true);
    }
    const handleExteriorPaintBillClick = () => {
        setIsExteriorPaintBillOpen(true);
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
    useEffect(() => {
        fectOthersTable();
    }, []);
    const fectOthersTable = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/paintData/allExtra');
            if (response.ok) {
                const data = await response.json();
                setOtherTable(data);
            } else {
                setMessage("error");
            }
        } catch (error) {
            console.error(error);
        }
    }
    const handleSelectionChange = (value) => {
        setSelection((prevSelection) => {
            if (
                (value === "Interior" && (prevSelection.includes("Exterior") || prevSelection.includes("Both"))) ||
                (value === "Exterior" && (prevSelection.includes("Interior") || prevSelection.includes("Both"))) ||
                (value === "Both" && (prevSelection.includes("Interior") || prevSelection.includes("Exterior")))
            ) {
                return prevSelection;
            }
            if (
                (value === "With Image" && prevSelection.includes("Without Image")) ||
                (value === "Without Image" && prevSelection.includes("With Image"))
            ) {
                return prevSelection;
            }
            if (prevSelection.includes(value)) {
                return prevSelection.filter((item) => item !== value);
            } else {
                return [...prevSelection, value];
            }
        });
    };
    const handleOCSelectionChange = (value) => {
        setOCSelection((prev) => {
            if (prev.includes(value)) {
                return prev.filter((item) => item !== value);
            }
            if (
                (value === "Interior" && (prev.includes("Exterior") || prev.includes("Both"))) ||
                (value === "Exterior" && (prev.includes("Interior") || prev.includes("Both"))) ||
                (value === "Both" && (prev.includes("Interior") || prev.includes("Exterior")))
            ) {
                return prev;
            }
            if (
                (value === "With Image" && prev.includes("Without Image")) ||
                (value === "Without Image" && prev.includes("With Image"))
            ) {
                return prev;
            }
            if (prev.length >= 2) {
                return prev;
            }
            return [...prev, value];
        });
    };

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
    const handleConfirmPuttyBill = () => {
        if (puttyRateSelect === 'With Rate') {
            extractPuttyBillData();
        }
        if (puttyRateSelect === 'Without Rate') {
            extractPuttyBillData();
        }
        setPuttyRateSelect([]);
        setIsPuttyBillOpen(false);
    }
    const handleExteriorConfirmPuttyBill = () => {
        if (exteriorPuttyRateSelect === 'With Rate') {
            extractExteriorPuttyBillData();
        }
        if (exteriorPuttyRateSelect === 'Without Rate') {
            extractExteriorPuttyBillData();
        }
        setExteriorPuttyRateSelect([]);
        setIsExteriorPuttyBillOpen(false);
    }
    const handleConfirmPaintBill = () => {
        if (primerRateSelect === 'With Rate') {
            extractPaintBillData();
        }
        if (primerRateSelect === 'Without Rate') {
            extractPaintBillData();
        }
        setPrimerRateSelect([]);
        setIsPaintBillOpen(false);
    }
    const handleExteriorConfirmPaintBill = () => {
        if (exteriorPrimerRateSelect === 'With Rate') {
            extractExteriorPaintBillData();
        }
        if (exteriorPrimerRateSelect === 'Without Rate') {
            extractExteriorPaintBillData();
        }
        setExteriorPrimerRateSelect([]);
        setIsExteriorPaintBillOpen(false);
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
    const handleClosePuttyBill = () => {
        setPuttyRateSelect([]);
        setIsPuttyBillOpen(false);
    }
    const handleCloseExteriorPuttyBill = () => {
        setExteriorPuttyRateSelect([]);
        setIsExteriorPuttyBillOpen(false);
    }
    const handleClosePaintBill = () => {
        setPrimerRateSelect([]);
        setIsPaintBillOpen(false);
    }
    const handleExteriorClosePaintBill = () => {
        setExteriorPrimerRateSelect([]);
        setIsExteriorPaintBillOpen(false);
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
        if (!paintClientName) {
            setFileOption([]);
            return;
        }
        let filteredOptions = fullDatas.filter(calculation => calculation.clientName === paintClientName.value);
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
    }, [paintClientName, fullDatas, selectedModule]);

    const fetchCalculation = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/tile/tile/all');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setFullDatas(data);
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
        fetchCalculations();
    }, [paintClientName?.label, paintSelectedFile?.label]);
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
    const handleTileChange = (eventOrOption, floorIndex, tileIndex) => {
        const isEvent = eventOrOption?.target !== undefined;
        const value = isEvent ? eventOrOption.target.value : eventOrOption?.value || "";
        const fieldName = isEvent ? eventOrOption.target.name : "selectedPaintColor";
        setInteriorFloors((prevFloors) => {
            const updatedFloors = prevFloors.map((floor, fIdx) => {
                if (fIdx !== floorIndex) return floor;
                return {
                    ...floor,
                    tiles: floor.tiles.map((tile, tIdx) => {
                        if (tIdx !== tileIndex) return tile;
                        return {
                            ...tile,
                            [fieldName]: value,
                        };
                    }),
                };
            });
            setTimeout(() => {
                setInteriorFloors((prevUpdatedFloors) => {
                    const latestFloors = [...prevUpdatedFloors];
                    handleInteriorDeductionChange(floorIndex, tileIndex, latestFloors);
                    return latestFloors;
                });
            }, 0);

            return updatedFloors;
        });
    };
    const handleExteriorChange = (eventOrOption, floorIndex, tileIndex) => {
        const isEvent = eventOrOption?.target !== undefined;
        const value = isEvent ? eventOrOption.target.value : eventOrOption?.value || "";
        const fieldName = isEvent ? eventOrOption.target.name : "selectedPaintColor";
        setExteriorFloors((prevFloors) =>
            prevFloors.map((floor, fIdx) => {
                if (fIdx !== floorIndex) return floor;
                return {
                    ...floor,
                    tiles: floor.tiles.map((tile, tIdx) => {
                        if (tIdx !== tileIndex) return tile;
                        return {
                            ...tile,
                            [fieldName]: value,
                        };
                    }),
                };
            })
        );
    };
    const handleSiteChange = (selected) => {
        setPaintClientName(selected);
        setPaintClientSNo(selected ? selected.sNo : "");
        if (selected) {
            const clientNameFromSite = selected.value;
            const filteredOptions = fileOptions.filter(
                option => option.clientName === clientNameFromSite
            );
            setFilteredFileOptions(filteredOptions);
        } else {
            setFilteredFileOptions([]);
            setPaintSelectedFile(null);
            setSelectedClientData({ calculations: [] });
            setFloors([{
                floorName: "Ground Floor",
                areaName: "",
                tiles: [{ length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" }],
            }]);
        }
    };
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
            const filteredTiles = floor.tiles.filter(tile => tile.ceilingCoat === "1 Coat" || tile.ceilingCoat === "2 Coat");
            if (filteredTiles.length === 0) {
                return;
            }
            const totalOrderedTile = filteredTiles.reduce((total, tile) => {
                const tileArea = (parseFeetInches(tile.length) * parseFeetInches(tile.breadth));
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
        return parseFloat(orderQty.toFixed(2));
    };
    const calculateTotalOrderQty = () => {
        return tableData
            .reduce((total, row, index) => total + calculateOrderQty(row, index), 0)
            .toFixed(2);
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
        const siteName = paintClientName.label;
        const clientId = paintClientSNo || 0;
        const revisionCount = await getRevisionNumber(paintClientName.label);
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
            doc.setFontSize(8);
            doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
            doc.setFont("helvetica", "normal");
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
            doc.setFontSize(8);
            doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
            doc.setFont("helvetica", "normal");
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
                            ? ((parseFeetInches(tile.length) * parseFeetInches(tile.height) * 2) +
                                (parseFeetInches(tile.breadth) * parseFeetInches(tile.height) * 2) -
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
                                ((parseFeetInches(tile.length) * parseFeetInches(tile.height) * 2) +
                                    (parseFeetInches(tile.breadth) * parseFeetInches(tile.height) * 2) -
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
        let yPosition = 10;
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
                    "AREA NAME",
                    "L (Ft)",
                    "B (Ft)",
                    "H (Ft)",
                    "LESS AREA",
                    "AREA (SQFT)",
                    "PUTTY",
                    "PRIMER",
                    "CEILING COAT",
                    "WATER PROOF",
                    "EXTRA %",
                    "PRODUCT VARIANT",
                    "PAINT COLOR",
                    "LITTER (L)",
                ],
            ],
            body: tableData,
            theme: "grid",
            startY: yPosition + 34,
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 9.5,
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
                0: { halign: "center", cellWidth: 11 },
                1: { halign: "left", cellWidth: 31.5 },
                2: { halign: "center", cellWidth: 12.5 },
                3: { halign: "center", cellWidth: 12.5 },
                4: { halign: "center", cellWidth: 12.5 },
                5: { halign: "center", cellWidth: 15 },
                6: { halign: "center", cellWidth: 14.5 },
                7: { halign: "left", cellWidth: 14.5 },
                8: { halign: "left", cellWidth: 16.5 },
                9: { halign: "left", cellWidth: 17 },
                10: { halign: "left", cellWidth: 16.6 },
                11: { halign: "center", cellWidth: 14.5 },
                12: { halign: "left", cellWidth: 36.5 },
                13: { halign: "left", cellWidth: 29 },
                14: { halign: "right", cellWidth: 15 },
            },
            margin: { left: 14, right: 14, top: 44 },
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
                            ? ((parseFeetInches(tile.length) * parseFeetInches(tile.height)) +
                                (parseFeetInches(tile.breadth) * parseFeetInches(tile.height)) -
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
                                ((parseFeetInches(tile.length) * parseFeetInches(tile.height)) +
                                    (parseFeetInches(tile.breadth) * parseFeetInches(tile.height)) -
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
                    "AREA NAME",
                    "L (Ft)",
                    "B (Ft)",
                    "H (Ft)",
                    "LESS AREA",
                    "AREA (SQFT)",
                    "PUTTY",
                    "PRIMER",
                    "CEILING COAT",
                    "WATER PROOF",
                    "EXTRA %",
                    "PRODUCT VARIANT",
                    "PAINT COLOR",
                    "LITTER (L)",
                ],
            ],
            body: tableDatas,
            theme: "grid",
            startY: 44,
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 9.5,
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
                0: { halign: "center", cellWidth: 11 },
                1: { halign: "left", cellWidth: 31.5 },
                2: { halign: "center", cellWidth: 12.5 },
                3: { halign: "center", cellWidth: 12.5 },
                4: { halign: "center", cellWidth: 12.5 },
                5: { halign: "center", cellWidth: 15 },
                6: { halign: "center", cellWidth: 14.5 },
                7: { halign: "left", cellWidth: 14.5 },
                8: { halign: "left", cellWidth: 16.5 },
                9: { halign: "left", cellWidth: 17 },
                10: { halign: "left", cellWidth: 16.6 },
                11: { halign: "center", cellWidth: 14.5 },
                12: { halign: "left", cellWidth: 36.5 },
                13: { halign: "left", cellWidth: 29 },
                14: { halign: "right", cellWidth: 15 },
            },
            margin: { left: 14, right: 14, top: 44 },
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
            const revisionCount = await getRevisionNumber(paintClientName.label);
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
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFontSize(8);
                doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
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
                doc.setFontSize(8);
                doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
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
            const headers = [["S.No", "PAINT NAME", "PAINT COLOR", "AREA (SQFT)", "QTY (L)", "IMAGE"]];
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
                    halign: "center",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    valign: "middle",
                    minCellHeight: 36,
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 12 },
                    1: { halign: "left", cellWidth: 50 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 20 },
                    4: { halign: "center", cellWidth: 23 },
                    5: { halign: "center", cellWidth: 42 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
                rowPageBreak: 'avoid',
                didParseCell: function (data) {
                    if (data.section === "body") {
                        const row = data.row.raw;
                        if (row[0] && typeof row[0] === "object" && row[0].colSpan === 8) {
                            data.cell.styles.minCellHeight = 12;
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.halign = 'left';
                        } else {
                            data.cell.styles.minCellHeight = 36;
                        }
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
                    halign: "center",
                    fontSize: 11,
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [0, 0, 0],
                    valign: "middle",
                    minCellHeight: 36,
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 12 },
                    1: { halign: "left", cellWidth: 50 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 20 },
                    4: { halign: "center", cellWidth: 23 },
                    5: { halign: "center", cellWidth: 42 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header1();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
                rowPageBreak: 'avoid',
                didParseCell: function (data) {
                    if (data.section === "body") {
                        const row = data.row.raw;
                        if (row[0] && typeof row[0] === "object" && row[0].colSpan === 8) {
                            data.cell.styles.minCellHeight = 12;
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.halign = 'left';
                        } else {
                            data.cell.styles.minCellHeight = 36;
                        }
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
            const revisionCount = await getRevisionNumber(paintClientName.label);
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
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFontSize(8);
                doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
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
                doc.setFontSize(8);
                doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
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
            const headers = [["S.No", "FLOOR NAME", "PAINT NAME", "PAINT COLOR", "AREA (SQFT)", "QTY (L)"]];
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
                margin: { left: 14, right: 14, top: 44 },
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
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header1();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
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
            const filename = `PMS SC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
            doc.save(filename);
            return doc.output("blob");
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const generateInteriorCustomerCopyPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(paintClientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = detailedFloorSummary();
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
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const header = () => {
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("PAINT MEASUREMENT SHEET", 14, 15);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                const clientLabel = "CLIENT: ";
                doc.text(clientLabel, 14, 33);
                const labelWidth = doc.getTextWidth(clientLabel);
                doc.setFontSize(8);
                doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
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
                doc.setFontSize(8);
                doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
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
            const headers = [["S.No", "AREA NAME", "PAINT NAME", "PAINT COLOR", "IMAGE"]];
            const tableData = [];
            const rowToSummaryMap = [];
            let currentFloor = null;
            let floorCounter = 0;
            let floorSerialNumber = 0;
            summaryDatas.forEach((item, index) => {
                if (item.floorName !== currentFloor) {
                    currentFloor = item.floorName;
                    floorCounter++;
                    floorSerialNumber = 0;
                    const floorLabel = String.fromCharCode(64 + floorCounter);
                    tableData.push([
                        { content: `${" "} ${" "} ${floorLabel}  ${" "} ${" "} ${" "} ${currentFloor}`, colSpan: 8, styles: { halign: "left", fontStyle: "bold" } }
                    ]);
                    rowToSummaryMap.push(null);
                }
                floorSerialNumber++;
                tableData.push([
                    floorSerialNumber,
                    item.areaName || "",
                    item.paintName || "",
                    item.paintColor || "",
                    "",
                ]);
                rowToSummaryMap.push(index);
            });
            const tableStartY = 44;
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
                    minCellHeight: 36,
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 12 },
                    1: { halign: "left", cellWidth: 42 },
                    2: { halign: "left", cellWidth: 50 },
                    3: { halign: "left", cellWidth: 35 },
                    4: { halign: "center", cellWidth: 43 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
                rowPageBreak: 'avoid',
                didParseCell: function (data) {
                    if (data.section === "body") {
                        const row = data.row.raw;
                        if (row[0] && typeof row[0] === "object" && row[0].colSpan === 8) {
                            data.cell.styles.minCellHeight = 10;
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.halign = 'left';
                        } else {
                            data.cell.styles.minCellHeight = 36;
                        }
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
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.2);
                        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                    }
                    if (data.column.index === 4 && data.cell.section === "body") {
                        const summaryIndex = rowToSummaryMap[data.row.index];
                        if (summaryIndex !== null) {
                            const item = summaryDatas[summaryIndex];
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
                            }
                        }
                    }
                }
            });
            doc.addPage();
            const exteriorHeaders = [["S.No", "AREA NAME", "PAINT NAME", "PAINT COLOR", "IMAGE"]];
            const tableDatas = [];
            const rowToSummaryMaps = [];
            let currentFloors = null;
            let floorCounters = 0;
            let floorSerialNumbers = 0;
            exteriorSummarys.forEach((item, index) => {
                if (item.floorName !== currentFloors) {
                    currentFloors = item.floorName;
                    floorCounters++;
                    floorSerialNumbers = 0;
                    const floorLabel = String.fromCharCode(64 + floorCounters);
                    tableDatas.push([
                        { content: `${" "} ${" "} ${floorLabel}  ${" "} ${" "} ${" "} ${currentFloors}`, colSpan: 8, styles: { halign: "left", fontStyle: "bold" } }
                    ]);
                    rowToSummaryMaps.push(null);
                }
                floorSerialNumbers++;
                tableDatas.push([
                    floorSerialNumbers,
                    item.areaName || "",
                    item.paintName || "",
                    item.paintColor || "",
                    "",
                ]);
                rowToSummaryMaps.push(index);
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
                    minCellHeight: 36,
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 12 },
                    1: { halign: "left", cellWidth: 42 },
                    2: { halign: "left", cellWidth: 50 },
                    3: { halign: "left", cellWidth: 35 },
                    4: { halign: "center", cellWidth: 43 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header1();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
                rowPageBreak: 'avoid',
                didParseCell: function (data) {
                    if (data.section === "body") {
                        const row = data.row.raw;
                        if (row[0] && typeof row[0] === "object" && row[0].colSpan === 8) {
                            data.cell.styles.minCellHeight = 10;
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.halign = 'left';
                        } else {
                            data.cell.styles.minCellHeight = 36;
                        }
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
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.2);
                        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                    }
                    if (data.column.index === 4 && data.cell.section === "body") {
                        const summaryIndex = rowToSummaryMaps[data.row.index];
                        if (summaryIndex !== null) {
                            const item = exteriorSummarys[summaryIndex];
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
                            }
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
            const revisionCount = await getRevisionNumber(paintClientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryData = combinedFloorSummary();
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
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("STOCKING CHART", doc.internal.pageSize.width - 46, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS SC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "Floor Name", "Paint Name", "Paint Color", "Area (sqft)", "Qty (L)"]];
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
                    0: { halign: "center", cellWidth: 13 },
                    1: { halign: "left", cellWidth: 35 },
                    2: { halign: "left", cellWidth: 52 },
                    3: { halign: "left", cellWidth: 36 },
                    4: { halign: "center", cellWidth: 24 },
                    5: { halign: "center", cellWidth: 22 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
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
            doc.save(filename);
            return doc.output("blob");
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const exteriorFloorSummaryPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(paintClientName.label);
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
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("STOCKING CHART", doc.internal.pageSize.width - 46, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS SC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "Floor Name", "Paint Name", "Paint Color", "Area (sqft)", "Qty (L)"]];
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
                    0: { halign: "center", cellWidth: 13 },
                    1: { halign: "left", cellWidth: 35 },
                    2: { halign: "left", cellWidth: 52 },
                    3: { halign: "left", cellWidth: 36 },
                    4: { halign: "center", cellWidth: 24 },
                    5: { halign: "center", cellWidth: 22 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header1();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
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
            doc.save(filename);
            return doc.output("blob");
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const BothInteriorExteriorFloorSummaryPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(paintClientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryData = combinedFloorSummary();
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
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("STOCKING CHART", doc.internal.pageSize.width - 46, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS SC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
                doc.setFontSize(8);
                doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("STOCKING CHART", doc.internal.pageSize.width - 46, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS SC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "Floor Name", "Paint Name", "Paint Color", "Area (sqft)", "Qty (L)"]];
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
                    0: { halign: "center", cellWidth: 13 },
                    1: { halign: "left", cellWidth: 35 },
                    2: { halign: "left", cellWidth: 52 },
                    3: { halign: "left", cellWidth: 36 },
                    4: { halign: "center", cellWidth: 24 },
                    5: { halign: "center", cellWidth: 22 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                margin: { left: 14, right: 14, top: 44 },
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
                    0: { halign: "center", cellWidth: 13 },
                    1: { halign: "left", cellWidth: 35 },
                    2: { halign: "left", cellWidth: 52 },
                    3: { halign: "left", cellWidth: 36 },
                    4: { halign: "center", cellWidth: 24 },
                    5: { halign: "center", cellWidth: 22 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header1();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
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
            doc.save(filename);
            return doc.output("blob");
        } catch (error) {
            console.error("Error generating PDF:", error.message);
        }
    };
    const interiorCustomerCopyPDF = async () => {
        try {
            const revisionCount = await getRevisionNumber(paintClientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = detailedFloorSummary();
            const doc = new jsPDF();
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'CC';
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS CC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "AREA NAME", "PAINT NAME", "PAINT COLOR", "IMAGE"]];
            const tableData = [];
            const rowToSummaryMap = [];
            let currentFloor = null;
            let floorCounter = 0;
            let floorSerialNumber = 0;
            summaryDatas.forEach((item, index) => {
                if (item.floorName !== currentFloor) {
                    currentFloor = item.floorName;
                    floorCounter++;
                    floorSerialNumber = 0;
                    const floorLabel = String.fromCharCode(64 + floorCounter);
                    tableData.push([
                        { content: `${" "} ${" "} ${floorLabel}  ${" "} ${" "} ${" "} ${currentFloor}`, colSpan: 8, styles: { halign: "left", fontStyle: "bold" } }
                    ]);
                    rowToSummaryMap.push(null);
                }
                floorSerialNumber++;
                tableData.push([
                    floorSerialNumber,
                    item.areaName || "",
                    item.paintName || "",
                    item.paintColor || "",
                    "",
                ]);
                rowToSummaryMap.push(index);
            });
            const tableStartY = 44;
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
                    minCellHeight: 36,
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 12 },
                    1: { halign: "left", cellWidth: 42 },
                    2: { halign: "left", cellWidth: 50 },
                    3: { halign: "left", cellWidth: 35 },
                    4: { halign: "center", cellWidth: 43 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
                rowPageBreak: 'avoid',
                didParseCell: function (data) {
                    if (data.section === "body") {
                        const row = data.row.raw;
                        if (row[0] && typeof row[0] === "object" && row[0].colSpan === 8) {
                            data.cell.styles.minCellHeight = 12;
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.halign = 'left';
                        } else {
                            data.cell.styles.minCellHeight = 36;
                        }
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
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.2);
                        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                    }
                    if (data.column.index === 4 && data.cell.section === "body") {
                        const summaryIndex = rowToSummaryMap[data.row.index];
                        if (summaryIndex !== null) {
                            const item = summaryDatas[summaryIndex];
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
                            }
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
            const revisionCount = await getRevisionNumber(paintClientName.label);
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
            const fileType = 'CC';
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS CC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "AREA NAME", "PAINT NAME", "PAINT COLOR"]];
            const tableData = [];
            const rowToSummaryMap = [];
            let currentFloor = null;
            let floorCounter = 0;
            let floorSerialNumber = 0;
            summaryDatas.forEach((item, index) => {
                if (item.floorName !== currentFloor) {
                    currentFloor = item.floorName;
                    floorCounter++;
                    floorSerialNumber = 0;
                    const floorLabel = String.fromCharCode(64 + floorCounter);
                    tableData.push([
                        { content: `${" "} ${" "} ${floorLabel}  ${" "} ${" "} ${" "} ${currentFloor}`, colSpan: 8, styles: { halign: "left", fontStyle: "bold" } }
                    ]);
                    rowToSummaryMap.push(null);
                }
                floorSerialNumber++;
                tableData.push([
                    floorSerialNumber,
                    item.areaName || "",
                    item.paintName || "",
                    item.paintColor || "",
                ]);
                rowToSummaryMap.push(index);
            });
            const tableStartY = 44;
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
                    minCellHeight: 10,
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 51 },
                    2: { halign: "left", cellWidth: 61 },
                    3: { halign: "left", cellWidth: 55 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
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
            const revisionCount = await getRevisionNumber(paintClientName.label);
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
            const fileType = 'CC';
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS CC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
            const tableStartY = 44;
            const exteriorHeaders = [["S.No", "AREA NAME", "PAINT NAME", "PAINT COLOR", "IMAGE"]];
            const tableDatas = [];
            const rowToSummaryMaps = [];
            let currentFloors = null;
            let floorCounters = 0;
            let floorSerialNumbers = 0;
            summaryDatas.forEach((item, index) => {
                if (item.floorName !== currentFloors) {
                    currentFloors = item.floorName;
                    floorCounters++;
                    floorSerialNumbers = 0;
                    const floorLabel = String.fromCharCode(64 + floorCounters);
                    tableDatas.push([
                        { content: `${" "} ${" "} ${floorLabel}  ${" "} ${" "} ${" "} ${currentFloors}`, colSpan: 8, styles: { halign: "left", fontStyle: "bold" } }
                    ]);
                    rowToSummaryMaps.push(null);
                }
                floorSerialNumbers++;
                tableDatas.push([
                    floorSerialNumbers,
                    item.areaName || "",
                    item.paintName || "",
                    item.paintColor || "",
                    "",
                ]);
                rowToSummaryMaps.push(index);
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
                    minCellHeight: 36,
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 12 },
                    1: { halign: "left", cellWidth: 42 },
                    2: { halign: "left", cellWidth: 50 },
                    3: { halign: "left", cellWidth: 35 },
                    4: { halign: "center", cellWidth: 43 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
                rowPageBreak: 'avoid',
                didParseCell: function (data) {
                    if (data.section === "body") {
                        const row = data.row.raw;
                        if (row[0] && typeof row[0] === "object" && row[0].colSpan === 8) {
                            data.cell.styles.minCellHeight = 10;
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.halign = 'left';
                        } else {
                            data.cell.styles.minCellHeight = 36;
                        }
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
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.2);
                        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                    }
                    if (data.column.index === 4 && data.cell.section === "body") {
                        const summaryIndex = rowToSummaryMaps[data.row.index];
                        if (summaryIndex !== null) {
                            const item = summaryDatas[summaryIndex];
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
                            }
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
            const revisionCount = await getRevisionNumber(paintClientName.label);
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
            const fileType = 'CC';
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS CC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
            const exteriorHeaders = [["S.No", "AREA NAME", "PAINT NAME", "PAINT COLOR"]];
            const tableDatas = [];
            const rowToSummaryMaps = [];
            let currentFloors = null;
            let floorCounters = 0;
            let floorSerialNumbers = 0;
            const tableStartY = 44;
            summaryDatas.forEach((item, index) => {
                if (item.floorName !== currentFloors) {
                    currentFloors = item.floorName;
                    floorCounters++;
                    floorSerialNumbers = 0;
                    const floorLabel = String.fromCharCode(64 + floorCounters);
                    tableDatas.push([
                        { content: `${" "} ${" "} ${floorLabel}  ${" "} ${" "} ${" "} ${currentFloors}`, colSpan: 8, styles: { halign: "left", fontStyle: "bold" } }
                    ]);
                    rowToSummaryMaps.push(null);
                }
                floorSerialNumbers++;
                tableDatas.push([
                    floorSerialNumbers,
                    item.areaName || "",
                    item.paintName || "",
                    item.paintColor || "",
                ]);
                rowToSummaryMaps.push(index);
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
                    minCellHeight: 10,
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 51 },
                    2: { halign: "left", cellWidth: 61 },
                    3: { halign: "left", cellWidth: 55 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
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
            const revisionCount = await getRevisionNumber(paintClientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = exteriorGenerateSummaryWithFloorName();
            const summaryDatass = detailedFloorSummary();
            const doc = new jsPDF();
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'CC';
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS CC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
                doc.setFontSize(8);
                doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
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
            const headers = [["S.No", "AREA NAME", "PAINT NAME", "PAINT COLOR", "IMAGE"]];
            const tableData = [];
            const rowToSummaryMap = [];
            let currentFloor = null;
            let floorCounter = 0;
            let floorSerialNumber = 0;
            summaryDatass.forEach((item, index) => {
                if (item.floorName !== currentFloor) {
                    currentFloor = item.floorName;
                    floorCounter++;
                    floorSerialNumber = 0;
                    const floorLabel = String.fromCharCode(64 + floorCounter);
                    tableData.push([
                        { content: `${" "} ${" "} ${floorLabel}  ${" "} ${" "} ${" "} ${currentFloor}`, colSpan: 8, styles: { halign: "left", fontStyle: "bold" } }
                    ]);
                    rowToSummaryMap.push(null);
                }
                floorSerialNumber++;
                tableData.push([
                    floorSerialNumber,
                    item.areaName || "",
                    item.paintName || "",
                    item.paintColor || "",
                    "",
                ]);
                rowToSummaryMap.push(index);
            });
            const tableStartY = 44;
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
                    minCellHeight: 36,
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 12 },
                    1: { halign: "left", cellWidth: 42 },
                    2: { halign: "left", cellWidth: 50 },
                    3: { halign: "left", cellWidth: 35 },
                    4: { halign: "center", cellWidth: 43 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
                rowPageBreak: 'avoid',
                didParseCell: function (data) {
                    if (data.section === "body") {
                        const row = data.row.raw;
                        if (row[0] && typeof row[0] === "object" && row[0].colSpan === 8) {
                            data.cell.styles.minCellHeight = 10;
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.halign = 'left';
                        } else {
                            data.cell.styles.minCellHeight = 36;
                        }
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
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.2);
                        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                    }
                    if (data.column.index === 4 && data.cell.section === "body") {
                        const summaryIndex = rowToSummaryMap[data.row.index];
                        if (summaryIndex !== null) {
                            const item = summaryDatass[summaryIndex];
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
                            }
                        }
                    }
                }
            });
            doc.addPage();
            const exteriorHeaders = [["S.No", "AREA NAME", "PAINT NAME", "PAINT COLOR", "IMAGE"]];
            const tableDatas = [];
            const rowToSummaryMaps = [];
            let currentFloors = null;
            let floorCounters = 0;
            let floorSerialNumbers = 0;
            summaryDatas.forEach((item, index) => {
                if (item.floorName !== currentFloors) {
                    currentFloors = item.floorName;
                    floorCounters++;
                    floorSerialNumbers = 0;
                    const floorLabel = String.fromCharCode(64 + floorCounters);
                    tableDatas.push([
                        { content: `${" "} ${" "} ${floorLabel}  ${" "} ${" "} ${" "} ${currentFloors}`, colSpan: 8, styles: { halign: "left", fontStyle: "bold" } }
                    ]);
                    rowToSummaryMaps.push(null);
                }
                floorSerialNumbers++;
                tableDatas.push([
                    floorSerialNumbers,
                    item.areaName || "",
                    item.paintName || "",
                    item.paintColor || "",
                    "",
                ]);
                rowToSummaryMaps.push(index);
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
                    minCellHeight: 36,
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 12 },
                    1: { halign: "left", cellWidth: 42 },
                    2: { halign: "left", cellWidth: 50 },
                    3: { halign: "left", cellWidth: 35 },
                    4: { halign: "center", cellWidth: 43 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header1();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
                rowPageBreak: 'avoid',
                didParseCell: function (data) {
                    if (data.section === "body") {
                        const row = data.row.raw;
                        if (row[0] && typeof row[0] === "object" && row[0].colSpan === 8) {
                            data.cell.styles.minCellHeight = 10;
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.halign = 'left';
                        } else {
                            data.cell.styles.minCellHeight = 36;
                        }
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
                        doc.setDrawColor(0, 0, 0);
                        doc.setLineWidth(0.2);
                        doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                    }
                    if (data.column.index === 4 && data.cell.section === "body") {
                        const summaryIndex = rowToSummaryMaps[data.row.index];
                        if (summaryIndex !== null) {
                            const item = summaryDatas[summaryIndex];
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
                            }
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
            const revisionCount = await getRevisionNumber(paintClientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = exteriorGenerateSummaryWithFloorName();
            const summaryDatass = detailedFloorSummary();
            const doc = new jsPDF();
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const fileType = 'CC';
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
                doc.setFontSize(10);
                const tmsDate = `PMS CC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
                doc.setFontSize(8);
                doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("CUSTOMER COPY", doc.internal.pageSize.width - 45, 15);
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
            const headers = [["S.No", "AREA NAME", "PAINT NAME", "PAINT COLOR"]];
            const tableData = [];
            const rowToSummaryMap = [];
            let currentFloor = null;
            let floorCounter = 0;
            let floorSerialNumber = 0;
            summaryDatass.forEach((item, index) => {
                if (item.floorName !== currentFloor) {
                    currentFloor = item.floorName;
                    floorCounter++;
                    floorSerialNumber = 0;
                    const floorLabel = String.fromCharCode(64 + floorCounter);
                    tableData.push([
                        { content: `${" "} ${" "} ${floorLabel}  ${" "} ${" "} ${" "} ${currentFloor}`, colSpan: 8, styles: { halign: "left", fontStyle: "bold" } }
                    ]);
                    rowToSummaryMap.push(null);
                }
                floorSerialNumber++;
                tableData.push([
                    floorSerialNumber,
                    item.areaName || "",
                    item.paintName || "",
                    item.paintColor || "",
                ]);
                rowToSummaryMap.push(index);
            });
            const tableStartY = 44;
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
                    minCellHeight: 10,
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 51 },
                    2: { halign: "left", cellWidth: 61 },
                    3: { halign: "left", cellWidth: 55 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
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
                }
            });
            doc.addPage();
            const exteriorHeaders = [["S.No", "AREA NAME", "PAINT NAME", "PAINT COLOR"]];
            const tableDatas = [];
            const rowToSummaryMaps = [];
            let currentFloors = null;
            let floorCounters = 0;
            let floorSerialNumbers = 0;
            summaryDatas.forEach((item, index) => {
                if (item.floorName !== currentFloors) {
                    currentFloors = item.floorName;
                    floorCounters++;
                    floorSerialNumbers = 0;
                    const floorLabel = String.fromCharCode(64 + floorCounters);
                    tableDatas.push([
                        { content: `${" "} ${" "} ${floorLabel}  ${" "} ${" "} ${" "} ${currentFloors}`, colSpan: 8, styles: { halign: "left", fontStyle: "bold" } }
                    ]);
                    rowToSummaryMaps.push(null);
                }
                floorSerialNumbers++;
                tableDatas.push([
                    floorSerialNumbers,
                    item.areaName || "",
                    item.paintName || "",
                    item.paintColor || "",
                ]);
                rowToSummaryMaps.push(index);
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
                    minCellHeight: 10,
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 15 },
                    1: { halign: "left", cellWidth: 51 },
                    2: { halign: "left", cellWidth: 61 },
                    3: { halign: "left", cellWidth: 55 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header1();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
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
            const revisionCount = await getRevisionNumber(paintClientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryData = combinedSummary();
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
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "Paint Name", "Paint Color", "Area (sqft)", "QUANTITY (L)"]];
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
            doc.setLineWidth(0.2);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
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
                    valign: "middle",
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 14 },
                    1: { halign: "left", cellWidth: 60 },
                    2: { halign: "center", cellWidth: 48 },
                    3: { halign: "center", cellWidth: 27 },
                    4: { halign: "right", cellWidth: 33 },
                },
                margin: { left: 14, right: 14, top: 44 },
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
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };
    const interiorSummaryPDFWithImage = async () => {
        try {
            const revisionCount = await getRevisionNumber(paintClientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = combinedPaintSummary();
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
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "PAINT NAME", "PAINT COLOR", "AREA (sqft)", "QUANTITY (L)", "IMAGE"]];
            let totalArea = 0;
            let totalQty = 0;
            const tableData = summaryDatas.map((item, index) => {
                const row = [
                    index + 1,
                    item.paintName || "",
                    item.paintColor || "",
                    item.area || 0,
                    item.orderQty || 0,
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
            doc.setLineWidth(0.2);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
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
                    valign: "middle",
                    minCellHeight: 36,
                },
                columnStyles: {
                    0: { halign: "center", cellWidth: 12 },
                    1: { halign: "left", cellWidth: 50 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 20 },
                    4: { halign: "center", cellWidth: 23 },
                    5: { halign: "center", cellWidth: 42 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
                rowPageBreak: 'avoid',
                didParseCell: function (data) {
                    if (data.section === "body") {
                        const row = data.row.raw;
                        if (row[0] && typeof row[0] === "object" && row[0].colSpan === 8) {
                            data.cell.styles.minCellHeight = 12;
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.halign = 'left';
                        } else {
                            data.cell.styles.minCellHeight = 36;
                        }
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
            const revisionCount = await getRevisionNumber(paintClientName.label);
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
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "Paint Name", "Paint Color", "Area (sqft)", "QUANTITY (L)"]];
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
                    0: { halign: "center", cellWidth: 14 },
                    1: { halign: "left", cellWidth: 60 },
                    2: { halign: "center", cellWidth: 48 },
                    3: { halign: "center", cellWidth: 27 },
                    4: { halign: "right", cellWidth: 33 },
                },
                didDrawPage: (data) => {
                    header();
                    footer();
                },
                margin: { left: 14, right: 14, top: 44 },
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
            const revisionCount = await getRevisionNumber(paintClientName.label);
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
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "Paint Name", "Paint Color", "AREA (sqft)", "QUANTITY  (L)", "IMAGE"]];
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
            doc.setLineWidth(0.2);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
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
                    halign: "center ",
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
                    0: { halign: "center", cellWidth: 12 },
                    1: { halign: "left", cellWidth: 50 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 20 },
                    4: { halign: "center", cellWidth: 23 },
                    5: { halign: "center", cellWidth: 42 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
                rowPageBreak: 'avoid',
                didParseCell: function (data) {
                    if (data.section === "body") {
                        const row = data.row.raw;
                        if (row[0] && typeof row[0] === "object" && row[0].colSpan === 8) {
                            data.cell.styles.minCellHeight = 12;
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.halign = 'left';
                        } else {
                            data.cell.styles.minCellHeight = 36;
                        }
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
            const revisionCount = await getRevisionNumber(paintClientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryData = generateExteriorSummary();
            const interriorSummaryData = combinedSummary();
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
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
                doc.setFontSize(8);
                doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "Paint Name", "Paint Color", "Area (sqft)", "QUANTITY (L)"]];
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
            doc.setLineWidth(0.2);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
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
                    0: { halign: "center", cellWidth: 14 },
                    1: { halign: "left", cellWidth: 60 },
                    2: { halign: "center", cellWidth: 48 },
                    3: { halign: "center", cellWidth: 27 },
                    4: { halign: "right", cellWidth: 33 },
                },
                margin: { left: 14, right: 14, top: 44 },
                rowPageBreak: 'avoid',
                didDrawPage: (data) => {
                    header1();
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
            doc.addPage();
            const exteriorHeaders = [["S.No", "Paint Name", "Paint Color", "Area (sqft)", "QUANTITY (L)"]];
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
            doc.setLineWidth(0.2);
            doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
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
                    0: { halign: "center", cellWidth: 14 },
                    1: { halign: "left", cellWidth: 60 },
                    2: { halign: "center", cellWidth: 48 },
                    3: { halign: "center", cellWidth: 27 },
                    4: { halign: "right", cellWidth: 33 },
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
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };
    const BothInteriorExteriorSummaryPDFWithImage = async () => {
        try {
            const revisionCount = await getRevisionNumber(paintClientName.label);
            const revisionNumber = `R ${revisionCount}`;
            const summaryDatas = combinedPaintSummary();
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
            const siteName = paintClientName.label;
            const clientId = paintClientSNo || 0;
            const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
            if (paintSelectedFile && paintSelectedFile.label) {
                filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
                doc.setFontSize(8);
                doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
                doc.setFontSize(8);
                doc.text("EXTERIOR", doc.internal.pageSize.width - 28, 41);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const siteNameText = siteName.toUpperCase();
                doc.text(siteNameText, 14 + labelWidth, 33);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("ORDER COPY", doc.internal.pageSize.width - 38, 15);
                doc.setFont("helvetica", "normal");
                const tmsDate = `PMS OC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
            const headers = [["S.No", "PAINT NAME", "PAINT COLOR", "AREA (sqft)", "QUANTITY  (L)", "IMAGE"]];
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
                    0: { halign: "center", cellWidth: 12 },
                    1: { halign: "left", cellWidth: 50 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 20 },
                    4: { halign: "center", cellWidth: 23 },
                    5: { halign: "center", cellWidth: 42 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
                rowPageBreak: 'avoid',
                didParseCell: function (data) {
                    if (data.section === "body") {
                        const row = data.row.raw;
                        if (row[0] && typeof row[0] === "object" && row[0].colSpan === 8) {
                            data.cell.styles.minCellHeight = 12;
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.halign = 'left';
                        } else {
                            data.cell.styles.minCellHeight = 36;
                        }
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
                    halign: "center ",
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
                    0: { halign: "center", cellWidth: 12 },
                    1: { halign: "left", cellWidth: 50 },
                    2: { halign: "center", cellWidth: 35 },
                    3: { halign: "center", cellWidth: 20 },
                    4: { halign: "center", cellWidth: 23 },
                    5: { halign: "center", cellWidth: 42 },
                },
                margin: { left: 14, right: 14, top: 44 },
                didDrawPage: (data) => {
                    header1();
                    footer();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.2);
                    doc.line(14, tableStartY - 0, doc.internal.pageSize.width - 14, tableStartY - 0);
                },
                rowPageBreak: 'avoid',
                didParseCell: function (data) {
                    if (data.section === "body") {
                        const row = data.row.raw;
                        if (row[0] && typeof row[0] === "object" && row[0].colSpan === 8) {
                            data.cell.styles.minCellHeight = 12;
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.halign = 'left';
                        } else {
                            data.cell.styles.minCellHeight = 36;
                        }
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
        const revisionCount = await getRevisionNumber(paintClientName.label);
        const revisionNumber = `R ${revisionCount}`;
        const selectedDate = formatDateForName(date);
        const fileType = 'EC';
        const siteName = paintClientName.label;
        const clientId = paintClientSNo || 0;
        const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
        if (paintSelectedFile && paintSelectedFile.label) {
            filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
            doc.setFontSize(8);
            doc.text("INTERIOR", doc.internal.pageSize.width - 28, 41);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
            doc.setFontSize(10);
            const tmsDate = `PMS EC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
                            ? ((parseFeetInches(tile.length) * parseFeetInches(tile.height) * 2) +
                                (parseFeetInches(tile.breadth) * parseFeetInches(tile.height) * 2) -
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
                                ((parseFeetInches(tile.length) * parseFeetInches(tile.height) * 2) +
                                    (parseFeetInches(tile.breadth) * parseFeetInches(tile.height) * 2) -
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
                    "AREA NAME",
                    "L   (Ft)",
                    "B   (Ft)",
                    "H   (Ft)",
                    "LESS AREA",
                    "AREA (SQFT)",
                    "PUTTY",
                    "PRIMER",
                    "CEILING COAT",
                    "WATER PROOF",
                    "EXTRA %",
                    "PRODUCT VARIANT",
                    "PAINT COLOR",
                    "QTY (L)",
                ],
            ],
            body: tableData,
            theme: "grid",
            startY: 44,
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 9.5,
                halign: "center",
                lineWidth: 0,
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [0, 0, 0],
                font: "helvetica",
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 11 },
                1: { halign: "left", cellWidth: 31.5 },
                2: { halign: "center", cellWidth: 12.5 },
                3: { halign: "center", cellWidth: 12.5 },
                4: { halign: "center", cellWidth: 12.5 },
                5: { halign: "center", cellWidth: 15 },
                6: { halign: "center", cellWidth: 14.5 },
                7: { halign: "left", cellWidth: 14.5 },
                8: { halign: "left", cellWidth: 16.5 },
                9: { halign: "left", cellWidth: 17 },
                10: { halign: "left", cellWidth: 16.6 },
                11: { halign: "center", cellWidth: 14.5 },
                12: { halign: "left", cellWidth: 36.5 },
                13: { halign: "left", cellWidth: 29 },
                14: { halign: "right", cellWidth: 15 },
            },
            margin: { left: 14, right: 14, top: 44 },
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
        const revisionCount = await getRevisionNumber(paintClientName.label);
        const revisionNumber = `R ${revisionCount}`;
        const selectedDate = formatDateForName(date);
        const fileType = 'EC';
        const siteName = paintClientName.label;
        const clientId = paintClientSNo || 0;
        const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
        if (paintSelectedFile && paintSelectedFile.label) {
            filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
            doc.setFontSize(8);
            doc.text("EXTERIOR", doc.internal.pageSize.width - 28.5, 41);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
            doc.setFontSize(10);
            const tmsDate = `PMS EC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
                            ? ((parseFeetInches(tile.length) * parseFeetInches(tile.height)) +
                                (parseFeetInches(tile.breadth) * parseFeetInches(tile.height)) -
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
                                ((parseFeetInches(tile.length) * parseFeetInches(tile.height)) +
                                    (parseFeetInches(tile.breadth) * parseFeetInches(tile.height)) -
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
                    "AREA NAME",
                    "L (Ft)",
                    "B (Ft)",
                    "H (Ft)",
                    "LESS AREA",
                    "AREA (SQFT)",
                    "PUTTY",
                    "PRIMER",
                    "CEILING COAT",
                    "WATER PROOF",
                    "EXTRA %",
                    "PRODUCT VARIANT",
                    "PAINT COLOR",
                    "LITTER (L)",
                ],
            ],
            body: tableData,
            theme: "grid",
            startY: 44,
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 9.5,
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
                0: { halign: "center", cellWidth: 11 },
                1: { halign: "left", cellWidth: 31.5 },
                2: { halign: "center", cellWidth: 12.5 },
                3: { halign: "center", cellWidth: 12.5 },
                4: { halign: "center", cellWidth: 12.5 },
                5: { halign: "center", cellWidth: 15 },
                6: { halign: "center", cellWidth: 14.5 },
                7: { halign: "left", cellWidth: 14.5 },
                8: { halign: "left", cellWidth: 16.5 },
                9: { halign: "left", cellWidth: 17 },
                10: { halign: "left", cellWidth: 16.6 },
                11: { halign: "center", cellWidth: 14.5 },
                12: { halign: "left", cellWidth: 36.5 },
                13: { halign: "left", cellWidth: 29 },
                14: { halign: "right", cellWidth: 15 },
            },
            margin: { left: 14, right: 14, top: 44 },
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
        const revisionCount = await getRevisionNumber(paintClientName.label);
        const revisionNumber = `R ${revisionCount}`;
        const fileType = 'EC';
        const siteName = paintClientName.label;
        const clientId = paintClientSNo || 0;
        const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
        if (paintSelectedFile && paintSelectedFile.label) {
            filename = `PMS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
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
            const tmsDate = `PMS EC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
            const tmsDate = `PMS EC ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
                            ? ((parseFeetInches(tile.length) * parseFeetInches(tile.height) * 2) +
                                (parseFeetInches(tile.breadth) * parseFeetInches(tile.height) * 2) -
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
                                ((parseFeetInches(tile.length) * parseFeetInches(tile.height) * 2) +
                                    (parseFeetInches(tile.breadth) * parseFeetInches(tile.height) * 2) -
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
                    "AREA NAME",
                    "L (Ft)",
                    "B (Ft)",
                    "H (Ft)",
                    "LESS AREA",
                    "AREA (SQFT)",
                    "PUTTY",
                    "PRIMER",
                    "CEILING COAT",
                    "WATER PROOF",
                    "EXTRA %",
                    "PRODUCT VARIANT",
                    "PAINT COLOR",
                    "LITTER (L)",
                ],
            ],
            body: tableData,
            theme: "grid",
            startY: 44,
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 9.5,
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
                0: { halign: "center", cellWidth: 11 },
                1: { halign: "left", cellWidth: 31.5 },
                2: { halign: "center", cellWidth: 12.5 },
                3: { halign: "center", cellWidth: 12.5 },
                4: { halign: "center", cellWidth: 12.5 },
                5: { halign: "center", cellWidth: 15 },
                6: { halign: "center", cellWidth: 14.5 },
                7: { halign: "left", cellWidth: 14.5 },
                8: { halign: "left", cellWidth: 16.5 },
                9: { halign: "left", cellWidth: 17 },
                10: { halign: "center", cellWidth: 16.6 },
                11: { halign: "center", cellWidth: 14.5 },
                12: { halign: "left", cellWidth: 36.5 },
                13: { halign: "left", cellWidth: 29 },
                14: { halign: "right", cellWidth: 15 },
            },
            margin: { left: 14, right: 14, top: 44 },
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
                            ? ((parseFeetInches(tile.length) * parseFeetInches(tile.height)) +
                                (parseFeetInches(tile.breadth) * parseFeetInches(tile.height)) -
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
                                ((parseFeetInches(tile.length) * parseFeetInches(tile.height)) +
                                    (parseFeetInches(tile.breadth) * parseFeetInches(tile.height)) -
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
                    "AREA NAME",
                    "L (Ft)",
                    "B (Ft)",
                    "H (Ft)",
                    "LESS AREA",
                    "AREA (SQFT)",
                    "PUTTY",
                    "PRIMER",
                    "CEILING COAT",
                    "WATER PROOF",
                    "EXTRA %",
                    "PRODUCT VARIANT",
                    "PAINT COLOR",
                    "LITTER (L)",
                ],
            ],
            body: tableDatas,
            theme: "grid",
            startY: 44,
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 9.5,
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
                0: { halign: "center", cellWidth: 11 },
                1: { halign: "left", cellWidth: 31.5 },
                2: { halign: "center", cellWidth: 12.5 },
                3: { halign: "center", cellWidth: 12.5 },
                4: { halign: "center", cellWidth: 12.5 },
                5: { halign: "center", cellWidth: 15 },
                6: { halign: "center", cellWidth: 14.5 },
                7: { halign: "left", cellWidth: 14.5 },
                8: { halign: "left", cellWidth: 16.5 },
                9: { halign: "left", cellWidth: 17 },
                10: { halign: "center", cellWidth: 16.6 },
                11: { halign: "center", cellWidth: 14.5 },
                12: { halign: "left", cellWidth: 36.5 },
                13: { halign: "left", cellWidth: 29 },
                14: { halign: "right", cellWidth: 15 },
            },
            margin: { left: 14, right: 14, top: 44 },
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
                    const length = parseFeetInches(tile.length || 0);
                    const breadth = parseFeetInches(tile.breadth || 0);
                    const height = parseFeetInches(tile.height || 0);
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
                        lengthInputs: tile.lengthInput || "",
                        length1: "",
                        length2: "",
                        length3: "",
                        length4: "",
                        length5: "",
                        length6: "",
                        length7: "",
                        length8: "",
                        length9: "",
                        length10: "",
                        length11: "",
                        length12: "",
                        length13: "",
                        length14: "",
                        length15: "",
                        length16: "",
                        length17: "",
                        length18: "",
                        length19: "",
                        length20: "",
                        length21: "",
                        length22: "",
                        length23: "",
                        length24: "",
                        length25: "",
                        length26: "",
                        length27: "",
                        length28: "",
                        length29: "",
                        length30: "",
                        breadth: tile.breadth || "0",
                        breadthInputs: tile.breadthInput || "",
                        height: tile.height || "0",
                        heightInputs: tile.heightInput || "",
                        deductionArea: tile.deductionArea || "0",
                        deductionInput: tile.deductionInput || "",
                        deductionThickness: tile.deductionThickness || "",
                        deductionThicknessInputs: tile.deductionThicknessInputs || "",
                        wallDeductionInputs: tile.wallDeductionInputs,
                        ceilingDeductionInputs: tile.ceilingDeductionInputs,
                        wallDeductionArea: tile.wallDeductionArea,
                        ceilingDeductionArea: tile.ceilingDeductionArea,
                        bothDeductionArea: tile.bothDeductionArea,
                        deduction1: tile.deduction1,
                        deduction2: tile.deduction2,
                        deduction3: tile.deduction3,
                        deduction4: tile.deduction4,
                        deduction5: tile.deduction5,
                        deduction6: tile.deduction6,
                        deduction7: tile.deduction7,
                        deduction8: tile.deduction8,
                        deduction9: tile.deduction9,
                        deduction10: tile.deduction10,
                        deduction11: tile.deduction11,
                        deduction12: tile.deduction12,
                        deduction13: tile.deduction13,
                        deduction14: tile.deduction14,
                        deduction15: tile.deduction15,
                        deduction16: tile.deduction16,
                        totalOrderedTile: area,
                        selectedPutty: tile.putty || "No",
                        selectedPrimer: tile.primer || "No",
                        wallCoat: tile.WallCoat || "No",
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
                    const length = parseFeetInches(tile.length);
                    const breadth = parseFeetInches(tile.breadth);
                    const height = parseFeetInches(tile.height);
                    const deductionArea = Number(tile.deductionArea || 0);
                    const totalOrderedTile = length && breadth && height
                        ? ((length * height) + (breadth * height) - deductionArea).toFixed(2)
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
                        length: tile.length || "",
                        length1: tile.length1 || "",
                        length2: tile.length2 || "",
                        length3: tile.length3 || "",
                        length4: tile.length4 || "",
                        length5: tile.length5 || "",
                        length6: tile.length6 || "",
                        length7: tile.length7 || "",
                        length8: tile.length8 || "",
                        length9: tile.length9 || "",
                        length10: tile.length10 || "",
                        length11: tile.length11 || "",
                        length12: tile.length12 || "",
                        length13: tile.length13 || "",
                        length14: tile.length14 || "",
                        length15: tile.length15 || "",
                        length16: tile.length16 || "",
                        length17: tile.length17 || "",
                        length18: tile.length18 || "",
                        length19: tile.length19 || "",
                        length20: tile.length20 || "",
                        length21: tile.length21 || "",
                        length22: tile.length22 || "",
                        length23: tile.length23 || "",
                        length24: tile.length24 || "",
                        length25: tile.length25 || "",
                        length26: tile.length26 || "",
                        length27: tile.length27 || "",
                        length28: tile.length28 || "",
                        length29: tile.length29 || "",
                        length30: tile.length30 || "",
                        breadth: tile.breadth || "",
                        height: tile.height || "",
                        deductionArea: tile.deductionArea || "0",
                        deductionInput: tile.deductionInput || "",
                        deductionThickness: tile.deductionThickness || "",
                        deductionThicknessInputs: tile.deductionThicknessInputs || "",
                        wallDeductionInputs: tile.wallDeductionInputs,
                        ceilingDeductionInputs: tile.ceilingDeductionInputs,
                        wallDeductionArea: tile.wallDeductionArea,
                        ceilingDeductionArea: tile.ceilingDeductionArea,
                        bothDeductionArea: tile.bothDeductionArea,
                        deduction1: tile.deduction1,
                        deduction2: tile.deduction2,
                        deduction3: tile.deduction3,
                        deduction4: tile.deduction4,
                        deduction5: tile.deduction5,
                        deduction6: tile.deduction6,
                        deduction7: tile.deduction7,
                        deduction8: tile.deduction8,
                        deduction9: tile.deduction9,
                        deduction10: tile.deduction10,
                        deduction11: tile.deduction11,
                        deduction12: tile.deduction12,
                        deduction13: tile.deduction13,
                        deduction14: tile.deduction14,
                        deduction15: tile.deduction15,
                        deduction16: tile.deduction16,
                        totalOrderedTile: totalOrderedTile || "0",
                        wastagePercentage: tile.wastagePercentage || "0",
                        selectedPaint: tile.selectedPaint || "",
                        selectedPrimer: tile.primer || "No",
                        selectedPutty: tile.putty || "No",
                        wallCoat: tile.WallCoat || "No",
                        ceilingCoat: "No",
                        selectedWaterProof: tile.waterproof || "No",
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
        const formatDates = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };
        const floorDate = formatDates(date);
        if (!combinedData || !combinedData.formattedData || !combinedData.selectedData) {
            console.error("Data is missing. Cannot save paint calculation.");
            return;
        }
        try {
            const clientResponse = await fetch("https://backendaab.in/aabuilderDash/api/paint_calculation/all/paints");
            if (!clientResponse.ok) {
                throw new Error("Failed to fetch calculations from the backend");
            }
            const formatDateForName = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
            };
            const selectedDate = formatDateForName(date);
            const clientId = paintClientSNo || 0;
            const revisionCount = await getRevisionNumber(paintClientName.label);
            const revisionNumber = `R ${Math.max(revisionCount)}`;
            const fileName = `${formatDate(date)} - R ${revisionCount}`;
            const ceilingCoats = tableData.map((row, index) => ({
                clientName: paintClientName.label,
                fileName,
                date: floorDate,
                floorName: row.floorName,
                paintVariant: selectedPaintNames[index],
                paintColor: selectedPaintColors[index],
                area: row.totalOrderedTile,
                wastagePercentage: wastageValues[index] || '0',
                orderQty: calculateOrderQty(row, index),
            }));
            const preparePaintDataForBackend = (tilesData) => {
                const paintDataArray = [];
                tilesData.forEach((tile) => {
                    paintDataArray.push({
                        clientName: paintClientName.label,
                        fileName: fileName,
                        date: date,
                        paintType: tile.paintItem,
                        height: tile.height || 0,
                        deductionArea: tile.deduction || 0,
                        area: tile.calculatedAreas || 0,
                        wastage: tile.wastage || 0,
                        paintName: tile.selectedPaint,
                        paintColor: tile.selectedPaintColor,
                        orderQty: tile.calculatedOrderQtys || 0,
                    });
                });
                return paintDataArray;
            };
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
            const preparedData = preparePaintDataForBackend(tilesData);
            const dataResponse = await fetch('https://backendaab.in/aabuilderDash/api/paintData/extra', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preparedData),
            });
            if (!dataResponse.ok) {
                throw new Error("Failed to upload paint Data: ");
            }
            const payload = {
                clientName: paintClientName.label,
                clientSno: paintClientSNo,
                fileName: fileName,
                date: floorDate,
                ENo: eno,
                commonPaint: commonPaint,
                commonPaintColor: commonPaintColor,
                commonExteriorPaint: commonExteriorPaint,
                commonExteriorPaintColor: commonExteriorPaintColor,
                commonHeight: commonHeight,
                commonPutty: commonPutty,
                commonPrimer: commonPrimer,
                commonWallCoat: commonWallCoat,
                commonCeilingCoat: commonCeilingCoat,
                commonWaterProof: commonWaterProof,
                commonWastagePercentage: commonWastagePercentage,
                commonExteriorHeight: commonExteriorHeight,
                commonExteriorPutty: commonExteriorPutty,
                commonExteriorPrimer: commonExteriorPrimer,
                commonExteriorWallCoat: commonExteriorWallCoat,
                commonExteriorCeilingCoat: commonExteriorCeilingCoat,
                commonExteriorWaterProof: commonExteriorWaterProof,
                commonExteriorWastagePercentage: commonExteriorWastagePercentage,
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
                    const lengthNum = parseFeetInches(tile.length) || 0;
                    const breadthNum = parseFeetInches(tile.breadth) || 0;
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
            clientName: paintClientName ? paintClientName.label : null,
            date: currentDate,
            calculations,
        });
    }, [paintClientName, floors, currentDate, paintClientSNo]);
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
    const handleKeyDown = (floorIndex, tileIndex, event) => {
        if (event.key === 'Enter') {
            const { name, value } = event.target;
            const updatedFloors = [...interiorFloors];
            const tile = updatedFloors[floorIndex].tiles[tileIndex];
            if (name === "length" || name === "breadth" || name === "height") {
                tile[`${name}Input`] = value;
                const parsedValue = parseFeetInchesExpression(value);
                tile[name] = parsedValue;
            } else {
                tile[name] = value;
            }
            setInteriorFloors(updatedFloors);
        }
    };
    const handleExteriorKeyDown = (floorIndex, tileIndex, event) => {
        if (event.key === 'Enter') {
            const { name, value } = event.target;
            const updatedFloors = [...exteriorFloors];
            const tile = updatedFloors[floorIndex].tiles[tileIndex];
            if (name === "length" || name === "breadth" || name === "height") {
                tile[`${name}Input`] = value;
                const parsedValue = parseFeetInchesExpression(value);
                tile[name] = parsedValue;
            } else {
                tile[name] = value;
            }
            setExteriorFloors(updatedFloors);
        }
    };
    const handleInteriorTileChange = (floorIndex, tileIndex, event) => {
        const { name, value } = event.target;
        const updatedFloors = [...interiorFloors];
        updatedFloors[floorIndex].tiles[tileIndex][name] = value;
        if (name === "length" || name === "breadth") {
            setInteriorTableDimensions({
                ...interiorTableDimensions,
                [name]: value
            });
        }
        setInteriorFloors(updatedFloors);
    };
    const handleInteriorDeductionChange = (floorIndex, tileIndex) => {
        setInteriorFloors((prevFloors) => {
            if (!prevFloors[floorIndex] || !prevFloors[floorIndex].tiles[tileIndex]) {
                console.warn(`Invalid floor or tile index: Floor ${floorIndex}, Tile ${tileIndex}`);
                return prevFloors;
            }
            const input = deductionInputs[`${floorIndex}-${tileIndex}`] || "";
            const input1 = deductionRowWiseInputs[`${floorIndex}-${tileIndex}`];
            if (!input1) return prevFloors;
            const prevPrimer = prevFloors[floorIndex].tiles[tileIndex].primer;
            let wallDeductionInput = input.match(/Wall:\s*([\d.\sXx*+()]+)/)?.[1] || "";
            let ceilingDeductionInput = input.match(/Ceiling:\s*([\d.\sXx*+()]+)/)?.[1] || "";
            let filteredInput = [wallDeductionInput, ceilingDeductionInput].filter(Boolean).join(" + ");
            try {
                const formattedWallInput = wallDeductionInput.replace(/x|X/g, '*').replace(/,/g, '+');
                const formattedCeilingInput = ceilingDeductionInput.replace(/x|X/g, '*').replace(/,/g, '+');
                const wallDeductionArea = formattedWallInput ? evaluate(formattedWallInput) : 0;
                const ceilingDeductionArea = formattedCeilingInput ? evaluate(formattedCeilingInput) : 0;
                const bothDeductionArea = wallDeductionArea + ceilingDeductionArea;
                let result = 0;
                if (prevPrimer === "Wall") {
                    result = wallDeductionArea.toFixed(2);
                } else if (prevPrimer === "Ceiling") {
                    result = ceilingDeductionArea.toFixed(2);
                } else if (prevPrimer === "Both") {
                    result = bothDeductionArea.toFixed(2);
                }
                return prevFloors.map((floor, fIdx) => {
                    if (fIdx !== floorIndex) return floor;
                    return {
                        ...floor,
                        tiles: floor.tiles.map((tile, tIdx) => {
                            if (tIdx !== tileIndex) return tile;
                            const updatedTile = {
                                ...tile,
                                deductionArea: result,
                                deductionInput: input,
                                wallDeductionInputs: wallDeductionInput,
                                ceilingDeductionInputs: ceilingDeductionInput,
                                bothDeductionInputs: filteredInput,
                                wallDeductionArea,
                                ceilingDeductionArea,
                                bothDeductionArea
                            };
                            const rows = input1.split("\n").slice(0, 20);
                            rows.forEach((row, index) => {
                                updatedTile[`deduction${index + 1}`] = row;
                            });
                            for (let i = rows.length; i < 20; i++) {
                                updatedTile[`deduction${i + 1}`] = "";
                            }
                            return updatedTile;
                        }),
                    };
                });
            } catch (error) {
                console.error("Invalid calculation! Please check your input.", error);
                return prevFloors;
            }
        });
    };
    useEffect(() => {
        interiorFloors.forEach((floor, floorIndex) => {
            floor.tiles.forEach((tile, tileIndex) => {
                handleInteriorDeductionChange(floorIndex, tileIndex);
            });
        });
    }, [deductionInputs]);
    const handleExteriorDeductionChange = (floorIndex, tileIndex) => {
        const input = exteriorDeductionInputs[`${floorIndex}-${tileIndex}`];
        const input1 = exteriorDeductionRowWiseInputs[`${floorIndex}-${tileIndex}`];
        if (!input1) {
            return;
        }
        const rows = input1.split("\n").slice(0, 8);
        try {
            const formattedInput = input ? input.replace(/x|X/g, '*') : null;
            const result = formattedInput ? evaluate(formattedInput) : 0;
            const updatedFloors = [...exteriorFloors];
            rows.forEach((row, index) => {
                updatedFloors[floorIndex].tiles[tileIndex][`deduction${index + 1}`] = row;
            });
            for (let i = rows.length; i < 8; i++) {
                updatedFloors[floorIndex].tiles[tileIndex][`deduction${i + 1}`] = '';
            }
            updatedFloors[floorIndex].tiles[tileIndex].deductionArea = result;
            updatedFloors[floorIndex].tiles[tileIndex].deductionInput = input;
            setExteriorFloors(updatedFloors);
        } catch (error) {
            console.error('Invalid calculation! Please check your input.', error);
        }
    };
    useEffect(() => {
        exteriorFloors.forEach((floor, floorIndex) => {
            floor.tiles.forEach((tile, tileIndex) => {
                handleExteriorDeductionChange(floorIndex, tileIndex);
            });
        });
    }, [exteriorDeductionInputs]);
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
    const handleDeductionKeyPress = (floorIndex, tileIndex, e) => {
        if (e.key === 'Enter') {
            const input = e.target.value;
            try {
                const result = evaluate(input);
                const updatedFloors = [...exteriorFloors];
                updatedFloors[floorIndex].tiles[tileIndex].deductionArea = result;
                setExteriorFloors(updatedFloors);
            } catch (error) {
                alert('Invalid calculation! Please check your input.');
            }
        }
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
        setInteriorFloors(updatedInteriorFloors);
        setDeductionPopupState(updatedPopupState);
        setDeductionPopupData(updatedPopupData);
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
        const updatedPopupState = {};
        const updatedPopupData = {};
        Object.keys(exteriorDeductionPopupState).forEach((key) => {
            const [existingFloorIndex, tileIndex] = key.split('-').map(Number);
            if (existingFloorIndex > floorIndex) {
                const newKey = `${existingFloorIndex + 1}-${tileIndex}`;
                updatedPopupState[newKey] = exteriorDeductionPopupState[key];
                updatedPopupData[newKey] = exteriorDeductionPopupData[key];
            } else {
                updatedPopupState[key] = exteriorDeductionPopupState[key];
                updatedPopupData[key] = exteriorDeductionPopupData[key];
            }
        });
        updatedPopupState[`${floorIndex + 1}-0`] = false;
        updatedPopupData[`${floorIndex + 1}-0`] = [];
        setExteriorFloors(updatedExteriorFloors);
        setExteriorDeductionPopupState(updatedPopupState);
        setExteriorDeductionPopupData(updatedPopupData);
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
        setDeductionPopupState((prevPopupState) => ({
            ...prevPopupState,
            [`${interiorFloors.length}-0`]: false,
        }));
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
        setExteriorDeductionPopupState((prevPopupState) => ({
            ...prevPopupState,
            [`${exteriorFloors.length}-0`]: false,
        }));
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
    const deleteFloor = (floorIndex) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this floor?");
        if (confirmDelete) {
            const updatedInteriorFloors = [...interiorFloors];
            updatedInteriorFloors.splice(floorIndex, 1);
            let i = floorIndex;
            while (i < updatedInteriorFloors.length && (!updatedInteriorFloors[i] || !updatedInteriorFloors[i].floorName)) {
                updatedInteriorFloors.splice(i, 1);
            }
            setInteriorFloors(updatedInteriorFloors);
        }
    };
    const deleteExteriorFloor = (floorIndex) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this floor?");
        if (confirmDelete) {
            const updatedExteriorFloors = [...exteriorFloors];
            updatedExteriorFloors.splice(floorIndex, 1);
            let i = floorIndex;
            while (i < updatedExteriorFloors.length && (!updatedExteriorFloors[i] || !updatedExteriorFloors[i].floorName)) {
                updatedExteriorFloors.splice(i, 1);
            }
            setExteriorFloors(updatedExteriorFloors);
        }
    }
    const deleteAreaRow = (floorIndex, tileIndex, type) => {
        if (type === "interior") {
            const updatedInteriorFloors = [...interiorFloors];
            const floor = updatedInteriorFloors[floorIndex];
            floor.tiles.splice(tileIndex, 1);
            setInteriorFloors(updatedInteriorFloors);
        } else if (type === "exterior") {
            const updatedExteriorFloors = [...exteriorFloors];
            const floor = updatedExteriorFloors[floorIndex];
            floor.tiles.splice(tileIndex, 1);
            setExteriorFloors(updatedExteriorFloors);
        }
    };
    const handleFileChange = (selected) => {
        if (!selected) {
            setPaintSelectedFile(null);
            setSelectedFiles(null);
            setSelectedClientData({ calculations: [] });
            setInteriorFloors([]);
            setExteriorFloors([]);
            setCommonHeight("");
            setCommonPrimer("");
            setCommonPutty("");
            setCommonWallCoat("");
            setCommonWaterProof("");
            setCommonWastagePercentage("");
            setCommonCeilingCoat("");
            setCommonPaint("");
            setCommonPaintColor("");
            setCommonExteriorPutty("");
            setCommonExteriorWallCoat("");
            setCommonExteriorWastagePercentage("");
            setCommonExteriorWaterProof("");
            setCommonExteriorPaintColor("");
            setCommonExteriorPrimer("");
            setCommonExteriorCeilingCoat("");
            setCommonExteriorHeight("");
            setCommonExteriorPaint("");
            return;
        }
        setSelectedFiles(selected);
        const selectedClientData = fullData.find((calculation) => calculation.id === selected.value);
        console.log(fullData);
        setPaintSelectedFile(selected);
        if (selectedClientData) {
            const {
                commonHeight, commonPrimer, commonPutty, commonExteriorPutty, commonExteriorWallCoat,
                commonExteriorWastagePercentage, commonExteriorWaterProof, commonWallCoat, commonWastagePercentage,
                commonWaterProof, commonExteriorPaintColor, commonExteriorPrimer, commonPaint, commonPaintColor,
                commonCeilingCoat, commonExteriorCeilingCoat, commonExteriorHeight, commonExteriorPaint
            } = selectedClientData;
            setCommonHeight(commonHeight);
            setCommonPrimer(commonPrimer);
            setCommonPutty(commonPutty);
            setCommonWallCoat(commonWallCoat);
            setCommonWaterProof(commonWaterProof);
            setCommonWastagePercentage(commonWastagePercentage || "0");
            setCommonCeilingCoat(commonCeilingCoat);
            setSelectedClientData(selectedClientData);
            setCommonPaint(commonPaint);
            setCommonPaintColor(commonPaintColor);
            setCommonExteriorPutty(commonExteriorPutty);
            setCommonExteriorWallCoat(commonExteriorWallCoat);
            setCommonExteriorWastagePercentage(commonExteriorWastagePercentage || "0");
            setCommonExteriorWaterProof(commonExteriorWaterProof);
            setCommonExteriorPaintColor(commonExteriorPaintColor);
            setCommonExteriorPrimer(commonExteriorPrimer);
            setCommonExteriorCeilingCoat(commonExteriorCeilingCoat);
            setCommonExteriorHeight(commonExteriorHeight);
            setCommonExteriorPaint(commonExteriorPaint);
            let deductionData = {};
            let exteriorDeductionData = {};
            const seenFloors = new Set();
            const interiorData = selectedClientData.paintCalculations
                .filter((calculation) => calculation.paintTiles?.some((tile) => tile.type === "Interior"))
                .map((calculation, floorIndex) => {
                    const floorName = calculation.floorName || "";
                    const areaName = calculation.areaName || "";
                    const floorVisible = !seenFloors.has(floorName);
                    if (floorVisible) seenFloors.add(floorName);
                    return {
                        floorName: floorVisible ? floorName : null,
                        areaName: areaName,
                        tiles: calculation.paintTiles?.map((tile, tileIndex) => {
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
                                        qty: splitData[2] || '1',
                                        location: splitData[3] || '',
                                        thickness: splitData[4] || '0"',
                                        deductionThickness: splitData[5] || '',
                                        output: splitData[6] || ''
                                    };
                                }
                                return null;
                            }).filter(row => row !== null);
                            if (processedDeductions.length > 0) {
                                deductionData[`${floorIndex}-${tileIndex}`] = processedDeductions;
                            }
                            return {
                                length: tile.length || "",
                                lengthInput: tile.lengthInputs || "",
                                length1: tile.length1 || "",
                                length2: tile.length2 || "",
                                length3: tile.length3 || "",
                                length4: tile.length4 || "",
                                length5: tile.length5 || "",
                                length6: tile.length6 || "",
                                length7: tile.length7 || "",
                                length8: tile.length8 || "",
                                length9: tile.length9 || "",
                                length10: tile.length10 || "",
                                length11: tile.length11 || "",
                                length12: tile.length12 || "",
                                length13: tile.length13 || "",
                                length14: tile.length14 || "",
                                length15: tile.length15 || "",
                                length16: tile.length16 || "",
                                length17: tile.length17 || "",
                                length18: tile.length18 || "",
                                length19: tile.length19 || "",
                                length20: tile.length20 || "",
                                length21: tile.length21 || "",
                                length22: tile.length22 || "",
                                length23: tile.length23 || "",
                                length24: tile.length24 || "",
                                length25: tile.length25 || "",
                                length26: tile.length26 || "",
                                length27: tile.length27 || "",
                                length28: tile.length28 || "",
                                length29: tile.length29 || "",
                                length30: tile.length30 || "",
                                breadth: tile.breadth || "",
                                breadthInput: tile.breadthInputs || "",
                                height: tile.height || "0",
                                heightInput: tile.heightInputs || "",
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
                                deductionThickness: tile.deductionThickness || "",
                                deductionThicknessInputs: tile.deductionThicknessInputs || "",
                                deductionArea: tile.deductionArea || 0,
                                deductionInput: tile.deductionInput || "",
                                wastagePercentage: tile.wastagePercentage || 0,
                                selectedPaint: tile.selectedPaint || "",
                                selectedPaintColor: tile.selectedColorCode || "",
                                putty: tile.selectedPutty || "No",
                                primer: tile.selectedPrimer || "No",
                                WallCoat: tile.wallCoat || "No",
                                ceilingCoat: tile.ceilingCoat || "No",
                                waterproof: tile.selectedWaterProof || "No",
                            };
                        }) || [],
                    };
                });
            setInteriorFloors(interiorData);
            const seenFloors1 = new Set();
            const exteriorData = selectedClientData.paintCalculations
                .filter((calculation) => calculation.paintTiles?.some((tile) => tile.type === "Exterior"))
                .map((calculation, floorIndex) => {
                    const floorName = calculation.floorName || "";
                    const areaName = calculation.areaName || "";
                    const floorVisible = !seenFloors1.has(floorName);
                    if (floorVisible) seenFloors1.add(floorName);
                    return {
                        floorName: floorVisible ? floorName : null,
                        areaName: areaName,
                        tiles: calculation.paintTiles?.map((tile, tileIndex) => {
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
                                        qty: splitData[2] || '1',
                                        location: splitData[3] || '',
                                        thickness: splitData[4] || '0"',
                                        deductionThickness: splitData[5] || '',
                                        output: splitData[6] || ''
                                    };
                                }
                                return null;
                            }).filter(row => row !== null);
                            if (processedDeductions.length > 0) {
                                exteriorDeductionData[`${floorIndex}-${tileIndex}`] = processedDeductions;
                            }
                            return {
                                length: tile.length || "",
                                lengthInput: tile.lengthInputs || "",
                                length1: tile.length1 || "",
                                length2: tile.length2 || "",
                                length3: tile.length3 || "",
                                length4: tile.length4 || "",
                                length5: tile.length5 || "",
                                length6: tile.length6 || "",
                                length7: tile.length7 || "",
                                length8: tile.length8 || "",
                                length9: tile.length9 || "",
                                length10: tile.length10 || "",
                                length11: tile.length11 || "",
                                length12: tile.length12 || "",
                                length13: tile.length13 || "",
                                length14: tile.length14 || "",
                                length15: tile.length15 || "",
                                length16: tile.length16 || "",
                                length17: tile.length17 || "",
                                length18: tile.length18 || "",
                                length19: tile.length19 || "",
                                length20: tile.length20 || "",
                                length21: tile.length21 || "",
                                length22: tile.length22 || "",
                                length23: tile.length23 || "",
                                length24: tile.length24 || "",
                                length25: tile.length25 || "",
                                length26: tile.length26 || "",
                                length27: tile.length27 || "",
                                length28: tile.length28 || "",
                                length29: tile.length29 || "",
                                length30: tile.length30 || "",
                                breadth: tile.breadth || "0",
                                breadthInput: tile.breadthInputs || "",
                                height: tile.height || "0",
                                heightInput: tile.heightInputs || "",
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
                                deductionThickness: tile.deductionThickness || "",
                                deductionThicknessInputs: tile.deductionThicknessInputs || "",
                                wastagePercentage: tile.wastagePercentage || 0,
                                selectedPaint: tile.selectedPaint || "",
                                selectedPaintColor: tile.selectedColorCode || "",
                                putty: tile.selectedPutty || "No",
                                primer: tile.selectedPrimer || "No",
                                ceilingCoat: tile.ceilingCoat || "No",
                                waterproof: tile.selectedWaterProof || "No",
                                WallCoat: tile.wallCoat || 'No',
                            };
                        }) || [],
                    };
                });
            setExteriorFloors(exteriorData);
            setDeductionPopupData((prevData) => ({
                ...prevData,
                ...deductionData,
            }));
            setExteriorDeductionPopupData((prevData) => ({
                ...prevData,
                ...exteriorDeductionData,
            }));
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
        if (paintClientName && paintSelectedFile) {
            const filteredData = ceilingCoatData.filter(coat =>
                coat.clientName === paintClientName.label && coat.fileName === paintSelectedFile.label
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
    }, [paintClientName, paintSelectedFile, ceilingCoatData]);
    const handleCeilingCommonWastage = (value) => {
        setCeilingCommonWastage(value);
        const updatedWastages = tableData.map(() => value);
        setWastageValues(updatedWastages)
    };
    useEffect(() => {
        if (paintClientName && paintSelectedFile) {
            const filteredData = otherTable.filter(
                other =>
                    other.clientName === paintClientName.label &&
                    other.fileName === paintSelectedFile.label
            );
            const transformedData = filteredData.map(other => ({
                paintItem: other.paintType || '',
                height: other.height || '',
                deduction: other.deductionArea || '',
                wastage: other.wastage || 0,
                calculatedFloorAreas: other.calculatedFloorAreas || [{ floorName: '', totalArea: 0, totalOrderQtys: 0 }],
                calculatedAreas: other.calculatedAreas || 0,
                selectedPaint: other.paintName || '',
                selectedPaintColor: other.paintColor || '',
                calculatedOrderQtys: other.calculatedOrderQtys || 0,
            }));
            setTilesData(transformedData);
        }
    }, [paintClientName, paintSelectedFile, otherTable]);
    const handleFileChanges = (selected) => {
        if (!selected) {
            setSelectedFiles(null);
            setFloors([]);
            return;
        }
        const selectedClientDatas = fullDatas.find(calculation => calculation.id === selected.value);
        setSelectedFiles(selected);
        if (selectedClientDatas) {
            const seenFloors = new Set();
            const newFloorsData = [];
            selectedClientDatas.calculations.forEach(calc => {
                const floorName = calc.floorName || 'No floor name available';
                let areaName = calc.areaName || 'No area name available';
                const filteredTiles = calc.tiles.filter(tile => tile.type === "Floor Tile");
                if (filteredTiles.length === 0) {
                    areaName = null;
                }
                const floorVisible = !seenFloors.has(floorName);
                seenFloors.add(floorName);
                filteredTiles.forEach((tile, tileIndex) => {
                    newFloorsData.push({
                        floorName: tileIndex === 0 && floorVisible ? floorName : null,
                        areaName: areaName,
                        tiles: [
                            {
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
                            }
                        ]
                    });
                });
                if (filteredTiles.length === 0) {
                    newFloorsData.push({
                        floorName: floorVisible ? floorName : null,
                        areaName: null,
                        tiles: []
                    });
                }
            });
            setInteriorFloors(newFloorsData);
        } else {
            setInteriorFloors([]);
        }
    };
    const generateSummary = () => {
        const summaryMap = {};
        interiorFloors.forEach(floor => {
            floor.tiles.forEach(tile => {
                const length = parseFeetInches(tile.length);
                const breadth = parseFeetInches(tile.breadth);
                const height = parseFeetInches(tile.height);
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
                const length = parseFeetInches(tile.length);
                const breadth = parseFeetInches(tile.breadth);
                const height = parseFeetInches(tile.height);
                const deductionArea = Number(tile.deductionArea || 0);
                const totalOrderedTile = ((length * height)) - deductionArea;
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
    const generateSummaryWithFloorNameAndArea = useCallback(() => {
        const tempSummary = {};
        let lastValidFloorName = null;
        interiorFloors.forEach(floor => {
            const currentFloorName = floor.floorName || lastValidFloorName || "No Floor Name";
            if (floor.floorName) {
                lastValidFloorName = floor.floorName;
            }
            floor.tiles.forEach(tile => {
                const length = parseFeetInches(tile.length || 0);
                const breadth = parseFeetInches(tile.breadth || 0);
                const height = parseFeetInches(tile.height || 0);
                const deductionArea = Number(tile.deductionArea || 0);
                const totalOrderedTile = ((length * height) * 2) + ((breadth * height) * 2) - deductionArea;
                const selectedPaint = paintVariants.find(variant => variant.paintName === tile.selectedPaint);
                const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                const wastagePercentage = Number(tile.wastagePercentage || 0);
                const wastage = wastagePercentage / 100;
                const orderQty = totalOrderedTile * (1 + wastage) / paintCoverBySqft;
                const paintKey = `${currentFloorName}-${floor.areaName}-${tile.selectedPaint}-${tile.selectedPaintColor}`;
                const paintDataItem = paintData.find(paint => paint.paintColor === tile.selectedPaintColor);
                const selectedPaintColorImage = paintDataItem?.image || "/path/to/default-image.jpg";
                if (tempSummary[paintKey]) {
                    tempSummary[paintKey].orderQty = Math.round((tempSummary[paintKey].orderQty + orderQty) * 100) / 100;
                    tempSummary[paintKey].area = (parseFloat(tempSummary[paintKey].area) + totalOrderedTile).toFixed(2);
                } else {
                    tempSummary[paintKey] = {
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
        });
        const mergedSummary = Object.values(tempSummary).map(item => ({
            floorName: item.floorName,
            areaName: item.areaName,
            paintName: item.paintName,
            paintColor: item.paintColor,
            area: item.area,
            orderQty: item.orderQty.toFixed(2),
            paintColorImage: item.paintColorImage,
        }));
        return mergedSummary;
    }, [paintData, interiorFloors, paintVariants]);
    const detailedFloorSummary = useCallback(() => {
        const detailedSummary = generateSummaryWithFloorNameAndArea();
        const floorSummary = calculateFloorWiseSummary();
        const detailedResults = [
            ...detailedSummary.map(item => ({
                floorName: item.floorName,
                areaName: item.areaName || "No Area Name",
                paintName: item.paintName,
                paintColor: item.paintColor,
                area: parseFloat(item.area).toFixed(2),
                orderQty: parseFloat(item.orderQty).toFixed(2) + "L",
                paintColorImage: item.paintColorImage || "/path/to/default-image.jpg",
            })),
            ...floorSummary.map(floor => {
                const paintDataItem = paintData.find(paint => paint.paintColor === floor.paintColor);
                const selectedPaintColorImage = paintDataItem?.image || "/path/to/default-image.jpg";
                return {
                    floorName: floor.floorName,
                    areaName: floor.areaName || "No Area Name",
                    paintName: floor.paintName,
                    paintColor: floor.paintColor,
                    area: floor.area.toFixed(2),
                    orderQty: floor.orderQty.toFixed(2) + "L",
                    paintColorImage: selectedPaintColorImage || "/path/to/default-image.jpg",
                };
            }),
        ];
        return detailedResults;
    }, [paintData, interiorFloors, paintVariants, selectedPaintNames, selectedPaintColors]);
    const combinedFloorSummary = useCallback(() => {
        const combinedMap = {};
        const detailedSummary = generateSummaryWithFloorNameAndArea();
        detailedSummary.forEach(item => {
            const paintKey = `${item.floorName}-${item.paintName}-${item.paintColor}`;
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
            const paintKey = `${floor.floorName}-${floor.paintName}-${floor.paintColor}`;
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
                    area: floor.area.toFixed(2),
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
    }, [
        paintData,
        interiorFloors,
        paintVariants,
        selectedPaintNames,
        selectedPaintColors,
        wastageValues,
        tableData,
    ]);
    useEffect(() => {
        const summary = combinedFloorSummary();
        setSummaryData(summary);
    }, [combinedFloorSummary]);
    const combinedPaintSummary = useCallback(() => {
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
                combinedMap[paintKey].floorNames.push(floor.floorName);
            } else {
                combinedMap[paintKey] = {
                    paintName: floor.paintName,
                    paintColor: floor.paintColor,
                    area: floor.area.toFixed(2),
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
    }, [
        paintData,
        interiorFloors,
        paintVariants,
        selectedPaintNames,
        selectedPaintColors,
        wastageValues,
        tableData,
    ]);
    const exteriorGenerateSummaryWithFloorName = useCallback(() => {
        const tempSummary = {};
        let lastValidFloorName = null;
        exteriorFloors.forEach(floor => {
            const currentFloorName = floor.floorName || lastValidFloorName || "No Floor Name";
            if (floor.floorName) {
                lastValidFloorName = floor.floorName;
            }
            floor.tiles.forEach(tile => {
                const length = parseFeetInches(tile.length || 0);
                const breadth = parseFeetInches(tile.breadth || 0);
                const height = parseFeetInches(tile.height || 0);
                const deductionArea = Number(tile.deductionArea || 0);
                const totalOrderedTile = (length * height) - deductionArea;
                const selectedPaint = paintVariants.find(variant => variant.paintName === tile.selectedPaint);
                const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                const wastagePercentage = Number(tile.wastagePercentage);
                const wastage = wastagePercentage / 100;
                const orderQty = totalOrderedTile * (1 + wastage) / paintCoverBySqft;
                const paintKey = `${currentFloorName}-${floor.areaName}-${tile.selectedPaint}-${tile.selectedPaintColor}`;
                const paintDataItem = paintData.find(paint => paint.paintColor === tile.selectedPaintColor);
                const selectedPaintColorImage = paintDataItem?.image || "/path/to/default-image.jpg";
                if (tempSummary[paintKey]) {
                    tempSummary[paintKey].orderQty = Math.round((tempSummary[paintKey].orderQty + orderQty) * 100) / 100;
                    tempSummary[paintKey].area = (parseFloat(tempSummary[paintKey].area) + totalOrderedTile).toFixed(2);
                } else {
                    tempSummary[paintKey] = {
                        floorName: currentFloorName,
                        areaName: floor.areaName || "No Area Name",
                        paintName: tile.selectedPaint || "No Paint",
                        paintColor: tile.selectedPaintColor || "No Color",
                        area: totalOrderedTile.toFixed(2),
                        orderQty: Math.round(orderQty * 100) / 100,
                        paintColorImage: selectedPaintColorImage,
                    };
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
    const handleCommonPaintNameChange = (value) => {
        setCommonPaintName(value);
        const updatedPaintNames = tableData.map(() => value);
        setSelectedPaintNames(updatedPaintNames);
    };
    const handleCommonPaintColorChanges = (value) => {
        setCommonPaintColors(value);
        const updatedPaintColors = tableData.map(() => value);
        setSelectedPaintColors(updatedPaintColors);
    };
    useEffect(() => {
        const summary = exteriorGenerateSummaryWithFloorName();
        setSummaryDatas(summary);
    }, [paintData, exteriorFloors, exteriorGenerateSummaryWithFloorName]);
    const [activeTab, setActiveTab] = useState("interior");
    let displayIndex = 1;
    const sortedPaintSiteOptions = siteOptions.sort((a, b) =>
        a.label.localeCompare(b.label)
    );
    const reversedFileOptions = [...filteredFileOptions].reverse();
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    const extractFloorData = () => {
        let lastFloorName = "";
        const extractedData = interiorFloors.map((floor) => {
            const floorName = floor.floorName && floor.floorName.trim() !== "" ? floor.floorName : lastFloorName || "No Floor Name";
            lastFloorName = floorName;
            const floorData = {
                floorName: floorName,
                tiles: floor.tiles.map((tile) => ({
                    length: tile.length || 0,
                    breadth: tile.breadth || 0,
                    putty: tile.putty || "No",
                    primer: tile.primer || "No",
                    waterproof: tile.waterproof || "No",
                })),
            };
            return floorData;
        });
        return extractedData;
    };
    const processTileData = () => {
        const extractedFloorData = extractFloorData();
        if (!extractedFloorData || !extractedFloorData.length) {
            console.error("Extracted floor data is undefined or empty.");
            return;
        }
        tilesData.forEach((tileData, tileIndex) => {
            const selectedPaint = paintVariants.find(
                (variant) => variant.paintName === tileData.selectedPaint
            );
            const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
            const selectedPaintItem = paintItems.find((item) => item.paintItem === tileData.paintItem);
            const formula = selectedPaintItem?.formulas || null;
            const floorWiseAreas = extractedFloorData.map((floor) => {
                let floorTotalArea = 0;
                floor.tiles.forEach((tile) => {
                    const putty = tile.putty;
                    const primer = tile.primer;
                    const waterProof = tile.waterproof;
                    const length = parseFeetInches(tile.length) || 0;
                    const breadth = parseFeetInches(tile.breadth) || 0;
                    const height = parseFeetInches(tile.height) || 0;
                    const deduction = parseFloat(tileData.deduction) || 0;
                    const paintItem = tileData.paintItem;
                    const area = calculateArea(length, breadth, height, deduction, formula, putty, primer, waterProof, paintItem);
                    const numericArea = parseFloat(area);
                    if (!isNaN(numericArea)) {
                        floorTotalArea += numericArea;
                    }
                });
                return {
                    floorName: floor.floorName,
                    totalArea: Math.floor(floorTotalArea),
                };
            });
            tilesData[tileIndex].calculatedFloorAreas = floorWiseAreas;
            const totalCalculatedArea = floorWiseAreas.reduce((sum, floor) => sum + floor.totalArea, 0);
            tilesData[tileIndex].calculatedAreas = totalCalculatedArea;
            const wastage = parseFloat(tileData.wastage) || 0;
            const wastages = totalCalculatedArea * (wastage / 100);
            const orderQty = (totalCalculatedArea + wastages) / paintCoverBySqft;
            tilesData[tileIndex].calculatedOrderQtys = parseFloat(orderQty.toFixed(2));
        });
    };
    processTileData();
    const groupAndSumData = (tilesData) => {
        const groupedData = {};
        tilesData.forEach((tile) => {
            tile.calculatedFloorAreas.forEach((floor) => {
                if (floor.totalArea === 0) {
                    return;
                }
                const selectedPaint = paintVariants.find(
                    (variant) => variant.paintName === tile.selectedPaint
                );
                const wastage = parseFloat(tile.wastage) || 0;
                const wastages = floor.totalArea * (wastage / 100);
                const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                const key = `${floor.floorName}-${tile.paintItem}-${tile.selectedPaint}-${tile.selectedPaintColor}`;
                if (!groupedData[key]) {
                    groupedData[key] = {
                        floorName: floor.floorName,
                        paintType: tile.paintItem,
                        productVariant: tile.selectedPaint,
                        colorCode: tile.selectedPaintColor,
                        totalArea: 0,
                        totalOrderQty: 0,
                    };
                }
                groupedData[key].totalArea += floor.totalArea;
                const orderQty = (floor.totalArea + wastages) / paintCoverBySqft;
                groupedData[key].totalOrderQty += orderQty;
            });
        });
        return Object.values(groupedData);
    };
    const extractPuttyBillData = () => {
        let lastFloorName = "";
        const groupedData = {};
        const totals = {
            overallArea: 0,
            floorAreas: {},
            areaAmounts: {},
        };
        interiorFloors.forEach((floor) => {
            if (floor.floorName && floor.floorName.trim() !== "") {
                lastFloorName = floor.floorName;
            }
            floor.tiles.forEach((tile) => {
                const commonData = {
                    floorName: lastFloorName,
                    areaName: floor.areaName || "",
                    length: tile.length || "",
                    breadth: tile.breadth || "",
                    height: tile.height || "",
                };
                function formatDeductionInput(deductionInput) {
                    return deductionInput
                        .replace(/\(\((\d+(\.\d+)?\s*[Xx]\s*\d+(\.\d+)?)\s*\)\s*x\s*1\)/g, "($1)")
                        .replace(/\s+/g, "")
                        .replace(/[X]/g, "x");
                }
                const deductionShortInputs = formatDeductionInput(tile.deductionInput);
                const rows = [];
                if (tile.putty === "No") {
                    rows.push({ ...commonData, description: "No Putty" });
                } else if (tile.putty === "Wall") {
                    for (let i = 1; i <= 4; i++) {
                        rows.push({ ...commonData, description: `Wall ${i}` });
                    }
                } else if (tile.putty === "Ceiling") {
                    rows.push({ ...commonData, description: "Ceiling" });
                } else if (tile.putty === "Both") {
                    for (let i = 1; i <= 4; i++) {
                        rows.push({ ...commonData, description: `Wall ${i}` });
                    }
                    rows.push({ ...commonData, description: "Ceiling" });
                }
                rows.push({
                    ...commonData,
                    description: "Additional",
                    measurement: tile.deductionThicknessInputs || "",
                    area: tile.deductionThickness || ""
                });
                if (tile.putty !== "No") {
                    rows.push({
                        ...commonData,
                        description: "Deduction",
                        area: 0,
                        deductionArea: tile.bothDeductionArea || 0,
                        measurement: deductionShortInputs || "",
                    });
                }
                let areaAmountSum = 0;
                rows.forEach((row) => {
                    if (!groupedData[row.floorName]) groupedData[row.floorName] = {};
                    if (!groupedData[row.floorName][row.areaName])
                        groupedData[row.floorName][row.areaName] = [];
                    let area = 0;
                    if (tile.putty !== "No") {
                        area = (() => {
                            if (row.description === "Wall 3" || row.description === "Wall 4") {
                                return (parseFeetInches(row.breadth) * parseFeetInches(row.height)).toFixed(2);
                            }
                            if (row.description.includes("Wall")) {
                                return (parseFeetInches(row.length) * parseFeetInches(row.height)).toFixed(2);
                            }
                            if (row.description === "Ceiling") {
                                return (parseFeetInches(row.length) * parseFeetInches(row.breadth)).toFixed(2);
                            }
                            return 0;
                        })();
                    }
                    const amount =
                        row.description === "Total Area"
                            ? ((totals.floorAreas[`${lastFloorName}-${floor.areaName}`] || 0) * puttyRate).toFixed(2)
                            : 0;
                    const rowData = {
                        ...row,
                        measurement: row.description === "Deduction"
                            ? deductionShortInputs || ""
                            : row.description.includes("Wall")
                                ? `${(row.description === "Wall 3" || row.description === "Wall 4") ? row.breadth : row.length} × ${row.height}`
                                : row.description === "Ceiling"
                                    ? `${row.length} × ${row.breadth}`
                                    : row.description === "Additional" ? tile.deductionThicknessInputs : "",
                        area: row.description === "Deduction" ? 0 : row.description === "Additional" ? tile.deductionThickness : area,
                        deductionArea: row.description === "Deduction" ? row.deductionArea : 0,
                        netArea: 0,
                        rate: row.description === "Total Area" ? puttyRate : 0,
                        amount,
                    };
                    groupedData[row.floorName][row.areaName].push(rowData);
                    if (tile.putty !== "No" && row.description !== "Deduction") {
                        const netArea = parseFloat(area) || 0;
                        if (!totals.floorAreas[row.floorName]) {
                            totals.floorAreas[row.floorName] = 0;
                        }
                        if (!totals.floorAreas[`${row.floorName}-${row.areaName}`]) {
                            totals.floorAreas[`${row.floorName}-${row.areaName}`] = 0;
                        }
                        totals.floorAreas[row.floorName] += netArea;
                        totals.floorAreas[`${row.floorName}-${row.areaName}`] += netArea;
                        totals.overallArea += netArea;
                        if (row.description === "Total Area") {
                            areaAmountSum += parseFloat(amount) || 0;
                        }
                    }
                });
                totals.areaAmounts[`${lastFloorName}-${floor.areaName}`] = areaAmountSum;
                if (groupedData[lastFloorName][floor.areaName]) {
                    const wallAreaWithThickness =
                        totals.floorAreas[`${lastFloorName}-${floor.areaName}`] + (parseFloat(tile.deductionThickness) || 0);
                    const deductionValue = tile.putty === "No"
                        ? 0
                        : tile.putty === "Wall"
                            ? tile.wallDeductionArea || 0
                            : tile.putty === "Ceiling"
                                ? tile.ceilingDeductionArea || 0
                                : tile.putty === "Both"
                                    ? tile.bothDeductionArea || 0
                                    : 0;
                    groupedData[lastFloorName][floor.areaName].push({
                        floorName: lastFloorName,
                        areaName: floor.areaName || "",
                        description: "Total Area",
                        measurement: "",
                        area: tile.putty === "No"
                            ? 0
                            : wallAreaWithThickness,
                        deductionArea: tile.putty === "No"
                            ? 0
                            : deductionValue,
                        netArea: tile.putty === "No"
                            ? 0
                            : (
                                wallAreaWithThickness -
                                (deductionValue || 0)
                            ).toFixed(2),
                        rate: tile.putty === "No" ? 0 : puttyRate,
                        amount: tile.putty === "No"
                            ? 0
                            : ((wallAreaWithThickness -
                                (deductionValue || 0)) * puttyRate).toFixed(2),
                        style: { fontWeight: "bold" },
                    });
                }
            });
        });
        generatePDF(groupedData);
    };
    const extractExteriorPuttyBillData = () => {
        let lastFloorName = "";
        const groupedData = {};
        const totals = {
            overallArea: 0,
            floorAreas: {},
            areaAmounts: {},
        };
        exteriorFloors.forEach((floor) => {
            if (floor.floorName && floor.floorName.trim() !== "") {
                lastFloorName = floor.floorName;
            }
            if (!groupedData[lastFloorName]) groupedData[lastFloorName] = {};
            floor.tiles.forEach((tile) => {
                let areaAmountSum = 0;
                let additionalArea = 0;
                let deductionArea = 0;
                let areaGroup = {};
                for (let i = 1; i <= 35; i++) {
                    let key = `length${i}`;
                    if (!tile[key]) continue;
                    const values = tile[key].split(",");
                    if (values.length < 4) continue;
                    let description = values[0]?.trim();
                    let length = parseFeetInches(values[1]) || 0;
                    let lengths = values[1] || 0;
                    let qty = parseFloat(values[2]) || 0;
                    let height = parseFeetInches(tile.height) || 0;
                    let heights = tile.height || 0;
                    let area = ((length * qty) * height).toFixed(2);
                    let areaName = floor.areaName || "Unknown Area";
                    const rowData = {
                        floorName: lastFloorName,
                        areaName,
                        description,
                        measurement: `(${lengths}x${qty})×${heights}`,
                        area,
                        deductionArea: 0,
                        netArea: 0,
                        rate: 0,
                        amount: 0,
                    };
                    if (!groupedData[lastFloorName][areaName]) groupedData[lastFloorName][areaName] = [];
                    groupedData[lastFloorName][areaName].push(rowData);
                    totals.overallArea += parseFloat(area);
                    totals.floorAreas[lastFloorName] = (totals.floorAreas[lastFloorName] || 0) + parseFloat(area);
                    totals.floorAreas[`${lastFloorName}-${areaName}`] =
                        (totals.floorAreas[`${lastFloorName}-${areaName}`] || 0) + parseFloat(area);
                    areaAmountSum += parseFloat(rowData.amount);
                    if (description.toLowerCase().includes("additional")) {
                        additionalArea += parseFloat(area);
                    } else if (description.toLowerCase().includes("deduction")) {
                        deductionArea += parseFloat(area);
                    }
                }
                if (!groupedData[lastFloorName][floor.areaName]) groupedData[lastFloorName][floor.areaName] = [];
                groupedData[lastFloorName][floor.areaName].push({
                    floorName: lastFloorName,
                    areaName: floor.areaName || "",
                    description: "Additional ",
                    measurement: tile.putty !== "No" ? tile.deductionThicknessInputs : "",
                    area: tile.putty !== "No" ? tile.deductionThickness : "",
                    deductionArea: 0,
                    netArea: 0,
                    rate: 0,
                    amount: 0,
                    style: { fontWeight: "bold", color: "green" },
                });
                groupedData[lastFloorName][floor.areaName].push({
                    floorName: lastFloorName,
                    areaName: floor.areaName || "",
                    description: "Deduction",
                    measurement: tile.deductionInput,
                    area: 0,
                    deductionArea: tile.deductionArea,
                    netArea: 0,
                    rate: 0,
                    amount: 0,
                    style: { fontWeight: "bold", color: "red" },
                });
                groupedData[lastFloorName][floor.areaName].push({
                    floorName: lastFloorName,
                    areaName: floor.areaName || "",
                    description: "Total Area",
                    measurement: "",
                    area: (
                        (totals.floorAreas[`${lastFloorName}-${floor.areaName}`] || 0) +
                        (parseFloat(tile.deductionThickness) || 0)
                    ).toFixed(2),
                    deductionArea: tile.deductionArea,
                    netArea: (
                        (totals.floorAreas[`${lastFloorName}-${floor.areaName}`] || 0) +
                        (parseFloat(tile.deductionThickness) || 0) -
                        (tile.deductionArea || 0)
                    ).toFixed(2),
                    rate: exteriorPuttyRate,
                    amount: (
                        (
                            (totals.floorAreas[`${lastFloorName}-${floor.areaName}`] || 0) +
                            (parseFloat(tile.deductionThickness) || 0) -
                            (tile.deductionArea || 0)
                        ) * exteriorPuttyRate
                    ).toFixed(2),
                    style: { fontWeight: "bold" },
                });
                totals.areaAmounts[`${lastFloorName}-${floor.areaName}`] = areaAmountSum;
            });
        });
        generateExteriorPuttyPDF(groupedData);
    };
    const extractPaintBillData = () => {
        let lastFloorName = "";
        const groupedData = {};
        const totals = {
            overallArea: 0,
            floorAreas: {},
            areaAmounts: {},
        };
        interiorFloors.forEach((floor) => {
            if (floor.floorName && floor.floorName.trim() !== "") {
                lastFloorName = floor.floorName;
            }
            floor.tiles.forEach((tile) => {
                const commonData = {
                    floorName: lastFloorName,
                    areaName: floor.areaName || "",
                    length: tile.length || "",
                    breadth: tile.breadth || "",
                    height: tile.height || "",
                };
                const rows = [];
                if (tile.primer === "No") {
                    rows.push({ ...commonData, description: "No Primer" });
                } else if (tile.primer === "Wall") {
                    for (let i = 1; i <= 4; i++) {
                        rows.push({ ...commonData, description: `Wall ${i}` });
                    }
                } else if (tile.primer === "Ceiling") {
                    rows.push({ ...commonData, description: "Ceiling" });
                } else if (tile.primer === "Both") {
                    for (let i = 1; i <= 4; i++) {
                        rows.push({ ...commonData, description: `Wall ${i}` });
                    }
                    rows.push({ ...commonData, description: "Ceiling" });
                }
                function formatDeductionInput(deductionInput) {
                    if (!deductionInput) return "";
                    return deductionInput
                        .replace(/\(\((\d+(\.\d+)?\s*[Xx]\s*\d+(\.\d+)?)\s*\)\s*x\s*1\)/g, "($1)")
                        .replace(/\s+/g, "")
                        .replace(/[X]/g, "x");
                }
                const deductionShortInputs = formatDeductionInput(tile?.deductionInput);
                rows.push({ ...commonData, description: "Additional" });
                if (tile.primer !== "No") {
                    rows.push({
                        ...commonData,
                        description: "Deduction",
                        area: 0,
                        deductionArea: tile.bothDeductionArea || 0,
                        measurement: deductionShortInputs || "",
                    });
                }
                let areaAmountSum = 0;
                rows.forEach((row) => {
                    if (!groupedData[row.floorName]) groupedData[row.floorName] = {};
                    if (!groupedData[row.floorName][row.areaName])
                        groupedData[row.floorName][row.areaName] = [];

                    let area = 0;
                    if (tile.primer !== "No") {
                        area = (() => {
                            if (row.description === "Wall 3" || row.description === "Wall 4") {
                                return (parseFeetInches(row.breadth) * parseFeetInches(row.height)).toFixed(2);
                            }
                            if (row.description.includes("Wall")) {
                                return (parseFeetInches(row.length) * parseFeetInches(row.height)).toFixed(2);
                            }
                            if (row.description === "Ceiling") {
                                return (parseFeetInches(row.length) * parseFeetInches(row.breadth)).toFixed(2);
                            }
                            return 0;
                        })();
                    }
                    const amount =
                        row.description === "Primer"
                            ? ((totals.floorAreas[`${lastFloorName}-${floor.areaName}`] || 0) * primerRate).toFixed(2)
                            : 0;
                    const rowData = {
                        ...row,
                        measurement: row.description === "Deduction"
                            ? deductionShortInputs || ""
                            : row.description.includes("Wall")
                                ? `${(row.description === "Wall 3" || row.description === "Wall 4") ? row.breadth : row.length} × ${row.height}`
                                : row.description === "Ceiling"
                                    ? `${row.length} × ${row.breadth}`
                                    : row.description === "Additional" ? tile.deductionThicknessInputs : "",
                        area: row.description === "Deduction" ? 0 : row.description === "Additional" ? tile.deductionThickness : area,
                        deductionArea: row.description === "Deduction" ? row.deductionArea : 0,
                        netArea: 0,
                        rate: row.description === "Primer" ? primerRate : 0,
                        amount,
                    };
                    groupedData[row.floorName][row.areaName].push(rowData);
                    if (tile.primer !== "No" && row.description !== "Deduction") {
                        const netArea = parseFloat(area) || 0;
                        if (!totals.floorAreas[row.floorName]) {
                            totals.floorAreas[row.floorName] = 0;
                        }
                        if (!totals.floorAreas[`${row.floorName}-${row.areaName}`]) {
                            totals.floorAreas[`${row.floorName}-${row.areaName}`] = 0;
                        }
                        totals.floorAreas[row.floorName] += netArea;
                        totals.floorAreas[`${row.floorName}-${row.areaName}`] += netArea;
                        totals.overallArea += netArea;
                        if (row.description === "Primer") {
                            areaAmountSum += parseFloat(amount) || 0;
                        }
                    }
                });
                totals.areaAmounts[`${lastFloorName}-${floor.areaName}`] = areaAmountSum;
                if (groupedData[lastFloorName][floor.areaName]) {
                    function formatDeductionInput(deductionInput) {
                        if (!deductionInput) return "";
                        return deductionInput
                            .replace(/\(\((\d+(\.\d+)?\s*[Xx]\s*\d+(\.\d+)?)\s*\)\s*x\s*1\)/g, "($1)")
                            .replace(/\s+/g, "")
                            .replace(/[X]/g, "x");
                    }
                    const floorArea = parseFloat(totals.floorAreas[`${lastFloorName}-${floor.areaName}`]) || 0;
                    const deductionThickness = parseFloat(tile.deductionThickness) || 0;
                    const primerArea = tile.primer === "No" ? 0 : (floorArea + deductionThickness).toFixed(2);
                    const primerNetArea = tile.primer === "No"
                        ? 0
                        : (primerArea - (tile.deductionArea || 0)).toFixed(2);
                    const primerAmount = tile.primer === "No"
                        ? 0
                        : (primerNetArea * primerRate).toFixed(2);
                    groupedData[lastFloorName][floor.areaName].push({
                        floorName: lastFloorName,
                        areaName: floor.areaName || "",
                        description: "Primer",
                        measurement: primerArea === 0 || primerArea === "0.00"
                            ? ""
                            : tile.primer === "Wall"
                                ? formatDeductionInput(tile.wallDeductionInputs)
                                : tile.primer === "Ceiling"
                                    ? formatDeductionInput(tile.ceilingDeductionInputs)
                                    : tile.deductionInput,
                        area: primerArea === 0 || primerArea === "0.00" ? "" : primerArea,
                        deductionArea: primerArea === 0 || primerArea === "0.00" ? "" : tile.primer === "No" ? 0 : tile.deductionArea || 0,
                        netArea: primerArea === 0 || primerArea === "0.00" ? "" : primerNetArea,
                        CoatsCount: primerArea === 0 || primerArea === "0.00" ? "" : 1,
                        rate: primerArea === 0 || primerArea === "0.00" ? "" : tile.primer === "No" ? 0 : primerRate,
                        amount: primerArea === 0 || primerArea === "0.00" ? "" : primerAmount,
                        style: { fontWeight: "bold" },
                    });
                    let wallCoatArea = 0;
                    let ceilingCoatArea = 0;
                    if (tile.WallCoat !== "No") {
                        if (tile.height && tile.length && tile.breadth) {
                            let wall1 = parseFeetInches(tile.length) * parseFeetInches(tile.height);
                            let wall2 = parseFeetInches(tile.length) * parseFeetInches(tile.height);
                            let wall3 = parseFeetInches(tile.breadth) * parseFeetInches(tile.height);
                            let wall4 = parseFeetInches(tile.breadth) * parseFeetInches(tile.height);
                            wallCoatArea = ((wall1 + wall2 + wall3 + wall4) + deductionThickness).toFixed(2);
                        }
                    }
                    if (tile.WallCoat === "No") {
                        if (tile.height && tile.length && tile.breadth) {
                            wallCoatArea = 0;
                        }
                    }
                    if (tile.ceilingCoat !== "No") {
                        if (tile.height && tile.length && tile.breadth) {
                            let wall1 = parseFeetInches(tile.length) * parseFeetInches(tile.breadth);
                            ceilingCoatArea = (wall1).toFixed(2);
                        }
                    }
                    let wallCoatCount = tile.WallCoat === "2 Coat" ? 2 : 1;
                    let ceilingCoatCount = tile.ceilingCoat === "2 Coat" ? 2 : 1;
                    groupedData[lastFloorName][floor.areaName].push({
                        floorName: lastFloorName,
                        areaName: floor.areaName || "",
                        description: "Wall Coat",
                        measurement: wallCoatArea === 0 || wallCoatArea === "0.00" ? "" : formatDeductionInput(tile.wallDeductionInputs),
                        area: wallCoatArea === 0 || wallCoatArea === "0.00" ? "" : wallCoatArea,
                        deductionArea: wallCoatArea === 0 || wallCoatArea === "0.00" ? "" : tile.WallCoat === "No" ? 0 : tile.wallDeductionArea || 0,
                        netArea: wallCoatArea === 0 || wallCoatArea === "0.00" ? "" : tile.WallCoat === "No" ? 0 : (wallCoatArea - (tile.wallDeductionArea || 0)) * wallCoatCount,
                        CoatsCount: wallCoatArea === 0 || wallCoatArea === "0.00" ? "" : tile.WallCoat === "No" ? 0 : wallCoatCount,
                        rate: wallCoatArea === 0 || wallCoatArea === "0.00" ? "" : tile.WallCoat === "No" ? 0 : wallCoatRate,
                        amount: wallCoatArea === 0 || wallCoatArea === "0.00" ? "" : tile.WallCoat === "No" ? 0 : (((wallCoatArea - (tile.wallDeductionArea || 0)) * wallCoatCount) * wallCoatRate).toFixed(2),
                        style: { fontWeight: "bold" },
                    });
                    groupedData[lastFloorName][floor.areaName].push({
                        floorName: lastFloorName,
                        areaName: floor.areaName || "",
                        description: "Ceiling Coat",
                        measurement: ceilingCoatArea === 0 || ceilingCoatArea === "0.00" ? "" : formatDeductionInput(tile.ceilingDeductionInputs),
                        area: ceilingCoatArea === 0 || ceilingCoatArea === "0.00" ? "" : tile.ceilingCoat === "No" ? 0 : ceilingCoatArea,
                        deductionArea: ceilingCoatArea === 0 || ceilingCoatArea === "0.00" ? "" : tile.ceilingCoat === "No" ? 0 : tile.ceilingDeductionArea || 0,
                        netArea: ceilingCoatArea === 0 || ceilingCoatArea === "0.00" ? "" : tile.ceilingCoat === "No" ? 0 : (ceilingCoatArea - (tile.ceilingDeductionArea || 0)) * ceilingCoatCount,
                        CoatsCount: ceilingCoatArea === 0 || ceilingCoatArea === "0.00" ? "" : tile.ceilingCoat === "No" ? 0 : ceilingCoatCount,
                        rate: ceilingCoatArea === 0 || ceilingCoatArea === "0.00" ? "" : tile.ceilingCoat === "No" ? 0 : ceilingCoatRate,
                        amount: ceilingCoatArea === 0 || ceilingCoatArea === "0.00" ? "" : (((ceilingCoatArea - (tile.ceilingDeductionArea || 0)) * ceilingCoatCount) * ceilingCoatRate).toFixed(2),
                        style: { fontWeight: "bold" },
                    });
                }
            });
        });
        generatePaintBillPDF(groupedData);
    };
    const extractExteriorPaintBillData = () => {
        let lastFloorName = "";
        const groupedData = {};
        const totals = {
            overallArea: 0,
            floorAreas: {},
            areaAmounts: {},
        };
        exteriorFloors.forEach((floor) => {
            if (floor.floorName && floor.floorName.trim() !== "") {
                lastFloorName = floor.floorName;
            }
            if (!groupedData[lastFloorName]) groupedData[lastFloorName] = {};
            floor.tiles.forEach((tile) => {
                const commonData = {
                    floorName: lastFloorName,
                    areaName: floor.areaName || "",
                    length: tile.length || "",
                    breadth: tile.breadth || "",
                    height: tile.height || "",
                };
                if (!groupedData[lastFloorName][floor.areaName]) groupedData[lastFloorName][floor.areaName] = [];
                let areaAmountSum = 0;
                for (let i = 1; i <= 30; i++) {
                    let key = `length${i}`;
                    if (!tile[key]) continue;
                    const values = tile[key].split(",");
                    if (values.length < 4) continue;
                    let description = values[0]?.trim();
                    let length = parseFeetInches(values[1]) || 0;
                    let lengths = values[1] || 0;
                    let qty = parseFloat(values[2]) || 0;
                    let height = parseFeetInches(tile.height) || 0;
                    let heights = tile.height || 0;
                    let area = ((length * qty) * height).toFixed(2);
                    const rowData = {
                        ...commonData,
                        description,
                        measurement: `(${lengths}×${qty})×${heights}`,
                        area: description === "Deduction" ? 0 : description === "Additional" ? tile.deductionThickness : area,
                        deductionArea: description === "Deduction" ? tile.deductionArea : 0,
                        netArea: 0,
                        rate: description === "Primer" ? primerRate : 0,
                        amount: 0,
                    };
                    groupedData[lastFloorName][floor.areaName].push(rowData);
                    totals.overallArea += parseFloat(area);
                    totals.floorAreas[lastFloorName] = (totals.floorAreas[lastFloorName] || 0) + parseFloat(area);
                    totals.floorAreas[`${lastFloorName}-${floor.areaName}`] =
                        (totals.floorAreas[`${lastFloorName}-${floor.areaName}`] || 0) + parseFloat(area);
                    areaAmountSum += parseFloat(rowData.amount);
                }
                groupedData[lastFloorName][floor.areaName].push({
                    ...commonData,
                    description: "Additional",
                    measurement: tile.deductionThicknessInputs || "",
                    area: tile.deductionThickness || 0,
                    deductionArea: 0,
                    netArea: 0,
                    rate: 0,
                    amount: 0,
                    style: { fontWeight: "bold" },
                });
                groupedData[lastFloorName][floor.areaName].push({
                    ...commonData,
                    description: "Deduction",
                    measurement: tile.deductionInput || "",
                    area: 0,
                    deductionArea: tile.deductionArea || 0,
                    netArea: 0,
                    rate: 0,
                    amount: 0,
                    style: { fontWeight: "bold", color: "red" },
                });
                let primerArea = tile.primer === "No" ? 0 : totals.floorAreas[`${lastFloorName}-${floor.areaName}`].toFixed(2);
                let primerNetArea = tile.primer === "No"
                    ? 0
                    : (totals.floorAreas[`${lastFloorName}-${floor.areaName}`] - (tile.deductionArea || 0)).toFixed(2);
                let primerAmount = tile.primer === "No"
                    ? 0
                    : (primerNetArea * exteriorPrimerRate).toFixed(2);
                groupedData[lastFloorName][floor.areaName].push({
                    ...commonData,
                    description: "Primer",
                    area: primerArea,
                    deductionArea: tile.primer === "No" ? 0 : tile.deductionArea || 0,
                    netArea: primerNetArea,
                    CoatsCount: 1,
                    rate: tile.primer === "No" ? 0 : exteriorPrimerRate,
                    amount: primerAmount,
                    style: { fontWeight: "bold" },
                });
                let wallCoatArea = 0, ceilingCoatArea = 0;
                if (tile.WallCoat !== "No") {
                    for (let i = 1; i <= 30; i++) {
                        let key = `length${i}`;
                        if (!tile[key]) continue;
                        const values = tile[key].split(",");
                        if (values.length < 3) continue;
                        let length = parseFeetInches(values[1]) || 0;
                        let qty = parseFloat(values[2]) || 0;
                        let height = parseFeetInches(tile.height) || 0;
                        wallCoatArea += (length * qty * height);
                    }
                    wallCoatArea = wallCoatArea.toFixed(2);
                }
                if (tile.ceilingCoat !== "No") {
                    if (tile.height && tile.length && tile.breadth) {
                        ceilingCoatArea = (parseFeetInches(tile.length) * parseFeetInches(tile.breadth)).toFixed(2);
                    }
                }
                let wallCoatCount = tile.WallCoat === "2 Coat" ? 2 : 1;
                let ceilingCoatCount = tile.ceilingCoat === "2 Coat" ? 2 : 1;
                groupedData[lastFloorName][floor.areaName].push({
                    ...commonData,
                    description: "Wall Coat",
                    area: wallCoatArea,
                    deductionArea: tile.WallCoat === "No" ? 0 : tile.deductionArea || 0,
                    netArea: tile.WallCoat === "No" ? 0 : (wallCoatArea - tile.deductionArea) * wallCoatCount,
                    CoatsCount: tile.WallCoat === "No" ? 0 : wallCoatCount,
                    rate: tile.WallCoat === "No" ? 0 : exteriorWallCoatRate,
                    amount: tile.WallCoat === "No" ? 0 : (((wallCoatArea - tile.deductionArea) * wallCoatCount) * exteriorWallCoatRate).toFixed(2),
                    style: { fontWeight: "bold" },
                });
                groupedData[lastFloorName][floor.areaName].push({
                    ...commonData,
                    description: "Floor Coat",
                    area: tile.ceilingCoat === "No" ? 0 : ceilingCoatArea,
                    deductionArea: "",
                    netArea: tile.ceilingCoat === "No" ? 0 : ceilingCoatArea * ceilingCoatCount,
                    CoatsCount: tile.ceilingCoat === "No" ? 0 : ceilingCoatCount,
                    rate: tile.ceilingCoat === "No" ? 0 : exteriorCeilingCoatRate,
                    amount: (ceilingCoatArea * ceilingCoatCount) * exteriorCeilingCoatRate,
                    style: { fontWeight: "bold" },
                });
                totals.areaAmounts[`${lastFloorName}-${floor.areaName}`] = areaAmountSum;
            });
        });
        generateExteriorPaintBillPDF(groupedData);
    };
    const generatePDF = async (groupedData) => {
        const doc = new jsPDF();
        const formatDateForName = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        };
        const selectedDate = formatDateForName(date);
        const revisionCount = await getRevisionNumber(paintClientName.label);
        const revisionNumber = `R ${revisionCount}`;
        const fileType = 'IN-PUTTY';
        const siteName = paintClientName.label;
        const clientId = paintClientSNo || 0;
        const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
        if (paintSelectedFile && paintSelectedFile.label) {
            filename = `PBS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
        } else {
            filename = `PBS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
        }
        await postIncrement(fileLabel, fileType);
        const header = (doc) => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("PAINT BILLING SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFontSize(8);
            doc.text("INTERIOR PUTTY WORK", doc.internal.pageSize.width - 47.5, 41);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setFont("helvetica", "bold");
            doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
            doc.setFontSize(10);
            const tmsDate = `PBS IN-PUTTY WORK ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
                { content: `${floorName}`, colSpan: 6, styles: { halign: 'left', fontStyle: 'bold' } },
            ]);
            let areaIndex = 1;
            Object.keys(floorData).forEach((areaName) => {
                const areaSNo = areaIndex++;
                allTableRows.push([
                    { content: areaSNo, styles: { halign: 'center', fontStyle: 'bold', font: 'helvetica' } },
                    { content: `${areaName}`, colSpan: 6, styles: { halign: 'left', fontStyle: 'bold', font: 'helvetica' } },
                ]);
                const tableRows = floorData[areaName].map((row) => {
                    if (row.description === "Total Area") {
                        floorSum += row.amount || 0;
                    }
                    return row.description === "Deduction"
                        ? [
                            { content: "", styles: { halign: 'center' } },
                            row.description || "",
                            {
                                content: `${row.measurement || ""} ${row.area ? numberFormatter.format(row.area) : ""}`,
                                colSpan: 2,
                                styles: { halign: 'center' }
                            },
                            row.deductionArea === 0 ? "" : row.deductionArea,
                            row.netArea === 0 ? "" : numberFormatter.format(row.netArea),
                            row.rate === 0 ? "" : row.rate,
                            row.amount === 0 ? "" : currencyFormatter.format(row.amount),
                        ]
                        : [
                            { content: "", styles: { halign: 'center' } },
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
        const floorWiseTotals = Object.keys(groupedData).map((floorName) => {
            let totalAmount = 0;
            let totalArea = 0;
            Object.values(groupedData[floorName]).forEach((areaData) => {
                totalAmount += areaData.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0);
                totalArea += areaData.reduce((sum, row) => sum + parseFloat(row.netArea || 0), 0);
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
                1: { cellWidth: 24, halign: 'left' },
                2: { cellWidth: 30, halign: 'left' },
                3: { cellWidth: 18, halign: 'right' },
                4: { cellWidth: 22, halign: 'center' },
                5: { cellWidth: 20, halign: 'center' },
                6: { cellWidth: 22, halign: 'center' },
                7: { cellWidth: 32, halign: 'right' },
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
                if (data.row.index !== undefined && data.row.raw[1] === "Total Area") {
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });
        const totalsTableRows = [
            [
                { content: "", styles: {} },
                { content: "BILL SUMMARY", styles: { halign: "left", fontStyle: "bold" } },
                { content: "", styles: {} },
                { content: "", styles: {} },
                { content: "", styles: {} }
            ],
            ...floorWiseTotals.map((total, index) => [
                { content: String.fromCharCode(65 + index), styles: { halign: "center", fontStyle: "bold" } },
                { content: `Total Amount Of ${total.floorName}`, styles: { halign: "left", fontStyle: "bold" } },
                { content: total.totalArea, styles: { halign: "center", fontStyle: "bold" } },
                { content: puttyRate, styles: { halign: "center", fontStyle: "bold" } },
                { content: total.totalAmount, styles: { halign: "right", fontStyle: "bold" } },
            ])
        ];
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Total Bill Amount (All Floors)", styles: { halign: "left", fontStyle: "bold" } },
            { content: formattedGrandTotalArea, styles: { halign: "center", fontStyle: "bold" } },
            { content: puttyRate, styles: { halign: "center", fontStyle: "bold" } },
            { content: formattedGrandTotalAmount, styles: { halign: "right", fontStyle: "bold" } },
        ]);
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Advance Amount", styles: { halign: "left" } },
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "0", styles: { halign: "right" } },
        ]);
        const remainingAmount = formattedGrandTotalAmount;
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Balance Amount to be Paid", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: remainingAmount, styles: { halign: "right", fontStyle: "bold" } },
        ]);
        const totalsTableStartY = doc.autoTable.previous.finalY;
        doc.autoTable({
            startY: totalsTableStartY,
            head: "",
            body: totalsTableRows,
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
                1: { cellWidth: 94, halign: 'left' },
                2: { cellWidth: 20, halign: 'left' },
                3: { cellWidth: 22, halign: 'right' },
                4: { cellWidth: 32, halign: 'right' },
            },
            didDrawPage: (data) => {
                footer(doc);
            },
        });
        doc.save(filename);
    };
    const generateExteriorPuttyPDF = async (groupedData) => {
        const doc = new jsPDF();
        const formatDateForName = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        };
        const selectedDate = formatDateForName(date);
        const revisionCount = await getRevisionNumber(paintClientName.label);
        const revisionNumber = `R ${revisionCount}`;
        const fileType = 'EX-PUTTY';
        const siteName = paintClientName.label;
        const clientId = paintClientSNo || 0;
        const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
        if (paintSelectedFile && paintSelectedFile.label) {
            filename = `PBS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
        } else {
            filename = `PBS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
        }
        await postIncrement(fileLabel, fileType);
        const header = (doc) => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("PAINT BILLING SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFontSize(8);
            doc.text("EXTERIOR PUTTY WORK", doc.internal.pageSize.width - 47.5, 41);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setFont("helvetica", "bold");
            doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
            doc.setFontSize(10);
            const tmsDate = `PBS EX-PUTTY WORK ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
                { content: `${floorName}`, colSpan: 6, styles: { halign: 'left', fontStyle: 'bold' } },
            ]);
            let areaIndex = 1;
            Object.keys(floorData).forEach((areaName) => {
                const areaSNo = areaIndex++;
                allTableRows.push([
                    { content: areaSNo, styles: { halign: 'center', fontStyle: 'bold', font: 'helvetica' } },
                    { content: `${areaName}`, colSpan: 6, styles: { halign: 'left', fontStyle: 'bold', font: 'helvetica' } },
                ]);
                const tableRows = floorData[areaName].map((row) => {
                    if (row.description === "Total Area") {
                        floorSum += row.amount || 0;
                    }
                    return [
                        { content: "", styles: { halign: 'center' } },
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
        const floorWiseTotals = Object.keys(groupedData).map((floorName) => {
            let totalAmount = 0;
            let totalArea = 0;
            Object.values(groupedData[floorName]).forEach((areaData) => {
                areaData.forEach((row) => {
                    if (row.description === "Total Area") {
                        totalArea += parseFloat(row.netArea || 0);
                    }
                    if (row.description === "Total Area") {
                        totalAmount += parseFloat(row.amount || 0);
                    }
                });
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
                1: { cellWidth: 24, halign: 'left' },
                2: { cellWidth: 30, halign: 'left' },
                3: { cellWidth: 18, halign: 'right' },
                4: { cellWidth: 22, halign: 'center' },
                5: { cellWidth: 20, halign: 'right' },
                6: { cellWidth: 22, halign: 'center' },
                7: { cellWidth: 32, halign: 'right' },
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
                if (data.row.index !== undefined && data.row.raw[1] === "Total Area") {
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });
        const totalsTableRows = floorWiseTotals.map((total, index) => [
            { content: String.fromCharCode(65 + index), styles: { halign: "center", fontStyle: "bold" } },
            { content: `Total Amount Of ${total.floorName}`, styles: { halign: "left", fontStyle: "bold" } },
            { content: total.totalArea, styles: { halign: "right", fontStyle: "bold" } },
            { content: exteriorPuttyRate, styles: { halign: "center", fontStyle: "bold" } },
            { content: total.totalAmount, styles: { halign: "right", fontStyle: "bold" } },
        ]);
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Total Bill Amount (All Floors)", styles: { halign: "left", fontStyle: "bold" } },
            { content: formattedGrandTotalArea, styles: { halign: "right", fontStyle: "bold" } },
            { content: exteriorPuttyRate, styles: { halign: "center", fontStyle: "bold" } },
            { content: formattedGrandTotalAmount, styles: { halign: "right", fontStyle: "bold" } },
        ]);
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Advance Amount", styles: { halign: "left" } },
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "0", styles: { halign: "right" } },
        ]);
        const remainingAmount = formattedGrandTotalAmount;
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Balance Amount to be Paid", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: remainingAmount, styles: { halign: "right", fontStyle: "bold" } },
        ]);
        const totalsTableStartY = doc.autoTable.previous.finalY;
        doc.autoTable({
            startY: totalsTableStartY,
            head: "",
            body: totalsTableRows,
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
                1: { cellWidth: 94, halign: 'left' },
                2: { cellWidth: 20, halign: 'left' },
                3: { cellWidth: 22, halign: 'right' },
                4: { cellWidth: 32, halign: 'right' },
            },
            didDrawPage: (data) => {
                footer(doc);
            },
        });
        doc.save(filename);
    };
    const generatePaintBillPDF = async (groupedData) => {
        const doc = new jsPDF();
        const formatDateForName = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        };
        const selectedDate = formatDateForName(date);
        const revisionCount = await getRevisionNumber(paintClientName.label);
        const revisionNumber = `R ${revisionCount}`;
        const fileType = 'IN-PAINT';
        const siteName = paintClientName.label;
        const clientId = paintClientSNo || 0;
        const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
        if (paintSelectedFile && paintSelectedFile.label) {
            filename = `PBS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
        } else {
            filename = `PBS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
        }
        await postIncrement(fileLabel, fileType);
        const header = (doc) => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("PAINT BILLING SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFontSize(8);
            doc.text("INTERIOR PAINT WORK", doc.internal.pageSize.width - 47.5, 41);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setFont("helvetica", "bold");
            doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
            doc.setFontSize(10);
            const tmsDate = `PBS IN-PAINT WORK ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
        const tableHeader = ["S.No", "Area Name", "Measurement", "Area (Sqft)", "Deduction Area", "Coats Count", "Net Area", "Rate", "Amount"];
        const allTableRows = [];
        const floorWiseSums = [];
        let floorIndex = 0;
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
                allTableRows.push([
                    { content: areaSNo, styles: { halign: 'center', fontStyle: 'bold', font: 'helvetica' } },
                    { content: `${areaName}`, colSpan: 7, styles: { halign: 'left', fontStyle: 'bold', font: 'helvetica' } },
                ]);
                const tableRows = floorData[areaName].map((row) => {
                    if (row.description === "Total Area") {
                        floorSum += row.amount || 0;
                    }
                    return row.description === "Deduction"
                        ? [
                            { content: "", styles: { halign: 'center' } },
                            row.description || "",
                            {
                                content: `${row.measurement || ""} ${row.area ? numberFormatter.format(row.area) : ""}`,
                                colSpan: 2,
                                styles: { halign: 'center' }
                            },
                            row.deductionArea === 0 ? "" : row.deductionArea,
                            row.CoatsCount === 0 ? "" : row.CoatsCount,
                            row.netArea === 0 ? "" : numberFormatter.format(row.netArea),
                            row.rate === 0 ? "" : row.rate,
                            row.amount === 0 ? "" : currencyFormatter.format(row.amount),
                        ]
                        : [
                            { content: "", styles: { halign: 'center' } },
                            row.description || "",
                            row.measurement || "",
                            row.area === 0 ? "" : numberFormatter.format(row.area),
                            row.deductionArea === 0 ? "" : row.deductionArea,
                            row.CoatsCount === 0 ? "" : row.CoatsCount,
                            row.netArea === 0 ? "" : numberFormatter.format(row.netArea),
                            row.rate === 0 ? "" : row.rate,
                            row.amount === 0 ? "" : currencyFormatter.format(row.amount),
                        ];
                });
                allTableRows.push(...tableRows);
            });
            floorWiseSums.push({ floorName, floorSum });
        });
        let primerTotal = 0, wallCoatTotal = 0, ceilingCoatTotal = 0;
        const floorWiseTotal = {};
        Object.keys(groupedData).forEach((floorName) => {
            let floorPrimerTotal = 0, floorWallCoatTotal = 0, floorCeilingCoatTotal = 0;
            Object.values(groupedData[floorName]).forEach((areaData) => {
                areaData.forEach((row) => {
                    if (row.description.includes("Primer")) {
                        floorPrimerTotal += parseFloat(row.netArea || 0);
                        primerTotal += parseFloat(row.netArea || 0);
                    }
                    if (row.description.includes("Wall Coat")) {
                        floorWallCoatTotal += parseFloat(row.netArea || 0);
                        wallCoatTotal += parseFloat(row.netArea || 0);
                    }
                    if (row.description.includes("Ceiling Coat")) {
                        floorCeilingCoatTotal += parseFloat(row.netArea || 0);
                        ceilingCoatTotal += parseFloat(row.netArea || 0);
                    }
                });
            });
            floorWiseTotal[floorName] = {
                primer: numberFormatter.format(floorPrimerTotal),
                wallCoat: numberFormatter.format(floorWallCoatTotal),
                ceilingCoat: numberFormatter.format(floorCeilingCoatTotal)
            };
        });
        const floorWiseTotals = Object.keys(groupedData).map((floorName) => {
            let totalAmount = 0;
            let totalArea = 0;
            Object.values(groupedData[floorName]).forEach((areaData) => {
                totalAmount += areaData.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0);
                totalArea += areaData.reduce((sum, row) => sum + parseFloat(row.netArea || 0), 0);
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
                1: { cellWidth: 24, halign: 'left' },
                2: { cellWidth: 30, halign: 'left' },
                3: { cellWidth: 19, halign: 'right' },
                4: { cellWidth: 21, halign: 'center' },
                5: { cellWidth: 14, halign: 'center' },
                6: { cellWidth: 20, halign: 'center' },
                7: { cellWidth: 16, halign: 'center' },
                8: { cellWidth: 24, halign: 'right' },
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
                if (data.row.index !== undefined && data.row.raw[1] === "Total Area") {
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });
        const totalsTableRows = floorWiseTotals.flatMap((total, index) => {
            const floorPrimer = parseFloat((floorWiseTotal[total.floorName]?.primer || "0").replace(/,/g, ""));
            const floorWallCoat = parseFloat((floorWiseTotal[total.floorName]?.wallCoat || "0").replace(/,/g, ""));
            const floorCeilingCoat = parseFloat((floorWiseTotal[total.floorName]?.ceilingCoat || "0").replace(/,/g, ""));
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
            rows.push(
                [
                    { content: String.fromCharCode(65 + index), styles: { halign: "center", fontStyle: "bold" } },
                    { content: `Total Amount Of ${total.floorName}`, styles: { halign: "left", fontStyle: "bold" } },
                    { content: total.totalArea, styles: { halign: "center", fontStyle: "bold" } },
                    { content: "", styles: {} },
                    { content: total.totalAmount, styles: { halign: "right", fontStyle: "bold" } },
                ],
                [
                    { content: "", styles: {} },
                    { content: `Total Primer Coat`, styles: { halign: "left" } },
                    { content: floorPrimer.toFixed(2), styles: { halign: "center" } },
                    { content: primerRate, styles: { halign: "center" } },
                    { content: currencyFormatter.format((floorPrimer * primerRate).toFixed(2)), styles: { halign: "right" } },
                ],
                [
                    { content: "", styles: {} },
                    { content: `Total Wall Coat `, styles: { halign: "left" } },
                    { content: floorWallCoat.toFixed(2), styles: { halign: "center" } },
                    { content: wallCoatRate, styles: { halign: "center" } },
                    { content: currencyFormatter.format((floorWallCoat * wallCoatRate).toFixed(2)), styles: { halign: "right" } },
                ],
                [
                    { content: "", styles: {} },
                    { content: `Total Ceiling Coat `, styles: { halign: "left" } },
                    { content: floorCeilingCoat.toFixed(2), styles: { halign: "center" } },
                    { content: ceilingCoatRate, styles: { halign: "center" } },
                    { content: currencyFormatter.format((floorCeilingCoat * ceilingCoatRate).toFixed(2)), styles: { halign: "right" } },
                ]
            );
            return rows;
        });
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: " BILL STATEMENT", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: { halign: "right", fontStyle: "bold" } },
            { content: "", styles: {} },
            { content: "", styles: { halign: "right", fontStyle: "bold" } },
        ]);
        totalsTableRows.push(
            [
                { content: "", styles: {} },
                { content: "Grand Total Primer Coat", styles: { halign: "left" } },
                { content: numberFormatter.format(primerTotal), styles: { halign: "center" } },
                { content: primerRate, styles: { halign: "center" } },
                { content: numberFormatter.format((primerTotal * primerRate)), styles: {} },
            ],
            [
                { content: "", styles: {} },
                { content: "Grand Total Wall Coat ", styles: { halign: "left" } },
                { content: numberFormatter.format(wallCoatTotal), styles: { halign: "center" } },
                { content: wallCoatRate, styles: { halign: "center" } },
                { content: numberFormatter.format(wallCoatTotal * wallCoatRate), styles: {} },
            ],
            [
                { content: "", styles: {} },
                { content: "Grand Total Ceiling Coat ", styles: { halign: "left" } },
                { content: numberFormatter.format(ceilingCoatTotal), styles: { halign: "center" } },
                { content: ceilingCoatRate, styles: { halign: "center" } },
                { content: numberFormatter.format(ceilingCoatTotal * ceilingCoatRate), styles: {} },
            ]
        );
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Total Bill Amount (All Floors)", styles: { halign: "left", fontStyle: "bold" } },
            { content: formattedGrandTotalArea, styles: { halign: "center", fontStyle: "bold" } },
            { content: "", styles: {} },
            { content: formattedGrandTotalAmount, styles: { halign: "right", fontStyle: "bold" } },
        ]);
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Advance Amount", styles: { halign: "left" } },
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: {} },
            { content: "0", styles: { halign: "right" } },
        ]);
        const remainingAmount = formattedGrandTotalAmount;
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Balance Amount to be Paid", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: {} },
            { content: remainingAmount, styles: { halign: "right", fontStyle: "bold" } },
        ]);
        const totalsTableStartY = doc.autoTable.previous.finalY;
        doc.autoTable({
            startY: totalsTableStartY,
            head: "",
            body: totalsTableRows,
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
    const generateExteriorPaintBillPDF = async (groupedData) => {
        const doc = new jsPDF();
        const formatDateForName = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        };
        const selectedDate = formatDateForName(date);
        const revisionCount = await getRevisionNumber(paintClientName.label);
        const revisionNumber = `R ${revisionCount}`;
        const fileType = 'EX-PAINT';
        const siteName = paintClientName.label;
        const clientId = paintClientSNo || 0;
        const fileLabel = paintSelectedFile && paintSelectedFile.label ? paintSelectedFile.label : `${selectedDate}`;
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
        if (paintSelectedFile && paintSelectedFile.label) {
            filename = `PBS ${fileType} ${clientId} - ${paintSelectedFile.label}.${incrementValue}.pdf`;
        } else {
            filename = `PBS ${fileType} ${clientId} - ${selectedDate} - ${revisionNumber} - ${formatDateForName(currentDate)}.pdf`;
        }
        await postIncrement(fileLabel, fileType);
        const header = (doc) => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("PAINT BILLING SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFontSize(8);
            doc.text("EXTERIOR PAINT WORK", doc.internal.pageSize.width - 47.5, 41);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setFont("helvetica", "bold");
            doc.text("ENGINEER COPY", doc.internal.pageSize.width - 44, 15);
            doc.setFontSize(10);
            const tmsDate = `PBS EX-PAINT WORK ${clientId} - ${paintSelectedFile.label}.${incrementValue}`;
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
        const tableHeader = ["S.No", "Area Name", "Measurement", "Area (Sqft)", "Deduction Area", "Coats Count", "Net Area", "Rate", "Amount"];
        const allTableRows = [];
        const floorWiseSums = [];
        let floorIndex = 0;
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
                allTableRows.push([
                    { content: areaSNo, styles: { halign: 'center', fontStyle: 'bold', font: 'helvetica' } },
                    { content: `${areaName}`, colSpan: 7, styles: { halign: 'left', fontStyle: 'bold', font: 'helvetica' } },
                ]);
                const tableRows = floorData[areaName].map((row) => {
                    if (row.description === "Total Area") {
                        floorSum += row.amount || 0;
                    }
                    return [
                        { content: "", styles: { halign: 'center' } },
                        row.description || "",
                        row.measurement || "",
                        row.area === 0 ? "" : numberFormatter.format(row.area),
                        row.deductionArea === 0 ? "" : row.deductionArea,
                        row.CoatsCount === 0 ? "" : row.CoatsCount,
                        row.netArea === 0 ? "" : numberFormatter.format(row.netArea),
                        row.rate === 0 ? "" : row.rate,
                        row.amount === 0 ? "" : currencyFormatter.format(row.amount),
                    ];
                });
                allTableRows.push(...tableRows);
            });
            floorWiseSums.push({ floorName, floorSum });
        });
        let primerTotal = 0, wallCoatTotal = 0, ceilingCoatTotal = 0;
        const floorWiseTotal = {};
        Object.keys(groupedData).forEach((floorName) => {
            let floorPrimerTotal = 0, floorWallCoatTotal = 0, floorCeilingCoatTotal = 0;
            Object.values(groupedData[floorName]).forEach((areaData) => {
                areaData.forEach((row) => {
                    if (row.description.includes("Primer")) {
                        floorPrimerTotal += parseFloat(row.netArea || 0);
                        primerTotal += parseFloat(row.netArea || 0);
                    }
                    if (row.description.includes("Wall Coat")) {
                        floorWallCoatTotal += parseFloat(row.netArea || 0);
                        wallCoatTotal += parseFloat(row.netArea || 0);
                    }
                    if (row.description.includes("Ceiling Coat")) {
                        floorCeilingCoatTotal += parseFloat(row.netArea || 0);
                        ceilingCoatTotal += parseFloat(row.netArea || 0);
                    }
                });
            });
            floorWiseTotal[floorName] = {
                primer: numberFormatter.format(floorPrimerTotal),
                wallCoat: numberFormatter.format(floorWallCoatTotal),
                ceilingCoat: numberFormatter.format(floorCeilingCoatTotal)
            };
        });
        const floorWiseTotals = Object.keys(groupedData).map((floorName) => {
            let totalAmount = 0;
            let totalArea = 0;
            Object.values(groupedData[floorName]).forEach((areaData) => {
                totalAmount += areaData.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0);
                totalArea += areaData.reduce((sum, row) => sum + parseFloat(row.netArea || 0), 0);
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
                1: { cellWidth: 24, halign: 'left' },
                2: { cellWidth: 30, halign: 'left' },
                3: { cellWidth: 19, halign: 'right' },
                4: { cellWidth: 21, halign: 'center' },
                5: { cellWidth: 14, halign: 'center' },
                6: { cellWidth: 20, halign: 'center' },
                7: { cellWidth: 16, halign: 'center' },
                8: { cellWidth: 24, halign: 'right' },
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
                if (data.row.index !== undefined && data.row.raw[1] === "Total Area") {
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });
        const totalsTableRows = floorWiseTotals.flatMap((total, index) => {
            const floorPrimer = parseFloat((floorWiseTotal[total.floorName]?.primer || "0").replace(/,/g, ""));
            const floorWallCoat = parseFloat((floorWiseTotal[total.floorName]?.wallCoat || "0").replace(/,/g, ""));
            const floorCeilingCoat = parseFloat((floorWiseTotal[total.floorName]?.ceilingCoat || "0").replace(/,/g, ""));
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
            rows.push(
                [
                    { content: String.fromCharCode(65 + index), styles: { halign: "center", fontStyle: "bold" } },
                    { content: `Total Amount Of ${total.floorName}`, styles: { halign: "left", fontStyle: "bold" } },
                    { content: total.totalArea, styles: { halign: "center", fontStyle: "bold" } },
                    { content: "", styles: {} },
                    { content: total.totalAmount, styles: { halign: "right", fontStyle: "bold" } },
                ],
                [
                    { content: "", styles: {} },
                    { content: `Total Primer Coat`, styles: { halign: "left" } },
                    { content: floorPrimer.toFixed(2), styles: { halign: "center" } },
                    { content: (exteriorPrimerRate || 0), styles: { halign: "center" } },
                    { content: currencyFormatter.format((floorPrimer * exteriorPrimerRate).toFixed(2)), styles: { halign: "right" } },
                ],
                [
                    { content: "", styles: {} },
                    { content: `Total Wall Coat `, styles: { halign: "left" } },
                    { content: floorWallCoat.toFixed(2), styles: { halign: "center" } },
                    { content: (exteriorWallCoatRate || 0), styles: { halign: "center" } },
                    { content: currencyFormatter.format((floorWallCoat * exteriorWallCoatRate).toFixed(2)), styles: { halign: "right" } },
                ],
                [
                    { content: "", styles: {} },
                    { content: `Total Floor Coat `, styles: { halign: "left" } },
                    { content: floorCeilingCoat.toFixed(2), styles: { halign: "center" } },
                    { content: (exteriorCeilingCoatRate || 0), styles: { halign: "center" } },
                    { content: currencyFormatter.format((floorCeilingCoat * exteriorCeilingCoatRate).toFixed(2)), styles: { halign: "right" } },
                ]
            );
            return rows;
        });
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: " BILL STATEMENT", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: { halign: "right", fontStyle: "bold" } },
            { content: "", styles: {} },
            { content: "", styles: { halign: "right", fontStyle: "bold" } },
        ]);
        totalsTableRows.push(
            [
                { content: "", styles: {} },
                { content: "Grand Total Primer Coat", styles: { halign: "left" } },
                { content: numberFormatter.format(primerTotal), styles: { halign: "center" } },
                { content: (exteriorPrimerRate || 0), styles: { halign: "center" } },
                { content: numberFormatter.format((primerTotal * exteriorPrimerRate)), styles: {} },
            ],
            [
                { content: "", styles: {} },
                { content: "Grand Total Wall Coat ", styles: { halign: "left" } },
                { content: numberFormatter.format(wallCoatTotal), styles: { halign: "center" } },
                { content: (exteriorWallCoatRate || 0), styles: { halign: "center" } },
                { content: numberFormatter.format(wallCoatTotal * exteriorWallCoatRate), styles: {} },
            ],
            [
                { content: "", styles: {} },
                { content: "Grand Total Floor Coat ", styles: { halign: "left" } },
                { content: numberFormatter.format(ceilingCoatTotal), styles: { halign: "center" } },
                { content: (exteriorCeilingCoatRate || 0), styles: { halign: "center" } },
                { content: numberFormatter.format(ceilingCoatTotal * exteriorCeilingCoatRate), styles: {} },
            ]
        );
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Total Bill Amount (All Floors)", styles: { halign: "left", fontStyle: "bold" } },
            { content: formattedGrandTotalArea, styles: { halign: "center", fontStyle: "bold" } },
            { content: "", styles: {} },
            { content: formattedGrandTotalAmount, styles: { halign: "right", fontStyle: "bold" } },
        ]);
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Advance Amount", styles: { halign: "left" } },
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: {} },
            { content: "0", styles: { halign: "right" } },
        ]);
        const remainingAmount = formattedGrandTotalAmount;
        totalsTableRows.push([
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "Balance Amount to be Paid", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: { halign: "left", fontStyle: "bold" } },
            { content: "", styles: {} },
            { content: remainingAmount, styles: { halign: "right", fontStyle: "bold" } },
        ]);
        const totalsTableStartY = doc.autoTable.previous.finalY;
        doc.autoTable({
            startY: totalsTableStartY,
            head: "",
            body: totalsTableRows,
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
    const getGroupedSummary = () => {
        const groupedData = tilesData.reduce((acc, tile) => {
            const groupKey = `${tile.selectedPaint}-${tile.selectedPaintColor}`;
            if (!acc[groupKey]) {
                acc[groupKey] = {
                    selectedPaint: tile.selectedPaint,
                    selectedPaintColor: tile.selectedPaintColor,
                    totalArea: 0,
                    totalOrderQty: 0,
                };
            }
            acc[groupKey].totalArea += tile.calculatedAreas;
            acc[groupKey].totalOrderQty += tile.calculatedOrderQtys;
            return acc;
        }, {});
        return Object.values(groupedData);
    };
    const getOthersTableTotalSummary = () => {
        let totalArea = 0;
        let totalOrderQty = 0;
        tilesData.forEach(tile => {
            totalArea += tile.calculatedAreas;
            totalOrderQty += tile.calculatedOrderQtys;
        });
        return { totalArea, totalOrderQty };
    };
    const [lengthPopupState, setLengthPopupState] = useState({});
    const [lengthPopupData, setLengthPopupData] = useState({});
    const openLengthPopupScreen = (floorIndex, tileIndex) => {
        const lengths = [
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length1,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length2,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length3,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length4,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length5,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length6,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length7,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length8,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length9,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length10,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length11,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length12,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length13,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length14,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length15,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length16,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length17,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length18,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length19,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length20,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length21,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length22,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length23,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length24,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length25,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length26,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length27,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length28,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length29,
            exteriorFloors[floorIndex]?.tiles[tileIndex]?.length30,
        ];
        const processedlengths = lengths.map((allLength, index) => {
            if (allLength) {
                const splitData = allLength.split(',').map((val) => val.trim());
                const row = {
                    type: splitData[0] || '',
                    measurement: splitData[1] || '',
                    qty: splitData[2] || '',
                    output: splitData[3] || ''
                };
                return row;
            }
            return null;
        }).filter(row => row !== null);
        const formattedData = processedlengths.length > 0 ? {
            [`${floorIndex}-${tileIndex}`]: processedlengths,
        } : {};
        setLengthPopupState((prevState) => ({
            ...prevState,
            [`${floorIndex}-${tileIndex}`]: true,
        }));
        setLengthPopupData((prevData) => ({
            ...prevData,
            ...formattedData,
        }));
    };
    const closelengthPopup = (floorIndex, tileIndex) => {
        setLengthPopupState((prevState) => ({
            ...prevState,
            [`${floorIndex}-${tileIndex}`]: false,
        }));
    };
    const parseFeetInchesOutput = (str) => {
        if (!str) return 0;
        const regex = /^(\d+)'(\d+)"$/;
        const matches = str.match(regex);
        if (!matches) return 0;
        const feet = parseInt(matches[1], 10);
        const inches = parseInt(matches[2], 10);
        return feet + (inches / 12);
    };
    const handleLengthPopupDataChange = (floorIndex, tileIndex, updatedData) => {
        const totalOutputDecimal = updatedData.reduce((sum, row) => {
            return sum + parseFeetInchesOutput(row.output);
        }, 0);
        const totalOutput = convertDecimalFeetToFeetInches(totalOutputDecimal);
        setLengthPopupData((prevData) => ({
            ...prevData,
            [`${floorIndex}-${tileIndex}`]: updatedData,
        }));
        setExteriorFloors((prevFloors) => {
            const newFloors = [...prevFloors];
            updatedData.forEach((row, idx) => {
                if (row) {
                    const lengthKey = `length${idx + 1}`;
                    newFloors[floorIndex].tiles[tileIndex][lengthKey] =
                        `${row.type},${row.measurement},${row.qty},${row.output}`;
                }
            });
            newFloors[floorIndex].tiles[tileIndex].length = totalOutput;
            return newFloors;
        });
    };
    const handleLengthMeasurementChange = (value, floorIndex, tileIndex, index) => {
        const updatedData = [...(lengthPopupData[`${floorIndex}-${tileIndex}`] || [])];
        if (!updatedData[index]) updatedData[index] = {};
        updatedData[index].measurement = value;
        const outputs = (parseFeetInches(value)) * (updatedData[index].qty || 0);
        updatedData[index].output = convertDecimalFeetToFeetInches(outputs);
        handleLengthPopupDataChange(floorIndex, tileIndex, updatedData);
    };
    const handleLengthQtyChange = (e, floorIndex, tileIndex, index) => {
        const value = e.target.value;
        const updatedData = [...(lengthPopupData[`${floorIndex}-${tileIndex}`] || [])];
        if (!updatedData[index]) updatedData[index] = {};
        updatedData[index].qty = value;
        const outputs = (parseFeetInches(updatedData[index].measurement) || 0) * value;
        updatedData[index].output = convertDecimalFeetToFeetInches(outputs);
        handleLengthPopupDataChange(floorIndex, tileIndex, updatedData);
    };
    const getTotalOutput = (floorIndex, tileIndex) => {
        const data = lengthPopupData[`${floorIndex}-${tileIndex}`] || [];
        const totalDecimalFeet = data.reduce((sum, row) => {
            const valueInDecimal = parseFeetInchesOutput(row.output);
            return sum + valueInDecimal;
        }, 0);
        return convertDecimalFeetToFeetInches(totalDecimalFeet);
    };
    return (
        <body className="">
            <div className=" mx-auto p-6 border-collapse bg-[#FFFFFF] ml-6 mr-6 rounded-md ">
                <div className=" flex flex-wrap">
                    <div className=" flex">
                        <div className="w-full -mt-8 mb-4">
                            <h4 className=" mt-10 font-bold mb-2 lg:-ml-52 -ml-36">Project Name</h4>
                            <Select
                                value={paintClientName}
                                onChange={handleSiteChange}
                                options={sortedPaintSiteOptions}
                                placeholder="Select Site Name..."
                                className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg lg:w-80 w-64 h-12 text-left"
                                styles={customSelectStyles}
                                isClearable />
                        </div>
                        <input
                            type="text"
                            value={paintClientSNo}
                            readOnly
                            className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg h-12 lg:w-16 w-14 mt-10 ml-1 bg-transparent text-center"
                        />
                    </div>
                    <div className=" lg:ml-6 mt-2">
                        <h4 className=" font-bold mb-2 -ml-32">Date </h4>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] w-44 rounded-lg px-4 py-2 "
                        />
                    </div>
                    <div className="">
                        <h4 className=" mt-2.5 font-bold lg:-ml-24"> E No</h4>
                        <input
                            className="bg-gray-100 rounded-lg lg:w-36 w-16 h-12 mt-2 ml-2 pl-4"
                            value={eno}
                            readOnly
                        />
                    </div>
                    <div className=" lg:ml-6">
                        <h4 className=" mt-2.5 font-bold mb-2 lg:-ml-44 -ml-32"> Revision</h4>
                        <Select
                            placeholder="Select the file..."
                            className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg lg:w-60 w-48 h-12"
                            styles={customSelectStyles}
                            options={reversedFileOptions}
                            isClearable
                            onChange={handleFileChange}
                            value={paintSelectedFile}
                            isDisabled={!paintClientName}
                        />
                    </div>
                    <div className="flex justify-end items-center w-full lg:-mt-20 -mt-12 pr-4">
                        <button
                            className="bg-[#007233] lg:w-28 w-16 h-[36px] rounded-md text-white"
                            onClick={openImportPopup}
                        >
                            + Import
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-3">
                <div className="tabs flex ml-7 lg:gap-5 gap-2">
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
                    <div ref={scrollRef} className=" p-6 bg-[#FFFFFF] ml-6 mr-6 rounded-lg overflow-x-auto select-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}>
                        <div className="interior rounded-lg border-l-8 border-l-[#BF9853] flex mt-1 " id="full-table">
                            <table className="table-auto w-full ">
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
                                                className=" -mt-3 ml-2 text-sm w-12 text-center bg-transparent h-8 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg focus:outline-none"
                                            />
                                        </td>
                                        <th></th>
                                        <th></th>
                                        <td>
                                            <Select
                                                options={[
                                                    { value: "No", label: "No" },
                                                    { value: "Wall", label: "Wall" },
                                                    { value: "Ceiling", label: "Ceiling" },
                                                    { value: "Both", label: "Both" },
                                                ]}
                                                value={commonPutty ? { value: commonPutty, label: commonPutty } : null}
                                                onChange={(selectedOption) => {
                                                    const puttyValue = selectedOption ? selectedOption.value : "No";
                                                    setCommonPutty(puttyValue);
                                                    const updatedFloors = interiorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            putty: puttyValue,
                                                        })),
                                                    }));
                                                    setInteriorFloors(updatedFloors);
                                                }}
                                                className="border rounded w-28 h-9 text-sm"
                                                placeholder=""
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        textAlign: 'left',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
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
                                                options={[
                                                    { value: "No", label: "No" },
                                                    { value: "Wall", label: "Wall" },
                                                    { value: "Ceiling", label: "Ceiling" },
                                                    { value: "Both", label: "Both" },
                                                ]}
                                                value={commonPrimer ? { value: commonPrimer, label: commonPrimer } : null}
                                                onChange={(selectedOption) => {
                                                    const primerValue = selectedOption ? selectedOption.value : "No";
                                                    setCommonPrimer(primerValue);
                                                    setInteriorFloors((prevFloors) => {
                                                        const updatedFloors = prevFloors.map((floor, fIdx) => ({
                                                            ...floor,
                                                            tiles: floor.tiles.map((tile, tIdx) => {
                                                                const updatedTile = {
                                                                    ...tile,
                                                                    primer: primerValue,
                                                                };
                                                                setTimeout(() => {
                                                                    setInteriorFloors((latestFloors) => {
                                                                        handleInteriorDeductionChange(fIdx, tIdx, latestFloors);
                                                                        return [...latestFloors];
                                                                    });
                                                                }, 0);
                                                                return updatedTile;
                                                            }),
                                                        }));
                                                        return updatedFloors;
                                                    });
                                                }}
                                                className="border rounded w-24 h-9 text-sm"
                                                placeholder=""
                                                isSearchable={true}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        textAlign: 'left',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
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
                                                options={[
                                                    { value: "No", label: "No" },
                                                    { value: "1 Coat", label: "1 Coat" },
                                                    { value: "2 Coat", label: "2 Coat" },
                                                ]}
                                                value={commonWallCoat ? { value: commonWallCoat, label: commonWallCoat } : null}
                                                onChange={(selectedOption) => {
                                                    const wallCoatValue = selectedOption ? selectedOption.value : "No";
                                                    setCommonWallCoat(wallCoatValue);
                                                    const updatedFloors = interiorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            WallCoat: wallCoatValue,
                                                        })),
                                                    }));
                                                    setInteriorFloors(updatedFloors);
                                                }}
                                                className="border rounded w-24 h-9 text-xs"
                                                placeholder=""
                                                isSearchable={true}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        textAlign: 'left',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
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
                                                options={[
                                                    { value: "No", label: "No" },
                                                    { value: "1 Coat", label: "1 Coat" },
                                                    { value: "2 Coat", label: "2 Coat" },
                                                ]}
                                                value={commonCeilingCoat ? { value: commonCeilingCoat, label: commonCeilingCoat } : null}
                                                onChange={(selectedOption) => {
                                                    const ceilingCoatValue = selectedOption ? selectedOption.value : "No";
                                                    setCommonCeilingCoat(ceilingCoatValue);
                                                    const updatedFloors = interiorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            ceilingCoat: ceilingCoatValue,
                                                        })),
                                                    }));
                                                    setInteriorFloors(updatedFloors);
                                                }}
                                                className="border rounded w-24 h-9 text-xs"
                                                placeholder=""
                                                isSearchable={true}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        textAlign: 'left',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
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
                                                options={[
                                                    { value: "No", label: "No" },
                                                    { value: "Yes", label: "Yes" },
                                                ]}
                                                value={commonWaterProof ? { value: commonWaterProof, label: commonWaterProof } : null}
                                                onChange={(selectedOption) => {
                                                    const waterProofValue = selectedOption ? selectedOption.value : "No";
                                                    setCommonWaterProof(waterProofValue);
                                                    const updatedFloors = interiorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            waterproof: waterProofValue,
                                                        })),
                                                    }));
                                                    setInteriorFloors(updatedFloors);
                                                }}
                                                className="border rounded w-24 h-9 text-sm"
                                                placeholder=""
                                                isSearchable={true}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        textAlign: 'left',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
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
                                                options={Array.from({ length: 16 }, (_, index) => ({
                                                    value: index,
                                                    label: `${index}%`,
                                                }))}
                                                value={{ value: commonWastagePercentage, label: `${commonWastagePercentage}%` }}
                                                onChange={(selectedOption) => {
                                                    const wastageValue = selectedOption ? selectedOption.value : 0;
                                                    setCommonWastagePercentage(wastageValue);
                                                    const updatedFloors = interiorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            wastagePercentage: wastageValue,
                                                        })),
                                                    }));
                                                    setInteriorFloors(updatedFloors);
                                                }}
                                                className="border rounded w-24 h-9 text-sm"
                                                placeholder=""
                                                isSearchable={true}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        textAlign: 'left',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
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
                                                className="bg-transparent ml-4 w-72 text-sm"
                                                value={commonPaint ? { label: commonPaint, value: commonPaint } : null}
                                                onChange={handleCommonPaintChange}
                                                options={paintVariants
                                                    .filter((variant) => variant.paintType === "Interior")
                                                    .map((variant) => ({
                                                        label: variant.paintName,
                                                        value: variant.paintName,
                                                    }))}
                                                placeholder="Select Paint.."
                                                required
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
                                        <td>
                                            <Select
                                                className="bg-transparent ml-4 w-64 text-sm"
                                                value={commonPaintColor ? { label: commonPaintColor, value: commonPaintColor } : null}
                                                onChange={handleCommonPaintColorChange}
                                                options={paints.map((paint) => ({
                                                    label: paint.paintColor,
                                                    value: paint.paintColor,
                                                }))}
                                                placeholder="Select Paint Color.."
                                                required
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
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-40 text-left pl-2" rowSpan="2">Discription</th>
                                        <th className="w-32 text-lg " colSpan="3" style={{ letterSpacing: '0.2em' }}>Measurement</th>
                                        <th className="w-14 " rowSpan="2">Deduction Area (sqft)</th>
                                        <th className="w-12 " rowSpan="2">Area (sqft)</th>
                                        <th className="w-16 " rowSpan="2">Putty</th>
                                        <th className="w-16 " rowSpan="2">Primer</th>
                                        <th className="w-16 " rowSpan="2">Wall Coat</th>
                                        <th className="w-16 " rowSpan="2">Ceiling Coat</th>
                                        <th className="w-16 " rowSpan="2">Water Proof</th>
                                        <th className="w-12 " rowSpan="2">Wastage (sqft)</th>
                                        <th className="w-16 text-left pl-12" rowSpan="2">Product Variant</th>
                                        <th className="w-60 text-left pl-12" rowSpan="2">Color Code</th>
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
                                                <td colSpan="15" className="font-bold text-left group ">
                                                    {floor.floorName !== null && (
                                                        <div className="flex">
                                                            <span className="mt-1">{displayIndex++}.</span>
                                                            <span>{selectedClientData.floorName}</span>
                                                            <select
                                                                value={floor.floorName}
                                                                onChange={(e) => {
                                                                    const updatedFloors = [...interiorFloors];
                                                                    updatedFloors[floorIndex].floorName = e.target.value;
                                                                    setInteriorFloors(updatedFloors);
                                                                }}
                                                                className="w-72 p-1 rounded-lg bg-transparent focus:outline-none">
                                                                {floorOptions.map((floorOption, idx) => (
                                                                    <option key={idx} value={floorOption}>
                                                                        {floorOption}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <div className="items-center flex space-x-4 invisible group-hover:visible">
                                                                <button onClick={() => deleteFloor(floorIndex)} className="delete-floor-button">
                                                                    <img src={deletes} alt="delete" className="w-8 h-4" />
                                                                </button>
                                                                <button onClick={() => addAreaRowInterior(floorIndex)}>
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
                                                                        <img src={add} alt="add" className="w-5 h-5" />
                                                                    </button>
                                                                    <button onClick={() => deleteAreaRow(floorIndex, tileIndex, "interior")} className="ml-2">
                                                                        <img src={deleteIcon} alt="delete" className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-1 relative">
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
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                onKeyUp={(e) => handleKeyDown(floorIndex, tileIndex, e)}
                                                                onMouseEnter={() => setHoveredTile({ floorIndex, tileIndex })}
                                                                onMouseLeave={() => setHoveredTile({ floorIndex: null, tileIndex: null })}
                                                                className="px-2 w-14 bg-transparent  hover:border focus:outline-none text-center" />
                                                        </td>
                                                        <td className="px-1 relative">
                                                            {hoveredTileB.floorIndex === floorIndex && hoveredTileB.tileIndex === tileIndex && (
                                                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow z-10 whitespace-nowrap">
                                                                    {tile.breadthInput || 'No input'}
                                                                </div>
                                                            )}
                                                            <input
                                                                type="text"
                                                                name="breadth"
                                                                placeholder="B"
                                                                value={tile.breadth}
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                onKeyUp={(e) => handleKeyDown(floorIndex, tileIndex, e)}
                                                                onMouseEnter={() => setHoveredTileB({ floorIndex, tileIndex })}
                                                                onMouseLeave={() => setHoveredTileB({ floorIndex: null, tileIndex: null })}
                                                                className="px-2 w-14 bg-transparent hover:border focus:outline-none text-center" />
                                                        </td>
                                                        <td className="px-1 relative">
                                                            {hoveredTileH.floorIndex === floorIndex && hoveredTileH.tileIndex === tileIndex && (
                                                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow z-10 whitespace-nowrap">
                                                                    {tile.heightInput || 'No input'}
                                                                </div>
                                                            )}
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
                                                                onKeyUp={(e) => handleKeyDown(floorIndex, tileIndex, e)}
                                                                onMouseEnter={() => setHoveredTileH({ floorIndex, tileIndex })}
                                                                onMouseLeave={() => setHoveredTileH({ floorIndex: null, tileIndex: null })}
                                                                className="px-2 w-14 bg-transparent hover:border focus:outline-none text-center" />
                                                        </td>
                                                        <td className="px-2 flex">
                                                            <input
                                                                type="text"
                                                                name="deductionArea"
                                                                value={tile.deductionArea || ""}
                                                                readOnly
                                                                placeholder="Deduction"
                                                                className="px-2 w-20 bg-transparent hover:border focus:outline-none" />
                                                            <button
                                                                className="text-[#E4572E]"
                                                                onClick={() => openDeductionPopup(floorIndex, tileIndex)}>
                                                                D
                                                            </button>
                                                        </td>
                                                        {deductionPopupState[`${floorIndex}-${tileIndex}`] && (
                                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={() => closeDeductionPopup(floorIndex, tileIndex)}>
                                                                <div className="bg-white rounded-md w-[54rem] py-2 relative z-50" onClick={(e) => e.stopPropagation()}>
                                                                    <div className="flex mb-4 mt-2">
                                                                        <label className="text-[#E4572E] text-xl font-bold ml-[14rem] w-96">{floor.areaName} - Deduction</label>
                                                                        <button className="text-[#E4572E] ml-[14rem] -mt-4" onClick={() => closeDeductionPopup(floorIndex, tileIndex)}>
                                                                            <img src={cross} alt="close" className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                    <div className="overflow-x-auto">
                                                                        <div className="max-h-[38rem] overflow-y-auto">
                                                                            <table className="min-w-full border-collapse border border-gray-300 ">
                                                                                <tbody className="odd:bg-white even:bg-[#FAF6ED]">
                                                                                    {[...Array(16)].map((_, index) => (
                                                                                        <tr key={index} >
                                                                                            <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                                                                                                {index + 1}
                                                                                            </td>
                                                                                            <td className="border border-gray-300 px-4 py-2">
                                                                                                <CreatableSelect
                                                                                                    isClearable
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

                                                                                            <td className="border border-gray-300 px-2 py-2">
                                                                                                <CreatableSelect
                                                                                                    isClearable
                                                                                                    options={deductionMeasurment}
                                                                                                    value={
                                                                                                        deductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.measurement
                                                                                                            ? { value: deductionPopupData[`${floorIndex}-${tileIndex}`][index].measurement, label: deductionPopupData[`${floorIndex}-${tileIndex}`][index].measurement }
                                                                                                            : null
                                                                                                    }
                                                                                                    onChange={(selectedOption) => handleMeasurementChange(selectedOption, floorIndex, tileIndex, index)} // Using handleMeasurementChange
                                                                                                    placeholder="Measurement"
                                                                                                    menuPortalTarget={document.body}
                                                                                                    styles={{
                                                                                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                        menu: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                        control: (base) => ({ ...base, backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }),
                                                                                                    }}
                                                                                                />
                                                                                            </td>
                                                                                            <td className="border border-gray-300 px-2 py-2">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    className="w-12 border rounded px-2 py-1"
                                                                                                    placeholder="Qty"
                                                                                                    value={deductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.qty || ""}
                                                                                                    onChange={(e) => handleQtyChange(e, floorIndex, tileIndex, index)}
                                                                                                />
                                                                                            </td>
                                                                                            <td className="border border-gray-300 px-2 py-2">
                                                                                                <select
                                                                                                    className="w-24 border rounded px-2 py-1"
                                                                                                    value={deductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.location ?? "Wall"}
                                                                                                    onChange={(e) => handleLocationChange(e, floorIndex, tileIndex, index)}>
                                                                                                    <option value="">Select..</option>
                                                                                                    <option value="Wall">Wall</option>
                                                                                                    <option value="Ceiling">Ceiling</option>
                                                                                                </select>
                                                                                            </td>
                                                                                            <td className="border border-gray-300 py-2">
                                                                                                <CreatableSelect
                                                                                                    className="w-32"
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
                                                                                            <td className="border border-gray-300 px-2 py-2">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    className="w-20 border rounded px-2 py-1"
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
                                                        <td className="px-2 ">
                                                            <div className="w-16">
                                                                {tile.length && (tile.breadth || tile.height) ? (
                                                                    (() => {
                                                                        const length = parseFeetInches(tile.length);
                                                                        const breadth = parseFeetInches(tile.breadth);
                                                                        const height = parseFeetInches(tile.height);
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
                                                            <Select
                                                                name="putty"
                                                                options={[
                                                                    { value: "No", label: "No" },
                                                                    { value: "Wall", label: "Wall" },
                                                                    { value: "Ceiling", label: "Ceiling" },
                                                                    { value: "Both", label: "Both" },
                                                                ]}
                                                                value={tile.putty ? { value: tile.putty, label: tile.putty } : { value: "No", label: "No" }}
                                                                onChange={(selectedOption) => {
                                                                    const updatedFloors = [...interiorFloors];
                                                                    updatedFloors[floorIndex].tiles[tileIndex].putty = selectedOption ? selectedOption.value : "No";
                                                                    setInteriorFloors(updatedFloors);
                                                                }}
                                                                className="w-32 bg-transparent"
                                                                placeholder="Select Putty"
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
                                                        <td className="px-2">
                                                            <select
                                                                name="primer"
                                                                className="bg-transparent"
                                                                value={tile.primer || "No"}
                                                                onChange={(e) => handleTileChange(e, floorIndex, tileIndex)}>
                                                                <option>Wall</option>
                                                                <option>Ceiling</option>
                                                                <option>Both</option>
                                                                <option>No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                name="WallCoat"
                                                                className="bg-transparent"
                                                                value={tile.WallCoat || "No"}
                                                                onChange={(e) => handleTileChange(e, floorIndex, tileIndex)}>
                                                                <option>1 Coat</option>
                                                                <option>2 Coat</option>
                                                                <option>No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                name="ceilingCoat"
                                                                className="bg-transparent"
                                                                value={tile.ceilingCoat || "No"}
                                                                onChange={(e) => handleTileChange(e, floorIndex, tileIndex)}>
                                                                <option>1 Coat</option>
                                                                <option>2 Coat</option>
                                                                <option>No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                name="waterproof"
                                                                className="bg-transparent"
                                                                value={tile.waterproof || "No"}
                                                                onChange={(e) => handleTileChange(e, floorIndex, tileIndex)}>
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
                                                        <td className="px-2 text-left pl-2">
                                                            <Select
                                                                className="bg-transparent ml-10 w-72"
                                                                value={tile.selectedPaint ? { label: tile.selectedPaint, value: tile.selectedPaint } : null}
                                                                onChange={(selectedOption) => {
                                                                    const updatedFloors = [...interiorFloors];
                                                                    updatedFloors[floorIndex].tiles[tileIndex].selectedPaint = selectedOption ? selectedOption.value : '';
                                                                    setInteriorFloors(updatedFloors);
                                                                }}
                                                                options={paintVariants
                                                                    .filter((variant) => variant.paintType === "Interior")
                                                                    .map((variant) => ({
                                                                        label: variant.paintName,
                                                                        value: variant.paintName,
                                                                    }))}
                                                                placeholder="Select Paint.."
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
                                                        <td className="px-2">
                                                            <Select
                                                                className="bg-transparent w-64"
                                                                name="selectedPaintColor"
                                                                value={tile.selectedPaintColor ? { label: tile.selectedPaintColor, value: tile.selectedPaintColor } : null}
                                                                onChange={(selectedOption) => handleTileChange(selectedOption, floorIndex, tileIndex)}
                                                                options={paints.map((paint) => ({
                                                                    label: paint.paintColor,
                                                                    value: paint.paintColor,
                                                                }))}
                                                                placeholder="Select Paint Color..."
                                                                isSearchable
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
                                                        <td className="px-2">
                                                            <div className="w-32 ml-2">
                                                                {tile.length && (tile.breadth || tile.height) && tile.selectedPaint ? (
                                                                    (() => {
                                                                        const length = parseFeetInches(tile.length);
                                                                        const breadth = parseFeetInches(tile.breadth);
                                                                        const height = parseFeetInches(tile.height);
                                                                        const wastagePercentage = Number(tile.wastagePercentage);
                                                                        const deductionArea = Number(tile.deductionArea || 0);
                                                                        const wastage = wastagePercentage / 100;
                                                                        const selectedPaint = paintVariants.find(
                                                                            (variant) => variant.paintName === tile.selectedPaint
                                                                        );
                                                                        const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                                                                        const totalOrderedTile =
                                                                            ((length * height) * 2) + ((breadth * height) * 2) - deductionArea;
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
                            <button type="button" className="text-[#E4572E] mt-6 lg:mb-20 mb-4 lg:-ml-[94%] -ml-[13rem] border-dashed border-b-2 border-[#BF9853] font-semibold"
                                onClick={addFloorRowInterior}>
                                + Add Floor
                            </button>
                        </div>
                        <div className=" buttons lg:-mt-14 lg:-ml-0 -ml-0 flex">
                            <div className="">
                                <button className="w-40 text-white lg:px-4 px-4 py-2 rounded bg-[#007233] hover:text-white transition duration-200 ease-in-out  "
                                    onClick={handleButtonClick}>
                                    Customer Copy
                                </button>
                            </div>
                            <div>
                                <button className="w-40 text-white lg:px-4 px-4 py-2 rounded ml-4 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out"
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
                            <div>
                                <button
                                    className="bg-[#E4572E] text-white lg:px-4 px-1 py-1 rounded w-52 h-10 ml-4 "
                                    onClick={handlePuttyBillClick}
                                >
                                    Generate Putty Bill
                                </button>
                            </div>
                            <div>
                                <button
                                    className="bg-[#E4572E] text-white lg:px-4 px-1 py-1 rounded w-52 h-10 ml-4 "
                                    onClick={handlePaintBillClick}
                                >
                                    Generate Paint Bill
                                </button>
                            </div>
                            <div className="lg:flex lg:ml-[30%] ml-40">
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
                                        className="btn bg-[#BF9853] text-white px-8 py-2 rounded-md  font-semibold lg:-ml-60 -ml-[11rem]"
                                        disabled={isSubmitting}>
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="-mt-3 flex">
                            <div>
                                <div>
                                    <h1 className="font-bold text-2xl mt-8 lg:-ml-[64%] -ml-[6rem]">Paint Order Copy </h1>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853] overflow-x-auto">
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
                                                    <td className="p-2 w-36">{parseFloat(item.area).toFixed(2)}</td>
                                                    <td className="p-2 w-36">{parseFloat(item.orderQty).toFixed(2)}L</td>
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
                            <div className="ml-10">
                                <div >
                                    <h1 className="font-bold text-2xl mt-8 lg:-ml-[60%] -ml-20">Paint Stocking Chart </h1>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853] overflow-x-auto">
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
                    <div ref={scrollRef} className=" p-6 bg-[#FFFFFF] ml-6 mr-6 rounded-lg overflow-x-auto select-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}>
                        <div className="rounded-lg border-l-8 border-l-[#BF9853] flex -mt-3 " id="full-table">
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
                                                value={commonExteriorHeight}
                                                placeholder="H"
                                                onChange={(e) => {
                                                    setCommonExteriorHeight(e.target.value);
                                                    const updatedFloors = exteriorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            height: e.target.value,
                                                        })),
                                                    }));
                                                    setExteriorFloors(updatedFloors);
                                                }}
                                                className=" -mt-3 ml-2 w-12 text-center bg-transparent h-8 border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg focus:outline-none"
                                            />
                                        </td>
                                        <th></th>
                                        <th></th>
                                        <td>
                                            <Select
                                                options={[
                                                    { value: "No", label: "No" },
                                                    { value: "Wall", label: "Wall" },
                                                    { value: "Ceiling", label: "Ceiling" },
                                                    { value: "Both", label: "Both" },
                                                ]}
                                                value={commonExteriorPutty ? { value: commonExteriorPutty, label: commonExteriorPutty } : null}
                                                onChange={(selectedOption) => {
                                                    const puttyValue = selectedOption ? selectedOption.value : "No";
                                                    setCommonExteriorPutty(puttyValue);
                                                    const updatedFloors = exteriorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            putty: puttyValue,
                                                        })),
                                                    }));
                                                    setExteriorFloors(updatedFloors);
                                                }}
                                                className="border rounded w-24 h-9"
                                                placeholder=""
                                                isSearchable={true}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        textAlign: 'left',
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
                                                menuPosition="fixed"
                                            />
                                        </td>
                                        <td>
                                            <Select
                                                options={[
                                                    { value: "No", label: "No" },
                                                    { value: "Wall", label: "Wall" },
                                                    { value: "Ceiling", label: "Ceiling" },
                                                    { value: "Both", label: "Both" },
                                                ]}
                                                value={commonExteriorPrimer ? { value: commonExteriorPrimer, label: commonExteriorPrimer } : null}
                                                onChange={(selectedOption) => {
                                                    const primerValue = selectedOption ? selectedOption.value : "No";
                                                    setCommonExteriorPrimer(primerValue);
                                                    const updatedFloors = exteriorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            primer: primerValue,
                                                        })),
                                                    }));
                                                    setExteriorFloors(updatedFloors);
                                                }}
                                                className="border rounded w-24 h-9"
                                                placeholder=""
                                                isSearchable={true}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        textAlign: 'left',
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
                                                menuPosition="fixed"
                                            />
                                        </td>
                                        <td>
                                            <Select
                                                options={[
                                                    { value: "No", label: "No" },
                                                    { value: "1 Coat", label: "1 Coat" },
                                                    { value: "2 Coat", label: "2 Coat" },
                                                ]}
                                                value={commonExteriorWallCoat ? { value: commonExteriorWallCoat, label: commonExteriorWallCoat } : null}
                                                onChange={(selectedOption) => {
                                                    const wallCoatValue = selectedOption ? selectedOption.value : "No";
                                                    setCommonExteriorWallCoat(wallCoatValue);
                                                    const updatedFloors = exteriorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            WallCoat: wallCoatValue,
                                                        })),
                                                    }));
                                                    setExteriorFloors(updatedFloors);
                                                }}
                                                className="border rounded w-24 h-9"
                                                placeholder=""
                                                isSearchable={true}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        textAlign: 'left',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
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
                                                options={[
                                                    { value: "No", label: "No" },
                                                    { value: "1 Coat", label: "1 Coat" },
                                                    { value: "2 Coat", label: "2 Coat" },
                                                ]}
                                                value={commonExteriorCeilingCoat ? { value: commonExteriorCeilingCoat, label: commonExteriorCeilingCoat } : null}
                                                onChange={(selectedOption) => {
                                                    const ceilingCoatValue = selectedOption ? selectedOption.value : "No";
                                                    setCommonExteriorCeilingCoat(ceilingCoatValue);
                                                    const updatedFloors = exteriorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            ceilingCoat: ceilingCoatValue,
                                                        })),
                                                    }));
                                                    setExteriorFloors(updatedFloors);
                                                }}
                                                className="border rounded w-24 h-9"
                                                placeholder=""
                                                isSearchable={true}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        textAlign: 'left',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
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
                                                options={[
                                                    { value: "No", label: "No" },
                                                    { value: "Yes", label: "Yes" },
                                                ]}
                                                value={commonExteriorWaterProof ? { value: commonExteriorWaterProof, label: commonExteriorWaterProof } : null}
                                                onChange={(selectedOption) => {
                                                    const waterProofValue = selectedOption ? selectedOption.value : "No";
                                                    setCommonExteriorWaterProof(waterProofValue);
                                                    const updatedFloors = exteriorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            waterproof: waterProofValue,
                                                        })),
                                                    }));
                                                    setExteriorFloors(updatedFloors);
                                                }}
                                                className="border rounded w-24 h-9"
                                                placeholder=""
                                                isSearchable={true}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        textAlign: 'left',
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
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
                                                options={Array.from({ length: 16 }, (_, index) => ({
                                                    value: index,
                                                    label: `${index}%`,
                                                }))}
                                                value={{ value: commonExteriorWastagePercentage, label: `${commonExteriorWastagePercentage}%` }}
                                                onChange={(selectedOption) => {
                                                    const wastageValue = selectedOption ? selectedOption.value : 0;
                                                    setCommonExteriorWastagePercentage(wastageValue);
                                                    const updatedFloors = exteriorFloors.map((floor) => ({
                                                        ...floor,
                                                        tiles: floor.tiles.map((tile) => ({
                                                            ...tile,
                                                            wastagePercentage: wastageValue,
                                                        })),
                                                    }));
                                                    setExteriorFloors(updatedFloors);
                                                }}
                                                className="border rounded w-24 h-9"
                                                placeholder=""
                                                isSearchable={true}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        textAlign: 'left',
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
                                                menuPosition="fixed"
                                            />
                                        </td>
                                        <td>
                                            <Select
                                                className="bg-transparent ml-4 w-72"
                                                value={commonExteriorPaint ? { label: commonExteriorPaint, value: commonExteriorPaint } : null}
                                                onChange={handleCommonExteriorPaintChange}
                                                options={paintVariants
                                                    .filter((variant) => variant.paintType === "Exterior")
                                                    .map((variant) => ({
                                                        label: variant.paintName,
                                                        value: variant.paintName,
                                                    }))
                                                }
                                                placeholder="Select Common Paint.."
                                                isSearchable
                                                isClearable
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        textAlign: 'left',
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
                                                menuPosition="fixed"
                                            />
                                        </td>
                                        <td>
                                            <Select
                                                className="bg-transparent ml-4 w-64"
                                                value={commonExteriorPaintColor ? { label: commonExteriorPaintColor, value: commonExteriorPaintColor } : null}
                                                onChange={handleCommonExteriorPaintColorChange}
                                                options={paints.map((paint) => ({
                                                    label: paint.paintColor,
                                                    value: paint.paintColor,
                                                }))}
                                                placeholder="Select Paint Color.."
                                                isSearchable
                                                isClearable
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        textAlign: 'left',
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
                                                menuPosition="fixed"
                                            />
                                        </td>
                                    </tr>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-40 text-left pl-2" rowSpan="2">Discription</th>
                                        <th className="w-32 text-lg " colSpan="3" style={{ letterSpacing: '0.2em' }}>Measurement</th>
                                        <th className="w-14 " rowSpan="2">Deduction Area (sqft)</th>
                                        <th className="w-12 " rowSpan="2">Area (sqft)</th>
                                        <th className="w-16 " rowSpan="2">Putty</th>
                                        <th className="w-16 " rowSpan="2">Primer</th>
                                        <th className="w-16 " rowSpan="2">Wall Coat</th>
                                        <th className="w-16 " rowSpan="2">Floor Coat</th>
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
                                            <tr className="bg-gray-50 ">
                                                <td colSpan="15" className="font-bold text-left group">
                                                    {floor.floorName !== null && (
                                                        <div className=" flex">
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
                                                            <div className="items-center flex space-x-4 invisible group-hover:visible">
                                                                <button onClick={() => deleteExteriorFloor(floorIndex)} className="delete-floor-button">
                                                                    <img src={deletes} alt="delete" className="w-8 h-4" />
                                                                </button>
                                                                <button onClick={() => addAreaRowExterior(floorIndex)}>
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
                                                                    <button onClick={() => deleteAreaRow(floorIndex, tileIndex, "exterior")} className="ml-2">
                                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-1 ">
                                                            <div className="flex">
                                                                <input
                                                                    type="text"
                                                                    name="length"
                                                                    placeholder="L"
                                                                    value={tile.length}
                                                                    readOnly
                                                                    onChange={(e) => handleExteriorTileChange(floorIndex, tileIndex, e)}
                                                                    className="px-2 w-14 bg-transparent  hover:border focus:outline-none text-center" />
                                                                <button
                                                                    className="text-[#E4572E]"
                                                                    onClick={() => openLengthPopupScreen(floorIndex, tileIndex)}
                                                                >
                                                                    L
                                                                </button>
                                                            </div>
                                                        </td>
                                                        {lengthPopupState[`${floorIndex}-${tileIndex}`] && (
                                                            <div
                                                                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                                                                onClick={() => closelengthPopup(floorIndex, tileIndex)} >
                                                                <div
                                                                    className="bg-white rounded-md w-[54rem] py-2 relative z-50"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <div className="flex mb-4 mt-2">
                                                                        <label className="text-[#E4572E] text-xl font-bold ml-[14rem] w-96">
                                                                            {floor.areaName} - Length
                                                                        </label>
                                                                        <button
                                                                            className="text-[#E4572E] ml-[14rem] -mt-4"
                                                                            onClick={() => closelengthPopup(floorIndex, tileIndex)}
                                                                        >
                                                                            <img src={cross} alt="close" className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                    <div className="overflow-x-auto">
                                                                        <div className="max-h-[38rem] overflow-y-auto">
                                                                            <table className="min-w-full border-collapse border border-gray-300">
                                                                                <tbody className="odd:bg-white even:bg-[#FAF6ED]">
                                                                                    {[...Array(30)].map((_, index) => (
                                                                                        <tr key={index}>
                                                                                            <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                                                                                                {index + 1}
                                                                                            </td>
                                                                                            <td className="border border-gray-300 px-4 py-2">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    className="w-40 border rounded px-2 py-1"
                                                                                                    placeholder="Type"
                                                                                                    value={lengthPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.type || ""}
                                                                                                    onChange={(e) => {
                                                                                                        const updatedData = [...(lengthPopupData[`${floorIndex}-${tileIndex}`] || [])];
                                                                                                        if (!updatedData[index]) updatedData[index] = {};
                                                                                                        updatedData[index].type = e.target.value;
                                                                                                        handleLengthPopupDataChange(floorIndex, tileIndex, updatedData);
                                                                                                    }}
                                                                                                />
                                                                                            </td>
                                                                                            <td className="border border-gray-300 px-4 py-2">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    className="w-40 border rounded px-2 py-1"
                                                                                                    placeholder="Measurement"
                                                                                                    name="lengthMeasurement"
                                                                                                    value={lengthPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.measurement || ""}
                                                                                                    onChange={(e) => {
                                                                                                        handleLengthMeasurementChange(e.target.value, floorIndex, tileIndex, index);
                                                                                                    }}
                                                                                                />
                                                                                            </td>
                                                                                            <td className="border border-gray-300 px-4 py-2">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    className="w-40 border rounded px-2 py-1"
                                                                                                    placeholder="Qty"
                                                                                                    value={lengthPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.qty || ""}
                                                                                                    onChange={(e) => handleLengthQtyChange(e, floorIndex, tileIndex, index)}
                                                                                                />
                                                                                            </td>
                                                                                            <td className="border border-gray-300 px-4 py-2">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    className="w-40 border rounded px-2 py-1"
                                                                                                    placeholder="Output"
                                                                                                    value={lengthPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.output || ""}
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
                                                                                        <td colSpan="3" className="border border-gray-300 px-4 py-2 text-right font-bold">
                                                                                            Total:
                                                                                        </td>
                                                                                        <td className="border border-gray-300 px-4 py-2">
                                                                                            {getTotalOutput(floorIndex, tileIndex)}
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
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
                                                                onKeyUp={(e) => handleExteriorKeyDown(floorIndex, tileIndex, e)}
                                                                onMouseEnter={() => setHoveredExteriorTileH({ floorIndex, tileIndex })}
                                                                onMouseLeave={() => setHoveredExteriorTileH({ floorIndex: null, tileIndex: null })}
                                                                className="px-2 w-14 bg-transparent hover:border focus:outline-none text-center" />
                                                        </td>
                                                        <td className="px-2 flex">
                                                            <input
                                                                type="text"
                                                                name="deductionArea"
                                                                value={tile.deductionArea}
                                                                onChange={(e) => handleExteriorTileChange(floorIndex, tileIndex, e)}
                                                                onKeyDown={(e) => handleDeductionKeyPress(floorIndex, tileIndex, e)}
                                                                placeholder="Enter calculation"
                                                                className="px-2 w-20 bg-transparent hover:border focus:outline-none"
                                                                readOnly
                                                            />
                                                            <button
                                                                className="text-[#E4572E]"
                                                                onClick={() => openExteriorDeductionPopup(floorIndex, tileIndex)}
                                                            >
                                                                D
                                                            </button>
                                                        </td>
                                                        {exteriorDeductionPopupState[`${floorIndex}-${tileIndex}`] && (
                                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={() => closeExteriorDeductionPopup(floorIndex, tileIndex)}>
                                                                <div className="bg-white rounded-md w-[54rem] py-2 relative z-50" onClick={(e) => e.stopPropagation()}>
                                                                    <div className="flex mb-4 mt-2">
                                                                        <label className="text-[#E4572E] text-xl font-bold ml-[20rem]">{floor.areaName} - Deduction</label>
                                                                        <button className="text-[#E4572E] ml-[12rem]" onClick={() => closeExteriorDeductionPopup(floorIndex, tileIndex)}>
                                                                            <img src={cross} alt="close" className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                    <div className="overflow-x-auto">
                                                                        <div className="max-h-[38rem] overflow-y-auto">
                                                                            <table className="min-w-full border-collapse border border-gray-300 ">
                                                                                <tbody className="odd:bg-white even:bg-[#FAF6ED]">
                                                                                    {[...Array(16)].map((_, index) => (
                                                                                        <tr key={index} >
                                                                                            <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                                                                                                {index + 1}
                                                                                            </td>
                                                                                            <td className="border border-gray-300 px-4 py-2">
                                                                                                <CreatableSelect
                                                                                                    isClearable
                                                                                                    options={deductionType}
                                                                                                    value={
                                                                                                        exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.type
                                                                                                            ? {
                                                                                                                value: exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`][index].type,
                                                                                                                label: exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`][index].type
                                                                                                            }
                                                                                                            : null
                                                                                                    }
                                                                                                    onChange={(selectedOption) => handleExteriorTypeChange(selectedOption, floorIndex, tileIndex, index)}
                                                                                                    placeholder="Type"
                                                                                                    menuPortalTarget={document.body}
                                                                                                    styles={{
                                                                                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                        menu: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                        control: (base) => ({ ...base, backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }),
                                                                                                    }}
                                                                                                />
                                                                                            </td>

                                                                                            <td className="border border-gray-300 px-2 py-2">
                                                                                                <CreatableSelect
                                                                                                    isClearable
                                                                                                    options={deductionMeasurment}
                                                                                                    value={
                                                                                                        exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.measurement
                                                                                                            ? {
                                                                                                                value: exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`][index].measurement,
                                                                                                                label: exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`][index].measurement,
                                                                                                            }
                                                                                                            : null
                                                                                                    }
                                                                                                    onChange={(selectedOption) =>
                                                                                                        handleExteriorMeasurementChange(selectedOption, floorIndex, tileIndex, index)
                                                                                                    }
                                                                                                    placeholder="Measurement"
                                                                                                    menuPortalTarget={document.body}
                                                                                                    styles={{
                                                                                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                        menu: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                        control: (base) => ({
                                                                                                            ...base,
                                                                                                            backgroundColor: 'transparent',
                                                                                                            border: 'none',
                                                                                                            boxShadow: 'none',
                                                                                                        }),
                                                                                                    }}
                                                                                                />
                                                                                            </td>

                                                                                            <td className="border border-gray-300 px-2 py-2">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    className="w-12 border rounded px-2 py-1"
                                                                                                    placeholder="Qty"
                                                                                                    value={exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.qty || ""}
                                                                                                    onChange={(e) => handleExteriorQtyChange(e, floorIndex, tileIndex, index)}
                                                                                                />
                                                                                            </td>
                                                                                            <td className="border border-gray-300 px-2 py-2">
                                                                                                <select
                                                                                                    className="w-24 border rounded px-2 py-1"
                                                                                                    value={exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.location ?? "Wall"}
                                                                                                    onChange={(e) => handleExteriorLocationChange(e, floorIndex, tileIndex, index)}
                                                                                                >
                                                                                                    <option value="">Select..</option>
                                                                                                    <option value="Wall">Wall</option>
                                                                                                    <option value="Ceiling">Ceiling</option>
                                                                                                </select>
                                                                                            </td>
                                                                                            <td className="border border-gray-300 py-2">
                                                                                                <CreatableSelect
                                                                                                    className="w-32"
                                                                                                    options={deductionThickness}
                                                                                                    value={
                                                                                                        exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.thickness
                                                                                                            ? { value: exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`][index].thickness, label: exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`][index].thickness }
                                                                                                            : null
                                                                                                    }
                                                                                                    onChange={(selectedOption) => handleExteriorThicknessChange(selectedOption, floorIndex, tileIndex, index)}
                                                                                                    placeholder="Thickness"
                                                                                                    menuPortalTarget={document.body}
                                                                                                    styles={{
                                                                                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                        menu: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                        control: (base) => ({ ...base, backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }),
                                                                                                    }}
                                                                                                />
                                                                                            </td>
                                                                                            <td className="border border-gray-300 px-2 py-2">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    className="w-20 border rounded px-2 py-1"
                                                                                                    placeholder="Output"
                                                                                                    value={exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.output || ""}
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
                                                                                            {getExteriorTotalThickness(floorIndex, tileIndex).total}
                                                                                        </td>
                                                                                        <td className="px-4 py-2">
                                                                                            {exteriorDeductionPopupData[`${floorIndex}-${tileIndex}`]?.reduce((total, row) => {
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
                                                        <td className="px-2 ">
                                                            <div className="w-16">
                                                                {tile.length && (tile.breadth || tile.height) ? (
                                                                    (() => {
                                                                        const length = parseFeetInches(tile.length);
                                                                        const height = parseFeetInches(tile.height);
                                                                        const deductionArea = Number(tile.deductionArea || 0);
                                                                        const totalOrderedTile = (length * height) - deductionArea;
                                                                        return totalOrderedTile.toFixed(2);
                                                                    })()
                                                                ) : (
                                                                    "0"
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-2">
                                                            <Select
                                                                name="putty"
                                                                options={[
                                                                    { value: "No", label: "No" },
                                                                    { value: "Wall", label: "Wall" },
                                                                    { value: "Ceiling", label: "Ceiling" },
                                                                    { value: "Both", label: "Both" },
                                                                ]}
                                                                value={tile.putty ? { value: tile.putty, label: tile.putty } : { value: "No", label: "No" }}
                                                                onChange={(selectedOption) => {
                                                                    const updatedFloors = [...exteriorFloors];
                                                                    updatedFloors[floorIndex].tiles[tileIndex].putty = selectedOption ? selectedOption.value : "No";
                                                                    setExteriorFloors(updatedFloors);
                                                                }}
                                                                className="w-32 bg-transparent"
                                                                placeholder="Select Putty"
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
                                                        <td className="px-2">
                                                            <select
                                                                name="primer"
                                                                className="bg-transparent"
                                                                value={tile.primer || "No"}
                                                                onChange={(e) => handleExteriorChange(e, floorIndex, tileIndex)}>
                                                                <option>Wall</option>
                                                                <option>Ceiling</option>
                                                                <option>Both</option>
                                                                <option>No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                name="WallCoat"
                                                                className="bg-transparent"
                                                                value={tile.WallCoat || "No"}
                                                                onChange={(e) => handleExteriorChange(e, floorIndex, tileIndex)}>
                                                                <option>1 Coat</option>
                                                                <option>2 Coat</option>
                                                                <option>No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                name="ceilingCoat"
                                                                className="bg-transparent"
                                                                value={tile.ceilingCoat || "No"}
                                                                onChange={(e) => handleExteriorChange(e, floorIndex, tileIndex)}>
                                                                <option>1 Coat</option>
                                                                <option>2 Coat</option>
                                                                <option>No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <select
                                                                name="waterproof"
                                                                className="bg-transparent"
                                                                value={tile.waterproof || "No"}
                                                                onChange={(e) => handleExteriorChange(e, floorIndex, tileIndex)}>
                                                                <option>Yes</option>
                                                                <option>No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-2 ">
                                                            <select
                                                                name="wastagePercentage"
                                                                value={tile.wastagePercentage}
                                                                onChange={(e) => handleExteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="  w-16 bg-gray-200 focus:outline-none">
                                                                {Array.from({ length: 16 }, (_, index) => (
                                                                    <option key={index} value={index}>
                                                                        {index}%
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-2">
                                                            <Select
                                                                className="bg-transparent ml-10 w-72"
                                                                value={tile.selectedPaint ? { label: tile.selectedPaint, value: tile.selectedPaint } : null}
                                                                onChange={(selectedOption) => {
                                                                    const updatedFloors = [...exteriorFloors];
                                                                    updatedFloors[floorIndex].tiles[tileIndex].selectedPaint = selectedOption ? selectedOption.value : null;
                                                                    setExteriorFloors(updatedFloors);
                                                                }}
                                                                options={paintVariants
                                                                    .filter((variant) => variant.paintType === "Exterior")
                                                                    .map((variant) => ({
                                                                        label: variant.paintName,
                                                                        value: variant.paintName,
                                                                    }))
                                                                }
                                                                placeholder="Select Exterior Paint..."
                                                                isSearchable
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
                                                        <td className="px-2">
                                                            <Select
                                                                className="bg-transparent w-64"
                                                                value={tile.selectedPaintColor ? { label: tile.selectedPaintColor, value: tile.selectedPaintColor } : null}
                                                                onChange={(selectedOption) => handleExteriorChange(selectedOption, floorIndex, tileIndex)}
                                                                options={paints.map((paint) => ({
                                                                    label: paint.paintColor,
                                                                    value: paint.paintColor,
                                                                }))}
                                                                placeholder="Select Paint Color.."
                                                                isSearchable
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
                                                        <td className="px-2">
                                                            <div className="w-32 ml-2">
                                                                {tile.length && (tile.breadth || tile.height) ? (
                                                                    (() => {
                                                                        const length = parseFeetInches(tile.length);
                                                                        const height = parseFeetInches(tile.height);
                                                                        const wastagePercentage = Number(tile.wastagePercentage);
                                                                        const deductionArea = Number(tile.deductionArea || 0);
                                                                        const wastage = wastagePercentage / 100;
                                                                        const selectedPaint = paintVariants.find(
                                                                            (variant) => variant.paintName === tile.selectedPaint
                                                                        );
                                                                        const paintCoverBySqft = selectedPaint?.paintCoverBySqft || 1;
                                                                        const totalOrderedTile = length * height - deductionArea;
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
                            <button type="button" className="text-[#E4572E] mt-6 mb-20 lg:-ml-[94%] -ml-[70%] border-dashed border-b-2 border-[#BF9853] font-semibold"
                                onClick={addFloorRowExterior}>
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
                                <button
                                    className="bg-[#E4572E] text-white lg:px-4 px-1 py-1 rounded w-52 h-10 ml-4 "
                                    onClick={handleExteriorPuttyBillClick}>
                                    Generate Putty Bill
                                </button>
                            </div>
                            <div>
                                <button
                                    className="bg-[#E4572E] text-white lg:px-4 px-1 py-1 rounded w-52 h-10 ml-4 "
                                    onClick={handleExteriorPaintBillClick}>
                                    Generate Paint Bill
                                </button>
                            </div>
                            <div className="flex ml-[105%] lg:ml-[22%]">
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
                                    <table className="table-auto mt-2 w-[40rem]">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="font-extrabold w-12 p-2 text-left">S.No</th>
                                                <th className="p-2 w-48 text-left font-extrabold">Paint Name</th>
                                                <th className="p-2 w-40 text-left font-extrabold">Color Code</th>
                                                <th className=" w-20 font-extrabold">Total Area</th>
                                                <th className=" w-20 font-extrabold">Litre</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exteriorSummaryData.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="p-2 text-left ">{(index + 1).toString().padStart(1, '0')}</td>
                                                    <td className="p-2 text-left ">{item.paintName}</td>
                                                    <td className="p-2 text-left ">{item.paintColor}</td>
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
                                    <table id="summaryTable" className="table-auto mt-2 w-[44rem]">
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
                                    <table className="max-w-full">
                                        <thead>
                                            <tr className="bg-[#FAF6ED] group">
                                                <th className="p-2 text-left flex gap-32">Paint Type
                                                    <div className="items-center flex space-x-4 invisible group-hover:visible">
                                                        <button onClick={() => addAreaRowOthers()}>
                                                            <img src={add} alt="add" className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className="p-2">Height</th>
                                                <th className="p-2">Deduction</th>
                                                <th className="p-2">Area (Sqft)</th>
                                                <th className="p-2">Wastage (%)</th>
                                                <th className="p-2">Product Variant</th>
                                                <th className="p-2">Color Code</th>
                                                <th className="p-2">Order Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tilesData.map((tile, index) => {
                                                const filteredPaintOptions = paintVariants
                                                    .filter((variant) => variant.paintType === tile.paintItem)
                                                    .map((variant) => ({
                                                        label: variant.paintName,
                                                        value: variant.paintName,
                                                    }));

                                                return (
                                                    <tr key={index} className="odd:bg-white even:bg-[#FAF6ED]">
                                                        <td className="p-2 flex group">
                                                            <select
                                                                value={tile.paintItem}
                                                                onChange={(e) => handleChange(e, index, 'paintItem')}
                                                                className="w-60 bg-transparent"
                                                            >
                                                                <option value="" disabled>Select Item...</option>
                                                                {paintItems.map((item, idx) => (
                                                                    <option key={idx} value={item.paintItem}>
                                                                        {item.paintItem}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <div key={index} className="items-center flex space-x-4 invisible group-hover:visible">
                                                                <button onClick={() => addAreaRowOthers(index)}>
                                                                    <img src={add} alt="add" className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => deleteAreaRowOthers(index, "exterior")} className="ml-2">
                                                                    <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="text"
                                                                value={tile.height}
                                                                onChange={(e) => handleChange(e, index, 'height')}
                                                                className="w-20 px-2 bg-transparent"
                                                                placeholder="Height"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="text"
                                                                value={tile.deduction}
                                                                onChange={(e) => handleChange(e, index, 'deduction')}
                                                                onKeyDown={(e) => handleOthersDeductionKeyPress(e, index)}
                                                                className="w-20 px-2 bg-transparent"
                                                                placeholder="Deduction"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <div>{tile.calculatedAreas}</div>
                                                        </td>
                                                        <td className="p-2">
                                                            <select
                                                                value={tile.wastage}
                                                                onChange={(e) => handleChange(e, index, 'wastage')}
                                                                className="w-16 bg-transparent">
                                                                {Array.from({ length: 16 }, (_, index) => (
                                                                    <option key={index} value={index}>
                                                                        {index}%
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="p-2">
                                                            <Select
                                                                value={
                                                                    filteredPaintOptions.find((option) => option.value === tile.selectedPaint) || null
                                                                }
                                                                onChange={(selectedOption) =>
                                                                    handleChange(
                                                                        { target: { value: selectedOption?.value || "" } },
                                                                        index,
                                                                        "selectedPaint"
                                                                    )
                                                                }
                                                                options={filteredPaintOptions}
                                                                placeholder="Select Product..."
                                                                isSearchable={true}
                                                                className="w-60 bg-transparent"
                                                                menuPortalTarget={document.body}
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
                                                        <td className="p-2">
                                                            <Select
                                                                value={
                                                                    paintColors.find((option) => option.value === tile.selectedPaintColor) || null
                                                                }
                                                                onChange={(selectedOption) =>
                                                                    handleChange(
                                                                        { target: { value: selectedOption?.value || "" } },
                                                                        index,
                                                                        'selectedPaintColor'
                                                                    )
                                                                }
                                                                options={paintColors}
                                                                placeholder="Select Paint..."
                                                                isSearchable={true}
                                                                className="w-60 bg-transparent"
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
                                                                menuPortalTarget={document.body}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <div>{tile.calculatedOrderQtys} L</div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className=" flex">
                                <div className=" mt-8">
                                    <h3 className="text-lg font-semibold mt-5 -ml-[28rem]">Paint Order Copy</h3>
                                    <div className="rounded-lg border-l-8 border-l-[#BF9853] ml-2">
                                        <table className="min-w-full mt-4">
                                            <thead>
                                                <tr className="bg-[#FAF6ED]">
                                                    <th className="font-extrabold p-2">S.No</th>
                                                    <th className="p-2 text-left">Product Variant</th>
                                                    <th className="p-2 text-left">Color Code</th>
                                                    <th className="p-2">Area (Sqft)</th>
                                                    <th className="p-2">Order Qty (L)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getGroupedSummary().map((group, index) => (
                                                    <tr key={index} className="odd:bg-white even:bg-[#FAF6ED]">
                                                        <td className="p-2 text-left">{(index + 1).toString().padStart(1, '0')}</td>
                                                        <td className="p-2 w-44 text-left">{group.selectedPaint}</td>
                                                        <td className="p-2 w-36 text-left">{group.selectedPaintColor}</td>
                                                        <td className="p-2">{group.totalArea}</td>
                                                        <td className="p-2">{group.totalOrderQty.toFixed(2)} L</td>
                                                    </tr>
                                                ))}
                                                <tr className="font-bold">
                                                    <td className="px-2"></td>
                                                    <td className="px-2">Total</td>
                                                    <td className="px-2"></td>
                                                    <td className="px-2">{getOthersTableTotalSummary().totalArea}</td>
                                                    <td className="px-2">{getOthersTableTotalSummary().totalOrderQty.toFixed(2)} L</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className=" mt-8 ml-10">
                                    <h3 className="text-lg font-semibold mt-5 -ml-[39rem] mb-4">Paint Stocking Chart</h3>
                                    <div className="rounded-lg border-l-8 border-l-[#BF9853] ml-2">
                                        <table className="min-w-full border-collapse">
                                            <thead>
                                                <tr className="bg-[#FAF6ED]">
                                                    <th className="font-extrabold p-2">S.No</th>
                                                    <th className="font-extrabold p-2 text-left">Floor Name</th>
                                                    <th className="font-extrabold p-2 text-left">Paint Type</th>
                                                    <th className="p-2 text-left">Product Variant</th>
                                                    <th className="p-2 text-left">Color Code</th>
                                                    <th className="p-2">Area (Sqft)</th>
                                                    <th className="p-2">Order Qty (L)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groupAndSumData(tilesData).map((row, index) => (
                                                    <tr key={index} className="odd:bg-white even:bg-[#FAF6ED]">
                                                        <td className="p-2 text-left">{(index + 1).toString().padStart(1, '0')}</td>
                                                        <td className="p-2 text-left">{row.floorName}</td>
                                                        <td className="p-2 w-32 text-left">{row.paintType}</td>
                                                        <td className="p-2 w-44 text-left">{row.productVariant}</td>
                                                        <td className="p-2 w-36 text-left">{row.colorCode}</td>
                                                        <td className="p-2">{row.totalArea.toFixed(2)}</td>
                                                        <td className="p-2">{row.totalOrderQty.toFixed(2)} L</td>
                                                    </tr>
                                                ))}
                                                <tr className="font-bold">
                                                    <td className="px-2"></td>
                                                    <td className="px-2"></td>
                                                    <td className="px-2"></td>
                                                    <td className="px-2">Total</td>
                                                    <td className="px-2"></td>
                                                    <td className="px-2">{getOthersTableTotalSummary().totalArea}</td>
                                                    <td className="px-2">{getOthersTableTotalSummary().totalOrderQty.toFixed(2)} L</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
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
                            <div className="">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="font-bold text-lg ml-2">Others</label>
                                    <label className="font-bold text-base">Print</label>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853] ml-2">
                                    <table className="min-w-full mt-4">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="font-extrabold p-2">S.No</th>
                                                <th className="p-2 text-left">Paint Type</th>
                                                <th className="p-2 text-left">Paint Color</th>
                                                <th className="p-2">Area (Sqft)</th>
                                                <th className="p-2">Order Qty (L)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getGroupedSummary().map((group, index) => (
                                                <tr key={index}>
                                                    <td className="p-2 text-left">{(index + 1).toString().padStart(1, '0')}</td>
                                                    <td className="p-2 w-44 text-left">{group.selectedPaint}</td>
                                                    <td className="p-2 w-36 text-left">{group.selectedPaintColor}</td>
                                                    <td className="p-2">{group.totalArea}</td>
                                                    <td className="p-2">{group.totalOrderQty.toFixed(2)}L</td>
                                                </tr>
                                            ))}
                                            <tr className="font-bold">
                                                <td className="px-2"></td>
                                                <td className="px-2">Total</td>
                                                <td className="px-2"></td>
                                                <td className="px-2">{getOthersTableTotalSummary().totalArea}</td>
                                                <td className="px-2">{getOthersTableTotalSummary().totalOrderQty.toFixed(2)}L</td>
                                            </tr>
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
                        className="bg-white rounded-md w-[54rem] py-2"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex mb-4 mt-2">
                            <label className="text-[#E4572E] text-xl font-bold ml-[2%]">Ceiling Coat</label>
                            <div className=" ml-[3rem] w-56">
                                <Select
                                    value={commonPaintName ? { label: commonPaintName, value: commonPaintName } : null}
                                    onChange={(selectedOption) => handleCommonPaintNameChange(selectedOption ? selectedOption.value : "")}
                                    options={paintVariants.map(variant => ({
                                        label: variant.paintName,
                                        value: variant.paintName,
                                    }))}
                                    placeholder="Select Paint Variant"
                                    isSearchable
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
                            <div className=" ml-[1rem] w-56">
                                <Select
                                    value={commonPaintColors ? { label: commonPaintColors, value: commonPaintColors } : null}
                                    onChange={(selectedOption) => handleCommonPaintColorChanges(selectedOption ? selectedOption.value : "")}
                                    options={paints.map(paint => ({
                                        label: paint.paintColor,
                                        value: paint.paintColor,
                                    }))}
                                    placeholder="Select Paint Color"
                                    isSearchable
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
                            <div className="mt-2 ml-[3rem]">
                                <select
                                    name="wastagePercentage"
                                    value={ceilingCommonWastage}
                                    className="w-14 focus:outline-none"
                                    onChange={(e) => handleCeilingCommonWastage(e.target.value)}>
                                    {Array.from({ length: 16 }, (_, i) => (
                                        <option key={i} value={i}>
                                            {i}%
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button className="text-[#E4572E] ml-[5.5rem] -mt-11" onClick={closeCeilingCoatPopup}>
                                <img src={cross} alt="close" className="w-4 h-4" />
                            </button>
                        </div>
                        <table className="w-full">
                            <thead className="p-2">
                                <tr className="bg-[#FAF6ED]">
                                    <th className="py-2 pl-4 text-left">Description</th>
                                    <th className="text-left py-2 ">Paint Variant</th>
                                    <th className="text-left py-2">Color Code</th>
                                    <th className="py-2">Area</th>
                                    <th className="py-2">Wastage</th>
                                    <th className="py-2 pr-4">Order Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, index) => (
                                    <tr key={index}>
                                        <td className="w-40 border-b py-2 pl-4 text-left">{row.floorName}</td>
                                        <td className="text-left w-56 border-b ">
                                            <Select
                                                value={selectedPaintNames[index] ? { label: selectedPaintNames[index], value: selectedPaintNames[index] } : null}
                                                onChange={(selectedOption) => handlePaintNameChange(index, selectedOption ? selectedOption.value : '')}
                                                options={paintVariants.map(variant => ({
                                                    label: variant.paintName,
                                                    value: variant.paintName,
                                                }))}
                                                placeholder="Select Paint Name.."
                                                isSearchable
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
                                        <td className="text-left w-56 border-b">
                                            <Select
                                                value={selectedPaintColors[index] ? { label: selectedPaintColors[index], value: selectedPaintColors[index] } : null}
                                                onChange={(selectedOption) => handlePaintColorChange(index, selectedOption ? selectedOption.value : '')}
                                                options={paints.map(paint => ({
                                                    label: paint.paintColor,
                                                    value: paint.paintColor,
                                                }))}
                                                placeholder="Select Paint Color.."
                                                isSearchable
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
                                        <td className="w-28 text-center border-b px-2">{row.totalOrderedTile.toFixed(2)}</td>
                                        <td className="px-2 w-24 border-b">
                                            <select
                                                name="wastagePercentage"
                                                value={wastageValues[index] || 0}
                                                className="w-14 focus:outline-none"
                                                onChange={(e) => handleWastageChange(index, e.target.value)} >
                                                {Array.from({ length: 16 }, (_, i) => (
                                                    <option key={i} value={i}>
                                                        {i}%
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="w-24 border-b py-2 pr-4">{calculateOrderQty(row, index)}L</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="4" className="h-4"></td>
                                </tr>
                                <tr>
                                    <td className="w-40 py-2"></td>
                                    <td className="w-40 py-2"></td>
                                    <td className="w-40 font-bold text-[#E4572E] text-lg py-2">Total</td>
                                    <td className="w-20 font-bold text-[#E4572E] text-lg py-2">{calculateTotalSum()} (Sqft)</td>
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
                                        isDisabled={!paintClientName}
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
                                    onClick={closeImportPopup}>
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
                        <h2 className="text-lg font-bold mb-4">Select an Customer Copy Option</h2>
                        <div className="space-y-2">
                            <div className="flex space-x-[5.2rem]">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="selection"
                                        value="Interior"
                                        className="appearance-none w-4 h-4 rounded-md bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:content-['✔'] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                                        className="appearance-none w-4 h-4 rounded-md bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:content-['✔'] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                                        className="appearance-none w-4 h-4 rounded-md bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:content-['✔'] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                                        className="appearance-none w-4 h-4 rounded-md bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:content-['✔'] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                                    className="appearance-none w-4 h-4 rounded-md bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:content-['✔'] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                        <h2 className="text-lg font-bold mb-4">Select an Order Copy Option</h2>
                        <div className="space-y-2">
                            <div className="flex space-x-[5.2rem]">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="ocSelection"
                                        value="Interior"
                                        className="appearance-none w-4 h-4 rounded-md bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:content-['✔'] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                                        className="appearance-none w-4 h-4 rounded-md bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:content-['✔'] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                                        className="appearance-none w-4 h-4 rounded-md bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:content-['✔'] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                                        className="appearance-none w-4 h-4 rounded-md bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:content-['✔'] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                                    className="appearance-none w-4 h-4 rounded-md bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:content-['✔'] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                                    className="appearance-none w-4 h-4 rounded-md bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:content-['✔'] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                                    className="appearance-none w-4 h-4 rounded-md bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:content-['✔'] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                                    className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                                    className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                                    className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
                                    className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
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
            {isPuttyBillOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">Select an Option</h2>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="puttyRateSelect"
                                    value="With Rate"
                                    className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                                    checked={puttyRateSelect === 'With Rate'}
                                    onChange={(e) => {
                                        setPuttyRateSelect(e.target.value);
                                        setPuttyRate('');
                                    }}
                                />
                                <span>With Rate</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="puttyRateSelect"
                                    value="Without Rate"
                                    className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                                    checked={puttyRateSelect === 'Without Rate'}
                                    onChange={(e) => {
                                        setPuttyRateSelect(e.target.value);
                                        setPuttyRate(null);
                                    }}
                                />
                                <span>Without Rate</span>
                            </label>
                        </div>
                        {puttyRateSelect === 'With Rate' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Enter Rate:
                                </label>
                                <input
                                    type="text"
                                    value={puttyRate || ''}
                                    onChange={(e) => setPuttyRate(e.target.value)}
                                    className="mt-1 p-2 border rounded w-full"
                                    placeholder="Enter rate here"
                                />
                            </div>
                        )}
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={handleClosePuttyBill}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-[#007233] text-white rounded hover:bg-[#005522]"
                                onClick={handleConfirmPuttyBill}
                                disabled={
                                    puttyRateSelect === 'With Rate' && !puttyRate
                                }
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isExteriorPuttyBillOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">Select an Option</h2>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="exteriorPuttyRateSelect"
                                    value="With Rate"
                                    checked={exteriorPuttyRateSelect === 'With Rate'}
                                    onChange={(e) => {
                                        setExteriorPuttyRateSelect(e.target.value);
                                        setExteriorPuttyRate('');
                                    }}
                                />
                                <span>With Rate</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="exteriorPuttyRateSelect"
                                    value="Without Rate"
                                    checked={exteriorPuttyRateSelect === 'Without Rate'}
                                    onChange={(e) => {
                                        setExteriorPuttyRateSelect(e.target.value);
                                        setExteriorPuttyRate(null);
                                    }}
                                />
                                <span>Without Rate</span>
                            </label>
                        </div>
                        {exteriorPuttyRateSelect === 'With Rate' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Enter Rate:
                                </label>
                                <input
                                    type="text"
                                    value={exteriorPuttyRate || ''}
                                    onChange={(e) => setExteriorPuttyRate(e.target.value)}
                                    className="mt-1 p-2 border rounded w-full"
                                    placeholder="Enter rate here"
                                />
                            </div>
                        )}
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={handleCloseExteriorPuttyBill}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-[#007233] text-white rounded hover:bg-[#005522]"
                                onClick={handleExteriorConfirmPuttyBill}
                                disabled={
                                    exteriorPuttyRateSelect === 'With Rate' && !exteriorPuttyRate
                                }
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isPaintBillOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">Select an Option</h2>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="primerRateSelect"
                                    value="With Rate"
                                    className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                                    checked={primerRateSelect === 'With Rate'}
                                    onChange={(e) => {
                                        setPrimerRateSelect(e.target.value);
                                        setPrimerRate(null);
                                        setWallCoatRate(null);
                                        setCeilingCoatRate(null);
                                    }}
                                />
                                <span>With Rate</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="primerRateSelect"
                                    value="Without Rate"
                                    className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                                    checked={primerRateSelect === 'Without Rate'}
                                    onChange={(e) => {
                                        setPrimerRateSelect(e.target.value);
                                        setPrimerRate(null);
                                        setWallCoatRate(null);
                                        setCeilingCoatRate(null);
                                    }}
                                />
                                <span>Without Rate</span>
                            </label>
                        </div>
                        {primerRateSelect === 'With Rate' && (
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Enter Primer Rate:
                                    </label>
                                    <input
                                        type="text"
                                        value={primerRate || ''}
                                        onChange={(e) => setPrimerRate(e.target.value)}
                                        className="mt-1 p-2 border rounded w-full"
                                        placeholder="Enter primer rate here"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Enter Wall Coat Rate:
                                    </label>
                                    <input
                                        type="text"
                                        value={wallCoatRate || ''}
                                        onChange={(e) => setWallCoatRate(e.target.value)}
                                        className="mt-1 p-2 border rounded w-full"
                                        placeholder="Enter wall coat rate here"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Enter Ceiling Coat Rate:
                                    </label>
                                    <input
                                        type="text"
                                        value={ceilingCoatRate || ''}
                                        onChange={(e) => setCeilingCoatRate(e.target.value)}
                                        className="mt-1 p-2 border rounded w-full"
                                        placeholder="Enter ceiling coat rate here"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={handleClosePaintBill}>
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-[#007233] text-white rounded hover:bg-[#005522]"
                                onClick={handleConfirmPaintBill}
                                disabled={
                                    primerRateSelect === 'With Rate' &&
                                    (!primerRate || !wallCoatRate || !ceilingCoatRate)
                                }
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isExteriorPaintBillOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">Select an Option</h2>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="exteriorPrimerRateSelect"
                                    value="With Rate"
                                    className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                                    checked={exteriorPrimerRateSelect === 'With Rate'}
                                    onChange={(e) => {
                                        setExteriorPrimerRateSelect(e.target.value);
                                        setExteriorPrimerRate(null);
                                        setExteriorWallCoatRate(null);
                                        setExteriorCeilingCoatRate(null);
                                    }}
                                />
                                <span>With Rate</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="exteriorPrimerRateSelect"
                                    value="Without Rate"
                                    className="appearance-none custom-checkbox w-4 h-4 rounded bg-slate-200 checked:bg-[#E2F9E1] checked:border-[#034638] checked:after:text-[#034638] checked:after:text-xs checked:after:font-bold checked:after:flex checked:after:justify-center checked:after:items-center"
                                    checked={exteriorPrimerRateSelect === 'Without Rate'}
                                    onChange={(e) => {
                                        setExteriorPrimerRateSelect(e.target.value);
                                        setExteriorPrimerRate(null);
                                        setExteriorWallCoatRate(null);
                                        setExteriorCeilingCoatRate(null);
                                    }}
                                />
                                <span>Without Rate</span>
                            </label>
                        </div>
                        {exteriorPrimerRateSelect === 'With Rate' && (
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Enter Primer Rate:
                                    </label>
                                    <input
                                        type="text"
                                        value={exteriorPrimerRate || ''}
                                        onChange={(e) => setExteriorPrimerRate(e.target.value)}
                                        className="mt-1 p-2 border rounded w-full"
                                        placeholder="Enter primer rate here"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Enter Wall Coat Rate:
                                    </label>
                                    <input
                                        type="text"
                                        value={exteriorWallCoatRate || ''}
                                        onChange={(e) => setExteriorWallCoatRate(e.target.value)}
                                        className="mt-1 p-2 border rounded w-full"
                                        placeholder="Enter wall coat rate here"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Enter Floor Coat Rate:
                                    </label>
                                    <input
                                        type="text"
                                        value={exteriorCeilingCoatRate || ''}
                                        onChange={(e) => setExteriorCeilingCoatRate(e.target.value || '0')}
                                        className="mt-1 p-2 border rounded w-full"
                                        placeholder="Enter Floor coat rate here"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={handleExteriorClosePaintBill}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-[#007233] text-white rounded hover:bg-[#005522]"
                                onClick={handleExteriorConfirmPaintBill}
                                disabled={
                                    exteriorPrimerRateSelect === 'With Rate' &&
                                    (!exteriorPrimerRate || !exteriorWallCoatRate)
                                }
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