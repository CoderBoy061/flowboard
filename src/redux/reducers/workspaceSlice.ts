import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import {
  mockWorkspace,
  mockContainers,
  mockUsers,
  mockTasks,
  mockStatusesByList,
  mockPermissionGrants,
  initialUserId,
} from "../../data/mockData";

import type {
  Container,
  Task,
  User,
  PermissionGrant,
  TaskStatus,
  Workspace,
  AppNotification,
} from "../../types";

export interface WorkspaceState {
  workspace: Workspace;
  workspaces: Workspace[];
  currentWorkspaceId: string;
  containers: Container[];
  users: User[];
  tasks: Task[];
  statusesByList: Record<string, TaskStatus[]>;
  permissionGrants: PermissionGrant[];
  currentUserId: string;
  notifications: AppNotification[];
}

function getTaskContext(state: WorkspaceState, task: Task) {
  const context: AppNotification["context"] = {
    workspaceId: state.currentWorkspaceId,
    listId: task.listId,
    taskId: task.id,
  };
  let current = state.containers.find((item) => item.id === task.listId);
  while (current) {
    if (current.type === "space") context.spaceId = current.id;
    if (current.type === "folder") context.folderId = current.id;
    current = current.parentId
      ? state.containers.find((item) => item.id === current?.parentId)
      : undefined;
  }
  return context;
}

function addNotification(
  state: WorkspaceState,
  recipientUserId: string,
  actorUserId: string,
  type: AppNotification["type"],
  message: string,
  task: Task,
) {
  if (recipientUserId === actorUserId) return;
  state.notifications.push({
    id: `notification-${Date.now()}-${state.notifications.length}`,
    recipientUserId,
    actorUserId,
    type,
    message,
    context: getTaskContext(state, task),
    createdAt: new Date().toISOString(),
    read: false,
  });
}

