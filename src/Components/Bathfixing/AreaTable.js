import React, { useState } from 'react';
import bin from '../Images/Delete.svg'
import Select from 'react-select';
const AreaTable = ({ areaKey, tableData, updateRowData, addRow, deleteRowData, itemNames, brandNames, types, bathModelData }) => (
  <div>
    <div className="ml-4 rounded-lg border-l-8 border-l-[#BF9853]">
      <table className="table-auto w-[1201px] h-[48px] text-sm sm:text-base">
        <thead className="w-[1201px] h-[48px]">
          <tr className="bg-[#FAF6ED]">
            <th className="w-24">S.No</th>
            <th className="w-28 px-3">Brand</th>
            <th className="w-24">Item Name</th>
            <th className="w-32">Model</th>
            <th className="w-44">Type</th>
            <th className="w-60 text-left">Product Image</th>
            <th className="w-60 text-center">Technical Image</th>
            <th className="w-52">Qty</th>
          </tr>
        </thead>
        <tbody >
          {tableData.map((row, index) => (
            <tr key={index} className={index % 2 === 1 ? 'bg-[#FAF6ED]' : 'bg-white'}>
              <td>{index + 1}.</td>
              <td className='h-[84px]'>
                <Select
                  className="w-48"
                  classNamePrefix="react-select"
                  value={
                    brandNames
                      .map((item) => ({ label: item.brandName, value: item.brandName }))
                      .find((option) => option.value === row.brand) || null
                  }
                  onChange={(selectedOption) => {
                    const updatedRow = { ...row, brand: selectedOption?.value || '' };
                    updateRowData(areaKey, index, updatedRow);
                  }}
                  options={brandNames.map((item) => ({
                    label: item.brandName,
                    value: item.brandName,
                  }))}
                  placeholder="Select Brand"
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
              <td className="pl-4">
                <Select
                  className="w-56"
                  classNamePrefix="react-select"
                  value={
                    itemNames
                      .map((item) => ({ label: item.itemName, value: item.itemName }))
                      .find((option) => option.value === row.itemName) || null
                  }
                  onChange={(selectedOption) => {
                    const updatedRow = { ...row, itemName: selectedOption?.value || '' };
                    updateRowData(areaKey, index, updatedRow);
                  }}
                  options={itemNames.map((item) => ({
                    label: item.itemName,
                    value: item.itemName,
                  }))}
                  placeholder="Select Item"
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
                  className="w-44"
                  classNamePrefix="react-select"
                  value={
                    row.model
                      ? { label: row.model, value: row.model }
                      : null
                  }
                  onChange={(selectedOption) => {
                    const selectedModel = bathModelData.find(
                      (item) =>
                        item.model === selectedOption?.value &&
                        (row.brand ? item.brandName === row.brand : true)
                    );
                    const updatedRow = {
                      ...row,
                      model: selectedModel?.model || '',
                      brand: selectedModel?.brandName || row.brand || '',
                      itemName: selectedModel?.itemName || '',
                      type: selectedModel?.type || '',
                      image: selectedModel?.image || '',
                      technicalImage: selectedModel?.technicalImage || '',
                      price:selectedModel?.price || '',
                    };
                    console.log(updatedRow);
                    updateRowData(areaKey, index, updatedRow);
                  }}
                  options={
                    Array.from(
                      new Map(
                        bathModelData
                          .filter((item) => !row.brand || item.brandName === row.brand)
                          .map((item) => [item.model, { label: item.model, value: item.model }])
                      ).values()
                    )
                  }
                  placeholder="Select Model"
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
                  className="w-44"
                  classNamePrefix="react-select"
                  value={
                    types
                      .map((item) => ({ label: item.type, value: item.type }))
                      .find((option) => option.value === row.type) || null
                  }
                  onChange={(selectedOption) => {
                    const selectedType = selectedOption?.value || '';
                    const selectedMatch = bathModelData.find(
                      item => item.model === row.model && item.type === selectedType
                    );
                    const updatedRow = {
                      ...row,
                      type: selectedType,
                      image: selectedMatch?.image || '',
                      technicalImage: selectedMatch?.technicalImage || '',
                      price:selectedMatch?.price || '',
                    };
                    console.log(updatedRow);
                    updateRowData(areaKey, index, updatedRow);
                  }}
                  options={types.map((item) => ({
                    label: item.type,
                    value: item.type,
                  }))}
                  placeholder="Select Type"
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
              <td className="text-left">
                {row.image ? (
                  <img src={`data:image/png;base64,${row.image}`} alt="Product" className="w-[99px] h-[84px] object-contain"/>
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </td>
              <td className="text-right ">
                {row.technicalImage ? (
                  <img
                    src={`data:image/png;base64,${row.technicalImage}`}
                    alt="Technical"
                    className="w-[132px] h-[84px] object-contain"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </td>
              <td>
                <input
                  type="text"
                  className="border w-10 p-1  h-6 bg-transparent focus:outline-none"
                  value={row.qty}
                  onChange={(e) => {
                    const updatedRow = { ...row, qty: e.target.value };
                    updateRowData(areaKey, index, updatedRow);
                  }}
                />
              </td>
              <td>
                <button className="ml-[-20px]" onClick={() => deleteRowData(areaKey, index)}>
                  <img src={bin} className="w-[15px]" alt="Delete" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 mb-10 ml-[-950px]">
        <button type="button" className="text-[#E4572E] border-dashed border-b-2 border-[#BF9853] font-semibold" onClick={() => addRow(areaKey)}>
          + Add Item
        </button>
      </div>
    </div>
  </div>
);
export default AreaTable;