import React, { useState } from 'react'

const QuotationDatabase = ({ username, userRoles = [] }) => {
  const [filters, setFilters] = useState({
    clientName: 'Mr.Sivaraman',
    date: 'Select Date',
    projectType: 'Residential',
    quotation: 'Enter Num..'
  })

  // Sample data matching the QuotationHistory with Time Stamp added

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getStatusButtonClass = (status) => {
    return status === 'Submit' 
      ? 'bg-green-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-green-700 transition-colors'
      : 'bg-orange-500 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors'
  }

  return (
    <div className="bg-[#FAF6ED]">
      {/* Filter Section */}
      <div className="bg-white rounded-lg p-6 mb-4 mx-4 shadow-sm">
        <div className="flex text-left gap-6">
          {/* Client Name Filter */}
          <div>
            <label className="block font-semibold mb-2">Client Name</label>
            <div className="relative">
              <select
                value={filters.clientName}
                onChange={(e) => handleFilterChange('clientName', e.target.value)}
                className="w-[275px] h-[45px] border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 pr-8 appearance-none bg-white focus:outline-none"
              >
                <option value="Mr.Sivaraman">Mr.Sivaraman</option>
                <option value="Mrs.John">Mrs.John</option>
                <option value="Mr.Smith">Mr.Smith</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          {/* Date Filter */}
          <div>
            <label className="block font-semibold mb-2">Date</label>
            <div className="relative">
              <input
                type="date"
                value={filters.date === 'Select Date' ? '' : filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value || 'Select Date')}
                className="w-[168px] h-[45px] border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 pr-8 focus:outline-none"
                placeholder="Select Date"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          {/* Project Type Filter */}
          <div>
            <label className="block font-semibold mb-2">Project Type</label>
            <div className="relative">
              <select
                value={filters.projectType}
                onChange={(e) => handleFilterChange('projectType', e.target.value)}
                className="w-[249px] h-[45px] border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 pr-8 appearance-none bg-white focus:outline-none"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          {/* Quotation Filter */}
          <div>
            <label className="block font-semibold mb-2">Quotation</label>
            <input
              type="text"
              value={filters.quotation}
              onChange={(e) => handleFilterChange('quotation', e.target.value)}
              className="w-[149px] h-[45px] border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Enter Num.."
            />
          </div>
        </div>
      </div>

      {/* Quotation Database Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mx-4 p-4">
        <div className="rounded-lg border-l-8 border-l-[#BF9853]">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-[#FAF6ED]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Sl.No</th>
                  <th className="px-4 py-3 text-left font-semibold">Time Stamp</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    <div className="flex items-center">
                      Date
                      <svg className="w-3 h-3 ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    <div className="flex items-center">
                      Client Name
                      <svg className="w-3 h-3 ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    <div className="flex items-center">
                      Project Type
                      <svg className="w-3 h-3 ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    <div className="flex items-center">
                      Quotation No
                      <svg className="w-3 h-3 ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    <div className="flex items-center">
                      Total Amount
                      <svg className="w-3 h-3 ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                  <th className="px-4 py-3 text-left font-semibold">Activity</th>
                </tr>
              </thead>
              <tbody>
                
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuotationDatabase
