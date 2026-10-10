import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

export function ConfirmDialog({
  title,
  description,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/30 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onCancel()}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff0f1] text-[#d94d5d]">
            <AlertTriangle size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h2 id="confirm-dialog-title" className="text-base font-bold text-[#20283a]">
                {title}
              </h2>
              <button type="button" onClick={onCancel} className="cursor-pointer rounded-lg p-1 text-[#9ba3b3] hover:bg-[#f5f6fa]" aria-label="Cancel">
                <X size={17} />
              </button>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#7c8498]">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-[#7c8498] hover:bg-[#f5f6fa]">
            No, keep it
          </button>
          <button type="button" onClick={onConfirm} autoFocus className="cursor-pointer rounded-xl bg-[#d94d5d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c64050]">
            Yes, delete
          </button>
        </div>
      </section>
    </div>
  );
}
