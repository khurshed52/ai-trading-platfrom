import { expect, test, type Page } from "@playwright/test";

const profileResponse = {
  statusCode: 200,
  message: "Profile fetched successfully",
  data: {
    id: "user-one",
    name: "Deposit Tester",
    email: "deposit@example.com",
    role: "USER",
    isActive: true,
    status: "APPROVED",
    permissions: { withdrawalAllowed: true },
    restrictions: { withdrawalAllowedAt: null },
    createdAt: "2026-10-05T17:54:19.375Z",
    updatedAt: "2026-10-05T17:54:19.375Z",
    customer: {
      id: "customer-one",
      sid: "623729",
      customerFirstName: "Deposit",
      customerLastName: "Tester",
      customerNationality: "AE",
      phoneNumber: "+971501234986",
      isActive: true,
      createdAt: "2026-10-05T17:54:19.375Z",
      updatedAt: "2026-10-05T17:54:19.375Z",
    },
  },
};

const accountsResponse = {
  statusCode: 200,
  message: "Trading accounts retrieved successfully",
  data: [
    {
      id: "active-account",
      accountNumber: "33587952",
      platform: "MT5",
      currency: "USD",
      balance: "0",
      status: "ACTIVE",
    },
    {
      id: "inactive-account",
      accountNumber: "99999999",
      platform: "MT4",
      currency: "USD",
      balance: "0",
      status: "INACTIVE",
    },
  ],
};

async function openDepositPage(page: Page) {
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
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toEqual({
      fromCurrency: "USD",
      toCurrency: "USD",
      amount: 1,
    });
    await route.fulfill({
      status: 200,
      json: {
        statusCode: 200,
        message: "Exchange rate retrieved successfully",
        data: {
          fromCurrency: "USD",
          toCurrency: "USD",
          amount: "1",
          exchangeRate: "1",
          convertedAmount: "1",
          source: "INTERNAL",
          quotedAt: "2026-10-08T16:49:19.238Z",
          providerDate: "2026-10-08",
        },
      },
    });
  });

  await page.goto("/funds/deposit");
  await expect(page.getByText("33587952 · MT5 · USD")).toBeVisible();
  await expect(page.getByText("1 USD = 1 USD", { exact: true })).toBeVisible();
}

async function selectStripeAndEnterAmount(page: Page) {
  await page.getByText("Stripe", { exact: true }).click();
  await page.getByRole("spinbutton").fill("50");
}

test("loads only active accounts and requests the verified exchange-rate body", async ({
  page,
}) => {
  await openDepositPage(page);

  await expect(page.getByText("33587952 · MT5 · USD")).toBeVisible();
  await expect(page.getByText("99999999 · MT4 · USD")).toHaveCount(0);
});

test("sends one Stripe request with a UUID and redirects in the same tab", async ({
  page,
}) => {
  await openDepositPage(page);
  await selectStripeAndEnterAmount(page);

  const depositRequests: Array<{ key: string | null; body: unknown }> = [];
  await page.route("**/api/backend/funds/deposit", async (route) => {
    depositRequests.push({
      key: route.request().headers()["idempotency-key"] ?? null,
      body: route.request().postDataJSON(),
    });
    await new Promise((resolve) => setTimeout(resolve, 150));
    await route.fulfill({
      status: 201,
      json: {
        statusCode: 201,
        message: "Deposit initiated successfully",
        data: {
          transactionId: "transaction-one",
          reference: "DEP-ONE",
          status: "PENDING",
          account: { id: "active-account", accountNumber: "33587952", currency: "USD" },
          deposit: { amount: "50", currency: "USD" },
          conversion: {
            exchangeRate: "1",
            exchangeRateSource: "INTERNAL",
            convertedAmount: "50",
            convertedCurrency: "USD",
          },
          payment: {
            attemptId: "attempt-one",
            provider: "STRIPE",
            status: "PENDING",
            checkoutUrl: "https://checkout.stripe.com/test-session",
          },
          idempotentReplay: false,
        },
      },
    });
  });
  await page.route("https://checkout.stripe.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "Checkout" }),
  );

  await page.getByRole("button", { name: "Continue to Stripe" }).evaluate(
    (button) => {
      (button as HTMLElement).click();
      (button as HTMLElement).click();
    },
  );

  await expect(page).toHaveURL("https://checkout.stripe.com/test-session");
  expect(depositRequests).toHaveLength(1);
  expect(depositRequests[0].key).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
  expect(depositRequests[0].body).toEqual({
    accountNumber: "33587952",
    amount: 50,
    currency: "USD",
    provider: "STRIPE",
  });
});

