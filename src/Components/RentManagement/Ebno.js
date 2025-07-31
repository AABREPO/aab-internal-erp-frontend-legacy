import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import Edit from '../Images/Edit.svg'
import Select from 'react-select';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Ebno = () => {

    const [rentForms, setRentForms] = useState([]);
    const [ebtenantShopData, setEbTenantShopData] = useState([]);
    const [ebproperties, setEbProperties] = useState([]);
    const [selectedEbShopNo, setSelectedEbShopNo] = useState('');
    const [selectedEbDoorNo, setSelectedEbDoorNo] = useState('');
    const [selectedEbNo, setSelectedEbNo] = useState('');
    const [selectedEbTenantName, setSelectedEbTenantName] = useState('');
    const [selectedEbProperty, setSelectedEbProperty] = useState(null);
    const [ebtableData, setEbTableData] = useState([]);
    const [ebNoOptions, setEbNoOptions] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/properties/all');
            if (response.ok) {
                const data = await response.json();
                setEbProperties(data);
                console.log("✅ Full property :", data);
                // 🧠 Flatten all propertyDetailsList and extract unique ebNos
                const ebNos = data
                    .flatMap(property => property.propertyDetailsList || [])
                    .map(detail => detail.ebNo)
                    .filter(eb => !!eb); // Remove undefined/null/empty

                const uniqueEbNos = [...new Set(ebNos)].map(eb => ({ value: eb, label: eb }));
                setEbNoOptions(uniqueEbNos);

                console.log("✅ EB Options:", uniqueEbNos);
            } else {
                console.log('❌ Error fetching properties.');
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
        }
    };
    useEffect(() => {
        fetchTenants();
    }, []);
    const fetchTenants = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/tenantShop/getAll');
            if (response.ok) {
                const data = await response.json();
                setEbTenantShopData(data);
                console.log(data);
            } else {
                console.error('Error fetching tenants.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const shopInfoMap = {};
    ebtenantShopData.forEach(tenant => {
        tenant.property?.forEach(property => {
            property.shops?.forEach(shop => {
                if (shop.shopNo) {
                    shopInfoMap[shop.shopNo] = {
                        doorNo: shop.doorNo || '',
                        propertyName: property.propertyName || '',
                        advanceAmount: shop.advanceAmount || '',
                        monthlyRent: shop.monthlyRent || '',
                        tenantId: tenant.id,     // ← Add tenant ID
                        shopId: shop.id,          // ← Add shop ID
                        startingDate: shop.startingDate,
                        shouldCollectAdvance: shop.shouldCollectAdvance
                    };
                }
            });
        });
    });
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    useEffect(() => {
        const allShops = [];
        // 1. Collect all shop data from properties
        ebproperties.forEach(property => {
            property.propertyDetailsList?.forEach(shop => {
                if (shop.shopNo) {
                    allShops.push({
                        shopNo: shop.shopNo,
                        doorNo: shop.doorNo || '',
                        propertyName: property.propertyName || '',
                        advance: null,
                        tenantName: null,
                        tenantId: null,
                        shopId: shop.id,
                        active: false
                    });
                }
            });
        });
        // 2. Merge tenant data (excluding advance)
        ebtenantShopData.forEach(tenant => {
            tenant.property?.forEach(property => {
                property.shops?.forEach(shop => {
                    const shopEntryIndex = allShops.findIndex(s => s.shopNo === shop.shopNo);
                    if (shopEntryIndex !== -1) {
                        allShops[shopEntryIndex] = {
                            ...allShops[shopEntryIndex],
                            tenantName: tenant.tenantName || '',
                            tenantId: tenant.id,
                            active: shop.active ?? true
                        };
                    }
                });
            });
        });
        // 3. Filter rent data for selected year
        const filteredForms = rentForms.filter(entry => {
            const date = new Date(entry.forTheMonthOf);
            return (entry.formType === 'Rent' || entry.formType === 'Pending Rent')
        });
        // 4. Group rents and collect detailed history
        const groupedRentals = {};
        const rentHistoryMap = {};
        filteredForms.forEach(entry => {
            const month = new Date(entry.forTheMonthOf).getMonth();
            const shopKey = entry.shopNo;
            const amount = parseFloat(entry.amount || 0);
            const paidOn = formatDateOnly(entry.paidOnDate) || '';
            if (!groupedRentals[shopKey]) {
                groupedRentals[shopKey] = Array(12).fill(null).map(() => []);
            }
            if (!rentHistoryMap[shopKey]) {
                rentHistoryMap[shopKey] = Array(12).fill(null).map(() => []);
            }
            groupedRentals[shopKey][month].push(amount);
            rentHistoryMap[shopKey][month].push(`${paidOn} - ₹${amount.toLocaleString()}`);
        });
        // 5. Advance map and history
        const advanceMap = {};
        const advanceDetailsMap = {};
        rentForms.forEach(entry => {
            if (entry.formType === 'Advance' && entry.shopNo) {
                const amount = parseFloat(entry.amount || 0);
                const paidOn = formatDateOnly(entry.paidOnDate) || '';
                const shopKey = entry.shopNo;
                if (!advanceMap[shopKey]) {
                    advanceMap[shopKey] = 0;
                    advanceDetailsMap[shopKey] = [];
                }
                advanceMap[shopKey] += amount;
                advanceDetailsMap[shopKey].push(`${paidOn} - ₹${amount.toLocaleString()}`);
            }
        });
        // 6. Final table data
        const finalTableData = [];
        allShops.forEach((shop) => {
            const months = groupedRentals[shop.shopNo] || Array(12).fill(null).map(() => []);
            const rentDetails = rentHistoryMap[shop.shopNo] || Array(12).fill([]);
            const advanceDetails = advanceDetailsMap[shop.shopNo] || [];

            const wasActiveThisYear = months.some(monthArr => monthArr.length > 0);
            const row = {
                shNo: finalTableData.length + 1,
                shopNo: shop.shopNo,
                tenantName: shop.active ? shop.tenantName : "Vacant",
                doorNo: shop.doorNo,
                advance: shop.active,
                advanceDetails: shop.active ? advanceDetails : [],
                months,
                rentDetails,
                propertyName: shop.propertyName,
                vacated: !shop.active && wasActiveThisYear,
                startingDate: shop.active ? shopInfoMap[shop.shopNo]?.startingDate : null,
                shouldCollectAdvance: shopInfoMap[shop.shopNo]?.shouldCollectAdvance ?? true
            };
            if (!shop.active && wasActiveThisYear) {
                const hasAnotherActiveTenant = allShops.some(
                    s => s.shopNo === shop.shopNo && s.active
                );
                finalTableData.push({
                    ...row,
                    tenantName: shop.tenantName || 'Vacated',
                    vacated: true
                });
                if (!hasAnotherActiveTenant) {
                    finalTableData.push({
                        ...row,
                        tenantName: 'Vacant',
                        advance: null,
                        advanceDetails: [],
                        months: Array(12).fill([]),
                        rentDetails: Array(12).fill([]),
                        vacated: false
                    });
                }
            } else {
                finalTableData.push(row);
            }
        });
        setEbTableData(finalTableData);
    }, [rentForms, ebtenantShopData, ebproperties]);

    const options = ebproperties.map((property) => ({
        value: property.propertyName,
        label: property.propertyName,
    }));

    const shopOptions = [...new Set(ebtableData.map(shop => shop.shopNo))].map(no => ({ value: no, label: no }));
    const filteredByShop = selectedEbShopNo
        ? ebtableData.filter(shop => shop.shopNo === selectedEbShopNo)
        : ebtableData;
    const tenantOptions = [...new Set(filteredByShop.map(shop => shop.tenantName))].map(name => ({ value: name, label: name }));
    const filteredByTenant = selectedEbTenantName
        ? filteredByShop.filter(shop => shop.tenantName === selectedEbTenantName)
        : filteredByShop;
    const doorOptions = [...new Set(filteredByTenant.map(shop => shop.doorNo))].map(door => ({ value: door, label: door }));

    const selectedTenant = ebtenantShopData.find(
        t => t.tenantName === selectedEbTenantName
    );

    // Extract all shopNos for the selected tenant
    const tenantShopNos = selectedTenant?.property?.flatMap(p =>
        p.shops?.map(shop => shop.shopNo)
    ) || [];

    const filteredEbProperties = ebproperties.flatMap(property => {
        const owner = property.ownerDetailsList?.[0] || {};

        return (property.propertyDetailsList || [])
            .filter(detail => {
                const matchesTenant = !selectedEbTenantName || tenantShopNos.includes(detail.shopNo);

                return (
                    (!selectedEbNo || detail.ebNo === selectedEbNo) &&
                    (!selectedEbShopNo || detail.shopNo === selectedEbShopNo) &&
                    (!selectedEbDoorNo || detail.doorNo === selectedEbDoorNo) &&
                    matchesTenant &&
                    (!selectedEbProperty || selectedEbProperty.value === property.propertyName)
                );
            })
            .map(detail => {
                let matchedTenantName = '';

                for (const tenant of ebtenantShopData) {
                    for (const prop of tenant.property || []) {
                        for (const shop of prop.shops || []) {
                            if (shop.shopNo === detail.shopNo && shop.doorNo === detail.doorNo) {
                                matchedTenantName = tenant.tenantName;
                                break;
                            }
                        }
                    }
                    if (matchedTenantName) break;
                }

                return {
                    property,
                    owner,
                    detail,
                    tenantName: matchedTenantName
                };
            });
    });
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };
    const sortedEbProperties = [...filteredEbProperties].sort((a, b) => {
        const getValue = (obj) => {
            if (!sortField) return '';
            if (sortField === 'propertyName') return obj.property.propertyName || '';
            if (sortField === 'ownerName') return obj.owner.ownerName || '';
            return obj.detail[sortField] || '';
        };

        let valA = getValue(a)?.toString().toLowerCase();
        let valB = getValue(b)?.toString().toLowerCase();

        if (sortField === 'shopNo') {
            valA = valA.charAt(0);
            valB = valB.charAt(0);
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
    const generatePdf = () => {
        const doc = new jsPDF();
        // ✅ Add heading at the top (centered)
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("EB Property List", 14, 15);

        const tableColumn = [
            "Property Name",
            "Owner Name",
            "Property Type",
            "Floor Name",
            "Shop No",
            "Door No",
            "Area",
            "EB.No"
        ];

        const tableRows = filteredEbProperties.map(({ property, owner, detail }) => [
            property.propertyName || " - ",
            owner.ownerName || " - ",
            detail.propertyType || " - ",
            detail.floorName || " - ",
            detail.shopNo || " - ",
            detail.doorNo || " - ",
            detail.area || " - ",
            detail.ebNo || " - "
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 22, // ⬅️ Start below the title
            styles: {
                fontSize: 8,
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
            },
            headStyles: {
                fontStyle: 'bold',
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
            },
            bodyStyles: {
                fontStyle: 'normal',
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
            },
            didParseCell: (data) => {
                data.cell.styles.fillColor = [255, 255, 255];
            }
        });

        doc.save("eb-properties.pdf");
    };

    return (
        <div>
            <div className='mx-auto lg:w-[1750px] p-4 lg:pl-8 bg-white lg:ml-7 lg:mr-6 rounded-md text-left flex'>
                <div>
                    <h1 className='font-semibold mb-3'>Select EB NO</h1>
                    <Select
                        options={ebNoOptions}
                        isClearable
                        placeholder="Select Eb No"
                        value={ebNoOptions.find(o => o.value === selectedEbNo) || null}
                        onChange={(option) => setSelectedEbNo(option?.value || '')}
                        className="w-[200px]"
                        styles={{
                            control: (provided, state) => ({
                                ...provided,
                                height: '45px',
                                minHeight: '45px',
                                backgroundColor: 'transparent',
                                borderWidth: '2px',
                                borderColor: 'rgba(191, 152, 83, 1)',
                                borderRadius: '8px',
                                boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 1)' : 'none',
                                '&:hover': {
                                    borderColor: 'rgba(191, 152, 83, 1)',
                                },
                            }),
                            placeholder: (provided) => ({
                                ...provided,
                                color: '#999',
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: 'black',
                            }),
                        }}
                    />
                </div>
                <div className="flex gap-4 mt-9 ml-3.5 w-full flex-wrap">
                    <div className="min-w-[200px]">
                        <Select
                            options={shopOptions}
                            isClearable
                            placeholder="Select Shop No"
                            value={shopOptions.find(o => o.value === selectedEbShopNo) || null}
                            onChange={(option) => {
                                setSelectedEbShopNo(option?.value || '');
                                setSelectedEbTenantName('');
                                setSelectedEbDoorNo('');
                            }}
                            styles={{
                                control: (provided, state) => ({
                                    ...provided,
                                    height: '45px',
                                    minHeight: '45px',
                                    backgroundColor: 'transparent',
                                    borderWidth: '2px',
                                    borderColor: state.isFocused
                                        ? 'rgba(191, 152, 83, 1)'
                                        : 'rgba(191, 152, 83, 1)',
                                    borderRadius: '8px',
                                    boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 1)' : 'none',
                                    '&:hover': {
                                        borderColor: 'rgba(191, 152, 83, 1)',
                                    },
                                }),
                                placeholder: (provided) => ({
                                    ...provided,
                                    color: '#999',
                                }),
                                singleValue: (provided) => ({
                                    ...provided,
                                    color: 'black',
                                }),
                            }}
                        />
                    </div>
                    <div className="min-w-[200px]">
                        <Select
                            options={tenantOptions}
                            isClearable
                            placeholder="Select Tenant Name"
                            value={tenantOptions.find(o => o.value === selectedEbTenantName) || null}
                            onChange={(option) => {
                                setSelectedEbTenantName(option?.value || '');
                                setSelectedEbDoorNo('');
                            }}
                            isDisabled={!filteredByShop.length}
                            styles={{
                                control: (provided, state) => ({
                                    ...provided,
                                    height: '45px',
                                    minHeight: '45px',
                                    backgroundColor: 'transparent',
                                    borderWidth: '2px',
                                    borderColor: state.isFocused
                                        ? 'rgba(191, 152, 83, 1)'
                                        : 'rgba(191, 152, 83, 1)',
                                    borderRadius: '8px',
                                    boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 1)' : 'none',
                                    '&:hover': {
                                        borderColor: 'rgba(191, 152, 83, 1)',
                                    },
                                }),
                                placeholder: (provided) => ({
                                    ...provided,
                                    color: '#999',
                                }),
                                singleValue: (provided) => ({
                                    ...provided,
                                    color: 'black',
                                }),
                            }}
                        />
                    </div>
                    <div className="min-w-[200px]">
                        <Select
                            options={doorOptions}
                            placeholder="Select Door No"
                            isClearable
                            value={doorOptions.find(o => o.value === selectedEbDoorNo) || null}
                            onChange={(option) => setSelectedEbDoorNo(option?.value || '')}
                            isDisabled={!filteredByTenant.length}
                            styles={{
                                control: (provided, state) => ({
                                    ...provided,
                                    height: '45px',
                                    minHeight: '45px',
                                    backgroundColor: 'transparent',
                                    borderWidth: '2px',
                                    borderColor: state.isFocused
                                        ? 'rgba(191, 152, 83, 1)'
                                        : 'rgba(191, 152, 83, 1)',
                                    borderRadius: '8px',
                                    boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 1)' : 'none',
                                    '&:hover': {
                                        borderColor: 'rgba(191, 152, 83, 1)',
                                    },
                                }),
                                placeholder: (provided) => ({
                                    ...provided,
                                    color: '#999',
                                }),
                                singleValue: (provided) => ({
                                    ...provided,
                                    color: 'black',
                                }),
                            }}
                        />
                    </div>
                    <div className="min-w-[200px]">
                        <Select
                            className="w-[300px]"
                            options={options}
                            value={selectedEbProperty}
                            isClearable
                            onChange={setSelectedEbProperty}
                            placeholder="Select"
                            isSearchable
                            styles={{
                                control: (provided, state) => ({
                                    ...provided,
                                    height: '45px',
                                    minHeight: '45px',
                                    backgroundColor: 'transparent',
                                    borderWidth: '2px',
                                    borderColor: state.isFocused
                                        ? 'rgba(191, 152, 83, 1)'
                                        : 'rgba(191, 152, 83, 1)',
                                    borderRadius: '8px',
                                    boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 1)' : 'none',
                                    '&:hover': {
                                        borderColor: 'rgba(191, 152, 83, 1)',
                                    },
                                }),
                                placeholder: (provided) => ({
                                    ...provided,
                                    color: '#999',
                                }),
                                singleValue: (provided) => ({
                                    ...provided,
                                    color: 'black',
                                }),
                            }}
                        />
                    </div>

                </div>
            </div>
            <div className='mx-auto lg:w-[1750px] p-4 lg:pl-8 mt-6 bg-white lg:ml-7 mr-6 rounded-md'>
                <div className="flex justify-between">
                    <div></div>
                    <div>
                        <h1
                            className='font-bold text-sm mt-2 mb-3 text-[#E4572E] cursor-pointer hover:underline'
                            onClick={generatePdf}
                        >
                            Export PDF
                        </h1>
                    </div>
                </div>
                <div className="rounded-lg border-l-8 border-[#BF9853] h-[500px] overflow-x-auto no-scrollbar">
                    <table className="border-collapse w-full text-left">
                        <thead className="h-10">
                            <tr className="bg-[#FAF6ED]">
                                <th className="pl-3">S.No</th>
                                <th onClick={() => handleSort('propertyName')} className="cursor-pointer px-4 py-2 font-semibold">
                                    Property Name {sortField === 'propertyName' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('shopNo')} className="cursor-pointer  font-semibold">
                                    Shop No {sortField === 'shopNo' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('doorNo')} className="cursor-pointer  font-semibold">
                                    Door No {sortField === 'doorNo' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('ownerName')} className="cursor-pointer  font-semibold">
                                    Owner Name {sortField === 'ownerName' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('propertyType')} className="cursor-pointer  font-semibold">
                                    Property Type {sortField === 'propertyType' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('floorName')} className="cursor-pointer  font-semibold">
                                    Floor Name {sortField === 'floorName' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Area</th>
                                <th onClick={() => handleSort('ebNo')} className="cursor-pointer  font-semibold">
                                    EB No {sortField === 'ebNo' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-2 font-semibold">Tenant Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedEbProperties.map(({ property, owner, detail, tenantName }, index) => (
                                <tr key={`${property.id}-${detail.id}-${index}`} className="border-b border-gray-200 odd:bg-white even:bg-[#FAF6ED]">
                                    <td className="pl-5 py-2">{index + 1}.</td>
                                    <td className="pl-2">{property.propertyName || '-'}</td>
                                    <td>{detail.shopNo || '-'}</td>
                                    <td>{detail.doorNo || '-'}</td>
                                    <td>{owner.ownerName || '-'}</td>
                                    <td>{detail.propertyType || '-'}</td>
                                    <td>{detail.floorName || '-'}</td>
                                    <td>{detail.area || '-'}</td>
                                    <td>{detail.ebNo || '-'}</td>
                                    <td>{tenantName || '-'}</td> {/* New column */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Ebno