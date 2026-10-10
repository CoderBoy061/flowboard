import type { CreateTaskInput } from "../types";

export const MAX_TASK_TITLE_LENGTH = 150;

export type TaskCreationErrors = Partial<
  Record<"title" | "description" | "dueDate" | "statusId", string>
>;

export function validateTaskCreation(
  input: Pick<CreateTaskInput, "title" | "description" | "dueDate" | "statusId">,
): TaskCreationErrors {
  const errors: TaskCreationErrors = {};
  const title = input.title.trim();
  const description = input.description.trim();

  if (!title) errors.title = "Title is required.";
  else if (title.length > MAX_TASK_TITLE_LENGTH)
    errors.title = `Title must be ${MAX_TASK_TITLE_LENGTH} characters or fewer.`;

  if (!description) errors.description = "Description is required.";

  if (!input.dueDate?.trim()) errors.dueDate = "Due date is required.";
  if (!input.statusId) errors.statusId = "Status is required.";

  return errors;
}
