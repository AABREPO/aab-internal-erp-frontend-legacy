const API_BASE = 'https://backendaab.in/aabuildersDash/api';

export const getNumericEno = (purchaseOrder = {}) => {
    const candidateKeys = ['eno', 'poNo', 'po_no', 'po_number', 'purchase_order_number', 'poNumber'];
    for (const key of candidateKeys) {
        const value = purchaseOrder[key];
        if (value === undefined || value === null || value === '') continue;
        const parsed = parseInt(String(value).replace('#', ''), 10);
        if (!Number.isNaN(parsed)) return parsed;
    }
    return 0;
};

export const formatPoNumberDisplay = (eno) => {
    const numeric = getNumericEno({ eno });
    return numeric > 0 ? `#${numeric}` : '';
};

export const formatDateForPoSave = (dateValue) => {
    if (!dateValue) return '';
    if (typeof dateValue === 'string' && dateValue.includes('/')) return dateValue;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return String(dateValue);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export async function fetchNextPoNumberForVendor(vendorId) {
    if (!vendorId) return 1;
    try {
        const response = await fetch(
            `${API_BASE}/purchase_orders/countByVendor?vendorId=${encodeURIComponent(String(vendorId))}`,
            { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } }
        );
        if (!response.ok) throw new Error('Failed to fetch purchase orders');
        const raw = await response.text();
        const count = Number(String(raw || '').trim());
        if (!Number.isFinite(count) || count < 0) return 1;
        return count + 1;
    } catch (error) {
        console.error('Failed to fetch last PO number:', error);
        return 1;
    }
}

export async function resolvePoEnoForVendor(vendorId, { isEditing = false, displayedPoNumber = '' } = {}) {
    if (isEditing) {
        const existing = getNumericEno({ eno: displayedPoNumber });
        return existing > 0 ? existing : 1;
    }
    return fetchNextPoNumberForVendor(vendorId);
}

const INCHARGE_FETCH_HEADERS = { 'Content-Type': 'application/json' };

export const getEmployeeDisplayName = (employee = {}) =>
    employee.employeeName ||
    employee.name ||
    employee.fullName ||
    employee.employee_name ||
    '';

export const getSupportStaffDisplayName = (staff = {}) =>
    staff.support_staff_name || staff.supportStaffName || staff.name || '';

const normalizeListResponse = (data) => (Array.isArray(data) ? data : []);

export function buildInchargeSelectOptions(employees = [], supportStaff = []) {
    const employeeOptions = employees
        .map((emp) => {
            const label = getEmployeeDisplayName(emp);
            if (!label.trim()) return null;
            return {
                value: `employee:${emp.id}`,
                label,
                mobileNumber:
                    emp.employee_mobile_number ||
                    emp.mobileNumber ||
                    emp.mobile_number ||
                    emp.contact ||
                    '',
                id: emp.id,
                type: 'employee',
            };
        })
        .filter(Boolean);
    const supportOptions = supportStaff
        .map((staff) => {
            const label = getSupportStaffDisplayName(staff);
            if (!label.trim()) return null;
            return {
                value: `support staff:${staff.id}`,
                label,
                mobileNumber: staff.mobile_number || staff.mobileNumber || '',
                id: staff.id,
                type: 'support staff',
            };
        })
        .filter(Boolean);
    return [...employeeOptions, ...supportOptions];
}

export async function fetchInchargeLists() {
    try {
        const [employeeResponse, supportStaffResponse] = await Promise.all([
            fetch(`${API_BASE}/employee_details/site_engineers`, {
                method: 'GET',
                credentials: 'include',
                headers: INCHARGE_FETCH_HEADERS,
            }),
            fetch(`${API_BASE}/support_staff/getAll`, {
                method: 'GET',
                credentials: 'include',
                headers: INCHARGE_FETCH_HEADERS,
            }),
        ]);
        const employees = employeeResponse.ok
            ? normalizeListResponse(await employeeResponse.json())
            : [];
        const supportStaff = supportStaffResponse.ok
            ? normalizeListResponse(await supportStaffResponse.json())
            : [];
        return {
            employees,
            supportStaff,
            options: buildInchargeSelectOptions(employees, supportStaff),
        };
    } catch (error) {
        console.error('Error fetching incharge lists:', error);
        return { employees: [], supportStaff: [], options: [] };
    }
}

export async function fetchMergedInchargeOptions() {
    const { options } = await fetchInchargeLists();
    return options;
}

export function areItemsSame(items1, items2) {
    if (!items1 || !items2 || items1.length !== items2.length) return false;
    const normalizeItem = (item) => ({
        item_id: item.item_id ?? item.itemId ?? null,
        category_id: item.category_id ?? item.categoryId ?? null,
        model_id: item.model_id ?? item.modelId ?? null,
        brand_id: item.brand_id ?? item.brandId ?? null,
        type_id: item.type_id ?? item.typeId ?? null,
    });
    const sortKey = (item) =>
        `${item.item_id || ''}-${item.category_id || ''}-${item.model_id || ''}-${item.brand_id || ''}-${item.type_id || ''}`;
    const normalizedItems1 = items1.map(normalizeItem).sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    const normalizedItems2 = items2.map(normalizeItem).sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    for (let i = 0; i < normalizedItems1.length; i++) {
        const item1 = normalizedItems1[i];
        const item2 = normalizedItems2[i];
        if (
            item1.item_id !== item2.item_id ||
            item1.category_id !== item2.category_id ||
            item1.model_id !== item2.model_id ||
            item1.brand_id !== item2.brand_id ||
            item1.type_id !== item2.type_id
        ) {
            return false;
        }
    }
    return true;
}

