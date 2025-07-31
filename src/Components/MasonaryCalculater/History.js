import React from 'react'
import Select from "react-select";

const History = () => {
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
    return (
        <body>
            <div className=" mx-auto lg:w-[1800px] p-6 border-collapse bg-[#FFFFFF] ml-14 mr-6 rounded-md">
                <div className=" flex">
                    <div className=" flex">
                        <div className="w-full -mt-8 mb-4">
                            <h4 className=" mt-10 font-bold mb-2 lg:-ml-52 -ml-36">Project Name</h4>
                            <Select
                                placeholder="Select Site Name..."
                                className="border border-[#FAF6ED] border-r-[3px] border-l-[3px] border-b-[3px] border-t-[3px] rounded-lg lg:w-80 w-[323px] h-[45px] text-left"
                                styles={customSelectStyles}
                                isClearable />
                        </div>
                    </div>
                    <div className=" ml-6 mt-2">
                        <h4 className=" font-bold mb-2 -ml-32">Date </h4>
                        <input
                            type="date"
                            className="border border-[#FAF6ED] border-r-[3px] border-l-[3px] border-b-[3px] border-t-[3px] w-[168px] h-[45px] rounded-lg px-4 py-2 " />
                    </div>
                    <div>
                        <h4 className=" mt-2 font-bold -ml-24"> E.No</h4>
                        <input
                            className="bg-gray-100 rounded-lg w-[158px] h-[45px] mt-2 ml-5 pl-4"
                            readOnly />
                    </div>
                    <div className=" ml-6">
                        <h4 className=" mt-2 font-bold mb-2 ml-[-85px]"> Revision</h4>
                        <Select
                            placeholder="Select file..."
                            className="border border-[#FAF6ED] border-r-[3px] border-l-[3px] border-b-[3px] border-t-[3px] rounded-lg w-[158px] h-[45px]"
                            styles={customSelectStyles}
                            isClearable />
                    </div>
                </div>
            </div>
            <div className="w-[1800px] p-4 ml-14 mr-6 mt-5 bg-white">
                <div className="rounded-lg border border-l-8 p-3 border-l-[#BF9853] bg-[#FAF6ED] w-[1276px] h-[48px]">
                    <table>
                        <thead className="items-center ">
                            <tr>
                                <th className='pl-5'>SI.No</th>
                                <th className='pl-6'>
                                    <select className='w-[60px]  bg-transparent focus:outline-none'>
                                        <option>Date</option>
                                    </select>
                                </th>
                                <th className='pl-4'>
                                    <select className='w-[130px]  bg-transparent focus:outline-none'>
                                        <option>Project Name</option>
                                    </select>
                                </th>
                                <th className='pl-4'>
                                    <select className='w-[58px]  bg-transparent focus:outline-none'>
                                        <option>E.No</option>
                                    </select>
                                </th>
                                <th className='pl-4'>
                                    <select className='w-[120px]  bg-transparent focus:outline-none'>
                                        <option>MC Revision</option>
                                    </select>
                                </th>
                                <th className='pl-4'>
                                    <select className='w-[114px]  bg-transparent focus:outline-none'>
                                        <option>No of Bricks</option>
                                    </select>
                                </th>
                                <th className='pl-4'>
                                    <select className='w-[125px]  bg-transparent focus:outline-none'>
                                        <option>Cement Bags</option>
                                    </select>
                                </th>
                                <th className='pl-4'>
                                    <select className='w-[98px]  bg-transparent focus:outline-none'>
                                        <option>Sand Unit</option>
                                    </select>
                                </th>
                                <th className='pl-4'>
                                    <select className='w-[98px]  bg-transparent focus:outline-none'>
                                        <option>Total Sqft</option>
                                    </select>
                                </th>
                                <th className='pl-6'>File</th>
                                <th className='pl-8'>Print</th>
                                <th className='pl-6'>Activity</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </body>
    )
}

export default History
