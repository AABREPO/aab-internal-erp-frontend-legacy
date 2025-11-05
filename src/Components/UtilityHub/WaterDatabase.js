import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

const WaterDatabase = ({ username, userRoles = [] }) => {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        projectName: '',
        doorNo: '',
        serviceNo: '',
        projectType: ''
    });

    // Fetch projects data
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('https://backendaab.in/aabuilderDash/api/projects/getAll');
                // Filter projects that have waterNo in propertyDetails
                const projectsWithWaterNo = response.data.filter(project =>
                    project.propertyDetails &&
                    project.propertyDetails.some(property => property.waterNo && property.waterNo.trim() !== '')
                );
                setProjects(projectsWithWaterNo);
                setFilteredProjects(projectsWithWaterNo);
            } catch (error) {
                console.error('Error fetching projects:', error);
                setError('Failed to fetch projects data');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = projects;

        if (filters.projectName) {
            filtered = filtered.filter(project =>
                project.projectName.toLowerCase().includes(filters.projectName.toLowerCase())
            );
        }

        if (filters.doorNo) {
            filtered = filtered.filter(project =>
                project.propertyDetails.some(property =>
                    property.doorNo && property.doorNo.toLowerCase().includes(filters.doorNo.toLowerCase())
                )
            );
        }

        if (filters.serviceNo) {
            filtered = filtered.filter(project =>
                project.propertyDetails.some(property =>
                    property.waterNo && property.waterNo.toLowerCase().includes(filters.serviceNo.toLowerCase())
                )
            );
        }

        if (filters.projectType) {
            filtered = filtered.filter(project =>
                project.propertyDetails.some(property =>
                    property.projectType && property.projectType.toLowerCase().includes(filters.projectType.toLowerCase())
                )
            );
        }

        setFilteredProjects(filtered);
    }, [filters, projects]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    // Custom styles for react-select
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
    };

    // Get unique values for filter options
    const getUniqueValues = (key) => {
        const values = new Set();
        projects.forEach(project => {
            if (key === 'projectName') {
                values.add(project.projectName);
            } else if (key === 'doorNo') {
                project.propertyDetails.forEach(property => {
                    if (property.doorNo) values.add(property.doorNo);
                });
            } else if (key === 'serviceNo') {
                project.propertyDetails.forEach(property => {
                    if (property.waterNo) values.add(property.waterNo);
                });
            } else if (key === 'projectType') {
                project.propertyDetails.forEach(property => {
                    if (property.projectType) values.add(property.projectType);
                });
            }
        });
        return Array.from(values).sort().map(value => ({
            value: value,
            label: value
        }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            projectName: '',
            doorNo: '',
            serviceNo: '',
            projectType: ''
        });
    };

    return (
        <div className="bg-[#FAF6ED] rounded-lg shadow-sm">
            <div className="bg-white rounded-md mb-5 h-[128px] ml-5 mr-5">
                <div className="p-6">
                    <div className="flex text-left gap-4">
                        <div>
                            <label className="block font-semibold mb-1">Project Name</label>
                            <Select
                                options={getUniqueValues('projectName')}
                                value={filters.projectName ? { value: filters.projectName, label: filters.projectName } : null}
                                onChange={(selectedOption) => handleFilterChange('projectName', selectedOption ? selectedOption.value : '')}
                                placeholder="Select Project"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Door No</label>
                            <Select
                                options={getUniqueValues('doorNo')}
                                value={filters.doorNo ? { value: filters.doorNo, label: filters.doorNo } : null}
                                onChange={(selectedOption) => handleFilterChange('doorNo', selectedOption ? selectedOption.value : '')}
                                placeholder="Select Door No"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Service No</label>
                            <Select
                                options={getUniqueValues('serviceNo')}
                                value={filters.serviceNo ? { value: filters.serviceNo, label: filters.serviceNo } : null}
                                onChange={(selectedOption) => handleFilterChange('serviceNo', selectedOption ? selectedOption.value : '')}
                                placeholder="Select Service No"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Project Type</label>
                            <Select
                                options={getUniqueValues('projectType')}
                                value={filters.projectType ? { value: filters.projectType, label: filters.projectType } : null}
                                onChange={(selectedOption) => handleFilterChange('projectType', selectedOption ? selectedOption.value : '')}
                                placeholder="Select Project Type"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                className="w-full"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-md ml-5 mr-5 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Water Connections</h3>
                    <div className="flex items-center gap-4 text-sm text-black">
                        <button className="flex items-center font-semibold gap-2 hover:text-blue-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            Export PDF
                        </button>
                        <button className="flex items-center font-semibold gap-2 hover:text-green-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Export Excel
                        </button>
                    </div>
                </div>

                <div className="border-l-8 border-l-[#BF9853] rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#FAF6ED]">
                                    <td className="px-4 py-2 text-left font-semibold">Sl.No</td>
                                    <td className="px-4 py-2 text-left font-semibold">PID</td>
                                    <td className="px-4 py-2 text-left font-semibold">Project Name</td>
                                    <td className="px-4 py-2 text-left font-semibold">Project Type</td>
                                    <td className="px-4 py-2 text-left font-semibold">Door No</td>
                                    <td className="px-4 py-2 text-left font-semibold">Service No (Water)</td>
                                    <td className="px-4 py-2 text-left font-semibold">Shop No</td>
                                    <td className="px-4 py-2 text-left font-semibold">Status</td>
                                    <td className="px-4 py-2 text-left font-semibold">Created Date</td>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4 text-red-500">
                                            {error}
                                        </td>
                                    </tr>
                                ) : filteredProjects.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4">
                                            No water connections found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProjects.map((project, projectIndex) =>
                                        project.propertyDetails
                                            .filter(property => property.waterNo && property.waterNo.trim() !== '')
                                            .map((property, propertyIndex) => {
                                                const rowIndex = projectIndex * project.propertyDetails.length + propertyIndex;
                                                return (
                                                    <tr key={`${project.id}-${property.id}`} className="odd:bg-white even:bg-[#FAF6ED]">
                                                        <td className="px-4 py-2">{rowIndex + 1}</td>
                                                        <td className="px-4 py-2">{project.projectId}</td>
                                                        <td className="px-4 py-2 text-left">{project.projectName}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                project.projectCategory === 'Client Project'
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : project.projectCategory === 'Own Project'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {property.projectType || project.projectCategory || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2">{property.doorNo || '-'}</td>
                                                        <td className="px-4 py-2 text-left font-mono">{property.waterNo}</td>
                                                        <td className="px-4 py-2">{property.shopNo || '-'}</td>
                                                        <td className="px-4 py-2">
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Active
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-GB') : '-'}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaterDatabase;
