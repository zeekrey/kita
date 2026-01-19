/**
 * Inspection Seed Profile
 *
 * Purpose: Edge case testing
 * - Long names (50+ characters)
 * - Special characters (O'Connor, Müller, Björk)
 * - Boundary dates (Feb 29 birthdays, year boundaries)
 * - Empty groups (no children assigned)
 * - Overcrowded groups (50+ children)
 * - HTML/script injection test strings
 */

import {
	formatDate,
	getWeekDays,
	addDays,
	generateId,
	clearData,
	insertRecords,
	printSummary
} from './base.js';

/**
 * Seed the database with inspection profile data
 * @param {import('drizzle-orm/better-sqlite3').BetterSQLite3Database} db
 * @param {typeof import('../../src/lib/server/db/schema.js')} schema
 */
export async function seed(db, schema) {
	console.log('🔍 Inspection profile - Edge case testing data\n');

	const now = new Date();
	const today = new Date();
	const todayStr = formatDate(today);

	// Clear existing data
	clearData(db, schema);

	// ============================================
	// Groups (various edge cases)
	// ============================================
	console.log('👥 Creating groups with edge cases...');
	const groups = [
		{
			id: generateId(),
			name: 'Normale Gruppe',
			farbe: '#FF6B6B',
			createdAt: now,
			updatedAt: now
		},
		{
			id: generateId(),
			name: 'Leere Gruppe (keine Kinder)',
			farbe: '#4ECDC4',
			createdAt: now,
			updatedAt: now
		},
		{
			id: generateId(),
			name: 'Übervolle Gruppe mit sehr vielen Kindern zur Kapazitätstestung',
			farbe: '#45B7D1',
			createdAt: now,
			updatedAt: now
		},
		{
			id: generateId(),
			name: '<script>alert("XSS")</script>',
			farbe: '#96CEB4',
			createdAt: now,
			updatedAt: now
		},
		{
			id: generateId(),
			name: 'Grüße & Wünsche "Test" \'Apostrophe\'',
			farbe: '#FFEAA7',
			createdAt: now,
			updatedAt: now
		}
	];
	insertRecords(db, schema.gruppen, groups);
	console.log(`   ✓ Created ${groups.length} groups`);

	// ============================================
	// Teachers (special characters, long names)
	// ============================================
	console.log('👩‍🏫 Creating teachers with edge cases...');
	const teachers = [
		{
			id: generateId(),
			vorname: 'Maria',
			nachname: 'Schmidt',
			email: 'maria.schmidt@kita.de',
			fotoPath: null,
			createdAt: now,
			updatedAt: now
		},
		{
			id: generateId(),
			vorname: "Patrick O'Connor",
			nachname: 'MacGregor',
			email: 'patrick.oconnor@kita.de',
			fotoPath: null,
			createdAt: now,
			updatedAt: now
		},
		{
			id: generateId(),
			vorname: 'Björk',
			nachname: 'Guðmundsdóttir',
			email: 'bjork.gudmundsdottir@kita.de',
			fotoPath: null,
			createdAt: now,
			updatedAt: now
		},
		{
			id: generateId(),
			vorname: 'Maximilian-Alexander',
			nachname: 'Müller-Schwarzenberger-von-und-zu-Hohenstein',
			email: 'max.mueller@kita.de',
			fotoPath: null,
			createdAt: now,
			updatedAt: now
		},
		{
			id: generateId(),
			vorname: '<img src=x onerror=alert(1)>',
			nachname: 'XSS-Test',
			email: 'xss.test@kita.de',
			fotoPath: null,
			createdAt: now,
			updatedAt: now
		}
	];
	insertRecords(db, schema.erzieher, teachers);
	console.log(`   ✓ Created ${teachers.length} teachers`);

	// ============================================
	// Children (edge cases + overcrowded group)
	// ============================================
	console.log('👶 Creating children with edge cases...');
	const children = [];

	// Edge case children in normal group
	const edgeCaseChildren = [
		{
			vorname: 'Emma',
			nachname: 'Müller',
			geburtstag: `2020-${todayStr.slice(5)}`, // Birthday today
			gruppeId: groups[0].id
		},
		{
			vorname: 'Leap-Year',
			nachname: 'Birthday',
			geburtstag: '2020-02-29', // Feb 29 birthday
			gruppeId: groups[0].id
		},
		{
			vorname: 'New-Year',
			nachname: 'Baby',
			geburtstag: '2021-01-01', // Jan 1 birthday
			gruppeId: groups[0].id
		},
		{
			vorname: 'Silvester',
			nachname: 'Kind',
			geburtstag: '2020-12-31', // Dec 31 birthday
			gruppeId: groups[0].id
		},
		{
			vorname: "Séamus O'Brien-McPherson",
			nachname: 'Fitzgerald-Montgomery',
			geburtstag: '2021-03-17',
			gruppeId: groups[0].id
		},
		{
			vorname: 'François-Xavier Éléonore Côme',
			nachname: 'Lefèvre-Dubois',
			geburtstag: '2020-07-14',
			gruppeId: groups[0].id
		},
		{
			vorname: '<script>document.cookie</script>',
			nachname: 'Injection-Test',
			geburtstag: '2021-06-01',
			gruppeId: groups[0].id
		},
		{
			vorname: '\\"; DROP TABLE kinder; --',
			nachname: 'SQL-Injection',
			geburtstag: '2020-04-01',
			gruppeId: groups[0].id
		}
	];

	for (const child of edgeCaseChildren) {
		children.push({
			id: generateId(),
			vorname: child.vorname,
			nachname: child.nachname,
			geburtstag: child.geburtstag,
			gruppeId: child.gruppeId,
			fotoPath: null,
			createdAt: now,
			updatedAt: now
		});
	}

	// Generate 55 children for overcrowded group
	console.log('   📊 Generating 55 children for overcrowded group...');
	for (let i = 1; i <= 55; i++) {
		const year = 2020 + (i % 2);
		const month = String((i % 12) + 1).padStart(2, '0');
		const day = String((i % 28) + 1).padStart(2, '0');

		children.push({
			id: generateId(),
			vorname: `Kind-${i}`,
			nachname: `Massen-Test-${i}`,
			geburtstag: `${year}-${month}-${day}`,
			gruppeId: groups[2].id, // Overcrowded group
			fotoPath: null,
			createdAt: now,
			updatedAt: now
		});
	}

	// Note: groups[1] is intentionally left empty (no children)

	insertRecords(db, schema.kinder, children);
	console.log(`   ✓ Created ${children.length} children (including 55 in overcrowded group)`);

	// ============================================
	// Schedules (edge cases)
	// ============================================
	console.log('📅 Creating schedules...');
	const weekDays = getWeekDays(today);
	const schedules = [];

	// Normal schedules
	for (let i = 0; i < 5; i++) {
		schedules.push({
			id: generateId(),
			erzieherId: teachers[0].id,
			datum: formatDate(weekDays[i]),
			startZeit: '07:00',
			endZeit: '14:00',
			createdAt: now,
			updatedAt: now
		});
	}

	// Edge case: midnight boundary times
	schedules.push({
		id: generateId(),
		erzieherId: teachers[1].id,
		datum: formatDate(weekDays[0]),
		startZeit: '00:00',
		endZeit: '08:00',
		createdAt: now,
		updatedAt: now
	});

	// Edge case: late night shift
	schedules.push({
		id: generateId(),
		erzieherId: teachers[2].id,
		datum: formatDate(weekDays[0]),
		startZeit: '18:00',
		endZeit: '23:59',
		createdAt: now,
		updatedAt: now
	});

	insertRecords(db, schema.dienstplan, schedules);
	console.log(`   ✓ Created ${schedules.length} schedule entries`);

	// ============================================
	// Meals (edge cases)
	// ============================================
	console.log('🍽️  Creating meals with edge cases...');
	const meals = [];
	const mealTypes = ['fruehstueck', 'mittagessen', 'snack'];

	for (let i = 0; i < 5; i++) {
		const datum = formatDate(weekDays[i]);

		// Normal meal
		meals.push({
			id: generateId(),
			datum,
			typ: mealTypes[0],
			beschreibung: 'Normales Frühstück',
			createdAt: now,
			updatedAt: now
		});

		// Long description
		meals.push({
			id: generateId(),
			datum,
			typ: mealTypes[1],
			beschreibung:
				'Sehr ausführliche Beschreibung des Mittagessens mit vielen Details über die Zutaten, die Zubereitungsart, die Herkunft der Produkte, eventuelle Allergene und diätetische Hinweise sowie zusätzliche Informationen für die Eltern bezüglich der Nährwerte und der kindgerechten Portionsgrößen',
			createdAt: now,
			updatedAt: now
		});

		// Special characters
		meals.push({
			id: generateId(),
			datum,
			typ: mealTypes[2],
			beschreibung: 'Müsli & Früchte (Bio) <healthy> \'lecker\' "gesund"',
			createdAt: now,
			updatedAt: now
		});
	}

	insertRecords(db, schema.mahlzeiten, meals);
	console.log(`   ✓ Created ${meals.length} meal entries`);

	// ============================================
	// Announcements (edge cases)
	// ============================================
	console.log('📢 Creating announcements with edge cases...');
	const nextWeek = addDays(today, 7);
	const nextMonth = addDays(today, 30);

	const announcements = [
		{
			id: generateId(),
			titel: 'Normale Ankündigung',
			nachricht: 'Eine ganz normale Ankündigung ohne Besonderheiten.',
			gueltigVon: todayStr,
			gueltigBis: formatDate(nextWeek),
			prioritaet: 'normal',
			createdAt: now,
			updatedAt: now
		},
		{
			id: generateId(),
			titel: '<script>alert("XSS in Titel")</script>',
			nachricht: '<img src=x onerror=alert("XSS in Nachricht")>',
			gueltigVon: todayStr,
			gueltigBis: formatDate(nextWeek),
			prioritaet: 'wichtig',
			createdAt: now,
			updatedAt: now
		},
		{
			id: generateId(),
			titel:
				'Ankündigung mit sehr langem Titel der möglicherweise das Layout stören könnte wenn er nicht korrekt abgeschnitten oder umgebrochen wird',
			nachricht:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20) +
				'Ende der Nachricht.',
			gueltigVon: todayStr,
			gueltigBis: formatDate(nextMonth),
			prioritaet: 'wichtig',
			createdAt: now,
			updatedAt: now
		},
		{
			id: generateId(),
			titel: 'Umlaute: Ääüüöö ß ÄÖÜ',
			nachricht: 'Sonderzeichen: € £ ¥ © ® ™ • … — – « » ‹ › \' \' " " &amp; &lt; &gt;',
			gueltigVon: todayStr,
			gueltigBis: formatDate(nextWeek),
			prioritaet: 'normal',
			createdAt: now,
			updatedAt: now
		},
		{
			id: generateId(),
			titel: 'Abgelaufene Ankündigung',
			nachricht: 'Diese Ankündigung ist bereits abgelaufen.',
			gueltigVon: formatDate(addDays(today, -14)),
			gueltigBis: formatDate(addDays(today, -7)),
			prioritaet: 'normal',
			createdAt: now,
			updatedAt: now
		},
		{
			id: generateId(),
			titel: 'Zukünftige Ankündigung',
			nachricht: 'Diese Ankündigung ist noch nicht gültig.',
			gueltigVon: formatDate(addDays(today, 7)),
			gueltigBis: formatDate(addDays(today, 14)),
			prioritaet: 'wichtig',
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

	console.log('\n⚠️  Note: This profile contains intentional edge cases:');
	console.log('   - Empty group (no children)');
	console.log('   - Overcrowded group (55 children)');
	console.log('   - XSS/injection test strings');
	console.log('   - Boundary date values');
	console.log('   - Long text values');
	console.log('   - Special characters in names');
}
