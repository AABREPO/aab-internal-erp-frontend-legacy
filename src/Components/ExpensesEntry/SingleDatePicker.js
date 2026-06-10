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

/** Main calendar popup — edit these values to resize SingleDatePicker popups. */
export const CALENDAR_PANEL_WIDTH_PX = 252;
export const CALENDAR_PANEL_PADDING_PX = 6;
export const CALENDAR_DAY_CELL_SIZE_PX = 26;
export const CALENDAR_NAV_BUTTON_SIZE_PX = 26;

export const calendarPanelStyle = {
  width: `${CALENDAR_PANEL_WIDTH_PX}px`,
  minWidth: `${CALENDAR_PANEL_WIDTH_PX}px`,
  padding: `${CALENDAR_PANEL_PADDING_PX}px`,
  boxSizing: "border-box",
};

export const calendarDayCellStyle = {
  width: `${CALENDAR_DAY_CELL_SIZE_PX}px`,
  height: `${CALENDAR_DAY_CELL_SIZE_PX}px`,
};

const MONTHS = Array.from({ length: 12 }, (_, i) => format(new Date(2024, i, 1), "MMM"));

const buildYearGrid = (centerYear) => {
  const start = centerYear - 4;
  return Array.from({ length: 12 }, (_, i) => start + i);
};

