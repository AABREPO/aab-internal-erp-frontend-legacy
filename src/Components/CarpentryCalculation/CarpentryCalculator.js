import React, { useState, useEffect } from 'react';
import Select from 'react-select/base'
import deleteIcon from '../Images/Worng.svg';
import add from '../Images/Right.svg';
import Edit from '../Images/Edit.svg';
import SaveIcon from '../Images/Accounts.svg'
import { row } from 'mathjs';

const CarpentryCalculator = () => {
    const [activeTab, setActiveTab] = useState("window");
    const [rateLabel, setRateLabel] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [floorOptions, setFloorOptions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditing1, setIsEditing1] = useState(false);
    const [isEditing2, setIsEditing2] = useState(false);
    const [isEditing3, setIsEditing3] = useState(false);
    const [windowData, setWindowData] = useState([]);
    const [doorData, setDoorData] = useState([]);
    const [gateData, setGateData] = useState([]);
    const [globalRate, setGlobalRate] = useState('');
    const [carpentryFloors, setCarpentryFloors] = useState([
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
    const [doorFloors, setDoorFloors] = useState([
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
    const [gateFloors, setGateFloors] = useState([
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
    const defaultRow = {
        description: '',
        ref: '',
        size: '',
        type: '',
        openDirection: '',
        material: '',
        shutterType: '',
        grill: '',
        panel: '',
        finish: '',
        mesh: '',
        hardware: '',
        qty: '',
        totalArea: '',
        rate: '',
        totalAmount: '',
    };

    const addFloor = () => {
        setCarpentryFloors(prevFloors => [
            ...prevFloors,
            {
                floorName: '',
                rows: [0],
            },
        ]);
    };
    const updateWindowData = (floorIndex, rowIndex, field, value) => {
        setWindowData((prev) => {
            const updated = [...prev];
            if (!updated[floorIndex]) updated[floorIndex] = { rows: [] };

            const floorData = { ...updated[floorIndex] };
            floorData.rows = [...(floorData.rows || [])];

            const existingRow = floorData.rows[rowIndex] || {};

            const updatedRow = {
                ...existingRow,
                floor: carpentryFloors[floorIndex]?.floorName || ''
            };

            if (field === 'linkedValue') {
                updatedRow.linkedValue = value;
                updatedRow.independentValue = value;
            } else if (field === 'independentValue') {
                updatedRow.independentValue = value;
            } else {
                updatedRow[field] = value;
            }

            const parseSize = (sizeStr) => {
                const match = sizeStr?.match(/(\d+)'x(\d+)'?/);
                if (match) {
                    return {
                        width: parseFloat(match[1]),
                        height: parseFloat(match[2])
                    };
                }
                return { width: 0, height: 0 };
            };

            const { width, height } = parseSize(
                field === 'size' ? value : updatedRow.size
            );
            const quantity = parseFloat(
                field === 'quantity' ? value : updatedRow.quantity
            ) || 0;

            if (field === 'size' || field === 'quantity') {
                updatedRow.totalArea = (width * height * quantity).toFixed(2);
            }

            const rate = parseFloat(updatedRow.rate) || parseFloat(globalRate) || 0;
            const area = parseFloat(updatedRow.totalArea) || 0;
            updatedRow.amount = (area * rate).toFixed(2);

            floorData.rows[rowIndex] = updatedRow;
            updated[floorIndex] = floorData;
            return updated;
        });
    };
    useEffect(() => {
        setWindowData((prev) => {
            return prev.map((floor) => {
                const updatedRows = floor.rows.map((row) => ({
                    ...row,
                    rate: globalRate, // ✅ force overwrite every time
                    amount: ((parseFloat(row.totalArea) || 0) * (parseFloat(globalRate) || 0)).toFixed(2),
                }));
                return { ...floor, rows: updatedRows };
            });
        });
    }, [globalRate]);

    const addRow = (floorIndex) => {
        setCarpentryFloors((prevFloors) =>
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
    const addRow1 = (floorIndex) => {
        setDoorFloors((prevFloors) =>
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
    const addRow2 = (floorIndex) => {
        setGateFloors((prevFloors) =>
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
    const handleEditClick = () => {
        setIsEditing(prev => !prev);
    };
    const handleEditClick1 = () => {
        setIsEditing1(prev => !prev);
    };
    const handleEditClick2 = () => {
        setIsEditing2(prev => !prev);
    };
    const handleEditClick3 = () => {
        setIsEditing3(prev => !prev);
    };
    const deleteRow = (floorIndex, rowIndex) => {
        const updatedFloors = [...carpentryFloors];
        if (updatedFloors[floorIndex].rows.length > 1) {
            updatedFloors[floorIndex].rows.splice(rowIndex, 1);
        }
        setCarpentryFloors(updatedFloors);
    };
    const deleteRow1 = (floorIndex, rowIndex) => {
        const updatedFloors = [...doorFloors];
        if (updatedFloors[floorIndex].rows.length > 1) {
            updatedFloors[floorIndex].rows.splice(rowIndex, 1);
        }
        setDoorFloors(updatedFloors);
    };
    const deleteRow2 = (floorIndex, rowIndex) => {
        const updatedFloors = [...gateFloors];
        if (updatedFloors[floorIndex].rows.length > 1) {
            updatedFloors[floorIndex].rows.splice(rowIndex, 1);
        }
        setGateFloors(updatedFloors);
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
    const updateDoorData = (floorIndex, rowIndex, field, value) => {
        setDoorData((prev) => {
            const updated = [...prev];
            if (!updated[floorIndex]) updated[floorIndex] = { rows: [] };

            const floorData = { ...updated[floorIndex] };
            floorData.rows = [...(floorData.rows || [])];

            const existingRow = floorData.rows[rowIndex] || {};

            const updatedRow = {
                ...existingRow,
                floor: carpentryFloors[floorIndex]?.floorName || ''
            };

            if (field === 'linkedValue') {
                updatedRow.linkedValue = value;
                updatedRow.independentValue = value;
            } else if (field === 'independentValue') {
                updatedRow.independentValue = value;
            } else {
                updatedRow[field] = value;
            }

            const parseSize = (sizeStr) => {
                const match = sizeStr?.match(/(\d+)'x(\d+)'?/);
                if (match) {
                    return {
                        width: parseFloat(match[1]),
                        height: parseFloat(match[2])
                    };
                }
                return { width: 0, height: 0 };
            };

            const { width, height } = parseSize(
                field === 'size' ? value : updatedRow.size
            );
            const quantity = parseFloat(
                field === 'quantity' ? value : updatedRow.quantity
            ) || 0;

            if (field === 'size' || field === 'quantity') {
                updatedRow.totalArea = (width * height * quantity).toFixed(2);
            }

            const rate = parseFloat(updatedRow.rate) || parseFloat(globalRate) || 0;
            const area = parseFloat(updatedRow.totalArea) || 0;
            updatedRow.amount = (area * rate).toFixed(2);

            floorData.rows[rowIndex] = updatedRow;
            updated[floorIndex] = floorData;
            return updated;
        });
    };
    useEffect(() => {
        setDoorData((prev) => {
            return prev.map((floor) => {
                const updatedRows = floor.rows.map((row) => ({
                    ...row,
                    rate: globalRate, // ✅ force overwrite every time
                    amount: ((parseFloat(row.totalArea) || 0) * (parseFloat(globalRate) || 0)).toFixed(2),
                }));
                return { ...floor, rows: updatedRows };
            });
        });
    }, [globalRate]);
    const updateGateData = (floorIndex, rowIndex, field, value) => {
        setGateData((prev) => {
            const updated = [...prev];
            if (!updated[floorIndex]) updated[floorIndex] = { rows: [] };

            const floorData = { ...updated[floorIndex] };
            floorData.rows = [...(floorData.rows || [])];

            const existingRow = floorData.rows[rowIndex] || {};

            const updatedRow = {
                ...existingRow,
                floor: carpentryFloors[floorIndex]?.floorName || ''
            };

            if (field === 'linkedValue') {
                updatedRow.linkedValue = value;
                updatedRow.independentValue = value;
            } else if (field === 'independentValue') {
                updatedRow.independentValue = value;
            } else {
                updatedRow[field] = value;
            }

            const parseSize = (sizeStr) => {
                const match = sizeStr?.match(/(\d+)'x(\d+)'?/);
                if (match) {
                    return {
                        width: parseFloat(match[1]),
                        height: parseFloat(match[2])
                    };
                }
                return { width: 0, height: 0 };
            };

            const { width, height } = parseSize(
                field === 'size' ? value : updatedRow.size
            );
            const quantity = parseFloat(
                field === 'quantity' ? value : updatedRow.quantity
            ) || 0;

            if (field === 'size' || field === 'quantity') {
                updatedRow.totalArea = (width * height * quantity).toFixed(2);
            }

            const rate = parseFloat(updatedRow.rate) || parseFloat(globalRate) || 0;
            const area = parseFloat(updatedRow.totalArea) || 0;
            updatedRow.amount = (area * rate).toFixed(2);

            floorData.rows[rowIndex] = updatedRow;
            updated[floorIndex] = floorData;
            return updated;
        });
    };
    useEffect(() => {
        setGateData((prev) => {
            return prev.map((floor) => {
                const updatedRows = floor.rows.map((row) => ({
                    ...row,
                    rate: globalRate, // ✅ force overwrite every time
                    amount: ((parseFloat(row.totalArea) || 0) * (parseFloat(globalRate) || 0)).toFixed(2),
                }));
                return { ...floor, rows: updatedRows };
            });
        });
    }, [globalRate]);
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
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === "others" || tab === "summary") {
            setRateLabel("Rate(Sqft) :");
        } else {
            setRateLabel("");
        }
        setInputValue("");
    };

    return (
        <body>
            <div className=" mx-auto p-6 border-collapse bg-[#FFFFFF] ml-6 mr-6 lg:w-[1824px] rounded-md ">
                <div className=" lg:flex flex-wrap gap-7 text-left">
                    <div className=" flex">
                        <div className="w-full -mt-8 mb-4">
                            <h4 className=" mt-10 font-bold mb-2">Project Name</h4>
                            <Select
                                placeholder="Select Site Name..."
                                className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg lg:w-80 w-64 h-12 text-left"
                                styles={customSelectStyles}
                                isClearable />
                        </div>
                    </div>
                    <div className=" mt-2">
                        <h4 className=" font-bold mb-2">Date </h4>
                        <input
                            type="date"
                            className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] w-44 rounded-lg px-4 py-2 "
                        />
                    </div>
                    <div className="">
                        <h4 className=" mt-2.5 font-bold"> E No</h4>
                        <input
                            className="bg-gray-100 rounded-lg lg:w-36 w-16 h-12 mt-2 pl-4"
                        />
                    </div>
                    <div className="">
                        <h4 className=" mt-2.5 font-bold mb-2"> Revision</h4>
                        <Select
                            placeholder="Select the file..."
                            className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg lg:w-60 w-48 h-12"
                            styles={customSelectStyles}
                            isClearable
                        />
                    </div>
                    <div className="lg:flex justify-end items-center w-full lg:-mt-10  mt-4 gap-7">
                        <div className='flex items-center gap-3'>
                            <h4 className="lg:font-normal font-bold text-lg mt-1">Rate (Sqft): </h4>
                            <input
                                className="lg:ml-2 bg-transparent lg:h-10 h-[35px] border-[#E4572E] border-opacity-[0.17] border-2 rounded-lg focus:outline-none lg:w-[49px] pl-2 -ml-1 w-[49px]"
                                value={globalRate}
                                onChange={(e) => setGlobalRate(e.target.value)}
                            />
                        </div>
                        <button
                            className="bg-[#007233] w-28  h-[36px] mt-3 rounded-md text-white"
                        >
                            + Import
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-3 overflow-auto no-scrollbar">
                <div className="tabs flex ml-9 gap-5 lg:w-full w-[400px]">
                    <button
                        className={`p-2  ${activeTab === "window" ? "font-bold text-lg border-b-2 border-[#DAA520] focus:outline-none" : "font-semibold text-black"}`}
                        onClick={() => handleTabChange("window")}
                    >
                        Window
                    </button>
                    <button
                        className={`p-2 ${activeTab === "door" ? "font-bold text-lg border-b-2 border-[#DAA520] focus:outline-none" : "font-semibold text-black"}`}
                        onClick={() => handleTabChange("door")}
                    >
                        Door
                    </button>
                    <button
                        className={`p-2 ${activeTab === "gate" ? "font-bold text-lg border-b-2 border-[#DAA520] focus:outline-none" : "font-semibold text-black"}`}
                        onClick={() => handleTabChange("gate")}>
                        Gate
                    </button>
                    <button
                        className={`p-2 ${activeTab === "timberboq" ? "font-bold text-lg border-b-2 border-[#DAA520] focus:outline-none" : "font-semibold text-black"}`}
                        onClick={() => handleTabChange("timberboq")}>
                        Timber BOQ
                    </button>
                    <button
                        className={`p-2 ${activeTab === "glazingboq" ? "font-bold text-lg border-b-2 border-[#DAA520] focus:outline-none" : "font-semibold text-black"}`}
                        onClick={() => handleTabChange("glazingboq")}>
                        Glazing BOQ
                    </button>
                    <button
                        className={`p-2 ${activeTab === "grillboq" ? "font-bold text-lg border-b-2 border-[#DAA520] focus:outline-none" : "font-semibold text-black"}`}
                        onClick={() => handleTabChange("grillboq")}>
                        Grill BOQ
                    </button>
                    <button
                        className={`p-2 ${activeTab === "gateboq" ? "font-bold text-lg border-b-2 border-[#DAA520] focus:outline-none" : "font-semibold text-black"}`}
                        onClick={() => handleTabChange("gateboq")}>
                        Gate BOQ
                    </button>
                </div>
            </div>
            <div className='content'>
                {activeTab === "window" && (
                    <div>
                        <div className=" bg-white ml-5 lg:w-[1824px]">
                            <div className="lg:ml-[265px] flex gap-4">
                                <select className='w-[72px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070] focus:outline-none'></select>
                                <select className='w-[102px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070] focus:outline-none'></select>
                                <select className='w-[65px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070] focus:outline-none'></select>
                                <select className='w-[103px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070] focus:outline-none'></select>
                                <select className='w-[103px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070] focus:outline-none'></select>
                                <select className='w-[92px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070] focus:outline-none'></select>
                                <select className='w-[88px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070] focus:outline-none'></select>
                                <select className='w-[88px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070] focus:outline-none'></select>
                                <select className='w-[88px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070] focus:outline-none'></select>
                                <select className='w-[55px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070] focus:outline-none'></select>
                            </div>
                            <div className="ml-7 mt-5 border-l-8 border-l-[#BF9853] rounded-lg overflow-auto">
                                <table className="lg:w-[1654px] border-collapse">
                                    <thead>
                                        <tr className="bg-[#FAF6ED] gap-5">
                                            <th className="w-48 text-left p-3 align-middle" rowSpan="2">Description</th>
                                            <th className="w- text-center  align-middle" rowSpan="2">Ref</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Size</th>
                                            <th className="w- text-center text-lg align-middle">Type</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Open Direction</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Material</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Shutter Type</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Grill</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Panel</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Finish</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Mesh</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Hardware</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Qty</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Total Area(sqft)</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Rate</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {carpentryFloors.map((floor, floorIndex) => (
                                            <React.Fragment key={floorIndex}>
                                                <tr className="font-semibold bg-gray-50">
                                                    <td colSpan="17" className="py-2">
                                                        <div className="flex items-center">
                                                            <span className="ml-3">{floorIndex + 1}.</span>
                                                            <select
                                                                className="rounded px-2 py-1 bg-transparent font-semibold focus:outline-none w-[120px]"
                                                                value={floor.floorName}
                                                                onChange={(e) => {
                                                                    const selectedFloorName = e.target.value;
                                                                    setCarpentryFloors((prevFloors) => {
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
                                                    <tr key={row.id} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}`}>
                                                        <td>
                                                            <div className="flex group ml-8">
                                                                <select
                                                                    className='w-[100px] h-[27px] bg-transparent border border-transparent focus:outline-none hover:border-opacity-[0.17] hover:border-[#707070] rounded mt-2'
                                                                    value={windowData[floorIndex]?.rows?.[rowIndex]?.room || ''}
                                                                    onChange={(e) => updateWindowData(floorIndex, rowIndex, 'room', e.target.value)}
                                                                >
                                                                    <option value='' disabled hidden>Select Room</option>
                                                                    <option>Hall</option>
                                                                    <option>Bed Room</option>
                                                                </select>
                                                                <div className="items-center gap-2 flex invisible group-hover:visible">
                                                                    <button onClick={() => addRow(floorIndex)}>
                                                                        <img src={add} alt="add" className="w-4 h-4 ml-3" />
                                                                    </button>
                                                                    <button onClick={() => deleteRow(floorIndex, rowIndex)}>
                                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className='text-center align-middle'>
                                                            <input
                                                                className='w-[45px] h-[27px] mt-2 bg-transparent border focus:outline-none border-transparent hover:border-opacity-[0.17] hover:border-[#707070] rounded'
                                                                placeholder='Ref'
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.ref || ''}
                                                                onChange={(e) => updateWindowData(floorIndex, rowIndex, 'ref', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <select
                                                                className='bg-transparent border focus:outline-none border-transparent hover:border-opacity-[0.17] hover:border-[#707070] rounded mt-2'
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.size || ''}
                                                                onChange={(e) => updateWindowData(floorIndex, rowIndex, 'size', e.target.value)}
                                                            >
                                                                <option value=''>Select Size</option>
                                                                <option>3'x4'</option>
                                                                <option>4'x4'</option>
                                                                <option>5'x6'</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select
                                                                className='w-[102px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.type || ''}
                                                                onChange={(e) => updateWindowData(floorIndex, rowIndex, 'type', e.target.value)}
                                                            >
                                                                <option value=''>Select Type</option>
                                                                <option>Casement</option>
                                                                <option>Fixed</option>
                                                                <option>Sliding</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select
                                                                className='w-[65px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.openDirection || ''}
                                                                onChange={(e) => updateWindowData(floorIndex, rowIndex, 'openDirection', e.target.value)}
                                                            >
                                                                <option value=''>Select ..</option>
                                                                <option>Left</option>
                                                                <option>Right</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select defaultValue='Select Material' className='w-[103px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.material || ''}
                                                                onChange={(e) => updateWindowData(floorIndex, rowIndex, 'material', e.target.value)}
                                                            >
                                                                <option value='Select Material'>Select Material</option>
                                                                <option>Wood</option>
                                                                <option>UPVC</option>
                                                                <option>Aluminium</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select
                                                                className='w-[103px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.shutterType || ''}
                                                                onChange={(e) => updateWindowData(floorIndex, rowIndex, 'shutterType', e.target.value)}
                                                            >
                                                                <option value=''>Select Type</option>
                                                                <option>Full Size</option>
                                                                <option>Half Size</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select defaultValue='Select Grill' className='w-[92px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.grill || ''}
                                                                onChange={(e) => updateWindowData(floorIndex, rowIndex, 'grill', e.target.value)}
                                                            >
                                                                <option value='Select Grill'>Select Grill</option>
                                                                <option>Inbuild</option>
                                                                <option>No</option>
                                                                <option>Separate</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select
                                                                className='w-[88px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.panel || ''}
                                                                onChange={(e) => updateWindowData(floorIndex, rowIndex, 'panel', e.target.value)}
                                                            >
                                                                <option value=''>Select Panel</option>
                                                                <option>W Glass</option>
                                                                <option>Wood</option>
                                                                <option>B Glass</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select defaultValue='Select Finish' className='w-[88px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.finish || ''}
                                                                onChange={(e) => updateWindowData(floorIndex, rowIndex, 'finish', e.target.value)}
                                                            >
                                                                <option value='Select Finish'>Select Finish</option>
                                                                <option>W Paint</option>
                                                                <option>Wal Polish</option>
                                                                <option>B Paint</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select defaultValue='Select Mesh' className='w-[88px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.mesh || ''}
                                                                onChange={(e) => updateWindowData(floorIndex, rowIndex, 'mesh', e.target.value)}
                                                            >
                                                                <option value='Select Mesh'>Select Mesh</option>
                                                                <option>Inbuild</option>
                                                                <option>No</option>
                                                                <option>Separate</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select defaultValue='Select Hardware' className='w-[65px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.hardware || ''}
                                                                onChange={(e) => updateWindowData(floorIndex, rowIndex, 'hardware', e.target.value)}
                                                            >
                                                                <option value='Select Hardware'>Select Hardware</option>
                                                                <option>SS</option>
                                                                <option>PC</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input
                                                                className='w-[32px] h-[27px] focus:outline-none border bg-transparent border-transparent hover:border-opacity-[0.17] hover:border-[#707070] rounded mt-2'
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.quantity || ''}
                                                                onChange={(e) => updateWindowData(floorIndex, rowIndex, 'quantity', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                className='w-[55px] h-[27px] focus:outline-none border mt-2 bg-transparent border-transparent hover:border-opacity-[0.17] hover:border-[#707070] rounded'
                                                                readOnly
                                                                placeholder="Total area"
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.totalArea || ''}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                className='w-[44px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                placeholder='Rate'
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.rate || ''}
                                                                onChange={(e) => updateWindowData(floorIndex, rowIndex, 'rate', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                className='w-[65px] h-[27px] border bg-[#F2F2F2] border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                readOnly
                                                                placeholder='Amount'
                                                                value={windowData[floorIndex]?.rows?.[rowIndex]?.amount || ''}
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
                                className="text-red-500 mt-5 border-dashed border-b-2 border-[#BF9853] font-semibold text-base lg:mr-[1660px] mr-80"
                                onClick={addFloor}
                            >
                                + Add Floor
                            </button>
                            <div className=" buttons mt-3 lg:ml-8 gap-5 items-center lg:flex grid grid-cols-2">
                                <div>
                                    <button className="w-[143px] h-[35px] bg-[#007233] rounded-md text-white text-sm">Engineer Copy</button>
                                </div>
                                <div>
                                    <button className="w-[133px] h-[35px] text-white bg-[#BF9853] rounded-md text-sm">Generate Bill</button>
                                </div>
                                <div className="lg:ml-[1200px]">
                                    <button className="w-[135px] h-[35px] text-white bg-[#BF9853] rounded">Submit</button>
                                </div>
                            </div>
                            <div className="lg:w-[1654px] mt-7">
                                <div className="flex justify-between mb-2 ml-8">
                                    <h2 className="font-bold text-lg">Window Summary</h2>
                                    <div className="flex items-center gap-3">
                                        <label className="font-semibold">Wastage:</label>
                                        <select className="border-2 border-[#BF9853] border-opacity-[0.17] focus:outline-none px-2 py-1 rounded-md w-[59px] h-[31px] text-center">
                                            {Array.from({ length: 15 }, (_, i) => (
                                                <option key={i + 1} value={`${i + 1}%`}>{i + 1}%</option>
                                            ))}
                                        </select>
                                        <button className="text-red-600 font-semibold flex items-center cursor-default hover:underline mr-[-15px]">
                                            Export PDF
                                        </button>
                                    </div>
                                </div>
                                <div className='ml-7'>
                                    <div className="border-l-8 border-l-[#BF9853] rounded-lg overflow-auto">
                                        <table className="lg:w-[1654px] h-[48px] border-collapse ">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w-20 text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="w-28 text-left  align-middle" rowSpan="2">Floor Name</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Room Name</th>
                                                    <th className="w- text-left  align-middle" rowSpan="2">Ref</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Size</th>
                                                    <th className="w- text-center text-lg align-middle">Type</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Open Direction</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Material</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Shutter Type</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Grill</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Panel</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Finish</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Mesh</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Hardware</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Qty</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Total Area(sqft)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Rate</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Total Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:w-[1654px] mt-10 mb-3">
                                <div className="flex justify-between mb-2 ml-8">
                                    <h2 className="font-bold text-lg">Overall Summary</h2>
                                    <div className="flex items-center gap-3">
                                        <button className="text-red-600 font-semibold flex items-center cursor-default hover:underline lg:mr-[-15px]">
                                            Export PDF
                                        </button>
                                    </div>
                                </div>
                                <div className='ml-7'>
                                    <div className="border-l-8 border-l-[#BF9853] rounded-lg overflow-auto">
                                        <table className="lg:w-[1654px] h-[48px] border-collapse ">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w-20 text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="w-28 text-left  align-middle" rowSpan="2">Floor Name</th>
                                                    <th className="w- text-left  align-middle" rowSpan="2">Ref</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Size</th>
                                                    <th className="w- text-center text-lg align-middle">Type</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Open Direction</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Material</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Shutter Type</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Grill</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Panel</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Finish</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Mesh</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Hardware</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Qty</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Total Area(sqft)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Rate</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Total Amount</th>
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
                )}
                {activeTab === "door" && (
                    <div>
                        <div className=" bg-white ml-5 lg:w-[1824px]">
                            <div className="lg:ml-[265px] flex gap-4">
                                <select className='w-[72px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[102px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[65px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[103px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[103px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[92px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[88px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[88px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[88px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[55px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                            </div>
                            <div className="ml-7 mt-5 border-l-8 border-l-[#BF9853] rounded-lg overflow-auto">
                                <table className="lg:w-[1654px] border-collapse">
                                    <thead>
                                        <tr className="bg-[#FAF6ED] gap-5">
                                            <th className="w-48 text-left p-3 align-middle" rowSpan="2">Description</th>
                                            <th className="w- text-center  align-middle" rowSpan="2">Ref</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Size</th>
                                            <th className="w- text-center text-lg align-middle">Type</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Open Direction</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Material</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Shutter Type</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Grill</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Panel</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Finish</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Lock</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Hardware</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Qty</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Total Area(sqft)</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Rate</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {doorFloors.map((floor, floorIndex) => (
                                            <React.Fragment key={floorIndex}>
                                                <tr className="font-semibold bg-gray-50">
                                                    <td colSpan="17" className="py-2">
                                                        <div className="flex items-center">
                                                            <span className="ml-3">{floorIndex + 1}.</span>
                                                            <select
                                                                className="rounded px-2 py-1 bg-transparent font-semibold focus:outline-none w-[120px]"
                                                                value={floor.floorName}
                                                                onChange={(e) => {
                                                                    const selectedFloorName = e.target.value;
                                                                    setCarpentryFloors((prevFloors) => {
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
                                                    <tr key={row.id} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}`}>
                                                        <td>
                                                            <div className="flex group ml-8">
                                                                <select className='w-[100px] h-[27px] bg-transparent border border-transparent focus:outline-none hover:border-opacity-[0.17] hover:border-[#707070] rounded mt-2'
                                                                    value={doorData[floorIndex]?.rows?.[rowIndex]?.room || ''}
                                                                    onChange={(e) => updateDoorData(floorIndex, rowIndex, 'room', e.target.value)}
                                                                >
                                                                    <option value='' disabled hidden>Select Room</option>
                                                                    <option>Hall</option>
                                                                    <option>Bed Room</option>
                                                                </select>
                                                                <div className="items-center gap-2 flex invisible group-hover:visible">
                                                                    <button onClick={() => addRow1(floorIndex)}>
                                                                        <img src={add} alt="add" className="w-4 h-4 ml-3" />
                                                                    </button>
                                                                    <button onClick={() => deleteRow1(floorIndex)}>
                                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className='text-center align-middle'>
                                                            <input className='w-[45px] h-[27px] bg-transparent border focus:outline-none border-transparent hover:border-opacity-[0.17] hover:border-[#707070] rounded'
                                                                placeholder='ref'
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.ref || ''}
                                                                onChange={(e) => updateDoorData(floorIndex, rowIndex, 'ref', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <select className='w-[72px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.size || ''}
                                                                onChange={(e) => updateDoorData(floorIndex, rowIndex, 'size', e.target.value)}
                                                            >
                                                                <option value=''>Select Size</option>
                                                                <option>3'x7'</option>
                                                                <option>4'x7'</option>
                                                                <option>5'x7'</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select className='w-[102px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.type || ''}
                                                                onChange={(e) => updateDoorData(floorIndex, rowIndex, 'type', e.target.value)}
                                                            >
                                                                <option value=''>Select Type</option>
                                                                <option>Casement</option>
                                                                <option>Fixed</option>
                                                                <option>Slidling</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select className='w-[65px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.openDirection || ''}
                                                                onChange={(e) => updateDoorData(floorIndex, rowIndex, 'openDirection', e.target.value)}
                                                            >
                                                                <option value=''>Select ..</option>
                                                                <option>Left</option>
                                                                <option>Right</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select className='w-[103px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.material || ''}
                                                                onChange={(e) => updateDoorData(floorIndex, rowIndex, 'material', e.target.value)}
                                                            >
                                                                <option value=''>Select Material</option>
                                                                <option>Wood</option>
                                                                <option>UPVC</option>
                                                                <option>Aluminium</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select className='w-[103px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.shutterType || ''}
                                                                onChange={(e) => updateDoorData(floorIndex, rowIndex, 'shutterType', e.target.value)}
                                                            >
                                                                <option value=''>Select Type</option>
                                                                <option>Full Size</option>
                                                                <option>Half Size</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select className='w-[92px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.grill || ''}
                                                                onChange={(e) => updateDoorData(floorIndex, rowIndex, 'grill', e.target.value)}
                                                            >
                                                                <option value=''>Select Grill</option>
                                                                <option>Inbuild</option>
                                                                <option>No</option>
                                                                <option>Separate</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select className='w-[88px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.panel || ''}
                                                                onChange={(e) => updateDoorData(floorIndex, rowIndex, 'panel', e.target.value)}
                                                            >
                                                                <option value=''>Select Panel</option>
                                                                <option>W Glass</option>
                                                                <option>Wood</option>
                                                                <option>B Glass</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select className='w-[88px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.finish || ''}
                                                                onChange={(e) => updateDoorData(floorIndex, rowIndex, 'finish', e.target.value)}
                                                            >
                                                                <option value=''>Select Finish</option>
                                                                <option>W Paint</option>
                                                                <option>Wal Polish</option>
                                                                <option>B Paint</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select className='w-[88px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.lock || ''}
                                                                onChange={(e) => updateDoorData(floorIndex, rowIndex, 'lock', e.target.value)}
                                                            >
                                                                <option value=''>Select Lock</option>
                                                                <option>Mortise</option>
                                                                <option>No</option>
                                                                <option>Rim</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select className='w-[65px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.hardware || ''}
                                                                onChange={(e) => updateDoorData(floorIndex, rowIndex, 'hardware', e.target.value)}
                                                            >
                                                                <option value=''>Select Hardware</option>
                                                                <option>SS</option>
                                                                <option>PC</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input
                                                                className='w-[32px] h-[27px] focus:outline-none border bg-transparent border-transparent hover:border-opacity-[0.17] hover:border-[#707070] rounded mt-2'
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.quantity || ''}
                                                                onChange={(e) => updateDoorData(floorIndex, rowIndex, 'quantity', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                className='w-[55px] h-[27px] focus:outline-none border bg-transparent border-transparent hover:border-opacity-[0.17] hover:border-[#707070] rounded'
                                                                readOnly
                                                                placeholder="Total area"
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.totalArea || ''}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                className='w-[44px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                placeholder='Rate'
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.rate || ''}
                                                                onChange={(e) => updateDoorData(floorIndex, rowIndex, 'rate', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                className='w-[65px] h-[27px] border bg-[#F2F2F2] border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                readOnly
                                                                placeholder='Amount'
                                                                value={doorData[floorIndex]?.rows?.[rowIndex]?.amount || ''}
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
                                className="text-red-500 mt-5 border-dashed border-b-2 border-[#BF9853] font-semibold text-base lg:mr-[1660px] mr-80"
                                onClick={addFloor}
                            >
                                + Add Floor
                            </button>
                            <div className=" buttons mt-3 lg:ml-8 gap-5 items-center lg:flex grid grid-cols-2">
                                <div>
                                    <button className="w-[143px] h-[35px] bg-[#007233] rounded-md text-white text-sm">Engineer Copy</button>
                                </div>
                                <div>
                                    <button className="w-[133px] h-[35px] text-white bg-[#BF9853] rounded-md text-sm">Generate Bill</button>
                                </div>
                                <div className="lg:ml-[1200px]">
                                    <button className="w-[135px] h-[35px] text-white bg-[#BF9853] rounded">Submit</button>
                                </div>
                            </div>
                            <div className="lg:w-[1654px] mt-7">
                                <div className="flex justify-between mb-2 ml-8">
                                    <h2 className="font-bold text-lg">Door Summary</h2>
                                    <div className="flex items-center gap-3">
                                        <label className="font-semibold">Wastage:</label>
                                        <select className="border-2 border-[#BF9853] border-opacity-[0.17] focus:outline-none px-2 py-1 rounded-md w-[59px] h-[31px] text-center">
                                            {Array.from({ length: 15 }, (_, i) => (
                                                <option key={i + 1} value={`${i + 1}%`}>{i + 1}%</option>
                                            ))}
                                        </select>
                                        <button className="text-red-600 font-semibold flex items-center cursor-default hover:underline mr-[-15px]">
                                            Export PDF
                                        </button>
                                    </div>
                                </div>
                                <div className='ml-7'>
                                    <div className="border-l-8 border-l-[#BF9853] rounded-lg overflow-auto">
                                        <table className="lg:w-[1654px] h-[48px] border-collapse ">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w-20 text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="w-28 text-left  align-middle" rowSpan="2">Floor Name</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Room Name</th>
                                                    <th className="w- text-left  align-middle" rowSpan="2">Ref</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Size</th>
                                                    <th className="w- text-center text-lg align-middle">Type</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Open Direction</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Material</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Shutter Type</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Grill</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Panel</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Finish</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Lock</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Hardware</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Qty</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Total Area(sqft)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Rate</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Total Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:w-[1654px] mt-10">
                                <div className="flex justify-between mb-2 ml-8">
                                    <h2 className="font-bold text-lg">Overall Summary</h2>
                                    <div className="flex items-center gap-3">
                                        <button className="text-red-600 font-semibold flex items-center cursor-default hover:underline mr-[-15px]">
                                            Export PDF
                                        </button>
                                    </div>
                                </div>
                                <div className='ml-7'>
                                    <div className="border-l-8 border-l-[#BF9853] rounded-lg overflow-auto">
                                        <table className="lg:w-[1654px] h-[48px] border-collapse ">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w-20 text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="w-28 text-left  align-middle" rowSpan="2">Floor Name</th>
                                                    <th className="w- text-left  align-middle" rowSpan="2">Ref</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Size</th>
                                                    <th className="w- text-center text-lg align-middle">Type</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Open Direction</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Material</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Shutter Type</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Grill</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Panel</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Finish</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Lock</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Hardware</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Qty</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Total Area(sqft)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Rate</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Total Amount</th>
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
                )}
                {activeTab === "gate" && (
                    <div>
                        <div className=" bg-white ml-5 lg:w-[1824px]">
                            <div className="lg:ml-[495px] flex gap-4">
                                <select className='w-[72px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[102px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[65px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[71px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[80px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[88px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                                <select className='w-[88px] h-[27px] mt-3 rounded border-opacity-[0.20] border border-[#707070]'></select>
                            </div>
                            <div className="ml-7 mt-5 border-l-8 border-l-[#BF9853] rounded-lg overflow-auto">
                                <table className="lg:w-[1654px] border-collapse">
                                    <thead>
                                        <tr className="bg-[#FAF6ED] gap-5">
                                            <th className="w-48 text-left p-3 align-middle" rowSpan="2">Description</th>
                                            <th className="w- text-center  align-middle" rowSpan="2">Ref</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Size</th>
                                            <th className="w- text-center text-lg align-middle">Type</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Open Direction</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Material</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Door Type</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Panel</th>
                                            <th className="w- text-center align-middle" rowSpan="2">Finish</th>
                                            <th className="w-28 text-center align-middle" rowSpan="2">Qty</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Total Area(sqft)</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Rate</th>
                                            <th className="w-20 text-center align-middle" rowSpan="2">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gateFloors.map((floor, floorIndex) => (
                                            <React.Fragment key={floorIndex}>
                                                <tr className="font-semibold bg-gray-50">
                                                    <td colSpan="17" className="py-2">
                                                        <div className="flex items-center">
                                                            <span className="ml-3">{floorIndex + 1}.</span>
                                                            <select
                                                                className="rounded px-2 py-1 bg-transparent font-semibold focus:outline-none w-[120px]"
                                                                value={floor.floorName}
                                                                onChange={(e) => {
                                                                    const selectedFloorName = e.target.value;
                                                                    setGateFloors((prevFloors) => {
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
                                                    <tr key={row.id} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}`}>
                                                        <td>
                                                            <div className="flex group ml-8">
                                                                <select defaultValue='Select Room' className='w-[100px] h-[27px] bg-transparent border border-transparent focus:outline-none hover:border-opacity-[0.17] hover:border-[#707070] rounded mt-2'
                                                                    value={gateData[floorIndex]?.rows?.[rowIndex]?.room || ''}
                                                                    onChange={(e) => updateGateData(floorIndex, rowIndex, 'room', e.target.value)}
                                                                >
                                                                    <option value='' disabled hidden>Select Room</option>
                                                                    <option>Hall</option>
                                                                    <option>Bed Room</option>
                                                                </select>
                                                                <div className="items-center gap-2 flex invisible group-hover:visible">
                                                                    <button onClick={() => addRow2(floorIndex)}>
                                                                        <img src={add} alt="add" className="w-4 h-4 ml-3" />
                                                                    </button>
                                                                    <button onClick={() => deleteRow2(floorIndex, rowIndex)}>
                                                                        <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className='text-center align-middle'>
                                                            <input className='w-[45px] h-[27px] bg-transparent border border-transparent focus:outline-none hover:border-opacity-[0.17] hover:border-[#707070] rounded' placeholder='Ref'
                                                                value={gateData[floorIndex]?.rows?.[rowIndex]?.ref || ''}
                                                                onChange={(e) => updateGateData(floorIndex, rowIndex, 'ref', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <select defaultValue='Select Size' className='w-[72px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={gateData[floorIndex]?.rows?.[rowIndex]?.size || ''}
                                                                onChange={(e) => updateGateData(floorIndex, rowIndex, 'size', e.target.value)}
                                                            >
                                                                <option value=''>Select Size</option>
                                                                <option>3'x4'</option>
                                                                <option>4'x4'</option>
                                                                <option>5'x6'</option>
                                                                <option>3'x7'</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select defaultValue='Select Type' className='w-[102px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={gateData[floorIndex]?.rows?.[rowIndex]?.type || ''}
                                                                onChange={(e) => updateGateData(floorIndex, rowIndex, 'type', e.target.value)}
                                                            >
                                                                <option value=''>Select Type</option>
                                                                <option>Shutter</option>
                                                                <option>Spring</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select defaultValue='Select ..' className='w-[65px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={gateData[floorIndex]?.rows?.[rowIndex]?.openDirection || ''}
                                                                onChange={(e) => updateGateData(floorIndex, rowIndex, 'openDirection', e.target.value)}
                                                            >
                                                                <option value=''>Select ..</option>
                                                                <option>Left</option>
                                                                <option>Right</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select defaultValue='Select Material' className='w-[103px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={gateData[floorIndex]?.rows?.[rowIndex]?.material || ''}
                                                                onChange={(e) => updateGateData(floorIndex, rowIndex, 'material', e.target.value)}
                                                            >
                                                                <option value=''>Select Material</option>
                                                                <option>MS</option>
                                                                <option>SS</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select defaultValue='Select Type' className='w-[103px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={gateData[floorIndex]?.rows?.[rowIndex]?.doortype || ''}
                                                                onChange={(e) => updateGateData(floorIndex, rowIndex, 'doortype', e.target.value)}
                                                            >
                                                                <option value=''>Select Type</option>
                                                                <option>Single</option>
                                                                <option>Double</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select defaultValue='Select Panel' className='w-[88px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={gateData[floorIndex]?.rows?.[rowIndex]?.panel || ''}
                                                                onChange={(e) => updateGateData(floorIndex, rowIndex, 'panel', e.target.value)}
                                                            >
                                                                <option value=''>Select Panel</option>
                                                                <option>ACP</option>
                                                                <option>MS Sheet</option>
                                                                <option>HPL</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select defaultValue='Select Finish' className='w-[88px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                value={gateData[floorIndex]?.rows?.[rowIndex]?.finish || ''}
                                                                onChange={(e) => updateGateData(floorIndex, rowIndex, 'finish', e.target.value)}
                                                            >
                                                                <option value=''>Select Finish</option>
                                                                <option>White Paint</option>
                                                                <option>Black Paint</option>
                                                            </select>
                                                        </td>

                                                        <td>
                                                            <input
                                                                className='w-[32px] h-[27px] focus:outline-none border bg-transparent border-transparent hover:border-opacity-[0.17] hover:border-[#707070] rounded mt-2'
                                                                value={gateData[floorIndex]?.rows?.[rowIndex]?.quantity || ''}
                                                                onChange={(e) => updateGateData(floorIndex, rowIndex, 'quantity', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                className='w-[55px] h-[27px] focus:outline-none border bg-transparent border-transparent hover:border-opacity-[0.17] hover:border-[#707070] rounded'
                                                                readOnly
                                                                placeholder="Total area"
                                                                value={gateData[floorIndex]?.rows?.[rowIndex]?.totalArea || ''}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                className='w-[44px] h-[27px] border bg-transparent border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                placeholder='Rate'
                                                                value={gateData[floorIndex]?.rows?.[rowIndex]?.rate || ''}
                                                                onChange={(e) => updateGateData(floorIndex, rowIndex, 'rate', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                className='w-[65px] h-[27px] border bg-[#F2F2F2] border-transparent hover:border-opacity-[0.17] focus:outline-none hover:border-[#707070] rounded mt-2'
                                                                readOnly
                                                                placeholder='Amount'
                                                                value={gateData[floorIndex]?.rows?.[rowIndex]?.amount || ''}
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
                                className="text-red-500 mt-5 border-dashed border-b-2 border-[#BF9853] font-semibold text-base lg:mr-[1660px] mr-80"
                                onClick={addFloor}
                            >
                                + Add Floor
                            </button>
                            <div className=" buttons mt-3 lg:ml-8 gap-5 items-center lg:flex grid grid-cols-2">
                                <div>
                                    <button className="w-[143px] h-[35px] bg-[#007233] rounded-md text-white text-sm">Engineer Copy</button>
                                </div>
                                <div>
                                    <button className="w-[133px] h-[35px] text-white bg-[#BF9853] rounded-md text-sm">Generate Bill</button>
                                </div>
                                <div className="lg:ml-[1200px]">
                                    <button className="w-[135px] h-[35px] text-white bg-[#BF9853] rounded">Submit</button>
                                </div>
                            </div>
                            <div className="lg:w-[1069px] mt-7">
                                <div className="flex justify-between mb-2 ml-8">
                                    <h2 className="font-bold text-lg">Gate Summary</h2>
                                    <div className="flex items-center gap-3">
                                        <label className="font-semibold">Wastage:</label>
                                        <select className="border-2 border-[#BF9853] border-opacity-[0.17] focus:outline-none px-2 py-1 rounded-md w-[59px] h-[31px] text-center">
                                            {Array.from({ length: 15 }, (_, i) => (
                                                <option key={i + 1} value={`${i + 1}%`}>{i + 1}%</option>
                                            ))}
                                        </select>
                                        <button className="text-red-600 font-semibold flex items-center cursor-default hover:underline lg:mr-[-15px]">
                                            Export PDF
                                        </button>
                                    </div>
                                </div>
                                <div className='ml-7'>
                                    <div className="border-l-8 border-l-[#BF9853] rounded-lg overflow-auto">
                                        <table className="lg:w-[1069px] h-[48px] border-collapse ">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w- text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="w-28 text-left  align-middle" rowSpan="2">Floor Name</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Room Name</th>
                                                    <th className="w- text-left  align-middle" rowSpan="2">Ref</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Size</th>
                                                    <th className="w- text-center text-lg align-middle">Type</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Open Direction</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Material</th>
                                                    <th className="w-16 text-center align-middle" rowSpan="2">Door Type</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Panel</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Finish</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Qty</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Total Area(sqft)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Rate</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Total Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:w-[1009px] mt-14">
                                <div className="flex justify-between mb-2 ml-8">
                                    <h2 className="font-bold text-lg">Overall Summary</h2>
                                    <div className="flex items-center gap-3">
                                        <button className="text-red-600 font-semibold flex items-center cursor-default hover:underline lg:mr-[-15px]">
                                            Export PDF
                                        </button>
                                    </div>
                                </div>
                                <div className='ml-7 mb-3'>
                                    <div className="border-l-8 border-l-[#BF9853] rounded-lg overflow-auto">
                                        <table className="lg:w-[1009px] h-[48px] border-collapse ">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w-20 text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="w-28 text-left  align-middle" rowSpan="2">Floor Name</th>
                                                    <th className="w- text-left  align-middle" rowSpan="2">Ref</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Size</th>
                                                    <th className="w- text-center text-lg align-middle">Type</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Open Direction</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Material</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Door Type</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Panel</th>
                                                    <th className="w- text-center align-middle" rowSpan="2">Finish</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Qty</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Total Area(sqft)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Rate</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Total Amount</th>
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
                )}
                {activeTab === "timberboq" && (
                    <div>
                        <div className=" bg-white ml-5 lg:w-[1824px]">
                            <div className=" lg:flex items-start">
                                <div className="lg:w-[685px] lg:mt-5 ml-7 border-l-8 border-l-[#BF9853] rounded-lg overflow-auto"> {/* This only moves the table inside */}
                                    <table className="lg:w-full border-collapse mt-5">
                                        <thead>
                                            <tr className="bg-[#FAF6ED] gap-5">
                                                <th className="w-14 text-left p-3 align-middle" rowSpan="2">Floor</th>
                                                <th className="text-center align-middle" rowSpan="2">Room</th>
                                                <th className="text-center align-middle" rowSpan="2">Ref</th>
                                                <th className="text-center align-middle" rowSpan="2">Size</th>
                                                <th className="w-24 text-center text-lg align-middle">Type</th>
                                                <th className="w-20 text-center align-middle" rowSpan="2">Open Direction</th>
                                                <th className=" text-center align-middle" rowSpan="2">Shutter Type</th>
                                                <th className="text-center align-middle" rowSpan="2">Panel</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...windowData, ...doorData].map((floorData, floorIndex) =>
                                                floorData.rows?.filter((row) => row.panel === 'Wood').map((rowData, rowIndex) => (
                                                    <tr key={`${floorIndex}-${rowIndex}`} className="border-b text-center text-sm">
                                                        <td className="text-left p-3 w-28">{rowData.floor || ''}</td>
                                                        <td>{rowData.room || '-'}</td>
                                                        <td><button>{rowData.ref || '-'}</button></td>
                                                        <td>{rowData.size || '-'}</td>
                                                        <td>{rowData.type || '-'}</td>
                                                        <td>{rowData.openDirection || '-'}</td>
                                                        <td>{rowData.shutterType || '-'}</td>
                                                        <td>{rowData.panel || '-'}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className=' flex flex-col'>
                                    <div className='flex items-center'>
                                        <button
                                            onClick={handleEditClick}
                                            className='w-[90px] flex items-center justify-center gap-3 lg:ml-[430px] ml-8 h-[33px] text-[#007233] bg-[#E5FEF0] rounded mt-7'
                                        >
                                            {isEditing ? 'Save' : 'Edit'}
                                            <img
                                                className='w-4'
                                                src={isEditing ? SaveIcon : Edit}
                                                alt={isEditing ? 'Save icon' : 'Edit icon'}
                                            />
                                        </button>
                                    </div>
                                    <div className="mt-2 lg:ml-14 ml-8 border-l-8 border-l-[#BF9853] rounded-lg overflow-auto"> {/* This only moves the table inside */}
                                        <table className="lg:w-[454px] border-collapse">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w-14 text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="text-center align-middle" rowSpan="2">Frame</th>
                                                    <th className="text-center align-middle" rowSpan="2">Size</th>
                                                    <th className="w-24 text-center  align-middle">Length</th>
                                                    <th className="w-20 text-center  align-middle" rowSpan="2">Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            </tbody>
                                        </table>
                                    </div>
                                    <button
                                        className="text-red-500 mt-5 border-dashed border-b-2 border-[#BF9853] font-semibold text-base lg:ml-[70px] ml-8 w-fit"
                                        onClick={addFloor}
                                    >
                                        + Add Floor
                                    </button>
                                    <div className="mt-5 lg:ml-14 ml-8 border-l-8 border-l-[#BF9853] rounded-lg overflow-auto"> {/* This only moves the table inside */}
                                        <table className="lg:w-[454px] border-collapse">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w-14 text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="text-center align-middle" rowSpan="2">Shutter</th>
                                                    <th className="text-center align-middle" rowSpan="2">Size</th>
                                                    <th className="w-24 text-center align-middle">Length</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="text-red-500 mt-5 border-dashed border-b-2 border-[#BF9853] font-semibold text-base lg:mr-44 mr-72"
                                onClick={addFloor}
                            >
                                + Add Floor
                            </button>
                            <div className=" buttons mt-3 ml-8 gap-5 items-center flex">
                                <div className="lg:ml-[1060px]">
                                    <button className="w-[135px] h-[35px] text-white bg-[#BF9853] rounded">Submit</button>
                                </div>
                            </div>
                            <div className="lg:w-[1069px] mt-7 mb-4">
                                <div className="flex justify-between mb-2 ml-8">
                                    <h2 className="font-bold text-lg">Overall Summary</h2>
                                </div>
                                <div className='ml-7'>
                                    <div className="border-l-8 border-l-[#BF9853] rounded-lg">
                                        <table className="w-[380px] h-[48px] border-collapse ">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w- text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Item</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Size</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Length</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Quantity</th>
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
                )}
                {activeTab === "glazingboq" && (
                    <div>
                        <div className=" bg-white ml-5 lg:w-[1824px]">
                            <div className=" lg:flex items-start">
                                <div className="lg:w-[685px] ml-7 border-l-8 border-l-[#BF9853] rounded-lg overflow-auto"> {/* This only moves the table inside */}
                                    <table className="lg:w-full border-collapse mt-5">
                                        <thead>
                                            <tr className="bg-[#FAF6ED] gap-5">
                                                <th className="w-14 text-left p-3 align-middle" rowSpan="2">Floor</th>
                                                <th className="text-center align-middle" rowSpan="2">Room</th>
                                                <th className="text-center align-middle" rowSpan="2">Ref</th>
                                                <th className="text-center align-middle" rowSpan="2">Size</th>
                                                <th className="w-24 text-center text-lg align-middle">Type</th>
                                                <th className="w-20 text-center align-middle" rowSpan="2">Open Direction</th>
                                                <th className=" text-center align-middle" rowSpan="2">Shutter Type</th>
                                                <th className="text-center align-middle" rowSpan="2">Panel</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...windowData, ...doorData].map((floorData, floorIndex) =>
                                                floorData.rows?.filter((rowData) => rowData.panel !== 'Wood').map((rowData, rowIndex) => (
                                                    <tr key={`${floorIndex}-${rowIndex}`} className="border-b text-center text-sm">
                                                        <td className="text-left p-3 w-28">{rowData.floor || ''}</td>
                                                        <td>{rowData.room || '-'}</td>
                                                        <td><button>{rowData.ref || '-'}</button></td>
                                                        <td>{rowData.size || '-'}</td>
                                                        <td>{rowData.type || '-'}</td>
                                                        <td>{rowData.openDirection || '-'}</td>
                                                        <td>{rowData.shutterType || '-'}</td>
                                                        <td>{rowData.panel || '-'}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className=' flex flex-col'>
                                    <div className='flex items-center'>
                                        <button
                                            onClick={handleEditClick1}
                                            className='w-[90px] flex items-center justify-center gap-3 lg:ml-[580px] ml-8 h-[33px] text-[#007233] bg-[#E5FEF0] rounded mt-7'
                                        >
                                            {isEditing1 ? 'Save' : 'Edit'}
                                            <img
                                                className='w-4'
                                                src={isEditing1 ? SaveIcon : Edit}
                                                alt={isEditing1 ? 'Save icon' : 'Edit icon'}
                                            />
                                        </button>
                                    </div>
                                    <div className="mt-2 lg:ml-14 ml-8 border-l-8 border-l-[#BF9853] rounded-lg overflow-auto"> {/* This only moves the table inside */}
                                        <table className="lg:w-[613px] border-collapse">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w-20 text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="w-32 text-left  align-middle" rowSpan="2">Glass Type</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Breadth (Inches)</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Length (Inches)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Qty</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Area (Sqmt)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Area (Sqft)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            </tbody>
                                        </table>
                                    </div>
                                    <button
                                        className="text-red-500 mt-5 border-dashed border-b-2 border-[#BF9853] font-semibold text-base lg:ml-[70px] ml-8 w-fit"
                                        onClick={addFloor}
                                    >
                                        + Add Floor
                                    </button>
                                </div>
                            </div>
                            <div className=" buttons mt-3 ml-8 gap-5 items-center flex">
                                <div className="lg:ml-[1220px]">
                                    <button className="w-[135px] h-[35px] text-white bg-[#BF9853] rounded">Submit</button>
                                </div>
                            </div>
                            <div className="lg:w-[1069px] mt-7 mb-4">
                                <div className="flex justify-between mb-2 ml-8">
                                    <h2 className="font-bold text-lg">Overall Summary</h2>
                                </div>
                                <div className='ml-7'>
                                    <div className="border-l-8 border-l-[#BF9853] rounded-lg overflow-auto">
                                        <table className="lg:w-[604px] h-[48px] border-collapse ">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w-20 text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="w-32 text-left  align-middle" rowSpan="2">Glass Type</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Breadth (Inches)</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Length (Inches)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Area (Sqmt)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Area (Sqft)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Qty</th>
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
                )}
                {activeTab === "grillboq" && (
                    <div>
                        <div className=" bg-white ml-5 lg:w-[1824px]">
                            <div className=" lg:flex items-start">
                                <div className="lg:*:w-[685px] ml-7 border-l-8 border-l-[#BF9853] rounded-lg overflow-auto"> {/* This only moves the table inside */}
                                    <table className="lg:w-full border-collapse mt-5">
                                        <thead>
                                            <tr className="bg-[#FAF6ED] gap-5">
                                                <th className="w-14 text-left p-3 align-middle" rowSpan="2">Floor</th>
                                                <th className="text-center align-middle" rowSpan="2">Room</th>
                                                <th className="text-center align-middle" rowSpan="2">Ref</th>
                                                <th className="text-center align-middle" rowSpan="2">Size</th>
                                                <th className="w-24 text-center text-lg align-middle">Type</th>
                                                <th className="w-20 text-center align-middle" rowSpan="2">Open Direction</th>
                                                <th className=" text-center align-middle" rowSpan="2">Shutter Type</th>
                                                <th className="text-center align-middle" rowSpan="2">Panel</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...windowData, ...doorData].map((floorData, floorIndex) =>
                                                floorData.rows
                                                    ?.filter((rowData) => rowData.grill !== 'No') // 🔥 Filter out "No" Grill rows
                                                    .map((rowData, rowIndex) => (
                                                        <tr key={`${floorIndex}-${rowIndex}`} className="border-b text-center text-sm">
                                                            <td className="text-left p-3 w-28">{rowData.floor || ''}</td>
                                                            <td>{rowData.room || '-'}</td>
                                                            <td><button>{rowData.ref || '-'}</button></td>
                                                            <td>{rowData.size || '-'}</td>
                                                            <td>{rowData.type || '-'}</td>
                                                            <td>{rowData.openDirection || '-'}</td>
                                                            <td>{rowData.shutterType || '-'}</td>
                                                            <td>{rowData.panel || '-'}</td>
                                                        </tr>
                                                    ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className=' flex flex-col'>
                                    <div className='flex items-center'>
                                        <button
                                            onClick={handleEditClick2}
                                            className='w-[90px] flex items-center justify-center gap-3 lg:ml-[580px] ml-8 h-[33px] text-[#007233] bg-[#E5FEF0] rounded mt-7'
                                        >
                                            {isEditing2 ? 'Save' : 'Edit'}
                                            <img
                                                className='w-4'
                                                src={isEditing2 ? SaveIcon : Edit}
                                                alt={isEditing2 ? 'Save icon' : 'Edit icon'}
                                            />
                                        </button>
                                    </div>
                                    <div className="mt-2 lg:ml-14 ml-8 border-l-8 border-l-[#BF9853] rounded-lg overflow-auto"> 
                                        <table className="lg:w-[613px] border-collapse">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w-20 text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="w-32 text-left  align-middle" rowSpan="2">Grill Type</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Breadth (Inches)</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Length (Inches)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Qty</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Area (Sqmt)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Area (Sqft)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            </tbody>
                                        </table>
                                    </div>
                                    <button
                                        className="text-red-500 mt-5 border-dashed border-b-2 border-[#BF9853] font-semibold text-base lg:ml-[70px] ml-8 w-fit"
                                        onClick={addFloor}
                                    >
                                        + Add Floor
                                    </button>
                                </div>
                            </div>
                            <div className=" buttons mt-3 ml-8 gap-5 items-center flex">
                                <div className="lg:ml-[1220px] ">
                                    <button className="w-[135px] h-[35px] text-white bg-[#BF9853] rounded">Submit</button>
                                </div>
                            </div>
                            <div className="lg:w-[1069px] mt-7 mb-4">
                                <div className="flex justify-between mb-2 ml-8">
                                    <h2 className="font-bold text-lg">Overall Summary</h2>
                                </div>
                                <div className='ml-7'>
                                    <div className="border-l-8 border-l-[#BF9853] rounded-lg">
                                        <table className="lg:w-[604px] h-[48px] border-collapse ">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w-20 text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="w-40 text-left  align-middle" rowSpan="2">Grill Type</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Breadth (Inches)</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Length (Inches)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Area (Sqmt)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Area (Sqft)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Qty</th>
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
                )}
                {activeTab === "gateboq" && (
                    <div>
                        <div className=" bg-white ml-5 lg:w-[1824px]">
                            <div className=" lg:flex items-start">
                                <div className="lg:w-[685px] ml-7 border-l-8 border-l-[#BF9853] rounded-lg overflow-auto"> {/* This only moves the table inside */}
                                    <table className="lg:w-full border-collapse mt-5">
                                        <thead>
                                            <tr className="bg-[#FAF6ED] gap-5">
                                                <th className="w-14 text-left p-3 align-middle" rowSpan="2">Floor</th>
                                                <th className="text-center align-middle" rowSpan="2">Room</th>
                                                <th className="text-center align-middle" rowSpan="2">Ref</th>
                                                <th className="text-center align-middle" rowSpan="2">Size</th>
                                                <th className="w-24 text-center text-lg align-middle">Type</th>
                                                <th className="w-20 text-center align-middle" rowSpan="2">Open Direction</th>
                                                <th className=" text-center align-middle" rowSpan="2">Shutter Type</th>
                                                <th className="text-center align-middle" rowSpan="2">Panel</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {gateData.map((floorData, floorIndex) =>
                                                floorData.rows?.map((rowData, rowIndex) => (
                                                    <tr key={`${floorIndex}-${rowIndex}`} className="border-b text-center text-sm">
                                                        <td className="text-left p-3 w-28">{rowData.floor || ''}</td>
                                                        <td>{rowData.room || '-'}</td>
                                                        <td><button>{rowData.ref || '-'}</button></td>
                                                        <td>{rowData.size || '-'}</td>
                                                        <td>{rowData.type || '-'}</td>
                                                        <td>{rowData.openDirection || '-'}</td>
                                                        <td>{rowData.doortype || '-'}</td>
                                                        <td>{rowData.panel || '-'}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className=' flex flex-col'>
                                    <div className='flex items-center'>
                                        <button
                                            onClick={handleEditClick3}
                                            className='w-[90px] flex items-center justify-center gap-3 lg:ml-[580px] ml-8 h-[33px] text-[#007233] bg-[#E5FEF0] rounded mt-7'
                                        >
                                            {isEditing3 ? 'Save' : 'Edit'}
                                            <img
                                                className='w-4'
                                                src={isEditing3 ? SaveIcon : Edit}
                                                alt={isEditing3 ? 'Save icon' : 'Edit icon'}
                                            />
                                        </button>
                                    </div>
                                    <div className="mt-2 lg:ml-14 ml-8 border-l-8 border-l-[#BF9853] rounded-lg overflow-auto"> {/* This only moves the table inside */}
                                        <table className="lg:w-[613px] border-collapse">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w-20 text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="w-32 text-left  align-middle" rowSpan="2">Gate Type</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Breadth (Inches)</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Length (Inches)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Qty</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Area (Sqmt)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Area (Sqft)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            </tbody>
                                        </table>
                                    </div>
                                    <button
                                        className="text-red-500 mt-5 border-dashed border-b-2 border-[#BF9853] font-semibold text-base lg:ml-[70px] ml-8 w-fit"
                                        onClick={addFloor}
                                    >
                                        + Add Floor
                                    </button>
                                </div>
                            </div>
                            <div className=" buttons mt-3 ml-8 gap-5 items-center flex">
                                <div className="lg:ml-[1220px]">
                                    <button className="w-[135px] h-[35px] text-white bg-[#BF9853] rounded">Submit</button>
                                </div>
                            </div>
                            <div className="lg:w-[1069px] mt-7 mb-4">
                                <div className="flex justify-between mb-2 ml-8">
                                    <h2 className="font-bold text-lg">Overall Summary</h2>
                                </div>
                                <div className='ml-7'>
                                    <div className="border-l-8 border-l-[#BF9853] rounded-lg">
                                        <table className="lg:w-[604px] h-[48px] border-collapse ">
                                            <thead>
                                                <tr className="bg-[#FAF6ED] gap-5">
                                                    <th className="w-20 text-left p-3 align-middle" rowSpan="2">S.No</th>
                                                    <th className="w-32 text-left  align-middle" rowSpan="2">Gate Type</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Breadth (Inches)</th>
                                                    <th className="w-20 text-left  align-middle" rowSpan="2">Length (Inches)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Area (Sqmt)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Area (Sqft)</th>
                                                    <th className="w-20 text-center align-middle" rowSpan="2">Qty</th>
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
                )}
            </div>
        </body >
    )
}

export default CarpentryCalculator
