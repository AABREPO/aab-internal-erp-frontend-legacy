import React, { useState, useEffect } from 'react';

const ClaimPaymentSummary = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const data = [
    {
      date: "22/10/2022",
      projectName: "Ramaraj AA Nagar",
      amount: "1,200",
      category: "Plan Approval Fees",
      reason: "Site Plan Approval",
      status: "Not Claim",
      eNo: "16",
      activity: "To Receive",
    },
    {
      date: "09/09/2022",
      projectName: "Ramaraj AA Nagar",
      amount: "15,000",
      category: "EB bill",
      reason: "Plan Approval Amount Paid In Bank",
      status: "Not Claim",
      eNo: "15",
      activity: "Received",
    },
    {
      date: "03/09/2022",
      projectName: "Ramaraj AA Nagar",
      amount: "13,000",
      category: "Plan Approval Fees",
      reason: "Paid To Panchayat Office",
      status: "Claimed",
      eNo: "10",
      activity: "Received",
    },
    {
      date: "02/09/2022",
      projectName: "Ramaraj AA Nagar",
      amount: "1,650",
      category: "Property Tax",
      reason: "Property Tax Amount",
      status: "Claimed",
      eNo: "09",
      activity: "Received",
    },
  ];

  const handleOpenModal = (row) => {
    setSelectedRow(row);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRow(null);
  };

  return (
    <body>
      <div className="p-4">
        <div className='w-[1700px] bg-white h-[130px]'>
          <div className=" text-left p-7 ml-10">
            <label className="font-semibold mr-2 block mb-2">Project Name</label>
            <select className="border-2 border-[#Bf9853] border-opacity-30 p-2 rounded-lg w-[220px]">
              <option>Ramaraj AA Nagar</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border rounded-lg overflow-hidden">
          <thead className="bg-yellow-100">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Project Name</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Reason</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">E.No</th>
              <th className="px-4 py-2">Activity</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="text-center border-b">
                <td className="px-4 py-2">{row.date}</td>
                <td className="px-4 py-2">{row.projectName}</td>
                <td className="px-4 py-2">{row.amount}</td>
                <td className="px-4 py-2">{row.category}</td>
                <td className="px-4 py-2">{row.reason}</td>
                <td
                  className={`px-4 py-2 font-semibold ${row.status === "Claimed"
                    ? "text-green-600"
                    : "text-red-500"
                    }`}
                >
                  {row.status}
                </td>
                <td className="px-4 py-2">{row.eNo}</td>
                <td className="px-4 py-2">
                  {row.activity === "To Receive" ? (
                    <button
                      onClick={() => handleOpenModal(row)}
                      className="border px-3 py-1 rounded-full bg-white hover:bg-gray-100"
                    >
                      To Receive
                    </button>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
                      ✓ Received
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-3 text-xl font-bold text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
              <h2 className="text-lg font-semibold mb-4">Entry Payment Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Date</label>
                  <input type="date" className="border p-2 w-full rounded" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Amount</label>
                  <input
                    type="text"
                    defaultValue={selectedRow?.amount || ""}
                    className="border p-2 w-full rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Mode</label>
                  <select className="border p-2 w-full rounded">
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>UPI</option>
                  </select>
                </div>
                <div>
                  <button className="border-none bg-transparent text-red-500 font-medium">
                    + Add on
                  </button>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      handleCloseModal();
                    }}
                    className="bg-yellow-700 text-white px-4 py-2 rounded"
                  >
                    Submit
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="border border-yellow-700 text-yellow-700 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </body>
  );
}

export default ClaimPaymentSummary
