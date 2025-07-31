import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';
import Select from 'react-select';
import Filter from '../Images/filter (3).png'
import Reload from '../Images/rotate-right.png'
import jsPDF from "jspdf";
import "jspdf-autotable";
import QRCode from '../Images/AAB_QR_CODE.jpeg';
Modal.setAppElement('#root');

const RentDatabase = ({ username, userRoles = [] }) => {
    const [rentForms, setRentForms] = useState([]);
    const [dbShowFilters, setDbShowFilters] = useState(false);
    const [editRentForm, setEditRentForm] = useState(false);
    const [selectedDbDate, setSelectedDbDate] = useState('');
    const [shopNoOption, setShopNoOption] = useState([]);
    const [tenantNameOption, setTenantNameOption] = useState([]);
    const [paymentModeOption, setPaymentModeOption] = useState([]);
    const [formTypeOptions, setFormTypeOptions] = useState([]);
    const [monthOptions, setMonthOptions] = useState([]);
    const [enoOption, setEnoOption] = useState([]);
    const [dbShopNo, setDbShopNo] = useState('');
    const [filteredRentForm, setFilteredRentForm] = useState([]);
    const [dbTenantName, setDbTenantName] = useState('');
    const [dbPaymentMode, setDbPaymentMode] = useState('');
    const [dbFormType, setDbFormType] = useState('');
    const [eno, setEno] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [audits, setAudits] = useState([]);
    const [selectedDbMonth, setSelectedDbMonth] = useState('');
    const [selectedDbENo, setSelectedDbENo] = useState('');
    useEffect(() => {
        const savedSelectedDbDate = sessionStorage.getItem('selectedDbDate');
        const savedDbShopNo = sessionStorage.getItem('dbShopNo')
        const savedSelectedDbMonth = sessionStorage.getItem('selectedDbMonth');
        const savedDbTenantName = sessionStorage.getItem('dbTenantName');
        const savedDbFormType = sessionStorage.getItem('dbFormType');
        const savedDbPaymentMode = sessionStorage.getItem('dbPaymentMode');
        const savedDbEno = sessionStorage.getItem('selectedDbENo');
        const savedDbShowFilter = sessionStorage.getItem('dbShowFilters')
        try {
            if (savedSelectedDbDate) setSelectedDbDate(JSON.parse(savedSelectedDbDate));
            if (savedSelectedDbMonth) setSelectedDbMonth(JSON.parse(savedSelectedDbMonth));
            if (savedDbShopNo) setDbShopNo(JSON.parse(savedDbShopNo));
            if (savedDbTenantName) setDbTenantName(JSON.parse(savedDbTenantName));
            if (savedDbFormType) setDbFormType(JSON.parse(savedDbFormType));
            if (savedDbPaymentMode) setDbPaymentMode(JSON.parse(savedDbPaymentMode));
            if (savedDbEno) setSelectedDbENo(JSON.parse(savedDbEno));
            if (savedDbShowFilter !== null) setDbShowFilters(JSON.parse(savedDbShowFilter));
        } catch (error) {
            console.error("Error parsing sessionStorage data:", error);
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    const handleBeforeUnload = () => {
        sessionStorage.removeItem('selectedDbDate');
        sessionStorage.removeItem('dbShopNo');
        sessionStorage.removeItem('selectedDbMonth');
        sessionStorage.removeItem('dbTenantName');
        sessionStorage.removeItem('dbFormType');
        sessionStorage.removeItem('selectedDbENo');
        sessionStorage.removeItem('dbPaymentMode');
        sessionStorage.removeItem('dbShowFilters');
    };
    useEffect(() => {
        if (selectedDbDate) sessionStorage.setItem('selectedDbDate', JSON.stringify(selectedDbDate));
        if (dbShopNo) sessionStorage.setItem('dbShopNo', JSON.stringify(dbShopNo));
        if (selectedDbMonth) sessionStorage.setItem('selectedMonth', JSON.stringify(selectedDbMonth));
        if (dbTenantName) sessionStorage.setItem('dbTenantName', JSON.stringify(dbTenantName));
        if (dbFormType) sessionStorage.setItem('dbFormType', JSON.stringify(dbFormType));
        if (selectedDbENo) sessionStorage.setItem('selectedDbENo', JSON.stringify(selectedDbENo));
        if (dbPaymentMode) sessionStorage.setItem('dbPaymentMode', JSON.stringify(dbPaymentMode));
        if (dbShowFilters) sessionStorage.setItem('dbShowFilters', JSON.stringify(dbShowFilters));
    }, [selectedDbDate, dbShopNo, selectedDbMonth, dbTenantName, dbFormType, selectedDbENo, dbPaymentMode, dbShowFilters]);
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    const [editId, setEditId] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [tenantOptions, setTenantOptions] = useState([]);
    const [shopNoOptions, setShopNoOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rentFormData, setRentFormData] = useState({
        formType: '',
        shopNo: '',
        tenantName: '',
        amount: '',
        refundAmount: '',
        paymentMode: '',
        paidOnDate: '',
        forTheMonthOf: '',
        attachedFile: '',
    });
    const [userPermissions, setUserPermissions] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const currentItems = filteredRentForm;
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };
    const sortedItems = sortField
        ? [...currentItems].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            // Numeric comparison if both values are numbers
            if (!isNaN(valA) && !isNaN(valB)) {
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            }
            // Sort by "For the Month Of" as date
            if (sortField === 'forTheMonthOf') {
                const dateA = new Date(valA + '-01');
                const dateB = new Date(valB + '-01');
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            // ✅ Sort by Paid On Date
            if (sortField === 'paidOnDate') {
                const dateA = new Date(valA);
                const dateB = new Date(valB);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            // Default string comparison
            const strA = valA?.toString().toLowerCase() || '';
            const strB = valB?.toString().toLowerCase() || '';
            return sortOrder === 'asc'
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
        })
        : currentItems;
    useEffect(() => {
        console.log('Sort field:', sortField);
        console.log('Sort order:', sortOrder);
        console.log('Current items:', currentItems);
    }, [sortField, sortOrder, currentItems]);
    const [allShops, setAllShops] = useState([]);
    useEffect(() => {
        fetchProperties();
    }, []);
    const fetchProperties = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/properties/all');
            if (response.ok) {
                const data = await response.json();
                // Extract property names
                const extractedShops = [];
                data.forEach(property => {
                    property.propertyDetailsList?.forEach(shop => {
                        if (shop.shopNo) {
                            extractedShops.push({
                                shopNo: shop.shopNo,
                                doorNo: shop.doorNo || '',
                                propertyName: property.propertyName || '',
                                advance: null,
                                tenantName: null,
                                tenantId: null,
                                shopId: shop.id,
                                active: false
                            });
                        }
                    });
                });
                setAllShops(extractedShops);
            } else {
                console.log('Error fetching properties.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching properties.');
        }
    };
    const moduleName = "Rent Management";
    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                const response = await axios.get("https://backendaab.in/aabuilderDash/api/user_roles/all");
                const allRoles = response.data;
                const userRoleNames = userRoles.map(r => r.roles);
                const matchedRoles = allRoles.filter(role =>
                    userRoleNames.includes(role.userRoles)
                );
                const models = matchedRoles.flatMap(role => role.userModels || []);
                const matchedModel = models.find(role => role.models === moduleName);
                const permissions = matchedModel?.permissions?.[0]?.userPermissions || [];
                setUserPermissions(permissions);
            } catch (error) {
                console.error("Error fetching user roles:", error);
            }
        };
        if (userRoles.length > 0) {
            fetchUserRoles();
        }
    }, [userRoles]);
    const handleEditClick = (rent) => {
        setEditId(rent.id);
        setRentFormData(rent);
        setModalIsOpen(true);
    };
    const handleCancel = () => {
        setModalIsOpen(false);
    };
    const [paymentModeOptions, setPaymentModeOptions] = useState([]);
    useEffect(() => {
        fetchPaymentModes();
    }, []);
    const fetchPaymentModes = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/payment_mode/getAll');
            if (response.ok) {
                const data = await response.json();
                // Transform into { value, label } format
                const formattedOptions = data.map(mode => ({
                    value: mode.modeOfPayment,
                    label: mode.modeOfPayment
                }));
                setPaymentModeOptions(formattedOptions);
            } else {
                console.log('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching tile area names.');
        }
    };
    const handleMouseDown = (e) => {
        isDragging.current = true;
        start.current = { x: e.clientX, y: e.clientY };
        scroll.current = {
            left: scrollRef.current.scrollLeft,
            top: scrollRef.current.scrollTop,
        };
        lastMove.current = {
            time: Date.now(),
            x: e.clientX,
            y: e.clientY,
        };
        scrollRef.current.style.cursor = 'grabbing';
        scrollRef.current.style.userSelect = 'none';
        cancelMomentum();
    };
    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
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
        lastMove.current = {
            time: now,
            x: e.clientX,
            y: e.clientY,
        };
    };
    const handleMouseUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        scrollRef.current.style.cursor = '';
        scrollRef.current.style.userSelect = '';
        applyMomentum();
    };
    const cancelMomentum = () => {
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
    };
    const handlePrint = (rent) => {
        const matchingShop = allShops.find(shop => shop.shopNo === rent.shopNo);
        const propertyName = matchingShop?.propertyName || 'N/A';
        const qrCodeImage = QRCode;
        const receiptHtml = `
    <html>
    <head>
        <title>Receipt</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            td, th { padding: 8px; border: 1px solid #ccc; }
            .label { font-weight: bold; width: 40%; }
            .signature { margin-top: 40px; }
            .bank-details-table { margin-top: 60px; }
            .qr { text-align: center; margin-top: 20px; }
        </style>
    </head>
    <body>
        <h2>Rent Payment Receipt</h2>
        <table>
            <tr><td class="label">Shop No</td><td>${rent.shopNo}</td></tr>
            <tr><td class="label">Property Name</td><td>${propertyName}</td></tr>
            <tr><td class="label">Amount Paid</td><td>₹${Number(rent.refundAmount || rent.amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}</td></tr>
            <tr><td class="label">Paid On</td><td>${formatDateOnly(rent.paidOnDate)}</td></tr>
            <tr><td class="label">Receipt No</td><td>${rent.eno}</td></tr>
            <tr><td class="label">For the Month Of</td><td>${rent.forTheMonthOf
                ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                })
                : ''}</td></tr>
            <tr><td class="label">Payment Mode</td><td>${rent.paymentMode}</td></tr>
            <tr><td class="label">Type</td><td>${rent.formType}</td></tr>
        </table>

        <div class="signature">
            <p>Signature: __________________________</p>
        </div>

        <div class="bank-details-table">
            <h3>Bank Details</h3>
            <table>
                <tr><td class="label">Bank</td><td>KVB</td></tr>
                <tr><td class="label">Name</td><td>AA Builders</td></tr>
                <tr><td class="label">Account Number</td><td>1804155000040012</td></tr>
                <tr><td class="label">IFSC Code</td><td>KVBL0001804</td></tr>
                <tr><td class="label">Branch</td><td>Srivilliputtur</td></tr>
                <tr><td class="label">UPI ID</td><td>office.aabuilders@okhdfcbank</td></tr>
                <tr><td class="label">GPay Number</td><td>93634 11241</td></tr>
            </table>
        </div>

        <div class="qr">
            <p><strong>Scan to Pay</strong></p>
            <img src="${qrCodeImage}" alt="QR Code" width="200" height="200" />
        </div>

        <script>
            window.onload = function () {
                window.print();
            };
        </script>
    </body>
    </html>
    `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
    };
    const applyMomentum = () => {
        const friction = 0.95;
        const minVelocity = 0.1;
        const step = () => {
            const { x, y } = velocity.current;
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
        axios
            .get('https://backendaab.in/aabuildersDash/api/rental_forms/getAll')
            .then((response) => {
                const sortedExpenses = response.data.sort((a, b) => {
                    const enoA = parseInt(a.id, 10);
                    const enoB = parseInt(b.id, 10);
                    return enoB - enoA; // descending order
                });
                setRentForms(sortedExpenses);
                setFilteredRentForm(sortedExpenses);
                const uniqueEnos = [...new Set(response.data.map(rent => rent.eno))];
                const uniqueShopNo = [...new Set(response.data.map(rent => rent.shopNo))];
                const uniqueTenantName = [...new Set(response.data.map(rent => rent.tenantName))];
                const uniquePaymentMode = [...new Set(response.data.map(rent => rent.paymentMode))];
                const uniqueFormType = [...new Set(response.data.map(rent => rent.formType))];
                const uniqueForTheMonthOf = [...new Set(response.data.map(rent => rent.forTheMonthOf))];
                setEnoOption(uniqueEnos);
                setShopNoOption(uniqueShopNo);
                setTenantNameOption(uniqueTenantName);
                setPaymentModeOption(uniquePaymentMode);
                setFormTypeOptions(uniqueFormType);
                uniqueForTheMonthOf.sort();
                const formattedMonths = uniqueForTheMonthOf.map(monthStr => {
                    const [year, month] = monthStr.split('-');
                    const date = new Date(year, parseInt(month) - 1);
                    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                });
                setMonthOptions(formattedMonths);
            })
            .catch((error) => {
                console.error('Error fetching expenses:', error);
            });
    }, []);
    useEffect(() => {
        const filtered = rentForms.filter(rent => {
            const matchesShopNo = dbShopNo ? rent.shopNo === dbShopNo : true;
            const matchesTenantName = dbTenantName ? rent.tenantName === dbTenantName : true;
            const matchesPaymentMode = dbPaymentMode ? rent.paymentMode === dbPaymentMode : true;
            const matchesFormType = dbFormType ? rent.formType === dbFormType : true;
            const matchesDate = selectedDbDate ? rent.paidOnDate === selectedDbDate : true;
            const matchesENo = selectedDbENo ? rent.eno === selectedDbENo : true;
            const matchesMonth = selectedDbMonth
                ? rent.forTheMonthOf &&
                new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                }) === selectedDbMonth
                : true;
            return (
                matchesShopNo &&
                matchesTenantName &&
                matchesPaymentMode &&
                matchesFormType &&
                matchesMonth &&
                matchesDate &&
                matchesENo
            );
        });
        setFilteredRentForm(filtered);
        const getUnique = (key) => [...new Set(filtered.map(item => item[key]).filter(Boolean))];
        setShopNoOption(getUnique('shopNo'));
        setTenantNameOption(getUnique('tenantName'));
        setPaymentModeOption(getUnique('paymentMode'));
        setFormTypeOptions(getUnique('formType'));
        setEnoOption(getUnique('eno'));
        const uniqueMonths = getUnique('forTheMonthOf').sort();
        const formattedMonths = uniqueMonths.map(monthStr => {
            const [year, month] = monthStr.split('-');
            const date = new Date(year, parseInt(month) - 1);
            return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        });
        setMonthOptions(formattedMonths);
    }, [dbShopNo, dbTenantName, dbPaymentMode, dbFormType, selectedDbMonth, selectedDbDate, rentForms, selectedDbENo]);
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    useEffect(() => {
        fetchTenants();
    }, []);
    const fetchTenants = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/tenantShop/getAll');
            if (response.ok) {
                const data = await response.json();
                const activeTenants = data.filter(t =>
                    t.property?.some(p =>
                        p.shops?.some(shop => shop.active)
                    )
                );
                // Step 2: Map all active tenant-shop combinations
                const options = activeTenants.flatMap(t =>
                    t.property.flatMap(p =>
                        p.shops
                            .filter(shop => shop.active)
                            .map(shop => ({
                                label: t.tenantName,
                                value: t.tenantName,
                                tenantId: t.id,
                                shopNo: shop.shopNo
                            }))
                    )
                );
                const tenantOptionsUnique = options.filter(
                    (t, i, arr) => t.label && arr.findIndex(x => x.value === t.value) === i
                );
                setTenantOptions(tenantOptionsUnique);
                const uniqueShopNos = [...new Set(options.map(o => o.shopNo).filter(Boolean))];
                const shopOptions = uniqueShopNos.map(no => ({ label: no, value: no }));
                setShopNoOptions(shopOptions);
            } else {
                console.log('Error fetching tenants.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching properties.');
        }
    };
    const handleChange = (e) => {
        const { name, type, value, files } = e.target;
        // Prevent clearing the date field
        if (name === "paidOnDate" && value === "") {
            return; // Don't update formData if date is being cleared
        }
        setRentFormData({
            ...rentFormData,
            [name]: type === "file" ? files[0] : value
        });
    };
    const fetchAuditDetails = async (rentFormId) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/rental_forms/audit/${rentFormId}`);
            const data = await response.json();
            setAudits(data);
            console.log(data);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching audit details:", error);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const {
            formType, shopNo, tenantName, amount,
            refundAmount, paymentMode, paidOnDate,
            forTheMonthOf, attachedFile
        } = rentFormData;
        const payload = {
            formType,
            shopNo,
            tenantName,
            amount,
            refundAmount,
            paymentMode,
            paidOnDate,
            forTheMonthOf,
            attachedFile,
            editedBy:username,
        };
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/rental_forms/update/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                alert('Rent form updated successfully!');
                handleCancel(); // close modal
                // optionally refetch the list
            } else {
                const errorMsg = await response.text();
                alert(`Failed to update: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Error updating rent form:', error);
            alert('Something went wrong. Please try again.');
        }
    };
    const resetFilters = () => {
        setSelectedDbDate('');
        setDbShopNo('');
        setDbTenantName('');
        setDbPaymentMode('');
        setDbFormType('');
        setSelectedDbMonth('');
        setSelectedDbENo('');
        setDbShowFilters(false);
        sessionStorage.removeItem('selectedDbDate');
        sessionStorage.removeItem('dbShopNo');
        sessionStorage.removeItem('selectedDbMonth');
        sessionStorage.removeItem('dbTenantName');
        sessionStorage.removeItem('dbFormType');
        sessionStorage.removeItem('selectedDbENo');
        sessionStorage.removeItem('dbPaymentMode');
        sessionStorage.removeItem('dbShowFilters');
    };
    const handleExportExcel = () => {
        const headers = [
            "Timestamp",
            "Shop No",
            "Tenant Name",
            "Amount",
            "Paid On",
            "E No",
            "For the Month Of",
            "Payment Mode",
            "Type"
        ];
        const rows = currentItems.map(rent => [
            formatDate(rent.timestamp),
            rent.shopNo,
            rent.tenantName,
            `${Number(rent.refundAmount || rent.amount).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            formatDateOnly(rent.paidOnDate),
            rent.eno,
            rent.forTheMonthOf
                ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                })
                : '',
            rent.paymentMode,
            rent.formType
        ]);
        const csvContent = [headers, ...rows]
            .map(row => row.map(value => `"${value}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Rent Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text('Rent Collection Report', 14, 15);
        const tableColumn = [
            "Timestamp", "Shop No", "Tenant Name", "Amount", "Paid On",
            "E No", "For the Month Of", "Payment Mode", "Type"
        ];
        const tableRows = filteredRentForm.map((rent) => [
            formatDate(rent.timestamp),
            rent.shopNo,
            rent.tenantName,
            `${Number(rent.refundAmount || rent.amount).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            formatDateOnly(rent.paidOnDate),
            rent.eno,
            rent.forTheMonthOf
                ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                })
                : '',
            rent.paymentMode,
            rent.formType
        ]);
        doc.autoTable({
            startY: 20,
            head: [tableColumn],
            body: tableRows,
            styles: {
                fontSize: 9,
                cellPadding: 2,
                halign: 'left',
                valign: 'middle',
                textColor: [80, 80, 80],
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            bodyStyles: {

                lineWidth: 0.1,
            },
            alternateRowStyles: {
                fillColor: false,
            },
        });
        doc.save('Rent_Report.pdf');
    };
    const handleDelete = async (id, username) => {
        if (window.confirm('Are you sure you want to delete this Rent?')) {
            try {
                const response = await fetch(
                    `https://backendaab.in/aabuildersDash/api/rental_forms/delete/${id}?editedBy=${encodeURIComponent(username)}`,
                    {
                        method: 'POST',
                    }
                );
                if (response.ok) {
                    alert('Expenses deleted successfully!!!');
                    window.location.reload();
                } else {
                    alert('Failed to delete expense');
                }
            } catch (error) {
                console.error('Failed to delete expense:', error);
            }
        }
    };
    return (
        <body className="bg-[#FAF6ED] ">
            <div>
                <div className='md:mt-[-35px] mb-3 text-left md:text-right md:items-center items-start cursor-default flex justify-between max-w-screen-2xl table-auto min-w-full overflow-auto w-screen'>
                    <div></div>
                    <div>
                        <span
                            className='text-[#E4572E] mr-4 font-semibold hover:underline cursor-pointer'
                            onClick={handleExportPDF}
                        >
                            Export pdf
                        </span>
                        <span
                            className='text-[#007233] mr-4 font-semibold hover:underline cursor-pointer'
                            onClick={handleExportExcel}
                        >
                            Export XL
                        </span>
                        <span className=' text-[#BF9853] mr-4 font-semibold hover:underline'>Print</span>
                    </div>
                </div>
                <div className="w-full max-w-[1860px] mx-auto p-4 bg-white">
                    <div className="flex justify-between  sm:flex-row sm:items-center sm:space-x-3">
                        <div className='flex gap-4'>
                            <button className='pl-2' onClick={() => setDbShowFilters(!dbShowFilters)}>
                                <img
                                    src={Filter}
                                    alt="Toggle Filter"
                                    className="w-7 h-7 border border-[#BF9853] rounded-md"
                                />
                            </button>
                            {(selectedDbDate || dbShopNo || dbTenantName || dbPaymentMode || dbFormType || selectedDbMonth || selectedDbENo) && (
                                <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                                    {selectedDbDate && (
                                        <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                                            <span className="font-normal">Paid On Date: </span>
                                            <span className="font-bold">{selectedDbDate}</span>
                                            <button onClick={() => {setSelectedDbDate(''); sessionStorage.removeItem('selectedDbDate');}} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {dbShopNo && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Shop N0: </span>
                                            <span className="font-bold">{dbShopNo}</span>
                                            <button onClick={() => {setDbShopNo(''); sessionStorage.removeItem('dbShopNo');}} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {dbTenantName && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Tenant Name: </span>
                                            <span className="font-bold">{dbTenantName}</span>
                                            <button onClick={() => {setDbTenantName(''); sessionStorage.removeItem('dbTenantName');}} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {dbPaymentMode && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Payment Mode: </span>
                                            <span className="font-bold">{dbPaymentMode}</span>
                                            <button onClick={() => {setDbPaymentMode(''); sessionStorage.removeItem('dbPaymentMode');}} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {dbFormType && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Type: </span>
                                            <span className="font-bold">{dbFormType}</span>
                                            <button onClick={() => {setDbFormType(''); sessionStorage.removeItem('dbFormType');}} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedDbMonth && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">For The Month Of: </span>
                                            <span className="font-bold">{selectedDbMonth}</span>
                                            <button onClick={() => {setSelectedDbMonth(''); sessionStorage.removeItem('selectedDbMonth');}} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedDbENo && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">E No: </span>
                                            <span className="font-bold">{selectedDbENo}</span>
                                            <button onClick={() => {setSelectedDbENo(''); sessionStorage.removeItem('selectedDbENo');}} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <button
                                onClick={resetFilters}
                                className='w-36 h-9 border border-[#BF9853] rounded-md font-semibold text-sm text-[#BF9853] flex items-center justify-center gap-2'
                            >
                                <img className='w-4 h-4' src={Reload} alt="Reload" />
                                Reset Table
                            </button>
                        </div>
                    </div>
                    <div className="[@media(min-width:1484px)]:w-[1424px] [@media(min-width:1584px)]:w-[1524px] [@media(min-width:1684px)]:w-[1624px]
                    [@media(min-width:1784px)]:w-[1774px] [@media(min-width:1884px)]:w-[1828px] w-[430px]  py-5 flex justify-between">
                        <div
                            ref={scrollRef}
                            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[760px] overflow-scroll select-none"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp} >
                            <table className="table-auto min-w-[1165px] w-screen border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF6ED] text-left">
                                        <th className="px-4 py-2 font-bold">Timestamp</th>
                                        <th
                                            className="px-4 py-2 font-bold cursor-pointer"
                                            onClick={() => handleSort('shopNo')}
                                        >
                                            Shop No {sortField === 'shopNo' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th
                                            className="px-4 py-2 font-bold"
                                            onClick={() => handleSort('tenantName')}>
                                            Tenant Name {sortField === 'tenantName' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th className="px-4 py-2 font-bold">Amount</th>
                                        <th
                                            className="px-4 py-2 font-bold cursor-pointer"
                                            onClick={() => handleSort('paidOnDate')}
                                        >
                                            Paid on {sortField === 'paidOnDate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th
                                            className="px-4 py-2 font-bold cursor-pointer"
                                            onClick={() => handleSort('eno')}
                                        >
                                            E No {sortField === 'eno' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>

                                        <th
                                            className="px-4 py-2 font-bold cursor-pointer"
                                            onClick={() => handleSort('forTheMonthOf')}
                                        >
                                            For the month of {sortField === 'forTheMonthOf' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th
                                            className="px-4 py-2 font-bold"
                                            onClick={() => handleSort('paymentMode')}
                                        >
                                            Payment mode {sortField === 'paymentMode' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th
                                            className="px-4 py-2 font-bold cursor-pointer"
                                            onClick={() => handleSort('formType')}
                                        >
                                            Type {sortField === 'formType' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>

                                        <th className="px-4 py-2 font-bold">Activity</th>
                                        <th className="px-1 py-2 font-bold">Print</th>
                                    </tr>
                                    {dbShowFilters && (
                                        <tr>
                                            <th></th>
                                            <th className="px-2">
                                                <Select
                                                    className="w-40 mt-3 mb-3"
                                                    options={shopNoOption.map(type => ({ value: type, label: type }))}
                                                    value={dbShopNo ? { value: dbShopNo, label: dbShopNo } : null}
                                                    onChange={(selectedOption) => {
                                                        const value = selectedOption ? selectedOption.value : '';
                                                        setDbShopNo(value);
                                                        if (value) {
                                                            sessionStorage.setItem('dbShopNo', JSON.stringify(value));
                                                        } else {
                                                            sessionStorage.removeItem('dbShopNo');
                                                        }
                                                    }}
                                                    placeholder="Shop..."
                                                    menuPlacement="bottom"
                                                    menuPosition="fixed"
                                                    isClearable
                                                    styles={{
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            backgroundColor: 'transparent',
                                                            borderWidth: '3px',
                                                            borderColor: state.isFocused
                                                                ? 'rgba(191, 152, 83, 0.2)'
                                                                : 'rgba(191, 152, 83, 0.2)',
                                                            borderRadius: '6px',
                                                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                            '&:hover': {
                                                                borderColor: 'rgba(191, 152, 83, 0.2)',
                                                            },
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#999',
                                                            textAlign: 'left',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9,
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            fontSize: '15px',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: 'black',
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            color: 'black',
                                                        }),
                                                    }}
                                                />
                                            </th>
                                            <th className="px-2">
                                                <Select
                                                    className="w-48 mt-3 mb-3"
                                                    options={tenantNameOption.map(type => ({ value: type, label: type }))}
                                                    value={dbTenantName ? { value: dbTenantName, label: dbTenantName } : null}
                                                    onChange={(selectedOption) => {
                                                        const value = selectedOption ? selectedOption.value : '';
                                                        setDbTenantName(value);
                                                        if (value) {
                                                            sessionStorage.setItem('dbTenantName', JSON.stringify(value));
                                                        } else {
                                                            sessionStorage.removeItem('dbTenantName');
                                                        }
                                                    }}
                                                    placeholder="Search Tenant"
                                                    menuPlacement="bottom"
                                                    menuPosition="fixed"
                                                    isClearable
                                                    styles={{
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            backgroundColor: 'transparent',
                                                            borderWidth: '3px',
                                                            borderColor: state.isFocused
                                                                ? 'rgba(191, 152, 83, 0.2)'
                                                                : 'rgba(191, 152, 83, 0.2)',
                                                            borderRadius: '6px',
                                                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                            '&:hover': {
                                                                borderColor: 'rgba(191, 152, 83, 0.2)',
                                                            },
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#999',
                                                            textAlign: 'left',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9,
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            fontSize: '15px',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: 'black',
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            color: 'black',
                                                        }),
                                                    }}
                                                />
                                            </th>
                                            <th></th>
                                            <th className="px-2">
                                                <input
                                                    type="date"
                                                    value={selectedDbDate}
                                                    onChange={(e) => setSelectedDbDate(e.target.value)}
                                                    className="p-1 -ml-3 mt-3 mb-3 rounded-md bg-transparent w-32 border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none"
                                                    placeholder="Search Date..."
                                                />
                                            </th>
                                            <th>
                                                <Select
                                                    className="w-34 h-10 mt-3 mb-3"
                                                    options={enoOption.map(type => ({ value: type, label: type }))}
                                                    value={selectedDbENo ? { value: selectedDbENo, label: selectedDbENo } : null}
                                                    onChange={(selectedOption) => {
                                                        const value = selectedOption ? selectedOption.value : '';
                                                        setSelectedDbENo(value);
                                                        if (value) {
                                                            sessionStorage.setItem('selectedDbENo', JSON.stringify(value));
                                                        } else {
                                                            sessionStorage.removeItem('selectedDbENo');
                                                        }
                                                    }}
                                                    placeholder='Search ...'
                                                    menuPlacement="bottom"
                                                    menuPosition="fixed"
                                                    isClearable
                                                    styles={{
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            backgroundColor: 'transparent',
                                                            borderWidth: '3px',
                                                            borderColor: state.isFocused
                                                                ? 'rgba(191, 152, 83, 0.2)'
                                                                : 'rgba(191, 152, 83, 0.2)',
                                                            borderRadius: '6px',
                                                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                            '&:hover': {
                                                                borderColor: 'rgba(191, 152, 83, 0.2)',
                                                            },
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#999',
                                                            textAlign: 'left',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9,
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            fontSize: '15px',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: 'black',
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            color: 'black',
                                                        }),
                                                    }}
                                                />
                                            </th>
                                            <th>
                                                <Select
                                                    className="w-48 mt-3 mb-3"
                                                    options={monthOptions.map(type => ({ value: type, label: type }))}
                                                    value={selectedDbMonth ? { value: selectedDbMonth, label: selectedDbMonth } : null}
                                                    onChange={(selectedOption) => {
                                                        const value = selectedOption ? selectedOption.value : '';
                                                        setSelectedDbMonth(value);
                                                        if (value) {
                                                            sessionStorage.setItem('selectedDbMonth', JSON.stringify(value));
                                                        } else {
                                                            sessionStorage.removeItem('selectedDbMonth');
                                                        }
                                                    }}
                                                    placeholder="Search Mode..."
                                                    menuPlacement="bottom"
                                                    menuPosition="fixed"
                                                    isClearable
                                                    styles={{
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            backgroundColor: 'transparent',
                                                            borderWidth: '3px',
                                                            borderColor: state.isFocused
                                                                ? 'rgba(191, 152, 83, 0.2)'
                                                                : 'rgba(191, 152, 83, 0.2)',
                                                            borderRadius: '6px',
                                                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                            '&:hover': {
                                                                borderColor: 'rgba(191, 152, 83, 0.2)',
                                                            },
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#999',
                                                            textAlign: 'left',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9,
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            fontSize: '15px',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: 'black',
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            color: 'black',
                                                        }),
                                                    }}
                                                />
                                            </th>
                                            <th className="px-2">
                                                <Select
                                                    className="w-48 mt-3 mb-3"
                                                    options={paymentModeOption.map(type => ({ value: type, label: type }))}
                                                    value={dbPaymentMode ? { value: dbPaymentMode, label: dbPaymentMode } : null}
                                                    onChange={(selectedOption) => {
                                                        const value = selectedOption ? selectedOption.value : '';
                                                        setDbPaymentMode(value);
                                                        if (value) {
                                                            sessionStorage.setItem('dbPaymentMode', JSON.stringify(value));
                                                        } else {
                                                            sessionStorage.removeItem('dbPaymentMode');
                                                        }
                                                    }}
                                                    placeholder="Search Mode..."
                                                    menuPlacement="bottom"
                                                    menuPosition="fixed"
                                                    isClearable
                                                    styles={{
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            backgroundColor: 'transparent',
                                                            borderWidth: '3px',
                                                            borderColor: state.isFocused
                                                                ? 'rgba(191, 152, 83, 0.2)'
                                                                : 'rgba(191, 152, 83, 0.2)',
                                                            borderRadius: '6px',
                                                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                            '&:hover': {
                                                                borderColor: 'rgba(191, 152, 83, 0.2)',
                                                            },
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#999',
                                                            textAlign: 'left',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9,
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            fontSize: '15px',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: 'black',
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            color: 'black',
                                                        }),
                                                    }}
                                                />
                                            </th>
                                            <th className="px-2">
                                                <Select
                                                    className="w-44 mt-3 mb-3"
                                                    options={formTypeOptions.map(type => ({ value: type, label: type }))}
                                                    value={dbFormType ? { value: dbFormType, label: dbFormType } : null}
                                                    onChange={(selectedOption) => {
                                                        const value = selectedOption ? selectedOption.value : '';
                                                        setDbFormType(value);
                                                        if (value) {
                                                            sessionStorage.setItem('dbFormType', JSON.stringify(value));
                                                        } else {
                                                            sessionStorage.removeItem('dbFormType');
                                                        }
                                                    }}
                                                    placeholder="Search Type.."
                                                    menuPlacement="bottom"
                                                    menuPosition="fixed"
                                                    isClearable
                                                    styles={{
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            backgroundColor: 'transparent',
                                                            borderWidth: '3px',
                                                            borderColor: state.isFocused
                                                                ? 'rgba(191, 152, 83, 0.2)'
                                                                : 'rgba(191, 152, 83, 0.2)',
                                                            borderRadius: '6px',
                                                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                            '&:hover': {
                                                                borderColor: 'rgba(191, 152, 83, 0.2)',
                                                            },
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#999',
                                                            textAlign: 'left',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9,
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            fontSize: '15px',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: 'black',
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            color: 'black',
                                                        }),
                                                    }}
                                                />
                                            </th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {sortedItems.map((rent, index) => (
                                        <tr key={rent.id} className="odd:bg-white even:bg-[#FAF6ED]">
                                            <td className=" text-sm text-left px-4 font-semibold">{formatDate(rent.timestamp)}</td>
                                            <td className=" text-sm text-left px-4 py-2 font-semibold">{rent.shopNo}</td>
                                            <td className=" text-sm text-left px-4 font-semibold">{rent.tenantName}</td>
                                            <td className={`text-sm text-left px-4 font-semibold ${rent.refundAmount ? 'text-red-500' : 'text-black'}`}>
                                                {Number(rent.refundAmount || rent.amount) === 0
                                                    ? 'NIL'
                                                    : `₹${Number(rent.refundAmount || rent.amount).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}`}
                                            </td>
                                            <td className="text-sm text-left px-4 font-semibold">
                                                {Number(rent.refundAmount || rent.amount) === 0 ? 'NIL' : formatDateOnly(rent.paidOnDate)}
                                            </td>
                                            <td className=" text-sm text-left px-4 font-semibold">{rent.eno}</td>
                                            <td className="text-sm text-left px-4 font-semibold">
                                                {rent.forTheMonthOf
                                                    ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })
                                                    : ''}
                                            </td>
                                            <td className=" text-sm text-left px-4 font-semibold">{rent.paymentMode}</td>
                                            <td className=" text-sm text-left px-4 font-semibold">{rent.formType}</td>
                                            <td className=" flex w-[100px] justify-between py-2">
                                                <button onClick={() => handleEditClick(rent)} className="rounded-full transition duration-200 ml-2 mr-3">
                                                    <img
                                                        src={edit}
                                                        alt="Edit"
                                                        className=" w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                                                    />
                                                </button>
                                                {userPermissions.includes("Delete") && (
                                                    <button className=" -ml-5 -mr-2">
                                                        <img
                                                            src={remove}
                                                            alt='delete'
                                                            onClick={() => handleDelete(rent.id, username)}
                                                            className='  w-4 h-4 transform hover:scale-110 hover:brightness-110 transition duration-200 ' />
                                                    </button>
                                                )}
                                                <button onClick={() => fetchAuditDetails(rent.id)} className="rounded-full transition duration-200 -mr-1" >
                                                    <img
                                                        src={history}
                                                        alt="history"
                                                        className=" w-4 h-5 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                                                    />
                                                </button>
                                            </td>
                                            <td className="text-sm text-left px-2 font-semibold">
                                                <button
                                                    className="text-blue-600 underline"
                                                    onClick={() => handlePrint(rent)}
                                                >
                                                    Print
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Modal
                            isOpen={modalIsOpen}
                            onRequestClose={handleCancel}
                            contentLabel="Edit Expense"
                            className="fixed inset-0 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50"
                            overlayClassName="fixed inset-0">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                                <h2 className="text-xl font-bold mb-6 border-b-2">Edit Rent Form</h2>
                                <form className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Type</label>
                                        <select
                                            name="formType"
                                            value={rentFormData.formType}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none">
                                            <option value="" disabled>--- Select ---</option>
                                            <option value="Rent">Rent</option>
                                            <option value="Advance">Advance</option>
                                            <option value="Shop Closure">Shop Closure</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Shop No</label>
                                        <Select
                                            name="shopNo"
                                            value={shopNoOptions.find(option => option.value === rentFormData.shopNo)}
                                            onChange={(selectedOption) =>
                                                setRentFormData({ ...rentFormData, shopNo: selectedOption?.value || '' })
                                            }
                                            options={shopNoOptions}
                                            placeholder="--- Select Site ---"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                    borderWidth: '2px',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.25rem',
                                                    textAlign: 'left',
                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    textAlign: 'left',
                                                    fontWeight: 'normal',
                                                    fontSize: '15px',
                                                    backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                    color: 'black',
                                                }),
                                            }}
                                            menuPlacement="bottom"
                                            menuPosition="absolute"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Tenant Name </label>
                                        <Select
                                            name="tenantName"
                                            options={tenantOptions}
                                            value={tenantOptions.find(opt => opt.value === rentFormData.tenantName)}
                                            onChange={(selectedOption) =>
                                                setRentFormData({ ...rentFormData, tenantName: selectedOption?.value || '' })
                                            }
                                            isClearable
                                            styles={{
                                                control: (base, state) => ({
                                                    ...base,
                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                    borderWidth: '2px',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.25rem',
                                                    textAlign: 'left',
                                                    boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                    '&:hover': {
                                                        borderColor: 'rgba(191, 152, 83, 0.4)',
                                                    },
                                                }),
                                                placeholder: (base) => ({
                                                    ...base,
                                                    color: '#6B7280',
                                                    textAlign: 'left',

                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    textAlign: 'left',
                                                    fontWeight: 'normal',
                                                    fontSize: '15px',
                                                    backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                    color: 'black',
                                                }),
                                                singleValue: (base) => ({
                                                    ...base,
                                                    color: '#111827',
                                                }),
                                                menu: (base) => ({
                                                    ...base,
                                                    zIndex: 999,
                                                }),
                                            }}
                                            placeholder="--- Select Contractor ---"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Paid On Date</label>
                                        <input
                                            type="date"
                                            name="paidOnDate"
                                            value={rentFormData.paidOnDate}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Amount </label>
                                        <input
                                            type="text"
                                            name="amount"
                                            value={rentFormData.amount}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Payment Mode </label>
                                        <Select
                                            name="paymentMode"
                                            value={paymentModeOptions.find(option => option.value === rentFormData.paymentMode)}
                                            onChange={(selectedOption) =>
                                                setRentFormData({ ...rentFormData, paymentMode: selectedOption?.value || '' })
                                            }
                                            options={paymentModeOptions}
                                            placeholder="--- Select PaymentMode ---"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                    borderWidth: '2px',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.25rem',
                                                    textAlign: 'left',
                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    textAlign: 'left',
                                                    fontWeight: 'normal',
                                                    fontSize: '15px',
                                                    backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                    color: 'black',
                                                }),
                                            }}
                                            menuPlacement="bottom"
                                            menuPosition="absolute"
                                        />
                                    </div>
                                    <input
                                        type="month"
                                        name="forTheMonthOf"
                                        value={rentFormData.forTheMonthOf}
                                        onChange={handleChange}
                                        className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                    />
                                    <div className="col-span-2 flex justify-end space-x-4 mt-4 border-t-2 ">
                                        <button type="button" onClick={handleCancel} className="px-4 py-2 border-2 border-opacity-[] border-[#BF9853] text-[#BF9853] rounded mt-3">
                                            Cancel
                                        </button>
                                        <button type="submit" onClick={handleSubmit} disabled={isSubmitting}
                                            className={`px-4 py-2 bg-[#BF9853] text-white rounded mt-3 transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Modal>
                        <AuditModal show={showModal} onClose={() => setShowModal(false)} audits={audits} />
                    </div>
                </div>
            </div>
        </body>
    )
}
export default RentDatabase;
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
const AuditModal = ({ show, onClose, audits }) => {
    if (!show) return null;

    const fields = [
        { key: "TenantName", label: "Tenant Name" },
        { key: "ShopNo", label: "Shop No" },
        { key: "FormType", label: "Form Type" },
        { key: "ForTheMonthOf", label: "For Month" },
        { key: "PaidOnDate", label: "Paid On" },
        { key: "PaymentMode", label: "Payment Mode" },
        { key: "RefundAmount", label: "Refund Amount" },
        { key: "AttachedFile", label: "File" },
        { key: "Amount", label: "Amount" },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes()); // IST offset
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
    const columnWidths = [
        "210px", "150px", "180px", "160px", "160px", "140px",
        "120px", "200px", "130px", "180px", "150px"
    ];
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-md shadow-lg w-[95%] max-w-[1400px] mx-4 p-4">
                <div className="flex justify-between items-center mt-4 ml-7 mr-7">
                    <h2 className="text-xl font-bold">History</h2>
                    <button onClick={onClose}>
                        <h2 className="text-xl text-red-500 -mt-10 font-bold">x</h2>
                    </button>
                </div>
                <div className="overflow-auto mt-2 max-h-96 border border-l-8 border-l-[#BF9853] rounded-lg ml-7">
                    <table className="table-fixed min-w-full bg-white">
                        <thead className="bg-[#FAF6ED]">
                            <tr>
                                <th className="border-b py-2 px-2 text-left text-base font-bold">Time Stamp</th>
                                <th className="border-b py-2 px-2 text-left text-base font-bold">Edited By</th>
                                {fields.map(({ label }, idx) => (
                                    <th key={idx} className="border-b py-2 px-2 text-center text-base font-bold whitespace-nowrap">{label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map((audit, index) => (
                                <React.Fragment key={index}>
                                    {/* OLD row */}
                                    <tr className="odd:bg-white even:bg-[#FAF6ED]">
                                        <td style={{ width: '130px' }} className="border pl-2 text-sm text-left whitespace-nowrap">{formatDate(audit.editedDate)}</td>
                                        <td style={{ width: '120px' }} className="border pl-2 text-sm text-left whitespace-nowrap">{audit.editedBy}</td>
                                        {fields.map(({ key }, i) => (
                                            <td key={key} style={{ width: columnWidths[i] }} className="border text-sm text-center">
                                                {audit[`old${key}`] ?? "-"}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="odd:bg-white even:bg-[#FAF6ED]">
                                        <td style={{ width: '130px' }} className="border pl-2 text-sm text-left whitespace-nowrap">{formatDate(audit.editedDate)}</td>
                                        <td style={{ width: '120px' }} className="border pl-2 text-sm text-left whitespace-nowrap">{audit.editedBy}</td>
                                        {fields.map(({ key }, i) => {
                                            const oldVal = audit[`old${key}`];
                                            const newVal = audit[`new${key}`];
                                            const changed = oldVal !== newVal;
                                            return (
                                                <td key={key} style={{ width: columnWidths[i] }} className={`border text-sm text-center ${changed ? "bg-[#BF9853] text-black font-bold" : ""}`}>
                                                    {newVal ?? "-"}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
