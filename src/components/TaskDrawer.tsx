import { CalendarDays, Plus, X } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteTask, moveTask, updateTask } from "../redux/reducers/workspaceSlice";
import type { Container, Task, TaskStatus, User } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { FormField } from "./FormField";
import { MultiSelect } from "./controls/MultiSelect";
import { Select } from "./controls/Select";
import { TextArea } from "./controls/TextArea";
import { TextInput } from "./controls/TextInput";
import { MAX_TASK_TITLE_LENGTH } from "../utils/taskValidation";

export function TaskDrawer({
  task,
  statuses,
  lists,
  statusesByList,
  users,
  subtasks,
  onClose,
  onError,
  onCreateSubtask,
  onToggleSubtask,
  canDelete,
}: {
  task: Task;
  statuses: TaskStatus[];
  lists: Container[];
  statusesByList: Record<string, TaskStatus[]>;
  users: User[];
  subtasks: Task[];
  onClose: () => void;
  onError: (error: unknown) => void;
  onCreateSubtask: (parentTaskId: string, title: string) => void;
  onToggleSubtask: (task: Task) => void;
  canDelete: boolean;
}) {
  const dispatch = useDispatch();
  const [draft, setDraft] = useState(task);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
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
            <TextInput
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
              invalid={titleError}
              className={`mt-2 max-w-[350px] border-b bg-transparent px-0 pb-1 text-2xl font-bold leading-tight tracking-[-0.03em] text-[#20283a] focus:border-[#5865e9] ${titleError ? "border-[#d94d5d]" : "border-transparent"}`}
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
            <TextArea
              value={draft.description}
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
              onBlur={() => save(draft)}
              placeholder="Add a description..."
              className="min-h-[120px]"
            />
          </div>
          <section aria-labelledby="subtasks-heading" className="rounded-xl border border-[#eef0f5] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 id="subtasks-heading" className="text-sm font-bold text-[#273149]">
                Subtasks
              </h3>
              <span className="rounded-md bg-[#f5f6fa] px-1.5 py-0.5 text-xs font-semibold text-[#8790a3]">
                {subtasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <label key={subtask.id} className="flex cursor-pointer items-center gap-2 text-sm text-[#566078]">
                  <input
                    type="checkbox"
                    checked={Boolean(subtask.isCompleted)}
                    onChange={() => onToggleSubtask(subtask)}
                    className="h-4 w-4 cursor-pointer accent-[#5865e9]"
                  />
                  <span className={subtask.isCompleted ? "text-[#98a0b1] line-through" : ""}>
                    {subtask.title}
                  </span>
                </label>
              ))}
              {!subtasks.length && (
                <p className="text-xs text-[#98a0b1]">No subtasks yet.</p>
              )}
            </div>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!newSubtaskTitle.trim()) return;
                onCreateSubtask(task.id, newSubtaskTitle);
                setNewSubtaskTitle("");
              }}
            >
              <TextInput
                value={newSubtaskTitle}
                onChange={(event) => setNewSubtaskTitle(event.target.value)}
                placeholder="Add a subtask"
                aria-label="New subtask title"
                className="min-w-0"
              />
              <button
                type="submit"
                aria-label="Add subtask"
                disabled={!newSubtaskTitle.trim()}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#5865e9] text-white transition hover:bg-[#4855d8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={17} />
              </button>
            </form>
          </section>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="List">
              <Select
                value={draft.listId}
                onChange={(event) => moveToList(event.target.value)}
              >
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Status">
              <Select
                value={draft.statusId}
                onChange={(event) =>
                  save({ ...draft, statusId: event.target.value })
                }
              >
                <option value="">Select status</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Priority">
              <Select
                value={draft.priority}
                onChange={(event) =>
                  save({
                    ...draft,
                    priority: event.target.value as Task["priority"],
                  })
                }
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
                <option value="none">None</option>
              </Select>
            </FormField>
            <FormField label="Due date">
              <div className="relative">
                <CalendarDays
                  size={15}
                  className="pointer-events-none absolute left-3 top-3 text-[#9ba3b3]"
                />
                <TextInput
                  type="date"
                  value={draft.dueDate ?? ""}
                  onChange={(event) =>
                    save({ ...draft, dueDate: event.target.value || null })
                  }
                  className="pl-9"
                />
              </div>
            </FormField>
            <FormField label="Assignees">
              <MultiSelect
                value={draft.assigneeIds}
                onChange={(assigneeIds) => save({ ...draft, assigneeIds })}
                options={users.map((user) => ({ value: user.id, label: user.name }))}
                aria-label="Assignees"
                placeholder="Unassigned"
              />
              <span className="mt-1.5 block text-xs text-[#98a0b1]">
                Select one or more members. Leave empty for unassigned.
              </span>
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
