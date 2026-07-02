/** Shared filter helpers for Utility Hub property-style tabs (Electricity, Property, Water, etc.) */

const getUtilityRecordSortTime = (item) => {
    const timestamp =
        item?.timestamp ??
        item?.createdAt ??
        item?.created_at ??
        item?.createdDateTime ??
        item?.created_date_time;
    if (timestamp) {
        const parsed = new Date(timestamp).getTime();
        if (!Number.isNaN(parsed)) return parsed;
    }
    if (item?.date) {
        const parsed = new Date(item.date).getTime();
        if (!Number.isNaN(parsed)) return parsed;
    }
    return null;
};

/** Default database table order: newest entries first. */
export const sortUtilityDatabaseRecordsNewestFirst = (records = []) => {
    if (!Array.isArray(records) || records.length <= 1) {
        return Array.isArray(records) ? [...records] : [];
    }
    return [...records].sort((a, b) => {
        const timeA = getUtilityRecordSortTime(a);
        const timeB = getUtilityRecordSortTime(b);
        if (timeA != null && timeB != null && timeA !== timeB) return timeB - timeA;
        if (timeA != null && timeB == null) return -1;
        if (timeA == null && timeB != null) return 1;

        const idA = Number(a?.id);
        const idB = Number(b?.id);
        if (Number.isFinite(idA) && Number.isFinite(idB) && idA !== idB) return idB - idA;

        const enoA = Number(a?.eno);
        const enoB = Number(b?.eno);
        if (Number.isFinite(enoA) && Number.isFinite(enoB) && enoA !== enoB) return enoB - enoA;

        return 0;
    });
};

/** Map utility-hub API rows to expenses-entry field names used by DatabaseExpenses / Table. */
export const normalizeUtilityExpenseRow = (row = {}, utilityType = '') => ({
    ...row,
    siteName: row.siteName ?? row.site_name ?? '',
    vendor: row.vendor ?? row.vendorName ?? row.vendor_name ?? '',
    contractor: row.contractor ?? '',
    comments: row.comments ?? row.description ?? '',
    quantity: row.quantity ?? '',
    amount: row.amount ?? 0,
    category: row.category ?? '',
    accountType: row.accountType ?? row.account_type ?? 'Utility Bills',
    utilityType: row.utilityType ?? row.utility_type ?? utilityType ?? '',
    utilityTypeNumber: row.utilityTypeNumber ?? row.utility_type_number ?? '',
    utilityForTheMonth: row.utilityForTheMonth ?? row.utility_for_the_month ?? '',
    utilityValidityDays: row.utilityValidityDays ?? row.utility_validity_days ?? '',
    utilityValidityType: row.utilityValidityType ?? row.utility_validity_type ?? '',
    serviceStartingDate: row.serviceStartingDate ?? row.service_starting_date ?? '',
    paymentMode: row.paymentMode ?? row.payment_mode ?? '',
    source: row.source ?? '',
    branch_id: row.branch_id ?? row.branchId ?? '',
    branchId: row.branchId ?? row.branch_id ?? '',
    enteredBy: row.enteredBy ?? row.entered_by ?? '',
    eno: row.eno ?? '',
    timestamp: row.timestamp ?? row.createdAt ?? row.created_at ?? '',
    date: row.date ?? '',
    billCopy: row.billCopy ?? row.bill_copy ?? row.billCopyUrl ?? '',
    billCopyUrl: row.billCopyUrl ?? row.billCopy ?? row.bill_copy ?? '',
    billArrivalDate: row.billArrivalDate ?? row.bill_arrival_date ?? '',
    machineTools: row.machineTools ?? row.machine_tools ?? '',
    labourId: row.labourId ?? row.labour_id ?? '',
    labour_id: row.labour_id ?? row.labourId ?? '',
    employeeId: row.employeeId ?? row.employee_id ?? '',
    employee_id: row.employee_id ?? row.employeeId ?? '',
    projectId: row.projectId ?? row.project_id ?? '',
    project_id: row.project_id ?? row.projectId ?? '',
    vendorId: row.vendorId ?? row.vendor_id ?? '',
    vendor_id: row.vendor_id ?? row.vendorId ?? '',
    contractorId: row.contractorId ?? row.contractor_id ?? '',
    contractor_id: row.contractor_id ?? row.contractorId ?? '',
});

