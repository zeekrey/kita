# Spec: Testing

## Overview

End-to-end tests for critical application flows using Playwright.

---

## Tasks

### 11.2 Write E2E Tests for Login Flow

**File**: `e2e/auth.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
	test('should show login page for unauthenticated users', async ({ page }) => {
		await page.goto('/admin');
		await expect(page).toHaveURL('/admin/login');
		await expect(page.getByRole('heading', { name: /anmelden/i })).toBeVisible();
	});

	test('should show error for invalid credentials', async ({ page }) => {
		await page.goto('/admin/login');

		await page.getByLabel(/e-mail/i).fill('wrong@example.com');
		await page.getByLabel(/passwort/i).fill('wrongpassword');
		await page.getByRole('button', { name: /anmelden/i }).click();

		await expect(page.getByText(/fehlgeschlagen/i)).toBeVisible();
	});

	test('should login successfully with valid credentials', async ({ page }) => {
		await page.goto('/admin/login');

		await page.getByLabel(/e-mail/i).fill('admin@kita.de');
		await page.getByLabel(/passwort/i).fill('password123');
		await page.getByRole('button', { name: /anmelden/i }).click();

		await expect(page).toHaveURL('/admin');
		await expect(page.getByText(/übersicht/i)).toBeVisible();
	});

	test('should logout successfully', async ({ page }) => {
		// First login
		await page.goto('/admin/login');
		await page.getByLabel(/e-mail/i).fill('admin@kita.de');
		await page.getByLabel(/passwort/i).fill('password123');
		await page.getByRole('button', { name: /anmelden/i }).click();

		// Then logout
		await page.getByRole('button', { name: /abmelden/i }).click();

		await expect(page).toHaveURL('/admin/login');
	});
});
```

**Acceptance Criteria**:

- [ ] Redirect to login works
- [ ] Invalid credentials show error
- [ ] Valid credentials grant access
- [ ] Logout works

---

### 11.3 Write E2E Tests for CRUD Operations

**File**: `e2e/crud.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Groups CRUD', () => {
	test.beforeEach(async ({ page }) => {
		// Login first
		await page.goto('/admin/login');
		await page.getByLabel(/e-mail/i).fill('admin@kita.de');
		await page.getByLabel(/passwort/i).fill('password123');
		await page.getByRole('button', { name: /anmelden/i }).click();
	});

	test('should create a new group', async ({ page }) => {
		await page.goto('/admin/gruppen');

		await page.getByRole('button', { name: /neue gruppe/i }).click();
		await page.getByLabel(/name/i).fill('Testgruppe');
		await page.getByRole('button', { name: /speichern/i }).click();

		await expect(page.getByText('Testgruppe')).toBeVisible();
	});

	test('should edit a group', async ({ page }) => {
		await page.goto('/admin/gruppen');

		// Click edit on first group
		await page
			.getByRole('button', { name: /bearbeiten/i })
			.first()
			.click();
		await page.getByLabel(/name/i).fill('Geänderte Gruppe');
		await page.getByRole('button', { name: /speichern/i }).click();

		await expect(page.getByText('Geänderte Gruppe')).toBeVisible();
	});

	test('should delete a group', async ({ page }) => {
		await page.goto('/admin/gruppen');

		const groupName = await page.locator('.group-name').first().textContent();

		await page
			.getByRole('button', { name: /löschen/i })
			.first()
			.click();
		await page.getByRole('button', { name: /bestätigen/i }).click();

		await expect(page.getByText(groupName)).not.toBeVisible();
	});
});

test.describe('Children CRUD', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/admin/login');
		await page.getByLabel(/e-mail/i).fill('admin@kita.de');
		await page.getByLabel(/passwort/i).fill('password123');
		await page.getByRole('button', { name: /anmelden/i }).click();
	});

	test('should create a new child', async ({ page }) => {
		await page.goto('/admin/kinder');

		await page.getByRole('button', { name: /neues kind/i }).click();
		await page.getByLabel(/vorname/i).fill('Test');
		await page.getByLabel(/nachname/i).fill('Kind');
		await page.getByLabel(/geburtstag/i).fill('2022-05-15');
		await page.getByRole('button', { name: /speichern/i }).click();

		await expect(page.getByText('Test Kind')).toBeVisible();
	});

	test('should filter children by name', async ({ page }) => {
		await page.goto('/admin/kinder');

		await page.getByPlaceholder(/suchen/i).fill('Emma');

		await expect(page.getByText('Emma')).toBeVisible();
		// Other children should not be visible
	});
});

test.describe('Teachers CRUD', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/admin/login');
		await page.getByLabel(/e-mail/i).fill('admin@kita.de');
		await page.getByLabel(/passwort/i).fill('password123');
		await page.getByRole('button', { name: /anmelden/i }).click();
	});

	test('should create a new teacher', async ({ page }) => {
		await page.goto('/admin/erzieher');

		await page.getByRole('button', { name: /neue/i }).click();
		await page.getByLabel(/vorname/i).fill('Test');
		await page.getByLabel(/nachname/i).fill('Erzieher');
		await page.getByLabel(/e-mail/i).fill('test@kita.de');
		await page.getByRole('button', { name: /speichern/i }).click();

		await expect(page.getByText('Test Erzieher')).toBeVisible();
	});

	test('should prevent duplicate email', async ({ page }) => {
		await page.goto('/admin/erzieher');

		await page.getByRole('button', { name: /neue/i }).click();
		await page.getByLabel(/vorname/i).fill('Another');
		await page.getByLabel(/nachname/i).fill('Teacher');
		await page.getByLabel(/e-mail/i).fill('maria.schmidt@kita.de'); // Existing email
		await page.getByRole('button', { name: /speichern/i }).click();

		await expect(page.getByText(/bereits vorhanden/i)).toBeVisible();
	});
});
```

