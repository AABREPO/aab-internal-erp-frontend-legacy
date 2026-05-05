import React, { useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import SingleDatePicker from "./SingleDatePicker";
import { format, parseISO } from "date-fns";

export default function SingleDatePickerPage() {
  const [value, setValue] = useState("");
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
    <div className="w-full max-w-[900px] mx-auto py-6">
      <div className="bg-white shadow-lg rounded-lg p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Custom Date Picker (Single)</h2>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative w-[220px]">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="w-full h-[45px] rounded-lg border-2 border-[#BF9853] border-opacity-25 bg-white px-3 pr-9 text-left text-sm text-gray-800 shadow-sm hover:bg-[#FAF6ED] focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
            >
              {displayValue ? displayValue : "Select date"}
            </button>
            <Calendar className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <SingleDatePicker
              isOpen={open}
              onClose={() => setOpen(false)}
              value={value}
              onChange={setValue}
              variant="dropdown"
              anchor="left"
            />
          </div>

          <div className="text-sm text-gray-600">
            <div>
              <span className="font-medium text-gray-800">Selected:</span>{" "}
              <span className="font-mono">{displayValue || "(none)"}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Same UI on all browsers (custom picker, not <code>type="date"</code>).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

