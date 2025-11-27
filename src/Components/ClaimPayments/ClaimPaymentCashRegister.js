import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClaimPaymentCashRegister = () => {
  const [cashRegisterData, setCashRegisterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchCashRegisterData();
  }, []);

  const fetchCashRegisterData = async () => {
    try {
      setLoading(true);
      
      // Fetch all expenses data first
      const expensesResponse = await axios.get('https://backendaab.in/aabuilderDash/expenses_form/get_form');
      const allExpenses = expensesResponse.data;
      
      // Filter only claim expenses
      const claimExpenses = allExpenses.filter(expense => expense.accountType === 'Claim');
      
      // Create a map of expenses by expenses_claim_id for quick lookup
      const expensesMap = {};
      claimExpenses.forEach(expense => {
        expensesMap[expense.expenses_claim_id || expense.id] = expense;
      });
      
      // Create array of promise requests for parallel execution (limit to 10 concurrent requests)
      const batchSize = 10;
      const paymentResults = [];
      
      const totalBatches = Math.ceil(claimExpenses.length / batchSize);
      
      for (let i = 0; i < claimExpenses.length; i += batchSize) {
        const batch = claimExpenses.slice(i, i + batchSize);
        const currentBatch = Math.floor(i / batchSize) + 1;
        
        // Update progress
        setProgress(Math.round((currentBatch / totalBatches) * 100));
        
        const batchPromises = batch.map(expense => 
          axios.get(`https://backendaab.in/aabuildersDash/api/claim_payments/get/${expense.id}`, {
            timeout: 10000 // 10 second timeout
          })
            .then(response => ({
              expenseId: expense.id,
              payments: response.data
            }))
            .catch(error => {
              console.error(`Error fetching payments for expense ${expense.id}:`, error);
              return {
                expenseId: expense.id,
                payments: []
              };
            })
        );
        
        const batchResults = await Promise.all(batchPromises);
        paymentResults.push(...batchResults);
      }
      
      // Process results and build cash register items
      const cashRegisterItems = [];
      
      paymentResults.forEach(result => {
        const claimPayments = result.payments;
        
        // Filter payments where cash_register_status is true
        const cashRegisterPayments = claimPayments.filter(payment => payment.cash_register_status === true);
        
        // Add each cash register payment to our list
        cashRegisterPayments.forEach(payment => {
          cashRegisterItems.push({
            ...payment,
            expenseData: expensesMap[payment.expenses_claim_id || result.expenseId]
          });
        });
      });
      
      setCashRegisterData(cashRegisterItems);
    } catch (error) {
      console.error('Error fetching cash register data:', error);
      setError('Failed to fetch cash register data');
    } finally {
      setLoading(false);
    }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatIndianCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  if (loading) {
    return (
      <body>
        <div className='bg-white h-[500px] p-10 ml-10 mr-10 flex flex-col items-center justify-center'>
          <div className="text-lg mb-4">Loading cash register data...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BF9853] mb-4"></div>
          <div className="text-sm text-gray-600">
            Progress: {progress}%
          </div>
          <div className="w-64 bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-[#BF9853] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </body>
    );
  }

  if (error) {
    return (
      <body>
        <div className='bg-white w-[1700px] h-[500px] p-10 ml-10 flex items-center justify-center'>
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </body>
    );
  }

  return (
    <body>
      <div className='bg-white w-[1700px] h-[500px] p-10 ml-10'>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#BF9853] mb-2">Cash Register - Claim Payments</h2>
        </div>        
        <div className='border-l-8 border-l-[#BF9853] rounded-lg overflow-auto max-h-[400px]'>
          <table className="w-full rounded-lg">
            <thead className="bg-[#FAF6ED] sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left">S.No</th>
                <th className="px-4 py-2 text-left">Time Stamp</th>
                <th className="px-4 py-2 text-left">Expense Date</th>
                <th className="px-4 py-2 text-left">Project Name</th>
                <th className="px-4 py-2 text-left">Expense Amount</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Received Date</th>
                <th className="px-4 py-2 text-left">Received Amount</th>
                <th className="px-4 py-2 text-left">Payment Mode</th>
                <th className="px-4 py-2 text-left">E.No</th>
              </tr>
            </thead>
            <tbody>
              {cashRegisterData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    No cash register entries found
                  </td>
                </tr>
              ) : (
                cashRegisterData.map((item, index) => (
                  <tr key={index} className={`even:bg-[#FAF6ED] odd:bg-[#FFFFFF] font-bold text-[14px]`}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className='px-4 py-2'>
                      {item.expenseData ? formatDate(item.expenseData.timestamp) : '-'}
                    </td>
                    <td className="px-4 py-2">
                      {item.expenseData ? formatDateOnly(item.expenseData.date) : '-'}
                    </td>
                    <td className="px-4 py-2">
                      {item.expenseData ? item.expenseData.siteName : '-'}
                    </td>
                    <td className="px-4 py-2">
                      {item.expenseData ? formatIndianCurrency(item.expenseData.amount) : '-'}
                    </td>
                    <td className="px-4 py-2">
                      {item.expenseData ? item.expenseData.category : '-'}
                    </td>
                    <td className="px-4 py-2">{formatDateOnly(item.date)}</td>
                    <td className="px-4 py-2">{formatIndianCurrency(item.amount)}</td>
                    <td className="px-4 py-2">{item.payment_mode}</td>
                    <td className="px-4 py-2">
                      {item.expenseData ? item.expenseData.eno : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {cashRegisterData.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total Cash Register Entries: {cashRegisterData.length}
          </div>
        )}
      </div>
    </body>
  );
};

export default ClaimPaymentCashRegister;

const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes());
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};