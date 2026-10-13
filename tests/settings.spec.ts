import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([
    {
      name: "access_token",
      value: "settings-test-token",
      url: "http://localhost:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await page.route("**/api/backend/profile", async (route) => {
    await route.fulfill({
      status: 200,
      json: {
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
          customer: {
            id: "customer-1",
            customerFirstName: "Test",
            customerLastName: "Trader",
            customerNationality: "AE",
            phoneNumber: "+971500000000",
            isActive: true,
            sid: "123456",
          },
        },
      },
    });
  });
});

test("shows Account Security in Settings and removes the Agreement menu", async ({
  page,
}) => {
  await page.goto("/settings/account-security");

  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Account Security" }),
  ).toBeVisible();
  await expect(page.getByText("Change Email", { exact: true })).toBeVisible();
  await expect(page.getByText("Change Phone Number", { exact: true })).toBeVisible();
  await expect(page.getByText("Change Password", { exact: true })).toBeVisible();
  await expect(page.getByText("Two-Factor Authentication (2FA)"))
    .toBeVisible();
  await expect(page.getByText("Legal Documents & Consents")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Signed Agreements", exact: true }),
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "Account Security", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Agreement", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.locator(".ant-menu-item-selected").filter({ hasText: "Account Security" }),
  ).toBeVisible();

  const termsViewLink = page.getByRole("link", { name: "View PDF" });
  await expect(termsViewLink).toHaveAttribute(
    "href",
    "/documents/terms-v1.pdf",
  );

  await page.getByRole("button", { name: "Update" }).first().click();
  await expect(page.getByText("Email updates are not available yet.")).toBeVisible();
});

test("redirects Settings and the retired Agreement route to Account Security", async ({
  page,
}) => {
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/settings\/account-security$/);

  await page.goto("/settings/agreement");
  await expect(page).toHaveURL(/\/settings\/account-security$/);
});
