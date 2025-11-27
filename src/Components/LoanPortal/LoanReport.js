import React, { useState, useEffect, useMemo } from "react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const LoanReport = () => {
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [loanData, setLoanData] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [totalAdvance, setTotalAdvance] = useState(0);

    const getCurrentWeekAndYear = () => {
        const today = new Date();
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        const pastDays = (today - firstDayOfYear) / 86400000;
        const currentWeek = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
        return {
            week: `Week ${currentWeek.toString().padStart(2, "0")}`,
            year: today.getFullYear().toString(),
        };
    };

    const { week, year } = getCurrentWeekAndYear();
    const [selectedWeek, setSelectedWeek] = useState(week);
    const [selectedYear, setSelectedYear] = useState(year);

    const purposeOptions = useMemo(
        () => [
            { value: "Machine Loan", label: "Machine Loan", id: 1, type: "Purpose" },
            { value: "Material Loan", label: "Material Loan", id: 2, type: "Purpose" },
            { value: "Equipment Loan", label: "Equipment Loan", id: 3, type: "Purpose" },
            { value: "Working Capital", label: "Working Capital", id: 4, type: "Purpose" },
            { value: "Other", label: "Other", id: 5, type: "Purpose" },
        ],
        []
    );

    const paymentModeOptions = useMemo(
        () => [
            { id: 1, value: "Cash", label: "Cash" },
            { id: 2, value: "GPay", label: "GPay" },
            { id: 3, value: "Net Banking", label: "Net Banking" },
            { id: 4, value: "Cheque", label: "Cheque" },
            { id: 5, value: "Advance Transfer", label: "Advance Transfer" },
        ],
        []
    );

    const formatDateOnly = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const getVendorName = (id) => vendorOptions.find((v) => v.id === id)?.value || "";
    const getContractorName = (id) => contractorOptions.find((c) => c.id === id)?.value || "";
    const getSiteName = (id) => siteOptions.find((s) => String(s.id) === String(id))?.value || "";

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const res = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll");
                if (!res.ok) throw new Error("Failed to fetch vendors");
                const data = await res.json();
                setVendorOptions(
                    data.map((item) => ({
                        id: item.id,
                        value: item.vendorName,
                        label: item.vendorName,
                        type: "Vendor",
                    }))
                );
            } catch (error) {
                console.error(error);
            }
        };
        fetchVendors();
    }, []);

    useEffect(() => {
        const fetchContractors = async () => {
            try {
                const res = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll");
                if (!res.ok) throw new Error("Failed to fetch contractors");
                const data = await res.json();
                setContractorOptions(
                    data.map((item) => ({
                        id: item.id,
                        value: item.contractorName,
                        label: item.contractorName,
                        type: "Contractor",
                    }))
                );
            } catch (error) {
                console.error(error);
            }
        };
        fetchContractors();
    }, []);

    useEffect(() => {
        const fetchSites = async () => {
            try {
                const res = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll");
                if (!res.ok) throw new Error("Failed to fetch sites");
                const data = await res.json();
                setSiteOptions(
                    data.map((item) => ({
                        id: item.id,
                        value: item.siteName,
                        label: item.siteName,
                        sNo: item.siteNo,
                        type: "Site",
                    }))
                );
            } catch (error) {
                console.error(error);
            }
        };
        fetchSites();
    }, []);

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const res = await fetch("https://backendaab.in/aabuildersDash/api/loans/all");
                if (!res.ok) throw new Error("Failed to fetch loans");
                const data = await res.json();
                setLoanData(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchLoans();
    }, []);

    useEffect(() => {
        const getDatesFromWeekAndYear = (week, year) => {
            const weekNum = parseInt(week.replace("Week ", ""), 10);
            const firstJan = new Date(year, 0, 1);
            const dayOfWeek = firstJan.getDay();
            const startOfWeek = new Date(firstJan);
            startOfWeek.setDate(firstJan.getDate() + (weekNum - 1) * 7 - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return {
                start: startOfWeek.toISOString().split("T")[0],
                end: endOfWeek.toISOString().split("T")[0],
            };
        };

        const { start, end } = getDatesFromWeekAndYear(selectedWeek, selectedYear);
        setFromDate(formatDateOnly(start));
        setToDate(formatDateOnly(end));

        const filtered = loanData.filter((entry) => {
            const entryDate = entry.date?.split("T")[0];
            return entryDate >= start && entryDate <= end;
        });

        const total = filtered.reduce((sum, entry) => {
            const amount = Number(entry.amount) || 0;
            const refundAmount = Number(entry.loan_refund_amount) || 0;
            if (entry.type === "Loan") return sum + amount;
            if (entry.type === "Transfer") return sum + amount;
            if (entry.type === "Refund") return sum - refundAmount;
            return sum;
        }, 0);

        setTotalAdvance(total);
        setReportData(filtered);
    }, [selectedWeek, selectedYear, loanData]);

    const getPurposeOrSiteName = (entry) =>
        entry.type === "Transfer" && entry.from_purpose_id
            ? purposeOptions.find((p) => String(p.id) === String(entry.from_purpose_id))?.value || ""
            : purposeOptions.find((p) => String(p.id) === String(entry.from_purpose_id))?.value || "";

    const getTransferDestination = (entry) => {
        if (entry.type === "Transfer") {
            if (entry.to_purpose_id) {
                return purposeOptions.find((p) => String(p.id) === String(entry.to_purpose_id))?.value || "";
            } else if (entry.transfer_Project_id) {
                return getSiteName(entry.transfer_Project_id);
            }
        }
        return "";
    };

    const exportPdf = () => {
        const doc = new jsPDF();

        const tableColumn = [
            "S.No",
            "Date",
            "Contractor",
            "Purpose",
            "Transfer To",
            "Loan/Transfer",
            "Refund",
            "Type",
            "Mode",
            "Description",
        ];

        const tableRows = reportData.map((entry, index) => [
            index + 1,
            formatDateOnly(entry.date),
            entry.vendor_id ? getVendorName(entry.vendor_id) : getContractorName(entry.contractor_id),
            getPurposeOrSiteName(entry),
            getTransferDestination(entry),
            (entry.type === "Loan" || entry.type === "Transfer") ? entry.amount?.toLocaleString("en-IN") : "-",
            entry.type === "Refund" ? entry.loan_refund_amount?.toLocaleString("en-IN") : "-",
            entry.type,
            entry.type === "Transfer" ? "" : (paymentModeOptions.find(opt => opt.value === entry.loan_payment_mode)?.label || entry.loan_payment_mode),
            entry.description,
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            styles: {
                fontSize: 8,
                textColor: 0,            // Black text
                lineColor: 0,            // Black borders
                lineWidth: 0.3,
                fillColor: [255, 255, 255],  // White background
            },
            headStyles: {
                fillColor: [255, 255, 255],  // White header background
                textColor: 0,                // Black header text
                lineWidth: 0.5,
                lineColor: [0, 0, 0],       // Black border lines
                fontStyle: "bold",
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255], // No alternate fill, keep white
            },
            drawCell: (data) => {
                const { column, row, cell, table } = data;

                // Draw horizontal line only for last cell in each row
                if (row.index >= 0) {
                    doc.setDrawColor(0);
                    doc.setLineWidth(0.4);
                    const startX = table.columns[0].startX;
                    const endX = table.columns[table.columns.length - 1].endX;
                    const y = cell.y + cell.height;
                    doc.line(startX, y, endX, y);
                }

                // Remove vertical border for first column cells except header
                if (column.index === 0 && row.index >= 0) {
                    // Clear vertical lines for S.No column cells
                    doc.setDrawColor(255, 255, 255, 0);
                    // Left vertical line
                    doc.line(cell.x, cell.y, cell.x, cell.y + cell.height);
                }
            },
            margin: { top: 10, left: 10, right: 10 },
            startY: 10,
        });

        doc.save("loan_report.pdf");
    };

    // Export Excel
    const exportExcel = () => {
        if (!reportData || reportData.length === 0) {
            alert("No records to export!");
            return;
        }
        const exportData = reportData.map((item) => ({
            Date: formatDateOnly(item.date),
            Contractor: item.vendor_id ? getVendorName(item.vendor_id) : getContractorName(item.contractor_id),
            Purpose: getPurposeOrSiteName(item),
            "Transfer To": getTransferDestination(item),
            "Loan/Transfer": (item.type === "Loan" || item.type === "Transfer") ? item.amount : "-",
            Refund: item.type === "Refund" ? item.loan_refund_amount : "-",
            Type: item.type,
            Mode:
                item.type === "Transfer"
                    ? ""
                    : paymentModeOptions.find((opt) => opt.value === item.loan_payment_mode)?.label || item.loan_payment_mode,
            Description: item.description,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "LoanReport");
        const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([wbout], { type: "application/octet-stream" }), "loan_report.xlsx");
    };


    const yearOptions = useMemo(() => {
        let years = [];
        for (let i = 2023; i <= 2030; i++) {
            years.push(i.toString());
        }
        return years;
    }, []);

    const weekOptions = useMemo(() => {
        let weeks = [];
        for (let i = 1; i <= 52; i++) {
            weeks.push(`Week ${i.toString().padStart(2, "0")}`);
        }
        return weeks;
    }, []);

    return (
        <div className="max-w-[95vw] mx-auto">
            <div className="flex flex-wrap  justify-between w-full min-h-[128px] bg-white p-5 rounded mb-5">
                <div className="flex gap-5">
                    <div className="flex flex-col">
                        <label className="mb-1 font-semibold">Week No</label>
                        <select
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(e.target.value)}
                            className="w-[120px] h-[35px] rounded-lg bg-[#F2F2F2] px-2 focus:outline-none"
                        >
                            {weekOptions.map((w) => (
                                <option key={w} value={w}>
                                    {w}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-semibold">Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-[120px] h-[35px] rounded-lg bg-[#F2F2F2] p-2 focus:outline-none"
                        >
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex p-4" style={{ gap: "16px" }}>
                    <div
                        className="bg-[#F2F2F2] px-2 py-1 rounded-lg text-center"
                        style={{ fontSize: "14px" }}
                    >
                        <p className="text-xs text-gray-600 mb-0">From Date</p>
                        <p className="font-semibold truncate">{fromDate}</p>
                    </div>
                    <div
                        className="bg-[#F2F2F2] px-2 py-1 rounded-lg text-center"
                        style={{ fontSize: "14px" }}
                    >
                        <p className="text-xs text-gray-600 mb-0">To Date</p>
                        <p className="font-semibold truncate">{toDate}</p>
                    </div>
                    <div
                        className="bg-[#F2F2F2] px-2 py-1 rounded-lg text-center"
                        style={{ fontSize: "14px" }}
                    >
                        <p className="text-xs text-gray-600 mb-0">Total Advance</p>
                        <p className="text-base text-[#E4572E] font-bold mb-0">
                            {`₹${totalAdvance.toLocaleString("en-IN")}`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="w-full bg-white p-4">
                <div className="w-full flex justify-end gap-4">
                    <button
                        onClick={exportPdf}
                        className="text-sm text-[#E4572E] hover:underline font-bold"
                    >
                        Export PDF
                    </button>
                    <button
                        onClick={exportExcel}
                        className="text-sm text-[#007233] hover:underline font-bold"
                    >
                        Export XL
                    </button>
                </div>
                <div
                    id="reportTable"
                    className="border-l-8 border-l-[#BF9853] rounded-lg overflow-auto max-h-[500px]"
                >
                    <table className="w-full min-w-[1400px] border-collapse">
                        <thead className="sticky top-0 z-10 bg-white">
                            <tr className="bg-[#FAF6ED] h-12">
                                <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[80px] font-bold text-left">S.No</th>
                                <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[120px] font-bold text-left whitespace-nowrap">Date</th>
                                <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[180px] font-bold text-left">Contractor</th>
                                <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[200px] font-bold text-left">Purpose</th>
                                <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[200px] font-bold text-left whitespace-nowrap">Transfer To</th>
                                <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[140px] font-bold text-right">Loan/Transfer</th>
                                <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[120px] font-bold text-right">Refund</th>
                                <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[100px] font-bold text-left">Type</th>
                                <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[120px] font-bold text-left">Mode</th>
                                <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[200px] font-bold text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.length > 0 ? (
                                reportData.map((entry, index) => (
                                    <tr
                                        key={index}
                                        className="odd:bg-white even:bg-[#FAF6ED] h-12"
                                    >
                                        <td className="text-sm pl-4 pr-4 lg:pl-6 lg:pr-6 font-semibold text-left">{index + 1}</td>
                                        <td className="text-sm pl-4 pr-4 lg:pl-6 lg:pr-6 font-semibold text-left whitespace-nowrap">{formatDateOnly(entry.date)}</td>
                                        <td className="text-sm pl-4 pr-4 lg:pl-6 lg:pr-6 font-semibold text-left">
                                            {entry.vendor_id ? getVendorName(entry.vendor_id) : getContractorName(entry.contractor_id)}
                                        </td>
                                        <td className="text-sm pl-4 pr-4 lg:pl-6 lg:pr-6 font-semibold text-left">{getPurposeOrSiteName(entry)}</td>
                                        <td className="text-sm pl-4 pr-4 lg:pl-6 lg:pr-6 font-semibold text-left">{getTransferDestination(entry)}</td>
                                        <td className="text-sm pl-4 pr-4 lg:pl-6 lg:pr-6 font-semibold text-right">{(entry.type === "Loan" || entry.type === "Transfer") ? entry.amount?.toLocaleString("en-IN") : "-"}</td>
                                        <td className="text-sm pl-4 pr-4 lg:pl-6 lg:pr-6 font-semibold text-right">{entry.type === "Refund" ? entry.loan_refund_amount?.toLocaleString("en-IN") : "-"}</td>
                                        <td className="text-sm pl-4 pr-4 lg:pl-6 lg:pr-6 font-semibold text-left">{entry.type}</td>
                                        <td className="text-sm pl-4 pr-4 lg:pl-6 lg:pr-6 font-semibold text-left">{entry.type === 'Transfer' ? '' : (paymentModeOptions.find(opt => opt.value === entry.loan_payment_mode)?.label || entry.loan_payment_mode)}</td>
                                        <td className="text-sm pl-4 pr-4 lg:pl-6 lg:pr-6 font-semibold text-left">{entry.description}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="h-12">
                                    <td colSpan="10" className="text-center pl-4 pr-4 lg:pl-6 lg:pr-6 text-gray-400">
                                        No Records available for the selected week
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LoanReport;
