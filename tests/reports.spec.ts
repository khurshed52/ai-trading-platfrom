import { expect, test } from "@playwright/test";
import type { Page, Route } from "@playwright/test";

const depositReference = "DEP-6A36DA964283451C";
const withdrawalReference = "WDR-9E2527486D74404F";
const transferReference = "TRF-DEA30387C5D442FA";

async function mockAuthenticatedUser(page: Page) {
  await page.route("**/api/backend/profile", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 200,
        message: "Profile fetched successfully",
        data: {
          id: "user-1",
          name: "Test Trader",
          email: "trader@example.com",
          role: "USER",
          isActive: true,
          status: "APPROVED",
          permissions: { withdrawalAllowed: true },
          restrictions: { withdrawalAllowedAt: null },
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          customer: {
            id: "customer-1",
            customerFirstName: "Test",
            customerLastName: "Trader",
            customerNationality: "AE",
            phoneNumber: "+971500000000",
            isActive: true,
            sid: "123456",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        },
      }),
    });
  });

  await page.route("**/api/backend/accounts/all", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 200,
        message: "Accounts fetched successfully",
        data: [
          {
            id: "account-1",
            accountNumber: "33587952",
            platform: "MT5",
            currency: "USD",
            balance: "101",
            status: "ACTIVE",
          },
          {
            id: "account-2",
            accountNumber: "44587953",
            platform: "MT4",
            currency: "EUR",
            balance: "92",
            status: "ACTIVE",
          },
        ],
      }),
    });
  });
}

async function fulfillDepositReport(route: Route) {
  const request = route.request().postDataJSON() as {
    page: number;
    pageSize: number;
  };

  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      page: request.page,
      pageSize: request.pageSize,
      dataCount: 1,
      pageCount: 1,
      pageData: [
        {
          id: "deposit-1",
          reference: depositReference,
          type: "DEPOSIT",
          status: "PENDING",
          tradingAccount: "33587952",
          amount: "101.00",
          currency: "USD",
          convertedAmount: "101.00",
          convertedCurrency: "USD",
          exchangeRate: "1",
          exchangeRateSource: "INTERNAL",
          paymentMethod: "STRIPE",
          createdAt: "2026-10-12T12:06:34.156Z",
          completedAt: null,
        },
      ],
    }),
  });
}

async function fulfillWithdrawalReport(route: Route) {
  const request = route.request().postDataJSON() as {
    page: number;
    pageSize: number;
  };

  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      statusCode: 200,
      message: "Withdrawal report fetched successfully",
      page: request.page,
      pageSize: request.pageSize,
      dataCount: 11,
      pageCount: 2,
      pageData: [
        {
          id: `withdrawal-${request.page}`,
          reference: withdrawalReference,
          type: "WITHDRAWAL",
          status: "PENDING",
          tradingAccount: "33587952",
          amount: "10.00",
          currency: "USD",
          convertedAmount: null,
          convertedCurrency: null,
          exchangeRate: null,
          exchangeRateSource: null,
          withdrawalApprovalStatus: "NOT_REQUIRED",
          payoutMethod: null,
          payoutStatus: null,
          approvedAt: null,
          rejectedAt: null,
          createdAt: "2026-10-12T12:06:34.156Z",
          completedAt: null,
        },
      ],
    }),
  });
}

async function fulfillTransferReport(route: Route) {
  const request = route.request().postDataJSON() as {
    page: number;
    pageSize: number;
  };

  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      statusCode: 200,
      message: "Transactions retrieved successfully",
      page: request.page,
      pageSize: request.pageSize,
      dataCount: 11,
      pageCount: 2,
      pageData: [
        {
          id: `transfer-${request.page}`,
          reference: transferReference,
          type: "TRANSFER",
          status: "COMPLETED",
          sourceAccount: "33587952",
          destinationAccount: "44587953",
          amount: "100.00",
          currency: "USD",
          convertedAmount: "92.00",
          convertedCurrency: "EUR",
          exchangeRate: "0.92000000",
          exchangeRateSource: "INTERNAL",
          createdAt: "2026-10-13T08:00:00.000Z",
          completedAt: "2026-10-13T08:00:00.000Z",
        },
      ],
    }),
  });
}

