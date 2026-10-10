export type PermissionMode = "allow" | "deny";

export interface PermissionGrant {
  id: string;
  resourceId: string;
  userId: string;
  mode: PermissionMode;
}
