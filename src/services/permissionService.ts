import type { Container, PermissionGrant, User } from "../types";
import type { StoreErrorShape } from "./storeError";

interface PermissionContext {
  containers: Container[];
  users: User[];
  permissionGrants: PermissionGrant[];
}

export type PermissionError = StoreErrorShape;

export function canAccessResource(
  resourceId: string,
  userId: string,
  context: PermissionContext,
): boolean {
  // Resolves admin bypass, direct grants, visibility, and inherited access.
  const user = context.users.find((item) => item.id === userId);

  if (!user) {
    return false;
  }

  // Admins bypass resource restrictions.
  if (user.role === "admin") {
    return true;
  }

  const resource = context.containers.find((item) => item.id === resourceId);

  if (!resource || resource.isArchived) {
    return false;
  }

  // A direct deny takes precedence over an allow.
  const directGrants = context.permissionGrants.filter(
    (grant) => grant.resourceId === resourceId && grant.userId === userId,
  );

  if (directGrants.some((grant) => grant.mode === "deny")) {
    return false;
  }

  if (directGrants.some((grant) => grant.mode === "allow")) {
    return true;
  }

  if (resource.visibility === "private") {
    return false;
  }

  // Inherit visibility through parent containers.
  if (resource.parentId) {
    return canAccessResource(resource.parentId, userId, context);
  }

  // Public top-level spaces are visible to workspace members. New containers
  // default to private, so an admin can explicitly share them through grants.
  return resource.type === "space" && resource.visibility === "public";
}

export function getVisibleContainers(
  userId: string,
  context: PermissionContext,
): Container[] {
  // Returns only active containers directly visible to the selected user.
  return context.containers.filter(
    (container) =>
      !container.isArchived && canAccessResource(container.id, userId, context),
  );
}

export function assertResourceAccess(
  resourceId: string,
  userId: string,
  context: PermissionContext,
): PermissionError | null {
  // Converts a failed access check into the store's consistent error shape.
  if (canAccessResource(resourceId, userId, context)) {
    return null;
  }

  return {
    error: {
      code: "FORBIDDEN",
      message: "You do not have permission to access this resource.",
    },
  };
}
