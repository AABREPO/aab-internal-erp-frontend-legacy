import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import edit from '../Images/Edit.svg';
import ExpenseEntryForm from '../ExpensesEntry/Form';
import { useUtilityHubTableDragScroll } from './useUtilityHubTableDragScroll';
import {
    buildTenantLinksMap,
    flattenPropertyStyleRows,
    expandPropertyStyleRowsByVendor,
    findPaymentForServiceMonth,
    getUtilityHubExportYear,
} from './utilityHubTabFilters';

const getTenantLinkPhone = (tenant) =>
    String(
        tenant?.mobileNumber ??
        tenant?.mobile_number ??
        tenant?.phoneNumber ??
        tenant?.phone_number ??
        tenant?.phone ??
        tenant?.tenantPhone ??
        tenant?.tenant_phone ??
        ''
    ).trim();

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getDefaultProfessionFilters = () => ({
    year: new Date().getFullYear().toString(),
    month: MONTH_LABELS[new Date().getMonth()],
    paymentStatus: '',
    vendor: '',
    service: '',
    doorNo: '',
    shop: '',
    projectName: '',
    projectType: '',
    tenant: '',
    occupancyStatus: '',
});

const normalizeShopNoKey = (shopNo) => {
    const raw = (shopNo ?? '').toString().trim();
    if (!raw || raw === '-') return { empty: true, letters: '', number: 0, raw: '' };
    const str = raw.replace(/\s+/g, '').toUpperCase();
    if (!str) return { empty: true, letters: '', number: 0, raw: '' };
    const letterMatch = str.match(/^([A-Z]{1,2})/);
    const letters = letterMatch ? letterMatch[1] : '';
    const numberMatch = str.match(/(\d+)/);
    const number = numberMatch ? parseInt(numberMatch[1], 10) : 0;
    return { empty: false, letters, number, raw: str };
};

const comparePropertyShopNoAsc = (a, b) => {
    const pa = normalizeShopNoKey(a?.shopNo);
    const pb = normalizeShopNoKey(b?.shopNo);
    if (pa.empty !== pb.empty) return pa.empty ? 1 : -1;
    if (pa.empty && pb.empty) return 0;
    if (pa.letters !== pb.letters) return pa.letters < pb.letters ? -1 : pa.letters > pb.letters ? 1 : 0;
    if (pa.number !== pb.number) return pa.number - pb.number;
    return pa.raw.localeCompare(pb.raw, undefined, { numeric: true, sensitivity: 'base' });
};

const sortProjectsPropertyDetailsByShopNo = (projects) => {
    if (!Array.isArray(projects)) return [];
    return projects.map((p) => ({
        ...p,
        propertyDetails: [...(p.propertyDetails || [])].sort(comparePropertyShopNoAsc),
    }));
};

const getProfessionServiceNo = (property) =>
    String(property?.professionalTaxNo ?? property?.professionTaxNo ?? '').trim();

const hasProfessionConnection = (property) => Boolean(getProfessionServiceNo(property));

const paymentMatchesService = (payment, serviceNo) =>
    String(payment?.utilityTypeNumber ?? '').trim() === String(serviceNo ?? '').trim();

