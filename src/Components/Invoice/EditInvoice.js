import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import add from '../Images/Right.svg'
import delt from '../Images/Worng.svg';
import delet from '../Images/Delete.svg'

const descriptions = [
  { value: 'Masonry Works', label: 'Masonry Works' },
  { value: 'Tilina Works', label: 'Tilina Works' },
  { value: 'Metal Works', label: 'Metal Works' },
];
const subItems = [
  { value: 'Cement Flooring-First Floor', label: 'Cement Flooring-First Floor' },
  { value: 'GF Veranda Floor Tile', label: 'GF Veranda Floor Tile' },
  { value: 'First Floor Bathroom Floor Tile', label: 'First Floor Bathroom Floor Tile' },
  { value: 'Terrace Roof Sheet', label: 'Terrace Roof Sheet' },
];
const units = [
  { value: '', label: 'Select...' },
  { value: 'SQFT', label: 'SQFT' },
  { value: 'CFT', label: 'CFT' },
  { value: 'L', label: 'L' },
  { value: 'M²', label: 'M²' },
  { value: 'M³', label: 'M³' },
  { value: 'NOS', label: 'NOS' },
  { value: 'Volume', label: 'Volume' },
  { value: 'L.S', label: 'L.S' },
];

const clients = [
  { value: 'Mr. Sivaraman', label: 'Mr. Sivaraman' },
  { value: 'Ms. Anjali', label: 'Ms. Anjali' },
  { value: 'Mr. Kumar', label: 'Mr. Kumar' },
  { value: 'Mr. Patel', label: 'Mr. Patel' },
];
const projectTypes = [
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Industrial', label: 'Industrial' },
];
function InvoiceTable() {
  const [inputValues, setInputValues] = useState({});
  const [selectedUnit, setSelectedUnit] = useState({});
  const [items, setItems] = useState([
    {
      description: 'Masonry Works',
      workType: 'Structural',
      subItems: [
        { description: 'Cement Flooring-First Floor' },
      ],
    },
  ]);

  const handleRemoveSubItem = (itemIndex, subItemIndex) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].subItems.splice(subItemIndex, 1);
    setItems(updatedItems);
  };
  const handleRateChange = (itemIndex, subItemIndex, rate) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      const subItem = updatedItems[itemIndex].subItems[subItemIndex];

      subItem.rate = rate;

      if (subItem.qty) {
        const qtyValue = parseFloat(subItem.qty) || 0; // Extract numerical qty value
        subItem.amount = (qtyValue * rate).toFixed(2);
      } else {
        subItem.amount = '';
      }

      return updatedItems;
    });
  };


  const handleSizeChange = (itemIndex, subItemIndex, sizeInput) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      const subItem = updatedItems[itemIndex].subItems[subItemIndex];

      const selectedUnit = subItem.unit?.value || 'SQFT';
      const xCount = (sizeInput.match(/x/g) || []).length;

      if (sizeInput) {
        // Calculate quantity based on size input and selected unit
        if (xCount === 1 && selectedUnit === 'SQFT') {
          const area = calculateArea(sizeInput);
          subItem.qty = area === 'Invalid size input' ? area : `${area} Sqft`;
        } else if ((xCount === 2 && selectedUnit === 'CFT') || (selectedUnit === 'L')) {
          const volume = selectedUnit === 'L'
            ? calculateLiters(sizeInput)
            : calculateVolume(sizeInput);
          subItem.qty = volume === 'Invalid size input'
            ? volume
            : `${volume} ${selectedUnit === 'L' ? 'L' : 'Cubic Feet'}`;
        } else {
          alert('Please select the correct unit !!!');
          subItem.qty = '';
        }
      } else {
        subItem.qty = 'Please enter a valid size input.';
      }

      // Calculate amount if rate is available
      if (subItem.qty && subItem.rate) {
        const qtyValue = parseFloat(subItem.qty) || 0; // Extract numerical qty value
        subItem.amount = (qtyValue * subItem.rate).toFixed(2);
      } else {
        subItem.amount = '';
      }

      return updatedItems;
    });
  };




  const getCalculatedQuantity = (itemIndex, subItemIndex) => {
    const subItem = items[itemIndex].subItems[subItemIndex];
    // Assuming quantity is a direct reflection of size, otherwise adapt this logic
    if (subItem.unit === "SQFT") {
      return parseFloat(subItem.sizeInput || 0) * parseFloat(subItem.rate || 1);
    }
    return subItem.sizeInput || ""; // Fallback if size doesn't need calculation
  };

  const getFinalCalculation = (itemIndex, subItemIndex) => {
    const size = inputValues[`${itemIndex}-${subItemIndex}`]?.size || '';
    const rate = inputValues[`${itemIndex}-${subItemIndex}`]?.rate || '';
    return size && rate ? size * rate : '';  // Only multiply if both size and rate are present
  };

  const handleInputChanges = (itemIndex, subItemIndex, value) => {
    setInputValues(prev => ({
      ...prev,
      [`${itemIndex}-${subItemIndex}`]: value
    }));
  };

  // Handling unit change in the 5th column
  const handleUnitChange = (itemIndex, subItemIndex, selectedOption) => {
    setSelectedUnit(prev => ({
      ...prev,
      [`${itemIndex}-${subItemIndex}`]: selectedOption
    }));
  };
  const handleInputChange = (e, itemIndex, subItemIndex) => {
    const { value } = e.target;
    const updatedItems = [...items];
    const subItem = updatedItems[itemIndex].subItems[subItemIndex];
    subItem.sizeInput = value;
    if (subItem.unit === "SQFT") {
      const dimensions = value.split('x').map(Number);
      if (dimensions.length === 2 && dimensions.every(Number.isFinite)) {
        subItem.qty = dimensions[0] * dimensions[1]; // Assuming `L x W`
      } else {
        subItem.qty = "";
      }
    } else if (subItem.unit === "Value" || subItem.unit === "L.S.") {
      subItem.qty = 1;
    } else {
      subItem.qty = "";
    }
    setItems(updatedItems);
  };
  const handleInputChangeForRow = (e, itemIndex, subItemIndex) => {
    const { value } = e.target;
    const updatedItems = [...items];
    updatedItems[itemIndex].subItems[subItemIndex].sizeInput = value;
    const subItem = updatedItems[itemIndex].subItems[subItemIndex];

    if (subItem.unit === "SQFT") {
      // Split input by '+' and initialize total quantity
      const dimensionGroups = value.split('+').map(dim => dim.trim());
      let totalQty = 0;
      let valid = true;

      console.log("Dimension Groups:", dimensionGroups); // Logging groups

      for (let group of dimensionGroups) {
        // Split each group by 'x', remove quotes, and parse as numbers
        const dimensions = group.split('x').map(num => parseFloat(num.replace("'", "").trim()));

        console.log("Parsed Dimensions for group", group, ":", dimensions); // Logging each parsed group

        if (dimensions.length === 2 && dimensions.every(Number.isFinite)) {
          totalQty += dimensions[0] * dimensions[1];
        } else {
          valid = false;
          break;
        }
      }

      // Only set the quantity if the input is valid
      if (valid) {
        subItem.qty = totalQty;
        console.log("Calculated Total Qty:", totalQty); // Logging the calculated total
      } else {
        subItem.qty = "";
        console.log("Invalid input detected. Qty set to empty."); // Logging invalid input
      }
    } else if (subItem.unit === "Value" || subItem.unit === "L.S.") {
      subItem.qty = 1;
      console.log("Unit is 'Value' or 'L.S.', setting qty to 1"); // Logging default quantity
    } else {
      subItem.qty = "";
      console.log("Unit is neither SQFT nor 'Value'/'L.S.', qty set to empty."); // Logging unhandled unit
    }

    setItems(updatedItems);
  };



  const [amountPaid, setAmountPaid] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const clientPhone = "9876543210";
  useEffect(() => {
    const generateInvoiceNumber = () => {
      let lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber') || 'INV20240000';
      const numericPart = parseInt(lastInvoiceNumber.replace('INV', ''), 10) + 1;
      const newInvoiceNumber = `INV${numericPart}`;
      localStorage.setItem('lastInvoiceNumber', newInvoiceNumber);
      setInvoiceNumber(prevNumber => prevNumber + 1);
    };
    generateInvoiceNumber();
  }, []);
  const getCalculatedValue = (itemIndex, subItemIndex) => {
    const input = inputValues[`${itemIndex}-${subItemIndex}`] || '';
    const unit = selectedUnit[`${itemIndex}-${subItemIndex}`]?.value;

    if (unit === 'Area') {
      return calculateArea(input);
    } else if (unit === 'Volume') {
      return calculateVolume(input);
    } else if (unit === 'Liters') {
      return calculateLiters(input);
    }
    return '';
  };
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        workType: '',
        subItems: [{ description: '', qty: '', rate: '', unit: '', amount: '' }],
      },
    ]);
  };
  const handleAddSubItem = (itemIndex) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].subItems.push({
      description: '',
      sizeInput: '',
      qty: '',
      rate: '',
      unit: '',
      amount: '',
    });
    setItems(updatedItems);
  };

  const handleDeleteSubItem = (itemIndex, subItemIndex) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].subItems = updatedItems[itemIndex].subItems.filter(
      (_, index) => index !== subItemIndex
    );
    setItems(updatedItems);
  };
  const totalAmount = items.reduce(
    (total, item) => total + item.subItems.reduce((subTotal, subItem) => subTotal + Number(subItem.amount || 0), 0),
    0
  );
  const amountDue = totalAmount - amountPaid;

  const convertToFeet = (dim) => {
    let feet = 0;
    let inches = 0;
    if (dim.includes("'") && dim.includes('"')) {
      const parts = dim.split("'"); // Separate feet and inches
      feet = parseFloat(parts[0].trim());
      inches = parseFloat(parts[1].replace('"', '').trim());
      return feet + (inches / 12); // Convert inches to feet and add to feet
    } else if (dim.includes("'")) {
      feet = parseFloat(dim.replace("'", '').trim());
      return feet;
    } else if (dim.includes('"')) {
      inches = parseFloat(dim.replace('"', '').trim());
      return inches / 12; // Convert inches to feet
    }
    return parseFloat(dim.trim());
  };
  // Function to calculate area in SQFT
