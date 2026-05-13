import React, { useState } from 'react';
import Select from 'react-select';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useUtilityHubTableDragScroll } from './useUtilityHubTableDragScroll';

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
        shop: '',
        doorNo: '',
        projectName: '',
        projectType: '',
        tenant: '',
        occupancyStatus: ''
    });

    const { scrollRef, onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = useUtilityHubTableDragScroll();

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

    const amcFilterFieldLabels = {
        year: 'Year',
        month: 'Month',
        paymentStatus: 'Payment Status',
        vendor: 'Vendor',
        service: 'Service',
        shop: 'Shop',
        doorNo: 'Door No',
        projectName: 'Project Name',
        projectType: 'Project Type',
        tenant: 'Tenant',
        occupancyStatus: 'Occupancy Status'
    };

    const amcFilterExportOrder = [
        'year',
        'month',
        'paymentStatus',
        'vendor',
        'service',
        'shop',
        'doorNo',
        'projectName',
        'projectType',
        'tenant',
        'occupancyStatus'
    ];

    const buildAmcFilterExportBody = () =>
        amcFilterExportOrder.map((key) => [
            amcFilterFieldLabels[key] || key,
            filters[key] && String(filters[key]).trim() !== '' ? String(filters[key]) : '-'
        ]);

    const handleExportPDF = () => {
        const doc = new jsPDF({ orientation: 'portrait' });
        doc.setFontSize(14);
        doc.text('AMC Utility – Filter snapshot', 14, 20);
        doc.autoTable({
            head: [['Field', 'Value']],
            body: buildAmcFilterExportBody(),
            startY: 28,
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [191, 152, 83] },
            margin: { left: 14, right: 14 }
        });
        doc.save('AMCUtilityFilters.pdf');
    };

    const handleExportExcel = () => {
        const row = {};
        amcFilterExportOrder.forEach((key) => {
            const label = amcFilterFieldLabels[key] || key;
            const value = filters[key];
            row[label] = value && String(value).trim() !== '' ? String(value) : '';
        });
        const worksheet = XLSX.utils.json_to_sheet([row]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'AMCFilters');
        XLSX.writeFile(workbook, 'AMCUtilityFilters.xlsx');
    };

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="bg-white rounded-md mb-5 ml-5 mr-5">
                <div
                    ref={scrollRef}
                    className="rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] max-h-[480px] overflow-auto select-none thin-scrollbar"
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseLeave}
                >
                <div className="p-6">
                    <div className="flex justify-end gap-4 mb-4 text-sm text-black">
                        <button
                            type="button"
                            onClick={handleExportPDF}
                            className="flex items-center font-semibold gap-2 hover:text-blue-600"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            Export PDF
                        </button>
                        <button
                            type="button"
                            onClick={handleExportExcel}
                            className="flex items-center font-semibold gap-2 hover:text-green-600"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Export XL
                        </button>
                    </div>
                    <div className="grid grid-cols-6 gap-4 text-left">
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
        </div>
    );
};

export default AMCTab;
