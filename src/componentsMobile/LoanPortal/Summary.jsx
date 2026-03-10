import React, { useState, useEffect } from 'react';

const Summary = () => {
  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalLoan: 0,
    totalRefund: 0,
    totalTransfer: 0,
    netAmount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
        if (response.ok) {
          const data = await response.json();
          setLoanData(data);
          
          const loan = data.filter(e => e.type === 'Loan').reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
          const refund = data.filter(e => e.type === 'Refund').reduce((sum, e) => sum + (parseFloat(e.loan_refund_amount) || 0), 0);
          const transfer = data.filter(e => e.type === 'Transfer').reduce((sum, e) => sum + Math.abs(parseFloat(e.amount) || 0), 0);
          const net = loan - refund - transfer;
          
          setSummary({
            totalLoan: loan,
            totalRefund: refund,
            totalTransfer: transfer,
            netAmount: net
          });
        }
      } catch (error) {
        console.error('Error fetching loan data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto pb-20 px-4 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 px-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="max-w-[360px] mx-auto py-4">
        <h2 className="text-lg font-semibold mb-4">Loan Summary</h2>
        
        {/* Summary Cards */}
        <div className="space-y-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Loan Amount</p>
            <p className="text-xl font-semibold text-green-600">₹{summary.totalLoan.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Refund Amount</p>
            <p className="text-xl font-semibold text-red-600">₹{summary.totalRefund.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Transfer Amount</p>
            <p className="text-xl font-semibold text-blue-600">₹{summary.totalTransfer.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-gradient-to-r from-[#BF9853] to-[#D4AF6A] rounded-lg p-4 text-white">
            <p className="text-xs mb-1 opacity-90">Net Outstanding</p>
            <p className="text-2xl font-bold">₹{summary.netAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-3">Recent Transactions</h3>
          {loanData.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No transactions found</div>
          ) : (
            <div className="space-y-2">
              {loanData.slice(0, 10).map((entry, index) => (
                <div key={entry.loanPortalId || entry.id || index} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{entry.type || 'Loan'}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString('en-GB')}</p>
                    </div>
                    <p className={`text-sm font-semibold ${
                      entry.type === 'Loan' ? 'text-green-600' :
                      entry.type === 'Refund' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {entry.type === 'Loan' ? '+' : '-'}₹{Math.abs(parseFloat(entry.amount || entry.loan_refund_amount || 0)).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summary;
