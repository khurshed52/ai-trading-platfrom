import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function mockDashboardApis(page: Page) {
  await page.route("**/api/backend/profile", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 200,
        message: "Profile fetched successfully",
        data: {
          id: "user-1",
          name: "Sid Test",
          email: "sid@example.com",
          role: "USER",
          isActive: true,
          status: "APPROVED",
          permissions: { withdrawalAllowed: true },
          restrictions: { withdrawalAllowedAt: null },
          createdAt: "2026-10-05T17:54:19.434Z",
          updatedAt: "2026-10-05T17:54:19.434Z",
          lastSeenAt: "2026-10-14T16:41:19.047Z",
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
        data: { unreadCount: 0 },
      }),
    });
  });

  await page.route("**/api/backend/notifications/list", async (route) => {
    const request = route.request().postDataJSON() as { page: number; pageSize: number };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 200,
        message: "Notifications retrieved successfully",
        data: {
          page: request.page,
          pageSize: request.pageSize,
          dataCount: 0,
          pageCount: 0,
          pageData: [],
        },
      }),
    });
  });

}

async function mockRegisteredProfile(page: Page) {
  await page.unroute("**/api/backend/profile");
  await page.route("**/api/backend/profile", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 200,
        message: "Profile fetched successfully",
        data: {
          id: "user-2",
          name: "Registered Customer",
          email: "registered@example.com",
          role: "USER",
          isActive: true,
          status: "REGISTERED",
          permissions: { withdrawalAllowed: false },
          restrictions: { withdrawalAllowedAt: null },
          createdAt: "2026-09-21T16:11:28.748Z",
          updatedAt: "2026-09-21T16:11:28.748Z",
          customer: {
            id: "customer-2",
            customerFirstName: "khurshed",
            customerLastName: "khan",
            customerNationality: "AE",
            phoneNumber: "+971500000001",
            isActive: true,
            sid: "170813",
            createdAt: "2026-09-21T16:11:28.748Z",
            updatedAt: "2026-09-21T16:11:28.748Z",
          },
        },
      }),
    });
  });
}

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([
    {
      name: "access_token",
      value: "dashboard-test-token",
      url: "http://localhost:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await mockDashboardApis(page);
});

test("renders the redesigned dashboard and preserves navigation", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(page.getByText(/Welcome back/)).toHaveCount(0);
  await expect(page.getByPlaceholder("Search markets, assets...")).toHaveCount(0);
  const dashboardHeader = page.locator("header.ant-layout-header");
  await expect(dashboardHeader).toHaveCSS("position", "fixed");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect
    .poll(() => dashboardHeader.evaluate((element) => element.getBoundingClientRect().top))
    .toBe(0);

  await expect(page.getByRole("heading", { name: "sid test" })).toBeVisible();
  await expect(page.getByText("SID: 623729")).toBeVisible();
  await expect(page.getByText(/Created: Oct 5, 2026/)).toBeVisible();
  await expect(page.getByText(/Last seen: Oct 14, 2026/)).toBeVisible();
  await expect(page.getByText("$1,250.00")).toBeVisible();
  const summaryCards = page.getByRole("region", { name: "Trading summary" }).locator("article");
  await expect(summaryCards).toHaveCount(5);
  const summaryCardPositions = await summaryCards.evaluateAll((cards) =>
    cards.map((card) => Math.round(card.getBoundingClientRect().top)),
  );
  expect(new Set(summaryCardPositions).size).toBe(1);
  await expect(
    page.getByRole("heading", { name: "Transaction Activity" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Transaction Status Overview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Trading Account Balances" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Stay Informed" })).toBeVisible();

  await expect(page.getByRole("link", { name: /Deposit Add Funds/ })).toHaveAttribute(
    "href",
    "/funds/deposit",
  );
  await expect(
    page.getByRole("link", { name: /Withdraw Withdraw Funds/ }),
  ).toHaveAttribute("href", "/funds/withdraw");
  await expect(page.getByRole("link", { name: /Profile View Profile/ })).toHaveAttribute(
    "href",
    "/profile",
  );
  await expect(
    page.getByRole("link", { name: /Open Account Create New/ }),
  ).toHaveAttribute("href", "/accounts");
});

test("blocks protected dashboard actions and direct routes before approval", async ({
  page,
}) => {
  await mockRegisteredProfile(page);
  await page.goto("/dashboard");

  await expect(page.getByText("REGISTERED")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Deposit, verification required" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Withdraw, verification required" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Open Account, verification required" }),
  ).toBeDisabled();
  await expect(page.getByRole("link", { name: /Profile View Profile/ })).toHaveAttribute(
    "href",
    "/profile",
  );

  await page.goto("/accounts");
  await expect(page).toHaveURL(/\/dashboard$/);
});

for (const viewport of [
  { label: "tablet", width: 768, height: 1024 },
  { label: "mobile", width: 390, height: 844 },
]) {
  test(`has no page-level horizontal overflow on ${viewport.label}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/dashboard");
    await expect(page.getByText("Transaction Activity")).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
}
