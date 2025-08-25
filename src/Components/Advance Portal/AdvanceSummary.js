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
  const [selectedProject, setSelectedProject] = useState(null);

  // Sorting state for both tables
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [siteSortConfig, setSiteSortConfig] = useState({ key: null, direction: 'asc' });

  // Tooltip state
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipTitle, setTooltipTitle] = useState("");

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
        const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.siteName,
          label: item.siteName,
          id: item.id,
          sNo: item.siteNo
        }));

        // Add predefined site options with IDs 001, 002, 003, 004
        const predefinedSiteOptions = [
          {
            value: "Mason Advance",
            label: "Mason Advance",
            id: "1",
            sNo: "1"
          },
          {
            value: "Material Advance",
            label: "Material Advance",
            id: "2",
            sNo: "2"
          },
          {
            value: "Weekly Advance",
            label: "Weekly Advance",
            id: "3",
            sNo: "3"
          },
          {
            value: "Excess Advance",
            label: "Excess Advance",
            id: "4",
            sNo: "4"
          },
          {
            value: "Material Rent",
            label: "Material Rent",
            id: "",
            sNo: "5"
          },
          {
            value: "Subhash Kumar - Kunnur",
            label: "Subhash Kumar - Kunnur",
            id: "6",
            sNo: "6"
          }
        ];

        // Combine backend data with predefined options
        const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
        setSiteOptions(combinedSiteOptions);
      } catch (error) {
        console.error("Fetch error: ", error);

        // Fallback: if API fails, still show predefined options
        const predefinedSiteOptions = [
          {
            value: "Mason Advance",
            label: "Mason Advance",
            id: "1",
            sNo: "1"
          },
          {
            value: "Material Advance",
            label: "Material Advance",
            id: "2",
            sNo: "2"
          },
          {
            value: "Weekly Advance",
            label: "Weekly Advance",
            id: "3",
            sNo: "3"
          },
          {
            value: "Excess Advance",
            label: "Excess Advance",
            id: "4",
            sNo: "4"
          },
          {
            value: "Material Rent",
            label: "Material Rent",
            id: "",
            sNo: "5"
          },
          {
            value: "Subhash Kumar - Kunnur",
            label: "Subhash Kumar - Kunnur",
            id: "6",
            sNo: "6"
          }
        ];
        setSiteOptions(predefinedSiteOptions);
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
            projectName: siteOptions.find(s => String(s.id) === String(project_id))?.label || "-",
            projectId: project_id, // Store project ID
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
          billAmount: p.totalBill,
          projectId: p.projectId // Add project ID for tooltip
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

  // Sorting functions
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSiteSort = (key) => {
    let direction = 'asc';
    if (siteSortConfig.key === key && siteSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSiteSortConfig({ key, direction });
  };

  const defaultSort = (data, statusKey = 'pendingAdvance', nameKey = 'projectName') => {
    return [...data].sort((a, b) => {
      // Bill Status: Pending (pendingAdvance > 0) comes first
      const aStatus = a[statusKey] > 0 ? 1 : 0;
      const bStatus = b[statusKey] > 0 ? 1 : 0;
      if (aStatus !== bStatus) return bStatus - aStatus; // Descending: Pending first

      // Project Name ascending
      const aName = (a[nameKey] || '').toLowerCase();
      const bName = (b[nameKey] || '').toLowerCase();
      if (aName < bName) return -1;
      if (aName > bName) return 1;
      return 0;
    });
  };
  // Sort data functions
  const sortData = (data, config, statusKey = 'pendingAdvance', nameKey = 'projectName') => {
    if (!config.key) {
      return defaultSort(data, statusKey, nameKey);
    }

    return [...data].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];

      // Handle bill status specially
      if (config.key === 'billStatus') {
        const aStatus = a.pendingAdvance > 0 ? 'Pending' : 'Bill Settled';
        const bStatus = b.pendingAdvance > 0 ? 'Pending' : 'Bill Settled';
        aValue = aStatus;
        bValue = bStatus;
      }

      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string values
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();

      if (aValue < bValue) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Get bill details for tooltip
  const getBillDetails = (projectId, contractorVendorId, contractorVendorType) => {
    if (!advanceData.length) return [];

    return advanceData.filter(item => {
      const matchesProject = item.project_id === projectId;
      const matchesEntity = contractorVendorType === 'Contractor'
        ? item.contractor_id === contractorVendorId
        : item.vendor_id === contractorVendorId;

      return matchesProject && matchesEntity && item.bill_amount > 0;
    }).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: parseFloat(item.bill_amount) || 0
    }));
  };

  // Get advance details for tooltip (list all entries affecting "amount")
  const getAdvanceDetails = (projectId, contractorVendorId, contractorVendorType) => {
    if (!advanceData.length) return [];

    return advanceData.filter(item => {
      const matchesProject = item.project_id === projectId;
      const matchesEntity = contractorVendorType === 'Contractor'
        ? item.contractor_id === contractorVendorId
        : item.vendor_id === contractorVendorId;

      // include any non-zero amount entries
      const hasAmount = (parseFloat(item.amount) || 0) !== 0;
      return matchesProject && matchesEntity && hasAmount;
    }).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: parseFloat(item.amount) || 0
    }));
  };

  // Tooltip handlers
  const handleMouseEnter = (event, projectId, contractorVendorId, contractorVendorType) => {
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);
    if (billDetails.length > 0) {
      setTooltipTitle('Bill Details');
      setTooltipData(billDetails);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
    setTooltipTitle("");
  };

  // Tooltip handlers for Advance column
  const handleMouseEnterAdvance = (event, projectId, contractorVendorId, contractorVendorType) => {
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    if (advanceDetails.length > 0) {
      setTooltipTitle('Advance Details');
      setTooltipData(advanceDetails);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };
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
            entityId: entityId,
            entityType: entityType,
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

  const filteredProjects = selectedProject
    ? projectData.filter(proj => proj.projectName === selectedProject.value)
    : projectData;

  const sortedFilteredData = sortData(filteredProjects, sortConfig, 'pendingAdvance', 'projectName');

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
                <div className="text-left">
                  <label className="block font-semibold mb-2">Project Name</label>
                  <Select
                    options={projectData.map(proj => ({
                      value: proj.projectName,
                      label: proj.projectName
                    }))}
                    value={selectedProject}
                    onChange={(selectedOption) => setSelectedProject(selectedOption)}
                    className="w-[323px] h-[45px] rounded-lg focus:outline-none"
                    isClearable
                    isSearchable
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
              <div className="border-l-8 border-l-[#BF9853] rounded-lg h-[680px] overflow-auto">
                <table className="w-full border-collapse ">
                  <thead>
                    <tr className="bg-[#f8f1e5] text-left">
                      <th
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('projectName')}
                      >
                        Project Name
                        {sortConfig.key === 'projectName' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('pendingAdvance')}
                      >
                        Advance
                        {sortConfig.key === 'pendingAdvance' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('billAmount')}
                      >
                        Bill Amount
                        {sortConfig.key === 'billAmount' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort('billStatus')}
                      >
                        Bill Status
                        {sortConfig.key === 'billStatus' && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFilteredData.length > 0 ? (
                      sortedFilteredData.map((proj, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                          <td className="py-2 px-6 text-left">{proj.projectName}</td>
                          <td
                            className="py-2 cursor-help relative"
                            onMouseEnter={(e) => handleMouseEnterAdvance(e, proj.projectId, selectedContractorOrVendorOption?.id, selectedContractorOrVendorOption?.type)}
                            onMouseLeave={handleMouseLeave}
                          >
                            {proj.pendingAdvance.toLocaleString("en-IN")}
                          </td>
                          <td
                            className="p-2 cursor-help relative"
                            onMouseEnter={(e) => handleMouseEnter(e, proj.projectId, selectedContractorOrVendorOption?.id, selectedContractorOrVendorOption?.type)}
                            onMouseLeave={handleMouseLeave}
                          >
                            {proj.billAmount.toLocaleString("en-IN")}
                          </td>
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

              <div className="border-l-8 border-l-[#BF9853] rounded-lg h-[680px] overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f8f1e5] text-left">
                      <th
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSiteSort('name')}
                      >
                        Contractor/Vendor
                        {siteSortConfig.key === 'name' && (
                          <span className="ml-1">{siteSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSiteSort('pendingAdvance')}
                      >
                        Advance
                        {siteSortConfig.key === 'pendingAdvance' && (
                          <span className="ml-1">{siteSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSiteSort('billAmount')}
                      >
                        Bill Amount
                        {siteSortConfig.key === 'billAmount' && (
                          <span className="ml-1">{siteSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSiteSort('billStatus')}
                      >
                        Bill Status
                        {siteSortConfig.key === 'billStatus' && (
                          <span className="ml-1">{siteSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortData(siteDetails, siteSortConfig).length > 0 ? (
                      sortData(siteDetails, siteSortConfig).map((d, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                          <td className="p-2">{d.name}</td>
                          <td
                            className="p-2 cursor-help relative"
                            onMouseEnter={(e) => handleMouseEnterAdvance(e, selectedAdvanceSite?.id, d.entityId, d.entityType)}
                            onMouseLeave={handleMouseLeave}
                          >
                            {d.pendingAdvance.toLocaleString("en-IN")}
                          </td>
                          <td
                            className="p-2 cursor-help relative"
                            onMouseEnter={(e) => handleMouseEnter(e, selectedAdvanceSite?.id, d.entityId, d.entityType)}
                            onMouseLeave={handleMouseLeave}
                          >
                            {d.billAmount.toLocaleString("en-IN")}
                          </td>
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

      {/* Tooltip Component */}
      {tooltipData && (
        <div
          className="fixed z-50 bg-white text-black p-3 rounded shadow-lg text-sm max-w-xs"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            pointerEvents: 'none'
          }}
        >
          <div className="font-semibold mb-2">{tooltipTitle || 'Details'}:</div>
          {tooltipData
            .slice() // copy to avoid mutating
            .reverse() // 👈 just reverse order
            .map((entry, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-600">{entry.date}:</span>
                <span className="ml-2">₹{entry.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <span className="font-semibold">
              Total: ₹
              {tooltipData
                .reduce((sum, item) => sum + item.amount, 0)
                .toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </body >
  );
}

export default AdvanceSummary