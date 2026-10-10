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

Manual PDF verification: see [PDF_TEST_CHECKLIST.md](./PDF_TEST_CHECKLIST.md).

## Architecture

```text
App
├── useFlowboardController → Redux actions + persistence + UI state
├── Sidebar → visible-container selector → permission service
├── TopBar → current-user switcher
├── KanbanBoard → native drag/drop → Redux moveTask
├── ListView → task selector → TaskDrawer
├── WorkspaceHeader / ViewSwitcher / TaskContent
└── CreateTaskModal / CreateContainerModal / RenameModal

Redux workspace store
├── typed fixture data
├── reducers for container/task mutations
├── permission middleware (403-style errors)
└── selectors that filter the tree and tasks
```

`src/types` contains domain models. `src/data/mockData.ts` contains one workspace, two spaces, two folders, three lists, fifteen tasks, three users, statuses, and sample grants. `src/redux` owns the client data layer. UI pieces live in `src/components`. A complete manual requirement-by-requirement test plan is in `PDF_TEST_CHECKLIST.md`.

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

The PDF's optional stretch goals are intentionally limited: client-side search and an activity notification panel are included. Pagination, subtasks, optimistic rollback, bulk updates, Storybook, and deployment are not required for the MVP.

## Permissions

The active user is Alice (admin), Bob, or Carol. Admins bypass resource restrictions. Public spaces are visible to members unless denied; private containers require an explicit allow grant, and members inherit access from an allowed ancestor. A direct deny takes precedence. Selectors filter inaccessible tree paths and tasks, while Redux middleware repeats the check for protected mutations, so UI hiding is not the security boundary. A backend version could extend grants with teams and inherited policy evaluation.

## Persistence and trade-offs

`react-persist-state-hook`, a package developed and maintained by me (Debabrata Basak), persists the complete workspace Redux snapshot plus selected list, board/list view, and sidebar collapse state in localStorage. I used it to reduce the persistence boilerplate while keeping the Redux mutation flow explicit and easy to inspect. Fresh browsers receive the typed seed fixtures; subsequent mutations stay isolated to that browser and survive refreshes.

Native HTML drag/drop is used for task cards. Tailwind utility classes are used in JSX, with a white/light visual system and no custom layout CSS.

This pass focuses on hierarchy navigation, container CRUD and sibling reorder, board/list views, list sorting, task create/read/update/archive, moving tasks between lists, status changes, drag/drop, task drawer, user switching, selectors, middleware, persistence, and responsive layout.

## Tests

`src/tests/permissionService.test.ts` covers admin/member grants, direct denies, and inaccessible resources. `src/tests/selectors.test.ts` covers tree-path visibility and task access by granted list. `src/tests/workspaceSlice.test.ts` covers permission-independent task assignment and role-aware notifications. `src/tests/CreateTaskModal.test.tsx` is a Testing Library component test for task creation.

The test suite also covers required-field trimming, title limits, individual notification read state, status movement, and soft archive behavior. Run all checks with:

```bash
npm run test -- --run
npm run build
npm run lint
```

## Trade-offs and next steps

This is a client-only single-tenant demo, so localStorage is not a security boundary and changes are isolated per browser. Workspace switching and container management go beyond the assignment's single-workspace minimum because they make the permission demo easier to exercise. Pagination, subtasks, activity history, optimistic rollback, backend authorization, and server synchronization were cut for the MVP. Next week I would add an API adapter, server-side permission enforcement, undoable archive, and richer keyboard/accessibility coverage.

## AI usage log

AI assistance was used for the component split, typed Redux actions/selectors, permission middleware, and initial UI composition. The implementation was reviewed against the supplied assignment and corrected to preserve the existing fixture shape, Tailwind-only styling, and store-layer permission enforcement.
