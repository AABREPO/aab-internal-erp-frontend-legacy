import React, { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import SingleDatePicker from "./SingleDatePicker";

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
  if (d.length === 3) return `${d.slice(0, 2)}-${d.slice(2)}`;
  if (d.length === 4) {
    const ddmm = `${d.slice(0, 2)}-${d.slice(2, 4)}`;
    if (/^\d{2}-\d{2}-$/.test(p) && v.replace(/\s/g, "") === ddmm) return v.replace(/\s/g, "");
    return `${ddmm}-`;
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
  /** When empty, replaces default trigger typography (placeholder look only; calendar unchanged). */
  placeholderButtonClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => formatIsoToDisplay(value));
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current === document.activeElement) return;
    setText(formatIsoToDisplay(value));
  }, [value]);

  const commitText = () => {
    const parsed = parseTypedDate(text);
    if (parsed === "") {
      onChange("");
      setText("");
      return;
    }
    if (parsed != null) {
      onChange(parsed);
      setText(formatIsoToDisplay(parsed));
      return;
    }
    setText(formatIsoToDisplay(value));
  };

  const handleBlur = () => {
    commitText();
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (ISO_DATE_TYPING.test(val)) {
      const y = parseInt(val.slice(0, 4), 10);
      const plausibleYear = y >= 1900 && y <= 2100;
      if (plausibleYear && val.includes("-")) {
        setText(val.slice(0, 10));
        return;
      }
      if (plausibleYear && val.length === 4) {
        setText(val.slice(0, 4));
        return;
      }
    }
    const digits = val.replace(/\D/g, "").slice(0, 8);
    setText(formatDigitsAsDdMmYyyy(digits, val, text));
  };

  const inputLooksEmpty = !String(text || "").trim();

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex w-full min-h-[45px] rounded-lg border-2 border-[#BF9853] border-opacity-25 bg-white shadow-sm overflow-hidden ${
          disabled ? "opacity-70 cursor-not-allowed bg-gray-100" : ""
        }`}
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
            "min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none focus:ring-0",
            inputLooksEmpty
              ? String(placeholderButtonClassName || "").trim() || "text-[12px] text-black font-semibold placeholder:text-gray-400"
              : "!text-black !font-normal",
            disabled ? "cursor-not-allowed" : "",
          ].join(" ")}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          className={`shrink-0 px-2.5 flex items-center justify-center ${
            disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-amber-50/80"
          }`}
          aria-label="Open calendar"
        >
          <Calendar className="w-4 h-4 text-gray-400 pointer-events-none" />
        </button>
      </div>

      <SingleDatePicker
        isOpen={open}
        onClose={() => setOpen(false)}
        value={value || ""}
        onChange={(v) => {
          onChange(v);
          setText(formatIsoToDisplay(v));
          setOpen(false);
        }}
        variant="dropdown"
        anchor={anchor}
        alwaysOpenBelow={alwaysOpenBelow}
      />
    </div>
  );
}
