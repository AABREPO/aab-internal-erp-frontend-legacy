import React, { useState, useEffect } from 'react';
import Select from 'react-select';
const ClaimPaymentSummary = ({ username, userRoles = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [extraRows, setExtraRows] = useState([]);
  const [popupAmount, setPopupAmount] = useState("");
  const [mainDate, setMainDate] = useState("");
  const [siteOption, setSiteOption] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [claimDataList, setClaimDataList] = useState([]);
  const [mainMode, setMainMode] = useState('');
  const [receivedAmounts, setReceivedAmounts] = useState({});
  const [actualAmount, setActualAmount] = useState(0);
  const [collectedAmount, setCollectedAmount] = useState(0);
  const [claimPaymentsData, setClaimPaymentsData] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(0);


  useEffect(() => {
    // Fetch data from the API
    fetch('https://backendaab.in/aabuilderDash/expenses_form/get_form')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.json();
      })
      .then((data) => {
        // Filter only items with accountType = 'Claim'
        const filteredData = data.filter(item => item.accountType === 'Claim');
        setClaimDataList(filteredData);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, []);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.siteName,
          label: item.siteName,
          sNo: item.siteNo
        }));
        setSiteOption(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchSites();
  }, []);
  const filteredData = selectedSite
    ? claimDataList.filter(item => item.siteName === selectedSite.value)
    : claimDataList;
  useEffect(() => {
    const fetchReceivedAmounts = async () => {
      const amounts = {};

      for (const row of filteredData) {
        try {
          const res = await fetch(`https://backendaab.in/aabuildersDash/api/claim_payments/get/${row.id}`);
          const payments = await res.json();

          const totalReceived = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
          amounts[row.id] = totalReceived;
        } catch (error) {
          console.error(`Error fetching payments for row ${row.id}`, error);
          amounts[row.id] = 0;
        }
      }

      setReceivedAmounts(amounts);
    };

    if (filteredData.length > 0) {
      fetchReceivedAmounts();
    }
  }, [filteredData]);

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderWidth: '2px',
      borderRadius: '8px',
      borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
      '&:hover': {
        borderColor: 'rgba(191, 152, 83, 0.2)',
      }
    }),
  };
  useEffect(() => {
    if (selectedRow) {
      // Use mainInputAmount if it exists (updated amount), otherwise use original amount
      const baseAmount = selectedRow.mainInputAmount !== undefined ? selectedRow.mainInputAmount : selectedRow.amount;
      setPopupAmount(baseAmount || "");
    }
  }, [selectedRow]);

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];  // "YYYY-MM-DD"
  };

  const handleOpenModal = async (row) => {
    setMainDate(getToday());
    setActualAmount(row.amount);
    setSelectedRow(row);

    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/claim_payments/get/${row.id}`);
      const claimPayments = await response.json();

      const totalReceived = claimPayments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      );

      const remaining = row.amount - totalReceived;

      setRemainingAmount(remaining > 0 ? remaining : 0);
      setPopupAmount(remaining > 0 ? remaining : 0); // Prefill but editable
      setClaimPaymentsData(claimPayments);
      setMainMode(""); // no default
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching claim payments:", error);
    }
  };
  const handleSavePayment = async () => {
    if (!mainMode) {
      alert("Please select a payment mode.");
      return;
    }
    const newPayment = {
      entered_by: username, // or from login context
      expenses_claim_id: selectedRow.expenses_claim_id ?? selectedRow.id,
      payment_mode: mainMode,
      date: mainDate,
      amount: popupAmount,
      cash_register_status: false,
    };

    try {
      const response = await fetch("https://backendaab.in/aabuildersDash/api/claim_payments/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPayment),
      });

      if (response.ok) {
        alert("Payment saved successfully!");
        window.location.reload();
        setShowModal(false);
        // Optionally refresh table or data
      } else {
        alert("Failed to save payment.");
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      alert("Error occurred while saving payment.");
    }
  };

  const sortedSiteOptions = siteOption.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  const formatDateOnly = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  return (
    <body>
      <div className="">
        <div className='w-[1700px] bg-white h-[130px] rounded ml-10'>
          <div className=" text-left p-7 ml-10">
            <label className="font-semibold mr-2 block mb-2">Project Name</label>
            <Select
              options={sortedSiteOptions || []}
              placeholder="Select a site..."
              isSearchable={true}
              value={selectedSite}
              onChange={setSelectedSite} // local only — won't affect Advance Page
              styles={customStyles}
              isClearable
              className="w-[380px] h-[45px] focus:outline-none"
            />
          </div>
        </div>
        <div className='w-[1700px] bg-white mt-5 p-5 ml-10'>
          <div className="rounded-lg border-l-8 border-l-[#BF9853]">
            <table className="w-full border rounded-lg overflow-hidden">
              <thead className="bg-[#FAF6ED]">
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
                {filteredData.map((row, index) => (
                  <tr key={index} className={`even:bg-[#FAF6ED] odd:bg-[#FFFFFF] font-bold text-[14px]`}>
                    <td className="px-4 py-2">{formatDateOnly(row.date)}</td>
                    <td className="px-4 py-2">{row.siteName}</td>
                    <td className="px-4 py-2">{row.amount}</td>
                    <td className="px-4 py-2">{row.category}</td>
                    <td className="px-4 py-2">{row.comments}</td>
                    <td
                      className={`px-4 py-2 font-semibold ${(receivedAmounts[row.id] || 0) >= row.amount
                        ? "text-[#007233]"
                        : "text-[#E4572E]"
                        }`}
                    >
                      {(receivedAmounts[row.id] || 0) >= row.amount ? "Claimed" : "Not Claimed"}
                    </td>
                    <td className="px-4 py-2">{row.eno}</td>
                    <td className="px-4 py-2">
                      {(() => {
                        const actualAmount = row.amount;
                        const received = receivedAmounts[row.id] || 0;

                        if (received === 0) {
                          return (
                            <button
                              onClick={() => handleOpenModal(row)}
                              className="border px-3 py-1 rounded-full bg-white hover:bg-gray-100"
                            >
                              To Receive
                            </button>
                          );
                        } else if (received > 0 && received < actualAmount) {
                          return (
                            <span
                              onClick={() => handleOpenModal(row)}
                              className="px-3 py-1 rounded-full bg-[#FFD39E] text-black cursor-pointer"
                            >
                              Received
                            </span>
                          );
                        } else if (received >= actualAmount) {
                          return (
                            <span
                              onClick={() => handleOpenModal(row)}
                              className="px-3 py-1 rounded-full bg-[#E2F9E1] text-green-700 cursor-pointer"
                            >
                              ✓ Received
                            </span>
                          );
                        }
                      })()}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Modal */}
        {showModal && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white rounded-2xl p-6 w-[700px] relative shadow-xl">
      {/* Title */}
      <h2 className="text-xl font-semibold mb-6 text-center">Entry Payment Details</h2>

      {/* Previous Payments */}
      {claimPaymentsData.length > 0 ? (
        claimPaymentsData.map((payment, idx) => (
          <div key={idx} className="flex gap-4 mb-4">
            {/* Date */}
            <div className="flex flex-col text-left w-[168px]">
              <label className="mb-1 font-bold">Date</label>
              <input
                type="text"
                value={formatDateOnly(payment.date)}
                readOnly
                className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2 "
              />
            </div>

            {/* Amount */}
            <div className="flex flex-col text-left w-[168px]">
              <label className="mb-1 font-bold">Amount</label>
              <input
                type="text"
                value={Number(payment.amount).toLocaleString()}
                readOnly
                className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2 "
              />
            </div>

            {/* Mode */}
            <div className="flex flex-col text-left w-[168px]">
              <label className="mb-1 font-bold">Mode</label>
              <input
                type="text"
                value={payment.payment_mode}
                readOnly
                className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2 "
              />
            </div>

            {/* CR Button */}
            <div className="flex flex-col justify-end">
              <button className="bg-[#BF9853] w-20 h-[45px] rounded-lg text-white font-semibold">CR</button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500 mb-4">No previous payments found.</p>
      )}

      {/* New Entry */}
      <div className="flex gap-4 mb-6">
        {/* Date */}
        <div className="flex flex-col text-left w-[168px]">
          <label className="mb-1 font-bold">Date</label>
          <input
            type="date"
            value={mainDate}
            onChange={(e) => setMainDate(e.target.value)}
            className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2"
          />
        </div>

        {/* Amount */}
        <div className="flex flex-col text-left w-[168px]">
          <label className="mb-1 font-bold">Amount</label>
          <input
            type="number"
            value={popupAmount}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 0 && val <= remainingAmount) {
                setPopupAmount(val);
              }
            }}
            placeholder="Enter amount"
            className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2"
          />
        </div>

        {/* Mode */}
        <div className="flex flex-col text-left w-[168px]">
          <label className="mb-1 font-bold">Mode</label>
          <select
            value={mainMode}
            onChange={(e) => setMainMode(e.target.value)}
            className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2"
          >
            <option value="">Select Mode</option>
            <option value="Cash">Cash</option>
            <option value="G-pay">G-pay</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
          </select>
        </div>
      </div>

      {/* Save Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleSavePayment}
          className="bg-[#BF9853] text-white w-[114px] h-[36px] rounded hover:bg-[#a57f3f]"
        >
          Submit
        </button>
        <button
          onClick={() => setShowModal(false)}
          className="border border-[#BF9853] text-[#BF9853] w-[114px] h-[36px] rounded hover:bg-[#f9f5ef]"
        >
          Cancel
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-black"
      >
        ×
      </button>
    </div>
  </div>
)}

      </div>
    </body>
  );
}

export default ClaimPaymentSummary