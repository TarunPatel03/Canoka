import type { CourseColor } from "@/types/calendar";

// Static class strings so Tailwind's JIT can see every variant.
interface ColorClasses {
  /** Solid-ish event block (week view). */
  block: string;
  /** Left accent bar / dot. */
  accent: string;
  /** Subtle chip (month view, kanban). */
  chip: string;
  /** Just the dot. */
  dot: string;
}

const MAP: Record<CourseColor, ColorClasses> = {
  blue: {
    block: "bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200",
    accent: "bg-blue-500",
    chip: "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
  },
  violet: {
    block: "bg-violet-100 border-violet-300 text-violet-900 hover:bg-violet-200",
    accent: "bg-violet-500",
    chip: "bg-violet-50 text-violet-700 ring-violet-600/20",
    dot: "bg-violet-500",
  },
  emerald: {
    block: "bg-emerald-100 border-emerald-300 text-emerald-900 hover:bg-emerald-200",
    accent: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  amber: {
    block: "bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200",
    accent: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },
  rose: {
    block: "bg-rose-100 border-rose-300 text-rose-900 hover:bg-rose-200",
    accent: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700 ring-rose-600/20",
    dot: "bg-rose-500",
  },
  cyan: {
    block: "bg-cyan-100 border-cyan-300 text-cyan-900 hover:bg-cyan-200",
    accent: "bg-cyan-500",
    chip: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
    dot: "bg-cyan-500",
  },
};

const NEUTRAL: ColorClasses = {
  block: "bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200",
  accent: "bg-slate-500",
  chip: "bg-slate-100 text-slate-700 ring-slate-600/20",
  dot: "bg-slate-500",
};

export function colorClasses(color?: CourseColor): ColorClasses {
  return color ? MAP[color] : NEUTRAL;
}
