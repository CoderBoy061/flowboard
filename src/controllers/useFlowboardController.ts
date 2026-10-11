import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePersistentState } from "react-persist-state-hook";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectAccessibleLists, selectTasksForList } from "../redux/selectors";
import {
  addContainer,
  addStatuses,
  addTask,
  bulkUpdateTasks,
  addWorkspace,
  archiveContainer,
  restoreContainer,
  restoreTask,
  rollbackTasks,
  deleteWorkspace,
  hydrateWorkspace,
  markNotificationRead,
  markNotificationsRead,
  renameWorkspace,
  reorderContainers,
  updateContainer,
  switchUser,
  switchWorkspace,
  updateTask,
} from "../redux/reducers/workspaceSlice";
import type { WorkspaceState } from "../redux/reducers/workspaceSlice";
import type { RootState } from "../redux/store";
import {
  defaultTaskFilters,
  type ContainerType,
  type CreateTaskInput,
  type Task,
  type TaskFilters,
} from "../types";
import { filterTasks, toIsoDateTime } from "../utils/taskUtils";
import {
  createContainer,
  createDefaultStatuses,
  createWorkspaceScaffold,
} from "../utils/workspaceFactory";

type ViewMode = "board" | "list";
type Preferences = {
  selectedListId: string;
  view: ViewMode;
  sidebarCollapsed: boolean;
};
type RenameTarget = {
  type: "workspace" | "container";
  id: string;
  name: string;
};

const defaultPreferences: Preferences = {
  selectedListId: "list-development",
  view: "board",
  sidebarCollapsed: false,
};
const emptyTasks: Task[] = [];

