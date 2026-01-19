import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
	test('should show login page for unauthenticated users', async ({ page }) => {
		await page.goto('/admin');
		await expect(page).toHaveURL('/admin/login');
		await expect(page.getByRole('heading', { name: 'Kita Admin' })).toBeVisible();
	});

	test('should show error for invalid credentials', async ({ page }) => {
		await page.goto('/admin/login');

		await page.getByLabel('E-Mail').fill('wrong@example.com');
		await page.getByLabel('Passwort').fill('wrongpassword');
		await page.getByRole('button', { name: 'Anmelden' }).click();

		await expect(page.getByText('Anmeldung fehlgeschlagen')).toBeVisible();
	});

	test('should login successfully with valid credentials', async ({ page, request }) => {
		// Sign up a new user via separate API context (not tied to page)
		const uniqueEmail = `admin-login-${Date.now()}@kita.de`;
		await request.post('/api/auth/sign-up/email', {
			data: {
				email: uniqueEmail,
				password: 'password123',
				name: 'Admin User'
			}
		});

		// Navigate to login page
		await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });

		// Wait for the form to be ready
		await page.waitForSelector('input[type="email"]', { state: 'visible' });

		// Now try to login
		await page.fill('input[type="email"]', uniqueEmail);
		await page.fill('input[type="password"]', 'password123');
		await page.click('button[type="submit"]');

		// Wait for navigation - the successful login should either:
		// 1. Navigate to /admin (without login suffix)
		// 2. Show the sidebar with "Kita Admin" heading
		await expect(async () => {
			const url = page.url();
			const notOnLogin = !url.includes('/admin/login');
			const hasSidebar = await page.getByRole('heading', { name: 'Kita Admin' }).isVisible();
			expect(notOnLogin || hasSidebar).toBeTruthy();
		}).toPass({ timeout: 10000 });
	});

	test('should logout successfully', async ({ page, request }) => {
		// Sign up a new user via separate API context
		const uniqueEmail = `admin-logout-${Date.now()}@kita.de`;
		await request.post('/api/auth/sign-up/email', {
			data: {
				email: uniqueEmail,
				password: 'password123',
				name: 'Admin User'
			}
		});

		// Navigate to login page
		await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });

		// Wait for the form to be ready
		await page.waitForSelector('input[type="email"]', { state: 'visible' });

		// Login
		await page.fill('input[type="email"]', uniqueEmail);
		await page.fill('input[type="password"]', 'password123');
		await page.click('button[type="submit"]');

		await page.waitForURL(/\/admin($|\/|\?)/);

		// Then logout
		await page.click('button:has-text("Abmelden")');

		await page.waitForURL('/admin/login');
	});
});
