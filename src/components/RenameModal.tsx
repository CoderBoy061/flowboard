import { useState } from "react";

export function RenameModal({
  label,
  initialName,
  onClose,
  onRename,
}: {
  label: string;
  initialName: string;
  onClose: () => void;
  onRename: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/25 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim()) onRename(name.trim());
        }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7c8498]">
              Rename {label}
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#20283a]">
              Update name
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-2xl leading-none text-[#9ba3b3]"
          >
            ×
          </button>
        </div>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={100}
          className="h-12 w-full rounded-xl border border-[#e5e8f0] px-4 text-sm outline-none focus:ring-2 focus:ring-[#5865e9]"
        />
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-[#7c8498]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="cursor-pointer rounded-xl bg-[#5865e9] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save name
          </button>
        </div>
      </form>
    </div>
  );
}
