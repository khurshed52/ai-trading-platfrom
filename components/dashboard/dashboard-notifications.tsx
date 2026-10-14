"use client";

import { useRouter } from "next/navigation";
import { Empty, Spin } from "antd";
import { Bell, Check, Clock3, MoveRight, WalletCards } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import {
  useLatestNotifications,
  useMarkNotificationRead,
} from "@/hooks/useNotifications";
import {
  formatNotificationDate,
  getSafeNotificationUrl,
  notificationToneStyles,
} from "@/lib/notification-utils";
import type { NotificationItem, NotificationType } from "@/types/notifications";

const DASHBOARD_NOTIFICATION_LIMIT = 10;

function NotificationIcon({ type, isRead }: { type: NotificationType; isRead: boolean }) {
  if (isRead) return <Check size={18} />;
  if (type === "SUCCESS") return <WalletCards size={18} />;
  if (type === "INFO") return <Clock3 size={18} />;
  return <Bell size={18} />;
}

export function DashboardNotifications() {
  const router = useRouter();
  const notificationsQuery = useLatestNotifications(DASHBOARD_NOTIFICATION_LIMIT);
  const markRead = useMarkNotificationRead();
  const notifications = (notificationsQuery.data?.data.pageData ?? []).slice(
    0,
    DASHBOARD_NOTIFICATION_LIMIT,
  );

  async function openNotification(notification: NotificationItem) {
    if (!notification.isRead) {
      try {
        await markRead.mutateAsync(notification.id);
      } catch {
        return;
      }
    }

    router.push(
      getSafeNotificationUrl(notification.actionUrl) ?? ROUTES.NOTIFICATIONS,
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 text-slate-950" size={24} />
          <div>
            <h2 className="font-bold text-slate-950">Stay Informed</h2>
            <p className="text-xs text-slate-500">
              Important updates and notifications
            </p>
          </div>
        </div>
        <Link
          href={ROUTES.NOTIFICATIONS}
          className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View All
        </Link>
      </header>

      {notificationsQuery.isLoading ? (
        <div className="grid min-h-36 place-items-center">
          <Spin aria-label="Loading dashboard notifications" />
        </div>
      ) : notifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="You are all caught up"
          className="!my-7"
        />
      ) : (
        <div className="divide-y divide-slate-100 px-4 sm:px-5">
          {notifications.map((notification) => {
            const created = formatNotificationDate(notification.createdAt);

            return (
              <button
                key={notification.id}
                type="button"
                disabled={markRead.isPending}
                onClick={() => void openNotification(notification)}
                className="group grid w-full gap-3 py-3 text-left transition hover:bg-slate-50 disabled:cursor-wait sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:items-center sm:px-1"
              >
                <span
                  className={`grid size-10 place-items-center rounded-xl ${notificationToneStyles[notification.type]}`}
                >
                  <NotificationIcon
                    type={notification.type}
                    isRead={notification.isRead}
                  />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {!notification.isRead ? (
                      <span className="size-2 shrink-0 rounded-full bg-blue-500" />
                    ) : null}
                    <span className="truncate">{notification.title}</span>
                  </span>
                  <span className="block line-clamp-1 text-xs text-slate-500">
                    {notification.message}
                  </span>
                </span>
                <span className="text-xs text-slate-500 sm:text-right">
                  <span className="block">{created.date}</span>
                  <span className="block">{created.time}</span>
                </span>
                <MoveRight
                  size={18}
                  className="hidden text-slate-900 transition group-hover:translate-x-1 sm:block"
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
