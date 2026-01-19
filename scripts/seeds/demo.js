/**
 * Demo Seed Profile
 *
 * Purpose: Realistic showcase data
 * - 5 groups with German names
 * - 25 children with realistic German names
 * - 8 teachers
 * - 2 weeks of schedules, meals, announcements
 * - Natural-looking distribution of data
 */

import {
	formatDate,
	getTwoWeeksOfWeekDays,
	addDays,
	generateId,
	clearData,
	insertRecords,
	printSummary,
	GROUP_PRESETS,
	FIRST_NAMES_MALE,
	FIRST_NAMES_FEMALE,
	LAST_NAMES,
	TEACHER_FIRST_NAMES,
	MEAL_DESCRIPTIONS,
	ANNOUNCEMENT_TEMPLATES,
	SHIFT_PRESETS
} from './base.js';

/**
 * Seed the database with demo profile data
 * @param {import('drizzle-orm/better-sqlite3').BetterSQLite3Database} db
 * @param {typeof import('../../src/lib/server/db/schema.js')} schema
 */
export async function seed(db, schema) {
	console.log('🎨 Demo profile - Realistic showcase data\n');

	const now = new Date();
	const today = new Date();
	const todayStr = formatDate(today);

	// Clear existing data
	clearData(db, schema);

	// ============================================
	// Groups (5 groups)
	// ============================================
	console.log('👥 Creating groups...');
	const groups = GROUP_PRESETS.slice(0, 5).map((preset) => ({
		id: generateId(),
		name: preset.name,
		farbe: preset.farbe,
		createdAt: now,
		updatedAt: now
	}));
	insertRecords(db, schema.gruppen, groups);
	console.log(`   ✓ Created ${groups.length} groups`);

	// ============================================
	// Teachers (8 teachers)
	// ============================================
	console.log('👩‍🏫 Creating teachers...');
	const usedLastNames = new Set();
	const teachers = [];

	for (let i = 0; i < 8; i++) {
		const firstName = TEACHER_FIRST_NAMES[i % TEACHER_FIRST_NAMES.length];
		let lastName;
		do {
			lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
		} while (usedLastNames.has(lastName));
		usedLastNames.add(lastName);

		teachers.push({
			id: generateId(),
			vorname: firstName,
			nachname: lastName,
			email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/ü/g, 'ue').replace(/ä/g, 'ae').replace(/ö/g, 'oe')}@kita.de`,
			fotoPath: null,
			createdAt: now,
			updatedAt: now
		});
	}
	insertRecords(db, schema.erzieher, teachers);
	console.log(`   ✓ Created ${teachers.length} teachers`);

	// ============================================
	// Children (25 children, 1 with birthday today)
	// ============================================
	console.log('👶 Creating children...');
	const todayMonthDay = todayStr.slice(5); // MM-DD
	const birthdayToday = `2020-${todayMonthDay}`; // Child born on this day

	const children = [];
	const usedNames = new Set();

	// First child always has birthday today
	children.push({
		id: generateId(),
		vorname: 'Emma',
		nachname: 'Müller',
		geburtstag: birthdayToday,
		gruppeId: groups[0].id,
		fotoPath: null,
		createdAt: now,
		updatedAt: now
	});
	usedNames.add('Emma Müller');

	// Generate remaining children
	for (let i = 1; i < 25; i++) {
		let firstName, lastName, fullName;
		const isFemale = i % 2 === 0;

		do {
			firstName = isFemale
				? FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)]
				: FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)];
			lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
			fullName = `${firstName} ${lastName}`;
		} while (usedNames.has(fullName));
		usedNames.add(fullName);

		// Generate random birthday in 2020-2021
		const year = 2020 + Math.floor(Math.random() * 2);
		const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
		const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');

		children.push({
			id: generateId(),
			vorname: firstName,
			nachname: lastName,
			geburtstag: `${year}-${month}-${day}`,
			gruppeId: groups[i % groups.length].id,
			fotoPath: null,
			createdAt: now,
			updatedAt: now
		});
	}
	insertRecords(db, schema.kinder, children);
	console.log(`   ✓ Created ${children.length} children (1 with birthday today)`);

	// ============================================
	// Schedules (2 weeks, varied patterns)
	// ============================================
	console.log('📅 Creating schedules...');
	const weekDays = getTwoWeeksOfWeekDays(today);
	const schedules = [];

	// Assign varied schedules to teachers
	const schedulePatterns = [
		{ teacher: 0, days: [0, 1, 2, 3, 4], shift: 'early' }, // Mon-Fri early
		{ teacher: 1, days: [0, 1, 2, 3, 4], shift: 'late' }, // Mon-Fri late
		{ teacher: 2, days: [0, 2, 4], shift: 'early' }, // Mon, Wed, Fri early
		{ teacher: 3, days: [1, 3], shift: 'late' }, // Tue, Thu late
		{ teacher: 4, days: [0, 1, 2, 3, 4], shift: 'fullDay' }, // Mon-Fri full
		{ teacher: 5, days: [0, 1, 2], shift: 'morning' }, // Mon-Wed morning
		{ teacher: 6, days: [2, 3, 4], shift: 'afternoon' }, // Wed-Fri afternoon
		{ teacher: 7, days: [0, 4], shift: 'fullDay' } // Mon, Fri full
	];

	// Apply patterns for 2 weeks
	for (let week = 0; week < 2; week++) {
		for (const pattern of schedulePatterns) {
			const teacher = teachers[pattern.teacher];
			if (!teacher) continue;

			for (const dayIndex of pattern.days) {
				const date = weekDays[week * 5 + dayIndex];
				if (!date) continue;

				const shift = SHIFT_PRESETS[pattern.shift];
				schedules.push({
					id: generateId(),
					erzieherId: teacher.id,
					datum: formatDate(date),
					startZeit: shift.startZeit,
					endZeit: shift.endZeit,
					createdAt: now,
					updatedAt: now
				});
			}
		}
	}

	insertRecords(db, schema.dienstplan, schedules);
	console.log(`   ✓ Created ${schedules.length} schedule entries`);

	// ============================================
	// Meals (2 weeks)
	// ============================================
	console.log('🍽️  Creating meals...');
	const meals = [];
	const mealTypes = ['fruehstueck', 'mittagessen', 'snack'];

	for (let i = 0; i < weekDays.length; i++) {
		const datum = formatDate(weekDays[i]);
		for (const typ of mealTypes) {
			const descriptions = MEAL_DESCRIPTIONS[typ];
			meals.push({
				id: generateId(),
				datum,
				typ,
				beschreibung: descriptions[i % descriptions.length],
				createdAt: now,
				updatedAt: now
			});
		}
	}

	insertRecords(db, schema.mahlzeiten, meals);
	console.log(`   ✓ Created ${meals.length} meal entries`);

	// ============================================
	// Announcements (5 announcements with varied validity)
	// ============================================
	console.log('📢 Creating announcements...');
	const announcements = ANNOUNCEMENT_TEMPLATES.map((template, index) => {
		const startOffset = index * 2; // Stagger start dates
		const duration = 7 + index * 3; // Vary duration

		return {
			id: generateId(),
			titel: template.titel,
			nachricht: template.nachricht,
			gueltigVon: formatDate(addDays(today, startOffset)),
			gueltigBis: formatDate(addDays(today, startOffset + duration)),
			prioritaet: template.prioritaet,
			createdAt: now,
			updatedAt: now
		};
	});

	// Make sure at least one announcement is valid today
	if (announcements.length > 0) {
		announcements[0].gueltigVon = todayStr;
		announcements[0].gueltigBis = formatDate(addDays(today, 14));
	}

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
