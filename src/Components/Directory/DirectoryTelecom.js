import React, { useMemo, useState } from 'react'
import edit from '../Images/Edit.svg'
import deleteIcon from '../Images/Delete.svg'
import search from '../Images/search.png'
import imports from '../Images/Import.svg'

const DirectoryTelecom = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInputsOpen, setIsInputsOpen] = useState(false);
  const [form, setForm] = useState({
    type: '',
    network: '',
    number: '',
    project: '',
    purpose: '',
    amount: '',
    paymentDate: '',
    serviceStart: '',
    validityValue: 0,
    validityUnit: '',
    registeredPerson: '',
    assignedPerson: ''
  });
  const [filters, setFilters] = useState({
    year: '',
    vendor: '',
    service: '',
    doorNo: '',
    shop: '',
    project: '',
    tenant: ''
  });

  const data = useMemo(() => ([
    { id: 1, location: 'Office', tag: 'TV', type: 'DTH', number: '9876543210', registered: 'Amir H', assigned: 'Amir H', paymentDate: '07/10/2025', validity: '30 days', amount: 200, expDate: '06/11/2025', remainDays: '10 days', exp: 0 },
    { id: 2, location: 'Godown', tag: 'Landline', type: 'Prepaid', number: '8974562310', registered: 'Vinoth G', assigned: 'Javid F', paymentDate: '12/06/2024', validity: '2 years', amount: 2000, expDate: '11/06/2026', remainDays: '+1 year', exp: 0 },
    { id: 3, location: 'Kambathupatti', tag: 'CCTV', type: 'Postpaid', number: '9687451230', registered: 'Lingam D', assigned: 'Durai A', paymentDate: '02/05/2025', validity: '1 year', amount: 1500, expDate: '01/05/2026', remainDays: '9 months', exp: 0 },
    { id: 4, location: 'AA Plot - Parapatti', tag: 'CCTV', type: 'Prepaid', number: '8879546321', registered: 'Jothi S', assigned: 'Jothi S', paymentDate: '11/07/2025', validity: '28 days', amount: 299, expDate: '08/08/2025', remainDays: '8 days', exp: 0 },
    { id: 5, location: 'Kambathupatti', tag: 'Mobile', type: 'Postpaid', number: '9876543210', registered: 'Prathip s', assigned: 'Vinoth G', paymentDate: '10/10/2026', validity: '30 days', amount: 300, expDate: '09/11/2026', remainDays: '7 Days', exp: 0 },
  ]), []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleFormChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const resetForm = () => {
    setForm({
      type: '', network: '', number: '', project: '', purpose: '', amount: '',
      paymentDate: '', serviceStart: '', validityValue: 0, validityUnit: '',
      registeredPerson: '', assignedPerson: ''
    });
  }

  return (
    <div className=" rounded-lg shadow-sm ">
      <div className="bg-white lg:flex gap-3 p-4 ml-5 mr-5 rounded-md lg:h-[128px] text-left">
        <div>
          <label className="block font-semibold mb-1">Year</label>
          <select
            value={filters.year}
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
            value={filters.vendor}
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
            value={filters.service}
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
            value={filters.doorNo}
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
            value={filters.shop}
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
            value={filters.project}
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
            value={filters.tenant}
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
            <button className="h-10 px-4 bg-[#BF9853] text-white rounded-md" onClick={() => setIsInputsOpen(true)}>Add New</button>
            <button className="h-10 px-4 bg-[#BF9853] text-white rounded-md" onClick={() => setIsCreateOpen(true)}>Create</button>
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
                <th className="p-2">Exp Ago</th>
                <th className="p-2">Registered</th>
                <th className="p-2">Assigned</th>
                <th className="p-2">Activity</th>
              </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>
        {isInputsOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsInputsOpen(false)} />
            <div className="relative z-40 bg-white rounded-lg shadow-xl p-5 w-[900px] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Telecom Inputs</h3>
                <button className="text-red-600 text-2xl" onClick={() => setIsInputsOpen(false)}>×</button>
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
                              <th className="p-2 text-left w-48 text-base font-bold">Network</th>
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
                {/* CATEGORY COLUMN */}
                <div>
                  <div className="ml-7">
                    <div className="flex items-center mb-2">
                      <input
                        type="text"
                        placeholder="Search Category..."
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
                              <th className="p-2 text-left w-48 text-base font-bold">Category</th>
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
                <button className="px-6 py-2 border border-[#BF9853] text-[#BF9853] rounded-md" onClick={() => setIsInputsOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {isCreateOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => { setIsCreateOpen(false); }} />
            <div className="relative z-40 bg-white rounded-lg shadow-xl w-[860px] max-w-[92vw]">
              <div className="flex items-center justify-between px-6 py-4">
                <h3 className="text-lg font-semibold">Telecom Details</h3>
                <button className="text-red-600 text-2xl" onClick={() => setIsCreateOpen(false)}>×</button>
              </div>
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                <div>
                  <label className="block font-semibold mb-1">Type</label>
                  <select value={form.type} onChange={(e) => handleFormChange('type', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                    <option value="">Select</option>
                    <option>Mobile</option>
                    <option>Landline</option>
                    <option>CCTV</option>
                    <option>DTH</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Network</label>
                  <select value={form.network} onChange={(e) => handleFormChange('network', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                    <option value="">Select</option>
                    <option>Jio</option>
                    <option>Airtel</option>
                    <option>BSNL</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Number</label>
                  <input value={form.number} onChange={(e) => handleFormChange('number', e.target.value)} placeholder="Enter here" className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none" />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Project</label>
                  <select value={form.project} onChange={(e) => handleFormChange('project', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                    <option value="">Select</option>
                    <option>Clients</option>
                    <option>Own</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Purpose</label>
                  <select value={form.purpose} onChange={(e) => handleFormChange('purpose', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                    <option value="">Select</option>
                    <option>Office</option>
                    <option>Security</option>
                    <option>Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Amount</label>
                  <input value={form.amount} onChange={(e) => handleFormChange('amount', e.target.value)} placeholder="Enter here" className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none" />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Payment Date</label>
                  <input type="date" value={form.paymentDate} onChange={(e) => handleFormChange('paymentDate', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Service Start Date</label>
                  <input type="date" value={form.serviceStart} onChange={(e) => handleFormChange('serviceStart', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Validity</label>
                  <div className="flex gap-2">
                    <input type="number" min="0" value={form.validityValue} onChange={(e) => handleFormChange('validityValue', Number(e.target.value))} className="h-11 w-20 border-2 border-[#BF9853] border-opacity-30 rounded-md px-3 focus:outline-none" />
                    <select value={form.validityUnit} onChange={(e) => handleFormChange('validityUnit', e.target.value)} className="h-11 flex-1 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                      <option value="">Select</option>
                      <option value="Days">Days</option>
                      <option value="Months">Months</option>
                      <option value="Years">Years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Registered Person</label>
                  <select value={form.registeredPerson} onChange={(e) => handleFormChange('registeredPerson', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                    <option value="">Select</option>
                    <option>Amir H</option>
                    <option>Jothi S</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Assigned Person</label>
                  <select value={form.assignedPerson} onChange={(e) => handleFormChange('assignedPerson', e.target.value)} className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none appearance-none">
                    <option value="">Select</option>
                    <option>Amir H</option>
                    <option>Vinoth G</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-5 flex gap-4">
                <button
                  className="px-6 py-2 bg-[#BF9853] text-white rounded-md"
                  onClick={() => { setIsCreateOpen(false); resetForm(); }}
                >
                  Submit
                </button>
                <button
                  className="px-6 py-2 border border-[#BF9853] text-[#BF9853] rounded-md"
                  onClick={() => { setIsCreateOpen(false); }}
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

export default DirectoryTelecom
