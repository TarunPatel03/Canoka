"use client";

import { useState } from "react";

type View = "week" | "month" | "kanban";

const weekDays = ["Mon 20", "Tue 21", "Wed 22", "Thu 23", "Fri 24", "Sat 25", "Sun 26"];
const calendarDays = Array.from({ length: 30 }, (_, index) => index + 1);

const tasks = [
  { title: "English Chapter 3 Review", meta: "Read summary and note key ideas", due: "20 Sep", status: "upcoming" },
  { title: "Math Assignment Preparation", meta: "Review examples, then attempt Q4", due: "21 Sep", status: "completed" },
  { title: "Research topic shortlist", meta: "Choose three possible directions", due: "24 Sep", status: "progress" },
];

export default function HomePage() {
  const [view, setView] = useState<View>("week");

  return (
    <main className="workspace-shell">
      <aside className="sidebar">
        <div className="brand-mark" aria-label="StudyFlow home">S<span>F</span></div>
        <div className="side-links">
          <a className="side-link active" href="#notes"><span className="side-icon">□</span> Notes</a>
          <a className="side-link" href="#calendar"><span className="side-icon">▣</span> Calendar</a>
          <div className="sub-links">
            {(["week", "month", "kanban"] as View[]).map((item) => (
              <button className={view === item ? "sub-link selected" : "sub-link"} key={item} onClick={() => setView(item)}>
                <span className="timeline-dot" /> {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button className="settings-button" aria-label="Settings">⚙</button>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="mobile-brand">StudyFlow</div>
          <div className="view-tabs" role="tablist" aria-label="Calendar view">
            {(["week", "month", "kanban"] as View[]).map((item) => (
              <button className={view === item ? "view-tab active" : "view-tab"} key={item} onClick={() => setView(item)} role="tab" aria-selected={view === item}>
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
          <button className="avatar" aria-label="Open profile">RM</button>
        </header>

        <div className="content-area">
          <div className="page-heading">
            <div>
              <p className="eyebrow">September 20 - September 26</p>
              <h1>{view === "week" ? "Week 6" : view === "month" ? "September" : "Kanban Board"}</h1>
            </div>
            <div className="heading-actions"><button className="icon-button" aria-label="Previous period">‹</button><button className="today-button">Today</button><button className="icon-button" aria-label="Next period">›</button></div>
          </div>

          {view === "week" && <WeekView />}
          {view === "month" && <MonthView />}
          {view === "kanban" && <KanbanView />}
        </div>
      </section>
    </main>
  );
}

function WeekView() {
  return <div className="calendar-frame week-frame">
    <div className="legend"><span><i className="diamond university" /> University Timetable</span><span><i className="diamond assessment" /> AI Assessment Schedule</span><span><i className="diamond personal" /> Personal Calendar</span></div>
    <div className="week-header"><span />{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
    <div className="week-grid">
      <div className="time-labels">{Array.from({ length: 10 }, (_, index) => <span key={index}>{index + 8}:00</span>)}</div>
      <div className="day-columns">{weekDays.map((day) => <div className="day-column" key={day}>{day === "Thu 23" && <div className="event event-math">Math Assignment Preparation <small>Due 21 Sep</small></div>}{day === "Thu 23" && <div className="event event-english">English Chapter 3 Review <small>Due 20 Sep</small></div>}</div>)}</div>
    </div>
  </div>;
}

function MonthView() {
  return <div className="calendar-frame month-frame">
    <div className="legend"><span><i className="diamond university" /> University Timetable</span><span><i className="diamond assessment" /> AI Assessment Schedule</span><span><i className="diamond personal" /> Personal Calendar</span></div>
    <div className="month-grid">{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => <div className="month-weekday" key={day}>{day}</div>)}{calendarDays.map((day) => <div className={day === 21 ? "month-cell highlighted" : "month-cell"} key={day}><span>{day}</span>{day === 21 && <div className="mini-event">Math Assignment Preparation</div>}{day === 23 && <div className="mini-event pale">English Chapter 3 Review</div>}</div>)}</div>
  </div>;
}

function KanbanView() {
  const columns = [{ title: "Coming Up", status: "upcoming", items: tasks.slice(0, 1) }, { title: "Not Started", status: "progress", items: tasks.slice(2, 3) }, { title: "In Progress", status: "progress", items: [] }, { title: "Completed", status: "completed", items: tasks.slice(1, 2) }];
  return <div className="kanban-board">{columns.map((column) => <section className="kanban-column" key={column.title}><h2>{column.title}</h2>{column.items.map((task) => <article className="task-card" key={task.title}><div className="task-check" /> <div><strong>{task.title}</strong><p>{task.meta}</p><small>{task.due}</small></div></article>)}</section>)}<div className="priority-label">Riya malvi</div></div>;
}