export const UTILITY_MONTH_NUMBER_MAP = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04',
    May: '05', June: '06', July: '07', Aug: '08',
    Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

/** Year used for PDF/Excel export: filtered year or current calendar year. */
export const getUtilityHubExportYear = (filterState) => {
    const year = filterState?.year;
    if (year != null && String(year).trim() !== '') {
        return String(year).trim();
    }
    return new Date().getFullYear().toString();
};

export const getDefaultPropertyStyleFilters = (monthLabels, extra = {}) => ({
    year: new Date().getFullYear().toString(),
    month: monthLabels[new Date().getMonth()],
    paymentStatus: '',
    vendor: '',
    service: '',
    doorNo: '',
    shop: '',
    projectName: '',
    projectType: '',
    tenant: '',
    occupancyStatus: '',
    ...extra,
});

export const buildTenantLinksMap = (tenantShopData) => {
    const map = new Map();
    if (!Array.isArray(tenantShopData) || !tenantShopData.length) return map;
    tenantShopData.forEach((tenant) => {
        const tName = (tenant?.tenantName || '').toString();
        (tenant?.shopNos || []).forEach((shop) => {
            const propertyId = shop?.shopNoId;
            if (propertyId == null || propertyId === '') return;
            const key = String(propertyId);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push({
                tenantName: tName,
                shopClosureDate: shop?.shopClosureDate || null,
            });
        });
    });
    return map;
};

const toLower = (value) => (value ? value.toString().toLowerCase() : '');

const normalizeServiceNo = (value) => (value == null ? '' : String(value).trim());

/** Case-insensitive exact match for vendor/provider dropdown filters */
export const vendorNamesMatch = (a, b) => {
    const left = toLower(String(a ?? '').trim());
    const right = toLower(String(b ?? '').trim());
    if (!left || !right) return false;
    return left === right;
};

export const getPaymentVendorRaw = (payment) =>
    (payment?.vendorName ??
    payment?.vendor ??
    payment?.vendor_name ??
    payment?.vendorNameLabel ??
    payment?.party ??
  payment?.serviceProvider ??
  payment?.service_provider ??
    '').toString().trim();

const getPaymentVendorValue = (payment) => toLower(getPaymentVendorRaw(payment));

export const paymentMatchesRowVendor = (payment, rowVendor) => {
    if (!rowVendor) return true;
    return vendorNamesMatch(getPaymentVendorRaw(payment), rowVendor);
};

export const findPaymentForServiceMonth = (payments, serviceNo, yearMonth, rowVendor) =>
    (payments || []).find(
        (p) =>
            normalizeServiceNo(p?.utilityTypeNumber) === normalizeServiceNo(serviceNo) &&
            String(p?.utilityForTheMonth || '').trim() === String(yearMonth || '').trim() &&
            paymentMatchesRowVendor(p, rowVendor)
    );

export const getDistinctPaymentVendorsForService = (payments, serviceNo, year = null, monthLabel = null) => {
    const normalized = normalizeServiceNo(serviceNo);
    if (!normalized) return [];
    let scoped = (payments || []).filter(
        (p) => normalizeServiceNo(p?.utilityTypeNumber) === normalized
    );
    if (year) {
        scoped = scoped.filter(
            (p) =>
                typeof p?.utilityForTheMonth === 'string' &&
                p.utilityForTheMonth.startsWith(`${year}-`)
        );
    }
    if (monthLabel && year) {
        const monthNumber = UTILITY_MONTH_NUMBER_MAP[monthLabel];
        if (monthNumber) {
            const yearMonth = `${year}-${monthNumber}`;
            scoped = scoped.filter((p) => String(p?.utilityForTheMonth || '').trim() === yearMonth);
        }
    }
    const vendorMap = new Map();
    scoped.forEach((payment) => {
        const name = getPaymentVendorRaw(payment);
        if (!name) return;
        const key = toLower(name);
        if (!vendorMap.has(key)) vendorMap.set(key, name);
    });
    return Array.from(vendorMap.values());
};

