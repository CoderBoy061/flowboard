import type { Middleware } from "@reduxjs/toolkit";
import {
  assertResourceAccess,
  canAccessResource,
} from "../services/permissionService";
import type { WorkspaceState } from "./reducers/workspaceSlice";
import { createStoreError } from "../services/storeError";
import {
  MAX_TASK_TITLE_LENGTH,
  validateTaskCreation,
} from "../utils/taskValidation";

const protectedActions = new Set([
  "workspace/addTask",
  "workspace/updateTask",
  "workspace/deleteTask",
  "workspace/moveTask",
  "workspace/archiveTask",
  "workspace/updateContainer",
  "workspace/archiveContainer",
  "workspace/restoreTask",
  "workspace/restoreContainer",
  "workspace/bulkUpdateTasks",
  "workspace/rollbackTasks",
  "workspace/reorderContainers",
  "workspace/addContainer",
  "workspace/addStatuses",
  "workspace/addWorkspace",
  "workspace/renameWorkspace",
  "workspace/deleteWorkspace",
]);

export const permissionMiddleware: Middleware =
  ({ getState }) =>
  (next) =>
  (action) => {
    if (typeof action !== "object" || action === null || !("type" in action))
      return next(action);
    const typedAction = action as {
      type: string;
      payload?:
        | string
        | {
            id?: string;
            taskId?: string;
            listId?: string;
            resourceId?: string;
            parentId?: string | null;
            orderedIds?: string[];
            taskIds?: string[];
            name?: string;
            type?: "space" | "folder" | "list";
            workspaceId?: string;
          };
    };
    if (!protectedActions.has(typedAction.type)) return next(action);

    const state = (getState() as { workspace: WorkspaceState }).workspace;
    const currentUser = state.users.find(
      (user) => user.id === state.currentUserId,
    );
    const payload =
      typeof typedAction.payload === "string"
        ? { id: typedAction.payload }
        : typedAction.payload;
    if (
      (typedAction.type === "workspace/addWorkspace" ||
        typedAction.type === "workspace/renameWorkspace" ||
        typedAction.type === "workspace/deleteWorkspace" ||
        typedAction.type === "workspace/addStatuses") &&
      currentUser?.role !== "admin"
    ) {
      throw createStoreError(
        "FORBIDDEN",
        "Only workspace admins can manage workspace settings.",
      );
    }
    if (
      typedAction.type === "workspace/addWorkspace" ||
      typedAction.type === "workspace/renameWorkspace" ||
      typedAction.type === "workspace/deleteWorkspace"
    ) {
      return next(action);
    }
    if (
      (typedAction.type === "workspace/deleteTask" ||
        typedAction.type === "workspace/archiveTask" ||
        typedAction.type === "workspace/archiveContainer" ||
        typedAction.type === "workspace/restoreTask" ||
        typedAction.type === "workspace/restoreContainer") &&
      currentUser?.role !== "admin"
    ) {
      throw createStoreError(
        "FORBIDDEN",
        "Only workspace admins can delete resources.",
      );
    }
    if (
      (typedAction.type === "workspace/addContainer" ||
        typedAction.type === "workspace/updateContainer" ||
        typedAction.type === "workspace/reorderContainers") &&
      currentUser?.role !== "admin"
    ) {
      throw createStoreError(
        "FORBIDDEN",
        "Only workspace admins can manage containers.",
      );
    }
    if (typedAction.type === "workspace/rollbackTasks") return next(action);
    if (typedAction.type === "workspace/bulkUpdateTasks") {
      const taskIds = payload?.taskIds ?? [];
      const selectedTasks = state.tasks.filter((task) => taskIds.includes(task.id));
      if (!taskIds.length || selectedTasks.length !== taskIds.length) {
        throw createStoreError("NOT_FOUND", "One or more selected tasks could not be found.");
      }
      if (
        selectedTasks.some(
          (task) => !canAccessResource(task.listId, state.currentUserId, state),
        )
      ) {
        throw createStoreError(
          "FORBIDDEN",
          "You do not have permission to update one or more selected tasks.",
        );
      }
      return next(action);
    }
    if (typedAction.type === "workspace/addContainer") {
      const newContainer = payload;
      const parent = newContainer?.parentId
        ? state.containers.find((item) => item.id === newContainer.parentId)
        : undefined;
      const expectedParentType =
        newContainer?.type === "folder"
          ? "space"
          : newContainer?.type === "list"
            ? "folder"
            : null;
      if (!newContainer?.name?.trim() || newContainer.name.length > 100) {
        throw createStoreError(
          "VALIDATION",
          "Container name is required and must be 100 characters or fewer.",
        );
      }
      if (
        !newContainer.type ||
        (expectedParentType && parent?.type !== expectedParentType) ||
        (!expectedParentType && newContainer.parentId) ||
        (parent && (parent.workspaceId ?? "workspace-1") !== state.currentWorkspaceId)
      ) {
        throw createStoreError(
          "VALIDATION",
          "Containers must follow the workspace, space, folder, list hierarchy.",
        );
      }
      return next(action);
    }
    if (typedAction.type === "workspace/updateContainer") {
      const updatedContainer = payload;
      const parent = updatedContainer?.parentId
        ? state.containers.find((item) => item.id === updatedContainer.parentId)
        : undefined;
      const expectedParentType =
        updatedContainer?.type === "folder"
          ? "space"
          : updatedContainer?.type === "list"
            ? "folder"
            : null;
      if (
        !updatedContainer?.name?.trim() ||
        updatedContainer.name.length > 100 ||
        !updatedContainer.type ||
        (expectedParentType && parent?.type !== expectedParentType) ||
        (!expectedParentType && updatedContainer.parentId) ||
        (parent && (parent.workspaceId ?? "workspace-1") !== state.currentWorkspaceId)
      ) {
        throw createStoreError(
          "VALIDATION",
          "Containers must follow the workspace, space, folder, list hierarchy.",
        );
      }
    }
    const taskId =
      payload?.taskId ??
      (typedAction.type.includes("Task") ? payload?.id : undefined);
    const task = state.tasks.find((item) => item.id === taskId);
    const resourceId =
      payload?.listId ?? task?.listId ?? payload?.resourceId ?? payload?.id;
    const parentId = payload?.parentId;
    const resourceIds = payload?.orderedIds ?? [];
    const actionResourceIds = resourceIds.length ? resourceIds : [resourceId];
    if (task && task.listId !== resourceId) actionResourceIds.push(task.listId);
    if (typedAction.type === "workspace/addContainer" && parentId)
      actionResourceIds.push(parentId);
    if (typedAction.type === "workspace/reorderContainers" && parentId)
      actionResourceIds.push(parentId);
    if (typedAction.type === "workspace/addTask") {
      const newTask = typedAction.payload as {
        title?: string;
        listId?: string;
        statusId?: string;
      };
      const statuses = state.statusesByList[newTask.listId ?? ""] ?? [];
      const validationErrors = validateTaskCreation({
        title: newTask.title ?? "",
        description: (typedAction.payload as { description?: string }).description ?? "",
        dueDate: (typedAction.payload as { dueDate?: string | null }).dueDate ?? null,
        statusId: newTask.statusId ?? "",
      });
      if (validationErrors.title || validationErrors.description || validationErrors.dueDate) {
        throw createStoreError(
          "VALIDATION",
          validationErrors.title ??
            validationErrors.description ??
            validationErrors.dueDate ??
            "Task details are invalid.",
        );
      }
      if (
        !newTask.listId ||
        !canAccessResource(newTask.listId, state.currentUserId, state)
      ) {
        throw createStoreError(
          "FORBIDDEN",
          "You do not have permission to add tasks to this list.",
        );
      }
      if (
        !newTask.statusId ||
        !statuses.some((status) => status.id === newTask.statusId)
      ) {
        throw createStoreError(
          "VALIDATION",
          "The task status is not defined for this list.",
        );
      }
    }
    if (typedAction.type === "workspace/updateTask") {
      const updatedTask = typedAction.payload as {
        title?: string;
        listId?: string;
      };
      if (
        !updatedTask.title?.trim() ||
        updatedTask.title.length > MAX_TASK_TITLE_LENGTH
      ) {
        throw createStoreError(
          "VALIDATION",
          `Task title is required and must be ${MAX_TASK_TITLE_LENGTH} characters or fewer.`,
        );
      }
    }
    if (
      typedAction.type !== "workspace/addTask" &&
      !task &&
      typedAction.type.includes("Task")
    ) {
      throw createStoreError("NOT_FOUND", "The task could not be found.");
    }
    if (
      !resourceId ||
      actionResourceIds.some(
        (id) => !id || !canAccessResource(id, state.currentUserId, state),
      )
    ) {
      const result = assertResourceAccess(
        resourceId ?? parentId ?? "unknown",
        state.currentUserId,
        state,
      );
      throw createStoreError(
        "FORBIDDEN",
        result?.error.message ??
          "You do not have permission to change this resource.",
      );
    }
    if (
      task &&
      (typedAction.type === "workspace/updateTask" ||
        typedAction.type === "workspace/moveTask")
    ) {
      const statusId =
        typedAction.type === "workspace/moveTask"
          ? (payload as { statusId?: string }).statusId
          : (payload as { statusId?: string }).statusId;
      const targetListId = payload?.listId ?? task.listId;
      const statuses = state.statusesByList[targetListId] ?? [];
      if (!statusId || !statuses.some((status) => status.id === statusId)) {
        throw createStoreError(
          "VALIDATION",
          "The task status is not defined for this list.",
        );
      }
    }
    return next(action);
  };
