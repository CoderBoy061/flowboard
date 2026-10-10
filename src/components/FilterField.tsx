import type { ReactNode } from "react";

// Keeps filter labels and controls aligned across the filter popover.
export function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#a0a8b8]">
        {label}
      </span>
      {children}
    </label>
  );
}