export async function fetchPreviousPO(vendorId, clientId) {
    if (!vendorId || !clientId) return null;
    try {
        const response = await fetch(`${API_BASE}/purchase_orders/getAll`);
        if (!response.ok) throw new Error('Failed to fetch purchase orders');
        const data = await response.json();
        const matchingPOs = (Array.isArray(data) ? data : [])
            .filter(
                (order) =>
                    String(order.vendor_id ?? order.vendorId) === String(vendorId) &&
                    String(order.client_id ?? order.clientId) === String(clientId)
            )
            .sort((a, b) => getNumericEno(b) - getNumericEno(a));
        return matchingPOs.length > 0 ? matchingPOs[0] : null;
    } catch (error) {
        console.error('Failed to fetch previous PO:', error);
        return null;
    }
}

export const resolveCategoryId = (categoryName, categoryOptions) => {
    if (!categoryName || !Array.isArray(categoryOptions) || !categoryOptions.length) return null;
    const target = String(categoryName).trim().toLowerCase();
    const found = categoryOptions.find((cat) => {
        const label = String(cat.label || '').trim().toLowerCase();
        const val = String(cat.value || '').trim().toLowerCase();
        const name = String(cat.name || '').trim().toLowerCase();
        const catName = String(cat.categoryName || '').trim().toLowerCase();
        return label === target || val === target || name === target || catName === target;
    });
    return found ? (found.id || found._id || null) : null;
};

export function buildPurchaseTablePayload(items, { isEditing, originalId, poItemName, poBrand, poModel, poType, categoryOptions }) {
    return items.map((item) => {
        const itemNameOnly = item.itemName || '';
        const categoryName = item.category || '';
        let itemId = item.itemId ?? null;
        let brandId = item.brandId ?? null;
        let modelId = item.modelId ?? null;
        let typeId = item.typeId ?? null;
        let categoryId = item.categoryId ?? null;

        if (!itemId && itemNameOnly && poItemName?.length) {
            const foundItem = poItemName.find(
                (i) => (i.itemName || i.name || '').toLowerCase() === itemNameOnly.toLowerCase()
            );
            itemId = foundItem ? (foundItem.id || foundItem._id) : null;
        }
        if (!brandId && item.brand && poBrand?.length) {
            const foundBrand = poBrand.find(
                (b) => (b.brand || b.brandName || b.name || '').toLowerCase() === item.brand.toLowerCase()
            );
            brandId = foundBrand ? (foundBrand.id || foundBrand._id) : null;
        }
        if (!modelId && item.model && poModel?.length) {
            const foundModel = poModel.find(
                (m) => (m.model || m.modelName || m.name || '').toLowerCase() === item.model.toLowerCase()
            );
            modelId = foundModel ? (foundModel.id || foundModel._id) : null;
        }
        if (!typeId && item.type && poType?.length) {
            const foundType = poType.find(
                (t) => (t.typeColor || t.type || t.typeName || t.name || '').toLowerCase() === item.type.toLowerCase()
            );
            typeId = foundType ? (foundType.id || foundType._id) : null;
        }
        if (!categoryId && categoryName) {
            categoryId = resolveCategoryId(categoryName, categoryOptions);
        }

        return {
            id: isEditing && originalId ? (item.tableRowId || null) : null,
            item_id: itemId || null,
            category_id: categoryId || null,
            model_id: modelId || null,
            brand_id: brandId || null,
            type_id: typeId || null,
            quantity: item.quantity,
            amount: item.amount || 0,
            _itemName: itemNameOnly,
            _category: categoryName,
            _model: item.model || '',
            _brand: item.brand || '',
            _type: item.type || '',
        };
    });
}

export async function savePurchaseOrder({ payload, isEditing, originalId, username }) {
    const baseUrl = `${API_BASE}/purchase_orders`;
    const url = isEditing
        ? `${baseUrl}/edit_with_history/${originalId}?changedBy=${encodeURIComponent(username || '')}`
        : `${baseUrl}/save`;
    return fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
}

export function mapHistoryItemsToDesktopItems(historyItems = []) {
    return historyItems.map((item, index) => {
        const itemName = item.itemName || item.name || '';
        const category = item.categoryName || item.category || '';
        return {
            itemName: itemName.includes(',') ? itemName.split(',')[0].trim() : itemName,
            itemId: item.itemId || item.item_id || null,
            category: category || (itemName.includes(',') ? itemName.split(',')[1].trim() : ''),
            categoryId: item.categoryId || item.category_id || null,
            model: item.modelName || item.model || '',
            modelId: item.modelId || item.model_id || null,
            brand: item.brandName || item.brand || '',
            brandId: item.brandId || item.brand_id || null,
            type: item.typeName || item.typeColor || item.type || '',
            typeId: item.typeId || item.type_id || null,
            quantity: item.quantity || 0,
            amount: item.amount || 0,
            tableRowId: item.id || item.tableRowId || null,
            _rowKey: `item-${index}-${item.id || Math.random().toString(36).slice(2)}`,
        };
    });
}

export function parsePoDateForInput(poDate) {
    if (!poDate) return new Date().toISOString().split('T')[0];
    if (poDate.includes('/')) {
        const [day, month, year] = poDate.split('/');
        if (day && month && year) {
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
    if (poDate.includes('-') && poDate.length >= 10) {
        return poDate.slice(0, 10);
    }
    const parsed = new Date(poDate);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString().split('T')[0] : parsed.toISOString().split('T')[0];
}
