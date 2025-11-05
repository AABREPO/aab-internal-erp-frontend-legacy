import React, { useState } from 'react'
import delet from '../Images/Delete.svg'
import add from '../Images/Right.svg'
import delt from '../Images/Worng.svg';

const CreateQuotation = () => {
  const [quotationData, setQuotationData] = useState({
    date: '13/04/2024',
    quotation: 'QUO253',
    clientName: 'Mr.Sivaraman',
    projectType: 'Residential',
    clientAddress: 'Enter Address',
    clientPhone: '9876543210'
  })

  const [workItems, setWorkItems] = useState([])

  const [notes, setNotes] = useState('')

  const [summary, setSummary] = useState({
    total: 45958,
    amountPaid: 30000,
    amountDue: 15958
  })

  const units = ['SQFT', 'L.S', 'NOS', 'KG', 'MTR', 'CUM']

  const workCategories = [
    'Masonry Works',
    'Tilina Works',
    'Metal Works',
    'Electrical Works',
    'Plumbing Works',
    'Painting Works',
    'Carpentry Works',
    'Flooring Works',
    'Roofing Works',
    'Other'
  ]

  const subItemDescriptions = {
    'Masonry Works': [
      'Cement Flooring-First Floor',
      'Brick Work',
      'Concrete Work',
      'Plastering',
      'Foundation Work',
      'Wall Construction',
      'Other'
    ],
    'Tilina Works': [
      'GF Veranda Floor Tile',
      'First Floor Bathroom Floor Tile',
      'Kitchen Floor Tile',
      'Bathroom Wall Tile',
      'Living Room Floor Tile',
      'Balcony Floor Tile',
      'Other'
    ],
    'Metal Works': [
      'Terrace Roof Sheet',
      'Steel Structure',
      'Metal Gates',
      'Window Frames',
      'Door Frames',
      'Metal Railing',
      'Other'
    ],
    'Electrical Works': [
      'Wiring',
      'Switch Installation',
      'Socket Installation',
      'Light Fixtures',
      'Fan Installation',
      'MCB Box',
      'Other'
    ],
    'Plumbing Works': [
      'Water Supply',
      'Drainage',
      'Bathroom Fitting',
      'Kitchen Fitting',
      'Water Tank',
      'Pipe Installation',
      'Other'
    ],
    'Painting Works': [
      'Interior Painting',
      'Exterior Painting',
      'Primer Coating',
      'Wall Putty',
      'Waterproofing',
      'Texture Painting',
      'Other'
    ],
    'Carpentry Works': [
      'Door Installation',
      'Window Installation',
      'Furniture Making',
      'Shelf Installation',
      'Cabinet Making',
      'Wooden Flooring',
      'Other'
    ],
    'Flooring Works': [
      'Marble Flooring',
      'Granite Flooring',
      'Wooden Flooring',
      'Vinyl Flooring',
      'Carpet Installation',
      'Mosaic Work',
      'Other'
    ],
    'Roofing Works': [
      'RCC Roof',
      'Tiled Roof',
      'Metal Sheet Roof',
      'Waterproofing',
      'Insulation',
      'Gutter Installation',
      'Other'
    ],
    'Other': [
      'Custom Work',
      'Special Installation',
      'Repair Work',
      'Maintenance',
      'Other'
    ]
  }

  const addMainItem = () => {
    setWorkItems(prevItems => {
      const newId = prevItems.length > 0 ? Math.max(...prevItems.map(item => item.id)) + 1 : 1
      return [
        ...prevItems,
        {
          id: newId,
          mainItem: 'Masonry Works',
          subItems: [
            { id: 1, description: '', qty: 0, rate: 0, unit: '', amount: 0 }
          ]
        }
      ]
    })
  }

  // Add behavior: if empty, create the initial row AND the new row in one click
  const addMainItemSmart = () => {
    setWorkItems(prevItems => {
      if (prevItems.length === 0) {
        return [
          {
            id: 1,
            mainItem: 'Masonry Works',
            subItems: [ { id: 1, description: '', qty: 0, rate: 0, unit: '', amount: 0 } ]
          },
          {
            id: 2,
            mainItem: 'Masonry Works',
            subItems: [ { id: 1, description: '', qty: 0, rate: 0, unit: '', amount: 0 } ]
          }
        ]
      }
      const nextId = Math.max(...prevItems.map(i => i.id)) + 1
      return [
        ...prevItems,
        { id: nextId, mainItem: 'Masonry Works', subItems: [ { id: 1, description: '', qty: 0, rate: 0, unit: '', amount: 0 } ] }
      ]
    })
  }

  const addSubItem = (mainItemId) => {
    setWorkItems(prevItems => prevItems.map(item => {
      if (item.id !== mainItemId) return item
      const newSubId = item.subItems.length > 0
        ? Math.max(...item.subItems.map(sub => sub.id)) + 1
        : 1
      return {
        ...item,
        subItems: [
          ...item.subItems,
          { id: newSubId, description: '', qty: 0, rate: 0, unit: '', amount: 0 }
        ]
      }
    }))
  }

  // Ensure first main item exists and immediately add a new sub-item row under it
  const addSubItemToFirst = () => {
    setWorkItems(prevItems => {
      if (prevItems.length === 0) {
        return [{
          id: 1,
          mainItem: 'Masonry Works',
          subItems: [
            { id: 1, description: '', qty: 0, rate: 0, unit: '', amount: 0 },
            { id: 2, description: '', qty: 0, rate: 0, unit: '', amount: 0 }
          ]
        }]
      }
      const firstId = prevItems[0].id
      return prevItems.map(item => {
        if (item.id !== firstId) return item
        const newSubId = item.subItems.length > 0
          ? Math.max(...item.subItems.map(s => s.id)) + 1
          : 1
        return {
          ...item,
          subItems: [...item.subItems, { id: newSubId, description: '', qty: 0, rate: 0, unit: '', amount: 0 }]
        }
      })
    })
  }

  const updateMainItem = (mainItemId, field, value) => {
    setWorkItems(prevItems => prevItems.map(item => {
      if (item.id !== mainItemId) return item
      return { ...item, [field]: value }
    }))
  }

  const updateSubItem = (mainItemId, subItemId, field, value) => {
    setWorkItems(prevItems => prevItems.map(item => {
      if (item.id !== mainItemId) return item
      return {
        ...item,
        subItems: item.subItems.map(sub => {
          if (sub.id !== subItemId) return sub
          const updated = { ...sub, [field]: value }
          if (field === 'qty' || field === 'rate') {
            updated.amount = (field === 'qty' ? value : updated.qty) * (field === 'rate' ? value : updated.rate)
          }
          return updated
        })
      }
    }))
  }

  const deleteSubItem = (mainItemId, subItemId) => {
    setWorkItems(workItems.map(item => {
      if (item.id === mainItemId) {
        return {
          ...item,
          subItems: item.subItems.filter(sub => sub.id !== subItemId)
        }
      }
      return item
    }))
  }

  const deleteMainItem = (mainItemId) => {
    setWorkItems(workItems.filter(item => item.id !== mainItemId))
  }

  const calculateTotal = () => {
    return workItems.reduce((total, item) => {
      return total + item.subItems.reduce((itemTotal, sub) => itemTotal + sub.amount, 0)
    }, 0)
  }

  const handleSubmit = () => {
    console.log('Quotation submitted:', { quotationData, workItems, notes, summary })
  }

  return (
    <body className='bg-[#FAF6ED]'>
      <div className="mx-auto">
        <div className=' flex gap-5 ml-5 mr-5'>
          <div className="flex bg-white rounded-xl w-[1480px]">
            <div className=" p-4">
              <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                <table className="w-full table-auto mb-4 border-collapse">
                  <thead>
                    <tr className="bg-[#FAF6ED]">
                      <th className="p-2 text-left">Description of Work</th>
                      <th className="p-2 text-left">Qty</th>
                      <th className="p-2 text-left">Rate</th>
                      <th className="p-2 text-left">Unit</th>
                      <th className="p-2 text-left">Amount</th>
                      <th className="p-2 text-left">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workItems.length === 0 ? (
                      <React.Fragment>
                        <tr className="odd:bg-white even:bg-[#FAF6ED]">
                          <td className="p-2">
                            <div className="flex items-center mb-2 focus:outline-none">
                              <span className="mr-2 font-semibold">1.</span>
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    addMainItem();
                                    updateMainItem(1, 'mainItem', e.target.value);
                                  }
                                }}
                                className="font-semibold text-gray-800 hover:border hover:border-gray-300 bg-transparent rounded px-2 py-1 focus:outline-none"
                              >
                                <option value="">Select work category</option>
                                {workCategories.map(category => (
                                  <option key={category} value={category}>{category}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="p-2" colSpan="5"></td>
                        </tr>
                        <tr className="odd:bg-white even:bg-[#FAF6ED]">
                          <td className="p-2">
                            <div className="flex items-center space-x-2 gap-0 group">
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value && workItems.length === 0) {
                                    addMainItem();
                                    updateSubItem(1, 1, 'description', e.target.value);
                                  }
                                }}
                                className="w-96 ml-8 font-medium text-left p-2 hover:border hover:border-gray-300 rounded bg-transparent focus:outline-none"
                              >
                                <option value="">Select description</option>
                                {workCategories.map(category => (
                                  subItemDescriptions[category]?.map(description => (
                                    <option key={description} value={description}>{description}</option>
                                  ))
                                ))}
                              </select>
                              <button
                                className="font-normal rounded-full hover:bg-gray-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={addSubItemToFirst}
                                title="Add sub-item"
                              >
                                <img
                                  src={add}
                                  alt="Add"
                                  className="w-4 h-4"
                                />
                              </button>
                            </div>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value=""
                              onChange={(e) => {
                                if (workItems.length === 0) {
                                  addMainItem();
                                  updateSubItem(1, 1, 'qty', parseFloat(e.target.value) || 0);
                                }
                              }}
                              className="w-full p-2 hover:border hover:border-gray-400 bg-transparent rounded focus:border-[#BF9853] focus:outline-none"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value=""
                              onChange={(e) => {
                                if (workItems.length === 0) {
                                  addMainItem();
                                  updateSubItem(1, 1, 'rate', parseFloat(e.target.value) || 0);
                                }
                              }}
                              className="w-full p-2 hover:border hover:border-gray-400 bg-transparent rounded focus:border-[#BF9853] focus:outline-none"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value=""
                              onChange={(e) => {
                                if (workItems.length === 0) {
                                  addMainItem();
                                  updateSubItem(1, 1, 'unit', e.target.value);
                                }
                              }}
                              className="w-full p-2 bg-transparent rounded hover:border hover:border-gray-400 focus:border-[#BF9853] focus:outline-none"
                            >
                              <option value="">Select</option>
                              {units.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value=""
                              readOnly
                              className="w-full p-2 hover:border hover:border-gray-400 bg-transparent rounded font-semibold"
                            />
                          </td>
                          <td className="p-2">
                            <button
                              className="text-red-600 hover:text-red-800 font-bold py-1 px-2 rounded hover:bg-red-50"
                              onClick={() => {
                                if (workItems.length === 0) {
                                  addMainItem();
                                }
                              }}
                              title="Delete row"
                            >
                              <img className="w-4 h-4" src={delet} alt="delete"></img>
                            </button>
                          </td>
                        </tr>
                      </React.Fragment>
                    ) : (
                      workItems.map((item, itemIndex) => (
                        <React.Fragment key={item.id}>
                          {/* Main Item Row */}
                          <tr className="odd:bg-white even:bg-[#FAF6ED] ">
                            <td className="p-2 ">
                              <div className="flex items-center mb-2">
                                <span className="mr-2 font-semibold">{itemIndex + 1}.</span>
                                <select
                                  value={item.mainItem}
                                  onChange={(e) => updateMainItem(item.id, 'mainItem', e.target.value)}
                                  className="font-semibold text-gray-800 hover:border hover:border-gray-300 bg-transparent rounded px-2 py-1"
                                >
                                  {workCategories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => deleteMainItem(item.id)}
                                  className="ml-2 text-red-600 hover:text-red-800 font-bold py-1 px-2 rounded hover:bg-red-50"
                                  title="Delete main item"
                                >
                                  <img className="w-4 h-4" src={delet} alt="delete"></img>
                                </button>
                              </div>
                            </td>
                            <td className="p-2" colSpan="5"></td>
                          </tr>

                          {/* Sub Items */}
                          {item.subItems.map((subItem, subIndex) => (
                            <tr key={subItem.id} className="odd:bg-white even:bg-[#FAF6ED] ">
                              <td className="p-2">
                                <div className="flex items-center space-x-2 gap-0 group">
                                  <select
                                    value={subItem.description}
                                    onChange={(e) => updateSubItem(item.id, subItem.id, 'description', e.target.value)}
                                    className="w-96 ml-8 font-medium text-left p-2 hover:border hover:border-gray-300 rounded bg-transparent focus:outline-none"
                                  >
                                    <option value="">Select description</option>
                                    {subItemDescriptions[item.mainItem]?.map(description => (
                                      <option key={description} value={description}>{description}</option>
                                    ))}
                                  </select>
                                  <button
                                    className="font-normal rounded-full hover:bg-gray-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    onClick={() => addSubItem(item.id)}
                                    title="Add sub-item"
                                  >
                                    <img
                                      src={add}
                                      alt="Add"
                                      className="w-4 h-4"
                                    />
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-800 font-bold py-1 px-2 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    onClick={() => deleteSubItem(item.id, subItem.id)}
                                    title="Delete row"
                                  >
                                    <img
                                      src={delt}
                                      alt="delete"
                                      className="w-4 h-4"
                                    />
                                  </button>
                                </div>
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={subItem.qty}
                                  onChange={(e) => updateSubItem(item.id, subItem.id, 'qty', parseFloat(e.target.value) || 0)}
                                  className="w-full p-2 hover:border hover:border-gray-400 bg-transparent rounded focus:border-[#BF9853] focus:outline-none"
                                  placeholder="0.00"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={subItem.rate}
                                  onChange={(e) => updateSubItem(item.id, subItem.id, 'rate', parseFloat(e.target.value) || 0)}
                                  className="w-full p-2 hover:border hover:border-gray-400 bg-transparent rounded focus:border-[#BF9853] focus:outline-none"
                                  placeholder="0.00"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={subItem.unit}
                                  onChange={(e) => updateSubItem(item.id, subItem.id, 'unit', e.target.value)}
                                  className="w-full p-2 bg-transparent rounded hover:border hover:border-gray-400 focus:border-[#BF9853] focus:outline-none"
                                >
                                  <option value="">Select</option>
                                  {units.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={subItem.amount.toLocaleString()}
                                  readOnly
                                  className="w-full p-2 hover:border hover:border-gray-400 bg-transparent rounded  font-semibold"
                                />
                              </td>
                              <td className="p-2">
                                <button
                                  className="text-red-600 hover:text-red-800 font-bold py-1 px-2 rounded hover:bg-red-50"
                                  onClick={() => deleteSubItem(item.id, subItem.id)}
                                  title="Delete row"
                                >
                                  <img className="w-4 h-4" src={delet} alt="delete"></img>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className='text-left'>
                <button
                  className="text-[#E4572E] font-semibold rounded mb-4 border-dashed border-b-2 border-[#BF9853]"
                  onClick={addMainItemSmart}
                >
                  + Add Item
                </button>
              </div>

              <div className="w-full flex gap-8 mb-4 justify-between">
                <div className=" text-left">
                  <h1 className="text-lg font-bold  mb-4">Notes</h1>
                  <input
                    type="text"
                    value={notes.general}
                    onChange={(e) => setNotes({ ...notes, general: e.target.value })}
                    className="p-2 border mb-4 h-11 rounded-md w-full focus:outline-none"
                    placeholder="Enter general notes..."
                  />

                  <input
                    type="text"
                    value={notes.terms}
                    onChange={(e) => setNotes({ ...notes, terms: e.target.value })}
                    className="p-1 border mb-4 h-9 rounded-md w-full focus:outline-none"
                    placeholder="Terms & Conditions"
                  />

                  <input
                    type="text"
                    value={notes.payment}
                    onChange={(e) => setNotes({ ...notes, payment: e.target.value })}
                    className="p-2 border mb-4 block h-11 rounded-md w-full focus:outline-none"
                    placeholder="Please make the payment by the due date."
                  />

                  <button
                    onClick={handleSubmit}
                    className="bg-[#BF9853] text-white font-bold py-2 px-4 rounded block"
                  >
                    Submit
                  </button>
                </div>
                <div className=" mt-10">
                  <div className="space-y-2">
                    <div className="bg-[#BF9853] text-white px-4 py-2 rounded text-right w-[302px] h-[48px] flex justify-between items-center">
                      <div className="text-sm">Total</div>
                      <div className="text-lg font-bold"></div>
                    </div>
                    <div className="bg-[#FFFFFF] border border-gray-300 px-4 py-2 rounded text-right w-[302px] h-[48px] flex justify-between items-center">
                      <div className="text-sm text-gray-600">Amount Paid</div>
                      <div className="text-lg font-bold"></div>
                    </div>
                    <div className="bg-[#EBEBEB] px-4 py-2 rounded text-right w-[302px] h-[48px] flex justify-between items-center">
                      <div className="text-sm text-gray-600">Amount Due</div>
                      <div className="text-lg font-bold"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-white w-[330px] rounded-lg shadow-md p-6 sticky">
              <h2 className="text-xl font-bold mb-6">Quotation Details</h2>

              <div className="space-y-4 text-left">
                {/* Date */}
                <div>
                  <label className="block font-semibold mb-1">Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={quotationData.date}
                      onChange={(e) => setQuotationData({ ...quotationData, date: e.target.value })}
                      className="w-full border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 pr-8"
                    />
                  </div>
                </div>

                {/* Quotation */}
                <div>
                  <label className="block font-semibold  mb-1">Quotation</label>
                  <input
                    type="text"
                    value={quotationData.quotation}
                    onChange={(e) => setQuotationData({ ...quotationData, quotation: e.target.value })}
                    className="w-full border border-[#BF9853] border-opacity-10 bg-[#F2F2F2] rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>

                {/* Client Name */}
                <div>
                  <label className="block font-semibold mb-1">Client Name</label>
                  <select
                    value={quotationData.clientName}
                    onChange={(e) => setQuotationData({ ...quotationData, clientName: e.target.value })}
                    className="w-full border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="Mr.Sivaraman">Mr.Sivaraman</option>
                    <option value="Mrs.John">Mrs.John</option>
                    <option value="Mr.Smith">Mr.Smith</option>
                  </select>
                </div>

                {/* Project Type */}
                <div>
                  <label className="block font-semibold mb-1">Project Type</label>
                  <select
                    value={quotationData.projectType}
                    onChange={(e) => setQuotationData({ ...quotationData, projectType: e.target.value })}
                    className="w-full border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>

                {/* Client Address */}
                <div>
                  <label className="block font-semibold mb-1">Client Address</label>
                  <input
                    type="text"
                    value={quotationData.clientAddress}
                    onChange={(e) => setQuotationData({ ...quotationData, clientAddress: e.target.value })}
                    className="w-full border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 focus:outline-none"
                    placeholder="Enter Address"
                  />
                </div>

                {/* Client Phone */}
                <div>
                  <label className="block font-semibold mb-1">Client Phone</label>
                  <input
                    type="text"
                    value={quotationData.clientPhone}
                    onChange={(e) => setQuotationData({ ...quotationData, clientPhone: e.target.value })}
                    className="w-full border border-[#BF9853] border-opacity-10 rounded-lg px-3 py-2 focus:outline-none bg-[#F2F2F2]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button className="w-full bg-[#007233] text-white py-2 px-4 rounded hover:bg-green-700">
                  Download / Print
                </button>
                <button className="w-full bg-[#BF9853] text-white py-2 px-4 rounded hover:bg-yellow-700">
                  Make a Copy
                </button>
                <button className="w-full bg-[#E4572E] text-white py-2 px-4 rounded hover:bg-orange-700">
                  Save Online
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
  )
}

export default CreateQuotation
