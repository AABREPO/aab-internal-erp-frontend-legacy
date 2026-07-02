import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import edit from '../Images/Edit.svg';
import {
    EDBC_IDS,
    DATABASE_TABLE_FILTER_SELECT_STYLES,
    getEdbcColumnConfig,
    useEdbcExpandedCells,
    EdbcColumnHeader,
    EdbcTimestampFilter,
    EdbcDateFilter,
    EdbcProjectNameFilter,
    EdbcTimestampBodyCell,
    EdbcDateBodyCell,
    EdbcProjectNameBodyCell,
    EdbcSelectFilter,
    EdbcPaymentModeFilter,
    EdbcTextInputFilter,
    EdbcTotalAmountFilter,
    EdbcEmptyFilterCell,
    EdbcBillArrivalFilter,
    EdbcExpandableBodyCell,
    EdbcActivityBodyCell,
    getExpenseActivityRestrictions,
    EdbcFileBodyCell,
    EdbcTableHeaderRow,
    EdbcTableFilterRow,
    EdbcTableBodyRow,
    EDBC_TABLE_EDGE_TABLE_CLASS,
    EDBC2_FIRST_COLUMN_WIDTH_CLASS,
} from './databaseExpensesSharedColumns';

export const BLANK_VALUE = 'Blank';
const BLANK_LABEL = 'Blank';
export const blankOption = { value: BLANK_VALUE, label: BLANK_LABEL };

const noop = () => {};

/** Sortable columns from EDBC_CONFIG — same keys EdbcColumnHeader uses for onClick. */
export const EDBC_SORT_OPTIONS = Object.values(EDBC_IDS)
    .map((columnId) => {
        const config = getEdbcColumnConfig(columnId);
        if (!config?.sortField) return null;
        return { columnId, sortField: config.sortField };
    })
    .filter(Boolean);

/** Pass to every EdbcColumnHeader on pages that use databaseExpensesSharedColumns headings. */
export function getEdbcColumnHeaderSortProps(sortField, sortDirection, handleSort) {
    if (typeof handleSort !== 'function') return {};
    return { sortField, sortDirection, onSort: handleSort };
}

