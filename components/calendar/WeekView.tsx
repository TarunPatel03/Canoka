"use client";

import { useEffect, useRef } from "react";
import {
  addDays,
  format,
  isSameDay,
  isToday,
  startOfWeek,
} from "date-fns";
import type { CalendarEvent, Course } from "@/types/calendar";
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  HOUR_ROW_PX,
  WEEK_OPTS,
  eventsOnDay,
  formatEventTime,
  gridPlacement,
  layoutDayColumn,
} from "@/lib/calendar/event-utils";
import { colorClasses } from "@/lib/calendar/colors";

interface Props {
  anchor: Date;
  events: CalendarEvent[];
  courseById: Map<string, Course>;
  onSelect: (id: string) => void;
}

const HOURS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
  (_, i) => DAY_START_HOUR + i,
);

export function WeekView({ anchor, events, courseById, onSelect }: Props) {
  const weekStart = startOfWeek(anchor, WEEK_OPTS);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to ~8am on mount / week change.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, (8 - DAY_START_HOUR) * HOUR_ROW_PX - 12);
    }
  }, [anchor]);

  const dueByDay = (day: Date) =>
    events.filter(
      (ev) =>
        ev.type === "assessment" &&
        ev.dueDate &&
        isSameDay(new Date(ev.dueDate), day),
    );

  return (
    <div className="flex h-full flex-col">
      {/* Day header */}
      <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b border-slate-200 pr-3">
        <div />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="border-l border-slate-100 px-2 py-2 text-center"
          >
            <div className="text-xs font-medium uppercase text-slate-400">
              {format(day, "EEE")}
            </div>
            <div
              className={`mx-auto mt-0.5 grid h-7 w-7 place-items-center rounded-full text-sm font-semibold ${
                isToday(day)
                  ? "bg-blue-600 text-white"
                  : "text-slate-700"
              }`}
            >
              {format(day, "d")}
            </div>
            <div className="mt-1 space-y-0.5">
              {dueByDay(day).map((ev) => {
                const c = colorClasses(courseById.get(ev.courseId ?? "")?.color);
                return (
                  <button
                    key={ev.id}
                    onClick={() => onSelect(ev.id)}
                    className={`block w-full truncate rounded px-1 py-0.5 text-left text-[11px] font-medium ring-1 ring-inset ${c.chip}`}
                    title={`Due: ${ev.title}`}
                  >
                    ⚑ {ev.title}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div ref={scrollRef} className="cb-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] pr-3">
          {/* Hour labels */}
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                style={{ height: HOUR_ROW_PX }}
                className="relative -top-2 pr-2 text-right text-[11px] tabular-nums text-slate-400"
              >
                {h === 0
                  ? ""
                  : format(new Date().setHours(h, 0), "h a").toLowerCase()}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const laid = layoutDayColumn(eventsOnDay(events, day));
            return (
              <div
                key={day.toISOString()}
                className="relative border-l border-slate-100"
                style={{ height: HOURS.length * HOUR_ROW_PX }}
              >
                {HOURS.map((h) => (
                  <div
                    key={h}
                    style={{ height: HOUR_ROW_PX }}
                    className="border-b border-slate-100"
                  />
                ))}

                {isToday(day) && <NowLine />}

                {laid.map(({ event, lane, lanes }) => {
                  const { top, height } = gridPlacement(event, day);
                  const c = colorClasses(
                    courseById.get(event.courseId ?? "")?.color,
                  );
                  const widthPct = 100 / lanes;
                  return (
                    <button
                      key={event.id}
                      onClick={() => onSelect(event.id)}
                      style={{
                        top,
                        height,
                        left: `calc(${lane * widthPct}% + 2px)`,
                        width: `calc(${widthPct}% - 4px)`,
                      }}
                      className={`absolute overflow-hidden rounded-md border px-1.5 py-1 text-left text-[11px] leading-tight shadow-sm transition-colors ${c.block} ${
                        event.type === "task" ? "border-dashed" : ""
                      } ${event.status === "done" ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-center gap-1 font-semibold">
                        {event.type === "assessment" && <span>◆</span>}
                        <span
                          className={`truncate ${
                            event.status === "done" ? "line-through" : ""
                          }`}
                        >
                          {event.title}
                        </span>
                      </div>
                      <div className="truncate opacity-80">
                        {formatEventTime(event)}
                        {event.location ? ` · ${event.location}` : ""}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NowLine() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const top = ((minutes - DAY_START_HOUR * 60) / 60) * HOUR_ROW_PX;
  if (top < 0 || top > (DAY_END_HOUR - DAY_START_HOUR + 1) * HOUR_ROW_PX)
    return null;
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
      style={{ top }}
    >
      <div className="h-2 w-2 -translate-x-1 rounded-full bg-red-500" />
      <div className="h-px flex-1 bg-red-500" />
    </div>
  );
}
