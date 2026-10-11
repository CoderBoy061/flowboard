import { createSelector } from "@reduxjs/toolkit";
import { canAccessResource } from "../services/permissionService";
import type { RootState } from "./store";

const selectContainers = (state: RootState) => state.workspace.containers;
const selectUsers = (state: RootState) => state.workspace.users;
const selectPermissionGrants = (state: RootState) =>
  state.workspace.permissionGrants;
const selectCurrentUserId = (state: RootState) => state.workspace.currentUserId;
const selectCurrentWorkspaceId = (state: RootState) =>
  state.workspace.currentWorkspaceId;
const selectTasks = (state: RootState) => state.workspace.tasks;
const selectListId = (_state: RootState, listId: string) => listId;

export const selectVisibleContainers = createSelector(
  [
    selectContainers,
    selectUsers,
    selectPermissionGrants,
    selectCurrentUserId,
    selectCurrentWorkspaceId,
  ],
  (containers, users, permissionGrants, currentUserId, currentWorkspaceId) => {
    const permissionContext = { containers, users, permissionGrants };
    const workspaceContainers = containers.filter(
      (container) =>
        (container.workspaceId ?? "workspace-1") === currentWorkspaceId &&
        !container.isArchived,
    );
    const visibleIds = new Set(
      workspaceContainers
        .filter((container) =>
          canAccessResource(container.id, currentUserId, permissionContext),
        )
        .map((container) => container.id),
    );

    // Keep the complete tree path visible when a member receives a direct
    // container grant for a nested list.
    workspaceContainers.forEach((container) => {
      if (!visibleIds.has(container.id)) return;
      let parentId = container.parentId;
      while (parentId) {
        visibleIds.add(parentId);
        parentId =
          workspaceContainers.find((item) => item.id === parentId)?.parentId ??
          null;
      }
    });

    return workspaceContainers.filter((container) =>
      visibleIds.has(container.id),
    );
  },
);

export const selectAccessibleLists = createSelector(
  [selectVisibleContainers],
  (containers) => containers.filter((container) => container.type === "list"),
);

export const selectTasksForList = createSelector(
  [
    selectTasks,
    selectContainers,
    selectUsers,
    selectPermissionGrants,
    selectCurrentUserId,
    selectCurrentWorkspaceId,
    selectListId,
  ],
  (
    tasks,
    containers,
    users,
    permissionGrants,
    currentUserId,
    currentWorkspaceId,
    listId,
  ) => {
    const list = containers.find((container) => container.id === listId);
    const permissionContext = { containers, users, permissionGrants };
    if (
      !list ||
      (list.workspaceId ?? "workspace-1") !== currentWorkspaceId ||
      !canAccessResource(listId, currentUserId, permissionContext)
    )
      return [];
    return tasks
      .filter(
        (task) =>
          task.listId === listId &&
          !task.parentTaskId &&
          !task.isArchived,
      )
      .sort((a, b) => a.position - b.position);
  },
);
