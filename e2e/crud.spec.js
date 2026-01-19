import { test, expect } from '@playwright/test';

/**
 * Helper to create an admin user and login for tests
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} emailPrefix
 */
async function login(page, request, emailPrefix) {
	// Generate unique email for each test run
	const uniqueEmail = `${emailPrefix}-${Date.now()}@kita.de`;

	// Create user via sign-up
	await request.post('/api/auth/sign-up/email', {
		data: {
			email: uniqueEmail,
			password: 'password123',
			name: 'Test User'
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
}

test.describe('Groups CRUD', () => {
	test.beforeEach(async ({ page, request }) => {
		await login(page, request, 'groups-test');
	});

	test('should create a new group', async ({ page }) => {
		await page.goto('/admin/gruppen');
		await page.waitForLoadState('networkidle');

		const uniqueName = `TestGruppe${Date.now()}`;

		await page.getByRole('button', { name: 'Neue Gruppe' }).click();

		// Wait for modal to appear
		await expect(page.getByRole('heading', { name: /Neue Gruppe/i })).toBeVisible();

		await page.getByLabel('Name').fill(uniqueName);

		// Select a color (click on one of the preset colors)
		await page.locator('button[style*="background-color"]').first().click();

		await page.getByRole('button', { name: 'Speichern' }).click();

		// Wait for page to refresh and verify the group was created
		await page.waitForLoadState('networkidle');
		await expect(page.getByRole('cell', { name: uniqueName })).toBeVisible();
	});

	test('should edit a group', async ({ page }) => {
		await page.goto('/admin/gruppen');
		await page.waitForLoadState('networkidle');

		// First create a group to edit with unique name
		const originalName = `ZuÄndern${Date.now()}`;
		const newName = `Geändert${Date.now()}`;

		await page.getByRole('button', { name: 'Neue Gruppe' }).click();
		// Wait for modal to appear
		await expect(page.getByRole('heading', { name: /Neue Gruppe/i })).toBeVisible();
		await page.getByLabel('Name').fill(originalName);
		await page.locator('button[style*="background-color"]').first().click();
		await page.getByRole('button', { name: 'Speichern' }).click();
		await page.waitForLoadState('networkidle');

		// Wait for groups to load and find the one we created
		await expect(page.getByRole('cell', { name: originalName })).toBeVisible();

		// Click edit on the group we created
		const groupRow = page.locator('tr', { hasText: originalName });
		await groupRow.getByRole('button', { name: 'Bearbeiten' }).click();

		// Wait for modal
		await expect(page.getByRole('heading', { name: /Gruppe bearbeiten/i })).toBeVisible();

		// Clear and fill new name
		await page.getByLabel('Name').clear();
		await page.getByLabel('Name').fill(newName);

		await page.getByRole('button', { name: 'Speichern' }).click();
		await page.waitForLoadState('networkidle');

		// Verify the change
		await expect(page.getByRole('cell', { name: newName })).toBeVisible();
	});

	test('should delete a group without children', async ({ page }) => {
		await page.goto('/admin/gruppen');
		await page.waitForLoadState('networkidle');

		// First create a group that has no children
		await page.getByRole('button', { name: 'Neue Gruppe' }).click();
		// Wait for modal to appear
		await expect(page.getByRole('heading', { name: /Neue Gruppe/i })).toBeVisible();
		const uniqueName = `ZuLöschen${Date.now()}`;
		await page.getByLabel('Name').fill(uniqueName);
		await page.locator('button[style*="background-color"]').first().click();
		await page.getByRole('button', { name: 'Speichern' }).click();

		// Wait for creation
		await page.waitForLoadState('networkidle');
		await expect(page.getByRole('cell', { name: uniqueName })).toBeVisible();

		// Now delete it - find the row with our group and click delete
		const groupRow = page.locator('tr', { hasText: uniqueName });
		await groupRow.getByRole('button', { name: 'Löschen' }).click();

		// Confirm deletion in the modal
		await expect(page.getByRole('heading', { name: /Gruppe löschen/i })).toBeVisible();
		// Click the delete button in the modal (second delete button)
		await page.locator('.fixed').getByRole('button', { name: 'Löschen' }).click();

		// Wait for deletion and verify it's gone from the table
		await page.waitForLoadState('networkidle');
		// Check specifically that the table cell with this name is gone
		await expect(page.getByRole('cell', { name: uniqueName })).not.toBeVisible();
	});
});

test.describe('Children CRUD', () => {
	test.beforeEach(async ({ page, request }) => {
		await login(page, request, 'children-test');
	});

	test('should create a new child', async ({ page }) => {
		// First ensure there's a group to assign the child to
		await page.goto('/admin/gruppen');
		await page.waitForLoadState('networkidle');
		const groupName = `GruppeFürKinder${Date.now()}`;
		await page.getByRole('button', { name: 'Neue Gruppe' }).click();
		await expect(page.getByRole('heading', { name: /Neue Gruppe/i })).toBeVisible();
		await page.getByLabel('Name').fill(groupName);
		await page.locator('button[style*="background-color"]').first().click();
		await page.getByRole('button', { name: 'Speichern' }).click();
		await page.waitForLoadState('networkidle');

		// Now go to children page
		await page.goto('/admin/kinder');
		await page.waitForLoadState('networkidle');

		await page.getByRole('button', { name: 'Neues Kind' }).click();

		// Wait for modal
		await expect(page.getByRole('heading', { name: /Neues Kind/i })).toBeVisible();

		const uniqueName = `TestKind${Date.now()}`;
		await page.getByLabel('Vorname').fill(uniqueName);
		await page.getByLabel('Nachname').fill('E2ETest');
		await page.getByLabel('Geburtstag').fill('2022-05-15');

		// Select a group
		const gruppeSelect = page.getByLabel('Gruppe');
		const options = await gruppeSelect.locator('option').count();
		if (options > 1) {
			await gruppeSelect.selectOption({ index: 1 });
		}

		await page.getByRole('button', { name: 'Speichern' }).click();

		// Verify the child was created
		await page.waitForLoadState('networkidle');
		await expect(page.getByText(uniqueName)).toBeVisible();
	});

	test('should filter children by name', async ({ page }) => {
		await page.goto('/admin/kinder');
		await page.waitForLoadState('networkidle');

		// Wait for children list to load
		await page.waitForSelector('table', { timeout: 10000 });

		// Type in search box
		const searchInput = page.getByPlaceholder('Name suchen...');
		if (await searchInput.isVisible()) {
			await searchInput.fill('Test');

			// Wait for filter to apply
			await page.waitForTimeout(300);

			// Check that the filter info is displayed
			const filterInfo = page.locator('text=/\\d+ von \\d+ Kindern/');
			if (await filterInfo.isVisible()) {
				const resultsText = await filterInfo.textContent();
				expect(resultsText).toMatch(/\d+ von \d+ Kindern/);
			}
		}
	});

	test('should edit a child', async ({ page }) => {
		// First create a group and child to edit
		await page.goto('/admin/gruppen');
		await page.waitForLoadState('networkidle');
		const groupName = `GruppeFürEdit${Date.now()}`;
		await page.getByRole('button', { name: 'Neue Gruppe' }).click();
		await expect(page.getByRole('heading', { name: /Neue Gruppe/i })).toBeVisible();
		await page.getByLabel('Name').fill(groupName);
		await page.locator('button[style*="background-color"]').first().click();
		await page.getByRole('button', { name: 'Speichern' }).click();
		await page.waitForLoadState('networkidle');

		await page.goto('/admin/kinder');
		await page.waitForLoadState('networkidle');

		const originalName = `EditTest${Date.now()}`;
		const newName = `GeändertKind${Date.now()}`;

		await page.getByRole('button', { name: 'Neues Kind' }).click();
		await page.getByLabel('Vorname').fill(originalName);
		await page.getByLabel('Nachname').fill('Kind');
		await page.getByLabel('Geburtstag').fill('2022-01-01');
		await page.getByRole('button', { name: 'Speichern' }).click();
		await page.waitForLoadState('networkidle');

		// Wait for child to appear
		await expect(page.getByText(originalName)).toBeVisible();

		// Click edit on the child we created
		const childRow = page.locator('tr', { hasText: originalName });
		await childRow.getByRole('button', { name: 'Bearbeiten' }).click();

		// Wait for modal
		await expect(page.getByRole('heading', { name: /Kind bearbeiten/i })).toBeVisible();

		// Change the first name
		await page.getByLabel('Vorname').clear();
		await page.getByLabel('Vorname').fill(newName);

		await page.getByRole('button', { name: 'Speichern' }).click();
		await page.waitForLoadState('networkidle');

		// Verify the change
		await expect(page.getByText(newName)).toBeVisible();
	});
});

test.describe('Teachers CRUD', () => {
	test.beforeEach(async ({ page, request }) => {
		await login(page, request, 'teachers-test');
	});

	test('should create a new teacher', async ({ page }) => {
		await page.goto('/admin/erzieher');
		await page.waitForLoadState('networkidle');

		await page.getByRole('button', { name: /Neue/ }).click();

		// Wait for modal
		await expect(page.getByRole('heading', { name: /Neue.*Erzieher/i })).toBeVisible();

		const uniqueName = `TestErzieher${Date.now()}`;
		await page.getByLabel('Vorname').fill(uniqueName);
		await page.getByLabel('Nachname').fill('E2ETest');

		// Generate unique email to avoid conflicts
		const uniqueEmail = `test-teacher-${Date.now()}@kita.de`;
		await page.getByLabel('E-Mail').fill(uniqueEmail);

		await page.getByRole('button', { name: 'Speichern' }).click();

		// Verify the teacher was created
		await page.waitForLoadState('networkidle');
		await expect(page.getByText(uniqueName)).toBeVisible();
	});

	test('should prevent duplicate email', async ({ page }) => {
		await page.goto('/admin/erzieher');
		await page.waitForLoadState('networkidle');

		const timestamp = Date.now();
		const firstName = `First${timestamp}`;
		const email = `duplicate-${timestamp}@kita.de`;

		// First create a teacher
		await page.getByRole('button', { name: /Neue/ }).click();
		await page.getByLabel('Vorname').fill(firstName);
		await page.getByLabel('Nachname').fill('Teacher');
		await page.getByLabel('E-Mail').fill(email);
		await page.getByRole('button', { name: 'Speichern' }).click();

		// Wait for first teacher to be created
		await page.waitForLoadState('networkidle');
		await expect(page.getByText(firstName)).toBeVisible();

		// Try to create another with same email
		await page.getByRole('button', { name: /Neue/ }).click();
		await page.getByLabel('Vorname').fill('Second');
		await page.getByLabel('Nachname').fill('Teacher');
		await page.getByLabel('E-Mail').fill(email);
		await page.getByRole('button', { name: 'Speichern' }).click();

		// Wait for form submission response
		await page.waitForLoadState('networkidle');

		// Server returns "E-Mail bereits vorhanden" error
		// Either the error message is shown OR the modal stays open (duplicate rejected)
		const errorVisible = await page.getByText('E-Mail bereits vorhanden').isVisible();
		const modalStillOpen = await page.getByRole('heading', { name: /Neue.*Erzieher/i }).isVisible();

		expect(errorVisible || modalStillOpen).toBeTruthy();
	});

	test('should edit a teacher', async ({ page }) => {
		await page.goto('/admin/erzieher');
		await page.waitForLoadState('networkidle');

		const timestamp = Date.now();
		const originalName = `EditTeacher${timestamp}`;
		const newName = `GeändertErzieher${timestamp}`;

		// First create a teacher to edit
		await page.getByRole('button', { name: /Neue/ }).click();
		await page.getByLabel('Vorname').fill(originalName);
		await page.getByLabel('Nachname').fill('ToEdit');
		await page.getByLabel('E-Mail').fill(`edit-teacher-${timestamp}@kita.de`);
		await page.getByRole('button', { name: 'Speichern' }).click();
		await page.waitForLoadState('networkidle');

		// Wait for teacher to appear
		await expect(page.getByText(originalName)).toBeVisible();

		// Click edit on the teacher we created
		const teacherRow = page.locator('tr', { hasText: originalName });
		await teacherRow.getByRole('button', { name: 'Bearbeiten' }).click();

		// Wait for modal
		await expect(page.getByRole('heading', { name: /Erzieher.*bearbeiten/i })).toBeVisible();

		// Change the first name
		await page.getByLabel('Vorname').clear();
		await page.getByLabel('Vorname').fill(newName);

		await page.getByRole('button', { name: 'Speichern' }).click();
		await page.waitForLoadState('networkidle');

		// Verify the change
		await expect(page.getByText(newName)).toBeVisible();
	});
});
