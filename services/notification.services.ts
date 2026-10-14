import { internalApiFetch } from "@/lib/api";
import type {
  MarkAllNotificationsReadData,
  NotificationItem,
  NotificationListData,
  NotificationListParams,
  UnreadNotificationCountData,
} from "@/types/notifications";

const NOTIFICATIONS_API = "/api/backend/notifications";

export function getUnreadNotificationCount() {
  return internalApiFetch<UnreadNotificationCountData>(
    `${NOTIFICATIONS_API}/unread-count`,
  );
}

export function getNotifications(params: NotificationListParams) {
  return internalApiFetch<NotificationListData>(`${NOTIFICATIONS_API}/list`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function markNotificationRead(notificationId: string) {
  return internalApiFetch<NotificationItem>(
    `${NOTIFICATIONS_API}/${encodeURIComponent(notificationId)}/read`,
    { method: "PATCH" },
  );
}

export function markAllNotificationsRead() {
  return internalApiFetch<MarkAllNotificationsReadData>(
    `${NOTIFICATIONS_API}/read-all`,
    { method: "PATCH" },
  );
}
