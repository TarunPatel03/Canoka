import assignmentJson from "../test_output.json";

export type Task = (typeof assignmentJson.subtasks)[number] & {
  status?: "todo" | "done";
};

export const assignment = assignmentJson;

export const initialTasks: Task[] = assignment.subtasks.map((task) => ({
  ...task,
  status: task.completed ? "done" : "todo",
}));