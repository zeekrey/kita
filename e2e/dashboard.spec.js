import { test, expect } from '@playwright/test';

test.describe('Public Dashboard', () => {
	test('should display dashboard without authentication', async ({ page }) => {
		await page.goto('/');

		// Dashboard should be accessible without login
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		// Main heading should be visible (Sonnenschein Kita)
		await expect(page.getByText('Sonnenschein Kita')).toBeVisible();
	});

	test('should display announcements section', async ({ page }) => {
		await page.goto('/');

		// Check for announcements section heading
		await expect(page.getByText('Ankündigungen')).toBeVisible();
	});

	test('should display meals section', async ({ page }) => {
		await page.goto('/');

		// Check for meals section heading
		await expect(page.getByText('Speiseplan heute')).toBeVisible();

		// Should show meal types
		await expect(page.getByText('Frühstück')).toBeVisible();
		await expect(page.getByText('Mittagessen')).toBeVisible();
		await expect(page.getByText('Nachmittagssnack')).toBeVisible();
	});

	test('should display teachers section', async ({ page }) => {
		await page.goto('/');

		// Check for teachers on duty section
		await expect(page.getByText('Heute anwesend')).toBeVisible();
	});

	test('should display birthdays section', async ({ page }) => {
		await page.goto('/');

		// Check for birthday section heading
		await expect(page.getByText('Geburtstag heute')).toBeVisible();
	});

	test('should display clock component', async ({ page }) => {
		await page.goto('/');

		// Clock should show time in HH:MM format
		// The clock updates every second, so we just check it exists
		await expect(page.locator('text=/\\d{1,2}:\\d{2}/').first()).toBeVisible();
	});

	test('should display current date', async ({ page }) => {
		await page.goto('/');

		const today = new Date();
		const day = today.getDate().toString();

		// The date should be visible somewhere on the page
		await expect(page.getByText(new RegExp(day))).toBeVisible();
	});

	test('should display auto-refresh indicator', async ({ page }) => {
		await page.goto('/');

		// Check for auto-refresh indicator text
		await expect(page.getByText('Auto-Aktualisierung aktiv')).toBeVisible();
	});

	test('should have proper dashboard layout', async ({ page }) => {
		await page.goto('/');

		// Check that the main sections exist by looking for their headings
		// This validates the layout without relying on CSS class names
		await expect(page.getByRole('heading', { name: /Sonnenschein Kita/i })).toBeVisible();
		await expect(page.getByRole('heading', { name: /Ankündigungen/i })).toBeVisible();
		await expect(page.getByRole('heading', { name: /Geburtstag heute/i })).toBeVisible();
		await expect(page.getByRole('heading', { name: /Speiseplan heute/i })).toBeVisible();
		await expect(page.getByRole('heading', { name: /Heute anwesend/i })).toBeVisible();
	});

	test('should load without console errors', async ({ page }) => {
		const consoleErrors = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Filter out known non-critical errors (like 404 for missing images)
		const criticalErrors = consoleErrors.filter(
			(error) => !error.includes('404') && !error.includes('favicon')
		);

		expect(criticalErrors).toHaveLength(0);
	});

	// Note: Auto-refresh test is disabled by default as it takes 30+ seconds
	// Uncomment to run full auto-refresh verification
	/*
	test('should auto-refresh data', async ({ page }) => {
		await page.goto('/');

		// Wait for auto-refresh (30s + buffer)
		await page.waitForTimeout(32000);

		// Dashboard should still be functional
		await expect(page.getByText('Ankündigungen')).toBeVisible();
	});
	*/
});
