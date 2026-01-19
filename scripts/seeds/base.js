/**
 * Base utilities shared across all seed profiles
 * Provides date helpers, ID generators, and name lists
 */

// ============================================
// Date Utilities
// ============================================

/**
 * Format date as YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
	return date.toISOString().split('T')[0];
}

/**
 * Get the Monday of the week containing the given date
 * @param {Date} date
 * @returns {Date}
 */
export function getMonday(date) {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	d.setDate(diff);
	d.setHours(0, 0, 0, 0);
	return d;
}

/**
 * Get weekdays (Mon-Fri) starting from Monday of the given date's week
 * @param {Date} startDate
 * @returns {Date[]}
 */
export function getWeekDays(startDate) {
	const monday = getMonday(startDate);
	const days = [];
	for (let i = 0; i < 5; i++) {
		const d = new Date(monday);
		d.setDate(monday.getDate() + i);
		days.push(d);
	}
	return days;
}

/**
 * Get two weeks of weekdays starting from the given date's week
 * @param {Date} startDate
 * @returns {Date[]}
 */
export function getTwoWeeksOfWeekDays(startDate) {
	const monday = getMonday(startDate);
	const days = [];
	for (let week = 0; week < 2; week++) {
		for (let i = 0; i < 5; i++) {
			const d = new Date(monday);
			d.setDate(monday.getDate() + week * 7 + i);
			days.push(d);
		}
	}
	return days;
}

/**
 * Add days to a date
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export function addDays(date, days) {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
}

// ============================================
// ID Generators
// ============================================

/**
 * Generate a random UUID
 * @returns {string}
 */
export function generateId() {
	return crypto.randomUUID();
}

/**
 * Generate a deterministic test ID with prefix
 * @param {string} prefix - e.g., 'group', 'child', 'teacher'
 * @param {number} index - sequential number
 * @returns {string}
 */
export function testId(prefix, index) {
	return `test-${prefix}-${index}`;
}

// ============================================
// German Name Lists
// ============================================

export const FIRST_NAMES_MALE = [
	'Ben',
	'Elias',
	'Felix',
	'Finn',
	'Henry',
	'Jonas',
	'Leon',
	'Liam',
	'Luca',
	'Lukas',
	'Maximilian',
	'Moritz',
	'Noah',
	'Oscar',
	'Paul',
	'Theo'
];

export const FIRST_NAMES_FEMALE = [
	'Anna',
	'Charlotte',
	'Clara',
	'Ella',
	'Emilia',
	'Emma',
	'Frieda',
	'Hannah',
	'Ida',
	'Lina',
	'Luisa',
	'Marie',
	'Mathilda',
	'Mia',
	'Mila',
	'Sophie'
];

export const LAST_NAMES = [
	'Bauer',
	'Becker',
	'Braun',
	'Fischer',
	'Hartmann',
	'Hoffmann',
	'Klein',
	'Koch',
	'Krause',
	'Lehmann',
	'Meyer',
	'Müller',
	'Richter',
	'Schäfer',
	'Schmidt',
	'Schneider',
	'Schulz',
	'Schwarz',
	'Wagner',
	'Weber',
	'Wolf',
	'Zimmermann'
];

export const TEACHER_FIRST_NAMES = [
	'Anna',
	'Christina',
	'Eva',
	'Julia',
	'Katharina',
	'Laura',
	'Lisa',
	'Maria',
	'Martina',
	'Petra',
	'Sandra',
	'Sabine',
	'Stefanie',
	'Thomas',
	'Michael',
	'Andreas'
];

// ============================================
// Group Names and Colors
// ============================================

export const GROUP_PRESETS = [
	{ name: 'Sonnenkäfer', farbe: '#FF6B6B' },
	{ name: 'Schmetterlinge', farbe: '#4ECDC4' },
	{ name: 'Löwenzahn', farbe: '#45B7D1' },
	{ name: 'Regenbogen', farbe: '#96CEB4' },
	{ name: 'Sternschnuppen', farbe: '#FFEAA7' },
	{ name: 'Waldwichtel', farbe: '#DDA0DD' },
	{ name: 'Glühwürmchen', farbe: '#F7DC6F' },
	{ name: 'Marienkäfer', farbe: '#BB8FCE' }
];

// ============================================
// Meal Descriptions
// ============================================

