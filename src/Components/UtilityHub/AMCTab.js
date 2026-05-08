import React, { useState } from 'react';
import Select from 'react-select';

const AMCTab = ({ username, userRoles = [] }) => {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const paymentStatusOptions = [
        { value: 'Paid', label: 'Paid' },
        { value: 'Unpaid', label: 'Unpaid' }
    ];
    const occupancyStatusOptions = [
        { value: 'occupied', label: 'Occupied Shop' },
        { value: 'vacated', label: 'Vacated Shop' }
    ];

    const [filters, setFilters] = useState({
        year: new Date().getFullYear().toString(),
        month: '',
        paymentStatus: '',
        vendor: '',
        service: '',
        doorNo: '',
        shop: '',
        projectName: '',
        projectType: '',
        tenant: '',
        occupancyStatus: ''
    });

    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            height: '45px',
            border: '2px solid #BF9853',
            borderOpacity: '0.35',
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': {
                border: '2px solid #BF9853',
            },
            ...(state.isFocused && {
                border: '2px solid #BF9853',
                boxShadow: 'none',
            }),
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#BF9853' : state.isFocused ? '#F5F5F5' : 'white',
            color: state.isSelected ? 'white' : 'black',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#9CA3AF',
        }),
        menuPortal: (base) => ({ ...base, zIndex: 100000 }),
        menu: (base) => ({ ...base, zIndex: 100000 }),
    };

    const selectPortalProps = {
        menuPortalTarget: document.body,
        menuPosition: 'fixed',
    };

    const handleFilterChange = (filterType, selectedOption) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: selectedOption ? selectedOption.value : ''
        }));
    };

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="bg-white rounded-md mb-5 min-h-[128px] ml-5 mr-5">
                <div className="p-6">
                    <div className="grid grid-cols-5 gap-4 text-left">
                        <div>
                            <label className="block font-semibold mb-1">Year</label>
                            <Select
                                options={[
                                    { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
                                    { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
                                    { value: (new Date().getFullYear() - 2).toString(), label: (new Date().getFullYear() - 2).toString() }
                                ]}
                                value={filters.year ? { value: filters.year, label: filters.year } : { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() }}
                                onChange={(selectedOption) => handleFilterChange('year', selectedOption)}
                                placeholder="Select Year"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Month</label>
                            <Select
                                options={monthLabels.map(month => ({ value: month, label: month }))}
                                value={filters.month ? { value: filters.month, label: filters.month } : null}
                                onChange={(selectedOption) => handleFilterChange('month', selectedOption)}
                                placeholder="Select Month"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Payment Status</label>
                            <Select
                                options={paymentStatusOptions}
                                value={filters.paymentStatus ? { value: filters.paymentStatus, label: filters.paymentStatus } : null}
                                onChange={(selectedOption) => handleFilterChange('paymentStatus', selectedOption)}
                                placeholder="Select Status"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Vendor</label>
                            <Select
                                options={[]}
                                value={filters.vendor ? { value: filters.vendor, label: filters.vendor } : null}
                                onChange={(selectedOption) => handleFilterChange('vendor', selectedOption)}
                                placeholder="Select Vendor"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Service</label>
                            <Select
                                options={[]}
                                value={filters.service ? { value: filters.service, label: filters.service } : null}
                                onChange={(selectedOption) => handleFilterChange('service', selectedOption)}
                                placeholder="Select Service No"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Door No</label>
                            <Select
                                options={[]}
                                value={filters.doorNo ? { value: filters.doorNo, label: filters.doorNo } : null}
                                onChange={(selectedOption) => handleFilterChange('doorNo', selectedOption)}
                                placeholder="Select Door No"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Shop</label>
                            <Select
                                options={[]}
                                value={filters.shop ? { value: filters.shop, label: filters.shop } : null}
                                onChange={(selectedOption) => handleFilterChange('shop', selectedOption)}
                                placeholder="Select Shop"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Project Name</label>
                            <Select
                                options={[]}
                                value={filters.projectName ? { value: filters.projectName, label: filters.projectName } : null}
                                onChange={(selectedOption) => handleFilterChange('projectName', selectedOption)}
                                placeholder="Select Project"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Project Type</label>
                            <Select
                                options={[]}
                                value={filters.projectType ? { value: filters.projectType, label: filters.projectType } : null}
                                onChange={(selectedOption) => handleFilterChange('projectType', selectedOption)}
                                placeholder="Select Project Type"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Tenant</label>
                            <Select
                                options={[]}
                                value={filters.tenant ? { value: filters.tenant, label: filters.tenant } : null}
                                onChange={(selectedOption) => handleFilterChange('tenant', selectedOption)}
                                placeholder="Select Tenant"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Occupancy Status</label>
                            <Select
                                options={occupancyStatusOptions}
                                value={filters.occupancyStatus ? { value: filters.occupancyStatus, label: occupancyStatusOptions.find(o => o.value === filters.occupancyStatus)?.label || filters.occupancyStatus } : null}
                                onChange={(selectedOption) => handleFilterChange('occupancyStatus', selectedOption)}
                                placeholder="Select Status"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AMCTab;
