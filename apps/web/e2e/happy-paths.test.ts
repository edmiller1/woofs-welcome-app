import { test, expect } from "@playwright/test";

test.describe("Happy paths", () => {
  test("homepage loads and shows navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Woofs Welcome/i);
    await expect(page.getByText("Explore")).toBeVisible();
  });

  test("explore page loads with map", async ({ page }) => {
    await page.goto("/explore");
    // Map container should be present
    await expect(page.locator(".maplibregl-map")).toBeVisible({ timeout: 10_000 });
  });

  test("contact page loads and form is present", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: /contact/i })).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Message")).toBeVisible();
  });

  test("advertise page loads", async ({ page }) => {
    await page.goto("/advertise");
    await expect(page.getByRole("heading", { name: /reach dog owners/i })).toBeVisible();
  });

  test("404 page on unknown route", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
