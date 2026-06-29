import React, { useState, useCallback, useMemo, useRef } from 'react';
import Select from 'react-select';
import DateRangePicker from './DateRangePicker';
import CustomDateField from './CustomDateField';
import CalendarIcon from '../Images/Calendoricon.png';
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';
import FilterIcon from '../Images/TableFilter.svg';
import ReloadIcon from '../Images/Clear.svg';
import SearchIcon from '../Images/Searchnew.svg';
import PdfIcon from '../Images/pdf.png';
import XlIcon from '../Images/sheets.png';

/** Expenses created from Advance Portal Bill Settlement — edit in Advance Portal only. */
export const isAdvancePortalSourceExpense = (expense) =>
    String(expense?.source ?? '').trim().toLowerCase() === 'advance portal';

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
    EDBC22: 'EDBC-22',
    EDBC23: 'EDBC-23',
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
const EDBC7_COLUMN_W = 'w-[88px]';
const EDBC8_HEADER_W = 'w-[120px]';
const EDBC8_BODY_W = 'w-[98px]';
const EDBC22_HEADER_W = 'w-[80px]';
const EDBC22_BODY_W = 'w-[80px]';
export const EDBC22_COLUMN_WIDTH_CLASS = EDBC22_HEADER_W;
const EDBC9_COLUMN_W = 'w-[198px]';
const EDBC9_FILTER_W = 'w-[198px]';
const EDBC10_COLUMN_W = 'w-[158px]';
const EDBC11_COLUMN_W = 'w-[158px]';
const EDBC12_COLUMN_W = 'w-[158px]';
const EDBC13_COLUMN_W = 'w-[130px]';
const EDBC14_COLUMN_W = 'w-[158px]';
const EDBC15_COLUMN_W = 'w-[158px]';
const EDBC16_COLUMN_W = 'w-[158px]';
const EDBC17_COLUMN_W = 'w-[120px]';
const EDBC18_COLUMN_W = 'w-[120px]';
const EDBC19_COLUMN_W = 'w-[70px]';
const EDBC20_COLUMN_W = 'w-[70px]';
const EDBC21_COLUMN_W = 'w-[70px]';
const EDBC22_COLUMN_W = 'w-[80px]';
const EDBC23_COLUMN_W = 'w-[158px]';

const EDBC_TEXT_INPUT_CLASS =
    'box-border rounded-lg border-2 border-[rgba(191,152,83,0.2)] bg-white text-[14px] font-normal text-black placeholder:text-[#A6A5A6] outline-none hover:border-[rgba(191,152,83,0.4)] focus:border-[rgba(191,152,83,0.4)] focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)]';

const EDBC_BILL_ARRIVAL_FILTER_FIELD_CLASS =
    ' [&>div:first-child]:!w-[120px] [&>div:first-child]:!h-[38px] [&>div.absolute]:!hidden [&>button]:!border-2 [&>button]:!border-[rgba(191,152,83,0.2)] [&>button]:!rounded-lg [&>button]:!shadow-none [&>button]:!text-[14px] [&>button:hover]:!border-[rgba(191,152,83,0.4)] [&>button:focus]:!outline-none [&>button:focus]:!ring-0 [&>button:focus]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)] [&>button:focus-visible]:!outline-none [&>button:focus-visible]:!ring-0 [&>button:focus-visible]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)]';

/**
 * Filter control height (DST-1 timestamp button, DST-2 date field, DST-3 dropdown).
 * Change only DST_FILTER_CONTROL_HEIGHT_PX — all DST filter inputs/dropdowns follow.
 */
export const EDBC_FILTER_CONTROL_HEIGHT_PX = 38;

/** Table filter dropdown: single-line option min height; long labels wrap up to 2 lines. */
export const TABLE_FILTER_OPTION_HEIGHT_PX = 36;
export const TABLE_FILTER_OPTION_LINE_HEIGHT_PX = 18;
export const TABLE_FILTER_OPTION_MAX_LINES = 2;
export const TABLE_FILTER_OPTION_VERTICAL_PADDING_PX = 12;
export const TABLE_FILTER_OPTION_WRAPPED_MAX_HEIGHT_PX =
    TABLE_FILTER_OPTION_LINE_HEIGHT_PX * TABLE_FILTER_OPTION_MAX_LINES + TABLE_FILTER_OPTION_VERTICAL_PADDING_PX;
export const TABLE_FILTER_MAX_VISIBLE_OPTIONS = 8;
/** Menu scroll cap: 8 rows at single-line option height (wrapped rows may scroll sooner). */
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
    '[&_thead_tr>th:first-child]:!pl-[12px] [&_tbody_tr>td:first-child]:!pl-[12px] [&_thead_tr>th:last-child]:!pr-[12px] [&_tbody_tr>td:last-child]:!pr-[12px] [&_thead_tr>th:first-child>div]:!pl-0 [&_thead_tr>th#EDBC-2:first-child]:!w-[130px] [&_tbody_tr>td#EDBC-2:first-child]:!w-[130px] [&_thead>tr:first-child>th#EDBC-17]:!pr-[9px] [&_tbody_tr>td#EDBC-17]:!pr-[9px] [&_thead_tr:nth-child(2)>th#EDBC-17]:!pr-0 [&_thead_tr:nth-child(2)>th#EDBC-17>div]:!w-[120px] [&_thead_tr:nth-child(2)>th#EDBC-17>div]:!min-w-[120px] [&_thead_tr:nth-child(2)>th#EDBC-17>div]:!max-w-[120px] [&_thead_tr:nth-child(2)>th#EDBC-17>div>div]:!w-[120px] [&_thead_tr:nth-child(2)>th#EDBC-17>div>div]:!min-w-[120px] [&_thead_tr:nth-child(2)>th#EDBC-17>div>div]:!max-w-[120px] [&_thead_tr:nth-child(2)>th#EDBC-17>div>div]:!box-border';

