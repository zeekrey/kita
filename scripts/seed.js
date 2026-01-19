import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/lib/server/db/schema.js';

const sqlite = new Database('local.db');
const db = drizzle(sqlite, { schema });

/**
 * Format date as YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
	return date.toISOString().split('T')[0];
}

/**
 * Get the Monday of the current week
 * @param {Date} date
 * @returns {Date}
 */
function getMonday(date) {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	d.setDate(diff);
	d.setHours(0, 0, 0, 0);
	return d;
}

/**
 * Get weekdays (Mon-Fri) for the current week
 * @param {Date} startDate
 * @returns {Date[]}
 */
function getWeekDays(startDate) {
	const monday = getMonday(startDate);
	const days = [];
	for (let i = 0; i < 5; i++) {
		const d = new Date(monday);
		d.setDate(monday.getDate() + i);
		days.push(d);
	}
	return days;
}

async function seed() {
	console.log('🌱 Starting seed...\n');

	const now = new Date();
	const today = new Date();
	const todayStr = formatDate(today);

	// Clear existing data (in reverse dependency order)
	console.log('🗑️  Clearing existing data...');
	db.delete(schema.dienstplan).run();
	db.delete(schema.mahlzeiten).run();
	db.delete(schema.ankuendigungen).run();
	db.delete(schema.kinder).run();
	db.delete(schema.erzieher).run();
	db.delete(schema.gruppen).run();

	// Create Groups
	console.log('👥 Creating groups...');
	const groups = [
		{ id: crypto.randomUUID(), name: 'Sonnenkäfer', farbe: '#FF6B6B', createdAt: now, updatedAt: now },
		{ id: crypto.randomUUID(), name: 'Schmetterlinge', farbe: '#4ECDC4', createdAt: now, updatedAt: now },
		{ id: crypto.randomUUID(), name: 'Löwenzahn', farbe: '#45B7D1', createdAt: now, updatedAt: now }
	];
	for (const group of groups) {
		db.insert(schema.gruppen).values(group).run();
	}
	console.log(`   ✓ Created ${groups.length} groups`);

	// Create Teachers
	console.log('👩‍🏫 Creating teachers...');
	const teachers = [
		{ id: crypto.randomUUID(), vorname: 'Maria', nachname: 'Schmidt', email: 'maria.schmidt@kita.de', fotoPath: null, createdAt: now, updatedAt: now },
		{ id: crypto.randomUUID(), vorname: 'Thomas', nachname: 'Krause', email: 'thomas.krause@kita.de', fotoPath: null, createdAt: now, updatedAt: now },
		{ id: crypto.randomUUID(), vorname: 'Lisa', nachname: 'Weber', email: 'lisa.weber@kita.de', fotoPath: null, createdAt: now, updatedAt: now },
		{ id: crypto.randomUUID(), vorname: 'Anna', nachname: 'Braun', email: 'anna.braun@kita.de', fotoPath: null, createdAt: now, updatedAt: now }
	];
	for (const teacher of teachers) {
		db.insert(schema.erzieher).values(teacher).run();
	}
	console.log(`   ✓ Created ${teachers.length} teachers`);

	// Create Children (one with birthday today for testing)
	console.log('👶 Creating children...');
	const todayMonthDay = todayStr.slice(5); // MM-DD
	const birthdayToday = `2020-${todayMonthDay}`; // Child born on this day in 2020

	const children = [
		{ id: crypto.randomUUID(), vorname: 'Emma', nachname: 'Müller', geburtstag: birthdayToday, gruppeId: groups[0].id, fotoPath: null, createdAt: now, updatedAt: now },
		{ id: crypto.randomUUID(), vorname: 'Luca', nachname: 'Fischer', geburtstag: '2021-03-15', gruppeId: groups[0].id, fotoPath: null, createdAt: now, updatedAt: now },
		{ id: crypto.randomUUID(), vorname: 'Mia', nachname: 'Wagner', geburtstag: '2020-07-22', gruppeId: groups[0].id, fotoPath: null, createdAt: now, updatedAt: now },
		{ id: crypto.randomUUID(), vorname: 'Noah', nachname: 'Becker', geburtstag: '2021-01-08', gruppeId: groups[1].id, fotoPath: null, createdAt: now, updatedAt: now },
		{ id: crypto.randomUUID(), vorname: 'Hannah', nachname: 'Hoffmann', geburtstag: '2020-11-30', gruppeId: groups[1].id, fotoPath: null, createdAt: now, updatedAt: now },
		{ id: crypto.randomUUID(), vorname: 'Elias', nachname: 'Schäfer', geburtstag: '2021-06-14', gruppeId: groups[1].id, fotoPath: null, createdAt: now, updatedAt: now },
		{ id: crypto.randomUUID(), vorname: 'Sophie', nachname: 'Koch', geburtstag: '2020-04-02', gruppeId: groups[2].id, fotoPath: null, createdAt: now, updatedAt: now },
		{ id: crypto.randomUUID(), vorname: 'Ben', nachname: 'Richter', geburtstag: '2021-09-19', gruppeId: groups[2].id, fotoPath: null, createdAt: now, updatedAt: now },
		{ id: crypto.randomUUID(), vorname: 'Emilia', nachname: 'Klein', geburtstag: '2020-12-25', gruppeId: groups[2].id, fotoPath: null, createdAt: now, updatedAt: now },
		{ id: crypto.randomUUID(), vorname: 'Felix', nachname: 'Wolf', geburtstag: '2021-02-28', gruppeId: groups[2].id, fotoPath: null, createdAt: now, updatedAt: now }
	];
	for (const child of children) {
		db.insert(schema.kinder).values(child).run();
	}
	console.log(`   ✓ Created ${children.length} children (1 with birthday today)`);

	// Create Schedules for current week
	console.log('📅 Creating schedules...');
	const weekDays = getWeekDays(today);
	const schedules = [];

	// Maria: Early shift Mon-Thu
	for (let i = 0; i < 4; i++) {
		schedules.push({
			id: crypto.randomUUID(),
			erzieherId: teachers[0].id,
			datum: formatDate(weekDays[i]),
			startZeit: '07:00',
			endZeit: '14:00',
			createdAt: now,
			updatedAt: now
		});
	}

	// Thomas: Late shift Mon-Fri
	for (let i = 0; i < 5; i++) {
		schedules.push({
			id: crypto.randomUUID(),
			erzieherId: teachers[1].id,
			datum: formatDate(weekDays[i]),
			startZeit: '11:00',
			endZeit: '18:00',
			createdAt: now,
			updatedAt: now
		});
	}

	// Lisa: Early shift Mon, Wed, Fri
	for (const i of [0, 2, 4]) {
		schedules.push({
			id: crypto.randomUUID(),
			erzieherId: teachers[2].id,
			datum: formatDate(weekDays[i]),
			startZeit: '07:00',
			endZeit: '14:00',
			createdAt: now,
			updatedAt: now
		});
	}

	// Anna: Late shift Tue, Thu
	for (const i of [1, 3]) {
		schedules.push({
			id: crypto.randomUUID(),
			erzieherId: teachers[3].id,
			datum: formatDate(weekDays[i]),
			startZeit: '12:00',
			endZeit: '18:00',
			createdAt: now,
			updatedAt: now
		});
	}

	for (const schedule of schedules) {
		db.insert(schema.dienstplan).values(schedule).run();
	}
	console.log(`   ✓ Created ${schedules.length} schedule entries`);

	// Create Meals for current week
	console.log('🍽️  Creating meals...');
	const mealDescriptions = {
		fruehstueck: [
			'Vollkornbrot mit Käse und Gurke',
			'Müsli mit frischem Obst',
			'Joghurt mit Haferflocken',
			'Toast mit Marmelade',
			'Brot mit Frischkäse'
		],
		mittagessen: [
			'Spaghetti Bolognese',
			'Gemüsesuppe mit Brötchen',
			'Kartoffelpüree mit Fischstäbchen',
			'Reis mit Gemüsepfanne',
			'Pizza mit Salat'
		],
		snack: [
			'Apfelschnitze mit Nüssen',
			'Gemüsesticks mit Dip',
			'Käsewürfel mit Trauben',
			'Obstquark',
			'Reiswaffeln mit Aufstrich'
		]
	};

	const meals = [];
	for (let i = 0; i < 5; i++) {
		const datum = formatDate(weekDays[i]);
		meals.push(
			{ id: crypto.randomUUID(), datum, typ: 'fruehstueck', beschreibung: mealDescriptions.fruehstueck[i], createdAt: now, updatedAt: now },
			{ id: crypto.randomUUID(), datum, typ: 'mittagessen', beschreibung: mealDescriptions.mittagessen[i], createdAt: now, updatedAt: now },
			{ id: crypto.randomUUID(), datum, typ: 'snack', beschreibung: mealDescriptions.snack[i], createdAt: now, updatedAt: now }
		);
	}

	for (const meal of meals) {
		db.insert(schema.mahlzeiten).values(meal).run();
	}
	console.log(`   ✓ Created ${meals.length} meal entries`);

	// Create Announcements
	console.log('📢 Creating announcements...');
	const nextWeek = new Date(today);
	nextWeek.setDate(nextWeek.getDate() + 7);

	const announcements = [
		{
			id: crypto.randomUUID(),
			titel: 'Sommerfest am Samstag',
			nachricht: 'Wir laden alle Familien herzlich zum Sommerfest ein! Es gibt Spiele, Musik und ein Buffet. Bitte bringen Sie gute Laune und einen Salat oder Kuchen mit.',
			gueltigVon: todayStr,
			gueltigBis: formatDate(nextWeek),
			prioritaet: 'wichtig',
			createdAt: now,
			updatedAt: now
		},
		{
			id: crypto.randomUUID(),
			titel: 'Neue Öffnungszeiten ab Februar',
			nachricht: 'Ab dem 1. Februar gelten neue Öffnungszeiten: Montag bis Freitag von 7:00 bis 18:00 Uhr. Der Frühdienst beginnt wie gewohnt um 7:00 Uhr.',
			gueltigVon: todayStr,
			gueltigBis: formatDate(nextWeek),
			prioritaet: 'normal',
			createdAt: now,
			updatedAt: now
		},
		{
			id: crypto.randomUUID(),
			titel: 'Bitte Wechselkleidung mitbringen',
			nachricht: 'Liebe Eltern, bitte denken Sie daran, Wechselkleidung für Ihr Kind mitzubringen. Besonders jetzt im Winter brauchen wir warme Ersatzkleidung.',
			gueltigVon: todayStr,
			gueltigBis: formatDate(nextWeek),
			prioritaet: 'normal',
			createdAt: now,
			updatedAt: now
		}
	];

	for (const announcement of announcements) {
		db.insert(schema.ankuendigungen).values(announcement).run();
	}
	console.log(`   ✓ Created ${announcements.length} announcements`);

	console.log('\n✅ Seed completed successfully!');
	console.log('\nSummary:');
	console.log(`   - ${groups.length} groups`);
	console.log(`   - ${children.length} children`);
	console.log(`   - ${teachers.length} teachers`);
	console.log(`   - ${schedules.length} schedule entries`);
	console.log(`   - ${meals.length} meal entries`);
	console.log(`   - ${announcements.length} announcements`);

	sqlite.close();
}

seed().catch(console.error);