const calculateArea = (input) => {
  input = input.replace(/''/g, '"');
  const dimensionGroups = input.split('+').map(dim => dim.trim()); // Split by '+'
  let totalArea = 0;

  // Convert dimension string to feet
  const convertToFeet = (dim) => {
    let feet = 0;
    let inches = 0;
    if (dim.includes("'") && dim.includes('"')) {
      const parts = dim.split("'"); // Separate feet and inches
      feet = parseFloat(parts[0].trim());
      inches = parseFloat(parts[1].replace('"', '').trim());
      return feet + (inches / 12); // Convert inches to feet and add to feet
    } else if (dim.includes("'")) {
      feet = parseFloat(dim.replace("'", '').trim());
      return feet;
    } else if (dim.includes('"')) {
      inches = parseFloat(dim.replace('"', '').trim());
      return inches / 12; // Convert inches to feet
    }
    return parseFloat(dim.trim());
  };

  dimensionGroups.forEach(group => {
    const arr = group.split('x').map(part => part.trim());
    if (arr.length === 2) {
      const length = convertToFeet(arr[0]);
      const width = convertToFeet(arr[1]);
      if (!isNaN(length) && !isNaN(width)) {
        totalArea += length * width;
      }
    }
  });

  return totalArea.toFixed(2); // Return total area rounded to two decimals
};

