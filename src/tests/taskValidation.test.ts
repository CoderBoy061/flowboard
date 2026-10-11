import { describe, expect, it } from "vitest";
import {
  MAX_TASK_TITLE_LENGTH,
  validateTaskCreation,
} from "../utils/taskValidation";

describe("task validation", () => {
  it("accepts optional description and due date", () => {
    expect(
      validateTaskCreation({
        title: "Task",
        description: "",
        dueDate: null,
        statusId: "todo",
      }),
    ).toEqual({});
  });

  it("rejects only the required title and status fields", () => {
    expect(
      validateTaskCreation({
        title: "   ",
        description: " \n ",
        dueDate: "",
        statusId: "",
      }),
    ).toEqual({
      title: "Title is required.",
      statusId: "Status is required.",
    });
  });

  it("enforces the shared title limit", () => {
    expect(
      validateTaskCreation({
        title: "A".repeat(MAX_TASK_TITLE_LENGTH + 1),
        description: "Valid description",
        dueDate: "2026-10-29",
        statusId: "todo",
      }).title,
    ).toBe(`Title must be ${MAX_TASK_TITLE_LENGTH} characters or fewer.`);
  });
});
