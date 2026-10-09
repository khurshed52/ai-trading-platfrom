import { expect, test, type Page, type Route } from "@playwright/test";

const profileResponse = {
  statusCode: 200,
  message: "Profile fetched successfully",
  data: {
    id: "user-one",
    name: "Withdrawal Tester",
    email: "withdrawal@example.com",
    role: "USER",
    isActive: true,
    status: "APPROVED",
    permissions: { withdrawalAllowed: true },
    restrictions: { withdrawalAllowedAt: null },
    customer: { customerFirstName: "Withdrawal", sid: "623729" },
  },
};

const accountsResponse = {
  statusCode: 200,
  message: "Trading accounts retrieved successfully",
  data: [
    {
      id: "account-one",
      accountNumber: "33587952",
      platform: "MT5",
      currency: "USD",
      balance: "500",
      status: "ACTIVE",
    },
    {
      id: "account-two",
      accountNumber: "74077141",
      platform: "MT4",
      currency: "USD",
      balance: "250",
      status: "ACTIVE",
    },
    {
      id: "inactive-account",
      accountNumber: "99999999",
      platform: "MT5",
      currency: "USD",
      balance: "100",
      status: "INACTIVE",
    },
  ],
};

function successResponse(accountNumber = "33587952", amount = "20") {
  return {
    statusCode: 201,
    message: "Withdrawal request submitted successfully",
    data: {
      transactionId: "b8c8359b-226a-47bd-88dd-758a241de091",
      reference: "WDR-2CA729C74FC44AF7",
      status: "PENDING",
      account: { id: "account-one", accountNumber, currency: "USD" },
      withdrawal: { amount, currency: "USD", amountUsd: amount },
      approval: { required: false, status: "NOT_REQUIRED" },
      payout: null,
      conversion: {
        exchangeRate: "1",
        exchangeRateSource: "INTERNAL",
        convertedAmount: amount,
        convertedCurrency: "USD",
      },
      idempotentReplay: false,
    },
  };
}

async function openWithdrawalPage(page: Page) {
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
    route.fulfill({ status: 200, json: profileResponse }),
  );
  await page.route("**/api/backend/accounts/all", (route) =>
    route.fulfill({ status: 200, json: accountsResponse }),
  );
  await page.route("**/api/backend/funds/exchange-rate", async (route) => {
    const request = route.request().postDataJSON() as { toCurrency: string };
    const rate = request.toCurrency === "INR" ? "96.63" : "1";
    await route.fulfill({
      status: 200,
      json: {
        statusCode: 200,
        message: "Exchange rate retrieved successfully",
        data: {
          fromCurrency: "USD",
          toCurrency: request.toCurrency,
          amount: "1",
          exchangeRate: rate,
          convertedAmount: rate,
          source: request.toCurrency === "USD" ? "INTERNAL" : "FRANKFURTER",
          quotedAt: "2026-10-08T16:49:19.238Z",
          providerDate: "2026-10-08",
        },
      },
    });
  });
  await page.goto("/funds/withdraw");
  await expect(page.getByText("MT5 · 33587952 · USD").first()).toBeVisible();
}

async function enterAmountAndSubmit(page: Page, amount: string) {
  await page.getByLabel("Account deduction (USD)").fill(amount);
  await page.getByRole("button", { name: "Withdraw Funds" }).click();
}

function assertUuid(value: string | undefined) {
  expect(value).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
}

