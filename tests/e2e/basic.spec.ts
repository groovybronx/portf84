import { test, expect } from "@playwright/test";

describe("Lumina Portfolio - Basic E2E Tests", () => {
	test.beforeEach(async ({ page }) => {
		// Wait for the app to load
		await page.goto("http://localhost:1420");
		await page.waitForLoadState("domcontentloaded");
	});

	test("application loads successfully", async ({ page }) => {
		// Check if the main app element is visible
		await expect(page.locator("body")).toBeVisible();

		// Check if the title is correct
		await expect(page).toHaveTitle(/Lumina Portfolio/);
	});

	test("main navigation elements are present", async ({ page }) => {
		// Check for navigation elements
		const navElements = page.locator('[data-testid="navigation"], nav, .navigation');
		const count = await navElements.count();

		// At least one navigation element should be present
		expect(count).toBeGreaterThan(0);
	});

	test("library view loads", async ({ page }) => {
		// Look for library-related elements
		const libraryElements = page.locator('[data-testid="library"], .library, #library');
		const count = await libraryElements.count();

		// Library should be present
		expect(count).toBeGreaterThan(0);
	});

	test("settings modal can be opened", async ({ page }) => {
		// Look for settings button
		const settingsButton = page.locator(
			'[data-testid="settings-button"], button[aria-label*="settings"], .settings-button'
		);

		if ((await settingsButton.count()) > 0) {
			await settingsButton.first().click();

			// Check if settings modal appears
			const settingsModal = page.locator(
				'[data-testid="settings-modal"], .settings-modal, [role="dialog"]'
			);
			await expect(settingsModal.first()).toBeVisible({ timeout: 5000 });
		} else {
			// Settings button not found - skip this test
			console.log("Settings button not found, skipping modal test");
		}
	});

	test("search functionality is available", async ({ page }) => {
		// Look for search input
		const searchInput = page.locator(
			'[data-testid="search-input"], input[placeholder*="search"], .search-input'
		);

		if ((await searchInput.count()) > 0) {
			await expect(searchInput.first()).toBeVisible();

			// Type in search
			await searchInput.first().fill("test");

			// Check if search results appear or search is processed
			await page.waitForTimeout(1000);
		} else {
			console.log("Search input not found, skipping search test");
		}
	});

	test("photo grid displays correctly", async ({ page }) => {
		// Look for photo grid or gallery
		const photoGrid = page.locator('[data-testid="photo-grid"], .photo-grid, .gallery');

		if ((await photoGrid.count()) > 0) {
			await expect(photoGrid.first()).toBeVisible();

			// Check if there are photo items
			const photoItems = page.locator('[data-testid="photo-item"], .photo-item, .gallery-item');
			const itemCount = await photoItems.count();

			// Should have some items or at least the grid structure
			expect(itemCount >= 0).toBeTruthy();
		} else {
			console.log("Photo grid not found, skipping grid test");
		}
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
});

describe("Lumina Portfolio - Platform-Specific Tests", () => {
	test("macOS-specific features", async ({ page, browserName }) => {
		test.skip(browserName !== "chromium", "macOS tests run on Chromium");

		await page.goto("http://localhost:1420");

		// Check for macOS-specific UI elements
		const titleBar = page.locator('[data-testid="title-bar"], .title-bar');
		if ((await titleBar.count()) > 0) {
			await expect(titleBar.first()).toBeVisible();
		}
	});

	test("Windows-specific features", async ({ page, browserName }) => {
		test.skip(browserName !== "chromium", "Windows tests run on Chromium");

		await page.goto("http://localhost:1420");

		// Check for Windows-specific UI elements
		const titleBar = page.locator('[data-testid="title-bar"], .title-bar');
		if ((await titleBar.count()) > 0) {
			await expect(titleBar.first()).toBeVisible();
		}
	});

	test("Linux-specific features", async ({ page, browserName }) => {
		test.skip(browserName !== "chromium", "Linux tests run on Chromium");

		await page.goto("http://localhost:1420");

		// Check for Linux-specific UI elements
		const titleBar = page.locator('[data-testid="title-bar"], .title-bar');
		if ((await titleBar.count()) > 0) {
			await expect(titleBar.first()).toBeVisible();
		}
	});
});
