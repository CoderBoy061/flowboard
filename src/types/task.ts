export type Priority = "urgent" | "high" | "normal" | "low" | "none";

export type CreateTaskInput = {
  title: string;
  description: string;
  statusId: string;
  priority: Priority;
  assigneeIds: string[];
  dueDate: string | null;
};

export interface TaskStatus {
  id: string;
  name: string;
  category: "todo" | "in_progress" | "done";
  color: string;
  position: number;
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  description: string;
  statusId: string;
  priority: Priority;
  assigneeIds: string[];
  dueDate: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  parentTaskId?: string | null;
  isCompleted?: boolean;
}
