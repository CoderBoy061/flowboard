import { describe, expect, it } from "vitest";
import { mockTasks } from "../data/mockData";
import workspaceReducer, {
  addTask,
  archiveTask,
  markNotificationRead,
  moveTask,
  switchUser,
  updateTask,
} from "../redux/reducers/workspaceSlice";

describe("task permissions", () => {
  it("does not derive container access from task assignment", () => {
    const task = {
      ...mockTasks[0],
      id: "assignment-test-task",
      listId: "list-development",
      assigneeIds: ["user-bob"],
    };
    const initialState = workspaceReducer(undefined, { type: "test/init" });
    let state = {
      ...initialState,
      tasks: initialState.tasks.filter((item) => item.listId !== "list-development"),
    };
    state = workspaceReducer(state, addTask(task));
    expect(state.permissionGrants).not.toContainEqual(
      expect.objectContaining({
        id: "assignment-list-development-user-bob",
      }),
    );

    state = workspaceReducer(state, updateTask({ ...task, assigneeIds: [] }));
    expect(state.permissionGrants).not.toContainEqual(
      expect.objectContaining({
        id: "assignment-list-development-user-bob",
      }),
    );
  });
});

describe("role-aware notifications", () => {
  it("notifies an assignee and admins when members make changes", () => {
    const task = {
      ...mockTasks[0],
      id: "notification-test-task",
      listId: "list-development",
      assigneeIds: ["user-bob"],
    };
    let state = workspaceReducer(undefined, { type: "test/init" });
    state = workspaceReducer(state, addTask(task));
    expect(state.notifications).toContainEqual(
      expect.objectContaining({ recipientUserId: "user-bob", type: "task_assigned" }),
    );

    state = workspaceReducer(state, switchUser("user-bob"));
    state = workspaceReducer(
      state,
      updateTask({ ...task, title: "Updated by Bob", assigneeIds: ["user-bob"] }),
    );
    expect(state.notifications).toContainEqual(
      expect.objectContaining({ recipientUserId: "user-alice", type: "task_updated" }),
    );
  });

  it("marks an individual notification as read", () => {
    const task = { ...mockTasks[0], id: "read-test-task", assigneeIds: ["user-bob"] };
    let state = workspaceReducer(undefined, addTask(task));
    const notification = state.notifications.find(
      (item) => item.recipientUserId === "user-bob",
    );
    expect(notification?.read).toBe(false);

    state = workspaceReducer(state, markNotificationRead(notification!.id));
    expect(state.notifications.find((item) => item.id === notification!.id)?.read).toBe(true);
  });
});

describe("task mutations", () => {
  it("moves a task to another status and archives it", () => {
    let state = workspaceReducer(undefined, { type: "test/init" });
    state = workspaceReducer(
      state,
      moveTask({ taskId: "task-1", statusId: "dev-progress", position: 0 }),
    );
    expect(state.tasks.find((task) => task.id === "task-1")).toMatchObject({
      statusId: "dev-progress",
      position: 0,
    });

    state = workspaceReducer(state, archiveTask("task-1"));
    expect(state.tasks.find((task) => task.id === "task-1")?.isArchived).toBe(true);
  });
});
