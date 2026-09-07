"use client";

import { format } from "date-fns";
import type { CalendarEvent, Course, TaskStatus } from "@/types/calendar";
import {
  STATUS_META,
  STATUS_ORDER,
  formatEventTime,
  rescheduleEvent,
  typeLabel,
} from "@/lib/calendar/event-utils";
import { colorClasses } from "@/lib/calendar/colors";

interface Props {
  event: CalendarEvent | null;
  course?: Course;
  parent: CalendarEvent | null;
  subtasks: CalendarEvent[];
  onClose: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onReschedule: (id: string, start: string, end: string) => void;
  onSelect: (id: string) => void;
}

// Classes are timetabled and assessment due dates come from Canvas, so only
// tasks (including AI-generated subtasks) can be moved by the student.
function canEditSchedule(ev: CalendarEvent): boolean {
  return ev.type === "task";
}

export function EventDetail({
  event,
  course,
  parent,
  subtasks,
  onClose,
  onStatusChange,
  onReschedule,
  onSelect,
}: Props) {
  const open = event !== null;
  const c = colorClasses(course?.color);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-900/20 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {event && (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
              <div>
                <span
                  className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${c.chip}`}
                >
                  {course ? `${course.code} · ` : ""}
                  {typeLabel(event)}
                </span>
                <h2 className="mt-2 text-lg font-semibold leading-snug text-slate-900">
                  {event.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="cb-scroll flex-1 space-y-4 overflow-y-auto p-4 text-sm">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  When
                </p>
                {canEditSchedule(event) ? (
                  <ScheduleEditor event={event} onReschedule={onReschedule} />
                ) : (
                  <p className="text-slate-700">
                    {format(new Date(event.start), "EEEE d MMMM")}
                    <br />
                    {formatEventTime(event)}
                  </p>
                )}
              </div>

              {course && <Row label="Course">{course.name}</Row>}
              {event.location && <Row label="Location">{event.location}</Row>}

              {event.dueDate && (
                <Row label="Due">
                  {format(new Date(event.dueDate), "EEEE d MMMM, h:mm a")}
                </Row>
              )}

              {event.notes && <Row label="Notes">{event.notes}</Row>}

              {parent && (
                <Row label="Part of">
                  <button
                    onClick={() => onSelect(parent.id)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {parent.title}
                  </button>
                </Row>
              )}

              {event.status && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </p>
                  <div className="flex gap-1.5">
                    {STATUS_ORDER.map((s) => (
                      <button
                        key={s}
                        onClick={() => onStatusChange(event.id, s)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors ${
                          event.status === s
                            ? "bg-slate-900 text-white ring-slate-900"
                            : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {STATUS_META[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {subtasks.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Subtasks ({subtasks.filter((t) => t.status === "done").length}/
                    {subtasks.length})
                  </p>
                  <p className="mb-2 text-xs text-slate-400">
                    Adjust any subtask's date or time to fit your schedule.
                  </p>
                  <ul className="space-y-1.5">
                    {subtasks.map((t) => (
                      <li
                        key={t.id}
                        className="rounded-md bg-slate-50 px-2 py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={t.status === "done"}
                            onChange={() =>
                              onStatusChange(
                                t.id,
                                t.status === "done" ? "todo" : "done",
                              )
                            }
                            className="rounded border-slate-300"
                          />
                          <button
                            onClick={() => onSelect(t.id)}
                            className={`flex-1 text-left ${
                              t.status === "done"
                                ? "text-slate-400 line-through"
                                : "text-slate-700 hover:text-blue-600"
                            }`}
                          >
                            {t.title}
                          </button>
                        </div>
                        <div className="mt-1.5 pl-6">
                          <ScheduleEditor
                            event={t}
                            onReschedule={onReschedule}
                            compact
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function ScheduleEditor({
  event,
  onReschedule,
  compact = false,
}: {
  event: CalendarEvent;
  onReschedule: (id: string, start: string, end: string) => void;
  compact?: boolean;
}) {
  const start = new Date(event.start);
  const end = new Date(event.end);

  const commit = (fields: {
    date?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    const next = rescheduleEvent(event, fields);
    onReschedule(event.id, next.start, next.end);
  };

  const inputCls =
    "rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className={compact ? "flex flex-wrap items-center gap-1.5 text-xs" : "space-y-2"}>
      <input
        type="date"
        value={format(start, "yyyy-MM-dd")}
        onChange={(e) => commit({ date: e.target.value })}
        className={`${inputCls} ${compact ? "" : "w-full"}`}
      />
      <div className="flex items-center gap-1.5">
        <input
          type="time"
          value={format(start, "HH:mm")}
          onChange={(e) => commit({ startTime: e.target.value })}
          className={inputCls}
        />
        <span className="text-slate-400">–</span>
        <input
          type="time"
          value={format(end, "HH:mm")}
          onChange={(e) => commit({ endTime: e.target.value })}
          className={inputCls}
        />
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-slate-700">{children}</p>
    </div>
  );
}