export const propertyHasVendorForFilter = (property, payments, getServiceNo, vendorFilter, year, monthLabel = null) => {
    const filter = String(vendorFilter ?? '').trim();
    if (!filter) return true;
    const serviceNo = getServiceNo(property);
    if (!serviceNo || !String(serviceNo).trim()) return false;
    const vendors = getDistinctPaymentVendorsForService(payments, serviceNo, year, monthLabel);
    if (vendors.some((name) => vendorNamesMatch(name, filter))) return true;
    const fallback = (property?.vendorName || '').trim();
    return vendorNamesMatch(fallback, filter);
};

export const expandPropertyStyleRowsByVendor = (rows, payments, getServiceNo, options = {}) => {
    const year = options.year || new Date().getFullYear().toString();
    const monthLabel = options.month || null;
    const vendorFilter = String(options.vendorFilter ?? '').trim();
    const expanded = [];

    (rows || []).forEach((row) => {
        const serviceNo = normalizeServiceNo(getServiceNo(row.property));
        if (!serviceNo) return;

        const vendorsFromPayments = getDistinctPaymentVendorsForService(
            payments,
            serviceNo,
            year,
            monthLabel
        );
        let vendors = vendorsFromPayments;
        if (!vendors.length) {
            const fallback = (row.property?.vendorName || '').trim();
            if (fallback) vendors = [fallback];
        }

        if (!vendors.length) {
            if (!vendorFilter) {
                expanded.push({
                    ...row,
                    rowVendor: '',
                    rowKey: `${serviceNo}::__none__`,
                });
            }
            return;
        }

        vendors.forEach((vendorName) => {
            if (vendorFilter && !vendorNamesMatch(vendorName, vendorFilter)) return;
            expanded.push({
                ...row,
                rowVendor: vendorName,
                rowKey: `${serviceNo}::${toLower(vendorName) || '__none__'}`,
            });
        });
    });

    return expanded;
};

export const getSubscriptionPaymentServiceNo = (payment) =>
    normalizeServiceNo(
        payment?.utilityTypeNumber ??
        payment?.utility_type_number ??
        payment?.utilityTypeNo ??
        payment?.utility_type_no ??
        payment?.subscriptionServiceNumber ??
        payment?.subscription_service_number ??
        payment?.subscriptionNumber ??
        payment?.subscription_number ??
        payment?.serviceNumber ??
        payment?.service_number
    );

export const getDistinctProvidersForSubscriptionService = (
    payments,
    serviceNo,
    year = null,
    monthLabel = null
) => {
    const normalized = normalizeServiceNo(serviceNo);
    if (!normalized) return [];
    let scoped = (payments || []).filter(
        (p) => getSubscriptionPaymentServiceNo(p) === normalized
    );
    if (year) {
        scoped = scoped.filter((p) => {
            const monthValue =
                p?.utilityForTheMonth ??
                p?.utility_for_the_month ??
                p?.subscriptionForTheMonth ??
                p?.subscription_for_the_month;
            return typeof monthValue === 'string' && monthValue.startsWith(`${year}-`);
        });
    }
    if (monthLabel && year) {
        const monthNumber = UTILITY_MONTH_NUMBER_MAP[monthLabel];
        if (monthNumber) {
            const yearMonth = `${year}-${monthNumber}`;
            scoped = scoped.filter((p) => {
                const monthValue =
                    p?.utilityForTheMonth ??
                    p?.utility_for_the_month ??
                    p?.subscriptionForTheMonth ??
                    p?.subscription_for_the_month;
                return String(monthValue || '').trim() === yearMonth;
            });
        }
    }
    const providerMap = new Map();
    scoped.forEach((payment) => {
        const name = getPaymentVendorRaw(payment);
        if (!name) return;
        const key = toLower(name);
        if (!providerMap.has(key)) providerMap.set(key, name);
    });
    return Array.from(providerMap.values());
};

