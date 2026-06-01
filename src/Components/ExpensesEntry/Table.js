import React, { createContext, useContext } from 'react';
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
    EdbcTextInputFilter,
    EdbcTotalAmountFilter,
    EdbcEmptyFilterCell,
    EdbcBillArrivalFilter,
    EdbcExpandableBodyCell,
    EdbcActivityBodyCell,
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
    currentItems,
    showFilters,
    filterRowRef,
    totalAmount,
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
        selectedQuantity: '',
        setSelectedQuantity: noop,
        selectedDescription: '',
        setSelectedDescription: noop,
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
    tableClassName = '',
    activityColumnLabel,
    editOnlyActivityColumn = false,
}) {
    const { expandedCells, toggleExpandedCell } = useEdbcExpandedCells();
    const dstCol1Label = 'Timestamp';
    const dstCol2Label = 'Date';
    const dstCol3Label = 'Project Name';
    const dstCol4Label = 'Vendor Name';
    const dstCol5Label = 'Contractor Name';
    const dstCol6Label = 'Staff Name';
    const dstCol7Label = 'Quantity';
    const dstCol8Label = 'Amount';
    const dstCol9Label = 'Description';
    const dstCol10Label = 'Category';
    const dstCol11Label = 'Machine Tools';
    const dstCol12Label = 'A/C Type';
    const dstCol13Label = 'Mode';
    const dstCol14Label = 'Source From';
    const dstCol15Label = 'Branch';
    const dstCol16Label = 'Entered By';
    const dstCol17Label = 'Entry No';
    const dstCol18Label = 'Bill Arrival';
    const dstCol19Label = 'Activity';
    const dstCol20Label = 'File';

    const {
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
        selectedDescription,
        setSelectedDescription,
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

    const activityLabel = activityColumnLabel || dstCol19Label;
    const activityTdClass = getEdbcColumnConfig(EDBC_IDS.EDBC19)?.tdClass || '';
    const edbc2ColumnWidthClass = showTimestampColumn ? '' : EDBC2_FIRST_COLUMN_WIDTH_CLASS;

    return (
        <table className={`table-fixed w-full border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} ${tableClassName || 'min-w-[1920px]'}`.trim()}>
            <thead className="sticky top-0 z-10 bg-white ">
                <EdbcTableHeaderRow>
                    {showTimestampColumn && (
                        <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC1}
                            label={dstCol1Label}
                            sortField={sortField}
                            sortDirection={sortDirection}
                            onSort={handleSort}
                        />
                    )}
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC2}
                        label={dstCol2Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        columnWidthClass={edbc2ColumnWidthClass}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC3}
                        label={dstCol3Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC4}
                        label={dstCol4Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC5}
                        label={dstCol5Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC6}
                        label={dstCol6Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC7}
                        label={dstCol7Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC8}
                        label={dstCol8Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC9}
                        label={dstCol9Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC10}
                        label={dstCol10Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC11}
                        label={dstCol11Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC12}
                        label={dstCol12Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC13}
                        label={dstCol13Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC14}
                        label={dstCol14Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC15}
                        label={dstCol15Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC16}
                        label={dstCol16Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC17}
                        label={dstCol17Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                    <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC18}
                        label={dstCol18Label}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
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
                            <EdbcDateFilter
                                placeholder={dstCol2Label}
                                value={selectedDate}
                                onChange={setSelectedDate}
                            />
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
                        <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={totalAmount} />
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
                        {setSelectedPaymentMode !== noop ? (
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
                                    <button
                                        onClick={() => handleEditClick(expense)}
                                        className="rounded-full transition duration-200"
                                    >
                                        <img
                                            src={edit}
                                            alt="Edit"
                                            className=" w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                                        />
                                    </button>
                                </td>
                            ) : (
                                <EdbcActivityBodyCell
                                    columnId={EDBC_IDS.EDBC19}
                                    expense={expense}
                                    onEdit={handleEditClick}
                                    onDelete={handleDelete}
                                    onHistory={fetchAuditDetails}
                                    username={username}
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
