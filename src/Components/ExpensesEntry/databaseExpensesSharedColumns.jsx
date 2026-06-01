import React, { useState, useCallback } from 'react';
import Select from 'react-select';
import DateRangePicker from './DateRangePicker';
import CustomDateField from './CustomDateField';
import CalendarIcon from '../Images/Calendoricon.png';
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';

/** Shared column IDs — layout/styles live here; heading text is set per page via `label` on DstColumnHeader. */
export const EDBC_IDS = {
    EDBC1: 'EDBC-1',
    EDBC2: 'EDBC-2',
    EDBC3: 'EDBC-3',
    EDBC4: 'EDBC-4',
    EDBC5: 'EDBC-5',
    EDBC6: 'EDBC-6',
    EDBC7: 'EDBC-7',
    EDBC8: 'EDBC-8',
    EDBC9: 'EDBC-9',
    EDBC10: 'EDBC-10',
    EDBC11: 'EDBC-11',
    EDBC12: 'EDBC-12',
    EDBC13: 'EDBC-13',
    EDBC14: 'EDBC-14',
    EDBC15: 'EDBC-15',
    EDBC16: 'EDBC-16',
    EDBC17: 'EDBC-17',
    EDBC18: 'EDBC-18',
    EDBC19: 'EDBC-19',
    EDBC20: 'EDBC-20',
    EDBC21: 'EDBC-21',
};

const EDBC1_COLUMN_W = 'w-[168px]';
const EDBC1_FILTER_W = 'w-[158px]';
const EDBC2_COLUMN_W = 'w-[120px]';
const EDBC2_FILTER_W = 'w-[120px]';
const EDBC2_FIRST_COLUMN_W = 'w-[130px]';

export const EDBC2_FIRST_COLUMN_WIDTH_CLASS = EDBC2_FIRST_COLUMN_W;
const EDBC3_COLUMN_W = 'w-[298px]';
const EDBC3_FILTER_W = 'w-[298px]';
const EDBC4_COLUMN_W = 'w-[218px]';
const EDBC5_COLUMN_W = 'w-[218px]';
const EDBC6_COLUMN_W = 'w-[218px]';
const EDBC7_COLUMN_W = 'w-[78px]';
const EDBC8_HEADER_W = 'w-[120px]';
const EDBC8_BODY_W = 'w-[98px]';
const EDBC9_COLUMN_W = 'w-[198px]';
const EDBC9_FILTER_W = 'w-[198px]';
const EDBC10_COLUMN_W = 'w-[158px]';
const EDBC11_COLUMN_W = 'w-[158px]';
const EDBC12_COLUMN_W = 'w-[158px]';
const EDBC13_COLUMN_W = 'w-[120px]';
const EDBC14_COLUMN_W = 'w-[158px]';
const EDBC15_COLUMN_W = 'w-[158px]';
const EDBC16_COLUMN_W = 'w-[158px]';
const EDBC17_COLUMN_W = 'w-[120px]';
const EDBC18_COLUMN_W = 'w-[120px]';
const EDBC19_COLUMN_W = 'w-[70px]';
const EDBC20_COLUMN_W = 'w-[70px]';
const EDBC21_COLUMN_W = 'w-[70px]';

const EDBC_TEXT_INPUT_CLASS =
    'box-border rounded-lg border-2 border-[rgba(191,152,83,0.2)] bg-white text-[14px] font-normal text-black placeholder:text-[#A6A5A6] outline-none hover:border-[rgba(191,152,83,0.4)] focus:border-[rgba(191,152,83,0.4)] focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)]';

const EDBC_BILL_ARRIVAL_FILTER_FIELD_CLASS =
    ' [&>div:first-child]:!w-[120px] [&>div:first-child]:!h-[38px] [&>div.absolute]:!hidden [&>button]:!border-2 [&>button]:!border-[rgba(191,152,83,0.2)] [&>button]:!rounded-lg [&>button]:!shadow-none [&>button]:!text-[14px] [&>button:hover]:!border-[rgba(191,152,83,0.4)] [&>button:focus]:!outline-none [&>button:focus]:!ring-0 [&>button:focus]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)] [&>button:focus-visible]:!outline-none [&>button:focus-visible]:!ring-0 [&>button:focus-visible]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)]';

/**
 * Filter control height (DST-1 timestamp button, DST-2 date field, DST-3 dropdown).
 * Change only DST_FILTER_CONTROL_HEIGHT_PX — all DST filter inputs/dropdowns follow.
 */
export const EDBC_FILTER_CONTROL_HEIGHT_PX = 38;

