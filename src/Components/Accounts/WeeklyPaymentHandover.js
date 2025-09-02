import { useEffect, useState } from "react";
import axios from "axios";

const HandoverPaymentsPage = () => {
  const [handoverPayments, setHandoverPayments] = useState([]);

  useEffect(() => {
    const fetchHandoverPayments = async () => {
      try {
        const res = await axios.get("https://backendaab.in/aabuildersDash/api/payments-received/getAll");
        // Filter only Handover payments
        const filtered = res.data.filter((payment) => payment.type === "Handover");
        setHandoverPayments(filtered);
      } catch (error) {
        console.error("Error fetching handover payments:", error);
      }
    };

    fetchHandoverPayments();
  }, []);

  return (
    <body>
      <div className="p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">All Handover Payments</h2>

        {handoverPayments.length === 0 ? (
          <p>No handover payments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Week</th>
                  <th className="px-4 py-2 border">Type</th>
                  <th className="px-4 py-2 border">Amount</th>
                  <th className="px-4 py-2 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {handoverPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">{payment.weekly_number}</td>
                    <td className="px-4 py-2 border text-center">{payment.type}</td>
                    <td className="px-4 py-2 border text-center">{payment.amount}</td>
                    <td className="px-4 py-2 border text-center">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </body>
  );
};

export default HandoverPaymentsPage;
