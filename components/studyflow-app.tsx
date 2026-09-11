"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { assignment, initialTasks, Task } from "../lib/assignment";

type View = "dashboard" | "calendar" | "kanban" | "notes";
type CalendarMode = "day" | "week" | "month";

const navItems: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "calendar", label: "Calendar", icon: "□" },
  { id: "kanban", label: "Kanban", icon: "▦" },
  { id: "notes", label: "Notes", icon: "≡" },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" }).format(new Date(date));
}

export default function StudyFlowApp({ initialView = "dashboard" }: { initialView?: View }) {
  const [view, setView] = useState<View>(initialView);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("studyflow-tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("studyflow-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const completed = tasks.filter((task) => task.status === "done").length;
  const progress = Math.round((completed / tasks.length) * 100);
  const navigate = (nextView: View) => {
    setView(nextView);
    window.history.replaceState(null, "", nextView === "dashboard" ? "/dashboard" : `/${nextView}`);
  };

  function toggleTask(id: string) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, status: task.status === "done" ? "todo" : "done" } : task));
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    if (!title) return;
    setTasks((current) => [...current, {
      id: `personal_${Date.now()}`,
      order: current.length + 1,
      title,
      description: "Personal task",
      estimated_minutes: 30,
      due_date: String(form.get("due_date") || assignment.due_date),
      completed: false,
      status: "todo",
    }]);
    setShowAddTask(false);
  }

  return (
    <main className="workspace-shell">
      <aside className="sidebar">
        <button className="brand-mark" onClick={() => navigate("dashboard")} aria-label="Canoka home">C<span>K</span></button>
        <div className="sidebar-label">YOUR SPACE</div>
        <nav className="side-links" aria-label="Main navigation">
          {navItems.map((item) => <button key={item.id} className={`side-link ${view === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}><span className="side-icon">{item.icon}</span>{item.label}</button>)}
        </nav>
        <div className="sidebar-assignment"><span className="status-dot" />{assignment.assignment_title}<small>Course {assignment.course_id}</small></div>
        <button className="settings-button" aria-label="Settings">⚙ Settings</button>
      </aside>

      <section className="main-panel">
        <header className="topbar"><div><span className="mobile-brand">Canoka</span><span className="topbar-context"> / {view}</span></div><button className="avatar" aria-label="Open profile">RM</button></header>
        <div className="content-area">
          <div className="page-heading"><div><p className="eyebrow">Course {assignment.course_id} · Project work</p><h1>{view === "dashboard" ? "Good morning, Riya" : view === "calendar" ? "Your calendar" : view === "kanban" ? "Task board" : "Assignment notes"}</h1></div><button className="primary-button" onClick={() => setShowAddTask(true)}>＋ Add task</button></div>

          {view === "dashboard" && <Dashboard completed={completed} progress={progress} tasks={tasks} onNavigate={navigate} onToggle={toggleTask} />}
          {view === "calendar" && <Calendar tasks={tasks} onToggle={toggleTask} />}
          {view === "kanban" && <Kanban tasks={tasks} onToggle={toggleTask} />}
          {view === "notes" && <Notes tasks={tasks} />}
        </div>
      </section>

      {showAddTask && <div className="modal-backdrop" onClick={() => setShowAddTask(false)}><form className="task-modal" onSubmit={addTask} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><h2>Add a task</h2><button type="button" onClick={() => setShowAddTask(false)} aria-label="Close">×</button></div><label>Task name<input name="title" autoFocus placeholder="e.g. Review lecture notes" /></label><label>Due date<input name="due_date" type="date" defaultValue={assignment.due_date.slice(0, 10)} /></label><button className="primary-button" type="submit">Create task</button></form></div>}
    </main>
  );
}

function Dashboard({ completed, progress, tasks, onNavigate, onToggle }: { completed: number; progress: number; tasks: Task[]; onNavigate: (view: View) => void; onToggle: (id: string) => void }) {
  return <>
    <div className="stat-grid"><article className="stat-card feature"><span className="stat-kicker">NEXT DEADLINE</span><strong>{formatDate(assignment.due_date)}</strong><p>{assignment.assignment_title}</p><div className="progress-track"><i style={{ width: `${progress}%` }} /></div><small>{completed} of {tasks.length} tasks complete · {progress}%</small></article><article className="stat-card"><span className="stat-kicker">REMAINING</span><strong>{tasks.length - completed}</strong><p>tasks to finish</p></article><article className="stat-card"><span className="stat-kicker">EST. TIME LEFT</span><strong>{Math.round(tasks.filter((task) => task.status !== "done").reduce((total, task) => total + task.estimated_minutes, 0) / 60)}h</strong><p>focused work</p></article></div>
    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">Your active work</p><h2>Assignment checklist</h2></div><button className="text-button" onClick={() => onNavigate("kanban")}>Open board →</button></div><div className="task-list">{tasks.slice(0, 5).map((task) => <TaskRow key={task.id} task={task} onToggle={onToggle} />)}</div></section>
  </>;
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  return <article className={`task-row ${task.status === "done" ? "is-done" : ""}`}><button className="check-button" onClick={() => onToggle(task.id)} aria-label={`Mark ${task.title} ${task.status === "done" ? "incomplete" : "complete"}`}>{task.status === "done" ? "✓" : ""}</button><div><strong>{task.title}</strong><p>{task.description}</p></div><time>{formatDate(task.due_date)}</time></article>;
}

function Calendar({ tasks, onToggle }: { tasks: Task[]; onToggle: (id: string) => void }) {
  const [mode, setMode] = useState<CalendarMode>("month");
  const [cursor, setCursor] = useState(() => new Date(2026, 7, 1));
  const startOfWeek = (date: Date) => { const result = new Date(date); const day = result.getDay(); result.setDate(result.getDate() - (day === 0 ? 6 : day - 1)); result.setHours(0, 0, 0, 0); return result; };
  const addDays = (date: Date, amount: number) => { const result = new Date(date); result.setDate(result.getDate() + amount); return result; };
  const sameDay = (first: Date, second: Date) => first.toDateString() === second.toDateString();
  const tasksFor = (date: Date) => tasks.filter((task) => sameDay(new Date(task.due_date), date));
  const periodLabel = mode === "day" ? cursor.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : mode === "week" ? `${formatDate(startOfWeek(cursor).toISOString())} - ${formatDate(addDays(startOfWeek(cursor), 6).toISOString())}` : cursor.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
  const moveCursor = (amount: number) => setCursor((current) => { const result = new Date(current); if (mode === "month") result.setMonth(result.getMonth() + amount); else result.setDate(result.getDate() + amount * (mode === "week" ? 7 : 1)); return result; });
  const renderTask = (task: Task) => <button key={task.id} className={`calendar-task ${task.status === "done" ? "done" : ""}`} onClick={() => onToggle(task.id)}>{task.title}</button>;
  const weekStart = startOfWeek(cursor);
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthOffset = (monthStart.getDay() + 6) % 7;
  const monthDays = Array.from({ length: 42 }, (_, index) => addDays(monthStart, index - monthOffset));
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  return <section className="calendar-card"><div className="calendar-toolbar"><div><p className="eyebrow">Task calendar</p><h2>{periodLabel}</h2></div><div className="calendar-actions"><button className="icon-button" onClick={() => moveCursor(-1)} aria-label="Previous period">‹</button><button className="today-button" onClick={() => setCursor(new Date(2026, 7, 1))}>Today</button><button className="icon-button" onClick={() => moveCursor(1)} aria-label="Next period">›</button></div></div><div className="calendar-mode" role="tablist" aria-label="Calendar view"><button className={mode === "day" ? "selected" : ""} onClick={() => setMode("day")}>Day</button><button className={mode === "week" ? "selected" : ""} onClick={() => setMode("week")}>Week</button><button className={mode === "month" ? "selected" : ""} onClick={() => setMode("month")}>Month</button></div>{mode === "day" && <div className="day-view"><strong>{cursor.toLocaleDateString("en-AU", { weekday: "long" })}</strong><span>{cursor.getDate()}</span>{tasksFor(cursor).length ? tasksFor(cursor).map(renderTask) : <p>No tasks due today.</p>}</div>}{mode === "week" && <div className="week-calendar"><div className="calendar-weekdays">{weekDays.map((day) => <span key={day.toISOString()}>{day.toLocaleDateString("en-AU", { weekday: "short", day: "numeric" })}</span>)}</div><div className="week-calendar-grid">{weekDays.map((day) => <div className="calendar-day" key={day.toISOString()}>{tasksFor(day).map(renderTask)}</div>)}</div></div>}{mode === "month" && <><div className="calendar-weekdays">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{monthDays.map((day) => <div className={`calendar-day ${day.getMonth() !== cursor.getMonth() ? "muted-day" : ""}`} key={day.toISOString()}><span>{day.getDate()}</span>{tasksFor(day).map(renderTask)}</div>)}</div></>}</section>;
}

function Kanban({ tasks, onToggle }: { tasks: Task[]; onToggle: (id: string) => void }) {
  const columns = [{ title: "To do", tasks: tasks.filter((task) => task.status !== "done") }, { title: "Completed", tasks: tasks.filter((task) => task.status === "done") }];
  return <div className="kanban-board">{columns.map((column) => <section className="kanban-column" key={column.title}><div className="column-heading"><h2>{column.title}</h2><span>{column.tasks.length}</span></div>{column.tasks.map((task) => <article className="kanban-task" key={task.id}><button className="check-button" onClick={() => onToggle(task.id)} aria-label="Toggle task">{task.status === "done" ? "✓" : ""}</button><strong>{task.title}</strong><p>{task.description}</p><small>{formatDate(task.due_date)} · {task.estimated_minutes} min</small></article>)}</section>)}</div>;
}

function Notes({ tasks }: { tasks: Task[] }) {
  return <section className="notes-layout"><article className="note-editor"><span className="note-label">PROJECT PITCH · COURSE {assignment.course_id}</span><h2>{assignment.assignment_title}</h2><p>Keep the project scope, target users, market research, and prototype outcomes together here. Each checklist item is synced from your Canvas assessment plan.</p><div className="note-callout"><strong>Deadline</strong><span>{formatDate(assignment.due_date)} at 11:59 PM</span></div></article><aside className="outline-panel"><p className="eyebrow">Outline</p>{tasks.map((task, index) => <div className="outline-item" key={task.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{task.title}</strong></div>)}</aside></section>;
}