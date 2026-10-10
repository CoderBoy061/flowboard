import type {
  Workspace,
  Container,
  User,
  Task,
  TaskStatus,
  PermissionGrant,
} from "../types";

// Workspace
export const mockWorkspace: Workspace = {
  id: "workspace-1",
  name: "Flowboard Workspace",
};

// Users
export const mockUsers: User[] = [
  {
    id: "user-alice",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "admin",
  },
  {
    id: "user-bob",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "member",
  },
  {
    id: "user-carol",
    name: "Carol Davis",
    email: "carol@example.com",
    role: "member",
  },
];

// Workspace hierarchy
export const mockContainers: Container[] = [
  {
    id: "space-product",
    name: "Product Development",
    type: "space",
    parentId: null,
    position: 0,
    isArchived: false,
    visibility: "public",
  },
  {
    id: "space-marketing",
    name: "Marketing",
    type: "space",
    parentId: null,
    position: 1,
    isArchived: false,
    visibility: "public",
  },
  {
    id: "folder-frontend",
    name: "Frontend",
    type: "folder",
    parentId: "space-product",
    position: 0,
    isArchived: false,
  },
  {
    id: "folder-campaigns",
    name: "Campaigns",
    type: "folder",
    parentId: "space-marketing",
    position: 0,
    isArchived: false,
  },
  {
    id: "list-development",
    name: "Development Tasks",
    type: "list",
    parentId: "folder-frontend",
    position: 0,
    isArchived: false,
  },
  {
    id: "list-bugs",
    name: "Bug Tracking",
    type: "list",
    parentId: "folder-frontend",
    position: 1,
    isArchived: false,
  },
  {
    id: "list-marketing",
    name: "Marketing Tasks",
    type: "list",
    parentId: "folder-campaigns",
    position: 0,
    isArchived: false,
  },
];

// Statuses: each list owns its own status set
export const mockStatusesByList: Record<string, TaskStatus[]> = {
  "list-development": [
    {
      id: "dev-todo",
      name: "To Do",
      category: "todo",
      color: "#64748b",
      position: 0,
    },
    {
      id: "dev-progress",
      name: "In Progress",
      category: "in_progress",
      color: "#6366f1",
      position: 1,
    },
    {
      id: "dev-done",
      name: "Done",
      category: "done",
      color: "#16a34a",
      position: 2,
    },
  ],
  "list-bugs": [
    {
      id: "bug-todo",
      name: "To Do",
      category: "todo",
      color: "#64748b",
      position: 0,
    },
    {
      id: "bug-progress",
      name: "In Progress",
      category: "in_progress",
      color: "#6366f1",
      position: 1,
    },
    {
      id: "bug-done",
      name: "Done",
      category: "done",
      color: "#16a34a",
      position: 2,
    },
  ],
  "list-marketing": [
    {
      id: "marketing-todo",
      name: "To Do",
      category: "todo",
      color: "#64748b",
      position: 0,
    },
    {
      id: "marketing-progress",
      name: "In Progress",
      category: "in_progress",
      color: "#6366f1",
      position: 1,
    },
    {
      id: "marketing-done",
      name: "Done",
      category: "done",
      color: "#16a34a",
      position: 2,
    },
  ],
};

// Tasks: 15 tasks across 3 lists
const now = new Date().toISOString();

