import React, { useState } from 'react';

const ServiceHistory = ({ user }) => {
  const [serviceData] = useState([
    {
      id: 1,
      itemName: 'Drilling Machine',
      date: null,
      idNumber: '220447885500',
      shopName: 'Guru Electricals',
      attachment: null,
      serviceDate: '12/04/2025',
      servicedBy: 'Prabhu J',
      status: 'Pending',
      statusColor: 'orange',
      cost: 0,
      referenceCode: 'AA DM 04'
    },
    {
      id: 2,
      itemName: 'Drilling Machine',
      date: '15/04/2025',
      idNumber: '220447885500',
      shopName: 'Sakthi Electricals',
      attachment: 'Drilling.jpg',
      serviceDate: '12/04/2025',
      servicedBy: 'Vinoth J',
      status: 'Problem Solved',
      statusColor: 'orange',
      cost: 300,
      referenceCode: 'AA DM 07'
    },
    {
      id: 3,
      itemName: 'Drilling Machine',
      date: '15/04/2025',
      idNumber: '220447885500',
      shopName: 'Sakthi Electricals',
      attachment: 'Drilling.jpg',
      serviceDate: '12/04/2025',
      servicedBy: 'Vinoth J',
      status: 'Machine Dead',
      statusColor: 'red',
      cost: 230,
      referenceCode: 'AA DM 09'
    }
  ]);

  return (
    <div className="flex flex-col bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Top Header Section */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 ">
        <div className="flex justify-between items-start border-b border-gray-200 mb-2">
          <div>
            <p className="text-[14px] font-medium text-black leading-normal mb-2">Shop Name</p>
          </div>
        </div>
        <div className="flex justify-between items-center gap-x-4 gap-y-0 mt-1">
          <div className="flex items-center gap-1">
            <span className="text-[12px] text-[#848484] leading-normal flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#848484]" />
              Purchase Cost: 0
            </span>
            <span className="text-[12px] text-[#E07C24] leading-normal flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E07C24]" />
              Service Cost: 0
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className="text-[14px] font-medium text-black cursor-pointer hover:opacity-80">
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Service Records List */}
      <div className="flex-1 shadow-lg  overflow-y-auto">
        {serviceData.map((entry) => (
          <div
            key={entry.id}
            className=" rounded-[8px] p-4 border-2 border-gray-200"
          >
            <div className="flex justify-between items-start gap-4">
              {/* Left Column - Item Details */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-black leading-normal">
                  {entry.itemName}
                  {entry.date && (
                    <span className="text-[11px] font-normal text-[#848484]">, {entry.date}</span>
                  )}
                </p>
                <p className="text-[14px] font-semibold text-black leading-normal mt-1">
                  {entry.idNumber}
                </p>
                <p className="text-[12px] font-medium text-[#BF9853] leading-normal mt-1">
                  {entry.shopName}
                </p>
                {entry.attachment && (
                  <div className="flex items-center gap-1 mt-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0"
                    >
                      <path
                        d="M3 18L8 10L12 14L16 8L21 18H3Z"
                        fill="#64B5F6"
                        stroke="#64B5F6"
                        strokeWidth="1"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[11px] text-[#848484] leading-normal">
                      {entry.attachment}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column - Service Details */}
              <div className="flex flex-col items-end flex-shrink-0">
                <p className="text-[12px] font-medium text-black leading-normal">
                  {entry.serviceDate}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#848484] flex-shrink-0"
                  >
                    <path
                      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[11px] text-[#848484] leading-normal">
                    {entry.servicedBy}
                  </span>
                </div>
                <div className="mt-1 text-right">
                  <span
                    className={`text-[11px] font-medium ${entry.statusColor === 'red' ? 'text-[#F44336]' : 'text-[#BF9853]'
                      }`}
                  >
                    {entry.status},{' '}
                  </span>
                  <span className="text-[12px] font-medium text-[#4CAF50]">
                    Rs.{entry.cost}
                  </span>
                </div>
                <p className="text-[13px] font-semibold text-[#4CAF50] leading-normal mt-2">
                  {entry.referenceCode}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceHistory;
