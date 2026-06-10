import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import SingleDatePicker from "./SingleDatePicker";
import CalendarIcon from "../Images/Calendoricon.png";


/** Parse manual entry: yyyy-MM-dd, dd-MM-yyyy, dd/MM/yyyy, dd.MM.yyyy. Returns "" if empty, null if invalid, else yyyy-MM-dd. */
function parseTypedDate(str) {
  const s = String(str || "").trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    try {
      const d = parseISO(s);
      return isNaN(d.getTime()) ? null : format(d, "yyyy-MM-dd");
    } catch {
      return null;
    }
  }
  const m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (!m) return null;
  const day = +m[1];
  const month = +m[2];
  let year = +m[3];
  if (year < 100) year += 2000;
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return format(d, "yyyy-MM-dd");
}

function formatIsoToDisplay(iso) {
  if (!iso) return "";
  try {
    return format(parseISO(iso), "dd-MM-yyyy");
  } catch {
    return "";
  }
}

/** In-progress yyyy-MM-dd so we do not insert dd-mm hyphens while typing a year-first date. */
const ISO_DATE_TYPING = /^\d{4}(-\d{0,2})?(-\d{0,4})?$/;

function normalizePartialMonth(month) {
  if (!month) return "";
  const digits = String(month).replace(/\D/g, "").slice(0, 2);
  if (digits.length <= 1) return digits.padStart(2, "0");
  const n = Number(digits);
  if (n < 1) return "01";
  if (n > 12) return "12";
  return String(n).padStart(2, "0");
}

/** While typing — keep single month digits unpadded; cap at 12; never pull year into month. */
function sanitizeMonthWhileTyping(month) {
  if (!month) return "";
  const digits = String(month).replace(/\D/g, "").slice(0, 2);
  if (digits.length <= 1) return digits;
  const n = Number(digits);
  if (n > 12) return "12";
  if (n < 1) return "1";
  return digits;
}

function formatPartialDdMmYyyy({ day, month, year }) {
  const monthStr = sanitizeMonthWhileTyping(month);
  const dayStr = String(day ?? "").slice(0, 2);
  const yearStr = String(year ?? "").slice(0, 4);

  if (!dayStr && !month && !yearStr) return "";

  if (!dayStr) {
    let out = `--${monthStr}`;
    if (monthStr.length > 0 || yearStr.length > 0) {
      out += `-${yearStr}`;
    }
    return out;
  }

  let out = `${dayStr}-`;
  if (!monthStr) {
    out += "-";
  } else {
    out += monthStr;
  }
  if (monthStr.length > 0 || yearStr.length > 0) {
    out += `-${yearStr}`;
  }
  return out;
}

/** Keep day/year in place while month is cleared or re-typed (dd-[mm]-yyyy). */
function tryParsePartialDdMmYyyy(val) {
  const s = String(val || "").replace(/\s/g, "");
  if (!s.includes("-")) return null;

  let m = s.match(/^--(\d{0,2})-(\d{0,4})$/);
  if (m) return { day: "", month: m[1] ?? "", year: m[2] ?? "" };

  m = s.match(/^-(\d{0,2})-(\d{0,4})$/);
  if (m) return { day: "", month: m[1] ?? "", year: m[2] ?? "" };

  m = s.match(/^(\d{2})--(\d{0,4})$/);
  if (m) return { day: m[1], month: "", year: m[2] ?? "" };

  m = s.match(/^(\d{0,2})--(\d{0,2})-(\d{0,4})$/);
  if (m) return { day: m[1] ?? "", month: m[2] ?? "", year: m[3] ?? "" };

  m = s.match(/^(\d{0,2})-(\d{0,2})-(\d{0,4})$/);
  if (m) return { day: m[1] ?? "", month: m[2] ?? "", year: m[3] ?? "" };

  m = s.match(/^(\d{2})-(\d{4,})$/);
  if (m) return { day: "", month: m[1] ?? "", year: m[2] ?? "" };

  m = s.match(/^(\d{0,2})-(\d{0,2})$/);
  if (m) return { day: m[1] ?? "", month: m[2] ?? "", year: "" };

  return null;
}

function computeCaretAfterPartialEdit(prevCaret, nextText, partial) {
  if (partial && !partial.day) {
    return 0;
  }
  if (prevCaret <= 2) {
    const dayLen = String(partial?.day || "").length;
    return dayLen > 0 ? Math.min(prevCaret, dayLen) : 0;
  }
  return Math.min(prevCaret, nextText.length);
}

