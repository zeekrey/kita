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

test.describe('Employee Management (Mitarbeiter)', () => {
	test.beforeEach(async ({ page, request }) => {
		await login(page, request, 'mitarbeiter-test');
	});

	test('should display employee management page', async ({ page }) => {
		await page.goto('/admin/mitarbeiter');
		await page.waitForLoadState('networkidle');

		// Check page heading (h1 in main content area)
		await expect(
			page.getByRole('main').getByRole('heading', { name: 'Mitarbeiter' })
		).toBeVisible();

		// Check that the search input is visible
		await expect(
			page.getByPlaceholder('Nach Name, E-Mail, Position oder Erzieher suchen...')
		).toBeVisible();
	});

	test('should show employees list or empty state', async ({ page }) => {
		await page.goto('/admin/mitarbeiter');
		await page.waitForLoadState('networkidle');

		// The page displays either employee cards or an empty message
		const pageContent = await page.locator('main').textContent();
		const hasEmployeeCards = (await page.locator('.rounded-lg.bg-white.shadow').count()) > 0;
		const hasEmptyMessage = pageContent?.includes('Noch keine Mitarbeiter vorhanden');

		expect(hasEmployeeCards || hasEmptyMessage).toBeTruthy();
	});

	test('should navigate to mitarbeiter via sidebar', async ({ page }) => {
		await page.goto('/admin');
		await page.waitForLoadState('networkidle');

		// Click on Mitarbeiter in the sidebar
		await page.locator('aside').getByRole('link', { name: 'Mitarbeiter' }).click();

		// Should navigate to mitarbeiter page
		await expect(page).toHaveURL('/admin/mitarbeiter');
		await expect(
			page.getByRole('main').getByRole('heading', { name: 'Mitarbeiter' })
		).toBeVisible();
	});

	test('should show no results message when searching for nonexistent employee', async ({
		page
	}) => {
		await page.goto('/admin/mitarbeiter');
		await page.waitForLoadState('networkidle');

		// Check if there are employees first - this test only makes sense if employees exist
		const pageContent = await page.locator('main').textContent();
		const hasEmployees = !pageContent?.includes('Noch keine Mitarbeiter vorhanden');

		if (hasEmployees) {
			// Search for something that definitely won't match
			const searchInput = page.getByPlaceholder(
				'Nach Name, E-Mail, Position oder Erzieher suchen...'
			);
			await searchInput.fill('xyz-nonexistent-search-term-12345');
			await page.waitForTimeout(300);

			// Should show "no results" message
			await expect(page.getByText('Keine Mitarbeiter gefunden')).toBeVisible();

			// Clear search
			await searchInput.clear();
			await page.waitForTimeout(300);
		}

		// Page should show the heading again
		await expect(
			page.getByRole('main').getByRole('heading', { name: 'Mitarbeiter' })
		).toBeVisible();
	});

	test('should open edit profile modal when employee exists', async ({ page }) => {
		await page.goto('/admin/mitarbeiter');
		await page.waitForLoadState('networkidle');

		// Check if there are employees
		const pageContent = await page.locator('main').textContent();
		const hasEmployees = !pageContent?.includes('Noch keine Mitarbeiter vorhanden');

		if (hasEmployees) {
			// Click on the first edit button - it's a text button in the header
			const editButton = page.getByRole('button', { name: 'Profil bearbeiten' }).first();
			await editButton.click();

			// Modal should appear
			await expect(
				page.getByRole('heading', { name: 'Mitarbeiterprofil bearbeiten' })
			).toBeVisible();

			// Close modal
			await page.locator('.fixed').getByRole('button', { name: 'Abbrechen' }).click();
			await expect(
				page.getByRole('heading', { name: 'Mitarbeiterprofil bearbeiten' })
			).not.toBeVisible();
		}
	});

	test('should open link erzieher modal when employee exists and not linked', async ({ page }) => {
		await page.goto('/admin/mitarbeiter');
		await page.waitForLoadState('networkidle');

		// Check if there are employees
		const pageContent = await page.locator('main').textContent();
		const hasEmployees = !pageContent?.includes('Noch keine Mitarbeiter vorhanden');

		if (hasEmployees) {
			// Check if there's an unlinked employee (has "Erzieher verknüpfen" button)
			const linkButton = page.getByRole('button', { name: 'Erzieher verknüpfen' }).first();
			const hasLinkButton = (await linkButton.count()) > 0;

			if (hasLinkButton) {
				// Click on the "Erzieher verknüpfen" button
				await linkButton.click();

				// Modal should appear
				await expect(page.getByRole('heading', { name: 'Erzieher verknüpfen' })).toBeVisible();

				// Close modal - use the close button in the modal
				const closeBtn = page
					.locator('.fixed')
					.getByRole('button', { name: /Abbrechen|Schließen/ });
				await closeBtn.click();
				await expect(page.getByRole('heading', { name: 'Erzieher verknüpfen' })).not.toBeVisible();
			}
		}
	});

	test('should display employee counter', async ({ page }) => {
		await page.goto('/admin/mitarbeiter');
		await page.waitForLoadState('networkidle');

		// Should show the counter text (e.g., "X von Y Mitarbeiter")
		await expect(page.getByText(/\d+ von \d+ Mitarbeiter/)).toBeVisible();
	});
});
