import React, { useState, useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import Select from 'react-select';
import Import from '../Images/download.png';
import Edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';
const Database = () => {
    // Sample data
    const data = useMemo(() => [
        { slNo: 1, TimeStamp: '13/04/2024', date: '13/04/2024', clientName: 'Mr.Sivaraman', projectType: 'Residential', invoiceNo: 'INV252-02', totalAmount: '1,52,000' },
        { slNo: 2, TimeStamp: '11/04/2024', date: '11/04/2024', clientName: 'Mr.Sivaraman', projectType: 'Residential', invoiceNo: 'INV252-01', totalAmount: '28,000' },
        { slNo: 3, TimeStamp: '11/04/2024', date: '11/04/2024', clientName: 'Mr.Sivaraman', projectType: 'Residential', invoiceNo: 'INV252', totalAmount: '31,000' },
        // More rows...
    ], []);

    const columns = useMemo(() => [
        { Header: 'Sl.No', accessor: 'slNo' },
        { Header: 'TimeStamp', accessor: 'TimeStamp' },
        { Header: 'Date', accessor: 'date' },
        { Header: 'Client Name', accessor: 'clientName' },
        { Header: 'Project Type', accessor: 'projectType' },
        { Header: 'Invoice No', accessor: 'invoiceNo' },
        { Header: 'Total Amount', accessor: 'totalAmount' },
        { Header: 'Invoice', accessor: 'invoiceLink', Cell: () => <a href="#" className="text-red-500 font-semibold underline">View</a> },
        {
            Header: 'Activity', accessor: 'Activity',
            Cell: () => (
                <div className="flex space-x-3">
                    <img src={Edit} alt="Edit" />
                    <img src={deleteIcon} alt="Import" className='w-5 h-5'/>
                </div>
            )
        }
    ], []);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
        { columns, data },
        useSortBy
    );

    // State for filters
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
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
        <div className="bg-[#FAF6ED]">
            <div className="p-2">
                <div className="bg-white h-36 p-5 rounded-lg mx-auto ml-32" style={{ maxWidth: '1600px' }}>
                <div className="flex gap-4">
                            <div className=''>
                                <label className='font-bold mb-2 -ml-52'>Client Name</label>
                                <Select
                                    options={[{ label: 'Mr.Sivaraman', value: 'Mr.Sivaraman' }]}
                                    placeholder="Client Name"
                                    value={selectedClient}
                                    styles={customSelectStyles}
                                    onChange={setSelectedClient}
                                    className="w-80 mt-2 h-11 font-semibold border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg focus:outline-none"

                                />
                            </div>
                            <div className='flex flex-col '>
                                <label className='font-bold mb-2 -ml-28'>Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg focus:outline-none h-11"
                                />
                            </div>
                            <div className='flex flex-col'>
                                <label className='-ml-52 font-bold'>Project Type</label>
                                <Select
                                    options={[{ label: 'Residential', value: 'Residential' }, { label: 'Real Estate', value: 'Real Estate' }]}
                                    placeholder="Select Project"
                                    value={selectedProject}
                                    onChange={setSelectedProject}
                                    className="w-80 mt-2 h-11 font-semibold border border-[#FAF6ED] border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg focus:outline-none"
                                    styles={customSelectStyles}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-bold -ml-10">Invoice/Quotation</label>
                                <select
                                    className="w-48 text-balance border border-[#FAF6ED] h-11 border-r-[0.25rem] border-l-[0.25rem] border-b-[0.25rem] border-t-[0.25rem] rounded-lg focus:outline-none mt-2"
                                    defaultValue="Enter Num" // Ensure the placeholder is selected by default
                                >
                                    <option></option>
                                </select>
                            </div>

                        </div>
                </div>
                <div className="bg-white mx-auto mt-10 pt-7 pr-7 ml-32" style={{ maxWidth: '1600px' }}>
                    <div className="ml-5 text-left rounded-l-lg" style={{ width: '100%', borderLeft: '8px solid #BF9853', backgroundColor: '#FAF6ED' }}>
                        <table {...getTableProps()} className="w-full rounded-lg mt-4">
                            <thead className="bg-[#FAF6ED]">
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(column => (
                                            <th
                                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                                className=" px-4 py-2 text-left font-semibold"
                                            >
                                                {column.render('Header')}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody {...getTableBodyProps()}>
                                {rows.map(row => {
                                    prepareRow(row);
                                    return (
                                        <tr {...row.getRowProps()} className="odd:bg-white even:bg-[#FAF6ED]">
                                            {row.cells.map(cell => (
                                                <td {...cell.getCellProps()} className=" px-4 py-2 text-left font-semibold">
                                                    {cell.render('Cell')}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Database;
