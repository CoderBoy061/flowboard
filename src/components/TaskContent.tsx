import { BoardLoadingSkeleton } from "./LoadingSkeleton";
import { KanbanBoard } from "./KanbanBoard";
import { ListView } from "./ListView";
import type { Container, Task, TaskStatus, User } from "../types";

export function TaskContent({
  loading,
  selectedList,
  view,
  tasks,
  statuses,
  users,
  onOpenTask,
  onError,
  onCreateTask,
  onBulkUpdate,
  onToast,
}: {
  loading: boolean;
  selectedList?: Container;
  view: "board" | "list";
  tasks: Task[];
  statuses: TaskStatus[];
  users: User[];
  onOpenTask: (taskId: string) => void;
  onError: (error: unknown) => void;
  onCreateTask: (statusId: string) => void;
  onBulkUpdate: (
    taskIds: string[],
    changes: Partial<Pick<Task, "priority" | "assigneeIds">>,
  ) => void;
  onToast?: (message: string) => void;
}) {
  if (loading) return <BoardLoadingSkeleton />;

  if (!selectedList) {
    return (
      <div className="rounded-2xl border border-dashed border-[#dfe3ec] bg-white py-20 text-center text-sm text-[#8790a3]">
        No lists are available for this user.
      </div>
    );
  }

  if (view === "board") {
    return (
      <KanbanBoard
        listId={selectedList.id}
        tasks={tasks}
        statuses={statuses}
        users={users}
        onOpenTask={onOpenTask}
        onError={onError}
        onCreateTask={onCreateTask}
        onToast={onToast}
      />
    );
  }

  return (
    <ListView
      tasks={tasks}
      statuses={statuses}
      users={users}
      onOpenTask={onOpenTask}
      onBulkUpdate={onBulkUpdate}
    />
  );
}
