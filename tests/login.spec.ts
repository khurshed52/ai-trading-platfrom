import { expect, test } from "@playwright/test";
import type { BrowserContext, Page } from "@playwright/test";

const LOGIN_URL = "**/api/auth/login";
const REMEMBERED_EMAIL_KEY = "tradepro_remembered_email";

const credentials = {
  email: "trader@example.com",
  password: "secure-test-password",
};

async function mockSuccessfulLogin(
  page: Page,
  context: BrowserContext,
) {
  await context.addCookies([
    {
      name: "access_token",
      value: "playwright-access-token",
      url: "http://localhost:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.route(LOGIN_URL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 200,
        message: "Login successful",
        data: {
          accessToken: "playwright-access-token",
          user: {
            id: "playwright-user",
            name: "Test Trader",
            email: credentials.email,
            role: "USER",
          },
        },
      }),
    });
  });
}

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("shows the login form and account recovery links", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Welcome Back!" }),
    ).toBeVisible();
    await expect(
      page.getByText("Sign in to access your trading dashboard", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("checkbox", { name: "Remember me" }),
    ).not.toBeChecked();
    await expect(page.getByRole("button", { name: "Login" })).toBeEnabled();
    await expect(
      page.getByRole("link", { name: "Forgot Password?" }),
    ).toHaveAttribute("href", "/forgot-password");
    await expect(
      page.getByRole("link", { name: "Create Account" }),
    ).toHaveAttribute("href", "/register");
  });

  test("does not show validation errors before the user submits", async ({
    page,
  }) => {
    await expect(
      page.getByText("Please enter your email address"),
    ).toHaveCount(0);
    await expect(page.getByText("Please enter your password")).toHaveCount(
      0,
    );
  });

  test("validates required fields and email format without calling the API", async ({
    page,
  }) => {
    let loginRequestCount = 0;
    await page.route(LOGIN_URL, async (route) => {
      loginRequestCount += 1;
      await route.abort();
    });

    await page.getByRole("button", { name: "Login" }).click();

    await expect(
      page.getByText("Please enter your email address"),
    ).toBeVisible();
    await expect(page.getByText("Please enter your password")).toBeVisible();

    await page.getByLabel("Email Address").fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill(credentials.password);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(
      page.getByText("Please enter a valid email address"),
    ).toBeVisible();
    expect(loginRequestCount).toBe(0);
  });

  test("shows the API error and stays on login when credentials are rejected", async ({
    page,
  }) => {
    await page.route(LOGIN_URL, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 400,
          message: "Email or password is incorrect",
          data: null,
        }),
      });
    });

    await page.getByLabel("Email Address").fill(credentials.email);
    await page
      .getByLabel("Password", { exact: true })
      .fill("incorrect-password");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("Email or password is incorrect")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("submits the expected payload and redirects after a successful login", async ({
    page,
    context,
  }) => {
    await mockSuccessfulLogin(page, context);

    const loginRequest = page.waitForRequest(LOGIN_URL);

    await page.getByLabel("Email Address").fill(credentials.email);
    await page
      .getByLabel("Password", { exact: true })
      .fill(credentials.password);
    await page.getByRole("button", { name: "Login" }).click();

    const request = await loginRequest;
    expect(request.postDataJSON()).toEqual({
      email: credentials.email,
      password: credentials.password,
      rememberMe: false,
    });
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
  });

  test("remembers and restores the email when Remember me is selected", async ({
    page,
    context,
  }) => {
    await mockSuccessfulLogin(page, context);

    await page.getByLabel("Email Address").fill(credentials.email);
    await page
      .getByLabel("Password", { exact: true })
      .fill(credentials.password);
    await page.getByRole("checkbox", { name: "Remember me" }).check();
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });

    await expect
      .poll(() =>
        page.evaluate(
          (key) => window.localStorage.getItem(key),
          REMEMBERED_EMAIL_KEY,
        ),
      )
      .toBe(credentials.email);

    await page.goto("/login");

    await expect(page.getByLabel("Email Address")).toHaveValue(
      credentials.email,
    );
    await expect(
      page.getByRole("checkbox", { name: "Remember me" }),
    ).toBeChecked();
  });
});
