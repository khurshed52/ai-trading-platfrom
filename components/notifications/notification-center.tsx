"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { Button, Empty, Pagination, Segmented, Spin } from "antd";

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useNotifications";
import {
  formatNotificationDate,
  getSafeNotificationUrl,
  notificationToneStyles,
} from "@/lib/notification-utils";
import type { NotificationItem } from "@/types/notifications";

const PAGE_SIZE = 10;

export function NotificationCenter() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const notificationsQuery = useNotifications({
    page,
    pageSize: PAGE_SIZE,
    unreadOnly,
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const pagination = notificationsQuery.data?.data;
  const notifications = pagination?.pageData ?? [];

  async function handleNotificationClick(notification: NotificationItem) {
    if (!notification.isRead) {
      try {
        await markRead.mutateAsync(notification.id);
      } catch {
        return;
      }
    }

    const actionUrl = getSafeNotificationUrl(notification.actionUrl);
    if (actionUrl) router.push(actionUrl);
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
            Notification Center
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review account activity and important TradePro updates.
          </p>
        </div>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          disabled={markAllRead.isPending || notifications.every((item) => item.isRead)}
          loading={markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
          className="!h-10 !rounded-xl !font-semibold"
        >
          Mark all as read
        </Button>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
          <Segmented
            value={unreadOnly ? "unread" : "all"}
            options={[
              { label: "All", value: "all" },
              { label: "Unread", value: "unread" },
            ]}
            onChange={(value) => {
              setUnreadOnly(value === "unread");
              setPage(1);
            }}
          />
          <span className="text-xs font-medium text-slate-500">
            {pagination?.dataCount ?? 0} notifications
          </span>
        </div>

        {notificationsQuery.isLoading ? (
          <div className="grid min-h-80 place-items-center">
            <Spin size="large" aria-label="Loading notification center" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={unreadOnly ? "No unread notifications" : "No notifications yet"}
            className="!my-20"
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => {
              const created = formatNotificationDate(notification.createdAt);
              const isCurrentMutation =
                markRead.isPending && markRead.variables === notification.id;

              return (
                <div
                  key={notification.id}
                  className="flex items-center gap-2 px-4 py-4 transition hover:bg-slate-50 sm:gap-4 sm:px-6"
                >
                  <button
                    type="button"
                    disabled={markRead.isPending}
                    onClick={() => void handleNotificationClick(notification)}
                    className="flex min-w-0 flex-1 gap-3 text-left disabled:cursor-wait sm:gap-4"
                  >
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-xl ${notificationToneStyles[notification.type]}`}
                    >
                      {notification.isRead ? <CheckOutlined /> : <BellOutlined />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-slate-950 sm:text-base">
                        {notification.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-600">
                        {notification.message}
                      </span>
                      <span className="mt-2 block text-xs text-slate-400">
                        {created.date} at {created.time}
                        {isCurrentMutation ? " · Updating…" : ""}
                      </span>
                    </span>
                  </button>

                  {!notification.isRead ? (
                    <Button
                      size="small"
                      disabled={markRead.isPending}
                      loading={isCurrentMutation}
                      onClick={() => markRead.mutate(notification.id)}
                      className="!h-8 !shrink-0 !rounded-lg !px-3 !text-xs !font-semibold !text-blue-600"
                    >
                      Mark as read
                    </Button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {pagination && pagination.pageCount > 1 ? (
          <footer className="flex justify-end border-t border-slate-100 px-4 py-4 sm:px-6">
            <Pagination
              current={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.dataCount}
              showSizeChanger={false}
              onChange={setPage}
            />
          </footer>
        ) : null}
      </section>
    </div>
  );
}
