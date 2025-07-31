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
import rightarrow from '../Images/right.png'
import cross from '../Images/cross.png';
import { evaluate } from "mathjs";


const SwitchMatrix = () => {
  const [clientName, setClientName] = useState(null);
  const [clientSNo, setClientSNo] = useState("");
  const openImportPopup = () => setIsImportPopup(true);
  const [siteOptions, setSiteOptions] = useState([]);
  const [fileOptions, setFileOptions] = useState([]);
  const [filteredFileOptions, setFilteredFileOptions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedClientData, setSelectedClientData] = useState({});
  const [isImportPopup, setIsImportPopup] = useState(false);
  const [activeTab, setActiveTab] = useState("formwork");
  const [rateLabel, setRateLabel] = useState("Rate (sqft)");
  const [selectedOptions, setSelectedOptions] = useState(new Set());
  const [floorOptions, setFloorOptions] = useState([]);
  const [beamNames, setBeamNames] = useState([]);
  const [calculatedWeight, setCalculatedWeight] = useState("");
  const [beamData, setBeamData] = useState([]);
  const [rccBeamTypes, setRccBeamTypes] = useState([]);
  const [deductionPopupState, setDeductionPopupState] = useState({});

  const [rows, setRows] = useState([
    { tileName: "", size: "", qtyPerBox: "", numberOfBoxes: "" },
  ]);
  const [floors, setFloors] = useState([
    {
      floorName: "Ground Floor",
      areaName: "",
      tiles: [
        { type: "Floor Tile", length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" },
      ],
    },
  ]);
  const [floorss, setFloorss] = useState([
    {
      floorName: "Ground Floor",
      areaName: "",
      tiles: [
        {
          type: "",
          reference: "",
          module: "",
          switch: "",
          socket: "",
          accessories: "",
          blankplate: "",
          balance: "",
          breaker: "",
        },
      ],
    },
  ]);
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
          tile.area = evaluate(formulaWithValues).toFixed(2);
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

        return { ...tile, areaName: selectedAreaName };
      });

      return updatedFloors;
    });
  };
  const addAreaRow = (floorIndex) => {
    const updatedFloors = [...floorss];
    updatedFloors.splice(floorIndex + 1, 0, {
      floorName: null,
      areaName: "",
      tiles: [
        { type: "", length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" },
      ],
    });
    setFloorss(updatedFloors);
  };
  const addFloorRow = () => {
    setFloorss((prevFloors) => [
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
  const deleteAreaRow = (floorIndex) => {
    const updatedFloors = [...floorss];
    updatedFloors.splice(floorIndex, 1);
    setFloorss(updatedFloors);
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
  const sortedSiteOptions = siteOptions.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
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
  const addNewRowAfter = (floorIndex, tileIndex) => {
    const newTile = {
      type: '',
      length: '',
      breadth: '',
      height: '',
      deductionArea: '',
      wastagePercentage: '0',
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
  const getFilteredBeamTypes = (selectedArea) => {
    if (!selectedArea) return [];
    return rccBeamTypes.filter((item) => item.beamName === selectedArea);
  };
  const [typeSizes, setTypeSizes] = useState({
    'RB 01': '',
    'RB 02': '',
    'RB 03': '',
    'RB 04': '',
    'RB 05': '',
  });
  const handleInputChange = (floorIndex, tileIndex, field, value) => {
    setFloorss((prev) => {
      const updatedFloors = [...prev];
      const tile = updatedFloors[floorIndex].tiles[tileIndex];
      const selectedAreaName = updatedFloors[floorIndex].areaName;
      const matchingBeam = beamData.find((beam) => beam.beamName === selectedAreaName);

      const typeToWeightFactor = {
        "8MM": 150,
        "10MM": 200,
        "12MM": 250,
        "16MM": 500,
        "25MM": 750,
        "32MM": 1000,
      };

      if (field === "type") {

        tile.type = value;
        const newType = value;

        let existingSize =
          updatedFloors[floorIndex].tiles.find((t) => t.type === newType)?.size ||
          typeSizes[newType] ||
          "";

        const [height = "", breadth = ""] = existingSize.split("x").map((val) => val.trim());

        updatedFloors[floorIndex].tiles.forEach((t) => {
          if (t.type === newType) {
            t.size = existingSize;
            t.height = height.endsWith('"') ? height : `${height}"`;
            t.breadth = breadth.endsWith('"') ? breadth : `${breadth}"`;

            const L = convertToInches(t.length || "1'");
            const H = convertToInches(height);
            const B = convertToInches(breadth);
            const deduction = parseFloat(t.deductionArea) || 0;

            let formula = matchingBeam?.formula || "";
            let formulaWithValues = formula
              .replace(/L/g, L)
              .replace(/B/g, B)
              .replace(/H/g, H)
              .replace(/(\d+)\s*['"]/g, (_, inches) => `(${inches}/12)`)
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
          }
        });

        setTypeSizes((prevTypeSizes) => ({
          ...prevTypeSizes,
          [newType]: existingSize,
        }));
      } else if (field === "size") {
        const [height = "", breadth = ""] = value.split("x").map((val) => val.trim());
        const currentType = tile.type;

        updatedFloors[floorIndex].tiles.forEach((t) => {
          if (t.type === currentType) {
            t.size = value;
            t.height = height.endsWith('"') ? height : `${height}"`;
            t.breadth = breadth.endsWith('"') ? breadth : `${breadth}"`;

            const L = convertToInches(t.length || "1'");
            const H = convertToInches(height);
            const B = convertToInches(breadth);
            const deduction = parseFloat(t.deductionArea) || 0;

            let formula = matchingBeam?.formula || "";
            let formulaWithValues = formula
              .replace(/L/g, L)
              .replace(/B/g, B)
              .replace(/H/g, H)
              .replace(/(\d+)\s*['"]/g, (_, inches) => `(${inches}/12)`)
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
          }
        });

        setTypeSizes((prevTypeSizes) => ({
          ...prevTypeSizes,
          [currentType]: value,
        }));
      } else {
        tile[field] = value;
      }

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
  const addFloorRowInterior = () => {
    setFloorss((prevFloors) => [
      ...prevFloors,
      {
        floorName: "New Floor",
        areaName: "",
        tiles: [
          { type: "", length: "", breadth: "", height: "", deductionArea: "", wastagePercentage: "0" },
        ], // Only one new empty row
      },
    ]);
  };

  const [interiorFloors, setInteriorFloors] = useState([
    {
      floorName: "Ground Floor",
      areaName: "",
      tiles: [
        { type: "", reference: "", module: "", switch: "", socket: "", accessories: "", blankplate: "", balance: "", breaker: "" },
      ],
    },
  ]);
  let displayIndex = 1;
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "stockcheck") {
      setRateLabel("Rate (kg)");
    } else if (tab === "design") {
      setRateLabel("Rate (sqft)");
    } else {
      setRateLabel("");
    }
  };
  return (
    <body>
      <div className=" mx-auto p-6 border-collapse bg-[#FFFFFF] ml-6 mr-6 rounded-md">
        <div className=" flex">
          <div className=" flex">
            <div className="w-full -mt-8 mb-4">
              <h4 className=" mt-10 font-bold mb-2 lg:-ml-52 -ml-36">Project Name</h4>
              <Select
                value={clientName}
                onChange={handleSiteChange}
                options={sortedSiteOptions}
                placeholder="Select Site Name..."
                className="border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg lg:w-80 w-64 h-12 text-left"
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
          <div className="flex ml-[2%] mt-0">
            <button className="bg-[#007233] w-28 h-[36px] rounded-md text-white" onClick={openImportPopup}>+ Import</button>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <div className="mt-5">
          <div className="tabs flex ml-12 gap-5">
            <button
              className={`p-2 ${activeTab === "design"
                ? "font-bold text-lg border-b-2 border-[#DAA520]"
                : "font-semibold text-black"
                }`}
              onClick={() => handleTabChange("design")}>
              Design
            </button>
            <button
              className={`p-2 ${activeTab === "stockcheck"
                ? "font-bold text-lg border-b-2 border-[#DAA520]"
                : "font-semibold text-black"
                }`}
              onClick={() => handleTabChange("stockcheck")}>
              Stock Check
            </button>
          </div>
        </div>
      </div>
      <div className="content">
        {activeTab === "design" && (
          <div className=" p-6 bg-[#FFFFFF] ml-6 mr-6 rounded-lg">
            <div className="rounded-lg border-l-8 border-l-[#BF9853] flex -mt-3" id="full-table">
              <table className="table-auto w-full border-collapse">
                <thead>
                  <tr className="bg-[#FAF6ED]">
                    <th className="w-[150px] text-left pl-2 align-middle" rowSpan="2">Description</th>
                    <th className="w-[100px] text-left align-middle" rowSpan="2">Type</th>
                    <th className="w-[100px] text-center align-middle" rowSpan="2">Reference</th>
                    <th className="w-[120px] text-center align-middle" rowSpan="2">Module</th>

                    <th className="w-[250px] text-center border-l border-b border-[#BF9583] text-sm align-middle text-[#E4572E]" colSpan="5">Switch</th>
                    <th className="w-[180px] text-center border-l border-b border-[#BF9583] text-sm align-middle text-[#E4572E]" colSpan="3">Socket</th>
                    <th className="w-[150px] text-center border-l border-b border-r border-[#BF9583] text-sm align-middle text-[#E4572E]" colSpan="2">Accessories</th>

                    <th className="w-[40px] text-center align-middle" rowSpan="2">Blank Plate</th>
                    <th className="w-[120px] text-center align-middle" rowSpan="2">Balance</th>
                    <th className="w-[120px] text-center align-middle" rowSpan="2">Breaker</th>
                  </tr>

                  <tr className="bg-[#FAF6ED]">
                    {/* Switch Columns */}
                    <th className="w-[50px] text-center border-l border-[#BF9583]"><span className="text-lg">6A</span> <span className="text-sm font-semibold text-[#707070]">1Way</span></th>
                    <th className="w-[50px] text-center"><span className="text-lg">6A</span> <span className="text-sm font-semibold text-[#707070]">2Way</span></th>
                    <th className="w-[50px] text-center"><span className="text-lg">16A</span> <span className="text-sm font-semibold text-[#707070]">1Way</span></th>
                    <th className="w-[50px] text-center"><span className="text-lg">16A</span> <span className="text-sm font-semibold text-[#707070]">2Way</span></th>
                    <th className="w-[50px] border-r border-[#BF9583] text-center">Bell</th>

                    {/* Socket Columns */}
                    <th className="w-[60px] text-center">6A</th>
                    <th className="w-[20px] text-center">16A</th>
                    <th className="w-[40px] text-center">13A</th>

                    {/* Accessories Columns */}
                    <th className="w-[75px] border-l border-[#BF9583] text-center">Fan</th>
                    <th className="w-[70px] border-r border-[#BF9583] text-center">RJ 45</th>
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
                                className="w-[190px] p-1 rounded-lg bg-transparent focus:outline-none font-semibold"
                              >
                                <option value="" disabled>Select Floor..</option>
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
                            <td className="text-center px-2">
                              <select
                                className="w-[100px] h-[27px] focus:outline-gray-200 bg-transparent font-medium rounded-sm px-2 hover:border"
                              >
                                <option value="" hidden>
                                  Select Size
                                </option>
                                <option>Room Control</option>
                                <option>AC</option>
                                <option>Light Control</option>
                                <option>Bell</option>
                              </select>
                            </td>
                            <td className="px-1">
                              <select className="px-2 w-[150px] text-base font-medium h-[27px] bg-transparent hover:border focus:outline-none text-center">
                              <option value="" hidden>
                                  Select Module
                                </option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>6</option>
                                <option>8</option>
                                <option>10</option>
                              </select>
                            </td>
                            <td className="px-1 border-l border-[#BF9583]">
                              <input
                                type="text"
                                name="breadth"
                                className=" w-[32px] bg-transparent border focus:outline-none text-center"
                              />
                            </td>
                            <td className="px-1">
                              <input
                                type="text"
                                name="height"
                                className=" w-[32px] text-base font-medium  bg-transparent border focus:outline-none text-center"
                              />
                            </td>
                            <td className="px-1">
                              <div className=" pl-3 text-center font-medium">
                                <input className=" w-[32px] bg-transparent font-medium border focus:outline-none"></input>
                              </div>
                            </td>
                            <td className="px-1">
                              <input
                                type="text"
                                name="deductionArea"
                                className="w-[32px] bg-transparent font-medium border focus:outline-none" />
                            </td>
                            <td className="text-center px-1 border-r border-[#BF9583]">
                              <input
                                type="text"
                                className="w-[32px] bg-transparent font-medium text-center border focus:outline-none rounded-sm "
                              />
                            </td>
                            <td className="text-center px-1">
                              <input
                                type="text"
                                name="rate"
                                className="w-[32px] bg-transparent border focus:outline-none text-center"
                              />
                            </td>
                            <td className="text-center px-1">
                              <input
                                type="text"
                                className="w-[40px]  bg-transparent text-right font-medium border focus:outline-none rounded-sm "
                                value={tile.amount || ""}
                              />
                            </td>
                            <td className="border-r border-[#BF9583]">
                              <input className="w-[30px] bg-transparent focus:outline-none border"></input>
                            </td>
                            <td>
                              <input className="w-[30px] bg-transparent focus:outline-none border"></input>
                            </td>
                            <td className="border-r border-[#BF9583]">
                              <input className="w-[30px] bg-transparent focus:outline-none border"></input>
                            </td>
                            <td>
                              <input className="w-[30px] bg-transparent focus:outline-none border"></input>
                            </td>
                            <td>
                              <input className="w-[40px] bg-gray-200 focus:outline-none border"></input>
                            </td>
                            <td>
                              <select className="w-[80px] bg-transparent focus:outline-none hover:border">
                                <option hidden>Select...</option>
                                <option>6A</option>
                                <option>10A</option>
                                <option>16A</option>
                                <option>20A</option>
                                <option>32A</option>
                              </select>
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
              <button type="button" className="text-[#E4572E] mt-6 mb-20 lg:-ml-[95%] -ml-[13rem] border-dashed border-b-2 border-[#BF9853] font-semibold"
                onClick={addFloorRowInterior}>
                + Add Floor
              </button>
            </div>
            <div className=" buttons -mt-14 flex">
              <div className="">
                <button className="w-40 text-white px-4 py-2 rounded ml-0 bg-[#007233] hover:text-white transition duration-200 ease-in-out">
                  Engineer Copy
                </button>
              </div>
              <div>
                <button
                  className="bg-[#BF9853] text-white px-4 py-2 rounded w-40 h-10 ml-4"
                >
                  Generate Bill
                </button>
              </div>
              <div>
                <button
                  type="submit"
                  className="bg-[#BF9853] text-white px-6 py-2 rounded w-[129px]  ml-[1300px]"
                >
                  Submit
                </button>
              </div>
            </div>
            <div>
              <div>
                <h1 className="font-bold text-2xl mt-8 -ml-[89.5%]">Overall Summary</h1>
                <div className="rounded-lg border-l-8 border-l-[#BF9853] flex flex-col" id="full-table">
                  <table className="table-auto w-full border-collapse">
                    {/* First Header Row */}
                    <tr className="bg-[#FAF6ED]">
                      <th className="w-[40px] text-left pl-2" rowSpan="2">S.No</th>
                      <th className="w-[100px] text-center" rowSpan="2">Floor Name</th>
                      <th className="w-[100px] text-center" rowSpan="2">Room Name</th>

                      <th className="w-[180px] text-center border-l border-b border-[#BF9583] text-sm text-[#E4572E]" colSpan="5">Switch</th>
                      <th className="w-[100px] text-center border-l border-b border-[#BF9583] text-sm text-[#E4572E]" colSpan="3">Socket</th>
                      <th className="w-[100px] text-center border-l border-b border-r border-[#BF9583] text-sm text-[#E4572E]" colSpan="2">Accessories</th>
                      <th className="w-[100px] text-center border-l border-b border-r border-[#BF9583] text-sm text-[#E4572E]" colSpan="9">Module</th>
                      <th className="w-[130px] text-center border-l border-b border-r border-[#BF9583] text-sm text-[#E4572E]" colSpan="5">Breaker</th>
                      <th className="w-[40px] text-center" rowSpan="2">Blank Plate</th>
                    </tr>

                    {/* Second Header Row */}
                    <tr className="bg-[#FAF6ED]">
                      {/* Switch Columns */}
                      <th className="w-[40px] text-center border-l border-[#BF9583]"><span className="text-lg">6A</span> <span className="text-sm font-semibold text-[#707070]">1Way</span></th>
                      <th className="w-[40px] text-center"><span className="text-lg">6A</span> <span className="text-sm font-semibold text-[#707070]">2Way</span></th>
                      <th className="w-[40px] text-center"><span className="text-lg">16A</span> <span className="text-sm font-semibold text-[#707070]">1Way</span></th>
                      <th className="w-[40px] text-center"><span className="text-lg">16A</span> <span className="text-sm font-semibold text-[#707070]">2Way</span></th>
                      <th className="w-[40px] border-r border-[#BF9583] text-center">Bell</th>

                      {/* Socket Columns */}
                      {/* Socket Columns */}
                      <th className="w-[30px] text-center"><span className="text-lg">6A</span> <span className="text-sm font-semibold text-[#707070]">Soc</span></th>
                      <th className="w-[30px] text-center"><span className="text-lg">16A</span> <span className="text-sm font-semibold text-[#707070]">Soc</span></th>
                      <th className="w-[30px] text-center"><span className="text-lg">13A</span> <span className="text-sm font-semibold text-[#707070]">Soc</span></th>


                      {/* Accessories Columns */}
                      <th className="w-[30px] border-l border-[#BF9583] text-center">Fan</th>
                      <th className="w-[30px] border-r border-[#BF9583] text-center">RJ45</th>

                      {/* Module Columns */}
                      <th className="w-[30px] text-center">2M</th>
                      <th className="w-[30px] text-center">3M</th>
                      <th className="w-[30px] text-center">4M</th>
                      <th className="w-[30px] text-center">6M</th>
                      <th className="w-[30px] text-center">8M</th>
                      <th className="w-[30px] text-center">9M</th>
                      <th className="w-[30px] text-center">12M</th>
                      <th className="w-[30px] text-center">16M</th>
                      <th className="w-[30px] border-r border-[#BF9583] text-center">18M</th>

                      {/* Breaker Columns */}
                      <th className="w-[40px] text-center">6A</th>
                      <th className="w-[40px] text-center">10A</th>
                      <th className="w-[40px] text-center">16A</th>
                      <th className="w-[40px] text-center">20A</th>
                      <th className="w-[40px] border-r border-[#BF9583] text-center">32A</th>
                    </tr>
                  </table>
                </div>
                <div className="mt-10  ml-[280px] flex">
                  <div className="w-full flex rounded h-12 border-2 border-opacity-60 border-[#BF9583]">
                    <h1 className="text-lg w-[80px] gap-3 pl-4 py-2 font-semibold">Total</h1>
                    <input className=" w-[65px] ml-8 focus:outline-none pl-2 border-l-2 border-r-2 border-opacity-60 border-[#BF9583]" readOnly>
                    </input>
                    <input className="focus:outline-none w-[53px] pl-2 border-r-2 border-opacity-60 border-[#BF9583]" readOnly>
                    </input>
                    <input className="w-[65px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[65px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[65px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[50px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[53px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[70px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[70px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-r-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                    <input className="w-[55px] pl-2 border-opacity-60 border-[#BF9583] focus:outline-none" readOnly>
                    </input>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
        }
      </div >
    </body>
  )
}

export default SwitchMatrix
