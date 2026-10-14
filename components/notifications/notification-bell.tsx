"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Dropdown, Empty, Spin } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";

import { ROUTES } from "@/constants/routes";
import {
  useLatestNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadNotificationCount,
} from "@/hooks/useNotifications";
import {
  formatNotificationDate,
  getSafeNotificationUrl,
  notificationToneStyles,
} from "@/lib/notification-utils";
import type { NotificationItem } from "@/types/notifications";

export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const unreadQuery = useUnreadNotificationCount();
  const latestQuery = useLatestNotifications(5, isOpen);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = latestQuery.data?.data.pageData ?? [];
  const unreadCount = unreadQuery.data?.data.unreadCount ?? 0;

  async function handleNotificationClick(notification: NotificationItem) {
    if (!notification.isRead) {
      try {
        await markRead.mutateAsync(notification.id);
      } catch {
        return;
      }
    }

    setIsOpen(false);
    router.push(
      getSafeNotificationUrl(notification.actionUrl) ?? ROUTES.NOTIFICATIONS,
    );
  }

  return (
    <Dropdown
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={["click"]}
      placement="bottomRight"
      dropdownRender={() => (
        <section className="w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-slate-950">Notifications</h2>
              <p className="text-xs text-slate-500">
                {unreadCount} unread {unreadCount === 1 ? "update" : "updates"}
              </p>
            </div>
            <Button
              type="text"
              size="small"
              disabled={unreadCount === 0 || markAllRead.isPending}
              loading={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
              className="!font-semibold !text-blue-600"
            >
              Mark all as read
            </Button>
          </header>

          <div className="max-h-[390px] overflow-y-auto">
            {latestQuery.isLoading ? (
              <div className="grid min-h-40 place-items-center">
                <Spin aria-label="Loading notifications" />
              </div>
            ) : notifications.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No notifications yet"
                className="!my-8"
              />
            ) : (
              notifications.map((notification) => {
                const created = formatNotificationDate(notification.createdAt);
                const isCurrentMutation =
                  markRead.isPending && markRead.variables === notification.id;

                return (
                  <div
                    key={notification.id}
                    className="flex gap-2 border-b border-slate-100 px-4 py-3 transition last:border-b-0 hover:bg-slate-50"
                  >
                    <button
                      type="button"
                      disabled={markRead.isPending}
                      onClick={() => void handleNotificationClick(notification)}
                      className="flex min-w-0 flex-1 gap-3 text-left disabled:cursor-wait"
                    >
                      <span
                        className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${notificationToneStyles[notification.type]}`}
                      >
                        {notification.isRead ? <CheckOutlined /> : <BellOutlined />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 block text-sm font-semibold text-slate-900">
                          {notification.title}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-slate-500">
                          {notification.message}
                        </span>
                        <span className="mt-1 block text-[11px] text-slate-400">
                          {created.date} · {created.time}
                        </span>
                      </span>
                    </button>

                    {!notification.isRead ? (
                      <Button
                        size="small"
                        disabled={markRead.isPending}
                        loading={isCurrentMutation}
                        onClick={() => markRead.mutate(notification.id)}
                        className="!h-7 !shrink-0 !self-start !rounded-lg !px-2 !text-[11px] !font-semibold !text-blue-600"
                      >
                        Mark as read
                      </Button>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          <footer className="border-t border-slate-100 p-2">
            <Button
              type="link"
              block
              className="!font-semibold"
              onClick={() => {
                setIsOpen(false);
                router.push(ROUTES.NOTIFICATIONS);
              }}
            >
              View all notifications
            </Button>
          </footer>
        </section>
      )}
    >
      <Badge count={unreadCount} size="small" overflowCount={99}>
        <Button
          type="text"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          icon={<BellOutlined />}
          className="!inline-flex !size-11 !items-center !justify-center !rounded-xl !bg-slate-50 !text-lg !text-slate-700"
        />
      </Badge>
    </Dropdown>
  );
}
