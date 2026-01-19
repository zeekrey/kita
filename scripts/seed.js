#!/usr/bin/env node

/**
 * Seed CLI Orchestrator
 *
 * Usage:
 *   npm run db:seed                    # defaults to demo profile
 *   npm run db:seed -- -p demo         # explicit demo profile
 *   npm run db:seed -- --profile demo  # explicit demo profile
 *   npm run db:seed -- -p testing      # testing profile for E2E
 *   npm run db:seed -- -p inspection   # edge case testing
 *
 * Profiles:
 *   - testing:    Deterministic data for E2E tests (minimal, fixed IDs)
 *   - demo:       Realistic showcase data (default)
 *   - inspection: Edge case testing (long names, special chars, XSS tests)
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/lib/server/db/schema.js';
import * as profiles from './seeds/index.js';

// Parse command line arguments
function parseArgs() {
	const args = process.argv.slice(2);
	let profile = profiles.DEFAULT_PROFILE;

	for (let i = 0; i < args.length; i++) {
		if (args[i] === '-p' || args[i] === '--profile') {
			profile = args[i + 1];
			i++;
		}
	}

	return { profile };
}

// Validate profile
function validateProfile(profile) {
	if (!profiles.AVAILABLE_PROFILES.includes(profile)) {
		console.error(`❌ Unknown profile: "${profile}"`);
		console.error(`   Available profiles: ${profiles.AVAILABLE_PROFILES.join(', ')}`);
		process.exit(1);
	}
}

// Print usage help
function printUsage() {
	console.log(`
Kita Seed CLI - Database Seeding Tool

Usage:
  npm run db:seed                    # defaults to demo profile
  npm run db:seed -- -p <profile>    # specify profile
  npm run db:seed -- --profile <p>   # specify profile (long form)

Available Profiles:
  testing     Deterministic data for E2E tests
              - Fixed IDs with 'test-' prefix
              - Minimal: 2 groups, 3 children, 2 teachers
              - Predictable for automated testing

  demo        Realistic showcase data (default)
              - 5 groups, 25 children, 8 teachers
              - 2 weeks of schedules, meals, announcements
              - Natural-looking distribution

  inspection  Edge case testing
              - Long names (50+ characters)
              - Special characters (O'Connor, Müller, Björk)
              - Boundary dates (Feb 29, year boundaries)
              - Empty and overcrowded groups
              - XSS/injection test strings
`);
}

// Main execution
async function main() {
	// Check for help flag
	if (process.argv.includes('-h') || process.argv.includes('--help')) {
		printUsage();
		process.exit(0);
	}

	const { profile } = parseArgs();
	validateProfile(profile);

	console.log('🌱 Kita Seed CLI\n');
	console.log(`📦 Profile: ${profile}\n`);

	// Initialize database
	const sqlite = new Database('local.db');
	const db = drizzle(sqlite, { schema });

	try {
		// Get the seed function for the selected profile
		const seedFn = profiles[profile];

		if (typeof seedFn !== 'function') {
			throw new Error(`Profile "${profile}" does not export a seed function`);
		}

		// Execute the seed
		await seedFn(db, schema);

		console.log('\n🏁 Seeding complete!');
	} catch (error) {
		console.error('\n❌ Seeding failed:', error.message);
		console.error(error.stack);
		process.exit(1);
	} finally {
		sqlite.close();
	}
}

main();
