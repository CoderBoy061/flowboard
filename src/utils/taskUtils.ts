import type { Task } from "../types/task";
import type { TaskFilters } from "../types/filters";

export function filterTasks(
  tasks: Task[],
  query: string,
  filters: TaskFilters,
  today = new Date().toISOString().slice(0, 10),
): Task[] {
  // Applies search and the active task filters without mutating store data.
  const normalized = query.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch =
      !normalized ||
      `${task.title} ${task.description}`.toLowerCase().includes(normalized);
    const matchesStatus =
      filters.statusId === "all" || task.statusId === filters.statusId;
    const matchesPriority =
      filters.priority === "all" || task.priority === filters.priority;
    const matchesAssignee =
      filters.assigneeId === "all" ||
      task.assigneeIds.includes(filters.assigneeId);
    const matchesDue =
      filters.due === "all" ||
      (filters.due === "no_due"
        ? !task.dueDate
        : Boolean(task.dueDate && task.dueDate < today));

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesAssignee &&
      matchesDue
    );
  });
}
