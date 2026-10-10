import type { Priority } from "./task";

export type TaskFilters = {
  statusId: string;
  priority: Priority | "all";
  assigneeId: string;
  due: "all" | "overdue" | "no_due";
};

export const defaultTaskFilters: TaskFilters = {
  statusId: "all",
  priority: "all",
  assigneeId: "all",
  due: "all",
};