test.describe("Customer reports", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      {
        name: "access_token",
        value: "reports-test-token",
        url: "http://localhost:3000",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await mockAuthenticatedUser(page);
  });

  test("loads the deposit report and keeps Reports as the open parent", async ({
    context,
    page,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.route("**/api/backend/reports/deposits", fulfillDepositReport);

    await page.goto("/reports");

    await expect(page).toHaveURL(/\/reports\/deposit$/);
    await expect(
      page.getByRole("heading", { name: "Deposit Report" }),
    ).toBeVisible();
    await expect(page.getByText(depositReference)).toBeVisible();
    await expect(page.getByText("101.00 USD").first()).toBeVisible();
    await expect(page.getByText("STRIPE")).toBeVisible();
    await expect(
      page.locator(".ant-menu-submenu-open").filter({ hasText: "Reports" }),
    ).toBeVisible();
    await expect(page.locator(".ant-menu-submenu-open")).toHaveCount(1);

    await page
      .getByRole("button", { name: `Copy reference ${depositReference}` })
      .click();
    await expect(page.getByText("Reference copied")).toBeVisible();
  });

  test("sends only applied supported filters", async ({ page }) => {
    const requests: unknown[] = [];
    await page.route("**/api/backend/reports/deposits", async (route) => {
      requests.push(route.request().postDataJSON());
      await fulfillDepositReport(route);
    });
    await page.goto("/reports/deposit");
    await expect.poll(() => requests.length).toBe(1);

    await page.getByLabel("Reference", { exact: true }).fill("dep-6a36");
    await page.getByLabel("Status", { exact: true }).click();
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("Pending", { exact: true })
      .click();
    await page.getByPlaceholder("From date").click();
    await page.locator('[title="2026-10-01"]').click();
    await page.locator('[title="2026-10-12"]').click();
    await page.getByLabel("Trading Account", { exact: true }).click();
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("33587952 · MT5", { exact: true })
      .click();
    await page.getByLabel("Payment Method", { exact: true }).click();
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("Stripe", { exact: true })
      .click();

    await expect.poll(() => requests.length).toBe(1);
    await page.getByRole("button", { name: "Apply Filters" }).click();
    await expect.poll(() => requests.length).toBe(2);
    expect(requests[1]).toEqual({
      page: 1,
      pageSize: 10,
      filters: {
        reference: "dep-6a36",
        status: "PENDING",
        dateFrom: "2026-10-01",
        dateTo: "2026-10-12",
        tradingAccount: "33587952",
        paymentMethod: "STRIPE",
      },
    });
  });

  test("loads withdrawal data with neutral approval and nullable payout fields", async ({
    page,
  }) => {
    await page.route(
      "**/api/backend/reports/withdrawals",
      fulfillWithdrawalReport,
    );

    await page.goto("/reports/withdrawal");

    await expect(
      page.getByRole("heading", { name: "Withdrawal Report" }),
    ).toBeVisible();
    await expect(
      page.getByText("View and filter your withdrawal transactions."),
    ).toBeVisible();
    await expect(page.getByText(withdrawalReference)).toBeVisible();
    await expect(page.getByText("NOT REQUIRED")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Payout Method" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Payout Status" })).toBeVisible();
    await expect(page.getByText("—")).toHaveCount(3);
  });

  test("applies all withdrawal filters and preserves them during pagination", async ({
    page,
  }) => {
    const requests: unknown[] = [];
    await page.route("**/api/backend/reports/withdrawals", async (route) => {
      requests.push(route.request().postDataJSON());
      await fulfillWithdrawalReport(route);
    });
    await page.goto("/reports/withdrawal");
    await expect.poll(() => requests.length).toBe(1);

    await page.getByLabel("Reference", { exact: true }).fill("wdr-9e25");
    await page.getByLabel("Status", { exact: true }).click();
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("Pending", { exact: true })
      .click();
    await page.getByPlaceholder("From date").click();
    await page.locator('[title="2026-10-01"]').click();
    await page.locator('[title="2026-10-12"]').click();
    await page.getByLabel("Trading Account", { exact: true }).click();
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("33587952 · MT5", { exact: true })
      .click();
    await page.getByLabel("Approval Status", { exact: true }).click();
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("Not Required", { exact: true })
      .click();
    await page.getByLabel("Payout Method", { exact: true }).click();
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("Stripe", { exact: true })
      .click();

    await page.getByRole("button", { name: "Apply Filters" }).click();
    await expect.poll(() => requests.length).toBe(2);
    expect(requests[1]).toEqual({
      page: 1,
      pageSize: 10,
      filters: {
        reference: "wdr-9e25",
        status: "PENDING",
        dateFrom: "2026-10-01",
        dateTo: "2026-10-12",
        tradingAccount: "33587952",
        withdrawalApprovalStatus: "NOT_REQUIRED",
        payoutMethod: "STRIPE",
      },
    });

    await page.locator(".ant-pagination-next").click();
    await expect.poll(() => requests.length).toBe(3);
    expect(requests[2]).toEqual({
      ...(requests[1] as Record<string, unknown>),
      page: 2,
    });
  });

  test("loads the transfer report and formats transaction values", async ({
    page,
  }) => {
    await page.route("**/api/backend/reports/transfers", fulfillTransferReport);
    await page.goto("/reports/transfer");

    await expect(
      page.getByRole("heading", { name: "Transfer Report" }),
    ).toBeVisible();
    await expect(
      page.getByText("View and filter your transfer transactions."),
    ).toBeVisible();
    await expect(page.getByText(transferReference)).toBeVisible();
    await expect(page.getByText("100.00 USD")).toBeVisible();
    await expect(page.getByText("92.00 EUR")).toBeVisible();
    await expect(page.getByText("0.92000000")).toBeVisible();
    await expect(page.getByText("INTERNAL")).toBeVisible();
    await expect(page.getByText("COMPLETED")).toBeVisible();
  });

  test("sends exact transfer filters and preserves them during pagination", async ({
    page,
  }) => {
    const requests: unknown[] = [];
    await page.route("**/api/backend/reports/transfers", async (route) => {
      requests.push(route.request().postDataJSON());
      await fulfillTransferReport(route);
    });
    await page.goto("/reports/transfer");
    await expect.poll(() => requests.length).toBe(1);

    await page.getByLabel("Reference", { exact: true }).fill("trf-dea3");
    await page.getByLabel("Status", { exact: true }).click();
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("Completed", { exact: true })
      .click();
    await page.getByPlaceholder("From date").click();
    await page.locator('[title="2026-10-01"]').click();
    await page.locator('[title="2026-10-13"]').click();
    await page.getByLabel("Source Account", { exact: true }).click();
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("33587952 · MT5", { exact: true })
      .click();
    await page.getByLabel("Destination Account", { exact: true }).click();
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("44587953 · MT4", { exact: true })
      .last()
      .click();

    await page.getByRole("button", { name: "Apply Filters" }).click();
    await expect.poll(() => requests.length).toBe(2);
    expect(requests[1]).toEqual({
      page: 1,
      pageSize: 10,
      filters: {
        status: "COMPLETED",
        dateFrom: "2026-10-01",
        dateTo: "2026-10-13",
        reference: "trf-dea3",
        sourceAccount: "33587952",
        destinationAccount: "44587953",
      },
    });

    await page.locator(".ant-pagination-next").click();
    await expect.poll(() => requests.length).toBe(3);
    expect(requests[2]).toEqual({
      ...(requests[1] as Record<string, unknown>),
      page: 2,
    });
  });

  test("hides report pagination when filters return no transactions", async ({
    page,
  }) => {
    await page.route("**/api/backend/reports/transfers", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 200,
          message: "Transactions retrieved successfully",
          page: 1,
          pageSize: 10,
          dataCount: 0,
          pageCount: 0,
          pageData: [],
        }),
      });
    });
    await page.goto("/reports/transfer");

    await page.getByLabel("Status", { exact: true }).click();
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("Pending", { exact: true })
      .click();
    await page.getByRole("button", { name: "Apply Filters" }).click();

    await expect(page.getByText("No transfer transactions found.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset Filters" })).toBeVisible();
    await expect(page.locator(".ant-pagination")).toHaveCount(0);
    await expect(page.getByText(/Showing 0 to 0/)).toHaveCount(0);
  });
});