export const expandSubscriptionRowsByProvider = (rows, payments, options = {}) => {
    const year = options.year || new Date().getFullYear().toString();
    const monthLabel = options.month || null;
    const providerFilter = String(options.providerFilter ?? '').trim();
    const expanded = [];

    (rows || []).forEach((row) => {
        const serviceNo = normalizeServiceNo(row.detail?.serviceNumber);
        if (!serviceNo) return;

        const providersFromPayments = getDistinctProvidersForSubscriptionService(
            payments,
            serviceNo,
            year,
            monthLabel
        );
        let providers = providersFromPayments;
        if (!providers.length) {
            const fallback = (row.detail?.serviceProvider || '').trim();
            if (fallback) providers = [fallback];
        }

        if (!providers.length) {
            if (!providerFilter) {
                expanded.push({
                    ...row,
                    rowProvider: '',
                    rowKey: `${serviceNo}::__none__`,
                });
            }
            return;
        }

        providers.forEach((providerName) => {
            if (providerFilter && !vendorNamesMatch(providerName, providerFilter)) return;
            expanded.push({
                ...row,
                rowProvider: providerName,
                rowKey: `${serviceNo}::${toLower(providerName) || '__none__'}`,
            });
        });
    });

    return expanded;
};

/**
 * @param {object} params
 * @param {Array} params.projects
 * @param {string} params.selectedCategory
 * @param {object} params.filterState
 * @param {string|null} params.excludeField
 * @param {function} params.getServiceNo - (property) => string
 * @param {function} params.getLinksForProperty - (propertyId) => links[]
 * @param {function} params.matchesPaymentFiltersFor - (property, filterState) => boolean
 * @param {Array} params.payments
 * @param {function} [params.matchVendor] - (property, vendorFilter, filterState) => boolean
 * @param {function} [params.comparePropertyShopNoAsc]
 */
