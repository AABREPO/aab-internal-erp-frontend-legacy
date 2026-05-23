/** Shared filter helpers for Utility Hub property-style tabs (Electricity, Property, Water, etc.) */

export const UTILITY_MONTH_NUMBER_MAP = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04',
    May: '05', June: '06', July: '07', Aug: '08',
    Sep: '09', Oct: '10', Nov: '11', Dec: '12',
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

const getPaymentVendorValue = (payment) => toLower(
    payment?.vendorName ??
    payment?.vendor ??
    payment?.vendor_name ??
    payment?.vendorNameLabel ??
    payment?.party ??
    ''
);

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

    const defaultMatchVendor = (property) => {
        if (!vendorFilter) return true;
        const serviceNo = getServiceNo(property);
        if (!serviceNo) return false;
        const paymentsForService = payments.filter((p) => p?.utilityTypeNumber === serviceNo);
        const scopedPayments = selectedYearMonthForFilters
            ? paymentsForService.filter((p) => p?.utilityForTheMonth === selectedYearMonthForFilters)
            : paymentsForService.filter(
                (p) => typeof p?.utilityForTheMonth === 'string' && p.utilityForTheMonth.startsWith(`${selectedYearForFilters}-`)
            );
        return scopedPayments.some((p) => getPaymentVendorValue(p).includes(vendorFilter));
    };

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

export const getVendorOptionsFromFiltered = (filters, computeFn, flattenFn, payments) => {
    const subset = computeFn(filters, 'vendor');
    const rows = flattenFn(subset);
    const year = filters.year || new Date().getFullYear().toString();
    const monthNumber = filters.month ? UTILITY_MONTH_NUMBER_MAP[filters.month] : null;
    const yearMonth = monthNumber ? `${year}-${monthNumber}` : null;
    const vendors = new Set();
    rows.forEach(({ property }) => {
        if (property?.vendorName) {
            vendors.add(String(property.vendorName));
        }
    });
    rows.forEach(({ property, project }) => {
        const sn = property?.ebNo ?? property?.propertyTaxNo ?? property?.waterTaxNo
            ?? property?.professionalTaxNo ?? property?.professionTaxNo;
        if (!sn) return;
        const paymentsForService = payments.filter((p) => p?.utilityTypeNumber === sn);
        const scoped = yearMonth
            ? paymentsForService.filter((p) => p?.utilityForTheMonth === yearMonth)
            : paymentsForService.filter(
                (p) => typeof p?.utilityForTheMonth === 'string' && p.utilityForTheMonth.startsWith(`${year}-`)
            );
        scoped.forEach((p) => {
            const v = p?.vendorName ?? p?.vendor ?? p?.vendor_name ?? '';
            if (v) vendors.add(String(v));
        });
    });
    return Array.from(vendors).sort((a, b) => a.localeCompare(b)).map((value) => ({ value, label: value }));
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
            if (providerFilter && !toLower(detail.serviceProvider).includes(providerFilter)) return false;
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

export const getProviderOptionsFromFiltered = (filters, computeFn, flattenFn) => {
    const subset = computeFn(filters, 'provider');
    const rows = flattenFn(subset);
    const providers = new Set();
    rows.forEach(({ detail }) => {
        const p = (detail?.serviceProvider || '').trim();
        if (p) providers.add(p);
    });
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
