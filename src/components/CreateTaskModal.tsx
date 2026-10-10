import { useState } from "react";
import type { CreateTaskInput, Priority, TaskStatus, User } from "../types";
import {
  MAX_TASK_TITLE_LENGTH,
  validateTaskCreation,
} from "../utils/taskValidation";

export function CreateTaskModal({
  onClose,
  onCreate,
  statuses,
  users,
  initialStatusId,
}: {
  onClose: () => void;
  onCreate: (input: CreateTaskInput) => void;
  statuses: TaskStatus[];
  users: User[];
  initialStatusId?: string;
}) {
  const [form, setForm] = useState<CreateTaskInput>({
    title: "",
    description: "",
    statusId: initialStatusId ?? statuses[0]?.id ?? "",
    priority: "normal",
    assigneeIds: [],
    dueDate: null,
  });
  const [showValidation, setShowValidation] = useState(false);
  const errors = validateTaskCreation(form);
  const update = <K extends keyof CreateTaskInput>(
    key: K,
    value: CreateTaskInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const inputClass =
    "w-full rounded-xl border border-[#e5e8f0] bg-white px-3 py-2.5 text-sm text-[#566078] outline-none focus:ring-2 focus:ring-[#dfe3ff]";
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#172033]/25 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setShowValidation(true);
          if (Object.keys(errors).length === 0) {
            onCreate({
              ...form,
              title: form.title.trim(),
              description: form.description.trim(),
              dueDate: form.dueDate?.trim() || null,
            });
          }
        }}
        className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7c8498]">
              New work item
            </p>
            <h2 className="mt-1 text-xl font-bold">Create a task</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-2xl leading-none text-[#9ba3b3]"
          >
            ×
          </button>
        </div>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-[#a0a8b8]">
              Title
            </span>
            <input
              autoFocus
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="What needs to be done?"
              maxLength={MAX_TASK_TITLE_LENGTH}
              aria-invalid={showValidation && Boolean(errors.title)}
              className={`h-12 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-[#5865e9] ${showValidation && errors.title ? "border-[#d94d5d] focus:ring-[#ffd9dd]" : "border-[#e5e8f0]"}`}
            />
            {showValidation && errors.title && (
              <span className="mt-1.5 block text-xs font-medium text-[#d94d5d]">
                {errors.title}
              </span>
            )}
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-[#a0a8b8]">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Add context for your team..."
              aria-invalid={showValidation && Boolean(errors.description)}
              className={`min-h-24 w-full resize-none rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[#5865e9] ${showValidation && errors.description ? "border-[#d94d5d] focus:ring-[#ffd9dd]" : "border-[#e5e8f0]"}`}
            />
            <div className="mt-1.5 flex items-start justify-between gap-3">
              <span className={`text-xs ${showValidation && errors.description ? "font-medium text-[#d94d5d]" : "text-[#98a0b1]"}`}>
                {showValidation && errors.description
                  ? errors.description
                  : "Description is required"}
              </span>
              <span className="shrink-0 text-xs text-[#98a0b1]">
                {form.description.trim().length} characters
              </span>
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-[#a0a8b8]">
                Status
              </span>
              <select
                value={form.statusId}
                onChange={(event) => update("statusId", event.target.value)}
                className={inputClass}
              >
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-[#a0a8b8]">
                Priority
              </span>
              <select
                value={form.priority}
                onChange={(event) =>
                  update("priority", event.target.value as Priority)
                }
                className={inputClass}
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
                <option value="none">None</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-[#a0a8b8]">
                Due date
              </span>
              <input
                type="date"
                value={form.dueDate ?? ""}
                onChange={(event) =>
                  update("dueDate", event.target.value || null)
                }
                aria-invalid={showValidation && Boolean(errors.dueDate)}
                className={`${inputClass} ${showValidation && errors.dueDate ? "border-[#d94d5d] focus:ring-[#ffd9dd]" : ""}`}
              />
              {showValidation && errors.dueDate && (
                <span className="mt-1.5 block text-xs font-medium text-[#d94d5d]">
                  {errors.dueDate}
                </span>
              )}
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-[#a0a8b8]">
                Assignee
              </span>
              <select
                value={form.assigneeIds[0] ?? ""}
                onChange={(event) =>
                  update(
                    "assigneeIds",
                    event.target.value ? [event.target.value] : [],
                  )
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
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-[#7c8498]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-xl bg-[#5865e9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4855d8]"
          >
            Create task
          </button>
        </div>
      </form>
    </div>
  );
}