export const computePropertyStyleFilteredProjects = ({
    projects,
    selectedCategory,
    filterState,
    excludeField = null,
    getServiceNo,
    getLinksForProperty,
    matchesPaymentFiltersFor,
    payments = [],
    matchVendor,
    matchService,
    comparePropertyShopNoAsc = () => 0,
}) => {
    const effective = { ...filterState };
    if (excludeField) effective[excludeField] = '';

    const vendorFilter = toLower(effective.vendor);
    const doorFilter = toLower(effective.doorNo);
    const shopFilter = toLower(effective.shop);
    const projectTypeFilter = toLower(effective.projectType);
    const serviceFilter = toLower(effective.service);
    const tenantFilter = toLower(effective.tenant);
    const projectNameFilter = toLower(effective.projectName);
    const occupancyFilter = toLower(effective.occupancyStatus);
    const selectedYearForFilters = effective.year || new Date().getFullYear().toString();
    const selectedMonthNumber = effective.month ? UTILITY_MONTH_NUMBER_MAP[effective.month] : null;
    const selectedYearMonthForFilters = selectedMonthNumber
        ? `${selectedYearForFilters}-${selectedMonthNumber}`
        : null;

    const defaultMatchVendor = (property) =>
        propertyHasVendorForFilter(
            property,
            payments,
            getServiceNo,
            effective.vendor,
            selectedYearForFilters,
            effective.month || null
        );

    const propertyMatchesVendor = matchVendor
        ? (property) => matchVendor(property, vendorFilter, effective)
        : defaultMatchVendor;

    const matchesTenantFromLinks = (propertyId) => {
        if (!tenantFilter) return true;
        const links = getLinksForProperty(propertyId);
        if (!links.length) return false;
        return links.some((l) => toLower(l.tenantName).includes(tenantFilter));
    };

    const matchesOccupancyFromLinks = (propertyId) => {
        if (!occupancyFilter) return true;
        const links = getLinksForProperty(propertyId);
        const hasActive = links.some((l) => !l.shopClosureDate);
        const hasVacated = links.some((l) => !!l.shopClosureDate);
        if (occupancyFilter === 'occupied') return hasActive;
        if (occupancyFilter === 'vacated') return !hasActive && hasVacated;
        return true;
    };

    return (projects || []).reduce((acc, project) => {
        if (selectedCategory && project.projectCategory !== selectedCategory) return acc;
        if (projectNameFilter && !toLower(project.projectName).includes(projectNameFilter)) return acc;

        const filteredProperties = (project.propertyDetails || []).filter((property) => {
            const serviceNo = getServiceNo(property);
            if (!property || !serviceNo || !String(serviceNo).trim()) return false;
            if (doorFilter && !toLower(property.doorNo).includes(doorFilter)) return false;
            if (shopFilter && !toLower(property.shopNo).includes(shopFilter)) return false;
            if (projectTypeFilter && !toLower(property.projectType).includes(projectTypeFilter)) return false;
            if (serviceFilter) {
                if (matchService) {
                    if (!matchService(property, project, effective)) return false;
                } else if (!toLower(serviceNo).includes(serviceFilter)) {
                    return false;
                }
            }
            const propertyId = property?.id ?? property?.propertyId ?? property?.projectNamePropertyDetailsId;
            if (!matchesTenantFromLinks(propertyId)) return false;
            if (!matchesOccupancyFromLinks(propertyId)) return false;
            if (!propertyMatchesVendor(property)) return false;
            if (!matchesPaymentFiltersFor(property, effective)) return false;
            return true;
        });

        if (filteredProperties.length === 0) return acc;
        acc.push({
            ...project,
            propertyDetails: [...filteredProperties].sort(comparePropertyShopNoAsc),
        });
        return acc;
    }, []);
};

export const flattenPropertyStyleRows = (projectList, getServiceNo, comparePropertyShopNoAsc) => {
    const rows = (projectList || []).flatMap((project) =>
        (project.propertyDetails || [])
            .filter((property) => {
                const sn = getServiceNo(property);
                return sn && String(sn).trim() !== '';
            })
            .map((property) => ({ project, property }))
    );
    if (comparePropertyShopNoAsc) {
        rows.sort((a, b) => comparePropertyShopNoAsc(a.property, b.property));
    }
    return rows;
};

export const buildPropertyStyleAutoFill = ({
    row,
    filterState,
    changedField,
    getServiceNo,
    getLinksForProperty,
    getPaymentData,
    payments,
    monthLabels,
}) => {
    const { project, property } = row;
    const filled = {};
    if (property.doorNo) filled.doorNo = String(property.doorNo);
    if (property.shopNo) filled.shop = String(property.shopNo);
    const serviceNo = getServiceNo(property);
    if (serviceNo) filled.service = String(serviceNo);
    if (project.projectName) filled.projectName = String(project.projectName);
    if (property.projectType) filled.projectType = String(property.projectType);

    const propertyId = property?.id ?? property?.propertyId ?? property?.projectNamePropertyDetailsId;
    const links = getLinksForProperty(propertyId);
    const active = links.filter((l) => !l.shopClosureDate);
    if (active.length > 0) {
        filled.tenant = active[0].tenantName;
        filled.occupancyStatus = 'occupied';
    } else if (links.some((l) => l.shopClosureDate)) {
        filled.occupancyStatus = 'vacated';
        const vacated = links
            .filter((l) => l.shopClosureDate)
            .sort((a, b) => new Date(b.shopClosureDate).getTime() - new Date(a.shopClosureDate).getTime());
        if (vacated[0]?.tenantName) filled.tenant = vacated[0].tenantName;
    }

    const monthForStatus = filterState.month || monthLabels[new Date().getMonth()];
    if (serviceNo && monthForStatus && getPaymentData) {
        const paymentData = getPaymentData(serviceNo, monthForStatus, property.id, filterState.year);
        if (paymentData.amount === '0') filled.paymentStatus = 'Unpaid';
        else if (paymentData.amount !== '-') filled.paymentStatus = 'Paid';

        const monthNumber = UTILITY_MONTH_NUMBER_MAP[monthForStatus];
        const year = filterState.year || new Date().getFullYear().toString();
        if (monthNumber && payments?.length) {
            const yearMonth = `${year}-${monthNumber}`;
            const payment = payments.find(
                (p) => p?.utilityTypeNumber === serviceNo && p?.utilityForTheMonth === yearMonth
            );
            const vendorVal = payment?.vendorName ?? payment?.vendor ?? payment?.vendor_name ?? '';
            if (vendorVal) filled.vendor = String(vendorVal);
        } else if (property.vendorName) {
            filled.vendor = String(property.vendorName);
        }
    }

    if (changedField) delete filled[changedField];
    return filled;
};

