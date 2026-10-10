import {
  ChevronDown,
  ChevronRight,
  Folder,
  Layers3,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

export type TreeNodeData = {
  id: string;
  name: string;
  type: "space" | "folder" | "list";
  parentId: string | null;
  position: number;
};

type TreeNodeProps = {
  node: TreeNodeData;
  all: TreeNodeData[];
  expanded: Record<string, boolean>;
  setExpanded: Dispatch<SetStateAction<Record<string, boolean>>>;
  selectedListId: string;
  onSelectList: (id: string) => void;
  onRename: (id: string) => void;
  onCreateChild: (parentId: string, type: "folder" | "list") => void;
  onDelete: (id: string) => void;
  onReorder: (parentId: string | null, orderedIds: string[]) => void;
  canDelete: boolean;
};

export function TreeNode({
  node,
  all,
  expanded,
  setExpanded,
  selectedListId,
  onSelectList,
  onRename,
  onCreateChild,
  onDelete,
  onReorder,
  canDelete,
}: TreeNodeProps) {
  const children = all
    .filter((item) => item.parentId === node.id)
    .sort((a, b) => a.position - b.position);
  const hasChildren = children.length > 0;
  const isOpen = expanded[node.id] ?? false;
  const Icon =
    node.type === "space"
      ? Layers3
      : node.type === "folder"
        ? Folder
        : ListChecks;
  const isSelected = selectedListId === node.id;
  const [dragOver, setDragOver] = useState(false);

  return (
    <div>
      <div
        draggable={canDelete}
        onDragStart={(event) => {
          if (!canDelete) return;
          event.dataTransfer.setData("containerId", node.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(event) => {
          if (!canDelete) return;
          const source = all.find(
            (item) => item.id === event.dataTransfer.getData("containerId"),
          );
          if (!source || source.parentId !== node.parentId || source.id === node.id) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          if (!canDelete) return;
          event.preventDefault();
          event.stopPropagation();
          const source = all.find(
            (item) => item.id === event.dataTransfer.getData("containerId"),
          );
          if (!source || source.parentId !== node.parentId || source.id === node.id) return;
          const siblings = all
            .filter((item) => item.parentId === node.parentId)
            .sort((a, b) => a.position - b.position)
            .map((item) => item.id)
            .filter((id) => id !== source.id);
          const targetIndex = siblings.indexOf(node.id);
          const bounds = event.currentTarget.getBoundingClientRect();
          const insertIndex = event.clientY > bounds.top + bounds.height / 2
            ? targetIndex + 1
            : targetIndex;
          siblings.splice(insertIndex, 0, source.id);
          onReorder(node.parentId, siblings);
          setDragOver(false);
        }}
        onDragEnd={() => setDragOver(false)}
        className={`group/tree-row flex w-full items-center rounded-lg transition ${isSelected ? "bg-[#eef0ff]" : "hover:bg-[#f7f8fc]"} ${dragOver ? "ring-2 ring-[#5865e9]/30" : ""}`}
      >
        <button
          type="button"
          title={node.type === "list" ? "Open list" : "Expand or collapse"}
          onClick={() =>
            node.type === "list"
              ? onSelectList(node.id)
              : setExpanded((current) => ({ ...current, [node.id]: !isOpen }))
          }
          className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${isSelected ? "font-semibold text-[#5865e9]" : "text-[#667087] hover:text-[#172033]"}`}
        >
          {hasChildren ? (
            isOpen ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : (
            <span className="w-[14px]" />
          )}
          <Icon
            size={16}
            className={node.type === "space" ? "text-[#5865e9]" : "text-[#9da5b5]"}
          />
          <span className="truncate">{node.name}</span>
        </button>
        <div className="flex shrink-0 items-center pr-1 opacity-0 transition group-hover/tree-row:opacity-100">
          {canDelete && <button
            type="button"
            onClick={() => onRename(node.id)}
            title={`Rename ${node.type}`}
            className="cursor-pointer rounded-md p-1 text-[#9ba3b3] hover:bg-[#eef0ff] hover:text-[#5865e9]"
          >
            <Pencil size={13} />
          </button>}
          {canDelete && node.type !== "list" && (
            <button
              type="button"
              onClick={() =>
                onCreateChild(node.id, node.type === "space" ? "folder" : "list")
              }
              title={`Add ${node.type === "space" ? "folder" : "list"}`}
              className="cursor-pointer rounded-md p-1 text-[#9ba3b3] hover:bg-[#eef0ff] hover:text-[#5865e9]"
            >
              <Plus size={14} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(node.id)}
              title={`Delete ${node.type}`}
              className="cursor-pointer rounded-md p-1 text-[#9ba3b3] hover:bg-[#fff0f1] hover:text-[#d94d5d]"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      {isOpen && hasChildren && (
        <div className="ml-5 border-l border-[#edf0f5] pl-2">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              all={all}
              expanded={expanded}
              setExpanded={setExpanded}
              selectedListId={selectedListId}
              onSelectList={onSelectList}
              onRename={onRename}
              onCreateChild={onCreateChild}
              onDelete={onDelete}
              onReorder={onReorder}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
