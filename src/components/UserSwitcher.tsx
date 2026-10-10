import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { User } from "../types";

export function UserSwitcher({
  userId,
  users,
  onChange,
}: {
  userId: string;
  users: User[];
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = users.find((item) => item.id === userId) ?? users[0];
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-[#f7f8fc]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dfe3ff] text-xs font-bold text-[#5865e9]">
          {user.name
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </span>
        <span className="hidden sm:block">
          <span className="block text-sm font-semibold text-[#273149]">
            {user.name}
          </span>
          <span className="block text-[11px] capitalize text-[#98a0b1]">
            {user.role}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`text-[#a0a8b8] transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-xl border border-[#e6e9f0] bg-white p-1.5 shadow-[0_12px_30px_rgba(35,45,75,0.14)]">
          <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a0a8b8]">
            Switch user
          </p>
          {users.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left transition hover:bg-[#f4f5ff]"
            >
              <span>
                <span className="block text-sm font-semibold text-[#273149]">
                  {option.name}
                </span>
                <span className="block text-[11px] capitalize text-[#98a0b1]">
                  {option.role}
                </span>
              </span>
              {option.id === user.id && (
                <Check size={16} className="text-[#5865e9]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
