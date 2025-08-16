import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

Date.prototype.getWeekNumber = function () {
  const firstDay = new Date(this.getFullYear(), 0, 1);
  const pastDaysOfYear = (this - firstDay) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
};

const AdvanceReport = () => {
  const [week, setWeek] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [advanceData, setAdvanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const scrollRef = useRef(null);
  const tableRef = useRef(null);

  // drag-scroll momentum refs
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    scroll.current = {
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop,
    };
    lastMove.current = { time: Date.now(), x: e.clientX, y: e.clientY };
    scrollRef.current.style.cursor = "grabbing";
    scrollRef.current.style.userSelect = "none";
    cancelMomentum();
  };
  const handleMouseMove = (e) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const now = Date.now();
    const dt = now - lastMove.current.time || 16;
    velocity.current = {
      x: (e.clientX - lastMove.current.x) / dt,
      y: (e.clientY - lastMove.current.y) / dt,
    };
    scrollRef.current.scrollLeft = scroll.current.left - dx;
    scrollRef.current.scrollTop = scroll.current.top - dy;
    lastMove.current = { time: now, x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => {
    if (!isDragging.current || !scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.style.cursor = "";
    scrollRef.current.style.userSelect = "";
    applyMomentum();
  };
  const cancelMomentum = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  };
  const applyMomentum = () => {
    if (!scrollRef.current) return;
    const friction = 0.95;
    const minVelocity = 0.1;
    const step = () => {
      const { x, y } = velocity.current;
      if (!scrollRef.current) return;
      if (Math.abs(x) > minVelocity || Math.abs(y) > minVelocity) {
        scrollRef.current.scrollLeft -= x * 20;
        scrollRef.current.scrollTop -= y * 20;
        velocity.current.x *= friction;
        velocity.current.y *= friction;
        animationFrame.current = requestAnimationFrame(step);
      } else {
        cancelMomentum();
      }
    };
    animationFrame.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => cancelMomentum();
  }, []);

  // Generate years dynamically
  const currentYear = new Date().getFullYear();
  const startYear = 2000; // Change if needed
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

  // Fetch Vendor Names
  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        const res = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        setVendorOptions(
          data.map((item) => ({ value: item.vendorName, label: item.vendorName, id: item.id }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchVendorNames();
  }, []);

  // Fetch Contractor Names
  useEffect(() => {
    const fetchContractorNames = async () => {
      try {
        const res = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        setContractorOptions(
          data.map((item) => ({ value: item.contractorName, label: item.contractorName, id: item.id }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchContractorNames();
  }, []);

  // Fetch Site Names
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        setSiteOptions(data.map((item) => ({ value: item.siteName, label: item.siteName, id: item.id })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchSites();
  }, []);

  // Fetch Advance Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://backendaab.in/aabuildersDash/api/advance_portal/getAll");
        const data = await res.json();
        setAdvanceData(data);
      } catch (err) {
        console.error("Error fetching advance data", err);
      }
    };
    fetchData();
  }, []);

  // Helper — ISO-ish week number (keeps original behavior)
  const getWeekNumberFromDate = (date) => {
    const d = new Date(date);
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  };

  const getCurrentWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  };

  // Default to current week
  useEffect(() => {
    const currentWeek = getCurrentWeekNumber();
    setWeek(`Week ${String(currentWeek).padStart(2, "0")}`);
  }, []);

  // Filter logic — if both startDate and endDate are provided, ignore week filter
  useEffect(() => {
    if (!advanceData.length) return;

    let filtered = advanceData;

    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      // normalize end to end of day
      e.setHours(23, 59, 59, 999);
      filtered = advanceData.filter((item) => {
        const d = new Date(item.date);
        return d >= s && d <= e;
      });
    } else if (week) {
      const selectedWeekNum = parseInt(week.replace("Week ", ""), 10);
      filtered = advanceData.filter((item) => {
        const d = new Date(item.date);
        return d.getFullYear() === parseInt(year, 10) && getWeekNumberFromDate(item.date) === selectedWeekNum;
      });
    } else {
      // If neither date-range nor week selected, default to empty
      filtered = [];
    }

    setFilteredData(filtered);
  }, [advanceData, startDate, endDate, week, year]);

  // fromDate/toDate/totalAdvance computations
  const fromDate = filteredData.length
    ? new Date(Math.min(...filteredData.map((r) => new Date(r.date)))).toLocaleDateString("en-GB")
    : "-";
  const toDate = filteredData.length
    ? new Date(Math.max(...filteredData.map((r) => new Date(r.date)))).toLocaleDateString("en-GB")
    : "-";
  const totalAdvance = filteredData
    .filter((r) => r.type !== "Transfer")
    .reduce((sum, r) => {
      const amount = r.amount || 0;
      const bill = r.bill_amount || 0;
      const refund = r.refund_amount || 0;
      return sum + (amount - bill - refund);
    }, 0)
    .toLocaleString("en-IN");

  // Export PDF (landscape) of tableRef
  const handleExportPDF = () => {
    if (!filteredData.length) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    const columns = [
      { header: "S.No", dataKey: "sno" },
      { header: "Date", dataKey: "date" },
      { header: "Contractor/Vendor", dataKey: "cv" },
      { header: "Project Name", dataKey: "project" },
      { header: "Advance", dataKey: "advance" },
      { header: "Bill Amount", dataKey: "bill" },
      { header: "Refund Amount", dataKey: "refund" },
      { header: "Transfer", dataKey: "transfer" },
      { header: "Type", dataKey: "type" },
      { header: "Mode", dataKey: "mode" },
      { header: "Description", dataKey: "description" },
    ];

    const normStr = v => (v ?? "").toString().trim().toLowerCase();

    function dateKey(val) {
      if (!val) return -Infinity;
      const s = String(val).trim();
      const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m1) {
        return new Date(+m1[3], +m1[2] - 1, +m1[1]).getTime();
      }
      const t = Date.parse(s);
      return isNaN(t) ? -Infinity : new Date(new Date(t).toDateString()).getTime();
    }

    const sortedData = [...filteredData].sort((a, b) => {
      const typeA = normStr(a.type), typeB = normStr(b.type);
      if (typeA !== typeB) return typeA.localeCompare(typeB);

      const modeA = normStr(a.payment_mode), modeB = normStr(b.payment_mode);
      if (modeA !== modeB) return modeA.localeCompare(modeB);

      return dateKey(a.date) - dateKey(b.date);
    });

    const totalAdvanceCash = sortedData
      .filter(row => normStr(row.type) === "advance" && normStr(row.payment_mode) === "cash")
      .reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);

    const rows = sortedData.map((row, index) => {
      const d = new Date(dateKey(row.date));
      return {
        sno: index + 1,
        date: isNaN(d) ? "" : d.toLocaleDateString("en-GB"),
        cv:
          contractorOptions.find(c => c.id === row.contractor_id)?.label ||
          vendorOptions.find(v => v.id === row.vendor_id)?.label || "",
        project: siteOptions.find(s => s.id === row.project_id)?.label || "",
        advance: row.amount?.toLocaleString("en-IN") || "0",
        bill: row.bill_amount?.toLocaleString("en-IN") || "0",
        refund: row.refund_amount?.toLocaleString("en-IN") || "0",
        transfer: siteOptions.find(s => s.id === row.transfer_site_id)?.label || "",
        type: row.type || "",
        mode: row.payment_mode || "",
        description: row.description || "",
      };
    });

    // Draw merged header as part of the table
    doc.autoTable({
      startY: 20,
      body: [
        [
          { content: "Start Date", styles: { fontStyle: 'bold' } },
          fromDate,
          { content: "End Date", styles: { fontStyle: 'bold' } },
          toDate,
          { content: "Total Cash Advance", styles: { fontStyle: 'bold' } },
          totalAdvanceCash.toLocaleString("en-IN"),
        ],
      ],
      theme: 'grid',
      styles: {
        fontSize: 10,
        halign: 'left',
        cellPadding: 5,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      columnStyles: {
        0: { cellWidth: 110 },
        1: { cellWidth: 140 },
        2: { cellWidth: 110 },
        3: { cellWidth: 140 },
        4: { cellWidth: 140 },
        5: { cellWidth: 124 },
      }
    });

    // Main data table starts after header
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      columns,
      body: rows,
      styles: {
        fontSize: 8,
        cellPadding: 4,
        overflow: "linebreak",
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
        fillColor: null,
        minCellHeight: 20
      },
      headStyles: {
        fillColor: null,
        textColor: 0,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: [0, 0, 0]
      },
      alternateRowStyles: { fillColor: null },
      columnStyles: {
        sno: { cellWidth: 28 },
        date: { cellWidth: 50 },
        cv: { cellWidth: 102 },
        project: { cellWidth: 130 },
        advance: { cellWidth: 45 },
        bill: { cellWidth: 40 },
        refund: { cellWidth: 40 },
        transfer: { cellWidth: 130 },
        type: { cellWidth: 65 },
        mode: { cellWidth: 54 },
        description: { cellWidth: 80 },
      }
    });

    doc.save(`AdvanceReport_${fromDate.replace(/\//g, "-")}_to_${toDate.replace(/\//g, "-")}.pdf`);
  };

  // Export Excel using xlsx
  const handleExportExcel = () => {
    if (!filteredData.length) {
      alert("No data to export");
      return;
    }

    const normStr = v => (v ?? "").toString().trim().toLowerCase();

    const dateKey = (val) => {
      if (!val) return -Infinity;
      const s = String(val).trim();
      const parts = s.split("/");
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        return new Date(`${yyyy}-${mm}-${dd}`).getTime();
      }
      const d = new Date(val);
      return isNaN(d) ? -Infinity : new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    };

    const sortedData = [...filteredData].sort((a, b) => {
      const typeA = normStr(a.type), typeB = normStr(b.type);
      if (typeA !== typeB) return typeA.localeCompare(typeB);

      const modeA = normStr(a.payment_mode), modeB = normStr(b.payment_mode);
      if (modeA !== modeB) return modeA.localeCompare(modeB);

      return dateKey(a.date) - dateKey(b.date);
    });

    const totalAdvanceCash = sortedData
      .filter(row => normStr(row.type) === "advance" && normStr(row.payment_mode) === "cash")
      .reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);

    const header = [
      "S.No",
      "Date",
      "Contractor/Vendor",
      "Project Name",
      "Advance",
      "Bill Amount",
      "Refund Amount",
      "Transfer",
      "Type",
      "Mode",
      "Description",
    ];

    const summaryRow = [
      "", "", "", "",
      `Total Cash Advance: ${totalAdvanceCash.toLocaleString("en-IN")}`,
      "", "", "", "", "", ""
    ];

    const rows = sortedData.map((row, idx) => {
      const contractor = contractorOptions.find((c) => c.id === row.contractor_id)?.label;
      const vendor = vendorOptions.find((v) => v.id === row.vendor_id)?.label;
      const project = siteOptions.find((s) => s.id === row.project_id)?.label;
      const transferSite = siteOptions.find((s) => s.id === row.transfer_site_id)?.label;

      return [
        idx + 1,
        new Date(row.date).toLocaleDateString("en-GB"),
        contractor || vendor || "",
        project || "",
        (row.amount ?? 0).toLocaleString("en-IN"),
        (row.bill_amount ?? 0).toLocaleString("en-IN"),
        (row.refund_amount ?? 0).toLocaleString("en-IN"),
        transferSite || "",
        row.type || "",
        row.payment_mode || "",
        row.description || "",
      ];
    });

    const aoa = [header, summaryRow, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AdvanceReport");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `AdvanceReport_${fromDate.replace(/\//g, "-")}_to_${toDate.replace(/\//g, "-")}.xlsx`
    );
  };

  return (
    <div>
      <div className="flex items-start justify-between bg-white p-4 ml-10 rounded-md shadow-sm w-[1750px]">
        {/* Left Section */}
        <div className="flex space-x-6 text-left">
          <div>
            <label className="block font-semibold mb-1">Week No</label>
            <select
              value={week}
              onChange={(e) => {
                setWeek(e.target.value);
                // clear date-range when week selected
                setStartDate("");
                setEndDate("");
              }}
              className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 focus:outline-none w-[168px] h-[45px]"
            >
              <option value="">Select</option>
              {Array.from({ length: getCurrentWeekNumber() }, (_, i) => (
                <option key={i} value={`Week ${String(i + 1).padStart(2, "0")}`}>
                  Week {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 w-[168px] h-[45px] focus:outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block font-semibold mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                // when using date filter, clear week selection so week filter is ignored
                setWeek("");
              }}
              className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 w-[168px] h-[45px] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setWeek("");
              }}
              className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 w-[168px] h-[45px] focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setWeek(`Week ${String(getCurrentWeekNumber()).padStart(2, "0")}`);
              }}
              className="px-3 py-2 border rounded"
            >
              Clear Dates
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div>
          <div className="text-sm text-right space-y-1 border-2 border-[#E4572E] border-opacity-15 p-2">
            <div>
              <span className="font-semibold">From Date</span> :{" "}
              <span className="text-red-500">
                {startDate
                  ? new Date(startDate).toLocaleDateString("en-GB")
                  : fromDate || "-"}
              </span>
            </div>
            <div>
              <span className="font-semibold">To Date</span> :{" "}
              <span className="text-red-500">
                {endDate
                  ? new Date(endDate).toLocaleDateString("en-GB")
                  : toDate || "-"}
              </span>
            </div>
          </div>
          <div className="text-sm text-right space-y-1 border-2 border-[#E4572E] border-opacity-15 p-2 mt-2">
            <div>
              <span className="font-semibold">Total Advance</span> : <span className="text-red-500 font-semibold">{totalAdvance}</span>
            </div>
          </div>
        </div>
      </div>

      <div className='w-[1750px] ml-10 bg-white mt-5 pt-5'>
        <div className='space-x-6 flex justify-end mr-20'>
          <button onClick={handleExportPDF} className='text-sm text-[#E4572E] hover:underline font-bold'>Export PDF</button>
          <button onClick={handleExportExcel} className='text-sm text-[#007233] hover:underline font-bold'>Export XL</button>
          <button className='text-sm text-[#BF9853] hover:underline font-bold'>Print</button>
        </div>

        <div
          ref={scrollRef}
          className=" rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[630px] overflow-auto select-none ml-5 mr-5"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <table ref={tableRef} className="table-fixed  min-w-[1635px] w-screen border-collapse">
            <thead className='bg-[#FAF6ED]'>
              <tr>
                <th className="pt-2 pl-3 w-20 font-bold text-left">S.No</th>
                <th className="pt-2 pl-3 w-36 font-bold text-left">Date</th>
                <th className="px-2 w-[220px] font-bold text-left">Contractor/Vendor</th>
                <th className="px-2 w-[270px] font-bold text-left">Project Name</th>
                <th className="px-2 w-[100px] font-bold text-left">Advance</th>
                <th className="px-2 w-[120px] font-bold text-left">Bill Amount</th>
                <th className="px-2 w-[120px] font-bold text-left">Refund Amount</th>
                <th className="px-2 w-[220px] font-bold text-left">Transfer</th>
                <th className="px-2 w-[160px] font-bold text-left">Type</th>
                <th className="px-2 w-[120px] font-bold text-left">Mode</th>
                <th className="px-2 w-[120px] font-bold text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-4 text-gray-500 font-semibold">No Entry is available</td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={row.id || index} className="odd:bg-white even:bg-[#FAF6ED]">
                    <td className="text-sm text-left p-3 w-32 font-semibold">{index + 1}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{new Date(row.date).toLocaleDateString("en-GB")}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{contractorOptions.find(c => c.id === row.contractor_id)?.label || vendorOptions.find(v => v.id === row.vendor_id)?.label || "-"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{siteOptions.find(s => s.id === row.project_id)?.label || "-"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{row.amount?.toLocaleString("en-IN") || "0"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{row.bill_amount?.toLocaleString("en-IN") || "0"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{row.refund_amount?.toLocaleString("en-IN") || "0"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{siteOptions.find(s => s.id === row.transfer_site_id)?.label || "-"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{row.type || "-"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{row.payment_mode || "-"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{row.description || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvanceReport;