const ProfessionTab = ({ username, userRoles = [] }) => {
    
    const [filters, setFilters] = useState(getDefaultProfessionFilters);

    const [projects, setProjects] = useState([]);
    const [professionPayments, setProfessionPayments] = useState([]);
    const [frequencyHistory, setFrequencyHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(''); // Show all by default
    const [showHideModal, setShowHideModal] = useState(false);
    const [hiddenProjects, setHiddenProjects] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [tenantShopData, setTenantShopData] = useState([]);
    const [tenantOptions, setTenantOptions] = useState([]);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activityFormData, setActivityFormData] = useState({
        waterFrequency: '',
        waterStartingMonth: ''
    });
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [submittedFrequencyData, setSubmittedFrequencyData] = useState({});
    const [showExpenseEntryModal, setShowExpenseEntryModal] = useState(false);
    const [expenseEntryPrefill, setExpenseEntryPrefill] = useState(null);
    const monthLabels = MONTH_LABELS;
    const paymentStatusOptions = [
        { value: 'Paid', label: 'Paid' },
        { value: 'Unpaid', label: 'Unpaid' }
    ];
    const occupancyStatusOptions = [
        { value: 'occupied', label: 'Occupied Shop' },
        { value: 'vacated', label: 'Vacated Shop' }
    ];

    const { scrollRef, onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = useUtilityHubTableDragScroll();

    // Fetch projects that have profession tax numbers on properties
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('https://backendaab.in/demoAabuilderDash/api/projects/getAll');
                const projectsWithProfessionTax = (response.data || []).filter(
                    (project) =>
                        project.propertyDetails &&
                        project.propertyDetails.some((property) => getProfessionServiceNo(property) !== '')
                );

                const visibleProjects = projectsWithProfessionTax.filter((project) => !project.hide);
                const hiddenList = projectsWithProfessionTax.filter((project) => project.hide);

                setProjects(sortProjectsPropertyDetailsByShopNo(visibleProjects));
                setHiddenProjects(sortProjectsPropertyDetailsByShopNo(hiddenList));
            } catch (error) {
                console.error('Error fetching projects:', error);
                setError('Failed to fetch projects data');
            }
        };

        fetchProjects();
    }, []);

    useEffect(() => {
        const fetchProfessionPayments = async () => {
            try {
                const response = await axios.get('https://backendaab.in/demoAabuilderDash/expenses_form/utility/profession');
                setProfessionPayments(response.data || []);
            } catch (error) {
                console.error('Error fetching profession tax payments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfessionPayments();
    }, []);

    // Fetch frequency history data
    useEffect(() => {
        const fetchFrequencyHistory = async () => {
            try {
                const response = await axios.get('https://backendaab.in/demoAabuilderDash/api/frequency-history/getAll');
                setFrequencyHistory(response.data || []);
            } catch (error) {
                console.error('Error fetching frequency history:', error);
                // Don't set error for this as it might not be critical
            }
        };

        fetchFrequencyHistory();
    }, []);

    // Fetch vendor names
    useEffect(() => {
        const fetchVendorNames = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll", {
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
                    value: item.vendorName,
                    label: item.vendorName
                }));
                setVendorOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchVendorNames();
    }, []);

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await fetch('https://backendaab.in/demoAabuildersDash/api/tenant_link_shop/getAll');
                if (!response.ok) return;
                const data = await response.json();
                const tenants = Array.isArray(data) ? data : [];
                setTenantShopData(tenants);
                const opts = Array.from(
                    new Set(
                        tenants
                            .map(t => (t?.tenantName || '').toString().trim())
                            .filter(Boolean)
                    )
                )
                    .sort((a, b) => a.localeCompare(b))
                    .map(name => ({ value: name, label: name }));
                setTenantOptions(opts);
            } catch (e) {
                console.error('Error fetching tenants:', e);
            }
        };
        if (projects.length > 0) {
            fetchTenants();
        }
    }, [projects]);

    const tenantNamesTooltipByPropertyId = useMemo(() => {
        const byProperty = new Map();
        if (!Array.isArray(tenantShopData)) return byProperty;
        tenantShopData.forEach((tenant) => {
            const tName = (tenant?.tenantName || '').toString().trim();
            if (!tName) return;
            const tPhone = getTenantLinkPhone(tenant);
            (tenant?.shopNos || []).forEach((shop) => {
                const propertyId = shop?.shopNoId;
                if (propertyId == null || propertyId === '') return;
                const key = String(propertyId);
                if (!byProperty.has(key)) byProperty.set(key, []);
                byProperty.get(key).push({
                    tenantName: tName,
                    tenantPhone: tPhone,
                    shopClosureDate: shop?.shopClosureDate || null,
                });
            });
        });
        const titles = new Map();
        const withPhone = (namesJoined, phonesJoined) => {
            const n = (namesJoined || '').trim() || '-';
            const p = (phonesJoined || '').trim();
            return p ? `${n}\nPhone: ${p}` : n;
        };
        byProperty.forEach((links, id) => {
            if (!links.length) return;
            const active = links.filter((l) => !l.shopClosureDate);
            if (active.length > 0) {
                const names = [...new Set(active.map((l) => l.tenantName).filter(Boolean))].join(', ');
                const phones = [...new Set(active.map((l) => l.tenantPhone).filter(Boolean))].join(', ');
                titles.set(id, withPhone(names, phones));
                return;
            }
            const withClosure = links
                .map((l) => ({
                    tenantName: l.tenantName,
                    tenantPhone: l.tenantPhone,
                    closureTime: l.shopClosureDate ? new Date(l.shopClosureDate).getTime() : NaN,
                }))
                .filter((l) => !Number.isNaN(l.closureTime));
            if (withClosure.length > 0) {
                withClosure.sort((a, b) => b.closureTime - a.closureTime);
                const last = withClosure[0];
                titles.set(id, withPhone(last.tenantName || '-', last.tenantPhone || ''));
                return;
            }
            const names = [...new Set(links.map((l) => l.tenantName).filter(Boolean))].join(', ');
            const phones = [...new Set(links.map((l) => l.tenantPhone).filter(Boolean))].join(', ');
            titles.set(id, withPhone(names, phones));
        });
        return titles;
    }, [tenantShopData]);

    const getServiceNo = (property) => getProfessionServiceNo(property);

    const tableProjects = useMemo(
        () =>
            sortProjectsPropertyDetailsByShopNo(
                (projects || [])
                    .map((project) => ({
                        ...project,
                        propertyDetails: (project.propertyDetails || []).filter((property) =>
                            hasProfessionConnection(property)
                        ),
                    }))
                    .filter((project) => (project.propertyDetails || []).length > 0)
            ),
        [projects]
    );

    const hiddenProfessionTableRows = useMemo(() => {
        const rows = flattenPropertyStyleRows(
            sortProjectsPropertyDetailsByShopNo(hiddenProjects),
            getServiceNo,
            comparePropertyShopNoAsc
        );
        return expandPropertyStyleRowsByVendor(rows, professionPayments, getServiceNo, {
            year: filters.year,
            month: filters.month,
            vendorFilter: '',
        });
    }, [hiddenProjects, professionPayments, filters.year, filters.month]);

    const tenantLinksByPropertyId = useMemo(() => buildTenantLinksMap(tenantShopData), [tenantShopData]);
    const getLinksForProperty = (propertyId) => tenantLinksByPropertyId.get(String(propertyId)) || [];

    // Custom styles for react-select
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            height: '45px',
            border: '2px solid #BF9853',
            borderOpacity: '0.35',
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': {
                border: '2px solid #BF9853',
            },
            ...(state.isFocused && {
                border: '2px solid #BF9853',
                boxShadow: 'none',
            }),
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#BF9853' : state.isFocused ? '#F5F5F5' : 'white',
            color: state.isSelected ? 'white' : 'black',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#9CA3AF',
        }),
    };

    // Get frequency data for a specific property
    const getFrequencyData = (propertyId) => {
        console.log('Looking for frequency data for property ID:', propertyId);
        console.log('Available frequency history:', frequencyHistory);
        const found = frequencyHistory.find(freq => freq.projectNamePropertyDetailsId === propertyId);
        console.log('Found frequency data:', found);
        return found;
    };

    // Determine if a month needs payment based on frequency
    const shouldPayInMonth = (propertyId, month, year) => {
        if (!propertyId) return true;
        if (!frequencyHistory || frequencyHistory.length === 0) return true;

        const propertyIdStr = String(propertyId);
        const records = frequencyHistory.filter((f) => {
            const freqPropertyId = f?.projectNamePropertyDetailsId;
            const freqPropertyIdStr = freqPropertyId !== undefined && freqPropertyId !== null ? String(freqPropertyId) : null;
            return (
                freqPropertyIdStr === propertyIdStr &&
                f.startingMonthOfWaterFrequency
            );
        });
        if (records.length === 0) return true;

        const currentYear = parseInt(year, 10);
        const currentMonth = parseInt(month, 10);
        if (Number.isNaN(currentYear) || Number.isNaN(currentMonth)) return true;

        const currentVal = currentYear * 12 + currentMonth;
        const sorted = records.slice().sort((a, b) => {
            const [aY, aM] = a.startingMonthOfWaterFrequency.split('-').map(Number);
            const [bY, bM] = b.startingMonthOfWaterFrequency.split('-').map(Number);
            return aY * 12 + aM - (bY * 12 + bM);
        });

        let active = null;
        for (const rec of sorted) {
            const [rY, rM] = rec.startingMonthOfWaterFrequency.split('-').map(Number);
            const recVal = rY * 12 + rM;
            if (recVal <= currentVal) active = rec;
            else break;
        }
        if (!active) return true;

        const activeFreqRaw = active.waterFrequencyNo;
        const activeFreqMissing = activeFreqRaw === undefined || activeFreqRaw === null;
        const activeStart = active.startingMonthOfWaterFrequency;
        if (activeFreqMissing || !activeStart) return true;

        const frequency = parseInt(activeFreqRaw, 10);
        if (Number.isNaN(frequency) || frequency < 0) return true;

        const [startYear, startMonth] = String(activeStart).trim().split('-').map(Number);
        const monthsSinceStart = (currentYear - startYear) * 12 + (currentMonth - startMonth);

        // Frequency 0 means: from starting month onwards, no payment required (show "-")
        if (frequency === 0) return monthsSinceStart < 0;

        return monthsSinceStart >= 0 && monthsSinceStart % frequency === 0;
    };

    // Check if payment is made for a specific profession service number and month
    const isPaymentMade = (professionServiceNo, month) => {
        return professionPayments.some(payment =>
            payment.utilityTypeNumber === professionServiceNo &&
            payment.utilityForTheMonth === month
        );
    };

    function getPaymentData(professionServiceNo, month, propertyId, yearOverride, rowVendor) {
        const selectedYear = yearOverride || filters.year || new Date().getFullYear().toString();
        const monthMap = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'June': '06', 'July': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };

        const monthNumber = monthMap[month];
        if (!monthNumber) return { amount: '-', date: null };

        const yearMonth = `${selectedYear}-${monthNumber}`;
        // If a payment exists for this month, always show it (even when frequency=0).
        const existingPayment = findPaymentForServiceMonth(
            professionPayments,
            professionServiceNo,
            yearMonth,
            rowVendor
        );
        if (existingPayment) {
            return {
                amount: existingPayment.amount || '0',
                date: existingPayment.date || null,
                billCopyUrl:
                    existingPayment.billCopyUrl || existingPayment.billCopy || existingPayment.fileUrl || null
            };
        }
        // ✅ Helper: find the active frequency record for this month
        const getActiveFrequencyData = (propertyId, year, monthNumber) => {
            if (!frequencyHistory || frequencyHistory.length === 0) return null;

            const propertyIdStr = String(propertyId);
            const records = frequencyHistory.filter((f) => {
                const freqPropertyId = f?.projectNamePropertyDetailsId;
                const freqPropertyIdStr = freqPropertyId !== undefined && freqPropertyId !== null ? String(freqPropertyId) : null;
                return (
                    freqPropertyIdStr === propertyIdStr &&
                    f.startingMonthOfWaterFrequency
                );
            });

            if (records.length === 0) return null;

            const currentVal = year * 12 + parseInt(monthNumber);

            // Sort ascending
            const sorted = records.sort((a, b) => {
                const [aY, aM] = a.startingMonthOfWaterFrequency.split('-').map(Number);
                const [bY, bM] = b.startingMonthOfWaterFrequency.split('-').map(Number);
                return aY * 12 + aM - (bY * 12 + bM);
            });

            // Pick the most recent record before or equal to current month
            let active = sorted[0];
            for (const rec of sorted) {
                const [rY, rM] = rec.startingMonthOfWaterFrequency.split('-').map(Number);
                const recVal = rY * 12 + rM;
                if (recVal <= currentVal) {
                    active = rec;
                } else {
                    break;
                }
            }
            return active;
        };
        // ✅ Get the correct frequency record
        const freqData = getActiveFrequencyData(propertyId, parseInt(selectedYear), parseInt(monthNumber));
        const freqValue = freqData?.waterFrequencyNo;
        const freqMissing = freqValue === undefined || freqValue === null;
        if (!freqData || freqMissing || !freqData.startingMonthOfWaterFrequency) {
            const payment = findPaymentForServiceMonth(
                professionPayments,
                professionServiceNo,
                yearMonth,
                rowVendor
            );
            if (payment) {
                return {
                    amount: payment.amount || '0',
                    date: payment.date || null,
                    billCopyUrl: payment.billCopyUrl || payment.billCopy || payment.fileUrl || null
                };
            }
            return { amount: '0', date: null }; // Default: monthly
        }
        const frequency = parseInt(freqValue, 10);
        const startingMonth = freqData.startingMonthOfWaterFrequency.trim();
        // Parse YYYY-MM safely
        const [startYear, startMonth] = startingMonth.split('-').map(Number);
        const currentMonth = parseInt(monthNumber);
        const currentYear = parseInt(selectedYear);
        // ✅ Get today's year and month
        const now = new Date();
        const thisYear = now.getFullYear();
        const thisMonth = now.getMonth() + 1;
        // ✅ Don't ask payment for future months
        if (currentYear > thisYear || (currentYear === thisYear && currentMonth > thisMonth)) {
            return { amount: '-', date: null, isNotRequired: true }; // Future month → skip
        }
        // ✅ Calculate months since start
        const monthsSinceStart = (currentYear - startYear) * 12 + (currentMonth - startMonth);
        // ✅ Frequency 0 means: from starting month onwards, not required ("-")
        if (frequency === 0 && monthsSinceStart >= 0) {
            console.log(
                `[ProfessionTab] getPaymentData: property=${propertyId} service=${professionServiceNo} ym=${yearMonth} frequency=0 start=${startingMonth} -> "-" (override payments)`
            );
            return { amount: '-', date: null, isNotRequired: true };
        }
        // ✅ Include starting month as payable
        const shouldPay = monthsSinceStart >= 0 && monthsSinceStart % frequency === 0;
        if (shouldPay) {
            return { amount: '0', date: null }; // Payment required (unpaid)
        } else {
            return { amount: '-', date: null, isNotRequired: true }; // Not due this month
        }
    }
    // Get unpaid count for a Profession Tax number
    const getUnpaidCount = (professionServiceNo, propertyId, rowVendor) => {
        // Use selected year or current year as fallback
        const selectedYear = filters.year || new Date().getFullYear().toString();
        const monthMap = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'June': '06', 'July': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let unpaidCount = 0;
        months.forEach(month => {
            const monthNumber = monthMap[month];
            if (shouldPayInMonth(propertyId, monthNumber, selectedYear)) {
                const yearMonth = `${selectedYear}-${monthNumber}`;
                const payment = findPaymentForServiceMonth(
                    professionPayments,
                    professionServiceNo,
                    yearMonth,
                    rowVendor
                );
                if (!payment) {
                    unpaidCount++;
                }
            }
        });
        return unpaidCount;
    };

    const professionTableRows = useMemo(() => {
        let rows = flattenPropertyStyleRows(tableProjects, getServiceNo, comparePropertyShopNoAsc);

        const selectedService = String(filters.service ?? '').trim();
        if (selectedService) {
            rows = rows.filter(({ property }) => String(getServiceNo(property) ?? '').trim() === selectedService);
        }

        const selectedDoorNo = String(filters.doorNo ?? '').trim();
        if (selectedDoorNo) {
            rows = rows.filter(({ property }) => String(property?.doorNo ?? '').trim() === selectedDoorNo);
        }

        const selectedShop = String(filters.shop ?? '').trim();
        if (selectedShop) {
            rows = rows.filter(({ property }) => String(property?.shopNo ?? '').trim() === selectedShop);
        }

        const selectedProjectName = String(filters.projectName ?? '').trim();
        if (selectedProjectName) {
            rows = rows.filter(({ project }) => String(project?.projectName ?? '').trim() === selectedProjectName);
        }

        const selectedProjectType = String(filters.projectType ?? '').trim();
        if (selectedProjectType) {
            rows = rows.filter(({ property }) => String(property?.projectType ?? '').trim() === selectedProjectType);
        }

        if (selectedCategory) {
            rows = rows.filter(({ project }) => String(project?.projectCategory ?? '').trim() === selectedCategory);
        }

        const selectedTenant = String(filters.tenant ?? '').trim();
        if (selectedTenant) {
            rows = rows.filter(({ property }) =>
                getLinksForProperty(property.id).some(
                    (link) => String(link?.tenantName ?? '').trim() === selectedTenant
                )
            );
        }

        const occupancyStatus = String(filters.occupancyStatus ?? '').trim();
        if (occupancyStatus) {
            rows = rows.filter(({ property }) => {
                const links = getLinksForProperty(property.id);
                const hasActive = links.some((link) => !link?.shopClosureDate);
                const hasVacated = links.some((link) => !!link?.shopClosureDate);
                if (occupancyStatus === 'occupied') return hasActive;
                if (occupancyStatus === 'vacated') return !hasActive && hasVacated;
                return true;
            });
        }

        const paymentStatus = String(filters.paymentStatus ?? '').trim();
        if (paymentStatus) {
            const filterYear = filters.year || new Date().getFullYear().toString();
            const filterMonth = String(filters.month ?? '').trim();

            const rowMatchesPaymentStatus = (property) => {
                const checkMonth = (month) => {
                    const paymentData = getPaymentData(getServiceNo(property), month, property.id, filterYear);
                    const isPaid = paymentData.amount !== '-' && paymentData.amount !== '0';
                    const isUnpaid = paymentData.amount === '0';
                    if (paymentStatus === 'Paid') return isPaid;
                    if (paymentStatus === 'Unpaid') return isUnpaid;
                    return true;
                };
                if (filterMonth) return checkMonth(filterMonth);
                return monthLabels.some((month) => checkMonth(month));
            };

            rows = rows.filter(({ property }) => rowMatchesPaymentStatus(property));
        }

        return rows.map((row, index) => ({
            ...row,
            rowKey: `${row.project?.id ?? 'p'}-${row.property?.id ?? index}`,
        }));
    }, [
        tableProjects,
        filters.service,
        filters.doorNo,
        filters.shop,
        filters.projectName,
        filters.projectType,
        filters.tenant,
        filters.occupancyStatus,
        selectedCategory,
        filters.paymentStatus,
        filters.month,
        filters.year,
        professionPayments,
        frequencyHistory,
        tenantLinksByPropertyId,
    ]);

    const MONTH_NUMBER_MAP = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'June': '06', 'July': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    const flattenProjectsToPropertyRows = (projectList) => {
        const rows = (projectList || []).flatMap((project) =>
            (project.propertyDetails || [])
                .filter((property) => hasProfessionConnection(property))
                .map((property) => ({ project, property }))
        );
        rows.sort((a, b) => comparePropertyShopNoAsc(a.property, b.property));
        return rows;
    };

    const handleFilterChange = (filterType, selectedOption) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: selectedOption ? selectedOption.value : '',
        }));
    };

    const clearFilters = () => {
        setFilters(getDefaultProfessionFilters());
        setSelectedCategory('');
    };

    const getFilterOptions = (fieldKey) => {
        const values = new Set();
        tableProjects.forEach((project) => {
            if (fieldKey === 'projectName' && project.projectName) {
                values.add(String(project.projectName));
            } else {
                (project.propertyDetails || []).forEach((property) => {
                    if (fieldKey === 'doorNo' && property.doorNo) values.add(String(property.doorNo));
                    if (fieldKey === 'shop' && property.shopNo) values.add(String(property.shopNo));
                    if (fieldKey === 'projectType' && property.projectType) values.add(String(property.projectType));
                    if (fieldKey === 'serviceNo' && getServiceNo(property)) values.add(String(getServiceNo(property)));
                });
            }
        });
        return Array.from(values).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((value) => ({
            value,
            label: value,
        }));
    };

    const vendorFilterOptions = useMemo(() => {
        const rows = flattenProjectsToPropertyRows(tableProjects);
        const year = filters.year || new Date().getFullYear().toString();
        const monthNumber = filters.month ? MONTH_NUMBER_MAP[filters.month] : null;
        const yearMonth = monthNumber ? `${year}-${monthNumber}` : null;
        const vendors = new Set();
        rows.forEach(({ property }) => {
            const serviceNo = getServiceNo(property);
            if (!serviceNo) return;
            const paymentsForService = professionPayments.filter((p) => paymentMatchesService(p, serviceNo));
            const scoped = yearMonth
                ? paymentsForService.filter((p) => p?.utilityForTheMonth === yearMonth)
                : paymentsForService.filter((p) => typeof p?.utilityForTheMonth === 'string' && p.utilityForTheMonth.startsWith(`${year}-`));
            scoped.forEach((p) => {
                const v = p?.vendorName ?? p?.vendor ?? p?.vendor_name ?? '';
                if (v) vendors.add(String(v));
            });
        });
        return Array.from(vendors).sort((a, b) => a.localeCompare(b)).map((value) => ({ value, label: value }));
    }, [tableProjects, filters.year, filters.month, professionPayments]);

    const tenantFilterOptions = useMemo(() => {
        const rows = flattenProjectsToPropertyRows(tableProjects);
        const names = new Set();
        rows.forEach(({ property }) => {
            getLinksForProperty(property.id).forEach((l) => {
                const name = (l.tenantName || '').trim();
                if (name) names.add(name);
            });
        });
        return Array.from(names).sort((a, b) => a.localeCompare(b)).map((value) => ({ value, label: value }));
    }, [tableProjects, tenantLinksByPropertyId]);

    const resolveExportYear = () => getUtilityHubExportYear(filters);

    const buildExportRows = (exportYear = resolveExportYear()) =>
        professionTableRows.map(({ project, property }, index) => {
            const rowNumber = index + 1;
            const serviceNo = getProfessionServiceNo(property) || '-';
            const row = {
                slNo: rowNumber,
                pid: project.projectId || '-',
                projectName: project.projectName || '-',
                category: property.projectType || project.projectCategory || '-',
                doorNo: property.doorNo || '-',
                shopNo: property.shopNo || '-',
                serviceNo,
            };

            monthLabels.forEach((month) => {
                const paymentData = getPaymentData(
                    getProfessionServiceNo(property),
                    month,
                    property.id,
                    exportYear
                );
                row[month] = paymentData && paymentData.amount !== undefined ? paymentData.amount : '-';
            });

            row.unpaid = getUnpaidCount(getProfessionServiceNo(property), property.id);
            return row;
        });

    const handleExportPDF = () => {
        const exportYear = resolveExportYear();
        const rows = buildExportRows(exportYear);
        if (!rows.length) return;

        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(14);
        doc.text(`Profession Tax Projects Overview - ${exportYear}`, 14, 20);

        const headers = ['Sl.No', 'PID', 'Project Name', 'Category', 'Shop No', 'D.No', 'Service No', ...monthLabels, 'Unpaid'];
        const body = rows.map((row) => [
            row.slNo,
            row.pid,
            row.projectName,
            row.category,
            row.shopNo,
            row.doorNo,
            row.serviceNo,
            ...monthLabels.map((month) => row[month]),
            row.unpaid
        ]);

        doc.autoTable({
            head: [headers],
            body,
            startY: 28,
            styles: {
                fontSize: 7,
                cellPadding: 2
            },
            headStyles: {
                fillColor: [191, 152, 83]
            },
            margin: {
                left: 10,
                right: 10
            }
        });

        doc.save(`ProfessionTaxProjects_${exportYear}.pdf`);
    };

    const handleExportExcel = () => {
        const exportYear = resolveExportYear();
        const rows = buildExportRows(exportYear);
        if (!rows.length) return;

        const worksheetData = rows.map((row) => {
            const base = {
                'Sl.No': row.slNo,
                PID: row.pid,
                'Project Name': row.projectName,
                Category: row.category,
                'Shop No': row.shopNo,
                'D.No': row.doorNo,
                'Service No': row.serviceNo
            };

            monthLabels.forEach((month) => {
                base[month] = row[month];
            });

            base.Unpaid = row.unpaid;
            return base;
        });

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ProfessionTax');
        XLSX.writeFile(workbook, `ProfessionTaxProjects_${exportYear}.xlsx`);
    };

    const hasExportableData = professionTableRows.length > 0;
    const displayYear = resolveExportYear();

    const toggleProjectHideStatus = async (projectId, isHide) => {
        try {
            const response = await axios.put(`https://backendaab.in/demoAabuilderDash/api/projects/hide/${projectId}`, null, {
                params: { isHide }
            });
            if (response.data) {
                if (isHide) {
                    const projectToHide = projects.find(p => p.id === projectId);
                    if (projectToHide) {
                        setProjects(prev => prev.filter(p => p.id !== projectId));
                        setHiddenProjects(prev => [...prev, { ...projectToHide, hide: true }]);
                    }
                } else {
                    const projectToShow = hiddenProjects.find(p => p.id === projectId);
                    if (projectToShow) {
                        setHiddenProjects(prev => prev.filter(p => p.id !== projectId));
                        setProjects(prev => [...prev, { ...projectToShow, hide: false }]);
                    }
                }
            }
        } catch (error) {
            console.error('Error updating project hide status:', error);
        }
    };
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    const handleFileClick = (fileData) => {
        if (fileData && fileData.billCopyUrl) {
            window.open(fileData.billCopyUrl, '_blank');
        } else if (fileData) {
            alert('No file attached for this payment');
        }
    };
    const handleActivityEdit = (project, property) => {
        setSelectedRowData({ project, property });
        setActivityFormData({
            waterFrequency: '',
            waterStartingMonth: ''
        });
        setShowActivityModal(true);
    };
    const handleActivitySubmit = async () => {
        if (!activityFormData.waterFrequency.trim() || !activityFormData.waterStartingMonth) {
            alert('Please fill in all required fields');
            return;
        }
        try {
            const frequencyHistoryData = {
                projectNamePropertyDetailsId: selectedRowData.property.id, // Property ID from the selected row
                waterFrequencyNo: parseInt(activityFormData.waterFrequency, 10),
                startingMonthOfWaterFrequency: activityFormData.waterStartingMonth,
                electricityFrequencyNo: null,
                startingMonthOfElectricityFrequency: null,
                propertyFrequencyNo: null,
                startingMonthOfPropertyFrequency: null
            };
            const response = await axios.post('https://backendaab.in/demoAabuilderDash/api/frequency-history/save', frequencyHistoryData);
            if (response.data) {
                setSubmittedFrequencyData(prev => ({
                    ...prev,
                    [selectedRowData.property.id]: {
                        waterFrequency: activityFormData.waterFrequency,
                        waterStartingMonth: activityFormData.waterStartingMonth
                    }
                }));
                const fetchFrequencyHistory = async () => {
                    try {
                        const response = await axios.get('https://backendaab.in/demoAabuilderDash/api/frequency-history/getAll');
                        setFrequencyHistory(response.data || []);
                    } catch (error) {
                        console.error('Error fetching frequency history:', error);
                    }
                };
                fetchFrequencyHistory();
                alert('Profession frequency history saved successfully!');
                setShowActivityModal(false);
                setSelectedRowData(null);
                setActivityFormData({
                    waterFrequency: '',
                    waterStartingMonth: ''
                });
            }
        } catch (error) {
            console.error('Error saving frequency history:', error);
            alert('Failed to save frequency history. Please try again.');
        }
    };

    const handleOpenExpenseEntryPopup = ({ professionServiceNo, project, property }) => {
        const prefillData = {
            utilityType: 'Profession',
            siteName: project?.projectName || project?.siteName || '',
            projectId: project?.id ?? project?.projectId ?? null,
            propertyId: property?.id ?? null,
            utilityIdentifier: { key: 'professionalTaxNo', value: professionServiceNo },
            professionalTaxNo: professionServiceNo,
            professionTaxNo: professionServiceNo,
            utilityTypeNumber: professionServiceNo,
        };
        try {
            localStorage.setItem('expenseEntryPrefill', JSON.stringify(prefillData));
        } catch {
            // ignore storage errors
        }
        setExpenseEntryPrefill(prefillData);
        setShowExpenseEntryModal(true);
    };

    return (
        <div className="bg-[#FAF6ED] rounded-lg shadow-sm">
            {showExpenseEntryModal ? (
                <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-[1824px] max-h-[92vh] overflow-y-auto shadow-lg relative">
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                            <p className="text-sm font-semibold text-[#202020]">Expense Entry</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowExpenseEntryModal(false);
                                    setExpenseEntryPrefill(null);
                                    try { localStorage.removeItem('expenseEntryPrefill'); } catch { /* ignore */ }
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 text-xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-3">
                            <ExpenseEntryForm
                                username={username}
                                userRoles={userRoles}
                                embedded
                                lockUtilityPrefillFields
                                onSuccess={async () => {
                                    setShowExpenseEntryModal(false);
                                    setExpenseEntryPrefill(null);
                                    try { localStorage.removeItem('expenseEntryPrefill'); } catch { /* ignore */ }
                                    try {
                                        const response = await axios.get('https://backendaab.in/demoAabuilderDash/expenses_form/utility/profession');
                                        setProfessionPayments(response.data || []);
                                    } catch {
                                        // ignore refresh errors
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : null}
            <div className="bg-white rounded-md mb-5 min-h-[128px] ml-5 mr-5">
                <div className="p-6">
                    {/* 10 filters -> grid of 5 columns naturally renders them as 2 rows */}
                    <div className="flex flex-wrap gap-4 text-left items-end">
                    <div className="grid grid-cols-6 gap-4 flex-1 min-w-0">
                        <div>
                            <label className="block font-semibold mb-1">Year</label>
                            <Select
                                options={[
                                    { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
                                    { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
                                    { value: (new Date().getFullYear() - 2).toString(), label: (new Date().getFullYear() - 2).toString() }
                                ]}
                                value={filters.year ? { value: filters.year, label: filters.year } : { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() }}
                                onChange={(selectedOption) => handleFilterChange('year', selectedOption)}
                                placeholder="Select Year"
                                isClearable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Vendor</label>
                            <Select
                                options={vendorFilterOptions}
                                value={filters.vendor ? { value: filters.vendor, label: filters.vendor } : null}
                                onChange={(selectedOption) => handleFilterChange('vendor', selectedOption)}
                                placeholder="Select Vendor"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Month</label>
                            <Select
                                options={monthLabels.map(month => ({ value: month, label: month }))}
                                value={filters.month ? { value: filters.month, label: filters.month } : null}
                                onChange={(selectedOption) => handleFilterChange('month', selectedOption)}
                                placeholder="Select Month"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Payment Status</label>
                            <Select
                                options={paymentStatusOptions}
                                value={filters.paymentStatus ? { value: filters.paymentStatus, label: filters.paymentStatus } : null}
                                onChange={(selectedOption) => handleFilterChange('paymentStatus', selectedOption)}
                                placeholder="Select Status"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Service</label>
                            <Select
                                options={getFilterOptions('serviceNo')}
                                value={filters.service ? { value: filters.service, label: filters.service } : null}
                                onChange={(selectedOption) => handleFilterChange('service', selectedOption)}
                                placeholder="Select Service No"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Door No</label>
                            <Select
                                options={getFilterOptions('doorNo')}
                                value={filters.doorNo ? { value: filters.doorNo, label: filters.doorNo } : null}
                                onChange={(selectedOption) => handleFilterChange('doorNo', selectedOption)}
                                placeholder="Select Door No"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Shop</label>
                            <Select
                                options={getFilterOptions('shop')}
                                value={filters.shop ? { value: filters.shop, label: filters.shop } : null}
                                onChange={(selectedOption) => handleFilterChange('shop', selectedOption)}
                                placeholder="Select Shop"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Project Name</label>
                            <Select
                                options={getFilterOptions('projectName')}
                                value={filters.projectName ? { value: filters.projectName, label: filters.projectName } : null}
                                onChange={(selectedOption) => handleFilterChange('projectName', selectedOption)}
                                placeholder="Select Project"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Project Type</label>
                            <Select
                                options={getFilterOptions('projectType')}
                                value={filters.projectType ? { value: filters.projectType, label: filters.projectType } : null}
                                onChange={(selectedOption) => handleFilterChange('projectType', selectedOption)}
                                placeholder="Select Project Type"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Tenant</label>
                            <Select
                                options={tenantFilterOptions}
                                value={filters.tenant ? { value: filters.tenant, label: filters.tenant } : null}
                                onChange={(selectedOption) => handleFilterChange('tenant', selectedOption)}
                                placeholder="Select Tenant"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Occupancy Status</label>
                            <Select
                                options={occupancyStatusOptions}
                                value={filters.occupancyStatus ? { value: filters.occupancyStatus, label: occupancyStatusOptions.find(o => o.value === filters.occupancyStatus)?.label || filters.occupancyStatus } : null}
                                onChange={(selectedOption) => handleFilterChange('occupancyStatus', selectedOption)}
                                placeholder="Select Status"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="px-5 py-2 h-[45px] border-2 border-[#BF9853] text-[#BF9853] rounded-lg font-semibold hover:bg-[#FAF6ED] transition-colors whitespace-nowrap shrink-0"
                    >
                        Clear
                    </button>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-md ml-5 mr-5 p-6">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedCategory(selectedCategory === 'Client Project' ? '' : 'Client Project')}
                                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${selectedCategory === 'Client Project'
                                    ? 'bg-[#BF9853] text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Clients Projects
                            </button>
                            <button onClick={() => setSelectedCategory(selectedCategory === 'Own Project' ? '' : 'Own Project')}
                                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${selectedCategory === 'Own Project'
                                    ? 'bg-[#BF9853] text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Own Projects
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-black">
                            <button
                                type="button"
                                onClick={handleExportPDF}
                                disabled={loading || !hasExportableData}
                                className="flex items-center font-semibold gap-2 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-current"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                Export PDF
                            </button>
                            <button
                                type="button"
                                onClick={handleExportExcel}
                                disabled={loading || !hasExportableData}
                                className="flex items-center font-semibold gap-2 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-current"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Export XL
                            </button>
                            <button className="flex items-center font-semibold gap-2 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                                </svg>
                                Print
                            </button>
                            <button onClick={() => setShowHideModal(true)} className="px-4 py-2 bg-[#BF9853] text-white rounded-lg font-semibold hover:bg-[#A68B4A] transition-colors" >
                                Hide Items
                            </button>
                        </div>
                    </div>
                    <h2 className="text-center text-lg font-semibold text-gray-800 mb-3">
                        Profession Tax Projects Overview - {displayYear}
                    </h2>
                    <div className="rounded-lg">
                        <div
                            ref={scrollRef}
                            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[480px] overflow-auto select-none thin-scrollbar"
                            onMouseDown={onMouseDown}
                            onMouseMove={onMouseMove}
                            onMouseUp={onMouseUp}
                            onMouseLeave={onMouseLeave}
                        >
                            <table className="w-full border-collapse table-auto min-w-max">
                                <thead className="sticky top-0 z-10 bg-[#FAF6ED]">
                                    <tr className="bg-[#FAF6ED]">
                                        <td className=" px-4 py-2 text-left font-semibold">Sl.No</td>
                                        <td className=" px-4 py-2 text-left font-semibold">PID</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Project Name</td>
                                        <td className=" px-4 py-2 text-left font-semibold"></td>
                                        <td className=" px-4 py-2 text-left font-semibold">Shop No</td>
                                        <td className=" px-4 py-2 text-left font-semibold">D.No</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Service No</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Jan</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Feb</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Mar</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Apr</td>
                                        <td className=" px-4 py-2 text-left font-semibold">May</td>
                                        <td className=" px-4 py-2 text-left font-semibold">June</td>
                                        <td className=" px-4 py-2 text-left font-semibold">July</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Aug</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Sep</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Oct</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Nov</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Dec</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Unpaid</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Activity</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Hide</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="22" className="text-center py-4">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="22" className="text-center py-4 text-red-500">
                                                {error}
                                            </td>
                                        </tr>
                                    ) : professionTableRows.length === 0 ? (
                                        <tr>
                                            <td colSpan="22" className="text-center py-4">
                                                No projects found with profession tax connections
                                            </td>
                                        </tr>
                                    ) : (
                                        professionTableRows.map(({ project, property, rowKey }, index) => {
                                                    return (
                                                        <tr key={rowKey || `${project.id}-${property.id}`} className="odd:bg-white even:bg-[#FAF6ED]">
                                                            <td className="px-4 py-2">{index + 1}</td>
                                                            <td className="px-4 py-2">{project.projectId}</td>
                                                            <td className="px-4 py-2 text-left">{project.projectName}</td>
                                                            <td className="px-4 py-2">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.projectCategory === 'Client Project'
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : project.projectCategory === 'Own Project'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {property.projectType || project.projectCategory || '-'}
                                                                </span>
                                                            </td>
                                                            <td
                                                                className="px-4 py-2 whitespace-nowrap cursor-default"
                                                                title={tenantNamesTooltipByPropertyId.get(property.id != null ? String(property.id) : '') || undefined}
                                                            >
                                                                {property.shopNo || '-'}
                                                            </td>
                                                            <td className="px-4 py-2">{property.doorNo || '-'}</td>
                                                            <td
                                                                className="px-4 py-2 text-left text-sm font-semibold text-black cursor-pointer hover:text-[#BF9853] hover:underline"
                                                                onClick={() =>
                                                                    handleOpenExpenseEntryPopup({
                                                                        professionServiceNo: getProfessionServiceNo(property),
                                                                        project,
                                                                        property
                                                                    })
                                                                }
                                                            >
                                                                {getProfessionServiceNo(property)}
                                                            </td>
                                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => {
                                                                const paymentData = getPaymentData(getProfessionServiceNo(property), month, property.id, undefined);
                                                                const isPaid = paymentData.amount !== '-' && paymentData.amount !== '0';
                                                                const isNotRequired = paymentData.isNotRequired;
                                                                return (
                                                                    <td key={month} className="px-4 py-2">
                                                                        <span
                                                                            className={`text-sm font-medium ${isNotRequired
                                                                                ? 'text-gray-400 cursor-default'
                                                                                : isPaid
                                                                                    ? 'text-green-600 hover:text-green-800 cursor-pointer'
                                                                                    : paymentData.amount === '0'
                                                                                        ? 'text-red-600 hover:text-red-800 cursor-pointer'
                                                                                        : 'text-gray-500 cursor-default'
                                                                                }`}
                                                                            title={isNotRequired ? 'No payment required this month' : paymentData.date ? `Date: ${formatDate(paymentData.date)}` : ''}
                                                                            onClick={isNotRequired ? undefined : () => handleFileClick(paymentData)}
                                                                        >
                                                                            {paymentData.amount}
                                                                        </span>
                                                                    </td>
                                                                );
                                                            })}
                                                            <td className="px-4 py-2">
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {getUnpaidCount(getProfessionServiceNo(property), property.id)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <button onClick={() => handleActivityEdit(project, property)}
                                                                    className="rounded-full transition duration-200 hover:scale-110 hover:brightness-110"
                                                                >
                                                                    <img
                                                                        src={edit}
                                                                        alt="Edit"
                                                                        className="w-5 h-4 transform hover:scale-110 hover:brightness-110 transition duration-200"
                                                                    />
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <button onClick={() => toggleProjectHideStatus(project.id, true)} className="text-red-600 hover:text-red-800 text-sm" >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {showHideModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-4/5 max-w-6xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Hide Items</h2>
                            <button onClick={() => setShowHideModal(false)} className="text-red-600 hover:text-red-800" >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {hiddenProjects.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No hidden items</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#FAF6ED]">
                                            <td className="px-4 py-2 text-left font-semibold">Sl.No</td>
                                            <td className="px-4 py-2 text-left font-semibold">PID</td>
                                            <td className="px-4 py-2 text-left font-semibold">Project Name</td>
                                            <td className="px-4 py-2 text-left font-semibold">Shop No</td>
                                            <td className="px-4 py-2 text-left font-semibold">D.No</td>
                                            <td className="px-4 py-2 text-left font-semibold">Service No</td>
                                            <td className="px-4 py-2 text-left font-semibold">Unhide</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hiddenProfessionTableRows.map(({ project, property, rowKey }, index) => {
                                                    return (
                                                        <tr key={rowKey || `${project.id}-${property.id}`} className="odd:bg-white even:bg-[#FAF6ED]">
                                                            <td className="px-4 py-2">{index + 1}</td>
                                                            <td className="px-4 py-2">{project.projectId}</td>
                                                            <td className="px-4 py-2">{project.projectName}</td>
                                                            <td
                                                                className="px-4 py-2 cursor-default"
                                                                title={tenantNamesTooltipByPropertyId.get(property.id != null ? String(property.id) : '') || undefined}
                                                            >
                                                                {property.shopNo || '-'}
                                                            </td>
                                                            <td className="px-4 py-2">{property.doorNo || '-'}</td>
                                                            <td
                                                                className="px-4 py-2 text-left text-sm font-semibold text-black cursor-pointer hover:text-[#BF9853] hover:underline"
                                                                onClick={() =>
                                                                    handleOpenExpenseEntryPopup({
                                                                        professionServiceNo: getProfessionServiceNo(property),
                                                                        project,
                                                                        property
                                                                    })
                                                                }
                                                            >
                                                                {getProfessionServiceNo(property)}
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <button onClick={() => toggleProjectHideStatus(project.id, false)} className="text-red-600 hover:text-red-800" >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {showActivityModal && selectedRowData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[600px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Activity Entry</h2>
                            <button
                                onClick={() => { setShowActivityModal(false); setSelectedRowData(null); setActivityFormData({ waterFrequency: '', waterStartingMonth: '' }); }}
                                className="text-red-600 hover:text-red-800"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-3 text-left">
                            <div className="bg-gray-50 flex p-3 w-auto rounded-lg">
                                <div className=' border-r border-gray-300 px-3'>
                                    <h3 className="font-semibold text-gray-700 mb-1">Project Details:</h3>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Project:</span> {selectedRowData.project.projectName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Service No:</span>{' '}
                                        {selectedRowData?.property
                                            ? getProfessionServiceNo(selectedRowData.property)
                                            : '-'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Door No:</span> {selectedRowData.property.doorNo || '-'}
                                    </p>
                                </div>
                                <div className='pl-5'>
                                     {(() => {
                                         const propertyId = selectedRowData?.property?.id;
                                         const propertyIdStr = propertyId !== undefined && propertyId !== null ? String(propertyId) : null;
                                         const allFrequencyData = frequencyHistory
                                             .filter((freq) => {
                                                 const freqPropertyId = freq?.projectNamePropertyDetailsId;
                                                 const freqPropertyIdStr =
                                                     freqPropertyId !== undefined && freqPropertyId !== null ? String(freqPropertyId) : null;
                                                 const freqRaw = freq?.waterFrequencyNo;
                                                 const hasFreq = freqRaw !== undefined && freqRaw !== null; // allow 0
                                                 const hasStart = !!freq?.startingMonthOfWaterFrequency;
                                                 return !!propertyIdStr && freqPropertyIdStr === propertyIdStr && hasFreq && hasStart;
                                             })
                                             .sort((a, b) => {
                                                 const aKey = String(a.startingMonthOfWaterFrequency || '');
                                                 const bKey = String(b.startingMonthOfWaterFrequency || '');
                                                 return aKey.localeCompare(bKey);
                                             });
                                         const submittedData = submittedFrequencyData[selectedRowData.property.id];
                                         if (submittedData?.waterFrequency && submittedData?.waterStartingMonth) {
                                             allFrequencyData.push({
                                                 waterFrequencyNo: submittedData.waterFrequency,
                                                 startingMonthOfWaterFrequency: submittedData.waterStartingMonth
                                             });
                                         }
                                         // Dedupe: backend refresh + optimistic push can show duplicates until reload
                                         const dedupedFrequencyData = Array.from(
                                             new Map(
                                                 allFrequencyData.map((row) => {
                                                     const freqVal = row?.waterFrequencyNo;
                                                     const startVal = String(
                                                         row?.startingMonthOfWaterFrequency || ''
                                                     ).trim();
                                                     return [`${startVal}__${freqVal}`, row];
                                                 })
                                             ).values()
                                         ).sort((a, b) => {
                                             const aKey = String(a.startingMonthOfWaterFrequency || '');
                                             const bKey = String(b.startingMonthOfWaterFrequency || '');
                                             return aKey.localeCompare(bKey);
                                         });
                                         if (allFrequencyData.length > 0) {
                                             return (
                                                 <div className="mt-2">
                                                     <table className="w-[200px] border-collapse border border-gray-300">
                                                         <thead>
                                                             <tr className="bg-gray-100">
                                                                 <th className="border border-gray-300 px-2 py-1 text-left text-xs font-semibold">Frequency</th>
                                                                 <th className="border border-gray-300 px-2 py-1 text-left text-xs font-semibold">Starting Month</th>
                                                             </tr>
                                                         </thead>
                                                         <tbody>
                                                             {dedupedFrequencyData.map((freqData, index) => (
                                                                 <tr key={index}>
                                                                    <td className="border border-gray-300 px-2 py-1 text-xs">{freqData.waterFrequencyNo}</td>
                                                                    <td className="border border-gray-300 px-2 py-1 text-xs">{new Date((freqData.startingMonthOfWaterFrequency) + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                                                                 </tr>
                                                             ))}
                                                         </tbody>
                                                     </table>
                                                 </div>
                                             );
                                         }
                                         return null;
                                     })()}
                                </div>
                            </div>
                            <div className='flex gap-4'>
                                <div>
                                    <label className="text-md font-semibold mb-2 block">
                                        Profession Frequency <span className="text-red-500">*</span>
                                    </label>
                                    <input type="number"
                                        value={activityFormData.waterFrequency}
                                        onChange={(e) => setActivityFormData(prev => ({
                                            ...prev,
                                            waterFrequency: e.target.value
                                        }))}
                                        placeholder="Enter profession frequency"
                                        className="border-2 border-[#BF9853] rounded-lg px-4 py-2 w-[290px] h-[45px] focus:outline-none border-opacity-[0.20]"
                                    />
                                </div>
                                <div>
                                    <label className="text-md font-semibold mb-2 block">
                                        Profession Starting Month <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="month"
                                        value={activityFormData.waterStartingMonth}
                                        onChange={(e) => setActivityFormData(prev => ({
                                            ...prev,
                                            waterStartingMonth: e.target.value
                                        }))}
                                        className="border-2 border-[#BF9853] rounded-lg px-4 py-2 w-[250px] h-[45px] focus:outline-none border-opacity-[0.20]"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowActivityModal(false);
                                        setSelectedRowData(null);
                                        setActivityFormData({ waterFrequency: '', waterStartingMonth: '' });
                                    }}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button onClick={handleActivitySubmit} className="px-4 py-2 bg-[#BF9853] text-white rounded-lg hover:bg-[#A68B4A] transition-colors">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}           
        </div>
    );
};
export default ProfessionTab;