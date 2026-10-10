import { ArchiveRestore, X } from "lucide-react";
import type { Container, Task } from "../types";

// Lists archived resources and exposes administrator restore actions.
export function ArchivedItemsPanel({
  tasks,
  containers,
  onClose,
  onRestoreTask,
  onRestoreContainer,
}: {
  tasks: Task[];
  containers: Container[];
  onClose: () => void;
  onRestoreTask: (id: string) => void;
  onRestoreContainer: (id: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 bg-[#172033]/20"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="archived-items-title"
        className="absolute right-0 top-0 h-full w-full max-w-[420px] overflow-y-auto bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-7 flex items-start justify-between">
          <div>
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#5865e9]">
              <ArchiveRestore size={15} /> Archive
            </span>
            <h2 id="archived-items-title" className="mt-2 text-2xl font-bold text-[#20283a]">
              Archived items
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close archive"
            className="cursor-pointer rounded-xl p-2 text-[#9ba3b3] transition hover:bg-[#f5f6fa]"
          >
            <X size={20} />
          </button>
        </div>

        <section aria-labelledby="archived-containers-heading">
          <h3 id="archived-containers-heading" className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#a0a8b8]">
            Folders, spaces and lists
          </h3>
          <div className="divide-y divide-[#eef0f5] rounded-xl border border-[#eef0f5]">
            {containers.map((container) => (
              <div key={container.id} className="flex items-center justify-between gap-3 px-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#273149]">{container.name}</p>
                  <p className="text-xs capitalize text-[#98a0b1]">{container.type}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRestoreContainer(container.id)}
                  className="shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#5865e9] hover:bg-[#eef0ff]"
                >
                  Restore
                </button>
              </div>
            ))}
            {!containers.length && <p className="px-3 py-4 text-sm text-[#98a0b1]">No archived containers.</p>}
          </div>
        </section>

        <section aria-labelledby="archived-tasks-heading" className="mt-7">
          <h3 id="archived-tasks-heading" className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#a0a8b8]">
            Tasks
          </h3>
          <div className="divide-y divide-[#eef0f5] rounded-xl border border-[#eef0f5]">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 px-3 py-3">
                <p className="min-w-0 truncate text-sm font-semibold text-[#273149]">{task.title}</p>
                <button
                  type="button"
                  onClick={() => onRestoreTask(task.id)}
                  className="shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#5865e9] hover:bg-[#eef0ff]"
                >
                  Restore
                </button>
              </div>
            ))}
            {!tasks.length && <p className="px-3 py-4 text-sm text-[#98a0b1]">No archived tasks.</p>}
          </div>
        </section>
      </aside>
    </div>
  );
}
