import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI
	},
	use: {
		baseURL: 'http://localhost:5173'
	},
	testDir: 'e2e',
	// Run tests in parallel
	workers: process.env.CI ? 1 : undefined,
	// Retry failed tests
	retries: process.env.CI ? 2 : 0,
	// Report options
	reporter: process.env.CI ? 'dot' : 'list',
	// Timeout settings
	timeout: 30000,
	expect: {
		timeout: 5000
	}
});
