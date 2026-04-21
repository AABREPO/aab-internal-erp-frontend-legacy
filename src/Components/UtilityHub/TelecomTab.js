import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import edit from '../Images/Edit.svg';
import ExpenseEntryForm from '../ExpensesEntry/Form';

const TELECOM_DIRECTORY_ENDPOINT = 'https://backendaab.in/demoAabuildersDash/api/utility-telecom/getAll';
const PROJECTS_ENDPOINT = 'https://backendaab.in/demoAabuilderDash/api/projects/getAll';
const TELECOM_EXPENSES_ENDPOINT = 'https://backendaab.in/demoAabuilderDash/expenses_form/utility/telecom';
const FREQUENCY_HISTORY_ENDPOINT = 'https://backendaab.in/demoAabuildersDash/api/utility-frequency/getAll';
const SAVE_FREQUENCY_HISTORY_ENDPOINT = 'https://backendaab.in/demoAabuildersDash/api/utility-frequency/save';

const TelecomTab = ({ username, userRoles = [] }) => {
    const [filters, setFilters] = useState({
        year: new Date().getFullYear().toString(),
        month: '',
        paymentStatus: '',
        vendor: '',
        service: '',
        doorNo: '',
        shop: '',
        projectName: '',
        projectType: '',
        tenant: ''
    });
    const [projects, setProjects] = useState([]);
    const [telecomPayments, setTelecomPayments] = useState([]);
    const [frequencyHistory, setFrequencyHistory] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showHideModal, setShowHideModal] = useState(false);
    const [hiddenProjects, setHiddenProjects] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activityFormData, setActivityFormData] = useState({
        telecomFrequency: '',
        telecomStartingMonth: ''
    });
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [submittedFrequencyData, setSubmittedFrequencyData] = useState({});
    const [showExpenseEntryModal, setShowExpenseEntryModal] = useState(false);
    const [expenseEntryPrefill, setExpenseEntryPrefill] = useState(null);
    const paymentStatusOptions = [
        { value: 'Paid', label: 'Paid' },
        { value: 'Unpaid', label: 'Unpaid' }
    ];

    const openTelecomExpenseEntry = (serviceNumber, project) => {
        const prefillData = {
            utilityType: 'Telecom',
            siteName: project?.projectName || '-',
            projectId: project?.id ?? null,
            propertyId: null,
            utilityIdentifier: { key: 'utilityTypeNumber', value: serviceNumber },
            utilityTypeNumber: serviceNumber
        };
        try {
            localStorage.setItem('expenseEntryPrefill', JSON.stringify(prefillData));
        } catch {
            // ignore storage errors
        }
        setExpenseEntryPrefill(prefillData);
        setShowExpenseEntryModal(true);
    };

    useEffect(() => {
        const fetchTelecomData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [telecomRes, projectsRes, expensesRes] = await Promise.all([
                    axios.get(TELECOM_DIRECTORY_ENDPOINT),
                    axios.get(PROJECTS_ENDPOINT),
                    axios.get(TELECOM_EXPENSES_ENDPOINT).catch(err => {
                        console.error('Error fetching telecom payments:', err);
                        return { data: [] };
                    })
                ]);

                const telecomEntries = Array.isArray(telecomRes.data) ? telecomRes.data : [];
                const projectRecords = Array.isArray(projectsRes.data) ? projectsRes.data : [];

                const projectLookup = new Map();
                projectRecords.forEach(record => {
                    const projectIdVariants = [
                        record.id,
                        record.projectId,
                        record.project_id,
                        record.projectID
                    ];
                    projectIdVariants.forEach(key => {
                        if (key !== undefined && key !== null) {
                            projectLookup.set(String(key), {
                                id: record.id ?? record.projectId ?? record.project_id ?? record.projectID ?? String(key),
                                projectId: record.projectId ?? record.project_id ?? record.projectID ?? record.projectCode ?? '-',
                                projectName: record.projectName ?? record.siteName ?? record.project ?? '-',
                                projectCategory: record.projectCategory ?? record.project_category ?? record.category ?? '',
                                raw: record
                            });
                        }
                    });
                });

                const groupedProjectsMap = new Map();
                const vendorSet = new Set();
                const normalize = (value) => (value ? String(value).trim().toLowerCase() : '');

                telecomEntries
                    .filter(entry => entry && (entry.service_number || entry.serviceNumber))
                    .forEach(entry => {
                        const serviceNumber = entry.service_number ?? entry.serviceNumber;
                        if (!serviceNumber || !String(serviceNumber).trim()) {
                            return;
                        }
                        const rawProjectId = entry.project_id ?? entry.projectId ?? entry.projectID ?? null;
                        const projectKey = rawProjectId !== null ? String(rawProjectId) : `telecom-${entry.id ?? serviceNumber}`;
                        const projectMeta = rawProjectId !== null ? projectLookup.get(String(rawProjectId)) : null;

                        const existingProject = groupedProjectsMap.get(projectKey) || {
                            id: projectKey,
                            projectId: projectMeta?.projectId ?? rawProjectId ?? '-',
                            projectName: projectMeta?.projectName ?? entry.project_name ?? entry.project ?? '-',
                            projectCategory: projectMeta?.projectCategory ?? entry.project_category ?? entry.category ?? '',
                            propertyDetails: []
                        };
                        const propertyId = entry.id ?? `${projectKey}-${existingProject.propertyDetails.length + 1}`;
                        const vendorName = entry.service_provider ?? entry.serviceProvider ?? '';
                        if (vendorName) {
                            vendorSet.add(vendorName);
                        }
                        const projectProperties = Array.isArray(projectMeta?.raw?.propertyDetails)
                            ? projectMeta.raw.propertyDetails
                            : [];
                        const assignedPerson = entry.assigned_person ?? entry.assignedPerson ?? '';
                        const tenantTarget = normalize(assignedPerson);
                        const matchedProjectProperty =
                            (tenantTarget
                                ? projectProperties.find((prop) => {
                                    const tenantValue =
                                        prop?.tenantName ||
                                        prop?.tenant ||
                                        prop?.tenantDetails?.tenantName ||
                                        prop?.tenant_details?.tenantName ||
                                        '';
                                    return normalize(tenantValue) === tenantTarget;
                                })
                                : null) || projectProperties[0] || null;

                        existingProject.propertyDetails.push({
                            id: propertyId,
                            utilityTelecomId: entry.id ?? propertyId,
                            // Match ElectricityTab: door/shop come from project propertyDetails
                            doorNo: matchedProjectProperty?.doorNo ?? '-',
                            shopNo: matchedProjectProperty?.shopNo ?? matchedProjectProperty?.shop_no ?? '-',
                            projectType: matchedProjectProperty?.projectType ?? matchedProjectProperty?.project_type ?? (entry.service_type ?? entry.serviceType ?? ''),
                            ebNo: serviceNumber,
                            tenantName:
                                matchedProjectProperty?.tenantName ||
                                matchedProjectProperty?.tenant ||
                                matchedProjectProperty?.tenantDetails?.tenantName ||
                                matchedProjectProperty?.tenant_details?.tenantName ||
                                (entry.assigned_person ?? entry.assignedPerson ?? ''),
                            vendorName: vendorName,
                            telecomEntry: entry
                        });
                        groupedProjectsMap.set(projectKey, existingProject);
                    });

                const groupedProjects = Array.from(groupedProjectsMap.values()).filter(project =>
                    project.propertyDetails.some(property => property.ebNo && property.ebNo.trim() !== '')
                );

                setProjects(groupedProjects);
                setFilteredProjects(groupedProjects);
                setHiddenProjects([]);
                setVendorOptions(Array.from(vendorSet).sort().map(vendor => ({
                    value: vendor,
                    label: vendor
                })));
                setTelecomPayments(expensesRes.data || []);
            } catch (fetchError) {
                console.error('Error fetching telecom data:', fetchError);
                setError('Failed to fetch telecom directory data');
                setProjects([]);
                setFilteredProjects([]);
                setVendorOptions([]);
                setTelecomPayments([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTelecomData();
    }, []);

    useEffect(() => {
        const fetchFrequencyHistory = async () => {
            try {
                const response = await axios.get(FREQUENCY_HISTORY_ENDPOINT);
                setFrequencyHistory(response.data || []);
            } catch (error) {
                console.error('Error fetching frequency history:', error);
            }
        };
        fetchFrequencyHistory();
    }, []);

    const filteredFrequencyHistory = useMemo(() => frequencyHistory || [], [frequencyHistory]);

    useEffect(() => {
        const toLower = (value) => (value ? value.toString().toLowerCase() : '');
        const vendorFilter = toLower(filters.vendor);
        const doorFilter = toLower(filters.doorNo);
        const shopFilter = toLower(filters.shop);
        const projectTypeFilter = toLower(filters.projectType);
        const serviceFilter = toLower(filters.service);
        const tenantFilter = toLower(filters.tenant);
        const projectNameFilter = toLower(filters.projectName);

        const filtered = projects.reduce((acc, project) => {
            if (selectedCategory && project.projectCategory !== selectedCategory) {
                return acc;
            }

            if (projectNameFilter && !toLower(project.projectName).includes(projectNameFilter)) {
                return acc;
            }

            const filteredProperties = (project.propertyDetails || []).filter(property => {
                if (!property || !property.ebNo || !property.ebNo.trim()) {
                    return false;
                }

                if (doorFilter && !toLower(property.doorNo).includes(doorFilter)) {
                    return false;
                }
                if (shopFilter && !toLower(property.shopNo).includes(shopFilter)) {
                    return false;
                }
                if (projectTypeFilter && !toLower(property.projectType).includes(projectTypeFilter)) {
                    return false;
                }
                if (serviceFilter && !toLower(property.ebNo).includes(serviceFilter)) {
                    return false;
                }
                if (tenantFilter) {
                    const tenantValue = toLower(property.tenantName);
                    if (!tenantValue || !tenantValue.includes(tenantFilter)) {
                        return false;
                    }
                }
                if (vendorFilter) {
                    const vendorValue = toLower(property.vendorName);
                    if (!vendorValue || !vendorValue.includes(vendorFilter)) {
                        return false;
                    }
                }

                if (!matchesPaymentFilters(property)) {
                    return false;
                }

                return true;
            });

            if (filteredProperties.length === 0) {
                return acc;
            }

            acc.push({
                ...project,
                propertyDetails: filteredProperties
            });

            return acc;
        }, []);

        setFilteredProjects(filtered);
    }, [filters, projects, selectedCategory]);

    const handleFilterChange = (filterType, selectedOption) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: selectedOption ? selectedOption.value : ''
        }));
    };

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
        menuPortal: (base) => ({ ...base, zIndex: 100000 }),
        menu: (base) => ({ ...base, zIndex: 100000 }),
    };

    const selectPortalProps = {
        menuPortalTarget: document.body,
        menuPosition: 'fixed',
    };

    const getUniqueValues = (key) => {
        const values = new Set();
        projects.forEach(project => {
            if (key === 'projectName') {
                if (project.projectName) {
                    values.add(project.projectName);
                }
            } else if (key === 'doorNo') {
                project.propertyDetails.forEach(property => {
                    if (property.doorNo) values.add(property.doorNo);
                });
            } else if (key === 'shop') {
                project.propertyDetails.forEach(property => {
                    if (property.shopNo) values.add(property.shopNo);
                });
            } else if (key === 'projectType') {
                project.propertyDetails.forEach(property => {
                    if (property.projectType) values.add(property.projectType);
                });
            } else if (key === 'serviceNo') {
                project.propertyDetails.forEach(property => {
                    if (property.ebNo) values.add(property.ebNo);
                });
            }
        });
        return Array.from(values).sort().map(value => ({
            value: value,
            label: value
        }));
    };

    const getFrequencyData = (telecomId) => {
        if (!telecomId) return null;
        const telecomIdStr = String(telecomId);
        const found = filteredFrequencyHistory.find(freq => {
            const freqTelecomId = freq.utilityTelecomId ?? freq.UtilityTelecomId ?? freq.utility_telecom_id ?? freq.utilitytelecomid ?? null;
            if (freqTelecomId === undefined || freqTelecomId === null) return false;
            return String(freqTelecomId) === telecomIdStr;
        });
        if (found) {
            return found;
        }
        const submitted = submittedFrequencyData[telecomIdStr];
        if (submitted) {
            return {
                telecomFrequencyNo: submitted.telecomFrequencyNo,
                startingMonthOfTelecomFrequency: submitted.startingMonthOfTelecomFrequency
            };
        }
        return null;
    };

    const getTelecomFrequencyFields = (freqData) => {
        if (!freqData) {
            return { frequency: null, startingMonth: null };
        }
        const frequency = freqData.telecomFrequencyNo ?? freqData.TelecomFrequencyNo ?? null;
        const startingMonth = freqData.startingMonthOfTelecomFrequency ?? freqData.StartingMonthOfTelecomFrequency ?? null;
        return { frequency, startingMonth };
    };

    const shouldPayInMonth = (telecomId, month, year) => {
        const freqData = getFrequencyData(telecomId);
        const { frequency, startingMonth } = getTelecomFrequencyFields(freqData);
        if (!frequency || !startingMonth) {
            return true;
        }
        const parsedFrequency = parseInt(frequency, 10);
        if (Number.isNaN(parsedFrequency)) {
            return true;
        }
        if (parsedFrequency === 0) {
            return false;
        }
        const monthKey = typeof startingMonth === 'string' ? startingMonth.trim() : startingMonth;
        if (!monthKey) return true;
        const [startYearStr, startMonthStr] = monthKey.split('-');
        const startYear = parseInt(startYearStr, 10);
        const startMonth = parseInt(startMonthStr, 10);
        if (Number.isNaN(startYear) || Number.isNaN(startMonth)) {
            return true;
        }
        const currentMonth = parseInt(month, 10);
        const currentYear = parseInt(year, 10);
        const monthsSinceStart = (currentYear - startYear) * 12 + (currentMonth - startMonth);
        return monthsSinceStart >= 0 && monthsSinceStart % parsedFrequency === 0;
    };

    const toYearMonth = (value) => {
        if (!value) return null;
        if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value.trim())) return value.trim();
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return null;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${yyyy}-${mm}`;
    };

    const yearMonthToIndex = (ym) => {
        if (!ym || typeof ym !== 'string') return null;
        const [y, m] = ym.split('-').map((x) => parseInt(x, 10));
        if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
        return y * 12 + (m - 1);
    };

    const getDirectoryFirstPaymentMeta = (serviceNumber, property) => {
        const entry = property?.telecomEntry;
        if (!entry) return null;
        const entryService = entry.service_number ?? entry.serviceNumber ?? entry.utilityTypeNumber ?? entry.utility_type_number ?? null;
        if (entryService && String(entryService).trim() !== String(serviceNumber || '').trim()) return null;

        const amountRaw =
            entry.amount ??
            entry.Amount ??
            entry.planAmount ??
            entry.plan_amount ??
            entry.initialAmount ??
            entry.initial_amount ??
            null;
        const amount = amountRaw != null && String(amountRaw).trim() !== '' ? String(amountRaw) : null;
        if (!amount) return null;

        const ymCandidate =
            // Your directory schema uses service_starting_date to indicate when the plan starts
            entry.service_starting_date ??
            entry.serviceStartingDate ??
            entry.serviceStarting ??
            entry.service_starting ??
            // fallback to payment_date if starting date not present
            entry.payment_date ??
            entry.paymentDate ??
            // legacy fallbacks
            entry.utilityForTheMonth ??
            entry.utility_for_the_month ??
            entry.forTheMonth ??
            entry.for_the_month ??
            entry.startingMonth ??
            entry.startMonth ??
            entry.starting_month ??
            entry.start_month ??
            entry.activationMonth ??
            entry.activation_month ??
            entry.activatedAt ??
            entry.activated_at ??
            entry.createdAt ??
            entry.created_at ??
            null;
        const ym = toYearMonth(ymCandidate);
        const idx = yearMonthToIndex(ym);
        if (!ym || idx == null) return null;

        return {
            ym,
            idx,
            amount,
            date:
                entry.payment_date ??
                entry.paymentDate ??
                entry.service_starting_date ??
                entry.serviceStartingDate ??
                entry.date ??
                entry.timestamp ??
                entry.createdAt ??
                entry.created_at ??
                null,
            billCopyUrl: entry.billCopyUrl ?? entry.billCopy ?? entry.fileUrl ?? entry.file_url ?? null,
            // Directory uses validity + validity_type in your sample data
            utilityValidityDays:
                entry.utilityValidityDays ??
                entry.validityDays ??
                entry.validity ??
                entry.validity_days ??
                null,
            utilityValidityType:
                entry.utilityValidityType ??
                entry.validityType ??
                entry.validity_type ??
                entry.validityUnit ??
                null
        };
    };

    const getPlanStartYearMonth = (serviceNumber, property) => {
        // Prefer directory first payment month (explicit plan start payment)
        const dirFirst = getDirectoryFirstPaymentMeta(serviceNumber, property);
        if (dirFirst?.ym) return dirFirst.ym;

        // Otherwise prefer earliest expense payment month
        const payments = Array.isArray(telecomPayments) ? telecomPayments : [];
        const months = payments
            .filter((p) => String(p?.utilityTypeNumber || '').trim() === String(serviceNumber || '').trim())
            .map((p) => toYearMonth(p?.utilityForTheMonth || p?.date || p?.timestamp))
            .filter(Boolean)
            .sort();
        if (months.length > 0) return months[0];

        // Fallback to directory-provided start month (if present)
        const entry = property?.telecomEntry;
        const startCandidate =
            entry?.startingMonth ||
            entry?.startMonth ||
            entry?.starting_month ||
            entry?.start_month ||
            entry?.planStartMonth ||
            entry?.plan_start_month ||
            entry?.activationMonth ||
            entry?.activation_month ||
            entry?.activatedAt ||
            entry?.activated_at ||
            entry?.createdAt ||
            entry?.created_at ||
            null;
        return toYearMonth(startCandidate);
    };

    const getLatestCoverageMonths = (serviceNumber, targetYearMonth, property) => {
        // Find latest payment at/before target month and use its utilityValidityDays/Type to cover forward months.
        const payments = Array.isArray(telecomPayments) ? telecomPayments : [];
        const targetIdx = yearMonthToIndex(targetYearMonth);
        if (targetIdx == null) return 0;

        const eligible = payments
            .filter((p) => String(p?.utilityTypeNumber || '').trim() === String(serviceNumber || '').trim())
            .map((p) => {
                const ym = toYearMonth(p?.utilityForTheMonth || p?.date || p?.timestamp);
                const idx = yearMonthToIndex(ym);
                return {
                    p,
                    ym,
                    idx
                };
            })
            .filter((x) => x.ym && x.idx != null && x.idx <= targetIdx)
            .sort((a, b) => (b.idx ?? 0) - (a.idx ?? 0));

        const latest = eligible[0];
        const dirFirst = getDirectoryFirstPaymentMeta(serviceNumber, property);
        const best =
            latest?.idx != null
                ? latest
                : dirFirst && dirFirst.idx != null && dirFirst.idx <= targetIdx
                    ? { p: dirFirst, ym: dirFirst.ym, idx: dirFirst.idx, isDirectory: true }
                    : null;
        const source = best?.p || null;

        // If there are no expenses yet, allow using directory validity as initial coverage.
        const dir = property?.telecomEntry || null;
        const countRaw = source?.utilityValidityDays ?? dir?.utilityValidityDays ?? dir?.validityDays ?? dir?.validity ?? null;
        const typeRaw = source?.utilityValidityType ?? dir?.utilityValidityType ?? dir?.validityType ?? dir?.validityUnit ?? null;

        const count = countRaw != null && String(countRaw).trim() !== '' ? Number(countRaw) : 0;
        const type = typeRaw != null ? String(typeRaw).trim() : '';
        if (!Number.isFinite(count) || count <= 0) return 0;

        if (type.toLowerCase() === 'year' || type.toLowerCase() === 'years') return Math.max(1, count * 12);
        if (type.toLowerCase() === 'month' || type.toLowerCase() === 'months') return Math.max(1, count);
        if (type.toLowerCase() === 'day' || type.toLowerCase() === 'days') return Math.max(1, Math.ceil(count / 30));
        // Unknown unit: do not auto-cover
        return 0;
    };

    const isMonthCoveredByValidity = (serviceNumber, targetYearMonth, property) => {
        const targetIdx = yearMonthToIndex(targetYearMonth);
        if (targetIdx == null) return false;

        const planStart = getPlanStartYearMonth(serviceNumber, property);
        const planStartIdx = yearMonthToIndex(planStart);
        if (planStartIdx != null && targetIdx < planStartIdx) return true; // before plan starts → no payment

        const payments = Array.isArray(telecomPayments) ? telecomPayments : [];
        const eligible = payments
            .filter((p) => String(p?.utilityTypeNumber || '').trim() === String(serviceNumber || '').trim())
            .map((p) => {
                const ym = toYearMonth(p?.utilityForTheMonth || p?.date || p?.timestamp);
                const idx = yearMonthToIndex(ym);
                return { p, ym, idx };
            })
            .filter((x) => x.ym && x.idx != null && x.idx <= targetIdx)
            .sort((a, b) => (b.idx ?? 0) - (a.idx ?? 0));

        const dirFirst = getDirectoryFirstPaymentMeta(serviceNumber, property);
        const latest =
            eligible[0]?.ym && eligible[0]?.idx != null
                ? eligible[0]
                : dirFirst && dirFirst.idx != null && dirFirst.idx <= targetIdx
                    ? { p: dirFirst, ym: dirFirst.ym, idx: dirFirst.idx, isDirectory: true }
                    : null;
        if (!latest?.ym || latest.idx == null) return false;

        const coverMonths = getLatestCoverageMonths(serviceNumber, targetYearMonth, property);
        if (!coverMonths) return false;
        const diff = targetIdx - latest.idx;
        return diff >= 0 && diff < coverMonths;
    };

    const getPaymentData = (serviceNumber, month, telecomId, property) => {
        const selectedYear = filters.year || new Date().getFullYear().toString();
        const monthMap = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'June': '06', 'July': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        const monthNumber = monthMap[month];
        if (!monthNumber) return { amount: '-', date: null };
        const yearMonth = `${selectedYear}-${monthNumber}`;
        const payment = telecomPayments.find(p =>
            String(p.utilityTypeNumber || '').trim() === String(serviceNumber || '').trim() &&
            String(p.utilityForTheMonth || '').trim() === String(yearMonth).trim()
        );
        if (payment) {
            return {
                amount: payment.amount || '0',
                date: payment.date || null,
                billCopyUrl: payment.billCopyUrl || payment.billCopy || payment.fileUrl || null
            };
        }

        // 1st payment amount comes from directory (utility-telecom/getAll)
        const dirFirst = getDirectoryFirstPaymentMeta(serviceNumber, property);
        if (dirFirst && dirFirst.ym === yearMonth) {
            return {
                amount: dirFirst.amount || '0',
                date: dirFirst.date || null,
                billCopyUrl: dirFirst.billCopyUrl || null
            };
        }

        // If covered by validity, do not show unpaid "0"
        if (isMonthCoveredByValidity(serviceNumber, yearMonth, property)) {
            return { amount: '-', date: null, isNotRequired: true };
        }
        if (!shouldPayInMonth(telecomId, monthNumber, selectedYear)) {
            return { amount: '-', date: null, isNotRequired: true };
        }
        return { amount: '0', date: null };
    };

    const getUnpaidCount = (serviceNumber, telecomId, property) => {
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
            if (shouldPayInMonth(telecomId, monthNumber, selectedYear)) {
                const yearMonth = `${selectedYear}-${monthNumber}`;
                if (isMonthCoveredByValidity(serviceNumber, yearMonth, property)) {
                    return;
                }
                const hasExpensePayment = telecomPayments.some(p =>
                    String(p?.utilityTypeNumber || '').trim() === String(serviceNumber || '').trim() &&
                    String(p?.utilityForTheMonth || '').trim() === String(yearMonth).trim()
                );
                const dirFirst = getDirectoryFirstPaymentMeta(serviceNumber, property);
                const hasDirectoryFirst = !!(dirFirst && dirFirst.ym === yearMonth);

                if (!hasExpensePayment && !hasDirectoryFirst) {
                    unpaidCount++;
                }
            }
        });
        return unpaidCount;
    };

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const matchesPaymentFilters = (property) => {
        const selectedMonth = filters.month;
        const selectedStatus = filters.paymentStatus;
        if (!selectedMonth && !selectedStatus) {
            return true;
        }
        const telecomKey = property?.utilityTelecomId ?? property?.id;
        const evaluateMonth = (month) => {
            const paymentData = getPaymentData(property.ebNo, month, telecomKey, property);
            const isPaid = paymentData.amount !== '-' && paymentData.amount !== '0';
            const isUnpaid = paymentData.amount === '0';
            if (selectedStatus === 'Paid') return isPaid;
            if (selectedStatus === 'Unpaid') return isUnpaid;
            return true;
        };
        if (selectedMonth) {
            return evaluateMonth(selectedMonth);
        }
        return monthLabels.some((month) => evaluateMonth(month));
    };

    // Validity is used to hide "0" in covered months (no column).

    const buildExportRows = () => {
        const rows = [];
        let rowNumber = 0;

        filteredProjects.forEach(project => {
            const properties = Array.isArray(project.propertyDetails) ? project.propertyDetails : [];
            properties
                .filter(property => property.ebNo && property.ebNo.trim() !== '')
                .forEach(property => {
                    rowNumber += 1;
                    const row = {
                        slNo: rowNumber,
                        pid: project.projectId || '-',
                        projectName: project.projectName || '-',
                        category: property.projectType || project.projectCategory || '-',
                        doorNo: property.doorNo || '-',
                        serviceNo: property.ebNo || '-',
                        // validity is applied in getPaymentData/getUnpaidCount to hide covered months
                    };

                    const telecomKey = property.utilityTelecomId ?? property.id;
                    monthLabels.forEach(month => {
                        const paymentData = getPaymentData(property.ebNo, month, telecomKey, property);
                        row[month] = paymentData && paymentData.amount !== undefined ? paymentData.amount : '-';
                    });

                    row.unpaid = getUnpaidCount(property.ebNo, telecomKey, property);
                    rows.push(row);
                });
        });

        return rows;
    };

    const handleExportPDF = () => {
        const rows = buildExportRows();
        if (!rows.length) return;

        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(14);
        doc.text('Telecom Services Overview', 14, 20);

        const headers = ['Sl.No', 'PID', 'Project Name', 'Category', 'Door No', 'Service No', ...monthLabels, 'Unpaid'];
        const body = rows.map(row => [
            row.slNo,
            row.pid,
            row.projectName,
            row.category,
            row.doorNo,
            row.serviceNo,
            ...monthLabels.map(month => row[month]),
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

        doc.save('TelecomServices.pdf');
    };

    const handleExportExcel = () => {
        const rows = buildExportRows();
        if (!rows.length) return;

        const worksheetData = rows.map(row => {
            const base = {
                'Sl.No': row.slNo,
                PID: row.pid,
                'Project Name': row.projectName,
                Category: row.category,
                'Door No': row.doorNo,
                'Service No': row.serviceNo
            };

            monthLabels.forEach(month => {
                base[month] = row[month];
            });

            base['Unpaid'] = row.unpaid;
            return base;
        });

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'TelecomServices');
        XLSX.writeFile(workbook, 'TelecomServices.xlsx');
    };

    const hasExportableData = filteredProjects.some(project =>
        Array.isArray(project.propertyDetails) &&
        project.propertyDetails.some(property => property.ebNo && property.ebNo.trim() !== '')
    );

    const toggleProjectHideStatus = (projectId, isHide) => {
        if (isHide) {
            const projectToHide = projects.find(p => p.id === projectId);
            if (projectToHide) {
                setProjects(prev => prev.filter(p => p.id !== projectId));
                setFilteredProjects(prev => prev.filter(p => p.id !== projectId));
                setHiddenProjects(prev => [...prev, projectToHide]);
            }
        } else {
            const projectToShow = hiddenProjects.find(p => p.id === projectId);
            if (projectToShow) {
                setHiddenProjects(prev => prev.filter(p => p.id !== projectId));
                setProjects(prev => [...prev, projectToShow]);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '';
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
            telecomFrequency: '',
            telecomStartingMonth: ''
        });
        setShowActivityModal(true);
    };

    const handleActivitySubmit = async () => {
        if (!activityFormData.telecomFrequency.trim() || !activityFormData.telecomStartingMonth) {
            alert('Please fill in all required fields');
            return;
        }
        try {
            const telecomKey = selectedRowData?.property?.utilityTelecomId ?? selectedRowData?.property?.id;
            if (!telecomKey) {
                alert('Unable to determine telecom record identifier');
                return;
            }
            const telecomKeyStr = String(telecomKey);
            const frequencyHistoryData = {
                utilityTelecomId: telecomKey,
                utilitySubscriptionId: null,
                utilityAmcId: null,
                telecomFrequencyNo: parseInt(activityFormData.telecomFrequency, 10),
                startingMonthOfTelecomFrequency: activityFormData.telecomStartingMonth,
                subscriptionFrequencyNo: null,
                startingMonthOfSubscriptionFrequency: null,
                amcFrequencyNo: null,
                startingMonthOfAmcFrequency: null
            };
            const response = await axios.post(SAVE_FREQUENCY_HISTORY_ENDPOINT, frequencyHistoryData);
            if (response.data) {
                setSubmittedFrequencyData(prev => ({
                    ...prev,
                    [telecomKeyStr]: {
                        telecomFrequencyNo: activityFormData.telecomFrequency,
                        startingMonthOfTelecomFrequency: activityFormData.telecomStartingMonth
                    }
                }));
                const fetchFrequencyHistory = async () => {
                    try {
                        const response = await axios.get(FREQUENCY_HISTORY_ENDPOINT);
                        setFrequencyHistory(response.data || []);
                    } catch (error) {
                        console.error('Error refreshing frequency history:', error);
                    }
                };
                fetchFrequencyHistory();
                alert('Telecom frequency saved successfully!');
                window.location.reload();
                setShowActivityModal(false);
                setSelectedRowData(null);
                setActivityFormData({
                    telecomFrequency: '',
                    telecomStartingMonth: ''
                });
            }
        } catch (error) {
            console.error('Error saving frequency history:', error);
            alert('Failed to save frequency history. Please try again.');
        }
    };

    const frequencyRowsForProperty = (telecomId) => {
        if (!telecomId) return [];
        const telecomIdStr = String(telecomId);
        const entries = filteredFrequencyHistory
            .filter(freq => {
                const freqTelecomId = freq.utilityTelecomId ?? freq.UtilityTelecomId ?? freq.utility_telecom_id ?? freq.utilitytelecomid ?? null;
                if (freqTelecomId === undefined || freqTelecomId === null) {
                    return false;
                }
                return String(freqTelecomId) === telecomIdStr;
            })
            .map(freq => {
                const telecomFrequencyNo = freq.telecomFrequencyNo ?? freq.TelecomFrequencyNo ?? null;
                const startingMonthOfTelecomFrequency = freq.startingMonthOfTelecomFrequency ?? freq.StartingMonthOfTelecomFrequency ?? null;
                if (!telecomFrequencyNo || !startingMonthOfTelecomFrequency) {
                    return null;
                }
                return {
                    telecomFrequencyNo,
                    startingMonthOfTelecomFrequency
                };
            })
            .filter(Boolean);
        const submittedData = submittedFrequencyData[telecomIdStr];
        if (submittedData?.telecomFrequencyNo && submittedData?.startingMonthOfTelecomFrequency) {
            entries.push({
                telecomFrequencyNo: submittedData.telecomFrequencyNo,
                startingMonthOfTelecomFrequency: submittedData.startingMonthOfTelecomFrequency
            });
        }
        return entries;
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
                                    try { localStorage.removeItem('expenseEntryPrefill'); } catch { }
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
                                onSuccess={async () => {
                                    setShowExpenseEntryModal(false);
                                    setExpenseEntryPrefill(null);
                                    try { localStorage.removeItem('expenseEntryPrefill'); } catch { }
                                    try {
                                        const res = await axios.get(TELECOM_EXPENSES_ENDPOINT);
                                        setTelecomPayments(Array.isArray(res.data) ? res.data : []);
                                    } catch (e) {
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
                    {/* Match ElectricityTab filter layout */}
                    <div className="grid grid-cols-5 gap-4 text-left">
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
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
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
                                styles={customSelectStyles}
                                {...selectPortalProps}
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
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Vendor</label>
                            <Select
                                options={vendorOptions}
                                value={filters.vendor ? { value: filters.vendor, label: filters.vendor } : null}
                                onChange={(selectedOption) => handleFilterChange('vendor', selectedOption)}
                                placeholder="Select Vendor"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Service</label>
                            <Select
                                options={getUniqueValues('serviceNo')}
                                value={filters.service ? { value: filters.service, label: filters.service } : null}
                                onChange={(selectedOption) => handleFilterChange('service', selectedOption)}
                                placeholder="Select Service No"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Door No</label>
                            <Select
                                options={getUniqueValues('doorNo')}
                                value={filters.doorNo ? { value: filters.doorNo, label: filters.doorNo } : null}
                                onChange={(selectedOption) => handleFilterChange('doorNo', selectedOption)}
                                placeholder="Select Door No"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Shop</label>
                            <Select
                                options={getUniqueValues('shop')}
                                value={filters.shop ? { value: filters.shop, label: filters.shop } : null}
                                onChange={(selectedOption) => handleFilterChange('shop', selectedOption)}
                                placeholder="Select Shop"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Project Name</label>
                            <Select
                                options={getUniqueValues('projectName')}
                                value={filters.projectName ? { value: filters.projectName, label: filters.projectName } : null}
                                onChange={(selectedOption) => handleFilterChange('projectName', selectedOption)}
                                placeholder="Select Project"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Project Type</label>
                            <Select
                                options={getUniqueValues('projectType')}
                                value={filters.projectType ? { value: filters.projectType, label: filters.projectType } : null}
                                onChange={(selectedOption) => handleFilterChange('projectType', selectedOption)}
                                placeholder="Select Project Type"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Tenant</label>
                            <Select
                                options={[]}
                                value={filters.tenant ? { value: filters.tenant, label: filters.tenant } : null}
                                onChange={(selectedOption) => handleFilterChange('tenant', selectedOption)}
                                placeholder="Select Tenant"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                {...selectPortalProps}
                                className="w-full"
                            />
                        </div>
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
                            <button onClick={() => setShowHideModal(true)}
                                className="px-4 py-2 bg-[#BF9853] text-white rounded-lg font-semibold hover:bg-[#A68B4A] transition-colors"
                            >
                                Hide Items
                            </button>
                        </div>
                    </div>
                    <div className="border-l-8 border-l-[#BF9853] rounded-lg">
                        <div className="overflow-x-auto">
                            <div className="overflow-y-auto h-[480px] min-w-max">
                                <table className="w-full border-collapse table-auto">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-[#FAF6ED]">
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Sl.No</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">PID</td>
                                            <td className="px-4 py-2 text-left font-semibold">Project Name</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap"></td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">D.No</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Shop No</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Service No</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Jan</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Feb</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Mar</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Apr</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">May</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">June</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">July</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Aug</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Sep</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Oct</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Nov</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Dec</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Unpaid</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Activity</td>
                                            <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Hide</td>
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
                                    ) : filteredProjects.length === 0 ? (
                                        <tr>
                                            <td colSpan="22" className="text-center py-4">
                                                No telecom services found
                                            </td>
                                        </tr>
                                    ) : (
                                            filteredProjects
                                                .flatMap(project =>
                                                    project.propertyDetails
                                                        .filter(property => property.ebNo && property.ebNo.trim() !== '')
                                                        .map(property => ({ project, property }))
                                                )
                                                .map(({ project, property }, index) => {
                                                    const categoryBadge = property.projectType || project.projectCategory || '-';
                                                    const telecomKey = property.utilityTelecomId ?? property.id;
                                                    return (
                                                        <tr key={`${project.id}-${property.id}`} className="odd:bg-white even:bg-[#FAF6ED]">
                                                            <td className="px-2 py-2">{index + 1}</td>
                                                            <td className="px-2 py-2">{project.projectId}</td>
                                                            <td className="px-2 py-2 text-left whitespace-normal break-words max-w-[220px]">
                                                                {project.projectName}
                                                            </td>
                                                            <td className="px-2 py-2">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.projectCategory === 'Client Project'
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : project.projectCategory === 'Own Project'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {categoryBadge}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-2">{property.doorNo || '-'}</td>
                                                            <td className="px-2 py-2">{property.shopNo || '-'}</td>
                                                            <td
                                                                className="px-2 py-2 text-left text-sm font-semibold text-black cursor-pointer hover:text-[#BF9853] hover:underline"
                                                                onClick={() => openTelecomExpenseEntry(property.ebNo, project)}
                                                            >
                                                                {property.ebNo}
                                                            </td>
                                                            {monthLabels.map(month => {
                                                                const paymentData = getPaymentData(property.ebNo, month, telecomKey, property);
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
                                                            <td className="px-2 py-2">
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {getUnpaidCount(property.ebNo, telecomKey, property)}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-2">
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
                                                            <td className="px-2 py-2">
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
            </div>
            {showHideModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-4/5 max-w-6xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Hidden Telecom Services</h2>
                            <button
                                onClick={() => setShowHideModal(false)}
                                className="text-red-600 hover:text-red-800"
                            >
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
                                            <td className="px-4 py-2 text-left font-semibold">D.No</td>
                                            <td className="px-4 py-2 text-left font-semibold">Service No</td>
                                            <td className="px-4 py-2 text-left font-semibold">Unhide</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hiddenProjects
                                            .flatMap(project =>
                                                project.propertyDetails
                                                    .filter(property => property.ebNo && property.ebNo.trim() !== '')
                                                    .map(property => ({ project, property }))
                                            )
                                            .map(({ project, property }, index) => {
                                                    return (
                                                        <tr key={`${project.id}-${property.id}`} className="odd:bg-white even:bg-[#FAF6ED]">
                                                            <td className="px-4 py-2">{index + 1}</td>
                                                            <td className="px-4 py-2">{project.projectId}</td>
                                                            <td className="px-4 py-2">{project.projectName}</td>
                                                            <td className="px-4 py-2">{property.doorNo || '-'}</td>
                                                            <td
                                                                className="px-4 py-2 text-sm font-semibold text-black cursor-pointer hover:text-[#BF9853] hover:underline"
                                                                onClick={() => openTelecomExpenseEntry(property.ebNo, project)}
                                                            >
                                                                {property.ebNo}
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <button
                                                                    onClick={() => toggleProjectHideStatus(project.id, false)}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
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
                            <h2 className="text-xl font-semibold text-gray-800">Telecom Activity Entry</h2>
                            <button
                                onClick={() => {
                                    setShowActivityModal(false);
                                    setSelectedRowData(null);
                                    setActivityFormData({
                                        telecomFrequency: '',
                                        telecomStartingMonth: ''
                                    });
                                }}
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
                                    <h3 className="font-semibold text-gray-700 mb-1">Telecom Details:</h3>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Project:</span> {selectedRowData.project.projectName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Service No:</span> {selectedRowData.property.ebNo}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Door No:</span> {selectedRowData.property.doorNo || '-'}
                                    </p>
                                </div>
                                <div className='pl-5'>
                                    {(() => {
                                        const allFrequencyData = frequencyRowsForProperty(selectedRowData.property.utilityTelecomId ?? selectedRowData.property.id);
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
                                                            {allFrequencyData.map((freqData, index) => (
                                                                <tr key={index}>
                                                                    <td className="border border-gray-300 px-2 py-1 text-xs">{freqData.telecomFrequencyNo}</td>
                                                                    <td className="border border-gray-300 px-2 py-1 text-xs">{new Date(freqData.startingMonthOfTelecomFrequency + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
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
                                        Telecom Frequency <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={activityFormData.telecomFrequency}
                                        onChange={(e) => setActivityFormData(prev => ({
                                            ...prev,
                                            telecomFrequency: e.target.value
                                        }))}
                                        placeholder="Enter telecom frequency"
                                        className="border-2 border-[#BF9853] rounded-lg px-4 py-2 w-[290px] h-[45px] focus:outline-none border-opacity-[0.20]"
                                    />
                                </div>
                                <div>
                                    <label className="text-md font-semibold mb-2 block">
                                        Telecom Starting Month <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="month"
                                        value={activityFormData.telecomStartingMonth}
                                        onChange={(e) => setActivityFormData(prev => ({
                                            ...prev,
                                            telecomStartingMonth: e.target.value
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
                                        setActivityFormData({
                                            telecomFrequency: '',
                                            telecomStartingMonth: ''
                                        });
                                    }}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleActivitySubmit}
                                    className="px-4 py-2 bg-[#BF9853] text-white rounded-lg hover:bg-[#A68B4A] transition-colors"
                                >
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

export default TelecomTab;
