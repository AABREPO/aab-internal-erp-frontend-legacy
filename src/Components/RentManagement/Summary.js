import React, { useState, useEffect } from "react";
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const Summary = () => {
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
      // Filter entries within the selected date range
      const dateFiltered = rentForms.filter(entry => {
        const entryDate = new Date(entry.paidOnDate);
        return entryDate >= from && entryDate <= to;
      });
      // Calculate total for date range only
      const total = dateFiltered.reduce(
        (sum, curr) => sum + parseFloat(curr.amount || 0),
        0
      );
      setDateRangeTotal(total);
      // Now refine by selected type and/or payment mode
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
      // Filter all entries for the selected month using 'forTheMonthOf'
      const monthFiltered = rentForms.filter(
        entry => entry.forTheMonthOf === selectedMonth
      );

      // Set total for the whole month (regardless of filters)
      const total = monthFiltered.reduce(
        (sum, curr) => sum + parseFloat(curr.amount || 0),
        0
      );
      setMonthTotal(total);

      // Now filter by selectedType and/or selectedPaymentModeMonth
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

      // Calculate filtered total
      const filteredTotal = refinedFiltered.reduce(
        (sum, curr) => sum + parseFloat(curr.amount || 0),
        0
      );
      setFilteredMonthTotal(filteredTotal);
    }
  }, [selectedMonth, selectedType, selectedPaymentModeMonth, rentForms]);
  const formatMonth = (dateInput) => {
    const date = new Date(dateInput);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' }); // Example: "May 2025"
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

  const exportDateRangePDF = () => {
    if (!fromDate || !toDate) {
      alert('Please select the start date and end date.');
      return;
    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const dataToUse = rentForms.filter(entry => {
      const entryDate = new Date(entry.paidOnDate);
      const inRange = entryDate >= from && entryDate <= to;
      const matchType = selectedTypes ? entry.formType === selectedTypes : true;
      const matchMode = selectedPaymentMode ? entry.paymentMode === selectedPaymentMode : true;
      return inRange && matchType && matchMode;
    });
    console.log(rentForms)
    if (dataToUse.length === 0) {
      alert('No data found for the selected date range and filters.');
      return;
    }
    const previousMonthStr = formatMonth(getPreviousMonth(fromDate)); // e.g., "May 2025"

    const totalPreviousMonthAmount = dataToUse
      .filter(entry => formatMonth(entry.forTheMonthOf) === previousMonthStr)
      .reduce((sum, entry) => {
        const isShopClosure = entry.formType === 'Shop Closure';
        const amount = isShopClosure ? Number(entry.refundAmount || 0) : Number(entry.amount || 0);
        return sum + (isShopClosure ? -amount : amount);
      }, 0);

    // Sort alphabetically by tenant name
    dataToUse.sort((a, b) => a.shopNo.localeCompare(b.shopNo, undefined, { numeric: true }));
    // Calculate totals
    let totalCash = 0;
    let totalNetBanking = 0;

    dataToUse.forEach((entry) => {
      const isShopClosure = entry.formType === 'Shop Closure';
      const amt = isShopClosure ? Number(entry.refundAmount || 0) : Number(entry.amount || 0);

      if (entry.paymentMode === 'Cash') {
        totalCash += isShopClosure ? -amt : amt;
      }

      if (entry.paymentMode === 'Net Banking') {
        totalNetBanking += isShopClosure ? -amt : amt;
      }
    });

    const totalAmount = totalCash + totalNetBanking;

    const doc = new jsPDF('landscape');
    doc.setFontSize(11);
    const startX = 14;
    const startY = 15;
    const rowHeight = 12;
    // Top row: months, title, payment headers
    doc.rect(startX, startY, 15, rowHeight); // "MONTH" label cell------
    doc.rect(startX + 15, startY, 25, rowHeight); // Month value cell-----------
    doc.rect(startX + 40, startY, 100, rowHeight * 2); // "PROPERTY RENT..." (spans 2 rows)--------
    doc.rect(startX + 40, startY, 22, rowHeight * 2);
    doc.rect(startX + 140, startY, 22, rowHeight); // CASH label-----------
    doc.rect(startX + 162, startY, 22, rowHeight); // NET BANKING label
    doc.rect(startX + 184, startY, 36, rowHeight); // TOTAL RENT label
    doc.rect(startX + 220, startY, 28, rowHeight); // COLLECTION START
    doc.rect(startX + 248, startY, 21, rowHeight);
    // Bottom row: date, vacant, values
    doc.rect(startX, startY + rowHeight, 15, rowHeight); // "DATE" label
    doc.rect(startX + 15, startY + rowHeight, 25, rowHeight); // Today's date
    doc.rect(startX + 140, startY + rowHeight, 22, rowHeight); // CASH amount
    doc.rect(startX + 162, startY + rowHeight, 22, rowHeight); // NET BANKING amount
    doc.rect(startX + 184, startY + rowHeight, 36, rowHeight); // TOTAL RENT amount
    doc.rect(startX + 220, startY + rowHeight, 28, rowHeight); // COLLECTION END label
    doc.rect(startX + 248, startY + rowHeight, 21, rowHeight); // END DATE value
    // VACANT SHOP box (under month area)
    doc.rect(startX + 40, startY + rowHeight, 100, rowHeight);
    doc.rect(startX + 40, startY + rowHeight, 22, rowHeight);
    // Main Heading
    doc.setFontSize(10);
    doc.text('PROPERTY RENT COLLECTION STATEMENT', 77, 23);
    // Sub-Headers (inside the bordered box)
    doc.setFontSize(9);
    doc.text(`MONTH `, 16, 23);
    doc.setFontSize(12);
    const previousMonthDate = getPreviousMonth(fromDate);
    doc.text(`${formatMonth(previousMonthDate)}`, 32, 23);
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
    // Table
    const tableColumn = ['S.No', 'Date', 'Shop No', 'Tenant Name', 'Amount', 'Form Type', 'Paid On', 'For The Month Of', 'Mode'];
    const tableRows = dataToUse.map((entry, index) => [
      index + 1,
      formatDateTime(entry.timestamp),
      entry.shopNo,
      entry.tenantName,
      formatINRPlain(entry.formType === 'Shop Closure' ? -entry.refundAmount : entry.amount),
      entry.formType,
      formatDate(entry.paidOnDate),
      entry.forTheMonthOf ? formatMonth(entry.forTheMonthOf) : '',
      entry.paymentMode,
    ]);
    autoTable(doc, {
      startY: 39.2,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: false, // remove background
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
          // Calculate total table width using column widths
          const rightX = leftX + data.table.columns.reduce((acc, col) => acc + col.width, 0);
          doc.setDrawColor(0);
          doc.setLineWidth(0.3);
          // Draw left and right borders for the entire header row
          doc.line(leftX, y, leftX, y + h);     // Left border
          doc.line(rightX, y, rightX, y + h);   // Right border (end of table)
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
      const entryDate = new Date(entry.paidOnDate);
      const inRange = entryDate >= from && entryDate <= to;
      const matchType = selectedTypes ? entry.formType === selectedTypes : true;
      const matchMode = selectedPaymentMode ? entry.paymentMode === selectedPaymentMode : true;
      return inRange && matchType && matchMode;
    });

    if (dataToUse.length === 0) {
      alert("No data found for the selected date range and filters.");
      return;
    }

    const previousMonthStr = formatMonth(getPreviousMonth(fromDate));
    const todayDateStr = formatDate(new Date());

    // Totals
    let totalCash = 0;
    let totalNetBanking = 0;
    dataToUse.forEach(entry => {
      const isShopClosure = entry.formType === "Shop Closure";
      const amount = isShopClosure ? Number(entry.refundAmount || 0) : Number(entry.amount || 0);
      if (entry.paymentMode === "Cash") totalCash += isShopClosure ? -amount : amount;
      if (entry.paymentMode === "Net Banking") totalNetBanking += isShopClosure ? -amount : amount;
    });
    const totalAmount = totalCash + totalNetBanking;

    // Table header
    const tableHeaders = [
      "S.No",
      "Date",
      "Shop No",
      "Tenant Name",
      "Amount",
      "Form Type",
      "Paid On",
      "For The Month Of",
      "Payment Mode"
    ];

    const tableRows = dataToUse.map((entry, index) => {
      const amountValue = entry.formType === "Shop Closure"
        ? -Number(entry.refundAmount || 0)
        : Number(entry.amount || 0);
      return [
        index + 1,
        formatDateTime(entry.timestamp),
        entry.shopNo,
        entry.tenantName,
        amountValue.toFixed(2),
        entry.formType,
        formatDate(entry.paidOnDate),
        entry.forTheMonthOf ? formatMonth(entry.forTheMonthOf) : "",
        entry.paymentMode
      ];
    });

    // Summary header section
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
    const dataToUse = rentForms.filter(entry => {
      const matchMonth = entry.forTheMonthOf === selectedMonth;
      const matchType = selectedType ? entry.formType === selectedType : true;
      const matchMode = selectedPaymentModeMonth ? entry.paymentMode === selectedPaymentModeMonth : true;
      return matchMonth && matchType && matchMode;
    });

    if (dataToUse.length === 0) {
      alert("No data found for the selected filters.");
      return;
    }

    // Totals
    const totalCash = dataToUse
      .filter(entry => entry.paymentMode === 'Cash')
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    const totalNetBanking = dataToUse
      .filter(entry => entry.paymentMode === 'Net Banking')
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    const totalAmount = totalCash + totalNetBanking;
    dataToUse.sort((a, b) => a.shopNo.localeCompare(b.shopNo, undefined, { numeric: true }));
    // Draw boxes
    doc.rect(startX, startY, 15, rowHeight); // "MONTH"
    doc.rect(startX + 15, startY, 25, rowHeight); // Value
    doc.rect(startX + 40, startY, 104, rowHeight * 2); // Heading
    doc.rect(startX + 40, startY, 26, rowHeight * 2);
    doc.rect(startX + 144, startY, 15, rowHeight); // CASH
    doc.rect(startX + 159, startY, 25, rowHeight); // NET BANKING
    doc.rect(startX + 184, startY, 36, rowHeight); // TOTAL RENT

    doc.rect(startX, startY + rowHeight, 15, rowHeight); // "DATE"
    doc.rect(startX + 15, startY + rowHeight, 25, rowHeight);
    doc.rect(startX + 144, startY + rowHeight, 15, rowHeight);
    doc.rect(startX + 159, startY + rowHeight, 25, rowHeight);
    doc.rect(startX + 184, startY + rowHeight, 36, rowHeight);

    // VACANT (if needed)
    doc.rect(startX + 40, startY + rowHeight, 104, rowHeight);
    doc.rect(startX + 40, startY + rowHeight, 26, rowHeight);
    // Right-hand layout (empty dates but same box structure)
    doc.rect(startX + 220, startY, 28, rowHeight); // COLLECTION START label
    doc.rect(startX + 248, startY, 21, rowHeight); // Empty start date

    doc.rect(startX + 220, startY + rowHeight, 28, rowHeight); // COLLECTION END label
    doc.rect(startX + 248, startY + rowHeight, 21, rowHeight); // Empty end date

    doc.setFontSize(8);
    doc.text(`COLLECTION `, 243, 20);
    doc.text(`START DATE:`, 243, 25);
    doc.setFontSize(11);
    doc.text(``, 262.5, 24); // Leave value blank

    doc.setFontSize(8);
    doc.text(`COLLECTION END`, 236, 32);
    doc.text(`DATE:`, 252, 36);
    doc.setFontSize(11);
    doc.text(``, 262.5, 33); // Leave value blank

    // Text content
    doc.setFontSize(10);
    doc.text('PROPERTY RENT COLLECTION STATEMENT', 81, 23);

    doc.setFontSize(9);
    doc.text(`MONTH`, 16, 23);
    doc.setFontSize(12);
    doc.text(`${formatMonth(selectedMonth)}`, 32, 23);

    doc.setFontSize(9);
    doc.text(`DATE`, 18, 33);
    doc.setFontSize(12);
    doc.text(`${formatDate(new Date())}`, 32, 33);

    doc.setFontSize(9);
    doc.text(`VACANT`, 57, 32);
    doc.text(`SHOPS:`, 57, 36);
    doc.setFontSize(12);
    doc.text(`Rs.${formatINRPlain(totalAmount)}`, 55, 23);
    doc.setFontSize(8);
    doc.text(`CASH`, 161, 23);
    doc.setFontSize(11);
    doc.text(`${formatINRPlain(totalCash)}`, 160, 33);

    doc.setFontSize(8);
    doc.text(`NET BANKING`, 175, 23);
    doc.setFontSize(11);
    doc.text(`${formatINRPlain(totalNetBanking)}`, 180, 33);

    doc.setFontSize(8);
    doc.text(`TOTAL RENT COLLECTED`, 198, 20);
    doc.text(`IN THIS MONTH`, 206, 25);
    doc.setFontSize(11);
    doc.text(`${formatINRPlain(totalAmount)}`, 205, 33);

    // Table
    const tableColumn = ['S.No', 'Date', 'Shop No', 'Tenant Name', 'Amount', 'Form Type', 'Paid On', 'For The Month Of', 'Mode'];
    const tableRows = dataToUse.map((entry, index) => [
      index + 1,
      formatDateTime(entry.timestamp),
      entry.shopNo,
      entry.tenantName,
      formatINRPlain(entry.amount),
      entry.formType,
      formatDate(entry.paidOnDate),
      formatMonth(entry.forTheMonthOf),
      entry.paymentMode,
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
          doc.line(leftX, y, leftX, y + h);     // Left
          doc.line(rightX, y, rightX, y + h);   // Right
        }
      }
    });

    doc.save('transactions_by_month.pdf');
  };
  const exportExportMonthlyExcel = () => {
    const dataToUse = rentForms.filter(entry => {
      const matchMonth = entry.forTheMonthOf === selectedMonth;
      const matchType = selectedType ? entry.formType === selectedType : true;
      const matchMode = selectedPaymentModeMonth ? entry.paymentMode === selectedPaymentModeMonth : true;
      return matchMonth && matchType && matchMode;
    });

    if (dataToUse.length === 0) {
      alert("No data found for the selected filters.");
      return;
    }

    // Totals
    let totalCash = 0;
    let totalNetBanking = 0;
    dataToUse.forEach(entry => {
      const isShopClosure = entry.formType === "Shop Closure";
      const amount = isShopClosure ? Number(entry.refundAmount || 0) : Number(entry.amount || 0);
      if (entry.paymentMode === "Cash") totalCash += isShopClosure ? -amount : amount;
      if (entry.paymentMode === "Net Banking") totalNetBanking += isShopClosure ? -amount : amount;
    });
    const totalAmount = totalCash + totalNetBanking;

    // Sort by Shop No
    dataToUse.sort((a, b) => a.shopNo.localeCompare(b.shopNo, undefined, { numeric: true }));

    // Header block
    const summaryHeader = [
      ["PROPERTY RENT COLLECTION STATEMENT"],
      [],
      ["MONTH", formatMonth(selectedMonth), "", "", "CASH", totalCash.toFixed(2), "NET BANKING", totalNetBanking.toFixed(2), "TOTAL RENT COLLECTED", totalAmount.toFixed(2)],
      ["DATE", formatDate(new Date()), "", "", "COLLECTION START", "", "COLLECTION END", ""],
      [],
    ];

    // Table
    const tableHeaders = ['S.No', 'Date', 'Shop No', 'Tenant Name', 'Amount', 'Form Type', 'Paid On', 'For The Month Of', 'Mode'];
    const tableRows = dataToUse.map((entry, index) => {
      const amount = entry.formType === 'Shop Closure'
        ? -Number(entry.refundAmount || 0)
        : Number(entry.amount || 0);
      return [
        index + 1,
        formatDateTime(entry.timestamp),
        entry.shopNo,
        entry.tenantName,
        amount.toFixed(2),
        entry.formType,
        formatDate(entry.paidOnDate),
        formatMonth(entry.forTheMonthOf),
        entry.paymentMode
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


  return (
    <div className="flex justify-start p-10 ml-12 bg-[#FFFFFF] min-h-screen">
      <div className="lg:flex gap-10 ml-3">
        {/* Transaction Overview */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h2 className="text-lg font-bold">Date to Date Transaction</h2>
            <div className="flex gap-3">
              <button
                className="text-[#007233] text-sm font-semibold hover:underline cursor-pointer flex items-center"
                onClick={exportExportExcel}
              >
                Export XL
              </button>
              <button
                className="text-red-500 text-sm font-semibold hover:underline cursor-pointer flex items-center"
                onClick={exportDateRangePDF}
              >
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
        {/* Month Transaction */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h2 className="text-lg ml-6 font-bold text-left">Rent Month Transaction</h2>
            <div className="flex gap-3">
              <button
                className="text-[#007233] text-sm font-semibold hover:underline cursor-pointer flex items-center"
                onClick={exportExportMonthlyExcel}
              >
                Export XL
              </button>
              <button
                className="text-red-500 text-sm font-semibold hover:underline cursor-pointer flex items-center"
                onClick={exportMonthlyPDF}
              >
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
                <select
                  value={selectedPaymentModeMonth}
                  onChange={(e) => setSelectedPaymentModeMonth(e.target.value)}
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