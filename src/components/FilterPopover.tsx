import { Filter, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TaskStatus, User, TaskFilters } from "../types";
import { FilterField } from "./FilterField";

export function FilterPopover({
  filters,
  statuses,
  users,
  onChange,
  onReset,
}: {
  filters: TaskFilters;
  statuses: TaskStatus[];
  users: User[];
  onChange: (filters: TaskFilters) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeCount = Object.values(filters).filter(
    (value) => value !== "all",
  ).length;
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`flex h-10 cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 text-sm font-medium shadow-sm transition ${activeCount ? "border-brand-500 text-brand-500" : "border-[#e5e8f0] text-[#566078]"}`}
      >
        <Filter size={16} /> Filter
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-72 rounded-2xl border border-[#e5e8f0] bg-white p-4 shadow-popover">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#273149]">Filter tasks</p>
              <p className="mt-0.5 text-xs text-[#98a0b1]">
                Narrow down your current list.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-lg p-1 text-[#9ba3b3] hover:bg-[#f5f6fa]"
            >
              <X size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <FilterField label="Status">
              <select
                value={filters.statusId}
                onChange={(event) =>
                  onChange({ ...filters, statusId: event.target.value })
                }
                className="filter-input"
              >
                <option value="all">All statuses</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Priority">
              <select
                value={filters.priority}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    priority: event.target.value as TaskFilters["priority"],
                  })
                }
                className="filter-input"
              >
                <option value="all">All priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
                <option value="none">None</option>
              </select>
            </FilterField>
            <FilterField label="Assignee">
              <select
                value={filters.assigneeId}
                onChange={(event) =>
                  onChange({ ...filters, assigneeId: event.target.value })
                }
                className="filter-input"
              >
                <option value="all">Everyone</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Due date">
              <select
                value={filters.due}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    due: event.target.value as TaskFilters["due"],
                  })
                }
                className="filter-input"
              >
                <option value="all">Any due date</option>
                <option value="overdue">Overdue</option>
                <option value="no_due">No due date</option>
              </select>
            </FilterField>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e9ebf2] px-3 py-2 text-xs font-semibold text-[#7c8498] hover:bg-[#f7f8fc]"
          >
            <RotateCcw size={13} /> Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
