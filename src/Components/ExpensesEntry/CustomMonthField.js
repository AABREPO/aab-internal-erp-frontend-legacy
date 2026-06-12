import React, { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import MonthPicker from "./MonthPicker";
import CalendarIcon from "../Images/Calendoricon.png";

export default function CustomMonthField({
  value,
  onChange,
  placeholder = "Month",
  className = "",
  disabled = false,
  anchor = "left",
  alwaysOpenBelow = false,
  alwaysOpenAbove = false,
}) {
  const [open, setOpen] = useState(false);

  const displayValue = useMemo(() => {
    if (!value) return "";
    try {
      return format(parseISO(`${value}-01`), "MMMM yyyy");
    } catch {
      return value;
    }
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={[
          `w-full h-[40px] rounded-lg border-2 border-[#BF9853] border-opacity-25 bg-white px-3 pr-9 placeholder:text-[14px] placeholder:font-normal text-left ${
            displayValue ? "text-sm !text-black !font-normal" : "text-[14px] text-gray-500 font-normal"
          } shadow-sm`,
          disabled ? "opacity-70 cursor-not-allowed bg-gray-100 hover:bg-gray-100" : "cursor-pointer",
        ].join(" ")}
      >
        {displayValue || placeholder}
      </button>

      <img src={CalendarIcon} alt="#" className="w-[16px] h-[16px]  pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />

      <MonthPicker
        isOpen={open}
        onClose={() => setOpen(false)}
        value={value || ""}
        onChange={(v) => onChange(v)}
        anchor={anchor}
        alwaysOpenBelow={alwaysOpenBelow}
        alwaysOpenAbove={alwaysOpenAbove}
      />
    </div>
  );
}

