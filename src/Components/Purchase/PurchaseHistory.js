import React, { useState, useEffect } from 'react';
import Reload from '../Images/rotate-right.png'
import edit from '../Images/Edit.svg';
import remove from '../Images/Delete.svg';
import undo from '../Images/refresh.png';
import file from '../Images/file_download.png'
import Select from 'react-select';
import noDataImage from '../Images/No_Data.PNG';
import download from '../Images/downloads.png'
import jsPDF from "jspdf";
import "jspdf-autotable";


const PurchaseHistory = ({ username, userRoles = [] }) => {
  const [allPurchaseOrders, setAllPurchaseOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [auditPopupOpen, setAuditPopupOpen] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRowData, setEditRowData] = useState(null);
  const [clientNameOptions, setClientNameOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [selectedClientName, setSelectedClientName] = useState('');
  const [siteEngineerOptions, setSiteEngineerOptions] = useState([]);
  const [siteInchargeName, setSiteInchargeName] = useState('');
  const [vendor, setVendor] = useState('');
  const [poNosOption, setPoNosOption] = useState([]);
  const [poNos, setPoNos] = useState('');
  const [selectedPoDate, setSelectedPoDate] = useState('');
  const [resetFilters, setResetFilters] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);
  const [originalRowData, setOriginalRowData] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [isDateSortedAsc, setIsDateSortedAsc] = useState(true);
  const [isHeaderEditable, setIsHeaderEditable] = useState(false);
  const [brandOptions, setBrandOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [poAuditHistory, setPoAuditHistory] = useState([]);
  const [poItemName, setPoItemName] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [editableHeader, setEditableHeader] = useState({
    vendorName: '',
    clientName: '',
    date: '',
    eno: '',
  });

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
  const groupedAudits = auditHistory.reduce((acc, audit) => {
    const date = formatDate(audit.editedAt);
    const timeKey = date;
    console.log(timeKey);
    if (!acc[timeKey]) acc[timeKey] = [];
    acc[timeKey].push(audit);

    return acc;
  }, {});

  const groupedAuditKeys = Object.keys(groupedAudits);

  useEffect(() => {
    fetchPoOrder();
  }, [vendor]);
  const fetchPoOrder = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/purchase_orders/getAll');
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setAllPurchaseOrders(data);
        if (vendor) {
          // Filter all POs that match the vendor name
          const matchingPOs = data.filter(po => po.vendorName === vendor);
          if (matchingPOs.length > 0) {
            // Map their eno fields to react-select options
            const options = matchingPOs.map(po => ({
              label: po.eno,
              value: po.eno
            }));
            setPoNosOption(options);
          } else {
            setPoNosOption([]);
            setPoNos('');
          }
        }
      } else {
        console.log('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchVendorNames();
  }, []);
  const fetchVendorNames = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll');
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.vendorName,
          label: item.vendorName,
          id: item.id,
        }));
        setVendorOptions(formattedData);
      } else {
        console.log('Error fetching vendor names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching vendor names.');
    }
  };
  useEffect(() => {
    fetchPoItemName();
  }, []);
  const fetchPoItemName = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoItemName(data);
        console.log(data)
      } else {
        console.log('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching tile area names.');
    }
  };
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
        setClientNameOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchSites();
  }, []);
  useEffect(() => {
    fetchSiteIncharge();
  }, []);
  const fetchSiteIncharge = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/site_incharge/getAll');
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        const formatted = data.map((item) => ({
          value: item.siteEngineer,
          label: item.siteEngineer,
          mobileNumber: item.mobileNumber,
        }));
        setSiteEngineerOptions(formatted);
      } else {
        console.log('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching tile area names.');
    }
  };
  const formatDateOnly = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const totalQty = selectedOrder?.purchaseTable?.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  ) || 0;
  const totalAmount = selectedOrder?.purchaseTable?.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  ) || 0;
  const totalOverallAmount = selectedOrder?.purchaseTable?.reduce(
    (sum, item) =>
      sum + parseFloat(String(item.totalAmount).toString().replace(/[^0-9.]/g, '')),
    0
  ) || 0;
  useEffect(() => {
    fetchPoCategory();
  }, []);
  const fetchPoCategory = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll');
      if (response.ok) {
        const data = await response.json();
        const options = data.map(item => ({
          value: item.category,
          label: item.category,
        }));
        setCategoryOptions(options);
      } else {
        console.log('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchPoModel();
  }, []);
  const fetchPoModel = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll');
      if (response.ok) {
        const data = await response.json();
        const options = data.map(item => ({
          value: item.model,
          label: item.model,
        }));
        setModelOptions(options)
      } else {
        console.log('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchPoType();
  }, []);
  const fetchPoType = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll');
      if (response.ok) {
        const data = await response.json();
        const options = data.map(item => ({
          value: item.typeColor,
          label: item.typeColor,
        }));
        setTypeOptions(options)
      } else {
        console.log('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching tile area names.');
    }
  };
  useEffect(() => {
    fetchPoBrand();
  }, []);
  const fetchPoBrand = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll');
      if (response.ok) {
        const data = await response.json();
        const options = data.map(item => ({
          value: item.brand,
          label: item.brand,
        }));
        setBrandOptions(options)
      } else {
        console.log('Error fetching tile area names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching tile area names.');
    }
  };
  const handleEditSubmit = () => {
    const updatedTable = selectedOrder.purchaseTable.map((row) =>
      row.id === editRowData.id ? editRowData : row
    );
    setSelectedOrder({
      ...selectedOrder,
      purchaseTable: updatedTable,
    });
    setEditModalOpen(false);
  };
  const handleReset = () => {
    setVendor('');
    setSelectedClientName('');
    setPoNos('');
    setSiteInchargeName('');
    setSelectedPoDate('');
    setPoNosOption([]); // Clear options dependent on vendor
    setPurchaseOrders(allPurchaseOrders);
  };
  useEffect(() => {
    if (resetFilters) {
      setPurchaseOrders(allPurchaseOrders);
      setResetFilters(false); // clear flag
    }
  }, [resetFilters, allPurchaseOrders]);
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      height: '45px',
      borderWidth: '2px',
      borderRadius: '8px',
      borderColor: state.isFocused
        ? 'rgba(191, 152, 83, 0.35)'
        : 'rgba(191, 152, 83, 0.35)',
      boxShadow: state.isFocused ? '0 0 0 1px #FAF6ED' : 'none',
      '&:hover': {
        borderColor: 'rgba(191, 152, 83, 0.5)', // 50% on hover
      }
    }),
  };
  useEffect(() => {
    const filtered = allPurchaseOrders.filter(order => {
      return (
        (!vendor || order.vendorName === vendor) &&
        (!selectedClientName || order.clientName === selectedClientName) &&
        (!poNos || order.eno === poNos) &&
        (!siteInchargeName || order.siteIncharge === siteInchargeName) &&
        (!selectedPoDate || order.date === selectedPoDate)
      );
    });
    setPurchaseOrders(filtered);
  }, [vendor, selectedClientName, poNos, siteInchargeName, selectedPoDate, allPurchaseOrders]);
  const handleHeaderEdit = () => {
    setEditableHeader({
      vendorName: selectedOrder.vendorName || '',
      clientName: selectedOrder.clientName || '',
      date: selectedOrder.date || '',
      eno: selectedOrder.eno || '',
    });
    setIsHeaderEditable(true);
  };
  const handleHeaderSave = async () => {
    try {
      const payload = {
        vendorName: editableHeader.vendorName,
        clientName: editableHeader.clientName,
        date: editableHeader.date,
        eno: editableHeader.eno,
      };

      // Check if anything has changed
      const hasChanges = Object.keys(payload).some(key => payload[key] !== selectedOrder[key]);

      if (!hasChanges) {
        setIsHeaderEditable(false);
        return; // silently return if no changes
      }

      const response = await fetch(
        `https://backendaab.in/aabuildersDash/api/purchase_orders/${selectedOrder.id}/edit?editedBy=${username}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save header changes.');
      }

      const updatedOrder = await response.json();
      setSelectedOrder(updatedOrder);
      setIsHeaderEditable(false);
    } catch (error) {
      console.error('Error saving header changes:', error);
    }
  };
  useEffect(() => {
    if (selectedOrderId) {
      fetchHeaderAudit(selectedOrderId);
    }
  }, [selectedOrderId]);

  useEffect(() => {
    setIsHeaderEditable(false);
    setEditableHeader({
      vendorName: '',
      clientName: '',
      date: '',
      eno: '',
    });
  }, [selectedOrder]);
  const handleHeaderChange = async (field, value) => {
    setEditableHeader((prev) => ({ ...prev, [field]: value }));
    // When vendorName changes, fetch PO count
    if (field === 'vendorName') {
      try {
        const countResponse = await fetch(
          `https://backendaab.in/aabuildersDash/api/purchase_orders/countByVendor?vendorName=${value}`
        );
        if (!countResponse.ok) throw new Error("Failed to fetch PO count");
        const vendorCount = await countResponse.json();
        // Set PO.No based on vendor count
        setEditableHeader((prev) => ({
          ...prev,
          vendorName: value,
          eno: `${vendorCount + 1}`,
        }));
      } catch (err) {
        console.error("Error fetching PO count:", err);
      }
    }
  };
  const generatePDF = (selectedOrder) => {
    const doc = new jsPDF();
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 41.8);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PURCHASE ORDER", 12, 22);
    doc.text(`PO No :`, 12, 28);
    doc.setFontSize(16);
    doc.text("AA BUILDERS", 105, 17, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("181 Madurai Road, Srivilliputtur - 626 125", 105, 28, { align: "center" });
    doc.line(10, 30, 200, 30);
    doc.setFont("helvetica", "bold");
    doc.text(`VENDOR:`, 12, 37);
    doc.setFont("helvetica", "normal");
    doc.text(`# ${selectedOrder.ENo}`, 35, 28);
    doc.text(selectedOrder.vendorName || "", 35, 37);
    doc.setFont("helvetica", "bold");
    doc.text(`DATE:`, 12, 43);
    doc.setFont("helvetica", "normal");
    doc.text(formatDateOnly(selectedOrder.date) || "", 35, 43);
    doc.setFont("helvetica", "bold");
    doc.text("SITE NAME:", 107, 37);
    doc.text("Site Incharge:", 104, 43);
    doc.setFont("helvetica", "normal");
    doc.text(selectedOrder.clientName || "", 130, 37);
    doc.text(selectedOrder.siteIncharge || "", 130, 43);
    if (selectedOrder.siteInchargeMobileNumber) {
      doc.setFont("helvetica", "bold");
      doc.text("Phone:", 115, 49);
      doc.setFont("helvetica", "normal");
      doc.text(`+91 ${selectedOrder.siteInchargeMobileNumber}`, 130, 49);
    }
    const tableBody = selectedOrder.purchaseTable.map((item, index) => [
      index + 1,
      item.itemName || "",
      item.category || "",
      item.model || "",
      item.brand || "",
      item.type || "",
      item.quantity || "",
      item.amount || ""
    ]);
    // Pad to 24 rows before totals
    while (tableBody.length < 24) {
      tableBody.push(["", "", "", "", "", "", "", ""]);
    }
    // Totals
    const totalQty = selectedOrder.purchaseTable.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalAmount = selectedOrder.purchaseTable.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    // Final row with totals under QTY and RATE
    tableBody.push([
      "", "", "", "", "",
      { content: `TOTAL `, styles: { fontStyle: "bold", halign: "center" } },
      { content: `${totalQty}`, styles: { fontStyle: "bold", halign: "center" } },
      { content: ` ${totalAmount}`, styles: { fontStyle: "bold", halign: "center" } }
    ]);
    // 🧾 Table rendering
    doc.autoTable({
      startY: 52,
      margin: { left: 10, right: 10 },
      tableWidth: 190,
      head: [["SNO", "ITEM NAME", "CATEGORY", "MODEL", "BRAND", "TYPE", "QTY", "PRICE"]],
      body: tableBody,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 2,
        textColor: 0,
        lineColor: [100, 100, 100],
        lineWidth: 0.2,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        fontStyle: "bold",
      },
      didDrawPage: function (data) {
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        doc.setFontSize(5); // small footer font
        doc.text(`Created By: ${selectedOrder.createdBy}`, 14, pageHeight - 10);
        doc.text(`Date: ${formatDate(selectedOrder.createdDateTime)}`, pageWidth - 60, pageHeight - 10);
      },
      tableLineColor: [100, 100, 100],
      tableLineWidth: 0.2,
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 28 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 13 },
        7: { cellWidth: 17 }
      }
    });
    // 💾 Save the PDF
    doc.save(`# ${selectedOrder.ENo} - ${formatDateOnly(selectedOrder.date)}-${selectedOrder.clientName}.pdf`);
  };
  const handleEditClick = (order) => {
    setSelectedOrderForEdit(order);
    setEditedTitle(order?.poNotes?.poNotes || ""); // Set current note if exists
    setIsEditModalOpen(true);
  };

  const handleSubmitEditTitle = async () => {
    if (!selectedOrderForEdit) return;
    try {
      const response = await fetch(
        `https://backendaab.in/aabuildersDash/api/purchase_orders/editPoNotes/${selectedOrderForEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ poNotes: editedTitle }),
        }
      );
      if (!response.ok) throw new Error("Failed to update notes");
      const updatedOrder = await response.json();
      // Update local state (assuming you use state to store purchaseOrders)
      setPurchaseOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      setIsEditModalOpen(false);
      setSelectedOrderForEdit(null);
    } catch (err) {
      console.error("Error updating PO notes:", err);
    }
  };

  const handleEditSubmits = async () => {
    // Replace the edited row in the table
    const updatedTable = selectedOrder.purchaseTable.map((row) =>
      row.id === editRowData.id ? editRowData : row
    );
    try {
      const response = await fetch(
        `https://backendaab.in/aabuildersDash/api/purchase_orders/editPurchaseTable/full/${selectedOrder.id}?editedBy=${username}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTable),
        }
      );
      if (response.ok) {
        const updatedOrder = await response.json();
        setSelectedOrder(updatedOrder);
        setEditModalOpen(false);
        alert("Purchase table updated successfully.");
      } else {
        alert("Failed to update purchase table.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating purchase table.");
    }
  };

  const fetchAudit = async () => {
    const res = await fetch(`https://backendaab.in/aabuildersDash/api/purchase_orders/audit/${selectedOrder.id}`);
    const data = await res.json();
    setAuditHistory(data);
  };
  useEffect(() => {
    if (selectedOrder) {
      fetchAudit();
    }
  }, [selectedOrder]);

  const fetchHeaderAudit = async (poId) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/purchase_orders/${selectedOrder.id}/audit`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        setPoAuditHistory([]);
        return;
      }

      const data = JSON.parse(text);
      console.log(data);
      setPoAuditHistory(data);
    } catch (error) {
      console.error("Failed to fetch PO audit:", error);
      setPoAuditHistory([]);
    }
  };

  useEffect(() => {
    if (selectedOrder) {
      fetchHeaderAudit();
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (auditPopupOpen) fetchAudit();
  }, [auditPopupOpen]);

  const toggleDeleteStatus = async (order) => {
    const newStatus = !order.deleted;

    const confirmMessage = newStatus
      ? 'Are you sure you want to delete this order?'
      : 'Are you sure you want to undo delete for this order?';

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/purchase_orders/markDeleted/${order.id}?deleted=${newStatus}`, {
        method: 'PUT',
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setAllPurchaseOrders(prev =>
          prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o))
        );
      }
    } catch (error) {
      console.error("Failed to toggle deleted status", error);
    }
  };

  useEffect(() => {
    if (editRowData?.category) {
      const filteredItems = poItemName.filter(
        item =>
          item.category &&
          item.category.toLowerCase() === editRowData.category.toLowerCase()
      );

      const itemNameOpts = filteredItems.map(item => ({
        value: item.itemName,
        label: item.itemName,
      }));

      setItemNameOptions(itemNameOpts);
    } else {
      setItemNameOptions([]);
    }
  }, [editRowData?.category, poItemName]);

  return (
    <div className="gap-6 [@media(min-width:1450)]w-[1900px] pl-10 bg-[#FFFCF6]">
      <div className="bg-white p-4">
        <div className='flex justify-end mb-6 lg:mr-14 '>
          <button
            className='w-28 h-9 border border-[#BF9853] rounded-md font-semibold text-sm text-[#BF9853] flex items-center justify-center gap-2'
            onClick={handleReset}
          >
            <img className='w-4 h-4' src={Reload} alt="Reload" />
            Reset
          </button>
        </div>
        <div className="lg:flex gap-4 mb-3 text-left">
          <Select
            value={vendor ? vendorOptions.find(option => option.value === vendor) : null}
            onChange={(selectedOption) => setVendor(selectedOption?.value || '')}
            options={vendorOptions}
            placeholder="Select vendor Name..."
            isSearchable
            isClearable
            className="w-[300px] lg:w-[373px]"
            styles={customStyles}
          />
          <Select
            value={selectedClientName ? clientNameOptions.find(option => option.value === selectedClientName) : null}
            onChange={(selectedOption) => setSelectedClientName(selectedOption?.value || '')}
            options={clientNameOptions}
            placeholder="Select Client Name..."
            isSearchable
            isClearable
            className="w-[300px] lg:w-[373px] lg:mt-0 mt-3"
            styles={customStyles}
          />
          <input
            type="date"
            value={selectedPoDate}
            onChange={(e) => setSelectedPoDate(e.target.value)}
            className="border-2 border-[#BF9863] border-opacity-25 p-2 rounded-lg w-[300px] lg:w-[313px] lg:mt-0 mt-3"
          />
          <Select
            value={poNos ? poNosOption.find(option => option.value === poNos) : null}
            onChange={(selectedOption) => setPoNos(selectedOption?.value || '')}
            options={poNosOption}
            placeholder="Select Po No..."
            isSearchable
            isClearable
            className="lg:w-[270px] w-[300px] lg:mt-0 mt-3"
            styles={customStyles}
            isDisabled={!vendor}
          />
          <Select
            value={siteInchargeName ? siteEngineerOptions.find(option => option.value === siteInchargeName) : null}
            onChange={(selectedOption) => setSiteInchargeName(selectedOption?.value || '')}
            options={siteEngineerOptions}
            placeholder="Select Site Incharge..."
            isSearchable
            isClearable
            className="w-[300px] lg:w-[373px] lg:mt-0 mt-3"
            styles={customStyles}
          />
        </div>
        <div className='[@media(min-width:1300px)]:flex gap-8'>
          {/* LEFT - List of Orders */}
          <div className="bg-white p-2 lg:w-[720px]">
            <div className="flex justify-between items-center font-semibold text-base mb-3 border-b pb-2 px-1">
              <div className="w-[50px]">S.No</div>
              <div
                className="flex items-center gap-1 cursor-pointer lg:w-[450px]"
                onClick={() => {
                  const newOrder = !isDateSortedAsc;
                  const sorted = [...purchaseOrders].sort((a, b) => {
                    const dateA = new Date(a.createdDateTime);
                    const dateB = new Date(b.createdDateTime);
                    return newOrder ? dateA - dateB : dateB - dateA;
                  });
                  setPurchaseOrders(sorted);
                  setIsDateSortedAsc(newOrder);
                }}
              >
                <span>Purchase Order</span>
                <span className="text-sm">
                  {isDateSortedAsc ? '↑' : '↓'}
                </span>
              </div>
              <div className="w-[100px] text-right pr-4">Activity</div>
            </div>
            {purchaseOrders.length > 0 ? (
              <ul className="lg:h-[650px] h-[200px] overflow-auto">
                {purchaseOrders.map((order, index) => (
                  <li
                    key={order.id}
                    className="flex items-center justify-between border-b py-2 cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setSelectedOrderId(order.id);
                    }}>
                    <div className="w-[50px] text-right mr-2">{index + 1}.</div>
                    <div
                      className="flex items-center gap-2 w-[450px] cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order);
                        setSelectedOrderId(order.id);
                      }}>
                      <img src={file} className="w-5 h-5" />
                      <span
                        title={`${formatDateTime(order.createdDateTime)} - ${order.clientId}`}
                        className={`font-medium hover:text-[#E4572E] ${selectedOrderId === order.id ? 'text-[#E4572E]' : 'text-black'} ${order.deleted ? 'line-through text-gray-500' : ''}`}
                      >
                        {order.eno} - {formatDateTime(order.createdDateTime)} - {
                          clientNameOptions.find(opt => opt.id === order.clientId)?.label || order.clientId
                        }
                        {order.poNotes?.poNotes ? ` - ${order.poNotes.poNotes}` : ""}
                      </span>
                    </div>
                    <div className="flex gap-3 pr-2 w-[100px] justify-end">
                      <button onClick={() => generatePDF(order)}>
                        <img src={download} alt="#" className="w-5 h-5" />
                      </button>
                      <button className="rounded-full transition duration-200" onClick={() => handleEditClick(order)}>
                        <img src={edit} alt="Edit" className="w-4 h-6 transform hover:scale-110" />
                      </button>
                      <button onClick={() => toggleDeleteStatus(order)}>
                        <img
                          src={order.deleted ? undo : remove}
                          alt="Toggle Delete"
                          className="w-4 h-4 transform hover:scale-110"
                        />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center lg:h-[300px]">
                <img src={noDataImage} alt="No Data" className="w-16 lg:h-16 mb-2" />
                <p className="text-gray-600 text-lg font-medium">No Data Found Here</p>
              </div>
            )}
          </div>
          <div className="lg:w-[1000px] p-4">
            <h2 className="text-center text-lg font-semibold mb-2">Purchase Order</h2>
            {selectedOrder ? (
              <>
                {selectedOrder && !selectedOrder.deleted && (
                  <div className='ml-[900px]'>
                    {isHeaderEditable ? (
                      <button
                        onClick={handleHeaderSave}
                        className="text-blue-600 underline text-sm mb-2"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={handleHeaderEdit}
                        className="text-blue-600 underline text-sm mb-2"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}
                <div className="flex justify-between mb-2">
                  {isHeaderEditable ? (
                    <>
                      <span>
                        <b className='font-medium'>Vendor Name:</b>
                        <div className="inline-block ml-2 min-w-[150px]">
                          <Select
                            options={vendorOptions}
                            value={vendorOptions.find(opt => opt.value === editableHeader.vendorName)}
                            onChange={(selectedOption) =>
                              handleHeaderChange('vendorName', selectedOption?.value || '')
                            }
                            isSearchable
                            placeholder="Select Vendor"
                            styles={{
                              control: (base) => ({
                                ...base,
                                minHeight: '30px',
                                fontSize: '0.875rem',
                              }),
                              dropdownIndicator: (base) => ({
                                ...base,
                                padding: 4,
                              }),
                            }}
                          />
                        </div>
                      </span>
                      <span>
                        <b className='font-medium'>Client Name:</b>
                        <div className="inline-block ml-2 min-w-[150px]">
                          <Select
                            options={clientNameOptions}
                            value={clientNameOptions.find(opt => opt.value === editableHeader.clientName)}
                            onChange={(selectedOption) =>
                              handleHeaderChange('clientName', selectedOption?.value || '')
                            }
                            isSearchable
                            placeholder="Select Client"
                            styles={{
                              control: (base) => ({
                                ...base,
                                minHeight: '30px',
                                fontSize: '0.875rem',
                              }),
                              dropdownIndicator: (base) => ({
                                ...base,
                                padding: 4,
                              }),
                            }}
                          />
                        </div>
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        <b className='font-medium'>Vendor Name:</b>
                        <b className='font-medium text-[#E4572E]'>
                          {vendorOptions.find(opt => opt.id === selectedOrder.vendorId)?.label || selectedOrder.vendorId}
                        </b>
                      </span>
                      <span>
                        <b className='font-medium'>Client Name:</b>
                        <b className='font-medium text-[#E4572E]'>
                          {clientNameOptions.find(opt => opt.id === selectedOrder.clientId)?.label || selectedOrder.clientId}
                        </b>
                      </span>
                    </>
                  )}
                </div>
                <div className="flex justify-between mb-4">
                  {isHeaderEditable ? (
                    <>
                      <span>
                        <b className='font-medium'>Date:</b>
                        <input
                          type="date"
                          className="border ml-2 px-1"
                          value={editableHeader.date.slice(0, 10)}
                          onChange={(e) => handleHeaderChange('date', e.target.value)}
                        />
                      </span>
                      <span>
                        <b className='font-medium'>PO.No:</b>
                        <input
                          className="border ml-2 px-1"
                          value={editableHeader.eno}
                          onChange={(e) => handleHeaderChange('eno', e.target.value)}
                          readOnly
                        />
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        <b className='font-medium'>Date:</b>
                        <b className='font-medium text-[#E4572E]'>{formatDateOnly(selectedOrder.date)}</b>
                      </span>
                      <span>
                        <b className='font-medium'>PO.No:</b>
                        <b className='font-medium text-[#E4572E]'>{selectedOrder.eno}</b>
                      </span>
                    </>
                  )}
                </div>
                {/* Add Edit or Save button here */}
                <div className='rounded-lg border-l-8 border-l-[#BF9853] overflow-auto'>
                  <table className="w-full text-sm">
                    <thead className="bg-[#FAF6ED]">
                      <tr className="text-left">
                        <th className="p-2">Sl.No</th>
                        <th className="p-2 lg:pl-0 pl-8 min-w-[100px] sm:min-w-[auto]">Item</th>
                        <th className="p-2">Category</th>
                        <th className="p-2 pl-8 min-w-[140px] sm:min-w-[auto]">Model</th>
                        <th className="p-2">Brand</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Qty</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Amount</th>
                        <th className='p-2'>Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.purchaseTable.map((item, idx) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">{idx + 1}</td>
                          <td className="p-2 min-w-[140px] sm:min-w-[auto]">{item.itemName}</td>
                          <td className="p-2">{item.category}</td>
                          <td className="p-2 min-w-[100px] sm:min-w-[auto]">{item.model}</td>
                          <td className="p-2">{item.brand}</td>
                          <td className="p-2">{item.type}</td>
                          <td className="p-2">{item.quantity}</td>
                          <td className="p-2">{item.amount}</td>
                          <td className="p-2">{item.totalAmount}</td>
                          <td className="p-2">
                            {selectedOrder && !selectedOrder.deleted && (
                              <div className="flex gap-3 pr-2">
                                <button
                                  className="rounded-full transition duration-200 ml-2 mr-3"
                                  onClick={() => {
                                    setEditRowData(item);
                                    setOriginalRowData(item);
                                    setEditModalOpen(true);
                                  }}>
                                  <img src={edit} alt="Edit" className="w-4 h-4 transform hover:scale-110" />
                                </button>
                                <button className="-ml-5 -mr-2">
                                  <img src={remove} alt="Delete" className="w-4 h-4 transform hover:scale-110" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-white font-bold border border-r-[#BF9853] border-t-[#BF9853] border-b-[#BF9853] border-opacity-15">
                        <td className="py-2 font-semibold text-base border border-r-[#BF9853]" colSpan="6">Total</td>
                        <td className="py-2 font-semibold text-base border border-r-[#BF9853]">
                          {totalQty}
                        </td>
                        <td className="py-2 font-semibold text-base border border-r-[#BF9853]">
                          {totalAmount.toFixed(2)}
                        </td>
                        <td className="py-2 font-semibold text-base">
                          {totalOverallAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-center mt-10 text-gray-500">Click on a purchase order to view details</p>
            )}
            <button
              type="button"
              onClick={handleEditSubmits}
              className="bg-[#BF9853] text-white px-4 py-2 w-24 h-10 mt-3 rounded"
              disabled={!editRowData || JSON.stringify(editRowData) === JSON.stringify(originalRowData)}>
              Update
            </button>

            <div className="mt-4 flex justify-between">
              <div>
                {groupedAuditKeys.map((timeKey) => (
                  <button
                    key={timeKey}
                    type="button"
                    className="ml-4 text-sm text-blue-600 underline block mb-2"
                    onClick={() => setAuditPopupOpen(timeKey)}>
                    {timeKey} - Edited
                  </button>
                ))}
              </div>
              <div>
                {poAuditHistory.length > 0 && (
                  <ul className="space-y-2">
                    {poAuditHistory.map((entry, idx) => {
                      const editedAtDate = new Date(entry.editedAt);
                      const formattedDate = editedAtDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
                      const formattedTime = editedAtDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      });
                      return (
                        <li key={idx}>
                          <button
                            className="text-blue-700 underline text-sm hover:text-blue-900"
                            onClick={() => {
                              setSelectedAudit(entry);
                              setShowAuditModal(true);
                            }}
                          >
                            {formattedDate} {formattedTime} - Edited
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showAuditModal && selectedAudit && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl shadow-lg relative">
            <h2 className="text-xl font-semibold mb-4">Audit Details - {selectedAudit.editedAt ? formatDateTime(selectedAudit.editedAt) : "N/A"}</h2>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  {[
                    "Vendor Name",
                    "Client Name",
                    "Date",
                    "ENo",
                    "Edited By"
                  ].map((label, index) => (
                    <th key={index} className="p-2 border">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {[
                    {
                      old: selectedAudit.oldVendorName,
                      new: selectedAudit.newVendorName
                    },
                    {
                      old: selectedAudit.oldClientName,
                      new: selectedAudit.newClientName
                    },
                    {
                      old: selectedAudit.oldDate,
                      new: selectedAudit.newDate
                    },
                    {
                      old: selectedAudit.oldENo,
                      new: selectedAudit.newENo
                    },
                    {
                      old: "",
                      new: selectedAudit.editedBy || "Unknown"
                    }
                  ].map((field, index) => {
                    const hasChanged = field.old !== field.new && field.old !== "";
                    return (
                      <td key={index} className="p-2 border">
                        <span
                          className={`px-1 rounded ${hasChanged ? "bg-orange-100 text-orange-700 font-semibold" : ""}`}
                          title={hasChanged ? `Previous: ${field.old} → Current: ${field.new}` : field.new}
                        >
                          {field.old}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
            <button
              className="absolute top-2 right-3 text-gray-700 hover:text-black text-xl"
              onClick={() => setShowAuditModal(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedOrderForEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[500px] relative">
            <h2 className="text-lg font-semibold mb-4">Edit PO Notes</h2>
            <label className="block mb-2 font-medium">
              Purchase Order Notes<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 text-black rounded"
                onClick={() => setIsEditModalOpen(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-[#BF9853] text-white rounded"
                onClick={handleSubmitEditTitle}
              >
                Submit
              </button>
            </div>
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl"
              onClick={() => setIsEditModalOpen(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[600px] relative text-left">
            <h2 className="text-xl font-bold mb-4">Edit History</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Category</label>
                  <Select
                    options={categoryOptions}
                    value={categoryOptions.find(opt => opt.value === editRowData?.category)}
                    isSearchable
                    isClearable
                    className="w-full"
                    styles={customStyles}
                    onChange={(selectedOption) => {
                      const newCategory = selectedOption ? selectedOption.value : '';

                      // Update category in state
                      setEditRowData(prev => ({ ...prev, category: newCategory }));

                      // Filter Item Names based on the selected category
                      if (newCategory) {
                        const filteredItems = poItemName.filter(
                          item =>
                            item.category &&
                            item.category.toLowerCase() === editRowData?.category.toLowerCase()
                        );

                        const itemNameOpts = filteredItems.map(item => ({
                          value: item.itemName,
                          label: item.itemName,
                        }));

                        setItemNameOptions(itemNameOpts);
                      } else {
                        // If category is cleared, clear item name options
                        setItemNameOptions([]);
                      }

                      // Optionally also reset selected item name:
                      setEditRowData(prev => ({ ...prev, itemName: '' }));
                    }}
                  />
                </div>
                <div>
                  <label>Item Name</label>
                  <Select
                    options={itemNameOptions}
                    value={itemNameOptions.find(opt => opt.value === editRowData?.itemName)}
                    isSearchable
                    isClearable
                    className="w-full"
                    styles={customStyles}
                    onChange={(selectedOption) =>
                      setEditRowData({ ...editRowData, itemName: selectedOption?.value || '' })
                    }
                  />
                </div>
                <div>
                  <label>Model</label>
                  <Select
                    options={modelOptions}
                    value={modelOptions.find(opt => opt.value === editRowData?.model)}
                    isSearchable
                    isClearable
                    className="w-full"
                    styles={customStyles}
                    onChange={(selectedOption) =>
                      setEditRowData({ ...editRowData, model: selectedOption?.value || '' })
                    }
                  />
                </div>
                <div>
                  <label>Brand</label>
                  <Select
                    options={brandOptions}
                    value={brandOptions.find(opt => opt.value === editRowData?.brand)}
                    isSearchable
                    isClearable
                    className="w-full"
                    styles={customStyles}
                    onChange={(selectedOption) =>
                      setEditRowData({ ...editRowData, brand: selectedOption?.value || '' })
                    }
                  />
                </div>
                <div>
                  <label>Type</label>
                  <Select
                    options={typeOptions}
                    value={typeOptions.find(opt => opt.value === editRowData?.type)}
                    isSearchable
                    isClearable
                    className="w-full"
                    styles={customStyles}
                    onChange={(selectedOption) =>
                      setEditRowData({ ...editRowData, type: selectedOption?.value || '' })
                    }
                  />
                </div>
                <div>
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={editRowData?.quantity || ''}
                    onChange={(e) =>
                      setEditRowData({ ...editRowData, quantity: e.target.value, totalAmount: e.target.value * editRowData.amount })
                    }
                    className="w-full border-2 border-[#BF9863] border-opacity-25 p-2 rounded"
                  />
                </div>
                <div>
                  <label>Amount</label>
                  <input
                    type="number"
                    value={editRowData?.amount || ''}
                    onChange={(e) =>
                      setEditRowData({ ...editRowData, amount: e.target.value, totalAmount: e.target.value * editRowData.quantity })
                    }
                    className="w-full border-2 border-[#BF9863] border-opacity-25 p-2 rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="border border-[#BF9863] px-4 py-2 w-24 h-10 rounded"
                >
                  Close
                </button>
                <button type="submit" className="bg-[#BF9853] text-white px-4 py-2 w-24 h-10 rounded">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {auditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative">
            <h2 className="text-xl font-semibold mb-4">Edit History - {auditPopupOpen}</h2>
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Edited By</th>
                  <th className="p-2 border">Item</th>
                  <th className="p-2 border">Category</th>
                  <th className="p-2 border">Model</th>
                  <th className="p-2 border">Brand</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Qty</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Total</th>
                </tr>
              </thead>
              <tbody>
                {groupedAudits[auditPopupOpen]?.map((entry, idx) => (
                  <tr key={entry.id} className="border-b">
                    <td className="p-2 border">{entry.editedBy}</td>
                    {["ItemName", "Category", "Model", "Brand", "Type", "Quantity", "Amount", "TotalAmount"].map((field) => {
                      const oldVal = entry[`old${field}`];
                      const newVal = entry[`new${field}`];
                      const changed = oldVal !== newVal;
                      return (
                        <td
                          key={field}
                          className={`p-2 border ${changed ? "bg-yellow-100 text-red-600 font-semibold" : ""
                            }`}
                          title={changed ? `Previous: ${oldVal} → Current: ${newVal}` : ""}
                        >
                          {oldVal}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setAuditPopupOpen(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PurchaseHistory;

function formatDateTime(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid Date";

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}
