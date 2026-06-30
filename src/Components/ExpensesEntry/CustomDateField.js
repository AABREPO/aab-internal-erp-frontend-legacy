import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import SingleDatePicker, { CALENDAR_PANEL_WIDTH_PX } from "./SingleDatePicker";
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

/** While typing — keep single month digits unpadded; max 12; e.g. 22 → 02. */
function sanitizeMonthWhileTyping(month) {
  if (!month) return "";
  const digits = String(month).replace(/\D/g, "").slice(0, 2);
  if (digits.length <= 1) return digits;
  const n = Number(digits);
  if (n > 12) return `0${digits[1]}`;
  if (n < 1) return "1";
  return digits;
}

/** While typing — keep single day digits unpadded; cap at 31. */
function sanitizeDayWhileTyping(day) {
  if (!day) return "";
  const digits = String(day).replace(/\D/g, "").slice(0, 2);
  if (digits.length <= 1) return digits;
  const n = Number(digits);
  if (n > 31) return "31";
  if (n < 1) return "1";
  return digits;
}

function formatPartialDdMmYyyy({ day, month, year }, trailAfterMonth = false) {
  const monthStr = sanitizeMonthWhileTyping(month);
  const dayStr = sanitizeDayWhileTyping(day);
  const yearStr = String(year ?? "").slice(0, 4);

  if (!dayStr && !month && !yearStr) return "";

  if (!dayStr) {
    let out = `--${monthStr}`;
    if (monthStr.length > 0 || yearStr.length > 0) {
      out += `-${yearStr}`;
    }
    return out;
  }

  let out = dayStr.length === 2 ? `${dayStr}-` : dayStr;
  if (!monthStr) {
    if (yearStr) out += `-${yearStr}`;
    return out;
  }
  if (dayStr.length < 2) {
    out += "-";
  }
  out += monthStr;
  if (yearStr.length > 0) {
    out += `-${yearStr}`;
  } else if (monthStr.length === 2 && trailAfterMonth) {
    out += "-";
  }
  return out;
}

function getPartialFromText(text) {
  const fromHyphens = tryParsePartialDdMmYyyy(text);
  if (fromHyphens) {
    return {
      day: String(fromHyphens.day ?? "").replace(/\D/g, ""),
      month: String(fromHyphens.month ?? "").replace(/\D/g, ""),
      year: String(fromHyphens.year ?? "").replace(/\D/g, ""),
    };
  }
  const d = String(text ?? "").replace(/\D/g, "");
  return { day: d.slice(0, 2), month: d.slice(2, 4), year: d.slice(4, 8) };
}

function getSegmentFromCaret(text, caret) {
  const s = String(text ?? "");
  const firstHyp = s.indexOf("-");
  if (firstHyp === -1) return "day";
  const secondHyp = s.indexOf("-", firstHyp + 1);
  if (secondHyp === -1) {
    return caret <= firstHyp ? "day" : "month";
  }
  if (caret <= firstHyp) return "day";
  if (caret <= secondHyp) return "month";
  return "year";
}

function getInsertedDigits(prevText, nextVal) {
  const prevD = String(prevText ?? "").replace(/\D/g, "");
  const newD = String(nextVal ?? "").replace(/\D/g, "");
  if (newD.length <= prevD.length) return "";
  let i = 0;
  while (i < prevD.length && prevD[i] === newD[i]) i += 1;
  return newD.slice(i, i + (newD.length - prevD.length));
}

function applyDigitToActiveSegment(partial, segment, insertedDigits, caret, text) {
  const digits = String(insertedDigits ?? "").replace(/\D/g, "");
  if (!digits) return partial;

  const p = {
    day: String(partial?.day ?? "").replace(/\D/g, ""),
    month: String(partial?.month ?? "").replace(/\D/g, ""),
    year: String(partial?.year ?? "").replace(/\D/g, ""),
  };

  const firstHyp = text.indexOf("-");
  const secondHyp = firstHyp >= 0 ? text.indexOf("-", firstHyp + 1) : -1;
  const maxLen = segment === "year" ? 4 : 2;
  let segStart = 0;
  if (segment === "month") segStart = firstHyp + 1;
  else if (segment === "year") segStart = secondHyp + 1;

  let posInSeg = Math.max(0, Math.min(caret - segStart, maxLen));

  for (const ch of digits) {
    let cur = p[segment];
    if (cur.length >= maxLen && posInSeg < maxLen) {
      cur = cur.slice(0, posInSeg) + ch + cur.slice(posInSeg + 1);
      posInSeg += 1;
    } else if (cur.length < maxLen) {
      if (posInSeg < cur.length) {
        cur = cur.slice(0, posInSeg) + ch + cur.slice(posInSeg);
      } else {
        cur += ch;
      }
      posInSeg += 1;
    } else {
      cur = cur.slice(1) + ch;
      posInSeg = maxLen;
    }

    if (segment === "day") p.day = sanitizeDayWhileTyping(cur.slice(0, 2));
    else if (segment === "month") p.month = sanitizeMonthWhileTyping(cur.slice(0, 2));
    else p.year = cur.slice(0, 4);
  }

  return p;
}