/** When day/month typing makes the string longer than 10 chars, keep full year (do not truncate end). */
function resolveOverflowDdMmYyyy(val, prevText) {
  const s = String(val || "").replace(/\s/g, "");
  if (s.length <= 10) return s;

  const m = s.match(/^(\d+)-(\d{0,2})-(\d{0,4})$/);
  if (!m) {
    const prevPartial = tryParsePartialDdMmYyyy(prevText);
    const prevYear = String(prevPartial?.year || "");
    const doubleHyphen = s.match(/^(\d{0,2})--+(\d{0,2})-(\d{0,4})/);
    if (doubleHyphen) {
      let year = doubleHyphen[3] ?? "";
      if (year.length < 4 && prevYear.length === 4) {
        year = prevYear;
      }
      return formatPartialDdMmYyyy({
        day: doubleHyphen[1] ?? "",
        month: doubleHyphen[2] ?? "",
        year: year || prevYear,
      });
    }
    const truncated = s.slice(0, 10);
    const truncatedPartial = tryParsePartialDdMmYyyy(truncated);
    if (truncatedPartial && prevYear.length === 4) {
      const y = String(truncatedPartial.year || "");
      if (y.length < 4 && prevYear.startsWith(y)) {
        return formatPartialDdMmYyyy({ ...truncatedPartial, year: prevYear });
      }
    }
    return truncated;
  }

  let day = m[1] ?? "";
  const month = m[2] ?? "";
  let year = m[3] ?? "";
  const prevPartial = tryParsePartialDdMmYyyy(prevText);
  const prevYear = String(prevPartial?.year || "");

  if (day.length > 2) {
    day = day.slice(-2);
  }
  if (year.length < 4 && prevYear.length === 4) {
    year = prevYear;
  }
  return formatPartialDdMmYyyy({ day, month, year: year || prevYear });
}

/** When day/month changed, keep full year; only allow shorter year if user edited year only. */
function preserveYearFromPrevIfEditingDayMonth(partial, prevText) {
  if (!partial) return partial;
  const prevPartial = tryParsePartialDdMmYyyy(prevText);
  const prevYear = String(prevPartial?.year || "");
  if (prevYear.length !== 4) return partial;
  const yearStr = String(partial.year || "");
  if (yearStr.length >= 4 || !prevYear.startsWith(yearStr)) return partial;

  const dayChanged = String(partial.day || "") !== String(prevPartial?.day || "");
  const monthChanged = String(partial.month ?? "") !== String(prevPartial?.month ?? "");
  if (dayChanged || monthChanged) {
    return { ...partial, year: prevYear };
  }
  return partial;
}

function resolvePickerValueFromText(text, fallbackValue) {
  const parsed = parseTypedDate(text);
  if (parsed) return parsed;

  const partial = tryParsePartialDdMmYyyy(text);
  if (!partial) return fallbackValue || "";

  const yearStr = String(partial.year || "");
  if (!yearStr) return fallbackValue || "";
  let year = parseInt(yearStr, 10);
  if (Number.isNaN(year)) return fallbackValue || "";
  if (yearStr.length <= 2) year += 2000;

  const monthStr = normalizePartialMonth(partial.month) || String(partial.month || "");
  if (!monthStr) return fallbackValue || "";
  const month = parseInt(monthStr, 10);
  if (Number.isNaN(month) || month < 1 || month > 12) return fallbackValue || "";

  const dayStr = String(partial.day || "");
  const day = dayStr ? parseInt(dayStr, 10) : 1;
  if (Number.isNaN(day) || day < 1 || day > 31) return fallbackValue || "";

  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return fallbackValue || "";
  }
  return format(d, "yyyy-MM-dd");
}

function formatDigitsAsDdMmYyyy(digits, val, prevText) {
  const d = digits.slice(0, 8);
  const v = String(val ?? "");
  const p = String(prevText ?? "");

  if (d.length === 0) return "";
  if (d.length === 1) return d;
  if (d.length === 2) {
    if (p.endsWith("-") && !v.includes("-")) return d;
    return `${d}-`;
  }
  if (d.length === 3) {
    return `${d.slice(0, 2)}-${d.slice(2)}-`;
  }
  if (d.length === 4) {
    const monthDigits = d.slice(2, 4);
    let monthNum = Number(monthDigits);
    if (monthNum > 12) monthNum = 12;
    if (monthNum < 1 && monthDigits.length === 2) monthNum = Number(monthDigits.slice(0, 1)) || 1;
    const monthPart = monthDigits.length === 1 ? monthDigits : String(monthNum);
    return `${d.slice(0, 2)}-${monthPart}-`;
  }
  if (d.length >= 5 && d.length < 8) {
    const prevPartial = tryParsePartialDdMmYyyy(p);
    const day = d.slice(0, 2);
    const month = d.slice(2, 4);
    let yearDigits = d.slice(4);
    const prevYear = String(prevPartial?.year || "");
    if (prevYear && yearDigits.length < 4) {
      yearDigits = (yearDigits + prevYear.slice(yearDigits.length)).slice(0, 4);
    }
    return formatPartialDdMmYyyy({ day, month, year: yearDigits });
  }
  return `${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4)}`;
}

