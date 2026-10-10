import type { InputHTMLAttributes } from "react";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const inputClasses =
  "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-[#566078] outline-none transition focus:ring-2 focus:ring-[#dfe3ff] disabled:cursor-not-allowed disabled:bg-[#f7f8fc]";

// Renders a styled, typed wrapper around the native input element.
export function TextInput({
  className = "",
  invalid = false,
  ...props
}: TextInputProps) {
  return (
    <input
      {...props}
      aria-invalid={invalid || props["aria-invalid"]}
      className={`${inputClasses} ${invalid ? "border-[#d94d5d] focus:ring-[#ffd9dd]" : "border-[#e5e8f0]"} ${className}`}
    />
  );
}
