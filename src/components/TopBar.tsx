import { Bell } from "lucide-react";
import type { User } from "../types";
import { UserSwitcher } from "./UserSwitcher";

export function TopBar({
  userId,
  users,
  onUserChange,
  unreadNotificationCount,
  onNotificationClick,
}: {
  userId: string;
  users: User[];
  onUserChange: (id: string) => void;
  unreadNotificationCount: number;
  onNotificationClick: () => void;
}) {
  return (
    <header className="flex h-[72px] items-center justify-end border-b border-[#e8ebf2] bg-white px-5 sm:px-8 lg:px-10">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onNotificationClick}
          aria-label="Open notifications"
          className="relative cursor-pointer rounded-xl p-2 text-[#8891a3] hover:bg-[#f6f7fa]"
        >
          <Bell size={18} />
          {unreadNotificationCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5865e9] px-1 text-[9px] font-bold text-white">
              {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
            </span>
          )}
        </button>
        <div className="h-7 w-px bg-[#edf0f5]" />
        <UserSwitcher userId={userId} users={users} onChange={onUserChange} />
      </div>
    </header>
  );
}
