import { describe, expect, it } from "vitest";
import { mockContainers, mockStatusesByList, mockUsers, mockWorkspace } from "../data/mockData";
import { selectAccessibleLists, selectTasksForList, selectVisibleContainers } from "../redux/selectors";
import type { RootState } from "../redux/store";

function createState(currentUserId: string): RootState {
  const containers = mockContainers.map((container) => ({
    ...container,
    visibility: "private" as const,
  }));
  return {
    workspace: {
      workspace: mockWorkspace,
      workspaces: [mockWorkspace],
      currentWorkspaceId: mockWorkspace.id,
      containers,
      users: mockUsers,
      tasks: [
        {
          id: "assigned-task",
          listId: "list-development",
          title: "Assigned task",
          description: "Visible to Bob",
          statusId: "dev-todo",
          priority: "normal",
          assigneeIds: ["user-bob"],
          dueDate: null,
          position: 0,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          isArchived: false,
        },
        {
          id: "other-task",
          listId: "list-development",
          title: "Other task",
          description: "Not visible to Bob",
          statusId: "dev-todo",
          priority: "low",
          assigneeIds: ["user-alice"],
          dueDate: null,
          position: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          isArchived: false,
        },
      ],
      statusesByList: mockStatusesByList,
      permissionGrants: [
        { id: "list-grant", resourceId: "list-development", userId: "user-bob", mode: "allow" },
      ],
      currentUserId,
    },
  } as RootState;
}

describe("permission-aware selectors", () => {
  it("returns the parent space and folder for a directly granted list", () => {
    const state = createState("user-bob");
    const visibleIds = selectVisibleContainers(state).map((container) => container.id);
    expect(visibleIds).toEqual(expect.arrayContaining(["space-product", "folder-frontend", "list-development"]));
    expect(selectAccessibleLists(state).map((list) => list.id)).toContain("list-development");
  });

  it("shows members every task in a granted list", () => {
    const state = createState("user-bob");
    expect(selectTasksForList(state, "list-development").map((task) => task.id)).toEqual(["assigned-task", "other-task"]);
  });

  it("allows admins to see every task in the list", () => {
    const state = createState("user-alice");
    expect(selectTasksForList(state, "list-development")).toHaveLength(2);
  });
});