function computeCaretInSegment(nextText, partial, segment) {
  const firstHyp = nextText.indexOf("-");
  const secondHyp = firstHyp >= 0 ? nextText.indexOf("-", firstHyp + 1) : -1;
  const dayLen = String(partial?.day || "").length;
  const monthLen = String(partial?.month || "").length;
  const yearLen = String(partial?.year || "").length;

  if (segment === "day") {
    return dayLen === 2 && firstHyp >= 0 ? firstHyp : dayLen;
  }
  if (segment === "month") {
    const monthStart = firstHyp + 1;
    if (monthLen === 2 && secondHyp >= 0) return secondHyp + 1;
    return monthStart + monthLen;
  }
  return (secondHyp >= 0 ? secondHyp + 1 : 0) + yearLen;
}

function appendDigitsToPartial(partial, digitsToAdd) {
  const p = {
    day: String(partial?.day ?? "").replace(/\D/g, ""),
    month: String(partial?.month ?? "").replace(/\D/g, ""),
    year: String(partial?.year ?? "").replace(/\D/g, ""),
  };
  for (const ch of String(digitsToAdd ?? "").replace(/\D/g, "")) {
    if (p.day.length < 2) p.day += ch;
    else if (p.month.length < 2) p.month += ch;
    else if (p.year.length < 4) p.year += ch;
  }
  p.day = sanitizeDayWhileTyping(p.day);
  p.month = sanitizeMonthWhileTyping(p.month);
  return p;
}

