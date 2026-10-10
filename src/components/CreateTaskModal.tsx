import { useState } from "react";
import type { CreateTaskInput, Priority, TaskStatus, User } from "../types";
import {
  MAX_TASK_TITLE_LENGTH,
  validateTaskCreation,
} from "../utils/taskValidation";
import { FormField } from "./FormField";
import { Select } from "./controls/Select";
import { TextArea } from "./controls/TextArea";
import { TextInput } from "./controls/TextInput";

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
          <FormField label="Title">
            <TextInput
              autoFocus
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="What needs to be done?"
              maxLength={MAX_TASK_TITLE_LENGTH}
              invalid={showValidation && Boolean(errors.title)}
              className="h-12 px-4 focus:ring-[#5865e9]"
            />
            {showValidation && errors.title && (
              <span className="mt-1.5 block text-xs font-medium text-[#d94d5d]">
                {errors.title}
              </span>
            )}
          </FormField>
          <FormField label="Description">
            <TextArea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Add context for your team..."
              invalid={showValidation && Boolean(errors.description)}
              className="min-h-24 focus:ring-[#5865e9]"
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
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Status">
              <Select
                value={form.statusId}
                onChange={(event) => update("statusId", event.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Priority">
              <Select
                value={form.priority}
                onChange={(event) =>
                  update("priority", event.target.value as Priority)
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
              <TextInput
                type="date"
                value={form.dueDate ?? ""}
                onChange={(event) =>
                  update("dueDate", event.target.value || null)
                }
                invalid={showValidation && Boolean(errors.dueDate)}
              />
              {showValidation && errors.dueDate && (
                <span className="mt-1.5 block text-xs font-medium text-[#d94d5d]">
                  {errors.dueDate}
                </span>
              )}
            </FormField>
            <FormField label="Assignee">
              <Select
                value={form.assigneeIds[0] ?? ""}
                onChange={(event) =>
                  update(
                    "assigneeIds",
                    event.target.value ? [event.target.value] : [],
                  )
                }
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </FormField>
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