test("loads active accounts and submits one idempotent withdrawal", async ({ page }) => {
  const requests: Array<{ body: unknown; key?: string }> = [];
  await openWithdrawalPage(page);
  await expect(page.getByText("Choose Withdrawal Method")).toHaveCount(0);
  await expect(page.getByText("99999999")).toHaveCount(0);

  await page.route("**/api/backend/funds/withdraw", async (route) => {
    requests.push({
      body: route.request().postDataJSON(),
      key: route.request().headers()["idempotency-key"],
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
    await route.fulfill({ status: 201, json: successResponse() });
  });

  await page.getByLabel("Account deduction (USD)").fill("20");
  await page.getByRole("button", { name: "Withdraw Funds" }).dblclick();

  await expect(
    page.getByText("Withdrawal Request Submitted", { exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(requests[0].body).toEqual({
    accountNumber: "33587952",
    amount: 20,
    payoutCurrency: "USD",
  });
  assertUuid(requests[0].key);
  await expect(page.getByText("Reported balance: 500.00 USD")).toBeVisible();
});

test("account and payout currency changes update requests and conversion", async ({ page }) => {
  let withdrawalBody: unknown;
  const rateBodies: unknown[] = [];
  await openWithdrawalPage(page);
  await page.unroute("**/api/backend/funds/exchange-rate");
  await page.route("**/api/backend/funds/exchange-rate", async (route) => {
    const body = route.request().postDataJSON();
    rateBodies.push(body);
    await route.fulfill({
      status: 200,
      json: {
        statusCode: 200,
        message: "Exchange rate retrieved successfully",
        data: {
          fromCurrency: "USD",
          toCurrency: "INR",
          amount: "1",
          exchangeRate: "96.63",
          convertedAmount: "96.63",
          source: "FRANKFURTER",
          quotedAt: "2026-10-08T16:49:19.238Z",
          providerDate: "2026-10-08",
        },
      },
    });
  });
  await page.route("**/api/backend/funds/withdraw", async (route) => {
    withdrawalBody = route.request().postDataJSON();
    await route.fulfill({ status: 201, json: successResponse("74077141") });
  });

  await page.locator(".ant-select").first().click();
  await page.getByText("MT4 · 74077141 · USD").click();
  await page.getByLabel("Payout currency").click();
  await page.getByText("INR", { exact: true }).last().click();
  await expect(page.getByText("1 USD = 96.63 INR").first()).toBeVisible();
  await enterAmountAndSubmit(page, "20");
  await expect(
    page.getByText("Withdrawal Request Submitted", { exact: true }),
  ).toBeVisible();

  expect(rateBodies.at(-1)).toEqual({
    fromCurrency: "USD",
    toCurrency: "INR",
    amount: 1,
  });
  expect(withdrawalBody).toEqual({
    accountNumber: "74077141",
    amount: 20,
    payoutCurrency: "INR",
  });
});

test("retry after an uncertain result preserves the key and body", async ({ page }) => {
  const requests: Array<{ body: unknown; key?: string }> = [];
  let attempt = 0;
  await openWithdrawalPage(page);
  await page.route("**/api/backend/funds/withdraw", async (route) => {
    attempt += 1;
    requests.push({
      body: route.request().postDataJSON(),
      key: route.request().headers()["idempotency-key"],
    });
    if (attempt === 1) {
      await route.fulfill({
        status: 500,
        json: { statusCode: 500, message: "Temporary error", data: null },
      });
      return;
    }
    await route.fulfill({ status: 201, json: successResponse() });
  });

  await enterAmountAndSubmit(page, "20");
  await expect(page.getByText("A previous withdrawal has an uncertain result")).toBeVisible();
  await page.getByRole("button", { name: "Retry original attempt" }).click();
  await expect(
    page.getByText("Withdrawal Request Submitted", { exact: true }),
  ).toBeVisible();

  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual(requests[0]);
});

test("a deliberate second withdrawal gets a new key and opens Funds History", async ({ page }) => {
  const keys: Array<string | undefined> = [];
  await openWithdrawalPage(page);
  await page.route("**/api/backend/funds/withdraw", async (route) => {
    keys.push(route.request().headers()["idempotency-key"]);
    await route.fulfill({ status: 201, json: successResponse() });
  });
  await page.route("**/api/backend/funds/transactions", (route) =>
    route.fulfill({
      status: 200,
      json: {
        statusCode: 200,
        message: "Transactions retrieved successfully",
        data: { page: 1, pageSize: 10, dataCount: 0, pageCount: 0, pageData: [] },
      },
    }),
  );

  await enterAmountAndSubmit(page, "20");
  await expect(
    page.getByText("Withdrawal Request Submitted", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).last().click();
  await page.getByRole("button", { name: "Withdraw Funds" }).click();
  await expect(
    page.getByText("Withdrawal Request Submitted", { exact: true }),
  ).toBeVisible();

  expect(keys).toHaveLength(2);
  assertUuid(keys[0]);
  assertUuid(keys[1]);
  expect(keys[1]).not.toBe(keys[0]);

  await page.getByRole("button", { name: "View Funds History" }).click();
  await expect(page).toHaveURL(/\/funds\/history$/);
});

for (const scenario of [
  { status: 400, message: "Amount is invalid" },
  { status: 403, message: "Withdrawals are not permitted" },
  { status: 409, message: "Idempotency conflict" },
]) {
  test(`handles ${scenario.status} withdrawal errors safely`, async ({ page }) => {
    await openWithdrawalPage(page);
    await page.route("**/api/backend/funds/withdraw", (route: Route) =>
      route.fulfill({
        status: scenario.status,
        json: { statusCode: scenario.status, message: scenario.message, data: null },
      }),
    );

    await enterAmountAndSubmit(page, "20");
    await expect(page.getByText(scenario.message).first()).toBeVisible();

    if (scenario.status === 409) {
      await expect(page.getByText("Withdrawal attempt conflict")).toBeVisible();
    } else {
      await expect(page.getByText("Retry original attempt")).toHaveCount(0);
    }
  });
}