function computeCaretEndOfActiveSegment(nextText, partial) {
  const dayLen = String(partial?.day || "").length;
  const monthLen = String(partial?.month || "").length;
  const yearLen = String(partial?.year || "").length;
  if (dayLen < 2) return dayLen;
  if (monthLen < 2) return 2 + 1 + monthLen;
  return 6 + yearLen;
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

  let day = sanitizeDayWhileTyping(m[1] ?? "");
  const month = sanitizeMonthWhileTyping(m[2] ?? "");
  let year = m[3] ?? "";
  const prevPartial = tryParsePartialDdMmYyyy(prevText);
  const prevYear = String(prevPartial?.year || "");

  if (String(m[1] ?? "").length > 2) {
    day = sanitizeDayWhileTyping(String(m[1] ?? "").slice(-2));
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
    const dayPart = sanitizeDayWhileTyping(d);
    if (p.endsWith("-") && !v.includes("-")) return dayPart;
    return `${dayPart}-`;
  }
  if (d.length === 3) {
    const dayPart = sanitizeDayWhileTyping(d.slice(0, 2));
    return `${dayPart}-${d.slice(2)}`;
  }
  if (d.length === 4) {
    const dayPart = sanitizeDayWhileTyping(d.slice(0, 2));
    const monthPart = sanitizeMonthWhileTyping(d.slice(2, 4));
    return `${dayPart}-${monthPart}-`;
  }
  if (d.length >= 5 && d.length < 8) {
    const prevPartial = tryParsePartialDdMmYyyy(p);
    const day = sanitizeDayWhileTyping(d.slice(0, 2));
    const month = sanitizeMonthWhileTyping(d.slice(2, 4));
    let yearDigits = d.slice(4);
    const prevYear = String(prevPartial?.year || "");
    if (prevYear && yearDigits.length < 4) {
      yearDigits = (yearDigits + prevYear.slice(yearDigits.length)).slice(0, 4);
    }
    return formatPartialDdMmYyyy({ day, month, year: yearDigits });
  }
  const dayPart = sanitizeDayWhileTyping(d.slice(0, 2));
  const monthPart = sanitizeMonthWhileTyping(d.slice(2, 4));
  return `${dayPart}-${monthPart}-${d.slice(4)}`;
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
  calendarPortal = false,
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => formatIsoToDisplay(value));
  const [calendarValue, setCalendarValue] = useState(() => value || "");
  const [portalStyle, setPortalStyle] = useState(null);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
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

  const updatePortalPosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    if (!triggerEl) return;
    const rect = triggerEl.getBoundingClientRect();
    const gap = 8;
    const left = anchor === "right" ? rect.right - CALENDAR_PANEL_WIDTH_PX : rect.left;
    if (alwaysOpenAbove) {
      setPortalStyle({
        left,
        top: rect.top - gap,
        transform: "translateY(-100%)",
      });
      return;
    }
    setPortalStyle({
      left,
      top: rect.bottom + gap,
    });
  }, [anchor, alwaysOpenAbove]);

  useLayoutEffect(() => {
    if (!open || !calendarPortal) {
      setPortalStyle(null);
      return;
    }
    updatePortalPosition();
    window.addEventListener("scroll", updatePortalPosition, true);
    window.addEventListener("resize", updatePortalPosition);
    return () => {
      window.removeEventListener("scroll", updatePortalPosition, true);
      window.removeEventListener("resize", updatePortalPosition);
    };
  }, [open, calendarPortal, updatePortalPosition]);

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
    const isDeleting = val.length < text.length;
    const prevDigits = text.replace(/\D/g, "");
    const newDigits = val.replace(/\D/g, "");
    if (!isDeleting && newDigits.length > prevDigits.length) {
      const inserted = getInsertedDigits(text, val);
      if (String(text).includes("-")) {
        const typeCaret = Math.max(0, caret - inserted.length);
        const segment = getSegmentFromCaret(text, typeCaret);
        let partial = applyDigitToActiveSegment(
          getPartialFromText(text),
          segment,
          inserted,
          typeCaret,
          text
        );
        partial = preserveYearFromPrevIfEditingDayMonth(partial, text);
        const nextText = formatPartialDdMmYyyy(partial, partial.month.length === 2);
        applyText(nextText, computeCaretInSegment(nextText, partial, segment));
        return;
      }
      const partial = appendDigitsToPartial(getPartialFromText(text), inserted);
      const nextText = formatPartialDdMmYyyy(partial, partial.month.length === 2);
      applyText(nextText, computeCaretEndOfActiveSegment(nextText, partial));
      return;
    }
    if (isDeleting && !val.includes("-")) {
      const dayDigits = val.replace(/\D/g, "").slice(0, 2);
      applyText(dayDigits, Math.min(caret, dayDigits.length));
      return;
    }
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
      const normalized = {
        day: String(preserved.day ?? "").replace(/\D/g, ""),
        month: String(preserved.month ?? "").replace(/\D/g, ""),
        year: String(preserved.year ?? "").replace(/\D/g, ""),
      };
      normalized.day = sanitizeDayWhileTyping(normalized.day);
      normalized.month = sanitizeMonthWhileTyping(normalized.month);
      const nextText = formatPartialDdMmYyyy(
        normalized,
        !isDeleting && normalized.month.length === 2
      );
      applyText(nextText, Math.min(caret, nextText.length));
      return;
    }
    if (String(val).replace(/\s/g, "").includes("-")) {
      const nextText = resolveOverflowDdMmYyyy(val, text);
      applyText(nextText, Math.min(caret, nextText.length));
      return;
    }
    const digits = val.replace(/\D/g, "").slice(0, 8);
    const nextText = formatDigitsAsDdMmYyyy(digits, val, text);
    const partial = getPartialFromText(nextText);
    applyText(nextText, computeCaretEndOfActiveSegment(nextText, partial));
  };

  const pickerValue = calendarValue || resolvePickerValueFromText(text, value || "") || "";

  const inputLooksEmpty = !String(text || "").trim();

  return (
    <div className={`relative ${className}`}>
      <div
        ref={triggerRef}
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
              : "!text-black !font-semibold",
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
        isOpen={open && (!calendarPortal || !!portalStyle)}
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
        portalStyle={calendarPortal && open ? portalStyle : null}
        anchorRef={calendarPortal ? triggerRef : null}
      />
    </div>
  );
}
