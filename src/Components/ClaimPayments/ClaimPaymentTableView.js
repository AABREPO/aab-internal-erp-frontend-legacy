import React from 'react'
import EditIcon from "../Images/Edit.svg";

// Reusable table for Claim Payments
// Props:
// - data: Array of rows { date, projectName, amount, category, reason/comments, eNo, receivedAmount }
// - onOpen: function(row) -> opens the modal for that row
const ClaimPaymentTableView = ({ data = [], onOpen }) => {
  const formatAmount = (value) => {
    const num = Number(value || 0);
    return num.toLocaleString('en-IN');
  };

  return (
    <body>
      <div className='bg-white w-[1700px] h-[500px] p-10 ml-10'>
        <div className='border-l-8 border-l-[#BF9853] rounded-lg'>
          <table className="w-full rounded-lg">
            <thead className="bg-[#FAF6ED]">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Project Name</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Comments</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">E.No</th>
                <th className="px-4 py-2 text-left">Activity</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const isClaimed = Number(row.receivedAmount || 0) >= Number(row.amount || 0);
                return (
                  <tr key={index} className={`even:bg-[#FAF6ED] odd:bg-[#FFFFFF] font-bold text-[14px]`}>
                    <td className="px-4 py-2">{row.date}</td>
                    <td className="px-4 py-2">{row.projectName}</td>
                    <td className="px-4 py-2">{formatAmount(row.amount)}</td>
                    <td className="px-4 py-2">{row.category}</td>
                    <td className="px-4 py-2">{row.reason || row.comments}</td>
                    <td className={`px-4 py-2 font-semibold ${isClaimed ? 'text-[#007233]' : 'text-[#E4572E]'}`}>
                      {isClaimed ? 'Claimed' : 'Unclaimed'}
                    </td>
                    <td className="px-4 py-2">{row.eNo}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => onOpen && onOpen(row)} className="p-1 rounded hover:bg-gray-100">
                        <img src={EditIcon} alt="edit" className="w-5 h-5 inline-block align-middle" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </body>
  )
}

export default ClaimPaymentTableView