export const getPropertyStyleFilterOptions = (filters, fieldKey, excludeField, computeFn, getServiceNo) => {
    const subset = computeFn(filters, excludeField);
    const values = new Set();
    subset.forEach((project) => {
        if (fieldKey === 'projectName' && project.projectName) {
            values.add(String(project.projectName));
        } else {
            (project.propertyDetails || []).forEach((property) => {
                if (fieldKey === 'doorNo' && property.doorNo) values.add(String(property.doorNo));
                if (fieldKey === 'shop' && property.shopNo) values.add(String(property.shopNo));
                if (fieldKey === 'projectType' && property.projectType) values.add(String(property.projectType));
                if (fieldKey === 'serviceNo') {
                    const sn = getServiceNo(property);
                    if (sn) values.add(String(sn));
                }
            });
        }
    });
    return Array.from(values)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((value) => ({ value, label: value }));
};

export const getVendorOptionsFromFiltered = (filters, computeFn, flattenFn, payments, allProjects = null) => {
    const subset = computeFn(filters, 'vendor');
    const rows = flattenFn(subset);
    const year = filters.year || new Date().getFullYear().toString();
    const vendors = new Set();
    const serviceNos = new Set();

    const collectServiceNo = (property) => {
        const sn =
            property?.propertyTaxNo ??
            property?.ebNo ??
            property?.waterTaxNo ??
            property?.waterNo ??
            property?.professionalTaxNo ??
            property?.professionTaxNo;
        const normalized = normalizeServiceNo(sn);
        if (normalized) serviceNos.add(normalized);
        if (property?.vendorName) {
            const name = String(property.vendorName).trim();
            if (name) vendors.add(name);
        }
    };

    rows.forEach(({ property }) => collectServiceNo(property));

    const projectSource = Array.isArray(allProjects) && allProjects.length ? allProjects : subset;
    if (!serviceNos.size) {
        projectSource.forEach((project) => {
            (project.propertyDetails || []).forEach(collectServiceNo);
        });
    }

    if (Array.isArray(payments) && payments.length && serviceNos.size) {
        payments.forEach((payment) => {
            const paymentServiceNo = normalizeServiceNo(payment?.utilityTypeNumber);
            if (!paymentServiceNo || !serviceNos.has(paymentServiceNo)) return;

            const utilityMonth = payment?.utilityForTheMonth;
            if (
                utilityMonth &&
                typeof utilityMonth === 'string' &&
                !utilityMonth.startsWith(`${year}-`)
            ) {
                return;
            }

            const vendorName = getPaymentVendorRaw(payment);
            if (vendorName) vendors.add(vendorName);
        });
    }

    return Array.from(vendors)
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
        .map((value) => ({ value, label: value }));
};

