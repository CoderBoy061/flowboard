import { Check, ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function WorkspaceSwitcher({
  workspaces,
  currentId,
  onChange,
  onRename,
  onDelete,
  onCreate,
  canManage,
}: {
  workspaces: { id: string; name: string }[];
  currentId: string;
  onChange: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  canManage: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = workspaces.find((item) => item.id === currentId) ?? workspaces[0];

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex max-w-[175px] cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-[#8d96a8] transition hover:bg-[#f7f8fc] hover:text-[#5865e9]"
      >
        <span className="truncate">{current?.name ?? "Workspace"}</span>
        <ChevronDown size={14} className={`shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-xl border border-[#e6e9f0] bg-white p-1.5 shadow-[0_12px_30px_rgba(35,45,75,0.14)]">
          <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a0a8b8]">
            Your workspaces
          </p>
          {workspaces.map((workspace) => (
            <div key={workspace.id} className="group/workspace flex items-center rounded-lg transition hover:bg-[#f4f5ff]">
              <button
                type="button"
                onClick={() => { onChange(workspace.id); setOpen(false); }}
                className="min-w-0 flex-1 cursor-pointer truncate px-3 py-2.5 text-left text-sm font-semibold text-[#273149]"
              >
                {workspace.name}
              </button>
              {canManage && (
                <div className="flex items-center opacity-0 transition group-hover/workspace:opacity-100">
                  {workspace.id === currentId && (
                    <button type="button" onClick={() => { onRename(workspace.id); setOpen(false); }} aria-label={`Rename ${workspace.name}`} title="Rename workspace" className="cursor-pointer rounded-md p-1.5 text-[#8d96a8] hover:text-[#5865e9]">
                      <Pencil size={13} />
                    </button>
                  )}
                  <button type="button" onClick={() => { onDelete(workspace.id); setOpen(false); }} aria-label={`Delete ${workspace.name}`} title="Delete workspace" className="cursor-pointer rounded-md p-1.5 text-[#8d96a8] hover:text-[#d94d5d]">
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
              {workspace.id === currentId && <Check size={16} className="mr-2 shrink-0 text-[#5865e9]" />}
            </div>
          ))}
          {canManage && (
            <button type="button" onClick={() => { onCreate(); setOpen(false); }} className="mt-1 flex w-full cursor-pointer items-center gap-2 border-t border-[#eef0f5] px-3 py-2.5 text-left text-xs font-semibold text-[#5865e9] hover:bg-[#f4f5ff]">
              <Plus size={14} /> New workspace
            </button>
          )}
        </div>
      )}
    </div>
  );
}
