import React, { useState, useEffect } from 'react';

const PendingItems = ({ user }) => {
  const [pendingData, setPendingData] = useState([]);
  const [selectedDays, setSelectedDays] = useState('30');
  const [loading, setLoading] = useState(true);

  // Fetch pending items data
  useEffect(() => {
    const fetchPendingItems = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual tools tracker pending items API
        const response = await fetch(`https:///api/tools_tracker/pending?days=${selectedDays}`);
        if (response.ok) {
          const data = await response.json();
          setPendingData(data);
        } else {
          // Sample data for now
          setPendingData([
            {
              id: 1,
              entryNo: 7,
              itemName: 'Drilling Machine',
              from: 'Rafiq Ashok Nagar',
              to: 'Ramar Krishnankovil',
              date: '16/05/2025',
              itemId: 'AA DM 02',
              daysPending: '30 Days',
              personName: 'Vinoth Kumar K'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching pending items:', error);
        // Use sample data on error
        setPendingData([
          {
            id: 1,
            entryNo: 7,
            itemName: 'Drilling Machine',
            from: 'Rafiq Ashok Nagar',
            to: 'Ramar Krishnankovil',
            date: '16/05/2025',
            itemId: 'AA DM 02',
            daysPending: '30 Days',
            personName: 'Vinoth Kumar K'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingItems();
  }, [selectedDays]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-90px-80px)] bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Filter and Action Bar */}
      <div className="flex justify-between px-4 pt-2 mb-2">
        <div className="flex bg-gray-100 items-center h-6 shadow-sm rounded-full">
          <button
            onClick={() => setSelectedDays('all')}
            className={`flex py-1 px-4 ml-1 h-5 rounded-full text-[11px] items-center font-medium transition-colors ${
              selectedDays === 'all'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            All Days
          </button>
          <button
            onClick={() => setSelectedDays('30')}
            className={`flex py-1 px-4 ml-1 h-5 rounded-full text-[11px] items-center font-medium transition-colors ${
              selectedDays === '30'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setSelectedDays('60')}
            className={`flex py-1 px-4 ml-1 h-5 rounded-full text-[11px] items-center font-medium transition-colors ${
              selectedDays === '60'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            60 Days
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-black leading-normal">Download</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4H14M2 8H14M2 12H14" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 2L14 4L12 6M12 10L14 12L12 14" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Pending Items List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">Loading...</p>
          </div>
        ) : pendingData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">No pending items found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingData.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[8px] p-4 shadow-sm border border-[#E0E0E0]"
              >
                <div className="flex justify-between items-start">
                  {/* Left side - Entry number, item name, from, to, date */}
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                      #{item.entryNo}, {item.itemName}
                    </p>
                    <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                      From - {item.from}
                    </p>
                    <p className="text-[12px] font-semibold text-[#BF9853] leading-normal mb-1">
                      To - {item.to}
                    </p>
                    <p className="text-[11px] text-[#848484] leading-normal">
                      {item.date}
                    </p>
                  </div>
                  {/* Right side - Item ID, Days Pending, Person Name */}
                  <div className="flex flex-col items-end ml-4">
                    {item.itemId && (
                      <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                        {item.itemId}
                      </p>
                    )}
                    {item.daysPending && (
                      <p className="text-[12px] font-semibold text-[#e06256] leading-normal mb-1">
                        {item.daysPending}
                      </p>
                    )}
                    <p className="text-[12px] font-semibold text-[#848484] leading-normal">
                      {item.personName}
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

export default PendingItems;
