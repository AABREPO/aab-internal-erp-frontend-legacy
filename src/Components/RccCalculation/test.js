import React, { useState, useEffect } from "react";
import Select from "react-select";
import "jspdf-autotable";
import Right from '../Images/Right.svg'
import Wrong from '../Images/Worng.svg'
import delt from '../Images/Worng.svg';
import add from '../Images/Right.svg';
import uparrow from '../Images/arrow-up.png'
import downarrow from '../Images/down-arrow.png'
import leftarrow from '../Images/left-arrow.png'
import { evaluate } from 'mathjs';
import rightarrow from '../Images/right.png'
import cross from '../Images/cross.png';
const RccCalculator = () => {
    const [clientName, setClientName] = useState(null);
    const [siteOptions, setSiteOptions] = useState([]);
    const [clientSNo, setClientSNo] = useState("");
    const [commonRate, setCommonRate] = useState("");
    const [activeTab, setActiveTab] = useState("formwork");
    const [selectedClientData, setSelectedClientData] = useState({});
    const [selectedClientDatas, setSelectedClientDatas] = useState({});
    const [isPopupOpen1, setIsPopupOpen1] = useState(false);
    const [isPopupOpen2, setIsPopupOpen2] = useState(false);
    const [fileOptions, setFileOptions] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filteredFileOptions, setFilteredFileOptions] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [selectedModule, setSelectedModule] = useState("");
    const [selectedArea, setSelectedArea] = useState("");
    const [rateLabel, setRateLabel] = useState("Rate (sqft)");
    const [fileOption, setFileOption] = useState([]);
    const [fullDatas, setFullDatas] = useState([]);
    const [isImportPopup, setIsImportPopup] = useState(false);
    const closeImportPopup = () => setIsImportPopup(false);
    const openImportPopup = () => setIsImportPopup(true);
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
    const handleInput1Change = (value) => {
        setInput1(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput2Change = (value) => {
        setInput2(value);
        const weightPerUnit = 500;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput3Change = (value) => {
        setInput3(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput4Change = (value) => {
        setInput4(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput5Change = (value) => {
        setInput5(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput6Change = (value) => {
        setInput6(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput7Change = (value) => {
        setInput7(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput8Change = (value) => {
        setInput8(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput9Change = (value) => {
        setInput9(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput10Change = (value) => {
        setInput10(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput11Change = (value) => {
        setInput11(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput12Change = (value) => {
        setInput12(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput13Change = (value) => {
        setInput13(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput14Change = (value) => {
        setInput14(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput15Change = (value) => {
        setInput15(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleInput16Change = (value) => {
        setInput16(value);
        const weightPerUnit = 250;
        const totalWeight = value * weightPerUnit;
        setCalculatedWeight(totalWeight.toFixed(2));
    };
    const handleDropdown1Change = (event) => {
        setDropdown1(event.target.value);
    };
    const handleDropdown2Change = (event) => {
        setDropdown2(event.target.value);
    };
    const handleDropdown3Change = (event) => {
        setDropdown3(event.target.value);
    };
    const handleDropdown4Change = (event) => {
        setDropdown4(event.target.value);
    };
    const handleDropdown5Change = (event) => {
        setDropdown5(event.target.value);
    };
    const handleDropdown6Change = (event) => {
        setDropdown6(event.target.value);
    };
    const handleDropdown7Change = (event) => {
        setDropdown7(event.target.value);
    };
    const handleDropdown8Change = (event) => {
        setDropdown8(event.target.value);
    };
    const handleDropdown9Change = (event) => {
        setDropdown9(event.target.value);
    };
    const handleDropdown10Change = (event) => {
        setDropdown10(event.target.value);
    };
    const handleDropdown11Change = (event) => {
        setDropdown11(event.target.value);
    };
    const handleDropdown12Change = (event) => {
        setDropdown12(event.target.value);
    };
    const handleDropdown13Change = (event) => {
        setDropdown13(event.target.value);
    };
    const handleDropdown14Change = (event) => {
        setDropdown14(event.target.value);
    };
    const handleDropdown15Change = (event) => {
        setDropdown15(event.target.value);
    };
    const handleDropdown16Change = (event) => {
        setDropdown16(event.target.value);
    };
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
        const weightPerUnit = 250;
        console.log("Received qty:", qty);
        const totalQty = value1 + value2 + value3 + value4 + value5 + value6 + value7 + value8 + value9 + value10 + value11 + value12 + value13 + value14 + value15 + value16;
        return totalQty || "";
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
        const weightPerUnit = 500;
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
        return totalQty || "";
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
        setInputValue("");
    };
    const handleEditClick = () => {
        console.log('Selected Area:', selectedArea);
        if (selectedArea === 'Roof Beam') {
            togglePopup('Roof Beam');
        } else if (selectedArea === 'Plinth Beam') {
            togglePopup('Plinth Beam');
        } else if (selectedArea === 'Footing') {
            togglePopup('Footing')
        } else if (selectedArea === 'Cantilever') {
            togglePopup('Cantilever')
        }
        else {
            alert('Please select "Area Name" to edit.');
        }
    };
    const togglePopup = (type) => {
        console.log('Toggle Popup:', type);
        setPopupType((prev) => (prev === type ? null : type));
    };
    const [popupType, setPopupType] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const weightMap = {
        "12MM": 250, 
        "8MM": 200, 
        "16MM": 300,
        "20MM": 350,
        "25MM": 400,
        "32MM": 450,
    };
    const [calculatedWeight, setCalculatedWeight] = useState("");
    const handleInputChange = (floorIndex, tileIndex, field, value) => {
        const updatedFloors = [...floors];
        const tile = updatedFloors[floorIndex].tiles[tileIndex];
        if (field === 'size') {
            const [height, breadth] = value.split('"x').map((val) => val.trim());
            const currentType = tile.type;
            tile.size = value;
            tile.height = `${height}"`;
            tile.breadth = `${breadth}"`; 
            const H = parseFeetAndInches(height); 
            const B = parseFeetAndInches(breadth);
            tile.area = ((H * 2) + B).toFixed(2);
            const L = parseFeetAndInches(tile.length);
            const totalArea = L * parseFloat(tile.area);
            tile.totalArea = totalArea.toFixed(2);
            const deduction = parseFloat(tile.deductionArea) || 0;
            const adjustedTotalArea = Math.max(totalArea - deduction, 0);
            tile.adjustedTotalArea = adjustedTotalArea.toFixed(2);
            updatedFloors[floorIndex].tiles.forEach((t) => {
                if (t.type === currentType) {
                    t.size = value;
                    t.height = `${height}"`;
                    t.breadth = `${breadth}"`;
                    t.area = ((H * 2) + B).toFixed(2);
                    t.totalArea = (parseFeetAndInches(t.length) * parseFloat(t.area)).toFixed(2);
                    const deduction = parseFloat(t.deductionArea) || 0;
                    const adjustedTotalArea = Math.max(parseFloat(t.totalArea) - deduction, 0);
                    t.adjustedTotalArea = adjustedTotalArea.toFixed(2);
                }
            });
            updatedFloors[floorIndex].typeSizes = {
                ...(updatedFloors[floorIndex].typeSizes || {}),
                [currentType]: value,
            };
            setTypeSizes((prevTypeSizes) => ({
                ...prevTypeSizes,
                [currentType]: value,
            }));
        } else if (field === 'type') {
            tile[field] = value;
            const floorTypeSizes = updatedFloors[floorIndex].typeSizes || {};
            const newSize = floorTypeSizes[value] || typeSizes[value] || '';
            const [height, breadth] = newSize.split('"x').map((val) => val.trim());
            tile.height = `${height}"`;
            tile.breadth = `${breadth}"`;
            tile.size = newSize;
            const H = parseFeetAndInches(height);
            const B = parseFeetAndInches(breadth);
            tile.area = ((H * 2) + B).toFixed(2);
            const L = parseFeetAndInches(tile.length);
            const totalArea = L * parseFloat(tile.area);
            tile.totalArea = totalArea.toFixed(2);
            const deduction = parseFloat(tile.deductionArea) || 0;
            const adjustedTotalArea = Math.max(totalArea - deduction, 0);
            tile.adjustedTotalArea = adjustedTotalArea.toFixed(2);
        }
        else if (field === 'length' || field === 'breadth') {
            const L = parseFeetAndInches(tile.length);
            const H = parseFeetAndInches(tile.height);
            const B = parseFeetAndInches(tile.breadth);
            tile.area = ((H * 2) + B).toFixed(2);
            const totalArea = L * parseFloat(tile.area);
            tile.totalArea = totalArea.toFixed(2);
        } else if (field === 'qty') {
            tile[field] = value;
            const weightPerUnit = weightMap[tile.type] || 250;
            tile.weight = (tile.area * weightPerUnit * value).toFixed(2);
        }
        if (tile.rate && tile.adjustedTotalArea) {
            tile.amount = (parseFloat(tile.rate) * parseFloat(tile.adjustedTotalArea)).toFixed(2);
        } else {
            tile.amount = "0.00";
        }
        const totalWeight = updatedFloors.reduce((sum, floor) => {
            return (
                sum +
                floor.tiles.reduce((floorSum, tile) => {
                    return floorSum + (parseFloat(tile.weight) || 0);
                }, 0)
            );
        }, 0);
        const totalAmount = updatedFloors[floorIndex].tiles.reduce((sum, t) => {
            return sum + parseFloat(t.amount || 0);
        }, 0);
        updatedFloors[floorIndex].totalAmount = totalAmount.toFixed(2);
        console.log("Updated Floors:", updatedFloors);
        console.log("Calculated Total Weight:", totalWeight);
        setCalculatedWeight(totalWeight.toFixed(2));
        setFloors(updatedFloors);
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
    const [floors, setFloors] = useState([
        {
            floorName: "Ground Floor",
            areaName: "",
            tiles: [
                {
                    type: "",
                    size: "",
                    length: "",
                    breadth: "",
                    height: "",
                    area: "",
                    deductionArea: "",
                    totalArea: "",
                    rate: "",
                    amount: "",
                },
            ],
        },
    ]);
    const [selectedOptions, setSelectedOptions] = useState(new Set());
    const floorOptions = [
        "Ground Floor",
        "First Floor",
        "Second Floor",
        "Third Floor",
        "Fourth Floor",
    ];
    const handleFloorChange = (floorIndex, selectedFloor) => {
        const updatedFloors = [...floors];
        updatedFloors[floorIndex].floorName = selectedFloor;
        setFloors(updatedFloors);
        const selectedValues = updatedFloors.map((f) => f.floorName).filter(Boolean);
        setSelectedOptions(new Set(selectedValues));
    };
    const removeRow1 = (floorIndex, tileIndex) => {
        const updatedFloors = [...floors];
        if (!updatedFloors[floorIndex] || !updatedFloors[floorIndex].tiles) {
            console.error("Invalid floorIndex or tiles structure");
            return;
        }
        updatedFloors[floorIndex].tiles.splice(tileIndex, 1);
        setFloors(updatedFloors);
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
    };
    const handleAreaChange = (floorIndex, selectedOption) => {
        const updatedFloors = [...floors];
        updatedFloors[floorIndex].areaName = selectedOption ? selectedOption.value : "";
        setFloors(updatedFloors);
    };
    const parseFeetAndInches = (value) => {
        let totalValue = 0;
        const regex = /(\d+(\.\d+)?)'|(\d+)\s*"?/g;
        let match;
        while ((match = regex.exec(value)) !== null) {
            if (match[1]) {
                totalValue += parseFloat(match[1]);
            }
            if (match[3]) {
                const inches = parseInt(match[3], 10);
                totalValue += inches / 12;
            }
        }
        return totalValue;
    };
    const handleInteriorDeductionKeyPress = (floorIndex, tileIndex, event) => {
        if (event.key === 'Enter') {
            const input = event.target.value;
            try {
                const result = evaluate(input);
                console.log(`Calculated result: ${result}`);
                setFloors((prev) => {
                    const updatedFloors = [...prev];
                    const tile = updatedFloors[floorIndex].tiles[tileIndex];
                    tile.deductionArea = result;
                    updateTileCalculations(tile);
                    return updatedFloors;
                });
            } catch (error) {
                alert('Invalid calculation! Please check your input.');
            }
        }
    };
    const handleInteriorTileChange = (floorIndex, tileIndex, event) => {
        const { name, value } = event.target;
        const cleanedValue = value.replace(/"+/g, "").trim();
        setFloors((prev) => {
            const updatedFloors = [...prev];
            const tile = updatedFloors[floorIndex].tiles[tileIndex];
            tile[name] = cleanedValue; 
            updateTileCalculations(tile);
            return updatedFloors;
        });
    };
    const updateTileCalculations = (tile) => {
        const {
            length = "0'",
            breadth = "0'",
            height = "0'",
            deductionArea = "0",
            rate = "0",
        } = tile;
        const L = parseFeetAndInches(length);
        const H = parseFeetAndInches(height);
        const B = parseFeetAndInches(breadth);
        const normalizedDeduction = parseFloat(deductionArea) || 0;
        if (L > 0) {
            const area = (H * 2) + B;
            tile.area = area.toFixed(2);
            const totalArea = L * area;
            const adjustedTotalArea = Math.max(totalArea - normalizedDeduction, 0);
            const totalAmount = (adjustedTotalArea * parseFloat(rate || "0")).toFixed(2);
            tile.totalArea = totalArea.toFixed(2);
            tile.adjustedTotalArea = adjustedTotalArea.toFixed(2);
            tile.amount = totalAmount;
        } else {
            tile.totalArea = "0.00";
            tile.adjustedTotalArea = "0.00";
            tile.amount = "0.00";
        }
    };
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
    const handleCommonRateChange = (newRate) => {
        setCommonRate(newRate);
        setFloors((prev) => {
            return prev.map((floor) => ({
                ...floor,
                tiles: floor.tiles.map((tile) => {
                    const updatedTile = { ...tile, rate: newRate };
                    const { length = "0'", breadth = "0'", height = "0'", deductionArea = "0" } = updatedTile;
                    const L = parseFeetAndInches(length);
                    const B = parseFeetAndInches(breadth);
                    const H = parseFeetAndInches(height);
                    const normalizedDeduction = parseFloat(deductionArea) || 0;
                    const area = (H * 2) + B;
                    const totalArea = L * area;
                    const adjustedTotalArea = Math.max(totalArea - normalizedDeduction, 0);
                    const totalAmount = (adjustedTotalArea * parseFloat(newRate || "0")).toFixed(2);
                    return {
                        ...updatedTile,
                        area: area.toFixed(2),
                        totalArea: totalArea.toFixed(2),
                        adjustedTotalArea: adjustedTotalArea.toFixed(2),
                        amount: totalAmount,
                    };
                }),
            }));
        });
    };
    const [selectedGroundFloor, setSelectedGroundFloor] = useState([]);
    const [selectedGroundFloor1, setSelectedGroundFloor1] = useState([]);
    const [selectedGroundFloor2, setSelectedGroundFloor2] = useState([]);
    const [selectedFirstFloor, setSelectedFirstFloor] = useState([]);
    const [selectedFirstFloor1, setSelectedFirstFloor1] = useState([]);
    const [selectedFirstFloor2, setSelectedFirstFloor2] = useState([]);
    const [groundFloorOpen, setGroundFloorOpen] = useState(false);
    const [firstFloorOpen, setFirstFloorOpen] = useState(false);
    const deleteAreaRow = (floorIndex) => {
        const updatedFloors = [...floors];
        updatedFloors.splice(floorIndex, 1);
        setFloors(updatedFloors);
    };
    const addAreaRow = (floorIndex) => {
        const updatedFloors = [...floors];
        updatedFloors.splice(floorIndex + 1, 0, {
            floorName: null,
            areaName: "",
            tiles: [
                { type: "", length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" },
            ],
        });
        setFloors(updatedFloors);
    };
    const areaOptions = [
        "Roof Beam",
        "Plinth Beam",
        "Lintel Beam",
        "Column",
        "Slab",
        "Footing",
        "Cantilever",
    ];
    const addFloorRow = () => {
        setFloors((prevFloors) => [
            ...prevFloors,
            {
                floorName: "",
                areaName: "",
                tiles: [
                    { type: "", length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" },
                ],
            },
        ]);
    };
    let displayIndex = 1;
    const [selectedSize, setSelectedSize] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const handleFileNameSelect = (e) => {
        e.preventDefault();
        if (!selectedFiles) {
            alert("Please select a file before submitting.");
            return;
        }
        handleFileChanges(selectedFiles);
        closeImportPopup();
    };
    const handleSizeChange = (event) => {
        const size = event.target.value;
        setSelectedSize(size);

        const [w, h] = size.split('x').map((dimension) => dimension.replace('"', '').trim());
        setWidth(`${w}"`);
        setHeight(`${h}"`);
    };
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
    const handleFileChanges = (selected) => {
        if (!selected) {
            setSelectedFiles(null);
            setSelectedClientDatas({ calculations: [] });
            return;
        }
        const selectedClientDatas = fullDatas.find(calculation => calculation.id === selected.value);
        setSelectedFiles(selected);
        if (selectedClientDatas) {
            setSelectedClientDatas(selectedClientDatas);
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
            setFloors(newFloorsData);
        } else {
            setSelectedClientDatas({ calculations: [] });
            setFloors([]);
        }
    };
    const sortedSiteOptions = siteOptions.sort((a, b) =>
        a.label.localeCompare(b.label)
    );
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
                    </div>
                    <div className=" ml-6 mt-1">
                        <h4 className=" font-bold mb-2 -ml-32">Date </h4>
                        <input
                            type="date"
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
                            isClearable />
                    </div>
                </div>
                <div className="flex ml-[83%] -mt-5">
                    <h4 className="font-semibold text-lg mt-1">{rateLabel}</h4>
                    {activeTab !== "concrete" && (
                        <td>
                            <input
                                type="text"
                                value={commonRate}
                                onChange={(e) => handleCommonRateChange(e.target.value)}
                                className="ml-2 w-[61px] pl-2 bg-transparent h-[36px] border-2 border-[#FAF6ED] rounded-md focus:outline-none"
                            />
                        </td>
                    )}
                </div>
                <div className="flex ml-[95%] -mt-10">
                    <button className="bg-[#007233] w-28 h-[36px] rounded-md text-white" onClick={openImportPopup}>+ Import</button>
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
                                        <th className="w-24 text-center align-middle" rowSpan="2">Area (sqft)</th>
                                        <th className="w-24 text-center align-middle" rowSpan="2">Deduction Area (sqft)</th>
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
                                    {floors.map((floor, floorIndex) => (
                                        <React.Fragment key={floorIndex}>
                                            <tr className="bg-gray-50">
                                                <td colSpan="13" className="font-bold text-left pl-2">
                                                    {floor.floorName !== null && (
                                                        <div>
                                                            <span className="mt-1">{displayIndex++}.</span>
                                                            <select
                                                                value={floor.floorName || ""}
                                                                onChange={(e) => handleFloorChange(floorIndex, e.target.value)}
                                                                className="w-40 p-1 rounded-lg bg-transparent focus:outline-none font-semibold">
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
                                                    <tr
                                                        key={`${floorIndex}-${tileIndex}`}
                                                        className={globalRowIndex % 2 === 0 ? "bg-[#FAF6ED]" : "bg-white"}>
                                                        <td className="px-1 flex group ml-3">
                                                            {tileIndex === 0 ? (
                                                                <Select
                                                                    name="areaName"
                                                                    options={areaOptions.map((option) => ({
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
                                                                    onChange={(e) => handleInputChange(floorIndex, tileIndex, 'type', e.target.value)}>
                                                                    <option value="" disabled hidden>
                                                                        Select RB
                                                                    </option>
                                                                    <option value="RB 01">RB 01</option>
                                                                    <option value="RB 02">RB 02</option>
                                                                    <option value="RB 03">RB 03</option>
                                                                    <option value="RB 04">RB 04</option>
                                                                    <option value="RB 05">RB 05</option>
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
                                                        <td className="text-center px-2">
                                                            <select
                                                                className="w-[100px] h-[27px] focus:outline-gray-200 bg-transparent font-medium rounded-sm px-2 hover:border"
                                                                value={tile.size || ''}
                                                                onChange={(e) =>handleInputChange(floorIndex, tileIndex, 'size', e.target.value)}>
                                                                <option value="" disabled hidden>
                                                                    Select Size
                                                                </option>
                                                                <option value='12"x12"'>12"x12"</option>
                                                                <option value='2"x2"'>2"x2"</option>
                                                                <option value='9"x9"'>9"x9"</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-1">
                                                            <input
                                                                type="text"
                                                                name="length"
                                                                placeholder="L"
                                                                value={tile.length || ""}
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
                                                                readOnly
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-[40px] text-base font-medium h-[27px] bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="px-2">
                                                            <div className="w-16 pl-8 text-center font-medium">
                                                                {tile.area || "0.00"}
                                                            </div>
                                                        </td>
                                                        <td className="px-2">
                                                            <input
                                                                type="text"
                                                                name="deductionArea"
                                                                value={tile.deductionArea}
                                                                placeholder="Deduction"
                                                                className="px-2 w-20 bg-transparent font-medium hover:border focus:outline-none"
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)} 
                                                                onKeyDown={(e) => handleInteriorDeductionKeyPress(floorIndex, tileIndex, e)}
                                                                />
                                                        </td>
                                                        <td className="text-center px-2">
                                                            <input
                                                                type="text"
                                                                className="w-[52px] bg-transparent font-medium text-center focus:outline-gray-200 rounded-sm px-1"
                                                                placeholder="Adjusted Total Area"
                                                                value={tile.adjustedTotalArea || "0.00"}
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
                                    Generate Bill
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
                                                <h1 className="flex font-semibold">Site Name:<span className="ml-2">Ramar Krishnankovil</span></h1>
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
                                                        {floors.map((floor, floorIndex) => (
                                                            <React.Fragment key={floorIndex}>
                                                                <tr className="bg-gray-50">
                                                                    <td colSpan="11" className="font-bold text-left pl-2">
                                                                        {floor.floorName}
                                                                    </td>
                                                                </tr>
                                                                {floor.tiles.map((tile, tileIndex) => (
                                                                    <tr key={tileIndex}>
                                                                        <td>{tile.description}</td>
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
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex ml-[87%]">
                                <button
                                    type="submit"
                                    className="btn bg-[#BF9853] w-[139px] text-white h-[39px] rounded-md  font-semibold -ml-56">Submit
                                </button>
                            </div>
                        </div>
                        <div className="-mt-3 flex">
                            <div>
                                <div>
                                    <h1 className="font-bold text-lg mt-8 -ml-[83.5%]">Item Summary </h1>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                                    <table className="table-auto mt-2">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="font-extrabold p-2">S.No</th>
                                                <th className="p-2 font-extrabold">Floor Name</th>
                                                <th className="p-2 font-extrabold">Member Name</th>
                                                <th className="p-2 w-40 font-extrabold">Size</th>
                                                <th className="p-2 w-40 font-extrabold">Total Area</th>
                                                <th className="p-2 w-36 font-extrabold">Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className=" ml-10">
                                <div >
                                    <h1 className="font-bold text-lg mt-8 -ml-[72%]">Overall Summary </h1>
                                </div>
                                <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                                    <table id="summaryTable" className="table-auto mt-2">
                                        <thead>
                                            <tr className="bg-[#FAF6ED]">
                                                <th className="font-extrabold p-2">S.No</th>
                                                <th className="p-2 font-extrabold">Floor Name</th>
                                                <th className="p-2 font-extrabold">Member Name</th>
                                                <th className="p-2 font-extrabold">Total Area</th>
                                                <th className="p-2 font-extrabold">Qty</th>
                                                <th className="p-2 font-extrabold">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="ml-80 mt-5">
                                    <th>Total</th>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                }
            </div >
            <div className="content">
                {activeTab === "steel" && (
                    <div className="p-6 bg-white ml-6 mr-6 rounded-lg lg:mx-13 lg:p-">
                        <div className="rounded-lg border-l-8 border-l-[#BF9853] flex -mt-3 overflow-hidden">
                            <table className="table-auto w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-40 text-left pl-2 align-middle" rowSpan="2">Description</th>
                                        <th className="w-12 text-left pl-7 align-middle" rowSpan="2">Type</th>
                                        <th className="w-12 text-center align-middle" rowSpan="2">Configuration</th>
                                        <th className="w-12 text-center align-middle" rowSpan="2">Size</th>
                                        <th className="w-32 text-center align-middle text-lg " colSpan="3" style={{ letterSpacing: '0.2em' }}>Measurement</th>
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
                                    {floors.map((floor, floorIndex) => (
                                        <React.Fragment key={floorIndex}>
                                            <tr className="bg-gray-50">
                                                <td colSpan="13" className="font-bold text-left pl-2">
                                                    {floor.floorName !== null && (
                                                        <div>
                                                            <span className="mt-1">{displayIndex++}.</span>
                                                            <select
                                                                value={floor.floorName || ""}
                                                                onChange={(e) => handleFloorChange(floorIndex, e.target.value)}
                                                                className="w-40 p-1 rounded-lg bg-transparent focus:outline-none font-semibold">
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
                                                                    options={areaOptions.map((option) => ({
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
                                                        <td className="text-center w-[20px] px-2 group">
                                                            <div className="flex items-center">
                                                                <select
                                                                    className="w-full bg-transparent font-medium rounded-sm px-2 hover:border focus:outline-none"
                                                                    value={tile.type || ''}
                                                                    onChange={(e) =>handleInputChange(floorIndex, tileIndex, 'type', e.target.value)}>
                                                                    <option value="" disabled hidden>
                                                                        Select RB
                                                                    </option>
                                                                    <option value="RB 01">RB 01</option>
                                                                    <option value="RB 02">RB 02</option>
                                                                    <option value="RB 03">RB 03</option>
                                                                    <option value="RB 04">RB 04</option>
                                                                    <option value="RB 05">RB 05</option>
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
                                                                onClick={handleEditClick}>
                                                                Edit
                                                            </button>
                                                            {popupType === 'Roof Beam' && (
                                                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center pl-[600px]">
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
                                                                                                        onChange={(e) => handleInput1Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown1}
                                                                                                        onChange={handleDropdown1Change}>
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
                                                                                                <td className="border p-2 text-center">T2</td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <input
                                                                                                        className="w-10 h-6 text-center focus:outline-none"
                                                                                                        value={input2}
                                                                                                        onChange={(e) => handleInput2Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown2}
                                                                                                        onChange={handleDropdown2Change}>
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
                                                                                                        onChange={(e) => handleInput3Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown3}
                                                                                                        onChange={handleDropdown3Change}>
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
                                                                                                        onChange={(e) => handleInput4Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown4}
                                                                                                        onChange={handleDropdown4Change}>
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
                                                                                                        onChange={(e) => handleInput5Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown5}
                                                                                                        onChange={handleDropdown5Change}>
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
                                                                                                        onChange={(e) => handleInput6Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown6}
                                                                                                        onChange={handleDropdown6Change}>
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
                                                                                                        onChange={(e) => handleInput7Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown7}
                                                                                                        onChange={handleDropdown7Change}>
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
                                                                                                        onChange={(e) => handleInput8Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown8}
                                                                                                        onChange={handleDropdown8Change}>
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
                                                                                                        onChange={(e) => handleInput9Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown9}
                                                                                                        onChange={handleDropdown9Change}>
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
                                                                                                        onChange={(e) => handleInput10Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown10}
                                                                                                        onChange={handleDropdown10Change}>
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
                                                                                                        onChange={(e) => handleInput11Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown11}
                                                                                                        onChange={handleDropdown11Change}>
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
                                                                                                        onChange={(e) => handleInput12Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown12}
                                                                                                        onChange={handleDropdown12Change}>
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
                                                                                                        onChange={(e) => handleInput13Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown13}
                                                                                                        onChange={handleDropdown13Change}>
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
                                                                                                        onChange={(e) => handleInput14Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown14}
                                                                                                        onChange={handleDropdown14Change}>
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
                                                                                                        onChange={(e) => handleInput15Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown15}
                                                                                                        onChange={handleDropdown15Change}>
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
                                                                                                        onChange={(e) => handleInput16Change(e.target.value)}
                                                                                                    />
                                                                                                </td>
                                                                                                <td className="border p-2 text-center">
                                                                                                    <select className="focus:outline-none"
                                                                                                        value={dropdown16}
                                                                                                        onChange={handleDropdown16Change}>
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
                                                                                <div className="relative">
                                                                                    <div className="absolute top-[390px]  left-[-460px] flex items-center">
                                                                                        <img className="w-[15px] mr-[-4px] text-[#8D8989] ml-[-8px] mt-[-32px]" src={leftarrow} alt="#"></img>
                                                                                        <div>
                                                                                            <div className="h-[2px] bg-[#8D8989] w-[375px] flex items-center"></div>
                                                                                            <input
                                                                                                type="text"
                                                                                                value={width}
                                                                                                readOnly
                                                                                                className="text-lg text-center mx-2 w-10 h-6 mt-2 text-[#E4572E] border font-semibold focus:outline-none"
                                                                                            />
                                                                                        </div>
                                                                                        <img className="w-4 mt-[-33px] text-[#8D8989] ml-[-9px]" src={rightarrow} alt="#"></img>
                                                                                    </div>
                                                                                    <div className="absolute top-[4px] left-[-60px] flex items-center">
                                                                                        <img src={uparrow} alt="#" className="w-4 text-[#8D8989] mt-[-220px] mr-[-9px]"></img>
                                                                                        <div className="">
                                                                                            <div className="w-[2px] bg-[#8D8989] h-[350px] flex"></div>
                                                                                            <div className="mt-[-160px]"><input
                                                                                                type="text"
                                                                                                value={height}
                                                                                                readOnly
                                                                                                className="text-lg ml-4 w-10 pl-2 h-6 text-[#E4572E] border font-semibold focus:outline-none"
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
                                                                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                                                                    onClick={(e) => {if (e.target.className.includes("bg-black")) togglePopup(null);}}>
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
                                                                                onClick={() => console.log("Cut List Clicked")}>
                                                                                Cut List
                                                                            </button>
                                                                            <button
                                                                                className="bg-transparent text-[#BF9853] font-semibold w-[138px] px-4 py-2" style={{ border: '1px solid #BF9853', borderRadius: '4px' }}
                                                                                onClick={() => togglePopup(null)}>
                                                                                Cancel
                                                                            </button>
                                                                            <button className="bg-[#BF9853] text-white w-[120px] px-4 py-2" style={{ borderRadius: '4px' }}>
                                                                                Save
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {popupType === 'Footing' && (
                                                                <div
                                                                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                                                                    onClick={(e) => {if (e.target.className.includes("bg-black")) togglePopup(null);}}>
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
                                                                                onClick={() => console.log("Cut List Clicked")}>
                                                                                Cut List
                                                                            </button>
                                                                            <button
                                                                                className="bg-transparent text-[#BF9853] font-semibold w-[138px] px-4 py-2" style={{ border: '1px solid #BF9853', borderRadius: '4px' }}
                                                                                onClick={() => togglePopup(null)}>
                                                                                Cancel
                                                                            </button>
                                                                            <button className="bg-[#BF9853] text-white w-[120px] px-4 py-2" style={{ borderRadius: '4px' }}>
                                                                                Save
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {popupType === 'Cantilever' && (
                                                                <div
                                                                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                                                                    onClick={(e) => {if (e.target.className.includes("bg-black")) togglePopup(null);}}>
                                                                    <div className="bg-white rounded-lg p-6 shadow-lg w-[513px] h-[774px]">
                                                                        <div className="flex justify- items-center mb-4">
                                                                            <h3 className="text-lg font-semibold text-[#E4572E] text-left mb-2">Rebar Configuration</h3>
                                                                            <span className="border border-gray-300 bg-[#F2F2F2] ml-40 w-[105px] focus:outline-none h-[40px] font-bold text-base rounded p-[5.5px]" style={{ border: '2px solid rgba(191, 152, 83, 0.22)', borderRadius: '8px' }}>
                                                                                Cantilever
                                                                            </span>
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
                                                                                onClick={() => console.log("Cut List Clicked")}>
                                                                                Cut List
                                                                            </button>
                                                                            <button
                                                                                className="bg-transparent text-[#BF9853] font-semibold w-[138px] px-4 py-2" style={{ border: '1px solid #BF9853', borderRadius: '4px' }}
                                                                                onClick={() => togglePopup(null)}>
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                className="bg-[#BF9853] text-white w-[120px] px-4 py-2" style={{ borderRadius: '4px' }}>
                                                                                Save
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <td className="-mt-2">
                                                            <select
                                                                className="w-[100px] h-[27px] focus:outline-gray-200 bg-transparent font-medium rounded-sm px-2 hover:border"
                                                                value={tile.size || ''}
                                                                onChange={(e) =>handleInputChange(floorIndex, tileIndex, 'size', e.target.value)}>
                                                                <option value="" disabled hidden>
                                                                    Select Size
                                                                </option>
                                                                <option value='12"x12"'>12"x12"</option>
                                                                <option value='2"x2"'>2"x2"</option>
                                                                <option value='9"x9"'>9"x9"</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-1">
                                                            <input
                                                                type="text"
                                                                name="length"
                                                                placeholder="L"
                                                                value={tile.length || ""}
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
                                                                readOnly
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-[40px] text-base font-medium h-[27px] bg-transparent hover:border focus:outline-none text-center"
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
                                                                className="w-10 bg-transparent focus:outline-none pl-3"
                                                                value={`${calculatedWeight || ""} `}
                                                                placeholder="Weight"
                                                            />
                                                        </td>
                                                        <td className="px-2 ">
                                                            <input className="w-12 text-right bg-gray-200 rounded focus:outline-none"></input>
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
                                    className="w-[137px] h-10 text-white rounded ml-3 bg-green-800 hover:text-white transition duration-200 ease-in-out">
                                    Order Copy
                                </button>
                            </div>
                            {isPopupOpen4 && (
                                <div className="fixed inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-50 z-50">
                                    <div className="bg-white shadow-lg w-[400px] p-5 rounded-md">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center space-x-2">
                                                <input type="checkbox" className="rounded-xl accent-green-200 cursor-pointer"/>
                                                <span className="text-sm font-semibold">Select all</span>
                                            </div>
                                            <button
                                                onClick={() => setIsPopupOpen4(false)}
                                                className="text-red-500 text-xl font-bold hover:text-red-700">
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
                                                    onClick={() => setGroundFloorOpen(!groundFloorOpen)}>
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
                                                    onClick={() => setFirstFloorOpen(!firstFloorOpen)}>
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
                                                className="bg-[#BF9853] text-white px-4 py-2 rounded w-60 font-semibold cursor-pointer">
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
                                                    <span className={`text-sm cursor-pointer ${groundFloorOpen ? "rotate-180" : ""}`}
                                                        onClick={() => setGroundFloorOpen(!groundFloorOpen)}>
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
                        <div className="flex -mt-6 mb-3" style={{ marginLeft: '1210px' }}>
                            <h1 className="font-semibold -mt-10  flex">Cement Rate/Bag: <input className="ml-2 mt-[-5px] pl-3 bg-white w-[61px] h-[36px] border border-[#f0e6d2] border-r-[0.15rem] border-l-[0.15rem] border-b-[0.15rem] border-t-[0.15rem] rounded focus:outline-none"></input></h1>
                            <h1 className=" font-semibold -mt-10 ml-3 flex">Sand Rate/Unit: <input className="ml-2 pl-3 mt-[-5px] bg-white w-[61px] h-[36px] border border-[#f0e6d2] border-r-[0.15rem] border-l-[0.15rem] border-b-[0.15rem] border-t-[0.15rem] rounded focus:outline-none"></input></h1>
                            <h1 className=" ml-3 font-semibold -mt-10 flex">Jally Rate/Unit: <input className="ml-2 pl-3 mt-[-5px] bg-white w-[61px] h-[36px] border border-[#f0e6d2] border-r-[0.15rem] border-l-[0.15rem] border-b-[0.15rem] border-t-[0.15rem] rounded focus:outline-none"></input></h1>
                        </div>
                        <div className="rounded-lg border-l-8 border-l-[#BF9853] flex mt-1" id="full-table">
                            <table className="table-auto w-full">
                                <thead>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="text-left pl-2" rowSpan="2">Description</th>
                                        <th className="text-left pl-7 align-middle" rowSpan="2">Type</th>
                                        <th className="text-left pl-3 align-middle" rowSpan="2">Mix</th>
                                        <th className="text-center align-middle" rowSpan="2">Size</th>
                                        <th className="text-lg text-center align-middle" colSpan="3" style={{ letterSpacing: '0.2em' }}>Measurement</th>
                                        <th className="text-center align-middle" rowSpan="2">Cement</th>
                                        <th className="text-center align-middle" rowSpan="2">Sand</th>
                                        <th className="text-center align-middle" rowSpan="2">Jally</th>
                                        <th className="w-20  text-center align-middle" rowSpan="2">Total Valume(CFT)</th>
                                        <th className="w-10 pl-3 text-center align-middle" rowSpan="2">Labour Rate</th>
                                        <th className="w- text-center align-middle" rowSpan="2">Total Amount</th>
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
                                                <td colSpan="13" className="font-bold text-left pl-2">
                                                    {floor.floorName !== null && (
                                                        <div>
                                                            <span className="mt-1">{displayIndex++}.</span>
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
                                                                className="w-40 p-1 rounded-lg bg-transparent focus:outline-none">
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
                                                    <tr
                                                        key={`${floorIndex}-${tileIndex}`}
                                                        className={globalRowIndex % 2 === 0 ? "bg-[#FAF6ED]" : "bg-white"}>
                                                        <td className="px-1 flex group ml-3">
                                                            {tileIndex === 0 ? (
                                                                <Select
                                                                    name="areaName"
                                                                    options={areaOptions.map((option) => ({
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
                                                        <td className="text-center w-[100px] px-2 group">
                                                            <div className="flex items-center">
                                                                <select
                                                                    className="w-[100px] bg-transparent font-medium rounded-sm px-2 hover:border focus:outline-none"
                                                                    value={tile.type || ''}
                                                                    onChange={(e) =>
                                                                        handleInputChange(floorIndex, tileIndex, 'type', e.target.value)
                                                                    }
                                                                >
                                                                    <option value="" disabled hidden>
                                                                        Select RB
                                                                    </option>
                                                                    <option value="RB 01">RB 01</option>
                                                                    <option value="RB 02">RB 02</option>
                                                                    <option value="RB 03">RB 03</option>
                                                                    <option value="RB 04">RB 04</option>
                                                                    <option value="RB 05">RB 05</option>
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
                                                        <td className="w-20 p-1 rounded-lg focus:outline-none cursor-pointer bg">
                                                            <select className="bg-transparent font-semibold border ml-[-20px] focus:outline-none">
                                                                <option>M15-1:2:4</option>
                                                                <option>M20-1:1.5:3</option>
                                                            </select>
                                                        </td>
                                                        <td className="-mt-2">
                                                            <select
                                                                className="w-[100px] h-[27px] focus:outline-gray-200 bg-transparent font-medium rounded-sm px-2 hover:border"
                                                                value={tile.size || ''}
                                                                onChange={(e) =>
                                                                    handleInputChange(floorIndex, tileIndex, 'size', e.target.value)}
                                                            >
                                                                <option value="" disabled hidden>
                                                                    Select Size
                                                                </option>
                                                                <option value='12"x12"'>12"x12"</option>
                                                                <option value='2"x2"'>2"x2"</option>
                                                                <option value='9"x9"'>9"x9"</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-1">
                                                            <input
                                                                type="text"
                                                                name="length"
                                                                placeholder="L"
                                                                value={tile.length || ""}
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
                                                                readOnly
                                                                onChange={(e) => handleInteriorTileChange(floorIndex, tileIndex, e)}
                                                                className="px-2 w-[40px] text-base font-medium h-[27px] bg-transparent hover:border focus:outline-none text-center"
                                                            />
                                                        </td>
                                                        <td className="px-2 ">
                                                            <input className="w-14 bg-transparent font-semibold hover:border focus:outline-none" placeholder="Select"></input>
                                                        </td>
                                                        <td className="px-2 ">
                                                            <input type="text" className="px-2 w-16 bg-transparent font-semibold hover:border focus:outline-none" placeholder="Select" />
                                                        </td>
                                                        <td>
                                                            <input className="px-2 w-16 bg-transparent font-semibold hover:border focus:outline-none" placeholder="Select"></input>
                                                        </td>
                                                        <td className="px-2 ">
                                                            <input
                                                                className="  w-12 h-6 bg-transparent font-semibold focus:outline-gray-200 hover:border focus:outline-none" placeholder="Select">
                                                            </input>
                                                        </td>
                                                        <td className="px-2 ">
                                                            <input className="  w-12 h-6 bg-transparent font-semibold focus:outline-gray-200 hover:border focus:outline-none" placeholder="Select"></input>
                                                        </td>
                                                        <td className="px-2 ">
                                                            <input className="  w-20 h-7  bg-gray-200 font-semibold focus:outline-none text-right"></input>
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
                                    type="submit"
                                    className="btn bg-[#BF9853] w-[139px] h-[39px] text-white px-8 py-2 rounded
                                      font-semibold -ml-56">Submit
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