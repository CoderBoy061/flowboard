# Flowboard

Flowboard is a small, light-only project-management client for one workspace. It is seeded from typed fixtures and runs without a backend.

## Run locally

Clone the repository and install its dependencies:

```bash
git clone git@github.com:CoderBoy061/flowboard.git
cd flowboard
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). Vite is configured with a strict port, so it will report an error instead of silently switching ports if `3000` is already in use.

Validation: `npm run build` and `npm run test -- --run`.

The detailed PDF verification checklist is kept locally for manual testing and is intentionally not included in the repository.

## Architecture

```text
App
├── useFlowboardController → Redux actions + persistence + UI state
├── Sidebar → visible-container selector → permission service
├── TopBar → current-user switcher
├── KanbanBoard → native drag/drop → Redux moveTask
├── ListView → filtering/sorting/pagination/bulk actions → TaskDrawer
├── WorkspaceHeader / ViewSwitcher / TaskContent
└── CreateTaskModal / CreateContainerModal / RenameModal

Redux workspace store
├── typed fixture data
├── reducers for container/task mutations
├── permission middleware (403-style errors)
└── selectors that filter the tree and tasks
```

`src/types` contains domain models. `src/data/mockData.ts` contains one workspace, two spaces, two folders, three lists, fifteen tasks, three users, statuses, and sample grants. `src/redux` owns the client data layer. UI pieces live in `src/components`. A complete manual requirement-by-requirement test plan is kept locally in `PDF_TEST_CHECKLIST.md`.

## Technology choices

- React and TypeScript provide typed, component-based UI development.
- Vite provides the development server and production build pipeline. The development server is fixed to port `3000`.
- Redux Toolkit was chosen for the client data layer because the assignment needs one predictable source of truth for containers, tasks, statuses, users, grants, notifications, and mutations. It also provides concise reducers, typed actions, and a natural place for permission middleware.
- Redux selectors keep permission filtering and task access rules outside presentation components. The middleware repeats protected mutation checks so hiding a resource in the UI is not the only enforcement layer.
- `react-persist-state-hook`, developed and maintained by me, persists the Redux workspace snapshot and UI preferences to localStorage while reducing persistence boilerplate.
- Tailwind CSS is used through utility classes and a small theme token set for colors, typography, radii, shadows, statuses, and priorities.
- Native HTML drag-and-drop keeps the dependency footprint small. The trade-off is that browser drag behavior is less customizable than a dedicated DnD library.
- Vitest and Testing Library cover store, selector, permission, validation, and component behavior.

## Implemented enhancements

- Multiple assignee selection uses the reusable `MultiSelect` control and stores selected user IDs in `assigneeIds`.
- List view pagination displays three tasks per page and keeps sorting before pagination.
- List view bulk actions update priority or assignees for selected tasks through one Redux mutation.
- Subtasks use `parentTaskId` and `isCompleted`; they are created and completed from the task drawer while remaining grouped under their parent.
- Tasks and containers use soft archive behavior. Administrators can open the archive panel and restore archived records; restoring a container restores its descendants.
- Bulk mutations capture task snapshots and dispatch `rollbackTasks` when a protected mutation fails. The local store is synchronous, so this provides rollback safety for local errors rather than simulating a network request.
- `Pagination`, `MultiSelect`, `Select`, `TextInput`, and `TextArea` are reusable typed controls/components.

## Data model

Containers are ordered nodes with `space`, `folder`, or `list` type and a `parentId`. Containers support `public` or `private` visibility; newly created containers are private by default. Lists own their status sets. Tasks belong to one list, reference a list status, and have title, description, priority, assignees, due date, timestamps, and position. Archive is used as the soft-delete behavior for tasks and containers; archived records remain in the client store but are excluded from selectors.

## Requirement mapping

- The sidebar renders the workspace tree and selects the active list.
- `KanbanBoard` supports status changes, same-column ordering, visible drag feedback, and empty columns.
- `ListView` supports dense task inspection and sorting by due date or priority.
- `TaskDrawer` supports task editing, moving between lists, and admin-only archive confirmation.
- `permissionService`, selectors, and `permissionMiddleware` enforce the PDF's container-grant model. Members can see and edit all tasks in lists they can access; assignment does not create permission grants.
- `LoadingSkeleton`, toast handling, focus states, overlay dismissal, and confirmation dialogs cover the required interaction feedback.
- `NotificationPanel` is an optional activity enhancement. It does not participate in permission decisions.

Task creation trims title, description, and due date. Title is limited to 150 characters by the product UI; description is required but may be one character. These are product validation choices in addition to the assignment's domain model.

## PDF MVP verification checklist

- [x] Typed workspace, container, task, status, user, and grant models
- [x] Seed fixtures: one workspace, two spaces, two folders, three lists, fifteen tasks, three users, and sample grants
- [x] Workspace tree with space, folder, and list navigation
- [x] Container create, rename, archive, and sibling reorder
- [x] Task create, read, update, archive, status change, list move, and position reorder
- [x] Per-list To Do, In Progress, and Done statuses
- [x] Kanban board with drag preview, drop highlight, empty columns, and status-column task creation
- [x] List view with task fields and due-date/priority sorting
- [x] Task detail drawer with editing, Escape, overlay close, and delete confirmation
- [x] Alice, Bob, and Carol user switcher
- [x] Public/private containers, allow/deny grants, admin bypass, and inherited access
- [x] Store/selectors/middleware permission enforcement with consistent errors
- [x] Tailwind-only light visual system with theme tokens
- [x] Loading shimmer, empty states, error toast, hover/focus/active feedback
- [x] LocalStorage persistence through `react-persist-state-hook`
- [x] Unit/store tests and a Testing Library component test
- [x] README architecture, data model, permission, trade-off, and AI usage documentation

The PDF's optional stretch goals are intentionally limited: client-side search and an activity notification panel are included. Pagination, subtasks, rollback safety, bulk updates, and archive restoration are also implemented as local enhancements. Storybook, deployment, and backend/API integration remain outside this client-only project.

## Permissions

The active user is Alice (admin), Bob, or Carol. Admins bypass resource restrictions. Public spaces are visible to members unless denied; private containers require an explicit allow grant, and members inherit access from an allowed ancestor. A direct deny takes precedence. Selectors filter inaccessible tree paths and tasks, while Redux middleware repeats the check for protected mutations, so UI hiding is not the security boundary. A backend version could extend grants with teams and inherited policy evaluation.

## Persistence and trade-offs

`react-persist-state-hook`, a package developed and maintained by me (Debabrata Basak), persists the complete workspace Redux snapshot plus selected list, board/list view, and sidebar collapse state in localStorage. I used it to reduce the persistence boilerplate while keeping the Redux mutation flow explicit and easy to inspect. Fresh browsers receive the typed seed fixtures; subsequent mutations stay isolated to that browser and survive refreshes.

Native HTML drag/drop is used for task cards. Tailwind utility classes are used in JSX, with a white/light visual system and no custom layout CSS.

This pass focuses on hierarchy navigation, container CRUD and sibling reorder, board/list views, list sorting and pagination, bulk task actions, task create/read/update/archive/restore, subtasks, moving tasks between lists, status changes, drag/drop, task drawer, user switching, selectors, middleware, persistence, and responsive layout.

## Tests

`src/tests/permissionService.test.ts` covers admin/member grants, direct denies, and inaccessible resources. `src/tests/selectors.test.ts` covers tree-path visibility and task access by granted list. `src/tests/workspaceSlice.test.ts` covers permission-independent task assignment and role-aware notifications. `src/tests/CreateTaskModal.test.tsx` is a Testing Library component test for task creation.

The test suite also covers required-field trimming, title limits, individual notification read state, status movement, and soft archive behavior. Run all checks with:

```bash
npm run test -- --run
npm run build
npm run lint
```

## Trade-offs and next steps

This is a client-only single-tenant demo, so localStorage is not a security boundary and changes are isolated per browser. Workspace switching, container management, pagination, bulk actions, subtasks, and archive restoration go beyond the assignment's minimum because they make the client demo easier to exercise. Rollback handling is limited to synchronous local mutation failures; a future API adapter would need request IDs, pending state, retry behavior, and server-side rollback conflict handling. Next week I would add server-side authorization, API synchronization, richer keyboard/accessibility coverage, and a deployment workflow.

## AI usage log

AI assistance was used for the component split, typed Redux actions/selectors, permission middleware, and initial UI composition. The implementation was reviewed against the supplied assignment and corrected to preserve the existing fixture shape, Tailwind-only styling, and store-layer permission enforcement.
