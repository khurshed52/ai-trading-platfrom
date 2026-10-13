import { expect, test } from "@playwright/test";

test("shows Market News above Top Markets in the light dashboard theme", async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: "access_token",
      value: "markets-test-token",
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
          name: "Test Trader",
          email: "trader@example.com",
          status: "APPROVED",
          customer: { customerFirstName: "Test" },
        },
      },
    });
  });
  await page.route("**/api/market-news?**", async (route) => {
    await route.fulfill({
      status: 200,
      json: {
        status: "success",
        data: [
          {
            uuid: "news-1",
            title: "Markets open higher",
            description: "A test market news description.",
            snippet: "A test market news snippet.",
            url: "https://example.com/market-news",
            image_url: "",
            published_at: "2026-10-13T08:00:00.000Z",
            source: "Example News",
          },
        ],
      },
    });
  });
  await page.route("https://api.binance.com/api/v3/klines?**", async (route) => {
    await route.fulfill({ status: 200, json: [] });
  });

  await page.goto("/markets");

  const marketNewsHeading = page.getByRole("heading", { name: "Market News" });
  const topMarketsHeading = page.getByRole("heading", { name: "Top Markets" });
  await expect(marketNewsHeading).toBeVisible();
  await expect(page.getByText("Markets open higher")).toBeVisible();
  await expect(topMarketsHeading).toBeVisible();

  const marketNewsBox = await marketNewsHeading.boundingBox();
  const topMarketsBox = await topMarketsHeading.boundingBox();
  expect(marketNewsBox).not.toBeNull();
  expect(topMarketsBox).not.toBeNull();
  expect(marketNewsBox!.y).toBeLessThan(topMarketsBox!.y);

  await expect(page.locator("main.bg-black")).toHaveCount(0);
  await expect(page.locator("article.bg-white")).toHaveCount(1);
  await expect(page.locator("table").locator("..")).toHaveClass(/bg-white/);
});