**Acceptance Criteria**:

- [ ] Can create entities
- [ ] Can edit entities
- [ ] Can delete entities
- [ ] Validation works

---

### 11.4 Write E2E Tests for Dashboard Display

**File**: `e2e/dashboard.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Public Dashboard', () => {
	test('should display dashboard without authentication', async ({ page }) => {
		await page.goto('/');

		// Dashboard should be accessible
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	});

	test('should display announcements section', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByText(/ankündigungen/i)).toBeVisible();
	});

	test('should display meals section', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByText(/speiseplan/i)).toBeVisible();
	});

	test('should display teachers section', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByText(/anwesend/i)).toBeVisible();
	});

	test('should display birthdays section', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByText(/geburtstag/i)).toBeVisible();
	});

	test('should display current date', async ({ page }) => {
		await page.goto('/');

		const today = new Date();
		const day = today.getDate().toString();

		await expect(page.getByText(new RegExp(day))).toBeVisible();
	});

	test('should auto-refresh data', async ({ page }) => {
		await page.goto('/');

		// Wait for auto-refresh (30s + buffer)
		// This is a long test, might want to mock the interval
		await page.waitForTimeout(32000);

		// Dashboard should still be functional
		await expect(page.getByText(/ankündigungen/i)).toBeVisible();
	});
});
```

**Acceptance Criteria**:

- [ ] Dashboard accessible without login
- [ ] All sections render
- [ ] Current date shown
- [ ] Auto-refresh works

---

## Test Setup

**playwright.config.js updates**:

```javascript
export default {
	webServer: {
		command: 'bun run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI
	},
	use: {
		baseURL: 'http://localhost:5173'
	},
	testDir: 'e2e'
};
```

**Test Database Setup**:

- Use separate test database
- Seed before tests
- Clean after tests

**Environment Variables for Testing**:

```bash
DATABASE_URL=file:./test.db
```

---

## Running Tests

```bash
# Run all tests
bun run test:e2e

# Run specific test file
bun run test:e2e e2e/auth.spec.js

# Run in headed mode (see browser)
bun run test:e2e -- --headed

# Run with debug
bun run test:e2e -- --debug
```

---

## Files to Create/Modify

- `e2e/auth.spec.js` (authentication tests)
- `e2e/crud.spec.js` (CRUD tests)
- `e2e/dashboard.spec.js` (dashboard tests)
- `playwright.config.js` (test configuration)
