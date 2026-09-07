"use client";

import { useState } from "react";
import { format, isPast } from "date-fns";
import type { CalendarEvent, Course, TaskStatus } from "@/types/calendar";
import {
  STATUS_META,
  STATUS_ORDER,
  typeLabel,
} from "@/lib/calendar/event-utils";
import { colorClasses } from "@/lib/calendar/colors";

interface Props {
  events: CalendarEvent[];
  courseById: Map<string, Course>;
  onSelect: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

// The board only shows actionable work: assessments and tasks. Classes have no
// status and are left to the week/month views.
export function KanbanView({
  events,
  courseById,
  onSelect,
  onStatusChange,
}: Props) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);

  const board = events.filter(
    (ev) => ev.type === "assessment" || ev.type === "task",
  );

  return (
    <div className="cb-scroll flex h-full gap-4 overflow-x-auto bg-slate-50 p-4">
      {STATUS_ORDER.map((status) => {
        const items = board
          .filter((ev) => (ev.status ?? "todo") === status)
          .sort(
            (a, b) =>
              +new Date(a.dueDate ?? a.start) - +new Date(b.dueDate ?? b.start),
          );

        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(status);
            }}
            onDragLeave={() => setOverCol((c) => (c === status ? null : c))}
            onDrop={() => {
              if (dragId) onStatusChange(dragId, status);
              setDragId(null);
              setOverCol(null);
            }}
            className={`flex w-72 shrink-0 flex-col rounded-xl border ${
              overCol === status
                ? "border-blue-400 bg-blue-50/50"
                : "border-slate-200 bg-slate-100/60"
            }`}
          >
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-semibold text-slate-700">
                {STATUS_META[status].label}
              </span>
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                {items.length}
              </span>
            </div>

            <div className="cb-scroll flex-1 space-y-2 overflow-y-auto px-2 pb-2">
              {items.map((ev) => (
                <KanbanCard
                  key={ev.id}
                  event={ev}
                  course={
                    ev.courseId ? courseById.get(ev.courseId) : undefined
                  }
                  dragging={dragId === ev.id}
                  onDragStart={() => setDragId(ev.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverCol(null);
                  }}
                  onClick={() => onSelect(ev.id)}
                />
              ))}
              {items.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-slate-400">
                  Drop tasks here
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({
  event,
  course,
  dragging,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  event: CalendarEvent;
  course?: Course;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
}) {
  const c = colorClasses(course?.color);
  const due = event.dueDate ? new Date(event.dueDate) : null;
  const overdue = due && event.status !== "done" && isPast(due);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`cursor-grab rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${
        dragging ? "opacity-40" : ""
      }`}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${c.chip}`}
        >
          {course?.code ?? typeLabel(event)}
        </span>
        {event.type === "assessment" && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            ◆ Assessment
          </span>
        )}
        {event.parentId && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Subtask
          </span>
        )}
      </div>

      <p className="text-sm font-medium leading-snug text-slate-800">
        {event.title}
      </p>

      {due && (
        <p
          className={`mt-1.5 text-xs font-medium ${
            overdue ? "text-rose-600" : "text-slate-500"
          }`}
        >
          {overdue ? "Overdue · " : "Due "}
          {format(due, "EEE d MMM, h:mm a")}
        </p>
      )}
    </div>
  );
}
