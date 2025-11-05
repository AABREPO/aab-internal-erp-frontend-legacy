import React, { useMemo, useState } from 'react'
import edit from '../Images/Edit.svg'
import deleteIcon from '../Images/Delete.svg'
import search from '../Images/search.png'
import imports from '../Images/Import.svg'

const DirectoryAmc = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [isAmcCreateOpen, setIsAmcCreateOpen] = useState(false);
  const [isAmcInputsOpen, setIsAmcInputsOpen] = useState(false);
  const [amcForm, setAmcForm] = useState({
    type: '',
    number: '',
    nextServiceValue: 0,
    nextServiceUnit: '',
    project: '',
    purpose: '',
    amount: '',
    paymentDate: '',
    serviceStart: '',
    validityValue: 0,
    validityUnit: '',
    registeredPerson: ''
  });
  const [amcFilters, setAmcFilters] = useState({
    year: '',
    vendor: '',
    service: '',
    doorNo: '',
    shop: '',
    project: '',
    tenant: ''
  });


  const handleFilterChange = (key, value) => {
    setAmcFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleFormChange = (key, value) => {
    setAmcForm(prev => ({ ...prev, [key]: value }))
  }

  const resetForm = () => {
    setAmcForm({
      type: '', number: '', nextServiceValue: 0, nextServiceUnit: '', project: '', purpose: '', amount: '',
      paymentDate: '', serviceStart: '', validityValue: 0, validityUnit: '',
      registeredPerson: ''
    });
  }
  return (
    <div>
      <div className="bg-white lg:flex gap-3 p-4 ml-5 mr-5 rounded-md lg:h-[128px] text-left">
        <div>
          <label className="block font-semibold mb-1">Year</label>
          <select
            value={amcFilters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Year</option>
            <option>2024</option>
            <option>2025</option>
            <option>2026</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Vendor</label>
          <select
            value={amcFilters.vendor}
            onChange={(e) => handleFilterChange('vendor', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Vendor</option>
            <option>Jio</option>
            <option>Airtel</option>
            <option>BSNL</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Service</label>
          <select
            value={amcFilters.service}
            onChange={(e) => handleFilterChange('service', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Service</option>
            <option>DTH</option>
            <option>Landline</option>
            <option>Mobile</option>
            <option>CCTV</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Door No</label>
          <select
            value={amcFilters.doorNo}
            onChange={(e) => handleFilterChange('doorNo', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Door No</option>
            <option>Office</option>
            <option>Godown</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Shop</label>
          <select
            value={amcFilters.shop}
            onChange={(e) => handleFilterChange('shop', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Shop</option>
            <option>AA Plot</option>
            <option>Kambathupatti</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Project Name</label>
          <select
            value={amcFilters.project}
            onChange={(e) => handleFilterChange('project', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Project</option>
            <option>Clients</option>
            <option>Own</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Tenant</label>
          <select
              value={amcFilters.tenant}
            onChange={(e) => handleFilterChange('tenant', e.target.value)}
            className="h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none"
          >
            <option value="">Select Tenant</option>
            <option>Amir H</option>
            <option>Jothi S</option>
          </select>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto bg-white p-4 ml-5 mr-5 rounded-md">
        {/* Tabs and Actions */}
        <div className=" flex flex-col md:flex-row md:items-center md:justify-between mt-5 mb-3">
          <div className="inline-flex rounded-md p-1 w-fit gap-2">
            <button
              className={'px-6 py-2 rounded font-semibold transition-colors border border-gray-300 hover:bg-gray-50'}
            >
              Clients Projects
            </button>
            <button
              className={'px-6 py-2 rounded font-semibold transition-colors border border-gray-300 hover:bg-gray-50'}
            >
              Own Projects
            </button>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <button className="h-10 text-[#E4572E] hover:underline">Export PDF</button>
            <button className="h-10 text-[#007233] hover:underline">Export XL</button>
            <button className="h-10 text-[#BF9853] hover:underline">Print</button>
            <button className="h-10 px-4 bg-[#BF9853] text-white rounded-md" onClick={() => setIsAmcInputsOpen(true)}>+ Add Input</button>
            <button className="h-10 px-4 bg-[#BF9853] text-white rounded-md" onClick={() => setIsAmcCreateOpen(true)}>Create</button>
          </div>
        </div>
        <div className="rounded-lg border-l-8 border-l-[#BF9853]">
          <table className="w-full table-auto mb-4 border-collapse">
            <thead>
              <tr className="bg-[#FAF6ED] text-left">
                <th className="p-2 pl-3">Sl.No</th>
                <th className="p-2">Projects</th>
                <th className="p-2">Type</th>
                <th className="p-2">Number</th>
                <th className="p-2">Payment Date</th>
                <th className="p-2">Validity</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Exp Date</th>
                <th className="p-2">Remain Days</th>
                <th className="p-2">Next Service</th>
                <th className="p-2">Exp Ago</th>
                <th className="p-2">Registered</th>
                <th className="p-2">Activity</th>
              </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>
        {isAmcInputsOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsAmcInputsOpen(false)} />
            <div className="relative z-40 bg-white rounded-lg shadow-xl p-5 w-[600px] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">AMC Inputs</h3>
                <button className="text-red-600 text-2xl" onClick={() => setIsAmcInputsOpen(false)}>×</button>
              </div>
              <div className="flex overflow-x-auto space-x-[1%] pb-4">
                {/* TYPE COLUMN */}
                <div>
                  <div className="ml-5">
                    <div className="flex items-center mb-2">
                      <input
                        type="text"
                        placeholder="Search Type..."
                        className="border-2 rounded-lg border-[#BF9853] w-[240px] h-[45px] border-opacity-[0.17] pl-3 placeholder:text-sm placeholder:text-gray-500 placeholder:font-semibold"
                      />
                      <button className="-ml-8 mt-5 transform -translate-y-1/2 text-gray-500">
                        <img src={search} alt='search' className=' w-5 h-5' />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <button className="text-[#E4572E] font-semibold text-sm flex">
                        <img src={imports} alt="import" className="w-6 h-5 bg-transparent pr-2 mt-1" />
                        <h1 className="mt-1.5">Import file</h1>
                      </button>
                      <button className="text-black font-bold px-1 ml-6 rounded border-dashed border-b-2 border-[#BF9853]">
                        + Add
                      </button>
                    </div>
                    <div className="rounded-lg border border-gray-200 mt-4 border-l-8 border-l-[#BF9853] w-[240px]">
                      <div className="bg-[#FAF6ED]">
                        <table className="table-auto">
                          <thead>
                            <tr className="border-b">
                              <th className="p-2 text-left w-16 text-base font-bold">S.No</th>
                              <th className="p-2 text-left w-48 text-base font-bold">Type</th>
                            </tr>
                          </thead>
                        </table>
                      </div>
                      <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <table className="table-auto w-full">
                          <tbody>

                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                {/* NETWORK COLUMN */}
                <div>
                  <div className="ml-7">
                    <div className="flex items-center mb-2">
                      <input
                        type="text"
                        placeholder="Search Network..."
                        className="border-2 rounded-lg border-[#BF9853] w-[240px] h-[45px] border-opacity-[0.17] pl-3 placeholder:text-sm placeholder:text-gray-500 placeholder:font-semibold"
                      />
                      <button className="-ml-8 mt-5 transform -translate-y-1/2 text-gray-500">
                        <img src={search} alt='search' className=' w-5 h-5' />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <button className="text-[#E4572E] font-semibold text-sm flex">
                        <img src={imports} alt="import" className="w-6 h-5 bg-transparent pr-2 mt-1" />
                        <h1 className="mt-1.5">Import file</h1>
                      </button>
                      <button className="text-black font-bold px-1 ml-6 rounded border-dashed border-b-2 border-[#BF9853]">
                        + Add
                      </button>
                    </div>
                    <div className="rounded-lg border border-gray-200 mt-4 border-l-8 border-l-[#BF9853] w-[240px]">
                      <div className="bg-[#FAF6ED]">
                        <table className="table-auto">
                          <thead>
                            <tr className="border-b">
                              <th className="p-2 text-left w-16 text-base font-bold">S.No</th>
                              <th className="p-2 text-left w-48 text-base font-bold">Purpose</th>
                            </tr>
                          </thead>
                        </table>
                      </div>
                      <div className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <table className="table-auto w-full">
                          <tbody>

                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-2 justify-end mr-10 mb-4">
                <button className="px-6 py-2 bg-[#BF9853] text-white rounded-md">Save</button>
                <button className="px-6 py-2 border border-[#BF9853] text-[#BF9853] rounded-md" onClick={() => setIsAmcInputsOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {isAmcCreateOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsAmcCreateOpen(false)} />
            <div className="relative z-40 bg-white rounded-lg shadow-xl p-6 w-[860px] max-w-[92vw]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">AMC Details</h3>
                <button className="text-red-600 text-2xl" onClick={() => setIsAmcCreateOpen(false)}>×</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                <div>
                  <label className="block font-semibold mb-1">Type</label>
                  <select value={amcForm.type} onChange={(e) => handleFormChange('type', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                    <option value="">Select</option>
                    <option>Mobile</option>
                    <option>Landline</option>
                    <option>CCTV</option>
                    <option>DTH</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Mobile Number</label>
                  <input value={amcForm.number} onChange={(e) => handleFormChange('number', e.target.value)} placeholder="Enter here" className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Next Service</label>
                  <div className="flex gap-2">
                    <input type="number" min="0" value={amcForm.nextServiceValue} onChange={(e) => handleFormChange('nextServiceValue', Number(e.target.value))} className="h-11 w-20 border-2 border-[#BF9853] border-opacity-30 rounded-md px-3 focus:outline-none" />
                    <select value={amcForm.nextServiceUnit} onChange={(e) => handleFormChange('nextServiceUnit', e.target.value)} className="h-11 flex-1 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                      <option value="">Select</option>
                      <option value="Days">Days</option>
                      <option value="Months">Months</option>
                      <option value="Years">Years</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Project</label>
                  <select value={amcForm.project} onChange={(e) => handleFormChange('project', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                    <option value="">Select</option>
                    <option>Clients</option>
                    <option>Own</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Purpose</label>
                  <select value={amcForm.purpose} onChange={(e) => handleFormChange('purpose', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                    <option value="">Select</option>
                    <option>Office</option>
                    <option>Security</option>
                    <option>Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Amount</label>
                        <input value={amcForm.amount} onChange={(e) => handleFormChange('amount', e.target.value)} placeholder="Enter here" className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Payment Date</label>
                  <input type="date" value={amcForm.paymentDate} onChange={(e) => handleFormChange('paymentDate', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Service Start Date</label>
                  <input type="date" value={amcForm.serviceStart} onChange={(e) => handleFormChange('serviceStart', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Validity</label>
                  <div className="flex gap-2">
                    <input type="number" min="0" value={amcForm.validityValue} onChange={(e) => handleFormChange('validityValue', Number(e.target.value))} className="h-11 w-20 border-2 border-[#BF9853] border-opacity-30 rounded-md px-3 focus:outline-none" />
                    <select value={amcForm.validityUnit} onChange={(e) => handleFormChange('validityUnit', e.target.value)} className="h-11 flex-1 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                      <option value="">Select</option>
                      <option value="Days">Days</option>
                      <option value="Months">Months</option>
                      <option value="Years">Years</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Registered Person</label>
                  <select value={amcForm.registeredPerson} onChange={(e) => handleFormChange('registeredPerson', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                    <option value="">Select</option>
                    <option>Amir H</option>
                    <option>Jothi S</option>
                  </select>
                </div>
              </div>
              <div className="px-2 pt-4 flex gap-4">
                <button
                  className="px-6 py-2 bg-[#BF9853] text-white rounded-md"
                  onClick={() => { setIsAmcCreateOpen(false); resetForm(); }}
                >
                  Submit
                </button>
                <button
                  className="px-6 py-2 border border-[#BF9853] text-[#BF9853] rounded-md"
                  onClick={() => { setIsAmcCreateOpen(false); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default DirectoryAmc