// Function to calculate volume in cubic feet
const calculateVolume = (input) => {
  input = input.replace(/''/g, '"');
  const dimensionGroups = input.split('+').map(dim => dim.trim());
  let totalVolume = 0;

  dimensionGroups.forEach(group => {
    const arr = group.split('x').map(part => part.trim());
    if (arr.length === 3) {
      const length = convertToFeet(arr[0]);
      const width = convertToFeet(arr[1]);
      const height = convertToFeet(arr[2]);
      if (!isNaN(length) && !isNaN(width) && !isNaN(height)) {
        totalVolume += length * width * height;
      }
    }
  });

  return totalVolume.toFixed(2);
};

// Function to calculate volume in liters (converting cubic feet to liters)
const calculateLiters = (input) => {
  const volumeInCubicFeet = parseFloat(calculateVolume(input));
  const volumeInLiters = volumeInCubicFeet * 28.3168; // Conversion factor from cubic feet to liters
  return volumeInLiters.toFixed(2);
};

// The handleSubItemChange function
const handleSubItemChange = (itemIndex, subItemIndex, field, value) => {
  const updatedItems = [...items]; // Clone the items array
  const subItem = updatedItems[itemIndex].subItems[subItemIndex];
  
  if (field === 'unit') {
    subItem.unit = value; // Update unit
  } else if (field === 'rate') {
    subItem.rate = parseFloat(value) || 0;
  } else if (field === 'amount') {
    subItem.amount = parseFloat(value) || 0;
  }
  
  const sizeInput = subItem.sizeInput;
  const selectedUnit = subItem.unit?.value || 'SQFT';
  
  if (sizeInput) {
    const xCount = (sizeInput.match(/x/g) || []).length;

    if (selectedUnit === 'SQFT') {
      const area = calculateArea(sizeInput);
      subItem.qty = area === 'Invalid size input' ? area : `${area} Sqft`;
    } else if (selectedUnit === 'CFT') {
      const volume = calculateVolume(sizeInput);
      subItem.qty = volume === 'Invalid size input' ? volume : `${volume} Cubic Feet`;
    } else if (selectedUnit === 'L') {
      const liters = calculateLiters(sizeInput);
      subItem.qty = liters === 'Invalid size input' ? liters : `${liters} L`;
    } else {
      alert('Please select the correct unit!');
      subItem.qty = '';
    }
  } else {
    subItem.qty = 'Please enter a valid size input.';
  }

  if (subItem.qty && subItem.rate) {
    const qtyValue = parseFloat(subItem.qty) || 0; // Extract numerical qty value
    subItem.amount = (qtyValue * subItem.rate).toFixed(2); // Calculate amount
  } else {
    subItem.amount = '';
  }

  setItems(updatedItems);
};

  let displayIndex = 1;

  return (
    <body className='bg-[#FAF6ED]'>
      <div className="mx-auto p-4 " >
        <div className='-mt-3  flex'>
          <div className="flex ml-32 bg-white rounded-xl">
            <div className=" mt-5 ml-14 pr-4" style={{ width: "1050px" }}>
              <div className="rounded-lg border-l-8 border-l-[#BF9853] -ml-8">
                <table className="w-full max-w-screen-2xl overflow-x-scroll table-auto  min-w-full mb-4 ">
                  <thead className='odd:bg-white even:bg-orange-100"' style={{ marginLeft: '-100px' }}>
                    <tr className="bg-[#FAF6ED] ">
                      <th className=" p-2" style={{ textAlign: 'left' }}>Description of Work</th>
                      <th className=" p-2" style={{ textAlign: 'left' }}>Size</th>
                      <th className=" p-2" style={{ textAlign: 'left' }}>Qty</th>
                      <th className=" p-2" style={{ textAlign: 'left' }}>Rate</th>
                      <th className=" p-2 w-3" style={{ textAlign: 'left' }}>Unit</th>
                      <th className=" p-2" style={{ textAlign: 'left' }}>Amount</th>
                      <th className=" p-2" style={{ textAlign: 'left' }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, itemIndex) => (
                      <React.Fragment key={itemIndex}>
                        {item.subItems.map((subItem, subItemIndex) => (
                          <>
                            {subItemIndex === 0 && (
                              <tr className="odd:bg-white even:bg-[#FAF6ED]">
                                <td className="border-none p-2">
                                  <div className="flex flex-col">
                                    <div className="flex items-center mb-2">
                                      <span className="mt-1">{displayIndex++}.</span>
                                      <CreatableSelect
                                        options={descriptions}
                                        value={item.description || ''}
                                        onChange={(value) => {
                                          const updatedItems = [...items];
                                          updatedItems[itemIndex].description = value || '';
                                          setItems(updatedItems);
                                        }}
                                        className="w-52 font-semibold text-left"
                                        styles={{
                                          control: (base, state) => ({
                                            ...base,
                                            backgroundColor: 'transparent',
                                            border: state.isFocused ? '1px solid ' : '1px solid transparent',
                                            boxShadow: state.isFocused ? '0 0 0 1px ' : 'none',
                                            '&:hover': {
                                              border: '1px solid ',
                                            },
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
                                          input: (base) => ({
                                            ...base,
                                            textAlign: 'left',
                                          }),
                                        }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="border-none mt-0">
                                  <input
                                    type="text"
                                    value={subItem.sizeInput || ''}
                                    onChange={(e) => handleInputChangeForRow(e, itemIndex, subItemIndex)}
                                    className="w-full border-transparent hover:border hover:border-gray-400 -ml-3"
                                    style={{ width: '80px', height: '40px' }}
                                  />
                                </td>
                                <td className="border-none p-2">
                                  <input
                                    type="text"
                                    value={subItem.qty}
                                    readOnly
                                    className="w-full p-2 border-transparent hover:border hover:border-gray-400 bg-transparent"
                                  />
                                </td>
                                <td className="border-none p-2">
                                  <input
                                    type="number"
                                    value={subItem.rate}
                                    onChange={(e) =>
                                      handleSubItemChange(itemIndex, subItemIndex, 'rate', e.target.value)
                                    }
                                    className="w-full h-10 border-transparent hover:border hover:border-gray-400"
                                  />
                                </td>
                                <td className="border-none p-2">
                                  <Select
                                    options={units}
                                    value={subItem.unit}
                                    onChange={(value) =>
                                      handleSubItemChange(itemIndex, subItemIndex, 'unit', value)
                                    }
                                    className="w-full"
                                    styles={{
                                      control: (base) => ({
                                        ...base,
                                        backgroundColor: 'transparent',
                                        border: '',
                                        boxShadow: '',
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
                                        textAlign: 'left',
                                      }),
                                      input: (base) => ({
                                        ...base,
                                        textAlign: 'left', // Align input text to the left
                                      }),
                                    }}
                                  />
                                </td>
                                <td className="border-none p-2">
                                  <input
                                    type="text"
                                    value={subItem.amount?.value || subItem.amount || ""}
                                    onChange={(e) =>
                                      handleSubItemChange(itemIndex, subItemIndex, 'amount', e.target.value)
                                    }
                                    className="w-full p-2 border-transparent hover:border hover:border-gray-400"
                                  />
                                </td>
                                <td className="border-gray-300 p-2">
                                  <button
                                    className="text-white font-bold py-1 px-2 rounded"
                                    onClick={() => handleDeleteSubItem(itemIndex, subItemIndex)}
                                  >
                                    <img className="w-3" src={delet} alt="delete"></img>
                                  </button>
                                </td>
                              </tr>
                            )}
                            <tr className="odd:bg-white even:bg-[#FAF6ED]">
                              <td>
                                <div className="flex items-center space-x-2 gap-0 group">
                                  <CreatableSelect
                                    options={subItems}
                                    value={subItem.subItems}
                                    className="w-96 ml-8 font-medium text-left"
                                    styles={{
                                      control: (base, state) => ({
                                        ...base,
                                        backgroundColor: 'transparent',
                                        border: state.isFocused ? '1px solid ' : '1px solid transparent',
                                        boxShadow: state.isFocused ? '0 0 0 1px ' : 'none',
                                        '&:hover': {
                                          border: '1px solid ',
                                        },
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
                                      }),
                                    }}
                                  />
                                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                      className=" font-normal rounded-full"
                                      onClick={() => handleAddSubItem(itemIndex)}
                                    >
                                      <img
                                        src={add}
                                        alt="Add"
                                        className="w-6 h-6"
                                      />
                                    </button>
                                    <button
                                      className=" font-normal py-1 px-2 rounded-full"
                                      onClick={() => handleRemoveSubItem(itemIndex, subItemIndex)}
                                    >
                                      <img
                                        src={delt}
                                        alt="Delete"
                                        className="w-6 h-6"
                                      />
                                    </button>
                                  </div>
                                </div>

                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={inputValues['0-0']?.size || ''}
                                  onChange={(e) => handleSizeChange(0, 0, e.target.value)}
                                  className="w-full  bg-transparent border-transparent hover:border hover:border-gray-400"
                                  style={{ height: '40px' }}
                                />
                              </td>
                              <td className="border-none p-2">
                                <input
                                  type="text"
                                  value={subItem.qty}
                                  readOnly
                                  className="w-full p-2 border-transparent hover:border hover:border-gray-400 bg-transparent"
                                  style={{ height: '40px' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={inputValues['0-0']?.rate || ''}
                                  onChange={(e) => handleRateChange(0, 0, e.target.value)}
                                  className="w-full border-transparent hover:border hover:border-gray-400 bg-transparent"
                                  style={{ height: '40px' }}
                                />
                              </td>
                              <td className="border-none p-2">
                                <Select
                                  options={units}
                                  className="w-full"
                                  onChange={(selectedOption) => handleUnitChange(itemIndex, subItemIndex, selectedOption)}
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      backgroundColor: 'transparent',
                                      border: '',
                                      boxShadow: '',
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
                                    }),
                                  }}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={getFinalCalculation(0, 0)}
                                  readOnly
                                  className="w-full border-transparent hover:border hover:border-gray-400 bg-transparent"
                                  style={{ height: '40px' }}
                                />
                              </td>
                              <td></td>
                            </tr>

                          </>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>

                </table>
                <div className='bg-[#FAF6ED]'>
                  <button
                    className="text-[#E4572E] font-semibold rounded mb-4 border-dashed border-b-2 border-[#BF9853] -ml-[60rem]"
                    onClick={handleAddItem}
                  >
                    + Add Item
                  </button>
                </div>
              </div>
              <div className="flex justify-between mb-4">
                <div className="mt-16">
                  <h1 className="text-lg font-bold -mt-10" style={{ marginLeft: '-650px' }}>Notes</h1>

                  <input
                    type="text"
                    className="p-2 border mb-4 h-11 rounded-md -ml-[5rem]"
                    style={{ width: '620px' }}
                  />

                  <input
                    type="text"
                    className="p-1 border mb-4 h-9 rounded-md -ml-[5rem]"
                    style={{ width: '620px' }}
                    placeholder="Terms & Conditions"
                  />

                  <input
                    type="text"
                    className="p-2 border mb-4 block h-11 rounded-md -ml-[1.5rem]"
                    style={{ width: '620px' }}
                    placeholder="Please make the payment by the due date."
                  />

                  <button className="bg-[#BF9853] text-white font-bold py-2 px-4 rounded -ml-[38.5rem]">
                    Submit
                  </button>
                </div>

                <div className="w-3/5 mt-10">
                  <div className="flex justify-between mb-2 bg-[#BF9853] py-4 px-6 rounded-lg h-14 border border-gray-300 text-white text-xl text-left font-semibold">
                    <span>Total </span>
                    <span>{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2 p-4 rounded-lg border border-gray-300 h-14 text-xl font-semibold">
                    <span>Amount Paid</span>
                    <input
                      type="text"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className=" p-2 w-20 h-8"
                      placeholder=""
                    />
                  </div>
                  <div className="flex justify-between text-xl font-semibold bg-gray-200 p-4  h-14 border border-gray-300 rounded-lg">
                    <span>Amount Due</span>
                    <span>{amountDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className=" ml-8 pr-4  bg-white rounded-xl" style={{ width: "350px" }}>
            <div className=" block p-4 ml-10">
              <div className=' block'>
                <div className="">
                  <div className="mb-4  block">
                    <label className="flex mb-1 -ml-10 font-semibold">Date</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className=" w-64 p-2 h-10  border-[#FAF6ED] -ml-[5.5rem] rounded-lg" style={{ border: '2px solid #FAF6ED' }}
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block mb-1 -ml-[18rem] font-semibold">Invoice</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      readOnly
                      className="w-64  p-2 -ml-[5.5rem] border-2 border-[#FAF6ED] rounded-lg bg-gray-100"
                    />
                  </div>
                  <label className="block mb-2 mt-0 -ml-[15.5rem] font-semibold">Client Name</label>
                  <Select
                    options={clients}
                    value={clientName}
                    onChange={setClientName}
                    className=" w-64 h-10 -ml-[2.6rem] text-left"
                    placeholder="Select Client"
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: '2px solid #FAF6ED ',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        borderRadius: '8px',
                        textAlign: 'left',
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
              </div>
              <div className='block'>
                <div className="mb-4">
                  <label className="block mb-2 mt-3 -ml-[15rem] font-semibold">Project Type</label>
                  <Select
                    options={projectTypes}
                    value={projectType}
                    onChange={setProjectType}
                    className="flex h-10 -ml-[2.6rem] w-64 text-left" // Adjust width here if using className
                    placeholder="Select Project Type"
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: '2px solid #FAF6ED',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        borderRadius: '8px',
                        width: '320px',
                        textAlign: 'left',
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
              </div>
              <div className="mb-4">
                <label className="block mb-1 -ml-[13.8rem] font-semibold">Client Address:</label>
                <input
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-64 h-10 p-2 -ml-[5.5rem] border-2 border-[#FAF6ED] rounded-lg"
                  rows={3}
                  placeholder="Enter Client Address"
                ></input>
              </div>
              <h5 className='-ml-[14.5rem] font-semibold'>Client Phone:</h5>
              <div className="w-64 rounded-md p-2 block  border-2 border-[#FAF6ED] -ml-[2rem] bg-gray-100" style={{}}>
                <span className='-ml-32 '>{clientPhone}</span>
              </div>
            </div>
            <div className='-ml-10'>
              <button className="bg-green-700  text-white font-bold py-2 px-4 rounded ml-16 mt-5 block">
                Download / Print
              </button>
              <button className="bg-[#BF9853] text-white font-bold py-2 px-5 rounded -ml-[6.9rem] mt-5">
                Make a Copy
              </button>
              <button className="bg-[#E4572E] text-white font-bold py-2 px-4 rounded ml-16 block mt-5 mb-5">
                Save Online
              </button>

            </div>
          </div>
        </div>
      </div>
    </body>
  );
}
export default InvoiceTable;