import { CalendarDays, GripVertical } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { moveTask } from "../redux/reducers/workspaceSlice";
import type { Task, TaskStatus, User } from "../types";
import { getUserInitials } from "../utils/userUtils";

const priorityStyles: Record<string, string> = {
  urgent: "bg-priority-urgent-bg text-priority-urgent-text",
  high: "bg-priority-high-bg text-priority-high-text",
  normal: "bg-priority-normal-bg text-priority-normal-text",
  low: "bg-priority-low-bg text-priority-low-text",
  none: "bg-priority-none-bg text-priority-none-text",
};
const statusDotStyles: Record<TaskStatus["category"], string> = {
  todo: "bg-status-todo",
  in_progress: "bg-status-progress",
  done: "bg-status-done",
};
export function KanbanBoard({
  listId,
  tasks,
  statuses,
  users,
  onOpenTask,
  onError,
}: {
  listId: string;
  tasks: Task[];
  statuses: TaskStatus[];
  users: User[];
  onOpenTask: (id: string) => void;
  onError: (error: unknown) => void;
}) {
  const dispatch = useDispatch();
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverStatusId, setDragOverStatusId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const onDrop = (event: React.DragEvent, statusId: string, position: number) => {
    event.preventDefault();
    event.stopPropagation();
    const taskId = event.dataTransfer.getData("taskId");
    try {
      dispatch(moveTask({ taskId, statusId, position }));
    } catch (error) {
      onError(error);
    } finally {
      setDraggingTaskId(null);
      setDragOverStatusId(null);
      setDragOverTaskId(null);
    }
  };
  return (
    <div
      data-list-id={listId}
      className="grid min-h-[540px] gap-4 overflow-x-auto pb-3 md:grid-cols-3"
    >
      {[...statuses]
        .sort((a, b) => a.position - b.position)
        .map((status) => {
          const columnTasks = tasks
            .filter((task) => task.statusId === status.id)
            .sort((a, b) => a.position - b.position);
          return (
            <section
              key={status.id}
              onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDragOverStatusId(status.id); }}
              onDragLeave={() => setDragOverStatusId(null)}
              onDrop={(event) =>
                onDrop(
                  event,
                  status.id,
                  columnTasks.length,
                )
              }
              className={`min-w-[270px] rounded-panel border p-3 transition ${dragOverStatusId === status.id ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20" : "border-border bg-[#f1f3f8]"}`}
            >
              <div className="mb-3 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${statusDotStyles[status.category]}`}
                  />
                  <h2 className="text-sm font-bold text-[#3d465c]">
                    {status.name}
                  </h2>
                  <span className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-bold text-[#9aa2b2]">
                    {columnTasks.length}
                  </span>
                </div>
                <button className="cursor-pointer rounded-md p-1 text-[#9ba3b3] hover:bg-white">
                  +
                </button>
              </div>
              <div className="space-y-3">
                {columnTasks.map((task, index) => (
                  <article
                    key={task.id}
                    draggable
                    onDragStart={(event) => { event.dataTransfer.setData("taskId", task.id); event.dataTransfer.effectAllowed = "move"; setDraggingTaskId(task.id); }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      event.dataTransfer.dropEffect = "move";
                      setDragOverStatusId(status.id);
                      setDragOverTaskId(task.id);
                    }}
                    onDrop={(event) => {
                      const bounds = event.currentTarget.getBoundingClientRect();
                      const position =
                        event.clientY > bounds.top + bounds.height / 2
                          ? index + 1
                          : index;
                      onDrop(event, status.id, position);
                    }}
                    onDragEnd={() => { setDraggingTaskId(null); setDragOverStatusId(null); setDragOverTaskId(null); }}
                    onClick={() => onOpenTask(task.id)}
                    className={`group cursor-grab rounded-control border border-[#e5e8f0] bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-[#cfd4ff] hover:shadow-md active:cursor-grabbing ${draggingTaskId === task.id ? "scale-[1.02] opacity-50" : ""} ${dragOverTaskId === task.id && draggingTaskId !== task.id ? "border-brand-500 ring-2 ring-brand-500/20" : ""}`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-5 text-[#273149]">
                        {task.title}
                      </p>
                      <GripVertical
                        size={15}
                        className="shrink-0 text-[#c5cad5] opacity-0 transition group-hover:opacity-100"
                      />
                    </div>
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      <span
                        className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${priorityStyles[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 rounded-md bg-[#f7f8fc] px-2 py-1 text-[10px] font-semibold text-[#8790a3]">
                          <CalendarDays size={11} />{" "}
                          {new Date(task.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex -space-x-1.5">
                      {task.assigneeIds.length ? (
                        task.assigneeIds.map((id) => (
                          <span
                            key={id}
                            title={users.find((user) => user.id === id)?.name ?? id}
                            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#dfe3ff] text-[9px] font-bold text-[#5865e9]"
                          >
                            {getUserInitials(users.find((user) => user.id === id))}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-[#a1a9b8]">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              {columnTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#d9deea] py-9 text-center text-xs text-[#a3aabb]">
                  Drop tasks here
                </div>
              )}
            </section>
          );
        })}
    </div>
  );
}
