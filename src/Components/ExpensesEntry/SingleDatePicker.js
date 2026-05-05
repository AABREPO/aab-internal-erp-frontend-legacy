import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

const MONTHS = Array.from({ length: 12 }, (_, i) => format(new Date(2024, i, 1), "MMM"));

function buildYearsAround(centerYear, radius = 6) {
  const start = Math.max(1970, centerYear - radius);
  const end = Math.min(2100, centerYear + radius);
  const years = [];
  for (let y = start; y <= end; y++) years.push(y);
  return years;
}

export default function SingleDatePicker({
  isOpen,
  onClose,
  value,
  onChange,
  variant = "dropdown", // "dropdown" | "modal"
  anchor = "left", // "left" | "right"
  alwaysOpenBelow = false,
}) {
  const selectedDate = useMemo(() => (value ? parseISO(value) : null), [value]);
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date());
  const [mode, setMode] = useState("day"); // "day" | "monthYear"
  const [openUp, setOpenUp] = useState(false);
  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const lastMonthWheelAt = useRef(0);
  const lastYearWheelAt = useRef(0);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (!isOpen) return;
    setViewDate(selectedDate || new Date());
    setMode("day");
    setOpenUp(false);
  }, [isOpen, selectedDate]);

  // In dropdown mode, if there's not enough space below, open upwards
  useEffect(() => {
    if (!isOpen || variant !== "dropdown" || alwaysOpenBelow) return;
    const raf = requestAnimationFrame(() => {
      const trigger = containerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;
      const rect = trigger.getBoundingClientRect();
      const panelH = panel.getBoundingClientRect().height || panel.offsetHeight || 0;
      // account for the mt-2 / mb-2 gap (~8px)
      const gap = 8;
      const wouldOverflowBottom = rect.bottom + gap + panelH > window.innerHeight;
      setOpenUp(wouldOverflowBottom);
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen, variant, mode, value, alwaysOpenBelow]);

  useEffect(() => {
    if (!isOpen || variant !== "dropdown") return;
    const onMouseDown = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) onClose();
    };
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, variant, onClose]);

  // Prevent background (table/page) scroll while using wheel inside popup.
  useEffect(() => {
    if (!isOpen) return;
    const el = panelRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isOpen]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const weeks = useMemo(() => {
    const rows = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      rows.push(week);
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarStart.getTime(), calendarEnd.getTime()]);

  const years = useMemo(() => buildYearsAround(viewDate.getFullYear(), 6), [viewDate]);

  const handleSelectDay = (d) => {
    onChange(format(d, "yyyy-MM-dd"));
    onClose();
  };

  const handleClear = () => {
    onChange("");
    onClose();
  };

  const handlePickMonth = (monthIndex) => {
    const next = new Date(viewDate);
    next.setMonth(monthIndex);
    setViewDate(next);
  };

  const handlePickYear = (year) => {
    const next = new Date(viewDate);
    next.setFullYear(year);
    setViewDate(next);
  };

  if (!isOpen) return null;

  const panel = (
    <div ref={panelRef} className="bg-white rounded-lg shadow-xl p-3 w-[320px] border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {mode === "day" ? (
          <button
            type="button"
            onClick={() => setViewDate(subMonths(viewDate, 1))}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-medium"
            aria-label="Previous month"
          >
            &lt;
          </button>
        ) : (
          <div className="w-8" />
        )}

        <button
          type="button"
          onClick={() => setMode((m) => (m === "day" ? "monthYear" : "day"))}
          className="h-8 px-3 rounded border border-gray-300 bg-gray-100 text-sm font-medium text-gray-800 hover:bg-gray-200 inline-flex items-center gap-2"
          aria-label="Choose month and year"
        >
          {format(viewDate, "MMMM yyyy")}
          <span className="text-xs text-gray-700">{mode === "monthYear" ? "▴" : "▾"}</span>
        </button>

        {mode === "day" ? (
          <button
            type="button"
            onClick={() => setViewDate(addMonths(viewDate, 1))}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-medium"
            aria-label="Next month"
          >
            &gt;
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {mode === "monthYear" ? (
        <div className="py-1">
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-4 w-[260px]">
            {/* Month wheel */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                aria-label="Previous month"
              >
                ^
              </button>
              <div
                className="w-full mt-1"
                onWheel={(e) => {
                  e.stopPropagation();
                  const now = Date.now();
                  if (now - lastMonthWheelAt.current < 120) return;
                  lastMonthWheelAt.current = now;
                  const dir = e.deltaY > 0 ? 1 : -1;
                  setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1));
                }}
              >
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const idx = (viewDate.getMonth() + offset + 12) % 12;
                  const isActive = offset === 0;
                  return (
                    <button
                      key={`${idx}-${offset}`}
                      type="button"
                      onClick={() => handlePickMonth(idx)}
                      className={[
                        "w-full text-center px-2 py-1 rounded text-sm font-bold",
                        isActive ? "bg-blue-600 text-white" : "text-gray-800 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {MONTHS[idx]}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900 mt-1"
                onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                aria-label="Next month"
              >
                v
              </button>
            </div>

            {/* Year wheel */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setViewDate((d) => new Date(d.getFullYear() - 1, d.getMonth(), 1))}
                aria-label="Previous year"
              >
                ^
              </button>
              <div
                className="w-full mt-1"
                onWheel={(e) => {
                  e.stopPropagation();
                  const now = Date.now();
                  if (now - lastYearWheelAt.current < 120) return;
                  lastYearWheelAt.current = now;
                  const dir = e.deltaY > 0 ? 1 : -1;
                  setViewDate((d) => new Date(d.getFullYear() + dir, d.getMonth(), 1));
                }}
              >
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const y = viewDate.getFullYear() + offset;
                  const isActive = offset === 0;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handlePickYear(y)}
                      className={[
                        "w-full text-center px-2 py-1 rounded text-sm font-bold",
                        isActive ? "bg-blue-600 text-white" : "text-gray-800 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900 mt-1"
                onClick={() => setViewDate((d) => new Date(d.getFullYear() + 1, d.getMonth(), 1))}
                aria-label="Next year"
              >
                v
              </button>
            </div>
            </div>
          </div>

          {/* No footer controls in month/year view (match simple native look) */}
        </div>
      ) : (
        <>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, idx) => (
              <div
                key={d}
                className={`text-center text-[11px] font-medium py-1 ${
                  idx === 0 || idx === 6 ? "text-red-500" : "text-gray-500"
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {weeks.flatMap((week) =>
              week.map((d) => {
                const inMonth = isSameMonth(d, viewDate);
                const selected = !!selectedDate && isSameDay(d, selectedDate);
                const isToday = isSameDay(d, today);
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => handleSelectDay(d)}
                    className={[
                      "w-9 h-9 flex items-center justify-center text-sm font-bold rounded",
                      inMonth ? "text-gray-900" : "text-gray-300",
                      selected ? "bg-blue-600 text-white" : "hover:bg-gray-100",
                      !selected && isToday ? "ring-2 ring-blue-500 ring-inset" : "",
                    ].join(" ")}
                    aria-label={format(d, "yyyy-MM-dd")}
                  >
                    {format(d, "d")}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}

      {mode === "day" && (
        <div className="flex items-center justify-between mt-2 pt-2">
          <div className="text-xs text-gray-500">
            Today: <span className="font-medium text-gray-700">{format(today, "dd-MM-yyyy")}</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-sm font-medium border border-gray-400 rounded hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );

  if (variant === "dropdown") {
    return (
      <div
        ref={containerRef}
        className={`absolute z-[9999] ${openUp ? "bottom-full mb-2" : "top-full mt-2"} ${anchor === "right" ? "right-0" : "left-0"}`}
      >
        {panel}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
      <div ref={containerRef}>{panel}</div>
    </div>
  );
}

