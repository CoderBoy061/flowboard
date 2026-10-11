import { Bell, Check, X } from "lucide-react";
import { useEffect } from "react";
import type { AppNotification, Container, User, Workspace } from "../types";
import { getContainerBreadcrumb } from "../utils/containerUtils";

export function NotificationPanel({
  notifications,
  users,
  containers,
  workspaces,
  onClose,
  onMarkAllRead,
  onMarkRead,
}: {
  notifications: AppNotification[];
  users: User[];
  containers: Container[];
  workspaces: Workspace[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (notificationId: string) => void;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 bg-[#172033]/20"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#5865e9]">
              <Bell size={15} /> Notifications
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#20283a]">
              Activity for you
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl p-2 text-[#9ba3b3] hover:bg-[#f5f6fa]"
            aria-label="Close notifications"
          >
            <X size={20} />
          </button>
        </div>
        {notifications.some((notification) => !notification.read) && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="mb-4 flex cursor-pointer items-center gap-2 self-start rounded-lg px-2 py-1.5 text-xs font-semibold text-[#5865e9] hover:bg-[#f4f5ff]"
          >
            <Check size={14} /> Mark all as read
          </button>
        )}
        <div className="notification-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">
          {notifications.length ? (
            notifications.map((notification) => {
              const actor = users.find(
                (user) => user.id === notification.actorUserId,
              );
              return (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => onMarkRead(notification.id)}
                  aria-label={`${notification.read ? "Read" : "Unread"} notification: ${notification.message}`}
                  className={`group w-full cursor-pointer border-b border-[#e9edf4] px-1 py-4 text-left shadow-[0_1px_3px_rgba(32,40,58,0.04)] transition focus:outline-none focus:ring-2 focus:ring-[#5865e9]/30 ${notification.read ? "bg-white hover:bg-[#fbfcff]" : "border-l-2 border-l-[#5865e9] bg-[#fafaff] pl-3 shadow-[0_2px_8px_rgba(88,101,233,0.08)] hover:bg-[#f5f6ff]"}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${notification.read ? "bg-[#f0f2f7] text-[#8992a5]" : "bg-[#dfe3ff] text-[#5865e9]"}`}>
                      {!notification.read && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#f5f6ff] bg-[#5865e9]" />
                      )}
                      {actor?.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() ?? "?"}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-start gap-2 text-sm font-semibold leading-5 text-[#273149]">
                        <span className="min-w-0 flex-1">{notification.message}</span>
                        {!notification.read && (
                          <span className="shrink-0 rounded-full bg-[#5865e9] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white">
                            Unread
                          </span>
                        )}
                      </p>
                      <p className="mt-2 text-[11px] leading-5 text-[#8790a3]">
                        {getContainerBreadcrumb(
                          containers,
                          workspaces,
                          notification.context.listId,
                          notification.context.workspaceId,
                        )}
                      </p>
                      <time className="mt-1 block text-[10px] font-medium text-[#a0a8b8]">
                        {new Date(notification.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-[#dfe3ec] py-16 text-center text-sm text-[#8790a3]">
              You’re all caught up.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