const initialState: WorkspaceState = {
  workspace: mockWorkspace,
  workspaces: [mockWorkspace],
  currentWorkspaceId: mockWorkspace.id,
  containers: mockContainers,
  users: mockUsers,
  tasks: mockTasks,
  statusesByList: mockStatusesByList,
  permissionGrants: mockPermissionGrants,
  currentUserId: initialUserId,
  notifications: [],
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    hydrateWorkspace(_state, action: PayloadAction<WorkspaceState>) {
      return { ...action.payload, notifications: action.payload.notifications ?? [] };
    },

    switchUser(state, action: PayloadAction<string>) {
      const userExists = state.users.some((user) => user.id === action.payload);

      if (userExists) {
        state.currentUserId = action.payload;
      }
    },

    addWorkspace(state, action: PayloadAction<Workspace>) {
      state.workspaces.push(action.payload);
      state.currentWorkspaceId = action.payload.id;
      state.workspace = action.payload;
    },

    switchWorkspace(state, action: PayloadAction<string>) {
      const workspace = state.workspaces.find((item) => item.id === action.payload);
      if (workspace) {
        state.currentWorkspaceId = workspace.id;
        state.workspace = workspace;
      }
    },

    renameWorkspace(state, action: PayloadAction<{ id: string; name: string }>) {
      const workspace = state.workspaces.find((item) => item.id === action.payload.id);
      if (workspace) workspace.name = action.payload.name;
      if (state.workspace.id === action.payload.id) state.workspace.name = action.payload.name;
    },

    deleteWorkspace(state, action: PayloadAction<string>) {
      if (state.workspaces.length <= 1) return;
      state.workspaces = state.workspaces.filter((item) => item.id !== action.payload);
      state.containers.forEach((container) => {
        if ((container.workspaceId ?? "workspace-1") === action.payload) container.isArchived = true;
      });
      if (state.currentWorkspaceId === action.payload) {
        const nextWorkspace = state.workspaces[0];
        state.currentWorkspaceId = nextWorkspace.id;
        state.workspace = nextWorkspace;
      }
    },

    // Adds a task and emits optional role-aware activity notifications.
    addTask(state, action: PayloadAction<Task>) {
      state.tasks.push(action.payload);
      const actor = state.users.find((user) => user.id === state.currentUserId);
      action.payload.assigneeIds.forEach((userId) => {
        const assignee = state.users.find((user) => user.id === userId);
        if (actor && assignee && assignee.id !== actor.id) {
          addNotification(
            state,
            assignee.id,
            actor.id,
            "task_assigned",
            `${actor.name} assigned you “${action.payload.title}”`,
            action.payload,
          );
        }
      });
      if (actor?.role === "member") {
        state.users
          .filter((user) => user.role === "admin")
          .forEach((admin) =>
            addNotification(
              state,
              admin.id,
              actor.id,
              "task_updated",
              `${actor.name} created “${action.payload.title}”`,
              action.payload,
            ),
          );
      }
    },

    deleteTask(state, action: PayloadAction<string>) {
      const task = state.tasks.find((item) => item.id === action.payload);
      if (task) task.isArchived = true;
    },

    // Updates task fields while preserving the client-side activity trail.
    updateTask(state, action: PayloadAction<Task>) {
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id,
      );

      if (index !== -1) {
        state.tasks[index] = action.payload;
        const actor = state.users.find((user) => user.id === state.currentUserId);
        action.payload.assigneeIds.forEach((userId) => {
          const assignee = state.users.find((user) => user.id === userId);
          if (actor && assignee) {
            addNotification(
              state,
              assignee.id,
              actor.id,
              "task_assigned",
              `${actor.name} assigned you “${action.payload.title}”`,
              action.payload,
            );
          }
        });
        if (actor?.role === "member") {
          state.users
            .filter((user) => user.role === "admin")
            .forEach((admin) =>
              addNotification(
                state,
                admin.id,
                actor.id,
                "task_updated",
                `${actor.name} updated “${action.payload.title}”`,
                action.payload,
              ),
            );
        }

      }
    },

    // Moves a task between statuses or lists and recalculates positions.
    moveTask(
      state,
      action: PayloadAction<{ taskId: string; statusId: string; position: number; listId?: string }>,
    ) {
      const task = state.tasks.find((item) => item.id === action.payload.taskId);
      if (!task) return;

      const sourceListId = task.listId;
      const sourceStatusId = task.statusId;
      const targetListId = action.payload.listId ?? sourceListId;
      const targetStatusId = action.payload.statusId;
      const statuses = state.statusesByList[targetListId] ?? [];
      if (!statuses.some((status) => status.id === targetStatusId)) return;

      const sourceTasks = state.tasks
        .filter(
          (item) =>
            !item.isArchived &&
            item.listId === sourceListId &&
            item.statusId === sourceStatusId &&
            item.id !== task.id,
        )
        .sort((a, b) => a.position - b.position);
      const targetTasks =
        sourceListId === targetListId && sourceStatusId === targetStatusId
          ? sourceTasks
          : state.tasks
              .filter(
                (item) =>
                  !item.isArchived &&
                  item.listId === targetListId &&
                  item.statusId === targetStatusId &&
                  item.id !== task.id,
              )
              .sort((a, b) => a.position - b.position);
      const insertionIndex = Math.max(
        0,
        Math.min(action.payload.position, targetTasks.length),
      );
      targetTasks.splice(insertionIndex, 0, task);

      if (sourceTasks !== targetTasks) {
        sourceTasks.forEach((item, position) => {
          item.position = position;
        });
      }
      targetTasks.forEach((item, position) => {
        item.position = position;
      });
      task.listId = targetListId;
      task.statusId = targetStatusId;
      task.updatedAt = new Date().toISOString();
      const actor = state.users.find((user) => user.id === state.currentUserId);
      if (actor?.role === "member") {
        state.users
          .filter((user) => user.role === "admin")
          .forEach((admin) =>
            addNotification(
              state,
              admin.id,
              actor.id,
              "task_updated",
              `${actor.name} moved “${task.title}”`,
              task,
            ),
          );
      }
    },

    addContainer(state, action: PayloadAction<Container>) {
      state.containers.push(action.payload);
    },

    addStatuses(state, action: PayloadAction<{ listId: string; statuses: TaskStatus[] }>) {
      state.statusesByList[action.payload.listId] = action.payload.statuses;
    },

    updateContainer(state, action: PayloadAction<Container>) {
      const index = state.containers.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) state.containers[index] = action.payload;
    },

    // Soft-archives a container and every descendant in its branch.
    archiveContainer(state, action: PayloadAction<string>) {
      const archiveBranch = (containerId: string) => {
        const container = state.containers.find((item) => item.id === containerId);
        if (!container) return;
        container.isArchived = true;
        state.containers.filter((item) => item.parentId === containerId).forEach((child) => archiveBranch(child.id));
      };
      archiveBranch(action.payload);
    },

    // Persists sibling ordering for the selected container parent.
    reorderContainers(state, action: PayloadAction<{ parentId: string | null; orderedIds: string[] }>) {
      action.payload.orderedIds.forEach((id, position) => {
        const container = state.containers.find((item) => item.id === id && item.parentId === action.payload.parentId);
        if (container) container.position = position;
      });
    },

    archiveTask(state, action: PayloadAction<string>) {
      const task = state.tasks.find((item) => item.id === action.payload);

      if (task) {
        task.isArchived = true;
      }
    },

    markNotificationsRead(state, action: PayloadAction<string>) {
      state.notifications.forEach((notification) => {
        if (notification.recipientUserId === action.payload) notification.read = true;
      });
    },

    markNotificationRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find(
        (item) => item.id === action.payload,
      );
      if (notification) notification.read = true;
    },
  },
});

export const { hydrateWorkspace, switchUser, addWorkspace, switchWorkspace, renameWorkspace, deleteWorkspace, addTask, updateTask, deleteTask, moveTask, addContainer, addStatuses, updateContainer, archiveContainer, reorderContainers, archiveTask, markNotificationsRead, markNotificationRead } =
  workspaceSlice.actions;

export default workspaceSlice.reducer;