/** Table filter dropdown: 8 fully visible options (36px each). */
export const TABLE_FILTER_OPTION_HEIGHT_PX = 36;
export const TABLE_FILTER_MAX_VISIBLE_OPTIONS = 8;
export const TABLE_FILTER_MENU_MAX_HEIGHT_PX =
    TABLE_FILTER_OPTION_HEIGHT_PX * TABLE_FILTER_MAX_VISIBLE_OPTIONS;

/** Inline height for DST filter inputs/dropdowns (always follows DST_FILTER_CONTROL_HEIGHT_PX). */
export const EDBC_FILTER_CONTROL_BOX_STYLE = {
    height: EDBC_FILTER_CONTROL_HEIGHT_PX,
    minHeight: EDBC_FILTER_CONTROL_HEIGHT_PX,
    boxSizing: 'border-box',
};

/** Table row heights where DST columns are used — change here for all pages. */
export const EDBC_HEADER_ROW_HEIGHT = 'h-[40px]';
export const EDBC_FILTER_ROW_HEIGHT = 'h-[40px]';
export const EDBC_BODY_ROW_HEIGHT = 'h-[40px]';

export const EDBC_TABLE_HEADER_ROW_CLASS = `bg-[#FAF6ED] ${EDBC_HEADER_ROW_HEIGHT} text-[16px] font-bold text-center`;
export const EDBC_TABLE_FILTER_ROW_CLASS = `bg-[#eeeeee] ${EDBC_FILTER_ROW_HEIGHT}`;
export const EDBC_TABLE_BODY_ROW_CLASS = `odd:bg-white even:bg-[#FAF6ED] text-[14px] font-semibold ${EDBC_BODY_ROW_HEIGHT}`;

/** First/last visible column edge padding — apply on the shared table element in Table.js. */
export const EDBC_TABLE_EDGE_TABLE_CLASS =
    '[&_thead_tr>th:first-child]:!pl-[12px] [&_tbody_tr>td:first-child]:!pl-[12px] [&_thead_tr>th:last-child]:!pr-[12px] [&_tbody_tr>td:last-child]:!pr-[12px] [&_thead_tr>th:first-child>div]:!pl-0 [&_thead_tr>th#EDBC-2:first-child]:!w-[130px] [&_tbody_tr>td#EDBC-2:first-child]:!w-[130px]';

/**
 * Column layout per DST id.
 * - Change DST1_FILTER_W (etc.) to resize filter inputs on all pages using that DST filter.
 * - Change DST1_COLUMN_W to resize header + body column width for that DST id.
 * - Filter/row heights: DST_FILTER_CONTROL_HEIGHT_*, DST_*_ROW_HEIGHT above.
 */
