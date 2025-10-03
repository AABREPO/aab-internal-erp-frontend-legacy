import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
  const [items, setItems] = useState([
    {
      description: 'Masonry Works',
      workType: 'Structural',
      subItems: [
        {
          description: 'Cement Flooring-First Floor',
          sizeInput: '',
          qty: '',
          rate: '',
          unit: '',
          amount: '',
          // Separate data for main row
          mainRow: {
            sizeInput: '',
            qty: '',
            rate: '',
            unit: '',
            amount: ''
          }
        },
      ],
    },
  ]);

  const handleRemoveSubItem = (itemIndex, subItemIndex) => {
    const updatedItems = [...items];
    updatedItems[itemIndex].subItems.splice(subItemIndex, 1);
    setItems(updatedItems);
  };
  const handleInputChangeForRow = (e, itemIndex, subItemIndex, isMainRow = false) => {
    const { value } = e.target;
    const updatedItems = [...items];
    const subItem = updatedItems[itemIndex].subItems[subItemIndex];
    // Helper function to safely parse quantity by removing unit suffixes
    const parseQty = (qtyStr) => {
      if (!qtyStr) return 0;
      const numStr = qtyStr.toString().replace(/[^\d.-]/g, '');
      return parseFloat(numStr) || 0;
    };
    if (isMainRow) {
      subItem.mainRow.sizeInput = value;
      const selectedUnit = subItem.mainRow.unit?.value || 'SQFT';
      if (selectedUnit === "SQFT" || selectedUnit === "M²") {
        const area = calculateArea(value, selectedUnit);
        subItem.mainRow.qty = area === 'Invalid size input' ? area : `${area} ${selectedUnit === "SQFT" ? "Sqft" : "m²"}`;
      } else if (selectedUnit === "CFT" || selectedUnit === "M³" || selectedUnit === "Volume") {
        const volume = calculateVolume(value, selectedUnit);
        subItem.mainRow.qty = volume === 'Invalid size input' ? volume : `${volume} ${selectedUnit === "CFT" ? "Cubic Feet" : (selectedUnit === "M³" ? "m³" : "Volume")}`;
      } else if (selectedUnit === "L") {
        const liters = calculateLiters(value);
        subItem.mainRow.qty = liters === 'Invalid size input' ? liters : `${liters} L`;
      } else if (selectedUnit === "NOS" || selectedUnit === "L.S") {
        subItem.mainRow.qty = "";
      } else {
        subItem.mainRow.qty = "";
      }

      if (subItem.mainRow.qty && subItem.mainRow.rate) {
        const qtyValue = parseQty(subItem.mainRow.qty);
        subItem.mainRow.amount = (qtyValue * subItem.mainRow.rate).toFixed(2);
      } else {
        subItem.mainRow.amount = '';
      }
    } else {
      subItem.sizeInput = value;
      const selectedUnit = subItem.unit?.value || 'SQFT';
      if (selectedUnit === "SQFT" || selectedUnit === "M²") {
        const area = calculateArea(value, selectedUnit);
        subItem.qty = area === 'Invalid size input' ? area : `${area} ${selectedUnit === "SQFT" ? "Sqft" : "m²"}`;
      } else if (selectedUnit === "CFT" || selectedUnit === "M³" || selectedUnit === "Volume") {
        const volume = calculateVolume(value, selectedUnit);
        subItem.qty = volume === 'Invalid size input' ? volume : `${volume} ${selectedUnit === "CFT" ? "Cubic Feet" : (selectedUnit === "M³" ? "m³" : "Volume")}`;
      } else if (selectedUnit === "L") {
        const liters = calculateLiters(value);
        console.log(liters);
        subItem.qty = liters === 'Invalid size input' ? liters : `${liters} L`;
      } else if (selectedUnit === "NOS" || selectedUnit === "L.S") {
        subItem.qty = "1";
      } else {
        subItem.qty = "";
      }

      if (subItem.qty && subItem.rate) {
        const qtyValue = parseQty(subItem.qty);
        subItem.amount = (qtyValue * subItem.rate).toFixed(2);
      } else {
        subItem.amount = '';
      }
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
      setInvoiceNumber(newInvoiceNumber);
    };
    generateInvoiceNumber();
  }, []);
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        workType: '',
        subItems: [{
          description: '',
          sizeInput: '',
          qty: '',
          rate: '',
          unit: '',
          amount: '',
          mainRow: {
            sizeInput: '',
            qty: '',
            rate: '',
            unit: '',
            amount: ''
          }
        }],
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
      mainRow: {
        sizeInput: '',
        qty: '',
        rate: '',
        unit: '',
        amount: ''
      }
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
    (total, item) => total + item.subItems.reduce((subTotal, subItem) => {
      const subRowAmount = Number(subItem.amount || 0);
      const mainRowAmount = Number(subItem.mainRow?.amount || 0);
      return subTotal + subRowAmount + mainRowAmount;
    }, 0),
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
  const calculateArea = (input, unit) => {
    input = input.replace(/''/g, '"');
    const dimensionGroups = input.split('+').map(dim => dim.trim());
    let totalArea = 0;
    // Helper to convert feet-inches format to feet (decimal)
    const convertToFeet = (dim) => {
      let feet = 0;
      let inches = 0;
      if (dim.includes("'") && dim.includes('"')) {
        const parts = dim.split("'");
        feet = parseFloat(parts[0].trim());
        inches = parseFloat(parts[1].replace('"', '').trim());
        return feet + (inches / 12);
      } else if (dim.includes("'")) {
        feet = parseFloat(dim.replace("'", '').trim());
        return feet;
      } else if (dim.includes('"')) {
        inches = parseFloat(dim.replace('"', '').trim());
        return inches / 12;
      }
      return parseFloat(dim.trim());
    };

    dimensionGroups.forEach(group => {
      const arr = group.split('x').map(part => part.trim());
      if (arr.length === 2) {
        let length, width;
        if (unit === "M²") {
          length = parseFloat(arr[0]);
          width = parseFloat(arr[1]);
        } else { // default to SQFT
          length = convertToFeet(arr[0]);
          width = convertToFeet(arr[1]);
        }
        if (!isNaN(length) && !isNaN(width)) {
          totalArea += length * width;
        }
      }
    });

    return totalArea.toFixed(2);
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
    const volumeInLiters = volumeInCubicFeet * 28; // Conversion factor from cubic feet to liters
    return volumeInLiters.toFixed(2);
  };

  // The handleSubItemChange function
  const handleSubItemChange = (itemIndex, subItemIndex, field, value, isMainRow = false) => {
    const updatedItems = [...items]; // Clone the items array
    const subItem = updatedItems[itemIndex].subItems[subItemIndex];

    if (isMainRow) {
      // Handle main row changes
      if (field === 'unit') {
        subItem.mainRow.unit = value;
        // Recalculate quantity when unit changes
        if (subItem.mainRow.sizeInput) {
          const selectedUnit = value?.value || 'SQFT';

          if (selectedUnit === 'SQFT' || selectedUnit === 'M²') {
            const area = calculateArea(subItem.sizeInput, selectedUnit);
            subItem.qty = area === 'Invalid size input' ? area : `${area} ${selectedUnit === 'SQFT' ? 'Sqft' : 'm²'}`;
          } else if (selectedUnit === 'CFT' || selectedUnit === 'M³' || selectedUnit === 'Volume') {
            const volume = calculateVolume(subItem.sizeInput, selectedUnit);
            subItem.qty = volume === 'Invalid size input' ? volume : `${volume} ${selectedUnit === 'CFT' ? 'Cubic Feet' : (selectedUnit === 'M³' ? 'm³' : 'Volume')}`;
          } else if (selectedUnit === 'L') {
            const liters = calculateLiters(subItem.sizeInput);
            subItem.qty = liters === 'Invalid size input' ? liters : `${liters} L`;
          } else if (selectedUnit === 'NOS' || selectedUnit === 'L.S') {
            subItem.qty = '1';
          } else {
            subItem.qty = '';
          }

        }
      } else if (field === 'rate') {
        subItem.mainRow.rate = parseFloat(value) || 0;
      } else if (field === 'amount') {
        subItem.mainRow.amount = parseFloat(value) || 0;
      }

      // Calculate amount for main row
      if (subItem.mainRow.qty && subItem.mainRow.rate) {
        const qtyValue = parseFloat(subItem.mainRow.qty) || 0;
        subItem.mainRow.amount = (qtyValue * subItem.mainRow.rate).toFixed(2);
      } else {
        subItem.mainRow.amount = '';
      }
    } else {
      // Handle sub row changes
      if (field === 'unit') {
        subItem.unit = value;
        // Recalculate quantity when unit changes
        if (subItem.sizeInput) {
          const selectedUnit = value?.value || 'SQFT';

          if (selectedUnit === 'SQFT' || selectedUnit === 'M²') {
            const area = calculateArea(subItem.sizeInput, selectedUnit);
            subItem.qty = area === 'Invalid size input' ? area : `${area} ${selectedUnit === 'SQFT' ? 'Sqft' : 'm²'}`;
          } else if (selectedUnit === 'CFT' || selectedUnit === 'M³' || selectedUnit === 'Volume') {
            const volume = calculateVolume(subItem.sizeInput, selectedUnit);
            subItem.qty = volume === 'Invalid size input' ? volume : `${volume} ${selectedUnit === 'CFT' ? 'Cubic Feet' : (selectedUnit === 'M³' ? 'm³' : 'Volume')}`;
          } else if (selectedUnit === 'L') {
            const liters = calculateLiters(subItem.sizeInput);
            subItem.qty = liters === 'Invalid size input' ? liters : `${liters} L`;
          } else if (selectedUnit === 'NOS' || selectedUnit === 'L.S') {
            subItem.qty = '1';
          } else {
            subItem.qty = '';
          }

        }
      } else if (field === 'rate') {
        subItem.rate = parseFloat(value) || 0;
      } else if (field === 'amount') {
        subItem.amount = parseFloat(value) || 0;
      }
      // Calculate amount for sub row
      if (subItem.qty && subItem.rate) {
        const qtyValue = parseFloat(subItem.qty) || 0;
        subItem.amount = (qtyValue * subItem.rate).toFixed(2);
      } else {
        subItem.amount = '';
      }
    }
    setItems(updatedItems);
  };
  let displayIndex = 1;
  const generatePDF = () => {
    const doc = new jsPDF();
    const columns = ['Description of Work', 'Size', 'Qty', 'Rate', 'Unit', 'Amount'];
    const rows = [];

    let mainIndex = 1;

    items.forEach(item => {
      const mainDesc = typeof item.description === 'object'
        ? (item.description.label || item.description.value || '')
        : item.description || '';

      rows.push([`${mainIndex}. ${mainDesc}`, '', '', '', '', '']);
      mainIndex++;
      item.subItems.forEach(sub => {
        const subDesc = typeof sub.description === 'object'
          ? (sub.description.label || sub.description.value || '')
          : sub.description || '';
        rows.push([
          '    ' + subDesc,
          sub.sizeInput || '',
          sub.qty || '',
          sub.rate || '',
          sub.unit?.value || '',
          sub.amount || '',
        ]);
      });
    });
    doc.autoTable({
      startY: 22,
      head: [columns],
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 2,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
    });
    const total = items.reduce((sum, item) =>
      sum + item.subItems.reduce((subSum, sub) => subSum + (parseFloat(sub.amount) || 0), 0), 0);
    const paid = parseFloat(amountPaid) || 0;
    const amountDue = total - paid;
    const pageWidth = doc.internal.pageSize.getWidth();
    const rightMargin = 14;
    let y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total: ${total.toLocaleString()}`, pageWidth - rightMargin, y, { align: 'right' });
    doc.text(`Amount Paid: ${paid.toLocaleString()}`, pageWidth - rightMargin, y + 8, { align: 'right' });
    doc.text(`Amount Due: ${amountDue >= 0 ? amountDue.toLocaleString() : '0'}`, pageWidth - rightMargin, y + 16, { align: 'right' });

    doc.save('invoice.pdf');
  };
  return (
    <body className='bg-[#FAF6ED]'>
      <div className="mx-auto p-4 " >
        <div className='-mt-3  flex'>
          <div className="flex ml-32 bg-white rounded-xl">
            <div className=" mt-5 ml-14 pr-4" style={{ width: "1050px" }}>
              <div className="rounded-lg border-l-8 border-l-[#BF9853] -ml-8">
                <table className="w-full table-auto mb-4 border-collapse">
                  <thead>
                    <tr className="bg-[#FAF6ED]">
                      <th className="p-2 text-left border-b border-gray-300">Description of Work</th>
                      <th className="p-2 text-left border-b border-gray-300">Size</th>
                      <th className="p-2 text-left border-b border-gray-300">Qty</th>
                      <th className="p-2 text-left border-b border-gray-300">Rate</th>
                      <th className="p-2 text-left border-b border-gray-300">Unit</th>
                      <th className="p-2 text-left border-b border-gray-300">Amount</th>
                      <th className="p-2 text-left border-b border-gray-300">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, itemIndex) => (
                      <React.Fragment key={itemIndex}>
                        {item.subItems.map((subItem, subItemIndex) => (
                          <>
                            {/* First Row - Main Item Row */}
                            {subItemIndex === 0 && (
                              <tr key={`main-${itemIndex}-${subItemIndex}`} className="odd:bg-white even:bg-[#FAF6ED] hover:bg-gray-50">
                                <td className="p-2 border-b border-gray-200">
                                  <div className="flex items-center mb-2">
                                    <span className="mr-2 font-semibold">{displayIndex++}.</span>
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
                                          border: state.isFocused ? '1px solid #BF9853' : '1px solid transparent',
                                          boxShadow: state.isFocused ? '0 0 0 1px #BF9853' : 'none',
                                          '&:hover': {
                                            border: '1px solid #BF9853',
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
                                </td>
                                <td className="p-2 border-b border-gray-200">
                                  <input
                                    type="text"
                                    value={subItem.mainRow.sizeInput || ''}
                                    onChange={(e) => handleInputChangeForRow(e, itemIndex, subItemIndex, true)}
                                    className="w-full p-2 border border-gray-300 rounded hover:border-gray-400 focus:border-[#BF9853] focus:outline-none"
                                    placeholder="e.g., 10x12"
                                  />
                                </td>
                                <td className="p-2 border-b border-gray-200">
                                  <input
                                    type="text"
                                    value={subItem.mainRow.qty}
                                    readOnly
                                    className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                                  />
                                </td>
                                <td className="p-2 border-b border-gray-200">
                                  <input
                                    type="number"
                                    value={subItem.mainRow.rate}
                                    onChange={(e) =>
                                      handleSubItemChange(itemIndex, subItemIndex, 'rate', e.target.value, true)
                                    }
                                    className="w-full p-2 border border-gray-300 rounded hover:border-gray-400 focus:border-[#BF9853] focus:outline-none"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td className="p-2 border-b border-gray-200">
                                  <Select
                                    options={units}
                                    value={subItem.mainRow.unit}
                                    onChange={(value) =>
                                      handleSubItemChange(itemIndex, subItemIndex, 'unit', value, true)
                                    }
                                    className="w-full"
                                    styles={{
                                      control: (base, state) => ({
                                        ...base,
                                        backgroundColor: 'transparent',
                                        border: state.isFocused ? '1px solid #BF9853' : '1px solid #d1d5db',
                                        boxShadow: state.isFocused ? '0 0 0 1px #BF9853' : 'none',
                                        '&:hover': {
                                          border: '1px solid #BF9853',
                                        },
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
                                        textAlign: 'left',
                                      }),
                                    }}
                                  />
                                </td>
                                <td className="p-2 border-b border-gray-200">
                                  <input
                                    type="text"
                                    value={subItem.mainRow.amount || ""}
                                    readOnly
                                    className="w-full p-2 border border-gray-200 rounded bg-gray-50 font-semibold"
                                  />
                                </td>
                                <td className="p-2 border-b border-gray-200">
                                  <button
                                    className="text-red-600 hover:text-red-800 font-bold py-1 px-2 rounded hover:bg-red-50"
                                    onClick={() => handleDeleteSubItem(itemIndex, subItemIndex)}
                                    title="Delete row"
                                  >
                                    <img className="w-4 h-4" src={delet} alt="delete"></img>
                                  </button>
                                </td>
                              </tr>
                            )}

                            {/* Second Row - Sub Item Row */}
                            <tr key={`sub-${itemIndex}-${subItemIndex}`} className="odd:bg-white even:bg-[#FAF6ED] hover:bg-gray-50">
                              <td className="p-2 border-b border-gray-200">
                                <div className="flex items-center space-x-2 gap-0 group">
                                  <CreatableSelect
                                    options={subItems}
                                    value={subItem.description || ''}
                                    onChange={(value) => {
                                      const updatedItems = [...items];
                                      updatedItems[itemIndex].subItems[subItemIndex].description = value || '';
                                      setItems(updatedItems);
                                    }}
                                    className="w-96 ml-8 font-medium text-left"
                                    styles={{
                                      control: (base, state) => ({
                                        ...base,
                                        backgroundColor: 'transparent',
                                        border: state.isFocused ? '1px solid #BF9853' : '1px solid transparent',
                                        boxShadow: state.isFocused ? '0 0 0 1px #BF9853' : 'none',
                                        '&:hover': {
                                          border: '1px solid #BF9853',
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
                                      className="font-normal rounded-full hover:bg-gray-200 p-1"
                                      onClick={() => handleAddSubItem(itemIndex)}
                                      title="Add sub-item"
                                    >
                                      <img
                                        src={add}
                                        alt="Add"
                                        className="w-6 h-6"
                                      />
                                    </button>
                                    <button
                                      className="font-normal py-1 px-2 rounded-full hover:bg-gray-200"
                                      onClick={() => handleRemoveSubItem(itemIndex, subItemIndex)}
                                      title="Remove sub-item"
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
                              <td className="p-2 border-b border-gray-200">
                                <input
                                  type="text"
                                  value={subItem.sizeInput || ''}
                                  onChange={(e) => handleInputChangeForRow(e, itemIndex, subItemIndex)}
                                  className="w-full p-2 border border-gray-300 rounded hover:border-gray-400 focus:border-[#BF9853] focus:outline-none"
                                  placeholder="e.g., 10x12"
                                />
                              </td>
                              <td className="p-2 border-b border-gray-200">
                                <input
                                  type="text"
                                  value={subItem.qty}
                                  readOnly
                                  className="w-full p-2 border border-gray-200 rounded bg-gray-50"
                                />
                              </td>
                              <td className="p-2 border-b border-gray-200">
                                <input
                                  type="number"
                                  value={subItem.rate}
                                  onChange={(e) =>
                                    handleSubItemChange(itemIndex, subItemIndex, 'rate', e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded hover:border-gray-400 focus:border-[#BF9853] focus:outline-none"
                                  placeholder="0.00"
                                />
                              </td>
                              <td className="p-2 border-b border-gray-200">
                                <Select
                                  options={units}
                                  value={subItem.unit}
                                  onChange={(value) =>
                                    handleSubItemChange(itemIndex, subItemIndex, 'unit', value)
                                  }
                                  className="w-full"
                                  styles={{
                                    control: (base, state) => ({
                                      ...base,
                                      backgroundColor: 'transparent',
                                      border: state.isFocused ? '1px solid #BF9853' : '1px solid #d1d5db',
                                      boxShadow: state.isFocused ? '0 0 0 1px #BF9853' : 'none',
                                      '&:hover': {
                                        border: '1px solid #BF9853',
                                      },
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
                                      textAlign: 'left',
                                    }),
                                  }}
                                />
                              </td>
                              <td className="p-2 border-b border-gray-200">
                                <input
                                  type="text"
                                  value={subItem.amount || ""}
                                  readOnly
                                  className="w-full p-2 border border-gray-200 rounded bg-gray-50 font-semibold"
                                />
                              </td>
                              <td className="p-2 border-b border-gray-200">
                                <button
                                  className="text-red-600 hover:text-red-800 font-bold py-1 px-2 rounded hover:bg-red-50"
                                  onClick={() => handleDeleteSubItem(itemIndex, subItemIndex)}
                                  title="Delete row"
                                >
                                  <img className="w-4 h-4" src={delet} alt="delete"></img>
                                </button>
                              </td>
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
            <div className='-ml-10 flex flex-col space-y-5'>
              <button className="bg-green-700 text-white font-bold py-2 px-4 rounded ml-16 mt-5 block">
                Download / Print
              </button>
              <button onClick={generatePDF} className="bg-[#BF9853] text-white py-2 px-4 rounded ml-16 block">
                Make A Copy
              </button>
              <button className="bg-[#E4572E] text-white font-bold py-2 px-4 rounded ml-16 block">
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