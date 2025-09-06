import React, { useState, useEffect } from 'react';
import EditIcon from "../Images/Edit.svg";
import axios from 'axios';

const ClaimPaymentTableView = ({ username, userRoles = [] }) => {
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
  const [editingIndex, setEditingIndex] = useState(null);
  const formatAmount = (value) => {
    const num = Number(value || 0);
    return num.toLocaleString('en-IN');
  };
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
      console.log("Claim Payments: ", claimPayments);
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

  const claimedData = filteredData.filter(
    row => (receivedAmounts[row.id] || 0) >= row.amount
  );
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
              {claimedData.map((row, index) => {
                const isClaimed = Number(receivedAmounts[row.id] || 0) >= Number(row.amount || 0);
                return (
                  <tr key={index} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF] font-bold text-[14px]">
                    <td className="py-2">{formatDateOnly(row.date)}</td>
                    <td className="py-2">{row.siteName}</td>
                    <td className="py-2">{formatAmount(row.amount)}</td>
                    <td className="py-2">{row.category}</td>
                    <td className="py-2">{row.reason || row.comments}</td>
                    <td className={`py-2 font-semibold ${isClaimed ? 'text-[#007233]' : 'text-[#E4572E]'}`}>
                      {isClaimed ? 'Claimed' : 'Unclaimed'}
                    </td>
                    <td className="py-2">{row.eno}</td>
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
                );
              })}
            </tbody>
          </table>
        </div>
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
                        type="date"
                        value={
                          payment.date
                            ? payment.date.length > 10
                              ? payment.date.split("T")[0] // trims timestamp if present
                              : payment.date // already "YYYY-MM-DD"
                            : ""
                        }
                        readOnly={editingIndex !== idx}
                        onChange={(e) => {
                          const updated = [...claimPaymentsData];
                          updated[idx].date = e.target.value;
                          setClaimPaymentsData(updated);
                        }}
                        className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2"
                      />
                    </div>
                    {/* Amount */}
                    <div className="flex flex-col text-left w-[168px]">
                      <label className="mb-1 font-bold">Amount</label>
                      <input
                        type="text"
                        value={Number(payment.amount)}
                        readOnly={editingIndex !== idx}
                        onChange={(e) => {
                          const updated = [...claimPaymentsData];
                          updated[idx].amount = e.target.value;
                          setClaimPaymentsData(updated);
                        }}
                        className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2"
                      />
                    </div>
                    {/* Mode */}
                    <div className="flex flex-col text-left w-[168px]">
                      <label className="mb-1 font-bold">Mode</label>
                      {editingIndex === idx ? (
                        <select
                          value={payment.payment_mode}
                          onChange={(e) => {
                            const updated = [...claimPaymentsData];
                            updated[idx].payment_mode = e.target.value;
                            setClaimPaymentsData(updated);
                          }}
                          className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2"
                        >
                          <option value="">Select Mode</option>
                          <option value="Cash">Cash</option>
                          <option value="G-pay">G-pay</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="UPI">UPI</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={payment.payment_mode}
                          readOnly
                          className="border border-[#BF9853]/25 rounded-lg h-[45px] px-3 py-2"
                        />
                      )}
                    </div>
                    {/* Action Column */}
                    <div className="flex items-end gap-2 w-[120px]">
                      {payment.payment_mode === "Cash" && (
                        <button
                          className={`w-20 h-[45px] mr-1 rounded-lg text-white font-semibold 
                              ${payment.cash_register_status ? "bg-gray-400 cursor-not-allowed" : "bg-[#BF9853]"}`}
                          disabled={payment.cash_register_status}
                          onClick={async () => {
                            if (payment.cash_register_status) return;

                            try {
                              // 🔹 Check if already exists in backend
                              const res = await axios.get(
                                `https://backendaab.in/aabuildersDash/api/cash-register/get/${payment.claimPaymentsId}`
                              );

                              if (res.data && res.data.length > 0) {
                                alert("This payment is already in the cash register.");
                                return;
                              }

                              // 🔹 1) Save to Cash Register
                              const cashRegisterPayload = {
                                claim_payments_id: payment.claimPaymentsId,
                                date: payment.date,
                                payment_mode: payment.payment_mode,
                                amount: payment.amount,
                                cash_register_status: true,
                              };

                              await axios.post(
                                "https://backendaab.in/aabuildersDash/api/cash-register/save",
                                cashRegisterPayload,
                                { headers: { "Content-Type": "application/json" } }
                              );

                              // 🔹 2) Save to Payments Received
                              const paymentsReceivedPayload = {
                                date: payment.date,
                                amount: Number(payment.amount),
                                type: "Claim",
                                weekly_number: "",
                                status: false,
                              };

                              await axios.post(
                                "https://backendaab.in/aabuildersDash/api/payments-received/save",
                                paymentsReceivedPayload,
                                { headers: { "Content-Type": "application/json" } }
                              );

                              // 🔹 3) Update ClaimPayments.cashRegisterStatus → true
                              await axios.put(
                                `https://backendaab.in/aabuildersDash/api/claim_payments/update-status/${payment.claimPaymentsId}?status=true`
                              );

                              // 🔹 4) Update UI immediately
                              setClaimPaymentsData((prev) =>
                                prev.map((p, i) =>
                                  i === idx ? { ...p, cashRegisterStatus: true } : p
                                )
                              );

                              alert("Added to Cash Register, Payments Received & updated ClaimPayments ✅");
                            } catch (err) {
                              console.error("Error adding payment:", err);
                              alert("Failed to add payment.");
                            }
                          }}
                        >
                          CR
                        </button>
                      )}
                      <button
                        className="w-10 h-[45px] flex items-center justify-center"
                        onClick={() => setEditingIndex(idx)}
                      >
                        <img src={EditIcon} className="w-5 h-5" />
                      </button>
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
              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                {editingIndex !== null ? (
                  <>
                    <button
                      onClick={() => {
                        handleSavePayment(editingIndex);
                        setEditingIndex(null);
                      }}
                      className="bg-[#BF9853] text-white w-[114px] h-[36px] rounded hover:bg-[#a57f3f]"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="border border-[#BF9853] text-[#BF9853] w-[114px] h-[36px] rounded hover:bg-[#f9f5ef]"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-[#BF9853] text-white w-[114px] h-[36px] rounded hover:bg-[#a57f3f]"
                  >
                    Okay
                  </button>
                )}
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
  )
}

export default ClaimPaymentTableView
