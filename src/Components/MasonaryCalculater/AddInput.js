import React, { useState, useEffect, useCallback } from 'react';
import edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';

const AddInput = () => {
    const [beamData, setBeamData] = useState([]);
    const [BeamNameSearch, setBeamNameSearch] = useState("");
    const filteredBeamNames = beamData.filter((item) =>
        item.beamName.toLowerCase().includes(BeamNameSearch.toLowerCase())
    );



    return (
        <div className="p-4 bg-white ml-14 w-[1700px] mr-8">
            <div className=" flex overflow-y-auto space-x-[1%]">
                <div>
                    <div className='ml-5'>
                        <div className="flex items-center mb-2">
                            <input
                                type="text"
                                className="border-2 rounded-lg border-[#BF9853] w-[174px] h-[45px] border-opacity-[0.17] pl-3 placeholder:text-sm placeholder:text-gray-500 placeholder:font-semibold"
                                placeholder="Search Grid N..."
                                value={BeamNameSearch}
                            />
                            <button className="-ml-8 mt-5 transform -translate-y-1/2 text-gray-500">
                                <img src={search} alt='search' className=' w-5 h-5' />
                            </button>
                            <button className=" text-black font-bold px-1 ml-6 rounded border-dashed border-b-2 border-[#BF9853]">
                                + Add
                            </button>
                        </div>
                        <button className="text-[#E4572E] font-semibold -mb-4 text-sm flex">
                            <img src={imports} alt="import" className="w-6 h-5 bg-transparent pr-2 mt-1" />
                            <h1 className="mt-1.5">Import file</h1>
                        </button>
                        <div className="rounded-lg border border-gray-200 mt-7 border-l-8 border-l-[#BF9853] w-[238px]">
                            <div className="bg-[#FAF6ED]">
                                <table className="table-auto ">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2 text-left w-16 text-base font-bold">S.No</th>
                                            <th className="p-2 text-left w-48 text-base font-bold">Grid Name</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                            <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                <table className="table-auto w-[16.5rem]">
                                    <tbody>
                                        {filteredBeamNames.map((item, index) => (
                                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                                                <td className="p-2 text-left font-semibold">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </td>
                                                <td className="p-2 group flex justify-between items-center font-semibold ml-5">
                                                    {item.beamName}
                                                    <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <button type="button">
                                                            <img
                                                                src={edit}
                                                                alt="edit"
                                                                className="w-4 h-4"
                                                            />
                                                        </button>
                                                        <button>
                                                            <img src={deleteIcon} alt="delete" className="w-4 h-4"
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className='ml-7'>
                        <div className="flex items-center mb-2">
                            <input
                                type="text"
                                className="border-2 rounded-lg border-[#BF9853] w-[174px] h-[45px] border-opacity-[0.17] pl-3 placeholder:text-sm placeholder:text-gray-500 placeholder:font-semibold"
                                placeholder="Search Type Na.."
                                value={BeamNameSearch}
                            />
                            <button className="-ml-8 mt-5 transform -translate-y-1/2 text-gray-500">
                                <img src={search} alt='search' className=' w-5 h-5' />
                            </button>
                            <button className=" text-black font-bold px-1 ml-6 rounded border-dashed border-b-2 border-[#BF9853]">
                                + Add
                            </button>
                        </div>
                        <button className="text-[#E4572E] font-semibold -mb-4 text-sm flex">
                            <img src={imports} alt="import" className="w-6 h-5 bg-transparent pr-2 mt-1" />
                            <h1 className="mt-1.5">Import file</h1>
                        </button>
                        <div className="rounded-lg border border-gray-200 mt-7 border-l-8 border-l-[#BF9853] w-[238px]">
                            <div className="bg-[#FAF6ED]">
                                <table className="table-auto ">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2 text-left w-16 text-base font-bold">S.No</th>
                                            <th className="p-2 text-left w-48 text-base font-bold">Type</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                            <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                <table className="table-auto w-[16.5rem]">
                                    <tbody>
                                        {filteredBeamNames.map((item, index) => (
                                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                                                <td className="p-2 text-left font-semibold">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </td>
                                                <td className="p-2 group flex justify-between items-center font-semibold ml-5">
                                                    {item.beamName}
                                                    <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <button type="button">
                                                            <img
                                                                src={edit}
                                                                alt="edit"
                                                                className="w-4 h-4"
                                                            />
                                                        </button>
                                                        <button>
                                                            <img src={deleteIcon} alt="delete" className="w-4 h-4"
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className='ml-7'>
                        <div className="flex items-center mb-2">
                            <input
                                type="text"
                                className="border-2 rounded-lg border-[#BF9853] w-[174px] h-[45px] border-opacity-[0.17] pl-3 placeholder:text-sm placeholder:text-gray-500 placeholder:font-semibold"
                                placeholder="Search Mix.."
                                value={BeamNameSearch}
                            />
                            <button className="-ml-8 mt-5 transform -translate-y-1/2 text-gray-500">
                                <img src={search} alt='search' className=' w-5 h-5' />
                            </button>
                            <button className=" text-black font-bold px-1 ml-6 rounded border-dashed border-b-2 border-[#BF9853]">
                                + Add
                            </button>
                        </div>
                        <button className="text-[#E4572E] font-semibold -mb-4 text-sm flex">
                            <img src={imports} alt="import" className="w-6 h-5 bg-transparent pr-2 mt-1" />
                            <h1 className="mt-1.5">Import file</h1>
                        </button>
                        <div className="rounded-lg border border-gray-200 mt-7 border-l-8 border-l-[#BF9853] w-[238px]">
                            <div className="bg-[#FAF6ED]">
                                <table className="table-auto ">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2 text-left w-16 text-base font-bold">S.No</th>
                                            <th className="p-2 text-left w-48 text-base font-bold">Mix</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                            <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                <table className="table-auto w-[16.5rem]">
                                    <tbody>
                                        {filteredBeamNames.map((item, index) => (
                                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                                                <td className="p-2 text-left font-semibold">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </td>
                                                <td className="p-2 group flex justify-between items-center font-semibold ml-5">
                                                    {item.beamName}
                                                    <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <button type="button">
                                                            <img
                                                                src={edit}
                                                                alt="edit"
                                                                className="w-4 h-4"
                                                            />
                                                        </button>
                                                        <button>
                                                            <img src={deleteIcon} alt="delete" className="w-4 h-4"
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className='ml-7'>
                        <div className="flex items-center mb-2">
                            <input
                                type="text"
                                className="border-2 rounded-lg border-[#BF9853] w-[174px] h-[45px] border-opacity-[0.17] pl-3 placeholder:text-sm placeholder:text-gray-500 placeholder:font-semibold"
                                placeholder="Search Size.."
                                value={BeamNameSearch}
                            />
                            <button className="-ml-8 mt-5 transform -translate-y-1/2 text-gray-500">
                                <img src={search} alt='search' className=' w-5 h-5' />
                            </button>
                            <button className=" text-black font-bold px-1 ml-6 rounded border-dashed border-b-2 border-[#BF9853]">
                                + Add
                            </button>
                        </div>
                        <button className="text-[#E4572E] font-semibold -mb-4 text-sm flex">
                            <img src={imports} alt="import" className="w-6 h-5 bg-transparent pr-2 mt-1" />
                            <h1 className="mt-1.5">Import file</h1>
                        </button>
                        <div className="rounded-lg border border-gray-200 mt-7 border-l-8 border-l-[#BF9853] w-[238px]">
                            <div className="bg-[#FAF6ED]">
                                <table className="table-auto ">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2 text-left w-16 text-base font-bold">SI.No</th>
                                            <th className="p-2 text-left w-48 text-base font-bold">Size</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                            <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                <table className="table-auto w-[16.5rem]">
                                    <tbody>
                                        {filteredBeamNames.map((item, index) => (
                                            <tr key={item.id} className="border-b odd:bg-white even:bg-[#FAF6ED]">
                                                <td className="p-2 text-left font-semibold">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </td>
                                                <td className="p-2 group flex justify-between items-center font-semibold ml-5">
                                                    {item.beamName}
                                                    <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <button type="button">
                                                            <img
                                                                src={edit}
                                                                alt="edit"
                                                                className="w-4 h-4"
                                                            />
                                                        </button>
                                                        <button>
                                                            <img src={deleteIcon} alt="delete" className="w-4 h-4"
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddInput
