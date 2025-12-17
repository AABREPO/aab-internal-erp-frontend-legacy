import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Right from '../Images/Right.svg'
import Wrong from '../Images/Worng.svg'
import delt from '../Images/Worng.svg';
import add from '../Images/Right.svg';
import uparrow from '../Images/arrow-up.png'
import downarrow from '../Images/down-arrow.png'
import leftarrow from '../Images/left-arrow.png'
import rightarrow from '../Images/right.png'
import cross from '../Images/cross.png';
import deletes from '../Images/Delete.svg';
import CreatableSelect from 'react-select/creatable';
import { evaluate } from "mathjs";

const RccCalculator = () => {
    const [floorss, setFloorss] = useState([
        {
            floorName: "Ground Floor",
            areaName: "",
            tiles: [
                {
                    type: "",
                    size: "",
                    length: "1'", length1: "", length2: "", length3: "", length4: "", length5: "", length6: "", length7: "", length8: "", length9: "", length10: "", length11: "",
                    length12: "", length13: "", length14: "", length15: "", length16: "", length17: "", length18: "", length19: "", length20: "", length21: "", length22: "", length23: "", length24: "",
                    length25: "", length26: "", length27: "", length28: "", length29: "", length30: "", length31: "", length32: "", length33: "", length34: "", length35: "", breadth: "",
                    height: "",
                    quantity: "1",
                    area: "",
                    deductionArea: "", deductionInput: "", deduction1: "", deduction2: "", deduction3: "", deduction4: "", deduction5: "", deduction6: "", deduction7: "", deduction8: "",
                    totalArea: "",
                    rate: "",
                    amount: "",
                    mix: "",
                    cement: "",
                    sand: "",
                    jally: "",
                    cementRate: "",
                    sandRate: "",
                    jallyRate: "",
                    totalValume: "",
                    labourRate: "",
                    totalAmountCft: "",
                    LabourAmount: "",
                    cementWastage: "",
                    sandWastage: "",
                    jallyWastage: "",
                    concreteTotalAmount: "",
                },
            ],
        },
    ]);
    const [deductionPopupState, setDeductionPopupState] = useState({});
    const [deductionPopupData, setDeductionPopupData] = useState({});
    const [deductionInputs, setDeductionInputs] = useState({});
    const [deductionRowWiseInputs, setDeductionRowWiseInputs] = useState({});
    const [lengthPopupState, setLengthPopupState] = useState({});
    const [lengthPopupData, setLengthPopupData] = useState({});
    const [selectedTile, setSelectedTile] = useState({ floorIndex: null, tileIndex: null });
    const [hoveredRcc, setHoveredRcc] = useState({ floorIndex: null, tileIndex: null });
    const [selectedFloors, setSelectedFloors] = useState([]);
    const [selectedAreas, setSelectedAreas] = useState({});
    const [selectedFloorss, setSelectedFloorss] = useState({});
    const [selectedAreass, setSelectedAreass] = useState({});
    const [filteredFloors, setFilteredFloors] = useState([]);

    useEffect(() => {
        let lastValidFloorName = "";
        const updatedFloors = floorss.map((floor) => {
            if (floor.floorName && floor.floorName.trim() !== "") {
                lastValidFloorName = floor.floorName;
            }
            return { ...floor, floorName: floor.floorName?.trim() ? floor.floorName : lastValidFloorName };
        });

        setFilteredFloors(updatedFloors);
    }, [floorss]);

    const handleFloorCheckbox = (floorName, areaNames) => {
        const isFloorSelected = !!selectedFloorss[floorName];
        setSelectedFloorss((prev) => ({
            ...prev,
            [floorName]: !isFloorSelected,
        }));
        setSelectedAreass((prev) => {
            const updatedAreas = { ...prev };
            if (!isFloorSelected) {
                areaNames.forEach((area) => {
                    updatedAreas[`${floorName}-${area}`] = true;
                });
            } else {
                areaNames.forEach((area) => {
                    delete updatedAreas[`${floorName}-${area}`];
                });
            }
            return updatedAreas;
        });
    };
    const handleAreaCheckbox = (floorName, areaName) => {
        setSelectedAreass((prev) => ({
            ...prev,
            [`${floorName}-${areaName}`]: !prev[`${floorName}-${areaName}`]
        }));
    };
    const handleFloorChanges = (floorName) => {
        setSelectedFloors((prev) =>
            prev.includes(floorName)
                ? prev.filter((name) => name !== floorName)
                : [...prev, floorName]
        );
    };
    const handleAreaChanges = (floorName, areaName) => {
        setSelectedAreas((prev) => ({
            ...prev,
            [floorName]: prev[floorName]
                ? prev[floorName].includes(areaName)
                    ? prev[floorName].filter((area) => area !== areaName)
                    : [...prev[floorName], areaName]
                : [areaName],
        }));
    };
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [commonMix, setCommonMix] = useState("");
    const [commonLabourRate, setCommonLabourRate] = useState("");
    const [values, setValues] = useState({
        cementRate: "",
        sandRate: "",
        jallyRate: "",
        cementWastage: "0%",
        sandWastage: "0%",
        jallyWastage: "0%"
    });
    {
        isPopupOpen && (
            <div className="popup">
                <div className="popup-content">
                    <h2>Select Floors and Areas</h2>
                    <div>
                        {floorss.map((floor, floorIndex) => (
                            <div key={floorIndex}>
                                <input
                                    type="checkbox"
                                    checked={selectedFloors.includes(floor.floorName)}
                                    onChange={() => handleFloorChanges(floor.floorName)}
                                />
                                <label>{floor.floorName}</label>
                                {selectedFloors.includes(floor.floorName) && (
                                    <div className="ml-4">
                                        {floor.tiles.map((tile, tileIndex) => (
                                            <div key={tileIndex}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAreas[floor.floorName]?.includes(floor.areaName)}
                                                    onChange={() =>
                                                        handleAreaChanges(floor.floorName, floor.areaName)
                                                    }
                                                />
                                                <label>{floor.areaName}</label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsPopupOpen(false)}
                        className="btn"
                    >
                        Close
                    </button>
                </div>
            </div>
        )
    }
    const mixOptions = [
        { value: "M15-1:2:4", label: "M15-1:2:4" },
        { value: "M20-1:1.5:3", label: "M20-1:1.5:3" }
    ];
    const handleCommonMixChange = (selectedOption) => {
        if (!selectedOption) return;
        const selectedMix = selectedOption.value;
        setCommonMix(selectedMix);
        setFloorss((prevFloors) =>
            prevFloors.map((floor) => ({
                ...floor,
                tiles: floor.tiles.map((tile) => {
                    const updatedTile = { ...tile, mix: selectedMix };
                    if (selectedMix) {
                        const ratioMatch = selectedMix.match(/([\d.]+):([\d.]+):([\d.]+)/);
                        if (ratioMatch) {
                            const cementPart = parseFloat(ratioMatch[1]);
                            const sandPart = parseFloat(ratioMatch[2]);
                            const jallyPart = parseFloat(ratioMatch[3]);
                            const totalParts = cementPart + sandPart + jallyPart;
                            const L = convertToInches(tile.length || "1'");
                            const H = convertToInches(tile.height);
                            const B = convertToInches(tile.breadth);
                            const cementRate = parseFloat(values.cementRate || 0);
                            const sandRate = parseFloat(values.sandRate || 0);
                            const jallyRate = parseFloat(values.jallyRate || 0);
                            const totalVolume = L * H * B;
                            const cement = parseFloat(((totalVolume / totalParts) * cementPart).toFixed(2));
                            const sand = parseFloat(((totalVolume / totalParts) * sandPart).toFixed(2));
                            const jally = parseFloat(((totalVolume / totalParts) * jallyPart).toFixed(2));
                            const cementWastage = parseFloat(values.cementWastage || "0%") / 100;
                            const sandWastage = parseFloat(values.sandWastage || "0%") / 100;
                            const jallyWastage = parseFloat(values.jallyWastage || "0%") / 100;
                            const cementWithWastage = cement + cement * cementWastage;
                            const sandWithWastage = sand + sand * sandWastage;
                            const jallyWithWastage = jally + jally * jallyWastage;
                            updatedTile.cementWastage = values.cementWastage;
                            updatedTile.sandWastage = values.sandWastage;
                            updatedTile.jallyWastage = values.jallyWastage;
                            updatedTile.cement = cementWithWastage.toFixed(2);
                            updatedTile.sand = sandWithWastage.toFixed(2);
                            updatedTile.jally = jallyWithWastage.toFixed(2);
                            updatedTile.totalValume = (
                                parseFloat(updatedTile.cement) +
                                parseFloat(updatedTile.sand) +
                                parseFloat(updatedTile.jally)
                            ).toFixed(2);
                            const totalAmountCement = parseFloat((updatedTile.cement * cementRate).toFixed(2));
                            const totalAmountSand = parseFloat((updatedTile.sand * (sandRate / 100)).toFixed(2));
                            const totalAmountJally = parseFloat((updatedTile.jally * (jallyRate / 100)).toFixed(2));
                            updatedTile.LabourAmount = parseFloat((updatedTile.totalValume * (updatedTile.labourRate || 1)).toFixed(2));
                            updatedTile.totalAmountCft = parseFloat((totalAmountCement + totalAmountSand + totalAmountJally).toFixed(2));
                            updatedTile.concreteTotalAmount = updatedTile.totalAmountCft + updatedTile.LabourAmount;
                        }
                    }
                    return updatedTile;
                }),
            }))
        );
    };
    const handleCommonLabourRateChange = (e) => {
        const newLabourRate = e.target.value;
        setCommonLabourRate(newLabourRate);
        setFloorss((prevFloors) =>
            prevFloors.map((floor) => ({
                ...floor,
                tiles: floor.tiles.map((tile) => {
                    const updatedTile = { ...tile, labourRate: newLabourRate };
                    if (updatedTile.mix) {
                        const ratioMatch = updatedTile.mix.match(/([\d.]+):([\d.]+):([\d.]+)/);
                        if (ratioMatch) {
                            const cementPart = parseFloat(ratioMatch[1]);
                            const sandPart = parseFloat(ratioMatch[2]);
                            const jallyPart = parseFloat(ratioMatch[3]);
                            const totalParts = cementPart + sandPart + jallyPart;
                            const L = convertToInches(updatedTile.length || "1'");
                            const H = convertToInches(updatedTile.height);
                            const B = convertToInches(updatedTile.breadth);
                            const cementRate = parseFloat(values.cementRate || 0);
                            const sandRate = parseFloat(values.sandRate || 0);
                            const jallyRate = parseFloat(values.jallyRate || 0);
                            const totalVolume = L * H * B;
                            const cement = parseFloat(((totalVolume / totalParts) * cementPart).toFixed(2));
                            const sand = parseFloat(((totalVolume / totalParts) * sandPart).toFixed(2));
                            const jally = parseFloat(((totalVolume / totalParts) * jallyPart).toFixed(2));
                            const cementWastage = parseFloat(values.cementWastage || "0%") / 100;
                            const sandWastage = parseFloat(values.sandWastage || "0%") / 100;
                            const jallyWastage = parseFloat(values.jallyWastage || "0%") / 100;
                            const cementWastages = cement * cementWastage;
                            const sandWastages = sand * sandWastage;
                            const jallyWastages = jally * jallyWastage;
                            const jallyWithWastage = jallyWastages + jally;
                            const sandWithWastage = sandWastages + sand;
                            const cementWithWastage = cementWastages + cement;
                            updatedTile.cement = cementWithWastage.toFixed(2);
                            updatedTile.sand = sandWithWastage.toFixed(2);
                            updatedTile.jally = jallyWithWastage.toFixed(2);
                            updatedTile.cementWastage = values.cementWastage;
                            updatedTile.sandWastage = values.sandWastage;
                            updatedTile.jallyWastage = values.jallyWastage;
                            updatedTile.totalValume = (
                                parseFloat(updatedTile.cement) +
                                parseFloat(updatedTile.sand) +
                                parseFloat(updatedTile.jally)
                            ).toFixed(2);
                            const totalAmountCement = parseFloat((updatedTile.cement * cementRate).toFixed(2));
                            const totalAmountSand = parseFloat((updatedTile.sand * (sandRate / 100)).toFixed(2));
                            const totalAmountJally = parseFloat((updatedTile.jally * (jallyRate / 100)).toFixed(2));
                            updatedTile.LabourAmount = parseFloat((
                                updatedTile.totalValume * (updatedTile.labourRate || 1)
                            ).toFixed(2));
                            updatedTile.totalAmountCft = parseFloat((totalAmountCement + totalAmountSand + totalAmountJally).toFixed(2));
                            updatedTile.concreteTotalAmount = updatedTile.totalAmountCft + updatedTile.LabourAmount;
                        }
                    }
                    return updatedTile;
                }),
            }))
        );
    };

    const handleCommonInputChanges = (e) => {
        const { name, value } = e.target;
        const updatedValues = {
            ...values,
            [name]: value
        };
        const updatedFloors = floorss.map((floor) => {
            return {
                ...floor,
                tiles: floor.tiles.map((tile) => {
                    if (tile.mix) {
                        const ratioMatch = tile.mix.match(/([\d.]+):([\d.]+):([\d.]+)/);
                        if (ratioMatch) {
                            const cementPart = parseFloat(ratioMatch[1]);
                            const sandPart = parseFloat(ratioMatch[2]);
                            const jallyPart = parseFloat(ratioMatch[3]);
                            const totalParts = cementPart + sandPart + jallyPart;
                            const L = convertToInches(tile.length || "1'");
                            const H = convertToInches(tile.height);
                            const B = convertToInches(tile.breadth);
                            const cementRate = parseFloat(updatedValues.cementRate || 0);
                            const sandRate = parseFloat(updatedValues.sandRate || 0);
                            const jallyRate = parseFloat(updatedValues.jallyRate || 0);
                            const totalVolume = L * H * B;
                            const cement = parseFloat(((totalVolume / totalParts) * cementPart).toFixed(2));
                            const sand = parseFloat(((totalVolume / totalParts) * sandPart).toFixed(2));
                            const jally = parseFloat(((totalVolume / totalParts) * jallyPart).toFixed(2));
                            const cementWastage = parseFloat(updatedValues.cementWastage || "0%") / 100;
                            const sandWastage = parseFloat(updatedValues.sandWastage || "0%") / 100;
                            const jallyWastage = parseFloat(updatedValues.jallyWastage || "0%") / 100;
                            const cementWithWastage = cement + (cement * cementWastage);
                            const sandWithWastage = sand + (sand * sandWastage);
                            const jallyWithWastage = jally + (jally * jallyWastage);
                            tile.cement = cementWithWastage.toFixed(2);
                            tile.sand = sandWithWastage.toFixed(2);
                            tile.jally = jallyWithWastage.toFixed(2);
                            tile.totalValume = (
                                parseFloat(tile.cement) +
                                parseFloat(tile.sand) +
                                parseFloat(tile.jally)
                            ).toFixed(2);
                            const totalAmountCement = parseFloat(((tile.cement / 1.25) * cementRate).toFixed(2));
                            const totalAmountSand = parseFloat((tile.sand * (sandRate / 100)).toFixed(2));
                            const totalAmountJally = parseFloat((tile.jally * (jallyRate / 100)).toFixed(2));
                            tile.LabourAmount = parseFloat((tile.totalValume * (tile.labourRate || 1)).toFixed(2));
                            tile.totalAmountCft = parseFloat((totalAmountCement + totalAmountSand + totalAmountJally).toFixed(2));
                            tile.concreteTotalAmount = tile.totalAmountCft + tile.LabourAmount;
                        }
                    }
                    return tile;
                })
            };
        });
        setValues(updatedValues);
        setFloorss(updatedFloors);
    };
    const [rccFullData, setRccFullData] = useState([]);
    const [rccSizeList, setRccSizeList] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [beamData, setBeamData] = useState([]);
    const [beamNames, setBeamNames] = useState([]);
    const [rccBeamTypes, setRccBeamTypes] = useState([]);
    const [commonRate, setCommonRate] = useState("");
    const [activeTab, setActiveTab] = useState("formwork");
    const [isPopupOpen1, setIsPopupOpen1] = useState(false);
    const [RccClientName, setRccClientName] = useState(null);
    const [rccClientSNo, setRccClientSNo] = useState("");
    const [filteredRccFileOptions, setFilteredRccFileOptions] = useState([]);
    const [fileOption, setFileOption] = useState([]);
    const [fileOptions, setFileOptions] = useState([]);
    const [isPopupOpen2, setIsPopupOpen2] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [selectedModule, setSelectedModule] = useState("");
    const [rateLabel, setRateLabel] = useState("Rate (sqft)");
    const [weight, setWeight] = useState("0.00g");
    const [length, setLength] = useState("");
    const [siteOptions, setSiteOptions] = useState([]);
    const [input1, setInput1] = useState("");
    const [input2, setInput2] = useState("");
    const [input3, setInput3] = useState("");
    const [input4, setInput4] = useState("");
    const [input5, setInput5] = useState("");
    const [input6, setInput6] = useState("");
    const [input7, setInput7] = useState("");
    const [input8, setInput8] = useState("");
    const [input9, setInput9] = useState("");
    const [input10, setInput10] = useState("");
    const [input11, setInput11] = useState("");
    const [input12, setInput12] = useState("");
    const [input13, setInput13] = useState("");
    const [input14, setInput14] = useState("");
    const [input15, setInput15] = useState("");
    const [input16, setInput16] = useState("");
    const [rccSelectedFile, setRccSelectedFile] = useState(null);
    const [fullDatas, setFullDatas] = useState([]);
    const [dropdown1, setDropdown1] = useState("");
    const [dropdown2, setDropdown2] = useState("");
    const [dropdown3, setDropdown3] = useState("");
    const [dropdown4, setDropdown4] = useState("");
    const [dropdown5, setDropdown5] = useState("");
    const [dropdown6, setDropdown6] = useState("");
    const [dropdown7, setDropdown7] = useState("");
    const [dropdown8, setDropdown8] = useState("");
    const [dropdown9, setDropdown9] = useState("");
    const [dropdown10, setDropdown10] = useState("");
    const [dropdown11, setDropdown11] = useState("");
    const [dropdown12, setDropdown12] = useState("");
    const [dropdown13, setDropdown13] = useState("");
    const [dropdown14, setDropdown14] = useState("");
    const [dropdown15, setDropdown15] = useState("");
    const [dropdown16, setDropdown16] = useState("");
    const [floorOptions, setFloorOptions] = useState([]);
    const [isImportPopup, setIsImportPopup] = useState(false);
    const closeImportPopup = () => setIsImportPopup(false);
    const openImportPopup = () => setIsImportPopup(true);
    useEffect(() => {
        const savedClientName = sessionStorage.getItem('RccClientName');
        const savedClientSNo = sessionStorage.getItem('rccClientSNo');
        const savedFloors = sessionStorage.getItem('floorss');
        const savedValues = sessionStorage.getItem('values');
        const savedFilteredFileOptions = sessionStorage.getItem('filteredRccFileOptions');
        const savedSelectedFile = sessionStorage.getItem('rccSelectedFile');
        try {
            if (savedClientName) setRccClientName(JSON.parse(savedClientName));
            if (savedClientSNo) setRccClientSNo(savedClientSNo);
            if (savedFloors) setFloorss(JSON.parse(savedFloors));
            if (savedValues) setValues(JSON.parse(savedValues));
            if (savedFilteredFileOptions) setFilteredRccFileOptions(JSON.parse(savedFilteredFileOptions));
            if (savedSelectedFile) setRccSelectedFile(JSON.parse(savedSelectedFile));
        } catch (error) {
            console.error("Error parsing sessionStorage data:", error);
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    const handleBeforeUnload = () => {
        sessionStorage.removeItem('RccClientName');
        sessionStorage.removeItem('rccClientSNo');
        sessionStorage.removeItem('filteredRccFileOptions');
        sessionStorage.removeItem('floorss');
        sessionStorage.removeItem('values');
        sessionStorage.removeItem('rows');
    };
    useEffect(() => {
        if (RccClientName) sessionStorage.setItem('RccClientName', JSON.stringify(RccClientName));
        if (rccClientSNo) sessionStorage.setItem('rccClientSNo', rccClientSNo);
        sessionStorage.setItem('floorss', JSON.stringify(floorss));
        sessionStorage.setItem('values', JSON.stringify(values));
        sessionStorage.setItem('filteredRccFileOptions', JSON.stringify(filteredRccFileOptions));
        if (rccSelectedFile) sessionStorage.setItem('rccSelectedFile', JSON.stringify(rccSelectedFile));
    }, [RccClientName, rccClientSNo, floorss, values, filteredRccFileOptions, rccSelectedFile]);
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
    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const parseLength = (lengthString) => {
        const numericValue = parseFloat(lengthString.replace("'").trim());
        return isNaN(numericValue) ? 0 : numericValue;
    };
    const calculateWeightInGrams = (lengthInFeet, type) => {
        switch (type) {
            case "8MM":
                return lengthInFeet * 150;
            case "10MM":
                return lengthInFeet * 200;
            case "12MM":
                return lengthInFeet * 250;
            case "16MM":
                return lengthInFeet * 500;
            case "25MM":
                return lengthInFeet * 750;
            case "32MM":
                return lengthInFeet * 1000;
            default:
                return 0;
        }
    };
    const convertToInches = (value) => {
        if (!value || value.trim() === "0" || !/['"]/.test(value)) {
            return 0;
        }
        let totalInches = 0;
        const regex = /(\d+(\.\d+)?)'|(\d+(\.\d+)?)\s*"?/g;
        let match;
        while ((match = regex.exec(value)) !== null) {
            if (match[1]) {
                totalInches += parseFloat(match[1]) * 12;
            }
            if (match[3]) {
                totalInches += parseFloat(match[3]);
            }
        }
        return totalInches / 12;
    };
    const handleInput1Change = (event) => {
        const inputValue = event.target.value;
        const value = inputValue === "" ? 0 : parseFloat(inputValue);
        setInput1(inputValue);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        if (dropdown1 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown1) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
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
                    sNo: item.sNo
                }));
                setSiteOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchSites();
    }, []);
    const sortedSiteOptions = siteOptions.sort((a, b) =>
        a.label.localeCompare(b.label)
    );
    const handleInput2Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput2(value);
        if (dropdown2 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown2) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleInput3Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput3(value);
        if (dropdown3 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown3) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleInput4Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput4(value);
        if (dropdown4 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown4) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleInput5Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput5(value);
        if (dropdown5 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown5) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleInput6Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput6(value);
        if (dropdown6 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown6) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleInput7Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput7(value);
        if (dropdown7 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown7) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleInput8Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput8(value);
        if (dropdown8 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown8) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleInput9Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput9(value);
        if (dropdown9 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown9) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleInput10Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput10(value);
        if (dropdown10 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown10) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleInput11Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput11(value);
        if (dropdown11 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown11) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleInput12Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput12(value);
        if (dropdown12 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown12) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleInput13Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput13(value);
        if (dropdown13 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown13) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleInput14Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput14(value);
        if (dropdown14 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown14) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleInput15Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput15(value);
        if (dropdown15 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown15) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleInput16Change = (event) => {
        const value = parseFloat(event.target.value);
        const multiplier = !isNaN(value) && value > 0 ? value : 1;
        setInput16(value);
        if (dropdown16 && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, dropdown16) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown1Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown1(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown2Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown2(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown3Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown3(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown4Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown4(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown5Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown5(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown6Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown6(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown7Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown7(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown8Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown8(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown9Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown9(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown10Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown10(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown11Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown11(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown12Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown12(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown13Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown13(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown14Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown14(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown15Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown15(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const handleDropdown16Change = (event) => {
        const selectedValue = event.target.value;
        setDropdown16(selectedValue);
        const multiplier = !isNaN(parseFloat(input1)) && parseFloat(input1) > 0 ? parseFloat(input1) : 1;
        if (selectedValue && length) {
            const lengthInFeet = parseLength(length);
            if (!isNaN(lengthInFeet) && lengthInFeet > 0) {
                const weightInGrams = calculateWeightInGrams(lengthInFeet, selectedValue) * multiplier;
                setWeight(formatWeightInKg(weightInGrams));
            } else {
                setWeight("0kg");
            }
        } else {
            setWeight("0kg");
        }
    };
    const openDeductionPopup = (floorIndex, tileIndex) => {
        const deductions = [
            floorss[floorIndex]?.tiles[tileIndex]?.deduction1,
            floorss[floorIndex]?.tiles[tileIndex]?.deduction2,
            floorss[floorIndex]?.tiles[tileIndex]?.deduction3,
            floorss[floorIndex]?.tiles[tileIndex]?.deduction4,
            floorss[floorIndex]?.tiles[tileIndex]?.deduction5,
            floorss[floorIndex]?.tiles[tileIndex]?.deduction6,
            floorss[floorIndex]?.tiles[tileIndex]?.deduction7,
            floorss[floorIndex]?.tiles[tileIndex]?.deduction8,
        ];
        const processedDeductions = deductions.map((deduction, index) => {
            if (deduction) {
                const splitData = deduction.split(',').map((val) => val.trim());
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
    const openLengthPopupScreen = (floorIndex, tileIndex) => {
        const lengths = [
            floorss[floorIndex]?.tiles[tileIndex]?.length1,
            floorss[floorIndex]?.tiles[tileIndex]?.length2,
            floorss[floorIndex]?.tiles[tileIndex]?.length3,
            floorss[floorIndex]?.tiles[tileIndex]?.length4,
            floorss[floorIndex]?.tiles[tileIndex]?.length5,
            floorss[floorIndex]?.tiles[tileIndex]?.length6,
            floorss[floorIndex]?.tiles[tileIndex]?.length7,
            floorss[floorIndex]?.tiles[tileIndex]?.length8,
            floorss[floorIndex]?.tiles[tileIndex]?.length9,
            floorss[floorIndex]?.tiles[tileIndex]?.length10,
            floorss[floorIndex]?.tiles[tileIndex]?.length11,
            floorss[floorIndex]?.tiles[tileIndex]?.length12,
            floorss[floorIndex]?.tiles[tileIndex]?.length13,
            floorss[floorIndex]?.tiles[tileIndex]?.length14,
            floorss[floorIndex]?.tiles[tileIndex]?.length15,
            floorss[floorIndex]?.tiles[tileIndex]?.length16,
            floorss[floorIndex]?.tiles[tileIndex]?.length17,
            floorss[floorIndex]?.tiles[tileIndex]?.length18,
            floorss[floorIndex]?.tiles[tileIndex]?.length19,
            floorss[floorIndex]?.tiles[tileIndex]?.length20,
            floorss[floorIndex]?.tiles[tileIndex]?.length21,
            floorss[floorIndex]?.tiles[tileIndex]?.length22,
            floorss[floorIndex]?.tiles[tileIndex]?.length23,
            floorss[floorIndex]?.tiles[tileIndex]?.length24,
            floorss[floorIndex]?.tiles[tileIndex]?.length25,
            floorss[floorIndex]?.tiles[tileIndex]?.length26,
            floorss[floorIndex]?.tiles[tileIndex]?.length27,
            floorss[floorIndex]?.tiles[tileIndex]?.length28,
            floorss[floorIndex]?.tiles[tileIndex]?.length29,
            floorss[floorIndex]?.tiles[tileIndex]?.length30,
            floorss[floorIndex]?.tiles[tileIndex]?.length31,
            floorss[floorIndex]?.tiles[tileIndex]?.length32,
            floorss[floorIndex]?.tiles[tileIndex]?.length33,
            floorss[floorIndex]?.tiles[tileIndex]?.length34,
            floorss[floorIndex]?.tiles[tileIndex]?.length35,
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
    const evaluateExpression = (expression) => {
        try {
            const sanitizedExpression = expression.replace(/x|X/g, '*').replace(/[^\d+\-*/().\s]/g, '');
            return evaluate(sanitizedExpression);
        } catch (error) {
            console.error("Invalid mathematical expression:", expression);
            return 0;
        }
    };
    const handlePopupDataChange = (floorIndex, tileIndex, updatedData) => {
        setDeductionPopupData((prevData) => ({
            ...prevData,
            [`${floorIndex}-${tileIndex}`]: updatedData,
        }));
    };

    const closeDeductionPopup = (floorIndex, tileIndex) => {
        setDeductionPopupState((prevState) => ({
            ...prevState,
            [`${floorIndex}-${tileIndex}`]: false,
        }));
    };
    const handleLengthPopupDataChange = (floorIndex, tileIndex, updatedData) => {
        setLengthPopupData((prevData) => ({
            ...prevData,
            [`${floorIndex}-${tileIndex}`]: updatedData,
        }));
        updateFloorssWithLengthData(floorIndex, tileIndex, updatedData);
    };
    const closelengthPopup = (floorIndex, tileIndex) => {
        updateFloorssWithLengthData(floorIndex, tileIndex);
        setLengthPopupState((prevState) => ({
            ...prevState,
            [`${floorIndex}-${tileIndex}`]: false,
        }));
    };
    const parseFeetInches = (value) => {
        const feetInchesRegex = /^(\d+)'(\d+)"?$/;
        const inchesOnlyRegex = /^(\d+)"$/;
        const feetOnlyRegex = /^(\d+)'$/;
        if (feetInchesRegex.test(value)) {
            const match = value.match(feetInchesRegex);
            const feet = parseInt(match[1], 10);
            const inches = parseInt(match[2], 10);
            return feet * 12 + inches;
        } else if (inchesOnlyRegex.test(value)) {
            const match = value.match(inchesOnlyRegex);
            return parseInt(match[1], 10);
        } else if (feetOnlyRegex.test(value)) {
            const match = value.match(feetOnlyRegex);
            return parseInt(match[1], 10) * 12;
        }
        return 0;
    };
    const formatFeetInches = (totalInches) => {
        const feet = Math.floor(totalInches / 12);
        const inches = totalInches % 12;
        return inches === 0 ? `${feet}'` : `${feet}'${inches}"`;
    };
    const handleLengthMeasurementChange = (value, floorIndex, tileIndex, rowIndex) => {
        const updatedData = [...(lengthPopupData[`${floorIndex}-${tileIndex}`] || [])];
        if (!updatedData[rowIndex]) updatedData[rowIndex] = {};
        updatedData[rowIndex].measurement = value;
        const qty = parseInt(updatedData[rowIndex].qty, 10) || 0;
        const totalInches = parseFeetInches(value) * qty;
        const output = formatFeetInches(totalInches);
        updatedData[rowIndex].output = output.toString();
        handleLengthPopupDataChange(floorIndex, tileIndex, updatedData);
        updateFloorssWithLengthData(floorIndex, tileIndex);
    };
    const handleLengthQtyChange = (e, floorIndex, tileIndex, rowIndex) => {
        const qty = parseInt(e.target.value, 10) || 1;
        const updatedData = [...(lengthPopupData[`${floorIndex}-${tileIndex}`] || [])];
        if (!updatedData[rowIndex]) updatedData[rowIndex] = {};
        updatedData[rowIndex].qty = qty;
        const measurement = updatedData[rowIndex].measurement || "0'0\"";
        const totalInches = parseFeetInches(measurement) * qty;
        const output = formatFeetInches(totalInches);
        updatedData[rowIndex].output = output.toString();
        handleLengthPopupDataChange(floorIndex, tileIndex, updatedData);
        updateFloorssWithLengthData(floorIndex, tileIndex);
    };
    const calculateTotalOutput = (floorIndex, tileIndex) => {
        const data = lengthPopupData[`${floorIndex}-${tileIndex}`] || [];
        const totalInches = data.reduce((sum, row) => sum + parseFeetInches(row.output || "0'0\""), 0);
        return formatFeetInches(totalInches);
    };
    const updateFloorssWithLengthData = (floorIndex, tileIndex) => {
        setFloorss((prevFloors) => {
            const updatedFloors = prevFloors.map((floor, fIndex) => {
                if (fIndex !== floorIndex) return floor;
                return {
                    ...floor,
                    tiles: floor.tiles.map((tile, tIndex) => {
                        if (tIndex !== tileIndex) return tile;
                        const lengthData = lengthPopupData[`${floorIndex}-${tileIndex}`] || [];
                        const totalLength = calculateTotalOutput(floorIndex, tileIndex);
                        const lengthFields = {};
                        lengthData.forEach((row, i) => {
                            if (i < 35) {
                                lengthFields[`length${i + 1}`] = `${row.type || "Unknown"}, ${row.measurement || "0'0\""}, ${row.qty || 1}, ${row.output || 1}`;
                            }
                        });
                        const selectedAreaName = floor.areaName;
                        const matchingBeam = beamData.find((beam) => beam.beamName === selectedAreaName);
                        let area = 0;
                        if (matchingBeam && matchingBeam.formula) {
                            const lengthInches = convertToInches(totalLength || "1'");
                            const breadthInches = convertToInches(tile.breadth);
                            const heightInches = convertToInches(tile.height);
                            const normalizedDeduction = parseFloat(tile.deductionArea) || 0;
                            if (lengthInches === 0 || breadthInches === 0 || heightInches === 0) {
                                area = "0.00";
                            } else {
                                let formula = matchingBeam.formula
                                    .replace(/L/g, lengthInches)
                                    .replace(/B/g, breadthInches)
                                    .replace(/H/g, heightInches)
                                    .replace(/D/g, normalizedDeduction)
                                    .replace(/x/gi, "*");
                                formula = formula.replace(/(\d+)\s*['"]/g, (_, inches) => `(${inches}/12)`);
                                formula = formula.replace(/['"]/g, "");
                                try {
                                    area = evaluate(formula, {
                                        length: lengthInches || 0,
                                        breadth: breadthInches || 0,
                                        height: heightInches || 0,
                                        deduction: normalizedDeduction || 0,
                                    });
                                    area = isNaN(area) ? "0.00" : (area * tile.quantity).toFixed(2);
                                } catch (error) {
                                    console.error("Error evaluating formula:", error);
                                    area = "0.00";
                                }
                            }
                        } else {
                            area = "0.00";
                        }
                        const deductionArea = parseFloat(tile.deductionArea) || 0;
                        const totalArea = (parseFloat(area) - deductionArea).toFixed(2);
                        const rate = parseFloat(tile.rate) || 0;
                        const amount = (totalArea * rate).toFixed(2);
                        let cement = 0, sand = 0, jally = 0, concreteTotalAmount = 0;
                        if (tile.mix) {
                            const ratioMatch = tile.mix.match(/([\d.]+):([\d.]+):([\d.]+)/);
                            if (ratioMatch) {
                                const cementPart = parseFloat(ratioMatch[1]);
                                const sandPart = parseFloat(ratioMatch[2]);
                                const jallyPart = parseFloat(ratioMatch[3]);
                                const totalParts = cementPart + sandPart + jallyPart;
                                const L = convertToInches(totalLength || "1'");
                                const H = convertToInches(tile.height);
                                const B = convertToInches(tile.breadth);
                                const cementRate = parseFloat(values.cementRate || 0);
                                const sandRate = parseFloat(values.sandRate || 0);
                                const jallyRate = parseFloat(values.jallyRate || 0);
                                const totalVolume = L * H * B;
                                cement = parseFloat(((totalVolume / totalParts) * cementPart).toFixed(2));
                                sand = parseFloat(((totalVolume / totalParts) * sandPart).toFixed(2));
                                jally = parseFloat(((totalVolume / totalParts) * jallyPart).toFixed(2));
                                const cementWastage = parseFloat(values.cementWastage || "0%") / 100;
                                const sandWastage = parseFloat(values.sandWastage || "0%") / 100;
                                const jallyWastage = parseFloat(values.jallyWastage || "0%") / 100;
                                const cementWithWastage = cement + cement * cementWastage;
                                const sandWithWastage = sand + sand * sandWastage;
                                const jallyWithWastage = jally + jally * jallyWastage;
                                const totalAmountCement = parseFloat((cementWithWastage * cementRate).toFixed(2));
                                const totalAmountSand = parseFloat((sandWithWastage * (sandRate / 100)).toFixed(2));
                                const totalAmountJally = parseFloat((jallyWithWastage * (jallyRate / 100)).toFixed(2));
                                const totalValume = (cementWithWastage + sandWithWastage + jallyWithWastage).toFixed(2);
                                const LabourAmount = (totalValume * (tile.labourRate || 1)).toFixed(2);
                                concreteTotalAmount = totalAmountCement + totalAmountSand + totalAmountJally + parseFloat(LabourAmount);
                                tile.cement = cementWithWastage.toFixed(2);
                                tile.sand = sandWithWastage.toFixed(2);
                                tile.jally = jallyWithWastage.toFixed(2);
                                tile.cementWastage = values.cementWastage;
                                tile.sandWastage = values.sandWastage;
                                tile.jallyWastage = values.jallyWastage;
                                tile.totalValume = totalValume;
                                tile.LabourAmount = LabourAmount;
                                tile.totalAmountCft = (totalAmountCement + totalAmountSand + totalAmountJally).toFixed(2);
                            }
                        }
                        return {
                            ...tile,
                            length: totalLength,
                            ...lengthFields,
                            area,
                            totalArea,
                            amount,
                            concreteTotalAmount,
                        };
                    }),
                };
            });
            console.log("Updated Floorss:", updatedFloors);
            return updatedFloors;
        });
    };

    const handleQtyChange = (e, floorIndex, tileIndex, index) => {
        const newQty = parseFloat(e.target.value) || 0;
        const updatedData = [...(deductionPopupData[`${floorIndex}-${tileIndex}`] || [])];
        if (!updatedData[index]) updatedData[index] = {};
        updatedData[index].qty = newQty;
        const measurementValue = updatedData[index]?.measurement || "";
        const measurementParts = measurementValue
            .split(/x|X/)
            .map((item) => parseFloat(item.trim()))
            .filter((num) => !isNaN(num));
        const output = measurementParts.length === 2 ? measurementParts[0] * measurementParts[1] * newQty : 0;
        updatedData[index].output = output.toString();
        handlePopupDataChange(floorIndex, tileIndex, updatedData);
        updateDeductionInputs(floorIndex, tileIndex);
    };
    const handleMeasurementChange = (selectedOption, floorIndex, tileIndex, index) => {
        const updatedData = [...(deductionPopupData[`${floorIndex}-${tileIndex}`] || [])];
        if (!updatedData[index]) updatedData[index] = {};
        updatedData[index].measurement = selectedOption?.value || "";
        handlePopupDataChange(floorIndex, tileIndex, updatedData);
        updateDeductionInputs(floorIndex, tileIndex);
    };
    const updateDeductionInputs = (floorIndex, tileIndex) => {
        const deductionData = deductionPopupData[`${floorIndex}-${tileIndex}`] || [];
        if (!deductionData.length) return;
        const formattedMeasurement = deductionData
            .filter((row) => row.measurement)
            .map((row) => row.qty ? `((${row.measurement}) x ${row.qty})` : row.measurement)
            .join(" + ") || "0 x 1";
        setDeductionInputs((prevState) => ({
            ...prevState,
            [`${floorIndex}-${tileIndex}`]: formattedMeasurement,
        }));
        const formattedRows = deductionData.map((row) => {
            const evaluatedMeasurement = row.measurement ? evaluateExpression(row.measurement) : 0;
            const output = evaluatedMeasurement * (parseFloat(row.qty) || 0);
            row.output = output.toString();
            return `${row.type || " "}, ${row.measurement || ""}, ${row.qty || ""}, ${output || ""}`;
        });
        setDeductionRowWiseInputs((prevState) => ({
            ...prevState,
            [`${floorIndex}-${tileIndex}`]: formattedRows.join("\n"),
        }));
    };
    const handleRccFormworkDeductionChange = (floorIndex, tileIndex) => {
        const input = deductionInputs[`${floorIndex}-${tileIndex}`];
        const input1 = deductionRowWiseInputs[`${floorIndex}-${tileIndex}`];
        if (!input1) {
            return;
        }
        const rows = input1.split("\n").slice(0, 8);
        try {
            const formattedInput = input ? input.replace(/x|X/g, '*') : null;
            const result = formattedInput ? evaluate(formattedInput) : 0;
            const updatedFloors = [...floorss];
            rows.forEach((row, index) => {
                updatedFloors[floorIndex].tiles[tileIndex][`deduction${index + 1}`] = row;
            });
            for (let i = rows.length; i < 8; i++) {
                updatedFloors[floorIndex].tiles[tileIndex][`deduction${i + 1}`] = '';
            }
            updatedFloors[floorIndex].tiles[tileIndex].deductionArea = result;
            updatedFloors[floorIndex].tiles[tileIndex].deductionInput = input;
            const tile = updatedFloors[floorIndex].tiles[tileIndex];
            const lengthInches = convertToInches(tile.length || "1'");
            const breadthInches = convertToInches(tile.breadth || "0'");
            const heightInches = convertToInches(tile.height || "0'");
            const normalizedDeduction = parseFloat(tile.deductionArea) || 0;
            const matchingBeam = beamData.find((beam) => beam.beamName === updatedFloors[floorIndex].areaName);
            if (lengthInches && breadthInches && heightInches && matchingBeam && matchingBeam.formula) {
                let formula = matchingBeam.formula
                    .replace(/L/g, lengthInches)
                    .replace(/B/g, breadthInches)
                    .replace(/H/g, heightInches)
                    .replace(/D/g, normalizedDeduction)
                    .replace(/x/gi, "*");
                formula = formula.replace(/(\d+)\s*['"]/g, (_, inches) => `(${inches}/12)`);
                formula = formula.replace(/['"]/g, "");
                try {
                    const variables = {
                        length: lengthInches,
                        breadth: breadthInches,
                        height: heightInches,
                        deduction: normalizedDeduction,
                    };
                    const areas = evaluate(formula, variables).toFixed(2);
                    tile.area = areas * tile.quantity;
                } catch (error) {
                    console.error("Error evaluating formula:", error);
                    tile.area = "0.00";
                }
            } else {
                tile.area = "0.00";
            }
            const area = parseFloat(tile.area) || 0;
            const totalArea = Math.max(area - normalizedDeduction, 0);
            tile.totalArea = totalArea.toFixed(2);
            tile.amount = (totalArea * parseFloat(tile.rate || commonRate)).toFixed(2);
            setFloorss(updatedFloors);
        } catch (error) {
            console.error('Invalid calculation! Please check your input.', error);
        }
    };
    useEffect(() => {
        floorss.forEach((floor, floorIndex) => {
            floor.tiles.forEach((tile, tileIndex) => {
                handleRccFormworkDeductionChange(floorIndex, tileIndex);
            });
        });
    }, [deductionInputs]);
    useEffect(() => {
        fetchCalculation();
    }, []);
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
        if (!RccClientName) {
            setFileOption([]);
            return;
        }
        let filteredOptions = fullDatas.filter(calculation => calculation.clientName === RccClientName.value);
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
    }, [RccClientName, fullDatas, selectedModule]);
    const calculateSum = (qty) => {
        const value1 = dropdown1 === "12MM" ? parseFloat(input1) || 0 : 0;
        const value2 = dropdown2 === "12MM" ? parseFloat(input2) || 0 : 0;
        const value3 = dropdown3 === "12MM" ? parseFloat(input3) || 0 : 0;
        const value4 = dropdown4 === "12MM" ? parseFloat(input4) || 0 : 0;
        const value5 = dropdown5 === "12MM" ? parseFloat(input5) || 0 : 0;
        const value6 = dropdown6 === "12MM" ? parseFloat(input6) || 0 : 0;
        const value7 = dropdown7 === "12MM" ? parseFloat(input7) || 0 : 0;
        const value8 = dropdown8 === "12MM" ? parseFloat(input8) || 0 : 0;
        const value9 = dropdown9 === "12MM" ? parseFloat(input9) || 0 : 0;
        const value10 = dropdown10 === "12MM" ? parseFloat(input10) || 0 : 0;
        const value11 = dropdown11 === "12MM" ? parseFloat(input11) || 0 : 0;
        const value12 = dropdown12 === "12MM" ? parseFloat(input12) || 0 : 0;
        const value13 = dropdown13 === "12MM" ? parseFloat(input13) || 0 : 0;
        const value14 = dropdown14 === "12MM" ? parseFloat(input14) || 0 : 0;
        const value15 = dropdown15 === "12MM" ? parseFloat(input15) || 0 : 0;
        const value16 = dropdown16 === "12MM" ? parseFloat(input16) || 0 : 0;
        const totalQty = value1 + value2 + value3 + value4 + value5 + value6 + value7 + value8 + value9 + value10 + value11 + value12 + value13 + value14 + value15 + value16;
        return totalQty || 0;
    };
    const calculateSum1 = (qty) => {
        const value1 = dropdown1 === "16MM" ? parseFloat(input1) || 0 : 0;
        const value2 = dropdown2 === "16MM" ? parseFloat(input2) || 0 : 0;
        const value3 = dropdown3 === "16MM" ? parseFloat(input3) || 0 : 0;
        const value4 = dropdown4 === "16MM" ? parseFloat(input4) || 0 : 0;
        const value5 = dropdown5 === "16MM" ? parseFloat(input5) || 0 : 0;
        const value6 = dropdown6 === "16MM" ? parseFloat(input6) || 0 : 0;
        const value7 = dropdown7 === "16MM" ? parseFloat(input7) || 0 : 0;
        const value8 = dropdown8 === "16MM" ? parseFloat(input8) || 0 : 0;
        const value9 = dropdown9 === "16MM" ? parseFloat(input9) || 0 : 0;
        const value10 = dropdown10 === "16MM" ? parseFloat(input10) || 0 : 0;
        const value11 = dropdown11 === "16MM" ? parseFloat(input11) || 0 : 0;
        const value12 = dropdown12 === "16MM" ? parseFloat(input12) || 0 : 0;
        const value13 = dropdown13 === "16MM" ? parseFloat(input13) || 0 : 0;
        const value14 = dropdown14 === "16MM" ? parseFloat(input14) || 0 : 0;
        const value15 = dropdown15 === "16MM" ? parseFloat(input15) || 0 : 0;
        const value16 = dropdown16 === "16MM" ? parseFloat(input16) || 0 : 0;
        const totalQty = value1 + value2 + value3 + value4 + value5 + value6 + value7 + value8 + value9 + value10 + value11 + value12 + value13 + value14 + value15 + value16;
        return totalQty || "";
    };
    const calculateSum2 = (qty) => {
        const value1 = dropdown1 === "8MM" ? parseFloat(input1) || 0 : 0;
        const value2 = dropdown2 === "8MM" ? parseFloat(input2) || 0 : 0;
        const value3 = dropdown3 === "8MM" ? parseFloat(input3) || 0 : 0;
        const value4 = dropdown4 === "8MM" ? parseFloat(input4) || 0 : 0;
        const value5 = dropdown5 === "8MM" ? parseFloat(input5) || 0 : 0;
        const value6 = dropdown6 === "8MM" ? parseFloat(input6) || 0 : 0;
        const value7 = dropdown7 === "8MM" ? parseFloat(input7) || 0 : 0;
        const value8 = dropdown8 === "8MM" ? parseFloat(input8) || 0 : 0;
        const value9 = dropdown9 === "8MM" ? parseFloat(input9) || 0 : 0;
        const value10 = dropdown10 === "8MM" ? parseFloat(input10) || 0 : 0;
        const value11 = dropdown11 === "8MM" ? parseFloat(input11) || 0 : 0;
        const value12 = dropdown12 === "8MM" ? parseFloat(input12) || 0 : 0;
        const value13 = dropdown13 === "8MM" ? parseFloat(input13) || 0 : 0;
        const value14 = dropdown14 === "8MM" ? parseFloat(input14) || 0 : 0;
        const value15 = dropdown15 === "8MM" ? parseFloat(input15) || 0 : 0;
        const value16 = dropdown16 === "8MM" ? parseFloat(input16) || 0 : 0;
        const totalQty = value1 + value2 + value3 + value4 + value5 + value6 + value7 + value8 + value9 + value10 + value11 + value12 + value13 + value14 + value15 + value16;
        return totalQty || 0;
    };
    const calculateSum3 = (qty) => {
        const value1 = dropdown1 === "10MM" ? parseFloat(input1) || 0 : 0;
        const value2 = dropdown2 === "10MM" ? parseFloat(input2) || 0 : 0;
        const value3 = dropdown3 === "10MM" ? parseFloat(input3) || 0 : 0;
        const value4 = dropdown4 === "10MM" ? parseFloat(input4) || 0 : 0;
        const value5 = dropdown5 === "10MM" ? parseFloat(input5) || 0 : 0;
        const value6 = dropdown6 === "10MM" ? parseFloat(input6) || 0 : 0;
        const value7 = dropdown7 === "10MM" ? parseFloat(input7) || 0 : 0;
        const value8 = dropdown8 === "10MM" ? parseFloat(input8) || 0 : 0;
        const value9 = dropdown9 === "10MM" ? parseFloat(input9) || 0 : 0;
        const value10 = dropdown10 === "10MM" ? parseFloat(input10) || 0 : 0;
        const value11 = dropdown11 === "10MM" ? parseFloat(input11) || 0 : 0;
        const value12 = dropdown12 === "10MM" ? parseFloat(input12) || 0 : 0;
        const value13 = dropdown13 === "10MM" ? parseFloat(input13) || 0 : 0;
        const value14 = dropdown14 === "10MM" ? parseFloat(input14) || 0 : 0;
        const value15 = dropdown15 === "10MM" ? parseFloat(input15) || 0 : 0;
        const value16 = dropdown16 === "10MM" ? parseFloat(input16) || 0 : 0;
        const totalQty = value1 + value2 + value3 + value4 + value5 + value6 + value7 + value8 + value9 + value10 + value11 + value12 + value13 + value14 + value15 + value16;
        return totalQty || "";
    };
    const calculateSum4 = (qty) => {
        const value1 = dropdown1 === "20MM" ? parseFloat(input1) || 0 : 0;
        const value2 = dropdown2 === "20MM" ? parseFloat(input2) || 0 : 0;
        const value3 = dropdown3 === "20MM" ? parseFloat(input3) || 0 : 0;
        const value4 = dropdown4 === "20MM" ? parseFloat(input4) || 0 : 0;
        const value5 = dropdown5 === "20MM" ? parseFloat(input5) || 0 : 0;
        const value6 = dropdown6 === "20MM" ? parseFloat(input6) || 0 : 0;
        const value7 = dropdown7 === "20MM" ? parseFloat(input7) || 0 : 0;
        const value8 = dropdown8 === "20MM" ? parseFloat(input8) || 0 : 0;
        const value9 = dropdown9 === "20MM" ? parseFloat(input9) || 0 : 0;
        const value10 = dropdown10 === "20MM" ? parseFloat(input10) || 0 : 0;
        const value11 = dropdown11 === "20MM" ? parseFloat(input11) || 0 : 0;
        const value12 = dropdown12 === "20MM" ? parseFloat(input12) || 0 : 0;
        const value13 = dropdown13 === "20MM" ? parseFloat(input13) || 0 : 0;
        const value14 = dropdown14 === "20MM" ? parseFloat(input14) || 0 : 0;
        const value15 = dropdown15 === "20MM" ? parseFloat(input15) || 0 : 0;
        const value16 = dropdown16 === "20MM" ? parseFloat(input16) || 0 : 0;
        const totalQty = value1 + value2 + value3 + value4 + value5 + value6 + value7 + value8 + value9 + value10 + value11 + value12 + value13 + value14 + value15 + value16;
        return totalQty || "";
    };
    const calculateSum5 = (qty) => {
        const value1 = dropdown1 === "25MM" ? parseFloat(input1) || 0 : 0;
        const value2 = dropdown2 === "25MM" ? parseFloat(input2) || 0 : 0;
        const value3 = dropdown3 === "25MM" ? parseFloat(input3) || 0 : 0;
        const value4 = dropdown4 === "25MM" ? parseFloat(input4) || 0 : 0;
        const value5 = dropdown5 === "25MM" ? parseFloat(input5) || 0 : 0;
        const value6 = dropdown6 === "25MM" ? parseFloat(input6) || 0 : 0;
        const value7 = dropdown7 === "25MM" ? parseFloat(input7) || 0 : 0;
        const value8 = dropdown8 === "25MM" ? parseFloat(input8) || 0 : 0;
        const value9 = dropdown9 === "25MM" ? parseFloat(input9) || 0 : 0;
        const value10 = dropdown10 === "25MM" ? parseFloat(input10) || 0 : 0;
        const value11 = dropdown11 === "25MM" ? parseFloat(input11) || 0 : 0;
        const value12 = dropdown12 === "25MM" ? parseFloat(input12) || 0 : 0;
        const value13 = dropdown13 === "25MM" ? parseFloat(input13) || 0 : 0;
        const value14 = dropdown14 === "25MM" ? parseFloat(input14) || 0 : 0;
        const value15 = dropdown15 === "25MM" ? parseFloat(input15) || 0 : 0;
        const value16 = dropdown16 === "25MM" ? parseFloat(input16) || 0 : 0;
        const totalQty = value1 + value2 + value3 + value4 + value5 + value6 + value7 + value8 + value9 + value10 + value11 + value12 + value13 + value14 + value15 + value16;
        return totalQty || "";
    };
    const calculateSum6 = (qty) => {
        const value1 = dropdown1 === "32MM" ? parseFloat(input1) || 0 : 0;
        const value2 = dropdown2 === "32MM" ? parseFloat(input2) || 0 : 0;
        const value3 = dropdown3 === "32MM" ? parseFloat(input3) || 0 : 0;
        const value4 = dropdown4 === "32MM" ? parseFloat(input4) || 0 : 0;
        const value5 = dropdown5 === "32MM" ? parseFloat(input5) || 0 : 0;
        const value6 = dropdown6 === "32MM" ? parseFloat(input6) || 0 : 0;
        const value7 = dropdown7 === "32MM" ? parseFloat(input7) || 0 : 0;
        const value8 = dropdown8 === "32MM" ? parseFloat(input8) || 0 : 0;
        const value9 = dropdown9 === "32MM" ? parseFloat(input9) || 0 : 0;
        const value10 = dropdown10 === "32MM" ? parseFloat(input10) || 0 : 0;
        const value11 = dropdown11 === "32MM" ? parseFloat(input11) || 0 : 0;
        const value12 = dropdown12 === "32MM" ? parseFloat(input12) || 0 : 0;
        const value13 = dropdown13 === "32MM" ? parseFloat(input13) || 0 : 0;
        const value14 = dropdown14 === "32MM" ? parseFloat(input14) || 0 : 0;
        const value15 = dropdown15 === "32MM" ? parseFloat(input15) || 0 : 0;
        const value16 = dropdown16 === "32MM" ? parseFloat(input16) || 0 : 0;
        const totalQty = value1 + value2 + value3 + value4 + value5 + value6 + value7 + value8 + value9 + value10 + value11 + value12 + value13 + value14 + value15 + value16;
        return totalQty || "";
    };
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === "steel") {
            setRateLabel("Rate (kg)");
        } else if (tab === "formwork") {
            setRateLabel("Rate (sqft)");
        } else {
            setRateLabel("");
        }
    };
    const handleEditClick = (areaName, floorIndex) => {
        if (!areaName) {
            alert('Please select an "Area Name" to edit.');
            return;
        }
        switch (areaName) {
            case 'Roof Beam':
                togglePopup('Roof Beam');
                break;
            case 'Plinth Beam':
                togglePopup('Plinth Beam');
                break;
            case 'Footing':
                togglePopup('Footing');
                break;
            case 'Cantilever':
                togglePopup('Cantilever');
                break;
            default:
                alert('Invalid selection. Please select a valid area.');
        }
    };
    const togglePopup = (type) => {
        console.log("Toggle Popup:", type);
        setPopupType((prevType) => (prevType === type ? null : type));
    };
    const [popupType, setPopupType] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpens, setIsModalOpens] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const openModals = () => setIsModalOpens(true);
    const closeModal = () => setIsModalOpen(false);
    const closeModals = () => setIsModalOpens(false);
    const [calculatedWeight, setCalculatedWeight] = useState("");
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
    const getFilteredBeamTypes = (selectedArea) => {
        if (!selectedArea) return [];
        return rccBeamTypes.filter((item) => item.beamName === selectedArea);
    };
    const handleAreaChange = (floorIndex, selectedOption) => {
        setFloorss((prevFloors) => {
            const updatedFloors = [...prevFloors];
            const selectedAreaName = selectedOption ? selectedOption.value : null;
            updatedFloors[floorIndex].areaName = selectedAreaName;
            // Get new beam formula based on the updated area name
            const matchingBeam = beamData.find((beam) => beam.beamName === selectedAreaName);
            const formula = matchingBeam?.formula || "";
            updatedFloors[floorIndex].tiles = updatedFloors[floorIndex].tiles.map((tile) => {
                // Extract height and breadth
                const [height = "", breadth = ""] = tile.size
                    ? tile.size.split('x').map((val) => val.trim())
                    : ["", ""];
                // Convert measurements to inches
                const L = convertToInches(tile.length || "1'");
                const H = convertToInches(height);
                const B = convertToInches(breadth);
                const deduction = parseFloat(tile.deductionArea) || 0;
                let formulaWithValues = formula
                    .replace(/L/g, L)
                    .replace(/B/g, B)
                    .replace(/H/g, H);
                formulaWithValues = formulaWithValues.replace(/(\d+)\s*['"]/g, (_, inches) => `(${inches}/12)`);
                formulaWithValues = formulaWithValues.replace(/['"]/g, "");
                try {
                    const areas = evaluate(formulaWithValues).toFixed(2);
                    tile.area = isNaN(areas) ? "0.00" : (areas * tile.quantity).toFixed(2);
                } catch (error) {
                    console.error("Error calculating area:", error);
                    tile.area = 0;
                }
                const totalArea = parseFloat(tile.area) - deduction;
                tile.totalArea = Math.max(totalArea, 0).toFixed(2);
                if (tile.rate) {
                    tile.amount = (parseFloat(tile.rate) * tile.totalArea).toFixed(2);
                } else {
                    tile.amount = "0.00";
                }
                const typeToWeightFactor = {
                    "8MM": 150,
                    "10MM": 200,
                    "12MM": 250,
                    "16MM": 500,
                    "25MM": 750,
                    "32MM": 1000,
                };
                const weightFactor = typeToWeightFactor[tile.type] || 0;
                const weightInGrams = L * weightFactor;
                tile.weight = formatWeightInKg(weightInGrams);
                return { ...tile, areaName: selectedAreaName };
            });
            return updatedFloors;
        });
    };
    const handleInputChange = (floorIndex, tileIndex, field, value) => {
        setFloorss((prev) => {
            const updatedFloors = [...prev];
            const tile = updatedFloors[floorIndex].tiles[tileIndex];
            const selectedAreaName = updatedFloors[floorIndex].areaName;
            const selectedFloorName = updatedFloors[floorIndex].floorName;
            const matchingBeam = beamData.find((beam) => beam.beamName === selectedAreaName);
            const typeToWeightFactor = {
                "8MM": 150,
                "10MM": 200,
                "12MM": 250,
                "16MM": 500,
                "25MM": 750,
                "32MM": 1000,
            };
            if (field === "mix") {
                tile.mix = value;
                updatedFloors[floorIndex].tiles.forEach((t) => {
                    if (t.type === tile.type && updatedFloors[floorIndex].areaName === selectedAreaName && updatedFloors[floorIndex].floorName === selectedFloorName) {
                        if (t.mix) {
                            const ratioMatch = t.mix.match(/([\d.]+):([\d.]+):([\d.]+)/);
                            if (ratioMatch) {
                                const cementPart = parseFloat(ratioMatch[1]);
                                const sandPart = parseFloat(ratioMatch[2]);
                                const jallyPart = parseFloat(ratioMatch[3]);
                                const totalParts = cementPart + sandPart + jallyPart;
                                const L = convertToInches(t.length || "1'");
                                const H = convertToInches(t.height);
                                const B = convertToInches(t.breadth);
                                const cementRate = parseFloat(values.cementRate || 0);
                                const sandRate = parseFloat(values.sandRate || 0);
                                const jallyRate = parseFloat(values.jallyRate || 0);
                                const totalVolume = L * H * B;
                                const cement = parseFloat(((totalVolume / totalParts) * cementPart).toFixed(2));
                                const sand = parseFloat(((totalVolume / totalParts) * sandPart).toFixed(2));
                                const jally = parseFloat(((totalVolume / totalParts) * jallyPart).toFixed(2));
                                const cementWastage = parseFloat(values.cementWastage || "0%") / 100;
                                const sandWastage = parseFloat(values.sandWastage || "0%") / 100;
                                const jallyWastage = parseFloat(values.jallyWastage || "0%") / 100;
                                const cementWastages = cement * cementWastage;
                                const sandWastages = sand * sandWastage;
                                const jallyWastages = jally * jallyWastage;
                                const jallyWithWastage = jallyWastages + jally;
                                const sandWithWastage = sandWastages + sand;
                                const cementWithWastage = cementWastages + cement;
                                t.cementWastage = values.cementWastage;
                                t.sandWastage = values.sandWastage;
                                t.jallyWastage = values.jallyWastage;
                                t.cement = cementWithWastage.toFixed(2);
                                t.sand = sandWithWastage.toFixed(2);
                                t.jally = jallyWithWastage.toFixed(2);
                                // Calculate total volume
                                t.totalValume = (
                                    parseFloat(t.cement) +
                                    parseFloat(t.sand) +
                                    parseFloat(t.jally)
                                ).toFixed(2);
                                // Calculate total costs
                                const totalAmountCement = parseFloat((t.cement * cementRate).toFixed(2));
                                const totalAmountSand = parseFloat((t.sand * (sandRate / 100)).toFixed(2));
                                const totalAmountJally = parseFloat((t.jally * (jallyRate / 100)).toFixed(2));
                                t.LabourAmount = parseFloat((
                                    t.totalValume * (t.labourRate || 1)
                                ).toFixed(2));
                                t.totalAmountCft = parseFloat((totalAmountCement + totalAmountSand + totalAmountJally).toFixed(2));
                                t.concreteTotalAmount = t.totalAmountCft + t.LabourAmount;
                            }
                        }
                    }
                });
            } else if (field === "type") {
                tile.type = value;
                const newType = value;
                const existingRow = updatedFloors[floorIndex].tiles
                    .filter((t, idx) => idx !== tileIndex && t.type === newType &&
                        updatedFloors[floorIndex].areaName === selectedAreaName &&
                        updatedFloors[floorIndex].floorName === selectedFloorName)
                    .pop();
                let existingSize = existingRow?.size || typeSizes[newType] || "";
                const [breadth = "", height = ""] = existingSize.split(/x/i).map((val) => val.trim());
                tile.size = existingSize;
                tile.height = height || "";
                tile.breadth = breadth || "";
                updatedFloors[floorIndex].tiles.forEach((t) => {
                    if (t.type === newType && updatedFloors[floorIndex].areaName === selectedAreaName &&
                        updatedFloors[floorIndex].floorName === selectedFloorName) {
                        t.size = existingSize;
                        t.height = height || "";
                        t.breadth = breadth || "";
                    }
                });
                setTypeSizes((prevTypeSizes) => ({
                    ...prevTypeSizes,
                    [newType]: existingSize,
                }));
                updatedFloors[floorIndex].tiles.forEach((t) => {
                    if (t.type === newType && updatedFloors[floorIndex].areaName === selectedAreaName && updatedFloors[floorIndex].floorName === selectedFloorName) {
                        if (t.mix) {
                            const ratioMatch = t.mix.match(/([\d.]+):([\d.]+):([\d.]+)/);
                            if (ratioMatch) {
                                const cementPart = parseFloat(ratioMatch[1]);
                                const sandPart = parseFloat(ratioMatch[2]);
                                const jallyPart = parseFloat(ratioMatch[3]);
                                const totalParts = cementPart + sandPart + jallyPart;
                                const L = convertToInches(t.length || "1'");
                                const H = convertToInches(t.height);
                                const B = convertToInches(t.breadth);
                                const cementRate = parseFloat(values.cementRate || 0);
                                const sandRate = parseFloat(values.sandRate || 0);
                                const jallyRate = parseFloat(values.jallyRate || 0);
                                const totalVolume = L * H * B;
                                const cement = parseFloat(((totalVolume / totalParts) * cementPart).toFixed(2));
                                const sand = parseFloat(((totalVolume / totalParts) * sandPart).toFixed(2));
                                const jally = parseFloat(((totalVolume / totalParts) * jallyPart).toFixed(2));
                                const cementWastage = parseFloat(values.cementWastage || "0%") / 100;
                                const sandWastage = parseFloat(values.sandWastage || "0%") / 100;
                                const jallyWastage = parseFloat(values.jallyWastage || "0%") / 100;
                                const cementWastages = cement * cementWastage;
                                const sandWastages = sand * sandWastage;
                                const jallyWastages = jally * jallyWastage;
                                const jallyWithWastage = jallyWastages + jally;
                                const sandWithWastage = sandWastages + sand;
                                const cementWithWastage = cementWastages + cement;
                                t.cementWastage = values.cementWastage;
                                t.sandWastage = values.sandWastage;
                                t.jallyWastage = values.jallyWastage;
                                t.cement = cementWithWastage.toFixed(2);
                                t.sand = sandWithWastage.toFixed(2);
                                t.jally = jallyWithWastage.toFixed(2);
                                t.totalValume = (
                                    parseFloat(t.cement) +
                                    parseFloat(t.sand) +
                                    parseFloat(t.jally)
                                ).toFixed(2);
                                const totalAmountCement = parseFloat((t.cement * cementRate).toFixed(2));
                                const totalAmountSand = parseFloat((t.sand * (sandRate / 100)).toFixed(2));
                                const totalAmountJally = parseFloat((t.jally * (jallyRate / 100)).toFixed(2));
                                t.LabourAmount = parseFloat((
                                    t.totalValume * (t.labourRate || 1)
                                ).toFixed(2));
                                t.totalAmountCft = parseFloat((totalAmountCement + totalAmountSand + totalAmountJally).toFixed(2));
                                t.concreteTotalAmount = t.totalAmountCft + t.LabourAmount;
                            }
                        }
                    }
                });
            }
            else if (field === "size") {
                const [breadth = "", height = ""] = value.split(/x/i).map((val) => val.trim());
                const currentType = tile.type;
                updatedFloors[floorIndex].tiles.forEach((t) => {
                    if (t.type === currentType && updatedFloors[floorIndex].areaName === selectedAreaName && updatedFloors[floorIndex].floorName === selectedFloorName) {
                        t.size = value;
                        t.height = height.endsWith('') ? height : `${height}`;
                        t.breadth = breadth.endsWith('') ? breadth : `${breadth}`;
                    }
                });
                updatedFloors[floorIndex].tiles.forEach((t) => {
                    if (t.type === currentType && updatedFloors[floorIndex].areaName === selectedAreaName && updatedFloors[floorIndex].floorName === selectedFloorName) {
                        if (t.mix) {
                            const ratioMatch = t.mix.match(/([\d.]+):([\d.]+):([\d.]+)/);
                            if (ratioMatch) {
                                const cementPart = parseFloat(ratioMatch[1]);
                                const sandPart = parseFloat(ratioMatch[2]);
                                const jallyPart = parseFloat(ratioMatch[3]);
                                const totalParts = cementPart + sandPart + jallyPart;
                                const L = convertToInches(t.length || "1'");
                                const H = convertToInches(t.height);
                                const B = convertToInches(t.breadth);
                                const cementRate = parseFloat(values.cementRate || 0);
                                const sandRate = parseFloat(values.sandRate || 0);
                                const jallyRate = parseFloat(values.jallyRate || 0);
                                const totalVolume = L * H * B;
                                const cement = parseFloat(((totalVolume / totalParts) * cementPart).toFixed(2));
                                const sand = parseFloat(((totalVolume / totalParts) * sandPart).toFixed(2));
                                const jally = parseFloat(((totalVolume / totalParts) * jallyPart).toFixed(2));
                                const cementWastage = parseFloat(values.cementWastage || "0%") / 100;
                                const sandWastage = parseFloat(values.sandWastage || "0%") / 100;
                                const jallyWastage = parseFloat(values.jallyWastage || "0%") / 100;
                                const cementWastages = cement * cementWastage;
                                const sandWastages = sand * sandWastage;
                                const jallyWastages = jally * jallyWastage;
                                const jallyWithWastage = jallyWastages + jally;
                                const sandWithWastage = sandWastages + sand;
                                const cementWithWastage = cementWastages + cement;
                                t.cementWastage = values.cementWastage;
                                t.sandWastage = values.sandWastage;
                                t.jallyWastage = values.jallyWastage;
                                t.cement = cementWithWastage.toFixed(2);
                                t.sand = sandWithWastage.toFixed(2);
                                t.jally = jallyWithWastage.toFixed(2);
                                t.totalValume = (
                                    parseFloat(t.cement) +
                                    parseFloat(t.sand) +
                                    parseFloat(t.jally)
                                ).toFixed(2);
                                const totalAmountCement = parseFloat((t.cement * cementRate).toFixed(2));
                                const totalAmountSand = parseFloat((t.sand * (sandRate / 100)).toFixed(2));
                                const totalAmountJally = parseFloat((t.jally * (jallyRate / 100)).toFixed(2));
                                t.LabourAmount = parseFloat((
                                    t.totalValume * (t.labourRate || 1)
                                ).toFixed(2));
                                t.totalAmountCft = parseFloat((totalAmountCement + totalAmountSand + totalAmountJally).toFixed(2));
                                t.concreteTotalAmount = t.totalAmountCft + t.LabourAmount;
                            }
                        }
                    }
                });
            } else {
                tile[field] = value;
            }
            updatedFloors[floorIndex].tiles.forEach((t) => {
                const L = convertToInches(t.length || "1'");
                const H = convertToInches(t.height);
                const B = convertToInches(t.breadth);
                const deduction = parseFloat(t.deductionArea) || 0;
                let formula = matchingBeam?.formula || "";
                let formulaWithValues = formula
                    .replace(/L/g, L)
                    .replace(/B/g, B)
                    .replace(/H/g, H)
                    .replace(/x/gi, "*")
                    .replace(/(\d+)\s*['"]/g, (_, inches) => (`${inches}` / 12))
                    .replace(/['"]/g, "");
                try {
                    t.area = evaluate(formulaWithValues).toFixed(2);
                } catch (error) {
                    console.error("Error calculating area:", error);
                    t.area = 0;
                }
                const totalArea = parseFloat(t.area) - deduction;
                t.totalArea = Math.max(totalArea, 0).toFixed(2);
                t.amount = t.rate ? (parseFloat(t.rate) * t.totalArea).toFixed(2) : "0.00";
                const weightFactor = typeToWeightFactor[t.type] || 0;
                const weightInGrams = L * weightFactor;
                t.weight = formatWeightInKg(weightInGrams);
            });
            updatedFloors[floorIndex].totalAmount = updatedFloors[floorIndex].tiles
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
                .toFixed(2);
            const totalWeight = updatedFloors.reduce(
                (sum, floor) =>
                    sum +
                    floor.tiles.reduce((floorSum, t) => floorSum + (parseFloat(t.weight) || 0), 0),
                0
            );
            setCalculatedWeight(totalWeight.toFixed(2));
            return updatedFloors;
        });
    };
    const formatWeightInKg = (grams) => {
        const kg = grams / 1000;
        return `${kg.toFixed(2)}kg`;
    };
    const [typeSizes, setTypeSizes] = useState({
        'RB 01': '',
        'RB 02': '',
        'RB 03': '',
        'RB 04': '',
        'RB 05': '',
    });
    const handleGroundFloorSelectAll = (e) => {
        const { checked } = e.target;
        if (checked) {
            setSelectedGroundFloor(["roof-beam", "plinth-beam"]);
        } else {
            setSelectedGroundFloor([]);
        }
    };
    const [isPopupOpen3, setIsPopupOpen3] = useState(false);
    const [isPopupOpen4, setIsPopupOpen4] = useState(false);
    const openPopup = () => {
        setIsPopupOpen3(true);
    };
    const closePopup = () => {
        setIsPopupOpen3(false);
    };
    const handleGroundFloorChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedGroundFloor((prev) => [...prev, value]);
        } else {
            setSelectedGroundFloor((prev) => prev.filter((item) => item !== value));
        }
    };
    const handleGroundFloorChange1 = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedGroundFloor1((prev) => [...prev, value]);
        } else {
            setSelectedGroundFloor1((prev) => prev.filter((item) => item !== value));
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
    const [selectedOptions, setSelectedOptions] = useState(new Set());
    const handleFloorChange = (floorIndex, selectedFloor) => {
        const updatedFloors = [...floorss];
        updatedFloors[floorIndex].floorName = selectedFloor;
        setFloorss(updatedFloors);
        const selectedValues = updatedFloors.map((f) => f.floorName).filter(Boolean);
        setSelectedOptions(new Set(selectedValues));
    };
    const removeRow1 = (floorIndex, tileIndex) => {
        const updatedFloors = [...floorss];
        if (!updatedFloors[floorIndex] || !updatedFloors[floorIndex].tiles) {
            console.error("Invalid floorIndex or tiles structure");
            return;
        }
        updatedFloors[floorIndex].tiles.splice(tileIndex, 1);
        setFloorss(updatedFloors);
    };
    const handleFirstFloorChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedFirstFloor((prev) => [...prev, value]);
        } else {
            setSelectedFirstFloor((prev) => prev.filter((item) => item !== value));
        }
    };
    const handleFirstFloorSelectAll = (e) => {
        const { checked } = e.target;
        if (checked) {
            setSelectedFirstFloor(["lintel-beam", "column", "slab"]);
        } else {
            setSelectedFirstFloor([]);
        }
    };
    const addNewRowAfter = (floorIndex, tileIndex) => {
        const newTile = {
            type: '',
            length: "1'",
            breadth: '',
            height: '',
            quantity: "1",
            deductionArea: '',
            wastagePercentage: '0',
            rate: "",
        };
        const updatedFloors = floorss.map((floor, index) => {
            if (index === floorIndex) {
                const updatedTiles = [...floor.tiles];
                updatedTiles.splice(tileIndex + 1, 0, newTile);
                return { ...floor, tiles: updatedTiles };
            }
            return floor;
        });
        setFloorss(updatedFloors);
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
    const handleFileChanges = (selected) => {
        if (!selected) {
            setSelectedFiles(null);
            return;
        }
        const selectedClientDatas = fullDatas.find(calculation => calculation.id === selected.value);
        setSelectedFiles(selected);
        if (selectedClientDatas) {
            const seenFloors = new Set();
            const newFloorsData = selectedClientDatas.calculations.map(calc => {
                const floorName = calc.floorName || 'No floor name available';
                const areaName = "";
                const floorVisible = !seenFloors.has(floorName);
                seenFloors.add(floorName);
                const filteredTiles = calc.tiles.filter(tile => tile.type === "Floor Tile");
                return {
                    floorName: floorVisible ? floorName : null,
                    areaName: areaName,
                    tiles: filteredTiles.map(tile => {
                        return {
                            type: "",
                            length: "",
                            breadth: "",
                            height: "",
                            deductionArea: "",
                        };
                    }),
                };
            });
            setFloorss(newFloorsData);
        } else {
            setFloorss([]);
        }
    };
    const handleInteriorTileChange = (floorIndex, tileIndex, e) => {
        const { name, value } = e.target;
        const updatedFloors = [...floorss];
        const tile = updatedFloors[floorIndex].tiles[tileIndex];
        tile[name] = value;
        if (name === "labourRate") {
            tile.labourRate = value;
        }
        const selectedAreaName = updatedFloors[floorIndex].areaName;
        const matchingBeam = beamData.find((beam) => beam.beamName === selectedAreaName);
        if (tile.length && tile.breadth && tile.height && matchingBeam && matchingBeam.formula) {
            const lengthInches = convertToInches(tile.length || "1'");
            const breadthInches = convertToInches(tile.breadth);
            const heightInches = convertToInches(tile.height);
            if (lengthInches === 0 || breadthInches === 0 || heightInches === 0) {
                tile.area = "0.00";
            } else {
                const normalizedDeduction = parseFloat(tile.deductionArea) || 0;
                let formula = matchingBeam.formula
                    .replace(/L/g, lengthInches)
                    .replace(/B/g, breadthInches)
                    .replace(/H/g, heightInches)
                    .replace(/D/g, normalizedDeduction)
                    .replace(/x/gi, "*")
                formula = formula.replace(/(\d+)\s*['"]/g, (_, inches) => `(${inches}/12)`);
                formula = formula.replace(/['"]/g, "");
                try {
                    const areas = evaluate(formula, {
                        length: lengthInches || 0,
                        breadth: breadthInches || 0,
                        height: heightInches || 0,
                        deduction: normalizedDeduction || 0,
                    });
                    tile.area = isNaN(areas) ? "0.00" : (areas * tile.quantity).toFixed(2);
                } catch (error) {
                    console.error("Error evaluating formula:", error);
                    tile.area = "0.00";
                }
            }
        } else {
            tile.area = "0.00";
        }
        const area = parseFloat(tile.area) || 0;
        const deductionArea = parseFloat(tile.deductionArea) || 0;
        tile.totalArea = (area - deductionArea).toFixed(2);
        const rate = parseFloat(tile.rate) || 0;
        tile.amount = (tile.totalArea * rate).toFixed(2);
        if (tile.mix) {
            const ratioMatch = tile.mix.match(/([\d.]+):([\d.]+):([\d.]+)/);
            if (ratioMatch) {
                const cementPart = parseFloat(ratioMatch[1]);
                const sandPart = parseFloat(ratioMatch[2]);
                const jallyPart = parseFloat(ratioMatch[3]);
                const totalParts = cementPart + sandPart + jallyPart;
                const L = convertToInches(tile.length || "1'");
                const H = convertToInches(tile.height);
                const B = convertToInches(tile.breadth);
                const cementRate = parseFloat(values.cementRate || 0);
                const sandRate = parseFloat(values.sandRate || 0);
                const jallyRate = parseFloat(values.jallyRate || 0);
                const totalVolume = L * H * B;
                const cement = parseFloat((((totalVolume / totalParts) * cementPart)) * tile.quantity);
                const sand = parseFloat((((totalVolume / totalParts) * sandPart)) * tile.quantity);
                const jally = parseFloat((((totalVolume / totalParts) * jallyPart)) * tile.quantity);
                const cementWastage = parseFloat(values.cementWastage || "0%") / 100;
                const sandWastage = parseFloat(values.sandWastage || "0%") / 100;
                const jallyWastage = parseFloat(values.jallyWastage || "0%") / 100;
                const cementWastages = cement * cementWastage;
                const sandWastages = sand * sandWastage;
                const jallyWastages = jally * jallyWastage;
                const jallyWithWastage = jallyWastages + jally;
                const sandWithWastage = sandWastages + sand;
                const cementWithWastage = cementWastages + cement;
                tile.cement = cementWithWastage.toFixed(2);
                tile.sand = sandWithWastage.toFixed(2);
                tile.jally = jallyWithWastage.toFixed(2);
                tile.cementWastage = values.cementWastage;
                tile.sandWastage = values.sandWastage;
                tile.jallyWastage = values.jallyWastage;
                tile.totalValume = (
                    parseFloat(tile.cement) +
                    parseFloat(tile.sand) +
                    parseFloat(tile.jally)
                ).toFixed(2);
                const totalAmountCement = parseFloat((tile.cement * cementRate).toFixed(2));
                const totalAmountSand = parseFloat((tile.sand * (sandRate / 100)).toFixed(2));
                const totalAmountJally = parseFloat((tile.jally * (jallyRate / 100)).toFixed(2));
                tile.LabourAmount = parseFloat((
                    tile.totalValume * (tile.labourRate || 1)
                ).toFixed(2));
                tile.totalAmountCft = parseFloat((totalAmountCement + totalAmountSand + totalAmountJally).toFixed(2));
                tile.concreteTotalAmount = tile.totalAmountCft + tile.LabourAmount;
            }
        }
        setFloorss(updatedFloors);
    };
    const [steelRate, setSteelRate] = useState("");
    const handleCommonRateChange = (newRate) => {
        setSteelRate(newRate);
        const updatedFloors = [...floorss];
        updatedFloors.forEach((floor, floorIndex) => {
            floor.tiles.forEach((tile, tileIndex) => {
                tile.rate = newRate;
                const lengthInches = convertToInches(tile.length || "1'");
                const breadthInches = convertToInches(tile.breadth || "0'");
                const heightInches = convertToInches(tile.height || "0'");
                const normalizedDeduction = parseFloat(tile.deductionArea) || 0;
                const matchingBeam = beamData.find((beam) => beam.beamName === floor.areaName);
                if (lengthInches && breadthInches && heightInches && matchingBeam && matchingBeam.formula) {
                    let formula = matchingBeam.formula
                        .replace(/L/g, lengthInches)
                        .replace(/B/g, breadthInches)
                        .replace(/H/g, heightInches)
                        .replace(/x/gi, "*")
                        .replace(/D/g, normalizedDeduction);
                    formula = formula.replace(/(\d+)\s*['"]/g, (_, inches) => `(${inches}/12)`);
                    formula = formula.replace(/['"]/g, "");
                    try {
                        const variables = {
                            length: lengthInches,
                            breadth: breadthInches,
                            height: heightInches,
                            deduction: normalizedDeduction,
                        };
                        const areas = evaluate(formula, variables).toFixed(2);
                        tile.area = (areas * tile.quantity).toFixed(2);
                    } catch (error) {
                        console.error("Error evaluating formula:", error);
                        tile.area = "0.00";
                    }
                } else {
                    tile.area = "0.00";
                }
                const area = parseFloat(tile.area) || 0;
                const totalArea = Math.max(area - normalizedDeduction, 0);
                tile.totalArea = totalArea.toFixed(2);
                tile.amount = (totalArea * parseFloat(newRate || 0)).toFixed(2);
            });
        });
        setFloorss(updatedFloors);
    };
    const handleSteelRateChange = (value) => {
        const parsedValue = parseFloat(value) || 0;
        setSteelRate(parsedValue);
        setEditableRate(parsedValue);
    };
    const handleEditableRateChange = (value) => {
        const parsedValue = parseFloat(value) || 0;
        setEditableRate(parsedValue);
    };
    const [message, setMessage] = useState('');
    console.log(message);
    const [selectedGroundFloor, setSelectedGroundFloor] = useState([]);
    const [selectedGroundFloor1, setSelectedGroundFloor1] = useState([]);
    const [selectedGroundFloor2, setSelectedGroundFloor2] = useState([]);
    const [selectedFirstFloor, setSelectedFirstFloor] = useState([]);
    const [selectedFirstFloor1, setSelectedFirstFloor1] = useState([]);
    const [selectedFirstFloor2, setSelectedFirstFloor2] = useState([]);
    const [groundFloorOpen, setGroundFloorOpen] = useState(false);
    const [firstFloorOpen, setFirstFloorOpen] = useState(false);
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
    const fetchRccCalculations = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/rcc_formWork/getAll');
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
            setRccFullData(data);
            console.log(data);
            setFileOptions(formattedOptions);
        } catch (error) {
            console.error('Error fetching calculations:', error);
        }
    };
    useEffect(() => {
        fetchRccCalculations();
    }, []);
    const deleteFloor = (floorIndex) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this floor?");
        if (confirmDelete) {
            const updatedFloors = [...floorss];
            updatedFloors.splice(floorIndex, 1);
            let i = floorIndex;
            while (i < updatedFloors.length && (!updatedFloors[i] || !updatedFloors[i].floorName)) {
                updatedFloors.splice(i, 1);
            }
            setFloorss(updatedFloors);
        }
    };
    const deleteAreaRow = (floorIndex, tileIndex) => {
        const updatedFloors = [...floorss];
        const floor = updatedFloors[floorIndex];
        floor.tiles.splice(tileIndex, 1);
        let i = tileIndex;
        while (i < floor.tiles.length && (!floor.tiles[i] || !floor.tiles[i].areaName)) {
            floor.tiles.splice(i, 1);
        }
        setFloorss(updatedFloors);
    };
    const addAreaRow = (floorIndex) => {
        const updatedFloors = [...floorss];
        updatedFloors.splice(floorIndex + 1, 0, {
            floorName: null,
            areaName: "",
            tiles: [
                { type: "", length: "", breadth: "", height: "", quantity: "1", deductionArea: "", wastagePercentage: "0" },
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
        setFloorss(updatedFloors);
    };
    const [editableRate, setEditableRate] = useState("");
    const addFloorRow = () => {
        setFloorss((prevFloors) => [
            ...prevFloors,
            {
                floorName: "",
                areaName: "",
                tiles: [
                    { type: "", length: "1'", breadth: "", height: "", quantity: "1", deductionArea: "", wastagePercentage: "0" },
                ],
            },
        ]);
        setDeductionPopupState((prevPopupState) => ({
            ...prevPopupState,
            [`${floorss.length}-0`]: false,
        }));
    };
    let displayIndex = 1;
    const handleSiteChange = (selected) => {
        setRccClientName(selected);
        setRccClientSNo(selected ? selected.sNo : "");
        if (selected) {
            const clientNameFromSite = selected.value;
            const filteredOptions = fileOptions.filter(
                option => option.clientName === clientNameFromSite
            );
            setFilteredRccFileOptions(filteredOptions);
        } else {
            setFilteredRccFileOptions([]);
            setRccSelectedFile(null);
            setFloorss([{
                floorName: "Ground Floor",
                areaName: "",
                tiles: [{ length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" }],
            }]);
        }
    };
    const preparePayload = async () => {
        const formatDates = (date) => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        };
        let lastValidFloorName = null;
        try {
            const response = await fetch("https://backendaab.in/aabuilderDash/api/rcc_formWork/getAll");
            const data = await response.json();
            const validData = data.filter((item) => item.clientName !== null && item.clientName !== undefined);
            const clientNameCount = validData.filter(
                (item) => item.clientName === RccClientName.label
            ).length;
            const fileName = `${formatDates(date)} - R ${clientNameCount}`;
            const payload = {
                clientName: RccClientName.label,
                date: formatDate(date),
                fileName: fileName,
                ENo: "eno",
                cementRate: values.cementRate,
                sandRate: values.sandRate,
                jallyRate: values.jallyRate,
                cementWastage: values.cementWastage,
                sandWastage: values.sandWastage,
                jallyWastage: values.jallyWastage,
                commonMix: commonMix,
                commonLabourRate: commonLabourRate,
                rateSqft: commonRate,
                rateKg: steelRate,
                rccFormWorkFloorDetails: floorss.map((floor) => {
                    const floorName = floor.floorName || lastValidFloorName;
                    if (floorName) {
                        lastValidFloorName = floorName;
                    }
                    return {
                        floorName: floorName || null,
                        beamName: floor.areaName || null,
                        rccFormWorks: floor.tiles.map((tile) => ({
                            type: tile.type || "",
                            size: tile.size || "",
                            rccTypes: "Rcc",
                            length: tile.length || "1'",
                            length1: tile.length1,
                            length2: tile.length2,
                            length3: tile.length3,
                            length4: tile.length4,
                            length5: tile.length5,
                            length6: tile.length6,
                            length7: tile.length7,
                            length8: tile.length8,
                            length9: tile.length9,
                            length10: tile.length10,
                            length11: tile.length11,
                            length12: tile.length12,
                            length13: tile.length13,
                            length14: tile.length14,
                            length15: tile.length15,
                            length16: tile.length16,
                            length17: tile.length17,
                            length18: tile.length18,
                            length19: tile.length19,
                            length20: tile.length20,
                            length21: tile.length21,
                            length22: tile.length22,
                            length23: tile.length23,
                            length24: tile.length24,
                            length25: tile.length25,
                            length26: tile.length26,
                            length27: tile.length27,
                            length28: tile.length28,
                            length29: tile.length29,
                            length30: tile.length30,
                            length31: tile.length31,
                            length32: tile.length32,
                            length33: tile.length33,
                            length34: tile.length34,
                            length35: tile.length35,
                            breadth: tile.breadth || 0,
                            height: tile.height || 0,
                            quantity: tile.quantity || "1",
                            area: tile.area || 0,
                            deductionArea: tile.deductionArea || 0,
                            deductionInput: tile.deductionInput,
                            deduction1: tile.deduction1,
                            deduction2: tile.deduction2,
                            deduction3: tile.deduction3,
                            deduction4: tile.deduction4,
                            deduction5: tile.deduction5,
                            deduction6: tile.deduction6,
                            deduction7: tile.deduction7,
                            deduction8: tile.deduction8,
                            totalArea: tile.totalArea || 0,
                            rate: tile.rate || 0,
                            totalAmount: tile.amount || 0,
                            mix: tile.mix,
                            cement: tile.cement,
                            sand: tile.sand,
                            jally: tile.jally,
                            totalVolume: tile.totalValume,
                            labourRate: tile.labourRate,
                            totalAmountCft: tile.totalAmountCft,
                            labourAmount: tile.LabourAmount,
                            concreteTotalAmount: tile.concreteTotalAmount,
                        })),
                    };
                }),
            };
            return payload;
        } catch (error) {
            console.error("Error fetching or processing data:", error);
        }
    };
    const handleSubmit = async () => {
        const payload = await preparePayload();
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/rcc_formWork/save/form_work', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (response.ok) {
                alert("Rcc calculation saved successfully!");
                window.location.reload();
            } else {
                alert("Error saving paint calculation. Please try again.");
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleFileChange = (selected) => {
        if (!selected) {
            setRccSelectedFile(null);
            setFloorss([]);
            setCommonMix("");
            setCommonLabourRate("");
            setValues({
                cementRate: "",
                sandRate: "",
                jallyRate: "",
                cementWastage: "0%",
                sandWastage: "0%",
                jallyWastage: "0%"
            });
            return;
        }
        const selectedClientData = rccFullData.find(calculation => calculation.id === selected.value);
        setRccSelectedFile(selected);
        if (selectedClientData) {
            const {
                cementRate, sandRate, jallyRate,
                cementWastage, sandWastage, jallyWastage,
                commonMix, commonLabourRate, rateSqft, rateKg
            } = selectedClientData;
            setCommonMix(commonMix || "");
            setCommonLabourRate(commonLabourRate || "");
            setCommonRate(rateSqft || "");
            setSteelRate(rateKg || "");
            setValues({
                cementRate: cementRate || "",
                sandRate: sandRate || "",
                jallyRate: jallyRate || "",
                cementWastage: cementWastage || "0%",
                sandWastage: sandWastage || "0%",
                jallyWastage: jallyWastage || "0%"
            });
            const seenFloors = new Set();
            const newFloorsData = selectedClientData.rccFormWorkFloorDetails.map(calc => {
                const floorName = calc.floorName || 'No floor name available';
                const areaName = calc.beamName || 'No area name available';
                const floorVisible = !seenFloors.has(floorName);
                seenFloors.add(floorName);
                return {
                    floorName: floorVisible ? floorName : null,
                    areaName: areaName,
                    tiles: calc.rccFormWorks.map(tile => ({
                        type: tile.type,
                        size: tile.size,
                        length: tile.length || "1'",
                        length1: tile.length1,
                        length2: tile.length2,
                        length3: tile.length3,
                        length4: tile.length4,
                        length5: tile.length5,
                        length6: tile.length6,
                        length7: tile.length7,
                        length8: tile.length8,
                        length9: tile.length9,
                        length10: tile.length10,
                        length11: tile.length11,
                        length12: tile.length12,
                        length13: tile.length13,
                        length14: tile.length14,
                        length15: tile.length15,
                        length16: tile.length16,
                        length17: tile.length17,
                        length18: tile.length18,
                        length19: tile.length19,
                        length20: tile.length20,
                        length21: tile.length21,
                        length22: tile.length22,
                        length23: tile.length23,
                        length24: tile.length24,
                        length25: tile.length25,
                        length26: tile.length26,
                        length27: tile.length27,
                        length28: tile.length28,
                        length29: tile.length29,
                        length30: tile.length30,
                        length31: tile.length31,
                        length32: tile.length32,
                        length33: tile.length33,
                        length34: tile.length34,
                        length35: tile.length35,
                        breadth: tile.breadth || 0,
                        height: tile.height || 0,
                        quantity: tile.quantity || "1",
                        area: tile.area || 0,
                        deductionArea: tile.deductionArea || 0,
                        deductionInput: tile.deductionInput,
                        deduction1: tile.deduction1,
                        deduction2: tile.deduction2,
                        deduction3: tile.deduction3,
                        deduction4: tile.deduction4,
                        deduction5: tile.deduction5,
                        deduction6: tile.deduction6,
                        deduction7: tile.deduction7,
                        deduction8: tile.deduction8,
                        totalArea: tile.totalArea || 0,
                        rate: tile.rate,
                        amount: tile.totalAmount,
                        mix: tile.mix || commonMix,
                        cement: tile.cement,
                        sand: tile.sand,
                        jally: tile.jally,
                        totalValume: tile.totalVolume,
                        labourRate: tile.labourRate || commonLabourRate,
                        totalAmountCft: tile.totalAmountCft,
                        LabourAmount: tile.labourAmount,
                        concreteTotalAmount: tile.concreteTotalAmount
                    })),
                };
            });
            setFloorss(newFloorsData);
        } else {
            setFloorss([]);
        }
    };
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
        const siteName = RccClientName.label;
        const clientId = rccClientSNo || 0;
        const revisionCount = await getRevisionNumber(RccClientName.label);
        const revisionNumber = `R${revisionCount}`;
        const header = (doc) => {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("RCC MEASUREMENT SHEET", 14, 15);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            const clientLabel = "CLIENT: ";
            doc.text(clientLabel, 14, 33);
            const labelWidth = doc.getTextWidth(clientLabel);
            doc.setFontSize(8);
            doc.text("FORM WORK", doc.internal.pageSize.width - 32, 41);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const siteNameText = siteName.toUpperCase();
            doc.text(siteNameText, 14 + labelWidth, 33);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("BILL COPY", doc.internal.pageSize.width - 34, 15);
            doc.setFontSize(10);
            const tmsDate = `FMS BC ${clientId} - ${selectedDate} - ${revisionNumber}`;
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
        let yPosition = 44;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(14, yPosition, doc.internal.pageSize.width - 14, yPosition);
        let totalAmountPDF = 0;
        const floorMap = {};
        let floorCounter = 0;
        const tableBody = [];
        let previousFloorName = null;
        let previousAreaName = null; // track last areaName

        let rowCounter = 1; // Move OUTSIDE the floors loop

        filteredFloors
            .filter(floor => floor.tiles.some(tile => selectedAreass[`${floor.floorName}-${floor.areaName}`]))
            .forEach(floor => {
                if (!(floor.floorName in floorMap)) {
                    floorMap[floor.floorName] = String.fromCharCode(65 + floorCounter++);
                }
                const floorLabel = floorMap[floor.floorName];
                const isNewFloor = floor.floorName !== previousFloorName;

                if (isNewFloor) {
                    tableBody.push([
                        { content: floorLabel, styles: { fontStyle: "bold" } },
                        { content: floor.floorName.toUpperCase(), styles: { fontStyle: "bold" } },
                        "", "", "", "", "", "", "", "", ""
                    ]);
                    previousFloorName = floor.floorName;
                    previousAreaName = null;
                }

                floor.tiles.forEach(tile => {
                    if (selectedAreass[`${floor.floorName}-${floor.areaName}`]) {
                        totalAmountPDF += parseFloat(tile.amount) || 0;

                        const isNewArea = floor.areaName !== previousAreaName;
                        const areaCell = isNewArea
                            ? { content: floor.areaName, styles: { fontStyle: "bold" } }
                            : "";

                        tableBody.push([
                            isNewArea ? rowCounter++ : "", // Only increment when area name is shown
                            areaCell,
                            tile.type,
                            tile.size,
                            tile.length || "0",
                            tile.breadth || "0",
                            tile.height || "0",
                            tile.quantity || "0",
                            tile.area || "0",
                            tile.deductionArea || "0",
                            tile.totalArea || "0",
                            tile.rate || "0",
                            tile.amount || "0"
                        ]);

                        previousAreaName = floor.areaName;
                    }
                });
            });
        // --- Add Total Row at End ---
        tableBody.push([
            { content: "Total", colSpan: 12, styles: { halign: "right", fontStyle: "bold" } },
            {
                content: totalAmountPDF.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                styles: { fontStyle: "bold", halign: "right" }
            }
        ]);
        doc.autoTable({
            head: [
                ["SNo", "Description", "Type", "Size", "L", "B", "H", "Qty", "Area (sqft)", "D Area", "Total Area", "Rate (sqft)", "Total Amount"]
            ],
            body: tableBody,
            theme: "grid",
            startY: yPosition,
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
                1: { halign: "left", cellWidth: 50 },
                2: { halign: "left", cellWidth: 29 },
                3: { halign: "center", cellWidth: 20 },
                4: { halign: "center", cellWidth: 19 },
                5: { halign: "center", cellWidth: 19 },
                6: { halign: "center", cellWidth: 19 },
                7: { halign: "center", cellWidth: 12 },
                8: { halign: "center", cellWidth: 15 },
                9: { halign: "center", cellWidth: 15 },
                10: { halign: "right", cellWidth: 24 },
                11: { halign: "center", cellWidth: 15 },
                12: { halign: "right", cellWidth: 20 },
            },
            margin: { left: 14, right: 14, top: 44 },
            pageBreak: 'auto',
            didDrawPage: (data) => {
                if (doc.internal.getCurrentPageInfo().pageNumber > 1) {
                    data.settings.startY = -30;
                    const tableStartY = 44;
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.6);
                    doc.line(14, tableStartY, doc.internal.pageSize.width - 14, tableStartY);
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
        const filename = `FMS BC ${clientId} - ${selectedDate} - ${revisionNumber}.pdf`;
        doc.save(filename);
        return doc.output("blob");
    };
    const getSummaryData = (floors) => {
        const summary1 = [];
        const summary2 = [];
        let lastValidFloorName = "";
        floors.forEach((floor) => {
            const floorName = floor.floorName || lastValidFloorName;
            if (floor.floorName) {
                lastValidFloorName = floor.floorName;
            }
            const groupedTiles = {};
            floor.tiles.forEach((tile) => {
                const key = `${floorName}-${floor.areaName}-${tile.size}`;
                if (!groupedTiles[key]) {
                    groupedTiles[key] = {
                        ...tile,
                        count: 1,
                        floorName,
                        areaName: floor.areaName,
                        totalArea: parseFloat(tile.totalArea || 0).toFixed(2),
                    };
                } else {
                    groupedTiles[key].count += 1;
                    groupedTiles[key].totalArea = (
                        parseFloat(groupedTiles[key].totalArea || 0) + parseFloat(tile.totalArea || 0)
                    ).toFixed(2);
                }
            });
            summary1.push(...Object.values(groupedTiles));
            const summary2Key = `${floorName}-${floor.areaName}`;
            const existingSummary2 = summary2.find((item) => item.key === summary2Key);
            const totalArea = floor.tiles.reduce((sum, tile) => sum + parseFloat(tile.totalArea || 0), 0).toFixed(2);
            const totalAmount = floor.tiles.reduce((sum, tile) => sum + parseFloat(tile.amount || 0), 0).toFixed(2);

            if (!existingSummary2) {
                summary2.push({
                    key: summary2Key,
                    floorName,
                    areaName: floor.areaName,
                    totalArea,
                    qty: floor.tiles.length,
                    amount: totalAmount,
                });
            } else {
                existingSummary2.totalArea = (
                    parseFloat(existingSummary2.totalArea) + parseFloat(totalArea)
                ).toFixed(2);
                existingSummary2.qty += floor.tiles.length;
                existingSummary2.amount = (
                    parseFloat(existingSummary2.amount) + parseFloat(totalAmount)
                ).toFixed(2);
            }
        });
        return { summary1, summary2 };
    };
    const { summary1, summary2 } = getSummaryData(floorss);
    const totalQty = summary2.reduce((acc, item) => acc + (item.qty || 0), 0);
    const totalAmount = summary2.reduce((acc, item) => acc + Number(item.amount || 0), 0).toFixed(2);
    const reversedFileOptions = [...filteredRccFileOptions].reverse();
    return (
        <body className="">
            <div className="-mt-12 mb-3">
                <button
                    className="w-44 h-9 bg-[#BF9853] rounded text-white"
                    style={{ marginLeft: "1690px" }}
                    onClick={openPopup}>
                    Order Summary
                </button>
            </div>
            {isPopupOpen3 && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    onClick={closePopup}>
                    <div
                        className="bg-white  shadow-lg  p-6" style={{ width: '500px' }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center  pb-3">
                            <h2 className="text-lg font-semibold text-[#E4572E] ml-40">Ramar Krishnankovil</h2>
                            <button
                                className="text-[#E4572E] transition"
                                onClick={closePopup}>
                                ✖
                            </button>
                        </div>
                        <table className=" text-left w-full text-sm mt-4">
                            <thead className="bg-[#FAF6ED]">
                                <tr>
                                    <th className="px-4 py-2 text-base font-bold">Floor Name</th>
                                    <th className="px-4 py-2 text-base font-bold">Beam Name</th>
                                    <th className="px-4 py-2 text-base font-bold">Size</th>
                                    <th className="px-4 py-2 text-base font-bold">SQFT</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-2 font-semibold">First Floor</td>
                                    <td className="px-4 py-2 font-semibold">Roof Beam</td>
                                    <td className="px-4 py-2 font-semibold">12"X12"</td>
                                    <td className="px-4 py-2 font-semibold">3</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-semibold">First Floor</td>
                                    <td className="px-4 py-2 font-semibold">Roof Beam</td>
                                    <td className="px-4 py-2 font-semibold">2"X2"</td>
                                    <td className="px-4 py-2 font-semibold">0.5</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="flex gap-16 mt-4 text-lg font-semibold text-[#E4572E]" style={{ marginLeft: '290px' }}>
                            <h1>Total</h1>
                            <h1 >17</h1>
                        </div>
                    </div>
                </div>
            )}
            <div className=" mx-auto p-6 border-collapse bg-[#FFFFFF] ml-6 mr-6 rounded-md">
                <div className=" flex">
                    <div className=" flex">
                        <div className="w-full -mt-8 mb-4">
                            <h4 className=" mt-10 font-bold mb-2 lg:-ml-52 -ml-36">Project Name</h4>
                            <Select
                                value={RccClientName}
                                onChange={handleSiteChange}
                                options={sortedSiteOptions}
                                placeholder="Select Site Name..."
                                className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg lg:w-80 w-64 h-12 text-left"
                                styles={customSelectStyles}
                                isClearable />
                        </div>
                        <input
                            type="text"
                            value={rccClientSNo}
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
                            className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg w-60 h-12"
                            options={reversedFileOptions}
                            onChange={handleFileChange}
                            value={rccSelectedFile}
                            styles={customSelectStyles}
                            isClearable
                            isDisabled={!RccClientName} />
                    </div>
                </div>
                <div className="flex ml-[83%] -mt-5">
                    <h4 className="font-semibold text-lg mt-1">{rateLabel}</h4>
                    {activeTab === "formwork" && (
                        <td>
                            <input
                                type="text"
                                value={commonRate}
                                onChange={(e) => {
                                    const newRate = e.target.value;
                                    setCommonRate(newRate);
                                    if (!isNaN(newRate) && newRate.trim() !== "") {
                                        handleCommonRateChange(parseFloat(newRate));
                                    }
                                }}
                                className="ml-2 w-[61px] pl-2 bg-transparent h-[36px] border-2 border-[#FAF6ED] rounded-md focus:outline-none"
                            />
                        </td>
                    )}
                    {activeTab === "steel" && (
                        <td>
                            <input
                                type="text"
                                value={steelRate}
                                onChange={(e) => handleSteelRateChange(e.target.value)}
                                className="ml-2 w-[61px] pl-2 bg-transparent h-[36px] border-2 border-[#FAF6ED] rounded-md focus:outline-none"
                            />
                        </td>
                    )}
                    <div className="flex ml-[2%] mt-0">
                        <button className="bg-[#007233] w-28 h-[36px] rounded-md text-white" onClick={openImportPopup}>+ Import</button>
                    </div>
                </div>
            </div>
            <div className="mt-5">
                <div className="mt-5">
                    <div className="tabs flex ml-12 gap-5">
                        <button
                            className={`p-2 ${activeTab === "formwork"
                                ? "font-bold text-lg border-b-2 border-[#DAA520]"
                                : "font-semibold text-black"
                                }`}
                            onClick={() => handleTabChange("formwork")}>
                            FormWork
                        </button>
                        <button
                            className={`p-2 ${activeTab === "steel"
                                ? "font-bold text-lg border-b-2 border-[#DAA520]"
                                : "font-semibold text-black"
                                }`}
                            onClick={() => handleTabChange("steel")}>
                            Steel
                        </button>
                        <button
                            className={`p-2 ${activeTab === "concrete"
                                ? "font-bold text-lg border-b-2 border-[#DAA520]"
                                : "font-semibold text-black"
                                }`}
                            onClick={() => handleTabChange("concrete")}>
                            Concrete
                        </button>
                    </div>
                </div>
            </div>
            <div className="content">
                {activeTab === "formwork" && (
                    <div className=" p-6 bg-[#FFFFFF] ml-6 mr-6 rounded-lg">
                        <div className="rounded-lg border-l-8 border-l-[#BF9853] flex -mt-3" id="full-table">
                            <table className="table-auto w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-28 text-left pl-2 align-middle" rowSpan="2">Description</th>
                                        <th className="w-20 text-left pl-7 align-middle" rowSpan="2">Type</th>
                                        <th className="w-20 text-center align-middle" rowSpan="2">Size</th>
                                        <th className="text-center text-lg align-middle" colSpan="3">Measurement</th>
                                        <th className="w-24 text-center align-middle" rowSpan="2">Quantity</th>
                                        <th className="w-24 text-center align-middle" rowSpan="2">Area (sqft)</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">Deduction Area (sqft)</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">Total Area (sqft)</th>
                                        <th className="w-24 text-center align-middle" rowSpan="2">Rate (sqft)</th>
                                        <th className="w-28 text-center align-middle" rowSpan="2">Total Amount</th>
                                    </tr>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-16 text-[#E4572E] text-center">L</th>
                                        <th className="w-16 text-[#E4572E] text-center">B</th>
                                        <th className="w-16 text-[#E4572E] text-center">H</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {floorss.map((floor, floorIndex) => (
                                        <React.Fragment key={floorIndex}>
                                            <tr className="bg-gray-50">
                                                <td colSpan="13" className="font-bold text-left pl-2 group">
                                                    {floor.floorName !== null && (
                                                        <div className="flex">
                                                            <span className="mt-1">{displayIndex++}.</span>
                                                            <select
                                                                value={floor.floorName || ""}
                                                                onChange={(e) => handleFloorChange(floorIndex, e.target.value)}
                                                                className="w-60 p-1 rounded-lg bg-transparent focus:outline-none font-semibold">
                                                                <option value="" disabled>Select Floor..</option>
                                                                {floorOptions.map((floorOption, idx) => (
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
                                                                    options={beamNames.map((option) => ({
                                                                        value: option,
                                                                        label: option,
                                                                    }))}
                                                                    value={floor.areaName ? { value: floor.areaName, label: floor.areaName } : null}
                                                                    onChange={(selectedOption) => handleAreaChange(floorIndex, selectedOption)}
                                                                    className="w-44 h-10 text-left ml-3 hover:border font-semibold"
                                                                    placeholder="Select Area"
                                                                    isClearable
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
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-52"></div>
                                                            )}
                                                            {tileIndex === 0 && (
                                                                <div key={floorIndex} className="items-center flex space-x-6 invisible group-hover:visible">
                                                                    <button onClick={() => addAreaRow(floorIndex)}>
                                                                        <img src={add} alt="add" className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => deleteAreaRow(floorIndex, tileIndex,)} className="ml-2">
                                                                        <img src={delt} alt="delete" className="w-4 h-4 " />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="text-center w-[67px] group">
                                                            <div className="flex ">
                                                                <select
                                                                    className="w-24 bg-transparent font-medium rounded-sm px-1 hover:border focus:outline-none"
                                                                    value={tile.type || ''}
                                                                    onChange={(e) =>
                                                                        handleInputChange(floorIndex, tileIndex, 'type', e.target.value)
                                                                    }
                                                                >
                                                                    <option value="" disabled hidden>
                                                                        Select RB
                                                                    </option>
                                                                    {getFilteredBeamTypes(floor.areaName).map((item) => (
                                                                        <option key={item.beamType} value={item.beamType}>
                                                                            {item.beamType}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <div className="flex ml-4 space-x-1 w-16 invisible group-hover:visible">
                                                                    <button onClick={() => addNewRowAfter(floorIndex, tileIndex)}>
                                                                        <img src={Right} alt="add" className="h-4" />
                                                                    </button>
                                                                    <button>
                                                                        <img src={Wrong} onClick={() => removeRow1(floorIndex, tileIndex)} alt="delete" className="h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-center">
                                                            {!["ROOF SLAB", "SEPTICK TANK", "SUMP TANK", "MAT", "LOFT", "SUNSHADE","WAIST SLAB"].includes(floor.areaName) && (
                                                                <CreatableSelect
                                                                    className="w-[160px] h-[27px] font-medium -mt-2"
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
                                                                    }}
                                                                    value={tile.size ? { label: tile.size, value: tile.size } : null}
                                                                    options={rccSizeList.map((item) => ({
                                                                        label: item.size,
                                                                        value: item.size,
                                                                    }))}
                                                                    onChange={(selectedOption) =>
                                                                        handleInputChange(floorIndex, tileIndex, "size", selectedOption ? selectedOption.value : "")
                                                                    }
                                                                    onCreateOption={(inputValue) => {
                                                                        const newOption = { size: inputValue };
                                                                        rccSizeList.push(newOption);
                                                                        handleInputChange(floorIndex, tileIndex, "size", inputValue);
                                                                    }}
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="">
                                                            <div className="flex">
                                                                <input
                                                                    type="text"
                                                                    name="length"
                                                                    placeholder="L"
                                                                    value={tile.length || ""}
                                                                    onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                    className="px-2 w-[90px] text-base font-medium h-[27px] bg-transparent hover:border focus:outline-none text-center"
                                                                />
                                                                {!["ROOF SLAB", "SEPTICK TANK", "SUMP TANK", "MAT","LOFT", "SUNSHADE","WAIST SLAB"].includes(floor.areaName) && (
                                                                    <button className="text-[#E4572E]" onClick={() => openLengthPopupScreen(floorIndex, tileIndex)}>
                                                                        L
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        {!["ROOF SLAB", "SEPTICK TANK", "SUMP TANK", "MAT", "LOFT", "SUNSHADE","WAIST SLAB"].includes(floor.areaName) && lengthPopupState[`${floorIndex}-${tileIndex}`] && (
                                                            <div
                                                                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                                                                onClick={() => closelengthPopup(floorIndex, tileIndex)} >
                                                                <div className="bg-white rounded-md w-[54rem] py-2 relative z-50" onClick={(e) => e.stopPropagation()}>
                                                                    <div className="flex mb-4 mt-2">
                                                                        <label className="text-[#E4572E] text-xl font-bold ml-[14rem] w-96">
                                                                            {floor.areaName} ( {tile.type} ) - Length
                                                                        </label>
                                                                        <button className="text-[#E4572E] ml-[14rem] -mt-4" onClick={() => closelengthPopup(floorIndex, tileIndex)} >
                                                                            <img src={cross} alt="close" className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                    <div className="overflow-x-auto">
                                                                        <div className="max-h-[38rem] overflow-y-auto">
                                                                            <table className="min-w-full border-collapse border border-gray-300">
                                                                                <tbody className="odd:bg-white even:bg-[#FAF6ED]">
                                                                                    {[...Array(35)].map((_, index) => (
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
                                                                                            {calculateTotalOutput(floorIndex, tileIndex)}
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <td className="">
                                                            <input
                                                                type="text"
                                                                name="breadth"
                                                                placeholder="B"
                                                                value={tile.breadth.replace(/"+/g, '"')}
                                                                readOnly={!["ROOF SLAB", "SEPTICK TANK", "SUMP TANK", "MAT","LOFT", "SUNSHADE","WAIST SLAB"].includes(floor.areaName)}
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-16 bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="">
                                                            <input
                                                                type="text"
                                                                name="height"
                                                                placeholder="H"
                                                                value={tile.height}
                                                                readOnly={!["ROOF SLAB", "SEPTICK TANK", "SUMP TANK", "MAT","LOFT", "SUNSHADE","WAIST SLAB"].includes(floor.areaName)}
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-[90px] text-base font-medium h-[27px] bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="text-center">
                                                            <input
                                                                type="text"
                                                                name="quantity"
                                                                placeholder="Qty"
                                                                value={tile.quantity}
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-14 bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="px-2">
                                                            <div className="w-16 pl-8 text-center font-medium">
                                                                {tile.area || "0.00"}
                                                            </div>
                                                        </td>
                                                        <td className="px-2 flex">
                                                            <input
                                                                type="text"
                                                                name="deductionArea"
                                                                value={tile.deductionArea || ""}
                                                                readOnly
                                                                placeholder="Deduction"
                                                                className="px-2 w-20 bg-transparent hover:border focus:outline-none"
                                                            />
                                                            <button className="text-[#E4572E]" onClick={() => openDeductionPopup(floorIndex, tileIndex)}>
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
                                                                        <table className="min-w-full border-collapse border border-gray-300 ">
                                                                            <tbody className="odd:bg-white even:bg-[#FAF6ED]">
                                                                                {[...Array(8)].map((_, index) => (
                                                                                    <tr key={index} >
                                                                                        <td className="border border-gray-300 px-4 py-2">
                                                                                            <CreatableSelect
                                                                                                isClearable
                                                                                                options={deductionType}
                                                                                                value={
                                                                                                    deductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.type
                                                                                                        ? { value: deductionPopupData[`${floorIndex}-${tileIndex}`][index].type, label: deductionPopupData[`${floorIndex}-${tileIndex}`][index].type }
                                                                                                        : null
                                                                                                }
                                                                                                onChange={(selectedOption) => {
                                                                                                    const updatedData = [...(deductionPopupData[`${floorIndex}-${tileIndex}`] || [])];
                                                                                                    if (!updatedData[index]) updatedData[index] = {};
                                                                                                    updatedData[index].type = selectedOption?.value || "";
                                                                                                    handlePopupDataChange(floorIndex, tileIndex, updatedData);
                                                                                                }}
                                                                                                placeholder="Type"
                                                                                                menuPortalTarget={document.body}
                                                                                                styles={{
                                                                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                    menu: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                    control: (base) => ({ ...base, backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }),
                                                                                                }}
                                                                                            />
                                                                                        </td>
                                                                                        <td className="border border-gray-300 px-4 py-2">
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
                                                                                        <td className="border border-gray-300 px-4 py-2">
                                                                                            <input
                                                                                                type="text"
                                                                                                className="w-40 border rounded px-2 py-1"
                                                                                                placeholder="Qty"
                                                                                                value={deductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.qty || ""}
                                                                                                onChange={(e) => handleQtyChange(e, floorIndex, tileIndex, index)}
                                                                                            />
                                                                                        </td>
                                                                                        <td className="border border-gray-300 px-4 py-2">
                                                                                            <input
                                                                                                type="text"
                                                                                                className="w-40 border rounded px-2 py-1"
                                                                                                placeholder="Output"
                                                                                                value={deductionPopupData[`${floorIndex}-${tileIndex}`]?.[index]?.output || ""}
                                                                                                readOnly
                                                                                            />
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                                <tr className="bg-gray-200">
                                                                                    <td colSpan="3" className="border border-gray-300 px-4 py-2 text-right font-bold">Total:</td>
                                                                                    <td className="border border-gray-300 px-4 py-2">
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
                                                        )}
                                                        <td className="text-center px-2">
                                                            <input
                                                                type="text"
                                                                className="w-[62px] bg-transparent font-medium text-center focus:outline-gray-200 rounded-sm px-1"
                                                                placeholder="Adjusted Total Area"
                                                                value={tile.totalArea || "0.00"}
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className="text-center px-2">
                                                            <input
                                                                type="text"
                                                                name="rate"
                                                                placeholder="Rate"
                                                                value={tile.rate}
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-14 bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="text-center px-2">
                                                            <input
                                                                type="text"
                                                                className="w-[90px] bg-gray-200 text-right font-medium focus:outline-gray-200 rounded-sm px-1"
                                                                value={tile.amount || "0.00"}
                                                                readOnly
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className=" font-bold">
                                        <td colSpan="11" className="text-right px-4 py-2"></td>
                                        <td className="px-4 py-2">{totalAmount}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div>
                            <button type="button" onClick={addFloorRow} className="text-[#E4572E] mt-6 mb-20 -ml-[94%] border-dashed border-b-2 border-[#BF9853] font-semibold">
                                + Add Floor
                            </button>
                        </div>
                        <div className=" buttons -mt-14 flex">
                            <div className="">
                                <button className="w-[150px] h-[36px] text-white rounded ml-2 bg-green-800 hover:text-white transition duration-200 ease-in-out">
                                    Engineer Copy
                                </button>
                            </div>
                            <div className="">
                                <button className="w-[137px] h-[36px]  text-white rounded ml-3 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out"
                                    onClick={openModal}>
                                    View Bill
                                </button>
                                {isModalOpen && (
                                    <div
                                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                                        onClick={closeModal}>
                                        <div
                                            className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-y-auto p-6"
                                            onClick={(e) => e.stopPropagation()}>
                                            <h2 className="text-xl text-center font-bold">Generated Bill</h2>
                                            <div className="text-left border-b pb-3">
                                                <h1 className="flex font-semibold">Site Name:<span className="ml-2">{RccClientName.label}</span></h1>
                                                <h1 className="ml-10 flex font-semibold">Date: <span className="ml-2">{new Date().toLocaleDateString()}</span> </h1>
                                            </div>
                                            <div className="rounded-lg flex -mt-3 overflow-hidden border" id="full-table">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-[#E6E6E6]">
                                                        <tr>
                                                            <th className="px-4 py-2 font-bold text-base">Description</th>
                                                            <th className="px-4 py-2 font-bold text-base">Type</th>
                                                            <th className="px-4 py-2 font-bold text-base">Size</th>
                                                            <th className="px-4 py-2 font-bold text-base">L</th>
                                                            <th className="px-4 py-2 font-bold text-base">B</th>
                                                            <th className="px-4 py-2 font-bold text-base">H</th>
                                                            <th className="px-4 py-2 font-bold text-base">Area (sqft)</th>
                                                            <th className="px-4 py-2 font-bold text-base">Deduction Area (sqft)</th>
                                                            <th className="px-4 py-2 font-bold text-base">Total Area</th>
                                                            <th className="px-4 py-2 font-bold text-base">Rate (sqft)</th>
                                                            <th className="px-4 py-2 font-bold text-base">Total Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {floorss.map((floor, floorIndex) => (
                                                            <React.Fragment key={floorIndex}>
                                                                <tr className="bg-gray-50">
                                                                    <td colSpan="11" className="font-bold text-left pl-2">
                                                                        {floor.floorName}
                                                                    </td>
                                                                </tr>
                                                                {floor.tiles.map((tile, tileIndex) => (
                                                                    <tr key={tileIndex}>
                                                                        <td>{floor.areaName}</td>
                                                                        <td>{tile.type}</td>
                                                                        <td>{tile.size}</td>
                                                                        <td>{tile.length}</td>
                                                                        <td>{tile.breadth}</td>
                                                                        <td>{tile.height}</td>
                                                                        <td>{tile.area}</td>
                                                                        <td>{tile.deductionArea}</td>
                                                                        <td>{tile.totalArea}</td>
                                                                        <td>{tile.rate}</td>
                                                                        <td>{tile.amount}</td>
                                                                    </tr>
                                                                ))}
                                                            </React.Fragment>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-[#F3F3F3] font-bold">
                                                            <td colSpan="10" className="text-right px-4 py-2">Total Amount:</td>
                                                            <td className="px-4 py-2">{totalAmount}</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <button className="w-[137px] h-[36px] text-white rounded ml-3 bg-[#E4572E] hover:text-white transition duration-200 ease-in-out" onClick={openModals} >
                                    Generate Bills
                                </button>
                                {isModalOpens && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={closeModals} >
                                        <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()} >
                                            <h2 className="text-xl text-center font-bold">Generated Bills</h2>
                                            <div className="mb-4">
                                                {Object.values(
                                                    filteredFloors.reduce((acc, floor) => {
                                                        if (!acc[floor.floorName]) {
                                                            acc[floor.floorName] = {
                                                                floorName: floor.floorName,
                                                                areas: new Set(),
                                                            };
                                                        }
                                                        acc[floor.floorName].areas.add(floor.areaName);
                                                        return acc;
                                                    }, {})
                                                ).map((floor, floorIndex) => (
                                                    <div key={floorIndex} className="border p-2 mb-2">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!selectedFloorss[floor.floorName]}
                                                                onChange={() =>
                                                                    handleFloorCheckbox(floor.floorName, [...floor.areas])
                                                                }
                                                            />
                                                            <span className="ml-2 font-bold">{floor.floorName}</span>
                                                        </label>
                                                        {selectedFloorss[floor.floorName] && (
                                                            <div className="ml-4">
                                                                {[...floor.areas].map((areaName, areaIndex) => (
                                                                    <label key={areaIndex} className="flex items-center mt-1">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!selectedAreass[`${floor.floorName}-${areaName}`]}
                                                                            onChange={() =>
                                                                                handleAreaCheckbox(floor.floorName, areaName)
                                                                            }
                                                                        />
                                                                        <span className="ml-2">{areaName}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-left border-b pb-3">
                                                <h1 className="flex font-semibold">
                                                    Site Name: <span className="ml-2">{RccClientName.label}</span>
                                                </h1>
                                                <h1 className="ml-10 flex font-semibold">
                                                    Date: <span className="ml-2">{new Date().toLocaleDateString()}</span>
                                                </h1>
                                            </div>
                                            <div className="rounded-lg flex -mt-3 overflow-hidden border" id="full-table">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-[#E6E6E6]">
                                                        <tr>
                                                            <th className="px-4 py-2 font-bold text-base">Description</th>
                                                            <th className="px-4 py-2 font-bold text-base">Type</th>
                                                            <th className="px-4 py-2 font-bold text-base">Size</th>
                                                            <th className="px-4 py-2 font-bold text-base">L</th>
                                                            <th className="px-4 py-2 font-bold text-base">B</th>
                                                            <th className="px-4 py-2 font-bold text-base">H</th>
                                                            <th className="px-4 py-2 font-bold text-base">Quantity</th>
                                                            <th className="px-4 py-2 font-bold text-base">Area (sqft)</th>
                                                            <th className="px-4 py-2 font-bold text-base">Deduction Area (sqft)</th>
                                                            <th className="px-4 py-2 font-bold text-base">Total Area</th>
                                                            <th className="px-4 py-2 font-bold text-base">Rate (sqft)</th>
                                                            <th className="px-4 py-2 font-bold text-base">Total Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredFloors
                                                            .filter((floor) =>
                                                                floor.tiles.some(
                                                                    (tile) =>
                                                                        selectedAreass[`${floor.floorName}-${floor.areaName}`]
                                                                )
                                                            )
                                                            .map((floor, floorIndex, floorArray) => {
                                                                const tiles = floor.tiles.filter(
                                                                    (tile) =>
                                                                        selectedAreass[`${floor.floorName}-${floor.areaName}`]
                                                                );
                                                                const isFirstOccurrence =
                                                                    floorIndex === 0 ||
                                                                    floorArray[floorIndex - 1].floorName !== floor.floorName;
                                                                return (
                                                                    <React.Fragment key={floorIndex}>
                                                                        {isFirstOccurrence && (
                                                                            <tr className="bg-gray-50">
                                                                                <td colSpan="12" className="font-bold text-left pl-2">
                                                                                    {floor.floorName}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {tiles.map((tile, tileIndex) => (
                                                                            <tr key={tileIndex}>
                                                                                {tileIndex === 0 ? (
                                                                                    <td rowSpan={tiles.length} className="font-bold">
                                                                                        {floor.areaName}
                                                                                    </td>
                                                                                ) : null}
                                                                                <td>{tile.type}</td>
                                                                                <td>{tile.size}</td>
                                                                                <td>{tile.length}</td>
                                                                                <td>{tile.breadth}</td>
                                                                                <td>{tile.height}</td>
                                                                                <td>{tile.quantity}</td>
                                                                                <td>{tile.area}</td>
                                                                                <td>{tile.deductionArea}</td>
                                                                                <td>{tile.totalArea}</td>
                                                                                <td>{tile.rate}</td>
                                                                                <td>{tile.amount}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </React.Fragment>
                                                                );
                                                            })}
                                                        <tr className="bg-gray-100 font-bold">
                                                            <td colSpan="11" className="text-right pr-4">Total Amount:</td>
                                                            <td>
                                                                {filteredFloors.reduce((sum, floor) => {
                                                                    const matchingTiles = floor.tiles.filter(
                                                                        tile => selectedAreass[`${floor.floorName}-${floor.areaName}`]
                                                                    );
                                                                    return (
                                                                        sum +
                                                                        matchingTiles.reduce((tileSum, tile) => tileSum + (parseFloat(tile.amount) || 0), 0)
                                                                    );
                                                                }, 0).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="flex justify-center mt-4">
                                                <button
                                                    className={`px-6 py-2 text-white font-bold rounded ${Object.keys(selectedAreass).length > 0
                                                        ? "bg-green-600 hover:bg-green-700"
                                                        : "bg-gray-400 cursor-not-allowed"
                                                        }`}
                                                    disabled={Object.keys(selectedAreass).length === 0}
                                                    onClick={generateFullPDF}
                                                >
                                                    Generate PDF
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex ml-[67%]">
                                <button
                                    onClick={handleSubmit}
                                    type="submit"
                                    className="btn bg-[#BF9853] w-[139px] text-white h-[39px] rounded-md  font-semibold -ml-56">Submit
                                </button>
                            </div>
                        </div>
                        <div className="flex space-x-10">
                            <div>
                                <div>
                                    <h1 className="font-bold text-2xl mt-4 lg:-ml-[64%] -ml-[6rem] -mb-6">Item Summary </h1>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                                    <table className="table-auto w-full border-collapse mt-8">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="text-left p-2">S.No</th>
                                                <th className="text-left p-2">Floor Name</th>
                                                <th className="text-left p-2">Beam Name</th>
                                                <th className="text-left p-2">Size</th>
                                                <th className="text-left p-2">Total Area</th>
                                                <th className="text-left p-2">Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summary1.map((item, index) => (
                                                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                                                    <td className="p-2">{index + 1}</td>
                                                    <td className="p-2 text-left">{item.floorName}</td>
                                                    <td className="p-2 text-left">{item.areaName}</td>
                                                    <td className="p-2">{item.size}</td>
                                                    <td className="p-2">{item.totalArea}</td>
                                                    <td className="p-2">{item.count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <h1 className="font-bold text-2xl mt-4 lg:-ml-[64%] -ml-[6rem] -mb-6">Overall Summary </h1>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                                    <table className="table-auto w-full border-collapse mt-8 rounded-lg">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="text-left p-2">S.No</th>
                                                <th className="text-left p-2">Floor Name</th>
                                                <th className="text-left p-2">Beam Name</th>
                                                <th className="text-left p-2">Total Area</th>
                                                <th className="text-left p-2">Qty</th>
                                                <th className="text-left p-2">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summary2.map((item, index) => (
                                                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                                                    <td className="p-2">{index + 1}</td>
                                                    <td className="p-2 text-left">{item.floorName}</td>
                                                    <td className="p-2 text-left">{item.areaName}</td>
                                                    <td className="p-2">{item.totalArea}</td>
                                                    <td className="p-2">{item.qty}</td>
                                                    <td className="p-2 text-right">{item.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 ml-[20rem]">
                                    <table className=" border border-[#BF9853] rounded-lg" style={{ borderWidth: '2px' }}>
                                        <tbody>
                                            <td className=" border px-6">Total</td>
                                            <td className=" border py-3 px-5 ">{totalQty}</td>
                                            <td className=" border py-3 px-3 text-right">{totalAmount}</td>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div >
            <div className="content">
                {activeTab === "steel" && (
                    <div className="p-6 bg-white ml-6 mr-6 rounded-lg lg:mx-13 lg:p-4 overflow-x-auto">
                        <div className="rounded-lg border-l-8 border-l-[#BF9853] flex -mt-3 overflow-hidden">
                            <table className="table-auto w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-40 text-left pl-2 align-middle" rowSpan="2">Description</th>
                                        <th className="w-12 text-left pl-7 align-middle" rowSpan="2">Type</th>
                                        <th className="w-12 text-center align-middle" rowSpan="2">Configuration</th>
                                        <th className="w-12 text-center align-middle" rowSpan="2">Size</th>
                                        <th className="w-32 text-center align-middle text-lg " colSpan="3" style={{ letterSpacing: '0.2em' }}>Measurement</th>
                                        <th className="w-12 text-center align-middle" rowSpan="2">Quantity</th>
                                        <th className="w-14 text-center align-middle" rowSpan="2">8MM</th>
                                        <th className="w-12 text-center align-middle" rowSpan="2">10MM</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">12MM</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">16MM</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">20MM</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">25MM</th>
                                        <th className="w-12 text-center align-middle" rowSpan="2">32MM</th>
                                        <th className="w-20 text-center align-middle" rowSpan="2">Total Weight(kg)</th>
                                        <th className="w-20 text-center align-middle" rowSpan="2">Rate (kg)</th>
                                        <th className="w-20 text-center align-middle" rowSpan="2">Total Amount</th>
                                    </tr>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-6 text-[#E4572E] ">L</th>
                                        <th className="w-6 text-[#E4572E] ">B</th>
                                        <th className="w-6 text-[#E4572E] ">H</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {floorss.map((floor, floorIndex) => (
                                        <React.Fragment key={floorIndex}>
                                            <tr className="bg-gray-50">
                                                <td colSpan="17" className="font-bold text-left pl-2">
                                                    {floor.floorName !== null && (
                                                        <div>
                                                            <span className="mt-1">{displayIndex++}.</span>
                                                            <select
                                                                value={floor.floorName || ""}
                                                                onChange={(e) => handleFloorChange(floorIndex, e.target.value)}
                                                                className="w-40 p-1 rounded-lg bg-transparent focus:outline-none font-semibold"
                                                            >
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
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                            {floor.tiles.map((tile, tileIndex) => {
                                                const globalRowIndex = floorIndex + tileIndex;
                                                return (
                                                    <tr key={`${floorIndex}-${tileIndex}`} className={globalRowIndex % 2 === 0 ? "bg-[#FAF6ED]" : "bg-white"}>
                                                        <td className="px-1 flex group ml-3">
                                                            {tileIndex === 0 ? (
                                                                <Select
                                                                    name="areaName"
                                                                    options={beamNames.map((option) => ({
                                                                        value: option,
                                                                        label: option,
                                                                    }))}
                                                                    value={floor.areaName ? { value: floor.areaName, label: floor.areaName } : null}
                                                                    onChange={(selectedOption) => handleAreaChange(floorIndex, selectedOption)}
                                                                    className="w-44 h-10 text-left ml-3 hover:border font-semibold"
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
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-52"></div>
                                                            )}
                                                            {tileIndex === 0 && (
                                                                <div key={floorIndex} className="items-center flex space-x-1 invisible group-hover:visible">
                                                                    <button onClick={() => addAreaRow(floorIndex)}>
                                                                        <img src={add} alt="add" className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => deleteAreaRow(floorIndex)} className="ml-2">
                                                                        <img src={delt} alt="delete" className="w-4 h-4 " />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="text-center w-[67px] px-2 group">
                                                            <div className="flex items-center">
                                                                <select
                                                                    className="w-full bg-transparent font-medium rounded-sm px-2 hover:border focus:outline-none"
                                                                    value={tile.type || ''}
                                                                    onChange={(e) =>
                                                                        handleInputChange(floorIndex, tileIndex, 'type', e.target.value)
                                                                    }
                                                                >
                                                                    <option value="" disabled hidden>
                                                                        Select RB
                                                                    </option>
                                                                    {getFilteredBeamTypes(floor.areaName).map((item) => (
                                                                        <option key={item.beamType} value={item.beamType}>
                                                                            {item.beamType}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <div className="flex ml-2 space-x-1 w-16 invisible group-hover:visible">
                                                                    <button onClick={() => addNewRowAfter(floorIndex, tileIndex)}>
                                                                        <img src={Right} alt="add" className="h-4" />
                                                                    </button>
                                                                    <button>
                                                                        <img src={Wrong} onClick={() => removeRow1(floorIndex, tileIndex)} alt="delete" className="h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <div>
                                                            <button
                                                                className="bg-[#BF9853] w-16 text-sm h-7 text-white rounded"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditClick(floor.areaName, floorIndex);
                                                                }}
                                                            >
                                                                Edit
                                                            </button>
                                                            {popupType === 'Roof Beam' && (
                                                                <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center pl-[600px]">
                                                                    <div
                                                                        className="bg-white p-6 rounded relative"
                                                                        style={{ width: "580px", height: '833px' }}>
                                                                        <h2
                                                                            className="text-lg font-bold text-[#E4572E] -mb-4"
                                                                            style={{ marginLeft: "-350px" }}>
                                                                            Rebar Configuration
                                                                        </h2>
                                                                        <h1
                                                                            className="text-lg font-semibold cursor-pointer text-red-400"
                                                                            style={{ marginLeft: "480px" }}
                                                                            onClick={togglePopup}>
                                                                            x
                                                                        </h1>
                                                                        <p className="mb-2 font-bold" style={{ marginLeft: "-410px" }}>
                                                                            First Floor RB01
                                                                        </p>
                                                                        <div className="flex gap-6">
                                                                            <div className="flex">
                                                                                <div className="flex">
                                                                                    <table className="h-72 border-collapse w-52 mb-4 border">
                                                                                        <thead>
                                                                                            <tr className="bg-[#FAF6ED]">
                                                                                                <th className="border p-2">Layer</th>
                                                                                                <th className="border p-2">Qty</th>
                                                                                                <th className="border p-2">Dia</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">T1</td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input1}
                                                                                                        onChange={(e) => handleInput1Change(e)}
                                                                                                        placeholder="Enter Value"
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select
                                                                                                        className="focus:outline-none"
                                                                                                        value={dropdown1}
                                                                                                        onChange={handleDropdown1Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">T2</td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input2}
                                                                                                        onChange={(e) => handleInput2Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown2}
                                                                                                        onChange={handleDropdown2Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">T3</td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input3}
                                                                                                        onChange={(e) => handleInput3Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown3}
                                                                                                        onChange={handleDropdown3Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">T4</td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input4}
                                                                                                        onChange={(e) => handleInput4Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown4}
                                                                                                        onChange={handleDropdown4Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">B4</td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input5}
                                                                                                        onChange={(e) => handleInput5Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown5}
                                                                                                        onChange={handleDropdown5Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">B3</td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input6}
                                                                                                        onChange={(e) => handleInput6Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown6}
                                                                                                        onChange={handleDropdown6Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">B2</td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input7}
                                                                                                        onChange={(e) => handleInput7Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown7}
                                                                                                        onChange={handleDropdown7Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">B1</td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input8}
                                                                                                        onChange={(e) => handleInput8Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown8}
                                                                                                        onChange={handleDropdown8Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                                <div className="block">
                                                                                    <table className="ml-3 border-collapse w-40 h-72 mb-4 border">
                                                                                        <thead>
                                                                                            <tr className="bg-[#FAF6ED]">
                                                                                                <th className="border p-2">Qty</th>
                                                                                                <th className="border p-2">Dia</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input9}
                                                                                                        onChange={(e) => handleInput9Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown9}
                                                                                                        onChange={handleDropdown9Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input10}
                                                                                                        onChange={(e) => handleInput10Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown10}
                                                                                                        onChange={handleDropdown10Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input11}
                                                                                                        onChange={(e) => handleInput11Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown11}
                                                                                                        onChange={handleDropdown11Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input12}
                                                                                                        onChange={(e) => handleInput12Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown12}
                                                                                                        onChange={handleDropdown12Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input13}
                                                                                                        onChange={(e) => handleInput13Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown13}
                                                                                                        onChange={handleDropdown13Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input14}
                                                                                                        onChange={(e) => handleInput14Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown14}
                                                                                                        onChange={handleDropdown14Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input15}
                                                                                                        onChange={(e) => handleInput15Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown15}
                                                                                                        onChange={handleDropdown15Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input16}
                                                                                                        onChange={(e) => handleInput16Change(e)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown16}
                                                                                                        onChange={handleDropdown16Change}
                                                                                                    >
                                                                                                        <option value="">Select</option>
                                                                                                        <option value="8MM">8MM</option>
                                                                                                        <option value="10MM">10MM</option>
                                                                                                        <option value="12MM">12MM</option>
                                                                                                        <option value="16MM">16MM</option>
                                                                                                        <option value="20MM">20MM</option>
                                                                                                        <option value="25MM">25MM</option>
                                                                                                        <option value="32MM">32MM</option>
                                                                                                    </select>
                                                                                                </td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                    <div className="grid grid-cols-1 gap-2 -ml-44 mt-10">
                                                                                        <div className="flex ml-[300px]">
                                                                                            <h1 className="text-[#E4572E] text-lg -ml-5 font-semibold">
                                                                                                B
                                                                                            </h1>
                                                                                            <h1 className="ml-16 text-lg text-[#E4572E] font-semibold">
                                                                                                D
                                                                                            </h1>
                                                                                        </div>
                                                                                        <div className="flex">
                                                                                            <input
                                                                                                type="text"
                                                                                                className="-ml-8 h-10 font-bold text-base border-[#f0e6d2] bg-[#fcf8f8] border rounded-lg focus:outline-none px-2 py-1"
                                                                                                style={{ width: "264px", border: '2px solid rgba(191, 152, 83, 0.22)', height: "45px" }}
                                                                                                defaultValue={"Stirrups Size"}
                                                                                            />
                                                                                            <input
                                                                                                className="border ml-6 w-16 px-2 mr-1 py rounded-md focus:outline-none font-bold" style={{ border: '2px solid rgba(191, 152, 83, 0.22)' }}
                                                                                            ></input>
                                                                                            x
                                                                                            <input
                                                                                                className="mr-5 ml-2 border rounded-md focus:outline-none w-16 px-2 py font-bold" style={{ border: '2px solid rgba(191, 152, 83, 0.22)' }}
                                                                                            ></input>
                                                                                        </div>
                                                                                        <div className="flex">
                                                                                            <input
                                                                                                className="-ml-8 border h-10 font-bold text-base border-[#f0e6d2] bg-[#fcf8f8] rounded-lg focus:outline-none w-full px-2 py-1"
                                                                                                style={{ width: "264px", border: '2px solid rgba(191, 152, 83, 0.22)', height: "45px" }}
                                                                                                defaultValue={"Stirrups Dia"}
                                                                                            />
                                                                                            <select className="ml-6 border rounded-md focus:outline-none w-40 px-2 py font-bold" style={{ border: '2px solid rgba(191, 152, 83, 0.22)' }}>
                                                                                                <option>8MM</option>
                                                                                                <option>12MM</option>
                                                                                                <option>16MM</option>
                                                                                            </select>
                                                                                        </div>
                                                                                        <div className="flex">
                                                                                            <input
                                                                                                className="-ml-8 border h-10 font-bold text-base border-[#f0e6d2] bg-[#fcf8f8] rounded-lg focus:outline-none w-full px-2 py-1"
                                                                                                style={{ width: "264px", border: '2px solid rgba(191, 152, 83, 0.22)', height: "45px" }}
                                                                                                defaultValue={"Stirrups Spacing"}
                                                                                            />
                                                                                            <input
                                                                                                className="ml-6 border rounded-md focus:outline-none w-20 px-2 py font-bold" style={{ border: '2px solid rgba(191, 152, 83, 0.22)' }}
                                                                                            ></input>
                                                                                        </div>
                                                                                        <div className="flex">
                                                                                            <input
                                                                                                className="-ml-8 border h-10 font-bold text-base  bg-[#fcf8f8] rounded-lg focus:outline-none w-full px-2 py-1"
                                                                                                style={{ width: "264px", border: '2px solid rgba(191, 152, 83, 0.22)', height: "45px" }}
                                                                                                defaultValue={"Concrete Cover"}
                                                                                            />
                                                                                            <input
                                                                                                className="ml-6 border rounded-md focus:outline-none w-20 px-2 py font-bold" style={{ border: '2px solid rgba(191, 152, 83, 0.22)' }}
                                                                                            ></input>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                {/*Arrow line */}
                                                                                <div className="relative">
                                                                                    <div className="absolute top-[390px]  left-[-460px] flex items-center">
                                                                                        <img className="w-[15px] mr-[-4px] text-[#8D8989] ml-[-8px] mt-[-32px]" src={leftarrow} alt="#"></img>
                                                                                        <div>
                                                                                            <div className="h-[2px] bg-[#8D8989] w-[375px] flex items-center"></div>
                                                                                            <input
                                                                                                type="text"
                                                                                                value={tile.breadth || ""}
                                                                                                readOnly
                                                                                                className="text-lg ml-4 w-10 pl-2 h-6 text-[#E4572E] border font-semibold focus:outline-none"
                                                                                            />
                                                                                        </div>
                                                                                        <img className="w-4 mt-[-33px] text-[#8D8989] ml-[-9px]" src={rightarrow} alt="#"></img>
                                                                                    </div>
                                                                                    <div className="absolute top-[4px] left-[-60px] flex items-center">
                                                                                        <img src={uparrow} alt="#" className="w-4 text-[#8D8989] mt-[-220px] mr-[-9px]"></img>

                                                                                        <div className="">
                                                                                            <div className="w-[2px] bg-[#8D8989] h-[350px] flex"></div>
                                                                                            <div className="mt-[-160px]"> <input
                                                                                                type="text"
                                                                                                value={tile.height || ""} // Show the height from the tile object
                                                                                                readOnly
                                                                                                className="text-lg text-center mx-2 w-10 h-6 mt-2 text-[#E4572E] border font-semibold focus:outline-none"
                                                                                            /></div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <img src={downarrow} alt="#" className="w-[77px] text-[#8D8989] mt-[350px] ml-[-60px]"></img>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-6 flex justify-end gap-4 mr-28">
                                                                            <button className="bg-[#007233] text-white px-4 py-2 w-32 rounded">
                                                                                Cut List
                                                                            </button>
                                                                            <button
                                                                                className="bg-white text-[#DF9853] w-32 font-semibold border px-4 py-2 rounded"
                                                                                onClick={togglePopup}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button className="bg-[#BF9853] w-32 text-white px-4 py-2 rounded">
                                                                                Save
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {popupType === 'Plinth Beam' && (
                                                                <div
                                                                    className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
                                                                    onClick={(e) => {
                                                                        if (e.target.className.includes("bg-black")) togglePopup(null);
                                                                    }}
                                                                >
                                                                    <div className="bg-white rounded-lg p-6 shadow-lg w-[513px] h-[774px]">
                                                                        <div className="flex justify- items-center mb-4">
                                                                            <h3 className="text-lg font-semibold text-[#E4572E] text-left mb-2">Rebar Configuration</h3>
                                                                            <select className="border border-gray-300 ml-20 w-[179px] h-[40px] focus:outline-none font-medium text-sm rounded p-1" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}>
                                                                                <option>One Way</option>
                                                                                <option>Two Way</option>
                                                                            </select>
                                                                        </div>
                                                                        <p className="text-base text-left mb-6 mt-[-20px] font-bold">First Floor - SL01</p>
                                                                        <div className="relative bg-gray-200 border rounded-lg p-4 mb-6 ml-7" style={{ width: '352px', height: '290px' }}>
                                                                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-sm">24"</div>
                                                                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-sm">24"</div>
                                                                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-sm">36"</div>
                                                                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-sm">36"</div>
                                                                            <p className="text-center text-sm text-gray-500">Rebar Diagram (Replace with Image)</p>
                                                                        </div>
                                                                        <div className=" grid-cols-3 gap-4 mb-6">
                                                                            <div className="mb-[14px]" style={{ marginLeft: '280px' }}>
                                                                                <span className="text-[#E4572E] font-bold">Bar Dia</span>
                                                                                <span className="ml-8 text-[#E4572E] font-bold">Spacing</span>
                                                                            </div>
                                                                            <div className="flex ">
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="Main Bar"
                                                                                    className="border bg-[#f7f1f1] pl-3 font-semibold focus:outline-none" style={{ width: '264px', height: '45px', border: '2px solid rgba(191, 152, 83, 0.17)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="12MM"
                                                                                    className="border ml-7 rounded p-2 w-[68px]  font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="6"
                                                                                    className="border ml-5 rounded p-2 w-[68px]  font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                            </div>
                                                                            <div className="flex mt-5">
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="Distribution Bar"
                                                                                    className="w-[264px] h-[45px] bg-[#f7f1f1] border pl-3 font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.17)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="10MM"
                                                                                    className="border rounded ml-7 p-2 w-[68px] font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="6"
                                                                                    className="border rounded ml-5 p-2 w-[68px] font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                            </div>
                                                                            <div className="flex mt-5">
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="Concrete Cover"
                                                                                    className="border w-[264px] h-[45px] bg-[#f7f1f1] pl-3 font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.17)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="1"
                                                                                    className="border rounded ml-7 p-2 w-[68px] font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex justify-start space-x-4">
                                                                            <button
                                                                                className="bg-[#007233] text-white w-[140px] px-4 py-2" style={{ borderRadius: '4px' }}
                                                                                onClick={() => console.log("Cut List Clicked")}
                                                                            >
                                                                                Cut List
                                                                            </button>
                                                                            <button
                                                                                className="bg-transparent text-[#BF9853] font-semibold w-[138px] px-4 py-2" style={{ border: '1px solid #BF9853', borderRadius: '4px' }}
                                                                                onClick={() => togglePopup(null)}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                className="bg-[#BF9853] text-white w-[120px] px-4 py-2" style={{ borderRadius: '4px' }}
                                                                            >
                                                                                Save
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {popupType === 'Footing' && (
                                                                <div
                                                                    className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
                                                                    onClick={(e) => {
                                                                        if (e.target.className.includes("bg-black")) togglePopup(null);
                                                                    }}
                                                                >
                                                                    <div className="bg-white rounded-lg p-6 shadow-lg w-[513px] h-[774px]">
                                                                        <div className="flex justify- items-center mb-4">
                                                                            <h3 className="text-lg font-semibold text-[#E4572E] text-left mb-2">Rebar Configuration</h3>
                                                                            <span className="border border-gray-300 ml-40 mb-[-30px] focus:outline-none bg-[#F2F2F2] w-[90px] h-[40px] font-semibold border-none text-base rounded py-[8px]" style={{ borderRadius: '6px' }}>
                                                                                Footing
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-base text-left mb-6 mt-[-17px] font-bold">First Floor - FN01</p>
                                                                        <div className="relative bg-gray-200 border rounded-lg p-4 mb-6 ml-7" style={{ width: '352px', height: '290px' }}>
                                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                                <p className="text-gray-500 text-sm">Rebar Diagram (Replace with Image)</p>
                                                                            </div>
                                                                            <input
                                                                                type="text"
                                                                                defaultValue="24"
                                                                                className="absolute top-1 left-1/2 transform -translate-x-1/2 w-10 text-center border rounded"
                                                                                style={{ top: '10px' }}
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                defaultValue="9"
                                                                                className="absolute top-1/3 left-0 transform -translate-y-1/2 w-10 text-center border rounded"
                                                                                style={{ left: '10px' }}
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                defaultValue="36"
                                                                                className="absolute top-1/3 right-0 transform -translate-y-1/2 w-10 text-center border rounded"
                                                                                style={{ right: '10px' }}
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                defaultValue="9"
                                                                                className="absolute bottom-1/3 left-0 transform translate-y-1/2 w-10 text-center border rounded"
                                                                                style={{ left: '10px' }}
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                defaultValue="9"
                                                                                className="absolute bottom-1/3 right-0 transform translate-y-1/2 w-10 text-center border rounded"
                                                                                style={{ right: '10px' }}
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                defaultValue="24"
                                                                                className="absolute bottom-0 left-1/2 transform translate-x-1/2 w-10 text-center border rounded"
                                                                                style={{ bottom: '10px' }}
                                                                            />
                                                                        </div>
                                                                        <div className=" grid-cols-3 gap-4 mb-6">
                                                                            <div className="mb-[14px]" style={{ marginLeft: '280px' }}>
                                                                                <span className="text-[#E4572E] font-bold">Bar Dia</span>
                                                                                <span className="ml-8 text-[#E4572E] font-bold">Spacing</span>
                                                                            </div>
                                                                            <div className="flex ">
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="Main Bar"
                                                                                    className="border bg-[#f7f1f1] pl-3 font-semibold focus:outline-none" style={{ width: '264px', height: '45px', border: '2px solid rgba(191, 152, 83, 0.17)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="12MM"
                                                                                    className="border ml-7 rounded p-2 w-[68px]  font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="6"
                                                                                    className="border ml-5 rounded p-2 w-[68px]  font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                            </div>
                                                                            <div className="flex mt-5">
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="Distribution Bar"
                                                                                    className="w-[264px] h-[45px] bg-[#f7f1f1] border pl-3 font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.17)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="10MM"
                                                                                    className="border rounded ml-7 p-2 w-[68px] font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="6"
                                                                                    className="border rounded ml-5 p-2 w-[68px] font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                            </div>
                                                                            <div className="flex mt-5">
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="Concrete Cover"
                                                                                    className="border w-[264px] h-[45px] bg-[#f7f1f1] pl-3 font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.17)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="1"
                                                                                    className="border rounded ml-7 p-2 w-[68px] font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex justify-start space-x-4">
                                                                            <button
                                                                                className="bg-[#007233] text-white w-[140px] px-4 py-2" style={{ borderRadius: '4px' }}
                                                                                onClick={() => console.log("Cut List Clicked")}
                                                                            >
                                                                                Cut List
                                                                            </button>
                                                                            <button
                                                                                className="bg-transparent text-[#BF9853] font-semibold w-[138px] px-4 py-2" style={{ border: '1px solid #BF9853', borderRadius: '4px' }}
                                                                                onClick={() => togglePopup(null)}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                className="bg-[#BF9853] text-white w-[120px] px-4 py-2" style={{ borderRadius: '4px' }}
                                                                            >
                                                                                Save
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {popupType === 'Cantilever' && (
                                                                <div
                                                                    className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
                                                                    onClick={(e) => {
                                                                        if (e.target.className.includes("bg-black")) togglePopup(null);
                                                                    }}
                                                                >
                                                                    <div className="bg-white rounded-lg p-6 shadow-lg w-[513px] h-[774px]">
                                                                        <div className="flex justify- items-center mb-4">
                                                                            <h3 className="text-lg font-semibold text-[#E4572E] text-left mb-2">Rebar Configuration</h3>
                                                                            <span className="border border-gray-300 bg-[#F2F2F2] ml-40 w-[105px] focus:outline-none h-[40px] font-bold text-base rounded p-[5.5px]" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}>
                                                                                Cantilever
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-base text-left mb-6 mt-[-20px] font-bold">First Floor - SL01</p>
                                                                        <div className="relative bg-gray-200 border rounded-lg p-4 mb-6 ml-7" style={{ width: '352px', height: '290px' }}>
                                                                            {/* Replace this placeholder with your diagram */}
                                                                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-sm">24"</div>
                                                                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-sm">24"</div>
                                                                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-sm">36"</div>
                                                                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-sm">36"</div>
                                                                            <p className="text-center text-sm text-gray-500">Rebar Diagram (Replace with Image)</p>
                                                                        </div>
                                                                        <div className=" grid-cols-3 gap-4 mb-6">
                                                                            <div className="mb-[14px]" style={{ marginLeft: '280px' }}>
                                                                                <span className="text-[#E4572E] font-bold">Bar Dia</span>
                                                                                <span className="ml-8 text-[#E4572E] font-bold">Spacing</span>
                                                                            </div>
                                                                            <div className="flex ">
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="Main Bar"
                                                                                    className="border bg-[#f7f1f1] pl-3 font-semibold focus:outline-none" style={{ width: '264px', height: '45px', border: '2px solid rgba(191, 152, 83, 0.17)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="12MM"
                                                                                    className="border ml-7 rounded p-2 w-[68px]  font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="6"
                                                                                    className="border ml-5 rounded p-2 w-[68px]  font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                            </div>
                                                                            <div className="flex mt-5">
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="Distribution Bar"
                                                                                    className="w-[264px] h-[45px] bg-[#f7f1f1] border pl-3 font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.17)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="10MM"
                                                                                    className="border rounded ml-7 p-2 w-[68px] font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="6"
                                                                                    className="border rounded ml-5 p-2 w-[68px] font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                            </div>
                                                                            <div className="flex mt-5">
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="Concrete Cover"
                                                                                    className="border w-[264px] h-[45px] bg-[#f7f1f1] pl-3 font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.17)', borderRadius: '8px' }}
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue="1"
                                                                                    className="border rounded ml-7 p-2 w-[68px] font-semibold focus:outline-none" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex justify-start space-x-4">
                                                                            <button
                                                                                className="bg-[#007233] text-white w-[140px] px-4 py-2" style={{ borderRadius: '4px' }}
                                                                                onClick={() => console.log("Cut List Clicked")}
                                                                            >
                                                                                Cut List
                                                                            </button>
                                                                            <button
                                                                                className="bg-transparent text-[#BF9853] font-semibold w-[138px] px-4 py-2" style={{ border: '1px solid #BF9853', borderRadius: '4px' }}
                                                                                onClick={() => togglePopup(null)}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                className="bg-[#BF9853] text-white w-[120px] px-4 py-2" style={{ borderRadius: '4px' }}
                                                                            >
                                                                                Save
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <td className="text-center">
                                                            <CreatableSelect
                                                                className="w-[140px] h-[27px] font-medium -mt-2"
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
                                                                }}
                                                                value={tile.size ? { label: tile.size, value: tile.size } : null}
                                                                options={rccSizeList.map((item) => ({
                                                                    label: item.size,
                                                                    value: item.size,
                                                                }))}
                                                                onChange={(selectedOption) =>
                                                                    handleInputChange(floorIndex, tileIndex, "size", selectedOption ? selectedOption.value : "")
                                                                }
                                                                onCreateOption={(inputValue) => {
                                                                    const newOption = { size: inputValue };
                                                                    rccSizeList.push(newOption);
                                                                    handleInputChange(floorIndex, tileIndex, "size", inputValue);
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="px-1">
                                                            <input
                                                                type="text"
                                                                name="length"
                                                                placeholder="Enter Length (e.g., 10')"
                                                                value={floorss[floorIndex].tiles[tileIndex].length || ""}
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-[50px] text-base font-medium h-[27px] bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="px-2">
                                                            <input
                                                                type="text"
                                                                name="breadth"
                                                                placeholder="B"
                                                                value={tile.breadth.replace(/"+/g, '"')}
                                                                readOnly
                                                                className="px-2 w-14 bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="px-1">
                                                            <input
                                                                type="text"
                                                                name="height"
                                                                placeholder="H"
                                                                value={tile.height}
                                                                readOnly
                                                                className="px-2 w-[40px] text-base font-medium h-[27px] bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="text-center px-2">
                                                            <input
                                                                type="text"
                                                                name="quantity"
                                                                placeholder="Qty"
                                                                value={tile.quantity}
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-14 bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="px-2 ">
                                                            <input
                                                                readOnly
                                                                className="w-10 bg-transparent focus:outline-none pl-3"
                                                                value={calculateSum2() || ""}
                                                                placeholder="8MM"
                                                            />
                                                        </td>
                                                        <td className="px-2 ">
                                                            <input
                                                                readOnly
                                                                className="w-10 bg-transparent focus:outline-none pl-3"
                                                                value={calculateSum3() || ""}
                                                                placeholder="10MM"
                                                            />
                                                        </td>
                                                        <td className="px-2">
                                                            <input
                                                                readOnly
                                                                className="w-10 bg-transparent focus:outline-none pl-3"
                                                                value={calculateSum() || ""}
                                                                placeholder="12MM"
                                                            />
                                                        </td>
                                                        <td className="px-2">
                                                            <td className="px-2">
                                                                <input
                                                                    readOnly
                                                                    className="w-10 bg-transparent focus:outline-none pl-3"
                                                                    value={calculateSum1()}
                                                                    placeholder="16MM"
                                                                />
                                                            </td>
                                                        </td>
                                                        <td className="px-2">
                                                            <input
                                                                readOnly
                                                                className="w-10 bg-transparent focus:outline-none pl-3"
                                                                value={calculateSum4() || ""}
                                                                placeholder="20MM"
                                                            />
                                                        </td>
                                                        <td className="px-2">
                                                            <input
                                                                readOnly
                                                                className="w-10 bg-transparent focus:outline-none pl-3"
                                                                value={calculateSum5() || ""}
                                                                placeholder="25MM"
                                                            />
                                                        </td>
                                                        <td className="px-2 ">
                                                            <input
                                                                readOnly
                                                                className="w-10 bg-transparent focus:outline-none pl-3"
                                                                value={calculateSum6() || ""}
                                                                placeholder="32MM"
                                                            />
                                                        </td>
                                                        <td className="px-2 ">
                                                            <input
                                                                readOnly
                                                                className="w-[65px] bg-transparent focus:outline-none pl-3"
                                                                value={weight || "0kg"}
                                                                placeholder="Weight (e.g., 2.50kg)"
                                                            />
                                                        </td>
                                                        <td className="px-2">
                                                            <input
                                                                type="text"
                                                                value={editableRate}
                                                                onChange={(e) => handleEditableRateChange(e.target.value)}
                                                                className="w-12 text-right bg-gray-200 rounded focus:outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 ">
                                                            <input
                                                                className="bg-gray-200 w-20 h-7 text-right rounded p-2 focus:outline-none"
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
                            <button type="button" className="text-[#E4572E] mt-6 mb-20 -ml-[94%] border-dashed border-b-2 border-[#BF9853] font-semibold"
                                onClick={addFloorRow}>
                                + Add Floor
                            </button>
                        </div>
                        <div className=" buttons -mt-14 flex">
                            <div className="">
                                <button className="w-[150px] h-10  text-white rounded ml-2 bg-green-800 hover:text-white transition duration-200 ease-in-out">
                                    Engineer Copy
                                </button>
                            </div>
                            <div>
                                <button
                                    onClick={() => setIsPopupOpen4(true)}
                                    className="w-[137px] h-10 text-white rounded ml-3 bg-green-800 hover:text-white transition duration-200 ease-in-out"
                                >
                                    Order Copy
                                </button>
                            </div>
                            {isPopupOpen4 && (
                                <div className="fixed inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-50 z-50">
                                    <div className="bg-white shadow-lg w-[400px] p-5 rounded-md">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    className="rounded-xl accent-green-200 cursor-pointer"
                                                />
                                                <span className="text-sm font-semibold">Select all</span>
                                            </div>
                                            <button
                                                onClick={() => setIsPopupOpen4(false)}
                                                className="text-red-500 text-xl font-bold hover:text-red-700"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                        <div className="mb-4">
                                            <div className="flex items-center  cursor-pointer">
                                                <label className="ml-14 items-center">
                                                    <input
                                                        type="checkbox"
                                                        value="ground-floor"
                                                        checked={selectedGroundFloor.includes("roof-beam") && selectedGroundFloor.includes("plinth-beam")}
                                                        onChange={handleGroundFloorSelectAll}
                                                        className="rounded-xl accent-green-200 mr-2 cursor-pointer"
                                                    />
                                                    <span className="text-base font-semibold w-60">Ground Floor</span>
                                                </label>
                                                <span
                                                    className={`text-sm cursor-pointer ${groundFloorOpen ? "rotate-180" : ""}`}
                                                    onClick={() => setGroundFloorOpen(!groundFloorOpen)}
                                                >
                                                    ▼
                                                </span>
                                            </div>
                                            {groundFloorOpen && (
                                                <div className="mt-2 pl-4">
                                                    <label className="block mr-10">
                                                        <input
                                                            type="checkbox"
                                                            value="roof-beam"
                                                            checked={selectedGroundFloor.includes("roof-beam")}
                                                            onChange={handleGroundFloorChange}
                                                            className="rounded-xl accent-green-200 cursor-pointer"
                                                        />
                                                        Roof Beam
                                                    </label>
                                                    <label className="block mr-8">
                                                        <input
                                                            type="checkbox"
                                                            value="plinth-beam"
                                                            checked={selectedGroundFloor.includes("plinth-beam")}
                                                            onChange={handleGroundFloorChange}
                                                            className="rounded-xl accent-green-200 cursor-pointer"
                                                        />
                                                        Plinth Beam
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <div className="flex items-center cursor-pointer">
                                                <label className="ml-14 items-center">
                                                    <input
                                                        type="checkbox"
                                                        value="first-floor"
                                                        checked={
                                                            selectedFirstFloor.includes("lintel-beam") &&
                                                            selectedFirstFloor.includes("column") &&
                                                            selectedFirstFloor.includes("slab")
                                                        }
                                                        onChange={handleFirstFloorSelectAll}
                                                        className="rounded-xl accent-green-200 mr-2 cursor-pointer"
                                                    />
                                                    <span className="text-base font-semibold w-56">First Floor</span>
                                                </label>
                                                <span
                                                    className={`text-sm cursor-pointer ${firstFloorOpen ? "rotate-180" : ""}`}
                                                    onClick={() => setFirstFloorOpen(!firstFloorOpen)}
                                                >
                                                    ▼
                                                </span>
                                            </div>
                                            {firstFloorOpen && (
                                                <div className="mt-2 pl-4">
                                                    <label className="block mr-10">
                                                        <input
                                                            type="checkbox"
                                                            value="lintel-beam"
                                                            checked={selectedFirstFloor.includes("lintel-beam")}
                                                            onChange={handleFirstFloorChange}
                                                            className="rounded-xl accent-green-200 cursor-pointer"
                                                        />
                                                        Lintel Beam
                                                    </label>
                                                    <label className="block mr-[68px]">
                                                        <input
                                                            type="checkbox"
                                                            value="column"
                                                            checked={selectedFirstFloor.includes("column")}
                                                            onChange={handleFirstFloorChange}
                                                            className="rounded-xl accent-green-200 cursor-pointer"
                                                        />
                                                        Column
                                                    </label>
                                                    <label className="block mr-[93px]">
                                                        <input
                                                            type="checkbox"
                                                            value="slab"
                                                            checked={selectedFirstFloor.includes("slab")}
                                                            onChange={handleFirstFloorChange}
                                                            className="rounded-xl accent-green-200 cursor-pointer"
                                                        />
                                                        Slab
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-5">
                                            <button
                                                onClick={() => {
                                                    setIsPopupOpen4(false);
                                                    console.log("Cut List generated!");
                                                }}
                                                className="bg-[#BF9853] text-white px-4 py-2 rounded w-60 font-semibold cursor-pointer"
                                            >
                                                Generate Order Copy
                                            </button>
                                            <button
                                                onClick={() => setIsPopupOpen4(false)}
                                                className="border border-[#BF9853] px-4 py-2 rounded w-24 font-semibold cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="">
                                <button className="w-[150px] h-10  text-white rounded ml-3 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out">
                                    Generate Bill
                                </button>
                            </div>
                            <div>
                                <button
                                    onClick={() => setIsPopupOpen2(true)}
                                    className="w-[99px] h-10 text-white rounded ml-3 bg-green-800 hover:text-white transition duration-200 ease-in-out"
                                >
                                    Cut List
                                </button>
                                {isPopupOpen2 && (
                                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                        <div className="bg-white shadow-lg w-[400px] p-5 rounded-md">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded-xl accent-green-200 cursor-pointer"
                                                    />
                                                    <span className="text-sm font-semibold">Select all</span>
                                                </div>
                                                <button
                                                    onClick={() => setIsPopupOpen2(false)}
                                                    className="text-red-500 text-xl font-bold hover:text-red-700"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                            <div className="mb-4">
                                                <div className="flex items-center  cursor-pointer">
                                                    <label className="ml-14 items-center">
                                                        <input
                                                            type="checkbox"
                                                            value="ground-floor"
                                                            checked={selectedGroundFloor1.includes("roof-beam") && selectedGroundFloor1.includes("plinth-beam")}
                                                            onChange={handleGroundFloorSelectAll}
                                                            className="rounded-xl accent-green-200 mr-2 cursor-pointer"
                                                        />
                                                        <span className="text-base font-semibold w-60">Ground Floor</span>
                                                    </label>
                                                    <span
                                                        className={`text-sm cursor-pointer ${groundFloorOpen ? "rotate-180" : ""}`}
                                                        onClick={() => setGroundFloorOpen(!groundFloorOpen)}
                                                    >
                                                        ▼
                                                    </span>
                                                </div>
                                                {groundFloorOpen && (
                                                    <div className="mt-2 pl-4">
                                                        <label className="block mr-10">
                                                            <input
                                                                type="checkbox"
                                                                value="roof-beam"
                                                                checked={selectedGroundFloor1.includes("roof-beam")}
                                                                onChange={handleGroundFloorChange1}
                                                                className="rounded-xl accent-green-200 cursor-pointer"
                                                            />
                                                            Roof Beam
                                                        </label>
                                                        <label className="block mr-8">
                                                            <input
                                                                type="checkbox"
                                                                value="plinth-beam"
                                                                checked={selectedGroundFloor1.includes("plinth-beam")}
                                                                onChange={handleGroundFloorChange1}
                                                                className="rounded-xl accent-green-200 cursor-pointer"
                                                            />
                                                            Plinth Beam
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mb-4">
                                                <div className="flex items-center cursor-pointer">
                                                    <label className="ml-14 items-center">
                                                        <input
                                                            type="checkbox"
                                                            value="first-floor"
                                                            checked={
                                                                selectedFirstFloor1.includes("lintel-beam") &&
                                                                selectedFirstFloor1.includes("column") &&
                                                                selectedFirstFloor1.includes("slab")
                                                            }
                                                            onChange={handleFirstFloorSelectAll}
                                                            className="rounded-xl accent-green-200 mr-2"
                                                        />
                                                        <span className="text-base font-semibold w-56">First Floor</span>
                                                    </label>
                                                    <span
                                                        className={`text-sm cursor-pointer ${firstFloorOpen ? "rotate-180" : ""}`}
                                                        onClick={() => setFirstFloorOpen(!firstFloorOpen)}
                                                    >
                                                        ▼
                                                    </span>
                                                </div>
                                                {firstFloorOpen && (
                                                    <div className="mt-2 pl-4">
                                                        <label className="block mr-10">
                                                            <input
                                                                type="checkbox"
                                                                value="lintel-beam"
                                                                checked={selectedFirstFloor1.includes("lintel-beam")}
                                                                onChange={handleFirstFloorChange}
                                                                className="rounded-xl accent-green-200 cursor-pointer"
                                                            />
                                                            Lintel Beam
                                                        </label>
                                                        <label className="block mr-[68px]">
                                                            <input
                                                                type="checkbox"
                                                                value="column"
                                                                checked={selectedFirstFloor1.includes("column")}
                                                                onChange={handleFirstFloorChange}
                                                                className="rounded-xl accent-green-200 cursor-pointer"
                                                            />
                                                            Column
                                                        </label>
                                                        <label className="block mr-[93px]">
                                                            <input
                                                                type="checkbox"
                                                                value="slab"
                                                                checked={selectedFirstFloor1.includes("slab")}
                                                                onChange={handleFirstFloorChange}
                                                                className="rounded-xl accent-green-200 cursor-pointer"
                                                            />
                                                            Slab
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center mt-5">
                                                <button
                                                    onClick={() => {
                                                        setIsPopupOpen2(false);
                                                        console.log("Cut List generated!");
                                                    }}
                                                    className="bg-[#BF9853] text-white px-4 py-2 rounded w-60 font-semibold"
                                                >
                                                    Generate Cut List
                                                </button>
                                                <button
                                                    onClick={() => setIsPopupOpen2(false)}
                                                    className="border border-[#BF9853] px-4 py-2 rounded w-24 font-semibold"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setIsPopupOpen1(true)} className="w-[128px] h-10  text-white rounded ml-3 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out">
                                Stirrups List
                            </button>
                            {isPopupOpen1 && (
                                <div className="fixed inset-0 flex items-center cursor-pointer justify-center bg-black bg-opacity-50 z-50">
                                    <div className="bg-white shadow-lg w-[400px] p-5 rounded-md">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    className="rounded-xl accent-green-200 cursor-pointer"
                                                />
                                                <span className="text-sm font-semibold">Select all</span>
                                            </div>
                                            <button
                                                onClick={() => setIsPopupOpen1(false)}
                                                className="text-red-500 text-xl font-bold hover:text-red-700"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                        <div className="mb-4">
                                            <div className="flex items-center  cursor-pointer">
                                                <label className="ml-14 items-center">
                                                    <input
                                                        type="checkbox"
                                                        value="ground-floor"
                                                        checked={selectedGroundFloor2.includes("roof-beam") && selectedGroundFloor2.includes("plinth-beam")}
                                                        onChange={handleGroundFloorSelectAll}
                                                        className="rounded-xl accent-green-200 mr-2 cursor-pointer"
                                                    />
                                                    <span className="text-base font-semibold w-60">Ground Floor</span>
                                                </label>
                                                <span
                                                    className={`text-sm cursor-pointer ${groundFloorOpen ? "rotate-180" : ""}`}
                                                    onClick={() => setGroundFloorOpen(!groundFloorOpen)}
                                                >
                                                    ▼
                                                </span>
                                            </div>
                                            {groundFloorOpen && (
                                                <div className="mt-2 pl-4">
                                                    <label className="block mr-10">
                                                        <input
                                                            type="checkbox"
                                                            value="roof-beam"
                                                            checked={selectedGroundFloor2.includes("roof-beam")}
                                                            onChange={handleGroundFloorChange}
                                                            className="rounded-xl accent-green-200 cursor-pointer"
                                                        />
                                                        Roof Beam
                                                    </label>
                                                    <label className="block mr-8">
                                                        <input
                                                            type="checkbox"
                                                            value="plinth-beam"
                                                            checked={selectedGroundFloor2.includes("plinth-beam")}
                                                            onChange={handleGroundFloorChange}
                                                            className="rounded-xl accent-green-200 cursor-pointer"
                                                        />
                                                        Plinth Beam
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <div className="flex items-center cursor-pointer">
                                                <label className="ml-14 items-center">
                                                    <input
                                                        type="checkbox"
                                                        value="first-floor"
                                                        checked={
                                                            selectedFirstFloor2.includes("lintel-beam") &&
                                                            selectedFirstFloor2.includes("column") &&
                                                            selectedFirstFloor2.includes("slab")
                                                        }
                                                        onChange={handleFirstFloorSelectAll}
                                                        className="rounded-xl accent-green-200 mr-2"
                                                    />
                                                    <span className="text-base font-semibold w-56">First Floor</span>
                                                </label>
                                                <span
                                                    className={`text-sm cursor-pointer ${firstFloorOpen ? "rotate-180" : ""}`}
                                                    onClick={() => setFirstFloorOpen(!firstFloorOpen)}
                                                >
                                                    ▼
                                                </span>
                                            </div>
                                            {firstFloorOpen && (
                                                <div className="mt-2 pl-4">
                                                    <label className="block mr-10">
                                                        <input
                                                            type="checkbox"
                                                            value="lintel-beam"
                                                            checked={selectedFirstFloor2.includes("lintel-beam")}
                                                            onChange={handleFirstFloorChange}
                                                            className="rounded-xl accent-green-200 cursor-pointer"
                                                        />
                                                        Lintel Beam
                                                    </label>
                                                    <label className="block mr-[68px]">
                                                        <input
                                                            type="checkbox"
                                                            value="column"
                                                            checked={selectedFirstFloor2.includes("column")}
                                                            onChange={handleFirstFloorChange}
                                                            className="rounded-xl accent-green-200 cursor-pointer"
                                                        />
                                                        Column
                                                    </label>
                                                    <label className="block mr-[93px]">
                                                        <input
                                                            type="checkbox"
                                                            value="slab"
                                                            checked={selectedFirstFloor2.includes("slab")}
                                                            onChange={handleFirstFloorChange}
                                                            className="rounded-xl accent-green-200 cursor-pointer"
                                                        />
                                                        Slab
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-5">
                                            <button
                                                onClick={() => {
                                                    setIsPopupOpen1(false);
                                                    console.log("Cut List generated!");
                                                }}
                                                className="bg-[#BF9853] text-white px-4 py-2 rounded w-60 font-semibold cursor-pointer"
                                            >
                                                Generate Stirrup List
                                            </button>
                                            <button
                                                onClick={() => setIsPopupOpen1(false)}
                                                className="border border-[#BF9853] px-4 py-2 rounded w-24 font-semibold cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex ml-[60%]">
                                <button
                                    type="submit"
                                    className="btn bg-[#BF9853] text-white px-8 py-2 rounded w-[139px] h-[39px] font-semibold -ml-36">Submit
                                </button>
                            </div>
                        </div>
                        <div className="-mt-3 flex">
                            <div className="mt-3">
                                <div className="flex justify-between">
                                    <h1 className="font-bold text-lg mt-12 -mb-2 ">Overall Summary</h1>
                                    <div><h1 className="font-bold text-lg mt-8 ml-96 ">Wastage : <select className="bg-transparent w-16 h-9 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-lg focus:outline-none">
                                        <option value="0">0%</option>
                                        <option value="1">1%</option>
                                        <option value="2">2%</option>
                                        <option value="3">3%</option>
                                        <option value="4">4%</option>
                                        <option value="5">5%</option>
                                        <option value="6">6%</option>
                                        <option value="7">7%</option>
                                        <option value="8">8%</option>
                                        <option value="9">9%</option>
                                        <option value="10">10%</option>
                                        <option value="11">11%</option>
                                        <option value="12">12%</option>
                                        <option value="13">13%</option>
                                        <option value="14">14%</option>
                                        <option value="15">15%</option>
                                    </select></h1></div>
                                    <h1 className="font-bold text-sm mt-12 text-[#E4572E] hover:underline cursor-pointer">Export PDF</h1>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                                    <table className="table-auto mt-2" style={{ width: '800px' }}>
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="font-extrabold p-2">S.No</th>
                                                <th className="p-2 w-40 font-extrabold">Floor Name</th>
                                                <th className="p-2 w-32 font-extrabold">Member Name</th>
                                                <th className="p-2 w-20 font-extrabold">Dia of Bar</th>
                                                <th className="p-2  font-extrabold">Total Length</th>
                                                <th className="p-2  font-extrabold">Wastage</th>
                                                <th className="p-2  font-extrabold">Required Qty</th>
                                                <th className="p-2  font-extrabold">Weight (kg)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-5" style={{ marginLeft: '540px' }}>
                                    <th>Total</th>
                                </div>
                            </div>
                            <div className=" ml-10">
                                <div className="flex justify-between">
                                    <h1 className="font-bold text-lg mt-10 ">Stirrups Summary</h1>
                                    <h1 className="font-bold text-sm mt-11 text-[#E4572E] hover:underline cursor-pointer">Export PDF</h1>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                                    <table id="summaryTable" className="table-auto mt-">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="font-extrabold p-2">S.No</th>
                                                <th className="p-2 font-extrabold">Floor Name</th>
                                                <th className="p-2 w-32 font-extrabold">Member Name</th>
                                                <th className="p-2 w-28 font-extrabold">Member Size</th>
                                                <th className="p-2 w-20 font-extrabold">Dia of Bar</th>
                                                <th className="p-2 w-24 font-extrabold">Stirrup Size</th>
                                                <th className="p-2 font-extrabold">Qty</th>
                                                <th className="p-2 w-20 font-extrabold">Weight kg</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-5" style={{ marginLeft: '520px' }}>
                                    <th>Total</th>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div>
                {activeTab === "concrete" && (
                    <div className=" p-6 bg-[#FFFFFF] ml-6 mr-6 rounded-lg">
                        <div className="flex -mt-6 mb-3" style={{ marginLeft: '1010px' }}>
                            <h1 className="font-semibold -mt-10 flex">
                                Cement Rate/Bag:
                                <input
                                    name="cementRate"
                                    value={values.cementRate}
                                    onChange={handleCommonInputChanges}
                                    className="ml-2 mt-[-5px] pl-1 bg-white w-[61px] h-[36px] border border-[#f0e6d2] rounded focus:outline-none"
                                />
                            </h1>
                            <h1 className="font-semibold -mt-10 ml-3 flex">
                                Sand Rate/Unit:
                                <input
                                    name="sandRate"
                                    value={values.sandRate}
                                    onChange={handleCommonInputChanges}
                                    className="ml-2 pl-1 mt-[-5px] bg-white w-[61px] h-[36px] border border-[#f0e6d2] rounded focus:outline-none"
                                />
                            </h1>
                            <h1 className="ml-3 font-semibold -mt-10 flex">
                                Jally Rate/Unit:
                                <input
                                    name="jallyRate"
                                    value={values.jallyRate}
                                    onChange={handleCommonInputChanges}
                                    className="ml-2 pl-3 mt-[-5px] bg-white w-[61px] h-[36px] border border-[#f0e6d2] rounded focus:outline-none"
                                />
                            </h1>
                        </div>
                        <div className="flex mt-14 mb-3" style={{ marginLeft: '1010px' }}>
                            <h1 className="font-semibold -mt-10 flex">
                                Cement Wastage:
                                <select
                                    name="cementWastage"
                                    value={values.cementWastage}
                                    onChange={handleCommonInputChanges}
                                    className="ml-2 mt-[-5px] bg-white w-[57px] h-[36px] border border-[#f0e6d2] rounded focus:outline-none"
                                >
                                    {[...Array(16)].map((_, index) => (
                                        <option key={index} value={`${index}%`}>{index}%</option>
                                    ))}
                                </select>
                            </h1>
                            <h1 className="font-semibold -mt-10 ml-3 flex">
                                Sand Wastage:
                                <select
                                    name="sandWastage"
                                    value={values.sandWastage}
                                    onChange={handleCommonInputChanges}
                                    className="ml-2 mt-[-5px] bg-white w-[57px] h-[36px] border border-[#f0e6d2] rounded focus:outline-none"
                                >
                                    {[...Array(16)].map((_, index) => (
                                        <option key={index} value={`${index}%`}>{index}%</option>
                                    ))}
                                </select>
                            </h1>
                            <h1 className="ml-3 font-semibold -mt-10 flex">
                                Jally Wastage:
                                <select
                                    name="jallyWastage"
                                    value={values.jallyWastage}
                                    onChange={handleCommonInputChanges}
                                    className="ml-2 mt-[-5px] bg-white w-[57px] h-[36px] border border-[#f0e6d2] rounded focus:outline-none"
                                >
                                    {[...Array(16)].map((_, index) => (
                                        <option key={index} value={`${index}%`}>{index}%</option>
                                    ))}
                                </select>
                            </h1>
                        </div>
                        <div className="rounded-lg border-l-8 border-l-[#BF9853] flex mt-1" id="full-table">
                            <table className="table-auto w-full">
                                <thead>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td>
                                            <div className="mb-1">
                                                <Select
                                                    options={mixOptions}
                                                    value={mixOptions.find(option => option.value === commonMix)}
                                                    onChange={handleCommonMixChange}
                                                    isSearchable
                                                    placeholder="Select Mix"
                                                    className="w-36 border"
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
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td>
                                            <div className="mb-1">
                                                <input
                                                    type="text"
                                                    className="w-16 h-8 px-2 border rounded-lg"
                                                    placeholder="Enter.."
                                                    value={commonLabourRate}
                                                    onChange={handleCommonLabourRateChange}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="text-left p-2 w-72" rowSpan="2">Description</th>
                                        <th className="text-left p-2 align-middle" rowSpan="2">Type</th>
                                        <th className="text-left p-2 align-middle" rowSpan="2">Mix</th>
                                        <th className="text-center p-2 align-middle" rowSpan="2">Size</th>
                                        <th className="text-lg text-center align-middle" colSpan="3" style={{ letterSpacing: '0.2em' }}>Measurement</th>
                                        <th className="text-center p-2 align-middle" rowSpan="2">Quantity</th>
                                        <th className="text-center p-2 align-middle" rowSpan="2">Cement</th>
                                        <th className="text-center p-2 align-middle" rowSpan="2">Sand</th>
                                        <th className="text-center p-2 align-middle" rowSpan="2">Jally</th>
                                        <th className="w-20  text-center p-2 align-middle" rowSpan="2">Total Valume(CFT)</th>
                                        <th className="w-10 p-2 text-center align-middle" rowSpan="2">Labour Rate</th>
                                        <th className="w-20  text-center p-2 align-middle" rowSpan="2">Total Amount(CFT)</th>
                                        <th className="w-10 p-2 text-center align-middle" rowSpan="2">Labour Amount</th>
                                        <th className="w- text-center p-2 align-middle" rowSpan="2">Total Amount</th>
                                    </tr>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-6 text-[#E4572E] ">L</th>
                                        <th className="w-6 text-[#E4572E] ">B</th>
                                        <th className="w-6 text-[#E4572E] ">H</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {floorss.map((floor, floorIndex) => (
                                        <React.Fragment key={floorIndex}>
                                            <tr className="bg-gray-50">
                                                <td colSpan="16" className="font-bold text-left pl-2 group">
                                                    {floor.floorName !== null && (
                                                        <div className="flex">
                                                            <span className="mt-1">{displayIndex++}.</span>
                                                            <select
                                                                value={floor.floorName || ""}
                                                                onChange={(e) => handleFloorChange(floorIndex, e.target.value)}
                                                                className="w-60 p-1 rounded-lg bg-transparent focus:outline-none font-semibold">
                                                                <option value="" disabled>Select Floor..</option>
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
                                                                <div className="relative group"
                                                                    onMouseEnter={() => setHoveredRcc({ floorIndex, tileIndex })}
                                                                    onMouseLeave={() => setHoveredRcc({ floorIndex: null, tileIndex: null })}>
                                                                    <Select
                                                                        name="areaName"
                                                                        options={beamNames.map((option) => ({
                                                                            value: option,
                                                                            label: option,
                                                                        }))}
                                                                        value={floor.areaName ? { value: floor.areaName, label: floor.areaName } : null}
                                                                        onChange={(selectedOption) => handleAreaChange(floorIndex, selectedOption)}
                                                                        className="w-44 h-10 text-left ml-3 hover:border font-semibold"
                                                                        placeholder="Select Area"
                                                                        isClearable
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
                                                                        }}
                                                                    />
                                                                    {hoveredRcc.floorIndex === floorIndex && hoveredRcc.tileIndex === tileIndex && (
                                                                        <div className="absolute -left-16 right-32 bottom-0 -mb-4 w-auto px-1 bg-[#BF9853] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                            <h3 className=" text-[#0a0a0a]">{floor.areaName}</h3>
                                                                            <h2 className=" text-xs text-white">Cement: {(floor.tiles.reduce((sum, tile) => sum + (parseFloat(tile.cement) / 1.25 || 0), 0)).toFixed(2)} Bags</h2>
                                                                            <h2 className=" text-xs text-white">Sand  : {(floor.tiles.reduce((sum, tile) => sum + (parseFloat(tile.sand) || 0), 0)).toFixed(2)} Units</h2>
                                                                            <h2 className=" text-xs text-white">Jally : {(floor.tiles.reduce((sum, tile) => sum + (parseFloat(tile.jally) || 0), 0)).toFixed(2)} Units</h2>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div></div>
                                                            )}
                                                            {tileIndex === 0 && (
                                                                <div key={floorIndex} className="items-center flex space-x-1 invisible group-hover:visible">
                                                                    <button onClick={() => addAreaRow(floorIndex)}>
                                                                        <img src={add} alt="add" className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => deleteAreaRow(floorIndex)} className="ml-2">
                                                                        <img src={delt} alt="delete" className="w-4 h-4 " />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="text-center w-[60px]  group">
                                                            <div className="flex items-center">
                                                                <select
                                                                    className="w-20 bg-transparent font-medium rounded-sm hover:border focus:outline-none"
                                                                    value={tile.type || ''}
                                                                    onChange={(e) =>
                                                                        handleInputChange(floorIndex, tileIndex, 'type', e.target.value)
                                                                    }
                                                                >
                                                                    <option value="" disabled hidden>
                                                                        Select....
                                                                    </option>
                                                                    {getFilteredBeamTypes(floor.areaName).map((item) => (
                                                                        <option key={item.beamType} value={item.beamType}>
                                                                            {item.beamType}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <div className="flex ml-2 space-x-3 w-16 invisible group-hover:visible">
                                                                    <button onClick={() => addNewRowAfter(floorIndex, tileIndex)}>
                                                                        <img src={Right} alt="add" className="h-4" />
                                                                    </button>
                                                                    <button>
                                                                        <img src={Wrong} onClick={() => removeRow1(floorIndex, tileIndex)} alt="delete" className="h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="w-20 p-1 rounded-lg focus:outline-none cursor-pointer bg">
                                                            <select
                                                                className="bg-transparent font-semibold border ml-[-20px] focus:outline-none"
                                                                value={tile.mix || ""}
                                                                onChange={(e) => handleInputChange(floorIndex, tileIndex, "mix", e.target.value)}
                                                            >
                                                                <option value="" disabled hidden>Select Mix</option>
                                                                <option value="M15-1:2:4">M15-1:2:4</option>
                                                                <option value="M20-1:1.5:3">M20-1:1.5:3</option>
                                                            </select>
                                                        </td>
                                                        <td className="text-center">
                                                            {!["ROOF SLAB", "SEPTICK TANK", "SUMP TANK", "MAT"].includes(floor.areaName) && (
                                                                <CreatableSelect
                                                                    className="w-[140px] h-[27px] font-medium -mt-2"
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
                                                                    }}
                                                                    value={tile.size ? { label: tile.size, value: tile.size } : null}
                                                                    options={rccSizeList.map((item) => ({
                                                                        label: item.size,
                                                                        value: item.size,
                                                                    }))}
                                                                    onChange={(selectedOption) =>
                                                                        handleInputChange(floorIndex, tileIndex, "size", selectedOption ? selectedOption.value : "")
                                                                    }
                                                                    onCreateOption={(inputValue) => {
                                                                        const newOption = { size: inputValue };
                                                                        rccSizeList.push(newOption);
                                                                        handleInputChange(floorIndex, tileIndex, "size", inputValue);
                                                                    }}
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="px-1">
                                                            <input
                                                                type="text"
                                                                name="length"
                                                                placeholder="L"
                                                                value={tile.length || ""}
                                                                onChange={(e) => {
                                                                    let inputValue = e.target.value;

                                                                    // Count occurrences of feet (')
                                                                    const feetCount = (inputValue.match(/'/g) || []).length;

                                                                    // Show alert if user enters feet (') more than once
                                                                    if (feetCount > 1) {
                                                                        alert("You can enter feet (') only once.");
                                                                        return;
                                                                    }

                                                                    handleInteriorTileChange(floorIndex, tileIndex, e);
                                                                }}
                                                                className="px-2 w-[50px] text-base font-medium h-[27px] bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>

                                                        <td className="px-2">
                                                            <input
                                                                type="text"
                                                                name="breadth"
                                                                placeholder="B"
                                                                value={tile.breadth.replace(/"+/g, '"')}
                                                                readOnly={!["ROOF SLAB", "SEPTICK TANK", "SUMP TANK", "MAT"].includes(floor.areaName)}
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-14 bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="px-1">
                                                            <input
                                                                type="text"
                                                                name="height"
                                                                placeholder="H"
                                                                value={tile.height}
                                                                rreadOnly={!["ROOF SLAB", "SEPTICK TANK", "SUMP TANK", "MAT"].includes(floor.areaName)}
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-[40px] text-base font-medium h-[27px] bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="text-center px-2">
                                                            <input
                                                                type="text"
                                                                name="quantity"
                                                                placeholder="Qty"
                                                                value={tile.quantity}
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-14 bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="px-2 ">
                                                            {tile.cement}
                                                        </td>
                                                        <td className="px-2 ">
                                                            {tile.sand}
                                                        </td>
                                                        <td>
                                                            {tile.jally}
                                                        </td>
                                                        <td className="px-2 ">
                                                            {tile.totalValume}
                                                        </td>
                                                        <td className="px-2">
                                                            <input
                                                                className="w-12 h-6 bg-transparent font-semibold focus:outline-gray-200 hover:border focus:outline-none"
                                                                placeholder="Enter Labour Rate"
                                                                value={tile.labourRate || ''}
                                                                name="labourRate"
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                            />
                                                        </td>
                                                        <td className="px-2 ">
                                                            {tile.totalAmountCft}
                                                        </td>
                                                        <td>
                                                            {tile.LabourAmount}
                                                        </td>
                                                        <td className="px-2">
                                                            {tile.concreteTotalAmount ? parseFloat(tile.concreteTotalAmount).toFixed(2) : '0.00'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                    <tr className=" font-bold">
                                        <td colSpan="8" className="text-right"></td>
                                        <td className=" text-[#E4572E]">
                                            {floorss.reduce(
                                                (sum, floor) =>
                                                    sum +
                                                    floor.tiles.reduce(
                                                        (subSum, tile) => subSum + (parseFloat(tile.cement) / 1.25 || 0),
                                                        0
                                                    ),
                                                0
                                            ).toFixed(2)} Bags
                                        </td>
                                        <td className="text-[#E4572E]">
                                            {floorss
                                                .reduce((sum, floor) => sum + floor.tiles.reduce((subSum, tile) => subSum + (parseFloat(tile.sand) / 100 || 0), 0), 0)
                                                .toFixed(2)
                                            } Units
                                        </td>
                                        <td className="text-[#E4572E]">
                                            {floorss
                                                .reduce((sum, floor) => sum + floor.tiles.reduce((subSum, tile) => subSum + (parseFloat(tile.jally) / 100 || 0), 0), 0)
                                                .toFixed(2)
                                            } Units
                                        </td>
                                        <td className="text-[#E4572E]">
                                            {floorss
                                                .reduce((sum, floor) => sum + floor.tiles.reduce((subSum, tile) => subSum + (parseFloat(tile.totalValume) || 0), 0), 0)
                                                .toFixed(2)
                                            } CFT
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <button type="button" className="text-[#E4572E] mt-6 mb-20 -ml-[94%] border-dashed border-b-2 border-[#BF9853] font-semibold"
                                onClick={addFloorRow}>
                                + Add Floor
                            </button>
                        </div>
                        <div className=" buttons -mt-14 flex">
                            <div className="">
                                <button className="w-[150px] text-white h-[36px] rounded ml-2 bg-green-800 hover:text-white transition duration-200 ease-in-out">
                                    Engineer Copy
                                </button>
                            </div>
                            <div className="">
                                <button className="w-[137px] h-[36px] text-white rounded ml-2 bg-[#BF9853] hover:text-white transition duration-200 ease-in-out">
                                    Generate Bill
                                </button>
                            </div>
                            <div className="flex ml-[87%]">
                                <button
                                    onClick={handleSubmit}
                                    type="submit"
                                    className="btn bg-[#BF9853] w-[139px] text-white h-[39px] rounded-md  font-semibold -ml-56">Submit
                                </button>
                            </div>
                        </div>
                        <div className="-mt-3 flex">
                            <div>
                                <div className="flex justify-between">
                                    <h1 className="font-bold text-lg mt-8">Overall Summary </h1>
                                    <h1 className="font-bold text-sm mt-10 text-[#E4572E]  hover:underline cursor-pointer">Export PDF</h1>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                                    <table className="table-auto mt-2">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="font-extrabold p-2">S.No</th>
                                                <th className="p-2 font-extrabold">Floor Name</th>
                                                <th className="p-2 w-20 font-extrabold">Member Name</th>
                                                <th className="p-2 w-20 font-extrabold">Cement</th>
                                                <th className="p-2 w-20 font-extrabold">Sand</th>
                                                <th className="p-2 w-20 font-extrabold">Jally</th>
                                                <th className="p-2 w-32 font-extrabold">Total Qty (CFT)</th>
                                                <th className="p-2 w-20 font-extrabold">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-8" style={{ marginLeft: '420px' }}>
                                    <th>Total</th>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
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
                                        onChange={(e) => setSelectedModule(e.target.value)}>
                                        <option value="" disabled>Select Module...</option>
                                        <option value="Tile Calculation">Tile Calculation</option>
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
                                        isDisabled={!RccClientName}
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
        </body >
    );
}
export default RccCalculator