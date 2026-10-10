import type {
  Container,
  ContainerType,
  TaskStatus,
  Workspace,
} from "../types";

export function createDefaultStatuses(listId: string): TaskStatus[] {
  // Creates the required default status set for every new list.
  return [
    {
      id: `${listId}-todo`,
      name: "To Do",
      category: "todo",
      color: "#64748b",
      position: 0,
    },
    {
      id: `${listId}-progress`,
      name: "In Progress",
      category: "in_progress",
      color: "#6366f1",
      position: 1,
    },
    {
      id: `${listId}-done`,
      name: "Done",
      category: "done",
      color: "#16a34a",
      position: 2,
    },
  ];
}

export function createContainer(
  id: string,
  name: string,
  type: ContainerType,
  parentId: string | null,
  position: number,
  workspaceId: string,
): Container {
  // Builds a private ordered container for the client store.
  return {
    id,
    name,
    type,
    parentId,
    position,
    isArchived: false,
    workspaceId,
    visibility: "private",
  };
}

export function createWorkspaceScaffold(
  workspaceId: string,
  name: string,
): {
  workspace: Workspace;
  containers: Container[];
  listId: string;
  statuses: TaskStatus[];
} {
  // Creates the minimal workspace, space, folder, list, and status fixture.
  const spaceId = `${workspaceId}-space`;
  const folderId = `${workspaceId}-folder`;
  const listId = `${workspaceId}-list`;

  return {
    workspace: { id: workspaceId, name },
    containers: [
      createContainer(spaceId, "General", "space", null, 0, workspaceId),
      createContainer(folderId, "Projects", "folder", spaceId, 0, workspaceId),
      createContainer(listId, "Tasks", "list", folderId, 0, workspaceId),
    ],
    listId,
    statuses: createDefaultStatuses(listId),
  };
}
