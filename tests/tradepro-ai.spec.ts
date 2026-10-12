import { expect, test } from "@playwright/test";

test("renders real account activity and uses the shared AI endpoint", async ({
  page,
}) => {
  await page.setViewportSize({ width: 2400, height: 1100 });
  await page.context().addCookies([
    {
      name: "access_token",
      value: "test-access-token",
      url: "http://localhost:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.route("**/api/backend/profile", (route) =>
    route.fulfill({
      status: 200,
      json: {
        statusCode: 200,
        message: "Profile fetched successfully",
        data: {
          id: "test-user-id",
          name: "sid test",
          status: "APPROVED",
          customer: { customerFirstName: "sid", customerLastName: "test" },
        },
      },
    }),
  );
  await page.route("**/api/backend/accounts/all", (route) =>
    route.fulfill({
      status: 200,
      json: {
        statusCode: 200,
        message: "Accounts fetched successfully",
        data: [
          {
            id: "account-one",
            accountNumber: "55667788",
            platform: "MT5",
            currency: "USD",
            balance: "1250.50",
            status: "ACTIVE",
          },
        ],
      },
    }),
  );
  await page.route("**/api/backend/funds/transactions", (route) =>
    route.fulfill({
      status: 200,
      json: {
        statusCode: 200,
        message: "Transactions retrieved successfully",
        data: {
          page: 1,
          pageSize: 3,
          dataCount: 1,
          pageCount: 1,
          pageData: [
            {
              transactionId: "transaction-one",
              reference: "DEP-REAL",
              type: "DEPOSIT",
              status: "COMPLETED",
              amount: "75",
              currency: "USD",
              convertedAmount: "75",
              convertedCurrency: "USD",
              conversion: null,
              account: null,
              sourceAccount: null,
              destinationAccount: null,
              approvalStatus: "NOT_REQUIRED",
              completedAt: "2026-10-10T09:00:00.000Z",
              createdAt: "2026-10-10T09:00:00.000Z",
            },
          ],
        },
      },
    }),
  );

  let aiPayload: unknown;
  let aiRequestCount = 0;
  let refreshRequestCount = 0;
  await page.route("**/api/auth/refresh", async (route) => {
    refreshRequestCount += 1;
    await route.fulfill({
      status: 200,
      json: {
        statusCode: 200,
        message: "Access token refreshed successfully",
        data: null,
      },
    });
  });
  await page.route("**/api/gemini/chat", async (route) => {
    aiRequestCount += 1;
    aiPayload = route.request().postDataJSON();

    if (aiRequestCount === 1) {
      await route.fulfill({
        status: 401,
        json: {
          code: "AUTH_REQUIRED",
          message: "Your session has expired. Please log in again.",
          loginUrl: "/login",
        },
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "text/plain",
      headers: {
        "X-Answer-Source": "internal_api",
        "X-Answer-Source-Label": "Your TradePro account",
      },
      body: "You currently have one active trading account.",
    });
  });

  await page.goto("/tradepro-ai");

  await expect(
    page.getByRole("heading", { name: "TradePro AI", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".ant-layout-sider .lucide-trending-up"),
  ).toBeVisible();

  const dashboardContentWidths = await page
    .locator(".tradepro-dashboard-main main > div")
    .evaluate((element) => ({
      content: element.getBoundingClientRect().width,
      parent: element.parentElement?.getBoundingClientRect().width ?? 0,
    }));
  expect(dashboardContentWidths.parent - dashboardContentWidths.content).toBeLessThan(64);

  const sidebarMenu = page.locator(".tradepro-sidebar-menu");
  const fundsMenu = sidebarMenu.locator(".ant-menu-submenu-title", {
    hasText: "Funds",
  });
  const settingsMenu = sidebarMenu.locator(".ant-menu-submenu-title", {
    hasText: "Settings",
  });
  await expect(fundsMenu.locator("xpath=..")).not.toHaveClass(
    /ant-menu-submenu-disabled/,
  );
  await fundsMenu.click();
  await expect(sidebarMenu.locator(".ant-menu-submenu-open")).toHaveCount(1);
  await settingsMenu.click();
  await expect(sidebarMenu.locator(".ant-menu-submenu-open")).toHaveCount(1);
  await expect(
    sidebarMenu.locator(".ant-menu-submenu-open > .ant-menu-submenu-title"),
  ).toContainText("Settings");

  await expect(page.getByText("55667788")).toBeVisible();
  await expect(page.getByText("+75.00 USD")).toBeVisible();
  await expect(page.getByRole("link", { name: /View Profile/ })).toHaveAttribute(
    "href",
    "/profile",
  );
  await expect(
    page.getByRole("link", { name: /Complete Verification/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Show my trading accounts" }).click();

  await expect(
    page
      .getByRole("log", { name: "TradePro AI messages" })
      .getByText("You currently have one active trading account."),
  ).toBeVisible();
  expect(aiPayload).toMatchObject({
    message: "Show my trading accounts",
    history: [],
  });
  expect(refreshRequestCount).toBe(1);
  expect(aiRequestCount).toBe(2);
  await expect(
    page.getByRole("link", { name: "TradePro AI", exact: true }),
  ).toHaveAttribute("href", "/tradepro-ai");

  await page.evaluate(() => {
    window.dispatchEvent(new Event("tradepro:logout"));
  });
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Show my trading accounts/ }),
  ).toBeVisible();

  const conversationSearch = page.getByPlaceholder("Search conversations...");
  await conversationSearch.fill("one active trading account");
  await expect(
    page.getByRole("button", { name: /Show my trading accounts/ }),
  ).toBeVisible();
  await conversationSearch.fill("no saved conversation matches this");
  await expect(page.getByText("No matching conversations")).toBeVisible();
  await conversationSearch.clear();

  await page.setViewportSize({ width: 390, height: 844 });
  const conversationButton = page.getByRole("button", {
    name: "Open conversations",
  });
  await expect(conversationButton).toBeVisible();
  await conversationButton.click();
  await expect(page.locator(".ant-drawer-open")).toBeVisible();
  await expect(
    page.locator(".ant-drawer-open .ant-drawer-title"),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});
