import type { ReactNode } from "react";

// Provides the shared label layout used by drawer and filter controls.
export function FormField({
  label,
  children,
  compact = false,
}: {
  label: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <label className="block">
      <span
        className={`${compact ? "mb-1.5 text-[10px]" : "mb-2 text-xs"} block font-bold uppercase tracking-[0.1em] text-[#a0a8b8]`}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
