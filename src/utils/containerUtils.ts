import type { Container, Workspace } from "../types";

export function getContainerBreadcrumb(
  containers: Container[],
  workspaces: Workspace[],
  listId: string,
  workspaceId: string,
): string {
  const names: string[] = [];
  let current = containers.find((container) => container.id === listId);
  while (current) {
    names.unshift(current.name);
    current = current.parentId
      ? containers.find((container) => container.id === current?.parentId)
      : undefined;
  }
  const workspace = workspaces.find((item) => item.id === workspaceId);
  if (workspace) names.unshift(workspace.name);
  return names.join(" / ");
}
