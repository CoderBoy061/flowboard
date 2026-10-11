import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { ViewSwitcher } from "./components/ViewSwitcher";
import { TaskContent } from "./components/TaskContent";
import { WorkspaceModal } from "./components/WorkspaceModal";
import { CreateContainerModal } from "./components/CreateContainerModal";
import { RenameModal } from "./components/RenameModal";
import { TaskDrawer } from "./components/TaskDrawer";
import { CreateTaskModal } from "./components/CreateTaskModal";
import { NotificationPanel } from "./components/NotificationPanel";
import { ArchivedItemsPanel } from "./components/ArchivedItemsPanel";
import { useFlowboardController } from "./controllers/useFlowboardController";

function App() {
  const controller = useFlowboardController();
  const {
    workspace,
    canDelete,
    preferences,
    selectedList,
    accessibleLists,
    filteredTasks,
    selectedTask,
    selectedSubtasks,
    archivedTasks,
    archivedContainers,
    query,
    setQuery,
    toast,
    userNotifications,
    unreadNotificationCount,
    isNotificationsOpen,
    isArchiveOpen,
    filters,
    setFilters,
    isLoading,
    isCreateOpen,
    setIsCreateOpen,
    createTaskStatusId,
    openCreateTask,
    isWorkspaceModalOpen,
    setIsWorkspaceModalOpen,
    renameTarget,
    setRenameTarget,
    createTarget,
    setCreateTarget,
    setSelectedTaskId,
    handleCreate,
    handleBulkUpdate,
    handleCreateWorkspace,
    handleRename,
    handleCreateContainer,
    toggleSidebar,
    notifyError,
    selectList,
    changeWorkspace,
    changeUser,
    setViewMode,
    resetFilters,
    toggleNotifications,
    closeNotifications,
    markAllNotificationsRead,
    markNotificationAsRead,
    openArchive,
    closeArchive,
    openCreateWorkspace,
    openRenameWorkspace,
    deleteWorkspaceFromSidebar,
    openRenameContainer,
    openCreateChild,
    deleteContainerFromSidebar,
    reorderContainerSiblings,
    showToast,
  } = controller;

  const selectedStatuses =
    workspace.statusesByList[selectedList?.id ?? ""] ?? [];

  return (
    <div className="min-h-screen bg-canvas font-display text-ink-900">
      <div className="flex min-h-screen">
        <Sidebar
          collapsed={preferences.sidebarCollapsed}
          onToggle={toggleSidebar}
          selectedListId={selectedList?.id ?? ""}
          onSelectList={selectList}
          workspaces={workspace.workspaces}
          currentWorkspaceId={workspace.currentWorkspaceId}
          onWorkspaceChange={changeWorkspace}
          onCreateWorkspace={openCreateWorkspace}
          onOpenArchive={openArchive}
          onRenameWorkspace={openRenameWorkspace}
          onDeleteWorkspace={deleteWorkspaceFromSidebar}
          onRenameContainer={openRenameContainer}
          onCreateChild={openCreateChild}
          onDeleteContainer={deleteContainerFromSidebar}
          onReorderContainers={reorderContainerSiblings}
          canDelete={canDelete}
          loading={isLoading}
        />
        <main className="min-w-0 flex-1">
          <TopBar
            userId={workspace.currentUserId}
            users={workspace.users}
            onUserChange={changeUser}
            unreadNotificationCount={unreadNotificationCount}
            onNotificationClick={toggleNotifications}
          />
          <div className="mx-auto max-w-[1600px] px-5 pb-10 pt-6 sm:px-8 lg:px-10">
            <WorkspaceHeader
              listName={selectedList?.name ?? "No accessible list"}
              query={query}
              filters={filters}
              statuses={selectedStatuses}
              users={workspace.users}
              hasSelectedList={Boolean(selectedList)}
              onQueryChange={setQuery}
              onFilterChange={setFilters}
              onResetFilters={resetFilters}
              onCreateTask={() => openCreateTask()}
            />
            <ViewSwitcher
              view={preferences.view}
              taskCount={filteredTasks.length}
              onChange={setViewMode}
            />
            <TaskContent
              loading={isLoading}
              selectedList={selectedList}
              view={preferences.view}
              tasks={filteredTasks}
              statuses={selectedStatuses}
              users={workspace.users}
              onOpenTask={setSelectedTaskId}
              onError={notifyError}
              onCreateTask={openCreateTask}
              onBulkUpdate={handleBulkUpdate}
              onToast={showToast}
            />
          </div>
        </main>
      </div>
      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          statuses={workspace.statusesByList[selectedTask.listId] ?? []}
          lists={accessibleLists}
          statusesByList={workspace.statusesByList}
          users={workspace.users}
          subtasks={selectedSubtasks}
          onClose={() => setSelectedTaskId(null)}
          onError={notifyError}
          onCreateSubtask={controller.handleCreateSubtask}
          onToggleSubtask={controller.handleToggleSubtask}
          canDelete={canDelete}
          onToast={showToast}
        />
      )}
      {isCreateOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreate}
          statuses={selectedStatuses}
          users={workspace.users}
          initialStatusId={createTaskStatusId}
        />
      )}
      {isWorkspaceModalOpen && (
        <WorkspaceModal
          onClose={() => setIsWorkspaceModalOpen(false)}
          onCreate={handleCreateWorkspace}
        />
      )}
      {renameTarget && (
        <RenameModal
          label={renameTarget.type}
          initialName={renameTarget.name}
          onClose={() => setRenameTarget(null)}
          onRename={handleRename}
        />
      )}
      {createTarget && (
        <CreateContainerModal
          type={createTarget.type}
          onClose={() => setCreateTarget(null)}
          onCreate={handleCreateContainer}
        />
      )}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl bg-[#20283a] px-4 py-3 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}
      {isNotificationsOpen && (
        <NotificationPanel
          notifications={userNotifications}
          users={workspace.users}
          containers={workspace.containers}
          workspaces={workspace.workspaces}
          onClose={closeNotifications}
          onMarkAllRead={markAllNotificationsRead}
          onMarkRead={markNotificationAsRead}
        />
      )}
      {isArchiveOpen && (
        <ArchivedItemsPanel
          tasks={archivedTasks}
          containers={archivedContainers}
          onClose={closeArchive}
          onRestoreTask={controller.handleRestoreTask}
          onRestoreContainer={controller.handleRestoreContainer}
        />
      )}
    </div>
  );
}

export default App;
