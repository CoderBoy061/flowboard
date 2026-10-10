import { describe, expect, it } from "vitest";
import {
  canAccessResource,
  getVisibleContainers,
} from "../services/permissionService";

import {
  mockContainers,
  mockUsers,
  mockPermissionGrants,
} from "../data/mockData";

const context = {
  containers: mockContainers,
  users: mockUsers,
  permissionGrants: mockPermissionGrants,
};

describe("permissionService", () => {
  it("allows Alice, the admin, to access all resources", () => {
    expect(canAccessResource("list-bugs", "user-alice", context)).toBe(true);
  });

  it("allows Bob to access the product space", () => {
    expect(canAccessResource("space-product", "user-bob", context)).toBe(true);
  });

  it("denies Bob access to bug tracking", () => {
    expect(canAccessResource("list-bugs", "user-bob", context)).toBe(false);
  });

  it("keeps Bob inside the granted product space", () => {
    expect(canAccessResource("space-marketing", "user-bob", context)).toBe(false);
  });

  it("allows Carol to access the marketing space", () => {
    expect(canAccessResource("space-marketing", "user-carol", context)).toBe(
      true,
    );
  });

  it("denies Carol access to development tasks", () => {
    expect(canAccessResource("list-development", "user-carol", context)).toBe(
      false,
    );
  });

  it("keeps Carol inside the granted marketing space", () => {
    expect(canAccessResource("space-product", "user-carol", context)).toBe(false);
  });

  it("does not return inaccessible containers", () => {
    const visibleContainers = getVisibleContainers("user-bob", context);

    expect(
      visibleContainers.some((container) => container.id === "list-bugs"),
    ).toBe(false);
  });

  it("denies access to an unknown user", () => {
    expect(canAccessResource("space-product", "unknown-user", context)).toBe(
      false,
    );
  });
});
