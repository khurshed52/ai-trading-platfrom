import { expect, test, type Page } from "@playwright/test";

const profileResponse = {
  statusCode: 200,
  message: "Profile fetched successfully",
  data: {
    id: "user-one",
    name: "Transfer Tester",
    email: "transfer@example.com",
    role: "USER",
    isActive: true,
    status: "APPROVED",
    permissions: { withdrawalAllowed: true },
    restrictions: { withdrawalAllowedAt: null },
    customer: { customerFirstName: "Transfer", sid: "623729" },
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
      balance: "45",
      status: "ACTIVE",
    },
    {
      id: "account-two",
      accountNumber: "36350537",
      platform: "MT4",
      currency: "EUR",
      balance: "25",
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

function transferResponse() {
  return {
    statusCode: 201,
    message: "Transfer completed successfully",
    data: {
      transactionId: "c865ae8b-0264-4b40-8339-128c627392cc",
      reference: "TRF-DEA30387C5D442FA",
      status: "COMPLETED",
      source: {
        accountId: "account-one",
        accountNumber: "33587952",
        amount: "5",
        currency: "USD",
        balance: "40",
        reservedBalance: "0",
      },
      destination: {
        accountId: "account-two",
        accountNumber: "36350537",
        amount: "4.5",
        currency: "EUR",
        balance: "29.5",
      },
      conversion: { exchangeRate: "0.9", exchangeRateSource: "FRANKFURTER" },
      completedAt: "2026-10-09T11:13:40.859Z",
      idempotentReplay: false,
    },
  };
}

async function openTransferPage(page: Page) {
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
    const body = route.request().postDataJSON() as {
      fromCurrency: string;
      toCurrency: string;
    };
    const rate = body.fromCurrency === "USD" ? "0.9" : "1.11111111";
    await route.fulfill({
      status: 200,
      json: {
        statusCode: 200,
        message: "Exchange rate retrieved successfully",
        data: {
          ...body,
          amount: "1",
          exchangeRate: rate,
          convertedAmount: rate,
          source: "FRANKFURTER",
          quotedAt: "2026-10-09T11:00:00.000Z",
          providerDate: "2026-10-09",
        },
      },
    });
  });
  await page.goto("/funds/transfer");
  await expect(page.getByText("MT5 · 33587952 · USD").first()).toBeVisible();
}

function assertUuid(value: string | undefined) {
  expect(value).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
}

async function submitAmount(page: Page, amount: string) {
  await page.getByLabel("Transfer amount (USD)").fill(amount);
  await page.getByRole("button", { name: "Transfer Funds" }).click();
}

test("submits a transfer once with runtime accounts and a UUID", async ({ page }) => {
  const requests: Array<{ body: unknown; key?: string }> = [];
  await openTransferPage(page);
  await expect(page.getByText("99999999")).toHaveCount(0);
  await page.route("**/api/backend/funds/transfer", async (route) => {
    requests.push({
      body: route.request().postDataJSON(),
      key: route.request().headers()["idempotency-key"],
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
    await route.fulfill({ status: 201, json: transferResponse() });
  });

  await page.getByLabel("Transfer amount (USD)").fill("5");
  await page.getByRole("button", { name: "Transfer Funds" }).dblclick();
  await expect(page.getByText("Transfer Completed", { exact: true })).toBeVisible();

  expect(requests).toHaveLength(1);
  expect(requests[0].body).toEqual({
    sourceAccountNumber: "33587952",
    destinationAccountNumber: "36350537",
    amount: 5,
  });
  assertUuid(requests[0].key);
  await expect(page.getByText("Reported balance: 45.00 USD")).toBeVisible();
});

test("swapping accounts requests the reverse exchange rate", async ({ page }) => {
  const rateBodies: unknown[] = [];
  await openTransferPage(page);
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
          fromCurrency: "EUR",
          toCurrency: "USD",
          amount: "1",
          exchangeRate: "1.11111111",
          convertedAmount: "1.11111111",
          source: "FRANKFURTER",
          quotedAt: "2026-10-09T11:00:00.000Z",
          providerDate: "2026-10-09",
        },
      },
    });
  });

  await page.getByRole("button", { name: "Swap transfer accounts" }).click();
  await expect(page.getByText("1 EUR = 1.11111111 USD").first()).toBeVisible();
  expect(rateBodies.at(-1)).toEqual({
    fromCurrency: "EUR",
    toCurrency: "USD",
    amount: 1,
  });
});

test("validates the reported source balance before submitting", async ({ page }) => {
  let requestCount = 0;
  await openTransferPage(page);
  await page.route("**/api/backend/funds/transfer", (route) => {
    requestCount += 1;
    return route.fulfill({ status: 201, json: transferResponse() });
  });

  await submitAmount(page, "50");
  await expect(page.getByText("Amount exceeds the reported account balance")).toBeVisible();
  expect(requestCount).toBe(0);
});

test("retry preserves the original transfer body and key", async ({ page }) => {
  const requests: Array<{ body: unknown; key?: string }> = [];
  let attempt = 0;
  await openTransferPage(page);
  await page.route("**/api/backend/funds/transfer", async (route) => {
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
    await route.fulfill({ status: 201, json: transferResponse() });
  });

  await submitAmount(page, "5");
  await expect(page.getByText("A previous transfer has an uncertain result")).toBeVisible();
  await page.getByRole("button", { name: "Retry original attempt" }).click();
  await expect(page.getByText("Transfer Completed", { exact: true })).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual(requests[0]);
});

test("a second transfer gets a new key and can open Funds History", async ({ page }) => {
  const keys: Array<string | undefined> = [];
  await openTransferPage(page);
  await page.route("**/api/backend/funds/transfer", async (route) => {
    keys.push(route.request().headers()["idempotency-key"]);
    await route.fulfill({ status: 201, json: transferResponse() });
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

  await submitAmount(page, "5");
  await page.getByRole("button", { name: "Close", exact: true }).last().click();
  await page.getByRole("button", { name: "Transfer Funds" }).click();
  await expect(page.getByText("Transfer Completed", { exact: true })).toBeVisible();

  expect(keys).toHaveLength(2);
  assertUuid(keys[0]);
  assertUuid(keys[1]);
  expect(keys[1]).not.toBe(keys[0]);

  await page.getByRole("button", { name: "View Funds History" }).click();
  await expect(page).toHaveURL(/\/funds\/history$/);
});

for (const scenario of [
  { status: 400, message: "Transfer amount is invalid" },
  { status: 403, message: "Transfers are not permitted" },
  { status: 409, message: "Idempotency conflict" },
]) {
  test(`handles ${scenario.status} transfer errors safely`, async ({ page }) => {
    await openTransferPage(page);
    await page.route("**/api/backend/funds/transfer", (route) =>
      route.fulfill({
        status: scenario.status,
        json: { statusCode: scenario.status, message: scenario.message, data: null },
      }),
    );

    await submitAmount(page, "5");
    await expect(page.getByText(scenario.message).first()).toBeVisible();
    if (scenario.status === 409) {
      await expect(page.getByText("Transfer attempt conflict")).toBeVisible();
    } else {
      await expect(page.getByText("Retry original attempt")).toHaveCount(0);
    }
  });
}
