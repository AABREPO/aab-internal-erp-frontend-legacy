import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

const LoanSummary = () => {
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [selectedAssociate, setSelectedAssociate] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [tooltipData, setTooltipData] = useState([]);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tooltipTitle, setTooltipTitle] = useState("");
  const [pendingAdvanceAssociate, setPendingAdvanceAssociate] = useState(0);
  const [pendingAdvancePurpose, setPendingAdvancePurpose] = useState(0);

  const purposeOptions = useMemo(() => [
    { id: 1, value: "Machine Loan" },
    { id: 2, value: "Material Loan" },
    { id: 3, value: "Equipment Loan" },
    { id: 4, value: "Working Capital" },
    { id: 5, value: "Other" },
  ], []);
  const getPurposeName = (id) => {
    const purpose = purposeOptions.find(p => String(p.id) === String(id));
    return purpose ? purpose.value : "";
  };

  const getAssociateName = (id) => {
    // search in vendorOptions and contractorOptions combined
    const assoc = [...vendorOptions, ...contractorOptions].find(a => String(a.id) === String(id));
    return assoc ? assoc.value : "";
  };
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
    let sum = 0;
    loanData.forEach(e => {
      const assocId = e.vendor_id || e.contractor_id;
      if (String(assocId) !== String(selectedAssociate)) return;
      if (e.type === "Loan" || e.type === "Transfer") sum += Number(e.amount) || 0;
      else if (e.type === "Refund") sum -= Number(e.loan_refund_amount) || 0;
    });
    setPendingAdvanceAssociate(sum);
  }, [selectedAssociate, loanData]);

  useEffect(() => {
    let sum = 0;
    loanData.forEach(e => {
      const purposeId = e.loan_purpose_id || e.from_purpose_id;
      if (String(purposeId) !== String(selectedPurpose)) return;
      if (e.type === "Loan" || e.type === "Transfer") sum += Number(e.amount) || 0;
      else if (e.type === "Refund") sum -= Number(e.loan_refund_amount) || 0;
    });
    setPendingAdvancePurpose(sum);
  }, [selectedPurpose, loanData]);

  // Group data for left and right separately
  const summaryByAssociate = useMemo(() => {
    if (!selectedAssociate) return [];
    const map = {};
    loanData.forEach(e => {
      const assocId = e.vendor_id || e.contractor_id;
      const purposeId = e.loan_purpose_id || e.from_purpose_id;
      if (!assocId || !purposeId) return;
      if (String(assocId) !== String(selectedAssociate)) return;
      const key = `${assocId}-${purposeId}`;
      if (!map[key]) map[key] = { associateId: assocId, purposeId, pendingLoan: 0, refund: 0 };
      if (e.type === "Loan" || e.type === "Transfer") map[key].pendingLoan += Number(e.amount) || 0;
      else if (e.type === "Refund") map[key].refund += Number(e.loan_refund_amount) || 0;
    });
    Object.values(map).forEach(item => item.status = item.pendingLoan > 0 ? "Pending" : "Cleared");
    return Object.values(map);
  }, [loanData, selectedAssociate]);

  const summaryByPurpose = useMemo(() => {
    if (!selectedPurpose) return [];
    const map = {};
    loanData.forEach(e => {
      const assocId = e.vendor_id || e.contractor_id;
      const purposeId = e.loan_purpose_id || e.from_purpose_id;
      if (!assocId || !purposeId) return;
      if (String(purposeId) !== String(selectedPurpose)) return;
      const key = `${purposeId}-${assocId}`;
      if (!map[key]) map[key] = { purposeId, associateId: assocId, pendingLoan: 0, refund: 0 };
      if (e.type === "Loan" || e.type === "Transfer") map[key].pendingLoan += Number(e.amount) || 0;
      else if (e.type === "Refund") map[key].refund += Number(e.loan_refund_amount) || 0;
    });
    Object.values(map).forEach(item => item.status = item.pendingLoan > 0 ? "Pending" : "Cleared");
    return Object.values(map);
  }, [loanData, selectedPurpose]);


  const showDetailsTooltip = (e, title, filtered) => {
    setTooltipTitle(title);
    setTooltipData(filtered);
    setTooltipPos({ x: e.clientX + 10, y: e.clientY + 10 });
    setTooltipVisible(true);
  };
  const hideTooltip = () => setTooltipVisible(false);

  const handleLoanMouseEnter = (e, associateId, purposeId) => {
    const filtered = loanData.filter(
      x => (x.vendor_id || x.contractor_id) === associateId &&
        (x.loan_purpose_id === purposeId || x.from_purpose_id === purposeId) &&
        (x.type === 'Loan' || x.type === 'Transfer')
    );
    showDetailsTooltip(e, 'Loan Details', filtered);
  };

  const handleRefundMouseEnter = (e, associateId, purposeId) => {
    const filtered = loanData.filter(
      x => (x.vendor_id || x.contractor_id) === associateId &&
        (x.loan_purpose_id === purposeId || x.from_purpose_id === purposeId) &&
        x.type === "Refund"
    );
    showDetailsTooltip(e, 'Refund Details', filtered);
  };

  // Export underlined text handlers
  const exportExcel = () => {
    const dataToExport = selectedAssociate ? summaryByAssociate : summaryByPurpose;
    if (!dataToExport.length) {
      alert("No data to export.");
      return;
    }
    const exportData = dataToExport.map(item => ({
      Purpose: getPurposeName(item.purposeId),
      "Pending Loan": item.pendingLoan,
      Refund: item.refund,
      Status: item.status,
      Associate: getAssociateName(item.associateId),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LoanSummary");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "LoanSummary.xlsx");
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    const dataToExport = selectedAssociate ? summaryByAssociate : summaryByPurpose;
    if (!dataToExport.length) {
      alert("No data to export.");
      return;
    }
    const head = [["Purpose", "Pending Loan", "Refund", "Status", "Associate"]];
    const body = dataToExport.map(item => [
      getPurposeName(item.purposeId),
      item.pendingLoan,
      item.refund,
      item.status,
      getAssociateName(item.associateId),
    ]);

    doc.autoTable({
      head,
      body,
      styles: {
        fontSize: 8,
        textColor: 0,
        lineColor: 0,
        lineWidth: 0.3,
        fillColor: [255, 255, 255], // white background
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        fontStyle: "bold",
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      margin: { top: 10, left: 10, right: 10 },
      startY: 10,
      didDrawCell: (data) => {
        const { column, row, cell, table } = data;
        if (row.index >= 0) {
          doc.setDrawColor(0);
          doc.setLineWidth(0.4);
          // Safely draw bottom horizontal line for the cell
          if (
            typeof table.columns[0].startX === 'number' &&
            typeof cell.y === 'number' &&
            typeof cell.height === 'number' &&
            typeof table.columns[table.columns.length - 1].endX === 'number'
          ) {
            doc.line(
              table.columns[0].startX,
              cell.y + cell.height,
              table.columns[table.columns.length - 1].endX,
              cell.y + cell.height
            );
          }
        }
        if (column.index === 0 && row.index >= 0) {
          // Removed setDrawColor with alpha channel because it's invalid
          if (
            typeof cell.x === 'number' &&
            typeof cell.y === 'number' &&
            typeof cell.height === 'number'
          ) {
            doc.line(cell.x, cell.y, cell.x, cell.y + cell.height); // vertical left border line
          }
        }
      },
    });

    doc.save("LoanSummary.pdf");
  };

  return (
    <div className="p-5 bg-[#FAF6ED] rounded flex gap-10">
      {/* Left: Associate + Pending Advance */}
      <div className="w-1/2 flex flex-col">
        <div style={{ marginBottom: 12 }}>
          {/* Label above dropdown */}
          <label
            style={{
              fontWeight: "bold",
              color: "black",
              fontSize: 14,
              marginBottom: 6,
              display: "flex",
            }}
          >
            Associate
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select
              style={{
                height: 28,
                minWidth: 120,
                padding: "4px 8px",
                fontSize: 14,
                borderRadius: 4,
                border: "1px solid #ccc",
                flexGrow: 1,
              }}
              value={selectedAssociate}
              onChange={(e) => setSelectedAssociate(e.target.value)}
            >
              <option value="">Select Associate</option>
              {[...vendorOptions, ...contractorOptions].map((assoc) => (
                <option key={assoc.id} value={assoc.id}>
                  {assoc.value}
                </option>
              ))}
            </select>

            {/* Pending Advance box */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 10px",
                borderRadius: 6,
                border: "1.5px solid #FDEE98", // light yellow
                backgroundColor: "#FFFBEA", // pale yellow
                minWidth: 160,
                userSelect: "none",
                fontWeight: "bold",
                fontSize: 14,
                justifyContent: "space-between",
              }}
              title="Pending Advance"
            >
              <span style={{ color: "black" }}>Pending Advance:</span>
              <span style={{ color: "red" }}>₹{pendingAdvanceAssociate.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>


        <div style={{ margin: '4px 0 8px' }}>
          <span onClick={exportExcel} style={{ textDecoration: 'underline', cursor: 'pointer', marginRight: 18 }} title="Export xl">Export XL</span>
          <span onClick={exportPdf} style={{ textDecoration: 'underline', cursor: 'pointer' }} title="Export Pdf">Export PDF</span>
        </div>
        <table className="border border-gray-300 text-black w-full text-sm border-collapse">
          <thead className="bg-white">
            <tr>
              <th className="border p-2 text-left">Purpose</th>
              <th className="border p-2 text-left">Pending Loan</th>
              <th className="border p-2 text-left">Refund</th>
              <th className="border p-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {summaryByAssociate.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-6 text-gray-500">No Records Available</td></tr>
            ) : summaryByAssociate.map((item, i) => (
              <tr key={i}>
                <td className="border p-2">{getPurposeName(item.purposeId)}</td>
                <td
                  className="border p-2 text-black"
                  onMouseEnter={e => handleLoanMouseEnter(e, item.associateId, item.purposeId)}
                  onMouseLeave={hideTooltip}
                >
                  {item.pendingLoan.toLocaleString("en-IN")}
                </td>

                <td
                  className="border p-2 text-black"
                  onMouseEnter={e => handleRefundMouseEnter(e, item.associateId, item.purposeId)}
                  onMouseLeave={hideTooltip}
                >
                  {item.refund.toLocaleString("en-IN")}
                </td>

                <td className={`border p-2 text-center ${item.status === "Cleared" ? "text-green-600" : "text-red-600"}`}>
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right: Purpose + Pending Advance */}
      <div className="w-1/2 flex flex-col">
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              fontWeight: "bold",
              color: "black",
              fontSize: 14,
              marginBottom: 6,
              display: "flex",
            }}
          >
            Purpose
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select
              style={{
                height: 28,
                minWidth: 120,
                padding: "4px 8px",
                fontSize: 14,
                borderRadius: 4,
                border: "1px solid #ccc",
                flexGrow: 1,
              }}
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
            >
              <option value="">Select Purpose</option>
              {purposeOptions.map((purpose) => (
                <option key={purpose.id} value={purpose.id}>
                  {purpose.value}
                </option>
              ))}
            </select>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 10px",
                borderRadius: 6,
                border: "1.5px solid #FDEE98",
                backgroundColor: "#FFFBEA",
                minWidth: 160,
                userSelect: "none",
                fontWeight: "bold",
                fontSize: 14,
                justifyContent: "space-between",
              }}
              title="Pending Advance"
            >
              <span style={{ color: "black" }}>Pending Advance:</span>
              <span style={{ color: "red" }}>₹{pendingAdvancePurpose.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div style={{ margin: '4px 0 8px' }}>
          <span onClick={exportExcel} style={{ textDecoration: 'underline', cursor: 'pointer', marginRight: 18 }} title="Export XL">Export XL</span>
          <span onClick={exportPdf} style={{ textDecoration: 'underline', cursor: 'pointer' }} title="Export PDF">Export PDF</span>
        </div>
        <table className="border border-gray-300 text-black w-full text-sm border-collapse">
          <thead className="bg-white">
            <tr>
              <th className="border p-2 text-left">Associate</th>
              <th className="border p-2 text-left">Pending Loan</th>
              <th className="border p-2 text-left">Refund</th>
              <th className="border p-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {summaryByPurpose.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-6 text-gray-500">No Records Available</td></tr>
            ) : summaryByPurpose.map((item, i) => (
              <tr key={i}>
                <td className="border p-2">{getAssociateName(item.associateId)}</td>
                <td
                  className="border p-2 text-black"
                  onMouseEnter={e => handleLoanMouseEnter(e, item.associateId, item.purposeId)}
                  onMouseLeave={hideTooltip}
                >
                  {item.pendingLoan.toLocaleString("en-IN")}
                </td>

                <td
                  className="border p-2 text-black"
                  onMouseEnter={e => handleRefundMouseEnter(e, item.associateId, item.purposeId)}
                  onMouseLeave={hideTooltip}
                >
                  {item.refund.toLocaleString("en-IN")}
                </td>

                <td className={`border p-2 text-center ${item.status === "Cleared" ? "text-green-600" : "text-red-600"}`}>
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {tooltipVisible && (
        <div
          style={{
            position: "fixed",
            top: tooltipPos.y + 10,
            left: tooltipPos.x + 10,
            maxWidth: 320,
            backgroundColor: "white",
            border: "1px solid #ccc",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            zIndex: 10000,
            fontSize: 12,
            padding: 8,
            maxHeight: 280,
            overflowY: "auto"
          }}
          onMouseLeave={hideTooltip}
        >
          <div className="font-semibold mb-2">{tooltipTitle}</div>
          {tooltipData.length === 0 ? (
            <p className="text-gray-500">No transactions found.</p>
          ) : (
            tooltipData.map(({ date, amount, loan_refund_amount, type }, i) => (
              <div key={i} className="mb-1">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{date ? new Date(date).toLocaleDateString() : "-"}</span>
                  <span style={{ fontWeight: "bold", color: "black" }}>
                    ₹{(amount || loan_refund_amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div style={{ color: "blue" }}>{type}</div>
              </div>
            ))
          )}
          <div style={{ borderTop: "1px solid #ccc", marginTop: 4, paddingTop: 4, fontWeight: "bold" }}>
            Total: ₹{tooltipData.reduce((acc, curr) => acc + Number(curr.amount || curr.loan_refund_amount || 0), 0).toLocaleString("en-IN")}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanSummary;
