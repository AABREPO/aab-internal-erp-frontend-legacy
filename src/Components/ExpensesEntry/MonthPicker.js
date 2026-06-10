import React, { useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { calendarPanelStyle } from "./SingleDatePicker";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function monthValueToDate(value) {
  if (!value) return null;
  try {
    return parseISO(`${value}-01`);
  } catch {
    return null;
  }
}

function buildYearGrid(centerYear) {
  return Array.from({ length: 12 }, (_, i) => centerYear - 5 + i);
}

export default function MonthPicker({
  isOpen,
  onClose,
  value,
  onChange,
  anchor = "left",
  alwaysOpenBelow = false,
  alwaysOpenAbove = false,
}) {
  const selectedDate = useMemo(() => monthValueToDate(value), [value]);
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date());
  const [viewMode, setViewMode] = useState("month");
  const [openUp, setOpenUp] = useState(false);
  const containerRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setViewDate(selectedDate || new Date());
    setViewMode("month");
    setOpenUp(!!alwaysOpenAbove);
  }, [isOpen, selectedDate, alwaysOpenAbove]);

  useEffect(() => {
    if (!isOpen || alwaysOpenBelow || alwaysOpenAbove) return;
    const raf = requestAnimationFrame(() => {
      const trigger = containerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;
      const rect = trigger.getBoundingClientRect();
      const panelH = panel.getBoundingClientRect().height || panel.offsetHeight || 0;
      const gap = 8;
      const wouldOverflowBottom = rect.bottom + gap + panelH > window.innerHeight;
      setOpenUp(wouldOverflowBottom);
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen, alwaysOpenBelow, alwaysOpenAbove, viewDate, viewMode]);

  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) onClose();
    };
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, onClose]);

  const commit = (d) => {
    onChange(format(d, "yyyy-MM"));
    onClose();
  };

  const handleClear = () => {
    onChange("");
    onClose();
  };

  const viewYear = viewDate.getFullYear();
  const yearGrid = useMemo(() => buildYearGrid(viewYear), [viewYear]);
  const selectedMonthIndex = selectedDate ? selectedDate.getMonth() : null;
  const selectedYear = selectedDate ? selectedDate.getFullYear() : null;

  if (!isOpen) return null;

  const panel = (
    <div
      ref={panelRef}
      className="bg-white rounded-lg shadow-xl border border-gray-200 box-border"
      style={calendarPanelStyle}
    >
      <div className="flex justify-center mb-1.5 border-b">
        <button
          type="button"
          onClick={() => setViewMode((mode) => (mode === "month" ? "year" : "month"))}
          className="h-8 px-3 rounded bg-white text-sm font-medium text-gray-800 hover:bg-gray-100 inline-flex items-center"
        >
          <span>{viewYear}</span>
        </button>
      </div>

      {viewMode === "month" ? (
        <div className="h-[163px] flex flex-col">
          <div className="grid grid-cols-3 grid-rows-4 gap-0.5 flex-1 min-h-0">
          {MONTH_NAMES.map((name, monthIndex) => {
            const isSelected =
              selectedMonthIndex === monthIndex && selectedYear === viewYear;
            return (
              <button
                key={name}
                type="button"
                onClick={() => commit(new Date(viewYear, monthIndex, 1))}
                className={[
                  "flex items-center justify-center h-full min-h-0 text-xs font-bold rounded-full text-center px-0.5",
                  isSelected
                    ? "bg-[#BF9853] text-white"
                    : "text-gray-700 hover:bg-[#FAF6ED]",
                ].join(" ")}
              >
                {name}
              </button>
            );
          })}
          </div>
        </div>
      ) : (
        <div className="h-[163px] flex flex-col">
          <div className="grid grid-cols-3 grid-rows-4 gap-0.5 flex-1 min-h-0">
          {yearGrid.map((year) => {
            const isSelected = year === viewYear;
            return (
              <button
                key={year}
                type="button"
                onClick={() => {
                  setViewDate(new Date(year, viewDate.getMonth(), 1));
                  setViewMode("month");
                }}
                className={[
                  "flex items-center justify-center h-full min-h-0 text-xs font-bold rounded-full text-center",
                  isSelected
                    ? "bg-[#BF9853] text-white"
                    : "text-gray-700 hover:bg-[#FAF6ED]",
                ].join(" ")}
              >
                {year}
              </button>
            );
          })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end mt-1.5 pt-1.5">
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-50"
        >
          Clear
        </button>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`absolute z-[9999] ${openUp ? "bottom-full mb-2" : "top-full mt-2"} ${
        anchor === "right" ? "right-0" : "left-0"
      }`}
    >
      {panel}
    </div>
  );
}