/** Locks EDBC-8 to shared header/body widths on table-fixed cash-register layouts. */
export const EDBC8_COLUMN_LOCK_TABLE_CLASS =
    '[&_thead_tr.bg-\\[\\#eeeeee\\]>th#EDBC-8]:!pr-0 [&_th#EDBC-8]:!w-[120px] [&_td#EDBC-8]:!w-[120px] [&_th#EDBC-8]:!max-w-[120px] [&_td#EDBC-8]:!max-w-[120px] [&_th#EDBC-8]:!overflow-hidden [&_td#EDBC-8]:!overflow-hidden';

/** Narrow spacer between Associate and Project Name (change-type toggle column). */
export const EDBC_CASH_REGISTER_CHANGE_COLUMN_CLASS =
    'edbc-crg-change-col w-[30px] min-w-[30px] max-w-[30px] p-0 overflow-visible';

/** Cash Register daily expenses: extra-field (+) button column. */
export const EDBC_CASH_REGISTER_EXTRA_FIELD_BUTTON_COLUMN_CLASS =
    'edbc-crg-extra-field-btn-col w-[20px] min-w-[20px] max-w-[20px] p-0 overflow-visible';

/** Cash Register daily expenses: description (notes) column. */
export const EDBC_CASH_REGISTER_DESCRIPTION_COLUMN_CLASS =
    'edbc-crg-description-col w-[30px] min-w-[30px] max-w-[30px] px-[6px] overflow-visible';

/** Cash Register daily expenses: extra amount column (between extra button and quantity). */
export const EDBC_CASH_REGISTER_EXTRA_AMOUNT_COLUMN_CLASS =
    'edbc-crg-extra-amount-col pl-[6px] w-[66px] min-w-[66px] max-w-[66px]';

/** Locks cash-register daily expenses column widths on table-fixed layouts. */
export const EDBC_CASH_REGISTER_DAILY_TABLE_LOCK_TABLE_CLASS =
    '[&_th.edbc-crg-change-col]:!w-[30px] [&_th.edbc-crg-change-col]:!min-w-[30px] [&_th.edbc-crg-change-col]:!max-w-[30px] [&_td.edbc-crg-change-col]:!w-[30px] [&_td.edbc-crg-change-col]:!min-w-[30px] [&_td.edbc-crg-change-col]:!max-w-[30px] [&_th.edbc-crg-extra-field-btn-col]:!w-[20px] [&_th.edbc-crg-extra-field-btn-col]:!min-w-[20px] [&_th.edbc-crg-extra-field-btn-col]:!max-w-[20px] [&_td.edbc-crg-extra-field-btn-col]:!w-[20px] [&_td.edbc-crg-extra-field-btn-col]:!min-w-[20px] [&_td.edbc-crg-extra-field-btn-col]:!max-w-[20px] [&_th.edbc-crg-description-col]:!w-[30px] [&_th.edbc-crg-description-col]:!min-w-[30px] [&_th.edbc-crg-description-col]:!max-w-[30px] [&_td.edbc-crg-description-col]:!w-[30px] [&_td.edbc-crg-description-col]:!min-w-[30px] [&_td.edbc-crg-description-col]:!max-w-[30px] [&_th.edbc-crg-extra-amount-col]:!w-[66px] [&_th.edbc-crg-extra-amount-col]:!min-w-[66px] [&_th.edbc-crg-extra-amount-col]:!max-w-[66px] [&_td.edbc-crg-extra-amount-col]:!w-[66px] [&_td.edbc-crg-extra-amount-col]:!min-w-[66px] [&_td.edbc-crg-extra-amount-col]:!max-w-[66px] [&_th#EDBC-21]:!w-[70px] [&_td#EDBC-21]:!w-[70px] [&_th#EDBC-21]:!min-w-[70px] [&_td#EDBC-21]:!min-w-[70px] [&_th#EDBC-21]:!max-w-[70px] [&_td#EDBC-21]:!max-w-[70px] [&_th#EDBC-4]:!w-[218px] [&_td#EDBC-4]:!w-[218px] [&_th#EDBC-4]:!min-w-[218px] [&_td#EDBC-4]:!min-w-[218px] [&_th#EDBC-4]:!max-w-[218px] [&_td#EDBC-4]:!max-w-[218px] [&_th#EDBC-3]:!w-[298px] [&_td#EDBC-3]:!w-[298px] [&_th#EDBC-3]:!min-w-[298px] [&_td#EDBC-3]:!min-w-[298px] [&_th#EDBC-3]:!max-w-[298px] [&_td#EDBC-3]:!max-w-[298px] [&_th#EDBC-12]:!w-[158px] [&_td#EDBC-12]:!w-[158px] [&_th#EDBC-12]:!min-w-[158px] [&_td#EDBC-12]:!min-w-[158px] [&_th#EDBC-12]:!max-w-[158px] [&_td#EDBC-12]:!max-w-[158px] [&_th#EDBC-7]:!w-[88px] [&_td#EDBC-7]:!w-[88px] [&_th#EDBC-7]:!min-w-[88px] [&_td#EDBC-7]:!min-w-[88px] [&_th#EDBC-7]:!max-w-[88px] [&_td#EDBC-7]:!max-w-[88px]';

