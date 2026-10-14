import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

type TestNotification = {
  id: string;
  type: "INFO" | "SUCCESS";
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  actionUrl: string | null;
  createdAt: string;
};

const notifications: TestNotification[] = [
  {
    id: "notification-1",
    type: "INFO",
    title: "Withdrawal Processing",
    message: "Your withdrawal request is being processed.",
    isRead: false,
    readAt: null,
    actionUrl: null,
    createdAt: "2026-10-14T13:39:08.806Z",
  },
  {
    id: "notification-2",
    type: "SUCCESS",
    title: "Withdrawal Approved",
    message: "Your withdrawal request has been approved.",
    isRead: false,
    readAt: null,
    actionUrl: null,
    createdAt: "2026-10-14T13:39:03.242Z",
  },
  {
    id: "notification-3",
    type: "SUCCESS",
    title: "Transfer Completed",
    message: "Your transfer of 12.00 USD has been completed.",
    isRead: false,
    readAt: null,
    actionUrl: "/reports/transfer",
    createdAt: "2026-10-14T13:30:11.116Z",
  },
];

async function mockNotificationApis(page: Page) {
  let notificationState = notifications.map((notification) => ({ ...notification }));

  await page.route("**/api/backend/profile", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 200,
        message: "Profile fetched successfully",
        data: {
          id: "notification-user",
          name: "Sid Test",
          email: "sid@example.com",
          role: "USER",
          isActive: true,
          status: "APPROVED",
          permissions: { withdrawalAllowed: true },
          restrictions: { withdrawalAllowedAt: null },
          createdAt: "2026-10-05T17:54:19.434Z",
          updatedAt: "2026-10-05T17:54:19.434Z",
          customer: {
            id: "customer-1",
            customerFirstName: "sid",
            customerLastName: "test",
            customerNationality: "AE",
            phoneNumber: "+971500000000",
            isActive: true,
            sid: "623729",
            createdAt: "2026-10-05T17:54:19.434Z",
            updatedAt: "2026-10-05T17:54:19.434Z",
          },
        },
      }),
    });
  });

  await page.route("**/api/backend/notifications/unread-count", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 200,
        message: "Unread notification count retrieved successfully",
        data: {
          unreadCount: notificationState.filter((item) => !item.isRead).length,
        },
      }),
    });
  });

  await page.route("**/api/backend/notifications/list", async (route) => {
    const body = route.request().postDataJSON() as {
      page: number;
      pageSize: number;
      unreadOnly: boolean;
    };
    const filtered = body.unreadOnly
      ? notificationState.filter((item) => !item.isRead)
      : notificationState;
    const start = (body.page - 1) * body.pageSize;
    const pageData = filtered.slice(start, start + body.pageSize);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 200,
        message: "Notifications retrieved successfully",
        data: {
          page: body.page,
          pageSize: body.pageSize,
          dataCount: filtered.length,
          pageCount: Math.ceil(filtered.length / body.pageSize),
          pageData,
        },
      }),
    });
  });

  await page.route("**/api/backend/notifications/*/read", async (route) => {
    const notificationId = route.request().url().split("/").at(-2);
    const notification = notificationState.find((item) => item.id === notificationId);

    if (!notification) {
      await route.fulfill({ status: 404, body: "{}" });
      return;
    }

    notification.isRead = true;
    notification.readAt = "2026-10-14T13:42:15.503Z";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 200,
        message: "Notification marked as read successfully",
        data: notification,
      }),
    });
  });

  await page.route("**/api/backend/notifications/read-all", async (route) => {
    const updatedCount = notificationState.filter((item) => !item.isRead).length;
    notificationState = notificationState.map((item) => ({
      ...item,
      isRead: true,
      readAt: item.readAt ?? "2026-10-14T13:45:00.000Z",
    }));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 200,
        message: "All notifications marked as read successfully",
        data: { updatedCount },
      }),
    });
  });
}

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([
    {
      name: "access_token",
      value: "notification-test-token",
      url: "http://localhost:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await mockNotificationApis(page);
});

test("keeps the header, dashboard, and center synchronized after read mutations", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Stay Informed" })).toBeVisible();
  await expect(page.getByText("Withdrawal Processing", { exact: true })).toBeVisible();
  await expect(page.getByText("Transfer Completed", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Notifications, 3 unread" })).toBeVisible();

  await page.getByRole("button", { name: "Notifications, 3 unread" }).click();
  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark as read" }).first()).toBeVisible();
  await page.getByRole("button", { name: /bell Withdrawal Processing/ }).click();

  await expect(page).toHaveURL(/\/notifications$/);
  await expect(page.getByText("Notification marked as read successfully")).toBeVisible();
  await expect(page.getByRole("button", { name: "Notifications, 2 unread" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark as read" }).first()).toBeVisible();

  await page.getByRole("button", { name: "check Mark all as read" }).click();
  await expect(page.getByText("All notifications marked as read successfully")).toBeVisible();
  await expect(page.getByRole("button", { name: "Notifications" })).toBeVisible();
});
