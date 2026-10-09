import { expect, test, type Page } from "@playwright/test";

const baseUser = {
  id: "user-one",
  name: "sid test",
  email: "sid@example.com",
  role: "USER",
  isActive: true,
  permissions: { withdrawalAllowed: true },
  restrictions: { withdrawalAllowedAt: null },
  createdAt: "2026-10-05T17:54:19.375Z",
  updatedAt: "2026-10-05T17:54:19.375Z",
  customer: {
    id: "customer-one",
    sid: "623729",
    customerFirstName: "sid",
    customerLastName: "test",
    customerNationality: "AE",
    phoneNumber: "+971501234986",
    isActive: true,
    createdAt: "2026-10-05T17:54:19.375Z",
    updatedAt: "2026-10-05T17:54:19.375Z",
  },
};

async function authenticate(page: Page) {
  await page.context().addCookies([
    {
      name: "access_token",
      value: "test-access-token",
      url: "http://localhost:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

test("approved users are redirected from KYC to their profile", async ({ page }) => {
  await authenticate(page);
  await page.route("**/api/backend/profile", (route) =>
    route.fulfill({
      status: 200,
      json: {
        statusCode: 200,
        message: "Profile fetched successfully",
        data: { ...baseUser, status: "APPROVED" },
      },
    }),
  );

  await page.goto("/profile/kyc");

  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Profile", exact: true }),
  ).toBeVisible();
});

test("completed users remain on the submitted KYC screen", async ({ page }) => {
  await authenticate(page);
  await page.route("**/api/backend/profile", (route) =>
    route.fulfill({
      status: 200,
      json: {
        statusCode: 200,
        message: "Profile fetched successfully",
        data: { ...baseUser, status: "COMPLETED" },
      },
    }),
  );

  await page.goto("/profile/kyc");

  await expect(page).toHaveURL(/\/profile\/kyc$/);
  await expect(page.getByRole("heading", { name: "Verification Submitted!" })).toBeVisible();
});