export const getTenantOptionsFromFiltered = (filters, computeFn, flattenFn, getLinksForProperty) => {
    const subset = computeFn(filters, 'tenant');
    const rows = flattenFn(subset);
    const names = new Set();
    rows.forEach(({ property }) => {
        const propertyId = property?.id ?? property?.propertyId ?? property?.projectNamePropertyDetailsId;
        getLinksForProperty(propertyId).forEach((l) => {
            const name = (l.tenantName || '').trim();
            if (name) names.add(name);
        });
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b)).map((value) => ({ value, label: value }));
};

/** Subscription tab: filter subscriptionDetails rows */
export const computeSubscriptionStyleFilteredProjects = ({
    projects,
    selectedCategory,
    filterState,
    excludeField = null,
    matchesPaymentFiltersFor,
    compareDetailSort = () => 0,
    payments = [],
}) => {
    const effective = { ...filterState };
    if (excludeField) effective[excludeField] = '';

    const providerFilter = toLower(effective.provider);
    const serviceFilter = toLower(effective.serviceNumber);
    const registeredFilter = toLower(effective.registered);
    const planFilter = toLower(effective.planNumber);
    const serviceTypeFilter = toLower(effective.serviceType);
    const purposeFilter = toLower(effective.purpose);
    const projectNameFilter = toLower(effective.projectName);
    const selectedYearForFilters = effective.year || new Date().getFullYear().toString();

    const detailMatchesProvider = (detail) => {
        if (!providerFilter) return true;
        if (vendorNamesMatch(detail.serviceProvider, effective.provider)) return true;
        const serviceNo = normalizeServiceNo(detail.serviceNumber);
        if (!serviceNo || !payments.length) return false;
        const providers = getDistinctProvidersForSubscriptionService(
            payments,
            serviceNo,
            selectedYearForFilters,
            effective.month || null
        );
        return providers.some((name) => vendorNamesMatch(name, effective.provider));
    };

    return (projects || []).reduce((acc, project) => {
        if (selectedCategory && project.projectCategory !== selectedCategory) return acc;
        if (projectNameFilter && !toLower(project.projectName).includes(projectNameFilter)) return acc;

        const filteredDetails = (project.subscriptionDetails || []).filter((detail) => {
            if (!detail?.serviceNumber || !String(detail.serviceNumber).trim()) return false;
            if (registeredFilter && !toLower(detail.registeredPerson).includes(registeredFilter)) return false;
            if (planFilter && !toLower(detail.planNumber).includes(planFilter)) return false;
            if (serviceTypeFilter && !toLower(detail.serviceType).includes(serviceTypeFilter)) return false;
            if (serviceFilter && !toLower(detail.serviceNumber).includes(serviceFilter)) return false;
            if (purposeFilter && !toLower(detail.purpose).includes(purposeFilter)) return false;
            if (!detailMatchesProvider(detail)) return false;
            if (effective.year) {
                const paymentYear = detail.paymentDate ? String(new Date(detail.paymentDate).getFullYear()) : '';
                if (paymentYear !== effective.year) return false;
            }
            if (!matchesPaymentFiltersFor(detail, effective)) return false;
            return true;
        });

        if (filteredDetails.length === 0) return acc;
        acc.push({
            ...project,
            subscriptionDetails: [...filteredDetails].sort(compareDetailSort),
        });
        return acc;
    }, []);
};

export const flattenSubscriptionRows = (projectList, compareDetailSort) => {
    const rows = (projectList || []).flatMap((project) =>
        (project.subscriptionDetails || [])
            .filter((d) => d?.serviceNumber && String(d.serviceNumber).trim() !== '')
            .map((detail) => ({ project, detail }))
    );
    if (compareDetailSort) {
        rows.sort((a, b) => compareDetailSort(a.detail, b.detail));
    }
    return rows;
};

