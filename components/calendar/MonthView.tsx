"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { CalendarEvent, Course } from "@/types/calendar";
import { WEEK_OPTS, eventsOnDay } from "@/lib/calendar/event-utils";
import { colorClasses } from "@/lib/calendar/colors";

interface Props {
  anchor: Date;
  events: CalendarEvent[];
  courseById: Map<string, Course>;
  onSelect: (id: string) => void;
  onPickDay: (d: Date) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE = 3;

export function MonthView({
  anchor,
  events,
  courseById,
  onSelect,
  onPickDay,
}: Props) {
  const gridStart = startOfWeek(startOfMonth(anchor), WEEK_OPTS);
  const gridEnd = endOfWeek(endOfMonth(anchor), WEEK_OPTS);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-7 border-b border-slate-200">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-1.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-400"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 auto-rows-fr">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((day) => {
              const dayEvents = eventsOnDay(events, day);
              const inMonth = isSameMonth(day, anchor);
              const visible = dayEvents.slice(0, MAX_VISIBLE);
              const overflow = dayEvents.length - visible.length;

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-0 border-b border-l border-slate-100 p-1 ${
                    inMonth ? "bg-white" : "bg-slate-50/60"
                  }`}
                >
                  <button
                    onClick={() => onPickDay(day)}
                    className={`mb-1 grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                      isToday(day)
                        ? "bg-blue-600 text-white"
                        : inMonth
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {format(day, "d")}
                  </button>

                  <div className="space-y-0.5">
                    {visible.map((ev) => {
                      const c = colorClasses(
                        courseById.get(ev.courseId ?? "")?.color,
                      );
                      return (
                        <button
                          key={ev.id}
                          onClick={() => onSelect(ev.id)}
                          className={`flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] font-medium ring-1 ring-inset ${c.chip} ${
                            ev.status === "done"
                              ? "line-through opacity-60"
                              : ""
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
                          <span className="tabular-nums opacity-70">
                            {format(new Date(ev.start), "h:mm")}
                          </span>
                          <span className="truncate">{ev.title}</span>
                        </button>
                      );
                    })}
                    {overflow > 0 && (
                      <button
                        onClick={() => onPickDay(day)}
                        className="px-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
                      >
                        +{overflow} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
