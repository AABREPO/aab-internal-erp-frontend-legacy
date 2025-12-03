import React, { useState, useEffect } from "react";
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const Summary = ({ username, userRoles = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const year = previousMonth.getFullYear();
    const month = `${previousMonth.getMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
  });
  const [paymentModeOptions, setPaymentModeOptions] = useState([]);
  const [rentForms, setRentForms] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTypes, setSelectedTypes] = useState("");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [dateRangeTotal, setDateRangeTotal] = useState(0);
  const [filteredByPaymentModeTotal, setFilteredByPaymentModeTotal] = useState(0);
  const [selectedPaymentModeMonth, setSelectedPaymentModeMonth] = useState("");
  const [monthTotal, setMonthTotal] = useState(0);
  const [filteredMonthTotal, setFilteredMonthTotal] = useState(0);
  const [shopNoIdToShopNoMap, setShopNoIdToShopNoMap] = useState({});
  const [tenantNameIdToTenantNameMap, setTenantNameIdToTenantNameMap] = useState({});
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const day = `${date.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    setFromDate(formatDate(firstDayOfMonth));
    setToDate(formatDate(today));
  }, []);
  useEffect(() => {
    fetchProjects();
    fetchTenants();
  }, []);
  useEffect(() => {
    axios
      .get('https://backendaab.in/aabuildersDash/api/rental_forms/getAll')
      .then((response) => {
        const sortedExpenses = response.data.sort((a, b) => {
          const enoA = parseInt(a.eno, 10);
          const enoB = parseInt(b.eno, 10);
          return enoB - enoA;
        });
        setRentForms(sortedExpenses);
      })
      .catch((error) => {
        console.error('Error fetching expenses:', error);
      });
  }, []);
  useEffect(() => {
    fetchPaymentModes();
  }, []);
  const fetchProjects = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/getAll');
      if (response.ok) {
        const data = await response.json();
        const ownProjects = Array.isArray(data)
          ? data.filter(p => (p.projectCategory || '').toLowerCase() === 'own project')
          : [];
        const shopNoIdMap = {};
        ownProjects
          .filter(project => project.projectReferenceName)
          .forEach(project => {
            const propertyDetailsArray = Array.isArray(project.propertyDetails)
              ? project.propertyDetails
              : Array.from(project.propertyDetails || []);
            propertyDetailsArray.forEach(detail => {
              if (detail.shopNo && detail.id) {
                shopNoIdMap[detail.id] = detail.shopNo;
              }
            });
          });
        setShopNoIdToShopNoMap(shopNoIdMap);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };
  const fetchTenants = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/tenant_link_shop/getAll');
      if (response.ok) {
        const data = await response.json();
        const tenantNameIdMap = {};
        data.forEach(tenant => {
          if (tenant.id && tenant.tenantName) {
            tenantNameIdMap[tenant.id] = tenant.tenantName;
          }
        });
        setTenantNameIdToTenantNameMap(tenantNameIdMap);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };
  const fetchPaymentModes = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/payment_mode/getAll');
      if (response.ok) {
        const data = await response.json();
        setPaymentModeOptions(data);
      }
    } catch (error) {
      console.error('Error fetching payment modes:', error);
    }
  };
  useEffect(() => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const dateFiltered = rentForms.filter(entry => {
        if (!entry.paidOnDate) return false;
        let entryDate;
        if (entry.paidOnDate.includes('-') && entry.paidOnDate.split('-')[0].length === 2) {
          const [day, month, year] = entry.paidOnDate.split('-');
          entryDate = new Date(year, month - 1, day);
        } else {
          entryDate = new Date(entry.paidOnDate);
        }
        return entryDate >= from && entryDate <= to;
      });
      const total = dateFiltered.reduce(
        (sum, curr) => sum + parseFloat(curr.amount || 0),
        0
      );
      setDateRangeTotal(total);
      let refinedFiltered = [...dateFiltered];
      if (selectedTypes) {
        refinedFiltered = refinedFiltered.filter(
          entry => entry.formType === selectedTypes
        );
      }
      if (selectedPaymentMode) {
        refinedFiltered = refinedFiltered.filter(
          entry => entry.paymentMode === selectedPaymentMode
        );
      }
      const filteredTotal = refinedFiltered.reduce(
        (sum, curr) => sum + parseFloat(curr.amount || 0),
        0
      );
      setFilteredByPaymentModeTotal(filteredTotal);
    }
  }, [fromDate, toDate, selectedPaymentMode, selectedTypes, rentForms]);
  useEffect(() => {
    if (selectedMonth) {
      const monthFiltered = rentForms.filter(
        entry => entry.forTheMonthOf === selectedMonth
      );
      const total = monthFiltered.reduce(
        (sum, curr) => sum + parseFloat(curr.amount || 0),
        0
      );
      setMonthTotal(total);
      let refinedFiltered = monthFiltered;
      if (selectedType) {
        refinedFiltered = refinedFiltered.filter(
          entry => entry.formType === selectedType
        );
      }
      if (selectedPaymentModeMonth) {
        refinedFiltered = refinedFiltered.filter(
          entry => entry.paymentMode === selectedPaymentModeMonth
        );
      }
      const filteredTotal = refinedFiltered.reduce(
        (sum, curr) => sum + parseFloat(curr.amount || 0),
        0
      );
      setFilteredMonthTotal(filteredTotal);
    }
  }, [selectedMonth, selectedType, selectedPaymentModeMonth, rentForms]);
  const formatMonth = (dateInput) => {
    const date = new Date(dateInput);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const pad = num => String(num).padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const pad = num => String(num).padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const formatDateOnly = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
      return dateString.replace(/-/g, '/');
    }
    if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
      const parts = dateString.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };
  const getPreviousMonth = (dateStr) => {
    const date = new Date(dateStr);
    date.setMonth(date.getMonth() - 1);
    return date;
  };
  const formatINRPlain = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const toYearMonthString = (value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };
  const adjustYearMonth = (yearMonthStr, offsetMonths = 0) => {
    if (!yearMonthStr) return null;
    const [year, month] = yearMonthStr.split('-').map(Number);
    if (Number.isNaN(year) || Number.isNaN(month)) return null;
    const date = new Date(year, month - 1 + offsetMonths, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };
  const parsePaidOnDate = (dateString) => {
    if (!dateString) return null;
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 2) {
          const [day, month, year] = parts;
          return new Date(year, month - 1, day);
        }
        if (parts[0].length === 4) {
          const [year, month, day] = parts;
          return new Date(year, month - 1, day);
        }
      }
    }
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  };
  const getEntryAmountValue = (entry) => {
    const refundTypes = ['Shop Closure', 'Refund'];
    const isRefundType = refundTypes.includes(entry.formType);
    const baseAmount = Number(
      (isRefundType ? (entry.refundAmount ?? entry.amount) : entry.amount) || 0
    );
    return isRefundType ? -baseAmount : baseAmount;
  };
  const exportDateRangePDF = () => {
    if (!fromDate || !toDate) {
      alert('Please select the start date and end date.');
      return;
    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const dataToUse = rentForms.filter(entry => {
      const entryDate = parsePaidOnDate(entry.paidOnDate);
      if (!entryDate) return false;
      const inRange = entryDate >= from && entryDate <= to;
      const matchType = selectedTypes ? entry.formType === selectedTypes : true;
      const matchMode = selectedPaymentMode ? entry.paymentMode === selectedPaymentMode : true;
      return inRange && matchType && matchMode;
    });
    if (dataToUse.length === 0) {
      alert('No data found for the selected date range and filters.');
      return;
    }
    const mappedData = dataToUse.map(entry => {
      const shopNo = entry.shopNoId ? (shopNoIdToShopNoMap[entry.shopNoId] || entry.shopNo) : entry.shopNo;
      const tenantName = entry.tenantNameId ? (tenantNameIdToTenantNameMap[entry.tenantNameId] || entry.tenantName) : entry.tenantName;
      return {
        ...entry,
        shopNo: shopNo,
        tenantName: tenantName
      };
    });
    const previousMonthStr = formatMonth(getPreviousMonth(fromDate));
    const totalPreviousMonthAmount = mappedData
      .filter(entry => entry.forTheMonthOf && formatMonth(entry.forTheMonthOf) === previousMonthStr)
      .reduce((sum, entry) => sum + getEntryAmountValue(entry), 0);
    mappedData.sort((a, b) => a.shopNo.localeCompare(b.shopNo, undefined, { numeric: true }));
    let totalCash = 0;
    let totalNetBanking = 0;
    mappedData.forEach((entry) => {
      const amountValue = getEntryAmountValue(entry);
      if (entry.paymentMode === 'Cash') {
        totalCash += amountValue;
      }
      if (entry.paymentMode === 'Net Banking') {
        totalNetBanking += amountValue;
      }
    });
    const totalAmount = totalCash + totalNetBanking;
    const doc = new jsPDF('landscape');
    doc.setFontSize(11);
    const startX = 14;
    const startY = 15;
    const rowHeight = 12;
    doc.rect(startX, startY, 15, rowHeight);
    doc.rect(startX + 15, startY, 25, rowHeight);
    doc.rect(startX + 40, startY, 100, rowHeight * 2);
    doc.rect(startX + 40, startY, 22, rowHeight * 2);
    doc.rect(startX + 140, startY, 22, rowHeight);
    doc.rect(startX + 162, startY, 22, rowHeight);
    doc.rect(startX + 184, startY, 36, rowHeight);
    doc.rect(startX + 220, startY, 28, rowHeight);
    doc.rect(startX + 248, startY, 21, rowHeight);
    doc.rect(startX, startY + rowHeight, 15, rowHeight);
    doc.rect(startX + 15, startY + rowHeight, 25, rowHeight);
    doc.rect(startX + 140, startY + rowHeight, 22, rowHeight);
    doc.rect(startX + 162, startY + rowHeight, 22, rowHeight);
    doc.rect(startX + 184, startY + rowHeight, 36, rowHeight);
    doc.rect(startX + 220, startY + rowHeight, 28, rowHeight);
    doc.rect(startX + 248, startY + rowHeight, 21, rowHeight);
    doc.rect(startX + 40, startY + rowHeight, 100, rowHeight);
    doc.rect(startX + 40, startY + rowHeight, 22, rowHeight);
    doc.setFontSize(10);
    doc.text('PROPERTY RENT COLLECTION STATEMENT', 77, 23);
    doc.setFontSize(9);
    doc.text(`MONTH `, 16, 23);
    doc.setFontSize(10);
    const previousMonthDate = getPreviousMonth(fromDate);
    doc.text(`${formatMonth(previousMonthDate)}`, 30, 23);
    doc.setFontSize(9);
    doc.text(`DATE`, 18, 33);
    doc.setFontSize(12);
    doc.text(`${formatDate(new Date())}`, 32, 33);
    doc.setFontSize(9);
    doc.text(`VACANT`, 57, 32);
    doc.text(`SHOPS:`, 57, 36);
    doc.setFontSize(10);
    doc.text(`Rs.${formatINRPlain(totalPreviousMonthAmount)}`, 54.5, 23);
    doc.setFontSize(8);
    doc.text(`CASH`, 155, 23);
    doc.setFontSize(11);
    doc.text(`${formatINRPlain(totalCash)}`, 155, 33);
    doc.setFontSize(8);
    doc.text(`NET BANKING `, 177, 23);
    doc.setFontSize(11);
    doc.text(`${formatINRPlain(totalNetBanking)}`, 178, 33);
    doc.setFontSize(8);
    doc.text(`TOTAL RENT COLLECTED`, 198, 20);
    doc.text(`IN THIS MONTH`, 206, 25);
    doc.setFontSize(11);
    doc.text(`${formatINRPlain(totalAmount)}`, 205, 33);
    doc.setFontSize(8);
    doc.text(`COLLECTION `, 243, 20);
    doc.text(`START DATE:`, 243, 25);
    doc.setFontSize(11);
    doc.text(`${formatDate(fromDate)}`, 262.5, 24);
    doc.setFontSize(8);
    doc.text(`COLLECTION END `, 236, 32);
    doc.text(` DATE:`, 252, 36);
    doc.setFontSize(11);
    doc.text(`${formatDate(toDate)}`, 262.5, 33);
    const tableColumn = ['S.No', 'Date', 'Shop No', 'Tenant Name', 'Amount', 'Form Type', 'Paid On', 'For The Month Of', 'Mode', 'Eno'];
    const tableRows = mappedData.map((entry, index) => [
      index + 1,      
      formatDateTime(entry.timestamp),
      entry.shopNo,
      entry.tenantName,
      formatINRPlain(getEntryAmountValue(entry)),
      entry.formType,
      formatDateOnly(entry.paidOnDate),
      entry.forTheMonthOf ? formatMonth(entry.forTheMonthOf) : '',
      entry.paymentMode,
      entry.eno || entry.entryNo || '',
    ]);
    autoTable(doc, {
      startY: 39.2,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: false,
        textColor: 0,
        halign: 'center',
      },
      willDrawCell: function (data) {
        if (data.section === 'head' && data.column.index === 0) {
          const doc = data.doc;
          const y = data.cell.y;
          const h = data.cell.height;
          const firstCell = data.row.cells[0];
          const leftX = firstCell.x;
          const rightX = leftX + data.table.columns.reduce((acc, col) => acc + col.width, 0);
          doc.setDrawColor(0);
          doc.setLineWidth(0.3);
          doc.line(leftX, y, leftX, y + h);
          doc.line(rightX, y, rightX, y + h); 
          doc.line(leftX, y, rightX, y);
        }
      }
    });
    doc.save('transactions_by_date_range.pdf');
  };
  const exportExportExcel = () => {
    if (!fromDate || !toDate) {
      alert("Please select the start date and end date.");
      return;
    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const dataToUse = rentForms.filter(entry => {
      const entryDate = parsePaidOnDate(entry.paidOnDate);
      if (!entryDate) return false;
      const inRange = entryDate >= from && entryDate <= to;
      const matchType = selectedTypes ? entry.formType === selectedTypes : true;
      const matchMode = selectedPaymentMode ? entry.paymentMode === selectedPaymentMode : true;
      return inRange && matchType && matchMode;
    });
    if (dataToUse.length === 0) {
      alert("No data found for the selected date range and filters.");
      return;
    }
    const mappedData = dataToUse.map(entry => {
      const shopNo = entry.shopNoId ? (shopNoIdToShopNoMap[entry.shopNoId] || entry.shopNo) : entry.shopNo;
      const tenantName = entry.tenantNameId ? (tenantNameIdToTenantNameMap[entry.tenantNameId] || entry.tenantName) : entry.tenantName;
      return {
        ...entry,
        shopNo: shopNo,
        tenantName: tenantName
      };
    });
    const previousMonthStr = formatMonth(getPreviousMonth(fromDate));
    const todayDateStr = formatDate(new Date());
    let totalCash = 0;
    let totalNetBanking = 0;
    mappedData.forEach(entry => {
      const amountValue = getEntryAmountValue(entry);
      if (entry.paymentMode === "Cash") totalCash += amountValue;
      if (entry.paymentMode === "Net Banking") totalNetBanking += amountValue;
    });
    const totalAmount = totalCash + totalNetBanking;
    const tableHeaders = [
      "S.No",      
      "Date",
      "Shop No",
      "Tenant Name",
      "Amount",
      "Form Type",
      "Paid On",
      "For The Month Of",
      "Payment Mode",
      "Entry No"
    ];
    const tableRows = mappedData.map((entry, index) => {
      const amountValue = getEntryAmountValue(entry);
      return [
        index + 1,        
        formatDateTime(entry.timestamp),
        entry.shopNo,
        entry.tenantName,
        amountValue.toFixed(2),
        entry.formType,
        formatDateOnly(entry.paidOnDate),
        entry.forTheMonthOf ? formatMonth(entry.forTheMonthOf) : "",
        entry.paymentMode,
        entry.eno || entry.entryNo || ""
      ];
    });
    const summarySection = [
      ["PROPERTY RENT COLLECTION STATEMENT"],
      [],
      ["MONTH", previousMonthStr, "", "", "CASH", totalCash.toFixed(2), "NET BANKING", totalNetBanking.toFixed(2), "TOTAL RENT COLLECTED", totalAmount.toFixed(2)],
      ["DATE", todayDateStr, "", "", "COLLECTION START", formatDate(fromDate), "COLLECTION END", formatDate(toDate)],
      [],
      tableHeaders,
      ...tableRows
    ];
    const csvContent = summarySection
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Rent_Collection_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const exportMonthlyPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(11);
    const startX = 14;
    const startY = 15;
    const rowHeight = 12;
    const targetMonth = selectedMonth ? toYearMonthString(selectedMonth) : null;
    const dataToUse = rentForms.filter(entry => {
      const entryMonth = entry.forTheMonthOf ? toYearMonthString(entry.forTheMonthOf) : null;
      const matchMonth = targetMonth ? entryMonth === targetMonth : true;
      const matchType = selectedType ? entry.formType === selectedType : true;
      const matchMode = selectedPaymentModeMonth ? entry.paymentMode === selectedPaymentModeMonth : true;
      return matchMonth && matchType && matchMode;
    });
    if (dataToUse.length === 0) {
      alert("No data found for the selected filters.");
      return;
    }
    const mappedData = dataToUse.map(entry => {
      const shopNo = entry.shopNoId ? (shopNoIdToShopNoMap[entry.shopNoId] || entry.shopNo) : entry.shopNo;
      const tenantName = entry.tenantNameId ? (tenantNameIdToTenantNameMap[entry.tenantNameId] || entry.tenantName) : entry.tenantName;
      return {
        ...entry,
        shopNo: shopNo,
        tenantName: tenantName
      };
    });
    let totalCash = 0;
    let totalNetBanking = 0;
    mappedData.forEach((entry) => {
      const amountValue = getEntryAmountValue(entry);
      if (entry.paymentMode === 'Cash') {
        totalCash += amountValue;
      }
      if (entry.paymentMode === 'Net Banking') {
        totalNetBanking += amountValue;
      }
    });
    const totalAmount = totalCash + totalNetBanking;
    mappedData.sort((a, b) => a.shopNo.localeCompare(b.shopNo, undefined, { numeric: true }));
    doc.rect(startX, startY, 15, rowHeight);
    doc.rect(startX + 15, startY, 25, rowHeight);
    doc.rect(startX + 40, startY, 100, rowHeight * 2);
    doc.rect(startX + 40, startY, 22, rowHeight * 2);
    doc.rect(startX + 140, startY, 22, rowHeight);
    doc.rect(startX + 162, startY, 22, rowHeight);
    doc.rect(startX + 184, startY, 36, rowHeight);
    doc.rect(startX + 220, startY, 28, rowHeight);
    doc.rect(startX + 248, startY, 21, rowHeight);
    doc.rect(startX, startY + rowHeight, 15, rowHeight);
    doc.rect(startX + 15, startY + rowHeight, 25, rowHeight);
    doc.rect(startX + 140, startY + rowHeight, 22, rowHeight);
    doc.rect(startX + 162, startY + rowHeight, 22, rowHeight);
    doc.rect(startX + 184, startY + rowHeight, 36, rowHeight);
    doc.rect(startX + 220, startY + rowHeight, 28, rowHeight);
    doc.rect(startX + 248, startY + rowHeight, 21, rowHeight);
    doc.rect(startX + 40, startY + rowHeight, 100, rowHeight);
    doc.rect(startX + 40, startY + rowHeight, 22, rowHeight);
    doc.setFontSize(10);
    doc.text('PROPERTY RENT COLLECTION STATEMENT', 77, 23);
    doc.setFontSize(9);
    doc.text(`MONTH `, 16, 23);
    doc.setFontSize(10);
    doc.text(`${formatMonth(selectedMonth)}`, 30, 23);
    doc.setFontSize(9);
    doc.text(`DATE`, 18, 33);
    doc.setFontSize(12);
    doc.text(`${formatDate(new Date())}`, 32, 33);
    doc.setFontSize(9);
    doc.text(`VACANT`, 57, 32);
    doc.text(`SHOPS:`, 57, 36);
    doc.setFontSize(10);
    doc.text(`Rs.${formatINRPlain(totalAmount)}`, 54.5, 23);
    doc.setFontSize(8);
    doc.text(`CASH`, 155, 23);
    doc.setFontSize(11);
    doc.text(`${formatINRPlain(totalCash)}`, 155, 33);
    doc.setFontSize(8);
    doc.text(`NET BANKING `, 177, 23);
    doc.setFontSize(11);
    doc.text(`${formatINRPlain(totalNetBanking)}`, 178, 33);
    doc.setFontSize(8);
    doc.text(`TOTAL RENT COLLECTED`, 198, 20);
    doc.text(`IN THIS MONTH`, 206, 25);
    doc.setFontSize(11);
    doc.text(`${formatINRPlain(totalAmount)}`, 205, 33);
    doc.setFontSize(8);
    doc.text(`COLLECTION `, 243, 20);
    doc.text(`START DATE:`, 243, 25);
    doc.setFontSize(11);
    doc.text(``, 262.5, 24);
    doc.setFontSize(8);
    doc.text(`COLLECTION END `, 236, 32);
    doc.text(` DATE:`, 252, 36);
    doc.setFontSize(11);
    doc.text(``, 262.5, 33);
    const tableColumn = ['S.No', 'Date', 'Shop No', 'Tenant Name', 'Amount', 'Form Type', 'Paid On', 'For The Month Of', 'Mode', 'Eno'];
    const tableRows = mappedData.map((entry, index) => [
      index + 1,      
      formatDateTime(entry.timestamp),
      entry.shopNo,
      entry.tenantName,
      formatINRPlain(getEntryAmountValue(entry)),
      entry.formType,
      formatDateOnly(entry.paidOnDate),
      entry.forTheMonthOf ? formatMonth(entry.forTheMonthOf) : '',
      entry.paymentMode,
      entry.eno || entry.entryNo || '',
    ]);
    autoTable(doc, {
      startY: 39.2,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: false,
        textColor: 0,
        halign: 'center',
      },
      willDrawCell: function (data) {
        if (data.section === 'head' && data.column.index === 0) {
          const doc = data.doc;
          const y = data.cell.y;
          const h = data.cell.height;
          const firstCell = data.row.cells[0];
          const leftX = firstCell.x;
          const rightX = leftX + data.table.columns.reduce((acc, col) => acc + col.width, 0);
          doc.setDrawColor(0);
          doc.setLineWidth(0.3);
          doc.line(leftX, y, leftX, y + h);
          doc.line(rightX, y, rightX, y + h); 
          doc.line(leftX, y, rightX, y);
        }
      }
    });
    doc.save('transactions_by_month.pdf');
  };
  const exportExportMonthlyExcel = () => {
    const targetMonth = selectedMonth ? toYearMonthString(selectedMonth) : null;
    const dataToUse = rentForms.filter(entry => {
      const entryMonth = entry.forTheMonthOf ? toYearMonthString(entry.forTheMonthOf) : null;
      const matchMonth = targetMonth ? entryMonth === targetMonth : true;
      const matchType = selectedType ? entry.formType === selectedType : true;
      const matchMode = selectedPaymentModeMonth ? entry.paymentMode === selectedPaymentModeMonth : true;
      return matchMonth && matchType && matchMode;
    });
    if (dataToUse.length === 0) {
      alert("No data found for the selected filters.");
      return;
    }
    const mappedData = dataToUse.map(entry => {
      const shopNo = entry.shopNoId ? (shopNoIdToShopNoMap[entry.shopNoId] || entry.shopNo) : entry.shopNo;
      const tenantName = entry.tenantNameId ? (tenantNameIdToTenantNameMap[entry.tenantNameId] || entry.tenantName) : entry.tenantName;
      return {
        ...entry,
        shopNo: shopNo,
        tenantName: tenantName
      };
    });
    let totalCash = 0;
    let totalNetBanking = 0;
    mappedData.forEach(entry => {
      const amountValue = getEntryAmountValue(entry);
      if (entry.paymentMode === "Cash") totalCash += amountValue;
      if (entry.paymentMode === "Net Banking") totalNetBanking += amountValue;
    });
    const totalAmount = totalCash + totalNetBanking;
    mappedData.sort((a, b) => a.shopNo.localeCompare(b.shopNo, undefined, { numeric: true }));
    const summaryHeader = [
      ["PROPERTY RENT COLLECTION STATEMENT"],
      [],
      ["MONTH", formatMonth(selectedMonth), "", "", "CASH", totalCash.toFixed(2), "NET BANKING", totalNetBanking.toFixed(2), "TOTAL RENT COLLECTED", totalAmount.toFixed(2)],
      ["DATE", formatDate(new Date()), "", "", "COLLECTION START", "", "COLLECTION END", ""],
      [],
    ];
    const tableHeaders = ['S.No', 'Date', 'Shop No', 'Tenant Name', 'Amount', 'Form Type', 'Paid On', 'For The Month Of', 'Mode', 'Entry No'];
    const tableRows = mappedData.map((entry, index) => {
      const amount = getEntryAmountValue(entry);
      return [
        index + 1,        
        formatDateTime(entry.timestamp),
        entry.shopNo,
        entry.tenantName,
        amount.toFixed(2),
        entry.formType,
        formatDateOnly(entry.paidOnDate),
        entry.forTheMonthOf ? formatMonth(entry.forTheMonthOf) : '',
        entry.paymentMode,
        entry.eno || entry.entryNo || '',
      ];
    });
    const allRows = [...summaryHeader, tableHeaders, ...tableRows];
    const csvContent = allRows
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Monthly_Rent_Collection.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const generateMissedReport = async () => {
    if (!selectedMonth) {
      alert('Please select a month first.');
      return;
    }
    // Parse selectedMonth (format: "YYYY-MM") to get year and month
    const [year, month] = selectedMonth.split('-').map(Number);
    if (!year || !month || month < 1 || month > 12) {
      alert('Invalid month selected. Please select a valid month.');
      return;
    }
    setIsGeneratingReport(true);
    try {
      const response = await axios.post(
        'https://backendaab.in/aabuildersDash/api/rental_forms/generate-missed-report',
        null,
        {
          params: {
            year: year,
            month: month
          }
        }
      );
      if (response.status === 200) {
        alert(`Success: ${response.data}`);
        // Optionally refresh the rent forms data
        const refreshResponse = await axios.get('https://backendaab.in/aabuildersDash/api/rental_forms/getAll');
        if (refreshResponse.data) {
          const sortedExpenses = refreshResponse.data.sort((a, b) => {
            const enoA = parseInt(a.eno, 10);
            const enoB = parseInt(b.eno, 10);
            return enoB - enoA;
          });
          setRentForms(sortedExpenses);
        }
      }
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        alert(`Error: ${error.response.data || error.response.statusText || 'Failed to generate report'}`);
      } else if (error.request) {
        // Request was made but no response received
        alert('Error: No response from server. Please check your connection.');
      } else {
        // Something else happened
        alert(`Error: ${error.message}`);
      }
      console.error('Error generating missed report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };
  return (
    <div className="flex justify-start p-10 ml-10 mr-10 h-[750px] bg-[#FFFFFF]">
      <div className="lg:flex gap-10 ml-3">
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h2 className="text-lg font-bold">Date to Date Transaction</h2>
            <div className="flex gap-3">
              <button className="text-[#007233] text-sm font-semibold hover:underline cursor-pointer flex items-center" onClick={exportExportExcel}>
                Export XL
              </button>
              <button className="text-red-500 text-sm font-semibold hover:underline cursor-pointer flex items-center" onClick={exportDateRangePDF}>
                Export PDF
              </button>
            </div>
          </div>
          <div className="bg-[#FAF6ED] p-6 rounded shadow-md lg:w-[478px] h-[325px]">
            <div className="grid grid-cols-2 gap-4">
              <div className='text-left'>
                <label className="text-base font-bold">From Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border-2 border-opacity-[0.22] focus:outline-none border-[#BF9853] p-2 rounded-lg lg:w-[168px] w-[120px] mt-3 h-[45px]"
                  />
                </div>
              </div>
              <div className='text-left'>
                <label className="text-base font-bold">To Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="border-2 border-opacity-[0.22] focus:outline-none border-[#BF9853] p-2 rounded-lg lg:w-[168px] w-[120px] mt-3 h-[45px]"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 text-left">
              <label className="text-base font-bold">Amount</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    (selectedTypes || selectedPaymentMode)
                      ? new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 2,
                      }).format(filteredByPaymentModeTotal)
                      : ""
                  }
                  className="border-2 border-opacity-[0.22] focus:outline-none border-[#BF9853] p-2 rounded-lg w-[150px] mt-3 h-[45px]"
                />
                <select
                  value={selectedPaymentMode}
                  onChange={(e) => setSelectedPaymentMode(e.target.value)}
                  className="border-2 border-opacity-[0.22] text-sm font-semibold focus:outline-none border-[#BF9853] p-2 rounded-lg w-[136px] mt-3 h-[45px]">
                  <option value="">Select Mode</option>
                  {paymentModeOptions.map((mode, index) => (
                    <option key={index}>{mode.modeOfPayment}</option>
                  ))}
                </select>
                <select
                  className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 mt-3 w-[170px] h-[45px]"
                  value={selectedTypes}
                  onChange={(e) => setSelectedTypes(e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="Rent">Rent</option>
                  <option value="Advance">Advance</option>
                  <option value="Shop Closure">Shop Closure</option>
                  <option value="Refund">Refund</option>
                  <option value="Pending Rent">Pending Rent</option>
                </select>
              </div>
            </div>
            <div className="mt-4 text-left">
              <label className="text-base font-bold block">Total Amount</label>
              <input
                type="text"
                readOnly
                value={
                  dateRangeTotal
                    ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 2,
                    }).format(dateRangeTotal)
                    : ''
                }
                className="border-2 border-opacity-[0.22] border-[#BF9853] p-2 rounded-lg mt-3 w-[201px] h-[45px] focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h2 className="text-lg ml-6 font-bold text-left">Rent Month Transaction</h2>
            <div className="flex gap-3">
              {username === "Mahalingam M" && (
                <button 
                  className="text-blue-600 text-sm font-semibold hover:underline cursor-pointer flex items-center disabled:opacity-50 disabled:cursor-not-allowed" 
                  onClick={generateMissedReport}
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                </button>
              )}
              <button className="text-[#007233] text-sm font-semibold hover:underline cursor-pointer flex items-center" onClick={exportExportMonthlyExcel} >
                Export XL
              </button>
              <button className="text-red-500 text-sm font-semibold hover:underline cursor-pointer flex items-center" onClick={exportMonthlyPDF} >
                Export PDF
              </button>
            </div>
          </div>
          <div className="bg-[#FAF6ED] p-6 ml-6 rounded shadow-md w-[478px] h-[325px]">
            <div className="flex flex-col gap-4 text-left">
              <label className="text-base font-bold">Rent for</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 w-[170px] h-[45px]"
              />
              <label className="text-base font-bold">Amount</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    (selectedPaymentModeMonth || selectedType)
                      ? new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 2,
                      }).format(filteredMonthTotal)
                      : ''
                  }
                  className="border-2 border-opacity-[0.22] border-[#BF9853] p-2 rounded-lg w-[150px] h-[45px] focus:outline-none"
                />
                <select value={selectedPaymentModeMonth} onChange={(e) => setSelectedPaymentModeMonth(e.target.value)}
                  className="border-2 border-opacity-[0.22] font-semibold border-[#BF9853] p-2 rounded-lg text-sm w-[136px] h-[45px] focus:outline-none"
                >
                  <option value="">Select Mode</option>
                  {paymentModeOptions.map((mode, index) => (
                    <option key={index} value={mode.modeOfPayment}>
                      {mode.modeOfPayment}
                    </option>
                  ))}
                </select>
                <select
                  className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 w-[170px] h-[45px]"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Rent">Rent</option>
                  <option value="Advance">Advance</option>
                  <option value="Shop Closure">Shop Closure</option>
                  <option value="Refund">Refund</option>
                  <option value="Pending Rent">Pending Rent</option>
                </select>
              </div>
              <label className="text-base mt-[-4px] font-bold">Total Amount</label>
              <input
                type="text"
                readOnly
                value={
                  monthTotal
                    ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 2,
                    }).format(monthTotal)
                    : ''
                }
                className="border-2 border-opacity-[0.22] mt-[-5px] focus:outline-none border-[#BF9853] p-2 rounded-lg w-[201px] h-[45px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Summary;