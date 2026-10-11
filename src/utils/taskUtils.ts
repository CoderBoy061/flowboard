import type { Task } from "../types/task";
import type { TaskFilters } from "../types/filters";

// Date inputs use YYYY-MM-DD, while persisted task data uses an ISO datetime.
export function toDateInputValue(value: string | null): string {
  return value?.slice(0, 10) ?? "";
}

export function toIsoDateTime(value: string | null): string | null {
  if (!value) return null;
  if (value.includes("T")) return value;
  return `${value}T00:00:00.000Z`;
}

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
