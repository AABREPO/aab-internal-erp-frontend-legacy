import React, { useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import SingleDatePicker from "./SingleDatePicker";

export default function CustomDateField({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  disabled = false,
  anchor = "left",
  alwaysOpenBelow = false,
}) {
  const [open, setOpen] = useState(false);

  const displayValue = useMemo(() => {
    if (!value) return "";
    try {
      return format(parseISO(value), "dd-MM-yyyy");
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
          `w-full h-[45px] rounded-lg border-2 border-[#BF9853] border-opacity-25 bg-white px-3 pr-9 text-left ${displayValue ? "text-sm !text-black !font-normal" : "text-[12px] text-black font-semibold"} shadow-sm`,
          "",
          disabled ? "opacity-70 cursor-not-allowed bg-gray-100 hover:bg-gray-100" : "cursor-pointer",
        ].join(" ")}
      >
        {displayValue || placeholder}
      </button>

      <Calendar className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

      <SingleDatePicker
        isOpen={open}
        onClose={() => setOpen(false)}
        value={value || ""}
        onChange={(v) => onChange(v)}
        variant="dropdown"
        anchor={anchor}
        alwaysOpenBelow={alwaysOpenBelow}
      />
    </div>
  );
}

