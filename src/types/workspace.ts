export type ContainerType = "space" | "folder" | "list";
export type ContainerVisibility = "public" | "private";

export interface Workspace {
  id: string;
  name: string;
}

export interface Container {
  id: string;
  name: string;
  type: ContainerType;
  parentId: string | null;
  position: number;
  isArchived: boolean;
  workspaceId?: string;
  visibility?: ContainerVisibility;
}
