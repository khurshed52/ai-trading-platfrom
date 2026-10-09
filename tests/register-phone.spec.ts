import { expect, test } from "@playwright/test";

test.describe("registration phone field", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("starts clean and validates only after the field is visited", async ({
    page,
  }) => {
    const phoneInput = page.getByPlaceholder("Enter phone number");
    const phoneError = page.getByText("Please enter your phone number");

    await expect(phoneInput).toHaveValue("");
    await expect(phoneError).toBeHidden();

    await phoneInput.focus();
    await phoneInput.blur();

    await expect(phoneError).toBeVisible();
  });

  test("keeps the dial code separate and matches the other input shell", async ({
    page,
  }) => {
    const phoneInput = page.getByPlaceholder("Enter phone number");
    const phoneShell = page.locator(".phone-number-input");
    const emailInput = page.getByPlaceholder("Email");

    await phoneInput.fill("9553204");

    await expect(page.locator(".phone-country-select")).toContainText("+91");
    await expect(phoneInput).not.toHaveValue(/\+91/);

    const phoneStyles = await phoneShell.evaluate((element) => {
      const styles = getComputedStyle(element);

      return {
        height: styles.height,
        borderRadius: styles.borderRadius,
      };
    });
    const emailStyles = await emailInput.evaluate((element) => {
      const styles = getComputedStyle(element);

      return {
        height: styles.height,
        borderRadius: styles.borderRadius,
      };
    });

    expect(phoneStyles.borderRadius).toBe(emailStyles.borderRadius);
    expect(Number.parseFloat(phoneStyles.height)).toBeCloseTo(
      Number.parseFloat(emailStyles.height),
      0,
    );
    await expect(phoneInput).toHaveCSS("border-top-width", "0px");
  });
});
