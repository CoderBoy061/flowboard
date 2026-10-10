import type { TextareaHTMLAttributes } from "react";

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

const textAreaClasses =
  "w-full resize-none rounded-xl border bg-white p-3 text-sm leading-6 text-[#566078] outline-none transition focus:ring-2 focus:ring-[#dfe3ff] disabled:cursor-not-allowed disabled:bg-[#f7f8fc]";

// Renders a styled, typed wrapper around the native textarea element.
export function TextArea({
  className = "",
  invalid = false,
  ...props
}: TextAreaProps) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || props["aria-invalid"]}
      className={`${textAreaClasses} ${invalid ? "border-[#d94d5d] focus:ring-[#ffd9dd]" : "border-[#e5e8f0]"} ${className}`}
    />
  );
}