test("retry reuses the exact idempotency key and request body", async ({ page }) => {
  await openDepositPage(page);
  await selectStripeAndEnterAmount(page);

  const depositRequests: Array<{ key: string | null; body: unknown }> = [];
  await page.route("**/api/backend/funds/deposit", async (route) => {
    depositRequests.push({
      key: route.request().headers()["idempotency-key"] ?? null,
      body: route.request().postDataJSON(),
    });

    if (depositRequests.length === 1) {
      await route.fulfill({
        status: 500,
        json: { statusCode: 500, message: "Unknown server result", data: null },
      });
      return;
    }

    await route.fulfill({
      status: 201,
      json: {
        statusCode: 201,
        message: "Existing deposit recovered",
        data: {
          transactionId: "transaction-one",
          reference: "DEP-ONE",
          status: "PENDING",
          account: { id: "active-account", accountNumber: "33587952", currency: "USD" },
          deposit: { amount: "50", currency: "USD" },
          conversion: {
            exchangeRate: "1",
            exchangeRateSource: "INTERNAL",
            convertedAmount: "50",
            convertedCurrency: "USD",
          },
          payment: {
            attemptId: "attempt-one",
            provider: "STRIPE",
            status: "PENDING",
            checkoutUrl: "https://checkout.stripe.com/recovered-session",
          },
          idempotentReplay: true,
        },
      },
    });
  });
  await page.route("https://checkout.stripe.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "Checkout" }),
  );

  await page.getByRole("button", { name: "Continue to Stripe" }).click();
  await expect(page.getByText(/uncertain result/i)).toBeVisible();
  await page.getByRole("button", { name: "Retry original attempt" }).click();

  await expect(page).toHaveURL("https://checkout.stripe.com/recovered-session");
  expect(depositRequests).toHaveLength(2);
  expect(depositRequests[1]).toEqual(depositRequests[0]);
});

test("does not redirect when Checkout URL is not an approved Stripe URL", async ({
  page,
}) => {
  await openDepositPage(page);
  await selectStripeAndEnterAmount(page);

  await page.route("**/api/backend/funds/deposit", (route) =>
    route.fulfill({
      status: 201,
      json: {
        statusCode: 201,
        message: "Deposit initiated successfully",
        data: {
          transactionId: "transaction-one",
          reference: "DEP-ONE",
          status: "PENDING",
          account: { id: "active-account", accountNumber: "33587952", currency: "USD" },
          deposit: { amount: "50", currency: "USD" },
          conversion: {
            exchangeRate: "1",
            exchangeRateSource: "INTERNAL",
            convertedAmount: "50",
            convertedCurrency: "USD",
          },
          payment: {
            attemptId: "attempt-one",
            provider: "STRIPE",
            status: "PENDING",
            checkoutUrl: "https://example.com/not-stripe",
          },
          idempotentReplay: false,
        },
      },
    }),
  );

  await page.getByRole("button", { name: "Continue to Stripe" }).click();
  await expect(page).toHaveURL(/\/funds\/deposit$/);
  await expect(page.getByText("Stripe Checkout needs attention")).toBeVisible();
});

test("HTTP 409 preserves the original attempt instead of generating a new key", async ({
  page,
}) => {
  await openDepositPage(page);
  await selectStripeAndEnterAmount(page);

  const keys: Array<string | null> = [];
  await page.route("**/api/backend/funds/deposit", async (route) => {
    keys.push(route.request().headers()["idempotency-key"] ?? null);
    await route.fulfill({
      status: 409,
      json: {
        statusCode: 409,
        message: "Idempotency conflict",
        data: null,
      },
    });
  });

  await page.getByRole("button", { name: "Continue to Stripe" }).click();
  await expect(
    page.getByText("This deposit conflicts with an existing attempt"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Retry original attempt" }).click();
  await expect.poll(() => keys.length).toBe(2);
  expect(keys[1]).toBe(keys[0]);
});

test("a deliberate second submission creates a new key and freezes its new body", async ({
  page,
}) => {
  await openDepositPage(page);
  await selectStripeAndEnterAmount(page);

  const requests: Array<{ key: string | null; body: Record<string, unknown> }> = [];
  await page.route("**/api/backend/funds/deposit", async (route) => {
    requests.push({
      key: route.request().headers()["idempotency-key"] ?? null,
      body: route.request().postDataJSON() as Record<string, unknown>,
    });
    await route.fulfill({
      status: 400,
      json: { statusCode: 400, message: "Validation failed", data: null },
    });
  });

  await page.getByRole("button", { name: "Continue to Stripe" }).click();
  await expect.poll(() => requests.length).toBe(1);

  await page.getByRole("spinbutton").fill("60");
  await page.getByRole("button", { name: "Continue to Stripe" }).click();
  await expect.poll(() => requests.length).toBe(2);

  expect(requests[1].key).not.toBe(requests[0].key);
  expect(requests[0].body.amount).toBe(50);
  expect(requests[1].body.amount).toBe(60);
});
