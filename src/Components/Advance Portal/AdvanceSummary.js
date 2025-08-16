import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";
const AdvanceSummary = () => {

  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [advanceData, setAdvanceData] = useState([]);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [selectedContractorOrVendorOption, setSelectedContractorOrVendorOption] = useState('');
  const [totalPendingAdvance, setTotalPendingAdvance] = useState(0);
  const [siteDetails, setSiteDetails] = useState([]);
  const [sitePendingAdvance, setSitePendingAdvance] = useState(0);
  const [siteBillAmount, setSiteBillAmount] = useState(0);
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const savedContractorVendor = sessionStorage.getItem('selectedContractorOrVendorOption');
    try {
      if (savedContractorVendor) setSelectedContractorOrVendorOption(JSON.parse(savedContractorVendor));

    } catch (error) {
      console.error("Error parsing sessionStorage data:", error);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  const handleBeforeUnload = () => {
    sessionStorage.removeItem('selectedContractorOrVendorOption');
  };
  useEffect(() => {
    if (selectedContractorOrVendorOption) sessionStorage.setItem('selectedContractorOrVendorOption', JSON.stringify(selectedContractorOrVendorOption));
  }, [selectedContractorOrVendorOption]);

  useEffect(() => {
    const saved = localStorage.getItem("advanceContractorVendor");
    if (saved) {
      setSelectedContractorOrVendorOption(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const savedSite = localStorage.getItem("advanceProjectName");
    if (savedSite) {
      setSelectedAdvanceSite(JSON.parse(savedSite));
    }
  }, []);

  // Fetch Vendor Names
  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        const res = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        setVendorOptions(data.map(item => ({
          value: item.vendorName,
          label: item.vendorName,
          type: "Vendor",
          id: item.id
        })));
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
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        setContractorOptions(data.map(item => ({
          value: item.contractorName,
          label: item.contractorName,
          type: "Contractor",
          id: item.id
        })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchContractorNames();
  }, []);
  useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions]); }, [vendorOptions, contractorOptions]);
  // Fetch Site Names
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        setSiteOptions(data.map(item => ({
          value: item.siteName,
          label: item.siteName,
          id: item.id
        })));
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
  const handleSummaryChange = (selected) => {
    setSelectedContractorOrVendorOption(selected); // do NOT update Advance page
  };
  const sites = [
    "Basker - Chnninakada Bazzzaar",
    "Abbas Bai - Muslim St",
    "Abinaya - Valaiyappati"
  ];
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderWidth: '2px',
      borderRadius: '8px',
      borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
      '&:hover': {
        borderColor: 'rgba(191, 152, 83, 0.2)',
      }
    }),
  };

  const [selectedAdvanceSite, setSelectedAdvanceSite] = useState(sites[0]);
  // State for filtered project data
  // Grouped project data for selected contractor/vendor
  const [projectData, setProjectData] = useState([]);

  useEffect(() => {
    if (selectedContractorOrVendorOption) {
      const filtered = advanceData.filter(item => {
        if (selectedContractorOrVendorOption.type === "Vendor") {
          return item.vendor_id === selectedContractorOrVendorOption.id;
        }
        if (selectedContractorOrVendorOption.type === "Contractor") {
          return item.contractor_id === selectedContractorOrVendorOption.id;
        }
        return false;
      });

      const grouped = {};
      let totalPendingAll = 0;
      let totalBillAll = 0;

      filtered.forEach(curr => {
        const {
          project_id,
          amount = 0,
          bill_amount = 0,
          refund_amount = 0
        } = curr;

        if (!grouped[project_id]) {
          grouped[project_id] = {
            projectName: siteOptions.find(s => s.id === project_id)?.label || "-",
            totalAdvance: 0,
            totalBill: 0,
            totalRefund: 0
          };
        }

        // ✅ Just sum the amount directly (negative values will subtract automatically)
        grouped[project_id].totalAdvance += parseFloat(amount) || 0;

        // ✅ Bills & refunds subtracted later
        grouped[project_id].totalBill += parseFloat(bill_amount) || 0;
        grouped[project_id].totalRefund += parseFloat(refund_amount) || 0;
      });

      // Convert to array & compute totals
      const projectArray = Object.values(grouped).map(p => {
        const pending = p.totalAdvance - p.totalBill - p.totalRefund;
        totalPendingAll += pending;
        totalBillAll += p.totalBill;
        return {
          projectName: p.projectName,
          pendingAdvance: pending,
          billAmount: p.totalBill
        };
      });

      setProjectData(projectArray);
      setTotalPendingAdvance(totalPendingAll);
      setTotalBillAmount(totalBillAll);

    } else {
      setProjectData([]);
      setTotalPendingAdvance(0);
      setTotalBillAmount(0);
    }
  }, [selectedContractorOrVendorOption, advanceData, siteOptions]);


  const sortedSiteOptions = siteOptions.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  useEffect(() => {
    if (selectedAdvanceSite) {
      const siteId = selectedAdvanceSite.id;

      // Only include records for this site, ignore transfers completely
      const filtered = advanceData.filter(item => item.project_id === siteId);

      const grouped = {};
      let totalPending = 0;
      let totalBill = 0;

      filtered.forEach(curr => {
        const {
          contractor_id,
          vendor_id,
          type,
          amount = 0,
          bill_amount = 0,
          refund_amount = 0
        } = curr;

        // Identify contractor/vendor
        const entityId = contractor_id || vendor_id;
        const entityType = contractor_id ? "Contractor" : "Vendor";
        const entityName =
          entityType === "Contractor"
            ? contractorOptions.find(c => c.id === entityId)?.label || "-"
            : vendorOptions.find(v => v.id === entityId)?.label || "-";

        if (!grouped[entityId]) {
          grouped[entityId] = {
            name: entityName,
            pendingAdvance: 0,
            billAmount: 0
          };
        }

        // Only sum amounts (negative values subtract automatically)
        grouped[entityId].pendingAdvance += parseFloat(amount) || 0;

        // Add bill amount and subtract bill + refund from pending
        grouped[entityId].billAmount += parseFloat(bill_amount) || 0;
        grouped[entityId].pendingAdvance -= (parseFloat(bill_amount) || 0) + (parseFloat(refund_amount) || 0);
      });

      const detailsArray = Object.values(grouped);

      detailsArray.forEach(d => {
        totalPending += d.pendingAdvance;
        totalBill += d.billAmount;
      });

      setSiteDetails(detailsArray);
      setSitePendingAdvance(totalPending);
      setSiteBillAmount(totalBill);

    } else {
      setSiteDetails([]);
      setSitePendingAdvance(0);
      setSiteBillAmount(0);
    }
  }, [selectedAdvanceSite, advanceData, contractorOptions, vendorOptions]);
  const exportPDF = () => {
    const doc = new jsPDF();

    // If something is selected in dropdown
    if (selectedContractorOrVendorOption) {
      const { type, label } = selectedContractorOrVendorOption;
      const titleText = `${type} - ${label}`;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(titleText, 14, 15); // x=14, y=15 position
    }

    const tableColumn = ["Project Name", "Pending Advance", "Bill Amount", "Bill Status"];
    const tableRows = [];

    projectData.forEach(proj => {
      const status = proj.pendingAdvance > 0 ? "Pending" : "Bill Settled";
      tableRows.push([
        proj.projectName,
        proj.pendingAdvance.toLocaleString("en-IN"),
        proj.billAmount.toLocaleString("en-IN"),
        status
      ]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: selectedContractorOrVendorOption ? 20 : 10, // push table down if title is shown
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
        fontStyle: "bold"
      },
      styles: {
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      }
    });

    doc.save("Project_Report.pdf");
  };

  const exportCSV = () => {
    let extraRow = [];

    // If dropdown value is selected, add it as first row in CSV
    if (selectedContractorOrVendorOption) {
      const { type, label } = selectedContractorOrVendorOption;
      extraRow = [[`${type} - ${label}`]]; // first row with only one cell
    }

    const headers = ["Project Name", "Pending Advance", "Bill Amount", "Bill Status"];
    const rows = projectData.map(proj => [
      proj.projectName,
      proj.pendingAdvance,
      proj.billAmount,
      proj.pendingAdvance > 0 ? "Pending" : "Bill Settled"
    ]);

    // Combine all parts into final CSV
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Project_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const exportsiteNamePDF = () => {
    const doc = new jsPDF();

    // Add site name if selected
    if (selectedAdvanceSite) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Site Name - ${selectedAdvanceSite.label}`, 14, 15); // Position at top
    }

    const tableColumn = ["Contractor/Vendor", "Pending Advance", "Bill Amount", "Bill Status"];
    const tableRows = [];

    siteDetails.forEach(d => {
      const status = d.pendingAdvance > 0 ? "Pending" : "Bill Settled";
      tableRows.push([
        d.name,
        d.pendingAdvance.toLocaleString("en-IN"),
        d.billAmount.toLocaleString("en-IN"),
        status
      ]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: selectedAdvanceSite ? 20 : 10, // Push table down if site name shown
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
        fontStyle: "bold"
      },
      styles: {
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      }
    });

    doc.save("Site_Report.pdf");
  };
  const exportSiteNameCSV = () => {
    let extraRow = [];

    // Add site name row at top
    if (selectedAdvanceSite) {
      extraRow = [[`Site Name - ${selectedAdvanceSite.label}`]];
    }

    const headers = ["Contractor/Vendor", "Pending Advance", "Bill Amount", "Bill Status"];
    const rows = siteDetails.map(d => [
      d.name,
      d.pendingAdvance,
      d.billAmount,
      d.pendingAdvance > 0 ? "Pending" : "Bill Settled"
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Site_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  return (
    <body>
      <div className="flex gap-6">
        <div className="bg-white rounded-lg w-[1800px] p-4 ml-10">
          <div className="flex">
            <div className=" w-[900px]">
              <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                  <label className="block font-semibold mb-2">Contractor/Vendor</label>
                  <Select
                    options={combinedOptions}
                    value={selectedContractorOrVendorOption}
                    onChange={(selectedOption) => {
                      setSelectedContractorOrVendorOption(selectedOption);
                      // No writing to localStorage — so Advance Page won't change
                    }}
                    className="w-[323px] h-[45px] rounded-lg focus:outline-none"
                    isClearable
                    styles={customStyles}
                  />
                </div>
                <div className="flex flex-col text-right border-2 border-[#E4572E] border-opacity-25 p-2">
                  <span>
                    Pending Advance:{" "}
                    <b className="text-red-500">
                      {totalPendingAdvance !== 0 ? totalPendingAdvance.toLocaleString("en-IN") : "0"}
                    </b>
                  </span>
                  <span>
                    Bill Amount:{" "}
                    {totalBillAmount !== 0 ? totalBillAmount.toLocaleString("en-IN") : "0"}
                  </span>

                </div>

              </div>
              <div className="flex gap-3 text-sm justify-end">
                <button onClick={exportPDF} className="flex items-center font-bold hover:underline gap-1 text-[#E4572E]">Export PDF</button>
                <button onClick={exportCSV} className="flex items-center font-bold hover:underline gap-1 text-[#007233]">Export XL</button>
                <button className="flex items-center font-bold hover:underline gap-1 text-[#BF9853]">Print</button>
              </div>
              <div className="border-l-8 border-l-[#BF9853] rounded-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f8f1e5] text-left">
                      <th className="p-2">Project Name</th>
                      <th className="p-2">Pending Advance</th>
                      <th className="p-2">Bill Amount</th>
                      <th className="p-2">Bill Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectData.length > 0 ? (
                      projectData.map((proj, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                          <td className="p-2">{proj.projectName}</td>
                          <td className="p-2">{proj.pendingAdvance.toLocaleString("en-IN")}</td>
                          <td className="p-2">{proj.billAmount.toLocaleString("en-IN")}</td>
                          <td className="p-2" style={{ color: proj.pendingAdvance > 0 ? "red" : "green" }}>
                            {proj.pendingAdvance > 0 ? "Pending" : "Bill Settled"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center p-4">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-lg ml-10 flex-1 w-[900px]">
              <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                  <label className="block font-semibold mb-2">Project Name</label>
                  <Select
                    options={sortedSiteOptions || []}
                    placeholder="Select a site..."
                    isSearchable={true}
                    value={selectedAdvanceSite}
                    onChange={setSelectedAdvanceSite} // local only — won't affect Advance Page
                    styles={customStyles}
                    isClearable
                    className="w-[380px] h-[45px] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col text-right border-2 border-[#E4572E] border-opacity-25 p-2">
                  <span>
                    Pending Advance: <b className="text-red-500">{sitePendingAdvance.toLocaleString("en-IN")}</b>
                  </span>
                  <span>Bill Amount: {siteBillAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex gap-3 text-sm justify-end">
                <button onClick={exportsiteNamePDF} className="flex items-center gap-1 font-bold hover:underline text-[#E4572E]">Export PDF</button>
                <button onClick={exportSiteNameCSV} className="flex items-center gap-1 font-bold hover:underline text-[#007233]"> Export XL</button>
                <button className="flex items-center gap-1 font-bold hover:underline text-[#BF9853]"> Print</button>
              </div>

              <div className="border-l-8 border-l-[#BF9853] rounded-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f8f1e5] text-left">
                      <th className="p-2">Contractor/Vendor</th>
                      <th className="p-2">Pending Advance</th>
                      <th className="p-2">Bill Amount</th>
                      <th className="p-2">Bill Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siteDetails.length > 0 ? (
                      siteDetails.map((d, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                          <td className="p-2">{d.name}</td>
                          <td className="p-2">{d.pendingAdvance.toLocaleString("en-IN")}</td>
                          <td className="p-2">{d.billAmount.toLocaleString("en-IN")}</td>
                          <td className="p-2" style={{ color: d.pendingAdvance > 0 ? "red" : "green" }}>
                            {d.pendingAdvance > 0 ? "Pending" : "Bill Settled"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center p-4">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body >
  );
}

export default AdvanceSummary