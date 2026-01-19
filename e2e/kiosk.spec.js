import { test, expect } from '@playwright/test';

test.describe('Kiosk View (Kinder-Ansicht)', () => {
	test('should display kiosk dashboard without authentication', async ({ page }) => {
		await page.goto('/kinder-ansicht');

		// Kiosk should be accessible without login
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		// Main heading should be visible (Sonnenschein Kita)
		await expect(page.getByText('Sonnenschein Kita')).toBeVisible();
	});

	test('should display time and date', async ({ page }) => {
		await page.goto('/kinder-ansicht');

		// Time should be visible in HH:MM format
		await expect(page.locator('text=/\\d{1,2}:\\d{2}/').first()).toBeVisible();

		// Date should include a weekday (German day names)
		const germanWeekdays = [
			'Montag',
			'Dienstag',
			'Mittwoch',
			'Donnerstag',
			'Freitag',
			'Samstag',
			'Sonntag'
		];
		const dateLocators = germanWeekdays.map((day) => page.getByText(new RegExp(day)));

		// At least one weekday should be visible
		let foundWeekday = false;
		for (const locator of dateLocators) {
			if (await locator.isVisible().catch(() => false)) {
				foundWeekday = true;
				break;
			}
		}
		expect(foundWeekday).toBe(true);
	});

	test('should display meals section with meal types', async ({ page }) => {
		await page.goto('/kinder-ansicht');

		// Check for meals section heading
		await expect(page.getByText('Was gibt es heute?')).toBeVisible();

		// Should show meal type labels (use first() to avoid strict mode issues)
		await expect(page.getByText('Frühstück').first()).toBeVisible();
		await expect(page.getByText('Mittagessen').first()).toBeVisible();
		await expect(page.getByText('Snack').first()).toBeVisible();
	});

	test('should display teachers section', async ({ page }) => {
		await page.goto('/kinder-ansicht');

		// Check for teachers section heading
		await expect(page.getByText('Wer ist heute da?')).toBeVisible();
	});

	test('should have playful design elements', async ({ page }) => {
		await page.goto('/kinder-ansicht');

		// Check for decorative elements (sun, clouds)
		await expect(page.getByText('🌞')).toBeVisible();
		await expect(page.getByText('☁️').first()).toBeVisible();

		// Check for footer decorations (flowers)
		await expect(page.getByText('🌷')).toBeVisible();
	});

	test('should be accessible without console errors', async ({ page }) => {
		const consoleErrors = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		await page.goto('/kinder-ansicht');
		await page.waitForLoadState('networkidle');

		// Filter out known non-critical errors
		const criticalErrors = consoleErrors.filter(
			(error) => !error.includes('404') && !error.includes('favicon')
		);

		expect(criticalErrors).toHaveLength(0);
	});
});
