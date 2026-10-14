import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification.services";
import type { NotificationListParams } from "@/types/notifications";
import { useUserDetail } from "@/hooks/useUser";

const POLLING_INTERVAL = 30_000;
const NOTIFICATION_STALE_TIME = 15_000;
const NOTIFICATION_GC_TIME = 5 * 60_000;

export const notificationKeys = {
  all: ["notifications"] as const,
  user: (userId: string) => [...notificationKeys.all, userId] as const,
  unreadCount: (userId: string) =>
    [...notificationKeys.user(userId), "unread-count"] as const,
  latest: (userId: string, limit: number) =>
    [...notificationKeys.user(userId), "latest", limit] as const,
  list: (userId: string, params: NotificationListParams) =>
    [
      ...notificationKeys.user(userId),
      "list",
      params.page,
      params.pageSize,
      params.unreadOnly,
    ] as const,
};

const pollingOptions = {
  refetchInterval: POLLING_INTERVAL,
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: true,
  staleTime: NOTIFICATION_STALE_TIME,
  gcTime: NOTIFICATION_GC_TIME,
} as const;

function useAuthenticatedUserId(): string | null {
  const { data } = useUserDetail();
  return data?.data.id ?? null;
}

export function useUnreadNotificationCount() {
  const userId = useAuthenticatedUserId();

  return useQuery({
    queryKey: notificationKeys.unreadCount(userId ?? "anonymous"),
    queryFn: getUnreadNotificationCount,
    enabled: Boolean(userId),
    ...pollingOptions,
  });
}

export function useLatestNotifications(limit: number, enabled = true) {
  const userId = useAuthenticatedUserId();

  return useQuery({
    queryKey: notificationKeys.latest(userId ?? "anonymous", limit),
    queryFn: () =>
      getNotifications({ page: 1, pageSize: limit, unreadOnly: false }),
    enabled: Boolean(userId) && enabled,
    ...pollingOptions,
  });
}

export function useNotifications(
  params: NotificationListParams,
  enabled = true,
) {
  const userId = useAuthenticatedUserId();

  return useQuery({
    queryKey: notificationKeys.list(userId ?? "anonymous", params),
    queryFn: () => getNotifications(params),
    enabled: Boolean(userId) && enabled,
    ...pollingOptions,
  });
}

function useInvalidateNotificationQueries() {
  const queryClient = useQueryClient();
  const userId = useAuthenticatedUserId();

  return async () => {
    if (!userId) return;

    await queryClient.invalidateQueries({
      queryKey: notificationKeys.user(userId),
    });
  };
}

export function useMarkNotificationRead() {
  const invalidateNotifications = useInvalidateNotificationQueries();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: invalidateNotifications,
  });
}

export function useMarkAllNotificationsRead() {
  const invalidateNotifications = useInvalidateNotificationQueries();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidateNotifications,
  });
}