const EDBC_CONFIG = {
    [EDBC_IDS.EDBC1]: {
        sortField: 'timestamp',
        columnWidthClass: EDBC1_COLUMN_W,
        filterWidthClass: EDBC1_FILTER_W,
        headerClass: `pl-[12px] ${EDBC1_COLUMN_W} font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: '',
        tdClass: `pl-[12px] ${EDBC1_COLUMN_W} text-left`,
        bodyCellKey: 'timestamp',
    },
    [EDBC_IDS.EDBC2]: {
        sortField: 'date',
        columnWidthClass: EDBC2_COLUMN_W,
        filterWidthClass:EDBC2_FILTER_W,
        headerClass: `${EDBC2_COLUMN_W} pr-[1px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pr-[1px]',
        tdClass: `${EDBC2_COLUMN_W} pr-[1px] text-left`,
        bodyCellKey: 'date',
    },
    [EDBC_IDS.EDBC3]: {
        sortField: 'siteName',
        columnWidthClass: EDBC3_COLUMN_W,
        filterWidthClass: EDBC3_FILTER_W,
        headerClass: `pl-[1px] pr-[1px] ${EDBC3_COLUMN_W} font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px]',
        tdClass: `pl-[1px] pr-[1px] ${EDBC3_COLUMN_W} text-left`,
        bodyCellKey: 'site',
    },
    [EDBC_IDS.EDBC4]: {
        sortField: 'vendor',
        columnWidthClass: EDBC4_COLUMN_W,
        filterWidthClass: EDBC4_COLUMN_W,
        headerClass: `pl-[1px] pr-[1px] ${EDBC4_COLUMN_W} font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px]',
        tdClass: `pl-[1px] pr-[1px] ${EDBC4_COLUMN_W} text-left`,
        bodyCellKey: 'vendor',
    },
    [EDBC_IDS.EDBC5]: {
        sortField: 'contractor',
        columnWidthClass: EDBC5_COLUMN_W,
        filterWidthClass: EDBC5_COLUMN_W,
        headerClass: `pl-[1px] pr-[1px] ${EDBC5_COLUMN_W} font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px]',
        tdClass: `pl-[1px] pr-[1px] ${EDBC5_COLUMN_W} text-left`,
        bodyCellKey: 'contractor',
    },
    [EDBC_IDS.EDBC6]: {
        sortField: 'staff',
        columnWidthClass: EDBC6_COLUMN_W,
        filterWidthClass: EDBC6_COLUMN_W,
        headerClass: `pl-[1px] pr-[1px] ${EDBC6_COLUMN_W} font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px]',
        tdClass: `pl-[1px] pr-[1px] ${EDBC6_COLUMN_W} text-left`,
        bodyCellKey: 'staff',
    },
    [EDBC_IDS.EDBC7]: {
        sortField: 'quantity',
        columnWidthClass: EDBC7_COLUMN_W,
        filterWidthClass: EDBC7_COLUMN_W,
        headerClass: `pl-[1px] pr-[1px] ${EDBC7_COLUMN_W} font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px]',
        tdClass: `pl-[1px] pr-[1px] ${EDBC7_COLUMN_W} text-left`,
        bodyCellKey: 'quantity',
        inputClassName: `${EDBC7_COLUMN_W} h-[36px] ${EDBC_TEXT_INPUT_CLASS} px-2`,
    },
    [EDBC_IDS.EDBC8]: {
        sortField: 'amount',
        columnWidthClass: EDBC8_HEADER_W,
        filterWidthClass: EDBC8_HEADER_W,
        headerClass: `pl-[1px] pr-[9px] ${EDBC8_HEADER_W} font-bold text-right cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pr-[9px]',
        tdClass: `pl-[1px] pr-[9px] ${EDBC8_BODY_W} text-right`,
        bodyCellKey: 'amount',
    },
    [EDBC_IDS.EDBC9]: {
        sortField: 'comments',
        columnWidthClass: EDBC9_COLUMN_W,
        filterWidthClass: EDBC9_FILTER_W,
        headerClass: `pl-[1px] pr-[1px] ${EDBC9_COLUMN_W} font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px]',
        tdClass: `text-left pl-[1px] pr-[1px] ${EDBC9_COLUMN_W} px-1`,
        bodyCellKey: 'comments',
        inputClassName: `${EDBC9_FILTER_W} ${EDBC_TEXT_INPUT_CLASS} px-3`,
    },
    [EDBC_IDS.EDBC10]: {
        sortField: 'category',
        columnWidthClass: EDBC10_COLUMN_W,
        filterWidthClass: EDBC10_COLUMN_W,
        headerClass: `pl-[1px] pr-[1px] ${EDBC10_COLUMN_W} font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px]',
        tdClass: `pl-[1px] pr-[1px] ${EDBC10_COLUMN_W} text-left`,
        bodyCellKey: 'category',
    },
    [EDBC_IDS.EDBC11]: {
        sortField: 'machineTools',
        columnWidthClass: EDBC11_COLUMN_W,
        filterWidthClass: EDBC11_COLUMN_W,
        headerClass: `pl-[1px] pr-[1px] ${EDBC11_COLUMN_W} font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px]',
        tdClass: `pl-[1px] pr-[1px] ${EDBC11_COLUMN_W} text-left`,
        bodyCellKey: 'machineTools',
    },
    [EDBC_IDS.EDBC12]: {
        sortField: 'accountType',
        columnWidthClass: EDBC12_COLUMN_W,
        filterWidthClass: EDBC12_COLUMN_W,
        headerClass: `pl-[1px] pr-[1px] ${EDBC12_COLUMN_W} font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px]',
        tdClass: `pl-[1px] pr-[1px] ${EDBC12_COLUMN_W} text-left`,
        bodyCellKey: 'accountType',
    },
    [EDBC_IDS.EDBC13]: {
        sortField: 'paymentMode',
        columnWidthClass: EDBC13_COLUMN_W,
        filterWidthClass: EDBC13_COLUMN_W,
        headerClass: `pl-[1px] pr-[1px] ${EDBC13_COLUMN_W} font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px]',
        tdClass: `pl-[1px] pr-[1px] ${EDBC13_COLUMN_W} text-left`,
        bodyCellKey: 'paymentMode',
    },
    [EDBC_IDS.EDBC14]: {
        sortField: 'source',
        columnWidthClass: EDBC14_COLUMN_W,
        filterWidthClass: EDBC14_COLUMN_W,
        headerClass: `pl-[1px] pr-[1px] ${EDBC14_COLUMN_W} font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px]',
        tdClass: `pl-[1px] pr-[1px] ${EDBC14_COLUMN_W} text-left`,
        bodyCellKey: 'source',
    },
    [EDBC_IDS.EDBC15]: {
        sortField: 'branch',
        columnWidthClass: EDBC15_COLUMN_W,
        filterWidthClass: EDBC15_COLUMN_W,
        headerClass: `pl-[1px] pr-[1px] ${EDBC15_COLUMN_W} font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px]',
        tdClass: `pl-[1px] pr-[1px] ${EDBC15_COLUMN_W} text-left`,
        bodyCellKey: 'branch',
    },
    [EDBC_IDS.EDBC16]: {
        sortField: 'enteredBy',
        columnWidthClass: EDBC16_COLUMN_W,
        filterWidthClass: EDBC16_COLUMN_W,
        headerClass: `pl-[1px] pr-[1px] ${EDBC16_COLUMN_W} font-bold text-left cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px]',
        tdClass: `pl-[1px] pr-[1px] ${EDBC16_COLUMN_W} text-left`,
        bodyCellKey: 'enteredBy',
    },
    [EDBC_IDS.EDBC17]: {
        sortField: 'eno',
        columnWidthClass: EDBC17_COLUMN_W,
        filterWidthClass: EDBC17_COLUMN_W,
        headerClass: `pl-[1px] pr-[1px] ${EDBC17_COLUMN_W} font-bold text-right cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px] text-right',
        tdClass: `pl-[1px] pr-[1px] ${EDBC17_COLUMN_W} text-right`,
        bodyCellKey: 'eno',
    },
    [EDBC_IDS.EDBC18]: {
        sortField: 'billArrivalDate',
        columnWidthClass: EDBC18_COLUMN_W,
        filterWidthClass: 'w-[98px]',
        headerClass: `pl-[1px] pr-[1px] ${EDBC18_COLUMN_W} font-bold text-right cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px] text-right',
        tdClass: `pl-[1px] pr-[1px] ${EDBC18_COLUMN_W} text-right whitespace-nowrap`,
        bodyCellKey: 'billArrival',
    },
    [EDBC_IDS.EDBC19]: {
        sortField: null,
        columnWidthClass: EDBC19_COLUMN_W,
        filterWidthClass: EDBC19_COLUMN_W,
        headerClass: `pl-[9px] pr-[1px] ${EDBC19_COLUMN_W} font-bold text-center`,
        filterThClass: '',
        tdClass: `flex pl-[9px] pr-[1px] ${EDBC19_COLUMN_W} justify-between py-2 gap-[8px]`,
        bodyCellKey: 'activity',
    },
    [EDBC_IDS.EDBC20]: {
        sortField: null,
        columnWidthClass: EDBC20_COLUMN_W,
        filterWidthClass: EDBC20_COLUMN_W,
        headerClass: `pl-[6px] pr-[12px] ${EDBC20_COLUMN_W} font-bold text-center`,
        filterThClass: '',
        tdClass: `pl-[6px] pr-[12px] ${EDBC20_COLUMN_W} text-center`,
        bodyCellKey: 'file',
    },
    [EDBC_IDS.EDBC21]: {
        sortField: null,
        columnWidthClass: EDBC21_COLUMN_W,
        filterWidthClass: EDBC21_COLUMN_W,
        headerClass: `pl-[12px] pr-[1px] ${EDBC21_COLUMN_W} font-bold text-left`,
        filterThClass: '',
        tdClass: `pl-[12px] pr-[1px] ${EDBC21_COLUMN_W} text-left`,
        bodyCellKey: 'S.No',
    },
};

