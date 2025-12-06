import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import edit from '../Images/Edit.svg';
import Filter from '../Images/filter (3).png'
import Select from 'react-select';
import Reload from '../Images/rotate-right.png';
import QRCode from '../Images/AAB_QR_CODE.jpeg';
import jsPDF from "jspdf";
import "jspdf-autotable";
Modal.setAppElement('#root');
const Table = () => {
    const [rentForms, setRentForms] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [shopNoOption, setShopNoOption] = useState([]);
    const [tenantNameOption, setTenantNameOption] = useState([]);
    const [paymentModeOption, setPaymentModeOption] = useState([]);
    const [formTypeOptions, setFormTypeOptions] = useState([]);
    const [monthOptions, setMonthOptions] = useState([]);
    const [selectedENo, setSelectedENo] = useState('');
    const [enoOption, setEnoOption] = useState([]);
    const [shopNo, setShopNo] = useState('');
    const [filteredRentForm, setFilteredRentForm] = useState([]);
    const [tenantName, setTenantName] = useState('');
    const [paymentMode, setPaymentMode] = useState('');
    const [formType, setFormType] = useState('');
    const [eno, setEno] = useState('');
    const [selectedRentMonth, setSelectedRentMonth] = useState('');
    // New state variables for projects and tenants data
    const [projects, setProjects] = useState([]);
    const [tenantShopData, setTenantShopData] = useState([]);
    const [shopNoIdToShopNoMap, setShopNoIdToShopNoMap] = useState({});
    const [tenantNameIdToTenantNameMap, setTenantNameIdToTenantNameMap] = useState({});
    // Edit modal state
    const [editId, setEditId] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [editTenantOptions, setEditTenantOptions] = useState([]);
    const [editShopNoOptions, setEditShopNoOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rentFormData, setRentFormData] = useState({
        formType: '',
        shopNo: '',
        shopNoId: null,
        tenantName: '',
        tenantNameId: null,
        amount: '',
        refundAmount: '',
        paymentMode: '',
        paidOnDate: '',
        forTheMonthOf: '',
        attachedFile: '',
    });
    const [paymentModeOptions, setPaymentModeOptions] = useState([]);
    useEffect(() => {
        const savedSelectedDate = sessionStorage.getItem('selectedDate');
        const savedShopNo = sessionStorage.getItem('shopNo')
        const savedSelectedMonth = sessionStorage.getItem('selectedRentMonth');
        const savedTenantName = sessionStorage.getItem('tenantName');
        const savedFormType = sessionStorage.getItem('formType');
        const savedPaymentMode = sessionStorage.getItem('paymentMode');
        const savedEno = sessionStorage.getItem('selectedENo');
        const savedShowFilter = sessionStorage.getItem('showFilters')
        try {
            if (savedSelectedDate) setSelectedDate(JSON.parse(savedSelectedDate));
            if (savedSelectedMonth) setSelectedRentMonth(JSON.parse(savedSelectedMonth));
            if (savedShopNo) setShopNo(JSON.parse(savedShopNo));
            if (savedTenantName) setTenantName(JSON.parse(savedTenantName));
            if (savedFormType) setFormType(JSON.parse(savedFormType));
            if (savedPaymentMode) setPaymentMode(JSON.parse(savedPaymentMode));
            if (savedEno) setSelectedENo(JSON.parse(savedEno));
            if (savedShowFilter !== null) setShowFilters(JSON.parse(savedShowFilter));
        } catch (error) {
            console.error("Error parsing sessionStorage data:", error);
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    const handleBeforeUnload = () => {
        sessionStorage.removeItem('selectedDate');
        sessionStorage.removeItem('shopNo');
        sessionStorage.removeItem('selectedRentMonth');
        sessionStorage.removeItem('tenantName');
        sessionStorage.removeItem('formType');
        sessionStorage.removeItem('selectedENo');
        sessionStorage.removeItem('paymentMode');
        sessionStorage.removeItem('showFilters');
    };
    useEffect(() => {
        if (selectedDate) sessionStorage.setItem('selectedDate', JSON.stringify(selectedDate));
        if (shopNo) sessionStorage.setItem('shopNo', JSON.stringify(shopNo));
        if (selectedRentMonth) sessionStorage.setItem('selectedRentMonth', JSON.stringify(selectedRentMonth));
        if (tenantName) sessionStorage.setItem('tenantName', JSON.stringify(tenantName));
        if (formType) sessionStorage.setItem('formType', JSON.stringify(formType));
        if (selectedENo) sessionStorage.setItem('selectedENo', JSON.stringify(selectedENo));
        if (paymentMode) sessionStorage.setItem('paymentMode', JSON.stringify(paymentMode));
        if (showFilters) sessionStorage.setItem('showFilters', JSON.stringify(showFilters));
    }, [selectedDate, shopNo, selectedRentMonth, tenantName, formType, selectedENo, paymentMode, showFilters]);
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
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
    const [allShops, setAllShops] = useState([]);
    useEffect(() => {
        fetchProjects();
    }, []);
    
    useEffect(() => {
        if (projects.length > 0) {
            fetchTenants();
        }
    }, [projects]);
    
    // Fetch projects for allShops
    const fetchProjects = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/getAll');
            if (response.ok) {
                const data = await response.json();
                // Filter for "own project" category
                const ownProjects = Array.isArray(data)
                    ? data.filter(p => (p.projectCategory || '').toLowerCase() === 'own project')
                    : [];
                setProjects(ownProjects);
                console.log('Fetched projects:', ownProjects.length, 'projects');
                // Extract shop data from projects
                const extractedShops = [];
                ownProjects
                    .filter(project => project.projectReferenceName) // Only include projects with projectReferenceName
                    .forEach(project => {
                        // Convert Set to Array if needed
                        const propertyDetailsArray = Array.isArray(project.propertyDetails) 
                            ? project.propertyDetails 
                            : Array.from(project.propertyDetails || []);
                        
                        propertyDetailsArray.forEach(shop => {
                            if (shop.shopNo) {
                                extractedShops.push({
                                    shopNo: shop.shopNo,
                                    doorNo: shop.doorNo || '',
                                    propertyName: project.projectReferenceName || '', // Use projectReferenceName
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
                console.log('Error fetching projects.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching projects.');
        }
    };
    
    // Fetch tenant link data
    const fetchTenants = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/tenant_link_shop/getAll');
            if (response.ok) {
                const data = await response.json();
                setTenantShopData(data);
                
                // Build mapping from shopNoId to shopNo from projects (project management)
                const shopNoIdToShopNoMap = {};
                projects
                    .filter(project => project.projectReferenceName)
                    .forEach(project => {
                        const propertyDetailsArray = Array.isArray(project.propertyDetails)
                            ? project.propertyDetails
                            : Array.from(project.propertyDetails || []);

                        propertyDetailsArray.forEach(detail => {
                            if (detail.shopNo && detail.id) {
                                shopNoIdToShopNoMap[detail.id] = detail.shopNo;
                            }
                        });
                    });

                // Create ID-based options for edit popup
                const shopMap = new Map();
                data.flatMap(t => (t.shopNos || []).filter(shop => !shop.shopClosureDate))
                    .forEach(shop => {
                        const shopNo = shop.shopNoId ? shopNoIdToShopNoMap[shop.shopNoId] : null;
                        if (shopNo && shop.shopNoId && !shopMap.has(shop.shopNoId)) {
                            shopMap.set(shop.shopNoId, shopNo);
                        }
                    });
                
                const editShopOptions = Array.from(shopMap.entries()).map(([shopNoId, shopNo]) => ({
                    label: shopNo,
                    value: shopNoId, // Use shopNoId as value
                    shopNo: shopNo
                }));
                setEditShopNoOptions(editShopOptions);
                
                // Create ID-based tenant options for edit popup from tenant link data
                const editTenantOptions = data.flatMap(t =>
                    (t.shopNos || [])
                        .filter(shop => !shop.shopClosureDate)
                        .map(shop => {
                            const shopNo = shop.shopNoId ? shopNoIdToShopNoMap[shop.shopNoId] : null;
                            return {
                                label: t.tenantName,
                                value: t.id, // Use tenant ID as value
                                tenantName: t.tenantName,
                                shopNoId: shop.shopNoId || null,
                                shopNo: shopNo
                            };
                        })
                        .filter(opt => opt.shopNo)
                );
                // Remove duplicates based on tenant ID
                const uniqueEditTenantOptions = editTenantOptions.filter(
                    (t, i, arr) => arr.findIndex(x => x.value === t.value) === i
                );
                setEditTenantOptions(uniqueEditTenantOptions);
            } else {
                console.log('Error fetching tenant link data.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching tenant link data.');
        }
    };
    
    // Build mapping from IDs to actual values
    useEffect(() => {
        // Build shopNoId -> shopNo mapping from projects (project management)
        const shopNoIdMap = {};
        projects
            .filter(project => project.projectReferenceName) // Only include projects with projectReferenceName
            .forEach(project => {
                // Convert Set to Array if needed
                const propertyDetailsArray = Array.isArray(project.propertyDetails) 
                    ? project.propertyDetails 
                    : Array.from(project.propertyDetails || []);
                
                propertyDetailsArray.forEach(detail => {
                    if (detail.id && detail.shopNo) {
                        shopNoIdMap[detail.id] = detail.shopNo;
                    }
                });
            });
        setShopNoIdToShopNoMap(shopNoIdMap);
        
        // Build tenantNameId -> tenantName mapping from tenantLinkData
        const tenantNameIdMap = {};
        tenantShopData.forEach(tenant => {
            if (tenant.id && tenant.tenantName) {
                tenantNameIdMap[tenant.id] = tenant.tenantName;
            }
        });
        setTenantNameIdToTenantNameMap(tenantNameIdMap);
    }, [projects, tenantShopData]);
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
    const resetFilters = () => {
        setSelectedDate('');
        setShopNo('');
        setSelectedRentMonth('');
        setTenantName('');
        setFormType('');
        setSelectedENo('');
        setPaymentMode('');
        setShowFilters(false);

        sessionStorage.removeItem('selectedDate');
        sessionStorage.removeItem('shopNo');
        sessionStorage.removeItem('selectedRentMonth');
        sessionStorage.removeItem('tenantName');
        sessionStorage.removeItem('formType');
        sessionStorage.removeItem('selectedENo');
        sessionStorage.removeItem('paymentMode');
        sessionStorage.removeItem('showFilters');
    };
    const handleExportExcel = () => {
        if (filteredRentForm.length === 0 || filteredRentForm.length === rentForms.length) {
            alert("No data filtered for export.");
            return;
        }
        const headers = [
            "Shop No",
            "Tenant Name",
            "Amount",
            "Paid On",
            "E No",
            "For the Month Of",
            "Payment Mode",
            "Type"
        ];
        const rows = filteredRentForm.map(rent => [
            rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId] ? shopNoIdToShopNoMap[rent.shopNoId] : rent.shopNo,
            rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId] ? tenantNameIdToTenantNameMap[rent.tenantNameId] : rent.tenantName,
            `${Number(rent.refundAmount || rent.amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            formatDateOnly(rent.paidOnDate),
            rent.eno,
            rent.forTheMonthOf
                ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                })
                : "",
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
        link.setAttribute("download", "Filtered_Rent_Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleExportPDF = () => {
        if (filteredRentForm.length === 0 || filteredRentForm.length === rentForms.length) {
            alert("No data filtered for export.");
            return;
        }
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Filtered Rent Report", 14, 20);
        const tableColumn = ["Shop No", "Tenant Name", "Amount", "Paid On", "For the Month Of", "Payment Mode", "Type", "E No"];
        const tableRows = [];
        filteredRentForm.forEach((rent) => {
            const row = [
                rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId] ? shopNoIdToShopNoMap[rent.shopNoId] : rent.shopNo,
                rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId] ? tenantNameIdToTenantNameMap[rent.tenantNameId] : rent.tenantName,
                `${Number(rent.refundAmount || rent.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`,
                formatDateOnly(rent.paidOnDate),
                rent.forTheMonthOf
                    ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString("default", {
                        month: "long",
                        year: "numeric"
                    })
                    : "",
                rent.paymentMode,
                rent.formType,
                rent.eno
            ];
            tableRows.push(row);
        });
        doc.autoTable({
            startY: 30,
            head: [tableColumn],
            body: tableRows,
            theme: "grid",
            styles: {
                fontSize: 10,
                fontStyle: 'normal',
                textColor: [100, 100, 100], 
                lineColor: [100, 100, 100],
                lineWidth: 0.1,   
            },
            headStyles: {
                fontStyle: 'bold', 
                fillColor: false, 
                textColor: [0, 0, 0], 
                lineColor: [0, 0, 0], 
                lineWidth: 0.1,
            },
        });
        doc.save("FilteredRentReport.pdf");
    };
    const handlePrint = (rent) => {
        const displayShopNo = rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId] ? shopNoIdToShopNoMap[rent.shopNoId] : rent.shopNo;
        const displayTenantName = rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId] ? tenantNameIdToTenantNameMap[rent.tenantNameId] : rent.tenantName;
        const matchingShop = allShops.find(shop => shop.shopNo === displayShopNo);
        const projectReferenceName = matchingShop?.propertyName || 'N/A'; // propertyName stores projectReferenceName
        const qrCodeImage = QRCode;
        const receiptHtml = `
    <html>
    <head>
        <title>Receipt</title>
        <style>
            @media print {
                @page { 
                    size: A4; 
                    margin: 10mm;
                }
                body { 
                    margin: 0;
                    padding: 10px;
                }
                .no-break {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
            }
            body { 
                font-family: Arial, sans-serif; 
                padding: 15px; 
                margin: 0;
                font-size: 12px;
            }
            h2 { 
                text-align: center; 
                margin: 10px 0;
                font-size: 18px;
            }
            h3 {
                margin: 10px 0 5px 0;
                font-size: 14px;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 10px;
                font-size: 11px;
            }
            td, th { 
                padding: 5px; 
                border: 1px solid #ccc; 
            }
            .label { 
                font-weight: bold; 
                width: 40%; 
            }
            .signature { 
                margin-top: 15px;
                font-size: 11px;
            }
            .bank-details-table { 
                margin-top: 15px;
            }
            .qr { 
                text-align: center; 
                margin-top: 15px;
            }
            .qr img {
                width: 150px;
                height: 150px;
            }
        </style>
    </head>
    <body>
        <h2>Rent Payment Receipt</h2>
        <table class="no-break">
            <tr><td class="label">Shop No</td><td>${displayShopNo}</td></tr>
            <tr><td class="label">Tenant Name</td><td>${displayTenantName}</td></tr>
            <tr><td class="label">Project Reference Name</td><td>${projectReferenceName}</td></tr>
            <tr><td class="label">Amount Paid</td><td>₹${Number(rent.refundAmount || rent.amount).toLocaleString('en-IN', {
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

        <div class="no-break">
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
                <img src="${qrCodeImage}" alt="QR Code" />
            </div>
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
    const cancelMomentum = () => {
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
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
                    return enoB - enoA; 
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
                    return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
                });
                setMonthOptions(formattedMonths);
                console.log(formattedMonths);
            })
            .catch((error) => {
                console.error('Error fetching expenses:', error);
            });
    }, []);
    useEffect(() => {
        const filtered = rentForms.filter(rent => {
            const matchesShopNo = shopNo ? rent.shopNo === shopNo : true;
            const matchesTenantName = tenantName ? rent.tenantName === tenantName : true;
            const matchesPaymentMode = paymentMode ? rent.paymentMode === paymentMode : true;
            const matchesFormType = formType ? rent.formType === formType : true;
            // Convert selectedDate (YYYY-MM-DD) to DD-MM-YYYY for comparison with backend format
            const formattedSelectedDate = selectedDate ? convertYYYYMMDDToDDMMYYYY(selectedDate) : '';
            const matchesDate = selectedDate ? rent.paidOnDate === formattedSelectedDate : true;
            const matchesENo = selectedENo ? rent.eno === selectedENo : true;
            const matchesMonth = selectedRentMonth
                ? rent.forTheMonthOf &&
                new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                }) === selectedRentMonth
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
            return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        });
        setMonthOptions(formattedMonths);
    }, [shopNo, tenantName, paymentMode, formType, selectedRentMonth, selectedDate, rentForms, selectedENo]);
    
    const formatDateOnly = (dateString) => {
        if (!dateString) return '';
        // If already in DD-MM-YYYY format, just replace - with /
        if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
            return dateString.replace(/-/g, '/');
        }
        // If in YYYY-MM-DD format, convert to DD/MM/YYYY
        if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
            const parts = dateString.split('-');
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        // Try parsing as date
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return dateString;
    };
    
    // Helper function to convert DD-MM-YYYY to YYYY-MM-DD for date input
    const convertDDMMYYYYToYYYYMMDD = (dateString) => {
        if (!dateString) return '';
        if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
            return dateString;
        }
        if (dateString.includes('-')) {
            const parts = dateString.split('-');
            if (parts.length === 3 && parts[0].length === 2) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return dateString;
    };

    // Helper function to convert YYYY-MM-DD to DD-MM-YYYY
    const convertYYYYMMDDToDDMMYYYY = (dateString) => {
        if (!dateString) return '';
        if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
            return dateString;
        }
        if (dateString.includes('-')) {
            const parts = dateString.split('-');
            if (parts.length === 3 && parts[0].length === 4) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }
        return dateString;
    };
    
    // Function to check if shopNoId is linked to tenantNameId in tenant link data
    const isShopLinkedToTenant = (shopNoId, tenantNameId) => {
        if (!shopNoId || !tenantNameId) return false;
        return tenantShopData.some(tenant => 
            tenant.id === tenantNameId && 
            tenant.shopNos && 
            tenant.shopNos.some(shop => shop.shopNoId === shopNoId && !shop.shopClosureDate)
        );
    };
    
    // Fetch payment modes
    useEffect(() => {
        const fetchPaymentModes = async () => {
            try {
                const response = await fetch('https://backendaab.in/aabuildersDash/api/payment_mode/getAll');
                if (response.ok) {
                    const data = await response.json();
                    const formattedOptions = data.map(mode => ({
                        value: mode.modeOfPayment,
                        label: mode.modeOfPayment
                    }));
                    setPaymentModeOptions(formattedOptions);
                }
            } catch (error) {
                console.error('Error fetching payment modes:', error);
            }
        };
        fetchPaymentModes();
    }, []);
    
    const handleEditClick = (rent) => {
        // Prevent editing Shop Closure or Refund forms
        if (rent.formType === 'Shop Closure' || rent.formType === 'Refund') {
            alert('Cannot edit Shop Closure or Refund forms');
            return;
        }
        
        // Check if shopNoId is linked to tenantNameId
        if (rent.shopNoId && rent.tenantNameId) {
            if (!isShopLinkedToTenant(rent.shopNoId, rent.tenantNameId)) {
                alert('Cannot edit: Shop is not linked to this tenant in tenant link data');
                return;
            }
        }
        
        setEditId(rent.id);
        // Convert paidOnDate from DD-MM-YYYY to YYYY-MM-DD for date input
        const convertedRent = {
            ...rent,
            paidOnDate: convertDDMMYYYYToYYYYMMDD(rent.paidOnDate),
            shopNo: rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId] ? shopNoIdToShopNoMap[rent.shopNoId] : rent.shopNo,
            tenantName: rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId] ? tenantNameIdToTenantNameMap[rent.tenantNameId] : rent.tenantName
        };
        setRentFormData(convertedRent);
        setModalIsOpen(true);
    };
    
    const handleCancel = () => {
        setModalIsOpen(false);
    };
    
    const handleChange = (e) => {
        const { name, type, value, files } = e.target;
        if (name === "paidOnDate" && value === "") {
            return;
        }
        setRentFormData({
            ...rentFormData,
            [name]: type === "file" ? files[0] : value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate that shopNoId is linked to tenantNameId
        if (rentFormData.shopNoId && rentFormData.tenantNameId) {
            if (!isShopLinkedToTenant(rentFormData.shopNoId, rentFormData.tenantNameId)) {
                alert('Cannot save: Selected shop is not linked to selected tenant in tenant link data');
                return;
            }
        }
        
        const {
            formType, shopNoId, tenantNameId, amount,
            refundAmount, paymentMode, paidOnDate,
            forTheMonthOf, attachedFile
        } = rentFormData;
        
        // Convert paidOnDate from YYYY-MM-DD to DD-MM-YYYY for backend
        const formattedPaidOnDate = convertYYYYMMDDToDDMMYYYY(paidOnDate);
        
        // Get shopNo and tenantName from IDs
        const shopNo = shopNoId && shopNoIdToShopNoMap[shopNoId] ? shopNoIdToShopNoMap[shopNoId] : '';
        const tenantName = tenantNameId && tenantNameIdToTenantNameMap[tenantNameId] ? tenantNameIdToTenantNameMap[tenantNameId] : '';
        
        const payload = {
            formType,
            shopNo: shopNo,
            shopNoId: shopNoId,
            tenantName: tenantName,
            tenantNameId: tenantNameId,
            amount,
            refundAmount,
            paymentMode,
            paidOnDate: formattedPaidOnDate,
            forTheMonthOf,
            attachedFile,
        };
        
        setIsSubmitting(true);
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
                handleCancel();
                window.location.reload();
            } else {
                const errorMsg = await response.text();
                alert(`Failed to update: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Error updating rent form:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <body className="bg-[#FAF6ED] ">
            <div>
                <div className='md:mt-[-35px] mb-3 text-left max-w-[1850px] md:text-right md:items-center items-start cursor-default flex flex-col sm:flex-row justify-between table-auto  overflow-auto  gap-2 sm:gap-0'>
                    <div></div>
                    <div className='flex gap-2 sm:gap-4'>
                        <span
                            className='text-[#E4572E] font-semibold hover:underline cursor-pointer text-sm sm:text-base'
                            onClick={handleExportPDF}
                        >
                            Export pdf
                        </span>
                        <span
                            className='text-[#007233] font-semibold hover:underline cursor-pointer text-sm sm:text-base'
                            onClick={handleExportExcel} >
                            Export XL
                        </span>
                        <span className='text-[#BF9853] font-semibold hover:underline text-sm sm:text-base'>Print</span>
                    </div>
                </div>
                <div className="w-full max-w-[1850px] ml-10 mr-10 p-2 sm:p-4 bg-white">
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 lg:gap-0">
                        <div className='flex flex-col sm:flex-row gap-4'>
                            <button className='pl-2' onClick={() => setShowFilters(!showFilters)}>
                                <img
                                    src={Filter}
                                    alt="Toggle Filter"
                                    className="w-7 h-7 border border-[#BF9853] rounded-md"
                                />
                            </button>
                            {(selectedDate || shopNo || tenantName || paymentMode || formType || selectedRentMonth || selectedENo) && (
                                <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                                    {selectedDate && (
                                        <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                                            <span className="font-normal">Paid On Date: </span>
                                            <span className="font-bold">{selectedDate}</span>
                                            <button onClick={() => { setSelectedDate(''); sessionStorage.removeItem('selectedDate'); }}
                                                className="text-[#BF9853] ml-1 text-2xl">
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {shopNo && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Shop N0: </span>
                                            <span className="font-bold">{shopNo}</span>
                                            <button onClick={() => { setShopNo(''); sessionStorage.removeItem('shopNo'); }} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {tenantName && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Tenant Name: </span>
                                            <span className="font-bold">{tenantName}</span>
                                            <button onClick={() => { setTenantName(''); sessionStorage.removeItem('tenantName'); }} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {paymentMode && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Payment Mode: </span>
                                            <span className="font-bold">{paymentMode}</span>
                                            <button onClick={() => { setPaymentMode(''); sessionStorage.removeItem('paymentMode'); }} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {formType && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Type: </span>
                                            <span className="font-bold">{formType}</span>
                                            <button onClick={() => { setFormType(''); sessionStorage.removeItem('formType'); }} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedRentMonth && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">For The Month Of: </span>
                                            <span className="font-bold">{selectedRentMonth}</span>
                                            <button onClick={() => { setSelectedRentMonth(''); sessionStorage.removeItem('selectedRentMonth'); }} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedENo && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">E No: </span>
                                            <span className="font-bold">{selectedENo}</span>
                                            <button onClick={() => { setSelectedENo(''); sessionStorage.removeItem('selectedENo'); }} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className='flex justify-center lg:justify-end'>
                            <button
                                onClick={resetFilters}
                                className='w-full sm:w-36 h-9 border border-[#BF9853] rounded-md font-semibold text-sm text-[#BF9853] flex items-center justify-center gap-2'
                            >
                                <img className='w-4 h-4' src={Reload} alt="Reload" />
                                Reset Table
                            </button>
                        </div>
                    </div>
                    <div className="w-full py-5">
                        <div
                            ref={scrollRef}
                            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[400px] sm:h-[600px] lg:h-[650px] overflow-x-auto select-none no-scrollbar"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <table className="table-auto min-w-[1165px] w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF6ED] text-left sticky top-0 z-900">
                                        <th className="px-2 sm:px-4 py-2 font-bold cursor-pointer text-xs sm:text-sm" onClick={() => handleSort('shopNo')}>
                                            Shop No {sortField === 'shopNo' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th className="px-2 sm:px-4 py-2 font-bold text-xs sm:text-sm" onClick={() => handleSort('tenantName')}>
                                            Tenant Name {sortField === 'tenantName' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th className="px-2 sm:px-4 py-2 font-bold text-xs sm:text-sm">Amount</th>
                                        <th className="px-2 sm:px-4 py-2 font-bold cursor-pointer text-xs sm:text-sm" onClick={() => handleSort('paidOnDate')}>
                                            Paid on {sortField === 'paidOnDate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th className="px-2 sm:px-4 py-2 font-bold cursor-pointer text-xs sm:text-sm" onClick={() => handleSort('eno')}>
                                            E No {sortField === 'eno' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th className="px-2 sm:px-4 py-2 font-bold cursor-pointer text-xs sm:text-sm" onClick={() => handleSort('forTheMonthOf')}>
                                            For the month of {sortField === 'forTheMonthOf' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th className="px-2 sm:px-4 py-2 font-bold text-xs sm:text-sm" onClick={() => handleSort('paymentMode')}>
                                            Payment mode {sortField === 'paymentMode' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th className="px-2 sm:px-4 py-2 font-bold cursor-pointer text-xs sm:text-sm" onClick={() => handleSort('formType')}>
                                            Type {sortField === 'formType' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th className="px-1 sm:px-2 py-2 font-bold text-xs sm:text-sm">Activity</th>
                                        <th className="px-1 sm:px-2 py-2 font-bold text-xs sm:text-sm">Print</th>
                                    </tr>
                                    {showFilters && (
                                        <tr>
                                            <th className="px-1 sm:px-2">
                                                <Select
                                                    className="w-32 sm:w-40 mt-3 mb-3"
                                                    options={shopNoOption.map(type => ({ value: type, label: type }))}
                                                    value={shopNo ? { value: shopNo, label: shopNo } : null}
                                                    onChange={(selectedOption) => {
                                                        const value = selectedOption ? selectedOption.value : '';
                                                        setShopNo(value);
                                                        if (value) {
                                                            sessionStorage.setItem('shopNo', JSON.stringify(value));
                                                        } else {
                                                            sessionStorage.removeItem('shopNo');
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
                                            <th className="px-1 sm:px-2">
                                                <Select
                                                    className="w-36 sm:w-48 mt-3 mb-3"
                                                    options={tenantNameOption.map(type => ({ value: type, label: type }))}
                                                    value={tenantName ? { value: tenantName, label: tenantName } : null}
                                                    onChange={(selectedOption) => {
                                                        const value = selectedOption ? selectedOption.value : '';
                                                        setTenantName(value);
                                                        if (value) {
                                                            sessionStorage.setItem('tenantName', JSON.stringify(value));
                                                        } else {
                                                            sessionStorage.removeItem('tenantName');
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
                                            <th className="px-1 sm:px-2">
                                                <input
                                                    type="date"
                                                    value={selectedDate}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                    className="p-1 -ml-2 sm:-ml-3 mt-3 mb-3 rounded-md bg-transparent w-24 sm:w-32 border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs sm:text-sm"
                                                    placeholder="Search Date..."
                                                />
                                            </th>
                                            <th className="px-1 sm:px-2">
                                                <Select
                                                    className="w-24 sm:w-34 h-10 mt-3 mb-3"
                                                    options={enoOption.map(type => ({ value: type, label: type }))}
                                                    value={selectedENo ? { value: selectedENo, label: selectedENo } : null}
                                                    onChange={(selectedOption) => {
                                                        const value = selectedOption ? selectedOption.value : '';
                                                        setSelectedENo(value);
                                                        if (value) {
                                                            sessionStorage.setItem('selectedENo', JSON.stringify(value));
                                                        } else {
                                                            sessionStorage.removeItem('selectedENo');
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
                                            <th className="px-1 sm:px-2">
                                                <Select
                                                    className="w-36 sm:w-48 mt-3 mb-3"
                                                    options={monthOptions.map(type => ({ value: type, label: type }))}
                                                    value={selectedRentMonth ? { value: selectedRentMonth, label: selectedRentMonth } : null}
                                                    onChange={(selectedOption) => {
                                                        const value = selectedOption ? selectedOption.value : '';
                                                        setSelectedRentMonth(value);
                                                        if (value) {
                                                            sessionStorage.setItem('selectedRentMonth', JSON.stringify(value));
                                                        } else {
                                                            sessionStorage.removeItem('selectedRentMonth');
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
                                            <th className="px-1 sm:px-2">
                                                <Select
                                                    className="w-36 sm:w-48 mt-3 mb-3"
                                                    options={paymentModeOption.map(type => ({ value: type, label: type }))}
                                                    value={paymentMode ? { value: paymentMode, label: paymentMode } : null}
                                                    onChange={(selectedOption) => {
                                                        const value = selectedOption ? selectedOption.value : '';
                                                        setPaymentMode(value);
                                                        if (value) {
                                                            sessionStorage.setItem('paymentMode', JSON.stringify(value));
                                                        } else {
                                                            sessionStorage.removeItem('paymentMode');
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
                                            <th className="px-1 sm:px-2">
                                                <Select
                                                    className="w-32 sm:w-44 mt-3 mb-3"
                                                    options={formTypeOptions.map(type => ({ value: type, label: type }))}
                                                    value={formType ? { value: formType, label: formType } : null}
                                                    onChange={(selectedOption) => {
                                                        const value = selectedOption ? selectedOption.value : '';
                                                        setFormType(value);
                                                        if (value) {
                                                            sessionStorage.setItem('formType', JSON.stringify(value));
                                                        } else {
                                                            sessionStorage.removeItem('formType');
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
                                            <td className="text-xs sm:text-sm pl-1 sm:pl-2 text-left py-2 font-semibold">
                                                {rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId] 
                                                    ? shopNoIdToShopNoMap[rent.shopNoId] 
                                                    : rent.shopNo}
                                            </td>
                                            <td className="text-xs sm:text-sm text-left px-1 font-semibold">
                                                {rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId] 
                                                    ? tenantNameIdToTenantNameMap[rent.tenantNameId] 
                                                    : rent.tenantName}
                                            </td>
                                            <td className={`text-xs sm:text-sm text-left px-2 sm:px-4 font-semibold ${rent.refundAmount ? 'text-red-500' : 'text-black'}`}>
                                                {Number(rent.refundAmount || rent.amount) === 0
                                                    ? 'NIL'
                                                    : `₹${Number(rent.refundAmount || rent.amount).toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}`}
                                            </td>
                                            <td className="text-xs sm:text-sm text-left px-2 sm:px-4 font-semibold">
                                                {Number(rent.refundAmount || rent.amount) === 0 ? 'NIL' : formatDateOnly(rent.paidOnDate)}
                                            </td>
                                            <td className="text-xs sm:text-sm text-left px-1 font-semibold">{rent.eno}</td>
                                            <td className="text-xs sm:text-sm text-left px-1 font-semibold">
                                                {rent.forTheMonthOf
                                                    ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })
                                                    : ''}
                                            </td>
                                            <td className="text-xs sm:text-sm text-left px-1 sm:px-2 font-semibold">{rent.paymentMode}</td>
                                            <td className="text-xs sm:text-sm text-left px-1 sm:px-2 font-semibold">{rent.formType}</td>
                                            <td className="flex w-[100px] justify-between py-2">
                                                <button
                                                    onClick={() => handleEditClick(rent)}
                                                    disabled={rent.formType === 'Shop Closure' || rent.formType === 'Refund'}
                                                    className={`rounded-full transition duration-200 ml-2 mr-3 ${
                                                        rent.formType === 'Shop Closure' || rent.formType === 'Refund' 
                                                            ? 'opacity-50 cursor-not-allowed' 
                                                            : ''
                                                    }`}
                                                    title={rent.formType === 'Shop Closure' || rent.formType === 'Refund' 
                                                        ? 'Cannot edit Shop Closure or Refund forms' 
                                                        : ''}
                                                >
                                                    <img
                                                        src={edit}
                                                        alt="Edit"
                                                        className={`w-4 h-6 transition duration-200 ${
                                                            rent.formType === 'Shop Closure' || rent.formType === 'Refund' 
                                                                ? '' 
                                                                : 'transform hover:scale-110 hover:brightness-110'
                                                        }`}
                                                    />
                                                </button>
                                            </td>
                                            <td className="text-xs sm:text-sm text-left px-1 sm:px-2 py-2 font-semibold">
                                                <button className="text-blue-600 underline text-xs sm:text-sm" onClick={() => handlePrint(rent)}>
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
                            contentLabel="Edit Rent Form"
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
                                            value={editShopNoOptions.find(option => option.value === rentFormData.shopNoId)}
                                            onChange={(selectedOption) => {
                                                const newShopNoId = selectedOption?.value || null;
                                                if (newShopNoId && rentFormData.tenantNameId) {
                                                    if (!isShopLinkedToTenant(newShopNoId, rentFormData.tenantNameId)) {
                                                        alert('Selected shop is not linked to the selected tenant in tenant link data');
                                                        return;
                                                    }
                                                }
                                                setRentFormData({
                                                    ...rentFormData,
                                                    shopNo: selectedOption?.shopNo || '',
                                                    shopNoId: newShopNoId
                                                });
                                            }}
                                            options={editShopNoOptions}
                                            placeholder="--- Select Shop ---"
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
                                            options={editTenantOptions}
                                            value={editTenantOptions.find(opt => opt.value === rentFormData.tenantNameId)}
                                            onChange={(selectedOption) => {
                                                const newTenantNameId = selectedOption?.value || null;
                                                if (rentFormData.shopNoId && newTenantNameId) {
                                                    if (!isShopLinkedToTenant(rentFormData.shopNoId, newTenantNameId)) {
                                                        alert('Selected tenant is not linked to the selected shop in tenant link data');
                                                        return;
                                                    }
                                                }
                                                setRentFormData({
                                                    ...rentFormData,
                                                    tenantName: selectedOption?.tenantName || '',
                                                    tenantNameId: newTenantNameId
                                                });
                                            }}
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
                                            placeholder="--- Select Tenant ---"
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
                    </div>
                </div>
            </div>
        </body>
    )
}
export default Table;