export const mockTasks: Task[] = [
  // Development Tasks
  {
    id: "task-1",
    listId: "list-development",
    title: "Build workspace sidebar",
    description: "Implement the collapsible workspace navigation tree.",
    statusId: "dev-done",
    priority: "high",
    assigneeIds: ["user-alice"],
    dueDate: "2026-10-12",
    position: 0,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },
  {
    id: "task-2",
    listId: "list-development",
    title: "Set up Redux store",
    description: "Configure Redux Toolkit and typed hooks.",
    statusId: "dev-done",
    priority: "normal",
    assigneeIds: ["user-bob"],
    dueDate: "2026-10-11",
    position: 1,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },
  {
    id: "task-3",
    listId: "list-development",
    title: "Implement Kanban board",
    description: "Create status columns and draggable task cards.",
    statusId: "dev-progress",
    priority: "urgent",
    assigneeIds: ["user-bob", "user-carol"],
    dueDate: "2026-10-14",
    position: 0,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },
  {
    id: "task-4",
    listId: "list-development",
    title: "Build task details drawer",
    description: "Show task information and allow editing.",
    statusId: "dev-progress",
    priority: "high",
    assigneeIds: ["user-alice"],
    dueDate: "2026-10-15",
    position: 1,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },
  {
    id: "task-5",
    listId: "list-development",
    title: "Add task creation flow",
    description: "Allow users to create tasks from the board.",
    statusId: "dev-todo",
    priority: "normal",
    assigneeIds: ["user-carol"],
    dueDate: null,
    position: 0,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },

  // Bug Tracking
  {
    id: "task-6",
    listId: "list-bugs",
    title: "Fix sidebar collapse issue",
    description: "Ensure the sidebar works at different screen widths.",
    statusId: "bug-done",
    priority: "high",
    assigneeIds: ["user-bob"],
    dueDate: "2026-10-10",
    position: 0,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },
  {
    id: "task-7",
    listId: "list-bugs",
    title: "Resolve stale task updates",
    description: "Ensure Redux updates are reflected immediately.",
    statusId: "bug-progress",
    priority: "urgent",
    assigneeIds: ["user-alice"],
    dueDate: "2026-10-11",
    position: 0,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },
  {
    id: "task-8",
    listId: "list-bugs",
    title: "Handle empty task titles",
    description: "Validate task titles before saving.",
    statusId: "bug-todo",
    priority: "normal",
    assigneeIds: ["user-carol"],
    dueDate: "2026-10-16",
    position: 0,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },
  {
    id: "task-9",
    listId: "list-bugs",
    title: "Fix incorrect status colors",
    description: "Use consistent status colors throughout the app.",
    statusId: "bug-todo",
    priority: "low",
    assigneeIds: ["user-bob"],
    dueDate: null,
    position: 1,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },
  {
    id: "task-10",
    listId: "list-bugs",
    title: "Improve drawer keyboard behavior",
    description: "Support Escape to close the task drawer.",
    statusId: "bug-progress",
    priority: "normal",
    assigneeIds: ["user-carol"],
    dueDate: "2026-10-18",
    position: 1,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },

  // Marketing Tasks
  {
    id: "task-11",
    listId: "list-marketing",
    title: "Prepare product launch plan",
    description: "Outline the launch timeline and deliverables.",
    statusId: "marketing-done",
    priority: "high",
    assigneeIds: ["user-alice"],
    dueDate: "2026-10-13",
    position: 0,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },
  {
    id: "task-12",
    listId: "list-marketing",
    title: "Design social media creatives",
    description: "Prepare visuals for the upcoming product launch.",
    statusId: "marketing-progress",
    priority: "urgent",
    assigneeIds: ["user-carol"],
    dueDate: "2026-10-14",
    position: 0,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },
  {
    id: "task-13",
    listId: "list-marketing",
    title: "Write landing page copy",
    description: "Create concise copy highlighting key product benefits.",
    statusId: "marketing-progress",
    priority: "normal",
    assigneeIds: ["user-bob"],
    dueDate: "2026-10-17",
    position: 1,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },
  {
    id: "task-14",
    listId: "list-marketing",
    title: "Schedule launch announcements",
    description: "Plan announcements across social channels.",
    statusId: "marketing-todo",
    priority: "low",
    assigneeIds: ["user-carol"],
    dueDate: null,
    position: 0,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },
  {
    id: "task-15",
    listId: "list-marketing",
    title: "Review campaign performance",
    description: "Review engagement and conversion metrics after launch.",
    statusId: "marketing-todo",
    priority: "none",
    assigneeIds: [],
    dueDate: "2026-10-20",
    position: 1,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  },
];

// Resource-level permission grants
export const mockPermissionGrants: PermissionGrant[] = [
  // Bob can access the product development space.
  {
    id: "grant-1",
    resourceId: "space-product",
    userId: "user-bob",
    mode: "allow",
  },

  // Bob is explicitly denied access to bug tracking.
  {
    id: "grant-2",
    resourceId: "list-bugs",
    userId: "user-bob",
    mode: "deny",
  },

  // Bob's workspace view is limited to Product Development.
  {
    id: "grant-5",
    resourceId: "space-marketing",
    userId: "user-bob",
    mode: "deny",
  },

  // Carol can access the marketing space.
  {
    id: "grant-3",
    resourceId: "space-marketing",
    userId: "user-carol",
    mode: "allow",
  },

  // Carol is explicitly denied access to development tasks.
  {
    id: "grant-4",
    resourceId: "list-development",
    userId: "user-carol",
    mode: "deny",
  },

  // Carol's workspace view is limited to Marketing.
  {
    id: "grant-6",
    resourceId: "space-product",
    userId: "user-carol",
    mode: "deny",
  },
];

// Initial user for the app
export const initialUserId = "user-alice";