/** Shared sort toggle — field must match a sortField from EDBC_SORT_OPTIONS / EDBC_CONFIG. */
export function useEdbcTableSort({ initialSortField = '', initialSortDirection = 'asc', onSortChange } = {}) {
    const [sortField, setSortField] = useState(initialSortField);
    const [sortDirection, setSortDirection] = useState(initialSortDirection);
    const handleSort = useCallback((field) => {
        if (!EDBC_SORT_OPTIONS.some((option) => option.sortField === field)) return;
        if (sortField === field) {
            setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        onSortChange?.(field);
    }, [sortField, onSortChange]);
    const sortProps = useMemo(
        () => getEdbcColumnHeaderSortProps(sortField, sortDirection, handleSort),
        [sortField, sortDirection, handleSort],
    );
    return {
        sortField,
        sortDirection,
        handleSort,
        setSortField,
        setSortDirection,
        sortProps,
    };
}

/** Sort expense rows by EDBC sortField — use with useEdbcTableSort / getEdbcColumnHeaderSortProps. */
export function sortEdbcExpenses(rows, sortField, sortDirection, resolvers = {}) {
    if (!sortField || !Array.isArray(rows)) return rows;
    const {
        getMachineToolsItemIdDisplay = () => '',
        getBranchName = () => '',
        getExpenseBillArrivalRaw = (expense) =>
            expense?.billArrivalDate ?? expense?.bill_arrival_date ?? '',
    } = resolvers;
    return [...rows].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        if (sortField === 'date' || sortField === 'timestamp') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (sortField === 'eno') {
            aValue = parseInt(aValue, 10) || 0;
            bValue = parseInt(bValue, 10) || 0;
        } else if (sortField === 'machineTools') {
            aValue = String(getMachineToolsItemIdDisplay(a.machineTools) || '').toLowerCase();
            bValue = String(getMachineToolsItemIdDisplay(b.machineTools) || '').toLowerCase();
        } else if (sortField === 'staff') {
            const aLabourId = a.labourId || a.labour_id || a.labourID || a.labour_ID;
            const aEmployeeId = a.employeeId || a.employee_id || a.employeeID || a.employee_ID;
            const bLabourId = b.labourId || b.labour_id || b.labourID || b.labour_ID;
            const bEmployeeId = b.employeeId || b.employee_id || b.employeeID || b.employee_ID;
            aValue = aLabourId ?? aEmployeeId ?? '';
            bValue = bLabourId ?? bEmployeeId ?? '';
            const aNum = Number(aValue);
            const bNum = Number(bValue);
            if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
                aValue = aNum;
                bValue = bNum;
            } else {
                aValue = String(aValue || '').toLowerCase();
                bValue = String(bValue || '').toLowerCase();
            }
        } else if (sortField === 'branch') {
            aValue = String(getBranchName(a.branch_id ?? a.branchId ?? '') || '').toLowerCase();
            bValue = String(getBranchName(b.branch_id ?? b.branchId ?? '') || '').toLowerCase();
        } else if (sortField === 'billArrivalDate') {
            aValue = String(getExpenseBillArrivalRaw(a) || '').slice(0, 10);
            bValue = String(getExpenseBillArrivalRaw(b) || '').slice(0, 10);
        } else if (sortField === 'quantity' || sortField === 'amount') {
            aValue = Number(aValue) || 0;
            bValue = Number(bValue) || 0;
        } else {
            aValue = String(aValue ?? '').toLowerCase();
            bValue = String(bValue ?? '').toLowerCase();
        }
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

const TableContext = createContext(null);

export function TableProvider({ value, children }) {
    return (
        <TableContext.Provider value={value}>
            {children}
        </TableContext.Provider>
    );
}

export function buildEntryCheckTableContext({
    currentItems,
    showFilters,
    filterRowRef,
    totalAmount,
    timestampStartDate,
    setTimestampStartDate,
    timestampEndDate,
    setTimestampEndDate,
    showTimestampDateRangePicker,
    setShowTimestampDateRangePicker,
    selectedExpenseDate,
    setSelectedExpenseDate,
    projectNameOptions,
    selectedSiteName,
    setSelectedSiteName,
    vendorOptions,
    selectedVendor,
    setSelectedVendor,
    contractorOptions,
    selectedContractor,
    setSelectedContractor,
    selectedQuantity,
    setSelectedQuantity,
    selectedAmount = '',
    setSelectedAmount = noop,
    selectedDescription,
    setSelectedDescription,
    categoryOptions,
    selectedCategory,
    setSelectedCategory,
    accountTypeOptions,
    selectedAccountType,
    setSelectedAccountType,
    branchFilterOptions,
    selectedBranch,
    setSelectedBranch,
    enoOptions,
    selectedEno,
    setSelectedEno,
    customStyles,
    formatDate,
    formatDateOnly,
    getBranchName,
    billArrivalFilterRef,
}) {
    const normalizedAccountTypeOptions = Array.isArray(accountTypeOptions) && accountTypeOptions.length > 0 && typeof accountTypeOptions[0] === 'string'
        ? accountTypeOptions.map((type) => ({ value: type, label: type }))
        : accountTypeOptions;

    return {
        currentItems,
        showFilters,
        filterRowRef,
        totalAmount,
        sortField: null,
        sortDirection: 'asc',
        handleSort: noop,
        timestampStartDate,
        setTimestampStartDate,
        timestampEndDate,
        setTimestampEndDate,
        showDateRangePicker: showTimestampDateRangePicker,
        setShowDateRangePicker: setShowTimestampDateRangePicker,
        selectedDate: selectedExpenseDate,
        setSelectedDate: setSelectedExpenseDate,
        siteOptions: projectNameOptions,
        selectedSiteName,
        setSelectedSiteName,
        vendorOptions,
        selectedVendor,
        setSelectedVendor,
        contractorOptions,
        selectedContractor,
        setSelectedContractor,
        staffOptions: [],
        selectedStaff: '',
        setSelectedStaff: noop,
        selectedQuantity,
        setSelectedQuantity,
        selectedAmount,
        setSelectedAmount,
        selectedDescription,
        setSelectedDescription,
        categoryOptions,
        selectedCategory,
        setSelectedCategory,
        accountTypeOptions: normalizedAccountTypeOptions,
        selectedAccountType,
        setSelectedAccountType,
        machineToolsOptions: [],
        selectedMachineTools: '',
        setSelectedMachineTools: noop,
        sourceOptions: [],
        selectedSource: '',
        setSelectedSource: noop,
        branchFilterOptions,
        selectedBranch,
        setSelectedBranch,
        enteredByOptions: [],
        selectedEnteredBy: '',
        setSelectedEnteredBy: noop,
        enoOptions,
        selectedEno,
        setSelectedEno,
        selectedBillArrival: '',
        setSelectedBillArrival: noop,
        billArrivalFilterRef,
        setBillArrivalCalendarPos: noop,
        setShowBillArrivalCalendar: noop,
        customStyles,
        formatDate,
        formatDateOnly,
        getDisplaySiteName: (expense) => expense.siteName,
        getDisplayVendorName: (expense) => expense.vendor,
        getDisplayContractorName: (expense) => expense.contractor,
        getDisplayStaffName: () => '',
        getMachineToolsItemIdDisplay: () => '',
        getBranchName,
        formatBillArrivalDisplay: () => '',
        handleEditClick: noop,
        handleDelete: noop,
        fetchAuditDetails: noop,
        username: '',
    };
}

export function buildTableViewExpenseTableContext({
    fieldLabels,
    currentItems,
    showFilters,
    filterRowRef,
    totalAmount,
    selectedQuantity = '',
    setSelectedQuantity = noop,
    selectedAmount = '',
    setSelectedAmount = noop,
    selectedDescription = '',
    setSelectedDescription = noop,
    selectedServiceNumber = '',
    setSelectedServiceNumber = noop,
    sortField,
    sortDirection,
    handleSort,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    showDateRangePicker,
    setShowDateRangePicker,
    siteOptions,
    selectedSiteName,
    setSelectedSiteName,
    vendorOptions,
    selectedVendor,
    setSelectedVendor,
    contractorOptions,
    selectedContractor,
    setSelectedContractor,
    categoryOptions,
    selectedCategory,
    setSelectedCategory,
    accountTypeOptions,
    selectedAccountType,
    setSelectedAccountType,
    machineToolsOptions,
    selectedMachineTools,
    setSelectedMachineTools,
    sourceOptions,
    selectedSource,
    setSelectedSource,
    branchFilterOptions,
    selectedBranch,
    setSelectedBranch,
    enteredByOptions = [],
    selectedEnteredBy = '',
    setSelectedEnteredBy = noop,
    enoOptions,
    selectedEno,
    setSelectedEno,
    customStyles,
    formatDate,
    formatDateOnly,
    getDisplaySiteName,
    getDisplayVendorName,
    getDisplayContractorName,
    getDisplayStaffName,
    getMachineToolsItemIdDisplay,
    getBranchName,
    formatBillArrivalDisplay,
    handleEditClick,
    username,
    billArrivalFilterRef,
}) {
    return {
        fieldLabels,
        currentItems,
        showFilters,
        filterRowRef,
        totalAmount,
        sortField,
        sortDirection,
        handleSort,
        timestampStartDate: startDate,
        setTimestampStartDate: setStartDate,
        timestampEndDate: endDate,
        setTimestampEndDate: setEndDate,
        showDateRangePicker,
        setShowDateRangePicker,
        selectedDate: '',
        setSelectedDate: noop,
        siteOptions,
        selectedSiteName,
        setSelectedSiteName,
        vendorOptions,
        selectedVendor,
        setSelectedVendor,
        contractorOptions,
        selectedContractor,
        setSelectedContractor,
        staffOptions: [],
        selectedStaff: '',
        setSelectedStaff: noop,
        selectedQuantity,
        setSelectedQuantity,
        selectedAmount,
        setSelectedAmount,
        selectedDescription,
        setSelectedDescription,
        selectedServiceNumber,
        setSelectedServiceNumber,
        categoryOptions,
        selectedCategory,
        setSelectedCategory,
        accountTypeOptions,
        selectedAccountType,
        setSelectedAccountType,
        machineToolsOptions,
        selectedMachineTools,
        setSelectedMachineTools,
        sourceOptions,
        selectedSource,
        setSelectedSource,
        branchFilterOptions,
        selectedBranch,
        setSelectedBranch,
        enteredByOptions,
        selectedEnteredBy,
        setSelectedEnteredBy,
        enoOptions,
        selectedEno,
        setSelectedEno,
        selectedBillArrival: '',
        setSelectedBillArrival: noop,
        billArrivalFilterRef,
        setBillArrivalCalendarPos: noop,
        setShowBillArrivalCalendar: noop,
        customStyles,
        formatDate,
        formatDateOnly,
        getDisplaySiteName,
        getDisplayVendorName,
        getDisplayContractorName,
        getDisplayStaffName,
        getMachineToolsItemIdDisplay,
        getBranchName,
        formatBillArrivalDisplay,
        handleEditClick,
        handleDelete: noop,
        fetchAuditDetails: noop,
        username,
    };
}

export function Table({
    showActivityColumn = true,
    showTimestampColumn = true,
    showServiceNumberColumn = false,
    tableClassName = '',
    activityColumnLabel,
    editOnlyActivityColumn = false,
    utilityHubDatabaseMode = false,
}) {
    const { expandedCells, toggleExpandedCell } = useEdbcExpandedCells();

    const {
        fieldLabels = {},
        currentItems,
        showFilters,
        filterRowRef,
        totalAmount,
        sortField,
        sortDirection,
        handleSort,
        timestampStartDate,
        setTimestampStartDate,
        timestampEndDate,
        setTimestampEndDate,
        showDateRangePicker,
        setShowDateRangePicker,
        selectedDate,
        setSelectedDate,
        useExpenseDateRangeFilter = false,
        expenseDateStartDate = '',
        expenseDateEndDate = '',
        showExpenseDateRangePicker = false,
        setShowExpenseDateRangePicker = noop,
        setExpenseDateStartDate = noop,
        setExpenseDateEndDate = noop,
        siteOptions,
        selectedSiteName,
        setSelectedSiteName,
        vendorOptions,
        selectedVendor,
        setSelectedVendor,
        contractorOptions,
        selectedContractor,
        setSelectedContractor,
        staffOptions,
        selectedStaff,
        setSelectedStaff,
        selectedQuantity,
        setSelectedQuantity,
        selectedAmount = '',
        setSelectedAmount = noop,
        selectedDescription,
        setSelectedDescription,
        selectedServiceNumber = '',
        setSelectedServiceNumber = noop,
        categoryOptions,
        selectedCategory,
        setSelectedCategory,
        accountTypeOptions,
        selectedAccountType,
        setSelectedAccountType,
        machineToolsOptions,
        selectedMachineTools,
        setSelectedMachineTools,
        paymentModeFilterOptions = [],
        selectedPaymentMode = '',
        setSelectedPaymentMode = noop,
        selectedPaymentModes = [],
        setSelectedPaymentModes = noop,
        sourceOptions,
        selectedSource,
        setSelectedSource,
        branchFilterOptions,
        selectedBranch,
        setSelectedBranch,
        enteredByOptions,
        selectedEnteredBy,
        setSelectedEnteredBy,
        enoOptions,
        selectedEno,
        setSelectedEno,
        selectedBillArrival,
        setSelectedBillArrival,
        billArrivalFilterRef,
        setBillArrivalCalendarPos,
        setShowBillArrivalCalendar,
        customStyles,
        formatDate,
        formatDateOnly,
        getDisplaySiteName,
        getDisplayVendorName,
        getDisplayContractorName,
        getDisplayStaffName,
        getMachineToolsItemIdDisplay,
        getBranchName,
        formatBillArrivalDisplay,
        handleEditClick,
        handleDelete,
        fetchAuditDetails,
        username,
    } = useContext(TableContext);

    const dstCol1Label = 'Timestamp';
    const dstCol2Label = fieldLabels.date ?? 'Date';
    const dstCol3Label = fieldLabels.projectName ?? 'Project Name';
    const dstCol4Label = fieldLabels.vendorName ?? 'Vendor Name';
    const dstCol5Label = fieldLabels.contractorName ?? 'Contractor Name';
    const dstCol6Label = fieldLabels.staffName ?? 'Staff Name';
    const dstCol7Label = fieldLabels.quantity ?? 'Quantity';
    const dstCol8Label = fieldLabels.amount ?? 'Amount';
    const dstCol9Label = fieldLabels.description ?? 'Description';
    const dstCol10Label = fieldLabels.category ?? 'Category';
    const dstCol11Label = fieldLabels.machineTools ?? 'Machine Tools';
    const dstCol12Label = fieldLabels.accountType ?? 'A/C Type';
    const dstCol23Label = fieldLabels.serviceNumber ?? 'Service Number';
    const dstCol13Label = fieldLabels.mode ?? 'Mode';
    const dstCol14Label = fieldLabels.sourceFrom ?? 'Source From';
    const dstCol15Label = fieldLabels.branch ?? 'Branch';
    const dstCol16Label = fieldLabels.enteredBy ?? 'Entered By';
    const dstCol17Label = fieldLabels.entryNo ?? 'Entry No';
    const dstCol18Label = fieldLabels.billArrival ?? 'Bill Arrival';
    const dstCol19Label = fieldLabels.activity ?? 'Activity';
    const dstCol20Label = fieldLabels.file ?? 'File';

    const activityLabel = activityColumnLabel || dstCol19Label;
    const activityTdClass = getEdbcColumnConfig(EDBC_IDS.EDBC19)?.tdClass || '';
    const edbc2ColumnWidthClass = showTimestampColumn ? '' : EDBC2_FIRST_COLUMN_WIDTH_CLASS;
    const edbcSortProps = getEdbcColumnHeaderSortProps(sortField, sortDirection, handleSort);

    return (
        <table className={`table-fixed w-full border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} ${tableClassName || 'min-w-[1920px]'}`.trim()}>
            <thead className="sticky top-0 z-10 bg-white ">
                <EdbcTableHeaderRow>
                    {showTimestampColumn && (
                        <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC1}
                            label={dstCol1Label}
                            {...edbcSortProps}
                        />
                    )}
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC2}
                        label={dstCol2Label}
                        {...edbcSortProps}
                        columnWidthClass={edbc2ColumnWidthClass}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC3}
                        label={dstCol3Label}
                        {...edbcSortProps}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC4}
                        label={dstCol4Label}
                        {...edbcSortProps}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC5}
                        label={dstCol5Label}
                        {...edbcSortProps}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC6}
                        label={dstCol6Label}
                        {...edbcSortProps}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC7}
                        label={dstCol7Label}
                        {...edbcSortProps}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC8}
                        label={dstCol8Label}
                        {...edbcSortProps}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC9}
                        label={dstCol9Label}
                        {...edbcSortProps}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC10}
                        label={dstCol10Label}
                        {...edbcSortProps}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC11}
                        label={dstCol11Label}
                        {...edbcSortProps}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC12}
                        label={dstCol12Label}
                        {...edbcSortProps}
                    />
                    {showServiceNumberColumn && (
                        <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC23}
                            label={dstCol23Label}
                            {...edbcSortProps}
                        />
                    )}
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC13}
                        label={dstCol13Label}
                        {...edbcSortProps}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC14}
                        label={dstCol14Label}
                        {...edbcSortProps}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC15}
                        label={dstCol15Label}
                        {...edbcSortProps}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC16}
                        label={dstCol16Label}
                        {...edbcSortProps}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC17}
                        label={dstCol17Label}
                        {...edbcSortProps}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC18}
                        label={dstCol18Label}
                        {...edbcSortProps}
                    />
                    {showActivityColumn && (
                        <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC19}
                            label={activityLabel}
                        />
                    )}
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC20}
                        label={dstCol20Label}
                    />
                </EdbcTableHeaderRow>
                {showFilters && (
                    <EdbcTableFilterRow ref={filterRowRef}>
                        {showTimestampColumn && (
                            <EdbcTimestampFilter
                                placeholder={dstCol1Label}
                                timestampStartDate={timestampStartDate}
                                timestampEndDate={timestampEndDate}
                                isOpen={showDateRangePicker}
                                onOpen={() => setShowDateRangePicker(true)}
                                onClose={() => setShowDateRangePicker(false)}
                                onApply={(from, to) => {
                                    setTimestampStartDate(from);
                                    setTimestampEndDate(to);
                                }}
                            />
                        )}
                        {showTimestampColumn ? (
                            useExpenseDateRangeFilter ? (
                                <EdbcTimestampFilter
                                    columnId={EDBC_IDS.EDBC2}
                                    placeholder={dstCol2Label}
                                    timestampStartDate={expenseDateStartDate}
                                    timestampEndDate={expenseDateEndDate}
                                    isOpen={showExpenseDateRangePicker}
                                    onOpen={() => setShowExpenseDateRangePicker(true)}
                                    onClose={() => setShowExpenseDateRangePicker(false)}
                                    onApply={(from, to) => {
                                        setExpenseDateStartDate(from);
                                        setExpenseDateEndDate(to);
                                    }}
                                />
                            ) : (
                                <EdbcDateFilter
                                    placeholder={dstCol2Label}
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                />
                            )
                        ) : (
                            <EdbcTimestampFilter
                                columnId={EDBC_IDS.EDBC2}
                                placeholder={dstCol2Label}
                                timestampStartDate={timestampStartDate}
                                timestampEndDate={timestampEndDate}
                                isOpen={showDateRangePicker}
                                onOpen={() => setShowDateRangePicker(true)}
                                onClose={() => setShowDateRangePicker(false)}
                                onApply={(from, to) => {
                                    setTimestampStartDate(from);
                                    setTimestampEndDate(to);
                                }}
                            />
                        )}
                        <EdbcProjectNameFilter
                            placeholder={dstCol3Label}
                            options={siteOptions}
                            value={selectedSiteName}
                            onChange={setSelectedSiteName}
                            blankOption={blankOption}
                            blankValue={BLANK_VALUE}
                            selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                        />
                        <EdbcSelectFilter
                            columnId={EDBC_IDS.EDBC4}
                            placeholder={dstCol4Label}
                            options={vendorOptions}
                            value={selectedVendor}
                            onChange={setSelectedVendor}
                            blankOption={blankOption}
                            blankValue={BLANK_VALUE}
                            selectStyles={customStyles}
                        />
                        <EdbcSelectFilter
                            columnId={EDBC_IDS.EDBC5}
                            placeholder={dstCol5Label}
                            options={contractorOptions}
                            value={selectedContractor}
                            onChange={setSelectedContractor}
                            blankOption={blankOption}
                            blankValue={BLANK_VALUE}
                            selectStyles={customStyles}
                        />
                        <EdbcSelectFilter
                            columnId={EDBC_IDS.EDBC6}
                            placeholder={dstCol6Label}
                            options={staffOptions}
                            value={selectedStaff}
                            onChange={setSelectedStaff}
                            blankOption={blankOption}
                            blankValue={BLANK_VALUE}
                            selectStyles={customStyles}
                        />
                        <EdbcTextInputFilter
                            columnId={EDBC_IDS.EDBC7}
                            placeholder={dstCol7Label}
                            value={selectedQuantity}
                            onChange={(e) => setSelectedQuantity(e.target.value)}
                        />
                        <EdbcTotalAmountFilter
                            columnId={EDBC_IDS.EDBC8}
                            totalAmount={totalAmount}
                            value={selectedAmount}
                            onChange={(e) => setSelectedAmount(e.target.value)}
                        />
                        <EdbcTextInputFilter
                            columnId={EDBC_IDS.EDBC9}
                            placeholder={dstCol9Label}
                            value={selectedDescription}
                            onChange={(e) => setSelectedDescription(e.target.value)}
                        />
                        <EdbcSelectFilter
                            columnId={EDBC_IDS.EDBC10}
                            placeholder={dstCol10Label}
                            options={categoryOptions}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            blankOption={blankOption}
                            blankValue={BLANK_VALUE}
                            selectStyles={customStyles}
                        />
                        <EdbcSelectFilter
                            columnId={EDBC_IDS.EDBC11}
                            placeholder={dstCol11Label}
                            options={machineToolsOptions}
                            selectValue={selectedMachineTools ? machineToolsOptions.find(opt => opt.value === String(selectedMachineTools)) : null}
                            onChange={setSelectedMachineTools}
                            selectStyles={customStyles}
                        />
                        <EdbcSelectFilter
                            columnId={EDBC_IDS.EDBC12}
                            placeholder={dstCol12Label}
                            options={accountTypeOptions}
                            selectValue={selectedAccountType ? { value: selectedAccountType, label: selectedAccountType } : null}
                            onChange={setSelectedAccountType}
                            selectStyles={customStyles}
                        />
                        {showServiceNumberColumn && (
                            <EdbcTextInputFilter
                                columnId={EDBC_IDS.EDBC23}
                                placeholder={dstCol23Label}
                                value={selectedServiceNumber}
                                onChange={(e) => setSelectedServiceNumber(e.target.value)}
                            />
                        )}
                        {setSelectedPaymentModes !== noop ? (
                            <EdbcPaymentModeFilter
                                columnId={EDBC_IDS.EDBC13}
                                placeholder={dstCol13Label}
                                options={paymentModeFilterOptions}
                                value={selectedPaymentModes}
                                onChange={setSelectedPaymentModes}
                                selectStyles={customStyles}
                            />
                        ) : setSelectedPaymentMode !== noop ? (
                            <EdbcSelectFilter
                                columnId={EDBC_IDS.EDBC13}
                                placeholder={dstCol13Label}
                                options={paymentModeFilterOptions}
                                value={selectedPaymentMode}
                                onChange={setSelectedPaymentMode}
                                blankOption={blankOption}
                                blankValue={BLANK_VALUE}
                                selectStyles={customStyles}
                            />
                        ) : (
                            <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC13} />
                        )}
                        <EdbcSelectFilter
                            columnId={EDBC_IDS.EDBC14}
                            placeholder={dstCol14Label}
                            options={sourceOptions}
                            value={selectedSource}
                            onChange={setSelectedSource}
                            blankOption={blankOption}
                            blankValue={BLANK_VALUE}
                            selectStyles={customStyles}
                        />
                        <EdbcSelectFilter
                            columnId={EDBC_IDS.EDBC15}
                            placeholder={dstCol15Label}
                            options={branchFilterOptions}
                            selectValue={selectedBranch ? branchFilterOptions.find(opt => opt.value === String(selectedBranch)) : null}
                            onChange={setSelectedBranch}
                            selectStyles={customStyles}
                        />
                        <EdbcSelectFilter
                            columnId={EDBC_IDS.EDBC16}
                            placeholder={dstCol16Label}
                            options={enteredByOptions}
                            value={selectedEnteredBy}
                            onChange={setSelectedEnteredBy}
                            blankOption={blankOption}
                            blankValue={BLANK_VALUE}
                            selectStyles={customStyles}
                        />
                        <EdbcSelectFilter
                            columnId={EDBC_IDS.EDBC17}
                            placeholder={dstCol17Label}
                            options={enoOptions.map((eno) => (String(eno) === BLANK_VALUE ? blankOption : { value: String(eno), label: String(eno) }))}
                            value={selectedEno}
                            onChange={setSelectedEno}
                            blankOption={blankOption}
                            blankValue={BLANK_VALUE}
                            selectStyles={customStyles}
                            textAlign="right"
                        />
                        <EdbcBillArrivalFilter
                            columnId={EDBC_IDS.EDBC18}
                            placeholder={dstCol18Label}
                            value={selectedBillArrival}
                            onChange={setSelectedBillArrival}
                            filterRef={billArrivalFilterRef}
                            onCalendarMouseDown={(e) => {
                                if (!e.target.closest('[aria-label="Open calendar"]')) return;
                                e.preventDefault();
                                e.stopPropagation();
                                const rect = billArrivalFilterRef.current?.getBoundingClientRect();
                                if (!rect) return;
                                setBillArrivalCalendarPos({ top: rect.bottom, left: rect.right });
                                setShowBillArrivalCalendar(true);
                            }}
                        />
                        {showActivityColumn && <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC19} />}
                        <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC20} />
                    </EdbcTableFilterRow>
                )}
            </thead>
            <tbody>
                {currentItems.map((expense, index) => (
                    <EdbcTableBodyRow key={expense.id}>
                        {showTimestampColumn && (
                            <EdbcTimestampBodyCell
                                expense={expense}
                                rowIndex={index}
                                expandedCells={expandedCells}
                                onToggleExpanded={toggleExpandedCell}
                                formatValue={formatDate}
                            />
                        )}
                        <EdbcDateBodyCell
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            formatValue={formatDateOnly}
                            columnWidthClass={edbc2ColumnWidthClass}
                        />
                        <EdbcProjectNameBodyCell
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            getDisplayValue={getDisplaySiteName}
                        />
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC4}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            getDisplayValue={getDisplayVendorName}
                        />
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC5}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            getDisplayValue={getDisplayContractorName}
                        />
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC6}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            getDisplayValue={getDisplayStaffName}
                        />
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC7}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            getDisplayValue={(row) => row.quantity}
                        />
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC8}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            textAlignClass="text-right"
                            getDisplayValue={(row) => `₹${Number(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        />
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC9}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            getDisplayValue={(row) => row.comments || ''}
                        />
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC10}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            getDisplayValue={(row) => row.category}
                        />
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC11}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            getDisplayValue={(row) => getMachineToolsItemIdDisplay(row.machineTools)}
                        />
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC12}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            getDisplayValue={(row) => row.accountType}
                        />
                        {showServiceNumberColumn && (
                            <EdbcExpandableBodyCell
                                columnId={EDBC_IDS.EDBC23}
                                expense={expense}
                                rowIndex={index}
                                expandedCells={expandedCells}
                                onToggleExpanded={toggleExpandedCell}
                                textAlignClass="text-right"
                                getDisplayValue={(row) => row.utilityTypeNumber ?? row.utility_type_number ?? ''}
                            />
                        )}
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC13}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            getDisplayValue={(row) => row.paymentMode || ''}
                        />
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC14}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            getDisplayValue={(row) => row.source}
                        />
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC15}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            getDisplayValue={(row) => getBranchName(row.branch_id ?? row.branchId ?? '') || ''}
                        />
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC16}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            getDisplayValue={(row) => row.enteredBy || 'Sivaprakasm'}
                        />
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC17}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            textAlignClass="text-right"
                            getDisplayValue={(row) => row.eno}
                        />
                        <EdbcExpandableBodyCell
                            columnId={EDBC_IDS.EDBC18}
                            expense={expense}
                            rowIndex={index}
                            expandedCells={expandedCells}
                            onToggleExpanded={toggleExpandedCell}
                            textAlignClass="text-right"
                            getDisplayValue={formatBillArrivalDisplay}
                        />
                        {showActivityColumn && (
                            editOnlyActivityColumn ? (
                                <td id={EDBC_IDS.EDBC19} className={activityTdClass}>
                                    {(() => {
                                        const { editDisabled, editTitle } = getExpenseActivityRestrictions(expense, {
                                            utilityHubDatabaseMode,
                                        });
                                        return (
                                            <button
                                                type="button"
                                                onClick={editDisabled ? undefined : () => handleEditClick(expense)}
                                                disabled={editDisabled}
                                                title={editTitle}
                                                className={`rounded-full transition duration-200 ${editDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <img
                                                    src={edit}
                                                    alt="Edit"
                                                    className={`w-4 h-6 transition duration-200 ${editDisabled ? '' : 'transform hover:scale-110 hover:brightness-110'}`}
                                                />
                                            </button>
                                        );
                                    })()}
                                </td>
                            ) : (
                                <EdbcActivityBodyCell
                                    columnId={EDBC_IDS.EDBC19}
                                    expense={expense}
                                    onEdit={handleEditClick}
                                    onDelete={handleDelete}
                                    onHistory={fetchAuditDetails}
                                    username={username}
                                    utilityHubDatabaseMode={utilityHubDatabaseMode}
                                />
                            )
                        )}
                        <EdbcFileBodyCell columnId={EDBC_IDS.EDBC20} expense={expense} />
                    </EdbcTableBodyRow>
                ))}
            </tbody>
        </table>
    );
}
