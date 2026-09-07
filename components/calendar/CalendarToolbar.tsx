"use client";

import { useState } from "react";
import type {
  CalendarEventType,
  CalendarViewMode,
  Course,
} from "@/types/calendar";
import { colorClasses } from "@/lib/calendar/colors";

interface Props {
  view: CalendarViewMode;
  onViewChange: (v: CalendarViewMode) => void;
  title: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  showNav: boolean;
  courses: Course[];
  hiddenCourses: Set<string>;
  onToggleCourse: (id: string) => void;
  types: CalendarEventType[];
  hiddenTypes: Set<CalendarEventType>;
  onToggleType: (t: CalendarEventType) => void;
}

const VIEWS: { key: CalendarViewMode; label: string }[] = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "kanban", label: "Kanban" },
];

const TYPE_LABEL: Record<CalendarEventType, string> = {
  class: "Classes",
  assessment: "Assessments",
  task: "Tasks",
};

export function CalendarToolbar(props: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilters = props.hiddenCourses.size + props.hiddenTypes.size;

  return (
    <header className="relative z-20 flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
      <h1 className="text-lg font-semibold text-slate-900">Calendar</h1>

      {props.showNav && (
        <div className="flex items-center gap-1">
          <button
            onClick={props.onPrev}
            aria-label="Previous"
            className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
          >
            ‹
          </button>
          <button
            onClick={props.onToday}
            className="rounded-md border border-slate-200 px-2.5 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Today
          </button>
          <button
            onClick={props.onNext}
            aria-label="Next"
            className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
          >
            ›
          </button>
        </div>
      )}

      <span className="text-sm font-medium text-slate-600">{props.title}</span>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Filters
            {activeFilters > 0 && (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
                {activeFilters}
              </span>
            )}
          </button>

          {filtersOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setFiltersOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-60 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Type
                </p>
                <ul className="mb-3 space-y-1">
                  {props.types.map((t) => (
                    <li key={t}>
                      <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={!props.hiddenTypes.has(t)}
                          onChange={() => props.onToggleType(t)}
                          className="rounded border-slate-300"
                        />
                        {TYPE_LABEL[t]}
                      </label>
                    </li>
                  ))}
                </ul>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Course
                </p>
                <ul className="space-y-1">
                  {props.courses.map((c) => (
                    <li key={c.id}>
                      <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={!props.hiddenCourses.has(c.id)}
                          onChange={() => props.onToggleCourse(c.id)}
                          className="rounded border-slate-300"
                        />
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${colorClasses(c.color).dot}`}
                        />
                        <span className="truncate">{c.code}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="flex rounded-md border border-slate-200 p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => props.onViewChange(v.key)}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                props.view === v.key
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
