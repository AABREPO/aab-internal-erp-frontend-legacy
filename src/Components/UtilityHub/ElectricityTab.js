import React, { useState } from 'react';

const ElectricityTab = ({ username, userRoles = [] }) => {
    const [filters, setFilters] = useState({
        year: '',
        vendor: '',
        service: '',
        doorNo: '',
        shop: '',
        projectName: '',
        tenant: ''
    });

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    return (
        <div className="bg-[#FAF6ED] rounded-lg shadow-sm">
            {/* Filter Section */}
            <div className="bg-white rounded-md mb-5 h-[128px] ml-5 mr-5">
                <div className="p-6">
                    <div className="flex text-left gap-4">
                        <div>
                            <label className="block font-semibold mb-1">Year</label>
                            <select
                                className="w-full h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-35 rounded-lg focus:outline-none"
                                value={filters.year}
                                onChange={(e) => handleFilterChange('year', e.target.value)}
                            >
                                <option value="">Select Year</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Vendor</label>
                            <select
                                className="w-full h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-35 rounded-lg focus:outline-none"
                                value={filters.vendor}
                                onChange={(e) => handleFilterChange('vendor', e.target.value)}
                            >
                                <option value="">Select Vendor</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Service</label>
                            <select
                                className="w-full h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-35 rounded-lg focus:outline-none"
                                value={filters.service}
                                onChange={(e) => handleFilterChange('service', e.target.value)}
                            >
                                <option value="">Select Service</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Door No</label>
                            <select
                                className="w-full h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-35 rounded-lg focus:outline-none"
                                value={filters.doorNo}
                                onChange={(e) => handleFilterChange('doorNo', e.target.value)}
                            >
                                <option value="">Select Door No</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Shop</label>
                            <select
                                className="w-full h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-35 rounded-lg focus:outline-none"
                                value={filters.shop}
                                onChange={(e) => handleFilterChange('shop', e.target.value)}
                            >
                                <option value="">Select Shop</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Project Name</label>
                            <select
                                className="w-full h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-35 rounded-lg focus:outline-none"
                                value={filters.projectName}
                                onChange={(e) => handleFilterChange('projectName', e.target.value)}
                            >
                                <option value="">Select Project</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Tenant</label>
                            <select
                                className="w-full h-[45px] px-3 py-2 border-2 border-[#BF9853] border-opacity-35 rounded-lg focus:outline-none"
                                value={filters.tenant}
                                onChange={(e) => handleFilterChange('tenant', e.target.value)}
                            >
                                <option value="">Select Tenant</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-md ml-5 mr-5 p-6">
                {/* Data Table */}
                <div className="p-6">
                    <div className=" flex justify-end gap-4 text-sm text-black mr-5">
                        <button className="flex items-center font-semibold gap-2 ">
                            Export PDF
                        </button>
                        <button className="flex items-center font-semibold gap-2">
                            Export XL
                        </button>
                        <button className="flex items-center font-semibold gap-2">
                            Print
                        </button>
                    </div>
                    <div className="border-l-8 border-l-[#BF9853] rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF6ED]">
                                        <td className=" px-4 py-2 text-left font-semibold">Sl.No</td>
                                        <td className=" px-4 py-2 text-left font-semibold">PID</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Project Name</td>
                                        <td className=" px-4 py-2 text-left font-semibold">D.No</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Service No</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Jan</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Feb</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Mar</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Apr</td>
                                        <td className=" px-4 py-2 text-left font-semibold">May</td>
                                        <td className=" px-4 py-2 text-left font-semibold">June</td>
                                        <td className=" px-4 py-2 text-left font-semibold">July</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Aug</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Sep</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Oct</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Nov</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Dec</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Hide</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="odd:bg-white even:bg-[#FAF6ED]"></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElectricityTab;
