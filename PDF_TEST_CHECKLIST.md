# Flowboard PDF Test Checklist

Use this checklist to verify the implementation against the supplied take-home assignment. The sections follow the PDF order. Check each item manually after starting the app with `npm run dev`.

## 0. Scope and setup

- [ ] The app runs with `npm install` followed by `npm run dev`.
- [ ] The app is a React + TypeScript + Vite client.
- [ ] There is no backend, API, database, login flow, billing, file upload, or email integration.
- [ ] The interface uses a light theme only. Dark mode is explicitly out of scope in the PDF.
- [ ] The app represents a single team/workspace use case. Additional workspace switching is an optional enhancement.

## 1. Hierarchy: containers

Required tree:

```text
Workspace
└── Space
    └── Folder
        └── List
            └── Tasks
```

- [ ] The sidebar displays the workspace tree.
- [ ] Each container has an id, name, type, parentId, position, and archive state.
- [ ] Spaces can be created.
- [ ] Folders can be created inside spaces.
- [ ] Lists can be created inside folders.
- [ ] Invalid parent relationships are rejected by the store.
- [ ] Containers can be renamed.
- [ ] Containers can be read through the sidebar tree.
- [ ] Containers can be archived/soft-deleted.
- [ ] Archiving a parent archives its descendants.
- [ ] Archived containers disappear from the visible tree.
- [ ] Sibling containers can be reordered with drag-and-drop.
- [ ] Sibling positions remain correct after reordering and refresh.
- [ ] Container changes persist after a browser refresh.

## 2. Tasks

Verify that every task has:

- [ ] A title.
- [ ] A primary list.
- [ ] A valid status from that list's status set.
- [ ] A priority: urgent, high, normal, low, or none.
- [ ] An assigneeIds array.
- [ ] A due date field.
- [ ] A position.
- [ ] createdAt and updatedAt timestamps.

Task operations:

- [ ] Create a task from the main Add task button.
- [ ] Create a task from a Kanban column `+` button.
- [ ] Verify the Kanban column status is preselected when using its `+` button.
- [ ] Read/open a task from a Kanban card.
- [ ] Read/open a task from a list-view row.
- [ ] Edit the task title.
- [ ] Verify the title is trimmed before saving.
- [ ] Verify the title maximum is 150 characters in the product UI.
- [ ] Edit the description.
- [ ] Verify a whitespace-only description is rejected.
- [ ] Edit status, priority, due date, assignee, and list.
- [ ] Move a task between lists.
- [ ] Move a task between status columns.
- [ ] Reorder tasks within the same status column.
- [ ] Verify task positions persist after refresh.
- [ ] Archive/delete a task through the confirmation dialog.
- [ ] Verify archived tasks disappear from board and list selectors.
- [ ] Verify task mutations persist after refresh.

Note: the PDF makes description and due date optional. The product implementation adds a non-empty description and due-date requirement for newly created tasks as an explicit product decision.

## 3. Status configuration

- [ ] Every list has its own status set.
- [ ] Every list has To Do / todo.
- [ ] Every list has In Progress / in_progress.
- [ ] Every list has Done / done.
- [ ] Each status has id, name, category, color, and position.
- [ ] A task cannot be created with a status that does not belong to its list.
- [ ] A task cannot be updated with a status that does not belong to its list.
- [ ] A task cannot be moved to an invalid target-list status.
- [ ] Status order is respected by the Kanban columns.

## 4A. Kanban board

- [ ] The selected list loads its status columns.
- [ ] Cards show task title.
- [ ] Cards show priority.
- [ ] Cards show assignee initials/avatars.
- [ ] Cards show due date when present.
- [ ] Dragging a card shows a visible drag state.
- [ ] Dragging over a column highlights the drop target.
- [ ] Dropping into another column updates the task status.
- [ ] Dropping above/below another card updates task position.
- [ ] Empty columns show an empty/drop state.
- [ ] The Kanban layout remains usable at supported desktop widths.

## 4B. List view

- [ ] Switch from Board to List.
- [ ] List rows show title and description preview.
- [ ] List rows show status.
- [ ] List rows show assignees.
- [ ] List rows show priority.
- [ ] List rows show due date.
- [ ] Clicking a row opens the task drawer.
- [ ] Sort by manual position.
- [ ] Sort by due date.
- [ ] Sort by priority.
- [ ] Empty/search-filtered lists show an empty state.

## 4C. Sidebar

- [ ] The tree can expand and collapse spaces and folders.
- [ ] Selecting a list loads that list's tasks.
- [ ] The selected list has a visible active state.
- [ ] The sidebar has loading skeleton feedback.
- [ ] The sidebar has hover, focus, and active states.
- [ ] Sidebar reorder feedback is visible during drag-and-drop.

## 5. Permissions

Seed users:

- [ ] Alice is an admin.
- [ ] Bob is a member.
- [ ] Carol is a member.
- [ ] The top-bar user switcher makes all three users easy to select.

