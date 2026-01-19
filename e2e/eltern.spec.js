import { test, expect } from '@playwright/test';

/**
 * Helper to create an admin user and login for tests
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} emailPrefix
 * @returns {Promise<string>} The email of the created admin user
 */
async function login(page, request, emailPrefix) {
	// Generate unique email for each test run
	const uniqueEmail = `${emailPrefix}-${Date.now()}@kita.de`;

	// Create user via sign-up
	await request.post('/api/auth/sign-up/email', {
		data: {
			email: uniqueEmail,
			password: 'password123',
			name: 'Test Admin'
		}
	});

	// Set the user's role to admin (test-only endpoint)
	await request.post('/api/test/set-role', {
		data: { email: uniqueEmail, role: 'admin' }
	});

	// Navigate to login page and wait for it to fully load
	await page.goto('/admin/login');
	await page.waitForLoadState('networkidle');

	// Fill login form - wait for each field to be ready
	const emailInput = page.getByLabel('E-Mail');
	await emailInput.waitFor({ state: 'visible' });
	await emailInput.fill(uniqueEmail);

	const passwordInput = page.getByLabel('Passwort');
	await passwordInput.waitFor({ state: 'visible' });
	await passwordInput.fill('password123');

	// Click submit and wait for navigation
	await page.getByRole('button', { name: 'Anmelden' }).click();

	// Wait for successful login - check for the logout button which only appears after login
	await expect(page.getByRole('button', { name: 'Abmelden' })).toBeVisible({ timeout: 10000 });

	return uniqueEmail;
}

test.describe('Parent Management (Eltern)', () => {
	test.beforeEach(async ({ page, request }) => {
		await login(page, request, 'eltern-test');
	});

	test('should display parent management page', async ({ page }) => {
		await page.goto('/admin/eltern');
		await page.waitForLoadState('networkidle');

		// Check page heading (h1 in main content area)
		await expect(page.getByRole('main').getByRole('heading', { name: 'Eltern' })).toBeVisible();

		// Check that the search input is visible
		await expect(
			page.getByPlaceholder('Nach Name, E-Mail, Telefon oder Kind suchen...')
		).toBeVisible();
	});

	test('should show parents list or empty state', async ({ page }) => {
		await page.goto('/admin/eltern');
		await page.waitForLoadState('networkidle');

		// The page displays either parent cards or an empty message
		const pageContent = await page.locator('main').textContent();
		const hasParentCards = (await page.locator('.rounded-lg.bg-white.shadow').count()) > 0;
		const hasEmptyMessage = pageContent?.includes('Noch keine Eltern vorhanden');

		expect(hasParentCards || hasEmptyMessage).toBeTruthy();
	});

	test('should navigate to eltern via sidebar', async ({ page }) => {
		await page.goto('/admin');
		await page.waitForLoadState('networkidle');

		// Click on Eltern in the sidebar
		await page.locator('aside').getByRole('link', { name: 'Eltern' }).click();

		// Should navigate to eltern page
		await expect(page).toHaveURL('/admin/eltern');
		await expect(page.getByRole('main').getByRole('heading', { name: 'Eltern' })).toBeVisible();
	});

	test('should show no results message when searching for nonexistent parent', async ({ page }) => {
		await page.goto('/admin/eltern');
		await page.waitForLoadState('networkidle');

		// Search for something that definitely won't match
		const searchInput = page.getByPlaceholder('Nach Name, E-Mail, Telefon oder Kind suchen...');
		await searchInput.fill('xyz-nonexistent-search-term-12345');
		await page.waitForTimeout(300);

		// Should show "no results" message
		await expect(page.getByText('Keine Eltern gefunden')).toBeVisible();

		// Clear search
		await searchInput.clear();
		await page.waitForTimeout(300);

		// Page should show the heading again
		await expect(page.getByRole('main').getByRole('heading', { name: 'Eltern' })).toBeVisible();
	});

	test('should open edit profile modal when parent exists', async ({ page }) => {
		await page.goto('/admin/eltern');
		await page.waitForLoadState('networkidle');

		// Only run this test if there are parents
		const parentCards = page.locator('.rounded-lg.bg-white.shadow');
		const count = await parentCards.count();

		if (count > 0) {
			// Click on the first edit button
			await parentCards.first().getByRole('button', { name: 'Profil bearbeiten' }).click();

			// Modal should appear
			await expect(page.getByRole('heading', { name: 'Elternprofil bearbeiten' })).toBeVisible();

			// Close modal
			await page.locator('.fixed').getByRole('button', { name: 'Abbrechen' }).click();
			await expect(
				page.getByRole('heading', { name: 'Elternprofil bearbeiten' })
			).not.toBeVisible();
		}
	});

	test('should open link child modal when parent exists', async ({ page }) => {
		await page.goto('/admin/eltern');
		await page.waitForLoadState('networkidle');

		// Only run this test if there are parents
		const parentCards = page.locator('.rounded-lg.bg-white.shadow');
		const count = await parentCards.count();

		if (count > 0) {
			// Click on the first "Kind verknüpfen" button
			await parentCards.first().getByRole('button', { name: 'Kind verknüpfen' }).click();

			// Modal should appear
			await expect(page.getByRole('heading', { name: 'Kind verknüpfen' })).toBeVisible();

			// Close modal - use the close button in the modal
			const closeBtn = page.locator('.fixed').getByRole('button', { name: /Abbrechen|Schließen/ });
			await closeBtn.click();
			await expect(page.getByRole('heading', { name: 'Kind verknüpfen' })).not.toBeVisible();
		}
	});

	test('should display parent counter', async ({ page }) => {
		await page.goto('/admin/eltern');
		await page.waitForLoadState('networkidle');

		// Should show the counter text (e.g., "X von Y Eltern")
		await expect(page.getByText(/\d+ von \d+ Eltern/)).toBeVisible();
	});
});
