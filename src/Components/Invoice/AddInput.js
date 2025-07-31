import React from 'react';
import imports from '../Images/Import.svg';
import search from '../Images/search.png'

const TableComponent = () => {
  const table1Data = [
    { id: '01', description: 'Passage Plastering' },
    { id: '02', description: 'Cement Flooring - First floor' },
    { id: '03', description: 'Terrace Cement Flooring' },
    { id: '04', description: 'Sintex Tank Red' },
    { id: '05', description: 'Washing Stone 2\'4" Height' },
    { id: '06', description: 'Front Cuddaph Slab' },
    { id: '07', description: 'Kitchen Cuddaph Slab' },
    { id: '08', description: 'Elevation Repair Works' },
  ];

  const table2Data = [
    { id: '01', title: 'Masonry Works' },
    { id: '02', title: 'Tiling Works' },
    { id: '03', title: 'Metal Works' },
    { id: '04', title: 'Carpentry Works' },
  ];

  return (
    <div className="flex justify-center mt-1">
      <div
        className="bg-white p-5 rounded-lg  flex -ml-24 mb-5"
        style={{ width: '80vw' }} // Adjust this width as needed
      >
        {/* First table section */}
        <div className="flex-1">
          <div className="flex items-center mb-4">
            <input
              type="text"
              placeholder="Search Description..."
              className="border-2 border-[#FAF6ED] rounded-lg px-3 py-2 text-sm mr-2 w-96"
            />
            <button className="-ml-8 mt-5 transform -translate-y-1/2 text-gray-500">
            <img src={search} alt='search' className=' w-5 h-5' />
          </button>
            <button className="text-base border-dashed border-b-2 ml-4 border-[#BF9853] font-semibold">+ Add</button>
          </div>
          <button className="text-[#E4572E] font-semibold mb-2 flex ">
            <img src={imports} alt='import' className=' w-7 h-5 bg-transparent pr-2 mt-1' />
            <h1 className='mt-1.5'>Import file</h1>
          </button>
          <div
            className="rounded-l-lg overflow-hidden"
            style={{ borderLeft: '8px solid #BF9853' }}
          >
            <table className=" text-left" style={{width: '500px'}}>
              <thead className="bg-[#FAF6ED]">
                <tr>
                  <th className="px-4 py-2 font-bold">S.No</th>
                  <th className="px-4 py-2 font-bold">Description</th>
                </tr>
              </thead>
              <tbody>
                {table1Data.map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}
                  >
                    <td className="px-4 py-2 font-semibold">
                      {row.id}
                    </td>
                    <td className="px-4 py-2 font-semibold">
                      {row.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Second table section */}
        <div className="flex-1" style={{marginLeft: '-400px'}}>
          <div className="flex items-center mb-4">
            <input
              type="text"
              placeholder="Search Title Name..."
              className="border-2 border-[#FAF6ED] rounded-lg px-3 py-2 text-sm mr-2 w-72"
            />
            <button className="-ml-8 mt-5 transform -translate-y-1/2 text-gray-500">
            <img src={search} alt='search' className=' w-5 h-5' />
          </button>
            <button className="text-base border-dashed border-b-2 ml-4 border-[#BF9853] font-semibold">+ Add</button>
          </div>
          <button className="text-[#E4572E] font-semibold mb-2 flex ">
            <img src={imports} alt='import' className=' w-7 h-5 bg-transparent pr-2 mt-1' />
            <h1 className='mt-1.5'>Import file</h1>
          </button>
          <div
            className="rounded-l-lg overflow-hidden"
            style={{ borderLeft: '8px solid #BF9853' }}
          >
            <table className=" text-left" style={{width: '300px'}}>
              <thead className="bg-[#FAF6ED]">
                <tr>
                  <th className="px-4 py-2 font-bold">S.No</th>
                  <th className="px-4 py-2 font-bold">Title</th>
                </tr>
              </thead>
              <tbody>
                {table2Data.map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}
                  >
                    <td className="px-4 py-2 font-semibold">
                      {row.id}
                    </td>
                    <td className="px-4 py-2 font-semibold">
                      {row.title}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
