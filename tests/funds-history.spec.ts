import { expect, test } from "@playwright/test";

const transactionsResponse = {
  statusCode: 200,
  message: "Transactions retrieved successfully",
  data: {
    page: 1,
    pageSize: 10,
    dataCount: 2,
    pageCount: 1,
    pageData: [
      {
        transactionId: "109bc1f2-0bf1-41bb-8b6a-2c9a336be254",
        reference: "DEP-B0F76CAE93974F2F",
        type: "DEPOSIT",
        status: "PENDING",
        amount: "20",
        currency: "USD",
        convertedAmount: "20",
        convertedCurrency: "USD",
        conversion: {
          exchangeRate: "1",
          exchangeRateSource: "INTERNAL",
        },
        account: {
          id: "account-one",
          accountNumber: "33587952",
          currency: "USD",
        },
        sourceAccount: null,
        destinationAccount: null,
        approvalStatus: "NOT_REQUIRED",
        completedAt: null,
        createdAt: "2026-10-08T17:52:29.384Z",
      },
      {
        transactionId: "075fe1b9-7f5a-40eb-85ab-1500583dadaa",
        reference: "DEP-0D45F4E1BEC24B37",
        type: "DEPOSIT",
        status: "PENDING",
        amount: "50",
        currency: "USD",
        convertedAmount: "50",
        convertedCurrency: "USD",
        conversion: {
          exchangeRate: "1",
          exchangeRateSource: "INTERNAL",
        },
        account: {
          id: "account-two",
          accountNumber: "74077141",
          currency: "USD",
        },
        sourceAccount: null,
        destinationAccount: null,
        approvalStatus: "NOT_REQUIRED",
        completedAt: null,
        createdAt: "2026-10-08T17:08:24.109Z",
      },
    ],
  },
};

test("loads and filters funds transactions with POST bodies", async ({ page }) => {
  await page.context().addCookies([
    {
      name: "access_token",
      value: "test-access-token",
      url: "http://localhost:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  const requestBodies: unknown[] = [];
  await page.route("**/api/backend/profile", (route) =>
    route.fulfill({
      status: 200,
      json: {
        statusCode: 200,
        message: "Profile fetched successfully",
        data: {
          name: "sid test",
          email: "sid@example.com",
          status: "APPROVED",
          customer: { customerFirstName: "sid" },
        },
      },
    }),
  );
  await page.route("**/api/backend/funds/transactions", async (route) => {
    expect(route.request().method()).toBe("POST");
    requestBodies.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, json: transactionsResponse });
  });

  await page.goto("/funds/history");

  await expect(page.getByRole("heading", { name: "Funds History" })).toBeVisible();
  await expect(page.getByText("DEP-B0F76CAE93974F2F")).toBeVisible();
  await expect(page.getByText("DEP-0D45F4E1BEC24B37")).toBeVisible();
  await expect(page.getByText("$70.00").first()).toBeVisible();
  expect(requestBodies[0]).toEqual({ page: 1, pageSize: 10, filters: {} });

  await page.getByPlaceholder("Search reference...").fill("DEP-B0F");
  await page.getByRole("button", { name: "Apply Filters" }).click();

  await expect.poll(() => requestBodies.length).toBe(2);
  expect(requestBodies[1]).toEqual({
    page: 1,
    pageSize: 10,
    filters: { reference: "DEP-B0F" },
  });
});
