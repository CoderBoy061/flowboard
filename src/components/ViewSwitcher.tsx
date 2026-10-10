import { LayoutGrid, List } from "lucide-react";

export function ViewSwitcher({
  view,
  taskCount,
  onChange,
}: {
  view: "board" | "list";
  taskCount: number;
  onChange: (view: "board" | "list") => void;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-1 rounded-xl border border-[#e5e8f0] bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => onChange("board")}
          className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${view === "board" ? "bg-[#eef0ff] text-[#5865e9]" : "text-[#8790a3]"}`}
        >
          <LayoutGrid size={16} /> Board
        </button>
        <button
          type="button"
          onClick={() => onChange("list")}
          className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${view === "list" ? "bg-[#eef0ff] text-[#5865e9]" : "text-[#8790a3]"}`}
        >
          <List size={16} /> List
        </button>
      </div>
      <span className="text-xs font-medium text-[#98a0b1]">
        {taskCount} {taskCount === 1 ? "task" : "tasks"}
      </span>
    </div>
  );
}
