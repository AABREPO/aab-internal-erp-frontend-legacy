import React, { useState, useEffect } from 'react';

const History = ({ user }) => {
  const [historyData, setHistoryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https:///api/po_category/getAll');
        if (response.ok) {
          const data = await response.json();
          const options = data.map(item => ({
            value: item.category,
            label: item.category,
            id: item.id,
          }));
          setCategoryOptions(options);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch history data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual tools tracker history API
        const response = await fetch('https:///api/tools_tracker/history');
        if (response.ok) {
          const data = await response.json();
          setHistoryData(data);
        } else {
          // Sample data for now
          setHistoryData([
            {
              id: 1,
              entryNo: 236,
              itemName: 'Drilling Machine',
              from: 'Ramar Krishnankovil',
              to: 'Rafiq Ashok Nagar',
              date: '15/04/2025',
              time: '09:06 AM',
              itemId: 'AA DM 01',
              machineNumber: '5411117822223',
              status: 'Working',
              personName: 'Mani Kandan K'
            },
            {
              id: 2,
              entryNo: 236,
              itemName: 'Cutting Machine',
              from: 'Moorthi RKPM',
              to: 'Stock Room A',
              date: '15/04/2025',
              time: '09:06 AM',
              itemId: 'AA CM 01',
              machineNumber: '5411117822223',
              status: 'Working',
              personName: 'Vinoth Kumar K'
            },
            {
              id: 3,
              entryNo: 236,
              itemName: 'Drilling Machine',
              from: 'Ramar Krishnankovil',
              to: 'Rafiq Ashok Nagar',
              date: '12/04/2025',
              time: '09:06 AM',
              itemId: '5',
              machineNumber: '',
              status: 'Working',
              personName: 'Prabhu J'
            },
            {
              id: 4,
              entryNo: 233,
              itemName: 'Drilling Machine',
              from: 'Stock Room B',
              to: 'Ramar Krishnan Kovil',
              date: '10/04/2025',
              time: '09:06 AM',
              itemId: 'AA DM 01',
              machineNumber: '247700001899',
              status: 'Not Working',
              personName: 'Vinoth M'
            },
            {
              id: 5,
              entryNo: 232,
              itemName: 'Mixer Machine',
              from: 'Stock Room A',
              to: 'Ganesh Valaikulam Street',
              date: '05/04/2025',
              time: '09:06 AM',
              itemId: 'AA MM 05',
              machineNumber: '5411117822223',
              status: 'Working',
              personName: 'Vinoth Kumar K'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
        // Use sample data on error
        setHistoryData([
          {
            id: 1,
            entryNo: 236,
            itemName: 'Drilling Machine',
            from: 'Ramar Krishnankovil',
            to: 'Rafiq Ashok Nagar',
            date: '15/04/2025',
            time: '09:06 AM',
            itemId: 'AA DM 01',
            machineNumber: '5411117822223',
            status: 'Working',
            personName: 'Mani Kandan K'
          },
          {
            id: 2,
            entryNo: 236,
            itemName: 'Cutting Machine',
            from: 'Moorthi RKPM',
            to: 'Stock Room A',
            date: '15/04/2025',
            time: '09:06 AM',
            itemId: 'AA CM 01',
            machineNumber: '5411117822223',
            status: 'Working',
            personName: 'Vinoth Kumar K'
          },
          {
            id: 3,
            entryNo: 236,
            itemName: 'Drilling Machine',
            from: 'Ramar Krishnankovil',
            to: 'Rafiq Ashok Nagar',
            date: '12/04/2025',
            time: '09:06 AM',
            itemId: '5',
            machineNumber: '',
            status: 'Working',
            personName: 'Prabhu J'
          },
          {
            id: 4,
            entryNo: 233,
            itemName: 'Drilling Machine',
            from: 'Stock Room B',
            to: 'Ramar Krishnan Kovil',
            date: '10/04/2025',
            time: '09:06 AM',
            itemId: 'AA DM 01',
            machineNumber: '247700001899',
            status: 'Not Working',
            personName: 'Vinoth M'
          },
          {
            id: 5,
            entryNo: 232,
            itemName: 'Mixer Machine',
            from: 'Stock Room A',
            to: 'Ganesh Valaikulam Street',
            date: '05/04/2025',
            time: '09:06 AM',
            itemId: 'AA MM 05',
            machineNumber: '5411117822223',
            status: 'Working',
            personName: 'Vinoth Kumar K'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [selectedCategory]);

  return (
    <div className="flex flex-col bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Category Filter */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-gray-200 mb-2">
        <p className="text-[12px] text-[#848484] leading-normal">Category</p>
      </div>

      {/* History Entries List */}
      <div className="flex-1 px-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">Loading...</p>
          </div>
        ) : historyData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">No history entries found.</p>
          </div>
        ) : (
          <div className="shadow-lg rounded-[8px] ">
            {historyData.map((entry) => (
              <div
                key={entry.id}
                className="border-2 rounded-lg border-gray-200 p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  {/* Left side - Entry number and item name */}
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                      #{entry.entryNo}, {entry.itemName}
                    </p>
                    <p className="text-[11px] text-[#848484] leading-normal mb-1">
                      From - {entry.from}
                    </p>
                    <p className="text-[11px] text-[#BF9853] leading-normal mb-1">
                      To - {entry.to}
                    </p>
                    <p className="text-[11px] text-[#848484] leading-normal">
                      {entry.date} • {entry.time}
                    </p>
                  </div>
                  {/* Right side - Item ID, Machine Number, Status, Person */}
                  <div className="flex flex-col items-end ml-4">
                    {entry.itemId && (
                      <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                        {entry.itemId}
                      </p>
                    )}
                    {entry.machineNumber && (
                      <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                        {entry.machineNumber}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mb-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          entry.status === 'Working' ? 'bg-[#4CAF50]' : 'bg-[#F44336]'
                        }`}
                      ></span>
                      <p
                        className={`text-[11px] font-medium leading-normal ${
                          entry.status === 'Working' ? 'text-[#4CAF50]' : 'text-[#F44336]'
                        }`}
                      >
                        • {entry.status}
                      </p>
                    </div>
                    <p className="text-[12px] font-semibold text-black leading-normal">
                      {entry.personName}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