export const buildSubscriptionAutoFill = ({ row, filterState, changedField, getPaymentData, monthLabels }) => {
    const { project, detail } = row;
    const filled = {};
    if (detail.serviceNumber) filled.serviceNumber = String(detail.serviceNumber);
    if (detail.registeredPerson) filled.registered = String(detail.registeredPerson);
    if (detail.planNumber) filled.planNumber = String(detail.planNumber);
    if (detail.serviceType) filled.serviceType = String(detail.serviceType);
    if (detail.purpose) filled.purpose = String(detail.purpose);
    if (project.projectName) filled.projectName = String(project.projectName);
    if (detail.serviceProvider) filled.provider = String(detail.serviceProvider);

    const monthForStatus = filterState.month || monthLabels[new Date().getMonth()];
    if (detail.serviceNumber && monthForStatus && getPaymentData) {
        const key = detail.utilitySubscriptionId ?? detail.id;
        const paymentData = getPaymentData(detail.serviceNumber, monthForStatus, key, filterState.year);
        if (paymentData.amount === '0') filled.paymentStatus = 'Unpaid';
        else if (paymentData.amount !== '-') filled.paymentStatus = 'Paid';
    }

    if (changedField) delete filled[changedField];
    return filled;
};

export const getSubscriptionFilterOptions = (filters, fieldKey, excludeField, computeFn) => {
    const subset = computeFn(filters, excludeField);
    const values = new Set();
    subset.forEach((project) => {
        if (fieldKey === 'projectName' && project.projectName) {
            values.add(String(project.projectName));
        } else {
            (project.subscriptionDetails || []).forEach((detail) => {
                if (fieldKey === 'serviceNumber' && detail.serviceNumber) values.add(String(detail.serviceNumber));
                if (fieldKey === 'registered' && detail.registeredPerson) values.add(String(detail.registeredPerson));
                if (fieldKey === 'planNumber' && detail.planNumber) values.add(String(detail.planNumber));
                if (fieldKey === 'serviceType' && detail.serviceType) values.add(String(detail.serviceType));
                if (fieldKey === 'purpose' && detail.purpose) values.add(String(detail.purpose));
            });
        }
    });
    return Array.from(values)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((value) => ({ value, label: value }));
};

export const getProviderOptionsFromFiltered = (filters, computeFn, flattenFn, payments = []) => {
    const subset = computeFn(filters, 'provider');
    const rows = flattenFn(subset);
    const year = filters.year || new Date().getFullYear().toString();
    const providers = new Set();
    const serviceNos = new Set();

    rows.forEach(({ detail }) => {
        const p = (detail?.serviceProvider || '').trim();
        if (p) providers.add(p);
        const sn = normalizeServiceNo(detail?.serviceNumber);
        if (sn) serviceNos.add(sn);
    });

    if (Array.isArray(payments) && payments.length && serviceNos.size) {
        payments.forEach((payment) => {
            const paymentServiceNo = getSubscriptionPaymentServiceNo(payment);
            if (!paymentServiceNo || !serviceNos.has(paymentServiceNo)) return;

            const monthValue =
                payment?.utilityForTheMonth ??
                payment?.utility_for_the_month ??
                payment?.subscriptionForTheMonth ??
                payment?.subscription_for_the_month;
            if (
                monthValue &&
                typeof monthValue === 'string' &&
                !monthValue.startsWith(`${year}-`)
            ) {
                return;
            }

            const providerName = getPaymentVendorRaw(payment);
            if (providerName) providers.add(providerName);
        });
    }

    return Array.from(providers).sort((a, b) => a.localeCompare(b)).map((value) => ({ value, label: value }));
};

export const getDefaultSubscriptionFilters = (monthLabels) => ({
    year: new Date().getFullYear().toString(),
    month: monthLabels[new Date().getMonth()],
    paymentStatus: '',
    provider: '',
    serviceNumber: '',
    registered: '',
    planNumber: '',
    projectName: '',
    serviceType: '',
    purpose: '',
});

export const getDefaultAmcFilters = () => ({
    year: new Date().getFullYear().toString(),
    month: '',
    paymentStatus: '',
    vendor: '',
    service: '',
    shop: '',
    doorNo: '',
    projectName: '',
    projectType: '',
    tenant: '',
    occupancyStatus: '',
});
