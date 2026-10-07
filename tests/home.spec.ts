import { test, expect } from '@playwright/test';

const loginCredentials = {
  email: 'trader@example.com',
  password: 'secure-test-password',
};

test('displays login page content', async ({ page }) => {
  await page.goto('/login');

  await expect(
    page.getByRole('heading', { name: 'Welcome Back!' })
  ).toBeVisible();

  await expect(
    page.getByText('Sign in to access your trading dashboard', {
      exact: true,
    })
  ).toBeVisible();
});


test('login successfully redirects to dashboard', async ({ page, context }) => {
  await context.addCookies([
    {
      name: 'access_token',
      value: 'test-token',
      url: 'http://localhost:3000',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);

  await page.route('**/api/auth/login', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      email: loginCredentials.email,
      login_Password: loginCredentials.password,
    });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        statusCode: 100,
        message: 'Login successful',
        data: {
          customer_ID: 'test-customer',
          login_ID: 'test-login',
        },
      }),
    });
  });

  await page.goto('/login');

  const emailInput = page.getByLabel('Email Address');
  const passwordInput = page.getByLabel('Password');

  await emailInput.fill(loginCredentials.email);
  await passwordInput.fill(loginCredentials.password);

  await expect(emailInput).toHaveValue(loginCredentials.email);
  await expect(passwordInput).toHaveValue(loginCredentials.password);

  await expect(
    page.getByRole('button', { name: 'Login' })
  ).toBeEnabled();

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/dashboard$/, {
    timeout: 15_000,
  });
});

test('expired session logs out and redirects to login', async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: 'access_token',
      value: 'expired-access-token',
      url: 'http://localhost:3000',
      httpOnly: true,
      sameSite: 'Lax',
    },
    {
      name: 'refresh_token',
      value: 'expired-refresh-token',
      url: 'http://localhost:3000',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);

  await page.route('**/api/backend/User/GetUserDetail', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        statusCode: 103,
        message: 'Invalid session or expired',
        data: null,
      }),
    });
  });

  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/login$/);

  const authCookies = (await context.cookies()).filter(({ name }) =>
    ['access_token', 'refresh_token'].includes(name)
  );

  expect(authCookies).toEqual([]);
});