export function useFlowboardController() {
  const dispatch = useAppDispatch();
  const workspace = useAppSelector((state) => state.workspace);
  const canDelete =
    workspace.users.find((user) => user.id === workspace.currentUserId)
      ?.role === "admin";
  const [savedWorkspace, setSavedWorkspace] =
    usePersistentState<WorkspaceState | null>(
      "flowboard-workspace-state",
      null,
    );
  const hasHydratedWorkspace = useRef(false);
  const isRestoringWorkspace = useRef(false);
  const accessibleLists = useSelector(selectAccessibleLists);
  const [preferences, setPreferences] = usePersistentState(
    "flowboard-preferences",
    defaultPreferences,
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTaskStatusId, setCreateTaskStatusId] = useState("");
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [createTarget, setCreateTarget] = useState<{
    parentId: string | null;
    type: ContainerType;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>(defaultTaskFilters);

  useEffect(() => {
    if (hasHydratedWorkspace.current) return;
    if (savedWorkspace) {
      isRestoringWorkspace.current = true;
      dispatch(hydrateWorkspace(savedWorkspace));
    } else {
      setSavedWorkspace(workspace);
    }
    hasHydratedWorkspace.current = true;
  }, [dispatch, savedWorkspace, setSavedWorkspace, workspace]);

  useEffect(() => {
    if (!hasHydratedWorkspace.current) return;
    if (isRestoringWorkspace.current) {
      isRestoringWorkspace.current = false;
      return;
    }
    setSavedWorkspace(workspace);
  }, [workspace, setSavedWorkspace]);

  const requestedList = accessibleLists.find(
    (item) => item.id === preferences.selectedListId,
  );
  const selectedList = requestedList ?? accessibleLists[0];
  const selectedListWasDenied = Boolean(
    !requestedList &&
    workspace.containers.some(
      (container) =>
        container.id === preferences.selectedListId &&
        !container.isArchived &&
        (container.workspaceId ?? "workspace-1") ===
          workspace.currentWorkspaceId,
    ),
  );
  const tasks = useSelector((state: RootState) =>
    selectedList ? selectTasksForList(state, selectedList.id) : emptyTasks,
  );
  const filteredTasks = useMemo(
    () => filterTasks(tasks, query, filters),
    [filters, query, tasks],
  );
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const selectedSubtasks = selectedTask
    ? workspace.tasks.filter(
        (task) => task.parentTaskId === selectedTask.id && !task.isArchived,
      )
    : [];
  const archivedContainers = workspace.containers.filter(
    (container) =>
      container.isArchived &&
      (container.workspaceId ?? "workspace-1") === workspace.currentWorkspaceId,
  );
  const archivedTasks = workspace.tasks.filter((task) => {
    const list = workspace.containers.find(
      (container) => container.id === task.listId,
    );
    return (
      task.isArchived &&
      (list?.workspaceId ?? "workspace-1") === workspace.currentWorkspaceId
    );
  });
  const userNotifications = useMemo(
    () =>
      (workspace.notifications ?? [])
        .filter(
          (notification) =>
            notification.recipientUserId === workspace.currentUserId,
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [workspace.currentUserId, workspace.notifications],
  );
  const unreadNotificationCount = userNotifications.filter(
    (notification) => !notification.read,
  ).length;

  useEffect(() => {
    const startTimeout = window.setTimeout(() => setIsLoading(true), 0);
    const finishTimeout = window.setTimeout(() => setIsLoading(false), 260);
    return () => {
      window.clearTimeout(startTimeout);
      window.clearTimeout(finishTimeout);
    };
  }, [selectedList?.id]);

  useEffect(() => {
    if (selectedListWasDenied && accessibleLists.length) {
      window.setTimeout(() => {
        setToast(
          "You do not have permission to access this list. Showing the first accessible list.",
        );
        window.setTimeout(() => setToast(null), 3500);
      }, 0);
      setPreferences((current) => ({
        ...current,
        selectedListId: accessibleLists[0].id,
      }));
    }
  }, [
    accessibleLists,
    preferences.selectedListId,
    selectedListWasDenied,
    setPreferences,
    workspace.containers,
  ]);

  useEffect(() => {
    if (!selectedTaskId) return;
    const closeOnEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && setSelectedTaskId(null);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedTaskId]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const notifyError = (error: unknown) => {
    const storeError = error as { error?: { message?: string } };
    showToast(
      storeError.error?.message ??
        (error instanceof Error ? error.message : "Something went wrong."),
    );
  };

  const handleCreate = (input: CreateTaskInput) => {
    // Builds and dispatches a task for the currently selected list.
    if (!selectedList) return;
    const listStatuses = workspace.statusesByList[selectedList.id] ?? [];
    const now = new Date().toISOString();
    const task: Task = {
      id: `task-${Date.now()}`,
      listId: selectedList.id,
      title: input.title,
      description: input.description,
      statusId: input.statusId || listStatuses[0]?.id,
      priority: input.priority,
      assigneeIds: input.assigneeIds,
      dueDate: toIsoDateTime(input.dueDate),
      position: tasks.length,
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    };
    try {
      dispatch(addTask(task));
      setIsCreateOpen(false);
      showToast("Task created successfully.");
    } catch (error) {
      notifyError(error);
    }
  };

  // Creates a child task that inherits the parent task context.
  const handleCreateSubtask = (parentTaskId: string, title: string) => {
    const parent = workspace.tasks.find((task) => task.id === parentTaskId);
    if (!parent || !title.trim()) return;
    const now = new Date().toISOString();
    const subtask: Task = {
      id: `task-${Date.now()}`,
      listId: parent.listId,
      title: title.trim(),
      description: `Subtask of ${parent.title}`,
      statusId: parent.statusId,
      priority: parent.priority,
      assigneeIds: [...parent.assigneeIds],
      dueDate: parent.dueDate,
      position: workspace.tasks.filter(
        (task) =>
          task.listId === parent.listId && task.parentTaskId === parent.id,
      ).length,
      createdAt: now,
      updatedAt: now,
      isArchived: false,
      parentTaskId: parent.id,
      isCompleted: false,
    };
    try {
      dispatch(addTask(subtask));
    } catch (error) {
      notifyError(error);
    }
  };

  // Toggles completion for a child task through the Redux store.
  const handleToggleSubtask = (subtask: Task) => {
    try {
      dispatch(
        updateTask({
          ...subtask,
          isCompleted: !subtask.isCompleted,
          updatedAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      notifyError(error);
    }
  };

  // Applies bulk changes and restores snapshots if the mutation fails.
  const handleBulkUpdate = (
    taskIds: string[],
    changes: Partial<Pick<Task, "priority" | "assigneeIds">>,
  ) => {
    const snapshots = workspace.tasks
      .filter((task) => taskIds.includes(task.id))
      .map((task) => ({ ...task, assigneeIds: [...task.assigneeIds] }));
    try {
      dispatch(bulkUpdateTasks({ taskIds, changes }));
    } catch (error) {
      dispatch(rollbackTasks(snapshots));
      notifyError(error);
    }
  };

  // Restores an archived task for an administrator.
  const handleRestoreTask = (taskId: string) => {
    try {
      dispatch(restoreTask(taskId));
    } catch (error) {
      notifyError(error);
    }
  };

  // Restores an archived container branch for an administrator.
  const handleRestoreContainer = (containerId: string) => {
    try {
      dispatch(restoreContainer(containerId));
    } catch (error) {
      notifyError(error);
    }
  };

  const openArchive = useCallback(() => setIsArchiveOpen(true), []);
  const closeArchive = useCallback(() => setIsArchiveOpen(false), []);

  const handleCreateWorkspace = (name: string) => {
    // Creates a workspace scaffold and persists its initial containers.
    try {
      const scaffold = createWorkspaceScaffold(`workspace-${Date.now()}`, name);
      dispatch(addWorkspace(scaffold.workspace));
      scaffold.containers.forEach((container) =>
        dispatch(addContainer(container)),
      );
      dispatch(
        addStatuses({ listId: scaffold.listId, statuses: scaffold.statuses }),
      );
      setPreferences((current) => ({
        ...current,
        selectedListId: scaffold.listId,
      }));
      setIsWorkspaceModalOpen(false);
    } catch (error) {
      notifyError(error);
    }
  };

  const handleRename = (name: string) => {
    // Renames the selected workspace or container through Redux.
    if (!renameTarget) return;
    try {
      if (renameTarget.type === "workspace") {
        dispatch(renameWorkspace({ id: renameTarget.id, name }));
      } else {
        const container = workspace.containers.find(
          (item) => item.id === renameTarget.id,
        );
        if (container) dispatch(updateContainer({ ...container, name }));
      }
      setRenameTarget(null);
    } catch (error) {
      notifyError(error);
    }
  };

  const handleCreateContainer = (name: string) => {
    // Creates a valid child container and list statuses when needed.
    if (!createTarget) return;
    try {
      const id = `${createTarget.type}-${Date.now()}`;
      const siblings = workspace.containers.filter(
        (item) =>
          item.parentId === createTarget.parentId &&
          (item.workspaceId ?? "workspace-1") === workspace.currentWorkspaceId,
      );
      dispatch(
        addContainer(
          createContainer(
            id,
            name,
            createTarget.type,
            createTarget.parentId,
            siblings.length,
            workspace.currentWorkspaceId,
          ),
        ),
      );
      if (createTarget.type === "list")
        dispatch(
          addStatuses({ listId: id, statuses: createDefaultStatuses(id) }),
        );
      setCreateTarget(null);
    } catch (error) {
      notifyError(error);
    }
  };

  const toggleSidebar = useCallback(
    () =>
      setPreferences((current) => ({
        ...current,
        sidebarCollapsed: !current.sidebarCollapsed,
      })),
    [setPreferences],
  );
  const selectList = useCallback(
    (listId: string) =>
      setPreferences((current) => ({ ...current, selectedListId: listId })),
    [setPreferences],
  );
  const openCreateTask = useCallback((statusId = "") => {
    // Opens task creation with an optional Kanban status preselected.
    setCreateTaskStatusId(statusId);
    setIsCreateOpen(true);
  }, []);
  const changeWorkspace = useCallback(
    (workspaceId: string) => {
      dispatch(switchWorkspace(workspaceId));
      setPreferences((current) => ({ ...current, selectedListId: "" }));
    },
    [dispatch, setPreferences],
  );
  const changeUser = useCallback(
    (userId: string) => {
      // Switches the demo identity and announces the active role.
      const user = workspace.users.find((item) => item.id === userId);
      if (!user) return;
      dispatch(switchUser(userId));
      setToast(
        `Switched to ${user.name} — ${user.role === "admin" ? "Admin" : "Member"}`,
      );
      window.setTimeout(() => setToast(null), 3500);
    },
    [dispatch, workspace.users],
  );
  const setViewMode = useCallback(
    (view: ViewMode) => setPreferences((current) => ({ ...current, view })),
    [setPreferences],
  );
  const resetFilters = useCallback(() => setFilters(defaultTaskFilters), []);
  const toggleNotifications = useCallback(
    () => setIsNotificationsOpen((value) => !value),
    [],
  );
  const closeNotifications = useCallback(
    () => setIsNotificationsOpen(false),
    [],
  );
  const markAllNotificationsRead = useCallback(() => {
    // Marks only the active user's notifications as read.
    dispatch(markNotificationsRead(workspace.currentUserId));
  }, [dispatch, workspace.currentUserId]);
  const markNotificationAsRead = useCallback(
    (notificationId: string) => dispatch(markNotificationRead(notificationId)),
    [dispatch],
  );
  const openCreateWorkspace = useCallback(
    () => setIsWorkspaceModalOpen(true),
    [],
  );
  const openRenameWorkspace = useCallback(
    (id: string) => {
      const current = workspace.workspaces.find((item) => item.id === id);
      if (current)
        setRenameTarget({
          type: "workspace",
          id: current.id,
          name: current.name,
        });
    },
    [workspace.workspaces],
  );
  const deleteWorkspaceFromSidebar = useCallback(
    (id: string) => {
      if (workspace.workspaces.length <= 1) {
        setToast("You cannot delete the only workspace.");
        return;
      }
      const target = workspace.workspaces.find((item) => item.id === id);
      if (target && window.confirm(`Delete workspace "${target.name}"?`)) {
        try {
          dispatch(deleteWorkspace(id));
          setPreferences((current) => ({ ...current, selectedListId: "" }));
        } catch (error) {
          notifyError(error);
        }
      }
    },
    [dispatch, setPreferences, workspace.workspaces],
  );
  const openRenameContainer = useCallback(
    (id: string) => {
      const container = workspace.containers.find((item) => item.id === id);
      if (container)
        setRenameTarget({
          type: "container",
          id: container.id,
          name: container.name,
        });
    },
    [workspace.containers],
  );
  const openCreateChild = useCallback(
    (parentId: string | null, type: ContainerType) =>
      setCreateTarget({ parentId, type }),
    [],
  );
  const deleteContainerFromSidebar = useCallback(
    (id: string) => {
      const container = workspace.containers.find((item) => item.id === id);
      if (
        container &&
        window.confirm(
          `Delete ${container.type} "${container.name}" and its children?`,
        )
      ) {
        try {
          dispatch(archiveContainer(id));
        } catch (error) {
          notifyError(error);
        }
      }
    },
    [dispatch, workspace.containers],
  );
  const reorderContainerSiblings = useCallback(
    (parentId: string | null, orderedIds: string[]) => {
      try {
        dispatch(reorderContainers({ parentId, orderedIds }));
      } catch (error) {
        notifyError(error);
      }
    },
    [dispatch],
  );

  return {
    workspace,
    canDelete,
    preferences,
    selectedList,
    accessibleLists,
    filteredTasks,
    selectedTask,
    selectedSubtasks,
    archivedTasks,
    archivedContainers,
    query,
    setQuery,
    toast,
    userNotifications,
    unreadNotificationCount,
    isNotificationsOpen,
    isArchiveOpen,
    filters,
    setFilters,
    isLoading,
    isCreateOpen,
    setIsCreateOpen,
    createTaskStatusId,
    isWorkspaceModalOpen,
    setIsWorkspaceModalOpen,
    renameTarget,
    setRenameTarget,
    createTarget,
    setCreateTarget,
    setSelectedTaskId,
    handleCreate,
    handleCreateSubtask,
    handleToggleSubtask,
    handleBulkUpdate,
    handleRestoreTask,
    handleRestoreContainer,
    openArchive,
    closeArchive,
    handleCreateWorkspace,
    handleRename,
    handleCreateContainer,
    toggleSidebar,
    selectList,
    openCreateTask,
    changeWorkspace,
    changeUser,
    setViewMode,
    resetFilters,
    toggleNotifications,
    closeNotifications,
    markAllNotificationsRead,
    markNotificationAsRead,
    openCreateWorkspace,
    openRenameWorkspace,
    deleteWorkspaceFromSidebar,
    openRenameContainer,
    openCreateChild,
    deleteContainerFromSidebar,
    reorderContainerSiblings,
    notifyError,
    showToast,
  };
}