Required behavior:

- [ ] Alice sees every workspace resource.
- [ ] Alice can edit tasks in accessible resources.
- [ ] Bob sees only spaces/lists granted to Bob.
- [ ] Carol sees only spaces/lists granted to Carol.
- [ ] Bob and Carol see all tasks in lists they can access, including unassigned tasks.
- [ ] Bob and Carol can edit tasks in lists they can access.
- [ ] A public container is visible unless explicitly denied.
- [ ] A private container requires an explicit allow grant.
- [ ] Admin access bypasses resource restrictions.
- [ ] A direct deny takes precedence over an allow.
- [ ] A permitted nested list keeps the necessary space/folder path visible.
- [ ] A denied resource is excluded from selectors/tree results.
- [ ] Opening or mutating an inaccessible resource returns a clear 403-style error.
- [ ] Permission checks work in selectors and the store/middleware, not only in UI hiding.
- [ ] Switching users immediately refreshes the tree and task view.

## 6. Client data layer

- [ ] Domain models are typed for containers.
- [ ] Domain models are typed for tasks.
- [ ] Domain models are typed for statuses.
- [ ] Domain models are typed for users.
- [ ] Domain models are typed for grants.
- [ ] Seed data contains one workspace.
- [ ] Seed data contains two spaces.
- [ ] Seed data contains two folders.
- [ ] Seed data contains three lists.
- [ ] Seed data contains fifteen or more tasks.
- [ ] Seed data contains three users.
- [ ] Seed data contains sample grants.
- [ ] Mutations go through Redux actions/reducers.
- [ ] Permission failures use `{ error: { code, message } }`.
- [ ] Refreshing the browser restores the saved client state.
- [ ] A fresh browser/localStorage receives the seed fixtures.
- [ ] Pagination is optional and is not required for MVP completion.

## 7. UX and look-and-feel

Styling:

- [ ] Styling uses Tailwind utilities in JSX.
- [ ] Tailwind theme tokens cover colors, font family, radius, and shadows.
- [ ] The app uses one coherent sidebar/top-bar/main-content shell.
- [ ] Status colors are consistent in board and list views.
- [ ] Priority colors are consistent in board and list views.
- [ ] Typography and spacing look intentional and consistent.
- [ ] The app remains light-only.

Interaction quality:

- [ ] Tree loading uses a skeleton/shimmer.
- [ ] Board/list loading uses a skeleton/shimmer.
- [ ] Empty lists have an empty state.
- [ ] Empty Kanban columns have an empty state.
- [ ] Mutation failures show a toast or inline error.
- [ ] Permission failures show a clear error.
- [ ] Buttons have pointer, hover, focus, and active states.
- [ ] Tree items have hover, focus, and active states.
- [ ] Cards and list rows have hover/focus feedback.
- [ ] Drag preview and drop-target feedback are visible.
- [ ] Drag status/position changes persist.
- [ ] The task drawer closes with Escape.
- [ ] The task drawer closes when its overlay is clicked.
- [ ] The task drawer has sensible focus behavior.
- [ ] The user switcher is obvious.
- [ ] Alice vs Bob permission differences can be demonstrated in under 30 seconds.

## 8. Tests

- [ ] Unit tests cover permission filtering on the tree.
- [ ] Unit/store tests cover task access.
- [ ] Tests cover public/private and allow/deny behavior.
- [ ] Tests cover task validation and trimming.
- [ ] Tests cover task movement and archive behavior.
- [ ] Tests cover notification read state.
- [ ] At least one Testing Library component test passes.
- [ ] `npm run test -- --run` passes.
- [ ] `npm run build` passes.
- [ ] `npm run lint` passes.

## 9. README documentation

- [ ] README explains how to run locally.
- [ ] README contains an architecture diagram.
- [ ] README explains the data model.
- [ ] README explains permission enforcement.
- [ ] README documents trade-offs.
- [ ] README documents next steps.
- [ ] README includes an AI usage log or links to `AI_USAGE.md`.
- [ ] README documents any drag-and-drop style exceptions.

## 10. Optional enhancements

The PDF says to choose at most two. Current optional enhancements:

- [x] Client-side task search.
- [x] Activity/notification panel.
- [ ] Pagination.
- [ ] Subtasks.
- [ ] Optimistic drag-and-drop rollback.
- [ ] Bulk updates.
- [ ] Keyboard shortcuts beyond Escape and normal control navigation.
- [ ] Deployed preview.
- [ ] Storybook.

## 11. Submission deliverables

- [x] Source code.
- [x] README.
- [x] AI usage documentation.
- [x] GitHub repository exists at `github.com/CoderBoy061/flowboard`.
- [ ] Three-to-five-minute demo video covering tree navigation, Kanban drag, UX, and Alice/Bob permissions.

## Current automated baseline

The project currently has 21 passing tests across 5 test files. Always rerun the three commands in section 8 after manual testing or code changes.
