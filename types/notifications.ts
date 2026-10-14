export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  actionUrl: string | null;
  createdAt: string;
}

export interface NotificationListParams {
  page: number;
  pageSize: number;
  unreadOnly: boolean;
}

export interface NotificationListData extends NotificationListParams {
  dataCount: number;
  pageCount: number;
  pageData: NotificationItem[];
}

export interface UnreadNotificationCountData {
  unreadCount: number;
}

export interface MarkAllNotificationsReadData {
  updatedCount: number;
}
