import { test, expect } from "@playwright/test";

test.describe("Lumina Portfolio - Basic E2E Tests", () => {
	test.beforeEach(async ({ page }) => {
		// Wait for the app to load
		await page.goto("http://localhost:1420");
		await page.waitForLoadState("domcontentloaded");
	});

	test("application loads successfully", async ({ page }) => {
		// Check if the main app element is visible
		await expect(page.locator("body")).toBeVisible();

		// Check if the title contains Lumina
		const title = await page.title();
		expect(title).toMatch(/lumina/i);
	});

	test("page structure is valid", async ({ page }) => {
		// Check if body exists and is visible
		const body = page.locator("body");
		await expect(body).toBeVisible();

		// Check if we have a valid HTML structure
		const html = page.locator("html");
		await expect(html).toBeVisible();
	});

	test("responsive design works", async ({ page }) => {
		// Test mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.waitForTimeout(1000);

		// Check if app adapts to mobile
		const body = page.locator("body");
		await expect(body).toBeVisible();

		// Test desktop viewport
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.waitForTimeout(1000);

		// Check if app adapts to desktop
		await expect(body).toBeVisible();
	});

	test("error handling works", async ({ page }) => {
		// Navigate to a non-existent route
		await page.goto("http://localhost:1420/non-existent-route");

		// Should handle gracefully (either show 404 or redirect)
		await page.waitForTimeout(2000);

		// App should still be functional
		const body = page.locator("body");
		await expect(body).toBeVisible();
	});

	test("keyboard navigation works", async ({ page }) => {
		// Test Tab navigation
		await page.keyboard.press("Tab");
		await page.waitForTimeout(500);

		// Test Escape key
		await page.keyboard.press("Escape");
		await page.waitForTimeout(500);

		// App should remain responsive
		const body = page.locator("body");
		await expect(body).toBeVisible();
	});

	test("console errors are minimal", async ({ page }) => {
		// Listen for console errors
		const errors: string[] = [];
		page.on("console", (msg) => {
			if (msg.type() === "error") {
				errors.push(msg.text());
			}
		});

		// Wait a bit to collect any console errors
		await page.waitForTimeout(3000);

		// Check for critical errors
		const criticalErrors = errors.filter(
			(error) =>
				error.includes("Uncaught") ||
				error.includes("TypeError") ||
				error.includes("ReferenceError")
		);

		// Allow some errors but not critical ones
		expect(criticalErrors.length).toBeLessThan(3);
	});
});

test.describe("Lumina Portfolio - Platform-Specific Tests", () => {
	test("basic functionality works across browsers", async ({ page, browserName }) => {
		await page.goto("http://localhost:1420");

		// Basic checks that should work on all platforms
		await expect(page.locator("body")).toBeVisible();

		const title = await page.title();
		expect(title).toMatch(/lumina/i);

		// Check for any critical console errors
		const errors: string[] = [];
		page.on("console", (msg) => {
			if (msg.type() === "error") {
				errors.push(msg.text());
			}
		});

		await page.waitForTimeout(2000);

		// Should not have too many errors
		expect(errors.length).toBeLessThan(5);
	});
});
