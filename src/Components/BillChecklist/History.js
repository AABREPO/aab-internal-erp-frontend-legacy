import { useState, useRef } from "react";

const History = () => {
    const [isDragging, setIsDragging] = useState(false);
        const [startX, setStartX] = useState(0);
        const [startY, setStartY] = useState(0);
        const [scrollLeft, setScrollLeft] = useState(0);
        const [scrollTop, setScrollTop] = useState(0);
        const [selectedFile, setSelectedFile] = useState(null);
        const scrollRef = useRef(null);
    
        const handleMouseDown = (e) => {
            setIsDragging(true);
            setStartX(e.pageX - scrollRef.current.offsetLeft);
            setStartY(e.pageY - scrollRef.current.offsetTop);
            setScrollLeft(scrollRef.current.scrollLeft);
            setScrollTop(scrollRef.current.scrollTop);
        };
    
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - scrollRef.current.offsetLeft;
            const y = e.pageY - scrollRef.current.offsetTop;
            const walkX = (x - startX);
            const walkY = (y - startY);
            scrollRef.current.scrollLeft = scrollLeft - walkX;
            scrollRef.current.scrollTop = scrollTop - walkY;
        };
    
        const handleMouseUp = () => {
            setIsDragging(false);
        };
    const [month, setMonth] = useState("April");

    return (
        <body>
            <div className=" bg-[#FAF6ED]">
                <div className=" mx-auto w-[1800px] h-[128px] p-4 border-collapse bg-[#FFFFFF] ml-9 mr-6 rounded-md">
                    <div className="w-full p-4">
                        <div className="flex gap-6">
                            {/* Year */}
                            <div className="flex flex-col">
                                <label className="text-base font-semibold mb-1 text-left">Year</label>
                                <select className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 w-[110px] h-[45px] focus:outline-none">
                                    <option>2024</option>
                                    <option>2025</option>
                                </select>
                            </div>

                            {/* Month */}
                            <div className="flex flex-col">
                                <label className="text-base font-semibold mb-1 text-left">Month</label>
                                <select
                                    className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 w-[149px] h-[45px] focus:outline-none"
                                >
                                    <option value="">Select Month</option>
                                    <option>January</option>
                                    <option>February</option>
                                    <option>March</option>
                                    <option>April</option>
                                    <option>May</option>
                                    <option>June</option>
                                    <option>July</option>
                                    <option>August</option>
                                    <option>September</option>
                                    <option>October</option>
                                    <option>November</option>
                                    <option>December</option>
                                </select>
                            </div>

                            {/* Entry Check List */}
                            <div className="flex flex-col">
                                <label className="text-base font-semibold mb-1 text-left">Entry Check List</label>
                                <select className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 w-[168px] h-[45px] focus:outline-none">
                                    <option>779</option>
                                    <option>780</option>
                                </select>
                            </div>

                            {/* Entry Date */}
                            <div className="flex flex-col">
                                <label className="text-base font-semibold mb-1 text-left">Entry Date</label>
                                <input type="date" className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 w-[168px] h-[45px] focus:outline-none" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Main Content */}
                <div className="flex ml-9 gap-10 mt-5">
                    <div className="bg-white rounded-lg shadow p-4 w-[693px] h-[610px] space-y-2">
                        
                    </div>
                    {/* Right: Entry Detail */}
                    <div className="bg-white rounded-lg shadow p-4 w-[1056px] h-[610px]">
                        <div>
                            <h1 className="text-2xl font-bold">Entry Check List</h1>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <div className="ml-5">
                                <div className="text-base font-medium mt-3">
                                    <label>Entry No:</label>
                                </div>
                                <div className="text-base font-medium ml-6 mt-3">
                                    <label>Date:</label>
                                </div>
                            </div>
                            <div className=" items-center">
                                <div className=" text-[#ef6f47] rounded text-sm">
                                    <input
                                        className="bg-gray-100 w-[49px] h-[39px] rounded-md"
                                    />
                                </div>
                                <button className="flex mt-3 items-center gap-1 text-base font-semibold">
                                    Export PDF
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className={`rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] max-w-screen-2xl overflow-x-scroll table-auto min-w-full ${isDragging ? 'cursor-grabbing select-none' : 'cursor-default'
                            }`}
                            ref={scrollRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}>
                            <table className="table-fixed  min-w-[1765px] w-screen overflow-auto border-collapse appearance-none">
                                <thead className="bg-[#fdfcf7]">
                                <tr className="bg-[#FAF6ED]">
                                    <th className="px-2 w-[150px]">Time stamp</th>
                                    <th className="px-2 p-2 w-24">Date</th>
                                    <th className="px-2 w-[70px]">E.No</th>
                                    <th className="px-2 w-[200px]">Project Name</th>
                                    <th className="px-2 w-[120px]">Vendor</th>
                                    <th className="px-2 w-[120px]">Contractor</th>
                                    <th className="px-2 w-[120px]">Quantity</th>
                                    <th className="px-2 w-[120px]">Amount</th>
                                    <th className="px-2 w-[120px]">Comments</th>
                                    <th className="px-2 w-[220px]">Category</th>
                                    <th className="px-3 w-[120px]">Attach file</th>
                                    <th className="px-2 w-[120px]">Activity</th>
                                </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </body>
    );
}

export default History