export default function SingleDatePicker({
  isOpen,
  onClose,
  value,
  onChange,
  variant = "dropdown", // "dropdown" | "modal"
  anchor = "left", // "left" | "right"
  alwaysOpenBelow = false,
  alwaysOpenAbove = false,
}) {
  const selectedDate = useMemo(() => (value ? parseISO(value) : null), [value]);
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date());
  const [mode, setMode] = useState("day"); // "day" | "month" | "year"
  const [openUp, setOpenUp] = useState(false);
  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (!isOpen) return;
    setViewDate(selectedDate || new Date());
    setMode("day");
    setOpenUp(!!alwaysOpenAbove);
  }, [isOpen, selectedDate, alwaysOpenAbove]);

  useEffect(() => {
    if (!isOpen || variant !== "dropdown" || alwaysOpenBelow || alwaysOpenAbove) return;
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
  }, [isOpen, variant, mode, value, alwaysOpenBelow, alwaysOpenAbove]);

  useEffect(() => {
    if (!isOpen || variant !== "dropdown") return;
    const onMouseDown = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) onClose();
    };
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, variant, onClose]);

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

  const years = useMemo(() => buildYearGrid(viewDate.getFullYear()), [viewDate]);

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
    setMode("day");
  };

  const handlePickYear = (year) => {
    const next = new Date(viewDate);
    next.setFullYear(year);
    setViewDate(next);
    setMode("day");
  };

  const navButtonStyle = {
    width: CALENDAR_NAV_BUTTON_SIZE_PX,
    height: CALENDAR_NAV_BUTTON_SIZE_PX,
  };

  if (!isOpen) return null;

  const panel = (
    <div
      ref={panelRef}
      className="bg-white rounded-lg shadow-xl border border-gray-200 box-border"
      style={calendarPanelStyle}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        {mode === "day" ? (
          <button
            type="button"
            onClick={() => setViewDate(subMonths(viewDate, 1))}
            className="flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-bold"
            style={navButtonStyle}
            aria-label="Previous month"
          >
            &lt;
          </button>
        ) : mode === "month" ? (
          <button
            type="button"
            onClick={() => setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1))}
            className="flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-bold"
            style={navButtonStyle}
            aria-label="Previous year"
          >
            &lt;
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1))}
            className="flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-bold"
            style={navButtonStyle}
            aria-label="Previous years"
          >
            &lt;
          </button>
        )}

        <div className="flex items-center justify-center min-w-0">
          {(mode === "day" || mode === "month") && (
            <button
              type="button"
              onClick={() => setMode((m) => (m === "month" ? "day" : "month"))}
              className="h-8 px-1 text-sm font-bold text-gray-800 hover:bg-gray-100 rounded inline-flex items-center"
              style={{ height: CALENDAR_NAV_BUTTON_SIZE_PX }}
              aria-label="Choose month"
            >
              {mode === "month" ? "Month" : format(viewDate, "MMMM")}
            </button>
          )}
          {(mode === "day" || mode === "year") && (
            <button
              type="button"
              onClick={() => setMode((m) => (m === "year" ? "day" : "year"))}
              className="h-8 px-1 text-sm font-bold text-gray-800 hover:bg-gray-100 rounded inline-flex items-center"
              style={{ height: CALENDAR_NAV_BUTTON_SIZE_PX }}
              aria-label="Choose year"
            >
              {mode === "year" ? "Year" : format(viewDate, "yyyy")}
            </button>
          )}
        </div>

        {mode === "day" ? (
          <button
            type="button"
            onClick={() => setViewDate(addMonths(viewDate, 1))}
            className="flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-bold"
            style={navButtonStyle}
            aria-label="Next month"
          >
            &gt;
          </button>
        ) : mode === "month" ? (
          <button
            type="button"
            onClick={() => setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1))}
            className="flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-bold"
            style={navButtonStyle}
            aria-label="Next year"
          >
            &gt;
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1))}
            className="flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg font-bold"
            style={navButtonStyle}
            aria-label="Next years"
          >
            &gt;
          </button>
        )}
      </div>

      {mode === "month" ? (
        <div className="h-[163px] flex flex-col">
          <div className="grid grid-cols-7 gap-0.5 mb-1 invisible shrink-0" aria-hidden="true">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[11px] font-bold py-0.5">
                &nbsp;
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 grid-rows-4 gap-0.5 flex-1 min-h-0">
            {MONTHS.map((label, idx) => {
              const isActive = viewDate.getMonth() === idx;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handlePickMonth(idx)}
                  className={[
                    "flex items-center justify-center h-full min-h-0 text-xs font-bold rounded-full text-center",
                    isActive ? "bg-[rgba(191,152,83,0.2)] text-gray-900" : "text-gray-800 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : mode === "year" ? (
        <div className="h-[163px] flex flex-col">
          <div className="grid grid-cols-7 gap-0.5 mb-1 invisible shrink-0" aria-hidden="true">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[11px] font-bold py-0.5">
                &nbsp;
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 grid-rows-4 gap-0.5 flex-1 min-h-0">
            {years.map((y) => {
              const isActive = viewDate.getFullYear() === y;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => handlePickYear(y)}
                  className={[
                    "flex items-center justify-center h-full min-h-0 text-xs font-bold rounded-full text-center",
                    isActive ? "bg-[rgba(191,152,83,0.2)] text-gray-900" : "text-gray-800 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {y}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, idx) => (
              <div
                key={d}
                className={`text-center text-[11px] font-bold py-0.5 ${
                  idx === 0 || idx === 6 ? "text-red-500" : "text-gray-500"
                }`}
              >
                {d}
              </div>
            ))}
          </div>
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
                      "flex items-center justify-center text-xs font-bold rounded",
                      inMonth ? "text-gray-900" : "text-gray-300",
                      selected ? "bg-[#BF9853] text-white" : "",
                      !selected && inMonth ? "hover:bg-gray-100" : "",
                      !selected && isToday ? "ring-2 ring-[#BF9853] ring-inset" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={calendarDayCellStyle}
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

      <div
        className={`flex items-center justify-end gap-1 mt-1.5 pt-1.5${
          mode === "day" ? "" : " invisible pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1 text-sm font-bold rounded hover:bg-gray-50"
        >
          Clear
        </button>
      </div>
    </div>
  );

  if (variant === "dropdown") {
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
      <div ref={containerRef}>{panel}</div>
    </div>
  );
}
