import type { CreateTaskInput } from "../types";

// Matches the assignment's task-title constraint at both the UI and store layers.
export const MAX_TASK_TITLE_LENGTH = 500;

export type TaskCreationErrors = Partial<
  Record<"title" | "statusId", string>
>;

export function validateTaskCreation(
  input: Pick<CreateTaskInput, "title" | "description" | "dueDate" | "statusId">,
): TaskCreationErrors {
  const errors: TaskCreationErrors = {};
  const title = input.title.trim();

  if (!title) errors.title = "Title is required.";
  else if (title.length > MAX_TASK_TITLE_LENGTH)
    errors.title = `Title must be ${MAX_TASK_TITLE_LENGTH} characters or fewer.`;

  if (!input.statusId) errors.statusId = "Status is required.";

  return errors;
}