export default function CustomDateField({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  disabled = false,
  anchor = "left",
  alwaysOpenBelow = false,
  alwaysOpenAbove = false,
  controlHeightPx,
  /** When empty, replaces default trigger typography (placeholder look only; calendar unchanged). */
  placeholderButtonClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => formatIsoToDisplay(value));
  const [calendarValue, setCalendarValue] = useState(() => value || "");
  const inputRef = useRef(null);
  const caretRef = useRef(null);
  const controlBoxStyle = controlHeightPx
    ? {
        height: `${controlHeightPx}px`,
        minHeight: `${controlHeightPx}px`,
        boxSizing: 'border-box',
      }
    : undefined;

  useEffect(() => {
    if (inputRef.current === document.activeElement) return;
    setText(formatIsoToDisplay(value));
    setCalendarValue(value || "");
  }, [value]);

  useEffect(() => {
    const resolved = resolvePickerValueFromText(text, calendarValue || value || "");
    if (resolved) {
      setCalendarValue(resolved);
    }
  }, [text]);

  useLayoutEffect(() => {
    if (caretRef.current == null) return;
    const el = inputRef.current;
    const pos = caretRef.current;
    caretRef.current = null;
    if (el) {
      el.setSelectionRange(pos, pos);
    }
  }, [text]);

  const applyText = (nextText, nextCaret) => {
    caretRef.current = nextCaret;
    setText(nextText);
  };

  const commitText = () => {
    const parsed = parseTypedDate(text) || resolvePickerValueFromText(text, value || calendarValue || "");
    if (parsed === "") {
      onChange("");
      setText("");
      setCalendarValue("");
      return;
    }
    if (parsed != null) {
      onChange(parsed);
      setText(formatIsoToDisplay(parsed));
      setCalendarValue(parsed);
      return;
    }
  };

  const handleBlur = () => {
    // Keep in-progress text on blur; commit only via Enter or calendar.
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    const caret = e.target.selectionStart ?? 0;
    if (ISO_DATE_TYPING.test(val)) {
      const y = parseInt(val.slice(0, 4), 10);
      const plausibleYear = y >= 1900 && y <= 2100;
      if (plausibleYear && val.includes("-")) {
        applyText(val.slice(0, 10), Math.min(caret, 10));
        return;
      }
      if (plausibleYear && val.length === 4) {
        applyText(val.slice(0, 4), Math.min(caret, 4));
        return;
      }
    }
    const partialSegments = tryParsePartialDdMmYyyy(val);
    if (partialSegments) {
      const preserved = preserveYearFromPrevIfEditingDayMonth(partialSegments, text);
      const nextText = formatPartialDdMmYyyy(preserved);
      applyText(nextText, computeCaretAfterPartialEdit(caret, nextText, preserved));
      return;
    }
    if (String(val).replace(/\s/g, "").includes("-")) {
      const nextText = resolveOverflowDdMmYyyy(val, text);
      applyText(nextText, Math.min(caret, nextText.length));
      return;
    }
    const digits = val.replace(/\D/g, "").slice(0, 8);
    const nextText = formatDigitsAsDdMmYyyy(digits, val, text);
    applyText(nextText, Math.min(caret, nextText.length));
  };

  const pickerValue = calendarValue || resolvePickerValueFromText(text, value || "") || "";

  const inputLooksEmpty = !String(text || "").trim();

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative flex items-center ${controlHeightPx ? 'w-[300px]' : 'w-[120px] h-[36px]'} rounded-lg border-2 border-[#BF9853] border-opacity-25 bg-[#FFFFFF] shadow-sm overflow-hidden ${
          disabled ? "opacity-70 cursor-not-allowed bg-gray-100" : "hover:border-[rgba(191,152,83,0.4)]"
        }`}
        style={controlBoxStyle}
      >
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={text}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitText();
              inputRef.current?.blur();
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className={[
            "min-w-0 flex-1 border-0 bg-transparent pl-[12px] pt-[2px] pb-[2px] text-sm outline-none focus:ring-0",
            inputLooksEmpty
              ? String(placeholderButtonClassName || "").trim() || "text-[12px] text-black font-normal placeholder:text-[#A6A5A6]"
              : "!text-black !font-bold",
            disabled ? "cursor-not-allowed" : "",
          ].join(" ")}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          className={`shrink-0 self-center ml-auto mr-[6px] w-[18px] h-[18px] p-0 flex items-center justify-center ${
            disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-amber-50/80"
          }`}
          aria-label="Open calendar"
        >
          <img src={CalendarIcon} alt="#" className="w-[16px] h-[16px]  pointer-events-none" />
        </button>
      </div>

      <SingleDatePicker
        key={open ? `cal-${pickerValue || "empty"}` : "cal-closed"}
        isOpen={open}
        onClose={() => setOpen(false)}
        value={pickerValue}
        onChange={(v) => {
          onChange(v);
          setText(formatIsoToDisplay(v));
          setCalendarValue(v || "");
          setOpen(false);
        }}
        variant="dropdown"
        anchor={anchor}
        alwaysOpenBelow={alwaysOpenBelow}
        alwaysOpenAbove={alwaysOpenAbove}
      />
    </div>
  );
}
