export type NotificationType = "task_assigned" | "task_updated";

export interface NotificationContext {
  workspaceId: string;
  spaceId?: string;
  folderId?: string;
  listId: string;
  taskId: string;
}

export interface AppNotification {
  id: string;
  recipientUserId: string;
  actorUserId: string;
  type: NotificationType;
  message: string;
  context: NotificationContext;
  createdAt: string;
  read: boolean;
}