/** Cash Register refund table: portal badge column (header). */
export const EDBC_CASH_REGISTER_REFUND_PORTAL_HEADER_COLUMN_CLASS =
    'edbc-crg-refund-portal-header-col px-[2px] w-[100px] min-w-[100px] max-w-[100px] overflow-visible';

/** Cash Register refund table: portal badge column (filter row). */
export const EDBC_CASH_REGISTER_REFUND_PORTAL_FILTER_COLUMN_CLASS =
    'edbc-crg-refund-portal-filter-col px-[2px] w-[60px] min-w-[60px] max-w-[60px] overflow-visible';

/** Cash Register refund table: portal badge / change-button column (entry + body). */
export const EDBC_CASH_REGISTER_REFUND_PORTAL_BODY_COLUMN_CLASS =
    'edbc-crg-refund-portal-body-col pl-[6px] w-[100px] min-w-[100px] max-w-[100px] overflow-visible';

/** Locks cash-register daily refund table column widths on table-fixed layouts. */
export const EDBC_CASH_REGISTER_DAILY_REFUND_TABLE_LOCK_TABLE_CLASS =
    '[&_th.edbc-crg-refund-portal-header-col]:!w-[100px] [&_th.edbc-crg-refund-portal-header-col]:!min-w-[100px] [&_th.edbc-crg-refund-portal-header-col]:!max-w-[100px] [&_th.edbc-crg-refund-portal-filter-col]:!w-[60px] [&_th.edbc-crg-refund-portal-filter-col]:!min-w-[60px] [&_th.edbc-crg-refund-portal-filter-col]:!max-w-[60px] [&_td.edbc-crg-refund-portal-body-col]:!w-[100px] [&_td.edbc-crg-refund-portal-body-col]:!min-w-[100px] [&_td.edbc-crg-refund-portal-body-col]:!max-w-[100px] [&_th#EDBC-4]:!w-[218px] [&_td#EDBC-4]:!w-[218px] [&_th#EDBC-4]:!min-w-[218px] [&_td#EDBC-4]:!min-w-[218px] [&_th#EDBC-4]:!max-w-[218px] [&_td#EDBC-4]:!max-w-[218px] [&_th#EDBC-22]:!w-[80px] [&_td#EDBC-22]:!w-[80px] [&_th#EDBC-22]:!min-w-[80px] [&_td#EDBC-22]:!min-w-[80px] [&_th#EDBC-22]:!max-w-[80px] [&_td#EDBC-22]:!max-w-[80px] [&_thead_tr>th:nth-last-child(2)]:!w-[86px] [&_thead_tr>th:nth-last-child(2)]:!min-w-[86px] [&_thead_tr>th:nth-last-child(2)]:!max-w-[86px] [&_tbody_tr>td:nth-last-child(2)]:!w-[86px] [&_tbody_tr>td:nth-last-child(2)]:!min-w-[86px] [&_tbody_tr>td:nth-last-child(2)]:!max-w-[86px] [&_thead_tr>th:nth-last-child(2)]:!overflow-hidden [&_tbody_tr>td:nth-last-child(2)]:!overflow-hidden';

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
        filterThClass: 'pr-[1px]',
        tdClass: `pl-[1px] pr-[9px] ${EDBC8_BODY_W} text-right`,
        bodyCellKey: 'amount',
        inputClassName: `${EDBC8_HEADER_W} ${EDBC_TEXT_INPUT_CLASS} px-2 text-right`,
    },
    [EDBC_IDS.EDBC22]: {
        sortField: 'amount',
        columnWidthClass: EDBC22_HEADER_W,
        filterWidthClass: EDBC22_HEADER_W,
        headerClass: `pl-[1px] pr-[9px] ${EDBC22_HEADER_W} font-bold text-right cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pr-[1px]',
        tdClass: `pl-[1px] pr-[9px] ${EDBC22_BODY_W} text-right`,
        bodyCellKey: 'amount',
        inputClassName: `${EDBC22_HEADER_W} ${EDBC_TEXT_INPUT_CLASS} px-2 text-right`,
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
        headerClass: `pl-[1px] pr-[9px] ${EDBC17_COLUMN_W} font-bold text-right cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-0 text-right',
        tdClass: `pl-[1px] pr-[9px] ${EDBC17_COLUMN_W} text-right`,
        bodyCellKey: 'eno',
    },
    [EDBC_IDS.EDBC18]: {
        sortField: 'billArrivalDate',
        columnWidthClass: EDBC18_COLUMN_W,
        filterWidthClass: 'w-[98px]',
        headerClass: `pl-[1px] pr-[9px] ${EDBC18_COLUMN_W} font-bold text-right cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[1px] text-right',
        tdClass: `pl-[1px] pr-[9px] ${EDBC18_COLUMN_W} text-right whitespace-nowrap`,
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
    [EDBC_IDS.EDBC23]: {
        sortField: 'utilityTypeNumber',
        columnWidthClass: EDBC23_COLUMN_W,
        filterWidthClass: EDBC23_COLUMN_W,
        headerClass: `pl-[1px] pr-[9px] ${EDBC23_COLUMN_W} font-bold text-right cursor-pointer hover:bg-gray-200 select-none`,
        filterThClass: 'pl-[1px] pr-[9px]',
        tdClass: `pl-[1px] pr-[9px] ${EDBC23_COLUMN_W} text-right`,
        bodyCellKey: 'Service Number',
        inputClassName: `${EDBC23_COLUMN_W} ${EDBC_TEXT_INPUT_CLASS} px-2 text-right`,
    },
};

/** Lookup layout for a EDBC column id (e.g. EDBC_IDS.EDBC1 → 'EDBC-1'). */
export const getEdbcColumnConfig = (columnId) => EDBC_CONFIG[columnId] ?? null;

/** Sortable columns from EDBC_CONFIG — same keys EdbcColumnHeader uses on header click. */
export const EDBC_SORT_OPTIONS = Object.values(EDBC_IDS)
    .map((columnId) => {
        const config = EDBC_CONFIG[columnId];
        if (!config?.sortField) return null;
        return { columnId, sortField: config.sortField };
    })
    .filter(Boolean);

/** Spread on EdbcColumnHeader: `{...getEdbcColumnHeaderSortProps(sortField, sortDirection, handleSort)}` */
export function getEdbcColumnHeaderSortProps(sortField, sortDirection, handleSort) {
    if (typeof handleSort !== 'function') return {};
    return { sortField, sortDirection, onSort: handleSort };
}

/** Shared sort state — only toggles fields listed in EDBC_SORT_OPTIONS / EDBC_CONFIG. */
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

/** Sort rows by EDBC sortField — pair with useEdbcTableSort on any page using EdbcColumnHeader. */
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

/** Sort weekly-payment expense rows — pair with useEdbcTableSort / EdbcColumnHeader on Cash Register pages. */
export function sortWeeklyPaymentExpenseRows(rows, sortField, sortDirection, resolvers = {}) {
    if (!sortField || !Array.isArray(rows)) return rows;
    const { getPartyName = () => '', getProjectName = () => '' } = resolvers;
    return [...rows].sort((a, b) => {
        let aValue;
        let bValue;
        switch (sortField) {
            case 'date':
                aValue = new Date(a.date);
                bValue = new Date(b.date);
                break;
            case 'vendor':
                aValue = String(getPartyName(a) ?? '').toLowerCase();
                bValue = String(getPartyName(b) ?? '').toLowerCase();
                break;
            case 'siteName':
                aValue = String(getProjectName(a) ?? '').toLowerCase();
                bValue = String(getProjectName(b) ?? '').toLowerCase();
                break;
            case 'accountType':
                aValue = String(a.type ?? '').toLowerCase();
                bValue = String(b.type ?? '').toLowerCase();
                break;
            case 'amount':
                aValue = Number(a.amount) || 0;
                bValue = Number(b.amount) || 0;
                break;
            default:
                return 0;
        }
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

/** Sort weekly-payment received rows — EDBC-12 uses accountType but rows store `type`. */
export function sortWeeklyPaymentPaymentRows(rows, sortField, sortDirection) {
    if (!sortField || !Array.isArray(rows)) return rows;
    return [...rows].sort((a, b) => {
        let aValue;
        let bValue;
        switch (sortField) {
            case 'date':
                aValue = new Date(a.date);
                bValue = new Date(b.date);
                break;
            case 'accountType':
                aValue = String(a.type ?? '').toLowerCase();
                bValue = String(b.type ?? '').toLowerCase();
                break;
            case 'amount':
                aValue = Number(a.amount) || 0;
                bValue = Number(b.amount) || 0;
                break;
            default:
                return 0;
        }
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

/** Overall search for weekly-payment expense tables (Cash Register pages). */
export function matchesWeeklyPaymentExpenseOverallSearch(entry, query, resolvers = {}) {
    const q = String(query || '').toLowerCase().trim();
    if (!q) return true;
    const {
        formatDateOnly = (value) => String(value ?? ''),
        getPartyName = () => '',
        getProjectName = () => '',
    } = resolvers;
    const searchable = [
        entry?.date ? formatDateOnly(entry.date) : '',
        getPartyName(entry),
        getProjectName(entry),
        entry?.type,
        entry?.amount,
    ]
        .map((value) => String(value ?? '').toLowerCase())
        .join(' ');
    return searchable.includes(q);
}

const applyEdbc2WidthClass = (className, columnWidthClass) => {
    if (!columnWidthClass || columnWidthClass === EDBC2_COLUMN_W) return className;
    return className
        .replace(EDBC2_COLUMN_W, columnWidthClass)
        .replace(EDBC2_FILTER_W, columnWidthClass);
};

const buildTableFilterOptionStyles = (textAlign = 'left') => ({
    minHeight: `${TABLE_FILTER_OPTION_HEIGHT_PX}px`,
    height: 'auto',
    maxHeight: `${TABLE_FILTER_OPTION_WRAPPED_MAX_HEIGHT_PX}px`,
    paddingTop: '6px',
    paddingBottom: '6px',
    paddingLeft: '12px',
    paddingRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: textAlign === 'right' ? 'flex-end' : 'flex-start',
    textAlign,
    fontWeight: 'normal',
    fontSize: '14px',
    lineHeight: `${TABLE_FILTER_OPTION_LINE_HEIGHT_PX}px`,
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    overflow: 'hidden',
});

const buildTableFilterSingleValueStyles = (textAlign = 'left') => ({
    color: '#111827',
    fontWeight: 'normal',
    marginRight: 0,
    textAlign,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
});

/** Table filter Select styles used by DST filter row (Database Expenses / Table View). */
export const createDatabaseTableFilterSelectStyles = ({
    menuMaxHeight = TABLE_FILTER_MENU_MAX_HEIGHT_PX,
    controlHeightPx = EDBC_FILTER_CONTROL_HEIGHT_PX,
} = {}) => ({
    control: (provided, state) => ({
        ...provided,
        borderWidth: '2px',
        lineHeight: `${TABLE_FILTER_OPTION_LINE_HEIGHT_PX}px`,
        fontSize: '14px',
        fontWeight: 'normal',
        minHeight: `${controlHeightPx}px`,
        height: `${controlHeightPx}px`,
        maxHeight: `${controlHeightPx}px`,
        borderRadius: '8px',
        textAlign: 'left',
        borderColor: 'rgba(191, 152, 83, 0.2)',
        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
        boxSizing: 'border-box',
        alignItems: 'center',
        '&:hover': { borderColor: 'rgba(191, 152, 83, 0.4)' },
    }),
    clearIndicator: (provided) => ({ ...provided, cursor: 'pointer' }),
    menu: (provided) => ({
        ...provided,
        zIndex: 999,
        maxHeight: `${menuMaxHeight}px`,
    }),
    menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
    menuList: (provided) => ({
        ...provided,
        maxHeight: `${menuMaxHeight}px`,
        paddingTop: 0,
        paddingBottom: 0,
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
    }),
    singleValue: (provided) => ({
        ...provided,
        ...buildTableFilterSingleValueStyles('left'),
    }),
    valueContainer: (provided) => ({
        ...provided,
        paddingLeft: '12px',
        paddingRight: '2px',
        paddingTop: '2px',
        paddingBottom: '2px',
        flexWrap: 'nowrap',
        overflow: 'hidden',
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        paddingLeft: '0px',
        alignSelf: 'stretch',
        alignItems: 'center',
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
        ...buildTableFilterOptionStyles('left'),
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
});

export const DATABASE_TABLE_FILTER_SELECT_STYLES = createDatabaseTableFilterSelectStyles();

const TIMESTAMP_FILTER_BUTTON_STYLES =
    '[&>button]:!border-2 [&>button]:!border-[rgba(191,152,83,0.2)] [&>button]:!rounded-lg [&>button]:!shadow-none [&>button:hover]:!border-[rgba(191,152,83,0.4)] [&>button:focus]:!outline-none [&>button:focus]:!ring-0 [&>button:focus]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)] [&>button:focus-visible]:!outline-none [&>button:focus-visible]:!ring-0 [&>button:focus-visible]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)]';

const TIMESTAMP_FILTER_WRAPPER_CLASS =
    `relative pl-[10px] ${TIMESTAMP_FILTER_BUTTON_STYLES}`;

/** Display filter dates as dd-mm-yyyy (internal storage stays yyyy-mm-dd). */
export const formatEdbcFilterDateDMY = (dateString) => {
    if (!dateString) return '';
    const parts = String(dateString).split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        const [y, m, d] = parts;
        return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
    }
    return String(dateString);
};

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
    sortField: sortFieldProp,
    sortDirection: sortDirectionProp,
    onSort: onSortProp,
    sortProps,
    headerClassName = '',
    columnWidthClass = '',
}) => {
    const sortField = sortProps?.sortField ?? sortFieldProp;
    const sortDirection = sortProps?.sortDirection ?? sortDirectionProp;
    const onSort = sortProps?.onSort ?? onSortProp;
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
    const triggerRef = useRef(null);
    const config = EDBC_CONFIG[columnId];
    if (!config) return null;
    let { filterWidthClass, filterThClass } = config;
    if (columnId === EDBC_IDS.EDBC2 && columnWidthClass) {
        filterWidthClass = columnWidthClass;
    }
    const isDateColumn = columnId === EDBC_IDS.EDBC2;
    const formattedStart = timestampStartDate ? formatEdbcFilterDateDMY(timestampStartDate) : '';
    const formattedEnd = timestampEndDate ? formatEdbcFilterDateDMY(timestampEndDate) : '';
    let filterLabel = placeholder;
    if (timestampStartDate) {
        if (timestampEndDate) {
            filterLabel = timestampStartDate === timestampEndDate
                ? formattedStart
                : `${formattedStart} – ${formattedEnd}`;
        } else {
            filterLabel = `From ${formattedStart}`;
        }
    } else if (timestampEndDate) {
        filterLabel = `Until ${formattedEnd}`;
    }
    const hasDateFilter = Boolean(timestampStartDate || timestampEndDate);
    const wrapperClass = columnId === EDBC_IDS.EDBC1
        ? TIMESTAMP_FILTER_WRAPPER_CLASS
        : `relative ${filterWidthClass} ${TIMESTAMP_FILTER_BUTTON_STYLES}`;
    return (
    <th id={columnId} className={filterThClass}>
        <div className={wrapperClass}>
            <button
                ref={triggerRef}
                type="button"
                onClick={onOpen}
                style={EDBC_FILTER_CONTROL_BOX_STYLE}
                className={`${filterWidthClass} box-border pl-[12px] ${isDateColumn ? 'pr-0' : 'pr-[3px]'} py-0 text-sm font-normal bg-white text-left flex items-center overflow-hidden ${isDateColumn ? '' : 'justify-between'}`}
            >
                <span
                    title={hasDateFilter ? filterLabel : undefined}
                    className={`text-[14px] flex-1 min-w-0 text-left truncate overflow-hidden text-ellipsis whitespace-nowrap ${hasDateFilter ? 'text-black font-semibold' : 'text-[#A6A5A6] font-normal'}`}
                >
                    {hasDateFilter ? filterLabel : placeholder}
                </span>
                {isDateColumn ? (
                    <span className="shrink-0 ml-auto mr-[6px] w-[18px] h-[18px] flex items-center justify-center">
                        <img
                            src={CalendarIcon}
                            alt="Calendar"
                            className="w-[16px] h-[16px] text-gray-400 flex-shrink-0"
                        />
                    </span>
                ) : (
                <img
                    src={CalendarIcon}
                    alt="Calendar"
                    className={`w-[16px] h-[16px] text-gray-400 flex-shrink-0 mr-[6px] ml-[3px]`}
                />
                )}
            </button>
            <DateRangePicker
                isOpen={isOpen}
                onClose={onClose}
                startDate={timestampStartDate}
                endDate={timestampEndDate}
                variant="dropdown"
                controlHeightPx={EDBC_FILTER_CONTROL_HEIGHT_PX}
                anchorRef={triggerRef}
                onApply={onApply}
            />
        </div>
    </th>
    );
};

/** EDBC-2 date filter — `placeholder` should match the column heading on that page. */
export const EdbcDateFilter = ({ placeholder, value, onChange, columnWidthClass = '', calendarPortal = true }) => {
    const filterWidthClass = columnWidthClass || EDBC_CONFIG[EDBC_IDS.EDBC2].filterWidthClass;
    return (
    <th className={EDBC_CONFIG[EDBC_IDS.EDBC2].filterThClass}>
        <div className={filterWidthClass}>
            <CustomDateField
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                alwaysOpenBelow
                calendarPortal={calendarPortal}
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

export const buildRightAlignedTableFilterSelectStyles = (selectStyles) => ({
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
        ...provided,
        ...(typeof selectStyles.singleValue === 'function' ? selectStyles.singleValue(provided) : {}),
        ...buildTableFilterSingleValueStyles('right'),
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
        ...provided,
        ...buildTableFilterOptionStyles('right'),
        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
        color: 'black',
    }),
});

/** @deprecated Use buildRightAlignedTableFilterSelectStyles */
export const buildRightAlignedSelectStyles = buildRightAlignedTableFilterSelectStyles;

export const normalizeEdbcFilterText = (value) => String(value ?? '').trim().toLowerCase();

export const equalsEdbcFilterValue = (fieldValue, selectedValue) =>
    normalizeEdbcFilterText(fieldValue) === normalizeEdbcFilterText(selectedValue);

export const matchesEdbcSelectFilter = (fieldValue, selectedValue, { blankValue, isBlankish }) => {
    if (!selectedValue) return true;
    if (selectedValue === blankValue) return isBlankish(fieldValue);
    return equalsEdbcFilterValue(fieldValue, selectedValue);
};

export const buildEdbcSelectFilterOptions = (data, key, { blankOption = null, isBlankish } = {}) => {
    const unique = [];
    const seen = new Set();
    data.forEach((item) => {
        const val = item[key];
        if (isBlankish?.(val)) return;
        const normalized = normalizeEdbcFilterText(val);
        if (seen.has(normalized)) return;
        seen.add(normalized);
        unique.push(val);
    });
    const options = unique.map((val) => ({ value: val, label: val }));
    if (blankOption) options.unshift(blankOption);
    return options;
};

export const normalizeEdbcPaymentModeFilterValues = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter((v) => v !== '' && v != null);
    if (typeof value === 'string') {
        if (!value.trim()) return [];
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed.filter((v) => v !== '' && v != null);
        } catch (_) {
            /* legacy single value */
        }
        return [value];
    }
    return [];
};

export const hasEdbcPaymentModeFilter = (value) =>
    normalizeEdbcPaymentModeFilterValues(value).length > 0;

export const formatEdbcPaymentModeFilterChipLabel = (
    value,
    { blankValue = 'Blank', blankLabel = 'Blank' } = {},
) =>
    normalizeEdbcPaymentModeFilterValues(value)
        .map((mode) => (mode === blankValue ? blankLabel : mode))
        .join(', ');

export const matchesEdbcPaymentModeFilter = (
    expensePaymentMode,
    selectedValues,
    { blankValue = 'Blank', isBlankish },
) => {
    const modes = normalizeEdbcPaymentModeFilterValues(selectedValues);
    if (modes.length === 0) return true;
    return modes.some((mode) => {
        if (mode === blankValue) return isBlankish(expensePaymentMode);
        return equalsEdbcFilterValue(expensePaymentMode, mode);
    });
};

export const loadEdbcPaymentModeFilterFromStorage = (key = 'expenseFilter_paymentMode') => {
    if (typeof localStorage === 'undefined') return [];
    return normalizeEdbcPaymentModeFilterValues(localStorage.getItem(key));
};

export const saveEdbcPaymentModeFilterToStorage = (values, key = 'expenseFilter_paymentMode') => {
    if (typeof localStorage === 'undefined') return;
    const modes = normalizeEdbcPaymentModeFilterValues(values);
    if (modes.length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(modes));
};

const buildPaymentModeMultiSelectStyles = (selectStyles) => ({
    ...selectStyles,
    multiValue: () => ({ display: 'none' }),
    multiValueLabel: () => ({ display: 'none' }),
    multiValueRemove: () => ({ display: 'none' }),
});

const PaymentModeCheckboxOption = ({ innerProps, label, isSelected, isFocused }) => (
    <div
        {...innerProps}
        className="flex items-center gap-2 cursor-pointer select-none"
        style={{
            backgroundColor: isFocused ? '#FAF6ED' : 'white',
            minHeight: `${TABLE_FILTER_OPTION_HEIGHT_PX}px`,
            padding: '0 12px',
        }}
    >
        <span
            className="pointer-events-none shrink-0 inline-flex items-center justify-center box-border rounded-[2px]"
            style={{
                width: 14,
                height: 14,
                border: isSelected ? '2px solid #BF9853' : '2px solid #D1D5DB',
                backgroundColor: isSelected ? '#BF9853' : '#FFFFFF',
            }}
            aria-hidden
        >
            {isSelected ? (
                <svg width="9" height="7" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : null}
        </span>
        <span className="text-[14px] font-normal text-black truncate">{label}</span>
    </div>
);

/** EDBC-13 payment mode filter with checkbox multi-select. */
export const EdbcPaymentModeFilter = ({
    columnId = EDBC_IDS.EDBC13,
    placeholder,
    options,
    value = [],
    onChange,
    selectStyles = DATABASE_TABLE_FILTER_SELECT_STYLES,
}) => {
    const config = EDBC_CONFIG[columnId];
    const allOptionsRef = useRef([]);
    const selectedValues = normalizeEdbcPaymentModeFilterValues(value);
    const displayOptions = useMemo(() => {
        const map = new Map();
        allOptionsRef.current.forEach((option) => map.set(String(option.value), option));
        options.forEach((option) => map.set(String(option.value), option));
        selectedValues.forEach((selectedValue) => {
            const key = String(selectedValue);
            if (!map.has(key)) map.set(key, { value: selectedValue, label: selectedValue });
        });
        const merged = Array.from(map.values());
        allOptionsRef.current = merged;
        return merged;
    }, [options, selectedValues]);
    if (!config) return null;
    const selectedOptions = displayOptions.filter((opt) =>
        selectedValues.some((selectedValue) => equalsEdbcFilterValue(opt.value, selectedValue)),
    );
    return (
        <th id={columnId} className={config.filterThClass}>
            <Select
                isMulti
                isClearable={false}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                controlShouldRenderValue={false}
                filterOption={() => true}
                className={config.filterWidthClass}
                options={displayOptions}
                value={selectedOptions}
                onChange={(selected) => onChange((selected || []).map((option) => option.value))}
                placeholder={placeholder}
                menuPlacement="bottom"
                noOptionsMessage={() => null}
                components={{ Option: PaymentModeCheckboxOption }}
                styles={buildPaymentModeMultiSelectStyles(selectStyles)}
            />
        </th>
    );
};

export const EdbcPaymentModeFilterChip = ({
    fieldLabel = 'Mode',
    selectedModes = [],
    blankValue = 'Blank',
    blankLabel = 'Blank',
    onClear,
    className = 'inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden',
    labelClassName = 'font-semibold shrink-0 whitespace-nowrap',
}) => {
    if (!hasEdbcPaymentModeFilter(selectedModes)) return null;
    return (
        <span className={className}>
            <span className={labelClassName}>{fieldLabel}: </span>
            <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">
                {formatEdbcPaymentModeFilterChipLabel(selectedModes, { blankValue, blankLabel })}
            </span>
            <button type="button" onClick={onClear} className="text-[#E4572E] text-2xl ml-1">×</button>
        </span>
    );
};

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
    const baseStyles =
        textAlign === 'right' ? buildRightAlignedTableFilterSelectStyles(selectStyles) : selectStyles;
    const styles = columnId === EDBC_IDS.EDBC17
        ? {
            ...baseStyles,
            container: (provided) => ({
                ...(typeof baseStyles.container === 'function' ? baseStyles.container(provided) : provided),
                width: 120,
                minWidth: 120,
                maxWidth: 120,
            }),
            control: (provided, state) => {
                const controlBase = typeof baseStyles.control === 'function'
                    ? baseStyles.control(provided, state)
                    : provided;
                return {
                    ...controlBase,
                    width: 120,
                    minWidth: 120,
                    maxWidth: 120,
                    boxSizing: 'border-box',
                };
            },
        }
        : baseStyles;
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
                isClearable={false}
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

export const formatEdbcTotalAmountPlaceholder = (totalAmount) =>
    `₹${Number(totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const normalizeEdbcAmountFilterText = (value) =>
    String(value ?? '').replace(/[₹,\s]/g, '').trim();

export const matchesEdbcAmountFilter = (amount, filterText) => {
    const q = normalizeEdbcAmountFilterText(filterText);
    if (!q) return true;
    const amountStr = normalizeEdbcAmountFilterText(amount);
    return amountStr.includes(q);
};

/** EDBC-8 / EDBC-22 amount filter — total shown as placeholder when empty. */
export const EdbcTotalAmountFilter = ({ columnId, totalAmount, value, onChange, placeholder }) => {
    const config = EDBC_CONFIG[columnId];
    if (!config) return null;
    const handleChange = (e) => {
        if (!onChange) return;
        const sanitized = e.target.value.replace(/[^\d.,]/g, '');
        if (sanitized === e.target.value) {
            onChange(e);
            return;
        }
        onChange({ ...e, target: { ...e.target, value: sanitized } });
    };
    return (
        <th id={columnId} className={config.filterThClass}>
            <input
                type="text"
                inputMode="decimal"
                value={value}
                onChange={handleChange}
                placeholder={placeholder ?? formatEdbcTotalAmountPlaceholder(totalAmount)}
                style={EDBC_FILTER_CONTROL_BOX_STYLE}
                className={config.inputClassName}
            />
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
                    placeholderButtonClassName="text-[14px] font-normal placeholder:text-[#A6A5A6]"
                    className={EDBC_BILL_ARRIVAL_FILTER_FIELD_CLASS}
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
    const editDisabled = isAdvancePortalSourceExpense(expense);
    return (
        <td id={columnId} className={config.tdClass}>
            <button
                type="button"
                onClick={editDisabled ? undefined : () => onEdit(expense)}
                disabled={editDisabled}
                title={editDisabled ? 'Edit in Advance Portal' : 'Edit'}
                className={`rounded-full transition duration-200 ${editDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <img
                    src={edit}
                    alt="Edit"
                    className={`w-4 h-6 transition duration-200 ${editDisabled ? '' : 'transform hover:scale-110 hover:brightness-110'}`}
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

/** Shared filter toggle button for EDBC table toolbars. */
export const EdbcFilterToggleButton = ({
    onClick,
    buttonClassName = 'shrink-0',
    imageClassName = 'h-[34px] w-auto shrink-0 border rounded-md',
    type = 'button',
}) => (
    <button type={type} className={buttonClassName} onClick={onClick}>
        <img src={FilterIcon} alt="Toggle Filter" className={imageClassName} />
    </button>
);

/** Shared clear / search / export actions for EDBC table toolbars. */
export const EdbcTableToolbarRightActions = ({
    onClearFilters,
    overallSearch,
    onOverallSearchChange,
    searchPlaceholder = 'Search Transactions...',
    showExportIcons = false,
    onExportPdf,
    onExportCsv,
    clearButtonClassName = 'flex shrink-0 items-center justify-center',
    clearButtonType,
    searchWrapperClassName = 'h-[34px] min-w-0 flex-1 max-w-[286px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 gap-1 sm:w-[286px] sm:min-w-[286px] sm:flex-none sm:shrink-0',
    wrapperClassName = 'flex items-end gap-[6px] min-w-0 shrink',
}) => {
    const content = (
        <>
            <button type={clearButtonType} onClick={onClearFilters} className={clearButtonClassName}>
                <img className="h-[34px] w-[34px]" src={ReloadIcon} alt="Reload" />
            </button>
            <div className={searchWrapperClassName}>
                <input
                    type="text"
                    value={overallSearch}
                    onChange={(e) => onOverallSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-full w-full border-0 p-0 text-[14px] text-[#000000] bg-transparent outline-none"
                />
                <img src={SearchIcon} alt="Search" className="w-[16px] h-[16px] pointer-events-none" />
            </div>
            {showExportIcons && (
                <div className=" text-left md:text-right md:items-end items-end cursor-default flex justify-end max-w-screen-2xl table-auto overflow-auto w-full scrollbar-none no-scrollbar">
                    <div className="flex items-end text-center ">
                        <span className="text-[#E4572E] mr-2 flex items-center gap-1 font-semibold hover:underline cursor-pointer" onClick={onExportPdf}>PDF<img src={PdfIcon} alt="Pdf" className="w-4 h-4" /></span>
                        <span className="text-[#007233] flex items-center gap-1 font-semibold hover:underline cursor-pointer" onClick={onExportCsv}>XL<img src={XlIcon} alt="XL" className="w-4 h-4" /></span>
                    </div>
                </div>
            )}
        </>
    );
    if (wrapperClassName == null) {
        return content;
    }
    return <div className={wrapperClassName}>{content}</div>;
};
