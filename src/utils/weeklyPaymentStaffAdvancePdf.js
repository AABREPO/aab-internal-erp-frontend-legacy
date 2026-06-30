/** Staff advance portal helpers for Weekly Payment PDF (Salary vs Wage Advance by from_purpose). */

export const UTILITY_BILL_TYPES = ['Telecom', 'Electricity', 'Property', 'Water', 'Subscription', 'Profession'];
export const UTILITY_BILLS_SUMMARY_TYPE = 'Utility Bills';

export function isUtilityBillExpenseType(type) {
    return UTILITY_BILL_TYPES.includes(type);
}

export function isUtilityBillEntry(entry) {
    const type = entry?.type;
    return isUtilityBillExpenseType(type) || type === UTILITY_BILLS_SUMMARY_TYPE;
}

export function getExpenseSummaryType(type) {
    if (isUtilityBillExpenseType(type)) return UTILITY_BILLS_SUMMARY_TYPE;
    return type;
}

/** Group weekly-payment expenses by type for the top summary row (count + total per type). */
export function buildWeeklyPaymentExpenseTypeSummary(expenses = [], weeklyTypes = []) {
    const summaryMap = {};
    (expenses || []).forEach((expense) => {
        if (!expense?.type || !(Number(expense.amount) > 0)) return;
        const summaryType = getExpenseSummaryType(expense.type);
        if (!summaryMap[summaryType]) {
            summaryMap[summaryType] = { count: 0, total: 0 };
        }
        summaryMap[summaryType].count += 1;
        summaryMap[summaryType].total += Number(expense.amount) || 0;
    });
    UTILITY_BILL_TYPES.forEach((utilityType) => {
        delete summaryMap[utilityType];
    });
    const hasSummaryData = (entry) => entry && (entry.count > 0 || entry.total > 0);
    const fixedTypes = weeklyTypes.map((typeObj) => typeObj.type).filter(Boolean);
    const seen = new Set();
    const items = [];
    fixedTypes.forEach((type) => {
        const entry = summaryMap[type];
        if (!hasSummaryData(entry)) return;
        seen.add(type);
        items.push({ type, count: entry.count, total: entry.total });
    });
    if (!seen.has(UTILITY_BILLS_SUMMARY_TYPE) && hasSummaryData(summaryMap[UTILITY_BILLS_SUMMARY_TYPE])) {
        const entry = summaryMap[UTILITY_BILLS_SUMMARY_TYPE];
        items.push({
            type: UTILITY_BILLS_SUMMARY_TYPE,
            count: entry.count,
            total: entry.total,
        });
        seen.add(UTILITY_BILLS_SUMMARY_TYPE);
    }
    Object.entries(summaryMap).forEach(([type, entry]) => {
        if (seen.has(type) || !hasSummaryData(entry)) return;
        items.push({ type, count: entry.count, total: entry.total });
    });
    const positiveExpenses = (expenses || []).filter((expense) => Number(expense.amount) > 0);
    return {
        items,
        totalCount: positiveExpenses.length,
        totalAmount: positiveExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0),
    };
}

const SALARY_ADVANCE_PURPOSE = 'salary advance';
const WAGE_ADVANCE_PURPOSE = 'wage advance';

export async function fetchStaffPurposeOptions() {
    try {
        const res = await fetch('https://backendaab.in/aabuildersDash/api/purposes/getAll');
        if (!res.ok) return [];
        const data = await res.json();
        return (Array.isArray(data) ? data : []).map((item) => ({
            id: item.id,
            label: item.purpose,
            value: item.purpose,
        }));
    } catch {
        return [];
    }
}

export function getStaffAdvancePurposeName(entry, staffPurposeOptions = []) {
    const raw =
        entry?.from_purpose ??
        entry?.fromPurpose ??
        entry?.purpose ??
        '';
    if (raw && String(raw).trim()) return String(raw).trim();
    const id = entry?.from_purpose_id;
    if (id == null || id === '') return '';
    const opt = staffPurposeOptions.find((p) => String(p.id) === String(id));
    return opt?.label || opt?.value || '';
}

const normalizePurpose = (name) => (name ? String(name).trim().toLowerCase() : '');

export function isSalaryAdvancePortalEntry(entry, staffPurposeOptions) {
    return normalizePurpose(getStaffAdvancePurposeName(entry, staffPurposeOptions)) === SALARY_ADVANCE_PURPOSE;
}

export function isWageAdvancePortalEntry(entry, staffPurposeOptions) {
    return normalizePurpose(getStaffAdvancePurposeName(entry, staffPurposeOptions)) === WAGE_ADVANCE_PURPOSE;
}

/** Cash advances in week, split by from_purpose (Salary vs Wage Advance). */
export function splitStaffAdvancePortalByPurpose(staffAdvanceData, isDateInWeek, staffPurposeOptions = []) {
    const inWeek = (staffAdvanceData || []).filter(
        (entry) =>
            entry.staff_payment_mode === 'Cash' &&
            entry.type === 'Advance' &&
            isDateInWeek(entry.date)
    );
    const salaryAdvanceEntries = inWeek.filter((e) => isSalaryAdvancePortalEntry(e, staffPurposeOptions));
    const wageAdvanceEntries = inWeek.filter((e) => isWageAdvancePortalEntry(e, staffPurposeOptions));
    const salaryAdvanceTotal = salaryAdvanceEntries.reduce(
        (sum, entry) => sum + (Number(entry.amount) || 0),
        0
    );
    return { salaryAdvanceEntries, wageAdvanceEntries, salaryAdvanceTotal };
}

export function getPortalAdvancePartyName(entry, { getEmployeeName, getLabourName } = {}) {
    if (entry?.employee_id && getEmployeeName) {
        const name = getEmployeeName(entry.employee_id);
        if (name) return name;
    }
    if (entry?.labour_id && getLabourName) {
        const name = getLabourName(entry.labour_id);
        if (name) return name;
    }
    return (
        entry?.employee_name ??
        entry?.emp_name ??
        entry?.labour_name ??
        ''
    );
}

export function getPortalAdvanceProjectName(entry, siteOptions = []) {
    const projectId = entry?.project_id ?? entry?.projectId;
    if (projectId == null || projectId === '') return '';
    const site = siteOptions.find((opt) => String(opt.id) === String(projectId));
    return site?.label || site?.value || '';
}
