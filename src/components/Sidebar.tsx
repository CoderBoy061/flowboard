import { FolderPlus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { useAppSelector } from "../redux/hooks";
import { selectVisibleContainers } from "../redux/selectors";
import { TreeNode } from "./TreeNode";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { TreeLoadingSkeleton } from "./LoadingSkeleton";

export const Sidebar = memo(function Sidebar({
  collapsed,
  onToggle,
  selectedListId,
  onSelectList,
  workspaces,
  currentWorkspaceId,
  onWorkspaceChange,
  onCreateWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace,
  onRenameContainer,
  onCreateChild,
  onDeleteContainer,
  onReorderContainers,
  canDelete,
  loading,
}: {
  collapsed: boolean;
  onToggle: () => void;
  selectedListId: string;
  onSelectList: (id: string) => void;
  workspaces: { id: string; name: string }[];
  currentWorkspaceId: string;
  onWorkspaceChange: (id: string) => void;
  onCreateWorkspace: () => void;
  onRenameWorkspace: (id: string) => void;
  onDeleteWorkspace: (id: string) => void;
  onRenameContainer: (id: string) => void;
  onCreateChild: (parentId: string | null, type: "space" | "folder" | "list") => void;
  onDeleteContainer: (id: string) => void;
  onReorderContainers: (parentId: string | null, orderedIds: string[]) => void;
  canDelete: boolean;
  loading: boolean;
}) {
  const visible = useAppSelector(selectVisibleContainers);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "space-product": true,
    "space-marketing": true,
    "folder-frontend": true,
    "folder-campaigns": true,
  });
  const spaces = useMemo(
    () =>
      visible
        .filter((item) => item.type === "space")
        .sort((a, b) => a.position - b.position),
    [visible],
  );
  if (collapsed)
    return (
      <aside className="hidden w-[72px] shrink-0 border-r border-[#e8ebf2] bg-white p-4 lg:block">
        <button
          onClick={onToggle}
          className="cursor-pointer rounded-xl p-2 text-[#7c8498] hover:bg-[#f5f6fa]"
          title="Expand sidebar"
        >
          <PanelLeftOpen size={20} />
        </button>
      </aside>
    );
  return (
    <aside className="hidden w-[270px] shrink-0 border-r border-[#e8ebf2] bg-white lg:block">
      <div className="flex h-[72px] items-center justify-between border-b border-[#eef0f5] px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5865e9] text-sm font-black text-white">
            F
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-[-0.02em]">
              Flowboard
            </p>
            <p className="text-[11px] font-medium text-[#a2a9b8]">
              Personal workspace
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="cursor-pointer rounded-lg p-1.5 text-[#9ba3b3] hover:bg-[#f5f6fa]"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>
      <div className="px-4 py-5">
        <div className="mb-4 flex items-center justify-between px-2">
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentId={currentWorkspaceId}
            onChange={onWorkspaceChange}
            onRename={onRenameWorkspace}
            onDelete={onDeleteWorkspace}
            onCreate={onCreateWorkspace}
            canManage={canDelete}
          />
          {canDelete && <button onClick={() => onCreateChild(null, "space")} className="cursor-pointer text-[#a2a9b8] hover:text-[#5865e9]" title="Create space">
            <FolderPlus size={15} />
          </button>}
        </div>
        {loading ? <TreeLoadingSkeleton /> : <div className="space-y-1">
          {spaces.map((space) => (
            <TreeNode
              key={space.id}
              node={space}
              all={visible}
              expanded={expanded}
              setExpanded={setExpanded}
              selectedListId={selectedListId}
              onSelectList={onSelectList}
              onRename={onRenameContainer}
              onCreateChild={onCreateChild}
              onDelete={onDeleteContainer}
              onReorder={onReorderContainers}
              canDelete={canDelete}
            />
          ))}
        </div>}
      </div>
      <div className="mt-auto border-t border-[#eef0f5] px-6 py-5">
        <p className="text-xs leading-5 text-[#98a0b1]">
          Select a list to focus your team’s work.
        </p>
      </div>
    </aside>
  );
});
