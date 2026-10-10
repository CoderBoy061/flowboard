import { CalendarDays, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import type { Task, TaskStatus, User } from "../types";
import { getUserInitials } from "../utils/userUtils";
import { Select } from "./controls/Select";
const priorityStyles: Record<string, string> = {
  urgent: "text-priority-urgent-text",
  high: "text-priority-high-text",
  normal: "text-priority-normal-text",
  low: "text-priority-low-text",
  none: "text-priority-none-text",
};
const statusDotStyles: Record<TaskStatus["category"], string> = {
  todo: "bg-status-todo",
  in_progress: "bg-status-progress",
  done: "bg-status-done",
};
const priorityOrder: Record<Task["priority"], number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
  none: 4,
};
export function ListView({
  tasks,
  statuses,
  users,
  onOpenTask,
}: {
  tasks: Task[];
  statuses: TaskStatus[];
  users: User[];
  onOpenTask: (id: string) => void;
}) {
  const [sortBy, setSortBy] = useState<"position" | "dueDate" | "priority">("position");
  const sortedTasks = useMemo(() => {
    if (sortBy === "position") return tasks;
    return [...tasks].sort((a, b) => {
      if (sortBy === "priority") return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [sortBy, tasks]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e7eaf1] bg-white shadow-[0_4px_18px_rgba(35,45,75,0.03)]">
      <div className="flex items-center justify-end border-b border-[#eef0f5] px-5 py-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-[#8790a3]">
          Sort by
          <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="w-auto rounded-lg px-2 py-1.5 text-xs font-semibold">
            <option value="position">Manual order</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
          </Select>
        </label>
      </div>
      <div className="hidden grid-cols-[minmax(260px,2fr)_1fr_1fr_1fr_1fr] gap-4 border-b border-[#eef0f5] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.13em] text-[#a0a8b8] md:grid">
        <span>Task</span>
        <span>Status</span>
        <span>Assignees</span>
        <span>Priority</span>
        <span>Due date</span>
      </div>
      {tasks.length ? (
        sortedTasks.map((task) => {
          const status = statuses.find((item) => item.id === task.statusId);
          return (
            <button
              type="button"
              key={task.id}
              onClick={() => onOpenTask(task.id)}
              className="grid w-full cursor-pointer gap-2 border-b border-[#f0f1f5] px-5 py-4 text-left transition hover:bg-[#fafaff] md:grid-cols-[minmax(260px,2fr)_1fr_1fr_1fr_1fr] md:items-center md:gap-4"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[#273149]">
                  {task.title}
                </span>
                <span className="mt-1 block truncate text-xs text-[#a0a8b8]">
                  {task.description || "No description"}
                </span>
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-[#667087]">
                <i
                  className={`h-2 w-2 rounded-full ${status ? statusDotStyles[status.category] : "bg-[#a0a8b8]"}`}
                />
                {status?.name}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#7c8498]">
                <UserRound size={13} />
                {task.assigneeIds.length
                  ? task.assigneeIds
                      .map(
                        (id) =>
                          getUserInitials(users.find((user) => user.id === id)),
                      )
                      .join(", ")
                  : "Unassigned"}
              </span>
              <span
                className={`text-xs font-bold capitalize ${priorityStyles[task.priority]}`}
              >
                {task.priority}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#7c8498]">
                {task.dueDate ? (
                  <>
                    <CalendarDays size={13} />
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </>
                ) : (
                  "—"
                )}
              </span>
            </button>
          );
        })
      ) : (
        <div className="py-20 text-center text-sm text-[#9aa2b2]">
          No tasks match your search.
        </div>
      )}
    </div>
  );
}
