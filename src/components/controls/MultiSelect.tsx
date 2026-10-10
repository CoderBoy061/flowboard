import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type MultiSelectOption = {
  value: string;
  label: string;
};

export type MultiSelectProps = {
  value: string[];
  options: MultiSelectOption[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  "aria-label"?: string;
  disabled?: boolean;
  className?: string;
  hideSelectedOptions?: boolean;
};

// Provides a keyboard-friendly checkbox dropdown for selecting multiple values.
export function MultiSelect({
  value,
  options,
  onChange,
  placeholder = "Select options",
  "aria-label": ariaLabel,
  disabled = false,
  className = "",
  hideSelectedOptions = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);
  const visibleOptions = hideSelectedOptions
    ? options.filter((option) => !value.includes(option.value))
    : options;

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const toggleOption = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-xl border border-[#e5e8f0] bg-white px-3 py-2 text-left text-sm text-[#566078] outline-none transition hover:border-[#cfd5e5] focus:ring-2 focus:ring-[#dfe3ff] disabled:cursor-not-allowed disabled:bg-[#f7f8fc]"
      >
        <span
          className={`min-w-0 flex-1 truncate ${selectedLabels.length ? "" : "text-[#98a0b1]"}`}
        >
          {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#7c8498] transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-52 overflow-y-auto rounded-xl border border-[#e5e8f0] bg-white p-1.5 shadow-popover"
        >
          {visibleOptions.map((option) => {
            const selected = value.includes(option.value);
            return (
              <button
                type="button"
                role="option"
                aria-selected={selected}
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${selected ? "bg-brand-50 text-brand-600" : "text-[#566078] hover:bg-[#f7f8fc]"}`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${selected ? "border-brand-500 bg-brand-500 text-white" : "border-[#cfd5e5] bg-white"}`}
                >
                  {selected && <Check size={12} strokeWidth={3} />}
                </span>
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
          {!visibleOptions.length && (
            <p className="px-2.5 py-2 text-xs text-[#98a0b1]">
              All selected members are already assigned.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
