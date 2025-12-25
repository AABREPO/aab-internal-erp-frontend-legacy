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
    vendorId: '',
    clientId: '',
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
  const formatDates = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const groupedAudits = auditHistory.reduce((acc, audit) => {
    const date = formatDate(audit.edited_at);
    const timeKey = date;
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
        setAllPurchaseOrders(data);
        console.log(data);
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
        console.log(data);
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
          sNo: item.siteNo,
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
          id: item.id,
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
          id: item.id,
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
          id: item.id,
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
          id: item.id,
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
          id: item.id,
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
    setPoNosOption([]);
    setPurchaseOrders(allPurchaseOrders);
  };
  useEffect(() => {
    if (resetFilters) {
      setPurchaseOrders(allPurchaseOrders);
      setResetFilters(false);
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
        borderColor: 'rgba(191, 152, 83, 0.5)',
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
      vendorId: selectedOrder.vendor_id || '',
      clientId: selectedOrder.client_id || '',
      date: selectedOrder.date || '',
      eno: selectedOrder.eno || '',
    });
    setIsHeaderEditable(true);
  };
  const handleHeaderSave = async () => {
    try {
      const payload = {
        client_id: editableHeader.clientId,
        date: editableHeader.date,
        eno: editableHeader.eno,
      };
      const hasChanges = Object.keys(payload).some(key => payload[key] !== selectedOrder[key]);
      if (!hasChanges) {
        setIsHeaderEditable(false);
        return;
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
      vendorId: '',
      clientId: '',
      date: '',
      eno: '',
    });
  }, [selectedOrder]);
  const handleHeaderChange = async (field, value) => {
    setEditableHeader((prev) => ({ ...prev, [field]: value }));
    if (field === 'vendorId') {
      try {
        const countResponse = await fetch(
          `https://backendaab.in/aabuildersDash/api/purchase_orders/countByVendor?vendorId=${value}`
        );
        if (!countResponse.ok) throw new Error("Failed to fetch PO count");
        const vendorCount = await countResponse.json();
        setEditableHeader((prev) => ({
          ...prev,
          eno: `${vendorCount + 1}`,
        }));
      } catch (err) {
        console.error("Error fetching PO count:", err);
      }
    }
  };
  const generatePDF = (selectedOrder) => {
    const doc = new jsPDF();
    const findNameById = (options, id, key) => {
      const match = options.find(opt => opt.id == id);
      return match ? match[key] : '';
    };
    const vendorName = findNameById(vendorOptions, selectedOrder.vendor_id, "label");
    const clientName = findNameById(clientNameOptions, selectedOrder.client_id, "label");
    const siteInchargeName = findNameById(siteEngineerOptions, selectedOrder.site_incharge_id, "label");
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
    doc.text(`# ${selectedOrder.eno}`, 35, 28);
    doc.text(vendorName || "", 35, 37);
    doc.setFont("helvetica", "bold");
    doc.text(`DATE:`, 12, 43);
    doc.setFont("helvetica", "normal");
    doc.text(formatDateOnly(selectedOrder.date) || "", 35, 43);
    doc.setFont("helvetica", "bold");
    doc.text("SITE NAME:", 107, 37);
    doc.text("Site Incharge:", 104, 43);
    doc.setFont("helvetica", "normal");
    doc.text(clientName || "", 130, 37);
    doc.text(siteInchargeName || "", 130, 43);
    if (selectedOrder.site_incharge_mobile_number) {
      doc.setFont("helvetica", "bold");
      doc.text("Phone:", 115, 49);
      doc.setFont("helvetica", "normal");
      doc.text(`+91 ${selectedOrder.site_incharge_mobile_number}`, 130, 49);
    }
    const tableBody = selectedOrder.purchaseTable.map((item, index) => [
      index + 1,
      findNameById(poItemName, item.item_id, "itemName"),
      findNameById(categoryOptions, item.category_id, "label"),
      findNameById(modelOptions, item.model_id, "label"),
      findNameById(brandOptions, item.brand_id, "label"),
      findNameById(typeOptions, item.type_id, "label"),
      item.quantity || "",
      item.amount || ""
    ]);
    while (tableBody.length < 24) {
      tableBody.push(["", "", "", "", "", "", "", ""]);
    }
    const totalQty = selectedOrder.purchaseTable.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalAmount = selectedOrder.purchaseTable.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    tableBody.push([
      "", "", "", "", "",
      { content: `TOTAL `, styles: { fontStyle: "bold", halign: "center" } },
      { content: `${totalQty}`, styles: { fontStyle: "bold", halign: "center" } },
      { content: ` ${totalAmount}`, styles: { fontStyle: "bold", halign: "center" } }
    ]);
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
        doc.setFontSize(5);
        doc.text(`Created By: ${selectedOrder.created_by}`, 14, pageHeight - 10);
        doc.text(`Date: ${formatDate(selectedOrder.created_date_time)}`, pageWidth - 60, pageHeight - 10);
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
    doc.save(`# ${selectedOrder.eno} - ${formatDateOnly(selectedOrder.date)}-${clientName}.pdf`);
  };
  const handleEditClick = (order) => {
    setSelectedOrderForEdit(order);
    setEditedTitle(order?.poNotes?.poNotes || "");
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
    const updatedTable = selectedOrder.purchaseTable.map((row) =>
      row.id === editRowData.id ? editRowData : row
    );
    const cleanedTable = updatedTable.map((row) => ({
      id: row.id,
      category_id: row.category_id,
      item_id: row.item_id,
      model_id: row.model_id,
      brand_id: row.brand_id,
      type_id: row.type_id,
      quantity: row.quantity,
      amount: row.amount,
      totalAmount: row.totalAmount,
    }));
    try {
      const response = await fetch(
        `https://backendaab.in/aabuildersDash/api/purchase_orders/editPurchaseTable/full/${selectedOrder.id}?editedBy=${username}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanedTable),
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
    try {
      const res = await fetch(`https://backendaab.in/aabuildersDash/api/purchase_orders/audit/${selectedOrder.id}`);
      if (!res.ok) {
        console.error("Fetch failed with status:", res.status);
        return;
      }
      const text = await res.text();
      if (!text) {
        console.warn("Audit response is empty");
        setAuditHistory([]);
        return;
      }
      const data = JSON.parse(text);
      setAuditHistory(data);
    } catch (error) {
      console.error("Error fetching audit data:", error);
    }
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
    const newStatus = !order.delete_status;
    const confirmMessage = newStatus
      ? 'Are you sure you want to delete this order?'
      : 'Are you sure you want to undo delete for this order?';
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/purchase_orders/markDeleted/${order.id}?deleteStatus=${newStatus}`, {
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
        id: item.id,
      }));
      setItemNameOptions(itemNameOpts);
    } else {
      setItemNameOptions([]);
    }
  }, [editRowData?.category, poItemName]);
  useEffect(() => {
    if (editModalOpen && editRowData?.category_id && categoryOptions.length > 0) {
      const selectedCategory = categoryOptions.find(cat => cat.id === editRowData.category_id);
      const categoryName = selectedCategory?.value;
      if (categoryName) {
        const filteredItems = poItemName.filter(
          item =>
            item.category &&
            item.category.toLowerCase() === categoryName.toLowerCase()
        );
        const itemNameOpts = filteredItems.map(item => ({
          id: item.id,
          value: item.itemName,
          label: item.itemName
        }));
        setItemNameOptions(itemNameOpts);
      }
    }
  }, [editModalOpen, editRowData?.category_id, categoryOptions, poItemName]);
  return (
    <div className="gap-6 [@media(min-width:1450)]w-[1900px] pl-10 bg-[#FFFCF6] mr-10">
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
              <ul className="lg:h-[550px] h-[200px] overflow-auto">
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
                        title={`${order.date} - ${order.client_id}`}
                        className={`font-medium hover:text-[#E4572E] ${selectedOrderId === order.id ? 'text-[#E4572E]' : 'text-black'} ${order.delete_status ? 'line-through text-gray-500' : ''}`}
                      >
                        {order.eno} - {order.date} - {
                          clientNameOptions.find(opt => opt.id === order.client_id)?.label || order.client_id
                        }
                        {order.po_notes?.po_notes ? ` - ${order.po_notes.po_notes}` : ""}
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
                          src={order.delete_status ? undo : remove}
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
                  <div className='flex justify-end'>
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
                            value={vendorOptions.find(opt => opt.id === editableHeader.vendorId)}  // match by ID
                            onChange={(selectedOption) =>
                              handleHeaderChange('vendorId', selectedOption?.id || '')
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
                            value={clientNameOptions.find(opt => opt.id === editableHeader.clientId)}  // match by ID
                            onChange={(selectedOption) =>
                              handleHeaderChange('clientId', selectedOption?.id || '')
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
                          {vendorOptions.find(opt => opt.id === selectedOrder.vendor_id)?.label || selectedOrder.vendor_id}
                        </b>
                      </span>
                      <span>
                        <b className='font-medium'>Client Name:</b>
                        <b className='font-medium text-[#E4572E]'>
                          {clientNameOptions.find(opt => opt.id === selectedOrder.client_id)?.label || selectedOrder.client_id}
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
                        <b className='font-medium text-[#E4572E]'>{selectedOrder.date}</b>
                      </span>
                      <span>
                        <b className='font-medium'>PO.No:</b>
                        <b className='font-medium text-[#E4572E]'>{selectedOrder.eno}</b>
                      </span>
                    </>
                  )}
                </div>
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
                          <td className="p-2 min-w-[140px] sm:min-w-[auto]">
                            {poItemName.find(opt => opt.id === item.item_id)?.itemName || ''}
                          </td>
                          <td className="p-2">
                            {categoryOptions.find(opt => opt.id === item.category_id)?.label || ''}
                          </td>
                          <td className="p-2 min-w-[100px] sm:min-w-[auto]">
                            {modelOptions.find(opt => opt.id === item.model_id)?.label || ''}
                          </td>
                          <td className="p-2">
                            {brandOptions.find(opt => opt.id === item.brand_id)?.label || ''}
                          </td>
                          <td className="p-2">
                            {typeOptions.find(opt => opt.id === item.type_id)?.label || ''}
                          </td>
                          <td className="p-2">{item.quantity}</td>
                          <td className="p-2">{item.amount}</td>
                          <td className="p-2">{item.totalAmount}</td>
                          <td className="p-2">
                            {selectedOrder && !selectedOrder.delete_status && (
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
                      const editedAtDate = new Date(entry.edited_at);
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
          <div className="bg-white p-6 rounded-lg w-[100%] max-w-3xl shadow-lg relative">
            <h2 className="text-xl font-semibold mb-4">Audit Details - {selectedAudit.edited_at ? formatDateTime(selectedAudit.edited_at) : "N/A"}</h2>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  {[
                    "Vendor Name",
                    "Client Name",
                    "Date",
                    "Po No",
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
                      old:
                        vendorOptions.find(v => v.id === selectedAudit.old_vendor_id)?.label ||
                        `Vendor ID ${selectedAudit.old_vendor_id}`,
                      new:
                        vendorOptions.find(v => v.id === selectedAudit.new_vendor_id)?.label ||
                        `Vendor ID ${selectedAudit.new_vendor_id}`
                    },
                    {
                      old:
                        clientNameOptions.find(c => c.id === selectedAudit.old_client_id)?.label ||
                        `Client ID ${selectedAudit.old_client_id}`,
                      new:
                        clientNameOptions.find(c => c.id === selectedAudit.new_client_id)?.label ||
                        `Client ID ${selectedAudit.new_client_id}`
                    },
                    {
                      old: formatDates(selectedAudit.old_date),
                      new: formatDates(selectedAudit.new_date)
                    },
                    {
                      old: selectedAudit.oldeno,
                      new: selectedAudit.neweno
                    },
                    {
                      old: selectedAudit.edited_by || "Unknown",
                      new: ""
                    }
                  ].map((field, index) => {
                    const hasChanged =
                      field.old !== field.new && field.new !== "" && field.new !== null;
                    return (
                      <td key={index} className="p-2 border">
                        <span
                          className={`px-1 rounded ${hasChanged ? "bg-orange-100 text-orange-700 font-semibold" : ""
                            }`}
                          title={
                            hasChanged
                              ? `Previous: ${field.old} → Current: ${field.new}`
                              : field.old
                          }
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
              <button className="px-4 py-2 bg-gray-200 text-black rounded" onClick={() => setIsEditModalOpen(false)}>
                Close
              </button>
              <button className="px-4 py-2 bg-[#BF9853] text-white rounded" onClick={handleSubmitEditTitle}>
                Submit
              </button>
            </div>
            <button className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl" onClick={() => setIsEditModalOpen(false)}>
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
                    value={categoryOptions.find(opt => opt.id === editRowData?.category_id) || null}
                    isSearchable
                    isClearable
                    className="w-full"
                    styles={customStyles}
                    onChange={(selectedOption) => {
                      const newCategoryId = selectedOption ? selectedOption.id : '';
                      const newCategoryName = selectedOption ? selectedOption.value : '';
                      setEditRowData(prev => ({
                        ...prev,
                        category_id: newCategoryId,
                        category_name: newCategoryName,
                        item_id: '',
                        itemName: ''
                      }));
                      if (newCategoryName) {
                        const filteredItems = poItemName.filter(
                          item =>
                            item.category &&
                            item.category.toLowerCase() === newCategoryName.toLowerCase()
                        );
                        const itemNameOpts = filteredItems.map(item => ({
                          id: item.id,
                          value: item.itemName,
                          label: item.itemName
                        }));
                        setItemNameOptions(itemNameOpts);
                      } else {
                        setItemNameOptions([]);
                      }
                    }}
                  />
                </div>
                <div>
                  <label>Item Name</label>
                  <Select
                    options={itemNameOptions}
                    value={itemNameOptions.find(opt => opt.id === editRowData?.item_id) || null}
                    isSearchable
                    isClearable
                    className="w-full"
                    styles={customStyles}
                    onChange={(selectedOption) =>
                      setEditRowData({
                        ...editRowData,
                        item_id: selectedOption?.id || '',
                        itemName: selectedOption?.value || ''
                      })
                    }
                  />
                </div>
                <div>
                  <label>Model</label>
                  <Select
                    options={modelOptions}
                    value={modelOptions.find(opt => opt.id === editRowData?.model_id) || null}
                    isSearchable
                    isClearable
                    className="w-full"
                    styles={customStyles}
                    onChange={(selectedOption) =>
                      setEditRowData({
                        ...editRowData,
                        model_id: selectedOption?.id || '',
                        model: selectedOption?.value || ''
                      })
                    }
                  />
                </div>
                <div>
                  <label>Brand</label>
                  <Select
                    options={brandOptions}
                    value={brandOptions.find(opt => opt.id === editRowData?.brand_id) || null}
                    isSearchable
                    isClearable
                    className="w-full"
                    styles={customStyles}
                    onChange={(selectedOption) =>
                      setEditRowData({
                        ...editRowData,
                        brand_id: selectedOption?.id || '',
                        brand: selectedOption?.value || ''
                      })
                    }
                  />
                </div>
                <div>
                  <label>Type</label>
                  <Select
                    options={typeOptions}
                    value={typeOptions.find(opt => opt.id === editRowData?.type_id) || null}
                    isSearchable
                    isClearable
                    className="w-full"
                    styles={customStyles}
                    onChange={(selectedOption) =>
                      setEditRowData({
                        ...editRowData,
                        type_id: selectedOption?.id || '',
                        type: selectedOption?.value || ''
                      })
                    }
                  />
                </div>
                <div>
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={editRowData?.quantity || ''}
                    onChange={(e) =>
                      setEditRowData({
                        ...editRowData,
                        quantity: Number(e.target.value),
                        totalAmount: Number(e.target.value) * editRowData.amount
                      })
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
                      setEditRowData({
                        ...editRowData,
                        amount: Number(e.target.value),
                        totalAmount: Number(e.target.value) * editRowData.quantity
                      })
                    }
                    className="w-full border-2 border-[#BF9863] border-opacity-25 p-2 rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => setEditModalOpen(false)} className="border border-[#BF9863] px-4 py-2 w-24 h-10 rounded" >
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
                {groupedAudits[auditPopupOpen]?.map((entry) => {
                  const getNameById = (options, id, key = "value") =>
                    options.find(opt => opt.id === id)?.[key] || "-";
                  const oldTotal = entry.old_quantity * entry.old_amount;
                  const newTotal = entry.new_quantity * entry.new_amount;
                  return (
                    <tr key={entry.id} className="border-b">
                      <td className="p-2 border">{entry.edited_by}</td>
                      {(() => {
                        const oldVal = getNameById(poItemName, entry.old_item_id);
                        const newVal = getNameById(poItemName, entry.new_item_id);
                        const changed = entry.old_item_id !== entry.new_item_id;
                        return (
                          <td className={`p-2 border ${changed ? "bg-yellow-100 text-red-600 font-semibold" : ""}`}
                            title={changed ? `Previous: ${oldVal} → Current: ${newVal}` : ""}
                          >
                            {oldVal}
                          </td>
                        );
                      })()}
                      {(() => {
                        const oldVal = getNameById(categoryOptions, entry.old_category_id);
                        const newVal = getNameById(categoryOptions, entry.new_category_id);
                        const changed = entry.old_category_id !== entry.new_category_id;
                        return (
                          <td className={`p-2 border ${changed ? "bg-yellow-100 text-red-600 font-semibold" : ""}`}
                            title={changed ? `Previous: ${oldVal} → Current: ${newVal}` : ""}
                          >
                            {oldVal}
                          </td>
                        );
                      })()}
                      {(() => {
                        const oldVal = getNameById(modelOptions, entry.old_model_id);
                        const newVal = getNameById(modelOptions, entry.new_model_id);
                        const changed = entry.old_model_id !== entry.new_model_id;
                        return (
                          <td className={`p-2 border ${changed ? "bg-yellow-100 text-red-600 font-semibold" : ""}`}
                            title={changed ? `Previous: ${oldVal} → Current: ${newVal}` : ""}
                          >
                            {oldVal}
                          </td>
                        );
                      })()}
                      {(() => {
                        const oldVal = getNameById(brandOptions, entry.old_brand_id);
                        const newVal = getNameById(brandOptions, entry.new_brand_id);
                        const changed = entry.old_brand_id !== entry.new_brand_id;
                        return (
                          <td className={`p-2 border ${changed ? "bg-yellow-100 text-red-600 font-semibold" : ""}`}
                            title={changed ? `Previous: ${oldVal} → Current: ${newVal}` : ""}
                          >
                            {oldVal}
                          </td>
                        );
                      })()}
                      {(() => {
                        const oldVal = getNameById(typeOptions, entry.old_type_id);
                        const newVal = getNameById(typeOptions, entry.new_type_id);
                        const changed = entry.old_type_id !== entry.new_type_id;
                        return (
                          <td className={`p-2 border ${changed ? "bg-yellow-100 text-red-600 font-semibold" : ""}`}
                            title={changed ? `Previous: ${oldVal} → Current: ${newVal}` : ""}
                          >
                            {oldVal}
                          </td>
                        );
                      })()}
                      {(() => {
                        const oldVal = entry.old_quantity;
                        const newVal = entry.new_quantity;
                        const changed = oldVal !== newVal;
                        return (
                          <td className={`p-2 border ${changed ? "bg-yellow-100 text-red-600 font-semibold" : ""}`}
                            title={changed ? `Previous: ${oldVal} → Current: ${newVal}` : ""}
                          >
                            {oldVal}
                          </td>
                        );
                      })()}
                      {(() => {
                        const oldVal = entry.old_amount;
                        const newVal = entry.new_amount;
                        const changed = oldVal !== newVal;
                        return (
                          <td className={`p-2 border ${changed ? "bg-yellow-100 text-red-600 font-semibold" : ""}`}
                            title={changed ? `Previous: ${oldVal} → Current: ${newVal}` : ""}
                          >
                            {oldVal}
                          </td>
                        );
                      })()}
                      {(() => {
                        const changed = oldTotal !== newTotal;
                        return (
                          <td className={`p-2 border ${changed ? "bg-yellow-100 text-red-600 font-semibold" : ""}`}
                            title={changed ? `Previous: ${oldTotal} → Current: ${newTotal}` : ""}
                          >
                            {oldTotal}
                          </td>
                        );
                      })()}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button onClick={() => setAuditPopupOpen(null)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
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
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}