import { Plus, Search, Sparkles } from "lucide-react";
import { FilterPopover } from "./FilterPopover";
import type { TaskFilters, TaskStatus, User } from "../types";

export function WorkspaceHeader({
  listName,
  query,
  filters,
  statuses,
  users,
  hasSelectedList,
  onQueryChange,
  onFilterChange,
  onResetFilters,
  onCreateTask,
}: {
  listName: string;
  query: string;
  filters: TaskFilters;
  statuses: TaskStatus[];
  users: User[];
  hasSelectedList: boolean;
  onQueryChange: (query: string) => void;
  onFilterChange: (filters: TaskFilters) => void;
  onResetFilters: () => void;
  onCreateTask: () => void;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
      <div>
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7c8498]">
          <Sparkles size={14} className="text-[#6573f5]" /> Workspace overview
        </div>
        <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#172033]">
          {listName}
        </h1>
        <p className="mt-2 text-sm text-[#7c8498]">
          Keep your team aligned and moving forward.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-10 min-w-[210px] items-center gap-2 rounded-xl border border-[#e5e8f0] bg-white px-3 text-sm text-[#8790a3] shadow-sm">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-transparent outline-none placeholder:text-[#a8afbd]"
          />
        </label>
        <FilterPopover
          filters={filters}
          statuses={statuses}
          users={users}
          onChange={onFilterChange}
          onReset={onResetFilters}
        />
        <button
          type="button"
          onClick={onCreateTask}
          disabled={!hasSelectedList}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-[#5865e9] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(88,101,233,0.22)] transition hover:bg-[#4855d8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={17} /> Add task
        </button>
      </div>
    </div>
  );
}
