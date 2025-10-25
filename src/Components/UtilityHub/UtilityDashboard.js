import React from 'react'

const UtilityDashboard = () => {
  return (
    <div className="p-6 bg-white ml-5 mr-5 rounded">
      {/* Upcoming Transactions Section */}
      <div className="mb-8 text-left">
        <h2 className="text-xl font-bold mb-6">Upcoming Transactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Electricity Card */}
          <div>
            <div className="py-2">
              <h3 className="font-semibold text-[#BF9853] text-base">Electricity</h3>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-[#BF9853]">
              <div className="p-4 space-y-3">

              </div>
            </div>
          </div>

          {/* Property Card */}
          <div>
            <div className="py-2">
              <h3 className="font-semibold text-pink-300 text-base">Property</h3>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-pink-300">
              <div className="p-4 space-y-3">

              </div>
            </div>
          </div>

          {/* Water Card */}
          <div>
            <div className="py-2">
              <h3 className="font-semibold text-blue-300 text-base">Water</h3>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-blue-300">
              <div className="p-4 space-y-3">

              </div>
            </div>
          </div>

          {/* Telecom Card */}
          <div>
            <div className="py-2">
              <h3 className="font-bold text-green-300 text-base">Telecom</h3>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-green-300">
              <div className="p-4 space-y-3">

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Recent Transactions</h2>
          <div className="flex space-x-4">
            <button className="flex items-center text-sm font-semibold">
              Export PDF
            </button>
            <button className="flex items-center text-sm font-semibold">
              Export XL
            </button>
            <button className="flex items-center text-sm font-semibold">
              Print
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="border-l-8 border-l-[#BF9853] rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FAF6ED]">
                  <tr>
                    <td className="px-4 py-2 text-left font-semibold ">
                      Sl.No
                    </td>
                    <td className="px-4 py-2 text-left  font-semibold ">
                      Date
                    </td>
                    <td className="px-4 py-2 text-left  font-semibold ">
                      Project Name
                    </td>
                    <td className="px-4 py-2 text-left  font-semibold ">
                      Amount
                    </td>
                    <td className="px-4 py-2 text-left  font-semibold ">
                      Type
                    </td>
                    <td className="px-4 py-2 text-left font-semibold ">
                      Category
                    </td>
                    <td className="px-4 py-2 text-left  font-semibold ">
                      Purpose
                    </td>
                  </tr>
                </thead>
                <tbody className="">

                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UtilityDashboard
