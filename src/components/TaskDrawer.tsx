import { CalendarDays, X } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteTask, moveTask, updateTask } from "../redux/reducers/workspaceSlice";
import type { Container, Task, TaskStatus, User } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { FormField } from "./FormField";
import { MAX_TASK_TITLE_LENGTH } from "../utils/taskValidation";

export function TaskDrawer({
  task,
  statuses,
  lists,
  statusesByList,
  users,
  onClose,
  onError,
  canDelete,
}: {
  task: Task;
  statuses: TaskStatus[];
  lists: Container[];
  statusesByList: Record<string, TaskStatus[]>;
  users: User[];
  onClose: () => void;
  onError: (error: unknown) => void;
  canDelete: boolean;
}) {
  const dispatch = useDispatch();
  const [draft, setDraft] = useState(task);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const save = (next: Task) => {
    setDraft(next);
    try {
      dispatch(updateTask({ ...next, updatedAt: new Date().toISOString() }));
    } catch (error) {
      onError(error);
    }
  };
  const saveTitle = () => {
    const title = draft.title.trim();
    if (!title || title.length > MAX_TASK_TITLE_LENGTH) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    save({ ...draft, title });
  };
  const moveToList = (listId: string) => {
    if (listId === draft.listId) return;
    const nextStatuses = statusesByList[listId] ?? [];
    const nextStatusId = nextStatuses[0]?.id;
    if (!nextStatusId) return;
    try {
      dispatch(moveTask({ taskId: task.id, listId, statusId: nextStatusId, position: 0 }));
      setDraft({ ...draft, listId, statusId: nextStatusId });
    } catch (error) {
      onError(error);
    }
  };
  const remove = () => {
    try {
      dispatch(deleteTask(task.id));
      onClose();
    } catch (error) {
      onError(error);
    }
  };
  const inputClass =
    "w-full rounded-xl border border-[#e6e9f0] bg-white px-3 py-2.5 text-sm text-[#566078] outline-none focus:ring-2 focus:ring-[#dfe3ff]";
  return (
    <div
      className="fixed inset-0 z-30 bg-[#172033]/20"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <aside role="dialog" aria-modal="true" aria-labelledby="task-drawer-title" className="absolute right-0 top-0 h-full w-full max-w-[460px] overflow-y-auto bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#5865e9]">
              Task detail
            </span>
            <input
              id="task-drawer-title"
              aria-label="Task title"
              value={draft.title}
              maxLength={MAX_TASK_TITLE_LENGTH}
              onChange={(event) => {
                setDraft({ ...draft, title: event.target.value });
                setTitleError(false);
              }}
              onBlur={saveTitle}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              className={`mt-2 w-full max-w-[350px] border-b bg-transparent pb-1 text-2xl font-bold leading-tight tracking-[-0.03em] text-[#20283a] outline-none transition focus:border-[#5865e9] ${titleError ? "border-[#d94d5d]" : "border-transparent"}`}
            />
            {titleError && (
              <p className="mt-1 text-xs font-medium text-[#d94d5d]">
                Title is required and must be {MAX_TASK_TITLE_LENGTH} characters or fewer.
              </p>
            )}
          </div>
          <button
            autoFocus
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl p-2 text-[#9ba3b3] hover:bg-[#f5f6fa]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#a0a8b8]">
              Description
            </label>
            <textarea
              value={draft.description}
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
              onBlur={() => save(draft)}
              placeholder="Add a description..."
              className="min-h-[120px] w-full resize-none rounded-xl border border-[#e6e9f0] p-3 text-sm leading-6 text-[#566078] outline-none focus:ring-2 focus:ring-[#dfe3ff]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="List">
              <select
                value={draft.listId}
                onChange={(event) => moveToList(event.target.value)}
                className={inputClass}
              >
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Status">
              <select
                value={draft.statusId}
                onChange={(event) =>
                  save({ ...draft, statusId: event.target.value })
                }
                className={inputClass}
              >
                <option value="">Select status</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Priority">
              <select
                value={draft.priority}
                onChange={(event) =>
                  save({
                    ...draft,
                    priority: event.target.value as Task["priority"],
                  })
                }
                className={inputClass}
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
                <option value="none">None</option>
              </select>
            </FormField>
            <FormField label="Due date">
              <div className="relative">
                <CalendarDays
                  size={15}
                  className="pointer-events-none absolute left-3 top-3 text-[#9ba3b3]"
                />
                <input
                  type="date"
                  value={draft.dueDate ?? ""}
                  onChange={(event) =>
                    save({ ...draft, dueDate: event.target.value || null })
                  }
                  className={`${inputClass} pl-9`}
                />
              </div>
            </FormField>
            <FormField label="Assignee">
              <select
                value={draft.assigneeIds[0] ?? ""}
                onChange={(event) =>
                  save({
                    ...draft,
                    assigneeIds: event.target.value ? [event.target.value] : [],
                  })
                }
                className={inputClass}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          {canDelete && <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="w-full cursor-pointer rounded-xl border border-[#ffd9dd] px-4 py-2.5 text-sm font-semibold text-[#d94d5d] transition hover:bg-[#fff4f5]"
          >
            Delete task
          </button>}
        </div>
      </aside>
      {isDeleteConfirmOpen && (
        <ConfirmDialog
          title="Delete this task?"
          description={`This will remove “${task.title}” from the board. This action cannot be undone.`}
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}
