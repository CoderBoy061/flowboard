# Flowboard

Flowboard is a client-side task management app built for the supplied frontend take-home assignment. It provides workspace navigation, task management, Kanban and list views, simple permissions, and local persistence without a backend.

## Demo

[Open the hosted Netlify demo](https://flowboard-kanban.netlify.app/)

## Run locally

```bash
git clone git@github.com:CoderBoy061/flowboard.git
cd flowboard
npm install
npm run dev
```

The development server runs at [http://localhost:3000](http://localhost:3000). Vite uses a strict port and reports an error if port `3000` is already in use.

Run the checks with:

```bash
npm run test -- --run
npm run build
npm run lint
```

Generate a coverage report and open it in a browser:

```bash
npm test -- --coverage --run
```

Then open the generated report in a browser:

- In VS Code: open the generated file at `coverage/index.html` from the Explorer, then right-click and choose “Open in Browser” or “Open with Default Browser”.
- In a terminal: run `xdg-open coverage/index.html` on Linux.

This produces a local HTML coverage report showing statements, branches, functions, and lines covered.

## What is implemented

- Workspace → space → folder → list hierarchy with create, rename, archive, restore, and sibling reordering.
- Task create, edit, archive, restore, list movement, status changes, and Kanban reordering.
- Kanban and dense list views for the selected list.
- Per-list statuses: To Do, In Progress, and Done.
- Search, filtering, due-date/priority sorting, pagination, bulk priority/assignee updates, and subtasks.
- Multiple assignees with initials on cards and full names in task details.
- Alice (admin), Bob (member), and Carol (member) user switching.
- Container-level allow/deny permissions with admin bypass and permission-aware selectors.
- Activity notifications with read/unread state.
- Loading skeletons, empty states, error toasts, drag/drop feedback, confirmation dialogs, and reusable form controls.
- Netlify deployment and SPA routing support through `public/_redirects`.

## Architecture

```text
App
├── useFlowboardController
│   ├── Redux actions and selectors
│   ├── localStorage persistence
│   └── view, modal, filter, and notification state
├── Sidebar / TopBar
│   └── permission-filtered navigation and user switching
├── TaskContent
│   ├── KanbanBoard → drag/drop → Redux moveTask
│   └── ListView → search, sort, pagination, bulk updates
└── TaskDrawer / modals / reusable controls

Redux workspace store
├── typed fixture data
├── task, container, workspace, and notification reducers
├── permission middleware for protected mutations
└── selectors for visible containers and tasks
```

## Main technical decisions

### React, TypeScript, and Vite

React fits the component-based UI, TypeScript keeps the domain model explicit, and Vite provides a fast development/build workflow with minimal configuration.

### Redux Toolkit

I chose Redux Toolkit because the app has related entities—workspaces, containers, tasks, statuses, users, grants, and notifications—that must stay consistent when users switch accounts or move tasks. A single typed store also gives permission checks and mutations one predictable location.

### Permission service and middleware

Permission checks are not limited to hiding UI. `permissionService.ts` contains the access rules, selectors filter the visible tree and tasks, and `permissionMiddleware.ts` protects mutations with consistent `{ error: { code, message } }` errors.

The model is intentionally simple:

```ts
{ resourceId, userId, mode: "allow" | "deny" }
```

Admins bypass restrictions. Members can access public containers unless denied, while private containers require an explicit allow grant. A future backend could add server-side authorization, teams, and more advanced policies.

Task assignment is separate from permission: assigning Bob to a task does not grant access to its list. A direct deny grant always wins, so Bob cannot view or mutate a denied list even when assigned to a task inside it.

### Local persistence

There is no backend in the assignment, so the Redux workspace snapshot and UI preferences are stored in localStorage. I use `react-persist-state-hook`, a package developed and maintained by me (Debabrata Basak), to reduce persistence boilerplate while keeping Redux as the source of truth.

This is useful for the demo, but localStorage is not a security boundary and data is isolated to the current browser/device.

### Tailwind CSS

Tailwind utility classes keep layout and component styling close to the JSX. Shared theme tokens in `src/index.css` provide consistent colors, typography, radii, shadows, status colors, and priority colors.

### Native drag-and-drop

I used native HTML drag-and-drop instead of adding a DnD library to keep the dependency footprint small. This supports status changes, same-column ordering, drag previews, and drop highlights. The trade-off is that native drag behavior is less customizable and needs additional accessibility work for keyboard-only users.

## Data model

- A workspace contains spaces.
- Spaces contain folders.
- Folders contain lists.
- Lists own their status sets and contain tasks.
- Tasks store `listId`, `statusId`, title, description, priority, `assigneeIds`, due date, position, timestamps, and archive state.
- Containers and tasks use soft archive instead of permanent deletion.
- `parentTaskId` supports one level of subtasks.

Seed data contains one workspace, two spaces, two folders, three lists, fifteen tasks, three users, statuses, and sample permission grants.

## PDF requirement status

The required MVP is covered, including the PDF task-field rules: titles allow up to 500 characters, and description and due date are optional. Due dates are stored as ISO datetimes.

- Typed models and seed fixtures.
- Container hierarchy, CRUD, archive behavior, and sibling ordering.
- Task CRUD, list movement, status changes, and position ordering.
- Kanban and list views with the required task fields.
- Alice, Bob, and Carol with permission-aware tree/task access.
- Store-level permission enforcement and consistent errors.
- Loading, empty, error, feedback, and drag/drop states.
- Local client data layer, tests, and README documentation.

The detailed manual PDF checklist is kept locally and is intentionally not committed to the repository.

## Stretch goals attempted

The assignment recommends choosing at most two stretch goals. I selected these as the primary stretch goals:

1. **Client-side search** — searches task titles and descriptions.
2. **Activity feed** — shows role-aware task activity and read/unread notifications.

Additional local enhancements were also implemented: pagination, subtasks, bulk updates, archive restoration, and rollback safety for synchronous local mutations. Storybook and backend/API integration were intentionally not added because they were outside the client-only assignment scope.

## What could be improved

These are deliberate limits of this submission, not missing PDF MVP requirements:

- Replace localStorage with a backend and server-side authorization.
- Add API loading, retry, request IDs, and real optimistic rollback for network failures.
- Add keyboard-accessible drag-and-drop or use a dedicated DnD library.
- Add a full focus trap and focus restoration for drawers and dialogs.
- Add Storybook if the component library grows or needs isolated visual review.
- Add more end-to-end tests for drag/drop, user switching, and permission-denied mutations.

## Trade-offs and week 2 plan

This submission intentionally keeps the scope narrow to the client-only assignment. The main cuts were:

- No backend or real authentication; the app uses localStorage and a local Redux snapshot instead.
- No external drag-and-drop library; native HTML drag-and-drop keeps dependencies smaller and matches the assignment constraint.
- No Storybook, no API layer, and no server-side authorization or persistence pipeline.
- No broad end-to-end suite beyond the current unit/component validation focused on the PDF requirements.

If I had a second week, the next improvements would be:

1. Add a real backend with CRUD APIs and server-side authorization.
2. Add keyboard-accessible drag-and-drop and stronger focus management for drawers and dialogs.
3. Add end-to-end tests for drag/drop flows, user switching, and permission-denied mutations.
4. Add a richer loading/error model with request IDs, retry handling, and real optimistic rollback.
5. Improve accessibility and visual polish for keyboard and screen-reader users.

## Tests

The test suite includes permission, selector, store, validation, and component coverage for:

- Permission filtering and denied access.
- A structured `FORBIDDEN` error for a denied store mutation.
- Selector visibility for containers and tasks.
- Store task mutations, movement, archive behavior, and notifications.
- Task creation and validation through Testing Library.
- Required-field trimming and title limits.

## AI usage log

AI tools used in this project included VS Code Copilot and related AI-assisted coding support during development.

Where AI helped:

- Breaking the UI into focused React components.
- Drafting typed Redux models, selectors, reducers, and middleware.
- Proposing permission logic and access patterns consistent with the assignment.
- Skeletonizing tests and helping validate edge cases around task creation and validation.
- Speeding up iteration on README structure and architecture documentation.

Where I corrected or tightened the AI output:

- The permission model was corrected to match the PDF: task assignment does not grant container access; container grants and deny rules control visibility and mutation rights.
- The direct deny rule was enforced as the strongest rule, so denied lists remain inaccessible even when assigned to a task inside them.
- The app was kept client-only; AI suggestions that implied a backend or server-side auth layer were removed.
- Tailwind-only styling was preserved, and inline `style=` layout decisions were avoided.
- Unused or out-of-scope features, such as extra access-management UI and a non-required dark mode, were removed during review.

The final implementation was reviewed against the supplied assignment PDF and the live code/tests before being kept in the final submission.

## DnD styling note

The app uses native HTML drag-and-drop. No inline `style=` layout or theme styles are used; drag preview and drop states are represented with Tailwind classes. The only styling trade-off is the browser-controlled native drag preview.
