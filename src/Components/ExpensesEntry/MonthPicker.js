import React, { useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";

const MONTHS = Array.from({ length: 12 }, (_, i) => format(new Date(2024, i, 1), "MMM"));

function buildYearsAround(centerYear, radius = 6) {
  const start = Math.max(1970, centerYear - radius);
  const end = Math.min(2100, centerYear + radius);
  const years = [];
  for (let y = start; y <= end; y++) years.push(y);
  return years;
}

function monthValueToDate(value) {
  // value: "yyyy-MM"
  if (!value) return null;
  try {
    // parseISO needs a day; append -01
    return parseISO(`${value}-01`);
  } catch {
    return null;
  }
}

export default function MonthPicker({
  isOpen,
  onClose,
  value,
  onChange,
  anchor = "left", // "left" | "right"
  alwaysOpenBelow = false,
}) {
  const selectedDate = useMemo(() => monthValueToDate(value), [value]);
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date());
  const [openUp, setOpenUp] = useState(false);
  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const lastMonthWheelAt = useRef(0);
  const lastYearWheelAt = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    setViewDate(selectedDate || new Date());
    setOpenUp(false);
  }, [isOpen, selectedDate]);

  // If there's not enough space below, open upwards
  useEffect(() => {
    if (!isOpen || alwaysOpenBelow) return;
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
  }, [isOpen, alwaysOpenBelow, viewDate]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) onClose();
    };
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, onClose]);

  // Prevent background scroll while using wheel inside popup
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

  const years = useMemo(() => buildYearsAround(viewDate.getFullYear(), 6), [viewDate]);

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

  const commit = (d) => {
    onChange(format(d, "yyyy-MM"));
    onClose();
  };

  const handleClear = () => {
    onChange("");
    onClose();
  };

  if (!isOpen) return null;

  const panel = (
    <div ref={panelRef} className="bg-white rounded-lg shadow-xl p-3 w-[320px] border border-gray-200">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="h-8 px-3 rounded border border-gray-300 bg-gray-100 text-sm font-medium text-gray-800 inline-flex items-center">
          {format(viewDate, "MMMM yyyy")}
        </div>
      </div>

      <div className="py-1">
        <div className="flex justify-center">
          <div className="grid grid-cols-2 gap-4 w-[260px]">
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
                      onClick={() => commit(new Date(viewDate.getFullYear(), idx, 1))}
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
                {years.slice(0, 5).map((_, i) => {
                  const offset = i - 2;
                  const y = viewDate.getFullYear() + offset;
                  const isActive = offset === 0;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => commit(new Date(y, viewDate.getMonth(), 1))}
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

        <div className="flex items-center justify-end mt-3">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-sm font-medium border border-gray-400 rounded hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
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