/** Lookup layout for a EDBC column id (e.g. EDBC_IDS.EDBC1 → 'EDBC-1'). */
export const getEdbcColumnConfig = (columnId) => EDBC_CONFIG[columnId] ?? null;

const applyEdbc2WidthClass = (className, columnWidthClass) => {
    if (!columnWidthClass || columnWidthClass === EDBC2_COLUMN_W) return className;
    return className
        .replace(EDBC2_COLUMN_W, columnWidthClass)
        .replace(EDBC2_FILTER_W, columnWidthClass);
};

/** Table filter Select styles used by DST-1/2/3 filter row (Database Expenses table). */
export const DATABASE_TABLE_FILTER_SELECT_STYLES = {
    control: (provided, state) => ({
        ...provided,
        borderWidth: '2px',
        lineHeight: '20px',
        fontSize: '14px',
        fontWeight: 'normal',
        height: `${EDBC_FILTER_CONTROL_HEIGHT_PX}px`,
        minHeight: `${EDBC_FILTER_CONTROL_HEIGHT_PX}px`,
        borderRadius: '8px',
        textAlign: 'left',
        borderColor: 'rgba(191, 152, 83, 0.2)',
        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
        '&:hover': { borderColor: 'rgba(191, 152, 83, 0.4)' },
    }),
    clearIndicator: (provided) => ({ ...provided, cursor: 'pointer' }),
    menu: (provided) => ({
        ...provided,
        zIndex: 999,
        maxHeight: `${TABLE_FILTER_MENU_MAX_HEIGHT_PX}px`,
    }),
    menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
    menuList: (provided) => ({
        ...provided,
        maxHeight: `${TABLE_FILTER_MENU_MAX_HEIGHT_PX}px`,
        paddingTop: 0,
        paddingBottom: 0,
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#111827',
        fontWeight: 'normal',
        marginRight: 0,
    }),
    valueContainer: (provided) => ({
        ...provided,
        paddingLeft: '12px',
        paddingRight: '2px',
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        paddingLeft: '0px',
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        paddingTop: '0px',
        paddingBottom: '0px',
        paddingRight: '6px',
        paddingLeft: '3px',
    }),
    option: (provided, state) => ({
        ...provided,
        minHeight: TABLE_FILTER_OPTION_HEIGHT_PX,
        height: TABLE_FILTER_OPTION_HEIGHT_PX,
        paddingTop: 0,
        paddingBottom: 0,
        display: 'flex',
        alignItems: 'center',
        textAlign: 'left',
        fontWeight: 'normal',
        fontSize: '15px',
        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
        color: 'black',
    }),
    input: (provided) => ({
        ...provided,
        fontWeight: 'normal',
        color: 'black',
        textAlign: 'left',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#A6A5A6',
        textAlign: 'left',
        fontWeight: 'normal',
        paddingLeft: '0px',
        paddingTop: '0px',
        paddingBottom: '0px',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
};

const TIMESTAMP_FILTER_BUTTON_STYLES =
    '[&>button]:!border-2 [&>button]:!border-[rgba(191,152,83,0.2)] [&>button]:!rounded-lg [&>button]:!shadow-none [&>button:hover]:!border-[rgba(191,152,83,0.4)] [&>button:focus]:!outline-none [&>button:focus]:!ring-0 [&>button:focus]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)] [&>button:focus-visible]:!outline-none [&>button:focus-visible]:!ring-0 [&>button:focus-visible]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)]';

const TIMESTAMP_FILTER_WRAPPER_CLASS =
    `relative pl-[10px] ${TIMESTAMP_FILTER_BUTTON_STYLES}`;

const DATE_FILTER_FIELD_CLASS =
    ' [&>div]:!w-full [&>div]:!border-2 [&>div]:!border-[rgba(191,152,83,0.2)] [&>div]:!rounded-lg [&>div]:!shadow-none [&>div]:!text-[14px] [&>div:hover]:!border-[rgba(191,152,83,0.4)]';

export const formatExpenseTimestamp = (dateString) => {
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

export const formatExpenseDateOnly = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export const useEdbcExpandedCells = () => {
    const [expandedCells, setExpandedCells] = useState({});
    const toggleExpandedCell = useCallback((cellKey) => {
        setExpandedCells((prev) => ({ ...prev, [cellKey]: !prev[cellKey] }));
    }, []);
    return { expandedCells, toggleExpandedCell };
};

const sortIndicator = (sortField, sortDirection, columnSortField) => {
    if (sortField !== columnSortField) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
};

/** Header row for tables using EDBC columns (shared height). */
export const EdbcTableHeaderRow = ({ children, className = '' }) => (
    <tr className={[EDBC_TABLE_HEADER_ROW_CLASS, className].filter(Boolean).join(' ')}>{children}</tr>
);

/** Filter row for tables using EDBC columns (shared height). */
export const EdbcTableFilterRow = React.forwardRef(({ children, className = '' }, ref) => (
    <tr ref={ref} className={[EDBC_TABLE_FILTER_ROW_CLASS, className].filter(Boolean).join(' ')}>{children}</tr>
));
EdbcTableFilterRow.displayName = 'EdbcTableFilterRow';

/** Body row for tables using EDBC columns (shared height). */
export const EdbcTableBodyRow = ({ children, className = '', ...rest }) => (
    <tr className={[EDBC_TABLE_BODY_ROW_CLASS, className].filter(Boolean).join(' ')} {...rest}>{children}</tr>
);

/** EDBC-1 / EDBC-2 / EDBC-3 header cell — pass `label` from each page for the visible heading name. */
export const EdbcColumnHeader = ({
    columnId,
    label,
    sortField,
    sortDirection,
    onSort,
    headerClassName = '',
    columnWidthClass = '',
}) => {
    const config = EDBC_CONFIG[columnId];
    if (!config || !label) return null;
    const sortable = typeof onSort === 'function' && config.sortField;
    let baseHeaderClass = sortable
        ? config.headerClass
        : config.headerClass.replace(/\bcursor-pointer\b/g, '').replace(/\bhover:bg-gray-200\b/g, '').replace(/\bselect-none\b/g, '').replace(/\s+/g, ' ').trim();
    if (columnId === EDBC_IDS.EDBC2 && columnWidthClass) {
        baseHeaderClass = applyEdbc2WidthClass(baseHeaderClass, columnWidthClass);
    }
    const className = [
        baseHeaderClass,
        headerClassName,
    ]
        .filter(Boolean)
        .join(' ');
    return (
        <th
            id={columnId}
            className={className}
            onClick={sortable ? () => onSort(config.sortField) : undefined}
        >
            {label}
            {sortable ? sortIndicator(sortField, sortDirection, config.sortField) : null}
        </th>
    );
};

/** EDBC-1 timestamp range filter — `placeholder` should match the column heading on that page. */
export const EdbcTimestampFilter = ({
    columnId = EDBC_IDS.EDBC1,
    placeholder,
    timestampStartDate,
    timestampEndDate,
    isOpen,
    onOpen,
    onClose,
    onApply,
    columnWidthClass = '',
}) => {
    const config = EDBC_CONFIG[columnId];
    if (!config) return null;
    let { filterWidthClass, filterThClass } = config;
    if (columnId === EDBC_IDS.EDBC2 && columnWidthClass) {
        filterWidthClass = columnWidthClass;
    }
    const wrapperClass = columnId === EDBC_IDS.EDBC1
        ? TIMESTAMP_FILTER_WRAPPER_CLASS
        : `relative ${filterWidthClass} ${TIMESTAMP_FILTER_BUTTON_STYLES}`;
    return (
    <th id={columnId} className={filterThClass}>
        <div className={wrapperClass}>
            <button
                type="button"
                onClick={onOpen}
                style={EDBC_FILTER_CONTROL_BOX_STYLE}
                className={`${filterWidthClass} box-border pl-[12px] pr-[3px] py-0 text-sm font-normal bg-white text-left flex items-center justify-between`}
            >
                <span
                    className={`text-[14px] font-medium truncate flex-1 text-left ${timestampStartDate && timestampEndDate ? 'text-black font-normal' : 'text-[#A6A5A6] font-normal'}`}
                >
                    {timestampStartDate
                        ? timestampEndDate
                            ? `${timestampStartDate} – ${timestampEndDate}`
                            : `From ${timestampStartDate}`
                        : placeholder}
                </span>
                <img
                    src={CalendarIcon}
                    alt="Calendar"
                    className="w-[16px] h-[16px] text-gray-400 flex-shrink-0 mr-[6px] ml-[3px]"
                />
            </button>
            <DateRangePicker
                isOpen={isOpen}
                onClose={onClose}
                startDate={timestampStartDate}
                endDate={timestampEndDate}
                variant="dropdown"
                controlHeightPx={EDBC_FILTER_CONTROL_HEIGHT_PX}
                onApply={onApply}
            />
        </div>
    </th>
    );
};

/** EDBC-2 date filter — `placeholder` should match the column heading on that page. */
export const EdbcDateFilter = ({ placeholder, value, onChange, columnWidthClass = '' }) => {
    const filterWidthClass = columnWidthClass || EDBC_CONFIG[EDBC_IDS.EDBC2].filterWidthClass;
    return (
    <th className={EDBC_CONFIG[EDBC_IDS.EDBC2].filterThClass}>
        <div className={filterWidthClass}>
            <CustomDateField
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                alwaysOpenBelow
                controlHeightPx={EDBC_FILTER_CONTROL_HEIGHT_PX}
                className={`${DATE_FILTER_FIELD_CLASS} ${value ? '[&>div]:!text-black [&>div]:!font-normal' : '[&>div]:!text-[#d3d5db] [&>div]:!font-normal'}`}
            />
        </div>
    </th>
    );
};

/** EDBC-3 project name filter — `placeholder` should match the column heading on that page. */
export const EdbcProjectNameFilter = ({
    placeholder,
    options,
    value,
    onChange,
    blankOption = null,
    blankValue = null,
    isClearable = false,
    selectStyles = DATABASE_TABLE_FILTER_SELECT_STYLES,
}) => {
    const resolvedValue = value
        ? blankValue && value === blankValue
            ? blankOption
            : { value, label: value }
        : null;
    return (
        <th className={EDBC_CONFIG[EDBC_IDS.EDBC3].filterThClass}>
            <Select
                className={EDBC_CONFIG[EDBC_IDS.EDBC3].filterWidthClass}
                options={options}
                value={resolvedValue}
                onChange={(selectedOption) => onChange(selectedOption ? selectedOption.value : '')}
                placeholder={placeholder}
                menuPlacement="bottom"
                noOptionsMessage={() => null}
                isClearable={isClearable}
                styles={selectStyles}
            />
        </th>
    );
};

const expandableSpan = (cellKey, expanded, onToggle, title, children, extraClassName = '') => (
    <span
        onClick={() => onToggle(cellKey)}
        className={`block w-full cursor-pointer ${extraClassName} ${expanded ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`.trim()}
        title={title}
    >
        {children}
    </span>
);

/** EDBC-1 body cell */
export const EdbcTimestampBodyCell = ({
    expense,
    rowIndex,
    expandedCells,
    onToggleExpanded,
    formatValue = formatExpenseTimestamp,
}) => {
    const cellKey = `${expense.id ?? rowIndex}-timestamp`;
    const display = formatValue(expense.timestamp);
    return (
        <td className={EDBC_CONFIG[EDBC_IDS.EDBC1].tdClass}>
            {expandableSpan(cellKey, expandedCells[cellKey], onToggleExpanded, display, display)}
        </td>
    );
};

/** EDBC-2 body cell */
export const EdbcDateBodyCell = ({
    expense,
    rowIndex,
    expandedCells,
    onToggleExpanded,
    formatValue = formatExpenseDateOnly,
    columnWidthClass = '',
}) => {
    const cellKey = `${expense.id ?? rowIndex}-date`;
    const display = formatValue(expense.date);
    const tdClass = columnWidthClass
        ? applyEdbc2WidthClass(EDBC_CONFIG[EDBC_IDS.EDBC2].tdClass, columnWidthClass)
        : EDBC_CONFIG[EDBC_IDS.EDBC2].tdClass;
    return (
        <td id={EDBC_IDS.EDBC2} className={tdClass}>
            {expandableSpan(cellKey, expandedCells[cellKey], onToggleExpanded, display, display)}
        </td>
    );
};

 /** EDBC-3 body cell */
export const EdbcProjectNameBodyCell = ({
    expense,
    rowIndex,
    expandedCells,
    onToggleExpanded,
    getDisplayValue,
}) => {
    const cellKey = `${expense.id ?? rowIndex}-site`;
    const display = getDisplayValue ? getDisplayValue(expense) : expense.siteName || '';
    return (
        <td className={EDBC_CONFIG[EDBC_IDS.EDBC3].tdClass}>
            {expandableSpan(cellKey, expandedCells[cellKey], onToggleExpanded, display, display)}
        </td>
    );
};

const resolveSelectFilterValue = (value, blankOption, blankValue) => {
    if (!value) return null;
    if (blankValue && value === blankValue) return blankOption;
    if (typeof value === 'object') return value;
    return { value, label: value };
};

const buildRightAlignedSelectStyles = (selectStyles) => ({
    ...selectStyles,
    control: (provided, state) => ({
        ...(typeof selectStyles.control === 'function' ? selectStyles.control(provided, state) : provided),
        textAlign: 'right',
    }),
    valueContainer: (provided, state) => ({
        ...(typeof selectStyles.valueContainer === 'function' ? selectStyles.valueContainer(provided, state) : provided),
        justifyContent: state.hasValue ? 'flex-end' : 'flex-start',
        paddingLeft: state.hasValue ? '2px' : '12px',
        paddingRight: '0px',
    }),
    singleValue: (provided) => ({
        ...(typeof selectStyles.singleValue === 'function' ? selectStyles.singleValue(provided) : provided),
        textAlign: 'right',
    }),
    input: (provided) => ({
        ...(typeof selectStyles.input === 'function' ? selectStyles.input(provided) : provided),
        textAlign: 'right',
    }),
    placeholder: (provided) => ({
        ...(typeof selectStyles.placeholder === 'function' ? selectStyles.placeholder(provided) : provided),
        textAlign: 'left',
        paddingRight: '0px',
        marginRight: 0,
    }),
    option: (provided, state) => ({
        ...(typeof selectStyles.option === 'function' ? selectStyles.option(provided, state) : provided),
        textAlign: 'right',
        justifyContent: 'flex-end',
        paddingRight: '12px',
    }),
});

/** Generic EDBC select filter (EDBC-4+). */
export const EdbcSelectFilter = ({
    columnId,
    placeholder,
    options,
    value,
    onChange,
    blankOption = null,
    blankValue = null,
    selectStyles = DATABASE_TABLE_FILTER_SELECT_STYLES,
    selectValue = undefined,
    textAlign = 'left',
}) => {
    const config = EDBC_CONFIG[columnId];
    if (!config) return null;
    const resolvedValue = selectValue !== undefined
        ? selectValue
        : resolveSelectFilterValue(value, blankOption, blankValue);
    const styles = textAlign === 'right' ? buildRightAlignedSelectStyles(selectStyles) : selectStyles;
    return (
        <th id={columnId} className={config.filterThClass}>
            <Select
                className={config.filterWidthClass}
                options={options}
                value={resolvedValue}
                onChange={(selectedOption) => onChange(selectedOption ? selectedOption.value : '')}
                placeholder={placeholder}
                menuPlacement="bottom"
                noOptionsMessage={() => null}
                styles={styles}
            />
        </th>
    );
};

/** Generic EDBC text input filter (EDBC-7, EDBC-9). */
export const EdbcTextInputFilter = ({
    columnId,
    placeholder,
    value,
    onChange,
    inputClassName = '',
}) => {
    const config = EDBC_CONFIG[columnId];
    if (!config) return null;
    return (
        <th id={columnId} className={config.filterThClass}>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={EDBC_FILTER_CONTROL_BOX_STYLE}
                className={inputClassName || config.inputClassName}
            />
        </th>
    );
};

/** EDBC-8 amount total filter cell. */
export const EdbcTotalAmountFilter = ({ columnId, totalAmount }) => {
    const config = EDBC_CONFIG[columnId];
    if (!config) return null;
    return (
        <th id={columnId} className={`text-[14px] ${config.filterWidthClass} text-right font-bold ${config.filterThClass}`.trim()}>
            ₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </th>
    );
};

/** EDBC-13 empty filter placeholder. */
export const EdbcEmptyFilterCell = ({ columnId }) => {
    const config = EDBC_CONFIG[columnId];
    if (!config) return null;
    return <th id={columnId} className={config.filterThClass}></th>;
};

/** EDBC-18 bill arrival date filter. */
export const EdbcBillArrivalFilter = ({
    columnId,
    placeholder,
    value,
    onChange,
    filterRef,
    onCalendarMouseDown,
}) => {
    const config = EDBC_CONFIG[columnId];
    if (!config) return null;
    return (
        <th id={columnId} className={config.filterThClass}>
            <div
                className={config.filterWidthClass}
                ref={filterRef}
                onMouseDown={onCalendarMouseDown}
            >
                <CustomDateField
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    alwaysOpenBelow
                    anchor="right"
                    className={`${EDBC_BILL_ARRIVAL_FILTER_FIELD_CLASS} ${value ? '[&>button]:!text-black [&>button]:!font-normal' : '[&>button]:!text-[#d3d5db] [&>button]:!font-normal'}`}
                />
            </div>
        </th>
    );
};

/** Generic EDBC expandable body cell (EDBC-4+). */
export const EdbcExpandableBodyCell = ({
    columnId,
    expense,
    rowIndex,
    expandedCells,
    onToggleExpanded,
    getDisplayValue,
    textAlignClass = '',
}) => {
    const config = EDBC_CONFIG[columnId];
    if (!config) return null;
    const cellKey = `${expense.id ?? rowIndex}-${config.bodyCellKey}`;
    const display = getDisplayValue ? getDisplayValue(expense) : '';
    const title = display == null ? '' : String(display);
    return (
        <td id={columnId} className={`${config.tdClass} ${textAlignClass}`.trim()}>
            {expandableSpan(cellKey, expandedCells[cellKey], onToggleExpanded, title, display, textAlignClass)}
        </td>
    );
};

/** EDBC-19 activity body cell. */
export const EdbcActivityBodyCell = ({
    columnId,
    expense,
    onEdit,
    onDelete,
    onHistory,
    username,
}) => {
    const config = EDBC_CONFIG[columnId];
    if (!config) return null;
    return (
        <td id={columnId} className={config.tdClass}>
            <button onClick={() => onEdit(expense)} className="rounded-full transition duration-200">
                <img
                    src={edit}
                    alt="Edit"
                    className=" w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                />
            </button>
            <button className="">
                <img
                    src={remove}
                    alt="delete"
                    onClick={() => onDelete(expense.id, username)}
                    className=" w-4 h-4 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                />
            </button>
            <button onClick={() => onHistory(expense.id)} className="rounded-full transition duration-200">
                <img
                    src={history}
                    alt="history"
                    className=" w-4 h-5 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                />
            </button>
        </td>
    );
};

/** EDBC-20 file body cell. */
export const EdbcFileBodyCell = ({ columnId, expense }) => {
    const config = EDBC_CONFIG[columnId];
    if (!config) return null;
    return (
        <td id={columnId} className={config.tdClass}>
            {expense.billCopy ? (
                <a
                    href={expense.billCopy}
                    className="text-red-500 underline "
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View
                </a>
            ) : (
                <span></span>
            )}
        </td>
    );
};
