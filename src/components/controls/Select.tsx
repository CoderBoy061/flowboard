import type { SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

const selectClasses =
  "w-full cursor-pointer rounded-xl border bg-white px-3 py-2.5 text-sm text-[#566078] outline-none transition focus:ring-2 focus:ring-[#dfe3ff] disabled:cursor-not-allowed disabled:bg-[#f7f8fc]";

// Renders a styled, typed wrapper around the native select element.
export function Select({
  className = "",
  invalid = false,
  ...props
}: SelectProps) {
  return (
    <select
      {...props}
      aria-invalid={invalid || props["aria-invalid"]}
      className={`${selectClasses} ${invalid ? "border-[#d94d5d] focus:ring-[#ffd9dd]" : "border-[#e5e8f0]"} ${className}`}
    />
  );
}
