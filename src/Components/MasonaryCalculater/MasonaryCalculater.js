import React, { useState, useEffect } from "react";
import Select from "react-select";
import deleteIcon from '../Images/Worng.svg';
import add from '../Images/Right.svg';
import { IoClose } from "react-icons/io5";

const MasonaryCalculater = () => {
    const [activeTab, setActiveTab] = useState("brickwork");
    const [rateLabel, setRateLabel] = useState("Rate (sqft)");
    const [isOpen, setIsOpen] = useState(false);
    const [area, setArea] = useState("");
    const [totalArea, setTotalArea] = useState("");
    const [cementRate, setCementRate] = useState(0);
    const [sandRate, setSandRate] = useState(0);
    const [brickRate, setBrickRate] = useState(0);
    const [cementWastage, setCementWastage] = useState(0);
    const [sandWastage, setSandWastage] = useState(0);
    const [brickWastage, setBrickWastage] = useState(0);
    const [total, setTotal] = useState(0);
    const [mainInput, setMainInput] = useState("");
    const [labourInput, setLabourInput] = useState("");
    const [labourTotal, setLabourTotal] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [floorOptions, setFloorOptions] = useState([]);
    const [floors, setFloors] = useState([
        {
            floorName: "Ground Floor",
            rows: [
                {
                    type: "9\" Brick Wall",
                    mix: "CM 1:6",
                    length: "",
                    breadth: "",
                    height: "",
                    qty: "",
                    cbag: "",
                    sand: "",
                    bricks: "",
                    area: "",
                    deduction: "",
                    totalArea: "",
                    materialAmmount: "",
                    labourRate: "",
                    labourAmount: "",
                    totalAmount: "",
                    cementRate: "",
                    sandRate: "",
                    brickRate: "",
                    cementWastage: "0%",
                    sandWastage: "0%",
                    brickWastage: "0%"
                }
            ]
        }
    ]);
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
    const defaultRow = {
        type: "9\" Brick Wall",
        mix: "CM 1:6",
        length: "",
        breadth: "",
        height: "",
        qty: "",
        cbag: "",
        sand: "",
        bricks: "",
        area: "",
        deduction: "",
        totalArea: "",
        materialAmmount: "",
        labourRate: "",
        labourAmount: "",
        totalAmount: "",
        cementRate: "",
        sandRate: "",
        brickRate: "",
        cementWastage: "0%",
        sandWastage: "0%",
        brickWastage: "0%"
    };

    const addRow = (floorIndex) => {
        setFloors((prevFloors) =>
            prevFloors.map((floor, index) =>
                index === floorIndex
                    ? {
                        ...floor,
                        rows: [...floor.rows, { ...defaultRow }],
                    }
                    : floor
            )
        );
    };
    const addFloor = () => {
        setFloors([
            ...floors,
            {
                id: floors.length + 1,
                rows: [{ ...defaultRow }],
            }
        ]);
    };

    const handleSelectChange = (event, floorIndex, rowIndex) => {
        const selectedValue = event.target.value;
        let newBreath = "";
        if (selectedValue.includes('9"')) {
            newBreath = '9"';
        } else if (selectedValue.includes('4"')) {
            newBreath = '4"';
        }
        setFloors((prevFloors) => {
            const updatedFloors = [...prevFloors];
            const row = updatedFloors[floorIndex].rows[rowIndex];
            row.breadth = newBreath;
            return updatedFloors;
        });
    };
    useEffect(() => {
        const material = total ? parseFloat(total) : 0;
        const labour = labourTotal ? parseFloat(labourTotal) : 0;
        setTotalAmount(material + labour);
    }, [total, labourTotal]);
    const calculateRowValues = (row) => {
        const updatedRow = { ...row };
        const lengthStr = updatedRow.length;
        const heightStr = updatedRow.height;
        if (/^\d+'$/.test(lengthStr) && /^\d+'$/.test(heightStr)) {
            const lengthValue = parseFloat(lengthStr.replace("'", ""));
            const heightValue = parseFloat(heightStr.replace("'", ""));
            const area = lengthValue * heightValue;
            updatedRow.area = area.toString();
            updatedRow.totalArea = (area - (parseFloat(updatedRow.deduction) || 0)).toString();
        }
        const lengthValue = parseFloat(updatedRow.length?.replace("'", "")) || 0;
        const heightValue = parseFloat(updatedRow.height?.replace("'", "")) || 0;
        const breathValue = parseFloat(updatedRow.breadth?.replace('"', "")) || 0;
        if (lengthValue && heightValue && breathValue) {
            const volume = (lengthValue * breathValue * heightValue / 12) * 0.10;
            updatedRow.totalVolume = volume.toFixed(2);
            if (updatedRow.mix) {
                const [cementPart, sandPart] = updatedRow.mix.split(':').map(Number);
                if (!isNaN(cementPart) && !isNaN(sandPart) && sandPart !== 0) {
                    const cbag = parseFloat(((volume / (cementPart + sandPart)) * cementPart).toFixed(2));
                    const sand = parseFloat(((volume / (cementPart + sandPart)) * sandPart).toFixed(2));
                    const cementWastages = parseFloat(updatedRow.cementWastage) / 100 || 0;
                    const sandWastages = parseFloat(updatedRow.sandWastage) / 100 || 0;
                    const cementWastage = cementWastages * cbag;
                    const sandWastage = sandWastages * sand;
                    updatedRow.cbag = parseFloat((cementWastage + cbag).toFixed(2));
                    updatedRow.sand = parseFloat((sandWastage + sand).toFixed(2));
                }
            }
            const qtyValue = parseFloat(updatedRow.qty) || 1;
            if (breathValue === 9) {
                updatedRow.bricks = ((lengthValue * heightValue) / 8 * qtyValue).toFixed(2);
            } else if (breathValue === 4) {
                updatedRow.bricks = ((lengthValue * heightValue) / 6 * qtyValue).toFixed(2);
            }

            const brickWastages = parseFloat(updatedRow.brickWastage) / 100 || 0;
            const bricksValue = parseFloat(updatedRow.bricks) || 0;
            const brickWastage = brickWastages * bricksValue;
            updatedRow.bricks = parseFloat((bricksValue + brickWastage).toFixed(2));
        }

        updatedRow.materialAmmount = (
            (parseFloat(updatedRow.cbag) || 0) * (parseFloat(updatedRow.cementRate) || 0) +
            (parseFloat(updatedRow.sand) || 0) * (parseFloat(updatedRow.sandRate) || 0) +
            (parseFloat(updatedRow.bricks) || 0) * (parseFloat(updatedRow.brickRate) || 0)
        ).toFixed(2);
        return updatedRow;
    };
    const handleRateChange = (e, rateType) => {
        const value = e.target.value;
        if (!/^\d*\.?\d*$/.test(value)) {
            return;
        }
        if (rateType === 'cementRate') {
            setCementRate(value);
        } else if (rateType === 'sandRate') {
            setSandRate(value);
        } else if (rateType === 'brickRate') {
            setBrickRate(value);
        }
        setFloors((prevFloors) => {
            return prevFloors.map((floor) => {
                const updatedRows = floor.rows.map((row) => {
                    const updatedRow = {
                        ...row,
                        [rateType]: value
                    };
                    return calculateRowValues(updatedRow);
                });
                return { ...floor, rows: updatedRows };
            });
        });
    };
    const handleWastageChange = (e, wastageType) => {
        let value = e.target.value;
        value = value.replace('%', '');
        if (!/^\d*\.?\d*$/.test(value)) {
            return;
        }
        const numericValue = parseFloat(value);
        if (wastageType === 'cementWastage') {
            setCementWastage(numericValue);
        } else if (wastageType === 'sandWastage') {
            setSandWastage(numericValue);
        } else if (wastageType === 'brickWastage') {
            setBrickWastage(numericValue);
        }
        setFloors((prevFloors) => {
            return prevFloors.map((floor) => {
                const updatedRows = floor.rows.map((row) => {
                    const updatedRow = {
                        ...row,
                        [wastageType]: numericValue,
                    };
                    return calculateRowValues(updatedRow);
                });
                return { ...floor, rows: updatedRows };
            });
        });
    };

    const handleInputChange = (event, floorIndex, rowIndex, field) => {
        const value = event.target.value;
        const fieldsToSkipValidation = ['mix'];
        if (!fieldsToSkipValidation.includes(field)) {
            if (!/^\d*'?$/.test(value) && !/^\d*\.?\d*$/.test(value)) {
                return;
            }
        }
        setFloors((prevFloors) => {
            return prevFloors.map((floor, fIndex) => {
                if (fIndex !== floorIndex) return floor;
                const updatedRows = floor.rows.map((r, rIndex) => {
                    if (rIndex !== rowIndex) return r;
                    const updatedRow = { ...r, [field]: value };
                    const lengthStr = updatedRow.length;
                    const heightStr = updatedRow.height;
                    if (/^\d+'$/.test(lengthStr) && /^\d+'$/.test(heightStr)) {
                        const lengthValue = parseFloat(lengthStr.replace("'", ""));
                        const heightValue = parseFloat(heightStr.replace("'", ""));
                        const area = lengthValue * heightValue;
                        updatedRow.area = area.toString();
                        updatedRow.totalArea = (area - (parseFloat(updatedRow.deduction) || 0)).toString();
                    }
                    const lengthValue = parseFloat(updatedRow.length?.replace("'", "")) || 0;
                    const heightValue = parseFloat(updatedRow.height?.replace("'", "")) || 0;
                    const breathValue = parseFloat(updatedRow.breadth?.replace('"', "")) || 0;
                    if (lengthValue && heightValue && breathValue) {
                        const volume = (lengthValue * breathValue * heightValue / 12) * 0.10;
                        updatedRow.totalVolume = volume.toFixed(2);
                        if (updatedRow.mix) {
                            const [cementPart, sandPart] = updatedRow.mix.split(':').map(Number);
                            if (!isNaN(cementPart) && !isNaN(sandPart) && sandPart !== 0) {
                                const cbag = parseFloat(((volume / (cementPart + sandPart)) * cementPart).toFixed(2));
                                const sand = parseFloat(((volume / (cementPart + sandPart)) * sandPart).toFixed(2));
                                const cementWastages = parseFloat(updatedRow.cementWastage) / 100 || 0;
                                const sandWastages = parseFloat(updatedRow.sandWastage) / 100 || 0;
                                const cementWastage = cementWastages * cbag;
                                const sandWastage = sandWastages * sand;
                                updatedRow.cbag = parseFloat((cementWastage + cbag).toFixed(2));
                                updatedRow.sand = parseFloat((sandWastage + sand).toFixed(2));
                                console.log("Cement:", cbag, "Wastage:", cementWastage, "Total:", updatedRow.cbag);
                                console.log("Sand:", sand, "Wastage:", sandWastage, "Total:", updatedRow.sand);
                            }
                        }
                        const qtyValue = parseFloat(updatedRow.qty) || 1;
                        if (breathValue === 9) {
                            updatedRow.bricks = ((lengthValue * heightValue) / 8 * qtyValue).toFixed(2);
                        } else if (breathValue === 4) {
                            updatedRow.bricks = ((lengthValue * heightValue) / 6 * qtyValue).toFixed(2);
                        }
                        const brickWastages = parseFloat(updatedRow.brickWastage) / 100 || 0;
                        const bricksValue = parseFloat(updatedRow.bricks) || 0;
                        const brickWastage = brickWastages * bricksValue;
                        updatedRow.bricks = parseFloat((bricksValue + brickWastage).toFixed(2));

                        console.log("Bricks:", bricksValue, "Wastage:", brickWastage, "Total:", updatedRow.bricks);
                    }
                    updatedRow.materialAmmount = (
                        (parseFloat(updatedRow.cbag) || 0) * (parseFloat(cementRate) || 0) +
                        (parseFloat(updatedRow.sand) || 0) * (parseFloat(sandRate) || 0) +
                        (parseFloat(updatedRow.bricks) || 0) * (parseFloat(brickRate) || 0)
                    ).toFixed(2);

                    return updatedRow;
                });
                return { ...floor, rows: updatedRows };
            });
        });
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
    const handleMainInputChange = (e) => {
        const value = e.target.value;
        setMainInput(value);

        setFloors((prevFloors) =>
            prevFloors.map((floor) => ({
                ...floor,
                rows: floor.rows.map((row) => ({
                    ...row,
                    labourRate: value,
                    labourTotal: (parseFloat(row.totalArea) || 0) * (parseFloat(value) || 0),
                    totalAmount: (parseFloat(row.materialAmmount) || 0) + ((parseFloat(row.totalArea) || 0) * (parseFloat(value) || 0)),
                })),
            }))
        );
    };
    const handleLabourInputChange = (e, floorIndex, rowIndex) => {
        const { value } = e.target;
        setFloors((prevFloors) =>
            prevFloors.map((floor, fIndex) =>
                fIndex === floorIndex
                    ? {
                        ...floor,
                        rows: floor.rows.map((row, rIndex) =>
                            rIndex === rowIndex
                                ? {
                                    ...row,
                                    labourRate: value,
                                    labourTotal: (parseFloat(row.totalArea) || 0) * (parseFloat(value) || 0), // Calculate labour total
                                    totalAmount: (parseFloat(row.materialAmmount) || 0) + ((parseFloat(row.totalArea) || 0) * (parseFloat(value) || 0)), // Update total amount
                                }
                                : row
                        ),
                    }
                    : floor
            )
        );
    };
    useEffect(() => {
        const area = totalArea ? parseFloat(totalArea) : 0;
        const labour = labourInput ? parseFloat(labourInput) : 0;
        setLabourTotal(area * labour);
    }, [totalArea, labourInput]);

    const handleDeductionChange = (event, floorIndex, rowIndex) => {
        let value = event.target.value;
        if (!/^\d*$/.test(value)) return;
        setFloors((prevFloors) =>
            prevFloors.map((floor, fIndex) => {
                if (fIndex !== floorIndex) return floor;
                const updatedRows = floor.rows.map((row, rIndex) => {
                    if (rIndex !== rowIndex) return row;
                    const updatedRow = {
                        ...row,
                        deduction: value
                    };
                    const area = parseFloat(updatedRow.area) || 0;
                    const deductionValue = parseFloat(value) || 0;
                    updatedRow.totalArea = (area - deductionValue).toString();

                    return updatedRow;
                });
                return { ...floor, rows: updatedRows };
            })
        );
    };

    const deleteRow = (floorIndex, rowIndex) => {
        const updatedFloors = [...floors];
        if (updatedFloors[floorIndex].rows.length > 1) {
            updatedFloors[floorIndex].rows.splice(rowIndex, 1);
        }
        setFloors(updatedFloors);
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
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === "brickwork") {
            setRateLabel("Rate (kg)");
        } else if (tab === "plastering") {
            setRateLabel("Rate (kg)");
        }
    };
    let displayIndex = 1;
    return (
        <body>
            <div className=" mx-auto lg:w-[1800px] p-6 border-collapse bg-[#FFFFFF] ml-14 mr-6 rounded-md">
                <div className=" lg:flex text-left">
                    <div className=" flex">
                        <div className="w-full -mt-8 mb-4">
                            <h4 className=" mt-10 font-bold mb-2">Project Name</h4>
                            <Select
                                placeholder="Select Site Name..."
                                className="border border-[#FAF6ED] border-r-[3px] focus:outline-none border-l-[3px] border-b-[3px] border-t-[3px] rounded-lg lg:w-80 w-[323px] h-[45px] text-left"
                                styles={customSelectStyles}
                                isClearable />
                        </div>
                    </div>
                    <div className=" mt-2">
                        <h4 className=" font-bold mb-2">Date </h4>
                        <input
                            type="date"
                            className="border border-[#FAF6ED] border-r-[3px] focus:outline-none border-l-[3px] border-b-[3px] border-t-[3px] w-[168px] h-[45px] rounded-lg px-4 py-2 " />
                    </div>
                    <div>
                        <h4 className=" mt-2 font-bold"> E No</h4>
                        <input
                            className="bg-gray-100 rounded-lg w-[158px] h-[45px]  focus:outline-none mt-2 pl-4"
                            readOnly />
                    </div>
                    <div className="">
                        <h4 className=" mt-2 font-bold mb-2"> Revision</h4>
                        <Select
                            placeholder="Select file..."
                            className="border border-[#FAF6ED] border-r-[3px] focus:outline-none border-l-[3px] border-b-[3px] border-t-[3px] rounded-lg w-[158px] h-[45px]"
                            styles={customSelectStyles}
                            isClearable />
                    </div>
                </div>
                <div className="lg:flex lg:ml-[80%]  items-center lg:-mt-12 text-left">
                    <div className="flex items-center mt-4">
                        <span className="font-semibold">Rate (Sqft):</span>
                        <td>
                            <input
                                type="text"
                                className="ml-2 w-[44px] pl-2 bg-transparent h-[35px] border-[2px] border-opacity-[0.17] border-[#E4572E] rounded-md focus:outline-none"
                                value={mainInput}
                                onChange={handleMainInputChange}
                            />
                        </td>
                    </div>
                    <div className="lg:flex lg:ml-[6%] lg:mt-0 mt-4">
                        <button className="bg-[#007233] w-[105px] h-[36px] rounded text-white" >+ Import</button>
                    </div>
                </div>
            </div>
            <div className="flex mt-6 ml-20 gap-5">
                <button className={activeTab === "brickwork" ? "font-bold text-lg border-b border-[#BF9853]" : "font-semibold"} onClick={() => setActiveTab("brickwork")}>Brickwork</button>
                <button className={activeTab === "plastering" ? "font-bold text-lg border-b border-[#BF9853]" : "font-semibold"} onClick={() => setActiveTab("plastering")}>Plastering</button>
            </div>

            {activeTab === "brickwork" && (
                <div>
                    <div className="flex items-center lg:gap-6 bg-[#FAF6ED] mb-[-12px] lg:mt-[-40px] rounded-md lg:ml-[1050px]">
                        <div className="lg:flex items-center gap-2">
                            <span className="font-semibold">Cement Rate/Bag:</span>
                            <input
                                type="text"
                                className="w-[57px] h-[27px] px-2 py-1 border border-opacity-[0.20] border-[#707070] focus:outline-none rounded bg-transparent text-center"
                                value={cementRate}
                                onChange={(e) => handleRateChange(e, 'cementRate')}
                            />
                            <select
                                onChange={(e) => handleWastageChange(e, 'cementWastage')}
                                className="px-2 py-1 w-[55px] h-[27px] border border-[#E4572E] border-opacity-[0.17] rounded-md focus:outline-none bg-transparent text-sm"
                            >
                                {Array.from({ length: 15 }, (_, i) => (
                                    <option key={i} value={`${i}%`}>
                                        {i}%
                                    </option>
                                ))}
                            </select>

                        </div>
                        <div className="lg:flex items-center gap-2">
                            <span className="font-semibold">Sand Rate/Unit:</span>
                            <input
                                type="text"
                                className="w-[57px] h-[27px] px-2 py-1 focus:outline-none border border-[#707070] rounded border-opacity-[0.18] bg-transparent text-center"
                                value={sandRate}
                                onChange={(e) => handleRateChange(e, 'sandRate')}
                            />
                            <select
                                onChange={(e) => handleWastageChange(e, 'sandWastage')}
                                className="px-2 py-1 w-[55px] h-[27px] border border-[#E4572E] border-opacity-[0.17] rounded-md focus:outline-none bg-transparent text-sm"
                            >
                                {Array.from({ length: 15 }, (_, i) => (
                                    <option key={i} value={`${i}%`}>
                                        {i}%
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="lg:flex items-center gap-2">
                            <span className="font-semibold">Brick/Piece:</span>
                            <input
                                type="text"
                                className="w-[57px] h-[27px] px-2 focus:outline-none py-1 border border-[#707070] border-opacity-[0.18] bg-transparent rounded-md text-center"
                                value={brickRate}
                                onChange={(e) => handleRateChange(e, 'brickRate')}
                            />
                            <select
                                onChange={(e) => handleWastageChange(e, 'brickWastage')}
                                className="px-2 py-1 w-[55px] h-[27px] border border-[#E4572E] border-opacity-[0.17] rounded-md focus:outline-none bg-transparent text-sm"
                            >
                                {Array.from({ length: 15 }, (_, i) => (
                                    <option key={i} value={`${i}%`}>
                                        {i}%
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 bg-white overflow-auto lg:w-[1800px] ml-12">
                        <div className="mt-3 mb-[-2px] items-center">
                            <h2 className="font-bold w-[57px] h-[22px] lg:ml-[560px] ml-20 flex">Height: <input className="w-[46px] focus:outline-none pl-3 border rounded border-opacity-[0.25] border-[#707070] h-[27px] ml-4"></input></h2>
                        </div>
                        <div className="ml-7 mt-5 border-l-8 border-l-[#BF9853] rounded-lg overflow-auto">
                            <table className="lg:w-[1700px] border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-28 text-left pl-4 align-middle" rowSpan="2">Description</th>
                                        <th className="w-20 text-left pl-7 align-middle" rowSpan="2">Type</th>
                                        <th className="w-20 text-center align-middle" rowSpan="2">Mix</th>
                                        <th className="text-center border-l border-r border-[#BF9583] text-lg align-middle text-[#E4572E]" colSpan="3">Measurement</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">Qty</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">Cement Bag</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">Sand (Unit)</th>
                                        <th className="w-20 text-center align-middle" rowSpan="2">Bricks (Piece)</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">Area (sqft)</th>
                                        <th className="w-24 text-center align-middle" rowSpan="2">Deduction Area (sqft)</th>
                                        <th className="w-24 text-center align-middle" rowSpan="2">Total Area (sqft)</th>
                                        <th className="w-24 text-center align-middle" rowSpan="2">Material Amount</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">Labour Rate</th>
                                        <th className="w-20 text-center align-middle" rowSpan="2">Labour Amount</th>
                                        <th className="w-20 text-center align-middle" rowSpan="2">Total Amount</th>
                                    </tr>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-16 border-l border-t border-[#BF9583] text-[#E4572E] text-center">L</th>
                                        <th className="w-16 border-t border-[#BF9583] text-[#E4572E] text-center">B</th>
                                        <th className="w-16 border-t border-r border-[#BF9583] text-[#E4572E] text-center">H</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {floors.map((floor, floorIndex) => (
                                        <React.Fragment key={floorIndex}>
                                            <tr className="font-semibold bg-gray-50">
                                                <td colSpan="17" className="py-2">
                                                    <div className="flex items-center">
                                                        <span className="ml-3">{floorIndex + 1}.</span>
                                                        <select
                                                            className="rounded px-2 py-1 bg-transparent font-semibold focus:outline-none"
                                                            value={floor.floorName}
                                                            onChange={(e) => {
                                                                const selectedFloorName = e.target.value;
                                                                setFloors((prevFloors) => {
                                                                    return prevFloors.map((f, idx) => {
                                                                        if (idx === floorIndex) {
                                                                            return { ...f, floorName: selectedFloorName };
                                                                        }
                                                                        return f;
                                                                    });
                                                                });
                                                            }}>
                                                            <option value="">Select Floor</option>
                                                            {floorOptions.map((option, index) => (
                                                                <option key={index} value={option}>
                                                                    {option}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                            {floor.rows.map((row, rowIndex) => (
                                                <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}`}>
                                                    <td className="pl-4 flex group">
                                                        <select className="w-24 rounded px-2 py-1 bg-transparent focus:outline-none">
                                                            <option>Grid A</option>
                                                            <option>Grid B</option>
                                                            <option>Grid 1</option>
                                                            <option>Grid 2</option>
                                                        </select>
                                                        <div className="items-center gap-2 flex invisible group-hover:visible">
                                                            <button onClick={() => addRow(floorIndex)}>
                                                                <img src={add} alt="add" className="w-4 h-4 ml-3" />
                                                            </button>
                                                            <button onClick={() => deleteRow(floorIndex, rowIndex)}>
                                                                <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="rounded px-2 py-1 focus:outline-none bg-transparent w-[127px] h-[27px]"
                                                            onChange={(e) => handleSelectChange(e, floorIndex, rowIndex)}
                                                            defaultValue="Select Wall">
                                                            <option value="Select Wall" disabled hidden>Select Wall</option>
                                                            <option>9" Brick Wall</option>
                                                            <option>4" Brick Wall</option>
                                                            <option>9" AAC Wall</option>
                                                            <option>4" AAC Wall</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="rounded focus:outline-none bg-transparent w-[78px] h-[27px]"
                                                            value={row.mix || ""}
                                                            onChange={(e) => handleInputChange(e, floorIndex, rowIndex, 'mix')}
                                                        >
                                                            <option value="1:6">CM 1:6</option>
                                                            <option value="1:4">CM 1:4</option>
                                                            <option value="1:5">CM 1:5</option>
                                                        </select>
                                                    </td>

                                                    <td className="border-l border-[#BF9583]">
                                                        <input
                                                            type="text"
                                                            className="w-[40px] focus:outline-none h-[27px] rounded text-center px-2 py-1"
                                                            placeholder="L"
                                                            value={row.length}
                                                            onChange={(e) => handleInputChange(e, floorIndex, rowIndex, 'length')}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[40px] focus:outline-none h-[27px] rounded text-center bg-gray-100 px-2 py-1"
                                                            placeholder="B"
                                                            value={row.breadth}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td className="border-[#BF9583] flex border-r">
                                                        <input
                                                            type="text"
                                                            className="w-[40px] h-[27px] focus:outline-none ml-4 mr-2 rounded text-center px-2 py-1"
                                                            placeholder="H"
                                                            value={row.height}
                                                            onChange={(e) => handleInputChange(e, floorIndex, rowIndex, 'height')}
                                                        />
                                                        <button
                                                            className="text-[#E4572E] mr-[-3px] font-semibold"
                                                            onClick={() => setIsOpen(true)}
                                                        >
                                                            D
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[50px] h-[27px] focus:outline-none rounded text-center border border-gray-300"
                                                            placeholder="Qty"
                                                            value={row.qty || ""} // value from the current row
                                                            onChange={(e) => handleInputChange(e, floorIndex, rowIndex, 'qty')} // calls your input handler
                                                        />
                                                    </td>

                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[46px] h-[27px] focus:outline-none rounded text-center"
                                                            placeholder="Cementbag"
                                                            value={row.cbag}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[50px] h-[27px] focus:outline-none rounded text-center"
                                                            placeholder="Sand"
                                                            value={row.sand}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[44px] h-[27px] focus:outline-none rounded text-center"
                                                            placeholder="Brick"
                                                            value={row.bricks}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[60px] h-[27px] focus:outline-none rounded text-center"
                                                            placeholder="Area"
                                                            value={row.area}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td key={`deduction-${floorIndex}-${rowIndex}`}>
                                                        <input
                                                            type="text"
                                                            className="w-[60px] h-[27px] focus:outline-none rounded text-center"
                                                            placeholder="Deduction"
                                                            value={row.deduction}
                                                            onChange={(e) => handleDeductionChange(e, floorIndex, rowIndex)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[44px] pl-2 h-[27px] focus:outline-none rounded text-center bg-gray-100"
                                                            placeholder="Total Area"
                                                            value={row.totalArea}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[58px] h-[27px] focus:outline-none rounded text-center bg-gray-100 font-semibold"
                                                            placeholder="Material"
                                                            value={row.materialAmmount}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[32px] h-[27px] focus:outline-none rounded text-center"
                                                            placeholder="Labour"
                                                            value={row.labourRate || ""}
                                                            onChange={(e) => handleLabourInputChange(e, floorIndex, rowIndex)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[58px] h-[27px] focus:outline-none rounded text-center bg-gray-100 font-semibold"
                                                            placeholder="Labour Total"
                                                            value={row.labourTotal || 0}
                                                            readOnly
                                                        /></td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[58px] h-[27px] focus:outline-none rounded text-center bg-gray-100 font-semibold"
                                                            placeholder="Total Amount"
                                                            value={row.totalAmount || 0} // Use per-row calculated value
                                                            readOnly
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            className="text-red-500 mt-5 border-dashed border-b-2 border-[#BF9853] font-semibold text-base lg:mr-[1660px] mr-72"
                            onClick={addFloor}
                        >
                            + Add Floor
                        </button>
                        <div className=" buttons mt-3 lg:ml-6 gap-5 items-center lg:flex grid grid-cols-2">
                            <div>
                                <button className="w-[133px] h-[35px] bg-[#007233] rounded-md text-white">Engineer Copy</button>
                            </div>
                            <div>
                                <button className="w-[133px] h-[35px] text-white bg-[#BF9853] rounded-md">Generate Bill</button>
                            </div>
                            <div className="lg:ml-[1250px]">
                                <button className="w-[135px] h-[35px] text-white bg-[#BF9853] rounded">Submit</button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="lg:flex justify-between">
                                {/* Brickwork Summary Table */}
                                <div className="lg:w-1/2 pr-2">
                                    <div className="flex justify-between items-center mb-2 lg:ml-1">
                                        <h2 className="font-bold text-lg">Brickwork Summary</h2>
                                        <div className="flex items-center gap-3">
                                            <label className="font-semibold ">Wastage:</label>
                                            <select className="border-2 border-[#BF9853] border-opacity-[0.17] focus:outline-none px-2 py-1 rounded-md w-[59px] h-[31px] text-center">
                                                {Array.from({ length: 15 }, (_, i) => (
                                                    <option key={i + 1} value={`${i + 1}%`}>{i + 1}%</option>
                                                ))}
                                            </select>
                                            <button className="text-red-600 mr-20 font-semibold flex items-center cursor-default hover:underline">
                                                Export PDF
                                            </button>
                                        </div>
                                    </div>
                                    <div className="border-l-8 border-l-[#BF9853] rounded-lg overflow-auto">
                                        <table className="lg:w-[800px] h-[48px] border-collapse ">
                                            <thead>
                                                <tr className="bg-[#FAF6ED]">
                                                    <th className="w-16 p-2">S.No</th>
                                                    <th className="w-28 p-2">Floor Name</th>
                                                    <th className="w-20 p-2">Grid Name</th>
                                                    <th className="w-16 p-2">Type</th>
                                                    <th className="w-16 p-2">Mix</th>
                                                    <th className="w-24 p-2">Total Area Sqft</th>
                                                    <th className=" p-2">Wastage</th>
                                                    <th className=" p-2">Cement Bag</th>
                                                    <th className=" p-2">Sand Unit</th>
                                                    <th className=" p-2">Bricks Piece</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Overall Summary Table */}
                                <div className="lg:w-1/2 lg:pl-2 text-left">
                                    <h2 className="font-bold text-lg pl-3 mb-2">Overall Summary</h2>
                                    <div className="border-l-8 lg:ml-4 border-l-[#BF9853] rounded-lg overflow-auto">
                                        <table className="lg:w-[651px] h-[48px] border-collapse">
                                            <thead>
                                                <tr className="bg-[#FAF6ED]">
                                                    <th className="w-14 p-2">S.No</th>
                                                    <th className="w-28 p-2">Floor Name</th>
                                                    <th className="w-14 p-2">Type</th>
                                                    <th className="w-16 p-2">Mix</th>
                                                    <th className="w-16 p-2">Cement Bag</th>
                                                    <th className="w-14 p-2">Sand Unit</th>
                                                    <th className="w-14 p-2">Bricks Piece</th>
                                                    <th className="w-20 p-2">TotalArea Sqft</th>
                                                </tr>
                                            </thead>
                                            <tbody>

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === "plastering" && (
                <div>
                    <div className="flex items-center gap-6 bg-[#FAF6ED] lg:mb-[-12px] lg:mt-[-40px] rounded-md lg:ml-[1300px] ml-20">
                        <div className="lg:flex items-center gap-2">
                            <span className="font-semibold block">Cement Rate/Bag:</span>
                            <input
                                type="text"
                                className="w-[57px] h-[27px] px-2 py-1 border border-opacity-[0.20] border-[#707070] focus:outline-none rounded bg-transparent text-center"
                                value={cementRate}
                                onChange={(e) => handleRateChange(e, 'cementRate')}
                            />
                            <select
                                onChange={(e) => handleWastageChange(e, 'cementWastage')}
                                className="px-2 py-1 w-[55px] h-[27px] border border-[#E4572E] border-opacity-[0.17] rounded-md focus:outline-none bg-transparent text-sm"
                            >
                                {Array.from({ length: 15 }, (_, i) => (
                                    <option key={i} value={`${i}%`}>
                                        {i}%
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="lg:flex items-center gap-2">
                            <span className="font-semibold block">Sand Rate/Unit:</span>
                            <input
                                type="text"
                                className="w-[57px] h-[27px] px-2 py-1 focus:outline-none border border-[#707070] rounded border-opacity-[0.18] bg-transparent text-center"
                                value={sandRate}
                                onChange={(e) => handleRateChange(e, 'sandRate')}
                            />
                            <select
                                onChange={(e) => handleWastageChange(e, 'sandWastage')}
                                className="px-2 py-1 w-[55px] h-[27px] border border-[#E4572E] border-opacity-[0.17] rounded-md focus:outline-none bg-transparent text-sm"
                            >
                                {Array.from({ length: 15 }, (_, i) => (
                                    <option key={i} value={`${i}%`}>
                                        {i}%
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 bg-white overflow-auto lg:w-[1800px] ml-12">
                        <div className="mt-3 mb-[-2px] items-center">
                            <h2 className="font-bold w-[57px] h-[22px] lg:ml-[590px] ml-20 flex">Height: <input className="w-[46px] border focus:outline-none rounded border-opacity-[0.25] border-[#707070] h-[27px] ml-4"></input></h2>
                        </div>
                        <div className="ml-7 mt-5 border-l-8 border-l-[#BF9853] rounded-lg overflow-auto">
                            <table className="lg:w-[1600px] border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-28 text-left pl-4 align-middle" rowSpan="2">Description</th>
                                        <th className="w-20 text-left pl-7 align-middle" rowSpan="2">Type</th>
                                        <th className="w-20 text-center align-middle" rowSpan="2">Mix</th>
                                        <th className="text-center border-l border-r border-[#BF9583] text-lg align-middle text-[#E4572E]" colSpan="3">Measurement</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">Qty</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">Cement Bag</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">Sand (Unit)</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">Area (sqft)</th>
                                        <th className="w-24 text-center align-middle" rowSpan="2">Deduction Area (sqft)</th>
                                        <th className="w-24 text-center align-middle" rowSpan="2">Total Area (sqft)</th>
                                        <th className="w-24 text-center align-middle" rowSpan="2">Material Amount</th>
                                        <th className="w-16 text-center align-middle" rowSpan="2">Labour Rate</th>
                                        <th className="w-20 text-center align-middle" rowSpan="2">Labour Amount</th>
                                        <th className="w-20 text-center align-middle" rowSpan="2">Total Amount</th>
                                    </tr>
                                    <tr className="bg-[#FAF6ED]">
                                        <th className="w-16 border-l border-t border-[#BF9583] text-[#E4572E] text-center">L</th>
                                        <th className="w-16 border-t border-[#BF9583] text-[#E4572E] text-center">B</th>
                                        <th className="w-16 border-t border-r border-[#BF9583] text-[#E4572E] text-center">H</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {floors.map((floor, floorIndex) => (
                                        <React.Fragment key={floorIndex}>
                                            <tr className="font-semibold bg-gray-50">
                                                <td colSpan="17" className="py-2">
                                                    <div className="flex items-center">
                                                        <span className="ml-3">{floorIndex + 1}.</span>
                                                        <select
                                                            className="rounded px-2 py-1 bg-transparent font-semibold focus:outline-none"
                                                            value={floor.floorName}
                                                            onChange={(e) => {
                                                                const selectedFloorName = e.target.value;
                                                                setFloors((prevFloors) => {
                                                                    return prevFloors.map((f, idx) => {
                                                                        if (idx === floorIndex) {
                                                                            return { ...f, floorName: selectedFloorName };
                                                                        }
                                                                        return f;
                                                                    });
                                                                });
                                                            }}>
                                                            <option value="">Select Floor</option>
                                                            {floorOptions.map((option, index) => (
                                                                <option key={index} value={option}>
                                                                    {option}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                            {floor.rows.map((row, rowIndex) => (
                                                <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}`}>
                                                    <td className="pl-4 flex group">
                                                        <select className="w-24 rounded px-2 py-1 bg-transparent focus:outline-none">
                                                            <option>Grid A</option>
                                                            <option>Grid B</option>
                                                            <option>Grid 1</option>
                                                            <option>Grid 2</option>
                                                        </select>
                                                        <div className="items-center gap-2 flex invisible group-hover:visible">
                                                            <button onClick={() => addRow(floorIndex)}>
                                                                <img src={add} alt="add" className="w-4 h-4 ml-3" />
                                                            </button>
                                                            <button onClick={() => deleteRow(floorIndex, rowIndex)}>
                                                                <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="rounded px-2 py-1 focus:outline-none bg-transparent w-[127px] h-[27px]"
                                                            onChange={(e) => handleSelectChange(e, floorIndex, rowIndex)}
                                                            defaultValue="Select Wall">
                                                            <option value="Select Wall" disabled hidden>Select Wall</option>
                                                            <option>9" Brick Wall</option>
                                                            <option>4" Brick Wall</option>
                                                            <option>9" AAC Wall</option>
                                                            <option>4" AAC Wall</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="rounded focus:outline-none bg-transparent w-[78px] h-[27px]"
                                                            value={row.mix || ""}
                                                            onChange={(e) => handleInputChange(e, floorIndex, rowIndex, 'mix')}
                                                        >
                                                            <option value="1:6">CM 1:6</option>
                                                            <option value="1:4">CM 1:4</option>
                                                            <option value="1:5">CM 1:5</option>
                                                        </select>
                                                    </td>

                                                    <td className="border-l border-[#BF9583]">
                                                        <input
                                                            type="text"
                                                            className="w-[40px] focus:outline-none h-[27px] rounded text-center px-2 py-1"
                                                            placeholder="L"
                                                            value={row.length}
                                                            onChange={(e) => handleInputChange(e, floorIndex, rowIndex, 'length')}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[40px] focus:outline-none h-[27px] rounded text-center bg-gray-100 px-2 py-1"
                                                            placeholder="B"
                                                            value={row.breadth}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td className="border-[#BF9583] flex border-r">
                                                        <input
                                                            type="text"
                                                            className="w-[40px] h-[27px] focus:outline-none ml-4 mr-2 rounded text-center px-2 py-1"
                                                            placeholder="H"
                                                            value={row.height}
                                                            onChange={(e) => handleInputChange(e, floorIndex, rowIndex, 'height')}
                                                        />
                                                        <button
                                                            className="text-[#E4572E] mr-[-3px] font-semibold"
                                                            onClick={() => setIsOpen(true)}
                                                        >
                                                            D
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[50px] h-[27px] focus:outline-none rounded text-center border border-gray-300"
                                                            placeholder="Qty"
                                                            value={row.qty || ""} // value from the current row
                                                            onChange={(e) => handleInputChange(e, floorIndex, rowIndex, 'qty')} // calls your input handler
                                                        />
                                                    </td>

                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[46px] h-[27px] focus:outline-none rounded text-center"
                                                            placeholder="Cementbag"
                                                            value={row.cbag}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[50px] h-[27px] focus:outline-none rounded text-center"
                                                            placeholder="Sand"
                                                            value={row.sand}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[60px] h-[27px] focus:outline-none rounded text-center"
                                                            placeholder="Area"
                                                            value={row.area}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td key={`deduction-${floorIndex}-${rowIndex}`}>
                                                        <input
                                                            type="text"
                                                            className="w-[60px] h-[27px] focus:outline-none rounded text-center"
                                                            placeholder="Deduction"
                                                            value={row.deduction}
                                                            onChange={(e) => handleDeductionChange(e, floorIndex, rowIndex)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[44px] pl-2 h-[27px] focus:outline-none rounded text-center bg-gray-100"
                                                            placeholder="Total Area"
                                                            value={row.totalArea}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[58px] h-[27px] focus:outline-none rounded text-center bg-gray-100 font-semibold"
                                                            placeholder="Material"
                                                            value={row.materialAmmount}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[32px] h-[27px] focus:outline-none rounded text-center"
                                                            placeholder="Labour"
                                                            value={row.labourRate || ""}
                                                            onChange={(e) => handleLabourInputChange(e, floorIndex, rowIndex)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[58px] h-[27px] focus:outline-none rounded text-center bg-gray-100 font-semibold"
                                                            placeholder="Labour Total"
                                                            value={row.labourTotal || 0}
                                                            readOnly
                                                        /></td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="w-[58px] h-[27px] focus:outline-none rounded text-center bg-gray-100 font-semibold"
                                                            placeholder="Total Amount"
                                                            value={row.totalAmount || 0} // Use per-row calculated value
                                                            readOnly
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            className="text-red-500 mt-5 border-dashed border-b-2 border-[#BF9853] font-semibold text-base lg:mr-[1660px] mr-72"
                            onClick={addFloor}
                        >
                            + Add Floor
                        </button>
                        <div className=" buttons mt-3 lg:ml-6 gap-5 items-center lg:flex grid grid-cols-2">
                            <div>
                                <button className="w-[133px] h-[35px] bg-[#007233] rounded-md text-white">Engineer Copy</button>
                            </div>
                            <div>
                                <button className="w-[133px] h-[35px] text-white bg-[#BF9853] rounded-md">Generate Bill</button>
                            </div>
                            <div className="lg:ml-[1250px]">
                                <button className="w-[135px] h-[35px] text-white bg-[#BF9853] rounded">Submit</button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="lg:flex justify-between">
                                {/* Brickwork Summary Table */}
                                <div className="lg:w-1/2 pr-2">
                                    <div className="flex justify-between items-center mb-2 lg:ml-1">
                                        <h2 className="font-bold text-lg">Plastering Summary</h2>
                                        <div className="flex items-center gap-3">
                                            <label className="font-semibold ">Wastage:</label>
                                            <select className="border-2 border-[#BF9853] border-opacity-[0.17] px-2 py-1 rounded-md w-[59px] h-[31px] text-center">
                                                {Array.from({ length: 15 }, (_, i) => (
                                                    <option key={i + 1} value={`${i + 1}%`}>{i + 1}%</option>
                                                ))}
                                            </select>
                                            <button className="text-red-600 mr-10 font-semibold flex items-center cursor-default hover:underline">
                                                Export PDF
                                            </button>
                                        </div>
                                    </div>
                                    <div className="border-l-8 border-l-[#BF9853] rounded-lg overflow-auto">
                                        <table className="lg:w-[850px] h-[48px] border-collapse ">
                                            <thead>
                                                <tr className="bg-[#FAF6ED]">
                                                    <th className="w-16 p-2">S.No</th>
                                                    <th className="w-28 p-2">Floor Name</th>
                                                    <th className="w-20 p-2">Grid Name</th>
                                                    <th className="w-16 p-2">Type</th>
                                                    <th className="w-16 p-2">Mix</th>
                                                    <th className="w-24 p-2">Total Area Sqft</th>
                                                    <th className=" p-2">Wastage</th>
                                                    <th className=" p-2">Cement</th>
                                                    <th className=" p-2">Sand</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Overall Summary Table */}
                                <div className="lg:w-1/2  lg:pl-2 text-left">
                                    <div className="flex justify-between">
                                        <h2 className="font-bold text-lg pl-3 mb-2">Overall Summary</h2>
                                        <button className="text-red-600 mr-48 font-semibold flex items-center cursor-default hover:underline">
                                            Export PDF
                                        </button>
                                    </div>
                                    <div className="border-l-8 lg:ml-4 border-l-[#BF9853] rounded-lg overflow-auto">
                                        <table className="lg:w-[681px] h-[48px] border-collapse">
                                            <thead>
                                                <tr className="bg-[#FAF6ED]">
                                                    <th className="w-20 p-2">S.No</th>
                                                    <th className="w-28 p-2">Floor Name</th>
                                                    <th className="w-20 p-2">Type</th>
                                                    <th className="w-16 p-2">Mix</th>
                                                    <th className="w-20 p-2">Cement</th>
                                                    <th className="w-20 p-2">Sand </th>
                                                    <th className="w-24 p-2">Total Area Sqft</th>
                                                </tr>
                                            </thead>
                                            <tbody>

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </body>
    )
}

export default MasonaryCalculater
