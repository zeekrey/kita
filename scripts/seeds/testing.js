/**
 * Testing Seed Profile
 *
 * Purpose: Deterministic data for E2E tests
 * - Fixed IDs with 'test-' prefix for predictable references
 * - Minimal data: 2 groups, 3 children, 2 teachers
 * - Fixed dates relative to execution (always current week)
 * - No randomization
 */

import {
	formatDate,
	getWeekDays,
	addDays,
	testId,
	clearData,
	insertRecords,
	printSummary
} from './base.js';

/**
 * Seed the database with testing profile data
 * @param {import('drizzle-orm/better-sqlite3').BetterSQLite3Database} db
 * @param {typeof import('../../src/lib/server/db/schema.js')} schema
 */
export async function seed(db, schema) {
	console.log('🧪 Testing profile - Deterministic data for E2E tests\n');

	const now = new Date();
	const today = new Date();
	const todayStr = formatDate(today);

	// Clear existing data
	clearData(db, schema);

	// ============================================
	// Groups (2 groups)
	// ============================================
	console.log('👥 Creating groups...');
	const groups = [
		{
			id: testId('group', 1),
			name: 'Testgruppe Rot',
			farbe: '#FF6B6B',
			createdAt: now,
			updatedAt: now
		},
		{
			id: testId('group', 2),
			name: 'Testgruppe Blau',
			farbe: '#4ECDC4',
			createdAt: now,
			updatedAt: now
		}
	];
	insertRecords(db, schema.gruppen, groups);
	console.log(`   ✓ Created ${groups.length} groups`);

	// ============================================
	// Teachers (2 teachers)
	// ============================================
	console.log('👩‍🏫 Creating teachers...');
	const teachers = [
		{
			id: testId('teacher', 1),
			vorname: 'Test',
			nachname: 'Lehrer',
			email: 'test.lehrer@kita.de',
			fotoPath: null,
			createdAt: now,
			updatedAt: now
		},
		{
			id: testId('teacher', 2),
			vorname: 'Test',
			nachname: 'Erzieherin',
			email: 'test.erzieherin@kita.de',
			fotoPath: null,
			createdAt: now,
			updatedAt: now
		}
	];
	insertRecords(db, schema.erzieher, teachers);
	console.log(`   ✓ Created ${teachers.length} teachers`);

	// ============================================
	// Children (3 children, 1 with birthday today)
	// ============================================
	console.log('👶 Creating children...');
	const todayMonthDay = todayStr.slice(5); // MM-DD
	const birthdayToday = `2020-${todayMonthDay}`; // Child born on this day

	const children = [
		{
			id: testId('child', 1),
			vorname: 'Test',
			nachname: 'Kind',
			geburtstag: birthdayToday, // Birthday today!
			gruppeId: groups[0].id,
			fotoPath: null,
			createdAt: now,
			updatedAt: now
		},
		{
			id: testId('child', 2),
			vorname: 'Anna',
			nachname: 'Testermann',
			geburtstag: '2021-06-15',
			gruppeId: groups[0].id,
			fotoPath: null,
			createdAt: now,
			updatedAt: now
		},
		{
			id: testId('child', 3),
			vorname: 'Max',
			nachname: 'Mustermann',
			geburtstag: '2020-03-22',
			gruppeId: groups[1].id,
			fotoPath: null,
			createdAt: now,
			updatedAt: now
		}
	];
	insertRecords(db, schema.kinder, children);
	console.log(`   ✓ Created ${children.length} children (1 with birthday today)`);

	// ============================================
	// Schedules (current week, minimal)
	// ============================================
	console.log('📅 Creating schedules...');
	const weekDays = getWeekDays(today);
	const schedules = [];

	// Teacher 1: Early shift Mon-Fri
	for (let i = 0; i < 5; i++) {
		schedules.push({
			id: testId('schedule', schedules.length + 1),
			erzieherId: teachers[0].id,
			datum: formatDate(weekDays[i]),
			startZeit: '07:00',
			endZeit: '14:00',
			createdAt: now,
			updatedAt: now
		});
	}

	// Teacher 2: Late shift Mon-Fri
	for (let i = 0; i < 5; i++) {
		schedules.push({
			id: testId('schedule', schedules.length + 1),
			erzieherId: teachers[1].id,
			datum: formatDate(weekDays[i]),
			startZeit: '11:00',
			endZeit: '18:00',
			createdAt: now,
			updatedAt: now
		});
	}

	insertRecords(db, schema.dienstplan, schedules);
	console.log(`   ✓ Created ${schedules.length} schedule entries`);

	// ============================================
	// Meals (current week)
	// ============================================
	console.log('🍽️  Creating meals...');
	const meals = [];
	const mealTypes = ['fruehstueck', 'mittagessen', 'snack'];
	// Note: Descriptions should NOT contain meal type names to avoid test conflicts
	const mealDescriptions = {
		fruehstueck: 'Brot mit Käse',
		mittagessen: 'Nudeln mit Soße',
		snack: 'Obst und Gemüse'
	};

	for (let i = 0; i < 5; i++) {
		const datum = formatDate(weekDays[i]);
		for (const typ of mealTypes) {
			meals.push({
				id: testId('meal', meals.length + 1),
				datum,
				typ,
				beschreibung: `${mealDescriptions[typ]} - Tag ${i + 1}`,
				createdAt: now,
				updatedAt: now
			});
		}
	}

	insertRecords(db, schema.mahlzeiten, meals);
	console.log(`   ✓ Created ${meals.length} meal entries`);

	// ============================================
	// Announcements (2 announcements)
	// ============================================
	console.log('📢 Creating announcements...');
	const nextWeek = addDays(today, 7);

	const announcements = [
		{
			id: testId('announcement', 1),
			titel: 'Test Wichtige Ankündigung',
			nachricht: 'Dies ist eine wichtige Test-Ankündigung für E2E Tests.',
			gueltigVon: todayStr,
			gueltigBis: formatDate(nextWeek),
			prioritaet: 'wichtig',
			createdAt: now,
			updatedAt: now
		},
		{
			id: testId('announcement', 2),
			titel: 'Test Normale Ankündigung',
			nachricht: 'Dies ist eine normale Test-Ankündigung für E2E Tests.',
			gueltigVon: todayStr,
			gueltigBis: formatDate(nextWeek),
			prioritaet: 'normal',
			createdAt: now,
			updatedAt: now
		}
	];
	insertRecords(db, schema.ankuendigungen, announcements);
	console.log(`   ✓ Created ${announcements.length} announcements`);

	// Summary
	printSummary({
		groups: groups.length,
		teachers: teachers.length,
		children: children.length,
		'schedule entries': schedules.length,
		'meal entries': meals.length,
		announcements: announcements.length
	});
}