export const MEAL_DESCRIPTIONS = {
	fruehstueck: [
		'Vollkornbrot mit Käse und Gurke',
		'Müsli mit frischem Obst',
		'Joghurt mit Haferflocken',
		'Toast mit Marmelade',
		'Brot mit Frischkäse',
		'Haferbrei mit Banane',
		'Pancakes mit Apfelmus',
		'Knäckebrot mit Quark',
		'Obstplatte mit Joghurt',
		'Brötchen mit Butter und Honig'
	],
	mittagessen: [
		'Spaghetti Bolognese',
		'Gemüsesuppe mit Brötchen',
		'Kartoffelpüree mit Fischstäbchen',
		'Reis mit Gemüsepfanne',
		'Pizza mit Salat',
		'Nudeln mit Tomatensoße',
		'Hühnchen mit Kartoffeln',
		'Kartoffelauflauf mit Gemüse',
		'Grießbrei mit Zimtzucker',
		'Gemüselasagne'
	],
	snack: [
		'Apfelschnitze mit Nüssen',
		'Gemüsesticks mit Dip',
		'Käsewürfel mit Trauben',
		'Obstquark',
		'Reiswaffeln mit Aufstrich',
		'Bananenbrot',
		'Müsliriegel',
		'Gurkenscheiben mit Hummus',
		'Birnenschnitze',
		'Joghurt mit Beeren'
	]
};

// ============================================
// Announcement Templates
// ============================================

export const ANNOUNCEMENT_TEMPLATES = [
	{
		titel: 'Sommerfest am Samstag',
		nachricht:
			'Wir laden alle Familien herzlich zum Sommerfest ein! Es gibt Spiele, Musik und ein Buffet. Bitte bringen Sie gute Laune und einen Salat oder Kuchen mit.',
		prioritaet: 'wichtig'
	},
	{
		titel: 'Neue Öffnungszeiten ab Februar',
		nachricht:
			'Ab dem 1. Februar gelten neue Öffnungszeiten: Montag bis Freitag von 7:00 bis 18:00 Uhr. Der Frühdienst beginnt wie gewohnt um 7:00 Uhr.',
		prioritaet: 'normal'
	},
	{
		titel: 'Bitte Wechselkleidung mitbringen',
		nachricht:
			'Liebe Eltern, bitte denken Sie daran, Wechselkleidung für Ihr Kind mitzubringen. Besonders jetzt im Winter brauchen wir warme Ersatzkleidung.',
		prioritaet: 'normal'
	},
	{
		titel: 'Elternabend nächste Woche',
		nachricht:
			'Am kommenden Mittwoch findet um 19:00 Uhr unser Elternabend statt. Thema: Eingewöhnung und Tagesablauf. Um Anmeldung wird gebeten.',
		prioritaet: 'wichtig'
	},
	{
		titel: 'Fotograf kommt',
		nachricht:
			'Am Freitag kommt der Fotograf für die jährlichen Kindergartenfotos. Bitte kleiden Sie Ihr Kind entsprechend.',
		prioritaet: 'normal'
	}
];

// ============================================
// Schedule Presets
// ============================================

export const SHIFT_PRESETS = {
	early: { startZeit: '07:00', endZeit: '14:00' },
	late: { startZeit: '11:00', endZeit: '18:00' },
	fullDay: { startZeit: '07:00', endZeit: '18:00' },
	morning: { startZeit: '08:00', endZeit: '13:00' },
	afternoon: { startZeit: '12:00', endZeit: '17:00' }
};

// ============================================
// Database Utilities
// ============================================

/**
 * Clear all application data from the database (respects foreign key constraints)
 * @param {import('drizzle-orm/better-sqlite3').BetterSQLite3Database} db
 * @param {typeof import('../../src/lib/server/db/schema.js')} schema
 */
export function clearData(db, schema) {
	console.log('🗑️  Clearing existing data...');
	db.delete(schema.dienstplan).run();
	db.delete(schema.mahlzeiten).run();
	db.delete(schema.ankuendigungen).run();
	db.delete(schema.kinder).run();
	db.delete(schema.erzieher).run();
	db.delete(schema.gruppen).run();
}

/**
 * Insert records into the database
 * @param {import('drizzle-orm/better-sqlite3').BetterSQLite3Database} db
 * @param {any} table
 * @param {any[]} records
 */
export function insertRecords(db, table, records) {
	for (const record of records) {
		db.insert(table).values(record).run();
	}
}

/**
 * Print seed summary
 * @param {object} counts
 */
export function printSummary(counts) {
	console.log('\n✅ Seed completed successfully!');
	console.log('\nSummary:');
	for (const [key, value] of Object.entries(counts)) {
		console.log(`   - ${value} ${key}`);
	}
}
